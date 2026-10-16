import os
import sys
import json
import urllib.request
import urllib.error
import subprocess
from pathlib import Path

BASE_DIR = Path(r"c:\Builds\Position size calculator\TradeSizer")
ASSETS_DIR = BASE_DIR / "demo_assets"
FRAMES_DIR = ASSETS_DIR / "frames"
OUTPUT_VIDEO = BASE_DIR / "TradeSizer_ElevenLabs_Demo.mp4"

API_KEY = "sk_e4608becf506b5de5563ab1d4a150c4d8186979cc7fd8ce5"

VOICEOVER_SEGMENTS = [
    {
        "id": "scene_01_intro",
        "text": "Welcome to TradeSizer. A deterministic trading position size calculator designed for multi-model risk strategies."
    },
    {
        "id": "scene_02_model_a",
        "text": "Selecting Model A automatically allocates a strict 0.75% risk budget. For a $25,000 account, that is exactly $187.50. With a 15-pip stop on EURUSD, TradeSizer calculates an exact 1.25 standard lots."
    },
    {
        "id": "scene_03_partials",
        "text": "Models A and B feature a mathematically derived partial exit. At 3R, 66.67% of the position is closed, locking 2R of profit in the bank. The remaining 33% runs to 4R. A full win totals 3.33R, or $625.50."
    },
    {
        "id": "scene_04_breakeven",
        "text": "Use the Move Stop to Breakeven toggle to project your worst-case outcome after the partial fills. If stopped at breakeven, you keep 2R. If left at the original stop, you retain 1.67R."
    },
    {
        "id": "scene_05_model_c",
        "text": "For strict risk models, Models C and D enforce a 0.5% risk budget with a single full exit at 3R, with no partial closes."
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

def get_voice_id(api_key):
    url = "https://api.elevenlabs.io/v1/voices"
    req = urllib.request.Request(url, headers={"xi-api-key": api_key})
    try:
        with urllib.request.urlopen(req) as resp:
            data = json.loads(resp.read().decode("utf-8"))
            voices = data.get("voices", [])
            print(f"[+] Connected to ElevenLabs! Account has {len(voices)} available voices.")
            
            # Prefer Matilda, Rachel, or first voice
            for v in voices:
                if "matilda" in v.get("name", "").lower():
                    print(f"[*] Selected voice: {v['name']} ({v['voice_id']})")
                    return v["voice_id"], v["name"]
            for v in voices:
                if "rachel" in v.get("name", "").lower():
                    print(f"[*] Selected voice: {v['name']} ({v['voice_id']})")
                    return v["voice_id"], v["name"]
            
            # Fallback to first voice
            if voices:
                chosen = voices[0]
                print(f"[*] Selected voice: {chosen['name']} ({chosen['voice_id']})")
                return chosen["voice_id"], chosen["name"]
    except Exception as e:
        print(f"[-] Could not list voices: {e}")
    
    # Default public Matilda voice ID
    return "XrExE9yKIg1WjnnlVkGX", "Matilda (Default)"

def synthesize_audio(api_key, voice_id):
    headers = {
        "Accept": "audio/mpeg",
        "Content-Type": "application/json",
        "xi-api-key": api_key
    }
    
    audio_paths = []
    print("\n[*] Synthesizing voiceover audio tracks via ElevenLabs API...")
    
    # Try multilingual v2 or turbo v2.5 or fallback to monolingual
    models_to_try = ["eleven_turbo_v2_5", "eleven_multilingual_v2", "eleven_monolingual_v1"]
    
    for seg in VOICEOVER_SEGMENTS:
        seg_id = seg["id"]
        out_mp3 = ASSETS_DIR / f"{seg_id}_elevenlabs.mp3"
        url = f"https://api.elevenlabs.io/v1/text-to-speech/{voice_id}"
        
        success = False
        last_err = ""
        for model in models_to_try:
            payload = {
                "text": seg["text"],
                "model_id": model,
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
                    with open(out_mp3, "wb") as f_out:
                        f_out.write(resp.read())
                print(f"  [+] Synthesized {seg_id} using {model} ({out_mp3.stat().st_size / 1024:.1f} KB)")
                audio_paths.append(out_mp3)
                success = True
                break
            except urllib.error.HTTPError as e:
                last_err = f"{e.code} - {e.read().decode('utf-8')}"
                continue
            except Exception as e:
                last_err = str(e)
                continue
                
        if not success:
            print(f"  [-] Failed to synthesize {seg_id}: {last_err}")
            return False

    return True

def compile_elevenlabs_video():
    print("\n[*] Compiling final demo video using ffmpeg and ElevenLabs audio...")
    ffmpeg_cmd = "ffmpeg"
    clip_list_path = ASSETS_DIR / "elevenlabs_clips.txt"
    
    with open(clip_list_path, "w", encoding="utf-8") as f_list:
        for seg in VOICEOVER_SEGMENTS:
            seg_id = seg["id"]
            img_path = FRAMES_DIR / f"{seg_id}.png"
            mp3_path = ASSETS_DIR / f"{seg_id}_elevenlabs.mp3"
            clip_path = ASSETS_DIR / f"{seg_id}_el.mp4"

            # Create video clip with loop image and audio duration + 0.5s pause
            cmd = [
                ffmpeg_cmd, "-y",
                "-loop", "1",
                "-i", str(img_path),
                "-i", str(mp3_path),
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
            print(f"  [+] Rendered clip: {clip_path.name}")

    # Concatenate all clips into final video
    print(f"\n[*] Merging clips into: {OUTPUT_VIDEO}...")
    concat_cmd = [
        ffmpeg_cmd, "-y",
        "-f", "concat",
        "-safe", "0",
        "-i", str(clip_list_path),
        "-c", "copy",
        str(OUTPUT_VIDEO)
    ]
    subprocess.run(concat_cmd, check=True, stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)
    
    size_mb = OUTPUT_VIDEO.stat().st_size / (1024 * 1024)
    print(f"\n[SUCCESS] ElevenLabs Demo Video generated successfully!")
    print(f"Output File: {OUTPUT_VIDEO}")
    print(f"File Size: {size_mb:.2f} MB")

if __name__ == "__main__":
    voice_id, voice_name = get_voice_id(API_KEY)
    if synthesize_audio(API_KEY, voice_id):
        compile_elevenlabs_video()
    else:
        print("[-] Synthesis failed. Check API key and account credits.")
