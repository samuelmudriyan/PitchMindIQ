"""
PitchMind IQ - Modal GPU Worker V8 ("AFA engine")
=================================================

Detection, tracking, re-ID and pitch calibration are powered by
"AI Football Analytics" by Mohamed Wael:
    https://github.com/Mhmdwael77/ai-football-analytics
    Copyright (c) 2026 Mohamed Wael. All Rights Reserved.
    Used in PitchMind IQ with the copyright owner's written permission.
    That engine's code and weights are NOT relicensed by this file.

What this worker does
---------------------
1. Downloads the game video and re-encodes it to 10-15 fps (keeps long games fast).
2. Runs Wael's engine stages head-less:
     YOLO11m detection -> BoT-SORT tracking -> ID stitching -> ID-swap fix
     -> fixed squad numbers (roster) -> team/role discovery
     -> automatic pitch calibration (homography) -> field positions in metres
     -> speed/distance, player ratings, tactics, possession, match report
   (His desktop Tkinter review step is skipped - it cannot run on a server.)
3. Converts everything to PitchMind's format. The response keeps EVERY V7 key
   (decision_points, player_analytics, trajectory, video_metadata,
   processing_info) so the Railway backend needs no code changes.

Units changed vs V7:  distances are METRES, speeds are KM/H (V7 used pixels).
If the camera never shows enough pitch lines, calibration fails and the worker
falls back to pixel mode (units are reported in processing_info).

Deploy:   modal deploy modal_gpu_worker_v8.py
Then set Railway env var MODAL_WEBHOOK_URL to the new *-v8-fastapi-app URL.
Roll back any time by setting it to the old V7 URL.
"""

import modal
from typing import Dict, List, Optional, Tuple

# ---------------------------------------------------------------------------
# Engine source (pinned so a change in his repo can never break production)
# ---------------------------------------------------------------------------
AFA_REPO = "https://github.com/Mhmdwael77/ai-football-analytics.git"
AFA_COMMIT = "1834cc063fb72e914a4aa680b0a3a1527f25bc8c"
AFA_RELEASE = "https://github.com/Mhmdwael77/ai-football-analytics/releases/download/v1.0.0"
AFA_DIR = "/opt/afa"

VERSION = "v8-afa-engine"

app = modal.App("pitchmind-gpu-tracker-v8")

gpu_image = (
    modal.Image.debian_slim(python_version="3.11")
    .apt_install(
        "git", "curl", "ffmpeg",
        "libgl1", "libglib2.0-0", "libsm6", "libxext6", "libxrender1", "libgomp1",
    )
    .pip_install(
        "ultralytics>=8.3.0",
        "opencv-python-headless>=4.9.0",
        "numpy>=1.26.0,<2.3",
        "PyYAML>=6.0",
        "lap>=0.5.12",
        "requests",
    )
    .run_commands(
        f"git clone {AFA_REPO} {AFA_DIR}",
        f"cd {AFA_DIR} && git checkout {AFA_COMMIT}",
        f"curl -fL --retry 3 -o {AFA_DIR}/weights/best.pt {AFA_RELEASE}/best.pt",
        f"curl -fL --retry 3 -o '{AFA_DIR}/weights/pitch_keypoints_yolo11m_best.pt.pt' "
        f"'{AFA_RELEASE}/pitch_keypoints_yolo11m_best.pt.pt'",
    )
)

web_image = modal.Image.debian_slim(python_version="3.11").pip_install("fastapi[standard]")

# ---------------------------------------------------------------------------
# Tunables
# ---------------------------------------------------------------------------
FULL_PITCH_LENGTH_M = 105.0      # the engine's calibration template
FULL_PITCH_WIDTH_M = 68.0
POSSESS_DIST_M = 2.0             # ball within this of a player = on the ball
POSSESS_DIST_FRAC = 0.025        # same, as a fraction of frame width (pixel mode)
POSSESSION_GAP_S = 0.6           # a player keeps possession across short ball-loss gaps
BALL_INTERP_MAX_GAP_S = 1.0      # fill missing ball positions across gaps up to this
NEXT_POSSESSION_WINDOW_S = 4.0   # look this far ahead to see where the ball went
DRIBBLE_MIN_CARRY_M = 8.0        # carry distance that counts as a dribble
SHOT_MIN_BALL_SPEED_KMH = 35.0   # youth-friendly shot speed threshold
SHOT_GOAL_ZONE_M = 14.0          # ball must finish this close to the goal line
CLICK_SEARCH_WINDOW_S = 2.0      # look this far around the click time for the player
MAX_CLICK_DIST_FRAC = 0.10       # click must be within 10% of frame width of the player
HEATMAP_COLS, HEATMAP_ROWS = 12, 8


# ===========================================================================
# Small helpers (pure Python / numpy - no GPU needed)
# ===========================================================================
def clean_value(v):
    """Replace NaN/Inf with None so the JSON response never breaks."""
    import math
    if isinstance(v, float) and (math.isnan(v) or math.isinf(v)):
        return None
    return v


def clean_json(obj):
    """Recursively clean NaN/Inf and numpy types out of a structure."""
    import numpy as np
    if isinstance(obj, dict):
        return {str(k): clean_json(v) for k, v in obj.items()}
    if isinstance(obj, (list, tuple)):
        return [clean_json(v) for v in obj]
    if isinstance(obj, np.integer):
        return int(obj)
    if isinstance(obj, np.floating):
        return clean_value(float(obj))
    if isinstance(obj, float):
        return clean_value(obj)
    return obj


