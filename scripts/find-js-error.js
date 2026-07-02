const https = require("https");

https.get("https://geshvic.github.io/luse-dashboard/", res => {
  let d = "";
  res.on("data", c => d += c.toString());
  res.on("end", () => {
    const s = d.indexOf("<script>");
    const e = d.indexOf("</script>", s);
    const js = d.substring(s + 8, e);
    
    console.log("JS length:", js.length);
    
    // Try half the script at a time
    const half = Math.floor(js.length / 2);
    
    // First half
    try {
      new Function(js.substring(0, half));
      console.log("First half: OK");
    } catch (err) {
      console.log("First half: ERROR -", err.message);
    }
    
    // Second half (need to create valid JS - wrap function)
    try {
      new Function(js.substring(half));
      console.log("Second half: OK");
    } catch (err) {
      console.log("Second half: ERROR -", err.message);
    }
    
    // Now binary search to find exact error
    function findError(start, end, depth) {
      if (depth > 20) {
        console.log("Deepest: ", start, "-", end);
        console.log("Context:", js.substring(Math.max(0, start - 20), Math.min(js.length, end + 20)));
        return;
      }
      if (end - start < 10) {
        console.log("Error region: ", start, "-", end);
        console.log("Context:", js.substring(Math.max(0, start - 30), Math.min(js.length, end + 30)));
        return;
      }
      
      const mid = Math.floor((start + end) / 2);
      try {
        new Function(js.substring(start, mid));
        // First part OK, error in second part
        findError(mid, end, depth + 1);
      } catch (err) {
        // Error in first part
        findError(start, mid, depth + 1);
      }
    }
    
    try {
      new Function(js);
      console.log("Entire JS: NO SYNTAX ERRORS");
    } catch (err) {
      console.log("Entire JS: " + err.message);
      console.log("Searching for error location...");
      findError(0, js.length, 0);
    }
  });
});
