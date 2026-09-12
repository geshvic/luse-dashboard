# LuSE Daily Brief — Saturday, 12 September 2026

## Market Summary
- **LASI:** 26,175.07 (**▼ 15.71 / −0.06%**)
- **Session:** 654 trades | 149,958 shares | Turnover **K1.96M**
- **Market Cap:** K336.30bn total (K144.61bn excl. Shoprite)
- **Breadth:** 2 advancers, 4 decliners, 17 unchanged
- **Data source:** luse.co.zm (official, Playwright scrape, as-of 2026-09-12)

> ⚠️ **Data note:** the official Playwright scrape (luse.co.zm) returned all **23**
> quoted tickers with verified, non-null prices — no gaps. However, the session figures are
> **identical to the previous three collections** (LASI 26,175.07; 654 trades; K1.96M turnover;
> same movers as 10 Sep / 11 Sep). This indicates luse.co.zm has **not yet published a new
> trading session** since the 10 Sep close — the page is still serving the latest posted
> session. No figures were altered or invented; the scraper output is reported verbatim.

## Notable Movers
| Ticker | Price (K) | Change | Note |
|---|---|---|---|
| ZABR | 6.70 | **+3.08%** | Top gainer |
| SCBL | 1.23 | +0.82% | Standard Chartered; sale of wealth/retail business update (4 Sep) |
| ZNCO | 9.43 | −0.11% | Second-most active by volume |
| PUMA | 2.31 | −2.53% | Interim results notice (5 Sep) |
| REIZUSD | 0.14 | **−6.67%** | REIZ rights & bonus share issue offer doc (7 Sep) |
| NATB | 2.60 | **−8.45%** | Worst decliner |

**Most active by value:** CECZ (K832,790), ATEL (K606,816), CHIL (K229,099), DCZM (K127,723), ZCCM-IH (K52,895)
**Most active by volume:** KLRE (64,339), CECZ (53,902), REIZUSD (35,310), ZMBF (8,336), DCZM (5,196)

## Currency (ZMW per 1 unit of foreign currency)
| Pair | Mid | d/d | Trend |
|---|---|---|---|
| USD | 19.1975 | −0.10% | stable |
| GBP | 25.9747 | −0.09% | stable |
| EUR | 22.3055 | −0.09% | stable |
| ZAR | 1.2008 | −0.01% | stable |
| BWP | 1.3787 | −0.41% | strengthening |
| CNY | 2.8777 | +0.17% | stable |

- Kwacha marginally firmer: USD/ZMW mid **~19.20**, vs ~19.22 a week ago and ~18.83 a month ago — still inside the broad 18.40–19.24 consolidation band. The Zambian Economist reported the kwacha trading between roughly **K19.07–19.37** across the 7–11 Sep week, ending near **K19.24** (marginally softer w/w).
- **MPR held at 13.25%** (Aug 2026 MPC, 26 Aug) — lowest since mid-2024; **next MPC decision due 30 September 2026**.
- Latest BOZ indicative USD/ZMW mid-rate **19.1461** (buy 19.1211 / sell 19.1711), 4 Sep 2026 (boz.zm).
- Rates auto-verified against **open.er-api.com** this cycle (12 Sep 2026, 00:02 UTC) — unchanged from the prior refresh.

## News Roundup
- **Macro — weekly wrap (7–11 Sep, The Zambian Economist):** all **224 newly elected MPs were sworn in on Monday 7 September**, opening the Thirteenth Parliament that must pass the **2027 National Budget** and the **2027–2031 Medium-Term Revenue Strategy**. **August inflation eased to 6.2%** — lowest since February 2018 and inside BoZ's 6–8% band — yet the **JCTR Basic Needs & Nutrition Basket** for a Lusaka family of five rose to **K12,000.94** (+K302.52 m/m). President Hichilema met **Vedanta Resources** on 10 September, pressing **Konkola Copper Mines / CopperTech** to fast-track power investment for a **500,000t copper target** and the government's **10 GW** electricity goal. The **ERB held September fuel pump prices unchanged**.
- **Dates to watch (30 Sep):** the **Bank of Zambia MPC** meets the same day a **10% export duty on copper concentrates** takes effect — a value-addition push that lands while inflation sits at 6.2%.
- **LuSE / Capital markets:** the **ZCMCA 2026 Zambia Capital Markets Conference & Awards** is set for **Livingstone, 30 Sep – 2 Oct 2026** (theme: *Capital Markets 2030: Mobilising Investment for Economic Transformation and Sustainable Growth*). On the SENS board this cycle: BATA H1 results (8 Sep), REIZ rights & bonus share issue offer document (7 Sep) and change in directorate (31 Aug), SCBL market update on the sale of its wealth & retail business (4 Sep), BATZ interim-results + interim-dividend notices (4 Sep), CHIL interim dividend (3 Sep) and unaudited H1 results (2 Sep), CEC change in company secretary (3 Sep), SHOP reviewed FY2026 results & cash dividend (2 Sep), and the MFS mandatory-offer second announcement (4 Sep).
- **Mining / Energy:** "Konkola's Copper Expansion Shows Zambia's Next Mining Bottleneck Is Power" (Uchumi360, 11 Sep) — power supply flagged as the constraint on the next leg of copper growth; earlier, Konkola Deep pushing toward 300,000t on CopperTech's US$1.5bn commitment.
- **Commodities / FX:** Copper remains the kwacha's key driver; the kwacha ranks among 2026's best-performing currencies on copper strength and yuan-denominated mining-tax flows.
- **Agriculture:** 2027 agriculture budget expectations — "invest where farmers produce" (The Mast); El Niño readiness questioned.

## Data Sources & Pipeline
- Prices: luse.co.zm via stealth Playwright (`scripts/fetch-luse-data.js`)
- Currency: open.er-api.com (auto) + BOZ MPR (manual)
- News: multi-source refresh (Zambian Business Times, The Mast, Mwebantu, The Zambian Economist, Bloomberg, Reuters, LuSE Official)

*Generated by LuSE Daily Close pipeline — data as-of 2026-09-12 collection (latest session published on luse.co.zm).*
