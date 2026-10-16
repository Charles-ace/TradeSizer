"""
ElevenLabs Audio Synthesizer & Video Syncer for TradeSizer
Connects to ElevenLabs API (v1/text-to-speech) to generate
ultra-realistic voiceover using Matilda (or custom voice)
and re-renders the final demo video.
"""

import os
import sys
import json
import subprocess
from pathlib import Path
import urllib.request
import urllib.error

BASE_DIR = Path(r"c:\Builds\Position size calculator\TradeSizer")
ASSETS_DIR = BASE_DIR / "demo_assets"
OUTPUT_VIDEO = BASE_DIR / "TradeSizer_ElevenLabs_Demo.mp4"

# ElevenLabs default voice: Matilda (id: XrExE9yKIg1WjnnlVkGX) or user choice
DEFAULT_VOICE_ID = "XrExE9yKIg1WjnnlVkGX" 

VOICEOVER_SEGMENTS = [
    {
        "id": "scene_01_intro",
        "text": "Welcome to TradeSizer. A deterministic trading position size calculator designed for multi-model risk strategies."
    },
    {
        "id": "scene_02_model_a",
        "text": "Selecting Model A automatically allocates a strict zero point seven five percent risk budget. For a twenty-five thousand dollar account, that is exactly one hundred and eighty-seven dollars and fifty cents."
    },
    {
        "id": "scene_03_partials",
        "text": "Models A and B feature a mathematically derived partial exit. At three R, sixty-six point six seven percent is closed, locking two R in bank. The remaining thirty-three percent runs to four R. A full win totals three point three three R, or six hundred and twenty-five dollars."
    },
    {
        "id": "scene_04_breakeven",
        "text": "Use the Move Stop to Breakeven toggle to project your worst-case outcome after the partial fills. If stopped at breakeven, you keep two R. If left at the original stop, you retain one point six seven R."
    },
    {
        "id": "scene_05_model_c",
        "text": "For strict risk models, Models C and D enforce a zero point five percent risk budget with a single full exit at three R, with no partial closes."
    },
    {
        "id": "scene_06_multi_asset",
        "text": "TradeSizer supports Forex, Gold, NASDAQ, Deriv synthetics, and Bitcoin. The built-in margin guard calculates required leverage and verifies your free margin before execution."
    },
    {
        "id": "scene_07_ticket",
        "text": "When you are ready, click Copy Trade Setup to export a clean order ticket ready for your trading platform or trade journal."
    }
]

def synthesize_with_elevenlabs(api_key: str, voice_id: str = DEFAULT_VOICE_ID):
    print(f"[*] Calling ElevenLabs API with Voice ID: {voice_id}...")
    headers = {
        "Accept": "audio/mpeg",
        "Content-Type": "application/json",
        "xi-api-key": api_key
    }

    mp3_files = []
    for seg in VOICEOVER_SEGMENTS:
        seg_id = seg["id"]
        mp3_path = ASSETS_DIR / f"{seg_id}_elevenlabs.mp3"
        url = f"https://api.elevenlabs.io/v1/text-to-speech/{voice_id}"
        payload = {
            "text": seg["text"],
            "model_id": "eleven_monolingual_v1",
            "voice_settings": {
                "stability": 0.50,
                "similarity_boost": 0.75
            }
        }
        
        req = urllib.request.Request(
            url,
            data=json.dumps(payload).encode("utf-8"),
            headers=headers,
            method="POST"
        )

        try:
            with urllib.request.urlopen(req) as resp:
                with open(mp3_path, "wb") as f_out:
                    f_out.write(resp.read())
            print(f"  [+] Synthesized {seg_id} via ElevenLabs -> {mp3_path.name}")
            mp3_files.append(mp3_path)
        except urllib.error.HTTPError as e:
            print(f"  [-] ElevenLabs HTTP error for {seg_id}: {e.code} - {e.read().decode('utf-8')}")
            return False

    return True

if __name__ == "__main__":
    api_key = os.environ.get("ELEVENLABS_API_KEY")
    if len(sys.argv) > 1:
        api_key = sys.argv[1]

    if not api_key:
        print("[!] No ELEVENLABS_API_KEY provided.")
        print("Usage: python scripts/elevenlabs_synthesize.py <YOUR_API_KEY>")
        sys.exit(1)

    voice_id = sys.argv[2] if len(sys.argv) > 2 else DEFAULT_VOICE_ID
    success = synthesize_with_elevenlabs(api_key, voice_id)
    if success:
        print("[+] All ElevenLabs segments synthesized successfully.")
