import asyncio
from pathlib import Path
from playwright.async_api import async_playwright

async def verify_user_btc():
    async with async_playwright() as p:
        browser = await p.chromium.launch(headless=True)
        page = await browser.new_page(viewport={"width": 1440, "height": 960})
        
        print("[*] Loading TradeSizer at http://localhost:5173...", flush=True)
        await page.goto("http://localhost:5173", wait_until="domcontentloaded")
        await page.wait_for_timeout(2000)
        
        # 1. Click BTC / ETH category chip
        print("[*] Clicking BTC / ETH category...", flush=True)
        btc_chip = page.get_by_role("button", name="BTC / ETH").first
        await btc_chip.click()
        await page.wait_for_timeout(500)
        
        # 2. Set Risk % to 0.75
        print("[*] Setting Risk % to 0.75%...", flush=True)
        risk_input = page.locator("input[placeholder*='Risk']").first
        # Or type directly into risk input
        risk_inputs = page.locator("input[type='number']")
        # Find risk input (usually the one next to % sign)
        for i in range(await risk_inputs.count()):
            inp = risk_inputs.nth(i)
            val = await inp.input_value()
            if val in ['0.6', '0.75', '1', '1.5', '2']:
                await inp.click()
                await page.keyboard.press("Control+A")
                await page.keyboard.press("Backspace")
                await inp.fill("0.75")
                break
        
        # 3. Enter Entry Price: 82383.42
        print("[*] Entering Entry Price 82383.42...", flush=True)
        entry_input = page.locator("input[placeholder*='81']").first
        if await entry_input.count() == 0:
            entry_input = page.locator("input[type='number']").nth(2)
        await entry_input.click()
        await page.keyboard.press("Control+A")
        await page.keyboard.press("Backspace")
        await entry_input.fill("82383.42")
        await page.wait_for_timeout(300)
        
        # 4. Enter Stop Price: 80533.89
        print("[*] Entering Stop Price 80533.89...", flush=True)
        stop_input = page.locator("input[placeholder*='Stop loss']").first
        await stop_input.click()
        await page.keyboard.press("Control+A")
        await page.keyboard.press("Backspace")
        await stop_input.fill("80533.89")
        await page.wait_for_timeout(300)
        
        # 5. Enter Take Level Price: 87932.01
        print("[*] Entering Take Level Price 87932.01...", flush=True)
        take_input = page.locator("input[placeholder*='Target profit']").first
        await take_input.click()
        await page.keyboard.press("Control+A")
        await page.keyboard.press("Backspace")
        await take_input.fill("87932.01")
        await page.wait_for_timeout(500)
        
        # Screenshot result
        out_path = Path(r"c:\Builds\Position size calculator\TradeSizer\verified_user_btc_fixed.png")
        await page.screenshot(path=str(out_path), full_page=False)
        print(f"[SUCCESS] Saved fixed BTC screenshot to {out_path}", flush=True)
        
        await browser.close()

if __name__ == "__main__":
    asyncio.run(verify_user_btc())
