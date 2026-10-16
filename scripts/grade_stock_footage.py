import os
import subprocess
from pathlib import Path

BASE_DIR = Path(r"c:\Builds\Position size calculator\TradeSizer")
STOCK_RAW = BASE_DIR / "demo_assets" / "stock_clips" / "frankfurt_exchange_raw.webm"
OUTPUT_DIR = BASE_DIR / "public" / "demo_assets" / "stock_clips"
OUTPUT_DIR.mkdir(parents=True, exist_ok=True)

# DaVinci Resolve Teal & Orange grading filter
# Teal in shadows, rich contrast, warm amber roll-off, subtle 35mm film grain, optical vignette
DAVINCI_FILTER = (
    "scale=1920:1080:force_original_aspect_ratio=increase,crop=1920:1080,"
    "curves=r='0/0 0.22/0.18 0.78/0.82 1/1':g='0/0.02 0.25/0.23 0.75/0.78 1/0.98':b='0/0.06 0.28/0.33 0.72/0.68 1/0.92',"
    "eq=contrast=1.18:brightness=-0.02:saturation=1.22,"
    "vignette=PI/4,"
    "noise=alls=6:allf=t+u"
)

CLIPS = [
    {"name": "stock_01_exchange_wide.mp4", "start": "00:00:01", "duration": "14"},
    {"name": "stock_02_workstations.mp4", "start": "00:00:15", "duration": "15"},
    {"name": "stock_03_tickers.mp4", "start": "00:00:30", "duration": "15"},
    {"name": "stock_04_trading_floor.mp4", "start": "00:00:44", "duration": "14"},
]

print("Starting DaVinci Resolve grading for stock clips...")

for clip in CLIPS:
    out_path = OUTPUT_DIR / clip["name"]
    # Also write to demo_assets/stock_clips
    alt_out_path = BASE_DIR / "demo_assets" / "stock_clips" / clip["name"]
    cmd = [
        "ffmpeg", "-y",
        "-ss", clip["start"],
        "-t", clip["duration"],
        "-i", str(STOCK_RAW),
        "-vf", DAVINCI_FILTER,
        "-c:v", "libx264",
        "-crf", "20",
        "-preset", "faster",
        "-pix_fmt", "yuv420p",
        "-an",
        str(out_path)
    ]
    print(f"Rendering {clip['name']}...")
    subprocess.run(cmd, check=True)
    # copy to alt
    import shutil
    shutil.copy2(out_path, alt_out_path)
    print(f"Finished {clip['name']} ({out_path.stat().st_size // 1024} KB)")

print("All DaVinci graded stock clips ready!")
