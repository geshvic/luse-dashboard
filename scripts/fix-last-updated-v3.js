/**
 * v3: Direct line-by-line construction. Just add the last-updated line
 * right after the let h = '<h3>...Billion Dollar Club...</h3>' line.
 */
const fs = require("fs");
const p = require("path").join(__dirname, "..", "index.html");

const raw = fs.readFileSync(p);
const isUTF16 = raw[0] === 0xff && raw[1] === 0xfe;
let content = isUTF16 ? raw.toString("utf16le") : raw.toString("utf8");

const startMarker = "function renderBillionClub() {";
const endMarker = "function renderMoversStrip()";
const sIdx = content.indexOf(startMarker);
const eIdx = content.indexOf(endMarker);

const func = content.substring(sIdx, eIdx);
const lines = func.split("\n");

// Remove any existing "Last updated" lines
const cleanLines = lines.filter(l => !l.includes("Last updated"));

// Find the line with let h = '<h3>... and insert after it
const newLines = [];
let inserted = false;

for (let i = 0; i < cleanLines.length; i++) {
  const line = cleanLines[i];
  newLines.push(line);
  
  // After the let h line that sets the h3 header (long line with Billion Dollar Club)
  if (!inserted && line.includes("let h =") && line.includes("Billion Dollar Club")) {
    newLines.push("  h += '<div style=\"font-size:0.5rem;color:var(--muted);margin-bottom:0.4rem;\">\uD83D\uDD04 Last updated: ' + (asOf || 'N/A') + ' \u00B7 Live prices \u00D7 shares outstanding</div>';");
    inserted = true;
  }
}

// Ensure asOf variable exists
const hasAsOf = cleanLines.some(l => l.includes("const asOf ="));
if (!hasAsOf) {
  const insertIdx = newLines.findIndex(l => l.includes("const cos =")) + 1;
  newLines.splice(insertIdx, 0, "  const asOf = allData.marketClose?.asOf || allData.market?.asOf || '';");
} else {
  // Make sure it's before the let h line
  const asOfIdx = newLines.findIndex(l => l.includes("const asOf ="));
  const letHIdx = newLines.findIndex(l => l.includes("let h =") && l.includes("Billion Dollar Club"));
  if (asOfIdx > letHIdx) {
    // Remove it from where it is and add before let h
    const asOfLine = newLines.splice(asOfIdx, 1)[0];
    newLines.splice(letHIdx, 0, asOfLine);
  }
}

const newFunc = newLines.join("\n");
content = content.substring(0, sIdx) + newFunc + content.substring(eIdx);

const buf = isUTF16 ? "\ufeff" + content : content;
fs.writeFileSync(p, buf, isUTF16 ? "utf16le" : "utf8");

// Verify
const check = isUTF16 ? fs.readFileSync(p).toString("utf16le") : fs.readFileSync(p, "utf8");
const ci = check.indexOf("function renderBillionClub");
const ce = check.indexOf("function renderMoversStrip");
console.log("--- renderBillionClub ---");
check.substring(ci, ce).split("\n").forEach((l, i) => {
  console.log("L" + i + ": " + l.replace(/\s+/g, " ").trim().substring(0, 150));
});
console.log("\nContains 'Last updated':", check.includes("Last updated"));
console.log("asOf position before h3:", check.indexOf("asOf") < check.indexOf("Billion Dollar Club"));
