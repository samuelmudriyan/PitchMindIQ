"""
Modal GPU Worker for Pitch Mind - Serverless YOLO Video Tracking
Processes soccer videos on NVIDIA T4 GPUs in the cloud
"""

import modal
import io
from typing import List, Dict

# Create Modal app
stub = modal.Stub("pitchmind-gpu-tracker")

# Define the GPU environment with all dependencies
# Define the GPU environment with all dependencies
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
        "fastapi"
    )
)

# GPU function - runs on serverless T4 GPU
@stub.function(
    image=gpu_image,
    gpu="T4",  # NVIDIA T4 GPU - great price/performance
    timeout=900,  # 15 minute max per video
    memory=8192,  # 8GB RAM
)
def track_player_gpu(
    video_bytes: bytes,
    player_x: float,
    player_y: float,
    video_filename: str = "video.mp4"
) -> Dict:
    """
    Track a player in a soccer video using YOLO on GPU
    
    Args:
        video_bytes: Raw video file bytes
        player_x: Player's initial X position (0-100, percentage)
        player_y: Player's initial Y position (0-100, percentage)
        video_filename: Original filename for logging
        
    Returns:
        Dictionary with decision points and metadata
    """
    import cv2
    import numpy as np
    import torch
    from ultralytics import YOLO
    import tempfile
    import os
    
    print(f"🎮 GPU Worker started for: {video_filename}")
    print(f"GPU: {torch.cuda.get_device_name(0) if torch.cuda.is_available() else 'CPU'}")
    print(f"Player position: ({player_x:.2f}%, {player_y:.2f}%)")
    
    # Save video bytes to temporary file
    with tempfile.NamedTemporaryFile(suffix='.mp4', delete=False) as f:
        f.write(video_bytes)
        video_path = f.name
    
    try:
        # Load YOLO model on GPU
        device = 'cuda' if torch.cuda.is_available() else 'cpu'
        model = YOLO('yolov8n.pt')
        model.to(device)
        print(f"✓ YOLO loaded on {device}")
        
        # Open video
        cap = cv2.VideoCapture(video_path)
        if not cap.isOpened():
            raise ValueError(f"Could not open video: {video_filename}")
        
        # Get video metadata
        fps = cap.get(cv2.CAP_PROP_FPS)
        total_frames = int(cap.get(cv2.CAP_PROP_FRAME_COUNT))
        width = int(cap.get(cv2.CAP_PROP_FRAME_WIDTH))
        height = int(cap.get(cv2.CAP_PROP_FRAME_HEIGHT))
        duration = total_frames / fps
        
        print(f"Video: {width}x{height}, {fps:.1f} fps, {total_frames} frames ({duration:.1f}s)")
        
        # Convert percentage to pixel coordinates
        player_pixel_x = int((player_x / 100) * width)
        player_pixel_y = int((player_y / 100) * height)
        print(f"Tracking player at pixel: ({player_pixel_x}, {player_pixel_y})")
        
        # Frame sampling for speed (process at ~10fps)
        sample_rate = max(1, int(fps / 10))
        print(f"Sample rate: every {sample_rate} frames (10fps effective)")
        
        # Tracking variables
        decision_points = []
        frame_num = 0
        last_progress = 0
        
        # Detection thresholds
        TOUCH_DISTANCE = 100  # pixels - player touching ball
        MIN_FRAMES_BETWEEN_TOUCHES = int(fps * 2)  # 2 seconds between decision points
        last_touch_frame = -MIN_FRAMES_BETWEEN_TOUCHES
        
        # Field zones (simple thirds)
        def get_zone(y_pos, frame_height):
            third = frame_height / 3
            if y_pos < third:
                return "Defensive Third"
            elif y_pos < third * 2:
                return "Middle Third"
            else:
                return "Attacking Third"
        
        while cap.isOpened():
            ret, frame = cap.read()
            if not ret:
                break
            
            frame_num += 1
            
            # Skip frames for speed
            if frame_num % sample_rate != 0:
                continue
            
            # Progress logging
            progress = int((frame_num / total_frames) * 100)
            if progress >= last_progress + 10:
                print(f"Progress: {progress}% (Frame {frame_num}/{total_frames})")
                last_progress = progress
            
            # Run YOLO detection on GPU
            results = model(frame, device=device, verbose=False)[0]
            
            # Find player and ball
            player_box = None
            ball_box = None
            
            for box in results.boxes:
                cls = int(box.cls[0])
                conf = float(box.conf[0])
                
                # Class 0 = person, 32 = sports ball (COCO dataset)
                if cls == 0 and conf > 0.5:  # Person
                    x1, y1, x2, y2 = box.xyxy[0].cpu().numpy()
                    center_x = (x1 + x2) / 2
                    center_y = (y1 + y2) / 2
                    
                    # Find player closest to initial click position
                    distance = np.sqrt((center_x - player_pixel_x)**2 + (center_y - player_pixel_y)**2)
                    
                    if player_box is None or distance < player_box['distance']:
                        player_box = {
                            'bbox': [x1, y1, x2, y2],
                            'center': [center_x, center_y],
                            'distance': distance,
                            'confidence': conf
                        }
                
                elif cls == 32 and conf > 0.3:  # Ball
                    x1, y1, x2, y2 = box.xyxy[0].cpu().numpy()
                    center_x = (x1 + x2) / 2
                    center_y = (y1 + y2) / 2
                    
                    if ball_box is None or conf > ball_box['confidence']:
                        ball_box = {
                            'bbox': [x1, y1, x2, y2],
                            'center': [center_x, center_y],
                            'confidence': conf
                        }
            
            # Check if player is near ball (potential decision point)
            if player_box and ball_box:
                player_center = np.array(player_box['center'])
                ball_center = np.array(ball_box['center'])
                distance = np.linalg.norm(player_center - ball_center)
                
                # Log periodic distances for debugging
                if frame_num % (sample_rate * 30) == 0:  # Every ~3 seconds
                    print(f"Frame {frame_num}: Player-ball distance = {distance:.1f} px")
                
                # Decision point detected
                if distance < TOUCH_DISTANCE:
                    # Avoid duplicate detections (must be 2+ seconds apart)
                    if frame_num - last_touch_frame >= MIN_FRAMES_BETWEEN_TOUCHES:
                        timestamp = frame_num / fps
                        zone = get_zone(player_center[1], height)
                        
                        decision_points.append({
                            'timestamp': round(timestamp, 1),
                            'frame': frame_num,
                            'zone': zone,
                            'player_position': player_center.tolist(),
                            'ball_position': ball_center.tolist(),
                            'distance': round(distance, 1)
                        })
                        
                        print(f"✓ DECISION POINT at {timestamp:.1f}s in {zone}")
                        last_touch_frame = frame_num
        
        cap.release()
        
        print(f"✅ Processing complete! Found {len(decision_points)} decision points")
        
        return {
            'success': True,
            'decision_points': decision_points,
            'video_metadata': {
                'filename': video_filename,
                'width': width,
                'height': height,
                'fps': fps,
                'total_frames': total_frames,
                'duration': round(duration, 1)
            },
            'processing_info': {
                'sample_rate': sample_rate,
                'frames_processed': frame_num // sample_rate,
                'gpu_used': torch.cuda.get_device_name(0) if torch.cuda.is_available() else 'CPU'
            }
        }
    
    finally:
        # Cleanup
        os.unlink(video_path)


