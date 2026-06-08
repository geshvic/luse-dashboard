/**
 * Inject SENS section into dashboard.html
 */
const fs = require('fs');
const path = require('path');

const htmlPath = path.join(__dirname, '..', 'public', 'dashboard.html');
let html = fs.readFileSync(htmlPath, 'utf8');

// 1. Add SENS CSS after news CSS block
const newsCssEnd = '.n-source { font-size:0.6rem; color:var(--muted); }';
const sensCss = `
/* === SENS ANNOUNCEMENTS === */
.sens-section { margin:0 2rem 1rem; }
.sens-section h3 { font-size:0.8rem; color:var(--muted); text-transform:uppercase; letter-spacing:0.5px; margin-bottom:0.5rem; }
.sens-filters { display:flex; gap:0.4rem; margin-bottom:0.6rem; flex-wrap:wrap; }
.sens-list { display:grid; grid-template-columns:repeat(auto-fill,minmax(280px,1fr)); gap:0.35rem; }
.sens-item { background:var(--card); border:1px solid var(--border); border-radius:8px; padding:0.55rem 0.7rem; border-left:3px solid var(--blue); }
.sens-item.type-Cautionary { border-left-color:var(--red); }
.sens-item.type-Dividends { border-left-color:var(--green); }
.sens-item.type-Earnings { border-left-color:var(--gold); }
.sens-item.type-Directorate { border-left-color:#bc8cff; }
.sens-item.type-AGM { border-left-color:#ffa500; }
.sens-item:hover { border-color:var(--blue); background:rgba(31,111,235,0.03); }
.s-date { font-size:0.58rem; color:var(--muted); margin-bottom:0.15rem; display:flex; align-items:center; gap:0.3rem; }
.s-type { font-size:0.52rem; font-weight:700; text-transform:uppercase; padding:0.05rem 0.25rem; border-radius:2px; }
.s-type-Earnings { background:rgba(210,153,29,0.15); color:var(--gold); }
.s-type-Dividends { background:rgba(63,185,80,0.15); color:var(--green); }
.s-type-Directorate { background:rgba(188,140,255,0.15); color:#bc8cff; }
.s-type-Cautionary { background:rgba(248,81,73,0.15); color:var(--red); }
.s-type-AGM { background:rgba(255,165,0,0.15); color:#ffa500; }
.s-type-Annual_Report,.s-type-Reports { background:rgba(139,148,158,0.15); color:var(--muted); }
.s-type-General,.s-type-MnA { background:rgba(88,166,255,0.15); color:var(--blue); }
.s-title { font-size:0.72rem; font-weight:600; margin-bottom:0.15rem; color:var(--text); line-height:1.3; }
.s-tickers { margin-top:0.2rem; }
.s-ticker { display:inline-block; font-size:0.55rem; color:var(--gold); background:rgba(210,153,29,0.1); padding:0.02rem 0.25rem; border-radius:2px; margin-right:0.15rem; }
.s-cat { font-size:0.55rem; color:var(--muted); }`;

html = html.replace(newsCssEnd, newsCssEnd + sensCss);

// 2. Add SENS HTML section after news section
const newsSectionEnd = '<div class="news-list" id="newsList"></div>\n</div>';
const sensHtml = `
<!-- ====== SENS ANNOUNCEMENTS ====== -->
<div class="sens-section">
  <h3>📋 SENS Announcements</h3>
  <div class="sens-filters">
    <button class="btn btn-sm active" onclick="filterSens('all',this)">All</button>
    <button class="btn btn-sm btn-outline" onclick="filterSens('Earnings',this)">📊 Earnings</button>
    <button class="btn btn-sm btn-outline" onclick="filterSens('Dividends',this)">💵 Dividends</button>
    <button class="btn btn-sm btn-outline" onclick="filterSens('Directorate',this)">👤 Directorate</button>
    <button class="btn btn-sm btn-outline" onclick="filterSens('Cautionary',this)">⚠️ Cautionary</button>
    <button class="btn btn-sm btn-outline" onclick="filterSens('AGM',this)">📅 AGM/EGM</button>
  </div>
  <div class="sens-list" id="sensList"></div>
  <div class="note" style="margin-top:0.5rem;">Source: <a href="https://www.luse.co.zm/sens/" target="_blank" style="color:var(--blue);">LuSE SENS</a> · Regulatory announcements from listed companies</div>
</div>`;

html = html.replace(newsSectionEnd, newsSectionEnd + sensHtml);

// 3. Add SENS data initialization (after newsData init)
const newsDataInit = "newsData = allData.news || [];\n    renderTicker(newsData);";
const sensInit = "\n    sensData = allData.sens || [];\n    renderSens();";
html = html.replace(newsDataInit, newsDataInit + sensInit);

// 4. Add sensData variable declaration
html = html.replace('let newsData = [], newsFilter', 'let newsData = [], sensData = [], sensFilter = \'all\', newsFilter');

// 5. Add renderSens function before renderBottom
const renderBottomFn = 'function renderBottom() {';
const renderSensFn = `function renderSens() {
  let items = sensData;
  if (sensFilter !== 'all') items = items.filter(s => s.type === sensFilter);
  document.getElementById('sensList').innerHTML = items.slice(0, 24).map(s => {
    const typeClass = s.type.replace(/[^a-zA-Z0-9]/g, '_');
    return '<div class="sens-item type-' + typeClass + '">' +
      '<div class="s-date">' + s.date + '<span class="s-type s-type-' + typeClass + '">' + s.type + '</span></div>' +
      '<div class="s-title">' + s.title + '</div>' +
      '<div class="s-cat">' + s.category + '</div>' +
      (s.tickers?.length ? '<div class="s-tickers">' + s.tickers.map(t => '<span class="s-ticker">#' + t + '</span>').join('') + '</div>' : '') +
      '</div>';
  }).join('');
}

function filterSens(type, btn) {
  document.querySelectorAll('.sens-filters .btn-sm').forEach(b => b.classList.remove('active'));
  btn.classList.add('active');
  sensFilter = type;
  renderSens();
}

`;

html = html.replace(renderBottomFn, renderSensFn + renderBottomFn);

// 6. Call renderSens() in the main init
html = html.replace("renderNews();\n  renderAnalysis", "renderNews();\n  renderSens();\n  renderAnalysis");

// 7. Handle SENS data loading from CDN fallback
const newsFallback = "if (!newsData.length) {\n      newsData = await r.json();\n    }\n    renderTicker(newsData);";
const sensFallback = "\n    if (!sensData.length) {\n      const sr = await fetch('data/sens.json');\n      if (sr.ok) sensData = await sr.json();\n    }\n    renderSens();";
html = html.replace(newsFallback, newsFallback + sensFallback);

fs.writeFileSync(htmlPath, html);
console.log('✅ SENS section injected into dashboard.html');
console.log('Filesize:', (fs.statSync(htmlPath).size / 1024).toFixed(1) + 'KB');
