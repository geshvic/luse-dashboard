const fs = require('fs');
const path = require('path');

const htmlPath = path.join(__dirname, '..', 'public', 'dashboard.html');
let html = fs.readFileSync(htmlPath, 'utf8');

console.log('Starting size:', (html.length/1024).toFixed(1) + 'KB');

// Step 1: Bypass the login gate (keep the HTML but make checkAuth always pass)
// This is what already worked - just ensure checkAuth returns true
const oldAuth = 'function checkAuth() {\n  const session = localStorage.getItem(\'bc_session\');\n  if (session) {\n    try {\n      const { exp } = JSON.parse(atob(session));\n      if (exp > Date.now()) return true;\n    } catch(e) {}\n  }\n  return false;\n}';
const newAuth = 'function checkAuth() {\n  return true; // Login bypassed\n}';
html = html.replace(oldAuth, newAuth);
console.log('Auth bypassed:', html.includes('return true; // Login bypassed'));

// Step 2: Inject screener HTML after SENS section
const sensEnd = 'Source: <a href=\"https://www.luse.co.zm/sens/\" target=\"_blank\" style=\"color:var(--blue);\">LuSE SENS</a> — Regulatory announcements from listed companies</div>\n</div>';
const screenerHtml = `

<!-- ====== STOCK SCREENER ====== -->
<div class="screener-section">
  <h3>🔍 Stock Screener</h3>
  <div class="screener-bar" id="screenerBar">
    <select id="scrSector" onchange="runScreener()">
      <option value="all">All Sectors</option>
    </select>
    <div class="scr-row"><label>PE</label><input type="number" id="scrPeMin" placeholder="Min" style="width:55px" onchange="runScreener()"><span style="font-size:0.55rem;color:var(--muted)">–</span><input type="number" id="scrPeMax" placeholder="Max" style="width:55px" onchange="runScreener()"></div>
    <div class="scr-row"><label>Yield%</label><input type="number" id="scrYieldMin" placeholder="Min" style="width:55px" onchange="runScreener()"><span style="font-size:0.55rem;color:var(--muted)">–</span><input type="number" id="scrYieldMax" placeholder="Max" style="width:55px" onchange="runScreener()"></div>
    <select id="scrMktCap" onchange="runScreener()">
      <option value="all">All Market Caps</option>
      <option value="large">Large (>K10B)</option>
      <option value="mid">Mid (K1B–10B)</option>
      <option value="small">Small (<K1B)</option>
      <option value="micro">Micro (<K100M)</option>
    </select>
    <select id="scrChange" onchange="runScreener()">
      <option value="all">Any Change</option>
      <option value="up">🟢 Gainers Only</option>
      <option value="down">🔴 Losers Only</option>
      <option value="flat">➖ Unchanged</option>
    </select>
    <label><input type="checkbox" id="scrCaution" onchange="runScreener()"> Exclude Cautionaries</label>
    <label><input type="checkbox" id="scrActive" onchange="runScreener()"> Traded Today</label>
    <button class="scr-clear" onclick="clearScreener()">Clear</button>
    <span class="scr-count" id="scrCount"></span>
  </div>
  <div class="screener-table-wrap">
    <table class="screener-table" id="screenerTable"></table>
  </div>
</div>
`;

const sensEndIdx = html.indexOf(sensEnd);
if (sensEndIdx > 0) {
  html = html.slice(0, sensEndIdx + sensEnd.length) + screenerHtml + html.slice(sensEndIdx + sensEnd.length);
  console.log('Screener HTML injected');
} else {
  console.log('❌ Sens end marker not found');
}

// Step 3: Add screener CSS
const newsCssEnd = '.n-source { font-size:0.6rem; color:var(--muted); }';
const screenerCss = `
/* === STOCK SCREENER === */
.screener-section { margin:0 2rem 1rem; }
.screener-section h3 { font-size:0.8rem; color:var(--muted); text-transform:uppercase; letter-spacing:0.5px; margin-bottom:0.5rem; }
.screener-bar { display:flex; gap:0.4rem; flex-wrap:wrap; align-items:center; margin-bottom:0.5rem; padding:0.6rem; background:var(--card); border:1px solid var(--border); border-radius:8px; }
.screener-bar select, .screener-bar input { padding:0.3rem 0.5rem; background:rgba(13,17,23,0.8); border:1px solid var(--border); border-radius:5px; color:var(--text); font-size:0.68rem; font-family:inherit; min-width:80px; }
.screener-bar select:focus, .screener-bar input:focus { outline:none; border-color:var(--blue); }
.screener-bar label { font-size:0.6rem; color:var(--muted); display:flex; align-items:center; gap:0.2rem; white-space:nowrap; }
.screener-bar .scr-row { display:flex; gap:0.3rem; align-items:center; }
.screener-bar .scr-clear { font-size:0.6rem; color:var(--blue); cursor:pointer; background:none; border:none; text-decoration:underline; }
.screener-bar .scr-count { font-size:0.65rem; color:var(--muted); margin-left:auto; }
.screener-table-wrap { overflow-x:auto; background:var(--card); border:1px solid var(--border); border-radius:8px; }
.screener-table { width:100%; border-collapse:collapse; font-size:0.72rem; }
.screener-table th { padding:0.4rem 0.5rem; text-align:left; color:var(--muted); font-weight:500; font-size:0.65rem; border-bottom:1px solid var(--border); cursor:pointer; white-space:nowrap; user-select:none; }
.screener-table th:hover { color:var(--text); }
.screener-table th .sort-arrow { font-size:0.55rem; margin-left:0.15rem; }
.screener-table td { padding:0.35rem 0.5rem; border-bottom:1px solid var(--border); white-space:nowrap; }
.screener-table tr:hover td { background:rgba(31,111,235,0.05); cursor:pointer; }
.screener-table .scr-ticker { color:var(--blue); font-weight:600; }
.screener-table .scr-positive { color:var(--green); }
.screener-table .scr-negative { color:var(--red); }
.screener-table .scr-caution { position:relative; }
.screener-table .scr-caution::after { content:'⚠️'; font-size:0.55rem; margin-left:0.15rem; }
.scr-empty { text-align:center; padding:1.5rem; color:var(--muted); font-size:0.75rem; }`;
html = html.replace(newsCssEnd, newsCssEnd + screenerCss);
console.log('Screener CSS injected');

