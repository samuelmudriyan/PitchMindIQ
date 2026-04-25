"""
PitchMind Tracker — Final Merged Version
========================================
Best of V6 + Production + OSNet ReID

Detection:   Roboflow soccer model (ball, goalkeeper, player, referee)
Tracking:    ByteTrack (short-term occlusion handling)
Re-ID:       OSNet-x0_25 via TorchReID (appearance embeddings, EMA updates)
Ball:        Kalman filter + linear interpolation
Analytics:   Velocity, speed, action classification, field zone
Output:      Annotated video + JSON (backend-compatible shape)
"""

import modal
from typing import Dict, List, Optional
import numpy as np

# ── App & Image ───────────────────────────────────────────────────────────────
app = modal.App("pitchmind-tracker-final")

model_volume = modal.Volume.from_name("pitchmind-models-final", create_if_missing=True)

gpu_image = (
    modal.Image.debian_slim(python_version="3.10")
    .apt_install(
        "libgl1-mesa-glx", "libglib2.0-0", "libsm6",
        "libxext6", "libxrender-dev", "libgomp1", "ffmpeg", "git"
    )
    .pip_install(
        "ultralytics>=8.1.0",
        "opencv-python-headless",
        "torch>=2.0.0",
        "torchvision",
        "torchreid==0.2.5",          # OSNet appearance ReID
        "numpy<2.0.0",
        "supervision==0.22.0",
        "pillow",
        "requests",
        "fastapi",
        "uvicorn",
        "pandas",
        "inference",                  # Roboflow inference SDK
        "inference-sdk",
    )
)

# ── Config ────────────────────────────────────────────────────────────────────
ROBOFLOW_API_KEY   = "Flk5MLdPdTNVBChF7f64"
ROBOFLOW_MODEL_ID  = "football-players-detection-3zvbc-t4kql/1"

CLASS_NAMES = {"ball": 0, "goalkeeper": 1, "player": 2, "referee": 3}
CLASS_COLORS = {
    "player":     (0, 200, 255),   # cyan
    "goalkeeper": (0, 255, 100),   # green
    "referee":    (255, 140, 0),   # orange
    "ball":       (255, 255, 0),   # yellow
}

# Thresholds
TOUCH_DISTANCE          = 100    # px — ball-player proximity for decision point
MIN_SECONDS_BETWEEN     = 2.0    # seconds — debounce between decision points
MAX_CLICK_DISTANCE      = 200    # px — max dist from click to nearest player
BALL_INTERP_LIMIT       = 30     # frames — max gap to interpolate ball
VELOCITY_WINDOW         = 5      # frames — smoothing window for velocity
REID_SIM_THRESHOLD      = 0.72   # cosine similarity to match lost player
REID_MAX_LOST_FRAMES    = 90     # frames before dropping a lost track (~3s)
REID_EMA_ALPHA          = 0.3    # learning rate for embedding updates


# ── Kalman Filter (from V6) ───────────────────────────────────────────────────
class SimpleKalmanFilter:
    def __init__(self, process_noise=0.1, measurement_noise=1.0):
        self.q  = process_noise
        self.r  = measurement_noise
        self.x  = None   # [x, y, vx, vy]
        self.P  = None

    def update(self, x, y):
        if self.x is None:
            self.x = np.array([x, y, 0.0, 0.0])
            self.P = np.eye(4) * 100.0
            return [x, y]

        F = np.array([[1,0,1,0],[0,1,0,1],[0,0,1,0],[0,0,0,1]], dtype=float)
        self.x = F @ self.x
        self.P = F @ self.P @ F.T + np.eye(4) * self.q

        H = np.array([[1,0,0,0],[0,1,0,0]], dtype=float)
        z = np.array([x, y])
        y_ = z - H @ self.x
        S  = H @ self.P @ H.T + np.eye(2) * self.r
        K  = self.P @ H.T @ np.linalg.inv(S)
        self.x = self.x + K @ y_
        self.P = (np.eye(4) - K @ H) @ self.P
        return [float(self.x[0]), float(self.x[1])]


