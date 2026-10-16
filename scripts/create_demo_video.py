"""
TradeSizer Demo Video Generator
Uses Playwright to capture live HD screenshots of TradeSizer,
generates professional title/outro cards, synthesizes voiceover narration,
and compiles everything into a finished MP4 video using ffmpeg.
"""

import os
import sys
import time
import subprocess
from pathlib import Path
from playwright.sync_api import sync_playwright
from PIL import Image, ImageDraw, ImageFont

BASE_DIR = Path(r"c:\Builds\Position size calculator\TradeSizer")
ASSETS_DIR = BASE_DIR / "demo_assets"
FRAMES_DIR = ASSETS_DIR / "frames"
OUTPUT_VIDEO = BASE_DIR / "TradeSizer_Demo_Walkthrough.mp4"

ASSETS_DIR.mkdir(parents=True, exist_ok=True)
FRAMES_DIR.mkdir(parents=True, exist_ok=True)

# 1. Voiceover Narration Script
VOICEOVER_SEGMENTS = [
    {
        "id": "scene_01_intro",
        "title": "TradeSizer — Institutional Position Sizing",
        "subtitle": "Deterministic Multi-Model Risk Engine for High-Discipline Traders",
        "text": "Welcome to TradeSizer, a deterministic trading position size calculator designed for multi-model risk strategies.",
        "duration": 5.0
    },
    {
        "id": "scene_02_model_a",
        "title": "Model A: Confirmation System (0.75% Risk)",
        "subtitle": "EURUSD | $25,000 Equity | 15 Pips Stop | 1.25 Lots",
        "text": "Selecting Model A automatically allocates a strict zero point seven five percent risk budget. For a twenty-five thousand dollar account, that is exactly one hundred and eighty-seven dollars and fifty cents.",
        "duration": 7.0
    },
    {
        "id": "scene_03_partials",
        "title": "The 3R / 2R-Banked / 4R-Final Partial System",
        "subtitle": "Derived Exit: Closes 66.67% at 3R to Lock 2R | Remainder Runs to 4R",
        "text": "Models A and B feature a mathematically derived partial exit. At three R, sixty-six point six seven percent is closed, locking two R in bank. The remaining thirty-three percent runs to four R. A full win totals three point three three R, or six hundred and twenty-five dollars.",
        "duration": 10.0
    },
    {
        "id": "scene_04_breakeven",
        "title": "Post-Partial Risk Management",
        "subtitle": "Move Stop to Breakeven Toggle | Breakeven: +2.0R ($375) vs Orig Stop: +1.67R ($312)",
        "text": "Use the Move Stop to Breakeven toggle to project your worst-case outcome after the partial fills. If stopped at breakeven, you keep two R. If left at the original stop, you retain one point six seven R.",
        "duration": 8.0
    },
    {
        "id": "scene_05_model_c",
        "title": "Models C & D: Single Full Exit at 3R",
        "subtitle": "0.50% Equity Risk ($125) | Single Exit at 3R ($375) | No Partials",
        "text": "For strict risk models, Models C and D enforce a zero point five percent risk budget with a single full exit at three R, with no partial closes.",
        "duration": 6.5
    },
    {
        "id": "scene_06_multi_asset",
        "title": "Multi-Asset Engine & Margin Guard",
        "subtitle": "Forex, Metals (Gold), Indices (NAS100), Deriv Synthetics & Crypto (BTCUSD)",
        "text": "TradeSizer supports Forex, Gold, NASDAQ, Deriv synthetics, and Bitcoin. The built-in margin guard calculates required leverage and verifies your free margin before execution.",
        "duration": 8.0
    },
    {
        "id": "scene_07_ticket",
        "title": "One-Click Order Ticket Generation",
        "subtitle": "Copy Trade Setup for Immediate Execution & Journaling",
        "text": "When you are ready, click Copy Trade Setup to export a clean order ticket ready for your trading platform or trade journal.",
        "duration": 5.5
    }
]

def create_title_card(title: str, subtitle: str, output_path: Path):
    """Generate high-resolution 1920x1080 banner slide"""
    img = Image.new("RGB", (1920, 1080), color=(11, 15, 25))
    draw = ImageDraw.Draw(img)

    # Gradient border top
    draw.rectangle([(0, 0), (1920, 6)], fill=(6, 182, 212))

    # Decorative background glows
    draw.ellipse([(1400, -100), (2000, 500)], fill=(15, 23, 42))

    # Text rendering
    # Header tag
    draw.text((120, 320), "TRADESIZER • PROFESSIONAL RISK ENGINE", fill=(6, 182, 212))
    # Big title
    draw.text((120, 380), title, fill=(255, 255, 255))
    # Subtitle
    draw.text((120, 480), subtitle, fill=(148, 163, 184))

    # Bottom status bar
    draw.line([(120, 780), (1800, 780)], fill=(30, 41, 59), width=2)
    draw.text((120, 810), "Deterministic Financial Calculations • Capital Preservation Architecture • React 19 + TypeScript", fill=(100, 116, 139))

    img.save(output_path)

