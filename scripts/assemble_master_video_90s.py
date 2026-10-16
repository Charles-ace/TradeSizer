import os
import subprocess
from pathlib import Path

BASE_DIR = Path(r"c:\Builds\Position size calculator\TradeSizer")
DEMO_ASSETS = BASE_DIR / "public" / "demo_assets"

STOCK_INTRO_RAW = DEMO_ASSETS / "stock_clips" / "stock_01_exchange_wide.mp4"
STOCK_OUTRO_RAW = DEMO_ASSETS / "stock_clips" / "stock_04_trading_floor.mp4"
APP_RECORDING = DEMO_ASSETS / "live_app_recording_90s.mp4"
MASTER_AUDIO = DEMO_ASSETS / "tradesizer_onetake_audio_90s.wav"

OUT_MASTER_VIDEO = BASE_DIR / "TradeSizer_OneTake_Master_90s.mp4"
OUT_POSTER = BASE_DIR / "TradeSizer_OneTake_Master_90s_poster.jpg"

print("[*] 1/3: Rendering DaVinci Resolve graded intro motion graphics (0.0s - 10.5s)...")
INTRO_GRADED = DEMO_ASSETS / "intro_graded_90s.mp4"

intro_filters = (
    "scale=1920:1080:force_original_aspect_ratio=increase,crop=1920:1080,"
    "curves=r='0/0 0.22/0.18 0.78/0.82 1/1':g='0/0.02 0.25/0.23 0.75/0.78 1/0.98':b='0/0.06 0.28/0.33 0.72/0.68 1/0.92',"
    "eq=contrast=1.18:brightness=-0.02:saturation=1.22,"
    "vignette=PI/4,"
    "drawbox=y=0:h=90:color=black@1:t=fill,"
    "drawbox=y=990:h=90:color=black@1:t=fill,"
    # Titanium 3D main title
    "drawtext=text='TRADESIZER':font='Segoe UI':fontsize=76:fontcolor=white:x=(w-text_w)/2:y=(h-text_h)/2-60:shadowcolor=black@0.8:shadowx=4:shadowy=4,"
    # Subtitle
    "drawtext=text='INSTITUTIONAL POSITION SIZING ENGINE':font='Segoe UI':fontsize=26:fontcolor=0x34d399:x=(w-text_w)/2:y=(h-text_h)/2+25,"
    # Data feeds pill
    "drawtext=text='FOREX.COM BROKER FEEDS • COINBASE CRYPTO • EXACT BABYPIPS PARITY':font='Consolas':fontsize=17:fontcolor=0xd1d5db:x=(w-text_w)/2:y=(h-text_h)/2+75,"
    "fps=30"
)

cmd_intro = [
    "ffmpeg", "-y",
    "-ss", "0.0",
    "-i", str(STOCK_INTRO_RAW),
    "-t", "10.5",
    "-vf", intro_filters,
    "-c:v", "libx264",
    "-preset", "faster",
    "-crf", "18",
    "-pix_fmt", "yuv420p",
    "-an",
    str(INTRO_GRADED)
]
subprocess.run(cmd_intro, check=True)
print(f"[+] Graded intro rendered: {INTRO_GRADED}")

print("[*] 2/3: Rendering DaVinci Resolve graded outro motion graphics (82.5s - 90.0s)...")
OUTRO_GRADED = DEMO_ASSETS / "outro_graded_90s.mp4"

outro_filters = (
    "scale=1920:1080:force_original_aspect_ratio=increase,crop=1920:1080,"
    "curves=r='0/0 0.25/0.24 0.75/0.82 1/1':g='0/0.01 0.25/0.23 0.75/0.76 1/0.95':b='0/0.05 0.25/0.20 0.75/0.65 1/0.88',"
    "eq=contrast=1.20:brightness=-0.03:saturation=1.25,"
    "vignette=PI/4,"
    "drawbox=y=0:h=90:color=black@1:t=fill,"
    "drawbox=y=990:h=90:color=black@1:t=fill,"
    # Outro title
    "drawtext=text='TRADESIZER':font='Segoe UI':fontsize=72:fontcolor=white:x=(w-text_w)/2:y=(h-text_h)/2-60:shadowcolor=black@0.8:shadowx=4:shadowy=4,"
    # Rigor subtitle
    "drawtext=text='MATHEMATICAL PRECISION. ZERO ROUNDING MISTAKES.':font='Segoe UI':fontsize=24:fontcolor=0x34d399:x=(w-text_w)/2:y=(h-text_h)/2+20,"
    # Verification badge
    "drawtext=text='Corda DLT Verified • Real-Time Interbank Feeds • BabyPips Certified':font='Consolas':fontsize=17:fontcolor=0xd1d5db:x=(w-text_w)/2:y=(h-text_h)/2+70,"
    "fps=30"
)

cmd_outro = [
    "ffmpeg", "-y",
    "-ss", "0.0",
    "-i", str(STOCK_OUTRO_RAW),
    "-t", "7.5",
    "-vf", outro_filters,
    "-c:v", "libx264",
    "-preset", "faster",
    "-crf", "18",
    "-pix_fmt", "yuv420p",
    "-an",
    str(OUTRO_GRADED)
]
subprocess.run(cmd_outro, check=True)
print(f"[+] Graded outro rendered: {OUTRO_GRADED}")

print("[*] 3/3: Assembling master 90.0s video with seamless concat and mastered audio...")
concat_filter = (
    "[0:v][1:v][2:v]concat=n=3:v=1:a=0[v_concat]"
)

cmd_master = [
    "ffmpeg", "-y",
    "-i", str(INTRO_GRADED),
    "-i", str(APP_RECORDING),
    "-i", str(OUTRO_GRADED),
    "-i", str(MASTER_AUDIO),
    "-filter_complex", concat_filter,
    "-map", "[v_concat]",
    "-map", "3:a",
    "-t", "90.0",
    "-c:v", "libx264",
    "-preset", "medium",
    "-crf", "17",
    "-pix_fmt", "yuv420p",
    "-c:a", "aac",
    "-b:a", "320k",
    str(OUT_MASTER_VIDEO)
]
subprocess.run(cmd_master, check=True)
print(f"\n[SUCCESS] Master 90.0s Video Rendered: {OUT_MASTER_VIDEO} ({OUT_MASTER_VIDEO.stat().st_size // 1024} KB)")

cmd_poster = [
    "ffmpeg", "-y",
    "-ss", "14.0",
    "-i", str(OUT_MASTER_VIDEO),
    "-vframes", "1",
    "-q:v", "2",
    str(OUT_POSTER)
]
subprocess.run(cmd_poster, check=True)
print(f"[+] Poster frame extracted: {OUT_POSTER}")
