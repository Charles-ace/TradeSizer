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
        await page.wait_for_timeout(1200)

        # Inject high-performance 60fps requestAnimationFrame cursor engine with dynamic emerald ripple
        await page.evaluate("""() => {
            window.__cursorPos = { x: 960, y: 240 };

            const cursor = document.createElement('div');
            cursor.id = 'demo-synced-cursor';
            cursor.style.cssText = `
                position: fixed;
                left: 960px;
                top: 240px;
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

            window.__moveCursor = (targetX, targetY, durationMs) => {
                return new Promise((resolve) => {
                    const startX = window.__cursorPos.x;
                    const startY = window.__cursorPos.y;
                    const startTime = performance.now();

                    function step(now) {
                        const elapsed = now - startTime;
                        const progress = Math.min(1.0, elapsed / durationMs);
                        const ease = 1.0 - Math.pow(1.0 - progress, 3);
                        const curX = startX + (targetX - startX) * ease;
                        const curY = startY + (targetY - startY) * ease;
                        
                        cursor.style.left = curX + 'px';
                        cursor.style.top = curY + 'px';
                        window.__cursorPos = { x: curX, y: curY };

                        if (progress < 1.0) {
                            requestAnimationFrame(step);
                        } else {
                            cursor.style.left = targetX + 'px';
                            cursor.style.top = targetY + 'px';
                            window.__cursorPos = { x: targetX, y: targetY };
                            resolve();
                        }
                    }
                    requestAnimationFrame(step);
                });
            };

            window.__clickCursor = () => {
                cursor.style.transform = 'translate(-50%, -50%) scale(0.72)';
                cursor.style.background = '#10b981';

                const ripple = document.createElement('div');
                ripple.style.cssText = `
                    position: fixed;
                    left: ${window.__cursorPos.x}px;
                    top: ${window.__cursorPos.y}px;
                    width: 10px;
                    height: 10px;
                    border-radius: 50%;
                    border: 2.5px solid #10b981;
                    box-shadow: 0 0 14px rgba(16, 185, 129, 0.85);
                    pointer-events: none;
                    z-index: 9999998;
                    transform: translate(-50%, -50%);
                    animation: ripple-anim 0.35s cubic-bezier(0, 0, 0.2, 1) forwards;
                `;
                document.body.appendChild(ripple);
                setTimeout(() => ripple.remove(), 380);

                setTimeout(() => {
                    cursor.style.transform = 'translate(-50%, -50%) scale(1)';
                    cursor.style.background = 'rgba(255, 255, 255, 0.96)';
                }, 120);
            };

            const style = document.createElement('style');
            style.innerHTML = `
                @keyframes ripple-anim {
                    0% { width: 10px; height: 10px; opacity: 1; }
                    100% { width: 56px; height: 56px; opacity: 0; }
                }
            `;
            document.head.appendChild(style);
        }""")

        async def move_to(x, y, duration_s=0.22):
            duration_ms = max(80, int(duration_s * 1000))
            await page.evaluate(f"window.__moveCursor({x}, {y}, {duration_ms})")
            await asyncio.sleep(0.02)

        async def click_at(x, y, duration_s=0.22, wait_after_s=0.12):
            await move_to(x, y, duration_s)
            await page.evaluate("window.__clickCursor()")
            await page.mouse.click(x, y)
            if wait_after_s > 0:
                await asyncio.sleep(wait_after_s)

        async def click_loc(locator, duration_s=0.22, wait_after_s=0.12):
            box = await locator.bounding_box()
            if box:
                tx = box['x'] + box['width'] / 2
                ty = box['y'] + box['height'] / 2
                await click_at(tx, ty, duration_s, wait_after_s)
                return True
            return False

        async def hover_loc(locator, duration_s=0.22):
            box = await locator.bounding_box()
            if box:
                tx = box['x'] + box['width'] / 2
                ty = box['y'] + box['height'] / 2
                await move_to(tx, ty, duration_s)
                return True
            return False

        # Precise wall-clock target synchronization
        start_t = time.time()

        async def wait_until_app_t(target_s):
            now = time.time() - start_t
            rem = target_s - now
            if rem > 0.01:
                await asyncio.sleep(rem)

        print(f"[*] Starting target-synchronized recording timeline at {time.strftime('%X')}...", flush=True)

        # -----------------------------------------------------------------
        # BEAT 1 (0.0s - 4.0s): Console Entrance & 67 Instruments
        # Voice: "...the institutional position sizer engineered for sixty-seven global instruments."
        # -----------------------------------------------------------------
        print("[+] Beat 1 (0.0s - 4.0s): Entrance & 67 Instruments...", flush=True)
        await move_to(960, 240, 0.25)
        await wait_until_app_t(0.8)
        
        badge_67 = page.locator("text='67 INSTRUMENTS'").first
        b_box = await badge_67.bounding_box()
        if b_box:
            await move_to(b_box['x'] + b_box['width']/2, b_box['y'] + b_box['height']/2, 0.24)
        await wait_until_app_t(2.5)

        badge_babypips = page.locator("text='BabyPips Parity'").first
        p_box = await badge_babypips.bounding_box()
        if p_box:
            await move_to(p_box['x'] + p_box['width']/2, p_box['y'] + p_box['height']/2, 0.22)
        await wait_until_app_t(4.0)

        # -----------------------------------------------------------------
        # BEAT 2 (4.0s - 14.5s): Live Feeds (FOREX.COM, Coinbase, DERIV Broker)
        # Voice: "TradeSizer streams real-time institutional feeds directly from FOREX.COM for currencies and metals, Coinbase for crypto, and the DERIV Broker for synthetic volatilities."
        # -----------------------------------------------------------------
        print("[+] Beat 2 (4.0s - 14.5s): Live Feeds Attribution...", flush=True)
        # At 4.2s: Move to FOREX.COM badge
        forex_badge = page.locator("text='FOREX.COM'").first
        f_box = await forex_badge.bounding_box()
        if f_box:
            await move_to(f_box['x'] + f_box['width']/2, f_box['y'] + f_box['height']/2, 0.22)
        await wait_until_app_t(5.2)

        # At 5.2s: Click refresh spinner button
        refresh_btn = page.locator("button[title='Refresh live prices']").first
        await click_loc(refresh_btn, 0.22, 0.15)
        await wait_until_app_t(6.8)

        # At 6.8s: Click Majors tab
        tab_majors = page.get_by_role("button", name="Majors").first
        await click_loc(tab_majors, 0.22, 0.12)
        await wait_until_app_t(8.2)

        # At 8.2s: Click Gold & Oil tab
        tab_metals = page.get_by_role("button", name="Gold & Oil").first
        await click_loc(tab_metals, 0.22, 0.12)
        await wait_until_app_t(9.6)

        # At 9.6s: Click Crypto tab (Coinbase)
        tab_crypto = page.get_by_role("button", name="BTC / ETH").first
        await click_loc(tab_crypto, 0.22, 0.12)
        await wait_until_app_t(11.2)

        # At 11.2s: Click Deriv Volatilities tab (DERIV Broker)
        tab_deriv = page.get_by_role("button", name="Deriv Volatilities").first
        await click_loc(tab_deriv, 0.22, 0.12)
        await wait_until_app_t(12.8)

        # At 12.8s: Return to Majors & select EURUSD baseline
        tab_majors = page.get_by_role("button", name="Majors").first
        await click_loc(tab_majors, 0.22, 0.12)
        
        chip_eur = page.get_by_role("button", name="EURUSD").first
        if await chip_eur.count() > 0:
            await click_loc(chip_eur, 0.20, 0.12)
        await wait_until_app_t(14.5)

        # -----------------------------------------------------------------
        # BEAT 3 (14.5s - 27.5s): Capital Setup ($50,000, 0.75% Risk = $375.00)
        # Voice: "Setting up takes seconds. Click Account Balance, type fifty thousand dollars, and select your risk model. At zero point seven five percent, your cash risk is mathematically locked at three hundred and seventy-five dollars."
        # -----------------------------------------------------------------
        print("[+] Beat 3 (14.5s - 27.5s): Capital Setup ($50k, 0.75% = $375.00)...", flush=True)
        # At 14.8s: Click $50k preset button
        btn_50k = page.locator("button:has-text('$50k')").last
        await click_loc(btn_50k, 0.22, 0.12)
        await wait_until_app_t(16.2)

        # Click into Account Balance input box and re-type 50000
        bal_input = page.locator("input[placeholder='10000']").first
        b_input_box = await bal_input.bounding_box()
        if b_input_box:
            await click_at(b_input_box['x'] + b_input_box['width']/2, b_input_box['y'] + b_input_box['height']/2, 0.22)
            await bal_input.fill("50000")
        await wait_until_app_t(18.2)

        # At 18.2s: Click Model A
        model_a = page.locator("button:has-text('Model A')").first
        await click_loc(model_a, 0.22, 0.12)
        await wait_until_app_t(20.5)

        # At 20.5s: Click custom Risk % input and type 0.75
        risk_input = page.locator("input[step='0.1']").first
        r_box = await risk_input.bounding_box()
        if r_box:
            await click_at(r_box['x'] + r_box['width']/2, r_box['y'] + r_box['height']/2, 0.22)
            await risk_input.fill("0.75")
        await wait_until_app_t(23.2)

        # At 23.2s: Point directly to 1R Risk Budget (-$375.00) in Top KPI card
        budget_card = page.locator("div:has-text('1R Risk Budget')").first
        card_box = await budget_card.bounding_box()
        if card_box:
            await move_to(card_box['x'] + card_box['width']/2, card_box['y'] + card_box['height']/2, 0.24)
        await wait_until_app_t(27.5)

        # -----------------------------------------------------------------
        # BEAT 4 (27.5s - 40.0s): Price Levels & +3R Target
        # Voice: "Zero complicated jargon. Click Use Live Price to lock your entry, set your stop price fifteen pips below, and click plus three R to project your target level automatically."
        # -----------------------------------------------------------------
        print("[+] Beat 4 (27.5s - 40.0s): Price Levels & +3R Target...", flush=True)
        # At 28.0s: Click Use Live Price
        btn_live = page.get_by_role("button", name="Use Live Price").first
        await click_loc(btn_live, 0.22, 0.15)
        await wait_until_app_t(30.5)

        # Read actual live entry price
        entry_input = page.locator("input[placeholder*='1.']").first
        entry_val = float(await entry_input.input_value() or 1.12394)
        stop_val = f"{(entry_val - 0.00150):.5f}"

        # At 31.0s: Click Stop loss input and fill exact 15 pips stop
        stop_input = page.locator("input[placeholder*='Stop loss']").first
        await click_loc(stop_input, 0.22, 0.1)
        await stop_input.fill(stop_val)
        await wait_until_app_t(35.0)

        # At 35.0s: Click +3R button
        btn_3r = page.get_by_role("button", name="+3R").first
        await click_loc(btn_3r, 0.22, 0.15)
        await wait_until_app_t(37.0)

        # At 37.0s: Glide to Take Level Price field showing projected target
        await move_to(900, 680, 0.22)
        await wait_until_app_t(40.0)

        # -----------------------------------------------------------------
        # BEAT 5 (40.0s - 52.5s): Exact BabyPips Parity (2.50 Lots, 250,000 Units)
        # Voice: "On the results card: exact BabyPips parity. For three hundred seventy-five dollars risk, you get two point five zero standard lots, or two hundred fifty thousand units—strictly floored to guarantee zero round-up risk."
        # -----------------------------------------------------------------
        print("[+] Beat 5 (40.0s - 52.5s): BabyPips Parity (2.50 Lots / 250k Units)...", flush=True)
        # At 40.5s: Glide across to BabyPips Sizing Breakdown header
        await move_to(1200, 405, 0.24)
        await wait_until_app_t(43.2)

        # At 43.5s: Hover Amount at Risk: $375.00
        await move_to(1335, 445, 0.22)
        await wait_until_app_t(45.8)

        # At 46.0s: Hover Hero Callout: 2.50 LOTS
        await move_to(1160, 325, 0.22)
        await wait_until_app_t(48.5)

        # At 48.5s: Hover Position Size (units): 250,000
        await move_to(1335, 480, 0.22)
        await wait_until_app_t(50.5)

        # At 50.5s: Glide down across Mini Lots (25.00) & Micro Lots (250.00)
        await move_to(1335, 555, 0.20)
        await wait_until_app_t(51.5)
        await move_to(1335, 590, 0.20)
        await wait_until_app_t(52.5)

        # -----------------------------------------------------------------
        # BEAT 6 (52.5s - 64.8s): Deriv Volatilities & Bitcoin (Coinbase)
        # Voice: "TradeSizer handles all markets seamlessly. Switch to Deriv Volatilities to size Volatility 75 with live WebSocket streaming, or jump to Bitcoin where fractional lots calculate with zero errors."
        # -----------------------------------------------------------------
        print("[+] Beat 6 (52.5s - 64.8s): Deriv Volatilities & Bitcoin...", flush=True)
        # At 53.0s: Click Deriv Volatilities tab
        tab_deriv = page.get_by_role("button", name="Deriv Volatilities").first
        await click_loc(tab_deriv, 0.22, 0.12)
        await wait_until_app_t(54.8)

        # At 55.0s: Glide to Deriv MT5 contract specs card
        await move_to(1300, 420, 0.24)
        await wait_until_app_t(58.2)

        # At 58.5s: Click BTC / ETH tab
        tab_crypto = page.get_by_role("button", name="BTC / ETH").first
        await click_loc(tab_crypto, 0.22, 0.12)
        await wait_until_app_t(60.8)

        # At 61.0s: Glide to Crypto Hero Lots (fractional lots)
        await move_to(1160, 325, 0.22)
        await wait_until_app_t(62.8)

        # At 62.8s: Click Copy Lots button
        copy_lots_btn = page.get_by_role("button", name="Copy Lots").first
        await click_loc(copy_lots_btn, 0.20, 0.15)
        await wait_until_app_t(64.8)

        # -----------------------------------------------------------------
        # BEAT 7 (64.8s - 74.0s): Exit Plan (60% @ 3R) & Execution Ticket
        # Voice: "Lock sixty percent at three R for guaranteed banking. When you are ready, one click copies your execution ticket directly to your platform or journal."
        # -----------------------------------------------------------------
        print("[+] Beat 7 (64.8s - 74.0s): Exit Plan & Copy Ticket...", flush=True)
        # At 65.2s: Move to Exit Plan card on right panel
        await move_to(1335, 740, 0.24)
        await wait_until_app_t(68.5)

        # At 68.5s: Click Copy Ticket button in terminal
        copy_ticket_btn = page.locator("button:has-text('Copy Ticket')").last
        await click_loc(copy_ticket_btn, 0.22, 0.2)
        await wait_until_app_t(71.5)

        # At 71.5s: Smooth glide up to top navbar Copy Ticket button
        await move_to(1520, 22, 0.24)
        await wait_until_app_t(74.0)

        print("[*] 74.0s reached! Closing recorder...", flush=True)
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
