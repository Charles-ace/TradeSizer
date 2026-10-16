import asyncio
import edge_tts
import subprocess
from pathlib import Path

BASE_DIR = Path(r"c:\Builds\Position size calculator\TradeSizer")
AUDIO_DIR = BASE_DIR / "demo_assets" / "audio_90s"
AUDIO_DIR.mkdir(parents=True, exist_ok=True)

VOICE = "en-US-ChristopherNeural"

# 8 Segments finely tuned to fit the 90.0s video timeline with natural pauses
SEGMENTS = [
    {
        "id": "seg_01_hook",
        "target_start": 0.0,
        "target_dur": 10.5,
        "rate": "+6%",
        "text": "Trading without precise math isn't risk management—it's gambling. Welcome to TradeSizer: the institutional sizing engine built for 43 global assets."
    },
    {
        "id": "seg_02_live_feeds",
        "target_start": 10.8,
        "target_dur": 12.2,
        "rate": "+6%",
        "text": "TradeSizer streams real-time market data across Forex, Metals, Crude Oil, and Crypto. Selecting Euro US Dollar immediately locks in live interbank rates with zero delay."
    },
    {
        "id": "seg_03_account_setup",
        "target_start": 23.2,
        "target_dur": 13.0,
        "rate": "+6%",
        "text": "Setup takes seconds. Enter your balance—twenty-five thousand dollars—and choose your risk. At one point five percent, your risk is mathematically capped at three hundred seventy-five dollars."
    },
    {
        "id": "seg_04_price_levels",
        "target_start": 36.5,
        "target_dur": 11.0,
        "rate": "+6%",
        "text": "Zero jargon. Click Use Live Price to lock entry, type your stop price fifteen pips below, and click plus three R to automatically project your target level."
    },
    {
        "id": "seg_05_babypips_breakdown",
        "target_start": 48.0,
        "target_dur": 13.5,
        "rate": "+6%",
        "text": "On the right: exact BabyPips parity. For three hundred seventy-five dollars risk, you get two point five zero standard lots, or two hundred fifty thousand units—strictly floored to prevent round-up risk."
    },
    {
        "id": "seg_06_exit_plan_btc",
        "target_start": 62.0,
        "target_dur": 12.5,
        "rate": "+6%",
        "text": "Under Model A, lock sixty percent at three R, and ride the rest to four R for a three point four R net win. And on Bitcoin, institutional fractional lots calculate with zero errors."
    },
    {
        "id": "seg_07_ticket_copy",
        "target_start": 75.0,
        "target_dur": 7.2,
        "rate": "+6%",
        "text": "One click copies your formatted execution ticket, ready for MetaTrader, cTrader, or your trading journal."
    },
    {
        "id": "seg_08_outro",
        "target_start": 82.5,
        "target_dur": 7.4,
        "rate": "+6%",
        "text": "Eliminate calculation mistakes forever. Trade with institutional precision. This is TradeSizer."
    }
]

async def generate_all_speech():
    print("[*] Generating neural voiceover segments with Edge TTS (Christopher Neural)...")
    
    for idx, seg in enumerate(SEGMENTS):
        out_file = AUDIO_DIR / f"{seg['id']}.mp3"
        print(f"  [+] Synthesizing Segment {idx+1}/{len(SEGMENTS)}: {seg['id']}...")
        communicate = edge_tts.Communicate(seg["text"], VOICE, rate=seg["rate"], pitch="+0Hz")
        await communicate.save(str(out_file))

        # Check duration
        probe_cmd = [
            "ffprobe", "-v", "error",
            "-show_entries", "format=duration",
            "-of", "default=noprint_wrappers=1:nokey=1",
            str(out_file)
        ]
        actual_dur = float(subprocess.check_output(probe_cmd).decode("utf-8").strip())
        seg["actual_dur"] = actual_dur
        print(f"      -> {seg['id']}: {actual_dur:.2f}s (budget: {seg['target_dur']}s)")

    print("\n[+] Normalizing and building master 90.0s audio track...")

if __name__ == "__main__":
    asyncio.run(generate_all_speech())
