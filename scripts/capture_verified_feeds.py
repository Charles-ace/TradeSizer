import asyncio
from pathlib import Path
from playwright.async_api import async_playwright

async def capture():
    async with async_playwright() as p:
        browser = await p.chromium.launch(headless=True)
        page = await browser.new_page(viewport={"width": 1440, "height": 960})
        
        print("[*] Navigating to http://localhost:5173...")
        await page.goto("http://localhost:5173", wait_until="networkidle")
        await page.wait_for_timeout(2500)
        
        out_eur = Path(r"c:\Builds\Position size calculator\TradeSizer\verified_forexcom_eurusd.png")
        await page.screenshot(path=str(out_eur), full_page=False)
        print(f"[+] Saved EURUSD screenshot to {out_eur}")
        
        # Click BTC/ETH chip
        btc_chip = page.get_by_role("button", name="BTC / ETH").first
        if await btc_chip.count() > 0:
            await btc_chip.click()
            await page.wait_for_timeout(500)
            btc_btn = page.get_by_role("button", name="BTCUSD").first
            if await btc_btn.count() > 0:
                await btc_btn.click()
                await page.wait_for_timeout(1000)
                out_btc = Path(r"c:\Builds\Position size calculator\TradeSizer\verified_coinbase_btc.png")
                await page.screenshot(path=str(out_btc), full_page=False)
                print(f"[+] Saved BTC screenshot to {out_btc}")

        # Click Gold & Oil chip
        metals_chip = page.get_by_role("button", name="Gold & Oil").first
        if await metals_chip.count() > 0:
            await metals_chip.click()
            await page.wait_for_timeout(500)
            oil_btn = page.get_by_role("button", name="USOIL").first
            if await oil_btn.count() > 0:
                await oil_btn.click()
                await page.wait_for_timeout(1000)
                out_oil = Path(r"c:\Builds\Position size calculator\TradeSizer\verified_forexcom_oil.png")
                await page.screenshot(path=str(out_oil), full_page=False)
                print(f"[+] Saved Oil screenshot to {out_oil}")
                
        await browser.close()

if __name__ == "__main__":
    asyncio.run(capture())
