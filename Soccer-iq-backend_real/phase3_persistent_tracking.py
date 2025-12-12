import os
import sys
import cv2
import numpy as np
from tqdm import tqdm
from ultralytics import YOLO
from deep_sort_realtime.deepsort_tracker import DeepSort

# =============================
# CONFIGURATION
# =============================
VIDEO_PATH = "clips/full_match.mp4"
OUTPUT_PATH = "outputs/full_match_phase3.mp4"
MAX_IDS = 30                     # total players + refs
ROI_TOP, ROI_BOTTOM = 120, 670   # crop to pitch (adjust if needed)
FRAMES_OFF_PITCH_LIMIT = 300     # retire ID if unseen > 5 sec (at 60 fps)
GREEN_RATIO_THRESHOLD = 0.25     # min green ratio for valid frame
HIST_DIFF_THRESHOLD = 0.4        # scene-change threshold
# =============================

# Load YOLOv8 for person detection
model = YOLO("yolov8n.pt")

# Init DeepSORT tracker
tracker = DeepSort(max_age=30, n_init=3, max_cosine_distance=0.2)

# Open video
cap = cv2.VideoCapture(VIDEO_PATH)
if not cap.isOpened():
    sys.exit(f"❌ Could not open video: {VIDEO_PATH}")

frame_count = int(cap.get(cv2.CAP_PROP_FRAME_COUNT))
fps = cap.get(cv2.CAP_PROP_FPS)
width, height = int(cap.get(3)), int(cap.get(4))

fourcc = cv2.VideoWriter_fourcc(*"mp4v")
out = cv2.VideoWriter(OUTPUT_PATH, fourcc, fps, (width, height))

# Track registry
players = {}
next_id = 0
prev_hist = None

print(f"🎥 Frames: {frame_count}  |  FPS: {fps:.0f}")
pbar = tqdm(total=frame_count, desc="Tracking", unit="frame")

def is_replay(frame, prev_hist):
    """Detect replays / non-field frames."""
    hsv = cv2.cvtColor(frame, cv2.COLOR_BGR2HSV)
    mask_green = cv2.inRange(hsv, (35, 40, 40), (85, 255, 255))
    green_ratio = cv2.countNonZero(mask_green) / (frame.shape[0] * frame.shape[1])

    # Histogram comparison
    hist = cv2.calcHist([frame], [0], None, [64], [0, 256])
    hist = cv2.normalize(hist, hist).flatten()
    hist_diff = 1.0
    if prev_hist is not None:
        hist_diff = cv2.compareHist(prev_hist, hist, cv2.HISTCMP_CORREL)

    # Determine replay
    if green_ratio < GREEN_RATIO_THRESHOLD or hist_diff < HIST_DIFF_THRESHOLD:
        return True, hist
    return False, hist


for frame_idx in range(frame_count):
    ret, frame = cap.read()
    if not ret:
        break

    # --- Replay Filter ---
    replay_flag, prev_hist = is_replay(frame, prev_hist)
    if replay_flag:
        pbar.update(1)
        continue  # skip frame

    # --- ROI Crop (focus on field only) ---
    roi = frame[ROI_TOP:ROI_BOTTOM, :]

    # --- Detect people ---
    results = model.predict(roi, verbose=False)
    detections = []
    for box, cls in zip(results[0].boxes.xywh.cpu().numpy(), results[0].boxes.cls.cpu().numpy()):
        if int(cls) != 0:  # keep only "person"
            continue
        x, y, w_box, h_box = box
        detections.append(([x, y, w_box, h_box], 1.0, "person"))

    # --- Update DeepSORT tracker ---
    tracks = tracker.update_tracks(detections, frame=roi)

    # --- Lifecycle + Drawing ---
    for t in tracks:
        if not t.is_confirmed() or t.det_class != "person":
            continue
        tid = t.track_id
        bx = t.to_ltwh()

        # Assign permanent IDs
        if tid not in players:
            if next_id >= MAX_IDS:
                continue
            players[tid] = {"last_seen": frame_idx, "active": True}
            next_id += 1
        else:
            players[tid]["last_seen"] = frame_idx

        x, y, w_box, h_box = map(int, bx)
        cv2.rectangle(roi, (x, y), (x+w_box, y+h_box), (0,255,0), 2)
        cv2.putText(roi, f"ID {tid}", (x, y-10),
                    cv2.FONT_HERSHEY_SIMPLEX, 0.5, (255,255,255), 1)

    # Retire inactive IDs
    for pid in list(players.keys()):
        if frame_idx - players[pid]["last_seen"] > FRAMES_OFF_PITCH_LIMIT:
            players[pid]["active"] = False

    out.write(frame)
    pbar.update(1)

pbar.close()
cap.release()
out.release()

print(f"✅ Done! Saved to {OUTPUT_PATH}")
print(f"👥 Total unique players tracked: {next_id}")
