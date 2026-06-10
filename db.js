// db.js — SQLite database for LuSE market data
const Database = require('better-sqlite3');
const path = require('path');
const fs = require('fs');

const DB_PATH = path.join(__dirname, 'data', 'luse.db');

// Ensure data directory exists
fs.mkdirSync(path.dirname(DB_PATH), { recursive: true });

const db = new Database(DB_PATH);
db.pragma('journal_mode = WAL');
db.pragma('foreign_keys = ON');

// ── Schema ──────────────────────────────────────────────

function initSchema() {
  db.exec(`
    CREATE TABLE IF NOT EXISTS companies (
      ticker        TEXT PRIMARY KEY,
      name          TEXT NOT NULL,
      sector        TEXT,
      sub_sector    TEXT,
      market        TEXT,
      market_cap    REAL,
      free_float    REAL,
      pe_ratio      REAL,
      dividend_yield REAL,
      ipo           TEXT,
      listed        INTEGER DEFAULT 1,
      created_at    TEXT DEFAULT (datetime('now')),
      updated_at    TEXT DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS daily_prices (
      id            INTEGER PRIMARY KEY AUTOINCREMENT,
      ticker        TEXT NOT NULL,
      date          TEXT NOT NULL,           -- YYYY-MM-DD
      open          REAL,
      high          REAL,
      low           REAL,
      close         REAL,
      volume        INTEGER,
      trades        INTEGER,
      value         REAL,
      change_pct    REAL,
      UNIQUE(ticker, date),
      FOREIGN KEY (ticker) REFERENCES companies(ticker)
    );

    CREATE INDEX IF NOT EXISTS idx_daily_prices_date ON daily_prices(date);
    CREATE INDEX IF NOT EXISTS idx_daily_prices_ticker_date ON daily_prices(ticker, date);

    CREATE TABLE IF NOT EXISTS lasi_index (
      date          TEXT PRIMARY KEY,        -- YYYY-MM-DD
      open          REAL,
      high          REAL,
      low           REAL,
      close         REAL,
      volume        INTEGER,
      change_pct    REAL
    );

    CREATE TABLE IF NOT EXISTS commodity_prices (
      id            INTEGER PRIMARY KEY AUTOINCREMENT,
      date          TEXT NOT NULL,           -- YYYY-MM-DD
      name          TEXT NOT NULL,           -- e.g. "Copper", "Brent Crude"
      symbol        TEXT,                    -- e.g. "LME", "BRENT"
      price         REAL,
      unit          TEXT,
      zmw_value     REAL,
      change        REAL,
      change_pct    REAL,
      UNIQUE(date, name)
    );

    CREATE INDEX IF NOT EXISTS idx_commodity_date ON commodity_prices(date);

    CREATE TABLE IF NOT EXISTS exchange_rates (
      date          TEXT NOT NULL,           -- YYYY-MM-DD
      currency      TEXT NOT NULL,           -- e.g. "USD", "GBP", "EUR", "ZAR"
      rate_mid      REAL,
      rate_buy      REAL,
      rate_sell     REAL,
      trend         TEXT,
      UNIQUE(date, currency)
    );

    CREATE INDEX IF NOT EXISTS idx_exchange_date ON exchange_rates(date);

    CREATE TABLE IF NOT EXISTS bond_yields (
      date          TEXT NOT NULL,           -- auction date YYYY-MM-DD
      tenor         TEXT NOT NULL,           -- e.g. "2yr", "5yr", "10yr"
      yield         REAL,
      bids          REAL,                    -- bids in millions ZMW
      allocated     REAL,                    -- allocated in millions ZMW
      oversubscription REAL,
      UNIQUE(date, tenor)
    );

    CREATE TABLE IF NOT EXISTS market_daily (
      date          TEXT PRIMARY KEY,        -- YYYY-MM-DD
      lasi_close    REAL,
      lasi_change_pct REAL,
      total_trades  INTEGER,
      total_volume  INTEGER,
      total_value   REAL,
      market_cap    REAL,
      market_cap_unit TEXT,
      advancers     INTEGER,
      decliners     INTEGER,
      unchanged     INTEGER
    );
  `);
}

// ── Upsert helpers ──────────────────────────────────────