# Web endpoint - callable from Railway backend
@stub.function(image=gpu_image)
@modal.web_endpoint(method="POST")
def analyze_video_endpoint(item: dict):
    """
    HTTP endpoint for Railway to call
    
    Expected JSON body:
    {
        "video_url": "https://...",
        "player_x": 68.5,
        "player_y": 42.3,
        "filename": "video.mp4"
    }
    """
    import requests
    
    video_url = item.get('video_url')
    player_x = item.get('player_x')
    player_y = item.get('player_y')
    filename = item.get('filename', 'video.mp4')
    
    if not all([video_url, player_x is not None, player_y is not None]):
        return {
            'success': False,
            'error': 'Missing required fields: video_url, player_x, player_y'
        }
    
    print(f"📥 Downloading video from: {video_url}")
    
    # Download video from Railway
    try:
        response = requests.get(video_url, timeout=300)
        response.raise_for_status()
        video_bytes = response.content
        print(f"✓ Downloaded {len(video_bytes) / 1024 / 1024:.1f} MB")
    except Exception as e:
        return {
            'success': False,
            'error': f'Failed to download video: {str(e)}'
        }
    
    # Process on GPU (Modal auto-scales)
    try:
        result = track_player_gpu.remote(video_bytes, player_x, player_y, filename)
        return result
    except Exception as e:
        return {
            'success': False,
            'error': f'GPU processing failed: {str(e)}'
        }


# Local testing function
@stub.local_entrypoint()
def test_local():
    """
    Test the GPU worker locally with a sample video
    """
    print("🧪 Testing Modal GPU worker locally...")
    
    # You can test with a local video file
    # with open("test_video.mp4", "rb") as f:
    #     video_bytes = f.read()
    # 
    # result = track_player_gpu.remote(video_bytes, 50.0, 50.0, "test.mp4")
    # print(result)
    
    print("Deploy this function with: modal deploy modal_gpu_worker.py")
