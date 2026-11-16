const fs = require('fs');
const path = require('path');
const p = path.join(__dirname, '..', 'data', 'news.json');
const news = JSON.parse(fs.readFileSync(p, 'utf8'));

const newItems = [
  {
    date: '2026-09-17', category: 'Market',
    title: 'LuSE Market Summary — 17 September 2026: LASI Index -0.88% at 25,926.89',
    summary: 'MansaMarkets: The Lusaka Securities Exchange retreated on Thursday, 17 September 2026, with the LASI Index down -0.88% to 25,926.89. Market capitalisation stood at ZMW 337.03B. Breadth was negative: 2 stocks advanced, 6 declined and 12 were unchanged. ZCCM-Investment Holdings led losers, -6.04% to ZK140.00. Total volume across the tracked board was 107.4K shares.',
    source: 'MansaMarkets', url: 'https://www.mansamarkets.com/zambia/summary/2026-09-17', tickers: ['ZCCM-IH']
  },
  {
    date: '2026-09-17', category: 'Macro',
    title: "Cabinet Sets 2027 Budget Priorities: Growth, Jobs and Tax Compliance",
    summary: "Cabinet has set Zambia's 2027 budget priorities — jobs and human capital, stronger tax compliance and climate resilience — alongside continued deficit and debt reduction. The budget is due to be tabled in the Thirteenth Parliament.",
    source: 'The Zambian Economist', url: 'https://zambianeconomist.com/zambia-2027-budget-priorities-cabinet/', tickers: []
  },
  {
    date: '2026-09-17', category: 'Macro',
    title: "Musokotwane's Day-One Message: Zambia Moves From Stabilisation to Growth",
    summary: 'Finance Minister Dr Situmbeko Musokotwane has directed the Ministry of Finance and National Planning to shift focus from macroeconomic stability toward investment, production, exports, jobs and higher incomes — formalising the "Grow Zambia" agenda.',
    source: 'The Zambian Economist', url: 'https://zambianeconomist.com/musokotwane-day-one-message-stabilisation-to-growth/', tickers: []
  },
  {
    date: '2026-09-17', category: 'Corporate',
    title: 'Zambia, UAE firm sign agreement to develop solar projects',
    summary: "Zambia signed an agreement with a UAE firm to develop solar power projects, adding to a pipeline of renewable energy deals aimed at easing the country's electricity deficit and supporting mining growth.",
    source: 'Zambia Monitor', url: 'https://www.zambiamonitor.com/zambia-uae-firm-sign-agreement-to-develop-solar-projects/', tickers: ['CECZ']
  },
  {
    date: '2026-09-17', category: 'Corporate',
    title: 'ZCCM-IH set to expand business portfolio, targets mining, energy',
    summary: 'ZCCM Investments Holdings expects to significantly increase its power and copper capacity over the next two years as it broadens its portfolio across mining and energy — a signal of the state investment arm\'s growing role in the copper and power build-out.',
    source: 'Zambia Monitor', url: 'https://www.zambiamonitor.com/zccm-ih-set-to-expand-business-portfolio-targets-mining-energy/', tickers: ['ZCCM-IH']
  },
  {
    date: '2026-09-17', category: 'Macro',
    title: 'Zambia leads with foresight in preparing for the 2026/2027 supersized El Niño',
    summary: 'Government has directed all Permanent Secretaries, Provincial Administrations and Local Authorities to activate contingency plans for the anticipated 2026/2027 supersized El Niño, which could stress rivers, hydropower generation and agriculture.',
    source: 'The Zambian Economist', url: 'https://zambianeconomist.com/zambia-el-nino-2026-2027-government-preparedness/', tickers: []
  },
  {
    date: '2026-09-17', category: 'Corporate',
    title: 'Atomic Eagle secures US$10.9 million to advance uranium projects in Zambia, Niger',
    summary: "Atomic Eagle's largest shareholder, Menel Energy and Resources Limited, has committed about US$10.9 million to support the company's uranium projects in Zambia and Niger, underscoring renewed interest in Zambian energy minerals beyond copper.",
    source: 'Zambia Monitor', url: 'https://www.zambiamonitor.com/atomic-eagle-secures-us10-9-million-to-advance-uranium-projects-in-zambia-niger/', tickers: []
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