function upsertCompany(company) {
  const stmt = db.prepare(`
    INSERT INTO companies (ticker, name, sector, sub_sector, market, market_cap, free_float, pe_ratio, dividend_yield, ipo, listed, updated_at)
    VALUES (@ticker, @name, @sector, @subSector, @market, @marketCap, @freeFloat, @pe, @dividendYield, @ipo, @listed, datetime('now'))
    ON CONFLICT(ticker) DO UPDATE SET
      name          = COALESCE(excluded.name, name),
      sector        = COALESCE(excluded.sector, sector),
      sub_sector    = COALESCE(excluded.sub_sector, sub_sector),
      market        = COALESCE(excluded.market, market),
      market_cap    = COALESCE(excluded.market_cap, market_cap),
      free_float    = COALESCE(excluded.free_float, free_float),
      pe_ratio      = COALESCE(excluded.pe_ratio, pe_ratio),
      dividend_yield= COALESCE(excluded.dividend_yield, dividend_yield),
      ipo           = COALESCE(excluded.ipo, ipo),
      listed        = COALESCE(excluded.listed, listed),
      updated_at    = datetime('now')
  `);

  const insertMany = db.transaction((companies) => {
    for (const c of companies) {
      stmt.run({
        ticker: c.ticker,
        name: c.name,
        sector: c.sector || null,
        subSector: c.subSector || null,
        market: c.market || null,
        marketCap: c.marketCap || null,
        freeFloat: c.freeFloat || null,
        pe: c.pe || null,
        dividendYield: c.dividendYield || null,
        ipo: c.ipo ? String(c.ipo) : null,
        listed: c.listed ? 1 : 0
      });
    }
  });

  insertMany(Array.isArray(company) ? company : [company]);
}

function upsertDailyPrice(date, ticker, data) {
  const stmt = db.prepare(`
    INSERT INTO daily_prices (ticker, date, open, high, low, close, volume, trades, value, change_pct)
    VALUES (@ticker, @date, @open, @high, @low, @close, @volume, @trades, @value, @changePct)
    ON CONFLICT(ticker, date) DO UPDATE SET
      open      = COALESCE(excluded.open, open),
      high      = COALESCE(excluded.high, high),
      low       = COALESCE(excluded.low, low),
      close     = COALESCE(excluded.close, close),
      volume    = COALESCE(excluded.volume, volume),
      trades    = COALESCE(excluded.trades, trades),
      value     = COALESCE(excluded.value, value),
      change_pct= COALESCE(excluded.change_pct, change_pct)
  `);
  stmt.run({
    ticker, date,
    open: data.open || null,
    high: data.high || null,
    low: data.low || null,
    close: data.close || data.price || null,
    volume: data.volume || null,
    trades: data.trades || null,
    value: data.value || null,
    changePct: data.changePct || data.change || null
  });
}

function upsertDailyPricesBatch(date, stocks) {
  const insertMany = db.transaction((date, stocks) => {
    for (const s of stocks) {
      upsertDailyPrice(date, s.ticker, s);
    }
  });
  insertMany(date, stocks);
}

function upsertLasiIndex(date, data) {
  const stmt = db.prepare(`
    INSERT INTO lasi_index (date, open, high, low, close, volume, change_pct)
    VALUES (@date, @open, @high, @low, @close, @volume, @changePct)
    ON CONFLICT(date) DO UPDATE SET
      open      = COALESCE(excluded.open, open),
      high      = COALESCE(excluded.high, high),
      low       = COALESCE(excluded.low, low),
      close     = COALESCE(excluded.close, close),
      volume    = COALESCE(excluded.volume, volume),
      change_pct= COALESCE(excluded.change_pct, change_pct)
  `);
  stmt.run({
    date,
    open: data.open || null,
    high: data.high || null,
    low: data.low || null,
    close: data.close || null,
    volume: data.volume || null,
    changePct: data.changePct || data.change || null
  });
}

