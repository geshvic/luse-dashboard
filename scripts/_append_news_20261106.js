const fs = require('fs');
const path = require('path');
const newsPath = path.join(__dirname, '..', 'data', 'news.json');
const news = JSON.parse(fs.readFileSync(newsPath, 'utf8'));

const newItems = [
  {
    date: "2026-11-06",
    category: "Market",
    title: "LuSE eases 0.25% to 24,626.43 as ZNCO leads decliners",
    summary: "The Lusaka Securities Exchange closed Friday 6 November 2026 with the LASI Index down 0.25% at 24,626.43 and market capitalisation at roughly ZMW 329.9 billion. Breadth was negative at 2 advancers, 5 decliners and 16 unchanged on the exchange's own board (third-party tallies put it 3/5/11). Zambia National Commercial Bank (ZNCO) -0.56% to K8.90, REIZUSD -9.09% to K0.10 and KLRE -2.78% to K0.35 led the fallers; SCBL +1.02% to K0.99 and ZFCO +0.34% to K2.97 were the only gainers. CECZ dominated turnover at K283,371 across 18,904 shares, with ATEL (K74,686), ZNCO (K63,295), DCZM (K52,863) and CHIL (K30,521) next.",
    source: "Mansa Markets / LuSE",
    url: "https://www.mansamarkets.com/zambia/summary/2026-11-06",
    tickers: ["ZNCO", "CECZ", "ATEL", "DCZM", "CHIL", "SCBL", "ZFCO", "KLRE"]
  },
  {
    date: "2026-11-06",
    category: "Macro",
    title: "Zambia's November outlook: IMF sees 5.6% growth, but fuel and kwacha pressure bite",
    summary: "Two months into President Hichilema's second term, the IMF projects 5.6% growth for Zambia in 2026 on strong agriculture, mining and exports, while the World Bank's October assessment sees 5.2% average growth over 2026-2028 and warns it is still not fast enough to cut poverty quickly. The immediate pressures are rising fuel costs feeding through to transport and business costs, kwacha softness, tight credit conditions and household purchasing power. Government is framing the second term as a shift from stabilisation to growth under the Grow Zambia Agenda.",
    source: "Zambian Eye",
    url: "https://zambianeye.com/zambia-economic-outlook-november-2026/",
    tickers: []
  },
  {
    date: "2026-11-06",
    category: "Corporate",
    title: "AFC briefs Hichilema on Zambia Lobito Railway as EPC talks begin",
    summary: "Africa Finance Corporation President Samaila Zubairu briefed President Hichilema on the Zambia Lobito Railway after AFC named preferred EPC bidders for the Zambian and Angolan sections. The 830 km greenfield line would link the Copperbelt and North-Western Province to Angola's Benguela railway and the Atlantic port of Lobito. Lenders committed about US$1.32 billion in April against a total cost reported at up to US$5 billion, with financial close targeted for late 2027 and completion in 2030. Hichilema called it a pillar of the Grow Zambia Agenda that shifts freight from road to rail and cuts export logistics costs.",
    source: "The Zambian Economist",
    url: "https://zambianeconomist.com/hichilema-afc-zambia-lobito-railway-epc-update/",
    tickers: ["ZCCM-IH", "CECZ"]
  },
  {
    date: "2026-11-06",
    category: "Macro",
    title: "Higher copper prices flagged as opening for restructured government balance sheet",
    summary: "Analysts cited by Lusaka Times argued that elevated global copper prices give Zambia room to expand mineral production and convert windfall export earnings into wider fiscal capacity, particularly now that debt restructuring is largely complete. The point lands as copper-linked revenues are the main swing factor in the 2027 budget and as the 10% copper-concentrate export duty pushes miners toward domestic processing.",
    source: "Lusaka Times",
    url: "https://www.lusakatimes.com/2026/11/06/higher-copper-prices-present-opportunity-for-restructured-government-ministries/",
    tickers: ["ZCCM-IH", "CECZ"]
  },
  {
    date: "2026-11-06",
    category: "Corporate",
    title: "Zambia Sugar files FY2026 results with LuSE",
    summary: "Zambia Sugar Plc (ZSUG) published its FY2026 financial statements on the LuSE filings portal on 3 November 2026. The stock last traded at K67.97 and was unchanged on the session. Full-year numbers will matter for the dividend line and for how the group is managing cane supply and pricing after a strong 2025-26 season.",
    source: "LuSE Official",
    url: "https://www.luse.co.zm/",
    tickers: ["ZSUG"]
  },
  {
    date: "2026-11-06",
    category: "Macro",
    title: "Zambia's inflation is near 6% but prices are 2.29x their 2020 level",
    summary: "The Zambian Economist's analysis shows headline inflation near 6% — back inside the BoZ target band — yet the price level is roughly 2.29 times its 2020 level, meaning a K13,000 salary has lost about 30% of its purchasing power in six years. The piece argues the disinflation story has not translated into relief on the cost of living, which is the political test for the second term.",
    source: "The Zambian Economist",
    url: "https://zambianeconomist.com/zambia-inflation-cost-of-living-purchasing-power-2020-2026/",
    tickers: []
  }
];

const existingTitles = new Set(news.map(n => n.title));
let added = 0;
for (const item of newItems.reverse()) {
  if (!existingTitles.has(item.title)) {
    news.unshift(item);
    added++;
  }
}
fs.writeFileSync(newsPath, JSON.stringify(news, null, 2));
console.log(`news.json: added ${added}, total ${news.length}`);
