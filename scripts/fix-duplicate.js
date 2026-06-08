const fs = require('fs');
const path = require('path');

const htmlPath = path.join(__dirname, '..', 'public', 'dashboard.html');
let html = fs.readFileSync(htmlPath, 'utf8');

// Find ALL occurrences of "let screenerSort" and remove the duplicate block
// The screener code appears between "let screenerSort" and "function renderCalendar()"
// We need to keep exactly ONE copy

const screenerStart = 'let screenerSort';
const screenerEnd = 'function renderCalendar()';

// Find all positions of screenerStart
const occurrences = [];
let pos = -1;
while ((pos = html.indexOf(screenerStart, pos + 1)) !== -1) {
  occurrences.push(pos);
}
console.log('screenerSort declarations:', occurrences.length);

if (occurrences.length > 1) {
  // Remove all copies of screener JS except the first one
  // Each copy ends at "function renderCalendar()"
  // We'll remove everything from the second occurrence to just before renderCalendar
  
  // Actually, simpler: remove ALL screener JS, then we re-inject one copy
  const firstDecl = occurrences[0];
  const lastDeclEnd = html.indexOf(screenerEnd, occurrences[occurrences.length - 1]);
  
  // Find the start of the screener block (the comment before let screenerSort)
  const blockStart = html.lastIndexOf('\n', firstDecl - 30);
  
  // Remove from block start to renderCalendar
  const beforeCal = html.indexOf(screenerEnd, lastDeclEnd - 100);
  html = html.slice(0, blockStart + 1) + '\n' + html.slice(beforeCal);
  console.log('✅ Removed all screener JS duplicates');
}

