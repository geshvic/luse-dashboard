/**
 * fetch-currency.js — refreshes ZMW exchange rates in currency-data.json
 *
 * Uses the free open.er-api.com endpoint (no API key required).
 * Preserves the existing file structure: shifts rate history
 * (mid → dayAgo → weekAgo), recomputes trends and change metrics,
 * and keeps curated fields (mpRate, notes, drivers) untouched.
 */
const fs = require('fs');
const path = require('path');
const https = require('https');

const FILE = path.join(__dirname, '..', 'data', 'currency-data.json');
const PAIRS = ['USD', 'GBP', 'EUR', 'ZAR', 'BWP', 'CNY'];

function fetchJSON(url) {
  return new Promise((resolve, reject) => {
    const req = https.get(url, { timeout: 30000 }, (res) => {
      if (res.statusCode !== 200) { res.resume(); return reject(new Error(`HTTP ${res.statusCode}`)); }
      let body = '';
      res.on('data', (c) => { body += c; });
      res.on('end', () => { try { resolve(JSON.parse(body)); } catch (e) { reject(e); } });
    });
    req.on('timeout', () => { req.destroy(); reject(new Error('timeout')); });
    req.on('error', reject);
  });
}

function trendFor(mid, dayAgo) {
  if (!dayAgo) return 'stable';
  const pct = (mid - dayAgo) / dayAgo * 100;
  if (pct > 0.3) return 'weakening';    // more ZMW per unit = kwacha weaker
  if (pct < -0.3) return 'strengthening';
  return 'stable';
}

async function main() {
  const data = JSON.parse(fs.readFileSync(FILE, 'utf8'));
  const now = new Date();
  const today = now.toISOString().split('T')[0];

  console.log(`💱 Currency refresh — ${today}`);

  const api = await fetchJSON('https://open.er-api.com/v6/latest/ZMW');
  if (!api || !api.rates) throw new Error('Bad response from open.er-api.com');

  const prevUSD = data.rates?.USD?.mid;

  for (const code of PAIRS) {
    const perZMW = api.rates[code];           // foreign units per 1 ZMW
    if (!perZMW) { console.log(`  ⚠️ ${code}: missing from API`); continue; }
    const mid = +(1 / perZMW).toFixed(4);     // ZMW per 1 foreign unit

    const old = data.rates[code] || {};
    data.rates[code] = {
      ...old,
      mid,
      dayAgo: old.mid ?? old.dayAgo,
      weekAgo: old.dayAgo ?? old.weekAgo,
      trend: trendFor(mid, old.mid),
      note: `1 ${code} ≈ ${mid} ZMW — auto-updated ${today} (open.er-api.com). ↓ ZMW per ${code} = kwacha strengthening.`,
    };
    console.log(`  ✅ ${code}: ${mid} (was ${old.mid})`);
  }

  // Recompute change metrics off USD
  const usd = data.rates.USD;
  const abs = (a, b) => (a != null && b != null) ? +(a - b).toFixed(3) : null;
  const dir = [];
  if (prevUSD) {
    const pct = ((usd.mid - prevUSD) / prevUSD * 100).toFixed(2);
    dir.push(`USD/ZMW mid at ${usd.mid} (${pct}% vs previous ${prevUSD}).`);
  }
  dir.push('Rates auto-refreshed from open.er-api.com; BOZ mid-rate and MPR reviewed manually at each MPC meeting.');

  data.trendAnalysis = {
    ...data.trendAnalysis,
    direction: dir.join(' '),
    dayChange: abs(usd.mid, usd.dayAgo),
    twoWeekChange: abs(usd.mid, usd.twoWeeksAgo),
    oneMonthChange: abs(usd.mid, usd.oneMonthAgo),
    sixMonthChange: abs(usd.mid, usd.sixMonthsAgo),
  };

  data.asOf = today;
  data.source = 'open.er-api.com (auto) + BOZ mid-rate (manual)';
  data.ratesLastUpdated = now.toISOString().replace('T', ' ').slice(0, 16) + ' UTC';

  fs.writeFileSync(FILE, JSON.stringify(data, null, 2));
  console.log(`💾 currency-data.json updated (${today})`);
}

main().catch(e => { console.error(`❌ ${e.message}`); process.exit(1); });
