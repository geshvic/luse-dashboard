// fetch-daily-close.js — Daily LuSE close data collection
// Fetches all ticker prices from StockAnalysis, updates companies.json,
// saves daily snapshot to data/history/YYYY-MM-DD/
//
// Run: node scripts/fetch-daily-close.js
// Designed for cron: 30 11 * * 1-5 (11:30am CT, Mon-Fri)

const https = require('https');
const fs = require('fs');
const path = require('path');

const DATA_DIR = path.join(__dirname, '..', 'data');
const HISTORY_DIR = path.join(DATA_DIR, 'history');
const COMPANIES_PATH = path.join(DATA_DIR, 'companies.json');
const SUMMARY_PATH = path.join(DATA_DIR, 'market-summary.json');
const CLOSE_PATH = path.join(DATA_DIR, 'market-close.json');

// LuSE tickers to fetch via StockAnalysis
const TICKERS = [
  // Main Board
  'ATEL','CECZ','ZNCO','ZSUG','ZABR','BATA','PUMA','SCBL','AECI',
  'ZFCO','NATB','CHIL','BATZ','ZCCM-IH','SHOP','INDO','ZMBF','KLRE',
  // ALT-M
  'DCZM','LUSW','RFIN','PRIM','ENRG'
];

// Map StockAnalysis ticker to our ticker (some differ)
const TICKER_MAP = {
  'ZCCM': 'ZCCM-IH',
};

function fetchHTML(url) {
  return new Promise((resolve, reject) => {
    https.get(url, { headers: { 'User-Agent': 'Mozilla/5.0' } }, (res) => {
      if (res.statusCode !== 200) return reject(new Error(`HTTP ${res.statusCode}`));
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => resolve(data));
    }).on('error', reject);
  });
}

