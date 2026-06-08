const fs = require('fs');
const h = fs.readFileSync('C:\\Users\\MUSUK\\.openclaw\\workspace\\luse-dashboard\\public\\dashboard.html', 'utf8');
console.log('screenerBar:', h.includes('screenerBar'));
console.log('scrSector:', h.includes('scrSector'));
console.log('Stock Screener:', h.includes('Stock Screener'));
console.log('screener-section before All Listed:', h.indexOf('screener-section') < h.indexOf('All Listed Companies'));
