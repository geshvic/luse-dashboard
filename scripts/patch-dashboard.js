const fs = require('fs');
const path = 'C:/Users/MUSUK/.openclaw/workspace/luse-dashboard/public/dashboard.html';
let html = fs.readFileSync(path, 'utf8');

// Add heatmap CSS
const heatmapCSS = `
/* === HEATMAP === */
.heatmap-section { margin:0 2rem 1rem; }
.heatmap-section h3 { font-size:0.8rem; color:var(--muted); text-transform:uppercase; letter-spacing:0.5px; margin-bottom:0.5rem; }
.heatmap-legend { display:flex; gap:1rem; align-items:center; font-size:0.65rem; color:var(--muted); margin-bottom:0.5rem; }
.heatmap-gradient { width:120px; height:10px; border-radius:5px; background:linear-gradient(to right, #f85149, #f0883e, #d2991d, #7ee787, #3fb950); }
.heatmap-wrap { background:var(--card); border:1px solid var(--border); border-radius:8px; padding:0; overflow:hidden; }
.heatmap-wrap canvas { display:block; width:100% !important; height:340px !important; }

/* === NEWS === */
.news-section { margin:0 2rem 1rem; }
.news-section h3 { font-size:0.8rem; color:var(--muted); text-transform:uppercase; letter-spacing:0.5px; margin-bottom:0.5rem; }
.news-filters { display:flex; gap:0.35rem; margin-bottom:0.75rem; }
.news-list { display:grid; grid-template-columns:repeat(auto-fill, minmax(340px, 1fr)); gap:0.5rem; }
.news-item { background:var(--card); border:1px solid var(--border); border-radius:8px; padding:0.75rem 1rem; cursor:pointer; transition:border-color 0.2s; }
.news-item:hover { border-color:var(--accent); }
.news-item .n-date { font-size:0.6rem; color:var(--muted); }
.news-item .n-cat { display:inline-block; padding:0.1rem 0.4rem; border-radius:3px; font-size:0.58rem; font-weight:600; margin-left:0.5rem; }
.n-cat-Market { background:rgba(88,166,255,0.15); color:var(--blue); }
.n-cat-Macro { background:rgba(210,153,29,0.15); color:var(--gold); }
.n-cat-Economy { background:rgba(63,185,80,0.15); color:var(--green); }
.n-cat-IPO { background:rgba(210,153,29,0.2); color:var(--gold); }
.n-cat-Corporate { background:rgba(139,148,158,0.15); color:var(--muted); }
.n-cat-Commodities { background:rgba(248,81,73,0.12); color:var(--red); }
.n-cat-Mining { background:rgba(248,81,73,0.12); color:var(--red); }
.n-cat-Finance { background:rgba(88,166,255,0.15); color:var(--blue); }
.n-cat-Energy { background:rgba(63,185,80,0.15); color:var(--green); }
.news-item .n-title { font-size:0.78rem; font-weight:600; margin:0.3rem 0; }
.news-item .n-sum { font-size:0.7rem; color:var(--muted); line-height:1.4; }
.news-item .n-source { font-size:0.6rem; color:var(--muted); margin-top:0.4rem; }
.news-item .n-ticker { display:inline-block; background:rgba(31,111,235,0.15); color:var(--accent); padding:0.1rem 0.3rem; border-radius:3px; font-size:0.58rem; margin:0 0.15rem; }
`;

html = html.replace('/* === RISK FLAGS ===', heatmapCSS + '\n/* === RISK FLAGS ===');

// Insert heatmap + news HTML after the risk-flags div
const insertHTML = `
<!-- ====== HEATMAP ====== -->
<div class="heatmap-section">
  <h3>🔥 Market Heatmap — Sized by Market Cap, Colored by % Change</h3>
  <div class="heatmap-legend">
    <span style="color:#f85149;">▼ Losers</span>
    <div class="heatmap-gradient"></div>
    <span style="color:#3fb950;">▲ Gainers</span>
    <span style="margin-left:1rem;">Rectangle size = Market Cap</span>
  </div>
  <div class="heatmap-wrap"><canvas id="heatmapCanvas"></canvas></div>
</div>

<!-- ====== NEWS ====== -->
<div class="news-section">
  <h3>📰 Market News</h3>
  <div class="news-filters">
    <button class="btn btn-sm active" onclick="filterNews('all',this)">All</button>
    <button class="btn btn-sm btn-outline" onclick="filterNews('Market',this)">Market</button>
    <button class="btn btn-sm btn-outline" onclick="filterNews('Macro',this)">Macro</button>
    <button class="btn btn-sm btn-outline" onclick="filterNews('Corporate',this)">Corporate</button>
    <button class="btn btn-sm btn-outline" onclick="filterNews('IPO',this)">IPO</button>
    <button class="btn btn-sm btn-outline" onclick="filterNews('Commodities',this)">Commodities</button>
  </div>
  <div class="news-list" id="newsList"></div>
</div>
`;

html = html.replace('<div class="risk-flags" id="risks"></div>', '<div class="risk-flags" id="risks"></div>\n' + insertHTML);

// Add renderHeatmap and renderNews functions to the render() call
html = html.replace('function render() {\n  renderHero(); renderAnalysis(); renderRisks(); renderTracker(); renderBottom();', 
  'function render() {\n  renderHero(); renderAnalysis(); renderRisks(); renderHeatmap(); renderNews(); renderTracker(); renderBottom();');

