"""
PitchMind Custom Tracker - Production Modal Worker (Modal 1.0)
Updated for latest Modal API
"""

import modal
from typing import Dict
import json
import sys

app = modal.App("pitchmind-production-tracker")

# Volume for caching models
model_volume = modal.Volume.from_name("pitchmind-models-v6", create_if_missing=True)

# Production GPU image
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
        "libavcodec-dev",
        "libavformat-dev"
    )
    .pip_install(
        "ultralytics>=8.1.0",
        "opencv-python-headless==4.8.1.78",
        "torch>=2.0.0",
        "torchvision",
        "numpy<2.0.0",
        "supervision==0.22.0",
        "pillow",
        "requests",
        "fastapi",
        "uvicorn"
    )
)

@app.function(
    image=gpu_image,
    gpu="T4",
    timeout=7200,  # 2 hours for full first-half highlights
    volumes={"/models": model_volume},
    memory=16384,
    min_containers=0
)
def track_player(
    video_url: str,
    click_x: float,
    click_y: float,
    click_timestamp: float = 0.0
) -> Dict:
    """
    Production tracker using ByteTrack + YOLO
    Optimized for long videos (10-20 min highlights)
    
    Args:
        video_url: URL to video file
        click_x: X coordinate (percentage 0-100)
        click_y: Y coordinate (percentage 0-100)
        click_timestamp: When user clicked (seconds)
        
    Returns:
        Dict with decision_points, player_tracks, video_info
    """
    import cv2
    import numpy as np
    from ultralytics import YOLO
    import supervision as sv
    import tempfile
    import urllib.request
    import os
    
    # Adaptive frame sampling helper function
    def get_sample_rate(total_frames, fps):
        """
        Dynamically adjust frame sampling based on video length.
        Longer videos = more aggressive sampling to stay under 2hr limit.
        """
        duration_seconds = total_frames / fps
        duration_minutes = duration_seconds / 60
        
        if duration_minutes < 5:
            return 5   # High quality for short videos
        elif duration_minutes < 10:
            return 10  # Medium quality
        elif duration_minutes < 15:
            return 20  # Lower quality but faster
        else:
            return 30  # Very aggressive for 15+ min videos
    
    print(f"🎬 PitchMind Tracker Starting", file=sys.stderr)
    print(f"   Video URL: {video_url}", file=sys.stderr)
    print(f"   Click: ({click_x:.1f}%, {click_y:.1f}%) at {click_timestamp:.1f}s", file=sys.stderr)
    
    try:
        # Download video
        print(f"📥 Downloading video...", file=sys.stderr)
        with tempfile.NamedTemporaryFile(delete=False, suffix='.mp4') as tmp:
            urllib.request.urlretrieve(video_url, tmp.name)
            video_path = tmp.name
        print(f"✅ Video downloaded", file=sys.stderr)
        
        # Initialize YOLO
        model_path = "/models/yolov8n.pt"
        if not os.path.exists(model_path):
            print(f"📦 Downloading YOLO model...", file=sys.stderr)
            model = YOLO('yolov8n.pt')
            os.makedirs("/models", exist_ok=True)
            model.save(model_path)
            print(f"✅ Model cached", file=sys.stderr)
        else:
            model = YOLO(model_path)
            print(f"✅ Model loaded from cache", file=sys.stderr)
        
        # Initialize ByteTrack
        tracker = sv.ByteTrack(
            track_activation_threshold=0.25,
            lost_track_buffer=60,
            minimum_matching_threshold=0.7,
            frame_rate=30
        )
        print(f"✅ ByteTrack initialized", file=sys.stderr)
        
        # Configuration
        ROI_TOP = 120
        ROI_BOTTOM = 670
        GREEN_RATIO_THRESHOLD = 0.25
        HIST_DIFF_THRESHOLD = 0.4
        BALL_PROXIMITY_THRESHOLD = 150  # Increased from 100 to catch more interactions
        BALL_CONFIDENCE_THRESHOLD = 0.2  # Lower threshold for ball detection (balls are small)
        
        # Helper: Detect replays
        def is_replay(frame, prev_hist):
            hsv = cv2.cvtColor(frame, cv2.COLOR_BGR2HSV)
            mask_green = cv2.inRange(hsv, (35, 40, 40), (85, 255, 255))
            green_ratio = cv2.countNonZero(mask_green) / (frame.shape[0] * frame.shape[1])
            
            hist = cv2.calcHist([frame], [0], None, [64], [0, 256])
            hist = cv2.normalize(hist, hist).flatten()
            
            hist_diff = 1.0
            if prev_hist is not None:
                hist_diff = cv2.compareHist(prev_hist, hist, cv2.HISTCMP_CORREL)
            
            return (green_ratio < GREEN_RATIO_THRESHOLD or 
                    hist_diff < HIST_DIFF_THRESHOLD), hist
        
        # Open video
        cap = cv2.VideoCapture(video_path)
        if not cap.isOpened():
            return {'success': False, 'error': f'Cannot open video: {video_path}'}
        
        # Video properties
        frame_count = int(cap.get(cv2.CAP_PROP_FRAME_COUNT))
        fps = cap.get(cv2.CAP_PROP_FPS)
        width = int(cap.get(cv2.CAP_PROP_FRAME_WIDTH))
        height = int(cap.get(cv2.CAP_PROP_FRAME_HEIGHT))
        duration = frame_count / fps if fps > 0 else 0
        
        print(f"🎥 Video: {width}x{height}, {fps:.1f} fps, {frame_count} frames ({duration:.1f}s)", file=sys.stderr)
        
        # Calculate adaptive sample rate
        sample_rate = get_sample_rate(frame_count, fps)
        estimated_frames = frame_count // sample_rate
        print(f"📊 Adaptive sampling: every {sample_rate} frames ({estimated_frames} total frames to process)", file=sys.stderr)
        
        # Convert click coordinates
        click_x_px = (click_x / 100) * width
        click_y_px = (click_y / 100) * height
        
        print(f"🎯 Target click position: ({click_x_px:.0f}, {click_y_px:.0f}) pixels", file=sys.stderr)
        
        # Results storage
        decision_points = []
        player_tracks = []
        target_player_id = None
        prev_hist = None
        frame_idx = 0
        last_progress = 0
        total_ball_detections = 0
        total_player_frames = 0
        
        # Process video
        print(f"🔄 Processing video...", file=sys.stderr)
        
        while cap.isOpened():
            ret, frame = cap.read()
            if not ret:
                break
            
            # Progress updates
            progress = int((frame_idx / frame_count) * 100)
            if progress >= last_progress + 10:
                print(f"  Progress: {progress}%", file=sys.stderr)
                last_progress = progress
            
            # OPTIMIZATION: Skip frames using adaptive sampling
            if frame_idx % sample_rate != 0:
                frame_idx += 1
                continue
            
            # Skip replays
            replay_flag, prev_hist = is_replay(frame, prev_hist)
            if replay_flag:
                frame_idx += 1
                continue
            
            # ROI crop
            roi = frame[ROI_TOP:ROI_BOTTOM, :]
            
            # YOLO detection - use lower confidence for balls
            results = model.predict(roi, verbose=False, conf=0.25)
            
            # Parse detections
            person_boxes, person_confs = [], []
            ball_boxes, ball_confs = [], []
            
            if len(results) > 0 and results[0].boxes is not None:
                boxes = results[0].boxes
                for i in range(len(boxes)):
                    box = boxes.xyxy[i].cpu().numpy()
                    cls = int(boxes.cls[i].cpu().numpy())
                    conf = float(boxes.conf[i].cpu().numpy())
                    
                    if cls == 0:  # Person
                        person_boxes.append(box)
                        person_confs.append(conf)
                    elif cls == 32:  # Sports ball - use lower confidence threshold
                        if conf >= BALL_CONFIDENCE_THRESHOLD:
                            ball_boxes.append(box)
                            ball_confs.append(conf)
            
            # Convert to Supervision format
            person_detections = sv.Detections(
                xyxy=np.array(person_boxes) if person_boxes else np.empty((0, 4)),
                confidence=np.array(person_confs) if person_confs else np.empty(0),
                class_id=np.zeros(len(person_boxes), dtype=int) if person_boxes else np.empty(0, dtype=int)
            )
            
            ball_detections = sv.Detections(
                xyxy=np.array(ball_boxes) if ball_boxes else np.empty((0, 4)),
                confidence=np.array(ball_confs) if ball_confs else np.empty(0),
                class_id=np.ones(len(ball_boxes), dtype=int) * 32 if ball_boxes else np.empty(0, dtype=int)
            )
            
            # ByteTrack tracking
            tracks = tracker.update_with_detections(person_detections)
            
            # Find target player
            if target_player_id is None and len(tracks) > 0:
                current_time = frame_idx / fps
                if abs(current_time - click_timestamp) < 3.0:
                    min_dist = float('inf')
                    for i in range(len(tracks)):
                        bbox = tracks.xyxy[i]
                        center_x = (bbox[0] + bbox[2]) / 2
                        center_y = (bbox[1] + bbox[3]) / 2
                        
                        dist = np.sqrt(
                            (center_x - click_x_px)**2 + 
                            (center_y - (click_y_px - ROI_TOP))**2
                        )
                        
                        if dist < min_dist:
                            min_dist = dist
                            target_player_id = int(tracks.tracker_id[i])
                    
                    if target_player_id:
                        print(f"🎯 Target player locked: ID {target_player_id}", file=sys.stderr)
            
            # Process tracks
            target_player_pos = None
            
            if len(tracks) > 0:
                for i in range(len(tracks)):
                    track_id = int(tracks.tracker_id[i])
                    bbox = tracks.xyxy[i]
                    
                    if track_id == target_player_id:
                        center_x = (bbox[0] + bbox[2]) / 2
                        center_y = (bbox[1] + bbox[3]) / 2
                        target_player_pos = (center_x, center_y)
                        total_player_frames += 1
                        
                        player_tracks.append({
                            'frame': frame_idx,
                            'timestamp': round(frame_idx / fps, 2),
                            'position': {
                                'x': round(float(center_x), 1),
                                'y': round(float(center_y), 1)
                            },
                            'bbox': [float(x) for x in bbox]
                        })
            
            # Track ball detections for debugging
            if len(ball_detections) > 0:
                total_ball_detections += 1
            
            # Decision point detection
            if target_player_pos is not None and len(ball_detections) > 0:
                ball_bbox = ball_detections.xyxy[0]
                ball_center = (
                    (ball_bbox[0] + ball_bbox[2]) / 2,
                    (ball_bbox[1] + ball_bbox[3]) / 2
                )
                
                distance = np.sqrt(
                    (target_player_pos[0] - ball_center[0])**2 + 
                    (target_player_pos[1] - ball_center[1])**2
                )
                
                if distance < BALL_PROXIMITY_THRESHOLD:
                    timestamp = frame_idx / fps
                    
                    third = (ROI_BOTTOM - ROI_TOP) / 3
                    y_pos = target_player_pos[1]
                    if y_pos < third:
                        field_third = "Attacking Third"
                    elif y_pos < third * 2:
                        field_third = "Middle Third"
                    else:
                        field_third = "Defensive Third"
                    
                    decision_points.append({
                        'timestamp': round(timestamp, 2),
                        'frame': frame_idx,
                        'player_position': {
                            'x': round((target_player_pos[0] / width) * 100, 1),
                            'y': round(((target_player_pos[1] + ROI_TOP) / height) * 100, 1)
                        },
                        'field_third': field_third,
                        'ball_distance': round(float(distance), 1),
                        'clip_start': max(0, timestamp - 5),
                        'clip_end': min(duration, timestamp + 10)
                    })
                    
                    print(f"⚽ Decision point at {timestamp:.1f}s", file=sys.stderr)
            
            frame_idx += 1
        
        cap.release()
        
        try:
            os.unlink(video_path)
        except:
            pass
        
        print(f"✅ Tracking complete!", file=sys.stderr)
        print(f"   Target player: ID {target_player_id}", file=sys.stderr)
        print(f"   Player tracked in {total_player_frames} frames", file=sys.stderr)
        print(f"   Ball detected in {total_ball_detections} frames", file=sys.stderr)
        print(f"   Decision points: {len(decision_points)}", file=sys.stderr)
        
        # If no decision points but player was tracked, add fallback points based on player movement
        if len(decision_points) == 0 and len(player_tracks) > 10:
            print(f"⚠️  No ball-based decision points found. Adding movement-based points...", file=sys.stderr)
            # Add decision points based on significant player movements
            third = (ROI_BOTTOM - ROI_TOP) / 3
            for i in range(10, len(player_tracks), max(1, len(player_tracks) // 5)):
                track = player_tracks[i]
                y_pos = track['position']['y']
                
                # Determine field third based on player position in ROI
                if y_pos < third:
                    field_third = "Attacking Third"
                elif y_pos < third * 2:
                    field_third = "Middle Third"
                else:
                    field_third = "Defensive Third"
                
                decision_points.append({
                    'timestamp': track['timestamp'],
                    'frame': track['frame'],
                    'player_position': {
                        'x': round((track['position']['x'] / width) * 100, 1),
                        'y': round(((track['position']['y'] + ROI_TOP) / height) * 100, 1)
                    },
                    'field_third': field_third,
                    'ball_distance': None,
                    'clip_start': max(0, track['timestamp'] - 5),
                    'clip_end': min(duration, track['timestamp'] + 10),
                    'type': 'movement'  # Indicate this is movement-based, not ball-based
                })
            print(f"   Added {len(decision_points)} movement-based decision points", file=sys.stderr)
        
        return {
            'success': True,
            'target_player_id': target_player_id,
            'decision_points': decision_points,
            'player_tracks': player_tracks,
            'video_info': {
                'width': width,
                'height': height,
                'fps': round(fps, 2),
                'total_frames': frame_count,
                'duration': round(duration, 2)
            }
        }
        
    except Exception as e:
        import traceback
        error_msg = str(e)
        stack_trace = traceback.format_exc()
        print(f"❌ Error: {error_msg}", file=sys.stderr)
        print(stack_trace, file=sys.stderr)
        
        return {
            'success': False,
            'error': error_msg,
            'stack_trace': stack_trace
        }

# Webhook endpoint - Updated to fastapi_endpoint
@app.function(
    image=gpu_image,
    min_containers=0  # Updated from keep_warm=0
)
@modal.asgi_app()
def track_webhook():
    """FastAPI endpoint for PitchMind backend"""
    from fastapi import FastAPI, Request
    from fastapi.responses import JSONResponse
    
    web_app = FastAPI()
    
    @web_app.post("/track")
    async def track_endpoint(request: Request):
        """
        POST body:
        {
            "video_url": "https://...",
            "click_x": 50.0,
            "click_y": 50.0,
            "click_timestamp": 10.5
        }
        """
        try:
            data = await request.json()
            
            video_url = data.get('video_url')
            click_x = float(data.get('click_x', 50.0))
            click_y = float(data.get('click_y', 50.0))
            click_timestamp = float(data.get('click_timestamp', 0.0))
            
            if not video_url:
                return JSONResponse(
                    {'success': False, 'error': 'Missing video_url'},
                    status_code=400
                )
            
            # Call the tracker
            result = track_player.remote(video_url, click_x, click_y, click_timestamp)
            
            return JSONResponse(result)
            
        except Exception as e:
            return JSONResponse(
                {'success': False, 'error': str(e)},
                status_code=500
            )
    
    return web_app


# Local testing
@app.local_entrypoint()
def test(video_path: str = "test.mp4", click_x: float = 50.0, click_y: float = 50.0):
    """Test: modal run modal_production_tracker.py --video-path test.mp4"""
    print("🧪 Testing tracker locally...")
    result = track_player.remote(video_path, click_x, click_y)
    print("\n" + "="*60)
    print(json.dumps(result, indent=2))
    print("="*60)
