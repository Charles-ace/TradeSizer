import asyncio
from playwright.async_api import async_playwright

async def verify_fix():
    async with async_playwright() as p:
        browser = await p.chromium.launch(headless=True)
        page = await browser.new_page(viewport={"width": 1400, "height": 900})
        
        await page.goto("http://localhost:5173", wait_until="networkidle")
        await page.wait_for_timeout(1000)
        
        # Click Deriv Volatilities filter
        deriv_btn = page.get_by_role("button", name="Deriv Volatilities").first
        if await deriv_btn.count() > 0:
            await deriv_btn.click()
            await page.wait_for_timeout(300)
            
        # Select JUMP_100_INDEX from dropdown
        select = page.locator("select").first
        await select.select_option("JUMP_100_INDEX")
        await page.wait_for_timeout(300)
        
        # Balance = 25000
        balance_input = page.locator("input[type='number']").first
        await balance_input.click()
        await page.keyboard.press("Control+A")
        await page.keyboard.type("25000")
        
        # Risk % = 10
        # Find risk input
        risk_input = page.locator("input[placeholder='1.5']").first
        if await risk_input.count() > 0:
            await risk_input.click()
            await page.keyboard.press("Control+A")
            await page.keyboard.type("10")
            
        # Entry Price = 122.19
        entry_input = page.locator("input[placeholder*='129']").first
        if await entry_input.count() == 0:
            entry_input = page.locator("input[type='number']").nth(2)
        await entry_input.click()
        await page.keyboard.press("Control+A")
        await page.keyboard.type("122.19")
        
        # Stop Price = 117.75
        stop_input = page.locator("input[placeholder*='Stop loss']").first
        await stop_input.click()
        await page.keyboard.press("Control+A")
        await page.keyboard.type("117.75")
        
        # Take Profit = 144.44
        take_input = page.locator("input[placeholder*='Target profit']").first
        await take_input.click()
        await page.keyboard.press("Control+A")
        await take_input.fill("144.44")
        
        await page.wait_for_timeout(800)
        
        out_png = "C:/Users/akpan/.gemini/antigravity/brain/0fca95f5-1da9-4494-b2af-4588e9023727/verified_deriv_calculation_fix.png"
        await page.screenshot(path=out_png, full_page=False)
        print(f"[SUCCESS] Screenshot captured: {out_png}")
        
        await browser.close()

if __name__ == "__main__":
    asyncio.run(verify_fix())
