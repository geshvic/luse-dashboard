const https = require("https");

https.get("https://geshvic.github.io/luse-dashboard/", { headers: { "Cache-Control": "no-cache" } }, res => {
  let d = "";
  res.on("data", c => d += c.toString());
  res.on("end", () => {
    const s = d.indexOf("<script>");
    const e = d.indexOf("</script>", s + 1);
    const after = e + 9;
    const rest = d.substring(after, Math.min(after + 500, d.length));
    const hasRawCode = rest.includes("renderBillionClub") || rest.includes("totalCap");
    console.log("Size:", d.length);
    console.log("Has raw code after scripts:", hasRawCode);
    if (hasRawCode) console.log("SPILL:", rest.substring(0, 300));
    const scripts = d.match(/<script[^>]*>/g);
    const closes = d.match(/<\/script>/g);
    console.log("Script opens:", scripts ? scripts.length : 0, "closes:", closes ? closes.length : 0);
    if (scripts && closes && scripts.length !== closes.length) {
      console.log("MISMATCH! Extra close at position", d.lastIndexOf("</script>", d.length - 20));
      // Check for </script> in the middle of JS
      const inline = d.substring(d.indexOf("<script>") + 8, d.indexOf("</script>"));
      const inside = inline.match(/<\/script>/gi);
      console.log("</script> inside JS:", inside ? inside.length : 0);
    }
    
    // Check content-type
    console.log("Content-Type:", res.headers["content-type"]);
    console.log("Content-Length:", res.headers["content-length"]);
    console.log("Last-Modified:", res.headers["last-modified"]);
  });
});
