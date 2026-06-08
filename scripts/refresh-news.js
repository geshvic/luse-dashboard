/**
 * refresh-news.js — multi-source news scraper for Baobab Capital
 * Scrapes: luse.co.zm, zambianbusinesstimes.com, mastmediazm.com,
 *          mwebantu.com, Bloomberg, Reuters + search engine news
 * Runs daily at midnight CT via cron
 */
const { execSync } = require('child_process');
const path = require('path');
const fs = require('fs');

const ROOT = path.join(__dirname, '..');
const SCRIPTS = path.join(ROOT, 'scripts');
const DATA = path.join(ROOT, 'data');
const WORKSPACE = 'C:\\Users\\MUSUK\\.openclaw\\workspace';
const SEARCH_TOOL = path.join(WORKSPACE, 'search-tool.js');

function todayStr() {
  return new Date().toISOString().split('T')[0];
}

function run(cmd, opts = {}) {
  try {
    const out = execSync(cmd, { 
      cwd: ROOT, encoding: 'utf8', timeout: opts.timeout || 60000, 
      maxBuffer: 10 * 1024 * 1024 
    });
    return out;
  } catch (e) {
    console.error(`[FAIL] ${e.message.slice(0, 200)}`);
    return '';
  }
}

// Sources and their search queries
const SOURCES = [
  { name: 'Zambian Business Times', query: 'site:zambianbusinesstimes.com Zambia economy business 2026', cat: 'Corporate' },
  { name: 'Mast Media Zambia', query: 'site:mastmediazm.com LuSE stock exchange Zambia', cat: 'Market' },
  { name: 'Mwebantu', query: 'site:mwebantu.com Zambia business economy finance', cat: 'Macro' },
  { name: 'Bloomberg', query: 'Zambia copper mining kwacha economy Bloomberg', cat: 'Commodities' },
  { name: 'Reuters', query: 'Zambia economy debt restructuring mining Reuters', cat: 'Macro' },
  { name: 'LuSE Official', query: 'site:luse.co.zm market news announcement 2026', cat: 'Market' },
];

function extractTickers(text) {
  const tickers = ['AECI','ATEL','BATA','BATZ','CECZ','CHIL','DCZM','KLRE','NATB','PUMA',
    'SCBL','SHOP','ZABR','ZCCM','ZFCO','ZMBF','ZMFA','ZMRE','ZNCO','ZSUG','MAFS','RFIN',
    'ENRG','INDO','LUSW','PRIM','CCAF','FARM','REIZ'];
  const found = [];
  const upper = text.toUpperCase();
  for (const t of tickers) {
    if (upper.includes(t)) found.push(t);
  }
  return found;
}

async function main() {
  const today = todayStr();
  console.log(`\n📰 Baobab Capital — Multi-Source News Scrape ${today}\n`);

  let allArticles = [];
  const seenUrls = new Set();

  // Scrape each source
  for (const src of SOURCES) {
    console.log(`🔍 Searching: ${src.name}...`);
    
    const raw = run(`node "${SEARCH_TOOL}" "${src.query}" 5`, { timeout: 90000 });
    if (!raw) { console.log(`   ⚠️ No results`); continue; }

    try {
      // Extract JSON from search output
      const jsonMatch = raw.match(/\[[\s\S]*\]/);
      if (!jsonMatch) continue;
      const results = JSON.parse(jsonMatch[0]);
      
      for (const r of results) {
        // Normalize URL
        let url = r.url || '';
        // Clean redirect URLs
        const urlMatch = url.match(/uddg=([^&]+)/);
        if (urlMatch) url = decodeURIComponent(urlMatch[1]);
        const bingMatch = url.match(/u=a1aHR0[^&]+/);
        if (bingMatch) {
          try { url = Buffer.from(bingMatch[0].replace('u=',''), 'base64').toString('utf8'); } catch {}
        }

        const normUrl = url.replace(/^https?:\/\/(www\.)?/, '').toLowerCase().split('?')[0];
        if (seenUrls.has(normUrl)) continue;
        seenUrls.add(normUrl);

        const dateMatch = (r.snippet || '').match(/(\d{1,2}\s+(Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)\s+\d{4})/i);
        const category = src.cat;
        const tickers = extractTickers((r.title||'') + ' ' + (r.snippet||''));

        allArticles.push({
          date: dateMatch ? dateMatch[1] : today,
          category,
          title: (r.title || 'Untitled').trim(),
          summary: (r.snippet || '').trim().slice(0, 250),
          source: src.name,
          url: url || '',
          tickers
        });
      }
      console.log(`   ✅ ${results.length} articles`);
    } catch (e) {
      console.log(`   ⚠️ Parse error: ${e.message}`);
    }
  }

  // Deduplicate by title similarity
  const unique = [];
  const seen = new Set();
  for (const a of allArticles) {
    const key = a.title.toLowerCase().slice(0, 40);
    if (seen.has(key)) continue;
    seen.add(key);
    unique.push(a);
  }
  unique.sort((a, b) => b.date.localeCompare(a.date));

  console.log(`\n📊 Total: ${unique.length} unique articles from ${SOURCES.length} sources`);

  // Save to news.json
  const newsPath = path.join(DATA, 'news.json');
  const existing = JSON.parse(fs.readFileSync(newsPath, 'utf8'));
  const existingUrls = new Set(existing.map(n => n.url));
  
  // Merge: keep existing that aren't in new batch, prepend new
  const oldArticles = existing.filter(n => !seenUrls.has(n.url?.replace(/^https?:\/\/(www\.)?/, '').toLowerCase()?.split('?')[0]));
  const merged = [...unique, ...oldArticles].slice(0, 60); // Keep last 60

  fs.writeFileSync(newsPath, JSON.stringify(merged, null, 2));
  console.log(`💾 Saved ${merged.length} articles to news.json`);

  // Build + deploy
  console.log('\n🔨 Building static files...');
  run(`node "${path.join(SCRIPTS, 'build-static.js')}"`);
  
  console.log('📤 Deploying...');
  run('git add data/news.json public/data/news.json data/all.json public/data/all.json');
  
  const commitMsg = `news: multi-source refresh ${today} (${unique.length} articles)`;
  const commitOut = run(`git commit -m "${commitMsg}"`);
  
  if (commitOut.includes('nothing to commit')) {
    console.log('📭 No new articles — nothing to deploy');
  } else {
    const pushOut = run('git push');
    if (pushOut.includes('master -> master')) {
      console.log(`\n✅ News deployed! ${unique.length} new articles\n`);
    }
  }
}

main().catch(e => { console.error(e); process.exit(1); });
