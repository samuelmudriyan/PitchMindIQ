"""
PitchMind Custom Tracker - Production Modal Worker
Player tracking: YOLO + ByteTrack
Decision point analysis: Claude Vision API
"""

import modal
from typing import Dict, Optional
import json
import sys

app = modal.App("pitchmind-production-tracker")

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
        "uvicorn",
        "anthropic>=0.40.0"
    )
)

COACHING_PROMPT_TEMPLATE = """You are an elite soccer coach analyzing broadcast match footage.
Player being analyzed: {player_label}.

This is a cropped frame from a match. The target player is somewhere in this image (likely near center).

YOUR TASK: Determine if the ball is near or being played by/to this player. If so, analyze the decision.

Look for:
- The ball (round object, often white/yellow/black)
- Whether the ball is within 2-3 meters of the target player
- What decision or action the player makes (or should make)

Respond ONLY with valid JSON (no markdown, no extra text):
{{
  "action": "receive" | "pass" | "shot" | "dribble" | "pressure" | "run" | "header" | "none",
  "description": "one sentence describing what is happening — include ball position relative to player",
  "coaching": "one sentence of elite-level coaching feedback based on professional standards for this position",
  "rating": 1 | 2 | 3 | 4 | 5
}}

Rating guide: 1=poor decision/execution, 3=average, 5=excellent.
Use "none" ONLY if the ball is clearly not near this player in this frame.
If you can see the ball anywhere near the player, always classify the action."""


