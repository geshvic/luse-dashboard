const fs = require('fs');
const path = require('path');
const p = path.join(__dirname, '..', 'data', 'news.json');
const news = JSON.parse(fs.readFileSync(p, 'utf8'));

const newItems = [
  {
    date: '2026-09-23', category: 'Market',
    title: "LuSE CEO on first gold ETF, $1bn listing pipeline and 2030 ambitions",
    summary: "In a Forbes Africa interview published 23 September 2026, the Lusaka Securities Exchange's chief executive detailed Zambia's planned debut gold ETF, a pipeline of about US$1 billion in new listings, and the bourse's 2030 growth ambitions — underscoring a push to deepen the market beyond the current large-cap core.",
    source: 'Forbes Africa', url: 'https://www.forbesafrica.com', tickers: []
  },
  {
    date: '2026-09-22', category: 'Corporate',
    title: "ZCCM-IH: stock rallies into heavy losses and valuation doubts",
    summary: "A valuation review (simplywall.st, 22 September 2026) flagged ZCCM Investments Holdings' rally against its heavy reported losses and questioned the implied valuation, as the state investment arm's earnings remain weighed down by Mopani and KCM.",
    source: 'Simply Wall St', url: 'https://simplywall.st', tickers: ['ZCCM-IH']
  },
  {
    date: '2026-09-22', category: 'Energy',
    title: "EnerSynk aims to develop up to 3 GW of solar in Zambia by 2030",
    summary: "Following its 500 MW solar PPA with ZESCO, renewables developer EnerSynk said it aims to develop up to 3 GW of solar capacity in Zambia by 2030 — a further signal of the scale of private power build-out alongside the country's open-access electricity reforms.",
    source: 'Enerdata', url: 'https://www.enerdata.net', tickers: ['CECZ']
  },
  {
    date: '2026-09-21', category: 'Corporate',
    title: "Airtel Africa Foundation starts scholarship scheme in Zambia",
    summary: "The Airtel Africa Foundation launched a scholarship scheme in Zambia, adding to Airtel Zambia's education and technology funding initiatives (including 50 fully funded technology scholarships) as the operator deepens its local community investment.",
    source: 'Telecompaper', url: 'https://www.telecompaper.com', tickers: ['ATEL']
  },
  {
    date: '2026-09-21', category: 'Energy',
    title: "Vedanta's Zambian unit resumes copper smelter operations after maintenance",
    summary: "KCM-operator Vedanta's Zambian unit restarted its copper smelter following scheduled maintenance, restoring smelting capacity as Zambia pushes to lift copper output and capture more value onshore.",
    source: 'Mining.com', url: 'https://www.mining.com', tickers: ['ZCCM-IH']
  },
  {
    date: '2026-09-21', category: 'Macro',
    title: "First Quantum highlights trolley-assist haulage at Zambian copper operations",
    summary: "First Quantum detailed its 'Quantum Electra-Haul' trolley-assist technology at its Zambian copper operations — part of ongoing efficiency and electrification work at Kansanshi/Sentinel as the sector positions for the energy transition.",
    source: 'IndexBox', url: 'https://www.indexbox.io', tickers: []
  },
  {
    date: '2026-09-21', category: 'Commodities',
    title: "Tailings reprocessing to contribute to Zambia copper growth",
    summary: "Industry analysis (Mining Digital, 21 September 2026) highlighted tailings reprocessing as a growing contributor to Zambian copper output, as operators look to recover metal from historical waste streams.",
    source: 'Mining Digital', url: 'https://miningdigital.com', tickers: []
  },
  {
    date: '2026-09-18', category: 'Corporate',
    title: "Zambia regulator cancels Beeline licence over regulatory breaches",
    summary: "Zambia's telecoms regulator cancelled Beeline's operating licence over regulatory breaches, a move that reinforces the dominance of the market's two main operators and could shape competitive dynamics in mobile and data services.",
    source: 'Developing Telecoms', url: 'https://developingtelecoms.com', tickers: []
  },
  {
    date: '2026-09-16', category: 'Energy',
    title: "ZESCO signs 25-year PPA with EnerSynk for 500 MW solar project",
    summary: "ZESCO signed a 25-year power purchase agreement with EnerSynk for a 500 MW solar project in Zambia — a major addition to the country's generation pipeline amid efforts to close the electricity deficit and support mining demand.",
    source: 'Renewables Now', url: 'https://renewablesnow.com', tickers: ['CECZ']
  },
  {
    date: '2026-09-16', category: 'Corporate',
    title: "Zambia telecom duopoly proves unbreakable",
    summary: "Analysis (ITWeb Africa, 16 September 2026) argued Zambia's mobile telecoms duopoly remains firmly entrenched, with high barriers to entry and limited disruptive competition beyond the two dominant operators.",
    source: 'ITWeb Africa', url: 'https://itweb.africa', tickers: ['ATEL']
  },
  {
    date: '2026-09-17', category: 'FX',
    title: "AFRICA-FX: Uganda's currency among those facing pressure",
    summary: "Reuters' regional FX round-up (17 September 2026) noted pressure across several African currencies, with commodity-linked and import-dependent units — including the region's copper-linked kwacha complex — in focus as end-of-quarter demand builds.",
    source: 'Reuters', url: 'https://www.reuters.com', tickers: []
  }
];

const existing = new Set(news.map(n => n.title));
let added = 0;
for (const item of newItems) {
  if (!existing.has(item.title)) { news.unshift(item); added++; }
}
if (news.length > 80) news.length = 80;
fs.writeFileSync(p, JSON.stringify(news, null, 2), 'utf8');
console.log('Added ' + added + ' items. Total: ' + news.length);
