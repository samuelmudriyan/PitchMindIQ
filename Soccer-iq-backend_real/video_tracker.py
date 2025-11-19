import cv2
from ultralytics import YOLO
import numpy as np
import json
import sys
import os

class SoccerBallTracker:
    def __init__(self, video_path, player_x, player_y):
        self.video_path = video_path
        # Convert percentage to actual coordinates later when we have frame dimensions
        self.player_x_pct = player_x
        self.player_y_pct = player_y
        
        # Load YOLO model (will download on first run)
        print("Loading YOLO model...", file=sys.stderr)
        self.model = YOLO('yolov8n.pt')
        
        self.decision_points = []
        self.THREE_YARDS_PIXELS = 100  # Approximate - will calibrate based on field size
        
    def calculate_distance(self, point1, point2):
        """Euclidean distance between two points"""
        return np.sqrt((point1[0] - point2[0])**2 + (point1[1] - point2[1])**2)
    
    def get_field_third(self, y_position, frame_height):
        """Determine which third of the field"""
        third = frame_height / 3
        if y_position < third:
            return "Attacking Third"
        elif y_position < third * 2:
            return "Middle Third"
        else:
            return "Defensive Third"
    
    def find_player_near_position(self, detections, target_x, target_y):
        """Find the player closest to target position"""
        min_dist = float('inf')
        best_player = None
        
        for detection in detections:
            cls = int(detection['class'])
            # Class 0 = person
            if cls == 0:
                center_x = detection['center_x']
                center_y = detection['center_y']
                
                dist = self.calculate_distance(
                    (center_x, center_y),
                    (target_x, target_y)
                )
                
                if dist < min_dist:
                    min_dist = dist
                    best_player = detection
        
        return best_player, min_dist
    
    def find_ball(self, detections):
        """Find soccer ball in detections"""
        # YOLO classes: 32 = sports ball
        for detection in detections:
            cls = int(detection['class'])
            if cls == 32:  # Sports ball
                return detection
        return None
    
    def analyze_video(self):
        """Main tracking loop"""
        cap = cv2.VideoCapture(self.video_path)
        
        if not cap.isOpened():
            print(f"ERROR: Cannot open video {self.video_path}", file=sys.stderr)
            return []
        
        fps = cap.get(cv2.CAP_PROP_FPS)
        frame_width = int(cap.get(cv2.CAP_PROP_FRAME_WIDTH))
        frame_height = int(cap.get(cv2.CAP_PROP_FRAME_HEIGHT))
        total_frames = int(cap.get(cv2.CAP_PROP_FRAME_COUNT))
        
        print(f"Video: {frame_width}x{frame_height}, {fps} fps, {total_frames} frames", file=sys.stderr)
        
        # Convert player position from percentage to pixels
        player_x = self.player_x_pct * frame_width
        player_y = self.player_y_pct * frame_height
        
        print(f"Tracking player at: ({player_x:.0f}, {player_y:.0f})", file=sys.stderr)
        
        frame_count = 0
        tracked_player_pos = (player_x, player_y)
        
        # Sample every 15 frames (about every 0.5 seconds at 30fps)
        sample_interval = 15
        
        while cap.isOpened():
            ret, frame = cap.read()
            if not ret:
                break
            
            frame_count += 1
            
            # Only process every Nth frame for performance
            if frame_count % sample_interval != 0:
                continue
            
            timestamp = frame_count / fps
            
            # Run YOLO detection
            results = self.model(frame, verbose=False)
            
            # Parse detections
            detections = []
            for result in results:
                boxes = result.boxes
                for box in boxes:
                    cls = int(box.cls[0])
                    conf = float(box.conf[0])
                    x1, y1, x2, y2 = box.xyxy[0].cpu().numpy()
                    
                    detections.append({
                        'class': cls,
                        'confidence': conf,
                        'x1': x1, 'y1': y1, 'x2': x2, 'y2': y2,
                        'center_x': (x1 + x2) / 2,
                        'center_y': (y1 + y2) / 2
                    })
            
            # Find our player
            player, player_dist = self.find_player_near_position(
                detections, 
                tracked_player_pos[0], 
                tracked_player_pos[1]
            )
            
            if player:
                # Update tracked position
                tracked_player_pos = (player['center_x'], player['center_y'])
                
                # Find ball
                ball = self.find_ball(detections)
                
                if ball:
                    # Calculate distance between player and ball
                    ball_center = (ball['center_x'], ball['center_y'])
                    distance = self.calculate_distance(tracked_player_pos, ball_center)
                    
                    print(f"Frame {frame_count}: Player-ball distance = {distance:.1f} px", file=sys.stderr)
                    
                    # Check if ball is within 3 yards
                    if distance < self.THREE_YARDS_PIXELS:
                        field_third = self.get_field_third(tracked_player_pos[1], frame_height)
                        
                        print(f"✓ DECISION POINT at {timestamp:.1f}s in {field_third}", file=sys.stderr)
                        
                        self.decision_points.append({
                            'timestamp': round(timestamp, 2),
                            'player_position': {
                                'x': (tracked_player_pos[0] / frame_width) * 100,
                                'y': (tracked_player_pos[1] / frame_height) * 100
                            },
                            'field_third': field_third,
                            'ball_distance': round(distance, 1),
                            'clip_start': max(0, timestamp - 5),
                            'clip_end': timestamp + 10
                        })
        
        cap.release()
        
        print(f"Found {len(self.decision_points)} decision points", file=sys.stderr)
        
        return self.decision_points

if __name__ == "__main__":
    if len(sys.argv) != 4:
        print("Usage: python video_tracker.py <video_path> <player_x> <player_y>", file=sys.stderr)
        sys.exit(1)
    
    video_path = sys.argv[1]
    player_x = float(sys.argv[2])
    player_y = float(sys.argv[3])
    
    if not os.path.exists(video_path):
        print(f"ERROR: Video file not found: {video_path}", file=sys.stderr)
        sys.exit(1)
    
    tracker = SoccerBallTracker(video_path, player_x, player_y)
    decision_points = tracker.analyze_video()
    
    # Output JSON to stdout
    print(json.dumps(decision_points))