@app.function(
    image=gpu_image,
    gpu="T4",
    timeout=7200,
    volumes={"/models": model_volume},
    memory=16384,
    min_containers=0,
    secrets=[modal.Secret.from_name("anthropic")]
)
def track_player(
    video_url: str,
    click_x: float,
    click_y: float,
    click_timestamp: float = 0.0,
    player_name: Optional[str] = None,
    jersey_number: Optional[int] = None,
    jersey_color: Optional[str] = None,
) -> Dict:
    import cv2
    import numpy as np
    from ultralytics import YOLO
    import supervision as sv
    import tempfile
    import urllib.request
    import os
    import base64
    import anthropic

    def get_sample_rate(total_frames, fps):
        duration_minutes = (total_frames / fps) / 60
        if duration_minutes < 1:
            return 1
        elif duration_minutes < 5:
            return 3
        elif duration_minutes < 10:
            return 10
        elif duration_minutes < 15:
            return 20
        else:
            return 30

    player_label = player_name if player_name else "the player you clicked on"
    coaching_prompt = COACHING_PROMPT_TEMPLATE.format(player_label=player_label)

    print(f"PitchMind Tracker Starting", file=sys.stderr)
    print(f"  Video: {video_url}", file=sys.stderr)
    print(f"  Click: ({click_x:.1f}%, {click_y:.1f}%) @ {click_timestamp:.1f}s", file=sys.stderr)
    print(f"  Player: {player_label}", file=sys.stderr)

    try:
        # Download video
        print(f"Downloading video...", file=sys.stderr)
        with tempfile.NamedTemporaryFile(delete=False, suffix='.mp4') as tmp:
            urllib.request.urlretrieve(video_url, tmp.name)
            video_path = tmp.name
        print(f"Download complete", file=sys.stderr)

        # Load YOLO
        model_path = "/models/yolov8n.pt"
        if not os.path.exists(model_path):
            print(f"Downloading YOLO model...", file=sys.stderr)
            model = YOLO('yolov8n.pt')
            os.makedirs("/models", exist_ok=True)
            model.save(model_path)
        else:
            model = YOLO(model_path)
        print(f"YOLO ready", file=sys.stderr)

        # ByteTrack
        tracker = sv.ByteTrack(
            track_activation_threshold=0.25,
            lost_track_buffer=60,
            minimum_matching_threshold=0.7,
            frame_rate=30
        )

        # Open video
        cap = cv2.VideoCapture(video_path)
        if not cap.isOpened():
            return {'success': False, 'error': f'Cannot open video: {video_path}'}

        frame_count = int(cap.get(cv2.CAP_PROP_FRAME_COUNT))
        fps = cap.get(cv2.CAP_PROP_FPS)
        width = int(cap.get(cv2.CAP_PROP_FRAME_WIDTH))
        height = int(cap.get(cv2.CAP_PROP_FRAME_HEIGHT))
        duration = frame_count / fps if fps > 0 else 0

        print(f"Video: {width}x{height} @ {fps:.1f}fps  {duration:.1f}s", file=sys.stderr)

        # ROI — adaptive to video height, leaves small margin top/bottom
        ROI_TOP = min(80, int(height * 0.07))
        ROI_BOTTOM = max(height - 30, int(height * 0.93))

        sample_rate = get_sample_rate(frame_count, fps)
        print(f"Sample rate: every {sample_rate} frames", file=sys.stderr)

        # Replay detection
        GREEN_RATIO_THRESHOLD = 0.20
        HIST_DIFF_THRESHOLD = 0.35

        def is_replay(frame, prev_hist):
            hsv = cv2.cvtColor(frame, cv2.COLOR_BGR2HSV)
            mask = cv2.inRange(hsv, (35, 40, 40), (85, 255, 255))
            green_ratio = cv2.countNonZero(mask) / (frame.shape[0] * frame.shape[1])
            hist = cv2.calcHist([frame], [0], None, [64], [0, 256])
            hist = cv2.normalize(hist, hist).flatten()
            hist_diff = 1.0
            if prev_hist is not None:
                hist_diff = cv2.compareHist(prev_hist, hist, cv2.HISTCMP_CORREL)
            return (green_ratio < GREEN_RATIO_THRESHOLD or hist_diff < HIST_DIFF_THRESHOLD), hist

        # Convert click to pixel coordinates
        click_x_px = (click_x / 100) * width
        click_y_px = (click_y / 100) * height

        def hue_dist(h1, h2):
            if h1 is None or h2 is None:
                return 90.0
            d = abs(h1 - h2)
            return min(d, 180.0 - d)

        def region_color(crop, y0, y1, x0=0.1, x1=0.9):
            """Return (hue, sat, val) mean for a vertical slice of a crop. Returns None on failure."""
            h, w = crop.shape[:2]
            if h < 8 or w < 6:
                return None
            r = crop[int(h * y0):int(h * y1), int(w * x0):int(w * x1)]
            if r.size == 0:
                return None
            hsv = cv2.cvtColor(r, cv2.COLOR_BGR2HSV)
            return (float(np.mean(hsv[:, :, 0])),
                    float(np.mean(hsv[:, :, 1])),
                    float(np.mean(hsv[:, :, 2])))

        def sample_appearance(bbox, roi):
            """Extract multi-feature appearance descriptor for re-identification.
            Returns dict with jersey/shorts/boots colors, aspect ratio, and center position."""
            bx1, by1, bx2, by2 = [int(v) for v in bbox]
            crop = roi[by1:by2, bx1:bx2]
            if crop.size == 0:
                return None
            h, w = crop.shape[:2]
            if h < 20 or w < 8:
                return None
            return {
                'jersey': region_color(crop, 0.10, 0.50),   # torso / shirt
                'shorts': region_color(crop, 0.50, 0.72),   # shorts
                'boots':  region_color(crop, 0.80, 1.00),   # boots / socks
                'aspect': h / max(w, 1),                    # body proportions (build)
                'cx': (bx1 + bx2) / 2,
                'cy': (by1 + by2) / 2,
            }

        def appearance_score(target, candidate, time_since_seen):
            """Lower = better match. Returns inf if hard mismatch on jersey color."""
            if target is None or candidate is None:
                return float('inf')

            # --- Jersey: hard gate + weighted score ---
            jt, jc = target.get('jersey'), candidate.get('jersey')
            jersey_hd = hue_dist(jt[0] if jt else None, jc[0] if jc else None)
            if jersey_hd > 35:           # wrong team entirely
                return float('inf')
            score = jersey_hd * 2.5     # most important feature

            # jersey saturation (white vs coloured)
            if jt and jc:
                score += abs(jt[1] - jc[1]) * 0.04

            # --- Shorts color ---
            st, sc_cand = target.get('shorts'), candidate.get('shorts')
            if st and sc_cand:
                score += hue_dist(st[0], sc_cand[0]) * 1.2
                score += abs(st[1] - sc_cand[1]) * 0.03

            # --- Boot / sock color ---
            bt, bc = target.get('boots'), candidate.get('boots')
            if bt and bc:
                score += hue_dist(bt[0], bc[0]) * 0.6
                score += abs(bt[2] - bc[2]) * 0.02   # brightness of boots

            # --- Player build (aspect ratio) ---
            score += abs(target['aspect'] - candidate['aspect']) * 8.0

            # --- Positional continuity (only useful for brief occlusions, not camera cuts) ---
            if time_since_seen < 2.5:
                dx = target['cx'] - candidate['cx']
                dy = target['cy'] - candidate['cy']
                pos_dist = (dx * dx + dy * dy) ** 0.5
                score += pos_dist * 0.05   # soft preference for nearby position

            return score

        # State
        target_player_id = None
        target_appearance = None    # multi-feature appearance descriptor for re-ID
        last_seen_time = -999.0
        last_reacquire_time = -999.0
        player_tracks = []
        frames_for_claude = []   # list of (timestamp, cropped_frame)
        prev_hist = None
        frame_idx = 0
        last_progress = 0
        last_capture_time = -999.0
        CAPTURE_INTERVAL = 1.5   # capture ~1 frame per 1.5s of tracked time
        MAX_FRAMES = 40          # cap to keep latency/cost bounded
        debug_frame_b64 = None   # annotated full frame near click timestamp

        # Only try to lock on within 2 seconds AFTER click_timestamp
        # (all frames before click_timestamp still feed ByteTrack to build stable IDs)
        LOCK_ON_WINDOW = 2.0

        print(f"Processing frames... lock-on target: {click_timestamp:.1f}s ± {LOCK_ON_WINDOW}s", file=sys.stderr)

        while cap.isOpened():
            ret, frame = cap.read()
            if not ret:
                break

            progress = int((frame_idx / max(frame_count, 1)) * 100)
            if progress >= last_progress + 10:
                print(f"  {progress}%", file=sys.stderr)
                last_progress = progress

            if frame_idx % sample_rate != 0:
                frame_idx += 1
                continue

            replay_flag, prev_hist = is_replay(frame, prev_hist)
            if replay_flag:
                frame_idx += 1
                continue

            roi = frame[ROI_TOP:ROI_BOTTOM, :]

            results = model.predict(roi, verbose=False, conf=0.25, classes=[0])

            person_boxes, person_confs = [], []
            if len(results) > 0 and results[0].boxes is not None:
                boxes = results[0].boxes
                for i in range(len(boxes)):
                    box = boxes.xyxy[i].cpu().numpy()
                    conf = float(boxes.conf[i].cpu().numpy())
                    person_boxes.append(box)
                    person_confs.append(conf)

            person_detections = sv.Detections(
                xyxy=np.array(person_boxes) if person_boxes else np.empty((0, 4)),
                confidence=np.array(person_confs) if person_confs else np.empty(0),
                class_id=np.zeros(len(person_boxes), dtype=int) if person_boxes else np.empty(0, dtype=int)
            )

            tracks = tracker.update_with_detections(person_detections)

            current_time = frame_idx / fps

            # Lock onto target player: only try at frames AT or just after click_timestamp
            # This ensures click coordinates match the actual video frame being analyzed
            if target_player_id is None and len(tracks) > 0:
                if current_time >= click_timestamp and current_time <= click_timestamp + LOCK_ON_WINDOW:
                    min_dist = float('inf')
                    best_id = None
                    best_bbox = None
                    for i in range(len(tracks)):
                        bbox = tracks.xyxy[i]
                        cx = (bbox[0] + bbox[2]) / 2
                        cy = (bbox[1] + bbox[3]) / 2
                        dist = np.sqrt(
                            (cx - click_x_px) ** 2 +
                            (cy - max(0, click_y_px - ROI_TOP)) ** 2
                        )
                        if dist < min_dist:
                            min_dist = dist
                            best_id = int(tracks.tracker_id[i])
                            best_bbox = bbox
                    if best_id is not None:
                        target_player_id = best_id
                        last_seen_time = current_time
                        target_appearance = sample_appearance(best_bbox, roi)
                        jersey_hue = target_appearance['jersey'][0] if target_appearance and target_appearance.get('jersey') else '?'
                        print(f"Player locked: ID {target_player_id} dist={min_dist:.0f}px @ {current_time:.1f}s jersey_hue={jersey_hue:.0f}", file=sys.stderr)

                        # Save annotated debug frame showing ALL detections + click point
                        if debug_frame_b64 is None:
                            debug = roi.copy()
                            # Draw all detected players in blue
                            for i in range(len(tracks)):
                                bx1, by1, bx2, by2 = [int(v) for v in tracks.xyxy[i]]
                                tid = int(tracks.tracker_id[i])
                                color = (0, 255, 0) if tid == target_player_id else (255, 100, 0)
                                cv2.rectangle(debug, (bx1, by1), (bx2, by2), color, 2)
                                cv2.putText(debug, f"ID{tid}", (bx1, by1 - 4),
                                            cv2.FONT_HERSHEY_SIMPLEX, 0.5, color, 1)
                            # Draw click position (adjusted for ROI)
                            cx_click = int(click_x_px)
                            cy_click = int(max(0, click_y_px - ROI_TOP))
                            cv2.circle(debug, (cx_click, cy_click), 12, (0, 0, 255), 3)
                            cv2.putText(debug, "CLICK", (cx_click + 14, cy_click),
                                        cv2.FONT_HERSHEY_SIMPLEX, 0.6, (0, 0, 255), 2)
                            # Resize to max 800px wide for reasonable payload size
                            scale = min(1.0, 800 / debug.shape[1])
                            if scale < 1.0:
                                debug = cv2.resize(debug, (int(debug.shape[1]*scale), int(debug.shape[0]*scale)))
                            _, buf = cv2.imencode('.jpg', debug, [cv2.IMWRITE_JPEG_QUALITY, 80])
                            debug_frame_b64 = base64.b64encode(buf.tobytes()).decode('utf-8')

            # Track target player and capture frames for Claude
            target_found_this_frame = False
            if len(tracks) > 0:
                for i in range(len(tracks)):
                    if int(tracks.tracker_id[i]) != target_player_id:
                        continue

                    target_found_this_frame = True
                    last_seen_time = current_time
                    bbox = tracks.xyxy[i]
                    cx = (bbox[0] + bbox[2]) / 2
                    cy = (bbox[1] + bbox[3]) / 2

                    player_tracks.append({
                        'frame': frame_idx,
                        'timestamp': round(current_time, 2),
                        'position': {'x': round(float(cx), 1), 'y': round(float(cy), 1)},
                        'bbox': [float(x) for x in bbox]
                    })

                    # Capture frame for Claude — wide crop so ball & context are visible
                    if (current_time - last_capture_time >= CAPTURE_INTERVAL
                            and len(frames_for_claude) < MAX_FRAMES):
                        bx1, by1, bx2, by2 = bbox
                        # 3x expansion so Claude can see ball and nearby players
                        pad_x = (bx2 - bx1) * 1.5
                        pad_y = (by2 - by1) * 1.5
                        x1 = max(0, int(bx1 - pad_x))
                        y1 = max(0, int(by1 - pad_y))
                        x2 = min(roi.shape[1], int(bx2 + pad_x))
                        y2 = min(roi.shape[0], int(by2 + pad_y))
                        crop = roi[y1:y2, x1:x2]
                        if crop.size > 0:
                            frames_for_claude.append((round(current_time, 2), crop.copy()))
                            last_capture_time = current_time

            # Multi-feature re-identification after camera cuts
            # Uses jersey, shorts, boots colors + player build + positional continuity
            if (target_player_id is not None
                    and not target_found_this_frame
                    and target_appearance is not None
                    and (current_time - last_seen_time) >= 0.5
                    and (current_time - last_reacquire_time) >= 1.0
                    and len(tracks) > 0):
                best_match_id = None
                best_score = float('inf')
                time_gap = current_time - last_seen_time
                for i in range(len(tracks)):
                    candidate = sample_appearance(tracks.xyxy[i], roi)
                    score = appearance_score(target_appearance, candidate, time_gap)
                    if score < best_score:
                        best_score = score
                        best_match_id = int(tracks.tracker_id[i])
                # Accept match if score is reasonable (lower = better)
                if best_match_id is not None and best_score < 80:
                    target_player_id = best_match_id
                    last_seen_time = current_time
                    last_reacquire_time = current_time
                    # Update appearance descriptor with fresh sample
                    for i in range(len(tracks)):
                        if int(tracks.tracker_id[i]) == best_match_id:
                            fresh = sample_appearance(tracks.xyxy[i], roi)
                            if fresh:
                                target_appearance = fresh
                            break
                    print(f"Re-identified (score={best_score:.1f}): ID {target_player_id} @ {current_time:.1f}s gap={time_gap:.1f}s", file=sys.stderr)

            frame_idx += 1

        cap.release()
        try:
            os.unlink(video_path)
        except Exception:
            pass

        print(f"Tracking done — {len(player_tracks)} player frames, {len(frames_for_claude)} frames queued for Claude", file=sys.stderr)

        if not frames_for_claude:
            print("WARNING: Player never found. Check click position.", file=sys.stderr)
            return {
                'success': True,
                'target_player_id': target_player_id,
                'decision_points': [],
                'player_tracks': player_tracks,
                'debug_frame': debug_frame_b64,
                'video_info': {'width': width, 'height': height, 'fps': round(fps, 2),
                               'total_frames': frame_count, 'duration': round(duration, 2)},
                'warning': 'Player not found — try clicking directly on the player at the moment they touch the ball'
            }

        # Claude Vision analysis
        print(f"Sending {len(frames_for_claude)} frames to Claude Vision...", file=sys.stderr)
        claude_client = anthropic.Anthropic()
        decision_points = []

        for ts, crop in frames_for_claude:
            try:
                _, buf = cv2.imencode('.jpg', crop, [cv2.IMWRITE_JPEG_QUALITY, 80])
                b64 = base64.b64encode(buf.tobytes()).decode('utf-8')

                print(f"  Claude analyzing frame @ {ts:.1f}s...", file=sys.stderr)
                response = claude_client.messages.create(
                    model="claude-haiku-4-5-20251001",
                    max_tokens=300,
                    messages=[{
                        "role": "user",
                        "content": [
                            {
                                "type": "image",
                                "source": {"type": "base64", "media_type": "image/jpeg", "data": b64}
                            },
                            {"type": "text", "text": coaching_prompt}
                        ]
                    }]
                )

                raw = response.content[0].text.strip()
                # Strip markdown fences if present
                if raw.startswith("```"):
                    raw = raw.split("```")[1]
                    if raw.startswith("json"):
                        raw = raw[4:]
                analysis = json.loads(raw)

                if analysis.get('action', 'none') != 'none':
                    # Determine field third from player position
                    track_at_ts = next(
                        (t for t in reversed(player_tracks) if t['timestamp'] <= ts),
                        None
                    )
                    y_frac = (track_at_ts['position']['y'] / (ROI_BOTTOM - ROI_TOP)) if track_at_ts else 0.5
                    if y_frac < 0.33:
                        field_third = "Attacking Third"
                    elif y_frac < 0.66:
                        field_third = "Middle Third"
                    else:
                        field_third = "Defensive Third"

                    decision_points.append({
                        'timestamp': ts,
                        'type': analysis.get('action', 'action'),
                        'description': analysis.get('description', ''),
                        'recommendation': analysis.get('coaching', ''),
                        'rating': int(analysis.get('rating', 3)),
                        'field_third': field_third,
                        'clip_start': max(0, ts - 5),
                        'clip_end': min(duration, ts + 10),
                        'player_position': track_at_ts['position'] if track_at_ts else {'x': 50, 'y': 50}
                    })
                    print(f"  Decision point: {analysis.get('action')} @ {ts:.1f}s (rating {analysis.get('rating')})", file=sys.stderr)
                else:
                    print(f"  No action @ {ts:.1f}s", file=sys.stderr)

            except Exception as e:
                print(f"  Claude error @ {ts:.1f}s: {e}", file=sys.stderr)
                continue

        print(f"Analysis complete: {len(decision_points)} decision points found", file=sys.stderr)

        # Build list of crop thumbnails (what Claude saw) for debugging
        crop_thumbnails = []
        for ts, crop in frames_for_claude[:8]:  # first 8 only to keep payload small
            scale = min(1.0, 300 / max(crop.shape[1], 1))
            thumb = cv2.resize(crop, (int(crop.shape[1]*scale), int(crop.shape[0]*scale))) if scale < 1.0 else crop
            _, buf = cv2.imencode('.jpg', thumb, [cv2.IMWRITE_JPEG_QUALITY, 70])
            crop_thumbnails.append({
                'timestamp': ts,
                'image': base64.b64encode(buf.tobytes()).decode('utf-8')
            })

        return {
            'success': True,
            'target_player_id': target_player_id,
            'decision_points': decision_points,
            'player_tracks': player_tracks,
            'debug_frame': debug_frame_b64,
            'crop_thumbnails': crop_thumbnails,
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
        print(f"Error: {e}", file=sys.stderr)
        print(traceback.format_exc(), file=sys.stderr)
        return {'success': False, 'error': str(e), 'stack_trace': traceback.format_exc()}


@app.function(
    image=gpu_image,
    min_containers=0
)
@modal.asgi_app()
def track_webhook():
    from fastapi import FastAPI, Request
    from fastapi.responses import JSONResponse

    web_app = FastAPI()

    @web_app.post("/track")
    async def track_endpoint(request: Request):
        try:
            data = await request.json()

            video_url = data.get('video_url')
            if not video_url:
                return JSONResponse({'success': False, 'error': 'Missing video_url'}, status_code=400)

            result = track_player.remote(
                video_url,
                float(data.get('click_x', 50.0)),
                float(data.get('click_y', 50.0)),
                float(data.get('click_timestamp', 0.0)),
                player_name=data.get('player_name'),
                jersey_number=int(data['jersey_number']) if data.get('jersey_number') else None,
                jersey_color=data.get('jersey_color'),
            )

            return JSONResponse(result)

        except Exception as e:
            return JSONResponse({'success': False, 'error': str(e)}, status_code=500)

    return web_app


@app.local_entrypoint()
def test(video_path: str = "test.mp4", click_x: float = 50.0, click_y: float = 50.0):
    print("Testing tracker...")
    result = track_player.remote(video_path, click_x, click_y)
    print(json.dumps(result, indent=2))
