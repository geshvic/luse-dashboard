const fs = require("fs");
const raw = fs.readFileSync(require("path").join(__dirname, "..", "index.html"));
const content = raw.toString("utf16le");
const idx = content.indexOf("function renderBillionClub");
const endIdx = content.indexOf("function renderMoversStrip");
const func = content.substring(idx, endIdx);

// Show all lines with h += or let h
func.split("\n").forEach((l, i) => {
  if (l.includes("h +=") || l.includes("let h") || l.includes("h3") || l.includes("B combined") || l.includes("</h3>") || l.includes("asOf") || l.includes("Last updated")) {
    console.log("L" + i + ": [" + l.trim().substring(0, 120) + "]");
  }
});

// Check for the misordered one
console.log("\n--- Stray 'Last updated' lines ---");
func.split("\n").forEach((l, i) => {
  if (l.includes("Last updated")) {
    console.log("L" + i + ": " + l.trim().substring(0, 150));
  }
});
