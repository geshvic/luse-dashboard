const fs = require('fs');
const p = 'data/news.json';
const news = JSON.parse(fs.readFileSync(p, 'utf8'));
const newItems = [
  { date: '2026-08-05', category: 'Commodities', title: "Africa's second-largest copper producer heads to elections with $10 billion mining boom and 3-million-tonne ambition at stake", summary: 'Business Insider Africa: Zambia heads to the Aug 13 election with a $10bn mining boom underway and ambition to reach 3 million tonnes of copper output at stake, as producers seek policy certainty from the next government.', source: 'Business Insider Africa', url: 'https://africa.businessinsider.com/local/markets/africas-second-largest-copper-producer-heads-to-elections-with-10-billion-mining-boom-and-3-million-tonne-ambition-at-stake', tickers: ['ZCCM'] },
  { date: '2026-08-05', category: 'Commodities', title: 'Zambia miners seek election boost for copper drive', summary: 'Miningmx: Zambian miners hope the post-election government supports copper expansion, seeking clarity on taxation and power supply to drive output growth.', source: 'Miningmx', url: 'https://www.miningmx.com', tickers: ['ZCCM'] },
  { date: '2026-08-05', category: 'Commodities', title: 'Patriot Resources completes Zambia site visit, geological mapping', summary: 'Mining Weekly: Patriot Resources completed a Zambia site visit and geological mapping programme as it advances its Zambian copper assets.', source: 'Mining Weekly', url: 'https://www.miningweekly.com', tickers: [] },
  { date: '2026-08-05', category: 'Macro', title: 'Zambia and Ghana currencies lose ground as traders turn cautious on the dollar', summary: 'Business Insider Africa: The kwacha and Ghana cedi both lost ground as traders turned cautious ahead of the dollar, consistent with pre-election USD hedging demand in Zambia.', source: 'Business Insider Africa', url: 'https://africa.businessinsider.com/local/markets/zambia-and-ghana-currencies-lose-ground-as-traders-turn-cautious-on-the-dollar', tickers: [] },
  { date: '2026-08-05', category: 'Macro', title: 'Zambia: Economic test looms for next administration', summary: 'africanews Business Africa: The next Zambian administration faces an economic test - sustaining fiscal discipline, debt restructuring completion and investor confidence after the Aug 13 election.', source: 'Africanews', url: 'https://www.africanews.com', tickers: [] }
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
