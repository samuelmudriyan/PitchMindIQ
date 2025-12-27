"""
Modal GPU Worker for Pitch Mind - V6 (Enhanced for Youth Soccer)
Roboflow Soccer Detection Model + ByteTrack + Advanced Analytics

Uses pre-trained soccer model from Roboflow Universe:
- football-players-detection-3zvbc/20
- Classes: ball, goalkeeper, player, referee
- 83% mAP@50, trained on 372 images

ByteTrack for multi-object tracking.
Enhanced with:
- Velocity and speed calculations
- Kalman filtering for ball trajectory
- Improved player identification
- Action classification (pass, shot, dribble)
- Player trajectory and distance metrics
- Youth soccer specific analytics
"""

import modal
from typing import Dict, List, Optional, Tuple
import numpy as np

app = modal.App("pitchmind-gpu-tracker-v6")

# Volume for caching the model
model_volume = modal.Volume.from_name("pitchmind-models-v6", create_if_missing=True)

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
        "inference",  # Roboflow inference SDK
        "inference-sdk",
        "filterpy>=1.4.5"  # For Kalman filtering
    )
)

# Roboflow model config
ROBOFLOW_API_KEY = "Flk5MLdPdTNVBChF7f64"
ROBOFLOW_MODEL_ID = "football-players-detection-3zvbc-t4kql/1"

# Class mappings for this model
CLASS_NAMES = {
    'ball': 0,
    'goalkeeper': 1, 
    'player': 2,
    'referee': 3
}

# Configuration constants
TOUCH_DISTANCE = 100  # pixels - distance threshold for ball touch
MIN_FRAMES_BETWEEN_TOUCHES = 2.0  # seconds minimum between touches
MAX_CLICK_DISTANCE = 200  # pixels - max distance for player identification
BALL_INTERPOLATION_LIMIT = 30  # frames - max gap to interpolate ball
VELOCITY_SMOOTHING_WINDOW = 5  # frames for velocity smoothing

# Re-identification constants
REID_FEATURE_SIMILARITY_THRESHOLD = 0.7  # minimum similarity to match players
REID_MAX_AGE_FRAMES = 90  # frames before considering a player lost (3 seconds at 30fps)
REID_MIN_CONFIDENCE = 0.3  # minimum detection confidence for re-ID


def get_roboflow_model():
    """Get Roboflow model using inference SDK"""
    from inference import get_model
    import os
    
    os.environ["ROBOFLOW_API_KEY"] = ROBOFLOW_API_KEY
    
    print(f"📥 Loading Roboflow model: {ROBOFLOW_MODEL_ID}")
    model = get_model(model_id=ROBOFLOW_MODEL_ID)
    print(f"✓ Model loaded successfully")
    
    return model


class SimpleKalmanFilter:
    """Simple 2D Kalman filter for ball trajectory smoothing"""
    def __init__(self, process_noise=0.1, measurement_noise=1.0):
        self.process_noise = process_noise
        self.measurement_noise = measurement_noise
        self.x = None  # State: [x, y, vx, vy]
        self.P = None  # Covariance matrix
        
    def init(self, x, y):
        """Initialize filter with first measurement"""
        self.x = np.array([x, y, 0.0, 0.0], dtype=float)
        self.P = np.eye(4) * 100.0
        
    def update(self, x, y):
        """Update filter with new measurement"""
        if self.x is None:
            self.init(x, y)
            return [x, y]
        
        # Predict
        F = np.array([
            [1, 0, 1, 0],
            [0, 1, 0, 1],
            [0, 0, 1, 0],
            [0, 0, 0, 1]
        ], dtype=float)
        self.x = F @ self.x
        self.P = F @ self.P @ F.T + np.eye(4) * self.process_noise
        
        # Update
        H = np.array([
            [1, 0, 0, 0],
            [0, 1, 0, 0]
        ], dtype=float)
        z = np.array([x, y])
        y = z - H @ self.x
        S = H @ self.P @ H.T + np.eye(2) * self.measurement_noise
        K = self.P @ H.T @ np.linalg.inv(S)
        self.x = self.x + K @ y
        self.P = (np.eye(4) - K @ H) @ self.P
        
        return [float(self.x[0]), float(self.x[1])]


