/**
 * Fixes the order of the "Last updated" line in renderBillionClub
 * Was inserted before `let h =` — needs to be after it.
 */
const fs = require('fs');
const p = require('path').join(__dirname, '..', 'index.html');

const raw = fs.readFileSync(p);
const isUTF16 = raw[0] === 0xff && raw[1] === 0xfe;
let content = isUTF16 ? raw.toString('utf16le') : raw.toString('utf8');

// 1. Remove the misplaced last-updated line that was inserted before `let h =`
const misplaced = "h += '<div style=\"font-size:0.5rem;color:var(--muted);margin-bottom:0.4rem;\">\uD83D\uDD04 Last updated: ' + (asOf || 'N/A') + ' \u00B7 Live prices \u00D7 shares outstanding</div>';\nlet h =";
const fixed = "let h =";

if (content.includes(misplaced)) {
  content = content.replace(misplaced, fixed);
  console.log('Removed misplaced line');
} else {
  console.log('Nothing to fix (line not found in wrong place)');
}

// 2. Add the last-updated line right after the h3 closing
const after = "B combined</span></h3>';";
const afterReplacement = "B combined</span></h3>';\n  h += '<div style=\"font-size:0.5rem;color:var(--muted);margin-bottom:0.4rem;\">\uD83D\uDD04 Last updated: ' + (asOf || 'N/A') + ' \u00B7 Live prices \u00D7 shares outstanding</div>';";

if (content.includes(after)) {
  content = content.replace(after, afterReplacement);
  console.log('Added last-updated line in correct position');
} else {
  console.log('Could not find target text to add last-updated after');
}

// Write back
const buf = isUTF16 ? '\ufeff' + content : content;
fs.writeFileSync(p, buf, isUTF16 ? 'utf16le' : 'utf8');

// Verify
const check = isUTF16 ? fs.readFileSync(p).toString('utf16le') : fs.readFileSync(p, 'utf8');
const idx = check.indexOf('function renderBillionClub');
if (idx >= 0) console.log('\n--- renderBillionClub ---\n' + check.substring(idx, idx + 700));
