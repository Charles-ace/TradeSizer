# TradeSizer

**TradeSizer** is a deterministic, institutional-grade trading position size and multi-model risk calculator. It provides mathematical precision for traders operating structured risk-budgeting systems across Forex, Metals, Equity Indices, Deriv Synthetic Indices, and Cryptocurrencies.

---

## Table of Contents

1. [Overview](#overview)
2. [Trading Models & The 3R / 2R-Banked / 4R-Final Structure](#trading-models--the-3r--2r-banked--4r-final-structure)
   - [Confirmation Models (A & B) — Why a Full Win Yields 3.33R](#confirmation-models-a--b--why-a-full-win-yields-333r)
   - [Post-Partial Scenarios (Breakeven vs. Original Stop)](#post-partial-scenarios-breakeven-vs-original-stop)
   - [Risk Models (C & D)](#risk-models-c--d)
3. [Position Sizing & Multi-Asset Mathematics](#position-sizing--multi-asset-mathematics)
   - [Planned Risk Calculation](#1-planned-risk-calculation)
   - [Asset-Specific Loss per Lot](#2-asset-specific-loss-per-lot)
   - [Strict Round-Down Volume Normalization](#3-strict-round-down-volume-normalization)
   - [Partial Lot Rounding & Splitability Rules](#4-partial-lot-rounding--splitability-rules)
4. [Trade Direction, Margin Check & Trading Costs](#trade-direction-margin-check--trading-costs)
5. [Supported Instruments Catalog](#supported-instruments-catalog)
6. [Known Limitations & Currency Conversion](#known-limitations--currency-conversion)
7. [Installation & Local Execution](#installation--local-execution)
8. [Automated Verification Tests](#automated-verification-tests)
9. [Financial & Execution Disclaimer](#financial--execution-disclaimer)

---

## Overview

Most trading calculators rely on naive, uniform equations that disregard broker lot increments, contract specifications, or multi-stage partial exit mechanics.

**TradeSizer** solves this with:
- **Exact Multi-Stage Partial Scaling:** Derived exit fractions that guarantee you bank 2R at 3R and run the remainder to 4R.
- **Strict Capital Preservation:** All position sizing and partial order splits are rounded **down** to the broker's minimum volume increment (`lotStep`), ensuring actual monetary risk never exceeds the model's budget.
- **Multi-Asset Precision:** Dedicated contract specifications for Forex, Metals (`XAUUSD`, `XAGUSD`), Equity CFDs (`NAS100`, `US30`, `SPX500`, `GER40`), Deriv Synthetics (`Volatility 75`, `Crash/Boom`, `Step Index`), and Crypto (`BTCUSD`).
- **Interactive Price Level Mapping & Margin Guard:** Calculates order margin at user leverage (1:30 to 1:500) and displays spread and commission costs.

---

## Trading Models & The 3R / 2R-Banked / 4R-Final Structure

The application's baseline starting equity is **$25,000.00 USD**. TradeSizer implements four models divided into two operational regimes:

### Confirmation Models (A & B) — Why a Full Win Yields 3.33R

Models A and B utilize a 4R target system with **one derived partial exit**:
- **Trigger Level:** `3R`
- **Banked Target:** `2R`
- **Final Target:** `4R`

#### 1. Why the Close Fraction is 66.67%
The close percentage is strictly derived from the ratio of banked profit to the trigger distance:
$$\text{Close Fraction} = \frac{\text{Banked R}}{\text{Trigger R}} = \frac{2\text{R}}{3\text{R}} = \frac{2}{3} \approx 66.67\%$$
$$\text{Remainder Fraction} = 1 - \frac{2}{3} = \frac{1}{3} \approx 33.33\%$$

#### 2. Why a Full Win Equals 3.33R (Not 4R)
Traders often mistakenly expect a 4R trade to return 4R even after taking partial profits. Because two-thirds of the position is closed early at 3R, only the remaining one-third reaches the 4R final target:
1. **Stage 1 (At 3R Trigger):**  
   $$\text{Profit Banked} = \left(\frac{2}{3} \times \text{Position}\right) \times 3\text{R} = 2.00\text{R}$$
2. **Stage 2 (At 4R Final Target):**  
   $$\text{Profit Added} = \left(\frac{1}{3} \times \text{Position}\right) \times 4\text{R} = \frac{4}{3}\text{R} \approx 1.3333\text{R}$$
3. **Total Full-Win Return:**  
   $$\text{Total Profit} = 2.00\text{R} + 1.3333\text{R} = 3.3333\text{R} \approx 3.33\text{R}$$

On a **$25,000 account** risking **0.75% ($187.50 USD)**:
- At 3R: Closes 66.67% of volume, locking **+$375.00 USD** ($187.50 × 2).
- At 4R: The remaining 33.33% adds **+$250.00 USD** ($187.50 × 1.3333).
- Full Win Total: **+$625.00 USD** (3.33R).
- *Reference Unadjusted 4R:* **$750.00 USD** (displayed as a labeled reference only, representing the hypothetical return if no partial was taken).

### Post-Partial Scenarios (Breakeven vs. Original Stop)

Once the partial fills at 3R, TradeSizer evaluates two possible outcomes for the remaining 33.33% position:
- **Breakeven Case (Stop moved to Entry):**  
  The remainder stops out at $0 P&L. You retain the 2R locked at Stage 1.  
  $$\text{Net Profit} = 2.00\text{R} = +\$375.00\text{ USD}$$
- **Original-Stop Case (Stop left at -1R):**  
  The remainder stops out at the original stop loss, incurring a loss of $\frac{1}{3} \times (-1\text{R}) = -0.3333\text{R}$ (-$62.50 USD).  
  $$\text{Net Profit} = 2.00\text{R} - 0.3333\text{R} = 1.6667\text{R} \approx 1.67\text{R} = +\$312.50\text{ USD}$$

**"Move stop to breakeven after partial" Toggle:**  
In the UI, toggling this setting highlights either the Breakeven ($375) or Original Stop ($312.50) outcome card as the active worst-case scenario.

---

### Risk Models (C & D)

Models C and D are single-exit risk systems:
- **Risk Budget:** `0.50%` of account equity ($125.00 on a $25,000 account).
- **Target:** `3R` ($375.00 on a $25,000 account).
- **Partials:** None. Strict all-or-nothing trade execution.

---

## Position Sizing & Multi-Asset Mathematics

### 1. Planned Risk Calculation
$$\text{Planned Risk Amount} = \text{Account Balance} \times \left(\frac{\text{Risk Percentage}}{100}\right)$$

### 2. Asset-Specific Loss per Lot
$$\text{Raw Position Size} = \frac{\text{Planned Risk Amount}}{\text{Loss Per Lot at Stop}}$$

- **Forex (EURUSD, GBPUSD):**  
  $1\text{ pip} = 0.0001 \times 100,000 = \$10.00\text{ USD}$.  
  $\text{Loss Per Lot} = \text{Stop (pips)} \times \$10.00$.
- **Forex Cross / Indirect (USDJPY, GBPJPY):**  
  $1\text{ pip} = 1,000\text{ JPY} \div \text{USD/JPY Rate}$.
- **Gold (XAUUSD):**  
  100 troy oz contract. A $\$1.00$ price move equals $\$100.00\text{ USD}$ per lot.
- **Indices (NAS100, US30):**  
  1.0 point movement equals $\$1.00\text{ USD}$ per 1.0 contract.
- **Crypto (BTCUSD):**  
  1.0 lot = 1 Bitcoin. A $\$1.00$ move equals $\$1.00\text{ USD}$ per lot.
- **Deriv Volatility 75:**  
  Contract size = 1. Min lot = 0.001, lot step = 0.001.

### 3. Strict Round-Down Volume Normalization
Position sizes are rounded **strictly down** to the broker's `lotStep`:
$$\text{Steps} = \left\lfloor \frac{\text{Raw Lots} - \text{Min Lot}}{\text{Lot Step}} + \epsilon \right\rfloor$$
$$\text{Normalized Lots} = \text{Min Lot} + (\text{Steps} \times \text{Lot Step})$$

This guarantees:
$$\text{Actual Risk Amount} \le \text{Planned Risk Amount}$$

### 4. Partial Lot Rounding & Splitability Rules
For Models A and B:
1. `Raw Partial Lots` = `Normalized Position Size` × `(2 / 3)`.
2. Rounded **strictly down** to `lotStep`.
3. `Remainder Lots` = `Normalized Position Size` - `Actual Partial Lots`.
4. **Splitability Check:** If `Actual Partial Lots < Min Lot` or `Remainder Lots < Min Lot`:
   - Position is flagged as **too small to split**.
   - Sizing is not artificially fudged; an explicit warning is displayed informing the trader that the position must run as a single block.
5. **Actual Banked R Recalculation:** Because partial lots are rounded down to broker increments, actual banked R is recalculated:
   $$\text{Actual Banked R} = \frac{\text{Actual Partial Lots} \times \text{Trigger R} \times \text{Loss Per Lot}}{\text{Actual Risk Amount}}$$

---

## Trade Direction, Margin Check & Trading Costs

1. **Order Direction (Long / Short):**  
   Interactive BUY/SELL toggle updates stop price and projected target levels (3R Trigger Price, 4R Final Target Price).
2. **Margin Requirement Check:**  
   Calculates required margin based on account leverage ($1:30$ to $1:500$):
   $$\text{Margin Required} = \frac{\text{Position Size} \times \text{Contract Size} \times \text{Price}}{\text{Leverage}}$$
   Warns if required margin exceeds available equity or exceeds 80% utilization.
3. **Trading Costs Estimation:**  
   Computes spread and round-turn commission impact, displaying net risk and net target profit.

---

## Supported Instruments Catalog

| Symbol | Category | Contract Size | Default Stop Unit | Min Lot | Step | Sizing Note |
|---|---|---|---|---|---|---|
| **EURUSD** | Forex | 100,000 | Pips | 0.01 | 0.01 | Fixed $10/pip quote |
| **GBPUSD** | Forex | 100,000 | Pips | 0.01 | 0.01 | Fixed $10/pip quote |
| **USDJPY** | Forex | 100,000 | Pips | 0.01 | 0.01 | Divided by USD/JPY rate |
| **GBPJPY** | Forex | 100,000 | Pips | 0.01 | 0.01 | Divided by USD/JPY rate |
| **XAUUSD** | Metals | 100 oz | Price ($) / Points | 0.01 | 0.01 | $100 per $1.00 move/lot |
| **NAS100** | Indices | 1 | Points | 0.1 | 0.1 | $1.00 per point/contract |
| **BTCUSD** | Crypto | 1 BTC | Price ($) / Points | 0.01 | 0.01 | $1.00 per $1.00 move/lot |
| **VOL_75** | Synthetics | 1 | Points | 0.001 | 0.001 | Min order size 0.001 |
| **CRASH_500**| Synthetics | 1 | Points | 0.20 | 0.01 | Min order size 0.20 |
| **STEP_INDEX**| Synthetics | 10 | Points | 0.10 | 0.01 | $10 per 1.0 point/lot |

---

## Apple Design System & UI Architecture

TradeSizer's frontend implements Apple's WWDC interface design foundations:

1. **Materials & Depth (Obsidian Liquid Glass):**
   - Translucent structural surfaces (`backdrop-filter: blur(24px) saturate(190%)`) layered over deep space obsidian (`#07090e`).
   - Hairline light-catching borders (`border: 1px solid rgba(255, 255, 255, 0.08)`) with inset edge highlights (`box-shadow: inset 0 1px 0 0 rgba(255, 255, 255, 0.08)`).
   - Radial ambient cyan/indigo background glows that reflect institutional trading desks.
2. **Typography Scale & Optical Sizing:**
   - Platform system font stack: `-apple-system, BlinkMacSystemFont, "SF Pro Display", "SF Pro Text", "Inter", system-ui, sans-serif`.
   - Numeric tabular lining figures (`font-variant-numeric: tabular-nums`) so digits never jump during real-time typing.
   - Tight negative tracking (`-0.03em`) on display headers and bold lot counts paired with spaced uppercase technical micro-labels (`tracking-[0.08em]`).
3. **Physicality & Micro-Interactions:**
   - Apple-calibrated spring press states (`active:scale-[0.975]` with `cubic-bezier(0.16, 1, 0.3, 1)`).
   - Tactile Segmented Controls for Order Direction (BUY / SELL), Categories, and Models.
   - iOS-style physical toggle switch for "Move stop to breakeven after partial".
   - Rapid tactile steppers (+ / - 1 unit) on stop-loss distance for fast execution.
4. **Interactive R-Multiple Progress Bar:**
   - Visual progress timeline showing `-1R Stop Budget`, `0R Entry`, `+3R Partial (Bank 2R)`, and `+4R Final Target (3.33R Net)`.

---

## Demo Video & Remotion Motion Suite

TradeSizer includes a motion video suite powered by **ElevenLabs AI Voiceover** and **Remotion (v4.0)**:

### 1. ElevenLabs Voiceover Synthesis
Synthesized using ElevenLabs high-fidelity `eleven_turbo_v2_5` voice model across 7 structured scenes:
- `demo_assets/scene_01_intro_elevenlabs.mp3` — System architecture and baseline $25k balance.
- `demo_assets/scene_02_model_a_elevenlabs.mp3` — Model A 0.75% risk ($187.50) and 1.25 lots EURUSD sizing.
- `demo_assets/scene_03_partials_elevenlabs.mp3` — Mathematical derivation of 66.67% partial exit at 3R and 3.33R full win ($625.50).
- `demo_assets/scene_04_breakeven_elevenlabs.mp3` — Breakeven toggle ($375.00 vs $312.50).
- `demo_assets/scene_05_model_c_elevenlabs.mp3` — Models C & D 0.50% risk with single 3R exit ($375.00).
- `demo_assets/scene_06_multi_asset_elevenlabs.mp3` — Multi-asset leverage and margin guard.
- `demo_assets/scene_07_ticket_elevenlabs.mp3` — 1-click execution ticket export.

### 2. Generated Video Artifacts
- **`TradeSizer_Stock_ElevenLabs_Demo.mp4`**: Full 1080p stock trading video demo featuring procedural animated candlestick charts, kinetic typography, and ElevenLabs voiceover.
- **`TradeSizer_ElevenLabs_Demo.mp4`**: High-resolution walk-through video with scene cards.

### 3. Remotion CLI Studio & Rendering
A Remotion composition is included under `src/remotion/`:
```bash
# Preview in Remotion Studio
npm run remotion:preview

# Render composition to MP4
npm run remotion:render
```

---

## Vercel Deployment Guide

TradeSizer is pre-configured for instant zero-configuration hosting on **Vercel**:

### 1. Configuration File (`vercel.json`)
```json
{
  "$schema": "https://openapi.vercel.sh/vercel.json",
  "framework": "vite",
  "buildCommand": "npm run build",
  "outputDirectory": "dist",
  "rewrites": [
    { "source": "/(.*)", "destination": "/index.html" }
  ]
}
```

### 2. Deploying via Vercel CLI
```bash
# Install Vercel CLI
npm install -g vercel

# Deploy production build
vercel --prod
```

### 3. Deploying via GitHub Git Integration
1. Push this repository to GitHub.
2. In the Vercel dashboard, click **"Add New Project"** and select the `TradeSizer` repository.
3. Vercel automatically detects the Vite framework and runs `npm run build`.
4. Your application is live at `https://tradesizer.vercel.app` (or your custom domain).

---

## Installation & Local Execution

```bash
# 1. Clone / Navigate to repository
cd TradeSizer

# 2. Install dependencies
npm install

# 3. Launch local development server
npm run dev

# 4. Run automated test suite
npm test

# 5. Production build
npm run build
```

---

## Automated Verification Tests

The calculation engine is verified using Vitest (`npm test`). **All 10 tests pass**:

1. **Model A ($25k Equity):** Risks $187.50, partial closes 66.67% at 3R banking ~$375 (1.99R), remainder adds ~$250, full win ~$625 (3.34R).
2. **Model B ($25k Equity):** Verifies identical multi-stage numbers to Model A.
3. **Breakeven vs Original Stop:** Breakeven case returns ~$375 (2R); original stop case returns ~$312.50 (1.67R).
4. **Volume Step Integrity:** Rounded partial lots never exceed the position; actual banked R is recalculated.
5. **Splitability Guard:** Small positions (e.g. 0.01 lot) trigger a warning rather than a silent failure.
6. **Models C & D Unaffected:** Verifies $125.00 risk and $375.00 target at 3R with no partial exits.
7. **Equity Scaling:** Dynamic balance adjustments update risk and targets accurately.
8. **Stop Distance Sensitivity:** Position sizing varies inversely with stop distance.
9. **Crypto (BTCUSD):** Verifies Bitcoin contract sizing and leverage margin calculation.
10. **Validation Safeguard:** Rejects partial exit configs where banked target $\ge$ trigger level.

---

## Financial & Execution Disclaimer

> [!WARNING]
> Position sizes, profit targets, and stop-loss estimates generated by **TradeSizer** are mathematical approximations based on user inputs and broker contract parameters. TradeSizer does not execute orders or guarantee execution prices, spread widths, slippage, or overnight financing charges. Always verify order sizes in your brokerage terminal before committing real capital.

