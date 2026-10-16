import os
import subprocess
from pathlib import Path

base = Path(r"c:\Builds\Position size calculator\TradeSizer\public\demo_assets")
voice_path = base / "voice" / "tradesizer_voice_24s.mp3"
music_path = base / "music" / "happy-beats-business-moves-vol-11-by-ende-dot-app.mp3"
sfx_dir = base / "sfx"

out_audio = base / "tradesizer_onetake_audio.wav"

# ffmpeg complex filter to mix voice, ducked music, and tactile sound effects
# Voice starts at t=0.5s
# Music plays ducked under voice (-14dB)
# SFX layered at key timestamps

filter_complex = (
    # [0:a] voice delayed by 500ms
    "[0:a]adelay=500|500,volume=1.25[vo];"
    # [1:a] music looped and ducked
    "[1:a]volume=0.22,aloop=loop=-1:size=2e+09[bg];"
    # [2:a] impact bell at 0ms and 24500ms
    "[2:a]adelay=0|0,volume=0.85[bell1];"
    "[2:a]adelay=24500|24500,volume=0.9[bell2];"
    # [3:a] switch click at 3500ms and 16000ms
    "[3:a]adelay=3500|3500,volume=0.9[sw1];"
    "[3:a]adelay=16000|16000,volume=0.9[sw2];"
    # [4:a] click at 7000ms
    "[4:a]adelay=7000|7000,volume=0.85[cl1];"
    # [5:a] bong confirmation at 11500ms and 25000ms
    "[5:a]adelay=11500|11500,volume=0.85[bong1];"
    "[5:a]adelay=25000|25000,volume=0.9[bong2];"
    # Mix all inputs
    "[vo][bg][bell1][bell2][sw1][sw2][cl1][bong1][bong2]amix=inputs=9:duration=longest:dropout_transition=2[mix];"
    # Apply master limiter / compressor for broadcast loudness
    "[mix]alimiter=limit=-1.5dB:attack=5:release=50[out]"
)

cmd = [
    "ffmpeg", "-y",
    "-i", str(voice_path),
    "-i", str(music_path),
    "-i", str(sfx_dir / "impact" / "impactBell_heavy_000.ogg"),
    "-i", str(sfx_dir / "interface" / "switch_001.ogg"),
    "-i", str(sfx_dir / "interface" / "click_001.ogg"),
    "-i", str(sfx_dir / "interface" / "bong_001.ogg"),
    "-filter_complex", filter_complex,
    "-map", "[out]",
    "-t", "31.5",
    "-ar", "48000",
    "-ac", "2",
    str(out_audio)
]

print("[*] Mixing master audio track with ffmpeg...")
subprocess.run(cmd, check=True)
print(f"[+] Master audio rendered: {out_audio} ({out_audio.stat().st_size // 1024} KB)")
