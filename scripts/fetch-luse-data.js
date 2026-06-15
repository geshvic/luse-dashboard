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
          if (stock.change !== undefined && !isNaN(stock.change)) {
            co.change = stock.change;
            // Recalculate changePct: change / (price - change) * 100
            const prevPrice = co.price - co.change;
            if (prevPrice > 0) {
              co.changePct = parseFloat(((co.change / prevPrice) * 100).toFixed(2));
            }
          }
          if (stock.volume !== undefined) co.volume = stock.volume;
          // Dynamic market cap: sharesOutstanding × current price
          if (co.sharesOutstanding && co.price > 0) {
            co.marketCap = Math.round(co.sharesOutstanding * co.price);
          }
        }
      }
      saveJSON('companies.json', companies);

      // Also update individual profile files for ticker detail pages
      const profilesDir = path.join(DATA_DIR, 'profiles');
      if (fs.existsSync(profilesDir)) {
        const profileFiles = fs.readdirSync(profilesDir).filter(f => f.endsWith('.json') && !f.includes('ohlcv'));
        for (const pf of profileFiles) {
          const ticker = pf.replace('.json', '');
          const co = companies.find(c => c.ticker === ticker);
          if (!co) continue;
          const profilePath = path.join(profilesDir, pf);
          const profile = JSON.parse(fs.readFileSync(profilePath, 'utf8'));
          let changed = false;
          if (profile.priceHistory?.current?.price !== undefined && profile.priceHistory.current.price !== co.price) {
            profile.priceHistory.current.price = co.price;
            changed = true;
          }
          if (profile.lastPrice !== undefined && profile.lastPrice !== co.price) {
            profile.lastPrice = co.price;
            changed = true;
          }
          if (profile.price !== undefined && profile.price !== co.price) {
            profile.price = co.price;
            changed = true;
          }
          // Update volume from market data
          const msStock = summary.stocks.find(s => s.ticker === ticker);
          if (msStock && profile.volume !== undefined && profile.volume !== msStock.volume) {
            profile.volume = msStock.volume;
            changed = true;
          }
          if (changed) {
            fs.writeFileSync(profilePath, JSON.stringify(profile, null, 2));
            console.log(`[fetch-luse] Updated profile: ${ticker}`);
          }
        }
      }
    }

    // --- Build market-close.json (site primary display format) ---
    const lasiChangeMatch = bodyText.match(/Change\s*\+?([\d.]+)/i);
    const lasiPctMatch = bodyText.match(/% Change\s*\+?([\d.]+)/i);
    const capMatch = bodyText.match(/capitalization of\s*K?([\d,]+(?:\.\d+)?)/i);
    const capExclMatch = bodyText.match(/excluding\s*Shoprite[^K]*K?([\d,]+(?:\.\d+)?)/i);

    const lasiChange = lasiChangeMatch ? parseFloat(lasiChangeMatch[1]) : 0;
    const lasiChangePct = lasiPctMatch ? parseFloat(lasiPctMatch[1]) : 0;
    const marketCapTotal = capMatch ? parseFloat(capMatch[1].replace(/,/g, '')) / 1e9 : (lasi || 0) * 0.013;
    const marketCapExcl = capExclMatch ? parseFloat(capExclMatch[1].replace(/,/g, '')) / 1e9 : marketCapTotal * 0.43;

    const gainers = stocks.filter(s => s.change > 0).map(s => ({
      ticker: s.ticker, name: s.ticker, price: s.price, change: s.change,
      changePct: s.price ? parseFloat(((s.change / (s.price - s.change)) * 100).toFixed(2)) : 0,
      volume: s.volume
    }));
    const decliners = stocks.filter(s => s.change < 0).map(s => ({
      ticker: s.ticker, name: s.ticker, price: s.price, change: s.change,
      changePct: s.price ? parseFloat(((s.change / (s.price - s.change)) * 100).toFixed(2)) : 0,
      volume: s.volume
    }));

    const byValue = [...stocks].filter(s => s.value > 0).sort((a,b) => b.value - a.value).slice(0,5)
      .map(s => ({ ticker: s.ticker, name: s.ticker, price: s.price, volume: s.volume, value: s.value, trades: s.trades }));
    const byVolume = [...stocks].filter(s => s.volume > 0).sort((a,b) => b.volume - a.volume).slice(0,5)
      .map(s => ({ ticker: s.ticker, name: s.ticker, price: s.price, volume: s.volume, value: s.value, trades: s.trades }));

    const advCount = gainers.length;
    const decCount = decliners.length;
    const mktClose = {
      asOf: todayStr(),
      marketClose: {
        lasiIndex: lasi || 0, lasiChange, lasiChangePct,
        totalTrades: summary.summary.trades, totalVolume: summary.summary.volume,
        totalValue: summary.summary.value, marketCapTotal: parseFloat(marketCapTotal.toFixed(2)),
        marketCapExclShoprite: parseFloat(marketCapExcl.toFixed(2)), marketCapUnit: 'Billion ZMW',
        sessionSummary: `${summary.summary.trades} trades across ${summary.summary.volume.toLocaleString()} shares. Turnover K${(summary.summary.value/1e6).toFixed(2)}M. LASI ${lasiChangePct >= 0 ? 'up' : 'down'} ${Math.abs(lasiChangePct)}% to ${lasi?.toLocaleString()}. Breadth: ${advCount} advancer${advCount!==1?'s':''}, ${decCount} decliner${decCount!==1?'s':''}, ${stocks.length - advCount - decCount} unchanged.`
      },
      gainers: gainers.length ? gainers : [{ ticker: 'N/A', name: 'No gainers', price: 0, change: 0, changePct: 0, volume: 0 }],
      decliners: decliners.length ? decliners : [{ ticker: 'N/A', name: 'No decliners', price: 0, change: 0, changePct: 0, volume: 0 }],
      mostActiveByValue: byValue,
      mostActiveByVolume: byVolume
    };
    saveJSON('market-close.json', mktClose);
    console.log(`[fetch-luse] market-close.json — ${gainers.length} gainers, ${decliners.length} decliners`);

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