function upsertCommodity(date, commodity) {
  const stmt = db.prepare(`
    INSERT INTO commodity_prices (date, name, symbol, price, unit, zmw_value, change, change_pct)
    VALUES (@date, @name, @symbol, @price, @unit, @zmwValue, @change, @changePct)
    ON CONFLICT(date, name) DO UPDATE SET
      price     = COALESCE(excluded.price, price),
      unit      = COALESCE(excluded.unit, unit),
      zmw_value = COALESCE(excluded.zmw_value, zmw_value),
      change    = COALESCE(excluded.change, change),
      change_pct= COALESCE(excluded.change_pct, change_pct)
  `);
  stmt.run({
    date,
    name: commodity.name,
    symbol: commodity.symbol || null,
    price: commodity.price || null,
    unit: commodity.unit || null,
    zmwValue: commodity.zmwValue || null,
    change: commodity.change || null,
    changePct: commodity.changePct || null
  });
}

function upsertExchangeRate(date, currency, data) {
  const stmt = db.prepare(`
    INSERT INTO exchange_rates (date, currency, rate_mid, rate_buy, rate_sell, trend)
    VALUES (@date, @currency, @mid, @buy, @sell, @trend)
    ON CONFLICT(date, currency) DO UPDATE SET
      rate_mid  = COALESCE(excluded.rate_mid, rate_mid),
      rate_buy  = COALESCE(excluded.rate_buy, rate_buy),
      rate_sell = COALESCE(excluded.rate_sell, rate_sell),
      trend     = COALESCE(excluded.trend, trend)
  `);
  stmt.run({
    date, currency,
    mid: data.mid || null,
    buy: data.buy || null,
    sell: data.sell || null,
    trend: data.trend || null
  });
}

function upsertBondYield(date, tenor, data) {
  const stmt = db.prepare(`
    INSERT INTO bond_yields (date, tenor, yield, bids, allocated, oversubscription)
    VALUES (@date, @tenor, @yield, @bids, @allocated, @oversubscription)
    ON CONFLICT(date, tenor) DO UPDATE SET
      yield            = COALESCE(excluded.yield, yield),
      bids             = COALESCE(excluded.bids, bids),
      allocated        = COALESCE(excluded.allocated, allocated),
      oversubscription = COALESCE(excluded.oversubscription, oversubscription)
  `);
  stmt.run({
    date, tenor,
    yield: data.yield || null,
    bids: data.bids || null,
    allocated: data.allocated || null,
    oversubscription: data.oversubscription || null
  });
}

function upsertMarketDaily(date, data) {
  const stmt = db.prepare(`
    INSERT INTO market_daily (date, lasi_close, lasi_change_pct, total_trades, total_volume, total_value, market_cap, market_cap_unit, advancers, decliners, unchanged)
    VALUES (@date, @lasiClose, @lasiChangePct, @totalTrades, @totalVolume, @totalValue, @marketCap, @marketCapUnit, @advancers, @decliners, @unchanged)
    ON CONFLICT(date) DO UPDATE SET
      lasi_close      = COALESCE(excluded.lasi_close, lasi_close),
      lasi_change_pct = COALESCE(excluded.lasi_change_pct, lasi_change_pct),
      total_trades    = COALESCE(excluded.total_trades, total_trades),
      total_volume    = COALESCE(excluded.total_volume, total_volume),
      total_value     = COALESCE(excluded.total_value, total_value),
      market_cap      = COALESCE(excluded.market_cap, market_cap),
      market_cap_unit = COALESCE(excluded.market_cap_unit, market_cap_unit),
      advancers       = COALESCE(excluded.advancers, advancers),
      decliners       = COALESCE(excluded.decliners, decliners),
      unchanged       = COALESCE(excluded.unchanged, unchanged)
  `);
  stmt.run({
    date,
    lasiClose: data.lasiClose || null,
    lasiChangePct: data.lasiChangePct || null,
    totalTrades: data.totalTrades || null,
    totalVolume: data.totalVolume || null,
    totalValue: data.totalValue || null,
    marketCap: data.marketCap || null,
    marketCapUnit: data.marketCapUnit || null,
    advancers: data.advancers || 0,
    decliners: data.decliners || 0,
    unchanged: data.unchanged || 0
  });
}

// ── Query helpers ───────────────────────────────────────

/** Get sector performance over a date range */
function sectorPerformance(startDate, endDate) {
  return db.prepare(`
    SELECT
      c.sector,
      dp.date,
      COUNT(DISTINCT dp.ticker) as stock_count,
      AVG(dp.close) as avg_price,
      SUM(dp.volume) as total_volume,
      SUM(dp.value) as total_value,
      AVG(dp.change_pct) as avg_change_pct
    FROM daily_prices dp
    JOIN companies c ON dp.ticker = c.ticker
    WHERE dp.date BETWEEN ? AND ?
    GROUP BY c.sector, dp.date
    ORDER BY c.sector, dp.date
  `).all(startDate, endDate);
}

