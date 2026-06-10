const { chromium } = require('playwright-core');

async function check() {
  // Check raw GitHub
  const r = await (await fetch('https://raw.githubusercontent.com/geshvic/luse-dashboard/master/index.html')).text();
  const ss = r.indexOf('<script>') + 8;
  const se = r.indexOf('</script>', ss);
  const script = r.slice(ss, se);
  
  try {
    new Function(script);
    console.log('Raw GitHub script: ✅ OK');

    // Test in browser
    const browser = await chromium.launch({ headless: true, args: ['--no-sandbox'] });
    const page = await browser.newPage();
    const errors = [];
    page.on('pageerror', err => errors.push(err.message));
    
    await page.setContent(r, { waitUntil: 'load' });
    await page.waitForTimeout(1000);
    
    console.log('Browser test:', errors.length === 0 ? '✅ CLEAN' : '❌ ' + errors.join('; '));
    
    await browser.close();
  } catch(e) {
    console.log('Raw GitHub script: ❌', e.message.slice(0, 80));
  }
}
check().catch(e => console.error(e.message));
