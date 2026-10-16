import asyncio
import edge_tts
import json
import os
import subprocess
from pathlib import Path

BASE_DIR = Path(r"c:\Builds\Position size calculator\TradeSizer")
DEMO_ASSETS = BASE_DIR / "public" / "demo_assets"
AUDIO_DIR = DEMO_ASSETS / "audio_synced_90s"
AUDIO_DIR.mkdir(parents=True, exist_ok=True)

VOICE = "en-US-ChristopherNeural"

# Exactly 8 synced segments across the 90-second timeline:
# Video layout:
# 0.0s - 8.0s: Cinematic Intro (Stock footage + Motion Graphics)
# 8.0s - 82.0s: Live One-Take App Walkthrough (74.0s)
# 82.0s - 90.0s: Cinematic Outro (Stock footage + Motion Graphics)

SEGMENTS_DEF = [
    {
        "id": "seg_01_intro_hook",
        "start": 0.8,
        "text": "Trading without deterministic math isn't risk management—it's gambling. Welcome to TradeSizer: the institutional position sizer engineered for sixty-seven global instruments.",
        "rate": "+6%"
    },
    {
        "id": "seg_02_broker_feeds",
        "start": 12.0,
        "text": "TradeSizer streams real-time institutional feeds directly from FOREX.COM for currencies and metals, Coinbase for crypto, and the DERIV Broker for synthetic volatilities.",
        "rate": "+6%"
    },
    {
        "id": "seg_03_capital_setup",
        "start": 22.5,
        "text": "Setting up takes seconds. Click Account Balance, type fifty thousand dollars, and select your risk model. At zero point seven five percent, your cash risk is mathematically locked at three hundred and seventy-five dollars.",
        "rate": "+6%"
    },
    {
        "id": "seg_04_price_levels",
        "start": 35.5,
        "text": "Zero complicated jargon. Click Use Live Price to lock your entry, set your stop price fifteen pips below, and click plus three R to project your target level automatically.",
        "rate": "+6%"
    },
    {
        "id": "seg_05_babypips_parity",
        "start": 48.0,
        "text": "On the results card: exact BabyPips parity. For three hundred seventy-five dollars risk, you get two point five zero standard lots, or two hundred fifty thousand units—strictly floored to guarantee zero round-up risk.",
        "rate": "+6%"
    },
    {
        "id": "seg_06_deriv_and_btc",
        "start": 60.5,
        "text": "TradeSizer handles all markets seamlessly. Switch to Deriv Volatilities to size Volatility 75 with live WebSocket streaming, or jump to Bitcoin where fractional lots calculate with zero errors.",
        "rate": "+6%"
    },
    {
        "id": "seg_07_partial_and_ticket",
        "start": 72.8,
        "text": "Lock sixty percent at three R for guaranteed banking. When you are ready, one click copies your execution ticket directly to your platform or journal.",
        "rate": "+6%"
    },
    {
        "id": "seg_08_outro_hook",
        "start": 82.5,
        "text": "Eliminate calculation errors forever. Trade with institutional precision. This is TradeSizer.",
        "rate": "+6%"
    }
]

async def build_audio():
    print("[*] 1/3: Synthesizing Edge TTS Christopher Neural segments...", flush=True)
    manifest = []
    
    for idx, seg in enumerate(SEGMENTS_DEF):
        raw_mp3 = AUDIO_DIR / f"{seg['id']}_raw.mp3"
        norm_wav = AUDIO_DIR / f"{seg['id']}_norm.wav"
        
        print(f"  [+] Synthesizing ({idx+1}/{len(SEGMENTS_DEF)}): {seg['id']}...", flush=True)
        c = edge_tts.Communicate(seg["text"], VOICE, rate=seg["rate"])
        await c.save(str(raw_mp3))
        
        # EBU R128 Loudness Normalization (-14 LUFS, 48kHz, Stereo)
        cmd_norm = [
            "ffmpeg", "-y",
            "-i", str(raw_mp3),
            "-af", "loudnorm=I=-14:LRA=7:TP=-1.5",
            "-ar", "48000",
            "-ac", "2",
            str(norm_wav)
        ]
        subprocess.run(cmd_norm, check=True, stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)
        
        # Measure duration with ffprobe
        probe = subprocess.check_output([
            "ffprobe", "-v", "error", "-show_entries", "format=duration",
            "-of", "default=noprint_wrappers=1:nokey=1", str(norm_wav)
        ]).decode().strip()
        duration = float(probe)
        
        entry = {
            "id": seg["id"],
            "start": seg["start"],
            "duration": duration,
            "end": round(seg["start"] + duration, 2),
            "text": seg["text"],
            "file": str(norm_wav)
        }
        manifest.append(entry)
        print(f"      -> Norm audio: {duration:.2f}s (Timeline: {seg['start']}s -> {entry['end']}s)", flush=True)
        
    # Save timing manifest JSON for Playwright synchronization
    manifest_path = AUDIO_DIR / "timing_manifest.json"
    with open(manifest_path, "w", encoding="utf-8") as f:
        json.dump(manifest, f, indent=2)
    print(f"[+] Timing manifest saved to {manifest_path}", flush=True)
    
    # 2/3: Assembling master 90.0s timeline with adelay & amix
    print("[*] 2/3: Assembling full 90.0s continuous vocal track...", flush=True)
    inputs = []
    filter_parts = []
    
    for idx, entry in enumerate(manifest):
        inputs.extend(["-i", entry["file"]])
        delay_ms = int(entry["start"] * 1000)
        filter_parts.append(f"[{idx}:a]adelay={delay_ms}|{delay_ms}[a{idx}]")
        
    mix_inputs = "".join([f"[a{i}]" for i in range(len(manifest))])
    filter_complex = ";".join(filter_parts) + f";{mix_inputs}amix=inputs={len(manifest)}:normalize=0[mixed];[mixed]apad=whole_dur=90.0[aout]"
    
    master_wav = DEMO_ASSETS / "tradesizer_synced_audio_90s.wav"
    cmd_mix = [
        "ffmpeg", "-y",
        *inputs,
        "-filter_complex", filter_complex,
        "-map", "[aout]",
        "-t", "90.0",
        "-ar", "48000",
        "-ac", "2",
        str(master_wav)
    ]
    subprocess.run(cmd_mix, check=True)
    print(f"[SUCCESS] Master 90.0s Synced Audio Generated: {master_wav}", flush=True)

if __name__ == "__main__":
    asyncio.run(build_audio())
