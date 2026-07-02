/**
 * Validate the JavaScript in index.html for syntax errors
 * Uses a tag-based approach to wrap sections in valid functions
 */
const fs = require("fs");
const raw = fs.readFileSync(require("path").join(__dirname, "..", "index.html"), "utf8");
const s = raw.indexOf("<script>");
const e = raw.indexOf("</script>", s + 1);
const js = raw.substring(s + 8, e);

// Write JS to temp file and node --check it
const tmp = require("path").join(__dirname, "..", "_temp_check.js");
// Wrap in a valid function context
const wrapped = `"use strict";\n${js}`;
fs.writeFileSync(tmp, wrapped, "utf8");

const { execSync } = require("child_process");
try {
  execSync(`node --check "${tmp}"`, { stdio: "pipe", timeout: 10000 });
  console.log("OK: No syntax errors");
} catch (err) {
  const stderr = err.stderr.toString();
  console.log("SYNTAX ERROR:");
  console.log(stderr.substring(0, 2000));
  
  // Parse the error to find line number
  const lineMatch = stderr.match(/:(\d+):(\d+)/);
  if (lineMatch) {
    const lineNum = parseInt(lineMatch[1]);
    const colNum = parseInt(lineMatch[2]);
    console.log(`\nError at line ${lineNum}, column ${colNum}`);
    
    // Show the error line in the temp file
    const tmpLines = wrapped.split("\n");
    for (let i = Math.max(0, lineNum - 3); i < Math.min(tmpLines.length, lineNum + 2); i++) {
      console.log(`${i === lineNum - 1 ? ">>>" : "   "} ${i + 1}: ${tmpLines[i].substring(0, 150)}`);
    }
    
    // Map back to original HTML line
    const origLines = js.split("\n");
    console.log(`\nMaps to script line ${lineNum} (0-indexed: ${lineNum - 1})`);
    if (origLines[lineNum - 1]) {
      console.log("Content:", origLines[lineNum - 1].substring(0, 200));
    }
  }
} finally {
  // Cleanup
  try { fs.unlinkSync(tmp); } catch(e) {}
}
