const fs = require('fs');
const path = require('path');
const dataDir = path.join(__dirname, '..', 'data');

// ---------- 1. CURRENCY (source: open.er-api.com v6/latest/ZMW, updated 2026-10-01 00:02 UTC) ----------
const curPath = path.join(dataDir, 'currency-data.json');
const cur = JSON.parse(fs.readFileSync(curPath, 'utf8'));

// ZMW per 1 unit (from er-api base ZMW: 1 ZMW = x units  =>  1 unit = 1/x ZMW)
const mids = {
  USD: 1 / 0.050952, // 19.6262
  GBP: 1 / 0.038352, // 26.0743
  EUR: 1 / 0.044831, // 22.3060
  ZAR: 1 / 0.83329,  // 1.2001
  BWP: 1 / 0.718687, // 1.3914
  CNY: 1 / 0.3403    // 2.9386
};
const r3 = (n) => Math.round(n * 10000) / 10000;

cur.asOf = '2026-10-01';
cur.ratesLastUpdated = '2026-10-01 00:02 UTC';
cur.bozNote = 'BoZ official daily mid 1 Oct 2026: 1 USD = 19.59 ZMW (CNY 2.9172).';

const trendByKey = { USD: 'weakening', GBP: 'weakening', EUR: 'stable', ZAR: 'stable', BWP: 'stable', CNY: 'weakening' };
const noteFmt = (k, mid, trend) =>
  `1 ${k} \u2248 ${r3(mid)} ZMW \u2014 auto-updated 2026-10-01 (open.er-api.com). ` +
  (trend === 'weakening' ? '\u2191 ZMW per ' + k + ' = kwacha weakening.' : 'Broadly flat versus the prior snapshot.');

for (const k of Object.keys(cur.rates)) {
  if (mids[k] != null) {
    cur.rates[k].mid = r3(mids[k]);
    if (cur.rates[k].marketMid != null) cur.rates[k].marketMid = r3(mids[k]);
    cur.rates[k].trend = trendByKey[k];
    cur.rates[k].note = noteFmt(k, mids[k], trendByKey[k]);
  }
}
cur.rates.USD.bozMid = 19.59;

const prior = { USD: 19.4882, GBP: 25.8866, EUR: 22.2455, ZAR: 1.1941, BWP: 1.3908, CNY: 2.9138 };
const chg = {};
for (const k of Object.keys(prior)) chg[k] = { abs: r3(mids[k] - prior[k]), pct: Math.round((mids[k] / prior[k] - 1) * 10000) / 100 };

cur.trendAnalysis.direction =
  `USD/ZMW mid at ${r3(mids.USD)} (+${chg.USD.pct}% vs the prior 24 Sep snapshot of 19.4882). ` +
  `Rates auto-refreshed from open.er-api.com; BOZ mid-rate and MPR updated manually (MPR now 10.75% after the 30 Sep 2026 cut).`;
cur.trendAnalysis.dayChange = chg.USD.abs;
cur.trendAnalysis.snapshotComparisons = chg;
cur.trendAnalysis.outlook =
  `The kwacha gave back a little more ground over the past week, with the USD/ZMW market mid at ~K${r3(mids.USD)}/USD ` +
  `(open.er-api.com, 1 Oct) versus ~K19.49 a week earlier \u2014 a modest ~0.7% softening driven by end-of-quarter import demand ` +
  `and the 10% copper-concentrate export duty taking effect on 30 September. The move was basket-wide but shallow: ` +
  `GBP (${r3(mids.GBP)}, +${chg.GBP.pct}%), CNY (${r3(mids.CNY)}, +${chg.CNY.pct}%) and ZAR (${r3(mids.ZAR)}, +${chg.ZAR.pct}%) ` +
  `all cost marginally more ZMW, while EUR (${r3(mids.EUR)}, +${chg.EUR.pct}%) and BWP (${r3(mids.BWP)}, +${chg.BWP.pct}%) ` +
  `were effectively unchanged \u2014 a mild, basket-wide softening rather than a sharp single-pair move. The pair still sits inside ` +
  `its broad 18.40\u201319.80 consolidation band. The headline policy event was the BoZ's 250bps MPR cut to 10.75% on 30 September ` +
  `as inflation returned inside target; a lower policy rate trims the carry attractiveness that supported the kwacha earlier in 2026, ` +
  `even as the IMF successor-programme talks and the 2027 budget process shape the medium-term outlook.`;

fs.writeFileSync(curPath, JSON.stringify(cur, null, 2) + '\n');

