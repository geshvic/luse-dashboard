const fs = require('fs');
const existing = JSON.parse(fs.readFileSync('data/news.json', 'utf8'));

const fresh = [
  {
    date: '2026-06-10',
    category: 'Market',
    title: 'LuSE Daily: LASI flat at 25,656.85 — 0 gainers, 2 decliners',
    summary: 'Light session with 765 trades, 120,388 shares, turnover ZMW 552,806. KLRE (-2.86%) and SCBL (-1.57%) declined. CECZ led by value at ZMW 227,520.',
    source: 'LuSE (via Playwright scraper)',
    url: 'https://www.luse.co.zm/market-data/',
    tickers: ['KLRE', 'SCBL', 'CECZ']
  },
  {
    date: '2026-06-10',
    category: 'Currency',
    title: 'Kwacha retreats to 17.80/USD — second day of weakening from 2-year low',
    summary: 'USD/ZMW rose to 17.80 on Jun 10, up from 17.51 on Jun 4 (2026 low). Kwacha still +28% YoY. Copper exports, IMF successor programme talks, and high reserves continue to support medium-term outlook.',
    source: 'tradingeconomics.com, exchangerate.guru',
    url: 'https://tradingeconomics.com/zambia/currency',
    tickers: []
  },
  {
    date: '2026-06-10',
    category: 'Corporate',
    title: 'ZCCM-IH Takes 30% Stake in New Thermal Power Project',
    summary: 'ZCCM-IH announced a 30% equity stake in a new thermal power project to boost Zambia energy supply. Also formed a JV with Wonderful Group to revive lime and cement operations.',
    source: 'tipranks.com / marketbeat.com',
    url: 'https://www.marketbeat.com/stocks/LON/ZCC/',
    tickers: ['ZCCM-IH']
  },
  {
    date: '2026-06-10',
    category: 'Mining',
    title: 'KCM Nchanga Smelter 60-Day Shutdown Threatens 1M Tonne Copper Target',
    summary: 'Konkola Copper Mines announced a planned 60-day maintenance shutdown at its Nchanga Smelter, putting Zambia 2026 1M metric tonne copper production target under stress. Q1 2026 output already fell short.',
    source: 'Zambian Business Times',
    url: 'https://zambianbusinesstimes.com/1-million-copper-target-under-stress-as-kcm-goes-on-3-months-shutdown/',
    tickers: ['ZCCM-IH']
  },
  {
    date: '2026-06-09',
    category: 'Economy',
    title: 'Zambia economy going in the right direction — Prof Saasa on IMF successor programme',
    summary: 'Prof Oliver Saasa affirmed that the IMF successor programme would accelerate Zambia economic growth. GDP forecast to expand 6.4% in 2026, among region highest.',
    source: 'Diggers News',
    url: 'https://diggers.news/business/2026/06/08/zambias-economy-going-in-the-right-direction-saasa/',
    tickers: []
  },
  {
    date: '2026-06-09',
    category: 'Market',
    title: 'LuSE Tuesday: LASI +0.03% to 25,698 — 2 advancers, 3 decliners',
    summary: 'LASI rose marginally on Tuesday with market cap at ZMW 335.54B. Breadth negative: 2 stocks advanced, 3 declined, 16 unchanged.',
    source: 'mansamarkets.com',
    url: 'https://www.mansamarkets.com/zambia',
    tickers: []
  },
  {
    date: '2026-06-08',
    category: 'Market',
    title: 'LuSE Monday: 266,846 shares traded, ZMW 5.16M turnover',
    summary: 'Heavy Monday session on LuSE with 266,846 shares changing hands for ZMW 5,163,030 in market value.',
    source: 'afx.kwayisi.org',
    url: 'https://afx.kwayisi.org/luse/',
    tickers: []
  },
  {
    date: '2026-06-10',
    category: 'Mining',
    title: 'Zambia extends copper concentrate export-duty waiver to Sept 30',
    summary: 'The suspension of the 10% export duty on copper concentrates, first introduced Aug 2025, has been extended to Sep 30 2026 to relieve producers facing smelter constraints and rising stockpiles.',
    source: 'Intellinews',
    url: 'https://www.intellinews.com/zambia-extends-copper-concentrate-export-duty-waiver-prioritising-output-over-beneficiation-amid-smelter-constraints-446591/',
    tickers: ['ZCCM-IH']
  },
  {
    date: '2026-06-10',
    category: 'Regulatory',
    title: 'LuSE Investment Advisors & Stockbrokers Course — 19 June to 31 July 2026',
    summary: 'LuSE announced the next cohort of its Investment Advisors and Stockbrokers Course running from June 19 to July 31, 2026.',
    source: 'luse.co.zm',
    url: 'https://www.luse.co.zm/',
    tickers: []
  }
];

const merged = [...fresh, ...existing];
fs.writeFileSync('data/news.json', JSON.stringify(merged, null, 2));
console.log('OK: ' + merged.length + ' news items');
