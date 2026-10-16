import time
from playwright.sync_api import sync_playwright

def verify():
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        page = browser.new_page(viewport={"width": 1920, "height": 1080})
        page.goto("http://localhost:5173", wait_until="networkidle")
        time.sleep(2)
        
        # Click on "Indices" category tab
        page.locator("button:has-text('Indices')").first.click()
        time.sleep(0.5)
        
        # Select SPX500 from dropdown
        page.locator("select").first.select_option("SPX500")
        time.sleep(1)
        
        # Click Balance $25k preset
        page.locator("button:has-text('$25k')").first.click()
        time.sleep(0.5)
        
        # Click Risk % 0.5% preset
        page.locator("button:has-text('0.5%')").first.click()
        time.sleep(0.5)
        
        # Enter Entry Price 7668.9
        entry_input = page.locator("input[placeholder*='7,']").first
        if not entry_input.count():
            entry_input = page.locator("input[type='number']").nth(2)
        entry_input.fill("7668.9")
        time.sleep(0.5)
        
        # Enter Stop Price 7601.5
        stop_input = page.locator("input[placeholder*='Stop loss']").first
        stop_input.fill("7601.5")
        time.sleep(0.5)
        
        # Enter Take Profit 7938.5
        take_input = page.locator("input[placeholder*='Target profit']").first
        take_input.fill("7938.5")
        time.sleep(1)
        
        # Screenshot SPX500 verified
        screenshot_path = "C:/Users/akpan/.gemini/antigravity/brain/0fca95f5-1da9-4494-b2af-4588e9023727/verified_spx500_fix.png"
        page.screenshot(path=screenshot_path, full_page=True)
        print(f"[+] Verified screenshot saved to {screenshot_path}")
        browser.close()

if __name__ == "__main__":
    verify()
