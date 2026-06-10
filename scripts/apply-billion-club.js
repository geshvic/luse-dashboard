const fs = require('fs');
const f = 'C:/Users/MUSUK/.openclaw/workspace/luse-dashboard/index.html';

// Restore clean
const { execSync } = require('child_process');
execSync('git checkout adb3196 -- index.html', { cwd: 'C:/Users/MUSUK/.openclaw/workspace/luse-dashboard' });
let c = fs.readFileSync(f, 'utf8');

// ── STEP 1: CSS before </style> ──
const styleEnd = '</style>';
const cssBlock = `
/* === BILLION DOLLAR CLUB === */
.billion-club { padding:0.85rem 1rem; }
.billion-club h3 { font-size:0.7rem; color:var(--gold); text-transform:uppercase; letter-spacing:0.5px; margin-bottom:0.6rem; display:flex; align-items:center; gap:0.4rem; }
.billion-club h3 .icon { font-size:0.85rem; }
.bc-bar-wrap { display:flex; flex-direction:column; gap:3px; margin-bottom:0.5rem; }
.bc-row { display:flex; align-items:center; gap:0.4rem; font-size:0.62rem; }
.bc-row .bc-ticker { font-weight:700; color:var(--blue); cursor:pointer; min-width:50px; font-size:0.6rem; }
.bc-row .bc-ticker:hover { color:var(--accent); }
.bc-row .bc-sect { color:var(--muted); font-size:0.52rem; min-width:56px; white-space:nowrap; overflow:hidden; text-overflow:ellipsis; }
.bc-row .bc-bar-bg { flex:1; height:7px; background:rgba(255,255,255,0.05); border-radius:3px; overflow:hidden; position:relative; }
.bc-row .bc-bar-fill { height:100%; border-radius:3px; background:linear-gradient(90deg, var(--gold), #e8b730); transition:width 1s; }
.bc-row .bc-cap { font-weight:600; min-width:42px; text-align:right; font-size:0.6rem; color:var(--gold); }
.bc-divider { height:1px; background:var(--border); margin:0.5rem 0; opacity:0.5; }
.bc-aspiring-header { font-size:0.58rem; color:var(--muted); text-transform:uppercase; letter-spacing:0.4px; margin-bottom:0.4rem; }
.bc-aspiring-row { display:flex; justify-content:space-between; align-items:center; font-size:0.6rem; padding:0.15rem 0; }
.bc-aspiring-row .bc-ticker-sm { font-weight:700; color:var(--blue); cursor:pointer; font-size:0.58rem; }
.bc-aspiring-row .bc-cap-sm { color:var(--muted); font-size:0.55rem; }
.bc-threshold { display:flex; justify-content:space-between; align-items:center; margin-bottom:0.4rem; }
.bc-threshold .thresh-bar { flex:1; height:3px; background:rgba(255,255,255,0.06); border-radius:1px; overflow:hidden; margin:0 0.5rem; }
.bc-threshold .thresh-fill { height:100%; background:rgba(210,153,29,0.4); border-radius:1px; }
.bc-threshold span { font-size:0.5rem; color:var(--muted); }
`;
c = c.replace(styleEnd, cssBlock + '\r\n' + styleEnd);
console.log('1/4 CSS done. Size:', Math.round(c.length/1024), 'KB');

// ── STEP 2: HTML element ──
const oldHtml = '<div class="hero-card" id="heroMarketClose"></div>\r\n    <div class="left-movers" id="leftMovers">';
const newHtml = '<div class="hero-card" id="heroMarketClose"></div>\r\n    <div class="hero-card billion-club" id="billionClub"></div>\r\n    <div class="left-movers" id="leftMovers">';
c = c.replace(oldHtml, newHtml);
console.log('2/4 HTML done. Size:', Math.round(c.length/1024), 'KB');

// ── STEP 3: render() call ──
const oldRender = '  renderCurrency(); renderHero(); renderHeroChart(); renderMoversStrip(); renderCalendar();';
const newRender = '  renderCurrency(); renderHero(); renderBillionClub(); renderHeroChart(); renderMoversStrip(); renderCalendar();';
c = c.replace(oldRender, newRender);
console.log('3/4 render() done. Size:', Math.round(c.length/1024), 'KB');

