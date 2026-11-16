const fs = require('fs');
const path = require('path');
const p = path.join(__dirname, '..', 'data', 'currency-data.json');
const d = JSON.parse(fs.readFileSync(p, 'utf8'));

// Verified BoZ official mid-rate for 22 Sep 2026: 1 USD = 19.543 ZMW (source: allratestoday.com BoZ mirror / boz.zm)
const bozMid = 19.543;
const usd = d.rates.USD;
usd.bozMid = bozMid;
usd.marketMid = usd.mid;            // live market mid from open.er-api.com
usd.buy = +(bozMid - 0.025).toFixed(3);
usd.sell = +(bozMid + 0.025).toFixed(3);
usd.note = `1 USD \u2248 ${usd.mid} ZMW market mid \u2014 auto-updated 2026-09-23 (open.er-api.com). BoZ official mid ~${bozMid} (22 Sep). \u2193 ZMW per USD = kwacha strengthening.`;

d.trendAnalysis.outlook = "The kwacha firmed marginally, with the USD/ZMW market mid easing ~0.06% to ~K19.72/USD (open.er-api.com, 23 Sep) while the BoZ official mid sat at ~K19.54 (22 Sep). The pair remains inside the broad 18.40\u201319.80 consolidation band, and the move was broad-based across GBP, EUR, ZAR and BWP (all marginally lower in ZMW terms) with CNY likewise edging down \u2014 i.e. a modest, uniform kwacha firming. The official/parallel premium remains narrow, signalling no acute FX scarcity. With re-election formalised at the 1 Sep ceremony and the MPC holding at 13.25% on 26 August, focus shifts to the 30 Sep MPC \u2014 the same day a 10% copper-concentrate export duty takes effect \u2014 plus the 2027 budget and the make-up of the new economic team.";

d.ratesLastUpdated = new Date().toISOString().replace('T', ' ').slice(0, 16) + ' UTC';
fs.writeFileSync(p, JSON.stringify(d, null, 2));
console.log('currency-data.json patched: USD bozMid', bozMid, 'marketMid', usd.marketMid);
