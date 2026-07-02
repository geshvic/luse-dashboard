/**
 * Adds "Last updated" line to the billion-dollar club section
 */
const fs = require('fs');
const p = require('path').join(__dirname, '..', 'index.html');

let raw = fs.readFileSync(p);
// Check encoding
const isUTF16 = raw[0] === 0xff && raw[1] === 0xfe;
const content = isUTF16 ? raw.toString('utf16le') : raw.toString('utf8');

const target = "const asOf = allData.marketClose?.asOf || allData.market?.asOf || '';\n";
const insert = "h += '<div style=\"font-size:0.5rem;color:var(--muted);margin-bottom:0.4rem;\">\uD83D\uDD04 Last updated: ' + (asOf || 'N/A') + ' \u00B7 Live prices \u00D7 shares outstanding</div>';\n";

if (content.includes(target)) {
  const updated = content.replace(target, target + insert);
  const buf = isUTF16 ? '\ufeff' + updated : updated;
  fs.writeFileSync(p, buf, isUTF16 ? 'utf16le' : 'utf8');
  console.log('OK: Last updated line added');
  // Verify
  const check = isUTF16 ? fs.readFileSync(p).toString('utf16le') : fs.readFileSync(p, 'utf8');
  console.log('Verify "Last updated":', check.includes('Last updated'));
} else {
  console.log('FAIL: target not found');
  // Show what's there
  const idx = content.indexOf('const asOf');
  if (idx >= 0) console.log('Found at', idx, '->', content.substring(idx, idx + 200));
  else console.log('asOf not found either');
}