// Add the heatmap rendering function before renderBottom
const heatmapJS = `
// ====== HEATMAP ======
function renderHeatmap() {
  const companies = allData.companies || [];
  if (!companies.length) return;
  
  // Filter to companies with valid price data, sort by market cap
  const list = companies.filter(c => c.marketCap && c.price > 0).sort((a,b) => b.marketCap - a.marketCap);
  if (!list.length) return;
  
  const canvas = document.getElementById('heatmapCanvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  
  // Layout: squarified treemap algorithm (simplified)
  const W = 900, H = 340;
  canvas.width = W; canvas.height = H;
  
  const totalCap = list.reduce((s,c) => s + c.marketCap, 0);
  
  // Simple grid layout: rows of varying heights based on market cap
  let x = 0, y = 0, rowHeight = 0, rowCap = 0, rowItems = [];
  const targetRowRatio = W / H;
  
  function drawRow(row, rY, rH) {
    const rowTotal = row.reduce((s,c) => s + c.marketCap, 0);
    let rX = 0;
    row.forEach(c => {
      const w = Math.max(40, (c.marketCap / rowTotal) * W);
      // Color: red for negative, green for positive
      const pct = c.changePct || 0;
      let color;
      if (pct >= 0.5) color = '#3fb950';
      else if (pct >= 0) color = '#7ee787';
      else if (pct >= -0.5) color = '#f0883e';
      else color = '#f85149';
      
      const alpha = Math.min(0.9, 0.3 + Math.abs(pct) * 0.8);
      ctx.fillStyle = color + Math.round(alpha * 255).toString(16).padStart(2,'0');
      ctx.fillRect(rX, rY, w-2, rH-2);
      
      // Ticker label
      if (w > 50 && rH > 18) {
        ctx.fillStyle = '#c9d1d9';
        ctx.font = 'bold ' + Math.min(11, rH/2.5) + 'px -apple-system, sans-serif';
        ctx.fillText(c.ticker, rX + 4, rY + rH/2 + 4);
        
        if (w > 80) {
          ctx.fillStyle = '#8b949e';
          ctx.font = Math.min(9, rH/3.5) + 'px -apple-system, sans-serif';
          const chgStr = (pct >= 0 ? '+' : '') + pct.toFixed(1) + '%';
          ctx.fillText(chgStr, rX + w - ctx.measureText(chgStr).width - 8, rY + rH/2 + 4);
        }
      }
      rX += w;
    });
  }
  
  // Simple grid: 5 columns, sorted by market cap, fill rows
  const cols = 5;
  const rows = Math.ceil(list.length / cols);
  const cw = W / cols;
  const ch = H / rows;
  
  list.forEach((c, i) => {
    const col = i % cols;
    const row = Math.floor(i / cols);
    const sx = col * cw;
    const sy = row * ch;
    const pct = c.changePct || 0;
    let color;
    if (pct >= 0.5) color = '#3fb950';
    else if (pct >= 0) color = '#7ee787';
    else if (pct >= -0.5) color = '#f0883e';
    else color = '#f85149';
    
    const alpha = Math.min(0.85, 0.25 + Math.abs(pct) * 0.9);
    ctx.fillStyle = color + Math.round(alpha * 255).toString(16).padStart(2,'0');
    ctx.fillRect(sx+1, sy+1, cw-3, ch-3);
    
    if (ch > 20) {
      ctx.fillStyle = '#c9d1d9';
      ctx.font = 'bold 10px -apple-system, sans-serif';
      ctx.fillText(c.ticker, sx+6, sy+ch/2+1);
      
      ctx.fillStyle = '#8b949e';
      ctx.font = '8px -apple-system, sans-serif';
      const chgStr = (pct >= 0 ? '+' : '') + pct.toFixed(1) + '%';
      ctx.textAlign = 'right';
      ctx.fillText(chgStr, sx+cw-8, sy+ch/2+1);
      ctx.textAlign = 'left';
    }
  });
}

// ====== NEWS ======
let newsData = [], newsFilter = 'all';

async function loadNews() {
  try {
    const r = await fetch('/api/news');
    newsData = await r.json();
    renderNews();
  } catch(e) {}
}

function filterNews(cat, btn) {
  newsFilter = cat;
  document.querySelectorAll('.news-filters .btn-sm').forEach(b => b.classList.remove('active'));
  btn.classList.add('active');
  renderNews();
}

function renderNews() {
  let items = newsData;
  if (newsFilter !== 'all') items = items.filter(n => n.category === newsFilter);
  document.getElementById('newsList').innerHTML = items.map(n => 
    '<div class="news-item"><div class="n-date">' + n.date + '<span class="n-cat n-cat-' + n.category + '">' + n.category + '</span></div>' +
    '<div class="n-title">' + n.title + '</div>' +
    '<div class="n-sum">' + n.summary + (n.tickers?.length ? ' ' + n.tickers.map(t => '<span class="n-ticker">' + t + '</span>').join('') : '') + '</div>' +
    '<div class="n-source">' + n.source + '</div></div>'
  ).join('');
}
`;

// Insert before renderBottom
html = html.replace('function renderBottom() {', heatmapJS + '\nfunction renderBottom() {');

// Add news load to the load() function
html = html.replace('function load() {\n  try {\n    const r = await fetch(\'/api/all\');\n    allData = await r.json();\n    render();', 
  'function load() {\n  try {\n    const r = await fetch(\'/api/all\');\n    allData = await r.json();\n    loadNews();\n    render();');

fs.writeFileSync(path, html);
console.log('Dashboard patched with heatmap + news sections');
console.log('New size:', html.length, 'bytes');
