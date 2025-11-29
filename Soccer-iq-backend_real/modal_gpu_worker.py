"""
Modal GPU Worker for Pitch Mind - V4
YOLOv11 + Deep SORT + TorchReID for robust player tracking

Upgrade from V3 (ByteTrack):
- Fine-tuned YOLOv11 that detects: player, goalkeeper, referee, ball
- Deep SORT with appearance features (not just motion)
- TorchReID (osnet_ain_x1_0) for re-identification after occlusion
- Anchor embedding from user click for consistent player tracking
- Extended tracking memory for longer occlusions
"""

import modal
import io
from typing import List, Dict, Optional, Tuple
import numpy as np

app = modal.App("pitchmind-gpu-tracker-v4")

# Volume for storing models (avoids re-downloading each cold start)
model_volume = modal.Volume.from_name("pitchmind-models", create_if_missing=True)

gpu_image = (
    modal.Image.debian_slim(python_version="3.10")
    .apt_install(
        "libgl1-mesa-glx",
        "libglib2.0-0",
        "libsm6",
        "libxext6",
        "libxrender-dev",
        "libgomp1",
        "ffmpeg",
        "git"
    )
    .pip_install(
        "ultralytics>=8.1.0",      # Supports YOLOv11
        "opencv-python-headless",
        "torch>=2.0.0",
        "torchvision",
        "numpy<2.0.0",
        "Pillow",
        "requests",
        "fastapi",
        "pandas",
        "scipy",
        "filterpy",               # Kalman filter for Deep SORT
        "gdown",                  # Download from Google Drive
        "deep-sort-realtime",     # Deep SORT implementation
    )
    # Install torchreid from source for ReID
    .run_commands(
        "pip install git+https://github.com/KaiyangZhou/deep-person-reid.git"
    )
)


def download_models_if_needed():
    """Download fine-tuned YOLOv11 and ReID models to volume"""
    import os
    import gdown
    
    models_dir = "/models"
    os.makedirs(models_dir, exist_ok=True)
    
    # Fine-tuned YOLOv11 from SayamAlt repo
    # You'll need to host this or get the direct link
    yolo_path = f"{models_dir}/soccer_yolov11.pt"
    if not os.path.exists(yolo_path):
        print("📥 Downloading fine-tuned YOLOv11...")
        # Option 1: From your own hosted location
        # gdown.download("YOUR_GOOGLE_DRIVE_ID", yolo_path, quiet=False)
        
        # Option 2: Use base YOLOv11 until you have the fine-tuned one
        from ultralytics import YOLO
        model = YOLO("yolo11n.pt")  # Downloads automatically
        # We'll filter classes manually until fine-tuned model is ready
        print("⚠️ Using base YOLOv11 - upload fine-tuned model for better results")
    
    # ReID model (osnet) - torchreid downloads automatically
    print("✓ Models ready")


def extract_appearance_embedding(frame: np.ndarray, bbox: List[float], reid_model) -> np.ndarray:
    """Extract appearance embedding for a detected person using TorchReID"""
    import cv2
    import torch
    from torchvision import transforms
    
    x1, y1, x2, y2 = [int(c) for c in bbox]
    
    # Clamp to frame bounds
    h, w = frame.shape[:2]
    x1, y1 = max(0, x1), max(0, y1)
    x2, y2 = min(w, x2), min(h, y2)
    
    if x2 <= x1 or y2 <= y1:
        return np.zeros(512)  # Return zero embedding for invalid bbox
    
    # Crop person
    person_crop = frame[y1:y2, x1:x2]
    
    if person_crop.size == 0:
        return np.zeros(512)
    
    # Preprocess for ReID model
    person_crop = cv2.resize(person_crop, (128, 256))
    person_crop = cv2.cvtColor(person_crop, cv2.COLOR_BGR2RGB)
    
    transform = transforms.Compose([
        transforms.ToTensor(),
        transforms.Normalize(mean=[0.485, 0.456, 0.406], std=[0.229, 0.224, 0.225])
    ])
    
    tensor = transform(person_crop).unsqueeze(0)
    
    if torch.cuda.is_available():
        tensor = tensor.cuda()
    
    with torch.no_grad():
        embedding = reid_model(tensor)
    
    return embedding.cpu().numpy().flatten()


