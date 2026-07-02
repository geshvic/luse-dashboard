const https = require("https");

https.get("https://geshvic.github.io/luse-dashboard/", res => {
  let d = "";
  res.on("data", c => d += c.toString());
  res.on("end", () => {
    const s = d.indexOf("<script>");
    const e = d.indexOf("</script>", s);
    const rawJs = d.substring(s, e + 9);
    
    console.log("Script tag + content length:", rawJs.length);
    
    // Check for the exact error region
    const tag = "<script>";
    const jsStart = tag.length;
    const js = d.substring(s + jsStart, e);
    
    console.log("JS content starts at offset:", jsStart, "from script tag");
    
    // Show the first 200 bytes as hex
    console.log("\nFirst 200 bytes hex:");
    for (let i = 0; i < Math.min(200, js.length); i++) {
      process.stdout.write(js.charCodeAt(i).toString(16).padStart(2, "0") + " ");
      if ((i + 1) % 20 === 0) process.stdout.write("\n");
    }
    console.log("\n");
    
    // Show first 200 chars as text
    console.log("First 200 chars (JSON):");
    console.log(JSON.stringify(js.substring(0, 200)));
    console.log("\n");
    
    // Check for NO-BREAK SPACE or other invisible chars
    for (let i = 0; i < Math.min(500, js.length); i++) {
      const code = js.charCodeAt(i);
      if (code > 127 && code !== 10 && code !== 13) {
        console.log("Non-ASCII at", i, ": charCode", code, "(" + js[i] + ")");
      }
      // Also check for zero-width chars
      if (code === 0x200B || code === 0x200C || code === 0x200D || code === 0xFEFF || code === 0x00AD) {
        console.log("Invisible char at", i, ": charCode", code);
      }
    }
    console.log("\nNo invisible chars found in first 500 chars");
    
    // Try parsing incrementally
    for (let i = 10; i <= 200; i += 10) {
      try {
        new Function(js.substring(0, i));
        console.log("  0-" + i + ": OK");
      } catch (err) {
        console.log("  0-" + i + ": ERROR - " + err.message.substring(0, 40));
        // Try removing the last few chars
        for (let j = i - 1; j >= Math.max(0, i - 5); j--) {
          try {
            new Function(js.substring(0, j));
            console.log("  0-" + j + ": OK (remove from end)");
            break;
          } catch (e2) {}
        }
        break;
      }
    }
  });
});
