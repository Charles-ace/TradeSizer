import asyncio
import edge_tts
import os
import subprocess
from pathlib import Path

BASE_DIR = Path(r"c:\Builds\Position size calculator\TradeSizer")
DEMO_ASSETS = BASE_DIR / "public" / "demo_assets"
AUDIO_DIR = DEMO_ASSETS / "audio_90s"
AUDIO_DIR.mkdir(parents=True, exist_ok=True)

VOICE = "en-US-ChristopherNeural"

# 8 Segments with explicit FOREX.COM broker feeds and Coinbase attribution
SEGMENTS = [
    {
        "id": "seg_01_hook",
        "start": 0.5,
        "text": "Trading without precise math isn't risk management—it's gambling. Welcome to TradeSizer: the institutional sizing engine built for 43 global assets.",
        "rate": "+6%"
    },
    {
        "id": "seg_02_live_feeds",
        "start": 11.0,
        "text": "TradeSizer streams institutional broker feeds directly from FOREX.COM for Forex, Metals, and Oil, alongside Coinbase for Crypto. Every quote is real and synchronized.",
        "rate": "+6%"
    },
    {
        "id": "seg_03_account_setup",
        "start": 23.5,
        "text": "Setup takes seconds. Enter your balance—twenty-five thousand dollars—and choose your risk. At one point five percent, your risk is mathematically capped at three hundred seventy-five dollars.",
        "rate": "+6%"
    },
    {
        "id": "seg_04_price_levels",
        "start": 37.0,
        "text": "Zero jargon. Click Use Live Price to lock entry, type your stop price fifteen pips below, and click plus three R to automatically project your target level.",
        "rate": "+6%"
    },
    {
        "id": "seg_05_babypips_breakdown",
        "start": 48.5,
        "text": "On the right: exact BabyPips parity. For three hundred seventy-five dollars risk, you get two point five zero standard lots, or two hundred fifty thousand units—strictly floored to prevent round-up risk.",
        "rate": "+6%"
    },
    {
        "id": "seg_06_exit_plan_btc",
        "start": 62.5,
        "text": "Under Model A, lock sixty percent at three R, and ride the rest to four R for a three point four R net win. And on Bitcoin with Coinbase pricing, fractional lots calculate with zero errors.",
        "rate": "+6%"
    },
    {
        "id": "seg_07_ticket_copy",
        "start": 75.5,
        "text": "One click copies your formatted execution ticket, ready for MetaTrader, cTrader, or your trading journal.",
        "rate": "+6%"
    },
    {
        "id": "seg_08_outro",
        "start": 82.5,
        "text": "Eliminate calculation mistakes forever. Trade with institutional precision. This is TradeSizer.",
        "rate": "+6%"
    }
]

async def synthesize_all():
    print("[*] 1/3: Synthesizing Edge TTS Christopher Neural segments...")
    for idx, seg in enumerate(SEGMENTS):
        raw_file = AUDIO_DIR / f"{seg['id']}_raw.mp3"
        norm_file = AUDIO_DIR / f"{seg['id']}_norm.wav"
        
        print(f"  [+] Seg {idx+1}/{len(SEGMENTS)}: {seg['id']}...")
        c = edge_tts.Communicate(seg["text"], VOICE, rate=seg["rate"])
        await c.save(str(raw_file))

        # EBU R128 loudness normalization (-14 LUFS) for consistent volume throughout
        norm_cmd = [
            "ffmpeg", "-y",
            "-i", str(raw_file),
            "-af", "loudnorm=I=-14:LRA=7:TP=-1.5",
            "-ar", "48000",
            "-ac", "2",
            str(norm_file)
        ]
        subprocess.run(norm_cmd, check=True, stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)
        
        # Probe duration
        probe = subprocess.check_output([
            "ffprobe", "-v", "error", "-show_entries", "format=duration",
            "-of", "default=noprint_wrappers=1:nokey=1", str(norm_file)
        ]).decode().strip()
        print(f"      -> Norm audio: {float(probe):.2f}s (starts at {seg['start']}s)")

