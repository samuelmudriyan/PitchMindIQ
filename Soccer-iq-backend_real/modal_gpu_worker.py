"""
Modal GPU Worker for Pitch Mind - Serverless YOLO Video Tracking
With ByteTrack for persistent player tracking
"""

import modal
import io
from typing import List, Dict

app = modal.App("pitchmind-gpu-tracker-v3")

gpu_image = (
    modal.Image.debian_slim()
    .apt_install(
        "libgl1-mesa-glx",
        "libglib2.0-0",
        "libsm6",
        "libxext6",
        "libxrender-dev",
        "libgomp1",
        "ffmpeg"
    )
    .pip_install(
        "ultralytics",
        "opencv-python-headless",
        "torch",
        "torchvision",
        "numpy",
        "Pillow",
        "requests",
        "fastapi",
        "supervision",  # NEW: ByteTrack
        "pandas"        # NEW: Ball interpolation
    )
    # Uncomment when you have your fine-tuned model:
    # .add_local_file("best.pt", "/models/soccer_best.pt")
)


@app.function(
    image=gpu_image,
    gpu="T4",
    timeout=1200,
    memory=8192,
    keep_warm=1,
)
def track_player_gpu(
    video_bytes: bytes,
    player_x: float,
    player_y: float,
    video_filename: str = "video.mp4"
) -> Dict:
    """
    Track a player using YOLO + ByteTrack for persistent IDs
    """
    import cv2
    import numpy as np
    import torch
    import pandas as pd
    import supervision as sv
    from ultralytics import YOLO
    import tempfile
    import os
    
    print(f"🎮 GPU Worker v3 (ByteTrack) started for: {video_filename}")
    print(f"GPU: {torch.cuda.get_device_name(0) if torch.cuda.is_available() else 'CPU'}")
    print(f"Initial player position: ({player_x:.2f}%, {player_y:.2f}%)")
    
    with tempfile.NamedTemporaryFile(suffix='.mp4', delete=False) as f:
        f.write(video_bytes)
        video_path = f.name
    
    try:
        device = 'cuda' if torch.cuda.is_available() else 'cpu'
        
        # Load model - swap to fine-tuned when ready
        # model = YOLO('/models/soccer_best.pt')
        model = YOLO('yolov8n.pt')
        model.to(device)
        print(f"✓ YOLO loaded on {device}")
        
        # Initialize ByteTrack
        tracker = sv.ByteTrack()
        print(f"✓ ByteTrack initialized")
        
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
        # PHASE 1: Run detection + tracking on all frames
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
                # Still append empty entries to maintain frame alignment
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
            
            # Filter to people only for tracking (class 0 in COCO)
            # When using fine-tuned model, this will be 'player' and 'goalkeeper'
            person_mask = detections.class_id == 0
            person_detections = detections[person_mask]
            
            # Update ByteTrack with person detections
            tracked = tracker.update_with_detections(person_detections)
            
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
            
            # Find ball (class 32 in COCO = sports ball)
            ball_mask = detections.class_id == 32
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
        # PHASE 2: Identify which track_id is our player
        # ============================================
        print("🎯 Phase 2: Identifying target player...")
        
        # Look at first few frames with detections to find player closest to click
        target_track_id = None
        min_distance = float('inf')
        
        for frame_players in all_tracks['players'][:30]:  # Check first 30 sampled frames
            for track_id, player in frame_players.items():
                center = player['center']
                distance = np.sqrt((center[0] - player_pixel_x)**2 + (center[1] - player_pixel_y)**2)
                if distance < min_distance:
                    min_distance = distance
                    target_track_id = track_id
        
        if target_track_id is None:
            return {
                'success': False,
                'error': 'Could not identify target player from click position'
            }
        
        print(f"  Target player: Track ID {target_track_id} (distance: {min_distance:.1f}px)")
        
        # ============================================
        # PHASE 3: Interpolate ball positions
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
        print(f"  Interpolated {df_ball.isna().sum().sum()} missing ball positions")
        
        # ============================================
        # PHASE 4: Find decision points
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
        
        for frame_idx, frame_players in enumerate(all_tracks['players']):
            # Skip if we didn't process this frame
            if not frame_players:
                continue
            
            # Check if our target player is in this frame
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
                'tracker': 'ByteTrack'
            }
        }
    
    finally:
        os.unlink(video_path)


@app.function(image=gpu_image, timeout=1800)
@modal.asgi_app()
def fastapi_app():
    from fastapi import FastAPI, Request
    from fastapi.responses import JSONResponse
    import requests
    
    web_app = FastAPI()
    
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
        
        if not all([video_url, player_x is not None, player_y is not None]):
            return JSONResponse({'success': False, 'error': 'Missing required fields'}, status_code=400)
        
        print(f"📥 Downloading video from: {video_url}")
        
        try:
            response = requests.get(video_url, timeout=300)
            response.raise_for_status()
            video_bytes = response.content
            print(f"✓ Downloaded {len(video_bytes) / 1024 / 1024:.1f} MB")
        except Exception as e:
            return JSONResponse({'success': False, 'error': f'Failed to download: {str(e)}'}, status_code=500)
        
        try:
            result = track_player_gpu.remote(video_bytes, player_x, player_y, filename)
            return JSONResponse(result)
        except Exception as e:
            return JSONResponse({'success': False, 'error': f'GPU processing failed: {str(e)}'}, status_code=500)
    
    return web_app


@app.local_entrypoint()
def test_local():
    print("Deploy with: modal deploy modal_gpu_worker.py")
