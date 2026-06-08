/**
 * build-static.js — Builds static data files for GitHub Pages deployment
 * Combines all JSON data sources into the public/ directory
 */
const fs = require('fs');
const path = require('path');

const ROOT = path.join(__dirname, '..');
const DATA_SRC = path.join(ROOT, 'data');
const PUBLIC = path.join(ROOT, 'public');
const DATA_DST = path.join(PUBLIC, 'data');
const PROFILE_DST = path.join(DATA_DST, 'profiles');

console.log('[build-static] Building static data files...');

// Create output directories
fs.mkdirSync(DATA_DST, { recursive: true });
fs.mkdirSync(PROFILE_DST, { recursive: true });

// Read source files
const readJSON = (filename) => {
  const p = path.join(DATA_SRC, filename);
  if (fs.existsSync(p)) return JSON.parse(fs.readFileSync(p, 'utf8'));
  return {};
};

const market = readJSON('market-summary.json');
const bonds = readJSON('bond-market.json');
const stocks = readJSON('stocks.json');
const companies = readJSON('companies.json');
const currency = readJSON('currency-data.json');
const news = readJSON('news.json');
const sens = readJSON('sens.json');
let marketClose = {};
try { marketClose = readJSON('market-close.json'); } catch(e) {}

// Build combined all.json (matches /api/all response)
const all = { market, bonds, stocks, companies, currency, marketClose, news, sens };
fs.writeFileSync(path.join(DATA_DST, 'all.json'), JSON.stringify(all));
console.log('[build-static] ✓ data/all.json');

// Copy individual data files
for (const f of ['market-summary.json','bond-market.json','stocks.json','companies.json','currency-data.json','news.json','market-close.json','sens.json']) {
  const src = path.join(DATA_SRC, f);
  if (fs.existsSync(src)) {
    fs.copyFileSync(src, path.join(DATA_DST, f));
    console.log(`[build-static] ✓ data/${f}`);
  }
}

// Copy company profiles
const profilesDir = path.join(DATA_SRC, 'profiles');
if (fs.existsSync(profilesDir)) {
  const profileFiles = fs.readdirSync(profilesDir).filter(f => f.endsWith('.json'));
  for (const f of profileFiles) {
    fs.copyFileSync(path.join(profilesDir, f), path.join(PROFILE_DST, f));
  }
  console.log(`[build-static] ✓ data/profiles/ (${profileFiles.length} files)`);
}

// Copy history snapshots
const historyDir = path.join(DATA_SRC, 'history');
const historyDst = path.join(DATA_DST, 'history');
if (fs.existsSync(historyDir)) {
  fs.cpSync(historyDir, historyDst, { recursive: true });
  console.log('[build-static] ✓ data/history/');
}

// Also write all.json to root data/ for GitHub Pages
fs.writeFileSync(path.join(DATA_SRC, 'all.json'), JSON.stringify(all));
console.log('[build-static] ✓ data/all.json (root)');

// Create index.html at repo root for GitHub Pages
const dashboardPath = path.join(PUBLIC, 'dashboard.html');
const rootIndexPath = path.join(ROOT, 'index.html');
if (fs.existsSync(dashboardPath)) {
  fs.copyFileSync(dashboardPath, rootIndexPath);
  console.log('[build-static] ✓ index.html (root)');
}

// Copy logo to root for GitHub Pages
const logoPath = path.join(PUBLIC, 'logo.png');
if (fs.existsSync(logoPath)) {
  fs.copyFileSync(logoPath, path.join(ROOT, 'logo.png'));
  console.log('[build-static] ✓ logo.png (root)');
}

console.log('[build-static] ✅ Build complete — ready for GitHub Pages');
