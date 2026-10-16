import asyncio
import os
import shutil
import time
from pathlib import Path
from playwright.async_api import async_playwright

OUT_DIR = Path(r"c:\Builds\Position size calculator\TradeSizer\public\demo_assets\live_app_frames")
OUT_DIR.mkdir(parents=True, exist_ok=True)
OUT_VIDEO = Path(r"c:\Builds\Position size calculator\TradeSizer\public\demo_assets\live_app_recording_30s.mp4")

async def record_app():
    async with async_playwright() as p:
        browser = await p.chromium.launch(headless=True)
        # Create context with video recording enabled
        temp_video_dir = OUT_DIR / "_temp_video"
        temp_video_dir.mkdir(parents=True, exist_ok=True)
        
        context = await browser.new_context(
            viewport={"width": 1920, "height": 1080},
            device_scale_factor=1,
            record_video_dir=str(temp_video_dir),
            record_video_size={"width": 1920, "height": 1080}
        )
        
        page = await context.new_page()
        print("[*] Navigating to TradeSizer at http://localhost:5173...")
        await page.goto("http://localhost:5173", wait_until="networkidle")
        await page.wait_for_timeout(1000)
        
        # Inject custom styled cursor dot so the pointer is clearly visible in recording
        await page.evaluate("""() => {
            const cursor = document.createElement('div');
            cursor.id = 'demo-virtual-cursor';
            cursor.style.cssText = 'position:fixed;width:24px;height:24px;border-radius:50%;background:rgba(184,98,47,0.85);border:2px solid #ffffff;box-shadow:0 0 16px rgba(184,98,47,0.8);pointer-events:none;z-index:999999;transition:transform 0.08s ease, width 0.15s ease, height 0.15s ease;transform:translate(-50%, -50%);';
            document.body.appendChild(cursor);
            window.addEventListener('mousemove', (e) => {
                cursor.style.left = e.clientX + 'px';
                cursor.style.top = e.clientY + 'px';
            });
            window.addEventListener('mousedown', () => {
                cursor.style.transform = 'translate(-50%, -50%) scale(0.75)';
                cursor.style.background = '#217a47';
            });
            window.addEventListener('mouseup', () => {
                cursor.style.transform = 'translate(-50%, -50%) scale(1)';
                cursor.style.background = 'rgba(184,98,47,0.85)';
            });
        }""")
        
        async def smooth_move_and_click(x, y, duration_s=0.6, wait_after_ms=400):
            # get current mouse position approximation
            steps = int(duration_s * 30)
            cur_x = 960
            cur_y = 540
            for i in range(1, steps + 1):
                t = i / steps
                # smoother step curve
                k = t * t * (3 - 2 * t)
                mx = cur_x + (x - cur_x) * k
                my = cur_y + (y - cur_y) * k
                await page.mouse.move(mx, my)
                await page.wait_for_timeout(int(duration_s * 1000 / steps))
            await page.wait_for_timeout(100)
            await page.mouse.click(x, y)
            await page.wait_for_timeout(wait_after_ms)

        print("[*] Beat 1: Hover over Header & Neatlogs brand mark...")
        await page.mouse.move(960, 200)
        await page.wait_for_timeout(1500)
        
        print("[*] Beat 2: Click $25,000 account preset...")
        # Locate $25k button or coordinate
        btn_25k = page.get_by_text("$25,000", exact=False).first
        if await btn_25k.count() > 0:
            box = await btn_25k.bounding_box()
            if box:
                await smooth_move_and_click(box['x'] + box['width']/2, box['y'] + box['height']/2, duration_s=0.8)
        
        print("[*] Beat 3: Hover and select Model A (Confirmation)...")
        model_a = page.get_by_text("Model A", exact=False).first
        if await model_a.count() > 0:
            box = await model_a.bounding_box()
            if box:
                await smooth_move_and_click(box['x'] + box['width']/2, box['y'] + box['height']/2, duration_s=0.7)
        await page.wait_for_timeout(1200)

        print("[*] Beat 4: Select EURUSD in pair catalog...")
        pair_select = page.locator("select").first
        if await pair_select.count() > 0:
            box = await pair_select.bounding_box()
            if box:
                await smooth_move_and_click(box['x'] + box['width']/2, box['y'] + box['height']/2, duration_s=0.7)
                await pair_select.select_option("EURUSD")
        await page.wait_for_timeout(1000)

        print("[*] Beat 5: Set Stop Loss to 15 pips...")
        stop_input = page.locator("input[type='number']").first
        if await stop_input.count() > 0:
            box = await stop_input.bounding_box()
            if box:
                await smooth_move_and_click(box['x'] + box['width']/2, box['y'] + box['height']/2, duration_s=0.6)
                await stop_input.fill("15")
        await page.wait_for_timeout(1500)

        print("[*] Beat 6: Select 60% Partial at 3R preset...")
        btn_60 = page.get_by_text("60%", exact=False).first
        if await btn_60.count() > 0:
            box = await btn_60.bounding_box()
            if box:
                await smooth_move_and_click(box['x'] + box['width']/2, box['y'] + box['height']/2, duration_s=0.6)
        await page.wait_for_timeout(1500)

        print("[*] Beat 7: Toggle Move Stop to Breakeven...")
        be_toggle = page.locator("input[type='checkbox']").first
        if await be_toggle.count() > 0:
            box = await be_toggle.bounding_box()
            if box:
                await smooth_move_and_click(box['x'] + box['width']/2, box['y'] + box['height']/2, duration_s=0.6)
        await page.wait_for_timeout(1500)

        print("[*] Beat 8: Click Copy Ticket button in terminal...")
        copy_btn = page.get_by_text("Copy Ticket", exact=False).first
        if await copy_btn.count() > 0:
            box = await copy_btn.bounding_box()
            if box:
                await smooth_move_and_click(box['x'] + box['width']/2, box['y'] + box['height']/2, duration_s=0.8)
        await page.wait_for_timeout(2500)
        
        # Idle settle hold
        await page.wait_for_timeout(1500)
        
        # Close page and context to finalize video
        await page.close()
        video_path = await page.video.path()
        await context.close()
        await browser.close()
        
        print(f"[+] Raw video recorded to: {video_path}")
        # Move video to destination
        shutil.move(video_path, str(OUT_VIDEO))
        print(f"[+] Moved live walkthrough video to: {OUT_VIDEO}")
        
        # Extract frames at 30 fps
        import subprocess
        print("[*] Extracting 30fps frames for OneTake texture mapping...")
        cmd = [
            "ffmpeg", "-y",
            "-i", str(OUT_VIDEO),
            "-vf", "fps=30,scale=1920:1080",
            "-q:v", "2",
            str(OUT_DIR / "frame_%04d.jpg")
        ]
        subprocess.run(cmd, check=True)
        frame_count = len(list(OUT_DIR.glob("frame_*.jpg")))
        print(f"[+] Successfully extracted {frame_count} live walkthrough frames!")

if __name__ == "__main__":
    asyncio.run(record_app())
