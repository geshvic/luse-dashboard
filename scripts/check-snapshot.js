const fs = require('fs');
const path = require('path');

const today = process.argv[2] || new Date().toISOString().slice(0, 10);
const file = path.join(__dirname, '..', 'data', 'history', today, 'snapshot.json');

if (!fs.existsSync(file)) {
  console.log('NOT_EXISTS');
  process.exit(1);
}

const stat = fs.statSync(file);
let count = 0;
try {
  const j = JSON.parse(fs.readFileSync(file, 'utf8'));
  if (Array.isArray(j.stocks)) count = j.stocks.length;
  else if (Array.isArray(j)) count = j.length;
} catch (e) {
  console.log('PARSE_ERROR: ' + e.message);
  process.exit(2);
}
console.log(`EXISTS size=${stat.size} stocks=${count}`);
process.exit(count >= 15 ? 0 : 3);