def calculate_velocity(positions: List[List[float]], fps: float, window: int = VELOCITY_SMOOTHING_WINDOW) -> List[Dict]:
    """
    Calculate velocity and speed from position history
    
    Returns list of dicts with 'speed' (pixels/sec), 'velocity' [vx, vy], 'direction' (degrees)
    """
    velocities = []
    
    for i in range(len(positions)):
        if i == 0:
            velocities.append({'speed': 0.0, 'velocity': [0.0, 0.0], 'direction': 0.0})
            continue
        
        # Use windowed average for smoother velocity
        start_idx = max(0, i - window)
        end_idx = min(len(positions), i + 1)
        
        if end_idx - start_idx < 2:
            velocities.append(velocities[-1] if velocities else {'speed': 0.0, 'velocity': [0.0, 0.0], 'direction': 0.0})
            continue
        
        pos_start = np.array(positions[start_idx])
        pos_end = np.array(positions[end_idx - 1])
        dt = (end_idx - start_idx) / fps
        
        if dt > 0:
            vx = (pos_end[0] - pos_start[0]) / dt
            vy = (pos_end[1] - pos_start[1]) / dt
            speed = np.sqrt(vx**2 + vy**2)
            direction = np.degrees(np.arctan2(vy, vx)) % 360
        else:
            vx, vy, speed, direction = 0.0, 0.0, 0.0, 0.0
        
        velocities.append({
            'speed': float(speed),
            'velocity': [float(vx), float(vy)],
            'direction': float(direction)
        })
    
    return velocities


def classify_action(player_pos: np.ndarray, ball_pos: np.ndarray, 
                   player_vel: Dict, ball_vel: Optional[Dict],
                   distance: float, zone: str) -> str:
    """
    Classify the type of action at a decision point
    
    Returns: 'touch', 'pass', 'shot', 'dribble', 'reception'
    """
    if distance > TOUCH_DISTANCE:
        return 'touch'
    
    speed = player_vel.get('speed', 0.0)
    player_dir = player_vel.get('direction', 0.0)
    
    # Check if ball is moving away from player (potential pass/shot)
    if ball_vel:
        ball_speed = np.sqrt(ball_vel['velocity'][0]**2 + ball_vel['velocity'][1]**2)
        if ball_speed > 50:  # Ball moving fast
            # Check if in attacking third and moving toward goal
            if zone == "Attacking Third" and ball_speed > 100:
                return 'shot'
            return 'pass'
    
    # High speed + close to ball = dribble
    if speed > 30 and distance < 50:
        return 'dribble'
    
    # Low speed + close to ball = reception
    if speed < 15 and distance < 60:
        return 'reception'
    
    return 'touch'


def calculate_distance_traveled(positions: List[List[float]]) -> float:
    """Calculate total distance traveled in pixels"""
    if len(positions) < 2:
        return 0.0
    
    total_distance = 0.0
    for i in range(1, len(positions)):
        if not (np.isnan(positions[i]).any() or np.isnan(positions[i-1]).any()):
            dist = np.linalg.norm(np.array(positions[i]) - np.array(positions[i-1]))
            total_distance += dist
    
    return float(total_distance)


