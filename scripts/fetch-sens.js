/**
 * fetch-sens.js — scrapes LuSE SENS announcements via Playwright
 * 
 * Categories: General Announcements, Financial Statements, Dividends,
 *   Change in Directorate, Cautionary, Annual Reports, AGM/EGM
 * 
 * Each category page shows ~5 items. Runs daily to capture new postings.
 * Deep history scrape can be run separately with more pages.
 */
const { chromium } = require('playwright-core');
const fs = require('fs');
const path = require('path');

const DATA_DIR = path.join(__dirname, '..', 'data');
const TODAY = new Date().toISOString().split('T')[0];

function saveJSON(filename, data) {
  fs.writeFileSync(path.join(DATA_DIR, filename), JSON.stringify(data, null, 2), 'utf8');
}

// Category config
const CATEGORIES = [
  { name: 'General Announcements', slug: 'general-announcements', tag: 'Corporate' },
  { name: 'Financial Statements', slug: 'financial-statements', tag: 'Earnings' },
  { name: 'Dividends', slug: 'dividends', tag: 'Dividends' },
  { name: 'Change in Directorate', slug: 'change-in-directorate', tag: 'Directorate' },
  { name: 'Cautionary Announcement', slug: 'cautionary-announcement', tag: 'Cautionary' },
  { name: 'Annual Reports', slug: 'annual-reports', tag: 'Reports' },
  { name: 'AGM/EGM', slug: 'annual-and-extraordinary-general-meeting', tag: 'AGM' },
];

// Known ticker patterns
const TICKER_PATTERN = /\b(AECI|ATEL|BATA|BATZ|CCAF|CECZ|CHIL|DCZM|FARM|INDO|KLRE|LUSW|MAFS|NATB|PRIM|PUMA|REIZ|RFIN|SCBL|SHOP|ZABR|ZCCM(?:\s*IH)?|ZFCO|ZMBF|ZMFA|ZMRE|ZNCO|ZSUG|ENRG)\b/gi;

// Map ticker variations to canonical
const TICKER_MAP = {
  'ZCCM IH': 'ZCCM-IH', 'ZCCM': 'ZCCM-IH',
  'CEC': 'CECZ', 'CEC RENEWABLES': 'CCAF',
  'BATA ZAMBIA': 'BATA', 'ZAMBIA SUGAR': 'ZSUG',
  'REIZ': 'REIZ', 'CECA': 'CCAF',
  'ZANACO': 'ZNCO', 'NATB': 'NATB'
};

function extractTickers(text) {
  const found = new Set();
  const upper = text.toUpperCase();
  for (const [variant, canonical] of Object.entries(TICKER_MAP)) {
    if (upper.includes(variant)) found.add(canonical);
  }
  // Also use regex
  const matches = text.match(TICKER_PATTERN) || [];
  matches.forEach(m => {
    const cleaned = m.replace(/\s+/g, '-').replace(/-+$/, '');
    found.add(TICKER_MAP[cleaned] || cleaned);
  });
  return [...found];
}

function classifyAnnouncement(title) {
  const t = title.toUpperCase();
  if (t.includes('TRADING STATEMENT') || t.includes('EARNINGS') || t.includes('FY20') || t.includes('RESULTS')) return 'Earnings';
  if (t.includes('DIVIDEND')) return 'Dividends';
  if (t.includes('DIRECTORATE') || t.includes('DIRECTOR') || t.includes('APPOINTMENT') || t.includes('RESIGNATION')) return 'Directorate';
  if (t.includes('CAUTIONARY')) return 'Cautionary';
  if (t.includes('AGM') || t.includes('EGM') || t.includes('GENERAL MEETING') || t.includes('ANNUAL GENERAL')) return 'AGM';
  if (t.includes('ANNUAL REPORT')) return 'Annual Report';
  if (t.includes('LISTING') || t.includes('IPO') || t.includes('ADMISSION')) return 'IPO';
  if (t.includes('TRANSACTION') || t.includes('ACQUISITION') || t.includes('MERGER')) return 'M&A';
  return 'General';
}

function parseDate(dateStr) {
  if (!dateStr) return TODAY;
  // "5 June, 2026" or "27 May, 2026"
  const months = { jan:1,feb:2,mar:3,apr:4,may:5,jun:6,jul:7,aug:8,sep:9,oct:10,nov:11,dec:12 };
  const m = dateStr.match(/(\d{1,2})\s+(Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)[a-z]*[,]*\s*(\d{4})/i);
  if (m) {
    const day = m[1].padStart(2, '0');
    const mon = String(months[m[2].toLowerCase()]).padStart(2, '0');
    return `${m[3]}-${mon}-${day}`;
  }
  return TODAY;
}