// ---------- 2. SNAPSHOT ----------
const day = '2026-10-01';
const histDir = path.join(dataDir, 'history', day);
fs.mkdirSync(histDir, { recursive: true });
const mc = fs.readFileSync(path.join(dataDir, 'market-close.json'), 'utf8');
fs.writeFileSync(path.join(histDir, 'snapshot.json'), mc);

// ---------- 3. NEWS (append only genuinely new items) ----------
const newsPath = path.join(dataDir, 'news.json');
const news = JSON.parse(fs.readFileSync(newsPath, 'utf8'));
const existing = new Set(news.map((x) => (x.title || '').toLowerCase().trim()));

const fresh = [
  {
    date: '2026-10-01',
    category: 'Mining',
    title: "Zambia firm accuses Abu Dhabi's IRH of breaching mine deal",
    summary:
      "Bloomberg reported that ZCCM Investments Holdings (ZCCM-IH) has formally accused Abu Dhabi's International Resources Holding (IRH) of breaching the 2024 agreement covering the Mopani copper assets \u2014 a second source on the flashpoint over the state miner's flagship holding (Bloomberg, 28 Sep 2026).",
    source: 'Bloomberg.com',
    url: 'https://news.google.com/rss/articles/CBMitgFBVV95cUxOM3pEOGFNN0ZuaTI5MW5QM0JrLTRJb08yNzljSTN3OXRMRkczZVpPQS12aXljdEtSZmVPSzdxVFlpdUUxWVBPS1FKMVFjR1VtZDFldGlnbVc2M25ZOEFwTVh1bExSZ1hxSlBMN2lLOERFb2Uza3NrNUV0czUyTzZVY1N3RDJrelI4WWVjQ2xkeDZFbVJzM0lYOFNlcGV3b29QTXJucVNwdzJHYlU3N0Zna1pzdUVkUQ?oc=5',
    tickers: ['ZCCM-IH']
  },
  {
    date: '2026-10-01',
    category: 'Corporate',
    title: 'ZCCM Investments Holdings expects HY EPS 89% higher than prior year',
    summary:
      "ZCCM Investments Holdings (ZCCM-IH) guided that its half-year earnings per share would be about 89% higher than the prior-year period, ahead of its HY 2026 unaudited results \u2014 a positive earnings signal for the state miner (TradingView, 21 Sep 2026).",
    source: 'TradingView',
    url: 'https://news.google.com/rss/articles/CBMi2gFBVV95cUxNb1hiNjVPYTBYLVJnM0FhUi1Kbl9ycnMwYmVLc0tsNjd3bjJPbElwTFBYSmhsNlNoNmN2RkpFcl9YbUlLaTB2Y1NQNkl5dWhUV1JXYTNLZUt1LV9MOTNmcnFaR0VkUmstN183R2VSdmtheVQzOWNudlBLMGMtTUtRaHdVMEotVlA0cmRlQ282QXktRnF4LUdia1dVME92N1BkalNZOVluMmpKZmRsZzdFa0RZdEV3RHZaVW9qREdSRXpFeFZ6RmZucEloeVlEbmlBMjA2ZXNROG1Edw?oc=5',
    tickers: ['ZCCM-IH']
  },
  {
    date: '2026-10-01',
    category: 'Mining',
    title: "China's quest for critical minerals comes with abuse concerns",
    summary:
      "Analysis of China's push for critical minerals in Africa \u2014 including Zambian copper and cobalt \u2014 examines labour and governance concerns as Chinese investment in the Copperbelt deepens (Africa Defense Forum, 29 Sep 2026).",
    source: 'Africa Defense Forum',
    url: 'https://news.google.com/rss/articles/CBMijgFBVV95cUxPbmFVeGpOMnZBX0s4WXB0YzExSkh0RGd6SkZtcTNCMWJtNEt0a2E4aE9UNHF3MmFndnFudW81d0RJWGtaQlNSNjZaOTdscy1ncF9tNklQVEEzX18waTJibUNPZzh3YlRYMmJiUnRnQ05TdjROLWVxQUVuVno1MzBoSmVNQXV4WVFQVWJCV1dR?oc=5',
    tickers: []
  }
];

let added = 0;
for (const item of fresh) {
  const key = item.title.toLowerCase().trim();
  if (!existing.has(key)) {
    news.push(item);
    existing.add(key);
    added++;
  }
}
fs.writeFileSync(newsPath, JSON.stringify(news, null, 2) + '\n');

console.log(JSON.stringify({ currencyMids: { USD: r3(mids.USD), GBP: r3(mids.GBP), EUR: r3(mids.EUR), ZAR: r3(mids.ZAR), BWP: r3(mids.BWP), CNY: r3(mids.CNY) }, snapshot: path.join('data', 'history', day, 'snapshot.json'), newsAdded: added, newsTotal: news.length }, null, 2));
