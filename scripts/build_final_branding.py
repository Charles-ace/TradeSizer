import os
from pathlib import Path
from PIL import Image
from playwright.sync_api import sync_playwright

BASE_DIR = Path(r"c:\Builds\Position size calculator\TradeSizer")
PUBLIC_DIR = BASE_DIR / "public"

SVG_MARK = """<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" width="100%" height="100%">
  <defs>
    <!-- Background Gradient -->
    <radialGradient id="tsBg" cx="30%" cy="25%" r="85%">
      <stop offset="0%" stop-color="#0f172a" />
      <stop offset="55%" stop-color="#070a12" />
      <stop offset="100%" stop-color="#020408" />
    </radialGradient>

    <!-- Emerald Vector Gradient -->
    <linearGradient id="tsEmerald" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#34d399" />
      <stop offset="45%" stop-color="#10b981" />
      <stop offset="100%" stop-color="#059669" />
    </linearGradient>

    <!-- Cyan Precision Gradient -->
    <linearGradient id="tsCyan" x1="0%" y1="100%" x2="100%" y2="0%">
      <stop offset="0%" stop-color="#0284c7" />
      <stop offset="50%" stop-color="#38bdf8" />
      <stop offset="100%" stop-color="#7dd3fc" />
    </linearGradient>

    <!-- Border Rim Gradient -->
    <linearGradient id="tsBorder" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#10b981" stop-opacity="0.8" />
      <stop offset="40%" stop-color="#38bdf8" stop-opacity="0.5" />
      <stop offset="100%" stop-color="#1e293b" stop-opacity="0.85" />
    </linearGradient>

    <!-- Glow Filter -->
    <filter id="tsGlow" x="-20%" y="-20%" width="140%" height="140%">
      <feGaussianBlur stdDeviation="7" result="blur" />
      <feComposite in="SourceGraphic" in2="blur" operator="over" />
    </filter>
  </defs>

  <!-- Squircle Base -->
  <rect x="20" y="20" width="472" height="472" rx="112" fill="url(#tsBg)" stroke="url(#tsBorder)" stroke-width="6" />

  <!-- Quant Grid Overlay -->
  <g opacity="0.10" stroke="#94a3b8" stroke-width="2" stroke-dasharray="6 8">
    <line x1="80" y1="256" x2="432" y2="256" />
    <line x1="256" y1="80" x2="256" y2="432" />
    <circle cx="256" cy="256" r="140" fill="none" />
  </g>

  <!-- Caliper Blade 1: Top Bar & Descending Jaw (The "T" Anchor - Cyan) -->
  <path d="M 120 138 
           L 392 138 
           A 16 16 0 0 1 408 154 
           L 408 194 
           A 16 16 0 0 1 392 210 
           L 306 210 
           L 306 244 
           A 14 14 0 0 1 292 258 
           L 262 258 
           L 262 210 
           L 180 210 
           L 180 264 
           A 14 14 0 0 1 166 278 
           L 134 278 
           A 14 14 0 0 1 120 264 
           L 120 154 
           A 16 16 0 0 1 120 138 Z"
        fill="url(#tsCyan)"
        filter="url(#tsGlow)" />

  <!-- Caliper Blade 2: Ascending Delta & S-Curve (The "S" Growth Vector - Emerald) -->
  <path d="M 392 374 
           L 120 374 
           A 16 16 0 0 1 104 358 
           L 104 318 
           A 16 16 0 0 1 120 302 
           L 206 302 
           L 206 268 
           A 14 14 0 0 1 220 254 
           L 250 254 
           L 250 302 
           L 332 302 
           L 332 248 
           A 14 14 0 0 1 346 234 
           L 378 234 
           A 14 14 0 0 1 392 248 
           L 392 358 
           A 16 16 0 0 1 392 374 Z"
        fill="url(#tsEmerald)"
        filter="url(#tsGlow)" />

  <!-- Central Nexus Diamond -->
  <polygon points="256,232 278,256 256,280 234,256" fill="#ffffff" opacity="0.95" />
  <circle cx="256" cy="256" r="6" fill="#10b981" />
  <circle cx="256" cy="256" r="2" fill="#ffffff" />

  <!-- Caliper Ruler Calibration Ticks -->
  <g fill="#ffffff" opacity="0.65">
    <rect x="156" y="138" width="4" height="14" rx="2" />
    <rect x="206" y="138" width="4" height="10" rx="2" />
    <rect x="254" y="138" width="4" height="18" rx="2" />
    <rect x="306" y="138" width="4" height="10" rx="2" />
    <rect x="356" y="138" width="4" height="14" rx="2" />

    <rect x="156" y="360" width="4" height="14" rx="2" />
    <rect x="206" y="364" width="4" height="10" rx="2" />
    <rect x="254" y="356" width="4" height="18" rx="2" />
    <rect x="306" y="364" width="4" height="10" rx="2" />
    <rect x="356" y="360" width="4" height="14" rx="2" />
  </g>
</svg>
"""