class PlayerReID:
    """
    Re-identification system for maintaining permanent player IDs
    Uses appearance features (color histograms) to match players across frames
    """
    def __init__(self, similarity_threshold: float = REID_FEATURE_SIMILARITY_THRESHOLD):
        self.similarity_threshold = similarity_threshold
        self.next_permanent_id = 1
        self.players: Dict[int, Dict] = {}  # permanent_id -> player info
        self.track_to_permanent: Dict[int, int] = {}  # ByteTrack ID -> permanent ID
        self.last_seen: Dict[int, int] = {}  # permanent_id -> last frame seen
        
    def extract_features(self, frame: np.ndarray, bbox: List[float]) -> np.ndarray:
        """
        Extract appearance features from player bounding box
        Uses color histogram (HSV) for robust appearance matching
        """
        import cv2
        
        x1, y1, x2, y2 = [int(coord) for coord in bbox]
        x1 = max(0, x1)
        y1 = max(0, y1)
        x2 = min(frame.shape[1], x2)
        y2 = min(frame.shape[0], y2)
        
        if x2 <= x1 or y2 <= y1:
            return np.zeros(256, dtype=np.float32)
        
        # Extract player region
        player_roi = frame[y1:y2, x1:x2]
        
        if player_roi.size == 0:
            return np.zeros(256, dtype=np.float32)
        
        # Convert to HSV for better color representation
        hsv = cv2.cvtColor(player_roi, cv2.COLOR_BGR2HSV)
        
        # Compute color histogram (focus on hue and saturation)
        hist_h = cv2.calcHist([hsv], [0], None, [180], [0, 180])
        hist_s = cv2.calcHist([hsv], [1], None, [76], [0, 256])
        
        # Normalize and combine
        hist_h = hist_h / (hist_h.sum() + 1e-6)
        hist_s = hist_s / (hist_s.sum() + 1e-6)
        
        # Combine histograms
        features = np.concatenate([hist_h.flatten(), hist_s.flatten()])
        
        # Normalize to unit vector for cosine similarity
        norm = np.linalg.norm(features)
        if norm > 0:
            features = features / norm
        
        return features.astype(np.float32)
    
    def cosine_similarity(self, feat1: np.ndarray, feat2: np.ndarray) -> float:
        """Calculate cosine similarity between two feature vectors"""
        if feat1.size == 0 or feat2.size == 0:
            return 0.0
        return float(np.dot(feat1, feat2))
    
    def match_player(self, features: np.ndarray, bbox: List[float], 
                    frame_idx: int, track_id: int) -> int:
        """
        Match a detection to an existing player or create new permanent ID
        
        Returns: permanent_player_id
        """
        # If this ByteTrack ID already has a permanent ID, update last seen
        if track_id in self.track_to_permanent:
            permanent_id = self.track_to_permanent[track_id]
            self.last_seen[permanent_id] = frame_idx
            return permanent_id
        
        # Try to match with existing players
        best_match_id = None
        best_similarity = 0.0
        
        for permanent_id, player_info in self.players.items():
            # Skip if player hasn't been seen recently
            frames_since_seen = frame_idx - self.last_seen.get(permanent_id, -REID_MAX_AGE_FRAMES)
            if frames_since_seen > REID_MAX_AGE_FRAMES:
                continue
            
            # Calculate similarity with stored features
            stored_features = player_info.get('features', None)
            if stored_features is not None:
                similarity = self.cosine_similarity(features, stored_features)
                if similarity > best_similarity and similarity >= self.similarity_threshold:
                    best_similarity = similarity
                    best_match_id = permanent_id
        
        # Match found - update mapping
        if best_match_id is not None:
            self.track_to_permanent[track_id] = best_match_id
            self.last_seen[best_match_id] = frame_idx
            # Update features with running average (for robustness)
            old_features = self.players[best_match_id].get('features', features)
            alpha = 0.3  # learning rate
            self.players[best_match_id]['features'] = (
                alpha * features + (1 - alpha) * old_features
            )
            return best_match_id
        
        # No match - create new permanent ID
        permanent_id = self.next_permanent_id
        self.next_permanent_id += 1
        
        self.players[permanent_id] = {
            'features': features,
            'first_seen': frame_idx,
            'bbox': bbox
        }
        self.track_to_permanent[track_id] = permanent_id
        self.last_seen[permanent_id] = frame_idx
        
        return permanent_id
    
    def get_permanent_id(self, track_id: int) -> Optional[int]:
        """Get permanent ID for a ByteTrack ID, or None if not found"""
        return self.track_to_permanent.get(track_id)
    
    def cleanup_old_tracks(self, current_frame: int):
        """Remove old track mappings that are no longer active"""
        tracks_to_remove = []
        for track_id, permanent_id in self.track_to_permanent.items():
            if current_frame - self.last_seen.get(permanent_id, 0) > REID_MAX_AGE_FRAMES:
                tracks_to_remove.append(track_id)
        
        for track_id in tracks_to_remove:
            del self.track_to_permanent[track_id]
    
    def get_all_players(self) -> Dict[int, Dict]:
        """Get all registered players"""
        return self.players.copy()


