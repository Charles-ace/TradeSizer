const { chromium } = require('playwright');
const path = require('path');

async function capture() {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage({ viewport: { width: 1440, height: 960 } });

  console.log('Navigating to http://localhost:5173...');
  await page.goto('http://localhost:5173', { waitUntil: 'networkidle' });
  await page.waitForTimeout(2500); // Allow live prices to hydrate

  const outPath = path.join(__dirname, '..', 'verified_forexcom_coinbase.png');
  await page.screenshot({ path: outPath, fullPage: false });
  console.log(`Saved screenshot to ${outPath}`);

  // Also switch to BTCUSD to verify Coinbase feed
  const btcChip = page.getByRole('button', { name: 'BTC / ETH' });
  if (await btcChip.count() > 0) {
    await btcChip.click();
    await page.waitForTimeout(500);
    const btcBtn = page.getByRole('button', { name: 'BTCUSD' }).first();
    if (await btcBtn.count() > 0) {
      await btcBtn.click();
      await page.waitForTimeout(1000);
      const btcOut = path.join(__dirname, '..', 'verified_coinbase_btc.png');
      await page.screenshot({ path: btcOut, fullPage: false });
      console.log(`Saved BTC screenshot to ${btcOut}`);
    }
  }

  await browser.close();
}

capture().catch(console.error);