def capture_browser_screenshots():
    """Launch Playwright and capture UI states"""
    print("[1/4] Launching Playwright Chromium to capture UI scenes...")
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        context = browser.new_context(viewport={"width": 1920, "height": 1080})
        page = context.new_page()
        page.goto("http://localhost:4173")
        page.wait_for_timeout(1000)

        # Scene 1: Title card
        create_title_card("TradeSizer", "Institutional Position Sizing & Multi-Model Risk Engine", FRAMES_DIR / "scene_01_intro.png")

        # Scene 2: Model A default setup
        page.screenshot(path=str(FRAMES_DIR / "scene_02_model_a.png"))
        print("  - Captured Scene 2 (Model A Default)")

        # Scene 3: Scroll slightly to focus on Exit Table
        page.screenshot(path=str(FRAMES_DIR / "scene_03_partials.png"))
        print("  - Captured Scene 3 (Partial Exit Schedule)")

        # Scene 4: Toggle breakeven
        page.click("text=Move stop to breakeven after partial:")
        page.wait_for_timeout(300)
        page.screenshot(path=str(FRAMES_DIR / "scene_04_breakeven.png"))
        print("  - Captured Scene 4 (Breakeven Worst-Case Toggle)")

        # Scene 5: Switch to Model C
        page.click("text=Model C")
        page.wait_for_timeout(300)
        page.screenshot(path=str(FRAMES_DIR / "scene_05_model_c.png"))
        print("  - Captured Scene 5 (Model C 3R Single Exit)")

        # Scene 6: Switch to Crypto (BTCUSD)
        page.click("button:has-text('Crypto')")
        page.wait_for_timeout(300)
        page.screenshot(path=str(FRAMES_DIR / "scene_06_multi_asset.png"))
        print("  - Captured Scene 6 (BTCUSD Crypto & Margin)")

        # Scene 7: Click Copy Trade Setup
        page.click("text=Copy Trade Setup")
        page.wait_for_timeout(300)
        page.screenshot(path=str(FRAMES_DIR / "scene_07_ticket.png"))
        print("  - Captured Scene 7 (Order Ticket Export)")

        browser.close()

def generate_voiceover_audio():
    """Generate audio files using Windows Speech API (SAPI) or write audio tracks"""
    print("[2/4] Generating voiceover narration tracks...")
    audio_files = []

    # PowerShell SAPI script generator for crystal-clear TTS audio
    for seg in VOICEOVER_SEGMENTS:
        wav_path = ASSETS_DIR / f"{seg['id']}.wav"
        ps_script = f"""
Add-Type -AssemblyName System.Speech
$speak = New-Object System.Speech.Synthesis.SpeechSynthesizer
$speak.Rate = 0
$speak.SetOutputToWaveFile('{str(wav_path).replace('\\', '\\\\')}')
$speak.Speak('{seg['text']}')
$speak.Dispose()
"""
        cmd = ["powershell", "-NoProfile", "-Command", ps_script]
        subprocess.run(cmd, check=True)
        audio_files.append(wav_path)
        print(f"  - Generated audio for {seg['id']}")

    return audio_files

def compile_video():
    """Use ffmpeg to combine frames and audio into an MP4 video"""
    print("[3/4] Compiling scenes with ffmpeg...")
    
    # Locate ffmpeg
    ffmpeg_cmd = "ffmpeg"
    
    # Create segment video clips with audio
    clip_list_path = ASSETS_DIR / "clips.txt"
    with open(clip_list_path, "w", encoding="utf-8") as f_list:
        for seg in VOICEOVER_SEGMENTS:
            seg_id = seg["id"]
            img_path = FRAMES_DIR / f"{seg_id}.png"
            wav_path = ASSETS_DIR / f"{seg_id}.wav"
            clip_path = ASSETS_DIR / f"{seg_id}.mp4"

            # Create video clip with loop image and audio duration
            cmd = [
                ffmpeg_cmd, "-y",
                "-loop", "1",
                "-i", str(img_path),
                "-i", str(wav_path),
                "-c:v", "libx264",
                "-tune", "stillimage",
                "-c:a", "aac",
                "-b:a", "192k",
                "-pix_fmt", "yuv420p",
                "-shortest",
                str(clip_path)
            ]
            subprocess.run(cmd, check=True, stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)
            f_list.write(f"file '{clip_path.resolve()}'\n")
            print(f"  - Compiled clip for {seg_id}")

    # Concatenate all clips into final MP4
    print("[4/4] Merging all clips into TradeSizer_Demo_Walkthrough.mp4...")
    concat_cmd = [
        ffmpeg_cmd, "-y",
        "-f", "concat",
        "-safe", "0",
        "-i", str(clip_list_path),
        "-c", "copy",
        str(OUTPUT_VIDEO)
    ]
    subprocess.run(concat_cmd, check=True)
    print(f"\n[SUCCESS] Demo video created at: {OUTPUT_VIDEO}")
    file_size_mb = OUTPUT_VIDEO.stat().st_size / (1024 * 1024)
    print(f"File size: {file_size_mb:.2f} MB")

if __name__ == "__main__":
    capture_browser_screenshots()
    generate_voiceover_audio()
    compile_video()
