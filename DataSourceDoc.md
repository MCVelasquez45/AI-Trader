# ✅ Full Endpoint & Data Source Reference (as of now)

---

## 📡 Polygon.io – API-Based Endpoints

| ID  | Endpoint                                                 | Purpose                                    | Source  |
| --- | -------------------------------------------------------- | ------------------------------------------ | ------- |
| 001 | `/v3/reference/tickers`                                  | List all active stock tickers              | Polygon |
| 002 | `/v3/reference/tickers/{ticker}`                         | Ticker/company metadata                    | Polygon |
| 003 | `/v3/reference/tickers/types`                            | Ticker classifications (Common Stock, ETF) | Polygon |
| 004 | `/v1/related-companies/{ticker}`                         | Related companies by sector                | Polygon |
| 005 | `/v2/aggs/ticker/{ticker}/range/...`                     | Historical OHLC price data                 | Polygon |
| 006 | `/v2/aggs/grouped/...`                                   | Daily grouped aggregates for all tickers   | Polygon |
| 007 | `/v2/aggs/ticker/{ticker}/prev`                          | Previous day's close                       | Polygon |
| 008 | `/v2/snapshot/locale/us/markets/stocks/tickers`          | Snapshot for all tickers                   | Polygon |
| 009 | `/v2/snapshot/locale/us/markets/stocks/tickers/{ticker}` | Single ticker snapshot                     | Polygon |
| 010 | `/v2/snapshot/locale/us/markets/stocks/gainers`          | Top daily gainers                          | Polygon |
| 011 | `/v1/indicators/sma/{ticker}`                            | SMA indicator (stocks & options)           | Polygon |
| 012 | `/v1/indicators/ema/{ticker}`                            | EMA indicator (stocks & options)           | Polygon |
| 013 | `/v1/indicators/macd/{ticker}`                           | MACD indicator                             | Polygon |
| 014 | `/v1/indicators/rsi/{ticker}`                            | RSI indicator                              | Polygon |
| 015 | `/v3/reference/exchanges`                                | Exchange info by asset class               | Polygon |
| 016 | `/v1/marketstatus/now`                                   | Is market currently open?                  | Polygon |
| 017 | `/v1/marketstatus/upcoming`                              | Future market schedule                     | Polygon |
| 018 | `/v3/reference/splits`                                   | Corporate split events                     | Polygon |
| 019 | `/v3/reference/dividends`                                | Dividend schedules                         | Polygon |
| 020 | `/vX/reference/ipos`                                     | IPO listing data                           | Polygon |
| 021 | `/vX/reference/financials`                               | Public filings and financials              | Polygon |
| 022 | `/vX/reference/tickers/{ticker}/events`                  | Ticker-specific company events             | Polygon |
| 023 | `/stocks/v1/short-interest`                              | Legacy short interest data                 | Polygon |

---

## 🧩 Polygon.io – Options-Specific Endpoints

| ID  | Endpoint                                          | Purpose                                       | Source  |
| --- | ------------------------------------------------- | --------------------------------------------- | ------- |
| 030 | `/v3/reference/options/contracts`                 | Search for options contracts                  | Polygon |
| 031 | `/v3/reference/options/contracts/{contract_id}`   | Get one option’s metadata                     | Polygon |
| 032 | `/v2/aggs/ticker/{contract_id}/prev`              | Previous day OHLC for one option              | Polygon |
| 033 | `/v3/snapshot/options/{underlying}`               | All options contracts for a ticker            | Polygon |
| 034 | `/v3/snapshot/options/{underlying}/{contract_id}` | Snapshot for one contract (IV, Greeks, quote) | Polygon |
| 035 | `/v3/snapshot`                                    | Market-wide options scanner                   | Polygon |
| 036 | `/v3/reference/conditions?asset_class=options`    | Trade condition definitions                   | Polygon |

---

## 🌐 Yahoo Finance – Public Endpoints (Used for Fallbacks)

| ID  | Endpoint                                                     | Purpose                                | Source |
| --- | ------------------------------------------------------------ | -------------------------------------- | ------ |
| 040 | `https://query1.finance.yahoo.com/v8/finance/chart/{ticker}` | Stock chart data, fallback             | Yahoo  |
| 041 | `getStockPrice()`                                            | Grabs current price via chart metadata | Yahoo  |

---

## 🧠 GPT-4 (OpenAI Assistant)

| ID  | Function               | Purpose                                                               | Source     |
| --- | ---------------------- | --------------------------------------------------------------------- | ---------- |
| 050 | `runOptionAssistant()` | Sends GPT prompt with context (price, RSI, IV, news, Congress trades) | OpenAI API |
| 051 | `OPTION_ASSISTANT_ID`  | GPT assistant instance ID                                             | OpenAI API |

---

## 🏛️ CapitolTrades Scraping (Puppeteer)

| ID  | Module                          | Purpose                                                              | Source        |
| --- | ------------------------------- | -------------------------------------------------------------------- | ------------- |
| 060 | `tickerToIssuerId(ticker)`      | Resolves a ticker (e.g. TSLA) to CapitolTrades issuer ID             | CapitolTrades |
| 061 | `scrapeCapitolTrades(issuerId)` | Scrapes all trade disclosures from Congress for one stock            | CapitolTrades |
| 062 | `scrapePoliticianProfile(url)`  | Optional scrape of Congressperson's public profile (bio, committees) | CapitolTrades |

---

## 📊 Local Indicator Calculations

| ID  | Module                         | Purpose                                                     | Source |
| --- | ------------------------------ | ----------------------------------------------------------- | ------ |
| 070 | `calculateIndicators(candles)` | Uses `technicalindicators` lib to compute RSI, VWAP, MACD   | Local  |
| 071 | `getMinuteCandles()`           | Calls Polygon & Yahoo to collect candle data for indicators | Mixed  |

---

## 📰 News Sentiment

| ID  | Endpoint                         | Purpose                                       | Source  |
| --- | -------------------------------- | --------------------------------------------- | ------- |
| 080 | `/v2/reference/news?ticker=TSLA` | Fetches 5 most recent news articles by ticker | Polygon |

---

## ✅ Summary

| Category                 | Count | Tools Used                      |
| ------------------------ | ----- | ------------------------------- |
| Polygon Stock Endpoints  | 23    | Aggregates, snapshots, metadata |
| Polygon Options          | 7     | Contracts, Greeks, scanner      |
| Yahoo Finance (Fallback) | 2     | Chart API, pricing              |
| OpenAI GPT               | 2     | GPT Assistant w/ indicators     |
| CapitolTrades Scraping   | 3     | Puppeteer automation            |
| News + Indicators        | 2     | Polygon + `technicalindicators` |