def load_json(path):
    import json
    from pathlib import Path
    if not path or not Path(path).is_file():
        return None
    with open(path, "r", encoding="utf-8") as fh:
        return json.load(fh)


def choose_process_fps(duration_s: float) -> int:
    """Lower fps for long games so a full match finishes in a sensible time."""
    if duration_s > 1200:   # > 20 min
        return 10
    return 15


def probe_video(path: str) -> Dict:
    import cv2
    cap = cv2.VideoCapture(path)
    if not cap.isOpened():
        raise ValueError("Could not open video")
    fps = cap.get(cv2.CAP_PROP_FPS) or 30.0
    frames = int(cap.get(cv2.CAP_PROP_FRAME_COUNT))
    meta = {
        "fps": float(fps),
        "total_frames": frames,
        "width": int(cap.get(cv2.CAP_PROP_FRAME_WIDTH)),
        "height": int(cap.get(cv2.CAP_PROP_FRAME_HEIGHT)),
    }
    meta["duration"] = frames / fps if fps else 0.0
    cap.release()
    return meta


def download_video(url: str, dest: str) -> float:
    """Stream the video to disk (never holds a 2 GB game in memory)."""
    import requests
    size = 0
    with requests.get(url, stream=True, timeout=600) as r:
        r.raise_for_status()
        with open(dest, "wb") as fh:
            for chunk in r.iter_content(chunk_size=1024 * 1024):
                if chunk:
                    fh.write(chunk)
                    size += len(chunk)
    return size / 1024 / 1024


def prepare_video(src: str, dst: str, fps: int, max_height: int = 1080) -> None:
    """Re-encode to a fixed fps, cap the height, drop audio."""
    import subprocess
    cmd = [
        "ffmpeg", "-y", "-loglevel", "error", "-i", src,
        "-vf", f"fps={fps},scale=-2:'min({max_height},ih)'",
        "-c:v", "libx264", "-preset", "veryfast", "-crf", "20", "-an", dst,
    ]
    subprocess.run(cmd, check=True)


# ===========================================================================
# Running Wael's engine head-less
# ===========================================================================
def run_afa_engine(video_path: str, out_dir: str, players_per_team: int,
                   track_buffer: int) -> Dict:
    """Run the engine stage by stage, the same order as his main.py, minus
    the desktop review UI. Optional stages never crash the run."""
    import os
    import sys
    from pathlib import Path

    sys.path.insert(0, AFA_DIR)
    os.chdir(AFA_DIR)   # his config uses repo-relative weight paths
    import main as afa

    args = afa.parse_args([
        "--video", video_path,
        "--tracking", "--stitch-tracks", "--fix-swaps",
        "--role-refinement", "--auto-calibration",
        "--possession", "--save-analytics",
        "--no-save-video",
        "--track-buffer", str(track_buffer),
        "--output-dir", out_dir,
        "--device", "cuda:0",
    ])
    config = afa.load_config(args.config)
    config = afa.apply_overrides(config, args)

    # Server-safe settings: no desktop windows, no rendered videos.
    config.manual_correction.enabled = False
    config.calibration.save_minimap = False
    config.minimap_overlay.enabled = False
    config.pose.enabled = False
    config.video.save_video = False
    config.analytics.heatmaps = False
    config.analytics.show_speed_overlay = False
    config.role_refinement.save_role_video = False
    config.tracking.roster.slots_per_team = int(players_per_team)

    afa.setup_logging(level="INFO", log_dir=f"{out_dir}/logs", log_to_file=False)
    vp = Path(video_path)
    stages = {}

    print("  [engine] detection + BoT-SORT tracking...")
    summary = afa.DetectionPipeline(config).run(vp, max_frames=None)
    stages["unique_track_ids_raw"] = summary.get("unique_track_ids")

    if summary.get("tracks_json"):
        for name, fn in (("stitching", afa.run_stitching),
                         ("swap_correction", afa.run_swap_correction),
                         ("roster", afa.run_roster)):
            try:
                print(f"  [engine] {name}...")
                stats = fn(config, vp, summary)
                stages[name] = {k: v for k, v in (stats or {}).items()
                                if isinstance(v, (int, float, str, bool))}
            except Exception as exc:
                print(f"  [engine] {name} failed (continuing): {exc}")
                stages[name] = {"error": str(exc)}

    role_summary = None
    try:
        print("  [engine] team + role discovery...")
        role_summary = afa.run_role_refinement(config, vp, summary)
    except Exception as exc:
        print(f"  [engine] role refinement failed (continuing): {exc}")
        stages["role_refinement"] = {"error": str(exc)}

    try:
        print("  [engine] image-space possession...")
        afa.run_possession(config, vp, summary, role_summary)
    except Exception as exc:
        print(f"  [engine] possession failed (continuing): {exc}")

    minimap = None
    try:
        print("  [engine] pitch calibration + field analytics...")
        minimap = afa.run_minimap(config, vp, summary, role_summary)
    except Exception as exc:
        print(f"  [engine] calibration failed (pixel fallback): {exc}")
        stages["calibration"] = {"error": str(exc)}

    stem = vp.stem
    out = Path(out_dir)
    return {
        "tracks_json": summary.get("tracks_json"),
        "roles_json": (role_summary or {}).get("roles_json"),
        "field_positions": (minimap or {}).get("field_positions"),
        "reprojection_error": (minimap or {}).get("reprojection_error"),
        "analytics_json": str(out / f"{stem}_analytics.json"),
        "player_analytics_json": str(out / f"{stem}_player_analytics.json"),
        "team_tactical_json": str(out / f"{stem}_team_tactical.json"),
        "possession_json": str(out / f"{stem}_possession.json"),
        "final_report_json": str(out / f"{stem}_final_report.json"),
        "stages": stages,
    }


