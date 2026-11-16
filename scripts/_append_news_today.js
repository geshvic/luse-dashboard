const fs = require('fs');
const p = 'data/news.json';
const news = JSON.parse(fs.readFileSync(p, 'utf8'));
const newItems = [
  { date: '2026-09-01', category: 'Market', title: 'LuSE Market Summary — 1 September 2026: LASI Index -0.22%', summary: 'MansaMarkets: The Lusaka Securities Exchange retreated on Tuesday, 1 September 2026, with the LASI Index down -0.22% to 26,310.55. Market capitalisation stood at ZMW 339.31B. Breadth positive: 10 stocks advanced, 4 declined and 9 were unchanged.', source: 'MansaMarkets', url: 'https://www.mansamarkets.com/zambia/summary/2026-09-01', tickers: [] },
  { date: '2026-09-01', category: 'Corporate', title: 'Airtel Zambia announces nationwide network expansion', summary: 'Zambia Monitor: Airtel Zambia has announced a US$107 million nationwide network expansion programme aimed at improving coverage, enhancing service reliability and meeting growing demand for digital connectivity. The investment funds rollout of 406 new sites, 121 already operational.', source: 'Zambia Monitor', url: 'https://www.zambiamonitor.com/airtel-zambia-announces-nationwide-network-expansion/', tickers: ['ATEL'] },
  { date: '2026-09-01', category: 'Corporate', title: 'ZICTA fines Airtel Zambia K828,000 for network outage', summary: 'Techpression: The Zambia Information and Communications Technology Authority (ZICTA) imposed regulatory sanctions on Airtel Networks Zambia Limited following a significant service interruption on June 10, fining the business K828,000 for breaching Consumer Protection and Quality of Service Guidelines.', source: 'Techpression', url: 'https://techpression.com/zicta-fines-airtel-zambia-k828000-for-network-outage/', tickers: ['ATEL'] },
  { date: '2026-09-01', category: 'Corporate', title: 'ZCCM-IH Backs 600MW Power Project to Strengthen Zambia\'s Energy Security', summary: 'Copperbelt Katanga Mining: ZCCM Investments Holdings Plc (ZCCM-IH) announced a US$54.2 million investment in a 600MW thermal power plant in Sinazongwe District, Southern Province, aimed at addressing the country\'s power deficit and supporting mining growth.', source: 'Copperbelt Katanga Mining', url: 'https://copperbeltkatangamining.com/zccm-ih-backs-600mw-power-project-to-strengthen-zambias-energy-security-and-drive-growth/', tickers: ['ZCCM'] },
  { date: '2026-09-01', category: 'Corporate', title: 'Airtel Networks Zambia Plc (ATEL.zm) Q1 2026 Interim Report', summary: 'African Financials: Airtel Networks Zambia Plc demonstrated a strengthened financial position in Q1 2026 — total assets grew to ZMW 9,108 million, up from ZMW 8,267 million in the corresponding prior-year period, driven largely by non-current assets of ZMW 7,634 million.', source: 'African Financials', url: 'https://africanfinancials.com/document/zm-atel-2026-ir-q1/', tickers: ['ATEL'] },
  { date: '2026-09-01', category: 'Macro', title: 'Zambia now shifts to growth - Zambia 24', summary: 'Zambia24: President Hakainde Hichilema has declared that Zambia is now moving from economic stabilisation to growth, setting out a second-term agenda focused on creating jobs, expanding investment, increasing production and ensuring economic gains translate into better lives for citizens.', source: 'Zambia24', url: 'https://zambia24.com/2026/09/01/zambia-now-shifts-to-growth/', tickers: [] },
  { date: '2026-09-01', category: 'Macro', title: 'Zambia Economy 2026: The Numbers That Matter for Business', summary: 'Zambian Economist: A plain-English business guide to the numbers shaping Zambia in 2026 — inflation, the kwacha, copper, interest rates, power and public debt — and what each means for business.', source: 'Zambian Economist', url: 'https://zambianeconomist.com/zambia-economy-2026-business-guide/', tickers: [] }
];
const existing = new Set(news.map(n => n.title));
let added = 0;
for (const item of newItems) {
  if (!existing.has(item.title)) {
    news.unshift(item);
    added++;
  }
}
fs.writeFileSync(p, JSON.stringify(news, null, 2));
console.log('Added ' + added + ' items. Total: ' + news.length);
