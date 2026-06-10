// generate-sector-trends.js — Build static sector-trends.json for GitHub Pages
// Reads SQLite DB, computes sector performance, writes to public/data/
const path = require('path');
const fs = require('fs');
const db = require('../db');

const PUBLIC_DATA = path.join(__dirname, '..', 'public', 'data');
fs.mkdirSync(PUBLIC_DATA, { recursive: true });

function main() {
  const stats = db.stats();
  const range = stats.date_range;
  if (!range.earliest || !range.latest) {
    console.log('No data yet — skipping');
    return;
  }

  const today = new Date().toISOString().split('T')[0];

  // Compute sector aggregations
  const sectorRows = db.sectorPerformance(range.earliest, range.latest);

  // Group by sector
  const sectors = {};
  for (const r of sectorRows) {
    const s = r.sector || 'Unknown';
    if (!sectors[s]) {
      sectors[s] = {
        sector: s,
        dates: [],
        avgPrices: [],
        avgChangePct: [],
        totalVolume: [],
        totalValue: [],
        stockCount: 0
      };
    }
    sectors[s].dates.push(r.date);
    sectors[s].avgPrices.push(Math.round(r.avg_price * 100) / 100);
    sectors[s].avgChangePct.push(Math.round(r.avg_change_pct * 100) / 100);
    sectors[s].totalVolume.push(r.total_volume);
    sectors[s].totalValue.push(Math.round(r.total_value * 100) / 100);
    sectors[s].stockCount = r.stock_count;
  }

  // Compute sector-level returns over different timeframes
  const sectorSummaries = [];
  for (const [name, data] of Object.entries(sectors)) {
    const lastPrice = data.avgPrices[data.avgPrices.length - 1];
    const firstPrice = data.avgPrices[0];
    const allTimeReturn = firstPrice ? ((lastPrice - firstPrice) / firstPrice * 100) : 0;

    // 30-day
    const monthAgoIdx = data.dates.findIndex(d => d >= dateMinusDays(today, 30));
    const monthPrice = monthAgoIdx >= 0 ? data.avgPrices[monthAgoIdx] : data.avgPrices[0];
    const monthReturn = monthPrice ? ((lastPrice - monthPrice) / monthPrice * 100) : 0;

    // 7-day
    const weekAgoIdx = data.dates.findIndex(d => d >= dateMinusDays(today, 7));
    const weekPrice = weekAgoIdx >= 0 ? data.avgPrices[weekAgoIdx] : data.avgPrices[0];
    const weekReturn = weekPrice ? ((lastPrice - weekPrice) / weekPrice * 100) : 0;

    sectorSummaries.push({
      sector: name,
      stockCount: data.stockCount,
      currentAvgPrice: lastPrice,
      allTimeReturn: Math.round(allTimeReturn * 100) / 100,
      return30d: Math.round(monthReturn * 100) / 100,
      return7d: Math.round(weekReturn * 100) / 100,
      tradingDays: data.dates.length
    });
  }

  // LASI overview
  const lasi = db.lasiHistory(range.earliest, range.latest);
  const lasiData = lasi.map(r => ({
    date: r.date,
    close: r.close,
    changePct: r.change_pct
  }));

  // Latest market board
  const latest = db.latestPrices();

    // USD rate for billion club conversion
  const usdRate = 17.71; // from currency-data.json

  // Commodity overview
  const commodities = db.commodityHistory(null, dateMinusDays(today, 7), today);

  const output = {
    generated: today,
    dateRange: range,
    sectors: sectorSummaries.sort((a, b) => b.return30d - a.return30d),
    sectorTimeSeries: sectors,
    lasi: lasiData,
    billionClub: latest.filter(p => p.market_cap && p.market_cap/usdRate >= 1e9).sort((a,b) => b.market_cap - a.market_cap).map(p => ({
      ticker: p.ticker, name: p.name, sector: p.sector, marketCap: p.market_cap
    })),
    aspiring: latest.filter(p => p.market_cap && p.market_cap/usdRate >= 5e8 && p.market_cap/usdRate < 1e9).sort((a,b) => b.market_cap - a.market_cap).map(p => ({
      ticker: p.ticker, name: p.name, sector: p.sector, marketCap: p.market_cap
    })),
    latestPrices: latest.map(p => ({
      ticker: p.ticker,
      name: p.name,
      sector: p.sector,
      price: p.close,
      changePct: p.change_pct,
      volume: p.volume,
      marketCap: p.market_cap
    })),
    commodities: commodities
  };

  const outPath = path.join(PUBLIC_DATA, 'sector-trends.json');
  fs.writeFileSync(outPath, JSON.stringify(output));
  console.log(`[sector-trends] Written to ${outPath}`);
  console.log(`  Sectors: ${sectorSummaries.length}`);
  console.log(`  LASI days: ${lasiData.length}`);
  console.log(`  Latest prices: ${latest.length}`);
}

function dateMinusDays(dateStr, days) {
  const d = new Date(dateStr);
  d.setDate(d.getDate() - days);
  return d.toISOString().split('T')[0];
}

try {
  main();
} catch (err) {
  console.error('[sector-trends] Failed:', err.message);
  process.exit(1);
}