# ── OSNet ReID Manager (replaces color-histogram approach from V6) ────────────
class ReIDManager:
    """
    Maintains a gallery of OSNet appearance embeddings per permanent track ID.
    When ByteTrack reassigns a new ID after occlusion, ReID checks the gallery
    and merges back to the original permanent ID if similarity is high enough.
    Uses EMA to keep embeddings fresh over time.
    """
    def __init__(self, reid_model, device):
        self.model   = reid_model
        self.device  = device
        self.gallery: Dict[int, dict] = {}   # perm_id → {emb, lost_since}
        self.id_map:  Dict[int, int]  = {}   # bytetrack_id → perm_id
        self.next_id  = 1

    # ── embedding extraction ──────────────────────────────────────────────────
    def _extract(self, frame, box) -> Optional[np.ndarray]:
        import torch
        from torchvision import transforms

        x1, y1, x2, y2 = [max(0, int(v)) for v in box]
        crop = frame[y1:y2, x1:x2]
        if crop.size == 0:
            return None

        tf = transforms.Compose([
            transforms.ToPILImage(),
            transforms.Resize((256, 128)),
            transforms.ToTensor(),
            transforms.Normalize([0.485, 0.456, 0.406],
                                  [0.229, 0.224, 0.225]),
        ])
        t = tf(crop).unsqueeze(0).to(self.device)
        with torch.no_grad():
            emb = self.model(t).cpu().squeeze().numpy()
        norm = np.linalg.norm(emb)
        return emb / norm if norm > 0 else emb

    def _sim(self, a, b) -> float:
        return float(np.dot(a, b))   # both unit-normalised → cosine similarity

    # ── per-frame update ──────────────────────────────────────────────────────
    def update(self, frame, raw_tracks: List[dict], frame_idx: int) -> List[dict]:
        """
        raw_tracks: [{bytetrack_id, box, class_name, confidence}, ...]
        Returns same list with 'track_id' replaced by canonical permanent ID.
        """
        active_bt_ids = {t["bytetrack_id"] for t in raw_tracks}

        # Mark vanished tracks as lost
        for pid, info in self.gallery.items():
            bt_id = next((b for b, p in self.id_map.items() if p == pid), None)
            if bt_id not in active_bt_ids:
                if info["lost_since"] is None:
                    info["lost_since"] = frame_idx
                elif frame_idx - info["lost_since"] > REID_MAX_LOST_FRAMES:
                    info["expired"] = True   # will prune below

        # Prune expired entries
        expired = [pid for pid, info in self.gallery.items() if info.get("expired")]
        for pid in expired:
            del self.gallery[pid]
            self.id_map = {b: p for b, p in self.id_map.items() if p != pid}

        resolved = []
        for t in raw_tracks:
            bt_id = t["bytetrack_id"]
            box   = t["box"]
            cls   = t["class_name"]

            # Ball: no ReID needed, just pass through
            if cls == "ball":
                resolved.append({**t, "track_id": bt_id})
                continue

            emb = self._extract(frame, box)
            if emb is None:
                perm_id = self.id_map.get(bt_id, self._new_id(bt_id, None, frame_idx))
                resolved.append({**t, "track_id": perm_id})
                continue

            # Already mapped?
            if bt_id in self.id_map:
                perm_id = self.id_map[bt_id]
                info    = self.gallery.get(perm_id)
                if info:
                    info["emb"]        = REID_EMA_ALPHA * emb + (1 - REID_EMA_ALPHA) * info["emb"]
                    info["lost_since"] = None
                resolved.append({**t, "track_id": perm_id})
                continue

            # New ByteTrack ID — search gallery for a match among LOST tracks
            best_pid, best_sim = None, REID_SIM_THRESHOLD
            for pid, info in self.gallery.items():
                if info.get("lost_since") is None:
                    continue   # only match against lost tracks
                sim = self._sim(emb, info["emb"])
                if sim > best_sim:
                    best_sim, best_pid = sim, pid

            if best_pid is not None:
                # Merge: reactivate old permanent ID
                self.id_map[bt_id] = best_pid
                info = self.gallery[best_pid]
                info["emb"]        = REID_EMA_ALPHA * emb + (1 - REID_EMA_ALPHA) * info["emb"]
                info["lost_since"] = None
                perm_id = best_pid
            else:
                perm_id = self._new_id(bt_id, emb, frame_idx)

            resolved.append({**t, "track_id": perm_id})

        return resolved

    def _new_id(self, bt_id, emb, frame_idx):
        perm_id = self.next_id
        self.next_id += 1
        self.id_map[bt_id] = perm_id
        self.gallery[perm_id] = {
            "emb": emb if emb is not None else np.zeros(512),
            "lost_since": None,
        }
        return perm_id

    def total_unique(self):
        return self.next_id - 1


