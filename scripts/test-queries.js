// Quick test of sector queries
const db = require('../db');

console.log('=== SECTOR PERFORMANCE (last 30 days) ===');
const perf = db.sectorPerformance('2026-05-10', '2026-06-10');
const sectors = {};
perf.forEach(r => {
  const s = r.sector || 'Unknown';
  if (!sectors[s]) sectors[s] = [];
  sectors[s].push(r);
});

for (const [sector, rows] of Object.entries(sectors)) {
  const uniqueDays = new Set(rows.map(r => r.date)).size;
  const avgStocks = Math.round(rows.reduce((a, r) => a + r.stock_count, 0) / rows.length);
  const avgChg = (rows.reduce((a, r) => a + (r.avg_change_pct || 0), 0) / rows.length).toFixed(2);
  console.log(`  ${sector}: ${uniqueDays} days, avg ${avgStocks} stocks, avg change ${avgChg}%`);
}

console.log('\n=== LASI 30-day trend ===');
const lasi = db.lasiHistory('2026-05-10', '2026-06-10');
if (lasi.length > 0) {
  const first = lasi[0];
  const last = lasi[lasi.length - 1];
  const chg = ((last.close - first.close) / first.close * 100).toFixed(2);
  console.log(`  ${first.date}: ${first.close} → ${last.date}: ${last.close} (${chg}%)`);
}

console.log('\n=== COMMODITIES ===');
const comm = db.commodityHistory(null, '2026-06-10', '2026-06-10');
comm.forEach(c => console.log(`  ${c.name}: ${c.price} ${c.unit}${c.change_pct ? ' (' + (c.change_pct > 0 ? '+' : '') + c.change_pct + '%)' : ''}`));
