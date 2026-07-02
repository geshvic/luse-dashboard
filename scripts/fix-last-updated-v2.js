/**
 * v2: Directly reconstruct renderBillionClub with the last-updated line in the right place.
 */
const fs = require('fs');
const p = require('path').join(__dirname, '..', 'index.html');

const raw = fs.readFileSync(p);
const isUTF16 = raw[0] === 0xff && raw[1] === 0xfe;
let content = isUTF16 ? raw.toString('utf16le') : raw.toString('utf8');

// Find the function boundaries
const startMarker = 'function renderBillionClub() {';
const endMarker = 'function renderMoversStrip()';

const startIdx = content.indexOf(startMarker);
const endIdx = content.indexOf(endMarker);

if (startIdx < 0 || endIdx < 0) {
  console.log('Could not find function boundaries');
  process.exit(1);
}

const oldFunction = content.substring(startIdx, endIdx);
console.log('Old function length:', oldFunction.length);

// Build new function — preserve all existing logic, just add the last-updated line
// after the line that defines `let h` with the h3 header
const lines = oldFunction.split('\n');
let newLines = [];
let lastUpdatedAdded = false;

for (let i = 0; i < lines.length; i++) {
  const line = lines[i];
  newLines.push(line);
  
  // After the line that sets the h3 header, insert the last-updated line
  if (!lastUpdatedAdded && line.includes('B combined</span></h3>') && line.trim().endsWith("';")) {
    newLines.push("  h += '<div style=\"font-size:0.5rem;color:var(--muted);margin-bottom:0.4rem;\">\uD83D\uDD04 Last updated: ' + (asOf || 'N/A') + ' \u00B7 Live prices \u00D7 shares outstanding</div>';");
    lastUpdatedAdded = true;
  }
}

// Also add asOf variable if not present
const hasAsOf = oldFunction.includes('const asOf =');
if (!hasAsOf) {
  // Find the line with rate and add after it
  for (let i = 0; i < newLines.length; i++) {
    if (newLines[i].includes('const rate =') && !newLines[i+1].includes('const asOf')) {
      newLines.splice(i + 1, 0, "  const asOf = allData.marketClose?.asOf || allData.market?.asOf || '';");
      break;
    }
  }
}

const newFunction = newLines.join('\n');
content = content.substring(0, startIdx) + newFunction + content.substring(endIdx);

// Write back
const buf = isUTF16 ? '\ufeff' + content : content;
fs.writeFileSync(p, buf, isUTF16 ? 'utf16le' : 'utf8');

// Verify
const check = isUTF16 ? fs.readFileSync(p).toString('utf16le') : fs.readFileSync(p, 'utf8');
const ci = check.indexOf('function renderBillionClub');
const ce = check.indexOf('function renderMoversStrip');
if (ci >= 0) {
  console.log('\n--- Updated function ---\n');
  console.log(check.substring(ci, ce));
}
console.log('\nContains "Last updated":', check.includes('Last updated'));
