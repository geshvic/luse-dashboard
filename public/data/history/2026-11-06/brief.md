# LuSE Daily Market Brief — Friday, 6 November 2026

*Source: official luse.co.zm market data (Playwright scraper, run 2026-11-06 09:56 UTC), BoZ / open.er-api.com for FX. All prices in ZMW unless stated. Data stamp `asOf: 2026-11-06`.*

> **Timing note:** the board was captured at 09:56 UTC (11:56 CAT). LuSE trades roughly 10:00–14:00 CAT, so treat these prints as the latest board state at capture rather than a reconciled end-of-day settlement. Figures are the exchange's own — no manual adjustments.

---

## 1. Market Summary

| Metric | Value |
|---|---|
| LASI Index | **24,626.43** |
| Change (session) | **-61.72 (-0.25%)** |
| Trades | 609 |
| Volume | 68,332 shares |
| Turnover | **K549,700 (K0.55m)** |
| Market cap (total) | K320.14 billion |
| Market cap (ex-Shoprite) | K137.66 billion |
| Breadth | 2 advancers / 5 decliners / 16 unchanged |

The index gave back 0.25% to 24,626.43, an implied prior close of 24,688.15. That extends the soft patch from Tuesday's 24,937.13 and puts the LASI roughly 1.2% below where it started the week — a grind lower rather than a break.

The tape is thinner than Tuesday's: 609 trades and K0.55m of turnover versus 810 trades and K0.69m. Liquidity stayed lopsided — **CECZ alone was 51.5% of value traded** (K283,371), and the top five names accounted for ~92% of the day's cash.

### Most active by value
1. **CECZ** — K283,371 (78 trades, 18,904 shares) at K14.99
2. **ATEL** — K74,686 (31 trades, 335 shares) at K223.05
3. **ZNCO** — K63,295 (94 trades, 7,112 shares) at K8.90
4. **DCZM** — K52,863 (12 trades, 1,923 shares) at K27.49
5. **CHIL** — K30,521 (36 trades, 606 shares) at K50.49

### Most active by volume
1. **KLRE** — 25,087 shares (K8,861)
2. **CECZ** — 18,904 shares
3. **ZNCO** — 7,112 shares
4. **REIZUSD** — 4,712 shares (K460)
5. **ZMBF** — 3,792 shares (K6,470)

Retail-sized clips in the sub-K1 names (KLRE, REIZUSD, SCBL) are still driving share counts while institutional value sits in CECZ, ATEL and ZNCO.

---

## 2. Notable Movers

**Advancers (2)**
- **SCBL +1.02% to K0.99** (+K0.01, 2,735 shares, 51 trades) — Standard Chartered nudged back toward K1.00. On a one-cent tick the percentage is cosmetic; what matters is that it traded 51 times, making it one of the busiest small-ticket names.
- **ZFCO +0.34% to K2.97** (+K0.01, 1,813 shares) — Zambia Forestry continues to oscillate on a thin float.

**Decliners (5)**
- **REIZUSD -9.09% to K0.10** (-K0.01, 4,712 shares) — the largest percentage fall on the board, but it is a one-cent move on a ten-cent USD-denominated counter. Real Estate Investments Zambia is a liquidity artefact here, not a signal.
- **KLRE -2.78% to K0.35** (-K0.01, 25,087 shares, 102 trades) — Klapton Reinsurance topped volume with the most prints of any counter. Persistent one-cent slippage on high share counts is worth watching; the reinsurer has been leaking value.
- **ZMBF -0.58% to K1.71** (-K0.01, 3,792 shares, 45 trades) — Zambeef eased on moderate two-way flow.
- **ZNCO -0.56% to K8.90** (-K0.05, 7,112 shares, 94 trades) — the previous session's limit-up print is being given back in an orderly way. That is the healthy version of the retrace flagged on Tuesday: no cliff-edge reversal, just profit-taking into K8.90.
- **CHIL -0.02% to K50.49** (-K0.01, 606 shares, 36 trades) — Chilanga Cement effectively flat, but note the price sits well below the K57.63 level quoted in Tuesday's brief; a re-rating happened between the two snapshots.

**Unchanged but liquid:** ATEL held K223.05 on 31 trades (K74.7k), DCZM K27.49 (12 trades, K52.9k), ZCCM-IH K148 (17 shares), ZSUG K67.97, SHOP K350, PUMA K2.07, BATZ K13.49, ZABR K6.70, NATB K2.60, FARM K5.80, MAFS K1.81, ZMRE K2.74, ZMFA K33.50, CCAF K0.76, AECI K115, BATA K9.53.

**Price verification:** all 29 tickers in `companies.json` carry a populated, non-zero price — **no nulls, no zeros**. Prices are exactly as returned by the Playwright scraper from luse.co.zm; **nothing was adjusted manually**. Note that AECI, BATA, SHOP and FARM quoted without dealing (no volume on the board), and INDO, LUSW, RFIN, PRIM and ENRG remained dormant.

---

## 3. Currency

Rates are ZMW per 1 unit of foreign currency (higher = kwacha weaker). Market mid from open.er-api.com, refreshed 2026-11-06 07:48 UTC.

