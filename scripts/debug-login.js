const fs = require("fs");
const content = fs.readFileSync(require("path").join(__dirname, "..", "index.html")).toString("utf16le");

// Show loginGate HTML
const gateIdx = content.indexOf('id="loginGate"');
if (gateIdx >= 0) console.log("loginGate HTML:", content.substring(gateIdx, gateIdx + 400));

// Check loginGate CSS
const cssIdx = content.indexOf("#loginGate");
if (cssIdx >= 0) console.log("\nloginGate CSS:", content.substring(cssIdx, cssIdx + 200));

// Check hidden class
const hiddenIdx = content.indexOf(".hidden");
if (hiddenIdx >= 0) console.log("\n.hidden CSS:", content.substring(hiddenIdx, hiddenIdx + 100));

// Find init/checkSession
const checks = ["function load()", "window.onload", "addEventListener", "function checkSession", "function init", "loginGate.classList", "bc_session", "session && session", "if (session"];
checks.forEach(p => {
  const i = content.indexOf(p);
  if (i >= 0) {
    const ctx = content.substring(i, Math.min(i + 250, content.length));
    console.log("\n--- " + p + " ---\n" + ctx);
  }
});

// Check loginBtn click handler
const btnIdx = content.indexOf("loginBtn");
if (btnIdx >= 0) {
  console.log("\n--- loginBtn context ---\n" + content.substring(btnIdx - 30, btnIdx + 200));
}

// Check form submission
const formIdx = content.indexOf("onclick=\"doLogin()\"");
if (formIdx >= 0) console.log("\n--- doLogin onclick ---\n" + content.substring(formIdx, formIdx + 100));