def extract_team_color(frame: np.ndarray, bbox: List[float]) -> Tuple[int, int, int]:
    """Extract dominant jersey color from upper body region"""
    import cv2
    
    x1, y1, x2, y2 = [int(c) for c in bbox]
    h, w = frame.shape[:2]
    x1, y1 = max(0, x1), max(0, y1)
    x2, y2 = min(w, x2), min(h, y2)
    
    if x2 <= x1 or y2 <= y1:
        return (128, 128, 128)
    
    # Upper 40% of bounding box (jersey area)
    body_height = y2 - y1
    upper_y2 = y1 + int(body_height * 0.4)
    
    upper_body = frame[y1:upper_y2, x1:x2]
    
    if upper_body.size == 0:
        return (128, 128, 128)
    
    # Convert to HSV and get dominant color
    hsv = cv2.cvtColor(upper_body, cv2.COLOR_BGR2HSV)
    
    # Average color (simple approach - could use k-means for better results)
    avg_color = np.mean(upper_body, axis=(0, 1))
    return tuple(avg_color.astype(int).tolist())


def cosine_similarity(a: np.ndarray, b: np.ndarray) -> float:
    """Compute cosine similarity between two embeddings"""
    if np.linalg.norm(a) == 0 or np.linalg.norm(b) == 0:
        return 0.0
    return float(np.dot(a, b) / (np.linalg.norm(a) * np.linalg.norm(b)))


