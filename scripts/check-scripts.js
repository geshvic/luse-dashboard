/**
 * Check script tags in the deployed HTML
 */
const https = require("https");

https.get("https://geshvic.github.io/luse-dashboard/", res => {
  let data = "";
  res.on("data", chunk => data += chunk.toString());
  res.on("end", () => {
    const scripts = [];
    let idx = 0;
    while ((idx = data.indexOf("<script", idx)) >= 0) {
      const end = data.indexOf("</script>", idx);
      if (end < 0) break;
      scripts.push(data.substring(idx, end + 9));
      idx = end + 9;
    }
    
    scripts.forEach((s, i) => {
      console.log("Script " + i + ":");
      const srcMatch = s.match(/src="([^"]+)"/);
      if (srcMatch) {
        console.log("  External URL:", srcMatch[1]);
        console.log("  Length:", s.length);
      } else {
        console.log("  Inline, length:", s.length);
        console.log("  First 200 chars:", s.substring(0, 200).replace(/\n/g, "\\n"));
      }
      console.log("");
    });
    
    // Check for the key login HTML structure
    console.log("--- Login HTML elements check ---");
    const checks = [
      "loginGate", "loginForm", "signupForm", "loginAuthed",
      "loginUser", "loginPass", "loginBtn", "pwToggle",
      "loginError", "signupError", "authedUser"
    ];
    for (const id of checks) {
      const found = data.includes('id="' + id + '"');
      console.log("  #" + id + ": " + (found ? "OK" : "MISSING"));
    }
  });
}).on("error", e => console.log("Error:", e.message));
