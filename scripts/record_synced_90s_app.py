import asyncio
import os
import shutil
import subprocess
import time
from pathlib import Path
from playwright.async_api import async_playwright

BASE_DIR = Path(r"c:\Builds\Position size calculator\TradeSizer")
DEMO_ASSETS = BASE_DIR / "public" / "demo_assets"
OUT_VIDEO = DEMO_ASSETS / "live_app_synced_74s.mp4"
TEMP_DIR = DEMO_ASSETS / "_temp_synced_recording"
TEMP_DIR.mkdir(parents=True, exist_ok=True)

# Clean out old temp files
for old_file in TEMP_DIR.glob("*.*"):
    try:
        old_file.unlink()
    except Exception:
        pass

async def record_synced_app():
    async with async_playwright() as p:
        browser = await p.chromium.launch(
            headless=True,
            args=[
                "--disable-gpu",
                "--no-sandbox",
                "--disable-dev-shm-usage"
            ]
        )
        
        context = await browser.new_context(
            viewport={"width": 1920, "height": 1080},
            device_scale_factor=1,
            record_video_dir=str(TEMP_DIR),
            record_video_size={"width": 1920, "height": 1080}
        )

        page = await context.new_page()
        print("[*] Loading TradeSizer at http://localhost:5173...", flush=True)
        await page.goto("http://localhost:5173", wait_until="networkidle")
        await page.wait_for_timeout(1500)

        # Inject realistic Apple Pro spotlight cursor with dynamic ripple ring on click
        await page.evaluate("""() => {
            const cursor = document.createElement('div');
            cursor.id = 'demo-synced-cursor';
            cursor.style.cssText = `
                position: fixed;
                width: 22px;
                height: 22px;
                border-radius: 50%;
                background: rgba(255, 255, 255, 0.96);
                border: 2.5px solid #000;
                box-shadow: 0 0 18px rgba(16, 185, 129, 0.95), 0 0 0 1px rgba(255, 255, 255, 0.6);
                pointer-events: none;
                z-index: 9999999;
                transform: translate(-50%, -50%);
                transition: transform 0.08s ease, background 0.12s ease;
            `;
            document.body.appendChild(cursor);

            window.addEventListener('mousemove', (e) => {
                cursor.style.left = e.clientX + 'px';
                cursor.style.top = e.clientY + 'px';
            });

            window.addEventListener('mousedown', (e) => {
                cursor.style.transform = 'translate(-50%, -50%) scale(0.72)';
                cursor.style.background = '#10b981';

                const ripple = document.createElement('div');
                ripple.style.cssText = `
                    position: fixed;
                    left: ${e.clientX}px;
                    top: ${e.clientY}px;
                    width: 10px;
                    height: 10px;
                    border-radius: 50%;
                    border: 2.5px solid #10b981;
                    box-shadow: 0 0 12px rgba(16, 185, 129, 0.8);
                    pointer-events: none;
                    z-index: 9999998;
                    transform: translate(-50%, -50%);
                    animation: ripple-anim 0.35s cubic-bezier(0, 0, 0.2, 1) forwards;
                `;
                document.body.appendChild(ripple);
                setTimeout(() => ripple.remove(), 380);
            });

            window.addEventListener('mouseup', () => {
                cursor.style.transform = 'translate(-50%, -50%) scale(1)';
                cursor.style.background = 'rgba(255, 255, 255, 0.96)';
            });

            const style = document.createElement('style');
            style.innerHTML = `
                @keyframes ripple-anim {
                    0% { width: 10px; height: 10px; opacity: 1; }
                    100% { width: 56px; height: 56px; opacity: 0; }
                }
            `;
            document.head.appendChild(style);
        }""")

        cur_pos = [960, 240]

        async def move_to(x, y, duration_s=0.5):
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

        async def smooth_click(x, y, duration_s=0.5, wait_after_ms=250):
            await move_to(x, y, duration_s)
            await page.wait_for_timeout(80)
            await page.mouse.down()
            await page.wait_for_timeout(100)
            await page.mouse.up()
            await page.wait_for_timeout(wait_after_ms)

        async def click_loc(locator, duration_s=0.5, wait_after_ms=250):
            box = await locator.bounding_box()
            if box:
                await smooth_click(box['x'] + box['width']/2, box['y'] + box['height']/2, duration_s, wait_after_ms)
                return True
            return False

        async def hover_loc(locator, duration_s=0.5):
            box = await locator.bounding_box()
            if box:
                await move_to(box['x'] + box['width']/2, box['y'] + box['height']/2, duration_s)
                return True
            return False

        async def type_loc(locator, text, duration_s=0.5, key_delay_ms=85):
            box = await locator.bounding_box()
            if box:
                await smooth_click(box['x'] + box['width']/2, box['y'] + box['height']/2, duration_s, 100)
                await page.keyboard.press("Control+A")
                await page.wait_for_timeout(60)
                await page.keyboard.press("Backspace")
                await page.wait_for_timeout(100)
                for char in text:
                    await page.keyboard.press(char)
                    await page.wait_for_timeout(key_delay_ms)
                await page.wait_for_timeout(150)

        # Wall-clock target synchronization helper
        start_t = time.time()

        async def wait_until_target(target_s):
            now = time.time() - start_t
            rem = target_s - now
            if rem > 0:
                await page.wait_for_timeout(int(rem * 1000))

        print(f"[*] Starting target-synchronized recording timeline at {time.strftime('%X')}...", flush=True)

        # -----------------------------------------------------------------
        # BEAT 1 (0.0s - 4.0s): Console Entrance
        # Voice (Master 8.0s - 12.0s): "...the institutional position sizer engineered for sixty-seven global instruments."
        # -----------------------------------------------------------------
        print("[+] Beat 1 (0.0s - 4.0s): Entrance...", flush=True)
        await move_to(960, 220, 0.8)
        await wait_until_target(2.0)
        badge = page.locator("text='67 INSTRUMENTS'").first
        if await badge.count() > 0:
            await hover_loc(badge, 0.6)
        await wait_until_target(4.0)

        # -----------------------------------------------------------------
        # BEAT 2 (4.0s - 14.5s): Live Feeds (FOREX.COM, Coinbase, DERIV Broker)
        # Voice (Master 12.0s - 22.5s): "TradeSizer streams real-time institutional feeds directly from FOREX.COM for currencies and metals, Coinbase for crypto, and the DERIV Broker for synthetic volatilities."
        # -----------------------------------------------------------------
        print("[+] Beat 2 (4.0s - 14.5s): Live Feeds Attribution...", flush=True)
        # At 4.5s: Glide to DERIV Broker badge
        deriv_badge = page.locator("text='DERIV Broker'").first
        if await deriv_badge.count() > 0:
            await hover_loc(deriv_badge, 0.6)
        await wait_until_target(6.5)

        # At 6.5s: Click refresh button
        refresh_btn = page.locator("button[title='Refresh live prices']").first
        if await refresh_btn.count() > 0:
            await click_loc(refresh_btn, 0.5, 300)
        await wait_until_target(8.5)

        # At 8.5s: Click Majors (FOREX.COM)
        chip_majors = page.get_by_role("button", name="Majors").first
        if await chip_majors.count() > 0:
            await click_loc(chip_majors, 0.4, 200)
        await wait_until_target(10.5)

        # At 10.5s: Click Gold & Oil
        chip_metals = page.get_by_role("button", name="Gold & Oil").first
        if await chip_metals.count() > 0:
            await click_loc(chip_metals, 0.4, 200)
        await wait_until_target(12.5)

        # At 12.5s: Click All 67 Instruments
        btn_all = page.get_by_role("button", name="All 67 Instruments").first
        if await btn_all.count() > 0:
            await click_loc(btn_all, 0.4, 200)
        await wait_until_target(14.5)

        # -----------------------------------------------------------------
        # BEAT 3 (14.5s - 27.5s): Capital Setup ($50,000, 0.75% Risk = $375.00)
        # Voice (Master 22.5s - 35.5s): "Setting up takes seconds. Click Account Balance, type fifty thousand dollars, and select your risk model. At zero point seven five percent, your cash risk is mathematically locked at three hundred and seventy-five dollars."
        # -----------------------------------------------------------------
        print("[+] Beat 3 (14.5s - 27.5s): Capital Setup ($50k, 0.75% = $375)...", flush=True)
        # At 14.8s: "Click Account Balance, type fifty thousand dollars"
        balance_input = page.locator("input[type='number']").first
        await type_loc(balance_input, "50000", 0.5, 90)
        await wait_until_target(18.5)

        # At 18.5s: "and select your risk model" -> Hover on Model A
        model_a = page.locator("button:has-text('Model A')").first
        if await model_a.count() > 0:
            await hover_loc(model_a, 0.5)
        await wait_until_target(20.5)

        # At 20.5s: "At zero point seven five percent" -> Click 0.75% chip
        risk_075 = page.get_by_role("button", name="0.75%").first
        if await risk_075.count() > 0:
            await click_loc(risk_075, 0.4, 300)
        await wait_until_target(23.5)

        # At 23.5s: "locked at three hundred and seventy-five dollars" -> Point to $375.00
        await move_to(760, 440, 0.6)
        await wait_until_target(27.5)

        # -----------------------------------------------------------------
        # BEAT 4 (27.5s - 40.0s): Price Levels & +3R Target
        # Voice (Master 35.5s - 48.0s): "Zero complicated jargon. Click Use Live Price to lock your entry, set your stop price fifteen pips below, and click plus three R to project your target level automatically."
        # -----------------------------------------------------------------
        print("[+] Beat 4 (27.5s - 40.0s): Price Levels & +3R Target...", flush=True)
        # At 28.0s: "Click Use Live Price"
        btn_live = page.get_by_role("button", name="Use Live Price").first
        if await btn_live.count() > 0:
            await click_loc(btn_live, 0.5, 300)
        await wait_until_target(31.0)

        # At 31.0s: "set your stop price fifteen pips below"
        stop_input = page.locator("input[placeholder*='Stop loss']").first
        await type_loc(stop_input, "1.11409", 0.5, 80)
        await wait_until_target(35.0)

        # At 35.0s: "click plus three R"
        btn_3r = page.get_by_role("button", name="+3R").first
        if await btn_3r.count() > 0:
            await click_loc(btn_3r, 0.4, 400)
        await wait_until_target(37.5)

        # At 37.5s: "to project your target level automatically" -> Glide to Target Price
        target_input = page.locator("input[placeholder*='Take profit']").first
        if await target_input.count() > 0:
            await hover_loc(target_input, 0.5)
        await wait_until_target(40.0)

        # -----------------------------------------------------------------
        # BEAT 5 (40.0s - 52.5s): Exact BabyPips Parity
        # Voice (Master 48.0s - 60.5s): "On the results card: exact BabyPips parity. For three hundred seventy-five dollars risk, you get two point five zero standard lots, or two hundred fifty thousand units—strictly floored to guarantee zero round-up risk."
        # -----------------------------------------------------------------
        print("[+] Beat 5 (40.0s - 52.5s): Exact BabyPips Parity (2.50 Lots, 250,000 Units)...", flush=True)
        # 40.5s: Header
        await move_to(760, 410, 0.5)
        await wait_until_target(43.0)

        # 43.0s: Standard Lots (2.50 lots)
        await move_to(760, 520, 0.5)
        await wait_until_target(46.0)

        # 46.0s: Units (250,000 units)
        await move_to(760, 485, 0.5)
        await wait_until_target(49.0)

        # 49.0s: Floored Mini (25.0) & Micro (250.0)
        await move_to(760, 560, 0.4)
        await wait_until_target(51.0)
        await move_to(760, 600, 0.4)
        await wait_until_target(52.5)

        # -----------------------------------------------------------------
        # BEAT 6 (52.5s - 64.8s): Deriv Volatilities (V75) & Bitcoin (Coinbase)
        # Voice (Master 60.5s - 72.8s): "TradeSizer handles all markets seamlessly. Switch to Deriv Volatilities to size Volatility 75 with live WebSocket streaming, or jump to Bitcoin where fractional lots calculate with zero errors."
        # -----------------------------------------------------------------
        print("[+] Beat 6 (52.5s - 64.8s): Deriv Volatilities & Bitcoin...", flush=True)
        # 53.0s: "Switch to Deriv Volatilities"
        chip_deriv = page.get_by_role("button", name="Deriv Volatilities").first
        if await chip_deriv.count() > 0:
            await click_loc(chip_deriv, 0.5, 300)
        await wait_until_target(55.5)

        # 55.5s: "size Volatility 75 with live WebSocket streaming"
        chip_v75 = page.get_by_role("button", name="VOLATILITY_75_INDEX").first
        if await chip_v75.count() > 0:
            await click_loc(chip_v75, 0.5, 400)
        await wait_until_target(58.0)

        # Hover over calculated V75 lot size
        await move_to(760, 520, 0.5)
        await wait_until_target(59.5)

        # 59.5s: "or jump to Bitcoin"
        chip_crypto = page.get_by_role("button", name="BTC / ETH").first
        if await chip_crypto.count() > 0:
            await click_loc(chip_crypto, 0.4, 200)

        chip_btc = page.get_by_role("button", name="BTCUSD").first
        if await chip_btc.count() > 0:
            await click_loc(chip_btc, 0.4, 400)
        await wait_until_target(62.0)

        # 62.0s: "where fractional lots calculate with zero errors"
        await move_to(760, 520, 0.5)
        await wait_until_target(64.8)

        # -----------------------------------------------------------------
        # BEAT 7 (64.8s - 74.0s): 60% Partial Banking & 1-Click Ticket
        # Voice (Master 72.8s - 82.0s): "Lock sixty percent at three R for guaranteed banking. When you are ready, one click copies your execution ticket directly to your platform or journal."
        # -----------------------------------------------------------------
        print("[+] Beat 7 (64.8s - 74.0s): 60% Partial Banking & Copy Ticket...", flush=True)
        # 65.2s: "Lock sixty percent at three R"
        await move_to(760, 720, 0.5)
        await wait_until_target(68.5)

        # 68.5s: "When you are ready, one click copies your execution ticket"
        copy_btn = page.locator("button:has-text('Copy Ticket')").last
        if await copy_btn.count() > 0:
            await click_loc(copy_btn, 0.5, 300)
        await wait_until_target(71.0)

        # Pause on verified green ticket
        await move_to(760, 840, 0.5)
        await wait_until_target(74.0)

        print("[*] 74.0s reached! Flushing video...", flush=True)
        # Sever connections before closing so it closes instantly
        await page.goto("about:blank")
        await page.close()
        await context.close()
        await browser.close()

        # Find WebM
        temp_files = [f for f in TEMP_DIR.glob("*.webm") if f.stat().st_size > 100000]
        if temp_files:
            latest_webm = sorted(temp_files, key=lambda f: f.stat().st_mtime, reverse=True)[0]
            print(f"[+] Raw video captured: {latest_webm} ({latest_webm.stat().st_size // 1024} KB)", flush=True)
            
            # Transcode to high quality 1920x1080 30fps MP4 of exactly 74.0 seconds
            cmd_transcode = [
                "ffmpeg", "-y",
                "-i", str(latest_webm),
                "-t", "74.0",
                "-vf", "fps=30,scale=1920:1080:flags=lanczos",
                "-c:v", "libx264",
                "-preset", "faster",
                "-crf", "17",
                "-pix_fmt", "yuv420p",
                str(OUT_VIDEO)
            ]
            subprocess.run(cmd_transcode, check=True)
            print(f"[SUCCESS] App Walkthrough Rendered: {OUT_VIDEO} ({OUT_VIDEO.stat().st_size // 1024} KB)", flush=True)

if __name__ == "__main__":
    asyncio.run(record_synced_app())