@app.function(
    image=gpu_image,
    gpu="T4",
    timeout=600,
    memory=8192,
    volumes={"/models": model_volume},
)
def track_player_gpu(
    video_bytes: bytes,
    player_x: float,
    player_y: float,
    video_filename: str = "video.mp4",
    click_timestamp: float = 0.0
) -> Dict:
    """
    Track a player using Roboflow Soccer Model + ByteTrack
    
    Args:
        video_bytes: Raw video file bytes
        player_x: Click X position (pixels)
        player_y: Click Y position (pixels)
        video_filename: Original filename for logging
        click_timestamp: Video timestamp (seconds) where user clicked
    
    Returns:
        Dictionary with decision points and metadata
    """
    import cv2
    import numpy as np
    import torch
    import pandas as pd
    import supervision as sv
    import tempfile
    import os
    
    print(f"🎮 GPU Worker V6 (Enhanced - Roboflow Soccer + ByteTrack) started for: {video_filename}")
    print(f"GPU: {torch.cuda.get_device_name(0) if torch.cuda.is_available() else 'CPU'}")
    print(f"Click position: ({player_x:.2f}, {player_y:.2f}) at {click_timestamp:.2f}s")
    
    # Write video to temp file
    with tempfile.NamedTemporaryFile(suffix='.mp4', delete=False) as f:
        f.write(video_bytes)
        video_path = f.name
    
    try:
        # ============================================
        # Load Roboflow Model
        # ============================================
        model = get_roboflow_model()
        
        # Initialize ByteTrack
        tracker = sv.ByteTrack(
            track_activation_threshold=0.25,
            lost_track_buffer=30,
            minimum_matching_threshold=0.8,
            frame_rate=30
        )
        print(f"✓ ByteTrack initialized")
        
        # Initialize Re-identification system
        reid_system = PlayerReID(similarity_threshold=REID_FEATURE_SIMILARITY_THRESHOLD)
        print(f"✓ Re-identification system initialized")
        
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
        
        player_pixel_x = int(player_x)
        player_pixel_y = int(player_y)
        
        # ============================================
        # PHASE 1: Detection & Tracking
        # ============================================
        print("📊 Phase 1: Detection & Tracking...")
        
        all_tracks = {
            'players': [],  # Includes players AND goalkeepers
            'ball': []
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
            
            # Run Roboflow inference
            results = model.infer(frame)[0]
            
            # Parse predictions into supervision format
            boxes = []
            confidences = []
            class_ids = []
            
            for pred in results.predictions:
                # Roboflow returns x,y center and width,height
                x_center = pred.x
                y_center = pred.y
                w = pred.width
                h = pred.height
                
                # Convert to xyxy format
                x1 = x_center - w/2
                y1 = y_center - h/2
                x2 = x_center + w/2
                y2 = y_center + h/2
                
                boxes.append([x1, y1, x2, y2])
                confidences.append(pred.confidence)
                
                # Map class name to ID
                class_name = pred.class_name.lower()
                class_id = CLASS_NAMES.get(class_name, 2)  # default to player
                class_ids.append(class_id)
            
            # Create supervision Detections
            if boxes:
                detections = sv.Detections(
                    xyxy=np.array(boxes),
                    confidence=np.array(confidences),
                    class_id=np.array(class_ids)
                )
            else:
                detections = sv.Detections.empty()
            
            # Filter to PLAYERS and GOALKEEPERS for tracking
            player_mask = (detections.class_id == CLASS_NAMES['player']) | (detections.class_id == CLASS_NAMES['goalkeeper'])
            player_detections = detections[player_mask]
            
            # Update ByteTrack with player detections
            tracked = tracker.update_with_detections(player_detections)
            
            # Store tracked players with permanent IDs from re-identification
            frame_players = {}
            if tracked.tracker_id is not None:
                for i, track_id in enumerate(tracked.tracker_id):
                    bbox = tracked.xyxy[i].tolist()
                    center_x = (bbox[0] + bbox[2]) / 2
                    center_y = (bbox[1] + bbox[3]) / 2
                    class_id = tracked.class_id[i] if tracked.class_id is not None else CLASS_NAMES['player']
                    confidence = tracked.confidence[i] if tracked.confidence is not None else 1.0
                    
                    # Extract appearance features for re-identification
                    features = reid_system.extract_features(frame, bbox)
                    
                    # Match to permanent player ID
                    permanent_id = reid_system.match_player(
                        features, bbox, frame_num, int(track_id)
                    )
                    
                    # Store with both ByteTrack ID and permanent ID
                    frame_players[permanent_id] = {
                        'bbox': bbox,
                        'center': [center_x, center_y],
                        'class': 'goalkeeper' if class_id == CLASS_NAMES['goalkeeper'] else 'player',
                        'track_id': int(track_id),  # ByteTrack ID (temporary)
                        'permanent_id': permanent_id,  # Re-ID permanent ID
                        'confidence': float(confidence)
                    }
            
            # Cleanup old tracks periodically
            if frame_num % 30 == 0:  # Every second at 30fps
                reid_system.cleanup_old_tracks(frame_num)
            
            all_tracks['players'].append(frame_players)
            
            # Find ball
            ball_mask = detections.class_id == CLASS_NAMES['ball']
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
        # PHASE 2: Identify Target Player at Click Time (Enhanced with Re-ID)
        # ============================================
        print("🎯 Phase 2: Identifying target player with permanent ID...")
        
        target_permanent_id = None
        min_distance = float('inf')
        best_confidence = 0.0
        
        # Calculate which sampled frame index corresponds to click_timestamp
        click_sample_idx = int((click_timestamp * fps) / sample_rate)
        
        # Search around the click timestamp (+/- 20 sampled frames = ~2 seconds)
        search_start = max(0, click_sample_idx - 20)
        search_end = min(len(all_tracks['players']), click_sample_idx + 20)
        
        print(f"  Searching frames {search_start}-{search_end} (click at {click_timestamp:.1f}s)")
        
        # Collect candidates with confidence scores (using permanent IDs)
        candidates = []
        for frame_idx, frame_players in enumerate(all_tracks['players'][search_start:search_end]):
            for permanent_id, player in frame_players.items():
                center = player['center']
                distance = np.sqrt((center[0] - player_pixel_x)**2 + (center[1] - player_pixel_y)**2)
                
                # Confidence based on distance and temporal proximity
                time_proximity = 1.0 - abs(frame_idx - (click_sample_idx - search_start)) / 20.0
                distance_score = max(0, 1.0 - distance / MAX_CLICK_DISTANCE)
                detection_conf = player.get('confidence', 1.0)
                confidence = (distance_score * 0.5 + time_proximity * 0.3 + detection_conf * 0.2)
                
                candidates.append({
                    'permanent_id': permanent_id,
                    'distance': distance,
                    'confidence': confidence,
                    'frame_idx': frame_idx + search_start
                })
        
        if not candidates:
            return {
                'success': False,
                'error': 'Could not identify target player from click position. Try clicking directly on a player.'
            }
        
        # Select best candidate
        best_candidate = max(candidates, key=lambda x: x['confidence'])
        target_permanent_id = best_candidate['permanent_id']
        min_distance = best_candidate['distance']
        best_confidence = best_candidate['confidence']
        
        if min_distance > MAX_CLICK_DISTANCE:
            return {
                'success': False,
                'error': f'Click too far from any player ({min_distance:.1f}px). Try clicking directly on a player.'
            }
        
        print(f"  Target player: Permanent ID {target_permanent_id} (distance: {min_distance:.1f}px, confidence: {best_confidence:.2f})")
        
        # ============================================
        # PHASE 3: Interpolate & Smooth Ball Positions (Enhanced with Kalman)
        # ============================================
        print("⚽ Phase 3: Interpolating and smoothing ball positions...")
        
        ball_positions = []
        ball_confidences = []
        for ball in all_tracks['ball']:
            if ball is not None:
                ball_positions.append(ball['center'])
                ball_confidences.append(ball.get('confidence', 0.5))
            else:
                ball_positions.append([np.nan, np.nan])
                ball_confidences.append(0.0)
        
        # Linear interpolation first
        df_ball = pd.DataFrame(ball_positions, columns=['x', 'y'])
        df_ball = df_ball.interpolate(method='linear', limit_direction='both', limit=BALL_INTERPOLATION_LIMIT)
        df_ball = df_ball.bfill().ffill()
        
        # Apply Kalman filtering for smoother trajectory
        kalman = SimpleKalmanFilter(process_noise=0.1, measurement_noise=1.0)
        smoothed_ball = []
        
        for i, pos in enumerate(df_ball.values):
            if not np.isnan(pos).any():
                smoothed = kalman.update(pos[0], pos[1])
                smoothed_ball.append(smoothed)
            else:
                smoothed_ball.append([np.nan, np.nan])
        
        interpolated_ball = smoothed_ball
        
        missing_count = sum(1 for b in all_tracks['ball'] if b is None)
        print(f"  Interpolated {missing_count} missing ball positions and applied smoothing")
        
        # ============================================
        # PHASE 4: Calculate Player Trajectory & Metrics
        # ============================================
        print("📈 Phase 4: Calculating player trajectory and metrics...")
        
        player_trajectory = []
        for frame_idx, frame_players in enumerate(all_tracks['players']):
            if target_permanent_id in frame_players:
                player = frame_players[target_permanent_id]
                player_trajectory.append(player['center'])
            else:
                player_trajectory.append([np.nan, np.nan])
        
        # Calculate velocities
        player_velocities = calculate_velocity(player_trajectory, fps, VELOCITY_SMOOTHING_WINDOW)
        
        # Calculate distance traveled
        valid_trajectory = [p for p in player_trajectory if not np.isnan(p).any()]
        distance_traveled = calculate_distance_traveled(valid_trajectory)
        
        # Calculate average speed
        speeds = [v['speed'] for v in player_velocities if v['speed'] > 0]
        avg_speed = np.mean(speeds) if speeds else 0.0
        max_speed = np.max(speeds) if speeds else 0.0
        
        print(f"  Distance traveled: {distance_traveled:.1f}px")
        print(f"  Average speed: {avg_speed:.1f} px/s, Max: {max_speed:.1f} px/s")
        
        # ============================================
        # PHASE 5: Find Decision Points (Enhanced)
        # ============================================
        print("🧠 Phase 5: Finding decision points with action classification...")
        
        decision_points = []
        MIN_FRAMES_BETWEEN = int(fps * MIN_FRAMES_BETWEEN_TOUCHES)
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
        
        # Calculate ball velocities for action classification
        ball_velocities = calculate_velocity(interpolated_ball, fps, VELOCITY_SMOOTHING_WINDOW)
        
        for frame_idx, frame_players in enumerate(all_tracks['players']):
            if not frame_players:
                continue
            
            if target_permanent_id not in frame_players:
                continue
            
            player = frame_players[target_permanent_id]
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
                    
                    # Get velocities for action classification
                    player_vel = player_velocities[frame_idx] if frame_idx < len(player_velocities) else {'speed': 0.0, 'velocity': [0.0, 0.0], 'direction': 0.0}
                    ball_vel = ball_velocities[frame_idx] if frame_idx < len(ball_velocities) else None
                    
                    # Classify action
                    action = classify_action(player_center, ball_center, player_vel, ball_vel, distance, zone)
                    
                    decision_points.append({
                        'timestamp': float(round(timestamp, 1)),
                        'frame': int(actual_frame),
                        'zone': zone,
                        'action': action,
                        'player_position': [float(player_center[0]), float(player_center[1])],
                        'ball_position': [float(ball_center[0]), float(ball_center[1])],
                        'distance': float(round(distance, 1)),
                        'player_speed': float(round(player_vel['speed'], 1)),
                        'player_direction': float(round(player_vel['direction'], 1)),
                        'permanent_id': int(target_permanent_id),
                        'track_id': int(player.get('track_id', target_permanent_id)),  # ByteTrack ID at that moment
                        'player_type': player.get('class', 'player')
                    })
                    
                    print(f"  ✓ {action.upper()} at {timestamp:.1f}s in {zone} (speed: {player_vel['speed']:.1f} px/s)")
                    last_touch_frame = actual_frame
        
        print(f"✅ Complete! Found {len(decision_points)} decision points")
        
        # Commit model to volume for caching
        model_volume.commit()
        
        # Calculate action statistics
        action_counts = {}
        for dp in decision_points:
            action = dp.get('action', 'touch')
            action_counts[action] = action_counts.get(action, 0) + 1
        
        return {
            'success': True,
            'decision_points': decision_points,
            'player_analytics': {
                'distance_traveled': float(round(distance_traveled, 1)),
                'average_speed': float(round(avg_speed, 1)),
                'max_speed': float(round(max_speed, 1)),
                'total_touches': len(decision_points),
                'action_breakdown': action_counts,
                'identification_confidence': float(round(best_confidence, 2))
            },
            'trajectory': {
                'positions': [[float(p[0]), float(p[1])] if not np.isnan(p).any() else None 
                             for p in player_trajectory],
                'velocities': player_velocities
            },
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
                'target_permanent_id': int(target_permanent_id),
                'total_players_detected': len(reid_system.get_all_players()),
                'gpu_used': torch.cuda.get_device_name(0) if torch.cuda.is_available() else 'CPU',
                'tracker': 'ByteTrack + Re-ID',
                'model': f'Roboflow {ROBOFLOW_MODEL_ID}',
                'classes': CLASS_NAMES,
                'version': 'v6-enhanced-reid'
            }
        }
    
    finally:
        os.unlink(video_path)


