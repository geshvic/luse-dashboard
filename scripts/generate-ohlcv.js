// Generates realistic daily OHLCV data for LuSE tickers
const fs = require('fs');
const path = require('path');

function generateOHLCV(basePrice, volatility, days, startDate, events = []) {
  const data = [];
  let price = basePrice;
  const d = new Date(startDate);
  
  for (let i = days; i >= 0; i--) {
    const date = new Date(d);
    date.setDate(date.getDate() - i);
    if (date.getDay() === 0 || date.getDay() === 6) continue; // skip weekends
    
    const dailyVol = volatility * (0.5 + Math.random());
    const change = (Math.random() - 0.48) * dailyVol;
    const open = price;
    const close = price + change;
    const high = Math.max(open, close) + Math.abs(change) * (0.3 + Math.random() * 0.7);
    const low = Math.min(open, close) - Math.abs(change) * (0.3 + Math.random() * 0.7);
    const volume = Math.floor(500 + Math.random() * 9500 * (1 + Math.abs(change/price)*10));
    
    // Check for events
    const dateStr = date.toISOString().split('T')[0];
    const event = events.find(e => e.date === dateStr);
    
    data.push({
      date: dateStr,
      open: Math.round(open * 100) / 100,
      high: Math.round(high * 100) / 100,
      low: Math.round(low * 100) / 100,
      close: Math.round(close * 100) / 100,
      volume,
      event: event ? event.label : null
    });
    
    price = close;
  }
  return data;
}

// DCZM — 90 days from IPO
const dczmEvents = [
  {date:'2025-12-18', label:'IPO: K12.30'},
  {date:'2026-01-26', label:'Peak: K24.50 (91% turnover)'},
  {date:'2026-01-27', label:'Crash -9.6%'},
  {date:'2026-01-28', label:'Dead-cat bounce +5.6%'},
  {date:'2026-02-19', label:'Liquidity dry-up'},
  {date:'2026-03-06', label:'Forensic analysis published'}
];
const dczm = generateOHLCV(12.30, 0.85, 90, '2026-06-05', dczmEvents);

// ATEL — 60 days
const atel = generateOHLCV(165, 2.5, 60, '2026-06-05');

// CECZ — 60 days
const cecz = generateOHLCV(16.50, 0.35, 60, '2026-06-05');

// ZSUG — 60 days
const zsug = generateOHLCV(38.20, 0.50, 60, '2026-06-05');

// ZNCO — 60 days
const znco = generateOHLCV(9.40, 0.20, 60, '2026-06-05');

// ZCCM-IH — 60 days
const zccm = generateOHLCV(41.50, 0.80, 60, '2026-06-05');

// BATZ — 60 days
const batz = generateOHLCV(15.30, 0.25, 60, '2026-06-05');

fs.writeFileSync(path.join(__dirname, '..', 'data', 'profiles', 'DCZM_ohlcv.json'), JSON.stringify({ticker:'DCZM', data:dczm}, null, 2));
fs.writeFileSync(path.join(__dirname, '..', 'data', 'profiles', 'ATEL_ohlcv.json'), JSON.stringify({ticker:'ATEL', data:atel}, null, 2));
fs.writeFileSync(path.join(__dirname, '..', 'data', 'profiles', 'CECZ_ohlcv.json'), JSON.stringify({ticker:'CECZ', data:cecz}, null, 2));
fs.writeFileSync(path.join(__dirname, '..', 'data', 'profiles', 'ZSUG_ohlcv.json'), JSON.stringify({ticker:'ZSUG', data:zsug}, null, 2));
fs.writeFileSync(path.join(__dirname, '..', 'data', 'profiles', 'ZNCO_ohlcv.json'), JSON.stringify({ticker:'ZNCO', data:znco}, null, 2));
fs.writeFileSync(path.join(__dirname, '..', 'data', 'profiles', 'ZCCM-OH_ohlcv.json'), JSON.stringify({ticker:'ZCCM-IH', data:zccm}, null, 2));
fs.writeFileSync(path.join(__dirname, '..', 'data', 'profiles', 'BATZ_ohlcv.json'), JSON.stringify({ticker:'BATZ', data:batz}, null, 2));

console.log('Generated OHLCV data for 7 tickers');
console.log('DCZM:', dczm.length, 'bars, ATEL:', atel.length, 'bars');
