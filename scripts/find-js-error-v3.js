const https = require("https");

https.get("https://geshvic.github.io/luse-dashboard/", res => {
  let d = "";
  res.on("data", c => d += c.toString());
  res.on("end", () => {
    const s = d.indexOf("<script>");
    const e = d.indexOf("</script>", s);
    const js = d.substring(s + 8, e);
    
    // Check entire JS
    try { new Function(js); console.log("FULL JS: OK"); return; }
    catch (x) { console.log("FULL JS: " + x.message.substring(0, 60)); }
    
    // Use stack trace to find line number
    try { new Function(js); } catch(x) {
      if (x.stack) {
        console.log("Stack:", x.stack.substring(0, 500));
      }
    }
    
    // Use column-based approach: try parsing substring ending at each position
    // Start from position 1 and go until we find the error
    const maxCheck = 300;
    for (let i = 1; i <= maxCheck; i++) {
      try {
        // We wrap in an if(false) block so incomplete code doesn't cause errors
        new Function(js.substring(0, i));
      } catch (x) {
        // Check if this is a REAL error (not just incomplete statement)
        const msg = x.message;
        // Common "incomplete code" errors in Function constructor
        if (msg.includes("Unexpected end of input") || 
            msg.includes("Expected") ||
            msg.includes("missing") ||
            msg.includes("is not a") ||
            msg === "Invalid or unexpected token" ||
            msg.includes("Unexpected token")) {
          // Show what the code looks like at this point
          console.log("\nError at position " + i + ": " + msg);
          const context = js.substring(Math.max(0, i - 30), Math.min(js.length, i + 30));
          console.log("Context: " + JSON.stringify(context));
          console.log("CharCodes:");
          for (let j = Math.max(0, i - 5); j < Math.min(js.length, i + 5); j++) {
            console.log("  [" + j + "] " + js.charCodeAt(j) + " (" + JSON.stringify(js[j]) + ")");
          }
          break;
        }
      }
    }
  });
});
