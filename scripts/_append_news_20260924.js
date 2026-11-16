const fs = require('fs');
const path = require('path');
const p = path.join(__dirname, '..', 'data', 'news.json');
const news = JSON.parse(fs.readFileSync(p, 'utf8'));

// Newest first. Dates below are the items' publication dates.
const newItems = [
  {
    date: '2026-09-23', category: 'Economy',
    title: "UN Zambia Prosperity Pillar showcases results for livelihoods, jobs and economic opportunities",
    summary: "The FAO/UN in Zambia showcased results from its Prosperity Pillar work (23 September 2026), highlighting programmes aimed at transforming livelihoods, creating jobs and widening economic opportunities as the country's macroeconomic stabilisation advances.",
    source: 'FAO', url: 'https://news.google.com/rss/articles/CBMi4gFBVV95cUxPX2pKTjRJaUwwbzBRaGJDUEw3WWlHYUh6YVV3ZUtNT0FUWTZPaWp6QS1aTzBBY0xjWkRHYnJoRmpiWmNHRHBuRXN0RExCT19rOTBaNE1DajdUZXNFWWlxeC0zbmZkcVd5T25adTAxQzRKeGhQTnNrZ0pHVTh2QzdKdWFscHBKVEV1dUJVeWZiVUtWTm9odnpkdUx2eDVEcWFic2pXMG10Wm5yc1RWdk5yRVZCSWpUR1lqQUdDeXNiVlRacE9jRXA4SEF5SjZ4ZnRMa1VGN2RMTGFZaWhkTW9QeGZR?oc=5', tickers: []
  },
  {
    date: '2026-09-20', category: 'Corporate',
    title: "Airtel Networks Zambia reports H1 2026 earnings",
    summary: "Airtel Networks Zambia Plc reported results for the half year ended 30 June 2026 (MarketScreener, 20 September 2026), as the counter continues its post-results holding pattern near K224 after the 17 Sep trading statement flagged roughly 82% H1 EPS growth.",
    source: 'MarketScreener', url: 'https://news.google.com/rss/articles/CBMi2AFBVV95cUxNUXM3cUxZaFNaWWRhUXVVck5FNVNXZm9FbjZYajBDVzhWaUxrdXZsSzV5MzNFLURUbjdqUVRqN1RhQ01kbUMtaTNCSnVKN0JUT1hfaGYybW13MFNOd1BqODdrSExWTmNwMXIwVnpOUE0xckhoSFNFd2VRakFBUllpV2tTb2NQWm9LWkhzZUVXOVVjT2xqZV9lS24wZVlJcXJqLWxNSFEySm11T3EweFBsdVdKSnU3ME9yRFNBdlN6a0Y1Q3Q3dkVoanRzS1ZZU1NiVFZIc1ZSNkE?oc=5', tickers: ['ATEL']
  },
  {
    date: '2026-09-18', category: 'Energy',
    title: "Zambia's open-access electricity market: a reform for power security",
    summary: "Analysis (SolarQuarter, 18 September 2026) examined Zambia's open-access electricity market reforms as a route to power security, easing the generation deficit and widening access for private producers and large industrial users such as the mines.",
    source: 'SolarQuarter', url: 'https://news.google.com/rss/articles/CBMixwFBVV95cUxPdHBZSXB5X3NmSGwwRzhKUHhSNmdHdnAzd3l5RGlscjEtSUZtX0wzZDZ4ZWFsbkVYWVRYWDVaNFNTU3NUa0VlVWFLNDJ3czhrMExFTW5FU3ZPVzYtZlNRYkhHQ3kzck5lQXlrV1lFMXZwQ293cWFZWWNQVDFpQW1QelA4ZGdkQS1Lak9ycUI5NWk5RGdqXzZzTzdzR05zUzQxbGhDSWJwbVVQUS1yOFgwdEtJc2Zabjd4b09ralJpV3owd2RobXhN?oc=5', tickers: ['CECZ']
  },
  {
    date: '2026-09-16', category: 'Energy',
    title: "EnerSynk signs 500 MW solar PPA with ZESCO",
    summary: "EnerSynk signed a 500 MW solar power purchase agreement with ZESCO, boosting Zambia's energy diversification drive and adding to the country's fast-growing private renewables pipeline (Green Building Africa, 16 September 2026).",
    source: 'Green Building Africa', url: 'https://news.google.com/rss/articles/CBMixAFBVV95cUxNQzBjcW83V3JHaXB3ZFk3UG1ZTXZtV3RTUnltR3hEVnNzQUJjSy10WXFoUjJMaUl5TkJPUTlfY19JWW55VHMzWDJfZnFLdU1MMGlQdVFwdFQ2dC1KYVowYjJPMHhrZkU5dnJKTFBiSXFfSFlCTG9kYVhtYlpxYno4RUoxUGtCLVVrQWFUM2djdFNHSHZnR1hUWktjM2NjX2pBQ3Jodi1aQmY5d2gtcnVpSDA1d2lYUGNONmVoMC1fNmNaUVZj?oc=5', tickers: ['CECZ']
  },
  {
    date: '2026-09-14', category: 'Corporate',
    title: "ZCCM-IH: final dividend notice (SENS, 11 September 2026)",
    summary: "ZCCM Investments Holdings published a final dividend notice via SENS dated 11 September 2026, the state investment arm's latest corporate action as its earnings remain weighed by Mopani and KCM.",
    source: 'ActusNews', url: 'https://news.google.com/rss/articles/CBMiogFBVV95cUxQUTRnbGlReHo0Y1pjeXBDcktMajNoay1sT3hsT0cwR0c2WnBrMk1sS0p6VEs4Y25zZ3U4UTNSOW9Gb050QVFaVWVpZElYWTJCS3c2TUt1MDRTYlBLY0w0Wks4VWNrSVE0bWxrY1FXMXpqblQtdVFmTkdMX0hnZnhFa19ucGNuN1JiUk1odW1XTVFpYWV6Nm9jYzRIUE9xeVZMMFHSAacBQVVfeXFMTmJFVHVJaDFMWlgxem13Q016MkdpczJNN04xeXpUaHdvUEdwUGdCdU9IWG5uMDN3bXZPV2VrbGZULTJ4RUdFeTdwdzZmOU9uZWpkWjljNzNBWnJLN3N0WVlpRHIwY3UtSUM3YnBfWldZMkJIa29JYW5QMzFuUHRubHZfbWZjWjNKUnFvczFnYmZpeDVZNHExOWE2c3NTS3IzcnFwYkZWc0E?oc=5', tickers: ['ZCCM-IH']
  },
  {
    date: '2026-09-01', category: 'Mining',
    title: "Zambia eyes US$1.8 billion in small-scale gold mining push",
    summary: "Bloomberg reported (1 September 2026) that Zambia is targeting US$1.8 billion from a small-scale gold mining push, part of efforts to formalise artisanal output and broaden mining-sector earnings beyond copper.",
    source: 'Bloomberg', url: 'https://news.google.com/rss/articles/CBMiuAFBVV95cUxPWlBDY3BwSFZ5Q0JhT1gtMlVRTVp1TnpkX0FvZ1V5eG5mVUNEaGljQjY1Rm4tYXFLZ0hBRHJiX25fc2xYRUVVdFhvOXlBcVY1aXd6TVBaNndzT2o5U1kxM1c4U0xWTUtXXzVxQmN2NnZBcWFhbHB0dm9YZGs4LW9UX1p6emJWcEZ2ZUYzTkItem5DVWtPcVZXenZCU0Y5WjZmOFk2MnlZTi0zR2FyMHh5N0JSZFdJT3Rr?oc=5', tickers: []
  }
];

const existing = new Set(news.map(n => n.title));
const toAdd = newItems.filter(i => !existing.has(i.title));
const merged = [...toAdd, ...news];
// cap at 90 to keep the file bounded
const capped = merged.slice(0, 90);

fs.writeFileSync(p, JSON.stringify(capped, null, 2), 'utf8');
console.log('Added ' + toAdd.length + ' new items. Total: ' + capped.length);