# ── Analytics helpers (from V6) ───────────────────────────────────────────────
def calculate_velocity(positions, fps, window=VELOCITY_WINDOW):
    velocities = []
    for i in range(len(positions)):
        if i == 0:
            velocities.append({"speed": 0.0, "velocity": [0.0, 0.0], "direction": 0.0})
            continue
        start = max(0, i - window)
        p0    = np.array(positions[start])
        p1    = np.array(positions[i])
        dt    = (i - start) / fps
        if dt > 0 and not (np.isnan(p0).any() or np.isnan(p1).any()):
            vx, vy = (p1 - p0) / dt
            speed  = float(np.hypot(vx, vy))
            direction = float(np.degrees(np.arctan2(vy, vx)) % 360)
        else:
            vx, vy, speed, direction = 0.0, 0.0, 0.0, 0.0
        velocities.append({"speed": speed, "velocity": [float(vx), float(vy)], "direction": direction})
    return velocities


def classify_action(player_pos, ball_pos, player_vel, ball_vel, distance, zone):
    if distance > TOUCH_DISTANCE:
        return "touch"
    speed = player_vel.get("speed", 0.0)
    if ball_vel:
        ball_speed = np.hypot(*ball_vel.get("velocity", [0, 0]))
        if ball_speed > 50:
            return "shot" if zone == "Attacking Third" and ball_speed > 100 else "pass"
    if speed > 30 and distance < 50:
        return "dribble"
    if speed < 15 and distance < 60:
        return "reception"
    return "touch"


def field_zone(y_px, height):
    t = height / 3
    if y_px < t:       return "Defensive Third"
    elif y_px < t * 2: return "Middle Third"
    else:              return "Attacking Third"


def is_replay(frame, prev_hist):
    import cv2
    hsv  = cv2.cvtColor(frame, cv2.COLOR_BGR2HSV)
    mask = cv2.inRange(hsv, (35, 40, 40), (85, 255, 255))
    green_ratio = cv2.countNonZero(mask) / (frame.shape[0] * frame.shape[1])
    hist = cv2.calcHist([frame], [0], None, [64], [0, 256])
    hist = cv2.normalize(hist, hist).flatten()
    hist_diff = cv2.compareHist(prev_hist, hist, cv2.HISTCMP_CORREL) if prev_hist is not None else 1.0
    return (green_ratio < 0.25 or hist_diff < 0.4), hist


def get_sample_rate(total_frames, fps):
    mins = (total_frames / fps) / 60
    if mins < 5:   return 5
    if mins < 10:  return 10
    if mins < 15:  return 20
    return 30


