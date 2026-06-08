/**
 * explore-sens.js v7 — check pagination
 */
const { chromium } = require('playwright-core');

(async () => {
  const browser = await chromium.launch({
    headless: true,
    args: ['--no-sandbox','--disable-gpu','--disable-dev-shm-usage','--disable-blink-features=AutomationControlled']
  });
  const ctx = await browser.newContext({
    userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/125.0.0.0 Safari/537.36',
    viewport: { width: 1920, height: 1080 }
  });
  const page = await ctx.newPage();
  await page.addInitScript(() => {
    Object.defineProperty(navigator, 'webdriver', { get: () => false });
    Object.defineProperty(navigator, 'plugins', { get: () => [1,2,3,4,5] });
    window.chrome = { runtime: {} };
  });

  // Check general announcements pagination
  await page.goto('https://www.luse.co.zm/sens-category/general-announcements/', {
    waitUntil: 'networkidle', timeout: 60000
  });
  await page.waitForTimeout(3000);

  // Extract pagination info
  const pagination = await page.evaluate(() => {
    const pagers = document.querySelectorAll('.page-numbers, .pagination a, .pagination span, .nav-links a, .nav-links span');
    const info = Array.from(pagers).map(e => ({
      text: e.innerText.trim(),
      href: e.href || null,
      isCurrent: e.classList.contains('current') || e.classList.contains('active'),
      tag: e.tagName
    }));
    return info;
  });
  console.log('Pagination elements:', JSON.stringify(pagination, null, 2));

  // Try page 2
  console.log('\n=== PAGE 2 ===');
  await page.goto('https://www.luse.co.zm/sens-category/general-announcements/page/2/', {
    waitUntil: 'networkidle', timeout: 60000
  });
  await page.waitForTimeout(3000);
  
  const body2 = await page.evaluate(() => document.body.innerText);
  // Extract announcements
  const lines = body2.split('\n').map(l => l.trim()).filter(Boolean);
  const items = [];
  for (let i = 0; i < lines.length - 2; i++) {
    if (lines[i+1] === 'DOWNLOAD' && lines[i].match(/^[A-Z]{3,5}\s/)) {
      items.push({ title: lines[i], date: lines[i+2] });
    }
  }
  console.log('Page 2 items:', items.length);
  items.forEach(a => console.log(' -', a.title, '|', a.date));

  // Check how many total pages
  const totalPages = await page.evaluate(() => {
    const nums = document.querySelectorAll('.page-numbers');
    const all = Array.from(nums).map(e => parseInt(e.innerText)).filter(n => !isNaN(n));
    return all.length ? Math.max(...all) : 1;
  });
  console.log('\nTotal pages (est):', totalPages);

  await browser.close();
})().catch(e => { console.error(e.message); process.exit(1); });