# Full Horizontal Logo (Dark)
SVG_LOGO_FULL = f"""<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 600 120" width="100%" height="100%">
  <!-- Icon Mark (100x100 at x=10, y=10) -->
  <g transform="translate(10, 10) scale(0.1953125)">
    {SVG_MARK}
  </g>
  <!-- Wordmark -->
  <text x="135" y="68" font-family="'Geist', 'Segoe UI', -apple-system, sans-serif" font-size="44" font-weight="900" letter-spacing="3" fill="#ffffff">
    TRADE<tspan fill="#34d399">SIZER</tspan>
  </text>
  <!-- Subtitle -->
  <text x="137" y="92" font-family="'JetBrains Mono', 'Consolas', monospace" font-size="11" font-weight="700" letter-spacing="2.5" fill="#94a3b8">
    INSTITUTIONAL POSITION SIZING &amp; RISK ENGINE
  </text>
</svg>
"""

# Save SVGs
(PUBLIC_DIR / "favicon.svg").write_text(SVG_MARK, encoding="utf-8")
(PUBLIC_DIR / "logo-mark.svg").write_text(SVG_MARK, encoding="utf-8")
(PUBLIC_DIR / "logo.svg").write_text(SVG_LOGO_FULL, encoding="utf-8")
print("[+] Wrote favicon.svg, logo-mark.svg, and logo.svg")

# Render high-res PNG for icons using Playwright
render_html = f"""<!DOCTYPE html>
<html>
<body style="margin:0; padding:0; background:transparent;">
  <div style="width:512px; height:512px;">{SVG_MARK}</div>
</body>
</html>"""

tmp_html = PUBLIC_DIR / "tmp_icon_render.html"
tmp_html.write_text(render_html, encoding="utf-8")

with sync_playwright() as p:
    browser = p.chromium.launch()
    page = browser.new_page(viewport={"width": 512, "height": 512})
    page.goto(f"file:///{tmp_html.as_posix()}", wait_until="networkidle")
    master_png = PUBLIC_DIR / "icon-512.png"
    page.screenshot(path=str(master_png), omit_background=True)
    browser.close()

if tmp_html.exists():
    tmp_html.unlink()

# Generate multi-size PNG favicons and multi-resolution ICO using Pillow
img_512 = Image.open(master_png)

# Apple Touch Icon 180x180
img_180 = img_512.resize((180, 180), Image.Resampling.LANCZOS)
img_180.save(PUBLIC_DIR / "apple-touch-icon.png", format="PNG")

# 32x32 Favicon
img_32 = img_512.resize((32, 32), Image.Resampling.LANCZOS)
img_32.save(PUBLIC_DIR / "favicon-32x32.png", format="PNG")

# 16x16 Favicon
img_16 = img_512.resize((16, 16), Image.Resampling.LANCZOS)
img_16.save(PUBLIC_DIR / "favicon-16x16.png", format="PNG")

# Multi-resolution ICO (16, 32, 48)
ico_sizes = [(16, 16), (32, 32), (48, 48)]
img_512.save(PUBLIC_DIR / "favicon.ico", format="ICO", sizes=ico_sizes)
print("[+] Successfully generated all favicon PNGs, ICO and SVG assets!")
