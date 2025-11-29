"""
Modal GPU Worker for Pitch Mind - V4
YOLOv11 (Adit-jain/soccana) + ByteTrack

Uses pre-trained soccer model from Hugging Face:
- Class 0: Player
- Class 1: Ball
- Class 2: Referee

ByteTrack chosen over DeepSORT based on real-world testing showing
significantly better performance and stability.
"""

import modal
from typing import Dict, Optional

app = modal.App("pitchmind-gpu-tracker-v4")

# Volume for caching the model (avoids re-downloading on each cold start)
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
        "ultralytics>=8.1.0",
        "opencv-python-headless",
        "torch>=2.0.0",
        "torchvision",
        "numpy<2.0.0",
        "Pillow",
        "requests",
        "fastapi",
        "supervision",
        "pandas",
        "huggingface_hub"
    )
)


def download_model_if_needed() -> str:
    """Download the soccana model from Hugging Face if not cached"""
    import os
    from huggingface_hub import hf_hub_download
    
    model_path = "/models/soccana_best.pt"
    
    if os.path.exists(model_path):
        print(f"✓ Model already cached at {model_path}")
        return model_path
    
    print("📥 Downloading soccana model from Hugging Face...")
    
    # Download from Adit-jain/soccana
    downloaded_path = hf_hub_download(
        repo_id="Adit-jain/soccana",
        filename="best.pt",
        local_dir="/models",
        local_dir_use_symlinks=False
    )
    
    # Rename to our expected path
    if downloaded_path != model_path:
        os.rename(downloaded_path, model_path)
    
    print(f"✓ Model downloaded to {model_path}")
    return model_path