// ── STEP 4: renderBillionClub function — USE INDEX, not replace! ──
const funcStart = c.indexOf('function renderMoversStrip() {');
if (funcStart < 0) {
  console.log('ERROR: renderMoversStrip not found!');
  process.exit(1);
}

const billionFunc = [
'',
'function renderBillionClub() {',
'  const cos = allData.companies || [];',
'  const rate = (allData.currency?.rates?.USD?.mid) || 17.71;',
'  const billion = cos.filter(c => c.marketCap && c.marketCap/rate >= 1e9).sort((a,b) => b.marketCap - a.marketCap);',
'  const aspiring = cos.filter(c => c.marketCap && c.marketCap/rate >= 5e8 && c.marketCap/rate < 1e9).sort((a,b) => b.marketCap - a.marketCap);',
'  const totalCap = billion.reduce((s,c) => s + (c.marketCap||0)/rate, 0);',
'  const maxUsdCap = billion.length ? billion[0].marketCap/rate : 1e9;',
"  let h = '<h3><span class=\"icon\">💰</span> Billion Dollar Club <span style=\"font-size:0.55rem;color:var(--muted);font-weight:400;text-transform:none;margin-left:auto;\">$' + (totalCap/1e9).toFixed(1) + 'B combined</span></h3>';",
"  h += '<div class=\"bc-bar-wrap\">';",
'  billion.slice(0,8).forEach(function(c) {',
'    const pct = Math.max(3, (((c.marketCap||0)/rate) / maxUsdCap) * 100);',
'    const usdCap = (c.marketCap||0)/rate;',
"    const capStr = usdCap >= 1000 ? '$' + (usdCap/1e3).toFixed(1) + 'B' : usdCap >= 1 ? '$' + usdCap.toFixed(2) + 'B' : '$' + (usdCap*1000).toFixed(0) + 'M';",
"    h += '<div class=\"bc-row\"><span class=\"bc-ticker\" onclick=\"showStockModal(\\'' + c.ticker + '\\')\">' + c.ticker + '</span><span class=\"bc-sect\">' + (c.sector||'?') + '</span><div class=\"bc-bar-bg\"><div class=\"bc-bar-fill\" style=\"width:' + pct + '%\"></div></div><span class=\"bc-cap\">' + capStr + '</span></div>';",
'  });',
"  h += '</div>';",
'  if (aspiring.length) {',
"    h += '<div class=\"bc-divider\"></div>';",
"    h += '<div class=\"bc-aspiring-header\">🎯 Aspiring Candidates</div>';",
'    aspiring.forEach(function(c) {',
"      h += '<div class=\"bc-aspiring-row\"><span class=\"bc-ticker-sm\" onclick=\"showStockModal(\\'' + c.ticker + '\\')\">' + c.ticker + '</span><span style=\"color:var(--muted);font-size:0.5rem\">' + (c.name||'').substring(0,22) + '</span><span class=\"bc-cap-sm\">$' + (c.marketCap/rate/1e6).toFixed(0) + 'M</span></div>';",
'      const pct = Math.round(((c.marketCap||0)/rate/1e9)*100);',
"      h += '<div class=\"bc-threshold\"><span>0</span><div class=\"thresh-bar\"><div class=\"thresh-fill\" style=\"width:' + pct + '%\"></div></div><span>$1B</span></div>';",
'    });',
'  }',
"  document.getElementById('billionClub').innerHTML = h;",
'}'
].join('\r\n');

// Insert before renderMoversStrip using substring
c = c.slice(0, funcStart) + billionFunc + '\r\n' + c.slice(funcStart);

const finalSc = (c.match(/<\/script>/g) || []).length;
const finalSize = Math.round(c.length / 1024);
console.log('4/4 func done. </script> count:', finalSc, 'Size:', finalSize, 'KB');

if (finalSc > 2) {
  console.log('ERROR: Too many </script> tags! Aborting write.');
  process.exit(1);
}

fs.writeFileSync(f, c);
console.log('SUCCESS! Written. File:', f);