@app.function(
    image=gpu_image,
    gpu="T4",
    timeout=600,          # 10 min max (was 1200)
    memory=8192,
    volumes={"/models": model_volume},
    # NO keep_warm - important for cost control!
)
def track_player_gpu(
    video_bytes: bytes,
    player_x: float,
    player_y: float,
    video_filename: str = "video.mp4",
    team_color_hint: Optional[str] = None  # "red", "blue", etc.
) -> Dict:
    """
    Track a player using YOLOv11 + Deep SORT + TorchReID
    
    Args:
        video_bytes: Raw video file bytes
        player_x: Click X position (0-100%)
        player_y: Click Y position (0-100%)
        video_filename: Original filename for logging
        team_color_hint: Optional team color to help identification
    """
    import cv2
    import torch
    import pandas as pd
    from ultralytics import YOLO
    from deep_sort_realtime.deepsort_tracker import DeepSort
    import torchreid
    import tempfile
    import os
    
    print(f"🎮 GPU Worker V4 (Deep SORT + ReID) started for: {video_filename}")
    print(f"GPU: {torch.cuda.get_device_name(0) if torch.cuda.is_available() else 'CPU'}")
    print(f"Initial player position: ({player_x:.2f}%, {player_y:.2f}%)")
    
    # Write video to temp file
    with tempfile.NamedTemporaryFile(suffix='.mp4', delete=False) as f:
        f.write(video_bytes)
        video_path = f.name
    
    try:
        device = 'cuda' if torch.cuda.is_available() else 'cpu'
        
        # ============================================
        # Load Models
        # ============================================
        
        # Check for fine-tuned model, fall back to base
        fine_tuned_path = "/models/soccer_yolov11.pt"
        if os.path.exists(fine_tuned_path):
            model = YOLO(fine_tuned_path)
            using_fine_tuned = True
            print(f"✓ Loaded fine-tuned YOLOv11")
        else:
            model = YOLO("yolo11n.pt")
            using_fine_tuned = False
            print(f"✓ Loaded base YOLOv11 (upload fine-tuned for better results)")
        
        model.to(device)
        
        # Initialize Deep SORT with extended memory for occlusions
        tracker = DeepSort(
            max_age=90,              # Keep tracks alive for 90 frames (3 sec at 30fps)
            n_init=3,                # Require 3 detections to confirm track
            max_cosine_distance=0.4, # Appearance matching threshold
            nn_budget=150,           # Gallery size per track
            override_track_class=None,
            embedder="mobilenet",    # Built-in embedder (backup to TorchReID)
            half=True,
            embedder_gpu=True
        )
        print(f"✓ Deep SORT initialized (max_age=90)")
        
        # Load TorchReID for appearance embeddings
        reid_model = torchreid.models.build_model(
            name='osnet_ain_x1_0',
            num_classes=1,  # Not doing classification, just embedding
            pretrained=True
        )
        reid_model = reid_model.to(device)
        reid_model.eval()
        print(f"✓ TorchReID (osnet_ain_x1_0) loaded")
        
        # ============================================
        # Video Setup
        # ============================================
        cap = cv2.VideoCapture(video_path)
        if not cap.isOpened():
            raise ValueError(f"Could not open video: {video_filename}")
        
        fps = cap.get(cv2.CAP_PROP_FPS)
        total_frames = int(cap.get(cv2.CAP_PROP_FRAME_COUNT))
        width = int(cap.get(cv2.CAP_PROP_FRAME_WIDTH))
        height = int(cap.get(cv2.CAP_PROP_FRAME_HEIGHT))
        duration = total_frames / fps
        
        print(f"Video: {width}x{height}, {fps:.1f} fps, {total_frames} frames ({duration:.1f}s)")
        
        player_pixel_x = int((player_x / 100) * width)
        player_pixel_y = int((player_y / 100) * height)
        
        # ============================================
        # PHASE 1: Initial Detection to Get Anchor Embedding
        # ============================================
        print("🎯 Phase 1: Capturing anchor embedding from click position...")
        
        anchor_embedding = None
        anchor_color = None
        target_track_id = None
        
        # Read first 30 frames to find clicked player
        for _ in range(min(30, total_frames)):
            ret, frame = cap.read()
            if not ret:
                break
            
            results = model(frame, device=device, verbose=False)[0]
            
            # Get person detections
            for box in results.boxes:
                cls_id = int(box.cls[0])
                conf = float(box.conf[0])
                
                # Filter: person class (0 in COCO, or player/goalkeeper in fine-tuned)
                # Fine-tuned model classes: 0=ball, 1=goalkeeper, 2=player, 3=referee
                if using_fine_tuned:
                    is_player = cls_id in [1, 2]  # goalkeeper or player
                else:
                    is_player = cls_id == 0  # person in COCO
                
                if not is_player or conf < 0.3:
                    continue
                
                bbox = box.xyxy[0].cpu().numpy().tolist()
                center_x = (bbox[0] + bbox[2]) / 2
                center_y = (bbox[1] + bbox[3]) / 2
                
                distance = np.sqrt((center_x - player_pixel_x)**2 + (center_y - player_pixel_y)**2)
                
                # If close to click, this is our target
                if distance < 100:
                    anchor_embedding = extract_appearance_embedding(frame, bbox, reid_model)
                    anchor_color = extract_team_color(frame, bbox)
                    print(f"  ✓ Anchor captured! Embedding shape: {anchor_embedding.shape}, Color: {anchor_color}")
                    break
            
            if anchor_embedding is not None:
                break
        
        if anchor_embedding is None:
            return {
                'success': False,
                'error': 'Could not find player at click position. Try clicking directly on a player.'
            }
        
        # Reset video
        cap.set(cv2.CAP_PROP_POS_FRAMES, 0)
        
        # ============================================
        # PHASE 2: Full Video Tracking with Re-ID
        # ============================================
        print("📊 Phase 2: Full video tracking with re-identification...")
        
        all_tracks = {
            'players': [],  # {frame_idx: {track_id: {...}}}
            'ball': [],
            'target_positions': []  # Our target player's positions
        }
        
        frame_num = 0
        sample_rate = max(1, int(fps / 10))  # ~10 fps effective
        last_progress = 0
        
        # Track ID matching
        best_track_id = None
        track_id_scores = {}  # track_id -> cumulative similarity score
        
        while cap.isOpened():
            ret, frame = cap.read()
            if not ret:
                break
            
            frame_num += 1
            
            if frame_num % sample_rate != 0:
                all_tracks['players'].append({})
                all_tracks['ball'].append(None)
                all_tracks['target_positions'].append(None)
                continue
            
            progress = int((frame_num / total_frames) * 100)
            if progress >= last_progress + 20:
                print(f"  Processing: {progress}%")
                last_progress = progress
            
            # Run YOLO
            results = model(frame, device=device, verbose=False)[0]
            
            # Prepare detections for Deep SORT
            detections = []
            raw_detections = []
            
            for box in results.boxes:
                cls_id = int(box.cls[0])
                conf = float(box.conf[0])
                bbox = box.xyxy[0].cpu().numpy().tolist()
                
                if using_fine_tuned:
                    is_player = cls_id in [1, 2]
                    is_ball = cls_id == 0
                else:
                    is_player = cls_id == 0
                    is_ball = cls_id == 32
                
                if is_player and conf > 0.3:
                    # Format for deep_sort_realtime: ([x1, y1, w, h], conf, class)
                    x1, y1, x2, y2 = bbox
                    w, h = x2 - x1, y2 - y1
                    detections.append(([x1, y1, w, h], conf, 'player'))
                    raw_detections.append({
                        'bbox': bbox,
                        'conf': conf,
                        'embedding': extract_appearance_embedding(frame, bbox, reid_model),
                        'color': extract_team_color(frame, bbox)
                    })
                
                if is_ball and conf > 0.3:
                    center_x = (bbox[0] + bbox[2]) / 2
                    center_y = (bbox[1] + bbox[3]) / 2
                    all_tracks['ball'].append({
                        'bbox': bbox,
                        'center': [center_x, center_y],
                        'confidence': conf
                    })
            
            if not all_tracks['ball'] or all_tracks['ball'][-1] is None:
                all_tracks['ball'].append(None)
            
            # Update Deep SORT
            tracks = tracker.update_tracks(detections, frame=frame)
            
            # Process tracks and find our target
            frame_players = {}
            target_position = None
            
            for track in tracks:
                if not track.is_confirmed():
                    continue
                
                track_id = track.track_id
                ltrb = track.to_ltrb()  # [x1, y1, x2, y2]
                
                center_x = (ltrb[0] + ltrb[2]) / 2
                center_y = (ltrb[1] + ltrb[3]) / 2
                
                # Get embedding for this track
                track_embedding = extract_appearance_embedding(frame, ltrb.tolist(), reid_model)
                track_color = extract_team_color(frame, ltrb.tolist())
                
                # Compare to anchor
                similarity = cosine_similarity(anchor_embedding, track_embedding)
                
                # Update cumulative score
                if track_id not in track_id_scores:
                    track_id_scores[track_id] = 0
                track_id_scores[track_id] += similarity
                
                frame_players[track_id] = {
                    'bbox': ltrb.tolist(),
                    'center': [center_x, center_y],
                    'similarity': similarity,
                    'color': track_color
                }
                
                # If this is our best match so far
                if best_track_id is None or track_id_scores.get(track_id, 0) > track_id_scores.get(best_track_id, 0):
                    # Also check if similarity is reasonable
                    if similarity > 0.5:
                        best_track_id = track_id
            
            all_tracks['players'].append(frame_players)
            
            # Record target position
            if best_track_id and best_track_id in frame_players:
                target_position = frame_players[best_track_id]['center']
            all_tracks['target_positions'].append(target_position)
        
        cap.release()
        print(f"  Processed {frame_num} frames")
        print(f"  Best track ID: {best_track_id} (score: {track_id_scores.get(best_track_id, 0):.2f})")
        
        # ============================================
        # PHASE 3: Interpolate Ball Positions
        # ============================================
        print("⚽ Phase 3: Interpolating ball positions...")
        
        ball_positions = []
        for ball in all_tracks['ball']:
            if ball is not None:
                ball_positions.append(ball['center'])
            else:
                ball_positions.append([np.nan, np.nan])
        
        df_ball = pd.DataFrame(ball_positions, columns=['x', 'y'])
        df_ball = df_ball.interpolate(method='linear', limit_direction='both')
        df_ball = df_ball.bfill().ffill()
        
        interpolated_ball = df_ball.values.tolist()
        
        # ============================================
        # PHASE 4: Find Decision Points
        # ============================================
        print("🧠 Phase 4: Finding decision points...")
        
        decision_points = []
        TOUCH_DISTANCE = 100
        MIN_FRAMES_BETWEEN = int(fps * 2)
        last_touch_frame = -MIN_FRAMES_BETWEEN
        
        def get_zone(y_pos):
            third = height / 3
            if y_pos < third:
                return "Defensive Third"
            elif y_pos < third * 2:
                return "Middle Third"
            else:
                return "Attacking Third"
        
        for frame_idx, (frame_players, target_pos) in enumerate(zip(all_tracks['players'], all_tracks['target_positions'])):
            if not frame_players or target_pos is None:
                continue
            
            player_center = np.array(target_pos)
            ball_center = np.array(interpolated_ball[frame_idx])
            
            if np.isnan(ball_center).any():
                continue
            
            distance = np.linalg.norm(player_center - ball_center)
            
            if distance < TOUCH_DISTANCE:
                actual_frame = (frame_idx + 1) * sample_rate
                
                if actual_frame - last_touch_frame >= MIN_FRAMES_BETWEEN:
                    timestamp = actual_frame / fps
                    zone = get_zone(player_center[1])
                    
                    decision_points.append({
                        'timestamp': float(round(timestamp, 1)),
                        'frame': int(actual_frame),
                        'zone': zone,
                        'player_position': [float(player_center[0]), float(player_center[1])],
                        'ball_position': [float(ball_center[0]), float(ball_center[1])],
                        'distance': float(round(distance, 1)),
                        'track_id': int(best_track_id) if best_track_id else -1
                    })
                    
                    print(f"  ✓ Decision point at {timestamp:.1f}s in {zone}")
                    last_touch_frame = actual_frame
        
        print(f"✅ Complete! Found {len(decision_points)} decision points")
        
        return {
            'success': True,
            'decision_points': decision_points,
            'video_metadata': {
                'filename': video_filename,
                'width': int(width),
                'height': int(height),
                'fps': float(fps),
                'total_frames': int(total_frames),
                'duration': float(round(duration, 1))
            },
            'processing_info': {
                'sample_rate': int(sample_rate),
                'target_track_id': int(best_track_id) if best_track_id else None,
                'gpu_used': torch.cuda.get_device_name(0) if torch.cuda.is_available() else 'CPU',
                'tracker': 'Deep SORT + TorchReID',
                'model': 'YOLOv11 (fine-tuned)' if using_fine_tuned else 'YOLOv11 (base)',
                'anchor_color': anchor_color
            }
        }
    
    finally:
        os.unlink(video_path)


