const { chromium } = require('playwright-core');

(async () => {
  const browser = await chromium.launch({
    headless: true,
    args: ['--no-sandbox','--disable-gpu','--disable-dev-shm-usage',
      '--disable-blink-features=AutomationControlled',
      '--disable-features=IsolateOrigins,site-per-process',
      '--disable-site-isolation-trials']
  });
  const ctx = await browser.newContext({
    userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/125.0.0.0 Safari/537.36',
    viewport: { width: 1920, height: 1080 },
    locale: 'en-US'
  });
  const page = await ctx.newPage();
  await page.addInitScript(() => {
    Object.defineProperty(navigator, 'webdriver', { get: () => false });
    window.chrome = { runtime: {} };
  });
  await page.goto('https://www.luse.co.zm/trading/market-data/', { waitUntil: 'networkidle', timeout: 60000 });
  await page.waitForTimeout(3000);

  const info = await page.evaluate(() => {
    const table = document.querySelectorAll('table')[1];
    const tr = table.querySelector('tr');
    const thOnly = Array.from(tr.querySelectorAll('th')).map(c => c.innerText.trim());
    const thTd = Array.from(tr.querySelectorAll('th,td')).map(c => c.innerText.trim());
    // data row
    const dataTr = table.querySelectorAll('tr')[1];
    const dataCells = Array.from(dataTr.querySelectorAll('td,th')).map(c => c.innerText.trim());
    return { thOnly, thTd, dataCells };
  });
  console.log(JSON.stringify(info, null, 2));
  await browser.close();
})();
