import asyncio
import time
from playwright.async_api import async_playwright

async def test_js_cursor():
    async with async_playwright() as p:
        b = await p.chromium.launch()
        page = await b.new_page(viewport={"width": 1920, "height": 1080})
        await page.goto("http://localhost:5173", wait_until="networkidle")

        # Inject high-performance requestAnimationFrame cursor engine
        await page.evaluate("""() => {
            window.__cursorPos = { x: 960, y: 540 };
            
            const cursor = document.createElement('div');
            cursor.id = 'demo-synced-cursor';
            cursor.style.cssText = `
                position: fixed;
                left: 960px;
                top: 540px;
                width: 20px;
                height: 20px;
                border-radius: 50%;
                background: rgba(255, 255, 255, 0.96);
                border: 2px solid #000;
                box-shadow: 0 0 16px rgba(16, 185, 129, 0.95), 0 0 0 1px rgba(255, 255, 255, 0.8);
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
                        // Ease out cubic
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
                    box-shadow: 0 0 12px rgba(16, 185, 129, 0.8);
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
                    100% { width: 52px; height: 52px; opacity: 0; }
                }
            `;
            document.head.appendChild(style);
        }""")

        async def move_to(x, y, duration_s=0.24):
            t0 = time.time()
            await page.evaluate(f"window.__moveCursor({x}, {y}, {int(duration_s * 1000)})")
            elapsed = time.time() - t0
            print(f"JS Move to ({x}, {y}): requested {duration_s}s, actual {elapsed:.3f}s")

        await move_to(500, 200, 0.24)
        await move_to(1300, 500, 0.26)
        await move_to(960, 700, 0.22)

        await b.close()

if __name__ == "__main__":
    asyncio.run(test_js_cursor())