/** Get latest prices for all stocks */
function latestPrices(date) {
  if (!date) {
    date = db.prepare('SELECT MAX(date) as d FROM daily_prices').get()?.d;
  }
  if (!date) return [];
  return db.prepare(`
    SELECT dp.*, c.name, c.sector, c.market, c.market_cap
    FROM daily_prices dp
    JOIN companies c ON dp.ticker = c.ticker
    WHERE dp.date = ?
    ORDER BY c.sector, dp.volume DESC
  `).all(date);
}

/** Get price history for a ticker */
function priceHistory(ticker, startDate, endDate) {
  let sql = 'SELECT * FROM daily_prices WHERE ticker = ?';
  const params = [ticker];
  if (startDate) { sql += ' AND date >= ?'; params.push(startDate); }
  if (endDate) { sql += ' AND date <= ?'; params.push(endDate); }
  sql += ' ORDER BY date';
  return db.prepare(sql).all(...params);
}

/** Get LASI history */
function lasiHistory(startDate, endDate) {
  let sql = 'SELECT * FROM lasi_index WHERE 1=1';
  const params = [];
  if (startDate) { sql += ' AND date >= ?'; params.push(startDate); }
  if (endDate) { sql += ' AND date <= ?'; params.push(endDate); }
  sql += ' ORDER BY date';
  return db.prepare(sql).all(...params);
}

/** Get commodity history */
function commodityHistory(name, startDate, endDate) {
  let sql = 'SELECT * FROM commodity_prices WHERE 1=1';
  const params = [];
  if (name) { sql += ' AND name = ?'; params.push(name); }
  if (startDate) { sql += ' AND date >= ?'; params.push(startDate); }
  if (endDate) { sql += ' AND date <= ?'; params.push(endDate); }
  sql += ' ORDER BY date, name';
  return db.prepare(sql).all(...params);
}

/** Get exchange rate history */
function exchangeHistory(currency, startDate, endDate) {
  let sql = 'SELECT * FROM exchange_rates WHERE 1=1';
  const params = [];
  if (currency) { sql += ' AND currency = ?'; params.push(currency); }
  if (startDate) { sql += ' AND date >= ?'; params.push(startDate); }
  if (endDate) { sql += ' AND date <= ?'; params.push(endDate); }
  sql += ' ORDER BY date, currency';
  return db.prepare(sql).all(...params);
}

/** Get database date range */
function dateRange() {
  const row = db.prepare(`
    SELECT MIN(date) as earliest, MAX(date) as latest, COUNT(DISTINCT date) as trading_days
    FROM daily_prices
  `).get();
  return row || { earliest: null, latest: null, trading_days: 0 };
}

/** Get count of records per table */
function stats() {
  return {
    companies: db.prepare('SELECT COUNT(*) as c FROM companies').get().c,
    daily_prices: db.prepare('SELECT COUNT(*) as c FROM daily_prices').get().c,
    lasi_index: db.prepare('SELECT COUNT(*) as c FROM lasi_index').get().c,
    commodity_prices: db.prepare('SELECT COUNT(*) as c FROM commodity_prices').get().c,
    exchange_rates: db.prepare('SELECT COUNT(*) as c FROM exchange_rates').get().c,
    bond_yields: db.prepare('SELECT COUNT(*) as c FROM bond_yields').get().c,
    market_daily: db.prepare('SELECT COUNT(*) as c FROM market_daily').get().c,
    date_range: dateRange()
  };
}

// Initialize schema on load
initSchema();

module.exports = {
  db,
  initSchema,
  upsertCompany,
  upsertDailyPrice,
  upsertDailyPricesBatch,
  upsertLasiIndex,
  upsertCommodity,
  upsertExchangeRate,
  upsertBondYield,
  upsertMarketDaily,
  // Queries
  sectorPerformance,
  latestPrices,
  priceHistory,
  lasiHistory,
  commodityHistory,
  exchangeHistory,
  dateRange,
  stats
};