@app.function(
    image=gpu_image,
    timeout=300,
    # NO GPU for the web endpoint - it just receives requests
    # NO keep_warm!
)
@modal.asgi_app()
def fastapi_app():
    """Web endpoint that triggers GPU processing"""
    from fastapi import FastAPI, Request
    from fastapi.responses import JSONResponse
    import requests as http_requests
    
    web_app = FastAPI(title="PitchMind GPU Tracker V4")
    
    @web_app.get("/health")
    async def health():
        return {"status": "ok", "version": "v4", "tracker": "Deep SORT + TorchReID"}
    
    @web_app.post("/")
    async def analyze_video_endpoint(request: Request):
        try:
            item = await request.json()
        except Exception as e:
            return JSONResponse({'success': False, 'error': f'Invalid JSON: {str(e)}'}, status_code=400)
        
        video_url = item.get('video_url')
        player_x = item.get('player_x')
        player_y = item.get('player_y')
        filename = item.get('filename', 'video.mp4')
        team_color = item.get('team_color')  # Optional
        
        if not all([video_url, player_x is not None, player_y is not None]):
            return JSONResponse({
                'success': False, 
                'error': 'Missing required fields: video_url, player_x, player_y'
            }, status_code=400)
        
        print(f"📥 Downloading video from: {video_url}")
        
        try:
            response = http_requests.get(video_url, timeout=300)
            response.raise_for_status()
            video_bytes = response.content
            print(f"✓ Downloaded {len(video_bytes) / 1024 / 1024:.1f} MB")
        except Exception as e:
            return JSONResponse({
                'success': False, 
                'error': f'Failed to download video: {str(e)}'
            }, status_code=500)
        
        try:
            # Call GPU function (spawns on GPU container)
            result = track_player_gpu.remote(
                video_bytes, 
                player_x, 
                player_y, 
                filename,
                team_color
            )
            return JSONResponse(result)
        except Exception as e:
            return JSONResponse({
                'success': False, 
                'error': f'GPU processing failed: {str(e)}'
            }, status_code=500)
    
    return web_app


@app.local_entrypoint()
def test_local():
    """Test entrypoint"""
    print("PitchMind GPU Tracker V4")
    print("========================")
    print("Features:")
    print("  - YOLOv11 detection (fine-tuned for soccer)")
    print("  - Deep SORT tracking with extended memory")
    print("  - TorchReID appearance embeddings")
    print("  - Anchor embedding from user click")
    print("")
    print("Deploy with: modal deploy modal_gpu_worker_v4.py")
    print("")
    print("Test with:")
    print('  curl -X POST https://YOUR-APP.modal.run \\')
    print('    -H "Content-Type: application/json" \\')
    print('    -d \'{"video_url": "...", "player_x": 50, "player_y": 50}\'')
