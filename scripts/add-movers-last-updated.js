const fs = require("fs");
const p = require("path").join(__dirname, "..", "index.html");
let content = fs.readFileSync(p, "utf8");

const firstMover = content.indexOf("function renderMoversStrip", content.indexOf("function renderBillionClub"));
const funcEnd = content.indexOf("let screenerSort", firstMover);
const func = content.substring(firstMover, funcEnd);

if (func.includes("Last updated")) {
  console.log("Already has last-updated, skipping");
  process.exit(0);
}

// Exact text from file: flat + '─</span></div>';\r\n}
// Note: '─' is actual unicode char U+2500
const marker = "flat+'\u2500</span></div>';\r\n}";

const idx = func.lastIndexOf(marker);
if (idx >= 0) {
  const replacement = "flat+'\u2500</span></div>';" +
    "\r\n  const asOf = allData.marketClose?.asOf || allData.market?.asOf || '';" +
    "\r\n  document.getElementById('leftMovers').insertAdjacentHTML('beforeend', '<div style=\"font-size:0.5rem;color:var(--muted);text-align:center;margin-top:0.3rem;\">\uD83D\uDD04 Last updated: ' + (asOf || 'N/A') + '</div>');" +
    "\r\n}";
  
  const newFunc = func.substring(0, idx) + replacement + func.substring(idx + marker.length);
  content = content.substring(0, firstMover) + newFunc + content.substring(funcEnd);
  fs.writeFileSync(p, content, "utf8");
  console.log("OK: Added last-updated note below sentiment");
} else {
  console.log("FAIL: Marker not found");
  console.log("Looking for:", JSON.stringify(marker));
  // Search for partial matches
  const partial = func.substring(func.lastIndexOf("flat"), func.lastIndexOf("flat") + 30);
  console.log("Actual text:", JSON.stringify(partial));
}

// Validate
const s = content.indexOf("<script>");
const e = content.indexOf("</script>", s + 1);
const js = content.substring(s + 8, e);
const tmp = require("path").join(__dirname, "..", "_temp_check.js");
fs.writeFileSync(tmp, "\"use strict\";\n" + js, "utf8");
const { execSync } = require("child_process");
try {
  execSync("node --check \"" + tmp + "\"", { stdio: "pipe", timeout: 10000 });
  console.log("JS: No syntax errors");
} catch (err) {
  console.log("JS SYNTAX ERROR: " + err.stderr.toString().substring(0, 300));
}
try { fs.unlinkSync(tmp); } catch (e) {}
