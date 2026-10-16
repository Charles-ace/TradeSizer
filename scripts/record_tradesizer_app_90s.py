import asyncio
import os
import shutil
import subprocess
import time
from pathlib import Path
from playwright.async_api import async_playwright

OUT_DIR = Path(r"c:\Builds\Position size calculator\TradeSizer\public\demo_assets\live_app_frames_90s")
OUT_DIR.mkdir(parents=True, exist_ok=True)
OUT_VIDEO = Path(r"c:\Builds\Position size calculator\TradeSizer\public\demo_assets\live_app_recording_90s.mp4")

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
        print("[*] Navigating to TradeSizer at http://localhost:5173...", flush=True)
        await page.goto("http://localhost:5173", wait_until="domcontentloaded")
        await page.wait_for_timeout(2500)

        # Inject sleek Apple Pro virtual cursor + spotlight highlight ring
        await page.evaluate("""() => {
            const cursor = document.createElement('div');
            cursor.id = 'demo-virtual-cursor';
            cursor.style.cssText = 'position:fixed;width:24px;height:24px;border-radius:50%;background:rgba(255,255,255,0.95);border:2.5px solid #000;box-shadow:0 0 16px rgba(52,211,153,0.8), 0 0 0 1px rgba(255,255,255,0.4);pointer-events:none;z-index:999999;transition:transform 0.08s ease, background 0.15s ease;transform:translate(-50%, -50%);';
            document.body.appendChild(cursor);

            window.addEventListener('mousemove', (e) => {
                cursor.style.left = e.clientX + 'px';
                cursor.style.top = e.clientY + 'px';
            });
            window.addEventListener('mousedown', () => {
                cursor.style.transform = 'translate(-50%, -50%) scale(0.72)';
                cursor.style.background = '#10b981';
            });
            window.addEventListener('mouseup', () => {
                cursor.style.transform = 'translate(-50%, -50%) scale(1)';
                cursor.style.background = 'rgba(255,255,255,0.95)';
            });
        }""")

        cur_pos = [960, 540]

        async def move_to(x, y, duration_s=0.6):
            steps = max(10, int(duration_s * 25))
            x0, y0 = cur_pos[0], cur_pos[1]
            for i in range(1, steps + 1):
                t = i / steps
                k = t * t * (3 - 2 * t)
                mx = x0 + (x - x0) * k
                my = y0 + (y - y0) * k
                await page.mouse.move(mx, my)
                await page.wait_for_timeout(int(duration_s * 1000 / steps))
            cur_pos[0], cur_pos[1] = x, y

        async def smooth_click(x, y, duration_s=0.6, wait_after_ms=400):
            await move_to(x, y, duration_s)
            await page.wait_for_timeout(60)
            await page.mouse.down()
            await page.wait_for_timeout(100)
            await page.mouse.up()
            await page.wait_for_timeout(wait_after_ms)

        # -----------------------------------------------------------------
        # TIMELINE FOR 72.0s LIVE APP RECORDING (maps to 10.5s - 82.5s)
        # -----------------------------------------------------------------

        print("[*] Beat 1 (0.0s - 13.0s): Live Feeds (FOREX.COM & Coinbase attribution)...", flush=True)
        # Start at top center, glide to live market header
        await move_to(960, 180, 0.8)
        await page.wait_for_timeout(1200)

        # Move to LIVE MARKET ACTIVE header and FOREX.COM badge
        await move_to(440, 335, 0.8)
        await page.wait_for_timeout(2200)

        # Click refresh button to show live tick
        refresh_btn = page.locator("button[title='Refresh live prices']").first
        if await refresh_btn.count() > 0:
            box = await refresh_btn.bounding_box()
            if box:
                await smooth_click(box['x'] + box['width']/2, box['y'] + box['height']/2, 0.5, 1200)

        # Hover over quick filter chips (Majors, Crosses, BTC/ETH, Gold & Oil)
        btn_majors = page.get_by_role("button", name="Majors").first
        if await btn_majors.count() > 0:
            box = await btn_majors.bounding_box()
            if box:
                await move_to(box['x'] + box['width']/2, box['y'] + box['height']/2, 0.6)
                await page.wait_for_timeout(1000)

        btn_metals = page.get_by_role("button", name="Gold & Oil").first
        if await btn_metals.count() > 0:
            box = await btn_metals.bounding_box()
            if box:
                await move_to(box['x'] + box['width']/2, box['y'] + box['height']/2, 0.6)
                await page.wait_for_timeout(1000)

        btn_all = page.get_by_role("button", name="All 43 Pairs").first
        if await btn_all.count() > 0:
            box = await btn_all.bounding_box()
            if box:
                await smooth_click(box['x'] + box['width']/2, box['y'] + box['height']/2, 0.5, 1200)

        print("[*] Beat 2 (13.0s - 26.5s): Capital & Risk Setup ($25k, 1.5% Risk = $375)...", flush=True)
        # Move to Account Balance input
        balance_input = page.locator("input[type='number']").first
        if await balance_input.count() > 0:
            box = await balance_input.bounding_box()
            if box:
                await smooth_click(box['x'] + box['width']/2, box['y'] + box['height']/2, 0.7, 300)
                # Select all and type $25,000 key-by-key
                await page.keyboard.press("Control+A")
                await page.wait_for_timeout(80)
                await page.keyboard.press("Backspace")
                await page.wait_for_timeout(150)
                for char in "25000":
                    await page.keyboard.press(char)
                    await page.wait_for_timeout(80)
                await page.wait_for_timeout(1200)

        # Move to 1.5% Risk chip and click it
        btn_risk_1_5 = page.get_by_role("button", name="1.5%").first
        if await btn_risk_1_5.count() > 0:
            box = await btn_risk_1_5.bounding_box()
            if box:
                await smooth_click(box['x'] + box['width']/2, box['y'] + box['height']/2, 0.6, 1200)

        # Glide to BabyPips Amount at Risk ($375.00)
        await move_to(800, 495, 0.8)
        await page.wait_for_timeout(2500)

        print("[*] Beat 3 (26.5s - 38.0s): Simple Price Levels (Use Live Price, Stop 15 pips, +3R Target)...", flush=True)
        # Move to "Use Live Price" button
        btn_use_live = page.get_by_role("button", name="Use Live Price").first
        if await btn_use_live.count() > 0:
            box = await btn_use_live.bounding_box()
            if box:
                await smooth_click(box['x'] + box['width']/2, box['y'] + box['height']/2, 0.6, 1000)

        # Move to Stop Price input
        stop_input = page.locator("input[placeholder*='Stop loss']").first
        if await stop_input.count() > 0:
            box = await stop_input.bounding_box()
            if box:
                await smooth_click(box['x'] + box['width']/2, box['y'] + box['height']/2, 0.6, 250)
                await page.keyboard.press("Control+A")
                await page.wait_for_timeout(80)
                await page.keyboard.press("Backspace")
                await page.wait_for_timeout(120)
                for char in "1.11654":
                    await page.keyboard.press(char)
                    await page.wait_for_timeout(80)
                await page.wait_for_timeout(1000)

        # Move to +3R quick preset button and click
        btn_3r = page.get_by_role("button", name="+3R").first
        if await btn_3r.count() > 0:
            box = await btn_3r.bounding_box()
            if box:
                await smooth_click(box['x'] + box['width']/2, box['y'] + box['height']/2, 0.6, 2000)

        print("[*] Beat 4 (38.0s - 52.0s): Exact BabyPips Parity (5 Breakdown Rows)...", flush=True)
        # Gliding through BabyPips breakdown rows
        # 1. Amount at Risk ($375.00)
        await move_to(760, 495, 0.7)
        await page.wait_for_timeout(1800)
        # 2. Position Size units (250,000)
        await move_to(760, 535, 0.5)
        await page.wait_for_timeout(2000)
        # 3. Standard Lots (2.50)
        await move_to(760, 575, 0.5)
        await page.wait_for_timeout(2000)
        # 4. Mini Lots (25.0)
        await move_to(760, 615, 0.5)
        await page.wait_for_timeout(1800)
        # 5. Micro Lots (250.0)
        await move_to(760, 655, 0.5)
        await page.wait_for_timeout(2200)

        print("[*] Beat 5 (52.0s - 65.0s): Model A Two-Stage Exit & Bitcoin Fractional Lots...", flush=True)
        # Hover over Model A Exit Plan (60% @ 3R, 40% @ 4R)
        await move_to(760, 830, 0.7)
        await page.wait_for_timeout(3200)

        # Switch to BTC/ETH -> BTCUSD
        btn_btc_chip = page.get_by_role("button", name="BTC / ETH").first
        if await btn_btc_chip.count() > 0:
            box = await btn_btc_chip.bounding_box()
            if box:
                await smooth_click(box['x'] + box['width']/2, box['y'] + box['height']/2, 0.6, 500)

        btn_btc = page.get_by_role("button", name="BTCUSD").first
        if await btn_btc.count() > 0:
            box = await btn_btc.bounding_box()
            if box:
                await smooth_click(box['x'] + box['width']/2, box['y'] + box['height']/2, 0.6, 1200)

        # Show Coinbase live pricing and fractional lot calculation on BTC
        await move_to(440, 335, 0.6)
        await page.wait_for_timeout(1600)
        await move_to(680, 360, 0.5)
        await page.wait_for_timeout(2000)

        print("[*] Beat 6 (65.0s - 72.0s): Execution Ticket 1-Click Copy...", flush=True)
        # Move down to primary Copy Execution Ticket button
        btn_copy_ticket = page.locator("button:has-text('Copy Ticket')").last
        if await btn_copy_ticket.count() > 0:
            box = await btn_copy_ticket.bounding_box()
            if box:
                await smooth_click(box['x'] + box['width']/2, box['y'] + box['height']/2, 0.8, 1800)

        await page.wait_for_timeout(2000)
        print("[*] Recording completed! Closing browser...", flush=True)
        await context.close()
        await browser.close()

        # Find the recorded WebM in temp dir
        temp_files = list(temp_video_dir.glob("*.webm"))
        if temp_files:
            latest_vid = temp_files[0]
            print(f"[+] Raw browser video captured: {latest_vid} ({latest_vid.stat().st_size // 1024} KB)", flush=True)
            # Transcode with ffmpeg to high-bitrate 1920x1080 30fps MP4
            transcode_cmd = [
                "ffmpeg", "-y",
                "-i", str(latest_vid),
                "-t", "72.0",
                "-vf", "fps=30,scale=1920:1080:flags=lanczos",
                "-c:v", "libx264",
                "-preset", "slow",
                "-crf", "17",
                "-pix_fmt", "yuv420p",
                str(OUT_VIDEO)
            ]
            subprocess.run(transcode_cmd, check=True)
            print(f"[SUCCESS] App Walkthrough Video Rendered: {OUT_VIDEO} ({OUT_VIDEO.stat().st_size // 1024} KB)", flush=True)

if __name__ == "__main__":
    asyncio.run(record_app())
