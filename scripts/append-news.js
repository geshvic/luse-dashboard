const fs = require('fs');
const path = require('path');

const newsPath = path.join(__dirname, '..', 'data', 'news.json');
const news = JSON.parse(fs.readFileSync(newsPath, 'utf8'));

const newItems = [
  {
    "date": "2026-06-09",
    "category": "Market",
    "title": "LuSE Daily Market: LASI flat at 25,684.52 — 776 trades, K0.57M turnover",
    "summary": "The Lusaka Securities Exchange All-Share Index (LASI) closed flat at 25,684.52 on June 9. 776 trades were recorded across 108,887 shares with total turnover of K573,143. ZSUG gained 0.01% to K69.10; SCBL fell 0.78% to K1.27 and ZNCO declined 0.42% to K9.58. CECZ was most active by value (K275,821) while KLRE led by volume (64,812 shares). 20 stocks unchanged.",
    "source": "LuSE Official",
    "url": "https://www.luse.co.zm/trading/market-data/",
    "tickers": ["CECZ", "ZNCO", "ZSUG", "SCBL", "KLRE", "ATEL"]
  },
  {
    "date": "2026-06-09",
    "category": "Economy",
    "title": "Sunshine Milling cuts mealie meal prices by K40, citing kwacha gain",
    "summary": "Sunshine Milling has reduced the price of a 25kg bag of breakfast mealie meal from K260 to K220, citing lower maize prices, falling diesel costs, a stronger kwacha, and supportive government policy. The price cut demonstrates the passthrough effects of the kwacha's nearly 21% appreciation against the USD in 2026.",
    "source": "News Diggers",
    "url": "https://diggers.news/business/",
    "tickers": []
  },
  {
    "date": "2026-06-09",
    "category": "Agriculture",
    "title": "Maize is no longer profitable for smallholder farmers – Expert",
    "summary": "Despite Zambia projecting nearly 5 million tonnes of maize in 2026, agriculture expert Oliver Bulaya warns that soaring input costs (seed and fertilizer) are undermining profitability for small-scale growers. Bulaya called for government intervention to reduce input costs and improve market access for rural farmers.",
    "source": "Zambian Business Times",
    "url": "https://zambianbusinesstimes.com/maize-is-no-longer-profitable-for-smallholder-farmers-expert/",
    "tickers": []
  },
  {
    "date": "2026-06-09",
    "category": "FX",
    "title": "BOZ USD/ZMW mid-rate 17.7050 — kwacha pauses near 2-year highs",
    "summary": "Bank of Zambia quoted USD/ZMW at 17.7050 mid-rate (buy 17.6800, sell 17.7300) on June 9. XE.com mid-market: 17.8145. The kwacha has strengthened ~21% YTD from 22.19. GBP/ZMW 23.83, EUR/ZMW 20.57, ZAR/ZMW 1.079. The rally paused as the rate bounced slightly from the June 4 low of 17.512.",
    "source": "BOZ, XE.com",
    "url": "https://www.boz.zm/markets-securities/boz-exchange-rates",
    "tickers": []
  }
];

// Check for duplicates by title, prepend unique items
const existingTitles = new Set(news.map(item => item.title));
let added = 0;
for (const item of newItems.reverse()) {
  if (!existingTitles.has(item.title)) {
    news.unshift(item);
    added++;
  }
}

fs.writeFileSync(newsPath, JSON.stringify(news, null, 2), 'utf8');
console.log(`Added ${added} new items. Total news items: ${news.length}`);
