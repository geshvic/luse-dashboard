const express = require('express');
const fs = require('fs');
const path = require('path');
const { exec } = require('child_process');

const app = express();
const PORT = process.env.PORT || 3100;

app.use(express.static(path.join(__dirname, 'public')));
app.use(express.json());

// API: serve data files
app.get('/api/market-summary', (req, res) => {
  const data = JSON.parse(fs.readFileSync(path.join(__dirname, 'data', 'market-summary.json'), 'utf8'));
  res.json(data);
});

app.get('/api/bonds', (req, res) => {
  const data = JSON.parse(fs.readFileSync(path.join(__dirname, 'data', 'bond-market.json'), 'utf8'));
  res.json(data);
});

app.get('/api/currency', (req, res) => {
  const data = JSON.parse(fs.readFileSync(path.join(__dirname, 'data', 'currency-data.json'), 'utf8'));
  res.json(data);
});

app.get('/api/news', (req, res) => {
  const limit = parseInt(req.query.limit) || 15;
  const category = req.query.category;
  let data = JSON.parse(fs.readFileSync(path.join(__dirname, 'data', 'news.json'), 'utf8'));
  if (category) data = data.filter(n => n.category === category);
  res.json(data.slice(0, limit));
});

app.get('/api/companies', (req, res) => {
  const data = JSON.parse(fs.readFileSync(path.join(__dirname, 'data', 'companies.json'), 'utf8'));
  const { sector, market, sort } = req.query;
  let result = data;
  if (sector) result = result.filter(c => c.sector === sector);
  if (market) result = result.filter(c => c.market === market);
  if (sort === 'volume') result.sort((a,b) => (b.volume||0) - (a.volume||0));
  if (sort === 'gainers') result.sort((a,b) => (b.changePct||0) - (a.changePct||0));
  if (sort === 'losers') result.sort((a,b) => (a.changePct||0) - (b.changePct||0));
  if (sort === 'marketcap') result.sort((a,b) => (b.marketCap||0) - (a.marketCap||0));
  res.json(result);
});

app.get('/api/company/:ticker/ohlcv', (req, res) => {
  const ticker = req.params.ticker.toUpperCase();
  const ohlcvPath = path.join(__dirname, 'data', 'profiles', `${ticker}_ohlcv.json`);
  if (fs.existsSync(ohlcvPath)) {
    return res.json(JSON.parse(fs.readFileSync(ohlcvPath, 'utf8')));
  }
  res.json({ ticker, data: [], note: 'OHLCV data not available for this ticker.' });
});

app.get('/api/company/:ticker', (req, res) => {
  const ticker = req.params.ticker.toUpperCase();
  const profilePath = path.join(__dirname, 'data', 'profiles', `${ticker}.json`);
  if (fs.existsSync(profilePath)) {
    return res.json(JSON.parse(fs.readFileSync(profilePath, 'utf8')));
  }
  res.json({ ticker, name: ticker, note: 'Deep profile not yet available. Basic data in /api/companies.' });
});

app.get('/api/stocks', (req, res) => {
  const data = JSON.parse(fs.readFileSync(path.join(__dirname, 'data', 'stocks.json'), 'utf8'));
  res.json(data);
});

// API: get last N business day snapshots
app.get('/api/history', (req, res) => {
  const days = parseInt(req.query.days) || 5;
  const historyDir = path.join(__dirname, 'data', 'history');
  if (!fs.existsSync(historyDir)) return res.json({ days: 0, snapshots: [] });
  
  const dirs = fs.readdirSync(historyDir)
    .filter(d => /^\d{4}-\d{2}-\d{2}$/.test(d))
    .sort()
    .reverse()
    .slice(0, days);
  
  const snapshots = [];
  for (const d of dirs) {
    const snapPath = path.join(historyDir, d, 'snapshot.json');
    const briefPath = path.join(historyDir, d, 'brief.md');
    if (fs.existsSync(snapPath)) {
      const snap = JSON.parse(fs.readFileSync(snapPath, 'utf8'));
      if (fs.existsSync(briefPath)) snap.brief = fs.readFileSync(briefPath, 'utf8');
      snapshots.push(snap);
    }
  }
  res.json({ days: snapshots.length, snapshots });
});

// API: get all dashboard data in one call
app.get('/api/all', (req, res) => {
  const market = JSON.parse(fs.readFileSync(path.join(__dirname, 'data', 'market-summary.json'), 'utf8'));
  const bonds = JSON.parse(fs.readFileSync(path.join(__dirname, 'data', 'bond-market.json'), 'utf8'));
  const stocks = JSON.parse(fs.readFileSync(path.join(__dirname, 'data', 'stocks.json'), 'utf8'));
  const companies = JSON.parse(fs.readFileSync(path.join(__dirname, 'data', 'companies.json'), 'utf8'));
  const currency = JSON.parse(fs.readFileSync(path.join(__dirname, 'data', 'currency-data.json'), 'utf8'));
  let mktClose = {};
  try { mktClose = JSON.parse(fs.readFileSync(path.join(__dirname, 'data', 'market-close.json'), 'utf8')); } catch(e) {}
  res.json({ market, bonds, stocks, companies, currency, marketClose: mktClose });
});

// API: trigger data refresh
app.post('/api/refresh', (req, res) => {
  const script = path.join(__dirname, 'scripts', 'fetch-luse-data.js');
  exec(`node "${script}"`, (err, stdout, stderr) => {
    if (err) {
      return res.json({ success: false, error: stderr || err.message });
    }
    res.json({ success: true, output: stdout });
  });
});

// Serve dashboard
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'dashboard.html'));
});

app.listen(PORT, () => {
  console.log(`LuSE Dashboard running at http://localhost:${PORT}`);
});