// Now we only have renderCalendar, no screener JS
// Re-inject one clean copy before renderCalendar
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
    ticker: c.ticker,
    name: c.name || c.ticker,
    sector: c.sector || 'Other',
    price: c.price,
    change: c.change || 0,
    changePct: c.changePct || 0,
    volume: c.volume || 0,
    marketCap: c.marketCap || 0,
    pe: c.pe || null,
    yield: c.dividendYield || null,
    caution: cautions.has(c.ticker),
    traded: (c.volume || 0) > 0
  }));
  
  // Populate sector dropdown
  const sectors = [...new Set(screenerData.map(s => s.sector))].sort();
  const sel = document.getElementById('scrSector');
  if (sel) {
    sectors.forEach(s => {
      const opt = document.createElement('option');
      opt.value = s; opt.textContent = s;
      sel.appendChild(opt);
    });
  }
  
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
  
  // Sort
  const col = screenerSort.col;
  const dir = screenerSort.dir;
  items.sort((a, b) => {
    let va = a[col], vb = b[col];
    if (va === null || va === undefined) va = dir > 0 ? Infinity : -Infinity;
    if (vb === null || vb === undefined) vb = dir > 0 ? Infinity : -Infinity;
    if (typeof va === 'string') return dir * va.localeCompare(vb);
    return dir * (va - vb);
  });
  
  document.getElementById('scrCount').textContent = items.length + ' of ' + screenerData.length;
  
  if (items.length === 0) {
    document.getElementById('screenerTable').innerHTML = '<div class=\"scr-empty\">No stocks match your filters</div>';
    return;
  }
  
  const fmtMktCap = (v) => {
    if (!v) return '—';
    if (v >= 1e12) return 'K' + (v/1e12).toFixed(2) + 'T';
    if (v >= 1e9) return 'K' + (v/1e9).toFixed(2) + 'B';
    if (v >= 1e6) return 'K' + (v/1e6).toFixed(0) + 'M';
    return 'K' + v.toLocaleString();
  };
  
  const sortArrow = (c) => screenerSort.col === c ? (screenerSort.dir > 0 ? ' ▴' : ' ▾') : '';
  
  let t = '<tr>' +
    '<th onclick=\"sortScreener(' + \"'ticker'\" + ')\">Ticker' + sortArrow('ticker') + '</th>' +
    '<th onclick=\"sortScreener(' + \"'sector'\" + ')\">Sector' + sortArrow('sector') + '</th>' +
    '<th onclick=\"sortScreener(' + \"'price'\" + ')\" style=\"text-align:right\">Price' + sortArrow('price') + '</th>' +
    '<th onclick=\"sortScreener(' + \"'changePct'\" + ')\" style=\"text-align:right\">Chg%' + sortArrow('changePct') + '</th>' +
    '<th onclick=\"sortScreener(' + \"'volume'\" + ')\" style=\"text-align:right\">Vol' + sortArrow('volume') + '</th>' +
    '<th onclick=\"sortScreener(' + \"'marketCap'\" + ')\" style=\"text-align:right\">Mkt Cap' + sortArrow('marketCap') + '</th>' +
    '<th onclick=\"sortScreener(' + \"'pe'\" + ')\" style=\"text-align:right\">PE' + sortArrow('pe') + '</th>' +
    '<th onclick=\"sortScreener(' + \"'yield'\" + ')\" style=\"text-align:right\">Yield%' + sortArrow('yield') + '</th>' +
    '</tr>';
  
  items.forEach(s => {
    const chgCls = s.change > 0 ? 'scr-positive' : s.change < 0 ? 'scr-negative' : '';
    const cauCls = s.caution ? ' scr-caution' : '';
    const pe = s.pe ? s.pe.toFixed(1) : '—';
    const yld = s.yield ? s.yield.toFixed(1) + '%' : '—';
    const vol = s.volume ? s.volume.toLocaleString() : '—';
    const chg = s.changePct ? (s.changePct > 0 ? '+' : '') + s.changePct.toFixed(2) + '%' : '0.00%';
    
    t += '<tr onclick=\"showProfile(' + \"'\" + s.ticker + \"'\" + ')\">' +
      '<td><span class=\"scr-ticker' + cauCls + '\">' + s.ticker + '</span></td>' +
      '<td style=\"font-size:0.65rem;color:var(--muted)\">' + s.sector + '</td>' +
      '<td style=\"text-align:right\">K' + s.price.toFixed(2) + '</td>' +
      '<td class=\"' + chgCls + '\" style=\"text-align:right\">' + chg + '</td>' +
      '<td style=\"text-align:right;font-size:0.65rem;color:var(--muted)\">' + vol + '</td>' +
      '<td style=\"text-align:right;font-size:0.65rem\">' + fmtMktCap(s.marketCap) + '</td>' +
      '<td style=\"text-align:right\">' + pe + '</td>' +
      '<td style=\"text-align:right\">' + yld + '</td>' +
      '</tr>';
  });
  
  document.getElementById('screenerTable').innerHTML = t;
}

function sortScreener(col) {
  if (screenerSort.col === col) screenerSort.dir *= -1;
  else { screenerSort.col = col; screenerSort.dir = -1; }
  runScreener();
}

function clearScreener() {
  ['scrSector','scrMktCap','scrChange'].forEach(id => {
    const el = document.getElementById(id); if (el) el.value = 'all';
  });
  ['scrPeMin','scrPeMax','scrYieldMin','scrYieldMax'].forEach(id => {
    const el = document.getElementById(id); if (el) el.value = '';
  });
  ['scrCaution','scrActive'].forEach(id => {
    const el = document.getElementById(id); if (el) el.checked = false;
  });
  runScreener();
}

`;

const calMarker = 'function renderCalendar() {';
const calIdx = html.indexOf(calMarker);
if (calIdx > 0) {
  html = html.slice(0, calIdx) + screenerJs + html.slice(calIdx);
  console.log('✅ Re-injected one clean screener JS copy');
}

// Verify
const screenerCount = [...html.matchAll(/let screenerSort/g)].length;
console.log('screenerSort declarations:', screenerCount);
if (screenerCount !== 1) {
  console.log('❌ Still have', screenerCount, 'declarations!');
} else {
  console.log('✅ Exactly 1 declaration — no duplicate');
  fs.writeFileSync(htmlPath, html);
  console.log('Size:', (fs.statSync(htmlPath).size/1024).toFixed(1)+'KB');
}
