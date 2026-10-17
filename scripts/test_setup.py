import asyncio
from playwright.async_api import async_playwright

async def test_setup():
    async with async_playwright() as p:
        b = await p.chromium.launch()
        page = await b.new_page(viewport={"width": 1920, "height": 1080})
        await page.goto("http://localhost:5173", wait_until="networkidle")
        await page.wait_for_timeout(1500)

        # 1. Click $50k preset
        btn_50k = page.get_by_role("button", name="$50k").first
        await btn_50k.click()
        print("Clicked $50k")

        # 2. Type 0.75 into custom risk input
        risk_input = page.locator("input[step='0.1']").first
        await risk_input.fill("0.75")
        print("Entered 0.75 into risk input")

        # 3. Click Use Live Price
        btn_live = page.get_by_role("button", name="Use Live Price").first
        await btn_live.click()
        print("Clicked Use Live Price")

        # Read actual entry price from input
        entry_input = page.locator("input[placeholder*='1.']").first
        entry_val = float(await entry_input.input_value())
        print(f"Current live entry: {entry_val}")

        # Set stop price exactly 15 pips (0.00150) below
        stop_val = round(entry_val - 0.00150, 5)
        print(f"Target stop price (15 pips below): {stop_val}")

        stop_input = page.locator("input[placeholder*='Stop loss']").first
        await stop_input.fill(str(stop_val))
        print(f"Filled stop loss {stop_val}")

        # 5. Click +3R
        btn_3r = page.get_by_role("button", name="+3R").first
        await btn_3r.click()
        print("Clicked +3R")

        await page.wait_for_timeout(1000)

        # 6. Check results
        breakdown = page.locator(".neat-card:has-text('BabyPips Sizing Breakdown')").first
        if await breakdown.count() > 0:
            print("\n--- BABYPIPS BREAKDOWN ---")
            print(await breakdown.inner_text())

        await page.screenshot(path="scripts/test_screen_exact_250_lots.png")
        print("Saved scripts/test_screen_exact_250_lots.png")

        await b.close()

if __name__ == "__main__":
    asyncio.run(test_setup())
