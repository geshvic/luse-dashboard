/**
 * fetch-commodities.js — scrapes live commodity prices via headless Playwright
 *
 * Sources:
 *   Copper → LME directly (lme.com) — official benchmark for Zambia
 *   Brent / Gold / Cobalt → Trading Economics (tab-delimited table)
 *   Maize → FRA floor price (government-set, stable)
 *
 * Run: node scripts/fetch-commodities.js
 */
const { chromium } = require('playwright-core');
const fs = require('fs');
const path = require('path');

const DATA_DIR = path.join(__dirname, '..', 'data');
const RATE = 17.71; // ZMW/USD

function loadJSON() {
  try { return JSON.parse(fs.readFileSync(path.join(DATA_DIR, 'commodities.json'), 'utf8')); }
  catch { return []; }
}

function saveJSON(data) {
  fs.writeFileSync(path.join(DATA_DIR, 'commodities.json'), JSON.stringify(data, null, 2), 'utf8');
  const pubDir = path.join(__dirname, '..', 'public', 'data');
  fs.mkdirSync(pubDir, { recursive: true });
  fs.writeFileSync(path.join(pubDir, 'commodities.json'), JSON.stringify(data, null, 2), 'utf8');
}

async function scrapePage(browser, url, label) {
  console.log(`  [${label}] Loading...`);
  const ctx = await browser.newContext({
    userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/125.0.0.0 Safari/537.36',
    viewport: { width: 1280, height: 800 }
  });
  const page = await ctx.newPage();
  await page.addInitScript(() => {
    Object.defineProperty(navigator, 'webdriver', { get: () => false });
    window.chrome = { runtime: {} };
  });
  try {
    await page.goto(url, { waitUntil: 'networkidle', timeout: 30000 });
    await page.waitForTimeout(3000);
    const text = await page.evaluate(() => document.body.innerText);
    await ctx.close();
    return text;
  } catch (e) {
    console.log(`  [${label}] Error: ${e.message}`);
    await ctx.close().catch(() => {});
    return null;
  }
}

function getTEPrices(text) {
  const result = {};
  const lines = text.split('\n');
  for (const line of lines) {
    const parts = line.split('\t');
    if (parts.length >= 2) {
      const name = parts[0].trim();
      const firstNum = parts[1];
      if (firstNum && firstNum.match(/^[0-9,]+\.?[0-9]*$/)) {
        result[name] = parseFloat(firstNum.replace(/,/g, ''));
      }
    }
  }
  return result;
}

async function main() {
  console.log(`\n📦 Commodity Price Scraper — ${new Date().toISOString().split('T')[0]}\n`);

  const browser = await chromium.launch({
    headless: true,
    args: ['--no-sandbox', '--disable-gpu', '--disable-dev-shm-usage']
  });

  const existing = loadJSON();
  const updated = [...existing];
  let changes = 0;

  // --- Copper: LME direct (official benchmark for Zambia) ---
  const copperText = await scrapePage(browser, 'https://www.lme.com/en/Metals/Non-ferrous/LME-Copper', 'LME Copper');
  if (copperText) {
    const lines = copperText.split('\n');
    for (let i = 0; i < lines.length; i++) {
      const num = parseFloat(lines[i].replace(/,/g, ''));
      if (num > 10000 && num < 20000) {
        const price = Math.round(num);
        console.log(`  -> LME Copper: $${price}/tonne`);
        const idx = updated.findIndex(c => c.name === 'Copper');
        if (idx >= 0) {
          const old = updated[idx].price;
          updated[idx].price = price;
          updated[idx].change = parseFloat((price - old).toFixed(2));
          updated[idx].changePct = old > 0 ? parseFloat((((price - old) / old) * 100).toFixed(2)) : 0;
          updated[idx].zmwValue = parseFloat((price * RATE).toFixed(0));
          changes++;
          console.log(`    ✓ Copper: $${old} -> $${price}`);
        }
        break;
      }
    }
  } else {
    console.log('  LME Copper: FAILED - page not loaded');
  }

  // --- Brent Crude ---
  const crudeText = await scrapePage(browser, 'https://tradingeconomics.com/commodity/crude-oil', 'Brent Crude');
  if (crudeText) {
    const prices = getTEPrices(crudeText);
    const price = prices['Crude Oil'];
    if (price) {
      const idx = updated.findIndex(c => c.name === 'Brent Crude');
      if (idx >= 0) {
        const old = updated[idx].price;
        const v = parseFloat(price.toFixed(2));
        updated[idx].price = v;
        updated[idx].change = parseFloat((v - old).toFixed(2));
        updated[idx].changePct = old > 0 ? parseFloat((((v - old) / old) * 100).toFixed(2)) : 0;
        updated[idx].zmwValue = parseFloat((v * RATE).toFixed(0));
        changes++;
        console.log(`    ✓ Brent Crude: $${old} -> $${v}`);
      }
    }
  }

  // --- Gold ---
  const goldText = await scrapePage(browser, 'https://tradingeconomics.com/commodity/gold', 'Gold');
  if (goldText) {
    const prices = getTEPrices(goldText);
    const price = prices['Gold'];
    if (price) {
      const idx = updated.findIndex(c => c.name === 'Gold');
      if (idx >= 0) {
        const old = updated[idx].price;
        const v = parseFloat(price.toFixed(2));
        updated[idx].price = v;
        updated[idx].change = parseFloat((v - old).toFixed(2));
        updated[idx].changePct = old > 0 ? parseFloat((((v - old) / old) * 100).toFixed(2)) : 0;
        updated[idx].zmwValue = parseFloat((v * RATE).toFixed(0));
        changes++;
        console.log(`    ✓ Gold: $${old} -> $${v}`);
      }
    }
  }

  // --- Cobalt ---
  const cobaltText = await scrapePage(browser, 'https://tradingeconomics.com/commodity/cobalt', 'Cobalt');
  if (cobaltText) {
    const prices = getTEPrices(cobaltText);
    const price = prices['Cobalt'];
    if (price) {
      const idx = updated.findIndex(c => c.name === 'Cobalt');
      if (idx >= 0) {
        const old = updated[idx].price;
        const v = parseFloat(price.toFixed(2));
        updated[idx].price = v;
        updated[idx].change = parseFloat((v - old).toFixed(2));
        updated[idx].changePct = old > 0 ? parseFloat((((v - old) / old) * 100).toFixed(2)) : 0;
        updated[idx].zmwValue = parseFloat((v * RATE).toFixed(0));
        changes++;
        console.log(`    ✓ Cobalt: $${old} -> $${v}`);
      }
    }
  }

  await browser.close();

  // Maize: FRA floor price (stable)
  console.log('  Maize: ZMW 340 (FRA floor, stable)');

  saveJSON(updated);
  console.log(`\nSaved - ${changes}/4 commodities updated`);

  for (const c of updated) {
    const arrow = c.changePct > 0 ? '+' : c.changePct < 0 ? '-' : ' ';
    console.log(`  ${arrow} ${c.name}: $${c.price} (${c.changePct > 0 ? '+' : ''}${c.changePct}%)`);
  }

  console.log('\nCommodity scrape complete\n');
}

main().catch(e => { console.error('Fatal:', e.message); process.exit(1); });
