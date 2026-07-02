const fs = require("fs");
const content = fs.readFileSync(require("path").join(__dirname, "..", "index.html"), "utf8");
const firstMover = content.indexOf("function renderMoversStrip", content.indexOf("function renderBillionClub"));
const funcEnd = content.indexOf("let screenerSort", firstMover);
const func = content.substring(firstMover, funcEnd);
const tail = func.substring(func.length - 50);
console.log("Tail JSON:", JSON.stringify(tail));
console.log("Tail raw:");
for (let i = 0; i < tail.length; i++) {
  const code = tail.charCodeAt(i);
  const hex = code.toString(16).padStart(4, "0");
  process.stdout.write(hex + " ");
  if ((i + 1) % 10 === 0) process.stdout.write("\n");
}
console.log("\n");
// Check what the newline chars are
const lastPart = func.substring(func.length - 20);
console.log("Last 20 chars codes:", lastPart.split("").map(c => c.charCodeAt(0)).join(","));
