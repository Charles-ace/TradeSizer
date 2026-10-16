# TradeSizer — Official ElevenLabs Demo Video Script

This script is formatted specifically for **ElevenLabs Text-to-Speech** (optimized for the **Matilda - Knowledgeable, Professional** or **Rachel** voice model).

---

## Recommended ElevenLabs Voice Settings

| Parameter | Setting | Rationale |
|---|---|---|
| **Voice** | **Matilda** (`XrExE9yKIg1WjnnlVkGX`) or **Rachel** | Clear, authoritative financial technology tone |
| **Model** | `Eleven Multilingual v2` or `Eleven Monolingual v1` | Natural pauses and cadence |
| **Stability** | `50%` | Expressive and dynamic delivery |
| **Clarity / Similarity** | `75%` | High-fidelity voice identity |
| **Style Exaggeration** | `0%` | Maintains professional trading-desk neutrality |
| **Speaker Boost** | `ON` | Enhanced audio clarity |

---

## Voiceover Script with Scene Direction

### Scene 1: Introduction (0:00 - 0:08)
> **Visual:** *TradeSizer Title Card — "Institutional Position Sizing & Multi-Model Risk Engine".*  
> **Narration:**  
> "Welcome to TradeSizer. A deterministic trading position size calculator engineered for multi-model risk strategies."  
> `<break time="1.0s" />`

---

### Scene 2: Confirmation Model A Setup (0:08 - 0:20)
> **Visual:** *User clicks Model A. EURUSD selected with $25,000 equity, 15 pips stop-loss, 1.25 lots calculated.*  
> **Narration:**  
> "Selecting Model A automatically allocates a strict zero point seven five percent risk budget. For a twenty-five thousand dollar account, that is exactly one hundred and eighty-seven dollars and fifty cents. With a fifteen pip stop on EURUSD, TradeSizer calculates an exact one point two five standard lots."  
> `<break time="1.2s" />`

---

### Scene 3: The 3R / 2R-Banked Partial Exit Mechanics (0:20 - 0:38)
> **Visual:** *Exit schedule table showing Row (a) 3R Trigger closing 0.83 lots (+ $373.50) and Row (b) 4R Final Target running 0.42 lots (+ $252.00).*  
> **Narration:**  
> "Models A and B feature a mathematically derived multi-stage exit. When price reaches three R, sixty-six point six seven percent of the position is closed, locking two R of profit in the bank. The remaining thirty-three percent runs to the four R final target. A full win totals three point three three R, or six hundred and twenty-five dollars."  
> `<break time="1.2s" />`

---

### Scene 4: Post-Partial Risk Management & Breakeven Toggle (0:38 - 0:52)
> **Visual:** *Toggling "Move stop to breakeven after partial" from ON (Breakeven 2.0R / +$375.00) to OFF (Original Stop 1.67R / +$312.50).*  
> **Narration:**  
> "Use the Move Stop to Breakeven toggle to project your worst-case outcome after the partial fills. If stopped at breakeven, you keep two R. If left at the original stop, you retain one point six seven R, or three hundred and twelve dollars and fifty cents."  
> `<break time="1.2s" />`

---

### Scene 5: Models C & D Risk Systems (0:52 - 1:04)
> **Visual:** *User switches to Model C. Risk updates to 0.5% ($125 planned loss), Target updates to single 3R ($375) with no partials.*  
> **Narration:**  
> "For strict risk models, Models C and D enforce a zero point five percent risk budget with a single full exit at three R, with no partial closes."  
> `<break time="1.0s" />`

---

### Scene 6: Multi-Asset Engine, Bitcoin & Margin Check (1:04 - 1:20)
> **Visual:** *Crypto tab selected with BTCUSD, 1:100 leverage, showing Margin Check ($225 required) and trading costs breakdown.*  
> **Narration:**  
> "TradeSizer supports Forex, Gold, NASDAQ, Deriv synthetics, and Bitcoin. The built-in margin guard verifies required leverage and free margin before execution, while calculating spread and commission costs."  
> `<break time="1.2s" />`

---

### Scene 7: Order Ticket Generation (1:20 - 1:30)
> **Visual:** *User clicks "Copy Trade Setup". Order ticket copied feedback appears.*  
> **Narration:**  
> "When you are ready, click Copy Trade Setup to export a clean order ticket ready for your trading platform or trade journal. TradeSizer: eliminate sizing errors and protect your edge."

---

## How to Synthesize & Re-render Video

1. **Option A: Automated via Python Script (with API Key):**
   ```bash
   python scripts/elevenlabs_synthesize.py <YOUR_ELEVENLABS_API_KEY>
   ```

2. **Option B: Manual via ElevenLabs Dashboard:**
   - Go to [ElevenLabs.io Speech Synthesis](https://elevenlabs.io/app/speech-synthesis).
   - Select voice **Matilda**.
   - Copy and paste the narration text blocks from above.
   - Download the generated MP3 files into `demo_assets/` and run `python scripts/create_demo_video.py`.
