import asyncio
import os
import shutil
import subprocess
import time
from pathlib import Path
from playwright.async_api import async_playwright

OUT_DIR = Path(r"c:\Builds\Position size calculator\TradeSizer\public\demo_assets\live_app_frames_60s")
OUT_DIR.mkdir(parents=True, exist_ok=True)
OUT_VIDEO = Path(r"c:\Builds\Position size calculator\TradeSizer\public\demo_assets\live_app_recording_60s.mp4")

async def record_app():
    async with async_playwright() as p:
        browser = await p.chromium.launch(headless=True)
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
        
        # Inject styled Apple Pro virtual cursor
        await page.evaluate("""() => {
            const cursor = document.createElement('div');
            cursor.id = 'demo-virtual-cursor';
            cursor.style.cssText = 'position:fixed;width:22px;height:22px;border-radius:50%;background:rgba(255,255,255,0.92);border:2px solid #111214;box-shadow:0 0 12px rgba(255,255,255,0.7);pointer-events:none;z-index:999999;transition:transform 0.08s ease;transform:translate(-50%, -50%);';
            document.body.appendChild(cursor);
            window.addEventListener('mousemove', (e) => {
                cursor.style.left = e.clientX + 'px';
                cursor.style.top = e.clientY + 'px';
            });
            window.addEventListener('mousedown', () => {
                cursor.style.transform = 'translate(-50%, -50%) scale(0.75)';
                cursor.style.background = '#34d399';
            });
            window.addEventListener('mouseup', () => {
                cursor.style.transform = 'translate(-50%, -50%) scale(1)';
                cursor.style.background = 'rgba(255,255,255,0.92)';
            });
        }""")
        
        cur_pos = [960, 540]
        
        async def move_to(x, y, duration_s=0.6):
            steps = max(10, int(duration_s * 30))
            x0, y0 = cur_pos[0], cur_pos[1]
            for i in range(1, steps + 1):
                t = i / steps
                k = t * t * (3 - 2 * t)
                mx = x0 + (x - x0) * k
                my = y0 + (y - y0) * k
                await page.mouse.move(mx, my)
                await page.wait_for_timeout(int(duration_s * 1000 / steps))
            cur_pos[0], cur_pos[1] = x, y

        async def smooth_click(x, y, duration_s=0.6, wait_after_ms=500):
            await move_to(x, y, duration_s)
            await page.wait_for_timeout(80)
            await page.mouse.down()
            await page.wait_for_timeout(100)
            await page.mouse.up()
            await page.wait_for_timeout(wait_after_ms)

        print("[*] 0.0s - 7.0s: Establishing shot & brand overview...")
        await move_to(960, 100, 1.0)
        await page.wait_for_timeout(2500)
        await move_to(550, 100, 0.8)
        await page.wait_for_timeout(2500)

        print("[*] 7.0s - 15.0s: Account Capital ($25k preset)...")
        btn_25k = page.get_by_role("button", name="$25k").first
        if await btn_25k.count() > 0:
            box = await btn_25k.bounding_box()
            if box:
                await smooth_click(box['x'] + box['width']/2, box['y'] + box['height']/2, 0.9, 1500)
        await move_to(1100, 100, 0.8)
        await page.wait_for_timeout(2500)

        print("[*] 15.0s - 25.0s: Select Model A (Confirmation: 0.60% Risk, 3.40R Net)...")
        model_a = page.get_by_text("Model A", exact=False).first
        if await model_a.count() > 0:
            box = await model_a.bounding_box()
            if box:
                await smooth_click(box['x'] + box['width']/2, box['y'] + box['height']/2, 0.8, 1500)
        await move_to(350, 180, 0.8)
        await page.wait_for_timeout(3500)

        print("[*] 25.0s - 34.0s: All 43 Pairs catalog & Stop Distance 15 Pips...")
        # Hover over quick subfilter chips
        btn_majors = page.get_by_role("button", name="Majors").first
        if await btn_majors.count() > 0:
            box = await btn_majors.bounding_box()
            if box:
                await smooth_click(box['x'] + box['width']/2, box['y'] + box['height']/2, 0.7, 800)
        await page.wait_for_timeout(800)

        # Click EURUSD chip
        chip_eur = page.get_by_role("button", name="EURUSD").first
        if await chip_eur.count() > 0:
            box = await chip_eur.bounding_box()
            if box:
                await smooth_click(box['x'] + box['width']/2, box['y'] + box['height']/2, 0.6, 800)
        await page.wait_for_timeout(1000)

        # Fill 15 pips stop
        stop_input = page.locator("input[placeholder='e.g. 15']").first
        if await stop_input.count() > 0:
            box = await stop_input.bounding_box()
            if box:
                await smooth_click(box['x'] + box['width']/2, box['y'] + box['height']/2, 0.6, 400)
                await stop_input.fill("15")
        await page.wait_for_timeout(2500)

        print("[*] 34.0s - 45.0s: 60% Partial at 3R (Locks +$270 / +1.80R, Full Win +$510 / +3.40R)...")
        btn_60 = page.get_by_role("button", name="60%").first
        if await btn_60.count() > 0:
            box = await btn_60.bounding_box()
            if box:
                await smooth_click(box['x'] + box['width']/2, box['y'] + box['height']/2, 0.6, 1200)
        
        # Move cursor over the hero lot size callout and exit schedule table
        await move_to(1250, 360, 0.8)
        await page.wait_for_timeout(2000)
        await move_to(1250, 520, 0.8)
        await page.wait_for_timeout(3500)

        print("[*] 45.0s - 52.0s: Move Stop to Breakeven Floor Guarantee...")
        be_toggle = page.get_by_text("Move stop to BE:").first
        if await be_toggle.count() > 0:
            box = await be_toggle.bounding_box()
            if box:
                await smooth_click(box['x'] + box['width']/2, box['y'] + box['height']/2, 0.7, 1500)
        await move_to(1250, 640, 0.8)
        await page.wait_for_timeout(3500)

        print("[*] 52.0s - 60.0s: Apple / macOS Terminal Order Ticket & Copy Action...")
        copy_btn = page.get_by_role("button", name="Copy Ticket").first
        if await copy_btn.count() > 0:
            box = await copy_btn.bounding_box()
            if box:
                await smooth_click(box['x'] + box['width']/2, box['y'] + box['height']/2, 0.8, 2000)
        
        # Hover over terminal log
        await move_to(1250, 850, 0.8)
        await page.wait_for_timeout(4000)

        # Final settle hold
        await page.wait_for_timeout(2000)

        await page.close()
        video_path = await page.video.path()
        await context.close()
        await browser.close()
        
        print(f"[+] 60s Raw video recorded to: {video_path}")
        shutil.move(video_path, str(OUT_VIDEO))
        print(f"[+] Moved 60s walkthrough video to: {OUT_VIDEO}")
        
        print("[*] Extracting 30fps frames for 60s walkthrough...")
        cmd = [
            "ffmpeg", "-y",
            "-i", str(OUT_VIDEO),
            "-vf", "fps=30,scale=1920:1080",
            "-q:v", "2",
            str(OUT_DIR / "frame_%04d.jpg")
        ]
        subprocess.run(cmd, check=True)
        frame_count = len(list(OUT_DIR.glob("frame_*.jpg")))
        print(f"[+] Successfully extracted {frame_count} live 60s walkthrough frames!")

if __name__ == "__main__":
    asyncio.run(record_app())