function parseStatistics(html, ticker) {
  const result = { ticker, fetched: false };
  
  // Price
  const priceMatch = html.match(/([\d,.]+)\s*<span[^>]*>ZMW<\/span>/i) ||
                     html.match(/price["\s:]+([\d,.]+)/i);
  if (priceMatch) result.price = parseFloat(priceMatch[1].replace(/,/g, ''));
  
  // Change
  const changeMatch = html.match(/([+-]?[\d,.]+)\s*\(([+-]?[\d,.]+)%\)/);
  if (changeMatch) {
    result.change = parseFloat(changeMatch[1].replace(/,/g, ''));
    result.changePct = parseFloat(changeMatch[2].replace(/,/g, ''));
  }
  
  // Volume (from statistics page)
  const volMatch = html.match(/Average Volume[^<]*<[^>]*>([\d,]+)/);
  if (volMatch) result.avgVolume = parseInt(volMatch[1].replace(/,/g, ''));
  
  // Market Cap
  const mcMatch = html.match(/market cap[^Z]*ZMW\s*([\d,.]+)\s*(billion|million|trillion)/i) ||
                  html.match(/net worth of ZMW\s*([\d,.]+)\s*(billion|million|trillion)/i);
  if (mcMatch) {
    let mc = parseFloat(mcMatch[1].replace(/,/g, ''));
    if (mcMatch[2].toLowerCase().includes('billion')) mc *= 1000;
    if (mcMatch[2].toLowerCase().includes('trillion')) mc *= 1000000;
    result.marketCap = Math.round(mc * 1000000); // Convert to ZMW
  }
  
  // PE Ratio
  const peMatch = html.match(/PE Ratio[^<]*<[^>]*>([\d,.]+)/i) ||
                  html.match(/trailing PE ratio[^<]*is\s*([\d,.]+)/i);
  if (peMatch && !isNaN(parseFloat(peMatch[1]))) result.pe = parseFloat(peMatch[1]);
  
  // Revenue (TTM)
  const revMatch = html.match(/revenue of ZMW\s*([\d,.]+)\s*(billion|million|trillion)/i);
  if (revMatch) {
    let rev = parseFloat(revMatch[1].replace(/,/g, ''));
    if (revMatch[2].toLowerCase().includes('billion')) rev *= 1000;
    if (revMatch[2].toLowerCase().includes('trillion')) rev *= 1000000;
    result.revenueTTM = Math.round(rev * 1000000);
  }
  
  // Net Income
  const niMatch = html.match(/earned\s*([\d,.]+)\s*(billion|million|trillion)?\s*in profits/i) ||
                  html.match(/Net Income[^<]*<[^>]*>([\d,.]+)/i);
  if (niMatch) {
    let ni = parseFloat(niMatch[1].replace(/,/g, ''));
    const unit = niMatch[2] || 'million';
    if (unit.toLowerCase().includes('billion')) ni *= 1000;
    if (unit.toLowerCase().includes('trillion')) ni *= 1000000;
    result.netIncomeTTM = Math.round(ni * 1000000);
  }
  
  // EPS
  const epsMatch = html.match(/Earnings Per Share[^<]*<[^>]*>([\d,.]+)/i) ||
                   html.match(/earnings per share was\s*([\d,.]+)/i);
  if (epsMatch) result.eps = parseFloat(epsMatch[1]);
  
  // Dividend Yield
  const divMatch = html.match(/dividend yield of\s*([\d,.]+)%/i);
  if (divMatch) result.dividendYield = parseFloat(divMatch[1]);
  
  // 52-week change
  const wk52Match = html.match(/52-Week Price Change\s*([+-]?[\d,.]+)%/i);
  if (wk52Match) result.week52Change = parseFloat(wk52Match[1]);
  
  if (result.price) result.fetched = true;
  return result;
}

async function fetchAllTickers() {
  console.log(`[fetch-daily] Starting price fetch for ${TICKERS.length} tickers at ${new Date().toISOString()}\n`);
  
  const results = [];
  const errors = [];
  
  for (const ticker of TICKERS) {
    const saTicker = TICKER_MAP[ticker] || ticker;
    const url = `https://stockanalysis.com/quote/luse/${saTicker}/statistics/`;
    
    try {
      console.log(`  Fetching ${ticker}...`);
      const html = await fetchHTML(url);
      const data = parseStatistics(html, ticker);
      console.log(`    ${data.fetched ? `✅ K${data.price} | PE ${data.pe || 'n/a'} | MCap ${data.marketCap ? (data.marketCap/1000000).toFixed(0)+'M' : 'n/a'}` : '❌ No data'}`);
      results.push(data);
    } catch (e) {
      console.log(`    ❌ ${e.message}`);
      errors.push({ ticker, error: e.message });
      results.push({ ticker, fetched: false, error: e.message });
    }
    
    // Be polite to the server
    await new Promise(r => setTimeout(r, 500));
  }
  
  return { results, errors };
}

function updateCompaniesJson(fetchedData) {
  const companies = JSON.parse(fs.readFileSync(COMPANIES_PATH, 'utf8'));
  let updated = 0;
  
  for (const company of companies) {
    const fresh = fetchedData.find(d => d.ticker === company.ticker);
    if (!fresh || !fresh.fetched) continue;
    
    let changed = false;
    if (fresh.price && fresh.price !== company.price) {
      company.price = fresh.price;
      changed = true;
    }
    if (fresh.change !== undefined) {
      company.change = fresh.change;
      changed = true;
    }
    if (fresh.changePct !== undefined) {
      company.changePct = fresh.changePct;
      changed = true;
    }
    if (fresh.marketCap && fresh.marketCap !== company.marketCap) {
      company.marketCap = fresh.marketCap;
      changed = true;
    }
    if (fresh.pe && fresh.pe !== company.pe) {
      company.pe = fresh.pe;
      changed = true;
    }
    if (fresh.dividendYield !== undefined && fresh.dividendYield !== company.dividendYield) {
      company.dividendYield = fresh.dividendYield;
      changed = true;
    }
    
    if (changed) updated++;
  }
  
  fs.writeFileSync(COMPANIES_PATH, JSON.stringify(companies, null, 2));
  console.log(`\n[fetch-daily] Updated ${updated} companies in companies.json`);
  return companies;
}

function saveDailySnapshot(companies, fetchedData) {
  const today = new Date();
  const yyyy = today.getFullYear();
  const mm = String(today.getMonth() + 1).padStart(2, '0');
  const dd = String(today.getDate()).padStart(2, '0');
  const dateStr = `${yyyy}-${mm}-${dd}`;
  
  const snapshotDir = path.join(HISTORY_DIR, dateStr);
  if (!fs.existsSync(snapshotDir)) fs.mkdirSync(snapshotDir, { recursive: true });
  
  // Calculate market-wide stats
  const activeTickers = fetchedData.filter(d => d.fetched && d.price);
  const totalMarketCap = companies
    .filter(c => c.marketCap)
    .reduce((sum, c) => sum + c.marketCap, 0);
  
  const snapshot = {
    date: dateStr,
    fetchedAt: today.toISOString(),
    source: 'stockanalysis.com',
    tickersFetched: activeTickers.length,
    tickersTotal: TICKERS.length,
    fetchErrors: fetchedData.filter(d => !d.fetched).length,
    marketSummary: {
      totalMarketCap: Math.round(totalMarketCap / 1000000),
      marketCapUnit: 'ZMW millions',
      tickersWithPrice: activeTickers.length
    },
    tickers: companies.map(c => {
      const fresh = fetchedData.find(d => d.ticker === c.ticker);
      return {
        ticker: c.ticker,
        name: c.name,
        sector: c.sector,
        market: c.market,
        price: fresh?.price || c.price,
        change: fresh?.change || c.change || 0,
        changePct: fresh?.changePct || c.changePct || 0,
        volume: c.volume || 0,
        marketCap: c.marketCap,
        pe: fresh?.pe || c.pe,
        dividendYield: fresh?.dividendYield !== undefined ? fresh.dividendYield : c.dividendYield,
        fetched: fresh?.fetched || false
      };
    })
  };
  
  // Save snapshot
  const snapshotPath = path.join(snapshotDir, 'snapshot.json');
  fs.writeFileSync(snapshotPath, JSON.stringify(snapshot, null, 2));
  
  // Also update market-close.json
  const gainers = companies
    .filter(c => c.changePct > 0)
    .sort((a, b) => b.changePct - a.changePct)
    .slice(0, 5)
    .map(c => ({ ticker: c.ticker, name: c.name, price: c.price, change: c.change, changePct: c.changePct, volume: c.volume }));
  
  const decliners = companies
    .filter(c => c.changePct < 0)
    .sort((a, b) => a.changePct - b.changePct)
    .slice(0, 5)
    .map(c => ({ ticker: c.ticker, name: c.name, price: c.price, change: c.change, changePct: c.changePct, volume: c.volume }));
  
  const mostActive = companies
    .filter(c => c.volume > 0)
    .sort((a, b) => b.volume - a.volume)
    .slice(0, 5)
    .map(c => ({ ticker: c.ticker, name: c.name, price: c.price, volume: c.volume, value: Math.round(c.volume * c.price) }));
  
  // Update market-summary with new data
  const summary = JSON.parse(fs.readFileSync(SUMMARY_PATH, 'utf8'));
  summary.asOf = dateStr;
  summary.topGainers = gainers;
  summary.topDecliners = decliners;
  summary.mostActive = mostActive.map(a => ({ ticker: a.ticker, value: a.value, volume: a.volume, price: a.price }));
  summary.lastFetchAttempt = today.toISOString();
  fs.writeFileSync(SUMMARY_PATH, JSON.stringify(summary, null, 2));
  
  // Update market-close
  const close = JSON.parse(fs.readFileSync(CLOSE_PATH, 'utf8'));
  close.asOf = today.toISOString();
  close.gainers = gainers;
  close.decliners = decliners;
  close.mostActiveByValue = mostActive;
  fs.writeFileSync(CLOSE_PATH, JSON.stringify(close, null, 2));
  
  console.log(`[fetch-daily] Saved snapshot to ${snapshotDir}`);
  console.log(`[fetch-daily] Gainers: ${gainers.map(g => g.ticker).join(', ') || 'none'}`);
  console.log(`[fetch-daily] Decliners: ${decliners.map(d => d.ticker).join(', ') || 'none'}`);
  
  return { dateStr, snapshot, gainers, decliners, mostActive };
}

async function main() {
  console.log('═'.repeat(60));
  console.log('  LuSE Daily Close Data Fetcher');
  console.log('═'.repeat(60));
  
  // 1. Fetch all ticker data
  const { results, errors } = await fetchAllTickers();
  
  // 2. Update companies.json
  const companies = updateCompaniesJson(results);
  
  // 3. Save daily snapshot
  const snapshot = saveDailySnapshot(companies, results);
  
  // 4. Summary
  console.log('\n' + '═'.repeat(60));
  console.log(`  Done — ${results.filter(r=>r.fetched).length}/${TICKERS.length} tickers fetched`);
  if (errors.length) {
    console.log(`  Errors: ${errors.length}`);
    errors.forEach(e => console.log(`    ⚠ ${e.ticker}: ${e.error}`));
  }
  console.log('═'.repeat(60));
  
  return { success: errors.length < TICKERS.length, tickersFetched: results.filter(r=>r.fetched).length, errors };
}

// Run
main().then(r => {
  if (!r.success) process.exit(1);
}).catch(e => {
  console.error('Fatal:', e.message);
  process.exit(1);
});
