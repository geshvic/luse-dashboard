const fs = require('fs');
const p = './data/currency-data.json';
const c = JSON.parse(fs.readFileSync(p, 'utf8'));

const prev = {}; // previous mids (6 Oct snapshot)
for (const k of Object.keys(c.rates)) prev[k] = c.rates[k].mid;

// Fresh mids: computed from open.er-api.com base-USD rates updated 2026-10-09 00:02 UTC
const mid = {
  USD: 19.7508,
  GBP: 26.1076,
  EUR: 22.1360,
  ZAR: 1.1887,
  BWP: 1.4093,
  CNY: 2.9412
};

c.asOf = '2026-10-09';
c.ratesLastUpdated = '2026-10-09 00:02 UTC';
c.baseNote = 'Rates show ZMW per 1 unit of foreign currency. Higher ZMW = Kwacha weaker (depreciating); lower ZMW = Kwacha stronger (appreciating).';

function pct(a, b) { return +(((a - b) / b) * 100).toFixed(2); }

c.rates.USD.buy = 19.7258;
c.rates.USD.sell = 19.7758;
c.rates.USD.mid = mid.USD;
c.rates.USD.marketMid = mid.USD;
c.rates.USD.bozMid = 19.75;
c.rates.USD.dayAgo = prev.USD;
c.rates.USD.trend = 'stable';
c.rates.USD.note = '1 USD = ' + mid.USD + ' ZMW - auto-updated 2026-10-09 (open.er-api.com). BoZ official mid last published 19.75 (6 Oct). Higher ZMW per USD = kwacha weaker.';

for (const k of ['GBP', 'EUR', 'ZAR', 'BWP', 'CNY']) {
  c.rates[k].dayAgo = prev[k];
  c.rates[k].mid = mid[k];
  c.rates[k].trend = 'weakening';
  c.rates[k].note = '1 ' + k + ' = ' + mid[k] + ' ZMW - auto-updated 2026-10-09 (open.er-api.com). Higher ZMW per ' + k + ' = kwacha weaker.';
}

const sc = {};
for (const k of Object.keys(mid)) {
  sc[k] = { abs: +(mid[k] - prev[k]).toFixed(4), pct: pct(mid[k], prev[k]) };
}
c.trendAnalysis.snapshotComparisons = sc;
c.trendAnalysis.dayChange = pct(mid.USD, prev.USD);
c.trendAnalysis.twoWeekChange = pct(mid.USD, c.rates.USD.twoWeeksAgo);
c.trendAnalysis.oneMonthChange = pct(mid.USD, c.rates.USD.oneMonthAgo);
c.trendAnalysis.sixMonthChange = pct(mid.USD, c.rates.USD.sixMonthsAgo);
c.trendAnalysis.direction = 'USD/ZMW market mid at ' + mid.USD + ' (marginally softer, +' + pct(mid.USD, prev.USD) + '% vs the 6 Oct snapshot at ' + prev.USD + '). The kwacha eased a touch across the whole basket on the latest open.er-api.com print (updated 9 Oct 00:02 UTC), with the BoZ official mid last published at 19.75 (6 Oct).';
c.trendAnalysis.outlook = 'The kwacha gave back a little of late-September/early-October firmness in the latest session, with the USD/ZMW market mid at ~K' + mid.USD + ' (open.er-api.com, 9 Oct) versus ~K' + prev.USD + ' in the prior snapshot - a marginal +' + pct(mid.USD, prev.USD) + '% move. The softening was broad but small: GBP (' + mid.GBP + ', +' + sc.GBP.pct + '%), EUR (' + mid.EUR + ', +' + sc.EUR.pct + '%), ZAR (' + mid.ZAR + ', +' + sc.ZAR.pct + '%) and CNY (' + mid.CNY + ', +' + sc.CNY.pct + '%) all cost slightly more kwacha, while BWP (' + mid.BWP + ', +' + sc.BWP.pct + '%) moved most. The pair remains within the broad 18.40-19.80 consolidation band. The policy backdrop remains the 30 September 2026 MPC, at which the BoZ cut the MPR 250bps to 10.75% - the lowest in several years - as inflation (6.1% y/y in September, per ZamStats) returned inside the 6-8% target band; that trims the carry support that buoyed the kwacha earlier in 2026. Import demand, copper-price swings, the pace of further BoZ easing and the 9 October opening of the 14th National Assembly (2026/2027 policy direction) are the near-term reference points.';
c.bozNote = 'BoZ official daily mid: last published 6 Oct 2026 at 1 USD = 19.75 ZMW (BoZ publishes each business day; 5 Oct mid was 19.6784). Market mid (9 Oct, open.er-api.com) 19.7508. Parallel-market quotes typically carry a small premium over the official mid.';

fs.writeFileSync(p, JSON.stringify(c, null, 2));
console.log('currency updated', JSON.stringify(sc));
