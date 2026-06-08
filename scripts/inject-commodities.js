const fs = require('fs');
const path = require('path');

const htmlPath = path.join(__dirname, '..', 'public', 'dashboard.html');
let html = fs.readFileSync(htmlPath, 'utf8');

// 1. Add commodity CSS after currency CSS
const currencyCssEnd = '.currency-trend strong { color:var(--gold); }';
const commodityCss = `
/* === COMMODITY TRACKER === */
.commodity-row { margin-top:0.5rem; padding-top:0.4rem; border-top:1px solid var(--border); }
.commodity-grid { display:grid; grid-template-columns:repeat(2,1fr); gap:0.3rem; }
.commodity-item { background:rgba(31,111,235,0.04); border-radius:5px; padding:0.3rem 0.4rem; }
.commodity-item .cm-icon { font-size:0.85rem; }
.commodity-item .cm-name { font-size:0.5rem; color:var(--muted); font-weight:600; }
.commodity-item .cm-price { font-size:0.75rem; font-weight:700; color:var(--text); }
.commodity-item .cm-zmw { font-size:0.5rem; color:var(--muted); }
.commodity-item .cm-move { font-size:0.5rem; font-weight:600; }`;
html = html.replace(currencyCssEnd, currencyCssEnd + commodityCss);

// 2. Modify renderCurrency to also render commodities after the trend line
const trendLine = "document.getElementById('currency').innerHTML = `<div class=\"currency-card\">` + header + `<div class=\"currency-grid\">` + items + `</div>` + trend;";
const newTrendLine = "document.getElementById('currency').innerHTML = `<div class=\"currency-card\">` + header + `<div class=\"currency-grid\">` + items + `</div>` + trend + renderCommodities();";

if (html.includes(trendLine)) {
  html = html.replace(trendLine, newTrendLine);
  console.log('Commodity render hooked into currency card');
} else {
  console.log('❌ Trend line not found, trying alternative...');
  // Try to find the end of renderCurrency
}

// 3. Add renderCommodities function (before renderHero)
const renderHeroFn = 'function renderHero() {';
const commodityFn = `function renderCommodities() {
  const comms = allData.commodities;
  if (!comms || !comms.length) return '';
  const fmtPrice = (v, u) => {
    if (u.includes('USD')) return '$' + v.toLocaleString();
    return 'K' + v.toLocaleString();
  };
  let r = '<div class=\"commodity-row\"><div class=\"commodity-grid\">';
  comms.forEach(c => {
    const cls = c.changePct > 0 ? 'up' : c.changePct < 0 ? 'down' : '';
    const arrow = c.changePct > 0 ? '▲' : c.changePct < 0 ? '▼' : '—';
    r += '<div class=\"commodity-item\"><span class=\"cm-icon\">' + c.icon + '</span> <span class=\"cm-name\">' + c.name + '</span><br><span class=\"cm-price\">' + fmtPrice(c.price, c.unit) + '</span><br><span class=\"cm-zmw\">' + (c.zmwValue ? 'K' + c.zmwValue.toLocaleString() : '') + '</span><br><span class=\"cm-move ' + cls + '\">' + arrow + ' ' + Math.abs(c.changePct).toFixed(1) + '%</span></div>';
  });
  r += '</div><div style=\"font-size:0.52rem;color:var(--muted);margin-top:0.3rem;line-height:1.3\">';
  comms.forEach(c => r += '<strong>' + c.name + '</strong>: ' + c.note + ' &middot; ');
  r += '</div></div>';
  return r;
}

`;
html = html.replace(renderHeroFn, commodityFn + renderHeroFn);

// 4. Add commodities to build-static.js and allData
const buildPath = path.join(__dirname, '..', 'scripts', 'build-static.js');
let buildJs = fs.readFileSync(buildPath, 'utf8');
if (!buildJs.includes('commodities.json')) {
  buildJs = buildJs.replace("const calendar = readJSON('calendar.json');", 
    "const commodities = readJSON('commodities.json');\nconst calendar = readJSON('calendar.json');");
  buildJs = buildJs.replace("const all = { market, bonds, stocks, companies, currency, marketClose, news, sens, calendar };",
    "const all = { market, bonds, stocks, companies, currency, marketClose, news, sens, calendar, commodities };");
  buildJs = buildJs.replace("'market-close.json','sens.json','calendar.json'",
    "'market-close.json','sens.json','calendar.json','commodities.json'");
  fs.writeFileSync(buildPath, buildJs);
  console.log('Commodities wired into build pipeline');
}

// Verify
const s = html.slice(html.indexOf('<script>')+8, html.indexOf('</script>'));
try { new Function(s); console.log('✅ Script OK'); } catch(e) { console.log('❌', e.message.slice(0,80)); }
console.log('Has commodity CSS:', html.includes('commodity-grid'));
console.log('Has renderCommodities:', html.includes('renderCommodities'));

fs.writeFileSync(htmlPath, html);
console.log('Size:', (fs.statSync(htmlPath).size/1024).toFixed(1)+'KB');
