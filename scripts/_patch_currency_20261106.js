/**
 * _patch_currency_20261106.js
 * Fixes auto-generated direction wording in notes, refreshes BoZ official mid,
 * and rewrites trendAnalysis for the 6 Nov 2026 snapshot.
 */
const fs = require('fs');
const path = require('path');

const FILE = path.join(__dirname, '..', 'data', 'currency-data.json');
const d = JSON.parse(fs.readFileSync(FILE, 'utf8'));

const prev = { USD: 20.263, GBP: 27.1843, EUR: 22.6809, ZAR: 1.2232, BWP: 1.4174, CNY: 3.0404 };

const names = { USD: 'dollar', GBP: 'sterling', EUR: 'euro', ZAR: 'rand', BWP: 'pula', CNY: 'yuan' };

const comparisons = {};
for (const [code, oldMid] of Object.entries(prev)) {
  const r = d.rates[code];
  const abs = +(r.mid - oldMid).toFixed(4);
  const pct = +((r.mid - oldMid) / oldMid * 100).toFixed(2);
  const dirWord = pct > 0.1 ? 'kwacha softer' : pct < -0.1 ? 'kwacha firmer' : 'flat';
  r.note = `1 ${code} = ${r.mid} ZMW (market mid) — auto-updated 2026-11-06 (open.er-api.com). ${pct > 0 ? '+' : ''}${pct}% vs the 4 Nov snapshot (${oldMid}), i.e. ${dirWord} against the ${names[code]}.`;
  comparisons[code] = { abs, pct };
}

d.rates.USD.marketMid = d.rates.USD.mid;
d.rates.USD.bozMid = 20.2925;
d.rates.USD.note = `1 USD = ${d.rates.USD.mid} ZMW (market mid) — auto-updated 2026-11-06 (open.er-api.com). BoZ official mid 20.2925 on 4 Nov 2026 (buy 20.2675 / sell 20.3175). Market mid sits ~0.11% above the official fix. Kwacha 0.26% softer than the 4 Nov snapshot (20.2630).`;

d.trendAnalysis.direction = 'USD/ZMW market mid 20.3157 — 0.26% softer than the 4 Nov snapshot (20.2630) and the weakest print in the current run. BoZ official mid 20.2925 on 4 Nov (buy 20.2675 / sell 20.3175), so the market trades ~0.11% above the official fix. The kwacha has slipped out of the 20.10–20.30 band that held through late October and is now testing the top of the recent range.';
d.trendAnalysis.dayChange = comparisons.USD.abs;
d.trendAnalysis.twoWeekChange = +(d.rates.USD.mid - d.rates.USD.twoWeeksAgo).toFixed(3);
d.trendAnalysis.oneMonthChange = +(d.rates.USD.mid - d.rates.USD.oneMonthAgo).toFixed(3);
d.trendAnalysis.sixMonthChange = +(d.rates.USD.mid - d.rates.USD.sixMonthsAgo).toFixed(3);
d.trendAnalysis.snapshotComparisons = comparisons;

d.trendAnalysis.drivers = [
  'Record copper output ~890K tonnes (2025) — strong export earnings',
  'Higher global copper prices lifting export receipts and fiscal space (Nov 2026)',
  'Record maize harvest >4M tonnes — reduced food import needs',
  'Debt restructuring ~94% complete — sovereign risk premium compressing',
  'IMF successor programme: US$1.47bn staff-level agreement; IMF sees 5.6% growth in 2026',
  'BoZ cut the MPR 250bps to 10.75% on 30 September 2026 as inflation eased back into the target band',
  '10% copper-concentrate export duty took effect 30 September 2026',
  'Lobito rail corridor progressing (AFC, ~US$1.3bn pledged) — long-run logistics cost relief',
  'Gross international reserves near record highs (~US$5.5bn)',
  'Offsets: month-start corporate USD demand, higher fuel import costs, softer policy stance'
];

d.trendAnalysis.outlook = 'The kwacha has turned mildly softer after two weeks of flat-lining. USD/ZMW moved from 20.2630 (4 Nov) to 20.3157 (6 Nov, open.er-api.com), a 0.26% depreciation, and the whole cross-currency basket cost more kwacha over the same two days: sterling +0.65% (27.3598), euro +0.60% (22.8175), rand +1.37% (1.2400) and pula +1.05% (1.4323), while the yuan was flat at 3.0386. That broad-based pattern points to genuine kwacha selling rather than one cross moving. Support still comes from record copper output and elevated copper prices, reserves near US$5.5bn, a near-complete debt restructuring, the US$1.47bn IMF staff-level agreement and the Lobito rail corridor advancing. The offsets are month-start corporate USD demand, rising fuel import costs flagged in November commentary, a materially easier policy stance after the 30 September MPR cut to 10.75%, and the 10% copper-concentrate export duty. Watch whether 20.35 holds; a clean break opens the 20.50 area.';

d.trendAnalysis.projection3m = 'USD/ZMW 19.60–20.60 range. Copper earnings and IMF programme inflows supportive; softer policy, fuel imports and month-start USD demand the main risks.';
d.trendAnalysis.projection6m = 'USD/ZMW 18.80–20.60 range. Direction hinges on fiscal continuity, copper earnings through the Lobito/export-logistics build-out, and the pace of further BoZ easing.';

d.bozNote = 'BoZ official daily mid: 1 USD = 20.2925 ZMW on 4 Nov 2026 (buy 20.2675 / sell 20.3175). Market mid from open.er-api.com is 20.3157, ~0.11% above the official fix — a normal small offshore premium. CNY official 5 Nov: 3.0396.';

d.source = 'open.er-api.com (auto) + BoZ mid-rate (manual)';
fs.writeFileSync(FILE, JSON.stringify(d, null, 2));
console.log('currency-data.json patched for 2026-11-06');
console.log(JSON.stringify(comparisons, null, 1));