# ===========================================================================
# Converting engine output -> PitchMind format (pure, testable)
# ===========================================================================
def load_tracks(tracks_json: str) -> Tuple[List[dict], float]:
    data = load_json(tracks_json) or {}
    fps = float((data.get("metadata") or {}).get("video_fps", 25.0))
    return data.get("frames", []), fps


def load_roles(roles_json: Optional[str]) -> Dict[int, Tuple[str, Optional[int]]]:
    data = load_json(roles_json) or {}
    roles = {}
    for t in data.get("tracks", []):
        role = t.get("final_role") or t.get("refined_role") or t.get("role") or "unknown"
        roles[int(t["track_id"])] = (role, t.get("team_id"))
    return roles


def build_timeline(engine: Dict, proc: Dict) -> Dict:
    """Unified per-frame view: players + ball in field metres (calibrated)
    or in pixels (fallback)."""
    frames_tracks, fps = load_tracks(engine["tracks_json"])
    roles = load_roles(engine.get("roles_json"))
    fp = load_json(engine.get("field_positions"))

    pixel_boxes = {}   # frame -> {track_id: bbox}
    pixel_ball = {}    # frame -> (cx, cy)
    for fr in frames_tracks:
        f = int(fr["frame"])
        boxes = {}
        for t in fr.get("tracks", []):
            if t.get("class") == "ball":
                b = t["bbox"]
                pixel_ball[f] = ((b[0] + b[2]) / 2.0, (b[1] + b[3]) / 2.0)
            else:
                boxes[int(t["track_id"])] = t["bbox"]
        pixel_boxes[f] = boxes

    team_of: Dict[int, Optional[int]] = {}
    role_of: Dict[int, str] = {}
    for tid, (role, team) in roles.items():
        role_of[tid] = role
        team_of[tid] = team

    frames = {}
    if fp and fp.get("frames"):
        mode, units = "field", "m"
        dims = (FULL_PITCH_LENGTH_M, FULL_PITCH_WIDTH_M)
        for entry in fp["frames"]:
            f = int(entry["frame"])
            players, ball = {}, None
            for obj in entry.get("objects", []):
                x, y = obj["field"]
                if obj.get("role") == "ball":
                    ball = (float(x), float(y))
                    continue
                tid = int(obj["track_id"])
                players[tid] = (float(x), float(y))
                role_of[tid] = obj.get("role") or role_of.get(tid, "unknown")
                if obj.get("team_id") is not None:
                    team_of[tid] = obj.get("team_id")
            frames[f] = {"players": players, "ball": ball}
    else:
        mode, units = "pixel", "px"
        dims = (float(proc["width"]), float(proc["height"]))
        for f, boxes in pixel_boxes.items():
            players = {tid: ((b[0] + b[2]) / 2.0, b[3]) for tid, b in boxes.items()}
            frames[f] = {"players": players, "ball": pixel_ball.get(f)}

    order = sorted(frames)
    return {
        "mode": mode, "units": units, "dims": dims, "fps": fps,
        "order": order, "frames": frames,
        "team_of": team_of, "role_of": role_of,
        "pixel_boxes": pixel_boxes, "pixel_ball": pixel_ball,
    }


def frame_time(frame: int, fps: float) -> float:
    return (frame - 1) / fps   # engine frame indices are 1-based


def interpolate_ball(tl: Dict) -> Dict[int, Tuple[float, float]]:
    """Fill short ball gaps linearly (ball detection always flickers)."""
    order, frames, fps = tl["order"], tl["frames"], tl["fps"]
    known = [(f, frames[f]["ball"]) for f in order if frames[f]["ball"] is not None]
    ball = {f: p for f, p in known}
    max_gap = int(BALL_INTERP_MAX_GAP_S * fps)
    for (f0, p0), (f1, p1) in zip(known, known[1:]):
        gap = f1 - f0
        if 1 < gap <= max_gap:
            for k in range(1, gap):
                a = k / gap
                ball[f0 + k] = (p0[0] + a * (p1[0] - p0[0]), p0[1] + a * (p1[1] - p0[1]))
    return ball


