const fs = require('fs');
const path = require('path');
const newsPath = path.join(__dirname, '..', 'data', 'news.json');
const news = JSON.parse(fs.readFileSync(newsPath, 'utf8'));

const newItems = [
  {
    date: "2026-09-11",
    category: "Macro",
    title: "Zambia Economy This Week: New Parliament, Copper Power Push, Rising Living Costs (7–11 September 2026)",
    summary: "224 newly elected MPs were sworn in on Monday 7 September, opening the Thirteenth Parliament that must pass the 2027 National Budget and the 2027–2031 Medium-Term Revenue Strategy. August inflation eased to 6.2% — the lowest since February 2018 and inside BoZ's 6–8% target band — yet the JCTR Basic Needs and Nutrition Basket for a Lusaka family of five rose to K12,000.94 in August, up K302.52 on July. President Hichilema met Vedanta Resources on Thursday 10 September, pressing Konkola Copper Mines and CopperTech to fast-track power investment for a 500,000-tonne copper target and the government's 10-gigawatt electricity goal. The kwacha traded between roughly K19.07 and K19.37 against the dollar this week, ending near K19.24, marginally softer than a week earlier, while the ERB held September fuel pump prices unchanged.",
    source: "The Zambian Economist",
    url: "https://zambianeconomist.com/zambia-economy-this-week-10-september-2026/",
    tickers: ["ZCCM-IH", "CECZ"]
  },
  {
    date: "2026-09-11",
    category: "Macro",
    title: "Two dates to watch: MPC decision and 10% copper concentrate export duty both land 30 September",
    summary: "The Bank of Zambia Monetary Policy Committee meets on 30 September 2026 — the same day a 10% export duty on copper concentrates is due to take effect. The clustering lands as government pushes for domestic copper value addition while headline inflation sits at 6.2%, the lowest reading since February 2018.",
    source: "The Zambian Economist",
    url: "https://zambianeconomist.com/zambia-economy-this-week-10-september-2026/",
    tickers: ["ZCCM-IH"]
  },
  {
    date: "2026-09-11",
    category: "Market",
    title: "ZCMCA 2026 capital markets conference set for Livingstone, 30 September – 2 October",
    summary: "The second Zambia Capital Markets Conference & Awards (ZCMCA 2026), hosted by LuSE with the Securities and Exchange Commission and the Capital Markets Association of Zambia, will run 30 September – 2 October 2026 in Livingstone under the theme 'Capital Markets 2030: Mobilising Investment for Economic Transformation and Sustainable Growth'. LuSE CEO Nicholas Kabaso flagged off preparations in August, stressing capital-markets deepening.",
    source: "LuSE Official",
    url: "https://awards.luse.co.zm/",
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
if (news.length > 60) news.length = 60;
fs.writeFileSync(newsPath, JSON.stringify(news, null, 2), 'utf8');
console.log(`Added ${added} new items. Total: ${news.length}`);