@app.function(
    image=gpu_image,
    gpu="T4",
    timeout=600,
    memory=8192,
    volumes={"/models": model_volume},
    # NO keep_warm - costs money when idle!
)
def track_player_gpu(
    video_bytes: bytes,
    player_x: float,
    player_y: float,
    video_filename: str = "video.mp4",
    click_timestamp: float = 0.0  # NEW: timestamp where user clicked
) -> Dict:
    """
    Track a player using YOLOv11 (soccana) + ByteTrack
    
    Args:
        video_bytes: Raw video file bytes
        player_x: Click X position (pixels)
        player_y: Click Y position (pixels)
        video_filename: Original filename for logging
        click_timestamp: Video timestamp (seconds) where user clicked to select player
    
    Returns:
        Dictionary with decision points and metadata
    """
    import cv2
    import numpy as np
    import torch
    import pandas as pd
    import supervision as sv
    from ultralytics import YOLO
    import tempfile
    import os
    
    print(f"🎮 GPU Worker V4 (soccana + ByteTrack) started for: {video_filename}")
    print(f"GPU: {torch.cuda.get_device_name(0) if torch.cuda.is_available() else 'CPU'}")
    print(f"Initial player position: ({player_x:.2f}, {player_y:.2f}) at {click_timestamp:.2f}s")
    
    # Write video to temp file
    with tempfile.NamedTemporaryFile(suffix='.mp4', delete=False) as f:
        f.write(video_bytes)
        video_path = f.name
    
    try:
        device = 'cuda' if torch.cuda.is_available() else 'cpu'
        
        # ============================================
        # Load Model
        # ============================================
        model_path = download_model_if_needed()
        model = YOLO(model_path)
        model.to(device)
        
        # Verify classes
        class_names = model.names
        print(f"✓ Model loaded. Classes: {class_names}")
        # Expected: {0: 'Player', 1: 'Ball', 2: 'Referee'}
        
        # Class IDs for soccana model
        PLAYER_CLASS = 0
        BALL_CLASS = 1
        REFEREE_CLASS = 2
        
        # Initialize ByteTrack (proven best performer)
        tracker = sv.ByteTrack(
            track_activation_threshold=0.25,
            lost_track_buffer=30,
            minimum_matching_threshold=0.8,
            frame_rate=30
        )
        print(f"✓ ByteTrack initialized")
        
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
        
        # Frontend sends pixel coordinates directly
        player_pixel_x = int(player_x)
        player_pixel_y = int(player_y)
        
        # Calculate which frame index corresponds to click_timestamp
        click_frame = int(click_timestamp * fps)
        
        # ============================================
        # PHASE 1: Detection & Tracking
        # ============================================
        print("📊 Phase 1: Detection & Tracking...")
        
        all_tracks = {
            'players': [],  # List of dicts per frame: {track_id: {'bbox': [...], 'center': [...]}}
            'ball': []      # List of dicts per frame: {'bbox': [...], 'center': [...]} or None
        }
        
        frame_num = 0
        sample_rate = max(1, int(fps / 10))  # ~10 fps effective
        last_progress = 0
        
        while cap.isOpened():
            ret, frame = cap.read()
            if not ret:
                break
            
            frame_num += 1
            
            if frame_num % sample_rate != 0:
                all_tracks['players'].append({})
                all_tracks['ball'].append(None)
                continue
            
            progress = int((frame_num / total_frames) * 100)
            if progress >= last_progress + 20:
                print(f"  Detection: {progress}%")
                last_progress = progress
            
            # Run YOLO
            results = model(frame, device=device, verbose=False)[0]
            
            # Convert to supervision format
            detections = sv.Detections.from_ultralytics(results)
            
            # Filter to PLAYERS only for tracking (class 0)
            # This excludes referees (class 2) automatically!
            player_mask = detections.class_id == PLAYER_CLASS
            player_detections = detections[player_mask]
            
            # Update ByteTrack with player detections
            tracked = tracker.update_with_detections(player_detections)
            
            # Store tracked players
            frame_players = {}
            if tracked.tracker_id is not None:
                for i, track_id in enumerate(tracked.tracker_id):
                    bbox = tracked.xyxy[i].tolist()
                    center_x = (bbox[0] + bbox[2]) / 2
                    center_y = (bbox[1] + bbox[3]) / 2
                    frame_players[int(track_id)] = {
                        'bbox': bbox,
                        'center': [center_x, center_y]
                    }
            
            all_tracks['players'].append(frame_players)
            
            # Find ball (class 1)
            ball_mask = detections.class_id == BALL_CLASS
            ball_detections = detections[ball_mask]
            
            if len(ball_detections) > 0:
                # Take highest confidence ball
                best_idx = ball_detections.confidence.argmax()
                bbox = ball_detections.xyxy[best_idx].tolist()
                center_x = (bbox[0] + bbox[2]) / 2
                center_y = (bbox[1] + bbox[3]) / 2
                all_tracks['ball'].append({
                    'bbox': bbox,
                    'center': [center_x, center_y],
                    'confidence': float(ball_detections.confidence[best_idx])
                })
            else:
                all_tracks['ball'].append(None)
        
        cap.release()
        print(f"  Detected {frame_num} frames")
        
        # ============================================
        # PHASE 2: Identify Target Player at Click Time
        # ============================================
        print("🎯 Phase 2: Identifying target player...")
        
        target_track_id = None
        min_distance = float('inf')
        
        # Calculate which sampled frame index corresponds to click_timestamp
        click_sample_idx = int((click_timestamp * fps) / sample_rate)
        
        # Search around the click timestamp (+/- 15 sampled frames = ~1.5 seconds)
        search_start = max(0, click_sample_idx - 15)
        search_end = min(len(all_tracks['players']), click_sample_idx + 15)
        
        print(f"  Searching frames {search_start}-{search_end} (click at {click_timestamp:.1f}s)")
        
        for frame_players in all_tracks['players'][search_start:search_end]:
            for track_id, player in frame_players.items():
                center = player['center']
                distance = np.sqrt((center[0] - player_pixel_x)**2 + (center[1] - player_pixel_y)**2)
                if distance < min_distance:
                    min_distance = distance
                    target_track_id = track_id
        
        if target_track_id is None:
            return {
                'success': False,
                'error': 'Could not identify target player from click position. Try clicking directly on a player.'
            }
        
        print(f"  Target player: Track ID {target_track_id} (distance: {min_distance:.1f}px)")
        
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
        
        missing_count = sum(1 for b in all_tracks['ball'] if b is None)
        print(f"  Interpolated {missing_count} missing ball positions")
        
        # ============================================
        # PHASE 4: Find Decision Points
        # ============================================
        print("🧠 Phase 4: Finding decision points...")
        
        decision_points = []
        TOUCH_DISTANCE = 100  # pixels
        MIN_FRAMES_BETWEEN = int(fps * 2)  # 2 seconds minimum between decision points
        last_touch_frame = -MIN_FRAMES_BETWEEN
        
        def get_zone(y_pos):
            """Determine which third of the field the player is in"""
            third = height / 3
            if y_pos < third:
                return "Defensive Third"
            elif y_pos < third * 2:
                return "Middle Third"
            else:
                return "Attacking Third"
        
        for frame_idx, frame_players in enumerate(all_tracks['players']):
            if not frame_players:
                continue
            
            if target_track_id not in frame_players:
                continue
            
            player = frame_players[target_track_id]
            player_center = np.array(player['center'])
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
                        'track_id': int(target_track_id)
                    })
                    
                    print(f"  ✓ Decision point at {timestamp:.1f}s in {zone}")
                    last_touch_frame = actual_frame
        
        print(f"✅ Complete! Found {len(decision_points)} decision points")
        
        # Commit model to volume for caching
        model_volume.commit()
        
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
                'target_track_id': int(target_track_id),
                'gpu_used': torch.cuda.get_device_name(0) if torch.cuda.is_available() else 'CPU',
                'tracker': 'ByteTrack',
                'model': 'Adit-jain/soccana (YOLOv11)',
                'classes': {'player': 0, 'ball': 1, 'referee': 2}
            }
        }
    
    finally:
        os.unlink(video_path)


