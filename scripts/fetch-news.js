/**
 * fetch-news.js — multi-source news scraper for Baobab Capital (v2)
 *
 * Portable replacement for refresh-news.js: uses Google News RSS feeds,
 * so it runs anywhere (GitHub Actions, Linux, Windows) with no API keys
 * and no OpenClaw search-tool dependency.
 *
 * Sources: Zambian Business Times, Mast Media, Mwebantu, LuSE official,
 *          plus general Zambia economy/business coverage (Reuters, Bloomberg, etc.)
 */
const fs = require('fs');
const path = require('path');
const https = require('https');

const DATA = path.join(__dirname, '..', 'data');

function todayStr() {
  return new Date().toISOString().split('T')[0];
}

// Google News RSS queries (when:14d keeps results fresh)
const SOURCES = [
  { name: 'Zambian Business Times', query: 'site:zambianbusinesstimes.com when:14d', cat: 'Corporate' },
  { name: 'Mast Media Zambia',      query: 'site:mastmediazm.com LuSE OR stock OR economy when:14d', cat: 'Market' },
  { name: 'Mwebantu',               query: 'site:mwebantu.com business OR economy OR kwacha OR mining when:14d', cat: 'Macro' },
  { name: 'LuSE Official',          query: 'site:luse.co.zm when:30d', cat: 'Market' },
  { name: 'Reuters/Bloomberg',      query: 'Zambia economy OR kwacha OR copper when:7d', cat: 'Macro' },
  { name: 'LuSE General',           query: '"Lusaka Stock Exchange" OR LuSE when:14d', cat: 'Market' },
];

function fetchText(url, redirects = 0) {
  return new Promise((resolve) => {
    const req = https.get(url, {
      headers: { 'User-Agent': 'Mozilla/5.0 (compatible; BaobabCapitalBot/1.0)' },
      timeout: 30000,
    }, (res) => {
      if (res.statusCode >= 300 && res.statusCode < 400 && res.headers.location && redirects < 3) {
        res.resume();
        return resolve(fetchText(res.headers.location, redirects + 1));
      }
      if (res.statusCode !== 200) { res.resume(); return resolve(''); }
      let body = '';
      res.setEncoding('utf8');
      res.on('data', (c) => { body += c; });
      res.on('end', () => resolve(body));
    });
    req.on('timeout', () => { req.destroy(); resolve(''); });
    req.on('error', () => resolve(''));
  });
}

function decodeEntities(s) {
  return (s || '')
    .replace(/&amp;/g, '&').replace(/&lt;/g, '<').replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"').replace(/&#39;|&apos;/g, "'")
    .replace(/<[^>]+>/g, '').trim();
}

function parseRSS(xml) {
  const items = [];
  const itemRe = /<item>([\s\S]*?)<\/item>/g;
  let m;
  while ((m = itemRe.exec(xml)) !== null) {
    const block = m[1];
    const get = (tag) => {
      const t = block.match(new RegExp(`<${tag}[^>]*>([\\s\\S]*?)</${tag}>`));
      return t ? decodeEntities(t[1].replace(/<!\[CDATA\[|\]\]>/g, '')) : '';
    };
    const title = get('title');
    const link = get('link');
    const pubDate = get('pubDate');
    const source = get('source');
    const description = get('description');
    if (title && link) items.push({ title, link, pubDate, source, description });
  }
  return items;
}

const TICKERS = ['AECI','ATEL','BATA','BATZ','CECZ','CHIL','DCZM','KLRE','NATB','PUMA',
  'SCBL','SHOP','ZABR','ZCCM','ZFCO','ZMBF','ZMFA','ZMRE','ZNCO','ZSUG','MAFS','RFIN',
  'ENRG','INDO','LUSW','PRIM','CCAF','FARM','REIZ'];

function extractTickers(text) {
  const found = [];
  const upper = (text || '').toUpperCase();
  for (const t of TICKERS) if (upper.includes(t)) found.push(t);
  return found;
}

function isoDate(pubDate) {
  const d = new Date(pubDate);
  return isNaN(d) ? todayStr() : d.toISOString().split('T')[0];
}

async function main() {
  const today = todayStr();
  console.log(`\n📰 Baobab Capital — News Scrape (RSS) ${today}\n`);

  const allArticles = [];
  const seenUrls = new Set();

  for (const src of SOURCES) {
    console.log(`🔍 ${src.name}...`);
    const rss = `https://news.google.com/rss/search?q=${encodeURIComponent(src.query)}&hl=en-US&gl=US&ceid=US:en`;
    const xml = await fetchText(rss);
    if (!xml) { console.log('   ⚠️ Fetch failed'); continue; }

    const items = parseRSS(xml).slice(0, 10);
    let added = 0;
    for (const it of items) {
      const normUrl = it.link.replace(/^https?:\/\/(www\.)?/, '').toLowerCase().split('?')[0];
      if (seenUrls.has(normUrl)) continue;
      seenUrls.add(normUrl);
      allArticles.push({
        date: isoDate(it.pubDate),
        category: src.cat,
        title: it.title.slice(0, 200),
        summary: (it.description || it.title).slice(0, 250),
        source: it.source || src.name,
        url: it.link,
        tickers: extractTickers(it.title + ' ' + it.description),
      });
      added++;
    }
    console.log(`   ✅ ${added} articles`);
  }

  // Dedup by title prefix
  const unique = [];
  const seenTitles = new Set();
  for (const a of allArticles) {
    const key = a.title.toLowerCase().slice(0, 40);
    if (seenTitles.has(key)) continue;
    seenTitles.add(key);
    unique.push(a);
  }
  unique.sort((a, b) => b.date.localeCompare(a.date));

  console.log(`\n📊 ${unique.length} unique articles this run`);

  // Merge with existing, keep last 60
  const newsPath = path.join(DATA, 'news.json');
  const existing = fs.existsSync(newsPath) ? JSON.parse(fs.readFileSync(newsPath, 'utf8')) : [];
  const newUrls = new Set(unique.map(a => a.url));
  const oldArticles = existing.filter(n => !newUrls.has(n.url));
  const merged = [...unique, ...oldArticles].slice(0, 60);

  fs.writeFileSync(newsPath, JSON.stringify(merged, null, 2));
  console.log(`💾 Saved ${merged.length} articles to news.json`);
}

main().catch(e => { console.error(e); process.exit(1); });
