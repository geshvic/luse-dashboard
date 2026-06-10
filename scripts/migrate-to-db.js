// migrate-to-db.js — Convert existing JSON files into SQLite database
const fs = require('fs');
const path = require('path');
const db = require('../db');

const DATA_DIR = path.join(__dirname, '..', 'data');

function loadJSON(filename) {
  const filepath = path.join(DATA_DIR, filename);
  if (!fs.existsSync(filepath)) return null;
  return JSON.parse(fs.readFileSync(filepath, 'utf8'));
}

function migrate() {
  console.log('🔁 Migrating JSON → SQLite...\n');

  // 1. Companies — seed from companies.json, then fill gaps from stocks.json
  const stocksRaw = loadJSON('stocks.json');
  const allTickers = stocksRaw ? stocksRaw.map(s => s.ticker) : [];

  const companies = loadJSON('companies.json');
  if (companies) {
    console.log(`  📋 Companies from companies.json: ${companies.length} records`);
    db.upsertCompany(companies);
  }

  // Fill any companies not in companies.json but present in stocks.json
  if (stocksRaw) {
    for (const s of stocksRaw) {
      const exists = db.db.prepare('SELECT ticker FROM companies WHERE ticker = ?').get(s.ticker);
      if (!exists) {
        db.upsertCompany([{
          ticker: s.ticker,
          name: s.name || s.ticker,
          sector: null,
          market: null
        }]);
      }
    }
  }

  // 2. Stocks (today's daily prices) — reuse stocksRaw from above
  const stocks = stocksRaw;
  const marketSummary = loadJSON('market-summary.json');
  const asOf = marketSummary?.asOf || new Date().toISOString().slice(0, 10);
  if (stocks) {
    console.log(`  📊 Daily prices (${asOf}): ${stocks.length} stocks`);
    db.upsertDailyPricesBatch(asOf, stocks);
  }

  // 3. Market close data
  const marketClose = loadJSON('market-close.json');
  if (marketClose?.marketClose) {
    const mc = marketClose.marketClose;
    const advancers = (marketClose.gainers || []).filter(g => g.ticker !== 'N/A').length;
    const decliners = (marketClose.decliners || []).length;
    db.upsertMarketDaily(marketClose.asOf || asOf, {
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
    console.log(`  📈 Market summary (${marketClose.asOf || asOf})`);
  }

  // 4. LASI OHLCV history
  const lasiOv = loadJSON('profiles/LASI_ohlcv.json');
  if (lasiOv?.data) {
    let count = 0;
    for (const row of lasiOv.data) {
      db.upsertLasiIndex(row.date, row);
      count++;
    }
    console.log(`  📈 LASI index: ${count} days`);
  }

  // 5. Individual stock OHLCV profiles
  const profilesDir = path.join(DATA_DIR, 'profiles');
  if (fs.existsSync(profilesDir)) {
    let ohlcvCount = 0;
    let skipped = 0;
    const ohlcvFiles = fs.readdirSync(profilesDir).filter(f => f.endsWith('_ohlcv.json'));

    // First, seed any missing companies from their profile JSONs
    for (const file of fs.readdirSync(profilesDir).filter(f => f.endsWith('.json') && !f.includes('_ohlcv'))) {
      const ticker = file.replace('.json', '');
      const existing = db.db.prepare('SELECT ticker FROM companies WHERE ticker = ?').get(ticker);
      if (!existing) {
        const profile = JSON.parse(fs.readFileSync(path.join(profilesDir, file), 'utf8'));
        if (profile.ticker || ticker) {
          db.upsertCompany([{
            ticker: profile.ticker || ticker,
            name: profile.name || ticker,
            sector: profile.sector || null,
            market: profile.market || null,
            marketCap: profile.marketCap || null
          }]);
        }
      }
    }

    for (const file of ohlcvFiles) {
      const ticker = file.replace('_ohlcv.json', '');
      if (ticker === 'LASI') continue;
      // Ensure company exists
      const existing = db.db.prepare('SELECT ticker FROM companies WHERE ticker = ?').get(ticker);
      if (!existing) {
        skipped++;
        continue;
      }
      const data = JSON.parse(fs.readFileSync(path.join(profilesDir, file), 'utf8'));
      if (data?.data) {
        for (const row of data.data) {
          db.upsertDailyPrice(row.date, ticker, row);
          ohlcvCount++;
        }
      }
    }
    console.log(`  📊 Stock OHLCV: ${ohlcvCount} records across ${ohlcvFiles.length - skipped} tickers${skipped > 0 ? ` (${skipped} skipped — missing company records)` : ''}`);
  }

  // 6. Commodities
  const commodities = loadJSON('commodities.json');
  if (commodities) {
    const date = asOf;
    for (const c of commodities) {
      db.upsertCommodity(date, c);
    }
    console.log(`  🛢️  Commodities (${date}): ${commodities.length}`);
  }

  // 7. Exchange rates
  const currency = loadJSON('currency-data.json');
  if (currency?.rates) {
    const date = currency.asOf || asOf;
    const currencies = ['USD', 'GBP', 'EUR', 'ZAR', 'BWP', 'CNY'];
    for (const ccy of currencies) {
      if (currency.rates[ccy]) {
        const r = currency.rates[ccy];
        db.upsertExchangeRate(date, ccy, {
          mid: r.mid || r.marketMid || null,
          buy: r.buy || null,
          sell: r.sell || null,
          trend: r.trend || null
        });
      }
    }
    console.log(`  💱 Exchange rates (${date}): ${currencies.length} currencies`);
  }

  // 8. Bond yields
  const bonds = loadJSON('bond-market.json');
  if (bonds?.auctions) {
    let count = 0;
    for (const auction of bonds.auctions) {
      const date = auction.date;
      if (auction.yields) {
        for (const [tenor, yield_] of Object.entries(auction.yields)) {
          db.upsertBondYield(date, tenor, {
            yield: yield_,
            bids: auction.bids,
            allocated: auction.allocated,
            oversubscription: auction.oversubscription
          });
          count++;
        }
      }
    }
    console.log(`  📜 Bond yields: ${count} records`);
  }

  // 9. Historical snapshots
  const historyDir = path.join(DATA_DIR, 'history');
  if (fs.existsSync(historyDir)) {
    const dateDirs = fs.readdirSync(historyDir).filter(d => /^\d{4}-\d{2}-\d{2}$/.test(d)).sort();
    for (const date of dateDirs) {
      const snapshotPath = path.join(historyDir, date, 'snapshot.json');
      if (fs.existsSync(snapshotPath)) {
        const snap = JSON.parse(fs.readFileSync(snapshotPath, 'utf8'));
        // If it has stocks array
        if (snap.stocks && Array.isArray(snap.stocks)) {
          db.upsertDailyPricesBatch(date, snap.stocks);
        }
        // Market summary
        if (snap.marketClose) {
          const mc = snap.marketClose;
          db.upsertMarketDaily(date, {
            lasiClose: mc.lasiIndex,
            lasiChangePct: mc.lasiChangePct,
            totalTrades: mc.totalTrades,
            totalVolume: mc.totalVolume,
            totalValue: mc.totalValue,
            marketCap: mc.marketCapTotal,
            marketCapUnit: mc.marketCapUnit,
            advancers: (snap.gainers || []).filter(g => g.ticker !== 'N/A').length,
            decliners: (snap.decliners || []).length,
            unchanged: (snap.stocks?.length || 0) - ((snap.gainers || []).filter(g => g.ticker !== 'N/A').length) - (snap.decliners || []).length
          });
        }
      }
    }
    console.log(`  📅 History snapshots: ${dateDirs.length} days`);
  }

  console.log('\n✅ Migration complete!\n');
  console.log(JSON.stringify(db.stats(), null, 2));
}

// Run
try {
  migrate();
} catch (err) {
  console.error('❌ Migration failed:', err.message);
  process.exit(1);
}
