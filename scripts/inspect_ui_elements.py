import asyncio
from playwright.async_api import async_playwright

async def inspect():
    async with async_playwright() as p:
        b = await p.chromium.launch()
        page = await b.new_page(viewport={"width": 1920, "height": 1080})
        await page.goto("http://localhost:5173", wait_until="networkidle")
        await page.wait_for_timeout(2000)
        
        elements = [
            ("67 INSTRUMENTS", page.locator("text='67 INSTRUMENTS'").first),
            ("DERIV Broker badge", page.locator("text='DERIV Broker'").first),
            ("FOREX.COM badge", page.locator("text='FOREX.COM'").first),
            ("Coinbase badge", page.locator("text='Coinbase'").first),
            ("Refresh button", page.locator("button[title='Refresh live prices']").first),
            ("Majors tab", page.get_by_role("button", name="Majors").first),
            ("Gold & Oil tab", page.get_by_role("button", name="Gold & Oil").first),
            ("All 67 Instruments tab", page.get_by_role("button", name="All 67 Instruments").first),
            ("Deriv Volatilities tab", page.get_by_role("button", name="Deriv Volatilities").first),
            ("Crypto tab", page.get_by_role("button", name="BTC / ETH").first),
            ("Account Balance input", page.locator("input[type='number']").first),
            ("Balance preset $25k", page.get_by_role("button", name="$25k").first),
            ("Balance preset $50k", page.get_by_role("button", name="$50k").first),
            ("Balance preset $100k", page.get_by_role("button", name="$100k").first),
            ("Model A", page.locator("button:has-text('Model A')").first),
            ("Model C", page.locator("button:has-text('Model C')").first),
            ("0.5% button", page.get_by_role("button", name="0.5%").first),
            ("1.0% button", page.get_by_role("button", name="1.0%").first),
            ("1.5% button", page.get_by_role("button", name="1.5%").first),
            ("2.0% button", page.get_by_role("button", name="2.0%").first),
            ("Use Live Price button", page.get_by_role("button", name="Use Live Price").first),
            ("Stop loss input", page.locator("input[placeholder*='Stop loss']").first),
            ("+1R button", page.get_by_role("button", name="+1R").first),
            ("+2R button", page.get_by_role("button", name="+2R").first),
            ("+3R button", page.get_by_role("button", name="+3R").first),
            ("Take profit input", page.locator("input[placeholder*='Take profit']").first),
            ("Results Standard Lots hero", page.locator("div:has-text('Standard Lots')").last),
            ("Copy Ticket button", page.locator("button:has-text('Copy Ticket')").first),
        ]
        
        print("--- ELEMENT BOUNDING BOXES (1920x1080) ---")
        for name, loc in elements:
            cnt = await loc.count()
            if cnt > 0:
                box = await loc.bounding_box()
                print(f"{name:30} : count={cnt}, box={box}")
            else:
                print(f"{name:30} : NOT FOUND")

        # Let's inspect Results panel cards and texts
        print("\n--- RESULTS PANEL ELEMENTS ---")
        result_texts = ["Standard Lots", "Mini Lots", "Micro Lots", "Units", "Amount at Risk", "Potential Reward", "R:R Ratio"]
        for txt in result_texts:
            loc = page.locator(f"text='{txt}'").first
            if await loc.count() > 0:
                box = await loc.bounding_box()
                print(f"Text '{txt:18}' : box={box}")
            else:
                print(f"Text '{txt:18}' : NOT FOUND")

        await b.close()

if __name__ == "__main__":
    asyncio.run(inspect())
