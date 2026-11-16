const fs = require('fs');
const path = require('path');
const p = path.join(__dirname, '..', 'data', 'news.json');
const news = JSON.parse(fs.readFileSync(p, 'utf8'));

const fresh = [
  {
    date: '2026-10-01',
    category: 'Macro',
    title: 'Zambia cuts policy rate to 10.75% as inflation eases',
    summary: 'The Bank of Zambia cut its Monetary Policy Rate by 250bps to 10.75% at the 30 September 2026 MPC — the lowest in several years — as inflation returned inside the central bank target band, lowering borrowing costs across the economy (Bloomberg / Business News Nigeria, 30 Sep 2026).',
    source: 'Business News Nigeria',
    url: 'https://news.google.com/rss/articles/CBMilwFBVV95cUxQZTlHMmhxSzFGVFR0X2xycUhHenFSeE9xM0hJekgyeGIxalpzQXFXcWhUNXJSdzFtOS1XRzlfbG9ES0hqTEpZTW9KMHV0UUpJeWFPOWRvM0dHR18tTUJCT19OOGo4ZC00dVhmU09YRHB2RXhxQ3VkSy1LUEZFb3l5OC1DeDFuLVF1enhDNjZYeXloZ292NGFF?oc=5',
    tickers: []
  },
  {
    date: '2026-10-01',
    category: 'Macro',
    title: 'IMF mission visits Zambia for talks on new loan programme',
    summary: 'An IMF mission visited Zambia to open discussions on a successor programme under the Extended Credit Facility, focused on growth, investment and job creation, following completion of the previous 38-month ECF review (Reuters, 30 Sep 2026).',
    source: 'Reuters',
    url: 'https://news.google.com/rss/articles/CBMiswFBVV95cUxNZzRZdjRiZDByRUVmbnFNZE9EQXpNTnRlLTBTWGkxVExGRUZrWXpRNUd0WGZCQlV4bUdiVmdTLWlLSWxPeUlfZThsTEVzbDE2Z0FjeDJDcGZhV0drVzZMbkFRN2R3TFd0c0JVenRDbFNEdFJiQVJvYmYxZEpwaWMyVXBXOUV4bkVTR0h6Slk0Z3U1MlN5eFgtZm9MOEFqd1JyUXVXVUdVcGVxaXNFY2I1NlhDRQ?oc=5',
    tickers: []
  },
  {
    date: '2026-10-01',
    category: 'Macro',
    title: 'Zambia projects 7% economic growth over next three years',
    summary: 'Zambia is projecting average economic growth of about 7% over the next three years, shifting policy from macroeconomic stabilisation toward production, exports and investment (trtafrika.com, 30 Sep 2026).',
    source: 'trtafrika.com',
    url: 'https://news.google.com/rss/articles/CBMiZEFVX3lxTE5wU3UyQmFhS0pBWUlBbTJ0ZVctMzBQOU0tSU96ajNyc2hFZFZFYzhBTVBpRHU5QXFfRkpsVVNVV1Z0cXJ4cDJQRXpsSk9xUm9HY2JOOHhpYnQxREVDNEZLMmZXUUc?oc=5',
    tickers: []
  },
  {
    date: '2026-10-01',
    category: 'Mining',
    title: "Zambia's state miner accuses Abu Dhabi investor of breaching Mopani deal",
    summary: "ZCCM Investments Holdings (ZCCM-IH) wrote to International Resources Holding (IRH) accusing the Abu Dhabi investor of breaching the 2024 agreement over the Mopani copper assets — a fresh flashpoint for the state miner's flagship holding (Miningmx / Business Insider Africa, 29 Sep 2026).",
    source: 'Miningmx',
    url: 'https://news.google.com/rss/articles/CBMingFBVV95cUxQaF9JX3d5ZnFyQi0yczBmMUo0czRCQVVBVGVTQnNtZGxSMEhkRmNhc2E0VURQYzVTNWFWX0UtWmhsem9iYWExNUczUi15d3JVNUtqUTEyX0lYZ1VITDlZU3daeml0M0p0MFM1dm9pcEt0LTZNM253dTJaMVJwaVNaYkh2eThndU1uZmtIRV85NHpIdVdwOWpQdG1yUUVQdw?oc=5',
    tickers: ['ZCCM-IH']
  },
  {
    date: '2026-10-01',
    category: 'Corporate',
    title: 'Airtel Zambia launches nationwide drive to plant 500 trees at schools',
    summary: 'Airtel Networks Zambia (ATEL) launched a nationwide sustainability drive to plant 500 trees at schools, its latest corporate-social-investment push as the counter holds near K224 after H1 2026 results (Telecompaper, 28 Sep 2026).',
    source: 'Telecompaper',
    url: 'https://news.google.com/rss/articles/CBMisgFBVV95cUxQdm1faDYtTDhvR1dtNWxZdFNHc090TFpMdjlEYVBOVVZicU8zZnhrVkFpY2EzbHAteWsxeG9sN1V3Zk9FWWtRR0lMVFJabnlkVElUd1VEdVA2al92VFVNMFdkdVhUalZVeGRUU0lRQjQtaG50TkhrWTVSTExQUUduREE1MENxcl9lcjlZYlJEZ1pUZzJ2Q2VNRnFYSnBqNS1HdDJMRzVrU21iX2c5elRSZERn?oc=5',
    tickers: ['ATEL']
  },
  {
    date: '2026-10-01',
    category: 'Market',
    title: "Africa's biggest REIT markets in 2026, ranked by value",
    summary: 'A ranking of Africa\'s largest REIT markets by value in 2026 (Nairametrics, 30 Sep 2026), relevant context for Zambia\'s listed property counters such as the USD-denominated REIZUSD.',
    source: 'Nairametrics',
    url: 'https://news.google.com/rss/articles/CBMikwFBVV95cUxQekphV0IzR29LTFFPNVFVeVpBSFRhdWFTRFk5Q0RpeVN6SFc4ZkEyclJhV2JYcW9FZkVmQ2U5X1NDZW8tN045LTFSYnBOMnJCLTUzWGJZYWU3eDNYdzJIQUVqRjQ3cE96QjhWZElnLXZ1MjIyUUZLX0JNQm5QV3phWjRROG0wMEpTTTNrMUpUQ0FydUk?oc=5',
    tickers: ['REIZUSD']
  },
  {
    date: '2026-10-01',
    category: 'Economy',
    title: 'Hichilema calls for more predictable fuel pricing as Zambia weighs longer review periods',
    summary: 'President Hakainde Hichilema called for more predictable fuel pricing as Zambia considers extending the price-review period, amid a steep recent fuel increase and pressure on the energy-marketing counters (Trendsnafrica, late Sep 2026).',
    source: 'Trendsnafrica',
    url: 'https://news.google.com/rss/articles/CBMiwgFBVV95cUxPTHU5bDh5ck5BUU1JMDA3SWRzX2FHanY2a2o5RXc1TWFMLTJGbmxBbzE4S1VLMjFYcENDekxMeWRFU2EyMVBWUU9ydzIwUlppMnB5c09LdGZtcG5UX1RfTi1HM0x5TEZMOWdXUUxaTzUzM2Vfc3JOX2R5T2FqbGtUeENUZU9iNHdaSGdCeGZmdTZqTldHQmtxcF9xemxOcld6bXI3Nl9aWFBHcVd3ZmNxTWlTdlQyZ1lCaXFOa0VCdlVFd9IBygFBVV95cUxQaEo4MERTTUNKQk1NdEFMM0lnaWk3SXV2bXV5UEoxYXJqUXpFZmlLOXJiOUIwQmNoRGx2Wll0SkJPUEZYNGx2WXlWYUt5TkRMYTItei1pdDZOdDNtRmE5TUlZRkZuYmlFSnJJUlBWcTFwcG16MWNMc05Ib01LeEFYN1Z2WVhCeGMwc3d2cmRIdmRYSUZoVXRiVDlrUUgtZzF5VTZaM3BPYno5YzlsTllWamprazdFSy1pdDdMTmZFdjZDWjFRMURjbWZB?oc=5',
    tickers: ['PUMA']
  },
  {
    date: '2026-10-01',
    category: 'Economy',
    title: 'Zambia delays reopening main fuel pipeline to open competition until January',
    summary: 'Zambia delayed reopening its main fuel pipeline to open competition until January 2027, keeping the current arrangement in place for now (Pipeline Technology Journal, 29 Sep 2026).',
    source: 'Pipeline Technology Journal',
    url: 'https://news.google.com/rss/articles/CBMisAFBVV95cUxQOHhITWlibGFqS3VJTXhXd2twZ3lZY09yUERXSmpxdHo1ZnpQUkRhYlpPVWd3Q25IVzZWQk5yTzFIc1VtdXpaNnVIMDg2NWZWLUpvQlhyLTJRRDVacmNOZUhfMlJGbmRhdXBuQldPeklzNVNPbVl5U05Ld29mSl9SSngzRTNPcjZOS1FFSXl4MDVQczhNc3JiRGFPS0UtU3JneHh2R2pqV3VfaUNsN05Qdw?oc=5',
    tickers: []
  },
  {
    date: '2026-10-01',
    category: 'Economy',
    title: 'Youth Connekt Zambia Summit 2026 champions youth-led innovation and jobs',
    summary: 'The UNDP-backed Youth Connekt Zambia Summit 2026 highlighted youth-led innovation, green growth and job creation as Zambia pushes inclusive growth alongside its macroeconomic stabilisation (UNDP, 29 Sep 2026).',
    source: 'UNDP',
    url: 'https://news.google.com/rss/articles/CBMi0gFBVV95cUxNcndHN2JCLTA3QW5SMnhvLVpWODNnZHJKRW5SWXdGSTVXTm53VEVmMXpob21MSV9CYnFnZHpZWm4tYmUyZzY1NEExWW9jcG9nT1A1N2s5Zlk2bUpTVmRxQmFYdUNlS29sQWNvR29vYmxRRk5maHg3TkVzaTgwbmN5djVlWHJmUHY5U2F3LXBVZXZlSDlLQWN3dFpRUmNQc0pvSWtsTHl1TlZVRGl1bTNCV0doU2FkcUhYM0hUNmNqX2p4Vm1pc0hUdWN0eE9IWW1HZnc?oc=5',
    tickers: []
  }
];

const existingUrls = new Set(news.map(n => n.url));
const existingTitles = new Set(news.map(n => n.title));
const toAdd = fresh.filter(n => !existingUrls.has(n.url) && !existingTitles.has(n.title));
const merged = [...toAdd, ...news];
fs.writeFileSync(p, JSON.stringify(merged, null, 2));
console.log(`[append-news] added ${toAdd.length}, total ${merged.length}`);