@app.function(
    image=gpu_image,
    timeout=300,
    # NO GPU for web endpoint - just receives requests
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
        return {
            "status": "ok",
            "version": "v4",
            "model": "Adit-jain/soccana",
            "tracker": "ByteTrack"
        }
    
    @web_app.post("/")
    async def analyze_video_endpoint(request: Request):
        try:
            item = await request.json()
        except Exception as e:
            return JSONResponse(
                {'success': False, 'error': f'Invalid JSON: {str(e)}'},
                status_code=400
            )
        
        video_url = item.get('video_url')
        player_x = item.get('player_x')
        player_y = item.get('player_y')
        filename = item.get('filename', 'video.mp4')
        click_timestamp = item.get('click_timestamp', 0.0)  # NEW
        
        if not all([video_url, player_x is not None, player_y is not None]):
            return JSONResponse({
                'success': False,
                'error': 'Missing required fields: video_url, player_x, player_y'
            }, status_code=400)
        
        print(f"📥 Downloading video from: {video_url}")
        print(f"📍 Click at ({player_x}, {player_y}) @ {click_timestamp}s")  # NEW
        
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
                click_timestamp  # NEW
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
    print("=" * 50)
    print("PitchMind GPU Tracker V4")
    print("=" * 50)
    print("")
    print("Model: Adit-jain/soccana (YOLOv11)")
    print("  - Class 0: Player")
    print("  - Class 1: Ball")
    print("  - Class 2: Referee (filtered out)")
    print("")
    print("Tracker: ByteTrack")
    print("  - Proven best performer in real-world tests")
    print("  - Better than DeepSORT, BoT-SORT, Norfair")
    print("")
    print("Deploy:")
    print("  modal deploy modal_gpu_worker_v4.py")
    print("")
    print("Test:")
    print('  curl -X POST https://YOUR-APP.modal.run \\')
    print('    -H "Content-Type: application/json" \\')
    print('    -d \'{"video_url": "...", "player_x": 50, "player_y": 50}\'')
    print("")
    print("Cost Safety:")
    print("  - No keep_warm (only pay when processing)")
    print("  - 10 min timeout max")
    print("  - Model cached in Volume (faster cold starts)")
