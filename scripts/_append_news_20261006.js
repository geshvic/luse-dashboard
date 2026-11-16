const fs = require('fs');
const p = './data/news.json';
const news = JSON.parse(fs.readFileSync(p, 'utf8'));
const urls = new Set(news.map(x => x.url));
const D = '2026-10-06';
const add = [
  { date: D, category: 'Mining', title: "KCM copper production rises 21% as Zambia's national output holds steady - Zambia Monitor", summary: 'Konkola Copper Mines recorded a 21% increase in copper production in H1 2026 versus the same period last year, per the Ministry of Mines. National H1 output was 447,181.93t, up just 0.45% on 445,176.59t in 2025. KCM targets 185,000t for FY2027 (Apr 2026-Mar 2027), ~39% above its 133,000t FY2026 actual.', source: 'Zambia Monitor', url: 'https://www.zambiamonitor.com/kcm-copper-production-rises-21-as-zambias-national-output-holds-steady/', tickers: ['ZCCM-IH'] },
  { date: D, category: 'Mining', title: "Govt, BHP partner to strengthen Zambia's geological exploration capacity - Zambia Monitor", summary: "Government has signed an agreement with global mining company BHP to strengthen Zambia's geological exploration capacity.", source: 'Zambia Monitor', url: 'https://www.zambiamonitor.com/govt-bhp-partner-to-strengthen-zambias-geological-exploration-capacity/', tickers: ['ZCCM-IH'] },
  { date: D, category: 'Economy', title: "'We have to do more with less,' Zambian govt sounds the alarm on 2027 budget - Zambia Monitor", summary: 'Government will have to do more with less in the 2027 National Budget as rising personnel costs and increased Constituency Development Fund allocations squeeze fiscal space.', source: 'Zambia Monitor', url: 'https://www.zambiamonitor.com/we-have-to-do-more-with-less-zambian-govt-sounds-the-alarm-on-2027-budget/', tickers: [] },
  { date: D, category: 'Economy', title: 'Small-scale miners want ZEMA fees reviewed - Zambia Monitor', summary: 'The Federation of Small Scale Mining Associations of Zambia (FSSMAZ) has called for a review of environmental fees affecting small-scale gemstone miners.', source: 'Zambia Monitor', url: 'https://www.zambiamonitor.com/small-scale-miners-want-zema-fees-reviewed/', tickers: [] },
  { date: D, category: 'Economy', title: 'Govt Removes Specimen-Sharing Clause from US$1.5bn Health MoU - Mwebantu', summary: 'Government has removed a specimen-sharing clause from a US$1.5 billion health memorandum of understanding.', source: 'Mwebantu', url: 'https://www.mwebantu.com/govt-removes-specimen-sharing-clause-from-us1-5bn-health-mou/', tickers: [] },
  { date: D, category: 'Corporate', title: 'Built for the Long Haul: UD Trucks is now part of Imperial Motors Zambia - Mwebantu', summary: 'UD Trucks has joined Imperial Motors Zambia, expanding the commercial-vehicle offering in the Zambian market.', source: 'Mwebantu', url: 'https://www.mwebantu.com/built-for-the-long-haul-ud-trucks-is-now-part-of-imperial-motors-zambia/', tickers: [] }
];
let added = 0;
for (const a of add) { if (!urls.has(a.url)) { news.push(a); urls.add(a.url); added++; } }
fs.writeFileSync(p, JSON.stringify(news, null, 2));
console.log('added', added, 'total', news.length);
