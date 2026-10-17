import asyncio
import time
from playwright.async_api import async_playwright

async def test_speed():
    async with async_playwright() as p:
        b = await p.chromium.launch()
        page = await b.new_page(viewport={"width": 1920, "height": 1080})
        await page.goto("http://localhost:5173", wait_until="networkidle")

        cur_pos = [960, 540]

        async def move_to(x, y, duration_s=0.24):
            t0 = time.time()
            x0, y0 = cur_pos[0], cur_pos[1]
            steps = max(8, int(duration_s * 50))
            for i in range(1, steps + 1):
                t = i / steps
                k = 1.0 - (1.0 - t) ** 3
                mx = x0 + (x - x0) * k
                my = y0 + (y - y0) * k
                await page.mouse.move(mx, my)
                await asyncio.sleep(duration_s / steps)
            cur_pos[0], cur_pos[1] = x, y
            elapsed = time.time() - t0
            print(f"Move to ({x}, {y}): requested {duration_s}s, actual {elapsed:.3f}s")

        await move_to(500, 200, 0.24)
        await move_to(1300, 500, 0.26)
        await move_to(960, 700, 0.22)

        await b.close()

if __name__ == "__main__":
    asyncio.run(test_speed())