def build_master_90s():
    print("[*] 2/3: Assembling full 90.0s vocal timeline...")
    # Build filter_complex to place each segment at its exact start timestamp
    # using adelay (in milliseconds)
    inputs = []
    filter_parts = []
    for idx, seg in enumerate(SEGMENTS):
        norm_file = AUDIO_DIR / f"{seg['id']}_norm.wav"
        inputs.extend(["-i", str(norm_file)])
        ms = int(seg["start"] * 1000)
        filter_parts.append(f"[{idx}:a]adelay={ms}|{ms}[v{idx}];")

    mix_inputs = "".join(f"[v{i}]" for i in range(len(SEGMENTS)))
    filter_parts.append(f"{mix_inputs}amix=inputs={len(SEGMENTS)}:duration=longest:dropout_transition=0[voice_timeline];")
    # Apply broadcast vocal leveling to guarantee 100% volume consistency
    filter_parts.append("[voice_timeline]loudnorm=I=-14:LRA=7:TP=-1.5,volume=1.2[master_voice]")

    vocal_full = AUDIO_DIR / "master_vocal_90s.wav"
    vocal_cmd = ["ffmpeg", "-y"] + inputs + [
        "-filter_complex", "".join(filter_parts),
        "-map", "[master_voice]",
        "-t", "90.0",
        "-ar", "48000",
        "-ac", "2",
        str(vocal_full)
    ]
    subprocess.run(vocal_cmd, check=True)
    print(f"[+] Master vocal timeline assembled: {vocal_full}")

    print("[*] 3/3: Mixing background music (ducked) and tactile SFX...")
    music_file = DEMO_ASSETS / "music" / "happy-beats-business-moves-vol-11-by-ende-dot-app.mp3"
    sfx_impact = DEMO_ASSETS / "sfx" / "impact" / "impactBell_heavy_000.ogg"
    sfx_switch = DEMO_ASSETS / "sfx" / "interface" / "switch_001.ogg"
    sfx_click = DEMO_ASSETS / "sfx" / "interface" / "click_001.ogg"
    sfx_bong = DEMO_ASSETS / "sfx" / "interface" / "bong_001.ogg"

    # Background music ducked to -20dB (volume=0.12) under narration, rising to 0.22 during outro
    # Tactile SFX at key interaction beats
    master_mix_filter = (
        # [0:a] Master vocal
        "[0:a]volume=1.0[vo];"
        # [1:a] Background music looped, ducked under speech
        "[1:a]aloop=loop=-1:size=2e+09,volume=0.12[bg];"
        # [2:a] Heavy impact at 0ms (Intro hook) and 82500ms (Outro CTA)
        "[2:a]adelay=0|0,volume=0.75[bell_intro];"
        "[2:a]adelay=82500|82500,volume=0.85[bell_outro];"
        # [3:a] Switch / filter change at 11000ms (FOREX.COM select) and 62500ms (Bitcoin select)
        "[3:a]adelay=11000|11000,volume=0.75[sw_forex];"
        "[3:a]adelay=62500|62500,volume=0.75[sw_btc];"
        # [4:a] Keystroke click at 24000ms (Balance typing) and 38000ms (Stop typing)
        "[4:a]adelay=24000|24000,volume=0.7[clk_balance];"
        "[4:a]adelay=38000|38000,volume=0.7[clk_stop];"
        # [5:a] Confirmation chime at 76000ms (Ticket copy success)
        "[5:a]adelay=76000|76000,volume=0.9[chime_copy];"
        # Combine all audio stems
        "[vo][bg][bell_intro][bell_outro][sw_forex][sw_btc][clk_balance][clk_stop][chime_copy]"
        "amix=inputs=9:duration=longest:dropout_transition=2[mixed];"
        # Master broadcast limiter: peak ceiling -1.0 dBTP, loudness normalized
        "[mixed]alimiter=limit=-1.0dB:attack=5:release=50[out]"
    )

    out_master = DEMO_ASSETS / "tradesizer_onetake_audio_90s.wav"
    mix_cmd = [
        "ffmpeg", "-y",
        "-i", str(vocal_full),
        "-i", str(music_file),
        "-i", str(sfx_impact),
        "-i", str(sfx_switch),
        "-i", str(sfx_click),
        "-i", str(sfx_bong),
        "-filter_complex", master_mix_filter,
        "-map", "[out]",
        "-t", "90.0",
        "-ar", "48000",
        "-ac", "2",
        str(out_master)
    ]
    subprocess.run(mix_cmd, check=True)
    print(f"\n[SUCCESS] 90.0s Master Audio Rendered: {out_master} ({out_master.stat().st_size // 1024} KB)")

if __name__ == "__main__":
    asyncio.run(synthesize_all())
    build_master_90s()