def _direction_table(tl: Dict) -> Tuple[Dict[int, int], int]:
    """One pass over the game: which way team 0 attacks, minute by minute.
    The deeper team defends the low-x goal. Smoothed over +/-1 minute so it
    survives quiet spells, and it naturally flips at half-time."""
    if "_dir" in tl:
        return tl["_dir"]
    fps = tl["fps"]
    acc: Dict[int, float] = {}
    for f in tl["order"]:
        t0, t1 = [], []
        for tid, (x, _) in tl["frames"][f]["players"].items():
            if tl["role_of"].get(tid) in ("referee", "unknown", "ball"):
                continue
            team = tl["team_of"].get(tid)
            if team == 0:
                t0.append(x)
            elif team == 1:
                t1.append(x)
        if len(t0) >= 3 and len(t1) >= 3:
            b = int(frame_time(f, fps) // 60)
            acc[b] = acc.get(b, 0.0) + (min(t0) - min(t1)) + (max(t0) - max(t1))
    total = sum(acc.values())
    default = 1 if total < 0 else -1
    table = {}
    for b in range((max(acc) + 2) if acc else 0):
        sc = sum(acc.get(b + k, 0.0) for k in (-1, 0, 1))
        table[b] = default if sc == 0 else (1 if sc < 0 else -1)
    tl["_dir"] = (table, default)
    return tl["_dir"]


def attack_direction(tl: Dict, team: Optional[int], t_center: float) -> int:
    """+1 if `team` attacks toward x = max at time t, else -1."""
    if team not in (0, 1):
        return 1
    table, default = _direction_table(tl)
    d = table.get(int(max(0.0, t_center) // 60), default)
    return d if team == 0 else -d


def zone_of(x: float, y: float, dims: Tuple[float, float], direction: int) -> Tuple[str, str, str]:
    """Return (V7-style third, channel, short label like 'Att Left')."""
    L, W = dims
    xa = x if direction > 0 else L - x
    ya = y if direction > 0 else W - y
    third = ("Defensive Third" if xa < L / 3 else
             "Middle Third" if xa < 2 * L / 3 else "Attacking Third")
    channel = "Left" if ya < W / 3 else ("Center" if ya < 2 * W / 3 else "Right")
    short = {"Defensive Third": "Def", "Middle Third": "Mid", "Attacking Third": "Att"}[third]
    return third, channel, f"{short} {channel}"


def normalized_pct(x: float, y: float, dims: Tuple[float, float], direction: int) -> Tuple[float, float]:
    """Position as % of the pitch, flipped so the team always attacks left -> right."""
    L, W = dims
    xa = x if direction > 0 else L - x
    ya = y if direction > 0 else W - y
    return round(100.0 * xa / L, 2), round(100.0 * ya / W, 2)


def possession_segments(tl: Dict, ball: Dict[int, Tuple[float, float]]) -> List[dict]:
    """Who has the ball, frame by frame, merged into possession spells."""
    import math
    fps, frames = tl["fps"], tl["frames"]
    radius = POSSESS_DIST_M if tl["mode"] == "field" else POSSESS_DIST_FRAC * tl["dims"][0]
    raw = []
    for f in tl["order"]:
        b = ball.get(f)
        if b is None:
            continue
        best, best_d = None, radius
        for tid, (x, y) in frames[f]["players"].items():
            if tl["role_of"].get(tid) == "referee":
                continue
            d = math.hypot(x - b[0], y - b[1])
            if d <= best_d:
                best, best_d = tid, d
        if best is not None:
            raw.append((f, best, best_d))

    gap_frames = max(1, int(POSSESSION_GAP_S * fps))
    segs = []
    for f, tid, d in raw:
        if segs and segs[-1]["pid"] == tid and f - segs[-1]["end"] <= gap_frames:
            segs[-1]["end"] = f
            segs[-1]["n"] += 1
        else:
            segs.append({"pid": tid, "start": f, "end": f, "n": 1, "dist": d})
    # Drop 1-frame flickers (duels, ball passing a player) then re-merge.
    segs = [s for s in segs if s["n"] >= 2]
    merged = []
    for s in segs:
        if merged and merged[-1]["pid"] == s["pid"] and s["start"] - merged[-1]["end"] <= gap_frames * 2:
            merged[-1]["end"] = s["end"]
            merged[-1]["n"] += s["n"]
        else:
            merged.append(dict(s))
    for s in merged:
        s["team"] = tl["team_of"].get(s["pid"])
    return merged


def ball_speed_after(tl, ball, f_start, seconds=0.8):
    """Ball speed (km/h in field mode, px/s in pixel mode) right after a release."""
    import math
    fps = tl["fps"]
    f_end = f_start + max(1, int(seconds * fps))
    p0 = ball.get(f_start)
    p1 = None
    for f in range(f_end, f_start, -1):
        if f in ball:
            p1, f_end = ball[f], f
            break
    if p0 is None or p1 is None or f_end == f_start:
        return None, None
    dist = math.hypot(p1[0] - p0[0], p1[1] - p0[1])
    v = dist / ((f_end - f_start) / fps)
    return (v * 3.6 if tl["mode"] == "field" else v), p1


def detect_decision_points(tl: Dict, ball: Dict, segs: List[dict],
                           target: int, scale: float = 1.0) -> List[dict]:
    """One decision per possession spell of the target: what did they do
    with the ball (pass / shot / dribble / turnover / touch), plus how they won it."""
    import math
    fps, frames, dims = tl["fps"], tl["frames"], tl["dims"]
    field = tl["mode"] == "field"
    my_team = tl["team_of"].get(target)
    points = []

    for k, s in enumerate(segs):
        if s["pid"] != target:
            continue
        prev = segs[k - 1] if k > 0 else None
        nxt = segs[k + 1] if k + 1 < len(segs) else None
        t_rel = frame_time(s["end"], fps)
        direction = attack_direction(tl, my_team, t_rel) if field else 1

        # How the ball was won
        gained_by = "loose_ball"
        if prev is not None and frame_time(s["start"], fps) - frame_time(prev["end"], fps) <= NEXT_POSSESSION_WINDOW_S:
            if prev["team"] == my_team and my_team is not None:
                gained_by = "reception"
            elif prev["team"] is not None:
                close = frame_time(s["start"], fps) - frame_time(prev["end"], fps) <= 1.0
                gained_by = "tackle" if close else "interception"

        p_start = frames[s["start"]]["players"].get(target)
        p_end = frames[s["end"]]["players"].get(target)
        carry = math.hypot(p_end[0] - p_start[0], p_end[1] - p_start[1]) if (p_start and p_end) else 0.0
        carry_m = carry * scale if field else None   # real metres

        # What happened next
        action, completed, receiver = "touch", None, None
        speed_after, ball_end = ball_speed_after(tl, ball, s["end"])
        if field and speed_after is not None:
            speed_after *= scale                       # real km/h
        next_in_time = nxt is not None and (frame_time(nxt["start"], fps) - t_rel) <= NEXT_POSSESSION_WINDOW_S

        is_shot = False
        if field and speed_after is not None and ball_end is not None:
            L, W = dims
            goal_x = L if direction > 0 else 0.0
            toward_goal = (ball_end[0] - ball[s["end"]][0]) * direction > 0
            near_goal = abs(ball_end[0] - goal_x) <= SHOT_GOAL_ZONE_M and abs(ball_end[1] - W / 2) <= 20.0
            is_shot = toward_goal and near_goal and speed_after >= SHOT_MIN_BALL_SPEED_KMH
            if is_shot and next_in_time and nxt["team"] == my_team:
                is_shot = False   # it reached a teammate: that was a pass

        if is_shot:
            action = "shot"
        elif next_in_time and nxt["pid"] != target:
            if nxt["team"] == my_team and my_team is not None:
                action, completed, receiver = "pass", True, nxt["pid"]
            else:
                b0 = ball.get(s["end"])
                b1 = ball.get(nxt["start"])
                travel = math.hypot(b1[0] - b0[0], b1[1] - b0[1]) if (b0 and b1) else 0.0
                long_ball = travel >= (10.0 if field else 0.08 * dims[0])
                action, completed = ("pass", False) if long_ball else ("turnover", False)
        elif field and carry_m is not None and carry_m >= DRIBBLE_MIN_CARRY_M:
            action = "dribble"

        # Separate dribble event when they carried the ball AND then did something else
        if field and carry_m is not None and carry_m >= DRIBBLE_MIN_CARRY_M and action != "dribble":
            points.append(make_point(tl, ball, target, s["start"], "dribble", direction,
                                     gained_by=gained_by, carry_m=carry_m, scale=scale))

        points.append(make_point(tl, ball, target, s["end"], action, direction,
                                 gained_by=gained_by, carry_m=carry_m, completed=completed,
                                 receiver=receiver, ball_speed=speed_after, scale=scale))
    return points


def make_point(tl, ball, target, f, action, direction, **extra) -> dict:
    import math
    fps, dims, field = tl["fps"], tl["dims"], tl["mode"] == "field"
    p = tl["frames"][f]["players"].get(target)
    b = ball.get(f)
    point = {
        "timestamp": round(frame_time(f, fps), 1),
        "action": action,
        "track_id": int(target),
        "team_id": tl["team_of"].get(target),
        "gained_by": extra.get("gained_by"),
        "completed": extra.get("completed"),
        "receiver_track_id": extra.get("receiver"),
        "carry_m": round(extra["carry_m"], 1) if extra.get("carry_m") is not None else None,
        "ball_speed_kmh": round(extra["ball_speed"], 1) if (field and extra.get("ball_speed") is not None) else None,
        "distance": (round(math.hypot(p[0] - b[0], p[1] - b[1]) * (extra.get("scale", 1.0) if field else 1.0), 2)
                     if (p and b) else None),
        "distance_units": tl["units"],
    }
    if p and field:
        third, channel, short = zone_of(p[0], p[1], dims, direction)
        nx, ny = normalized_pct(p[0], p[1], dims, direction)
        point["zone"] = third
        point["field_position"] = {
            "x": nx, "y": ny, "zone": short, "channel": channel,
            "x_m": round(p[0], 2), "y_m": round(p[1], 2),
            "attacking": "left_to_right",
        }
    elif p:
        third = ("Defensive Third" if p[0] < dims[0] / 3 else
                 "Middle Third" if p[0] < 2 * dims[0] / 3 else "Attacking Third")
        point["zone"] = third
        point["field_position"] = None
    point["_frame"] = f
    return point


def identify_target(tl: Dict, click_x_pct: float, click_y_pct: float,
                    click_t: float, proc: Dict) -> Optional[dict]:
    """Map the user's click (percent of the video frame + time) to a track."""
    import math
    fps = tl["fps"]
    px = click_x_pct / 100.0 * proc["width"]
    py = click_y_pct / 100.0 * proc["height"]
    max_d = MAX_CLICK_DIST_FRAC * proc["width"]
    best = None
    for f, boxes in tl["pixel_boxes"].items():
        dt = abs(frame_time(f, fps) - click_t)
        if dt > CLICK_SEARCH_WINDOW_S:
            continue
        for tid, b in boxes.items():
            if tl["role_of"].get(tid) == "referee":
                continue
            inside = b[0] <= px <= b[2] and b[1] <= py <= b[3]
            cx, cy = (b[0] + b[2]) / 2.0, (b[1] + b[3]) / 2.0
            d = 0.0 if inside else math.hypot(cx - px, cy - py)
            if d > max_d:
                continue
            score = 0.6 * (1 - d / max_d) + 0.4 * (1 - dt / CLICK_SEARCH_WINDOW_S)
            if best is None or score > best["confidence"]:
                best = {"track_id": tid, "distance_px": d, "confidence": score}
    return best


def team_colors(video_path: str, tl: Dict, samples: int = 30) -> Dict[int, str]:
    """Median shirt colour per team (hex), sampled from the processed video."""
    import cv2
    import numpy as np
    frames = sorted(tl["pixel_boxes"])
    if not frames:
        return {}
    picks = set(frames[:: max(1, len(frames) // samples)])
    colors = {0: [], 1: []}
    cap = cv2.VideoCapture(video_path)
    idx = 0
    while True:
        ok, img = cap.read()
        if not ok:
            break
        idx += 1
        if idx not in picks:
            continue
        for tid, b in tl["pixel_boxes"].get(idx, {}).items():
            team = tl["team_of"].get(tid)
            if team not in colors or tl["role_of"].get(tid) != "player":
                continue
            x1, y1, x2, y2 = [int(v) for v in b]
            h = y2 - y1
            crop = img[max(0, y1 + int(0.15 * h)): max(0, y1 + int(0.45 * h)),
                       max(0, x1): max(0, x2)]
            if crop.size:
                colors[team].append(np.median(crop.reshape(-1, 3), axis=0))
    cap.release()
    out = {}
    for team, vals in colors.items():
        if vals:
            bgr = np.median(np.array(vals), axis=0).astype(int)
            out[team] = "#{:02x}{:02x}{:02x}".format(bgr[2], bgr[1], bgr[0])
    return out


def build_result(engine: Dict, tl: Dict, proc: Dict, orig: Dict,
                 click: Optional[dict], options: Dict, colors: Dict) -> Dict:
    """Assemble the PitchMind response (all V7 keys + new 'match' block)."""
    import math
    field = tl["mode"] == "field"
    fps = tl["fps"]
    ball = interpolate_ball(tl)
    segs = possession_segments(tl, ball)

    pitch_len = float(options.get("pitch_length_m") or FULL_PITCH_LENGTH_M)
    pitch_wid = float(options.get("pitch_width_m") or FULL_PITCH_WIDTH_M)
    sx, sy = pitch_len / FULL_PITCH_LENGTH_M, pitch_wid / FULL_PITCH_WIDTH_M
    scale = math.sqrt(sx * sy)   # engine metres -> real metres (smaller youth pitches)
    to_orig = orig["width"] / proc["width"] if proc["width"] else 1.0

    # ---- Match-level block (whole game, every player) ----
    analytics = load_json(engine.get("analytics_json")) or {}
    player_an = load_json(engine.get("player_analytics_json")) or {}
    by_id = {}
    for t in analytics.get("tracks", []):
        by_id[int(t["track_id"])] = dict(t)
    for p in (player_an.get("players") or player_an.get("tracks") or []):
        by_id.setdefault(int(p["track_id"]), {}).update(p)
    players = []
    for tid, p in sorted(by_id.items()):
        if field:
            for key in ("total_distance_m", "avg_speed_kmh", "max_speed_kmh"):
                if p.get(key) is not None:
                    p[key] = round(p[key] * scale, 2)
        p["team_color"] = colors.get(p.get("team_id"))
        players.append(p)

    def strip_meta(d):
        # drop metadata and the per-frame timeline (tens of thousands of rows)
        return {k: v for k, v in (d or {}).items() if k not in ("metadata", "timeline")} or None

    match = {
        "mode": tl["mode"],
        "teams": [{"team_id": t, "color": colors.get(t)} for t in (0, 1)],
        "players": players,
        "possession": strip_meta(load_json(engine.get("possession_json"))),
        "tactics": strip_meta(load_json(engine.get("team_tactical_json"))),
        "report": strip_meta(load_json(engine.get("final_report_json"))),
        "calibration_error_m": engine.get("reprojection_error"),
    }

    result = {
        "success": True,
        "match": match,
        "video_metadata": {
            "filename": options.get("filename", "video.mp4"),
            "width": orig["width"], "height": orig["height"],
            "fps": orig["fps"], "total_frames": orig["total_frames"],
            "duration": round(orig["duration"], 1),
        },
        "processing_info": {
            "version": VERSION,
            "engine": "AI Football Analytics (Mohamed Wael) - used with permission",
            "model": "YOLO11m (custom)", "tracker": "BoT-SORT + stitching + swap-fix + roster",
            "mode": tl["mode"], "distance_units": "m" if field else "px",
            "speed_units": "km/h" if field else "px/s",
            "processed_fps": fps,
            "sample_rate": max(1, int(round(orig["fps"] / fps))) if fps else 1,
            "pitch_scale": round(scale, 3),
            "stages": engine.get("stages"),
            "gpu_used": options.get("gpu_name", "unknown"),
        },
    }

    if click is None:
        return clean_json(result)

    # ---- Target player ----
    target = identify_target(tl, click["x"], click["y"], click["t"], proc)
    if target is None:
        return {"success": False,
                "error": "Could not identify a player at the click position. "
                         "Pause on a frame where the player is clearly visible and click on them."}
    tid = int(target["track_id"])

    points = detect_decision_points(tl, ball, segs, tid, scale=scale if field else 1.0)
    for p in points:
        f = p.pop("_frame")
        p["frame"] = int(round(frame_time(f, fps) * orig["fps"]))
        box = tl["pixel_boxes"].get(f, {}).get(tid)
        p["player_position"] = ([round((box[0] + box[2]) / 2 * to_orig, 1),
                                 round((box[1] + box[3]) / 2 * to_orig, 1)] if box else None)
        bp = tl["pixel_ball"].get(f)
        p["ball_position"] = [round(bp[0] * to_orig, 1), round(bp[1] * to_orig, 1)] if bp else None

    # Trajectory, speeds and heatmap for the target
    traj_px, traj_field, speeds, heat = [], [], [], [[0] * HEATMAP_COLS for _ in range(HEATMAP_ROWS)]
    prev = None
    dir_cache: Dict[int, int] = {}
    for f in tl["order"]:
        pos = tl["frames"][f]["players"].get(tid)
        box = tl["pixel_boxes"].get(f, {}).get(tid)
        traj_px.append([round((box[0] + box[2]) / 2 * to_orig, 1),
                        round((box[1] + box[3]) / 2 * to_orig, 1)] if box else None)
        if pos is None:
            traj_field.append(None)
            speeds.append({"speed": None, "velocity": [None, None], "direction": None})
            prev = None
            continue
        if field:
            bucket = int(frame_time(f, fps) // 60)   # re-check direction each minute
            if bucket not in dir_cache:
                dir_cache[bucket] = attack_direction(tl, tl["team_of"].get(tid), bucket * 60 + 30)
            direction = dir_cache[bucket]
            nx, ny = normalized_pct(pos[0], pos[1], tl["dims"], direction)
            traj_field.append([nx, ny])
            c = min(HEATMAP_COLS - 1, int(nx / 100 * HEATMAP_COLS))
            r = min(HEATMAP_ROWS - 1, int(ny / 100 * HEATMAP_ROWS))
            heat[r][c] += 1
        else:
            traj_field.append(None)
        if prev is not None:
            pf, pp = prev
            dt = (f - pf) / fps
            vx, vy = (pos[0] - pp[0]) / dt, (pos[1] - pp[1]) / dt
            sp = math.hypot(vx, vy) * (3.6 * scale if field else 1.0)
            speeds.append({"speed": round(sp, 2), "velocity": [round(vx, 3), round(vy, 3)],
                           "direction": round(math.degrees(math.atan2(vy, vx)) % 360, 1)})
        else:
            speeds.append({"speed": 0.0, "velocity": [0.0, 0.0], "direction": 0.0})
        prev = (f, pos)

    eng = by_id.get(tid, {})
    if field and eng.get("total_distance_m") is not None:
        dist, avg_sp, max_sp = eng.get("total_distance_m"), eng.get("avg_speed_kmh"), eng.get("max_speed_kmh")
    else:
        valid = [s["speed"] for s in speeds if s["speed"]]
        dist, avg_sp = None, (sum(valid) / len(valid) if valid else 0.0)
        max_sp = max(valid) if valid else 0.0

    counts = {}
    for p in points:
        counts[p["action"]] = counts.get(p["action"], 0) + 1
    passes = [p for p in points if p["action"] == "pass"]
    completed = [p for p in passes if p.get("completed")]

    result.update({
        "decision_points": points,
        "target_permanent_id": tid,
        "target_player_id": tid,
        "player_analytics": {
            "distance_traveled": dist,
            "average_speed": round(avg_sp, 2) if avg_sp is not None else None,
            "max_speed": round(max_sp, 2) if max_sp is not None else None,
            "total_touches": len(points),
            "action_breakdown": counts,
            "pass_completion_pct": round(100.0 * len(completed) / len(passes), 1) if passes else None,
            "identification_confidence": round(target["confidence"], 2),
            "team_id": tl["team_of"].get(tid),
            "team_color": colors.get(tl["team_of"].get(tid)),
            "role": tl["role_of"].get(tid),
            "rating": eng.get("player_rating"),
            "work_rate": eng.get("work_rate"),
            "insight": eng.get("insight"),
            "distance_units": "m" if field else "px",
            "speed_units": "km/h" if field else "px/s",
        },
        "trajectory": {
            "positions": traj_px,
            "field_positions": traj_field,
            "velocities": speeds,
        },
        "heatmap": {"cols": HEATMAP_COLS, "rows": HEATMAP_ROWS, "grid": heat,
                    "attacking": "left_to_right"} if field else None,
    })
    result["processing_info"]["target_track_id"] = tid
    result["processing_info"]["target_permanent_id"] = tid
    return clean_json(result)


# ===========================================================================
# GPU function
# ===========================================================================
@app.function(image=gpu_image, gpu="A10G", timeout=4 * 3600, memory=16384)
def analyze_video_gpu(video_url: str,
                      click_x: Optional[float] = None,
                      click_y: Optional[float] = None,
                      click_timestamp: float = 0.0,
                      filename: str = "video.mp4",
                      options: Optional[dict] = None) -> Dict:
    import os
    import shutil
    import tempfile
    import time
    import torch

    options = dict(options or {})
    options["filename"] = filename
    options["gpu_name"] = torch.cuda.get_device_name(0) if torch.cuda.is_available() else "CPU"
    t0 = time.time()
    work = tempfile.mkdtemp(prefix="pm_")
    print(f"PitchMind {VERSION} on {options['gpu_name']} | {filename}")

    try:
        src = os.path.join(work, "source_video")
        mb = download_video(video_url, src)
        orig = probe_video(src)
        print(f"Downloaded {mb:.1f} MB | {orig['width']}x{orig['height']} "
              f"{orig['fps']:.1f}fps {orig['duration']:.0f}s")

        proc_fps = int(options.get("process_fps") or choose_process_fps(orig["duration"]))
        proc_path = os.path.join(work, "match.mp4")
        prepare_video(src, proc_path, proc_fps)
        os.remove(src)
        proc = probe_video(proc_path)
        print(f"Processing at {proc_fps} fps, {proc['width']}x{proc['height']}, "
              f"{proc['total_frames']} frames")

        out_dir = os.path.join(work, "outputs")
        engine = run_afa_engine(
            proc_path, out_dir,
            players_per_team=int(options.get("players_per_team") or 11),
            track_buffer=int(options.get("track_buffer") or max(30, proc_fps * 4)),
        )
        if not engine.get("tracks_json"):
            return {"success": False, "error": "Tracking produced no output for this video."}

        tl = build_timeline(engine, proc)
        print(f"Timeline: {tl['mode']} mode, {len(tl['order'])} frames")
        colors = team_colors(proc_path, tl)

        click = None
        if click_x is not None and click_y is not None:
            click = {"x": float(click_x), "y": float(click_y), "t": float(click_timestamp or 0.0)}
        result = build_result(engine, tl, proc, orig, click, options, colors)
        if result.get("success"):
            result["processing_info"]["processing_seconds"] = round(time.time() - t0, 1)
            print(f"Done in {time.time() - t0:.0f}s | "
                  f"{len(result.get('decision_points', []))} decision points")
        return result
    finally:
        shutil.rmtree(work, ignore_errors=True)


# ===========================================================================
# Web endpoint (same contract as V7)
# ===========================================================================
@app.function(image=web_image, timeout=4 * 3600)
@modal.asgi_app()
def fastapi_app():
    from fastapi import FastAPI, Request
    from fastapi.responses import JSONResponse

    web_app = FastAPI(title=f"PitchMind GPU Tracker {VERSION}")

    def _options(item: dict) -> dict:
        keys = ("players_per_team", "pitch_length_m", "pitch_width_m", "process_fps", "track_buffer")
        return {k: item[k] for k in keys if item.get(k) is not None}

    @web_app.get("/health")
    async def health():
        return {
            "status": "ok",
            "version": VERSION,
            "engine": "AI Football Analytics by Mohamed Wael (used with permission)",
            "engine_commit": AFA_COMMIT,
            "model": "YOLO11m custom (player / goalkeeper / referee / ball)",
            "tracker": "BoT-SORT + ID stitching + swap correction + roster",
            "features": [
                "team_discovery", "auto_pitch_calibration", "field_metres",
                "speed_kmh", "decision_points", "possession", "player_ratings",
                "tactics", "match_report", "heatmap", "pixel_fallback",
            ],
            "endpoints": {"POST /": "track the clicked player",
                          "POST /match": "whole-match analysis, no click"},
        }

    async def _read(request: Request):
        try:
            return await request.json(), None
        except Exception as e:
            return None, JSONResponse({"success": False, "error": f"Invalid JSON: {e}"}, status_code=400)

    @web_app.post("/")
    async def analyze_player(request: Request):
        item, err = await _read(request)
        if err:
            return err
        video_url = item.get("video_url")
        x = item.get("player_x") if item.get("player_x") is not None else item.get("click_x")
        y = item.get("player_y") if item.get("player_y") is not None else item.get("click_y")
        if not video_url or x is None or y is None:
            return JSONResponse({"success": False,
                                 "error": "Missing required fields: video_url, and (player_x/click_x, player_y/click_y)"},
                                status_code=400)
        try:
            result = analyze_video_gpu.remote(
                video_url, float(x), float(y), float(item.get("click_timestamp") or 0.0),
                item.get("filename", "video.mp4"), _options(item))
            return JSONResponse(result)
        except Exception as e:
            import traceback
            print(traceback.format_exc())
            return JSONResponse({"success": False, "error": f"GPU processing failed: {e}"}, status_code=500)

    @web_app.post("/match")
    async def analyze_match(request: Request):
        item, err = await _read(request)
        if err:
            return err
        if not item.get("video_url"):
            return JSONResponse({"success": False, "error": "Missing required field: video_url"}, status_code=400)
        try:
            result = analyze_video_gpu.remote(
                item["video_url"], None, None, 0.0,
                item.get("filename", "video.mp4"), _options(item))
            return JSONResponse(result)
        except Exception as e:
            return JSONResponse({"success": False, "error": f"GPU processing failed: {e}"}, status_code=500)

    return web_app


@app.local_entrypoint()
def main():
    print("PitchMind GPU Tracker", VERSION)
    print("Engine: AI Football Analytics by Mohamed Wael (used with permission)")
    print("Deploy with:  modal deploy modal_gpu_worker_v8.py")
