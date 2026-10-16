import os
import subprocess
from pathlib import Path

BASE_DIR = Path(r"c:\Builds\Position size calculator\TradeSizer")
STOCK_RAW = BASE_DIR / "demo_assets" / "stock_clips" / "frankfurt_exchange_raw.webm"
OUT_VIDEO = BASE_DIR / "public" / "demo_assets" / "stock_broll_60s.mp4"
OUT_FRAMES = BASE_DIR / "public" / "demo_assets" / "stock_broll_frames_60s"
OUT_FRAMES.mkdir(parents=True, exist_ok=True)

# DaVinci Resolve Teal & Orange grading filter
# Teal in shadows, rich contrast, warm amber roll-off, subtle 35mm film grain, optical vignette
DAVINCI_FILTER = (
    "scale=1920:1080:force_original_aspect_ratio=increase,crop=1920:1080,"
    "curves=r='0/0 0.22/0.18 0.78/0.82 1/1':g='0/0.02 0.25/0.23 0.75/0.78 1/0.98':b='0/0.06 0.28/0.33 0.72/0.68 1/0.92',"
    "eq=contrast=1.18:brightness=-0.02:saturation=1.22,"
    "vignette=PI/4,"
    "noise=alls=6:allf=t+u,"
    "fps=30"
)

print("[*] Rendering 60s DaVinci Resolve graded stock B-roll...")
cmd = [
    "ffmpeg", "-y",
    "-i", str(STOCK_RAW),
    "-t", "60.0",
    "-vf", DAVINCI_FILTER,
    "-c:v", "libx264",
    "-crf", "18",
    "-preset", "faster",
    "-pix_fmt", "yuv420p",
    "-an",
    str(OUT_VIDEO)
]
subprocess.run(cmd, check=True)
print(f"[+] Graded 60s stock B-roll rendered: {OUT_VIDEO} ({OUT_VIDEO.stat().st_size // 1024} KB)")

print("[*] Extracting 30fps frames from 60s stock B-roll...")
cmd_frames = [
    "ffmpeg", "-y",
    "-i", str(OUT_VIDEO),
    "-vf", "fps=30,scale=1920:1080",
    "-q:v", "2",
    str(OUT_FRAMES / "broll_%04d.jpg")
]
subprocess.run(cmd_frames, check=True)
count = len(list(OUT_FRAMES.glob("broll_*.jpg")))
print(f"[+] Extracted {count} stock B-roll frames!")
