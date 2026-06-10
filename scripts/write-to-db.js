// write-to-db.js — After the scraper builds fresh JSON, write it to SQLite
// Called from refresh-and-deploy.js after build-static.js succeeds
const path = require('path');
const db = require('../db');

const DATA_DIR = path.join(__dirname, '..', 'data');

function loadJSON(filename) {
  const p = path.join(DATA_DIR, filename);
  if (!require('fs').existsSync(p)) return null;
  return JSON.parse(require('fs').readFileSync(p, 'utf8'));
}

function main() {
  const today = new Date().toISOString().split('T')[0];
  console.log(`[write-to-db] Writing ${today} data to SQLite...`);

  const stocks = loadJSON('stocks.json');
  const summary = loadJSON('market-summary.json');
  const date = summary?.asOf || today;

  // 1. Daily prices
  if (stocks) {
    db.upsertDailyPricesBatch(date, stocks);
    console.log(`[write-to-db] ✓ Daily prices: ${stocks.length} stocks`);
  }

  // 2. Market summary
  const close = loadJSON('market-close.json');
  if (close?.marketClose) {
    const mc = close.marketClose;
    const advancers = (close.gainers || []).filter(g => g.ticker !== 'N/A').length;
    const decliners = (close.decliners || []).length;
    db.upsertMarketDaily(date, {
      lasiClose: mc.lasiIndex,
      lasiChangePct: mc.lasiChangePct,
      totalTrades: mc.totalTrades,
      totalVolume: mc.totalVolume,
      totalValue: mc.totalValue,
      marketCap: mc.marketCapTotal,
      marketCapUnit: mc.marketCapUnit,
      advancers,
      decliners,
      unchanged: (stocks?.length || 0) - advancers - decliners
    });
    console.log(`[write-to-db] ✓ Market summary: LASI ${mc.lasiIndex}`);
  }

  // 3. Commodities
  const commodities = loadJSON('commodities.json');
  if (commodities) {
    for (const c of commodities) {
      db.upsertCommodity(date, c);
    }
    console.log(`[write-to-db] ✓ Commodities: ${commodities.length}`);
  }

  // 4. Exchange rates
  const currency = loadJSON('currency-data.json');
  if (currency?.rates) {
    for (const [ccy, r] of Object.entries(currency.rates)) {
      if (ccy === 'trendAnalysis') continue;
      db.upsertExchangeRate(date, ccy, {
        mid: r.mid || r.marketMid || null,
        buy: r.buy || null,
        sell: r.sell || null,
        trend: r.trend || null
      });
    }
    const currencies = Object.keys(currency.rates).filter(k => k !== 'trendAnalysis');
    console.log(`[write-to-db] ✓ Exchange rates: ${currencies.length} currencies`);
  }

  // 5. Companies (update metadata)
  const companies = loadJSON('companies.json');
  if (companies) {
    db.upsertCompany(companies);
    console.log(`[write-to-db] ✓ Companies: ${companies.length}`);
  }

  const stats = db.stats();
  console.log(`\n[write-to-db] ✅ Database updated. Total: ${stats.daily_prices} price records, ${stats.companies} companies, ${stats.lasi_index} LASI days`);
}

try {
  main();
} catch (err) {
  console.error('[write-to-db] ❌ Failed:', err.message);
  process.exit(1);
}
