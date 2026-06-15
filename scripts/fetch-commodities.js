/**
 * fetch-commodities.js — updates commodities.json with latest prices
 * 
 * This is a manual/assisted update script. It searches for current prices
 * and logs the results so they can be verified and written.
 * 
 * Current data sources:
 *   Copper LME: tradingeconomics.com/commodity/copper
 *   Brent Crude: tradingeconomics.com/commodity/crude-oil
 *   Gold XAU: tradingeconomics.com/commodity/gold
 *   Cobalt LME: tradingeconomics.com/commodity/cobalt
 *   Maize: FRA floor price (government-set)
 * 
 * Run: node scripts/fetch-commodities.js
 */
const fs = require('fs');
const path = require('path');
const https = require('https');

const DATA_PATH = path.join(__dirname, '..', 'data', 'commodities.json');
const RATE = 17.71; // ZMW/USD — updated by currency scraper

function fetchPrice(url) {
  return new Promise((resolve, reject) => {
    https.get(url, { timeout: 15000 }, res => {
      let data = '';
      res.on('data', c => data += c.toString());
      res.on('end', () => resolve(data));
    }).on('error', reject);
  });
}

function extractPrice(html, pattern) {
  const m = html.match(pattern);
  return m ? parseFloat(m[1].replace(/,/g, '')) : null;
}

async function main() {
  console.log('Fetching commodity prices...\n');
  
  const results = {};
  const errors = [];
  
  // Copper
  try {
    const html = await fetchPrice('https://tradingeconomics.com/commodity/copper');
    const price = extractPrice(html, /Copper[^0-9]*([0-9,]+\.?[0-9]*)/);
    if (price) {
      results.copper = price;
      console.log(`Copper: $${price}/tonne`);
    }
  } catch (e) { errors.push(`Copper: ${e.message}`); }
  
  // Brent
  try {
    const html = await fetchPrice('https://tradingeconomics.com/commodity/crude-oil');
    const price = extractPrice(html, /Crude Oil[^0-9]*([0-9,]+\.?[0-9]*)/);
    if (price) {
      results.brent = price;
      console.log(`Brent: $${price}/bbl`);
    }
  } catch (e) { errors.push(`Brent: ${e.message}`); }
  
  // Gold
  try {
    const html = await fetchPrice('https://tradingeconomics.com/commodity/gold');
    const price = extractPrice(html, /Gold[^0-9]*([0-9,]+\.?[0-9]*)/);
    if (price) {
      results.gold = price;
      console.log(`Gold: $${price}/oz`);
    }
  } catch (e) { errors.push(`Gold: ${e.message}`); }
  
  // Cobalt
  try {
    const html = await fetchPrice('https://tradingeconomics.com/commodity/cobalt');
    const price = extractPrice(html, /Cobalt[^0-9]*([0-9,]+\.?[0-9]*)/);
    if (price) {
      results.cobalt = price;
      console.log(`Cobalt: $${price}/tonne`);
    }
  } catch (e) { errors.push(`Cobalt: ${e.message}`); }
  
  console.log('\nResults:', JSON.stringify(results, null, 2));
  if (errors.length) console.log('Errors:', errors.join('\n'));
}

main().catch(e => console.error(e));
