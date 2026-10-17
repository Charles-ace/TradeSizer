import asyncio
import time
from pathlib import Path
from playwright.async_api import async_playwright

OUT_DIR = Path(r"C:\Users\akpan\.gemini\antigravity\brain\0fca95f5-1da9-4494-b2af-4588e9023727")

async def test_choreography():
    async with async_playwright() as p:
        b = await p.chromium.launch()
        page = await b.new_page(viewport={"width": 1920, "height": 1080})
        await page.goto("http://localhost:5173", wait_until="networkidle")
        await page.wait_for_timeout(1000)

        # Inject cursor
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
                setTimeout(() => {
                    cursor.style.transform = 'translate(-50%, -50%) scale(1)';
                    cursor.style.background = 'rgba(255, 255, 255, 0.96)';
                }, 120);
            };
        }""")

        async def move_to(x, y, dur_s=0.22):
            await page.evaluate(f"window.__moveCursor({x}, {y}, {int(dur_s*1000)})")
            await asyncio.sleep(0.02)

        async def click_at(x, y, dur_s=0.22):
            await move_to(x, y, dur_s)
            await page.evaluate("window.__clickCursor()")
            await page.mouse.click(x, y)
            await asyncio.sleep(0.1)

        async def click_locator(loc, dur_s=0.22):
            box = await loc.bounding_box()
            if box:
                tx = box['x'] + box['width']/2
                ty = box['y'] + box['height']/2
                await click_at(tx, ty, dur_s)
                return True
            return False

        # BEAT 1: 67 Instruments
        badge_67 = page.locator("text='67 INSTRUMENTS'").first
        b_box = await badge_67.bounding_box()
        await move_to(b_box['x'] + b_box['width']/2, b_box['y'] + b_box['height']/2, 0.25)
        await page.screenshot(path=str(OUT_DIR / "check_beat_01.png"))

        # BEAT 2: Refresh live feeds
        ref_btn = page.locator("button[title='Refresh live prices']").first
        await click_locator(ref_btn, 0.22)
        await page.screenshot(path=str(OUT_DIR / "check_beat_02.png"))

        # BEAT 3: Capital setup ($50k, 0.75% risk = $375)
        btn_50k = page.locator("button:has-text('$50k')").last
        await click_locator(btn_50k, 0.22)
        
        # Click Model A
        model_a = page.locator("button:has-text('Model A')").first
        await click_locator(model_a, 0.22)

        # Click custom risk input, clear and fill 0.75
        risk_input = page.locator("input[step='0.1']").first
        r_box = await risk_input.bounding_box()
        await click_at(r_box['x'] + r_box['width']/2, r_box['y'] + r_box['height']/2, 0.22)
        await risk_input.fill("0.75")
        
        # Move to -$375 1R Risk Budget
        budget_card = page.locator("div:has-text('1R Risk Budget')").first
        card_box = await budget_card.bounding_box()
        await move_to(card_box['x'] + card_box['width']/2, card_box['y'] + card_box['height']/2, 0.25)
        await page.screenshot(path=str(OUT_DIR / "check_beat_03.png"))

        # BEAT 4: Price Levels (Use Live Price, Stop Loss 15 pips, +3R)
        btn_live = page.get_by_role("button", name="Use Live Price").first
        await click_locator(btn_live, 0.22)

        entry_input = page.locator("input[placeholder*='1.']").first
        entry_val = float(await entry_input.input_value() or 1.12394)
        stop_val = f"{(entry_val - 0.00150):.5f}"

        stop_input = page.locator("input[placeholder*='Stop loss']").first
        await click_locator(stop_input, 0.22)
        await stop_input.fill(stop_val)

        btn_3r = page.get_by_role("button", name="+3R").first
        await click_locator(btn_3r, 0.22)

        # Hover projected target price
        await move_to(900, 680, 0.22)
        await page.screenshot(path=str(OUT_DIR / "check_beat_04.png"))

        # BEAT 5: BabyPips Parity (Right column)
        # 1. Hover BabyPips header
        await move_to(1200, 405, 0.25)
        await page.screenshot(path=str(OUT_DIR / "check_beat_05_header.png"))

        # 2. Hover Hero 2.50 Lots
        await move_to(1160, 325, 0.22)
        await page.screenshot(path=str(OUT_DIR / "check_beat_05_hero.png"))

        # 3. Hover Amount at Risk: $375.00
        await move_to(1335, 445, 0.22)
        await page.screenshot(path=str(OUT_DIR / "check_beat_05_risk.png"))

        # 4. Hover Position Size (units): 250,000
        await move_to(1335, 480, 0.22)
        await page.screenshot(path=str(OUT_DIR / "check_beat_05_units.png"))

        # BEAT 6: Deriv Volatilities & Bitcoin
        tab_deriv = page.get_by_role("button", name="Deriv Volatilities").first
        await click_locator(tab_deriv, 0.22)
        # Point to Deriv contract specs
        await move_to(1300, 420, 0.25)
        await page.screenshot(path=str(OUT_DIR / "check_beat_06_deriv.png"))

        tab_crypto = page.get_by_role("button", name="BTC / ETH").first
        await click_locator(tab_crypto, 0.22)
        # Point to Crypto lots
        await move_to(1160, 325, 0.25)
        await page.screenshot(path=str(OUT_DIR / "check_beat_06_btc.png"))

        # BEAT 7: Exit Plan & Copy Ticket
        await move_to(1335, 740, 0.25)
        copy_ticket_btn = page.locator("button:has-text('Copy Ticket')").last
        await click_locator(copy_ticket_btn, 0.22)
        await page.screenshot(path=str(OUT_DIR / "check_beat_07_copied.png"))

        print("[SUCCESS] All beat check screenshots updated!")
        await b.close()

if __name__ == "__main__":
    asyncio.run(test_choreography())
