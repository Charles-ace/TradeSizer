const puppeteer = require('puppeteer');

(async () => {
  const browser = await puppeteer.launch({ headless: 'new', args: ['--no-sandbox'] });
  const page = await browser.newPage();
  await page.setViewport({ width: 1440, height: 900 });
  
  console.log('Navigating to http://localhost:5173...');
  await page.goto('http://localhost:5173', { waitUntil: 'domcontentloaded' });
  await new Promise(r => setTimeout(r, 2500));

  // Find Deriv Volatilities filter button and click it
  const buttons = await page.$$('button');
  for (const b of buttons) {
    const text = await page.evaluate(el => el.innerText, b);
    if (text.includes('Deriv Volatilities')) {
      await b.click();
      console.log('Clicked Deriv Volatilities chip!');
      break;
    }
  }

  await new Promise(r => setTimeout(r, 2000));
  await page.screenshot({ path: 'verified_deriv_volatilities.png' });
  console.log('Saved verified_deriv_volatilities.png');

  // Test selecting Step Index
  const select = await page.$('select');
  if (select) {
    await page.select('select', 'STEP_INDEX');
    console.log('Selected STEP_INDEX');
    await new Promise(r => setTimeout(r, 2000));
    await page.screenshot({ path: 'verified_deriv_step_index.png' });
    console.log('Saved verified_deriv_step_index.png');
  }

  await browser.close();
  console.log('Done!');
})();