// Step 4: Add screener JS before renderCalendar (in the script tag)
const calMarker = 'function renderCalendar() {';
const calIdx = html.indexOf(calMarker);
if (calIdx > 0) {
  // Find the start of the line before renderCalendar
  const lineStart = html.lastIndexOf('\n', calIdx - 1) + 1;
  
  const screenerJs = `let screenerSort = { col: 'mktCap', dir: -1 };
let screenerData = [];

function getCautionaryTickers() {
  const sens = allData.sens || [];
  const recent = sens.filter(s => s.type === 'Cautionary' && s.date > '2026-03-01');
  return new Set(recent.flatMap(s => s.tickers));
}

function initScreener() {
  const companies = allData.companies || [];
  const cautions = getCautionaryTickers();
  screenerData = companies.filter(c => c.price > 0).map(c => ({
    ticker: c.ticker, name: c.name || c.ticker, sector: c.sector || 'Other',
    price: c.price, change: c.change || 0, changePct: c.changePct || 0,
    volume: c.volume || 0, marketCap: c.marketCap || 0,
    pe: c.pe || null, yield: c.dividendYield || null,
    caution: cautions.has(c.ticker), traded: (c.volume || 0) > 0
  }));
  const sectors = [...new Set(screenerData.map(s => s.sector))].sort();
  const sel = document.getElementById('scrSector');
  if (sel) sectors.forEach(s => { const opt = document.createElement('option'); opt.value = s; opt.textContent = s; sel.appendChild(opt); });
  runScreener();
}

function runScreener() {
  let items = [...screenerData];
  const sector = document.getElementById('scrSector')?.value;
  if (sector && sector !== 'all') items = items.filter(s => s.sector === sector);
  const peMin = parseFloat(document.getElementById('scrPeMin')?.value);
  const peMax = parseFloat(document.getElementById('scrPeMax')?.value);
  if (!isNaN(peMin)) items = items.filter(s => s.pe !== null && s.pe >= peMin);
  if (!isNaN(peMax)) items = items.filter(s => s.pe !== null && s.pe <= peMax);
  const yMin = parseFloat(document.getElementById('scrYieldMin')?.value);
  const yMax = parseFloat(document.getElementById('scrYieldMax')?.value);
  if (!isNaN(yMin)) items = items.filter(s => s.yield !== null && s.yield >= yMin);
  if (!isNaN(yMax)) items = items.filter(s => s.yield !== null && s.yield <= yMax);
  const mktCap = document.getElementById('scrMktCap')?.value;
  if (mktCap === 'large') items = items.filter(s => s.marketCap >= 10e9);
  else if (mktCap === 'mid') items = items.filter(s => s.marketCap >= 1e9 && s.marketCap < 10e9);
  else if (mktCap === 'small') items = items.filter(s => s.marketCap >= 100e6 && s.marketCap < 1e9);
  else if (mktCap === 'micro') items = items.filter(s => s.marketCap < 100e6);
  const change = document.getElementById('scrChange')?.value;
  if (change === 'up') items = items.filter(s => s.change > 0);
  else if (change === 'down') items = items.filter(s => s.change < 0);
  else if (change === 'flat') items = items.filter(s => s.change === 0);
  if (document.getElementById('scrCaution')?.checked) items = items.filter(s => !s.caution);
  if (document.getElementById('scrActive')?.checked) items = items.filter(s => s.traded);
  const col = screenerSort.col, dir = screenerSort.dir;
  items.sort((a, b) => { let va = a[col], vb = b[col]; if (va === null || va === undefined) va = dir > 0 ? Infinity : -Infinity; if (vb === null || vb === undefined) vb = dir > 0 ? Infinity : -Infinity; if (typeof va === 'string') return dir * va.localeCompare(vb); return dir * (va - vb); });
  document.getElementById('scrCount').textContent = items.length + ' of ' + screenerData.length;
  if (items.length === 0) { document.getElementById('screenerTable').innerHTML = '<div class=\"scr-empty\">No stocks match your filters</div>'; return; }
  const fmtMktCap = (v) => { if (!v) return '—'; if (v >= 1e12) return 'K' + (v/1e12).toFixed(2) + 'T'; if (v >= 1e9) return 'K' + (v/1e9).toFixed(2) + 'B'; if (v >= 1e6) return 'K' + (v/1e6).toFixed(0) + 'M'; return 'K' + v.toLocaleString(); };
  const sortArrow = (c) => screenerSort.col === c ? (screenerSort.dir > 0 ? ' ▴' : ' ▾') : '';
  let t = '<tr><th onclick=\"sortScreener(\\'ticker\\')\">Ticker' + sortArrow('ticker') + '</th><th onclick=\"sortScreener(\\'sector\\')\">Sector' + sortArrow('sector') + '</th><th onclick=\"sortScreener(\\'price\\')\" style=\"text-align:right\">Price' + sortArrow('price') + '</th><th onclick=\"sortScreener(\\'changePct\\')\" style=\"text-align:right\">Chg%' + sortArrow('changePct') + '</th><th onclick=\"sortScreener(\\'volume\\')\" style=\"text-align:right\">Vol' + sortArrow('volume') + '</th><th onclick=\"sortScreener(\\'marketCap\\')\" style=\"text-align:right\">Mkt Cap' + sortArrow('marketCap') + '</th><th onclick=\"sortScreener(\\'pe\\')\" style=\"text-align:right\">PE' + sortArrow('pe') + '</th><th onclick=\"sortScreener(\\'yield\\')\" style=\"text-align:right\">Yield%' + sortArrow('yield') + '</th></tr>';
  items.forEach(s => { const chgCls = s.change > 0 ? 'scr-positive' : s.change < 0 ? 'scr-negative' : ''; const cauCls = s.caution ? ' scr-caution' : ''; const pe = s.pe ? s.pe.toFixed(1) : '—'; const yld = s.yield ? s.yield.toFixed(1) + '%' : '—'; const vol = s.volume ? s.volume.toLocaleString() : '—'; const chg = s.changePct ? (s.changePct > 0 ? '+' : '') + s.changePct.toFixed(2) + '%' : '0.00%'; t += '<tr onclick=\"showProfile(\\'' + s.ticker + '\\')\"><td><span class=\"scr-ticker' + cauCls + '\">' + s.ticker + '</span></td><td style=\"font-size:0.65rem;color:var(--muted)\">' + s.sector + '</td><td style=\"text-align:right\">K' + s.price.toFixed(2) + '</td><td class=\"' + chgCls + '\" style=\"text-align:right\">' + chg + '</td><td style=\"text-align:right;font-size:0.65rem;color:var(--muted)\">' + vol + '</td><td style=\"text-align:right;font-size:0.65rem\">' + fmtMktCap(s.marketCap) + '</td><td style=\"text-align:right\">' + pe + '</td><td style=\"text-align:right\">' + yld + '</td></tr>'; });
  document.getElementById('screenerTable').innerHTML = t;
}

function sortScreener(col) { if (screenerSort.col === col) screenerSort.dir *= -1; else { screenerSort.col = col; screenerSort.dir = -1; } runScreener(); }

function clearScreener() {
  ['scrSector','scrMktCap','scrChange'].forEach(id => { const el = document.getElementById(id); if (el) el.value = 'all'; });
  ['scrPeMin','scrPeMax','scrYieldMin','scrYieldMax'].forEach(id => { const el = document.getElementById(id); if (el) el.value = ''; });
  ['scrCaution','scrActive'].forEach(id => { const el = document.getElementById(id); if (el) el.checked = false; });
  runScreener();
}

`;
  html = html.slice(0, lineStart) + screenerJs + html.slice(lineStart);
  console.log('Screener JS injected before renderCalendar');
} else {
  console.log('❌ renderCalendar not found');
}

// Step 5: Add initScreener() call in load() function
const renderSensCall = 'renderSens();\n    render();';
html = html.replace(renderSensCall, 'renderSens();\n    initScreener();\n    render();');
console.log('initScreener in load():', html.includes('initScreener();\n    render()'));

// Final verification
const scriptStart = html.indexOf('<script>');
const scriptEnd = html.indexOf('</script>', scriptStart);
const script = html.slice(scriptStart + 8, scriptEnd);

try {
  new Function(script);
  console.log('✅ Script parses without syntax errors!');
} catch(e) {
  console.log('❌ Syntax error:', e.message);
  console.log('Position:', e.message.match(/at position (\d+)/)?.[1]);
}

fs.writeFileSync(htmlPath, html);
console.log('Final size:', (fs.statSync(htmlPath).size/1024).toFixed(1) + 'KB');