async function scrapeCategory(browser, cat, maxPages = 1) {
  const allItems = [];
  
  for (let pageNum = 1; pageNum <= maxPages; pageNum++) {
    const ctx = await browser.newContext({
      userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/125.0.0.0 Safari/537.36',
      viewport: { width: 1920, height: 1080 },
      locale: 'en-US'
    });
    const page = await ctx.newPage();
    await page.addInitScript(() => {
      Object.defineProperty(navigator, 'webdriver', { get: () => false });
      Object.defineProperty(navigator, 'plugins', { get: () => [1,2,3,4,5] });
      window.chrome = { runtime: {} };
    });

    try {
      const url = pageNum === 1 
        ? `https://www.luse.co.zm/sens-category/${cat.slug}/`
        : `https://www.luse.co.zm/sens-category/${cat.slug}/page/${pageNum}/`;
      
      console.log(`  [${cat.name}] Page ${pageNum}...`);
      await page.goto(url, { waitUntil: 'networkidle', timeout: 45000 });
      await page.waitForTimeout(2000);
      
      const title = await page.title();
      if (title.includes('security') || title.includes('Just a moment')) {
        console.log(`  ⚠️ Cloudflare block on page ${pageNum}`);
        await ctx.close();
        break;
      }

      const bodyText = await page.evaluate(() => document.body.innerText);
      const lines = bodyText.split('\n').map(l => l.trim()).filter(Boolean);

      // Parse announcements: TICKER – TITLE, DOWNLOAD, date
      let pageItems = 0;
      for (let i = 0; i < lines.length - 2; i++) {
        if (lines[i + 1] === 'DOWNLOAD' && lines[i].match(/^[A-Z]{2,6}[\s–\-]/)) {
          const titleLine = lines[i];
          const dateStr = lines[i + 2];
          const tickers = extractTickers(titleLine);
          const type = classifyAnnouncement(titleLine);
          const date = parseDate(dateStr);

          allItems.push({
            title: titleLine,
            date,
            category: cat.name,
            type,
            tickers,
            source: 'LuSE SENS',
            url: `https://www.luse.co.zm/sens-category/${cat.slug}/`
          });
          pageItems++;
          i += 2;
        }
      }
      console.log(`    ${pageItems} items`);
      
      // Check if there's a next page
      if (pageItems === 0 || pageNum >= maxPages) break;
      
      const hasNext = await page.evaluate(() => {
        const next = document.querySelector('a.next, .next.page-numbers');
        return !!next;
      });
      if (!hasNext) break;

    } catch(e) {
      console.log(`  ⚠️ Error: ${e.message}`);
      break;
    } finally {
      await ctx.close();
    }

    // Delay between pages to avoid rate limiting
    if (pageNum < maxPages) await new Promise(r => setTimeout(r, 3000));
  }

  return allItems;
}

async function main() {
  console.log(`\n📋 LuSE SENS Scraper — ${TODAY}\n`);
  
  const browser = await chromium.launch({
    headless: true,
    args: [
      '--no-sandbox', '--disable-gpu', '--disable-dev-shm-usage',
      '--disable-blink-features=AutomationControlled',
      '--disable-features=IsolateOrigins,site-per-process',
      '--disable-site-isolation-trials'
    ]
  });

  let allAnnouncements = [];

  for (const cat of CATEGORIES) {
    const items = await scrapeCategory(browser, cat, 1);
    allAnnouncements = allAnnouncements.concat(items);
    // Delay between categories
    await new Promise(r => setTimeout(r, 2000));
  }

  await browser.close();

  // Deduplicate by title
  const seen = new Set();
  const unique = [];
  for (const a of allAnnouncements) {
    const key = a.title.toLowerCase().slice(0, 60);
    if (seen.has(key)) continue;
    seen.add(key);
    unique.push(a);
  }

  // Sort by date descending
  unique.sort((a, b) => b.date.localeCompare(a.date));

  console.log(`\n📊 Total: ${allAnnouncements.length} raw, ${unique.length} unique across ${CATEGORIES.length} categories`);

  // Merge with existing sens.json (keep only last 200)
  const sensPath = path.join(DATA_DIR, 'sens.json');
  let existing = [];
  try { existing = JSON.parse(fs.readFileSync(sensPath, 'utf8')); } catch(e) {}

  const existingKeys = new Set(existing.map(e => e.title?.toLowerCase().slice(0, 60)));
  const newItems = unique.filter(a => !existingKeys.has(a.title.toLowerCase().slice(0, 60)));
  
  const merged = [...newItems, ...existing].slice(0, 200);
  saveJSON('sens.json', merged);
  
  console.log(`💾 Saved: ${merged.length} total (${newItems.length} new)`);
  
  // Print summary
  const summary = {};
  for (const a of merged) {
    summary[a.type] = (summary[a.type] || 0) + 1;
  }
  console.log('\nBy type:', JSON.stringify(summary));
  console.log('Latest 5:');
  merged.slice(0, 5).forEach(a => console.log(`  [${a.date}] [${a.type}] ${a.title.slice(0, 80)}`));

  console.log('\n✅ SENS scrape complete\n');
}

main().catch(e => { console.error(e); process.exit(1); });