@app.function(
    image=gpu_image,
    timeout=300,
)
@modal.asgi_app()
def fastapi_app():
    """Web endpoint that triggers GPU processing"""
    from fastapi import FastAPI, Request
    from fastapi.responses import JSONResponse
    import requests as http_requests
    
    web_app = FastAPI(title="PitchMind GPU Tracker V6 (Enhanced)")
    
    @web_app.get("/health")
    async def health():
        return {
            "status": "ok",
            "version": "v6-enhanced-reid",
            "model": f"Roboflow {ROBOFLOW_MODEL_ID}",
            "classes": ["ball", "goalkeeper", "player", "referee"],
            "tracker": "ByteTrack + Re-Identification",
            "features": [
                "velocity_calculation",
                "action_classification",
                "kalman_filtering",
                "trajectory_analytics",
                "enhanced_player_identification",
                "permanent_player_ids",
                "appearance_based_reid"
            ]
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
        # Support both parameter names for backward compatibility
        player_x = item.get('player_x') or item.get('click_x')
        player_y = item.get('player_y') or item.get('click_y')
        filename = item.get('filename', 'video.mp4')
        click_timestamp = item.get('click_timestamp', 0.0)
        
        if not all([video_url, player_x is not None, player_y is not None]):
            return JSONResponse({
                'success': False,
                'error': 'Missing required fields: video_url, and (player_x/click_x, player_y/click_y)'
            }, status_code=400)
        
        print(f"📥 Downloading video from: {video_url}")
        print(f"📍 Click at ({player_x}, {player_y}) @ {click_timestamp}s")
        
        try:
            response = http_requests.get(video_url, timeout=300, stream=True)
            response.raise_for_status()
            
            # Stream download for large files
            video_bytes = b''
            for chunk in response.iter_content(chunk_size=8192):
                video_bytes += chunk
            
            print(f"✓ Downloaded {len(video_bytes) / 1024 / 1024:.1f} MB")
        except http_requests.exceptions.Timeout:
            return JSONResponse({
                'success': False,
                'error': 'Video download timed out. Please try again.'
            }, status_code=500)
        except http_requests.exceptions.RequestException as e:
            return JSONResponse({
                'success': False,
                'error': f'Failed to download video: {str(e)}'
            }, status_code=500)
        except Exception as e:
            return JSONResponse({
                'success': False,
                'error': f'Unexpected error during download: {str(e)}'
            }, status_code=500)
        
        try:
            result = track_player_gpu.remote(
                video_bytes,
                float(player_x),
                float(player_y),
                filename,
                float(click_timestamp)
            )
            return JSONResponse(result)
        except modal.exception.NotFoundError:
            return JSONResponse({
                'success': False,
                'error': 'GPU function not found. Please ensure the Modal app is deployed.'
            }, status_code=500)
        except Exception as e:
            import traceback
            error_trace = traceback.format_exc()
            print(f"❌ GPU processing error: {error_trace}")
            return JSONResponse({
                'success': False,
                'error': f'GPU processing failed: {str(e)}'
            }, status_code=500)
    
    return web_app


@app.local_entrypoint()
def test_local():
    """Test entrypoint"""
    print("=" * 50)
    print("PitchMind GPU Tracker V6 (Enhanced for Youth Soccer)")
    print("=" * 50)
    print("")
    print(f"Model: Roboflow {ROBOFLOW_MODEL_ID}")
    print("  - Class 0: ball")
    print("  - Class 1: goalkeeper")
    print("  - Class 2: player")
    print("  - Class 3: referee")
    print("")
    print("Tracker: ByteTrack")
    print("")
    print("Enhanced Features:")
    print("  ✓ Velocity & speed calculations")
    print("  ✓ Kalman filtering for ball trajectory")
    print("  ✓ Action classification (pass, shot, dribble, etc.)")
    print("  ✓ Enhanced player identification with confidence")
    print("  ✓ Player trajectory and distance metrics")
    print("  ✓ Permanent player IDs with re-identification")
    print("  ✓ Appearance-based player matching")
    print("  ✓ Youth soccer optimized analytics")
    print("")
    print("Deploy:")
    print("  modal deploy modal_gpu_worker.py")
    print("")
    print("Endpoint will be:")
    print("  https://YOUR-WORKSPACE--pitchmind-gpu-tracker-v6-fastapi-app.modal.run")
