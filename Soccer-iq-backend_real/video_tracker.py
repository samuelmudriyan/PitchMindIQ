import cv2
from ultralytics import YOLO
import numpy as np
import json
import sys

class SoccerTracker:
    def __init__(self, video_path, player_x, player_y):
        self.video_path = video_path
        self.player_position = (player_x, player_y)
        self.model = YOLO('yolov8n.pt')  # Nano model for speed
        self.decision_points = []
        
    def calculate_distance(self, point1, point2):
        """Calculate Euclidean distance between two points"""
        return np.sqrt((point1[0] - point2[0])**2 + (point1[1] - point2[1])**2)
    
    def get_field_third(self, y_position, frame_height):
        """Determine which third of field (attacking/middle/defensive)"""
        third = frame_height / 3
        if y_position < third:
            return "Attacking Third"
        elif y_position < third * 2:
            return "Middle Third"
        else:
            return "Defensive Third"
    
    def analyze_video(self):
        """Main tracking function"""
        cap = cv2.VideoCapture(self.video_path)
        fps = cap.get(cv2.CAP_PROP_FPS)
        frame_count = 0
        
        while cap.isOpened():
            ret, frame = cap.read()
            if not ret:
                break
            
            frame_count += 1
            timestamp = frame_count / fps
            
            # Run YOLO detection every 5 frames (for performance)
            if frame_count % 5 == 0:
                results = self.model(frame)
                
                # Find player and ball
                player_box = None
                ball_box = None
                
                for result in results:
                    boxes = result.boxes
                    for box in boxes:
                        cls = int(box.cls[0])
                        x1, y1, x2, y2 = box.xyxy[0].cpu().numpy()
                        center_x = (x1 + x2) / 2
                        center_y = (y1 + y2) / 2
                        
                        # Class 0 = person (player)
                        if cls == 0:
                            # Check if this is near our selected player
                            dist = self.calculate_distance(
                                (center_x, center_y),
                                (self.player_position[0] * frame.shape[1], 
                                 self.player_position[1] * frame.shape[0])
                            )
                            if dist < 100:  # Within 100 pixels initially
                                player_box = (center_x, center_y)
                        
                        # Class 32 = sports ball
                        if cls == 32:
                            ball_box = (center_x, center_y)
                
                # Check if ball is within 3 yards (~100 pixels) of player
                if player_box and ball_box:
                    distance = self.calculate_distance(player_box, ball_box)
                    if distance < 100:  # Roughly 3 yards in pixels
                        field_third = self.get_field_third(
                            player_box[1], 
                            frame.shape[0]
                        )
                        
                        self.decision_points.append({
                            'timestamp': timestamp,
                            'player_position': {
                                'x': player_box[0] / frame.shape[1] * 100,
                                'y': player_box[1] / frame.shape[0] * 100
                            },
                            'field_third': field_third,
                            'clip_start': max(0, timestamp - 5),
                            'clip_end': timestamp + 10
                        })
        
        cap.release()
        return self.decision_points

if __name__ == "__main__":
    video_path = sys.argv[1]
    player_x = float(sys.argv[2])
    player_y = float(sys.argv[3])
    
    tracker = SoccerTracker(video_path, player_x, player_y)
    decision_points = tracker.analyze_video()
    
    print(json.dumps(decision_points))
