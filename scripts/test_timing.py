import asyncio
import edge_tts
import subprocess
from pathlib import Path

SEGS = [
    ('seg_01', "Trading without precise math isn't risk management—it's gambling. Welcome to TradeSizer: the institutional sizing engine built for 43 global assets.", "+6%"),
    ('seg_02', "TradeSizer streams real-time market data across Forex, Metals, Crude Oil, and Crypto. Selecting Euro US Dollar immediately locks in live interbank rates with zero delay.", "+6%"),
    ('seg_03', "Setup takes seconds. Enter your balance—twenty-five thousand dollars—and choose your risk. At one point five percent, your risk is mathematically capped at three hundred seventy-five dollars.", "+6%"),
    ('seg_04', "Zero jargon. Click Use Live Price to lock entry, type your stop price fifteen pips below, and click plus three R to automatically project your target level.", "+6%"),
    ('seg_05', "On the right: exact BabyPips parity. For three hundred seventy-five dollars risk, you get two point five zero standard lots, or two hundred fifty thousand units—strictly floored to prevent round-up risk.", "+6%"),
    ('seg_06', "Under Model A, lock sixty percent at three R, and ride the rest to four R for a three point four R net win. And on Bitcoin, institutional fractional lots calculate with zero errors.", "+6%"),
    ('seg_07', "One click copies your formatted execution ticket, ready for MetaTrader, cTrader, or your trading journal.", "+6%"),
    ('seg_08', "Eliminate calculation mistakes forever. Trade with institutional precision. This is TradeSizer.", "+6%")
]

TARGET_DURS = [10.0, 12.0, 12.0, 14.0, 14.0, 14.0, 6.0, 8.0]

async def test():
    total_audio = 0
    for idx, (sid, text, rate) in enumerate(SEGS):
        out = f"{sid}_test.mp3"
        c = edge_tts.Communicate(text, "en-US-ChristopherNeural", rate=rate)
        await c.save(out)
        cmd = ["ffprobe", "-v", "error", "-show_entries", "format=duration", "-of", "default=noprint_wrappers=1:nokey=1", out]
        d = float(subprocess.check_output(cmd).decode().strip())
        target = TARGET_DURS[idx]
        total_audio += d
        print(f"{sid}: {d:.2f}s (budget: {target:.1f}s) | diff: {d - target:+.2f}s | {text[:40]}...")
    print(f"\nTotal speech duration: {total_audio:.2f}s (Target video total: 90.0s)")

if __name__ == "__main__":
    asyncio.run(test())
