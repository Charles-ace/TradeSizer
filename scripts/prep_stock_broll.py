import os
import subprocess
from pathlib import Path

base = Path(r"c:\Builds\Position size calculator\TradeSizer\public\demo_assets")
stock_dir = base / "stock_clips"
out_frames = base / "stock_broll_frames"
out_frames.mkdir(parents=True, exist_ok=True)

concat_list = base / "stock_concat.txt"
clips = [
    stock_dir / "stock_01_exchange_wide.mp4",
    stock_dir / "stock_02_workstations.mp4",
    stock_dir / "stock_04_trading_floor.mp4"
]
with open(concat_list, "w") as f:
    for c in clips:
        f.write(f"file '{c}'\n")

broll_30s = base / "stock_broll_30s.mp4"
cmd = [
    "ffmpeg", "-y",
    "-f", "concat", "-safe", "0",
    "-i", str(concat_list),
    "-t", "31.5",
    "-vf", "fps=30,scale=1920:1080",
    "-c:v", "libx264", "-crf", "18", "-pix_fmt", "yuv420p",
    str(broll_30s)
]
subprocess.run(cmd, check=True)
print("[+] 30s B-Roll video created:", broll_30s)

cmd_frames = [
    "ffmpeg", "-y",
    "-i", str(broll_30s),
    "-vf", "fps=30,scale=1920:1080",
    "-q:v", "2",
    str(out_frames / "broll_%04d.jpg")
]
subprocess.run(cmd_frames, check=True)
cnt = len(list(out_frames.glob("broll_*.jpg")))
print(f"[+] Extracted {cnt} B-roll stock frames!")