# ── Main GPU function ─────────────────────────────────────────────────────────
@app.function(
    image=gpu_image,
    gpu="T4",
    timeout=7200,
    memory=16384,
    volumes={"/models": model_volume},
    min_containers=0,
)
def track_player(
    video_url: str,
    click_x: float,              # percentage 0–100
    click_y: float,              # percentage 0–100
    click_timestamp: float = 0.0,
    output_video: bool = True,
    jersey_color: Optional[str] = None,   # hex e.g. "#ef4444"
    jersey_number: Optional[int] = None,
    player_name: Optional[str] = None,
) -> Dict:
    import cv2, tempfile, os, sys, urllib.request
    import torch
    import torchreid
    import supervision as sv
    import pandas as pd
    from inference import get_model

    os.environ["ROBOFLOW_API_KEY"] = ROBOFLOW_API_KEY
    device = "cuda" if torch.cuda.is_available() else "cpu"
    print(f"[tracker] Device: {device}", file=sys.stderr)

    # ── Download video (chunked + resumable for large files) ─────────────────
    print(f"[tracker] Downloading: {video_url}", file=sys.stderr)
    import time as _time
    import requests as _requests

    def _download(url, dest, max_retries=5, chunk_mb=8):
        chunk = chunk_mb * 1024 * 1024
        downloaded = 0
        for attempt in range(max_retries):
            try:
                headers = {"Range": f"bytes={downloaded}-"} if downloaded else {}
                with _requests.get(url, headers=headers, stream=True, timeout=300) as r:
                    r.raise_for_status()
                    mode = "ab" if downloaded else "wb"
                    with open(dest, mode) as fh:
                        for block in r.iter_content(chunk_size=chunk):
                            if block:
                                fh.write(block)
                                downloaded += len(block)
                return
            except Exception as exc:
                print(f"[tracker] Download attempt {attempt+1} failed: {exc}", file=sys.stderr)
                if attempt == max_retries - 1:
                    raise
                _time.sleep(2 ** attempt)

    tmp_video = tempfile.NamedTemporaryFile(delete=False, suffix=".mp4")
    tmp_video.close()
    video_path = tmp_video.name
    _download(video_url, video_path)
    size_mb = os.path.getsize(video_path) / (1024 * 1024)
    print(f"[tracker] Downloaded {size_mb:.1f} MB", file=sys.stderr)

    # ── Load models ───────────────────────────────────────────────────────────
    roboflow_model = get_model(model_id=ROBOFLOW_MODEL_ID)
    print(f"[tracker] Roboflow model loaded", file=sys.stderr)

    reid_backbone = torchreid.models.build_model(
        name="osnet_x0_25", num_classes=1000, pretrained=True
    ).to(device).eval()
    reid_mgr = ReIDManager(reid_backbone, device)
    print(f"[tracker] OSNet ReID loaded", file=sys.stderr)

    tracker = sv.ByteTrack(
        track_activation_threshold=0.25,
        lost_track_buffer=60,
        minimum_matching_threshold=0.7,
        frame_rate=30,
    )

    # ── Video setup ───────────────────────────────────────────────────────────
    cap    = cv2.VideoCapture(video_path)
    fps    = cap.get(cv2.CAP_PROP_FPS) or 30
    width  = int(cap.get(cv2.CAP_PROP_FRAME_WIDTH))
    height = int(cap.get(cv2.CAP_PROP_FRAME_HEIGHT))
    total  = int(cap.get(cv2.CAP_PROP_FRAME_COUNT))
    dur    = total / fps

    sample_rate  = get_sample_rate(total, fps)
    click_x_px   = (click_x / 100) * width
    click_y_px   = (click_y / 100) * height
    ROI_TOP, ROI_BOTTOM = 120, min(height, 670)

    print(f"[tracker] {width}x{height} @ {fps}fps | {total} frames | sample_rate={sample_rate}", file=sys.stderr)
    print(f"[tracker] Click pixel: ({click_x_px:.0f}, {click_y_px:.0f})", file=sys.stderr)

    # Video writer setup
    tmp_out = None
    writer  = None
    if output_video:
        tmp_out = "/tmp/tracked_output.mp4"
        writer  = cv2.VideoWriter(
            tmp_out, cv2.VideoWriter_fourcc(*"mp4v"), fps, (width, height)
        )

    # ── Storage ───────────────────────────────────────────────────────────────
    # per sampled-frame lists (index = sampled frame count)
    sampled_players: List[Dict] = []   # perm_id → player dict
    sampled_ball:    List       = []   # None or {center, confidence}
    prev_hist = None
    sampled_idx = 0
    frame_idx   = 0
    last_prog   = 0

    # ── PHASE 1: Detection + Tracking ─────────────────────────────────────────
    print("[tracker] Phase 1: Detection & tracking...", file=sys.stderr)

    while cap.isOpened():
        ret, frame = cap.read()
        if not ret:
            break

        frame_idx += 1
        prog = int((frame_idx / total) * 100)
        if prog >= last_prog + 10:
            print(f"  {prog}%", file=sys.stderr)
            last_prog = prog

        # Skip non-sampled frames (still write original to output video)
        if frame_idx % sample_rate != 0:
            if writer:
                writer.write(frame)
            sampled_players.append({})
            sampled_ball.append(None)
            continue

        # Skip replays
        replay, prev_hist = is_replay(frame, prev_hist)
        if replay:
            if writer:
                writer.write(frame)
            sampled_players.append({})
            sampled_ball.append(None)
            continue

        # Roboflow inference on ROI
        roi = frame[ROI_TOP:ROI_BOTTOM, :]
        results = roboflow_model.infer(roi)[0]

        boxes_arr, confs_arr, cls_arr = [], [], []
        for pred in results.predictions:
            x1 = pred.x - pred.width  / 2
            y1 = pred.y - pred.height / 2
            x2 = pred.x + pred.width  / 2
            y2 = pred.y + pred.height / 2
            boxes_arr.append([x1, y1, x2, y2])
            confs_arr.append(pred.confidence)
            cls_arr.append(CLASS_NAMES.get(pred.class_name.lower(), 2))

        if boxes_arr:
            all_det = sv.Detections(
                xyxy=np.array(boxes_arr),
                confidence=np.array(confs_arr),
                class_id=np.array(cls_arr),
            )
        else:
            all_det = sv.Detections.empty()

        # Separate ball from players
        ball_mask   = all_det.class_id == CLASS_NAMES["ball"]
        player_mask = ~ball_mask
        player_det  = all_det[player_mask]
        ball_det    = all_det[ball_mask]

        # ByteTrack on players
        tracked = tracker.update_with_detections(player_det)

        # Build raw_tracks for ReID
        raw_tracks = []
        if tracked.tracker_id is not None:
            for i, bt_id in enumerate(tracked.tracker_id):
                bbox = tracked.xyxy[i].tolist()
                # Adjust bbox back to full-frame coords
                bbox[1] += ROI_TOP; bbox[3] += ROI_TOP
                cls_id   = int(tracked.class_id[i]) if tracked.class_id is not None else CLASS_NAMES["player"]
                cls_name = next((k for k, v in CLASS_NAMES.items() if v == cls_id), "player")
                raw_tracks.append({
                    "bytetrack_id": int(bt_id),
                    "box":          bbox,
                    "class_name":   cls_name,
                    "confidence":   float(tracked.confidence[i]) if tracked.confidence is not None else 1.0,
                })

        # ReID pass — resolve permanent IDs
        resolved = reid_mgr.update(frame, raw_tracks, frame_idx)

        # Store frame players
        frame_players = {}
        for t in resolved:
            pid  = t["track_id"]
            bbox = t["box"]
            cx   = (bbox[0] + bbox[2]) / 2
            cy   = (bbox[1] + bbox[3]) / 2
            frame_players[pid] = {
                "center":     [cx, cy],
                "box":        bbox,
                "class_name": t["class_name"],
                "confidence": t["confidence"],
                "bytetrack_id": t["bytetrack_id"],
            }
        sampled_players.append(frame_players)

        # Store ball (best confidence, full-frame coords)
        if len(ball_det) > 0:
            best = int(ball_det.confidence.argmax())
            bb   = ball_det.xyxy[best].tolist()
            bb[1] += ROI_TOP; bb[3] += ROI_TOP
            sampled_ball.append({
                "center": [(bb[0]+bb[2])/2, (bb[1]+bb[3])/2],
                "confidence": float(ball_det.confidence[best]),
            })
        else:
            sampled_ball.append(None)

        # Annotate and write frame
        if writer:
            ann = frame.copy()
            for t in resolved:
                if t["class_name"] == "ball":
                    continue
                x1, y1, x2, y2 = [int(v) for v in t["box"]]
                color = CLASS_COLORS.get(t["class_name"], (200,200,200))
                label = f"{t['class_name']} #{t['track_id']}"
                cv2.rectangle(ann, (x1,y1), (x2,y2), color, 2)
                (tw, th), _ = cv2.getTextSize(label, cv2.FONT_HERSHEY_SIMPLEX, 0.5, 1)
                cv2.rectangle(ann, (x1, y1-th-6), (x1+tw+4, y1), color, -1)
                cv2.putText(ann, label, (x1+2, y1-4), cv2.FONT_HERSHEY_SIMPLEX, 0.5, (0,0,0), 1)
            if len(ball_det) > 0 and sampled_ball[-1]:
                bc = sampled_ball[-1]["center"]
                cv2.circle(ann, (int(bc[0]), int(bc[1])), 8, CLASS_COLORS["ball"], -1)
            writer.write(ann)

        sampled_idx += 1

    cap.release()
    if writer:
        writer.release()
    print(f"[tracker] Phase 1 done. {reid_mgr.total_unique()} unique players.", file=sys.stderr)

    # ── PHASE 2: Identify clicked player ─────────────────────────────────────
    print("[tracker] Phase 2: Identifying clicked player...", file=sys.stderr)

    # Parse jersey color hint into BGR for OpenCV comparison
    def hex_to_bgr(hex_str):
        """Convert hex color '#rrggbb' → (B, G, R) numpy array."""
        h = hex_str.lstrip('#')
        if len(h) != 6:
            return None
        r, g, b = int(h[0:2], 16), int(h[2:4], 16), int(h[4:6], 16)
        return np.array([b, g, r], dtype=np.float32)

    def jersey_color_score(frame, box, target_bgr, threshold=60):
        """
        Compare dominant color of player crop to target jersey color.
        Returns 0.0–1.0 (1.0 = perfect match).
        """
        if target_bgr is None:
            return 0.5  # neutral when no hint given
        x1, y1, x2, y2 = [max(0, int(v)) for v in box]
        crop = frame[y1:y2, x1:x2]
        if crop.size == 0:
            return 0.5
        # Sample center strip of the crop (torso area)
        ch, cw = crop.shape[:2]
        torso = crop[ch//4 : 3*ch//4, cw//4 : 3*cw//4]
        if torso.size == 0:
            torso = crop
        mean_color = torso.reshape(-1, 3).mean(axis=0)
        dist = float(np.linalg.norm(mean_color - target_bgr))
        return max(0.0, 1.0 - dist / threshold)

    target_bgr = hex_to_bgr(jersey_color) if jersey_color else None
    if target_bgr is not None:
        print(f"[tracker] Jersey color hint: {jersey_color} → BGR {target_bgr}", file=sys.stderr)

    # Find the frame closest to click_timestamp for color sampling
    click_sample_idx = int((click_timestamp * fps) / sample_rate)
    search_start     = max(0, click_sample_idx - 20)
    search_end       = min(len(sampled_players), click_sample_idx + 20)

    # Re-open video to sample the click frame for color scoring
    cap_check = cv2.VideoCapture(video_path)
    click_frame_img = None
    if cap_check.isOpened():
        target_frame_num = max(1, click_sample_idx * sample_rate)
        cap_check.set(cv2.CAP_PROP_POS_FRAMES, target_frame_num - 1)
        ret_c, click_frame_img = cap_check.read()
        cap_check.release()

    candidates = []
    for fi, frame_players in enumerate(sampled_players[search_start:search_end]):
        for pid, pdata in frame_players.items():
            cx, cy = pdata["center"]
            dist        = np.hypot(cx - click_x_px, cy - click_y_px)
            time_prox   = 1.0 - abs(fi - (click_sample_idx - search_start)) / 20.0
            dist_score  = max(0.0, 1.0 - dist / MAX_CLICK_DISTANCE)
            det_conf    = pdata.get("confidence", 1.0)

            # Jersey color score (only at frames near click time for speed)
            color_score = 0.5
            if click_frame_img is not None and abs(fi - (click_sample_idx - search_start)) <= 3:
                color_score = jersey_color_score(click_frame_img, pdata["box"], target_bgr)

            # Weighted composite: distance is most important, then time, color, detection conf
            if target_bgr is not None:
                score = dist_score * 0.45 + time_prox * 0.25 + color_score * 0.20 + det_conf * 0.10
            else:
                score = dist_score * 0.50 + time_prox * 0.30 + det_conf * 0.20

            candidates.append({"pid": pid, "dist": dist, "score": score, "color_score": color_score})

    if not candidates:
        return {"success": False, "error": "Could not find any players near click position."}

    best = max(candidates, key=lambda c: c["score"])
    if best["dist"] > MAX_CLICK_DISTANCE:
        return {"success": False, "error": f"Click too far from any player ({best['dist']:.0f}px). Click directly on a player."}

    target_pid  = best["pid"]
    id_conf     = round(best["score"], 2)
    print(f"[tracker] Target permanent ID: {target_pid} (score={id_conf}, color={best['color_score']:.2f})", file=sys.stderr)

    # ── PHASE 3: Ball interpolation + Kalman smoothing ───────────────────────
    print("[tracker] Phase 3: Ball smoothing...", file=sys.stderr)

    raw_ball = [b["center"] if b else [np.nan, np.nan] for b in sampled_ball]
    df_ball  = pd.DataFrame(raw_ball, columns=["x", "y"])
    df_ball  = df_ball.interpolate(method="linear", limit_direction="both", limit=BALL_INTERP_LIMIT)
    df_ball  = df_ball.bfill().ffill()

    kalman = SimpleKalmanFilter()
    smooth_ball = []
    for pos in df_ball.values:
        if not np.isnan(pos).any():
            smooth_ball.append(kalman.update(pos[0], pos[1]))
        else:
            smooth_ball.append([np.nan, np.nan])

    # ── PHASE 4: Player trajectory & velocity ────────────────────────────────
    print("[tracker] Phase 4: Trajectory & velocity...", file=sys.stderr)

    trajectory = []
    for fp in sampled_players:
        if target_pid in fp:
            trajectory.append(fp[target_pid]["center"])
        else:
            trajectory.append([np.nan, np.nan])

    player_vels = calculate_velocity(trajectory, fps, VELOCITY_WINDOW)
    ball_vels   = calculate_velocity(smooth_ball, fps, VELOCITY_WINDOW)

    valid_traj  = [p for p in trajectory if not np.isnan(p).any()]
    dist_px     = sum(
        np.linalg.norm(np.array(valid_traj[i]) - np.array(valid_traj[i-1]))
        for i in range(1, len(valid_traj))
    ) if len(valid_traj) > 1 else 0.0
    speeds      = [v["speed"] for v in player_vels if v["speed"] > 0]
    avg_speed   = float(np.mean(speeds)) if speeds else 0.0
    max_speed   = float(np.max(speeds))  if speeds else 0.0

    # ── PHASE 5: Decision points ──────────────────────────────────────────────
    print("[tracker] Phase 5: Decision points...", file=sys.stderr)

    decision_points = []
    player_tracks   = []    # full trajectory for backend
    min_frames      = int(fps * MIN_SECONDS_BETWEEN / sample_rate)
    last_dp_frame   = -min_frames
    action_counts   = {}

    for si, frame_players in enumerate(sampled_players):
        actual_frame = si * sample_rate
        timestamp    = actual_frame / fps

        if target_pid not in frame_players:
            continue

        pdata = frame_players[target_pid]
        cx, cy = pdata["center"]

        # Player track for backend
        player_tracks.append({
            "frame":     actual_frame,
            "timestamp": round(timestamp, 2),
            "position":  {
                "x": round((cx / width)  * 100, 1),
                "y": round((cy / height) * 100, 1),
            },
            "bbox": pdata["box"],
        })

        # Decision point check
        ball = smooth_ball[si]
        if np.isnan(ball).any():
            continue

        dist = np.hypot(cx - ball[0], cy - ball[1])
        if dist < TOUCH_DISTANCE and si - last_dp_frame >= min_frames:
            zone    = field_zone(cy, height)
            p_vel   = player_vels[si] if si < len(player_vels) else {"speed": 0, "velocity": [0,0], "direction": 0}
            b_vel   = ball_vels[si]   if si < len(ball_vels)   else None
            action  = classify_action(
                np.array([cx, cy]), np.array(ball),
                p_vel, b_vel, dist, zone
            )
            action_counts[action] = action_counts.get(action, 0) + 1

            decision_points.append({
                # Backend-compatible keys
                "timestamp":       round(timestamp, 2),
                "frame":           actual_frame,
                "player_position": {
                    "x": round((cx / width)  * 100, 1),
                    "y": round((cy / height) * 100, 1),
                },
                "field_third":     zone,
                "ball_distance":   round(float(dist), 1),
                "clip_start":      max(0, timestamp - 5),
                "clip_end":        min(dur, timestamp + 10),
                # Extended analytics
                "action":          action,
                "player_speed":    round(p_vel["speed"], 1),
                "player_direction": round(p_vel["direction"], 1),
                "permanent_id":    int(target_pid),
                "player_type":     pdata["class_name"],
            })
            print(f"  ✓ {action.upper()} @ {timestamp:.1f}s | {zone}", file=sys.stderr)
            last_dp_frame = si

    # Fallback: movement-based points if no ball touches found
    if not decision_points and len(player_tracks) > 10:
        print("[tracker] No ball touches found — adding movement-based fallback points", file=sys.stderr)
        step = max(1, len(player_tracks) // 5)
        for tr in player_tracks[10::step]:
            decision_points.append({
                "timestamp":    tr["timestamp"],
                "frame":        tr["frame"],
                "player_position": tr["position"],
                "field_third":  "Middle Third",
                "ball_distance": None,
                "clip_start":   max(0, tr["timestamp"] - 5),
                "clip_end":     min(dur, tr["timestamp"] + 10),
                "action":       "movement",
                "player_speed": 0.0,
                "player_direction": 0.0,
                "permanent_id": int(target_pid),
                "player_type":  "player",
            })

    # ── Read output video bytes ───────────────────────────────────────────────
    output_video_bytes = None
    if output_video and tmp_out and os.path.exists(tmp_out):
        with open(tmp_out, "rb") as f:
            output_video_bytes = f.read()
        os.unlink(tmp_out)

    model_volume.commit()
    os.unlink(video_path)

    print(f"[tracker] Done. {len(decision_points)} decision points.", file=sys.stderr)

    return {
        "success":          True,
        # ── Backend-compatible keys ──────────────────────────────────────────
        "target_player_id":  int(target_pid),       # kept for backend compat
        "target_permanent_id": int(target_pid),
        "decision_points":  decision_points,
        "player_tracks":    player_tracks,
        "video_info": {
            "width":        width,
            "height":       height,
            "fps":          round(fps, 2),
            "total_frames": total,
            "duration":     round(dur, 2),
        },
        # ── Extended analytics ───────────────────────────────────────────────
        "player_analytics": {
            "distance_traveled":        round(dist_px, 1),
            "average_speed":            round(avg_speed, 1),
            "max_speed":                round(max_speed, 1),
            "total_touches":            len(decision_points),
            "action_breakdown":         action_counts,
            "identification_confidence": id_conf,
            "jersey_color_used":        jersey_color,
            "jersey_number":            jersey_number,
            "player_name":              player_name,
        },
        "trajectory": {
            "positions":   [[float(p[0]), float(p[1])] if not np.isnan(p).any() else None for p in trajectory],
            "velocities":  player_vels,
        },
        "processing_info": {
            "tracker":        "ByteTrack + OSNet ReID",
            "detection_model": f"Roboflow {ROBOFLOW_MODEL_ID}",
            "sample_rate":    sample_rate,
            "total_unique_players": reid_mgr.total_unique(),
            "gpu":            torch.cuda.get_device_name(0) if torch.cuda.is_available() else "CPU",
            "version":        "final-merged",
        },
        # ── Annotated video (optional) ───────────────────────────────────────
        "annotated_video_bytes": output_video_bytes,
    }


# ── FastAPI endpoint (drop-in replacement for production tracker) ─────────────
@app.function(image=gpu_image, min_containers=0)
@modal.asgi_app()
def track_webhook():
    from fastapi import FastAPI, Request
    from fastapi.responses import JSONResponse

    web_app = FastAPI(title="PitchMind Tracker — Final")

    @web_app.get("/health")
    async def health():
        return {
            "status": "ok",
            "version": "final-merged",
            "model":   f"Roboflow {ROBOFLOW_MODEL_ID}",
            "tracker": "ByteTrack + OSNet ReID",
            "classes": list(CLASS_NAMES.keys()),
        }

    @web_app.post("/track")
    async def track_endpoint(request: Request):
        try:
            data = await request.json()
        except Exception as e:
            return JSONResponse({"success": False, "error": f"Invalid JSON: {e}"}, status_code=400)

        video_url       = data.get("video_url")
        click_x         = float(data.get("click_x", 50.0))
        click_y         = float(data.get("click_y", 50.0))
        click_timestamp = float(data.get("click_timestamp", 0.0))
        output_video    = bool(data.get("output_video", False))
        jersey_color    = data.get("jersey_color", None)   # hex string e.g. "#ef4444"
        jersey_number   = data.get("jersey_number", None)  # int or None
        player_name     = data.get("player_name", None)

        if not video_url:
            return JSONResponse({"success": False, "error": "Missing video_url"}, status_code=400)

        try:
            result = track_player.remote(
                video_url, click_x, click_y, click_timestamp, output_video,
                jersey_color, jersey_number, player_name
            )
            if not output_video:
                result.pop("annotated_video_bytes", None)
            return JSONResponse(result)
        except Exception as e:
            import traceback
            print(traceback.format_exc())
            return JSONResponse({"success": False, "error": str(e)}, status_code=500)

    return web_app


# ── Local test entrypoint ─────────────────────────────────────────────────────
@app.local_entrypoint()
def test(video_url: str, click_x: float = 50.0, click_y: float = 50.0, click_timestamp: float = 0.0):
    """
    modal run pitchmind_tracker_final.py \
        --video-url "https://your-backend/uploads/video.mp4" \
        --click-x 45.2 --click-y 60.1 --click-timestamp 12.5
    """
    import json
    result = track_player.remote(video_url, click_x, click_y, click_timestamp, output_video=False)
    result.pop("annotated_video_bytes", None)
    print(json.dumps(result, indent=2))
