const fs = require('fs');
const f = 'C:/Users/MUSUK/.openclaw/workspace/luse-dashboard/index.html';
let c = fs.readFileSync(f, 'utf8');

// Build the exact same function block
const lines = [
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
];
const funcBlock = lines.join('\r\n');
const marker = '\r\nfunction renderMoversStrip() {';

// Count occurrences of marker in current file
const matches = [...c.matchAll(/\r\nfunction renderMoversStrip\(\) \{]/g)];
console.log('Current file — marker count:', matches.length);

// Check if funcBlock itself contains the marker
if (funcBlock.includes(marker)) {
  console.log('BUG: funcBlock CONTAINS the marker!');
}
console.log('funcBlock length:', funcBlock.length, 'bytes');

// Write to a temp file and test replacement
const testFile = 'C:/Users/MUSUK/.openclaw/workspace/luse-dashboard/scripts/_test_replace.txt';
fs.writeFileSync(testFile, funcBlock);
console.log('funcBlock written to', testFile);
