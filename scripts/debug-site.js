const fs = require('fs');
const html = fs.readFileSync('C:\\Users\\MUSUK\\.openclaw\\workspace\\luse-dashboard\\public\\dashboard.html', 'utf8');

// Find ALL occurrences of "function renderCalendar"
const matches = [];
let pos = -1;
while ((pos = html.indexOf('function renderCalendar', pos + 1)) !== -1) {
  const ctx = html.slice(Math.max(0, pos - 30), pos + 5);
  matches.push({ pos, ctx: ctx.replace(/\n/g, '\\n') });
}
console.log('renderCalendar occurrences:', matches.length);
matches.forEach((m, i) => {
  console.log(i + ':', m.pos, m.ctx);
});
