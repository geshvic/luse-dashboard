// One-off: reconcile data that was misfiled under 2026-11-07 (UTC rollover) into 2026-11-06 (CT trading date).
const fs = require('fs');
const path = require('path');

const DATA = path.join(__dirname, '..', 'data');
const GOOD = '2026-11-07';
const TARGET = '2026-11-06';

// 1. History snapshot
const goodSnap = path.join(DATA, 'history', GOOD, 'snapshot.json');
const tgtDir = path.join(DATA, 'history', TARGET);
const tgtSnap = path.join(tgtDir, 'snapshot.json');
const snap = JSON.parse(fs.readFileSync(goodSnap, 'utf8'));
snap.asOf = TARGET;
snap.date = TARGET;
fs.mkdirSync(tgtDir, { recursive: true });
fs.writeFileSync(tgtSnap, JSON.stringify(snap, null, 2));
fs.rmSync(path.join(DATA, 'history', GOOD), { recursive: true, force: true });
console.log('history: ' + TARGET + '/snapshot.json <- ' + (snap.stocks || []).length + ' stocks; removed ' + GOOD + '/');

// 2. asOf labels
for (const f of ['all.json', 'market-close.json', 'market-summary.json']) {
  const p = path.join(DATA, f);
  let raw = fs.readFileSync(p, 'utf8');
  const before = (raw.match(new RegExp(GOOD, 'g')) || []).length;
  raw = raw.split('"' + GOOD + '"').join('"' + TARGET + '"');
  fs.writeFileSync(p, raw);
  console.log(f + ': relabelled ' + before + ' asOf');
}

// 3. LASI OHLCV: drop the phantom 11-07 candle, keep latest close under 2026-11-06
const ohlcvPath = path.join(DATA, 'profiles', 'LASI_ohlcv.json');
const ohlcv = JSON.parse(fs.readFileSync(ohlcvPath, 'utf8'));
let candles = ohlcv.data || [];
const latest = candles.filter(c => c.date === GOOD).pop();
const rest = candles.filter(c => c.date !== GOOD && c.date !== TARGET);
if (latest) {
  latest.date = TARGET;
  rest.push(latest);
}
rest.sort((a, b) => a.date.localeCompare(b.date));
ohlcv.data = rest;
fs.writeFileSync(ohlcvPath, JSON.stringify(ohlcv, null, 2));
console.log('LASI_ohlcv: ' + rest.length + ' candles, last = ' + JSON.stringify(rest[rest.length - 1]));