| Pair | Market mid (6 Nov) | vs 4 Nov snapshot | Read |
|---|---|---|---|
| USD/ZMW | **20.3157** | +0.26% | softer |
| GBP/ZMW | **27.3598** | +0.65% | softer |
| EUR/ZMW | **22.8175** | +0.60% | softer |
| ZAR/ZMW | **1.2400** | +1.37% | softer |
| BWP/ZMW | **1.4323** | +1.05% | softer |
| CNY/ZMW | **3.0386** | -0.06% | flat |

**Read:** this is the first genuinely broad-based kwacha soft patch in weeks. Every cross in the basket — sterling, euro, rand, pula — costs more kwacha than it did two days ago, with only the yuan flat. That pattern points to kwacha selling rather than a single cross moving, which is a different signal from the cross-currency noise seen on 3 November.

USD/ZMW at 20.3157 has slipped out of the 20.10–20.30 band that held through late October and is now testing the top of the recent range. The BoZ official mid was 20.2925 on 4 Nov (buy 20.2675 / sell 20.3175), so the market trades ~0.11% above the fix — a normal offshore premium. A third-party feed (allratestoday) reports the 6 Nov official mid at 20.271; boz.zm itself is JavaScript-gated, so that print is **unverified** and the 4 Nov figure remains the last confirmed official fix.

The rand move is the one to note: ZAR/ZMW +1.37% in two days is the largest basket move and usually reflects regional risk appetite rather than anything Zambia-specific.

**Background:** support comes from record copper output (~890k tonnes), reserves near US$5.5bn, a near-complete debt restructuring and the US$1.47bn IMF staff-level agreement; the IMF sees 5.6% growth in 2026. The offsets are a materially easier policy stance (MPR cut 250bps to 10.75% on 30 September with inflation back inside the 6–8% band), the 10% copper-concentrate export duty that took effect the same day, month-start corporate USD demand and rising fuel import costs.

**Watch:** 20.35 is the line. A clean break opens the 20.50 area; three-month range stays 19.60–20.60.

---

## 4. News Roundup

**Market / corporate**
- **CEC** — management has been publicly bullish on the 2026 share price and is reported to be eyeing a US$12bn investment pipeline (Mast). CECZ closed K14.99 after leading turnover for a second straight session; the narrative and the flow are finally pointing the same way.
- **ZCCM-IH / Mopani** — a public row has erupted between ZCCM-IH and a Mopani investor (Mast). The counter held K148 on 17 shares, but governance friction around Mopani is the kind of story that eventually re-prices the holding company's stake.
- **ZSUG** — Zambia Sugar has filed its FY2026 results with the LuSE; the stock closed unchanged at K67.97. Read the filing for the earnings movement flagged in the 22 October trading statement.
- **DCZM** — the interim dividend notice and mandatory offer circular from 12 October remain live events for minority holders; the stock was the fourth-largest by value (K52.9k on just 12 trades).
- **ZNCO** — no fresh SENS filing explains the give-back after Tuesday's limit-up. Flow-driven; treat K8.90 as the market's repricing of that spike.

**Macro**
- **IMF** — 5.6% growth projected for Zambia in 2026 on agriculture, mining and exports; the World Bank's October assessment is 5.2% average over 2026–2028 but warns it is not fast enough to cut poverty quickly.
- **Inflation vs prices** — inflation is near 6% but the price level is 2.29x its 2020 level (The Zambian Economist). That gap is the political economy behind the "Grow Zambia Agenda" framing.
- **Trade** — July 2026 recorded a K4.1bn surplus; a later print shows the surplus narrowing to K4.2bn on a monthly basis (ZBT).
- **Copper** — higher prices are being flagged as the opening for a restructured government balance sheet (Lusaka Times). Copper remains the single biggest swing factor for both the kwacha and the mining-linked counters.

**Infrastructure**
- **Zambia–Lobito Railway** — AFC has briefed President Hichilema after naming preferred EPC bidders; the 830km greenfield line would link the Copperbelt to Angola's Benguela railway and the Atlantic port of Lobito. ~US$1.32bn committed by lenders against a total cost reported at up to US$5bn, financial close targeted late 2027, completion 2030. Long-run logistics relief for ZCCM-IH and CECZ.

---

## 5. What to Watch

1. **Kwacha at 20.35** — the whole basket weakened together this week. A break of 20.35 changes the import-cost and inflation math into year-end.
2. **ZNCO** — does K8.90 hold, or does the limit-up fully retrace to the implied K8.10 pre-spike level?
3. **ZCCM-IH / Mopani governance** — a public dispute with an investor is a live risk for the K148 print.
4. **Liquidity concentration** — CECZ at 51.5% of turnover means the index reading is increasingly a one-stock story.
5. **Copper** — still the dominant driver of both the currency and the mining complex.

---

### Data notes
- Headline market cap differs between generated files: `market-close.json` reports K320.14bn total / K137.66bn ex-Shoprite, while `market-summary.json` carries K333.59bn. This brief uses `market-close.json`. The reconciliation gap has now persisted across multiple runs — worth fixing in the scraper rather than documenting again.
- CHIL is quoted at K50.49 here versus K57.63 in the 3 November brief. That is a genuine re-rating between snapshots, not a scraper error, but it deserves a SENS check if it moves again.
- Breadth (2/5/16) counts the 23 counters that appear on the exchange board; `companies.json` lists 29 tickers, five of which were dormant.
- Board captured at 09:56 UTC (11:56 CAT) while the session was still open — see the timing note at the top.

---
*Generated from official LuSE market data. Prices are unaudited exchange prints; this is not investment advice.*
