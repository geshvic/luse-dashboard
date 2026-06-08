/**
 * generate-calendar.js v2 — richer earnings/dividend/AGM calendar
 */
const fs = require('fs');
const path = require('path');

const DATA_DIR = path.join(__dirname, '..', 'data');
const sens = JSON.parse(fs.readFileSync(path.join(DATA_DIR, 'sens.json'), 'utf8'));
const companies = JSON.parse(fs.readFileSync(path.join(DATA_DIR, 'companies.json'), 'utf8'));

function formatDate(dateStr) {
  const d = new Date(dateStr + 'T12:00:00');
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

function addDays(dateStr, days) {
  const d = new Date(dateStr + 'T12:00:00');
  d.setDate(d.getDate() + days);
  return d.toISOString().split('T')[0];
}

const today = new Date().toISOString().split('T')[0];
const events = [];

// ===== CONFIRMED EVENTS =====
const confirmed = [
  // From SENS announcements + profile data
  { ticker: 'DCZM', date: '2026-06-15', type: 'Earnings', desc: 'Full Year Results' },
  { ticker: 'CECZ', date: '2026-06-23', type: 'AGM', desc: 'Extraordinary General Meeting' },
  { ticker: 'NATB', date: '2026-06-26', type: 'AGM', desc: '58th Annual General Meeting' },
  { ticker: 'ATEL', date: '2026-08-20', type: 'Earnings', desc: 'Half-Year Results' },
  { ticker: 'ZNCO', date: '2026-09-18', type: 'Earnings', desc: 'Half-Year Results' },
  // Dividend payment windows (30-45 days after notice)
  { ticker: 'BATA', date: '2027-05-01', type: 'Dividend', desc: 'Final Dividend Pay Date' },
  { ticker: 'ATEL', date: '2027-05-06', type: 'Dividend', desc: 'Final Dividend Pay Date' },
];

for (const c of confirmed) {
  if (c.date > today) {
    events.push({ ...c, displayDate: formatDate(c.date), confidence: 'confirmed' });
  }
}

// ===== ESTIMATED EVENTS from SENS history =====
const history = {};
for (const s of sens) {
  for (const t of s.tickers) {
    if (!history[t]) history[t] = {};
    if (!history[t][s.type]) history[t][s.type] = [];
    history[t][s.type].push(s.date);
  }
}

for (const t of Object.keys(history)) {
  for (const type of Object.keys(history[t])) {
    history[t][type].sort();
  }
}

// Zambian earnings calendar pattern:
// Annual reports: Feb-Apr (within 3 months of FY end Dec 31)
// Half-year/interim: Aug-Sep
// AGMs: Mar-Jun (within 6 months of FY end)
// Dividends: announced with results, paid 30-60 days later

const tickerNames = {};
companies.forEach(c => { tickerNames[c.ticker] = c.name || c.ticker; });

// For each active ticker (has price > 0), estimate next events
for (const co of companies) {
  const t = co.ticker;
  if (!co.price || co.price <= 0) continue;
  
  const hist = history[t] || {};
  
  // Estimate next annual results (Mar-Apr 2027)
  const lastAnnual = hist['Earnings']?.filter(d => d.slice(5,7) < '07')?.pop() ||
                     hist['Annual Report']?.slice(-1)?.[0];
  if (!lastAnnual || lastAnnual < '2026-06-01') {
    const nextAnnual = '2027-03-15';
    if (nextAnnual > today) {
      events.push({ ticker: t, date: nextAnnual, displayDate: formatDate(nextAnnual),
        type: 'Earnings', desc: 'Annual Results (est)', confidence: 'estimated' });
    }
  }
  
  // Estimate next AGM (Apr-Jun 2027, ~3-4 months after annual results)
  const lastAGM = hist['AGM']?.pop();
  if (!lastAGM || lastAGM < '2026-06-15') {
    const nextAGM = '2027-04-15';
    if (nextAGM > today) {
      events.push({ ticker: t, date: nextAGM, displayDate: formatDate(nextAGM),
        type: 'AGM', desc: 'AGM (est)', confidence: 'estimated' });
    }
  }
  
  // Estimate half-year/interim (Aug-Sep 2026)
  const lastHY = hist['Earnings']?.filter(d => d.slice(5,7) >= '07' && d.slice(5,7) <= '10')?.pop();
  if (!lastHY || lastHY < '2025-12-01') {
    const nextHY = '2026-09-15';
    if (nextHY > today && nextHY < addDays(today, 120)) {
      events.push({ ticker: t, date: nextHY, displayDate: formatDate(nextHY),
        type: 'Earnings', desc: 'Half-Year Results (est)', confidence: 'estimated' });
    }
  }
  
  // Estimate next dividend if company pays
  const lastDiv = hist['Dividends']?.pop();
  if (lastDiv && co.dividendYield > 0) {
    // Next dividend ~12 months from last
    const d = new Date(lastDiv + 'T12:00:00');
    d.setFullYear(d.getFullYear() + 1);
    const nextDiv = d.toISOString().split('T')[0];
    if (nextDiv > today && nextDiv < addDays(today, 365)) {
      events.push({ ticker: t, date: nextDiv, displayDate: formatDate(nextDiv),
        type: 'Dividend', desc: 'Dividend Notice (est)', confidence: 'estimated' });
    }
  }
}

// Sort, deduplicate, limit
events.sort((a, b) => a.date.localeCompare(b.date));

const seen = new Set();
const unique = [];
for (const e of events) {
  const key = e.ticker + '|' + e.type + '|' + e.date.slice(0, 7);
  if (seen.has(key)) continue;
  seen.add(key);
  // Prioritize confirmed over estimated for same ticker/type/month
  const existing = unique.findIndex(u => u.ticker === e.ticker && u.type === e.type && u.date.slice(0,7) === e.date.slice(0,7));
  if (existing >= 0) {
    if (e.confidence === 'confirmed') unique[existing] = e;
  } else {
    unique.push(e);
  }
}

// Limit to next 20, future only
const final = unique.filter(e => e.date > today).slice(0, 20);

fs.writeFileSync(path.join(DATA_DIR, 'calendar.json'), JSON.stringify(final, null, 2));

console.log(`📅 Calendar generated: ${final.length} events`);
console.log(`   Confirmed: ${final.filter(e=>e.confidence==='confirmed').length}`);
console.log(`   Estimated: ${final.filter(e=>e.confidence==='estimated').length}`);
console.log(`   Range: ${final[0]?.displayDate} to ${final[final.length-1]?.displayDate}`);
console.log('\nUpcoming:');
final.slice(0, 12).forEach(e => {
  const badge = e.confidence === 'confirmed' ? '✓' : '~';
  console.log(`  ${badge} ${e.displayDate.padEnd(8)} ${e.ticker.padEnd(8)} ${e.type.padEnd(10)} ${e.desc}`);
});
