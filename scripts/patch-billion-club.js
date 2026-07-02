/**
 * patch-billion-club.js — adds a "last updated" timestamp to the billion-dollar club
 */
const fs = require('fs');
const path = require('path');
const ROOT = path.join(__dirname, '..');

function readUTF16(path) {
  return fs.readFileSync(path).toString('utf16le');
}

function writeUTF16(path, str) {
  fs.writeFileSync(path, '\ufeff' + str, 'utf16le');
}

// === 1. Patch index.html renderBillionClub() ===
const htmlPath = path.join(ROOT, 'index.html');
let html = readUTF16(htmlPath);

const target = `let h = '<h3><span class="icon">💰</span> Billion Dollar Club <span style="font-size:0.55rem;color:var(--muted);font-weight:400;text-transform:none;margin-left:auto;">$' + (totalCap/1e9).toFixed(1) + 'B combined</span></h3>';`;

const replacement = [
  `const asOf = allData.marketClose?.asOf || allData.market?.asOf || '';`,
  `let h = '<h3><span class="icon">💰</span> Billion Dollar Club <span style="font-size:0.55rem;color:var(--muted);font-weight:400;text-transform:none;margin-left:auto;">$' + (totalCap/1e9).toFixed(1) + 'B combined</span></h3>';`,
  `h += '<div style="font-size:0.5rem;color:var(--muted);margin-bottom:0.4rem;">🔄 Last updated: ' + (asOf || 'N/A') + ' · Live prices × shares outstanding</div>';`
].join('\n');

if (html.includes(target)) {
  html = html.replace(target, replacement);
  writeUTF16(htmlPath, html);
  console.log('OK: renderBillionClub updated with last-updated note');
} else {
  console.log('FAIL: Could not find target text');
  // Find the function and show context
  const idx = html.indexOf('function renderBillionClub');
  if (idx >= 0) {
    console.log('Found function at', idx);
    console.log(html.substring(idx, idx + 500));
  }
}

// === 2. Copy to public/dashboard.html ===
const dashboardPath = path.join(ROOT, 'public', 'dashboard.html');
const dashContent = readUTF16(dashboardPath);
if (readUTF16(dashboardPath).includes('Billion Dollar Club')) {
  writeUTF16(dashboardPath, html);
  console.log('OK: Copied index.html to dashboard.html');
} else {
  console.log('WARN: dashboard.html missing Billion Dollar Club, copying anyway');
  writeUTF16(dashboardPath, html);
}

// Verify
const verify = readUTF16(htmlPath);
console.log('Verify: "Last updated" in index.html:', verify.includes('Last updated'));
