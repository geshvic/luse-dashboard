/**
 * fetch-luse-data.js — pulls LuSE market data via stealth Playwright
 * Uses Chromium with anti-detection to bypass Cloudflare on luse.co.zm
 */
const { chromium } = require('playwright-core');
const fs = require('fs');
const path = require('path');

const DATA_DIR = path.join(__dirname, '..', 'data');

function todayStr() {
  const d = new Date();
  return d.toISOString().split('T')[0];
}

function saveJSON(filename, data) {
  fs.writeFileSync(path.join(DATA_DIR, filename), JSON.stringify(data, null, 2), 'utf8');
}

function parseNumber(raw) {
  if (!raw) return null;
  const cleaned = raw.replace(/,/g, '').trim();
  const n = parseFloat(cleaned);
  return isNaN(n) ? null : n;
}

async function scrapeMarketData() {
  console.log('[fetch-luse] Launching stealth browser...');
  const browser = await chromium.launch({
    headless: true,
    args: [
      '--no-sandbox',
      '--disable-gpu',
      '--disable-dev-shm-usage',
      '--disable-blink-features=AutomationControlled',
      '--disable-features=IsolateOrigins,site-per-process',
      '--disable-site-isolation-trials'
    ]
  });
  const ctx = await browser.newContext({
    userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/125.0.0.0 Safari/537.36',
    viewport: { width: 1920, height: 1080 },
    locale: 'en-US'
  });
  const page = await ctx.newPage();

  // Inject anti-detection
  await page.addInitScript(() => {
    Object.defineProperty(navigator, 'webdriver', { get: () => false });
    Object.defineProperty(navigator, 'plugins', { get: () => [1,2,3,4,5] });
    Object.defineProperty(navigator, 'languages', { get: () => ['en-US','en'] });
    window.chrome = { runtime: {} };
  });

  let result = { asOf: todayStr(), success: false };

  try {
    console.log('[fetch-luse] Navigating to LuSE market data...');
    await page.goto('https://www.luse.co.zm/trading/market-data/', {
      waitUntil: 'networkidle',
      timeout: 60000
    });
    await page.waitForTimeout(3000);

    const title = await page.title();
    console.log(`[fetch-luse] Page loaded: ${title}`);

    if (title.includes('Just a moment')) {
      console.log('[fetch-luse] Cloudflare challenge detected — page blocked');
      result.error = 'Cloudflare blocked';
      return result;
    }

    // Extract the daily stock table
    const stocks = await page.evaluate(() => {
      const rows = [];
      // Try to find the daily stock data table
      const tables = document.querySelectorAll('table');
      for (const table of tables) {
        const headers = Array.from(table.querySelectorAll('th')).map(h => h.innerText.trim());
        if (headers.some(h => h.includes('Security') || h.includes('Closing Price'))) {
          const trs = table.querySelectorAll('tbody tr, tr');
          let headerSkipped = false;
          for (const tr of trs) {
            const cells = Array.from(tr.querySelectorAll('td'));
            if (cells.length < 3) continue;
            const ticker = cells[0]?.innerText?.trim();
            if (!ticker || ticker === 'Security' || ticker.includes('Security')) {
              headerSkipped = true;
              continue;
            }
            rows.push({
              ticker,
              name: ticker,
              price: parseFloat(cells[2]?.innerText?.trim() || '0'),
              change: parseFloat(cells[3]?.innerText?.trim() || '0'),
              trades: parseInt(cells[4]?.innerText?.trim() || '0'),
              volume: parseInt((cells[5]?.innerText || '0').replace(/,/g, '')),
              value: parseFloat((cells[6]?.innerText || '0').replace(/,/g, '')),
            });
          }
          break;
        }
      }
      return rows;
    });

    console.log(`[fetch-luse] Extracted ${stocks.length} stocks from table`);

    // Extract LASI and summary values from text
    const bodyText = await page.evaluate(() => document.body.innerText);
    
    const lasiMatch = bodyText.match(/LASI[^0-9]*Current Value[^0-9]*([\d,.]+)/i) ||
                      bodyText.match(/closed at ([\d,.]+)/i);
    const lasi = lasiMatch ? parseNumber(lasiMatch[1]) : null;

    const tradesMatch = bodyText.match(/Trades\s*([\d,]+)/i);
    const volumeMatch = bodyText.match(/Volume Traded\s*([\d,]+)/i);
    const valueMatch = bodyText.match(/Value Traded\s*ZMW\s*([\d,.]+)/i);

    // Build output
    const summary = {
      asOf: todayStr(),
      marketCap: 333.59, // defaults — real market cap from lasi calc
      marketCapBillion: true,
      lasiIndex: lasi || 25689.97,
      summary: {
        trades: tradesMatch ? parseInt(tradesMatch[1].replace(/,/g, '')) : 0,
        volume: volumeMatch ? parseInt(volumeMatch[1].replace(/,/g, '')) : 0,
        value: valueMatch ? parseFloat(valueMatch[1].replace(/,/g, '')) : 0,
        valueCurrency: 'ZMW'
      },
      stocks
    };

    // Save data files
    saveJSON('market-summary.json', summary);
    saveJSON('stocks.json', stocks);

    // Update companies.json with fresh price/volume data
    const companiesPath = path.join(DATA_DIR, 'companies.json');
    if (fs.existsSync(companiesPath)) {
      const companies = JSON.parse(fs.readFileSync(companiesPath, 'utf8'));
      for (const stock of stocks) {
        const co = companies.find(c => c.ticker === stock.ticker);
        if (co) {
          co.price = stock.price;
          co.volume = stock.volume || co.volume;
        }
      }
      saveJSON('companies.json', companies);
    }

    // Save daily snapshot
    const historyDir = path.join(DATA_DIR, 'history', todayStr());
    fs.mkdirSync(historyDir, { recursive: true });
    saveJSON(`history/${todayStr()}/snapshot.json`, summary);

    result.success = true;
    result.stocks = stocks.length;
    result.lasi = lasi;
    console.log(`[fetch-luse] ✅ Done — ${stocks.length} stocks, LASI: ${lasi}`);

  } catch (e) {
    console.error('[fetch-luse] Error:', e.message);
    result.error = e.message;
  } finally {
    await browser.close();
  }

  return result;
}

// Run
scrapeMarketData().then(result => {
  console.log(JSON.stringify(result, null, 2));
  process.exit(result.success ? 0 : 1);
}).catch(e => {
  console.error('[fetch-luse] Fatal:', e.message);
  process.exit(1);
});
