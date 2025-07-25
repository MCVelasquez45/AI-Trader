# 📘 AI-Trader Project Brief

## 🧠 Overview

This document consolidates all key documentation for the **AI Options Trading Assistant** project. Use this for onboarding, development, or debugging across frontend, backend, and AI components.

---

## 1️⃣ Project Description & Setup

### From `README.md`
# 🧠 AI Options Trading Assistant

**AI Options Trading Assistant** is a full-stack, GPT-4-powered stock options platform that mimics a professional analyst’s workflow. This tool streamlines the decision-making process by pulling live market data, technical indicators, and sentiment signals, then presenting a personalized trade recommendation using GPT-based analysis.

---

## 📌 Capabilities

- ✅ Analyze stock ticker and user capital
- ✅ Identify affordable in-the-money (ITM) option contracts
- ✅ Enrich data with sentiment, indicators, and congressional trades
- ✅ Construct structured GPT prompts for recommendations
- ✅ Persist recommendations to MongoDB Atlas
- ✅ Evaluate trade outcome post-expiry using Cron jobs

---

## ⚙️ Tech Stack

### Backend
- Node.js + Express.js
- MongoDB + Mongoose
- Polygon.io, Yahoo Finance APIs
- Puppeteer.js for scraping
- GPT-4 (OpenAI API)
- Cron Jobs (Win/Loss Monitoring)

### Frontend
- Vite + React + TypeScript
- Bootstrap 5.2 (via CDN)
- Axios for API requests
- Modular UI Components

---

## 🧠 GPT Prompt Criteria

Each recommendation includes:
- Stock Price, Strike, Expiry, Delta, OI, IV
- Technical Indicators (RSI, MACD, VWAP)
- Polygon.io sentiment score
- Scraped Congressional trading insights
- Risk tolerance and user capital
- GPT's confidence and exit strategy

---

## 🛠️ Local Development Setup

```bash
git clone https://github.com/MCVelasquez45/AI-Trader.git
cd AI-Trader
```

### Backend

```bash
cd server
npm install
cp .env.example .env
# Fill in OPENAI_API_KEY, POLYGON_API_KEY, MONGO_URI
npm run dev
```

### Frontend

```bash
cd ../client
npm install
cp .env.example .env
# Set: VITE_API_URL=http://localhost:4545/api
npm run dev
```

---

## 🌱 .env Configuration

### Backend

```env
OPENAI_API_KEY=your_openai_key
POLYGON_API_KEY=your_polygon_key
MONGO_URI=mongodb://localhost:27017/ai-trader
```

### Frontend

```env
VITE_API_URL=http://localhost:4545/api
```

---

## 🔭 Roadmap

- [x] MVP Pipeline (Prompt → Recommendation)
- [x] Cron-triggered evaluation and scoring
- [ ] RAG integration for GPT transparency
- [ ] SMS alerts via AWS
- [ ] Google Auth for user history
- [ ] Multi-account support and analytics dashboard

---

## 🧠 Vision

This project was created to emulate how a top-tier analyst evaluates trades by combining affordability, market data, institutional behavior, and sentiment. It is built with transparency, automation, and real-world learning in mind.

---

## 👤 Ownership & IP

This technology is the sole property of **Mark Velasquez**, protected under the MIT License with exclusive rights to:
- Extend or license its functionality
- Integrate third-party brokerage or trading APIs
- Publish performance metrics and datasets

---

## 👨‍💻 Maintainer

**Mark Velasquez**  
Remote Instructor | Full-Stack Developer | AI Trading Architect  
📫 mcvelasquez45@gmail.com  
🌐 GitHub: [@MCVelasquez45](https://github.com/MCVelasquez45)

---

## 📄 License

MIT License © 2025 Mark Velasquez  
Permission is granted to use, copy, modify, and distribute under the MIT License. Attribution required.


---

## 2️⃣ Data Source Integration Reference

### From `DataSourceDoc.md`
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



---

## 3️⃣ Trade Outcome Evaluation Logic

### From `evaluateExpiredTrades.md`
# 📊 Trade Evaluation Process — AI Options Trading Assistant

## 🧠 Purpose

The `evaluateExpiredTrades` function is responsible for analyzing and scoring all expired options trade recommendations. Once a trade’s expiration date has passed, the system uses market data to determine if the recommendation was successful (win/loss) based on its entry and exit prices.

---

## 🔧 Location

**File:** `utils/evaluateExpiredTrades.js`  
**Trigger:** Can be executed via `cron`, manually via script, or scheduled job runner like `node-cron`.

---

## ✅ Evaluation Logic Overview

| Step | Description |
|------|-------------|
| 1️⃣ | Fetch all trades with `outcome: "pending"` and `expiryDate <= now` |
| 2️⃣ | For each trade, retrieve the final close price using Polygon.io |
| 3️⃣ | Compare `exitPrice` vs `entryPrice` based on `call` or `put` logic |
| 4️⃣ | Update the trade document with outcome, exit price, and evaluation metadata |
| 5️⃣ | Save evaluation errors for traceability |

---

## 🔗 API Integration

**Endpoint Used:**  
`GET https://api.polygon.io/v1/open-close/:ticker/:date?adjusted=true&apiKey=YOUR_KEY`

**Purpose:**  
Retrieve the official adjusted **close price** for the stock on its **option expiry date**.

**Fallback Handling:**  
- If no valid close data is returned, the trade is skipped.
- Errors are logged and saved inside the trade document.

---

## 🧮 Outcome Calculation

| Trade Type | Outcome Logic |
|------------|---------------|
| `call`     | `exitPrice > entryPrice` → win |
| `put`      | `exitPrice < entryPrice` → win |
| Else       | loss |

Also calculates and stores:

- `percentageChange`: `(exitPrice - entryPrice) / entryPrice * 100`
- `evaluatedAt`: Timestamp of evaluation
- `exitPrices`: Object mapping tickers to their final close price
- `evaluationSnapshot`: Raw Polygon response per ticker for auditing
- `evaluationErrors`: Logs any issues encountered

---

## 🕐 Market Close Check

- Evaluations **only run after 4PM EST (20:00 UTC)**.
- This ensures the daily close price is final and avoids premature scoring.

---

## 📦 MongoDB Fields Updated

| Field | Description |
|-------|-------------|
| `outcome` | `"win"` or `"loss"` |
| `exitPrices` | `{ ticker: finalClosePrice }` |
| `evaluationSnapshot` | Raw response from Polygon per ticker |
| `percentageChange` | Percent change between entry and exit |
| `evaluatedAt` | Timestamp of evaluation |
| `evaluationErrors` | Array of { ticker, error, timestamp } if applicable |

---

## 📋 Example Log Output

```bash
🕒 Evaluating expired trades at 2025-07-22T00:30:00Z
📊 Found 5 trades eligible for evaluation
📈 Getting close price for TSLA on 2025-07-19...
✅ TSLA → Outcome: win, Exit: $329.65, Change: +15.12%
📈 Getting close price for AAPL on 2025-07-19...
⚠️ Skipping AAPL — no close data
🏁 All expired trades evaluated


---

## 4️⃣ Polygon.io Options API Reference

### From `Polygon.ioOptionEndPointsDocs.md`

# 📡 Polygon.io Options API Reference (15-Minute Delayed Data)

This document outlines **all available Polygon.io options-related endpoints** based on your current plan. All market data is **delayed by 15 minutes** unless explicitly stated.

---

## 🧩 1. Options Contracts & Snapshots

---

### 🔢 Endpoint 001 — 🔍 Search All Option Contracts  
**GET** `/v3/reference/options/contracts`

**Description:** Returns a paginated list of all available option contracts. Use to build filters or contract search UIs.

**Sample Request:**
```bash
curl "https://api.polygon.io/v3/reference/options/contracts?order=asc&limit=10&sort=ticker&apiKey=YOUR_API_KEY"
````

---

### 🔢 Endpoint 002 — 📄 Option Contract Details

**GET** `/v3/reference/options/contracts/{contract_id}`

**Description:** Fetches full contract metadata for a single option, including its underlying asset, type (call/put), strike, expiration, and exercise style.

**Sample Request:**

```bash
curl "https://api.polygon.io/v3/reference/options/contracts/O:SPY251219C00650000?apiKey=YOUR_API_KEY"
```

---

### 🔢 Endpoint 003 — 📉 Previous Close (Single Contract)

**GET** `/v2/aggs/ticker/{contract_id}/prev`

**Description:** Gets the previous day's OHLCV for a single option contract.

**Sample Request:**

```bash
curl "https://api.polygon.io/v2/aggs/ticker/O:SPY251219C00650000/prev?adjusted=true&apiKey=YOUR_API_KEY"
```

---

### 🔢 Endpoint 004 — 📸 Single Contract Snapshot

**GET** `/v3/snapshot/options/{underlying}/{contract_id}`

**Description:** Returns real-time (15-min delayed) snapshot for a specific option, including Greeks, last quote, and trade data.

**Sample Request:**

```bash
curl "https://api.polygon.io/v3/snapshot/options/EVRI/O:EVRI260116C00015000?apiKey=YOUR_API_KEY"
```

---

### 🔢 Endpoint 005 — 📸 All Contracts for Underlying

**GET** `/v3/snapshot/options/{underlying}`

**Description:** Returns all active options contracts for an underlying asset (e.g., AAPL), sorted and paginated.

**Sample Request:**

```bash
curl "https://api.polygon.io/v3/snapshot/options/EVRI?order=asc&limit=10&sort=ticker&apiKey=YOUR_API_KEY"
```

---

### 🔢 Endpoint 006 — 🧠 Market-Wide Option Snapshot

**GET** `/v3/snapshot`

**Description:** Returns snapshot data across multiple option tickers — suitable for scanning.

**Sample Request:**

```bash
curl "https://api.polygon.io/v3/snapshot?order=asc&limit=10&sort=ticker&apiKey=YOUR_API_KEY"
```

---

## 📉 2. Technical Indicators (Per Contract)

---

### 🔢 Endpoint 007 — SMA (Simple Moving Average)

```bash
curl "https://api.polygon.io/v1/indicators/sma/O:SPY241220P00720000?...&apiKey=YOUR_API_KEY"
```

### 🔢 Endpoint 008 — EMA (Exponential Moving Average)

```bash
curl "https://api.polygon.io/v1/indicators/ema/O:SPY241220P00720000?...&apiKey=YOUR_API_KEY"
```

### 🔢 Endpoint 009 — MACD

```bash
curl "https://api.polygon.io/v1/indicators/macd/O:SPY241220P00720000?...&apiKey=YOUR_API_KEY"
```

### 🔢 Endpoint 010 — RSI

```bash
curl "https://api.polygon.io/v1/indicators/rsi/O:SPY241220P00720000?...&apiKey=YOUR_API_KEY"
```

**Use Case for All Above:** Use technical indicators to analyze momentum, trend, and potential entry signals for selected contracts.

---

## 🏛️ 3. Market Reference & Conditions

---

### 🔢 Endpoint 011 — Options Exchanges

**GET** `/v3/reference/exchanges?asset_class=options`

```bash
curl "https://api.polygon.io/v3/reference/exchanges?asset_class=options&locale=us&apiKey=YOUR_API_KEY"
```

**Use Case:** Determine which exchange the option was listed on (e.g., CBOE, NYSE Arca).

---

### 🔢 Endpoint 012 — Market Status

**GET** `/v1/marketstatus/now`
**GET** `/v1/marketstatus/upcoming`

```bash
curl "https://api.polygon.io/v1/marketstatus/now?apiKey=YOUR_API_KEY"
```

**Use Case:** Validate if the market is open before executing data fetch or analysis logic.

---

### 🔢 Endpoint 013 — Options Trade Conditions

**GET** `/v3/reference/conditions?asset_class=options`

```bash
curl "https://api.polygon.io/v3/reference/conditions?asset_class=options&order=asc&limit=10&sort=asset_class&apiKey=YOUR_API_KEY"
```

**Use Case:** Interpret condition codes associated with options trades (e.g., auction prints, non-standard trades).

---

# ✅ Summary

| Area                     | Coverage |
| ------------------------ | -------- |
| Contract Metadata        | ✅ Yes    |
| Market Snapshots         | ✅ Yes    |
| Greeks & Quotes          | ✅ Yes    |
| Technical Indicators     | ✅ Yes    |
| Market Status            | ✅ Yes    |
| Exchange & Condition Ref | ✅ Yes    |

**Total Endpoints Documented**: 13
**Data Delay**: 15 Minutes
**Plan Level**: Standard (Non-Real-Time)


```


---

## 5️⃣ Polygon.io Stock API Reference

### From `Polygon.ioStockEndPointsDocs.md`

# 📡 Polygon.io Stock Endpoints Reference (15-Minute Delayed Data)

This document outlines all stock-related API endpoints available through your **Polygon.io** subscription. These endpoints provide delayed (15-minute) market data unless otherwise noted. Use this reference to integrate real-time stock metadata, historical price data, indicators, and corporate events into your app.

> ⚠️ **Note**: All market data is delayed by 15 minutes for compliance and transparency. Display this clearly to users.

---

## 🔍 1. Reference & Metadata

---

### 🔢 Endpoint 001 — List All Active Tickers  
**GET** `/v3/reference/tickers`

#### Description  
Returns a paginated list of all active tickers for the given market and asset class.

#### Parameters

| Name   | Required | Type   | Example  | Description                          |
|--------|----------|--------|----------|--------------------------------------|
| market | ✅ Yes   | string | `stocks` | Market type                          |
| active | ✅ Yes   | bool   | `true`   | Only return currently active tickers |
| order  | ❌ No    | string | `asc`    | Sort order                           |
| limit  | ❌ No    | number | `100`    | Number of results per page           |
| sort   | ❌ No    | string | `ticker` | Field to sort by                     |

#### Sample Request
```bash
curl -X GET "https://api.polygon.io/v3/reference/tickers?market=stocks&active=true&order=asc&limit=100&sort=ticker&apiKey=YOUR_API_KEY"
````

#### Use Case

Used to populate dropdowns, auto-suggestions, or validate stock tickers before querying quote data or options chains.

---

### 🔢 Endpoint 002 — Get Ticker Metadata

**GET** `/v3/reference/tickers/{ticker}`

#### Description

Returns detailed metadata for a given ticker including name, exchange, and classification.

#### Sample Request

```bash
curl -X GET "https://api.polygon.io/v3/reference/tickers/AAPL?apiKey=YOUR_API_KEY"
```

#### Use Case

Used to retrieve company details when a user searches a specific symbol (e.g., showing company name and industry next to stock price).

---

### 🔢 Endpoint 003 — Get Ticker Types

**GET** `/v3/reference/tickers/types`

#### Description

Returns a list of possible ticker types and descriptions (e.g., Common Stock, ETF, etc.).

#### Sample Request

```bash
curl -X GET "https://api.polygon.io/v3/reference/tickers/types?asset_class=stocks&locale=us&apiKey=YOUR_API_KEY"
```

#### Use Case

Used internally to tag or filter types of instruments returned from `/tickers`.

---

### 🔢 Endpoint 004 — Related Companies

**GET** `/v1/related-companies/{ticker}`

#### Description

Returns tickers of companies related to the specified ticker by sector or industry.

#### Sample Request

```bash
curl -X GET "https://api.polygon.io/v1/related-companies/AAPL?apiKey=YOUR_API_KEY"
```

#### Use Case

Used in “you may also like” features or to build comparison charts between competitors.

---

## 📈 2. Aggregate & Historical Data

---

### 🔢 Endpoint 005 — Historical Price Range (OHLC)

**GET** `/v2/aggs/ticker/{ticker}/range/1/day/{from}/{to}`

#### Description

Returns historical aggregate bars over a date range.

#### Sample Request

```bash
curl -X GET "https://api.polygon.io/v2/aggs/ticker/AAPL/range/1/day/2023-01-01/2023-03-01?adjusted=true&sort=asc&limit=100&apiKey=YOUR_API_KEY"
```

#### Use Case

Used to plot candlestick charts, display price movement history, or calculate moving averages.

---

### 🔢 Endpoint 006 — Grouped Daily Bars

**GET** `/v2/aggs/grouped/locale/us/market/stocks/{date}`

#### Description

Returns daily OHLC data for all stocks on a given trading day.

---

### 🔢 Endpoint 007 — Previous Close

**GET** `/v2/aggs/ticker/{ticker}/prev`

#### Description

Fetches the most recent closing bar data for a ticker.

---

## 📊 3. Market Snapshots

---

### 🔢 Endpoint 008 — Snapshot (Single Ticker)

**GET** `/v2/snapshot/locale/us/markets/stocks/tickers/{ticker}`

#### Description

Returns a full snapshot of current data for a ticker: open, high, low, volume, and real-time last quote.

---

### 🔢 Endpoint 009 — All Stock Snapshots

**GET** `/v2/snapshot/locale/us/markets/stocks/tickers`

#### Description

Bulk data for all tickers. Useful for scanning or dashboards.

---

### 🔢 Endpoint 010 — Top Gainers

**GET** `/v2/snapshot/locale/us/markets/stocks/gainers`

#### Description

Returns top gainers by % change on the day.

---

## 📉 4. Technical Indicators

---

### 🔢 Endpoint 011 — Simple Moving Average (SMA)

**GET** `/v1/indicators/sma/{ticker}`

---

### 🔢 Endpoint 012 — Exponential Moving Average (EMA)

**GET** `/v1/indicators/ema/{ticker}`

---

### 🔢 Endpoint 013 — MACD

**GET** `/v1/indicators/macd/{ticker}`

---

### 🔢 Endpoint 014 — RSI

**GET** `/v1/indicators/rsi/{ticker}`

> ✅ Each indicator endpoint supports parameters for `timespan`, `series_type`, and `window`.

---

## 🏛️ 5. Market Metadata

---

### 🔢 Endpoint 015 — Exchange List

**GET** `/v3/reference/exchanges`

---

### 🔢 Endpoint 016 — Market Status

**GET** `/v1/marketstatus/now`
**GET** `/v1/marketstatus/upcoming`

---

## 🧾 6. Corporate Events

---

### 🔢 Endpoint 017 — IPO Calendar

**GET** `/vX/reference/ipos`

---

### 🔢 Endpoint 018 — Stock Splits

**GET** `/v3/reference/splits`

---

### 🔢 Endpoint 019 — Dividends

**GET** `/v3/reference/dividends`

---

## 📑 7. Financials & Short Interest

---

### 🔢 Endpoint 020 — Financial Filings

**GET** `/vX/reference/financials`

---

### 🔢 Endpoint 021 — Ticker Events

**GET** `/vX/reference/tickers/{ticker}/events`

---

### 🔢 Endpoint 022 — Short Interest

**GET** `/stocks/v1/short-interest`

---

## ✅ Summary

| Area                     | Coverage |
| ------------------------ | -------- |
| Contract Metadata        | ✅ Yes    |
| Market Snapshots         | ✅ Yes    |
| Greeks & Quotes          | ✅ Yes    |
| Technical Indicators     | ✅ Yes    |
| Market Status            | ✅ Yes    |
| Exchange & Condition Ref | ✅ Yes    |

**Total Endpoints Documented**: 22
**Data Delay**: 15 Minutes
**Plan Level**: Standard (Non-Real-Time)



---

## 6️⃣ Hosting, Deployment & Authentication

- 🌐 **Live Frontend Deployment**: [https://ai-trader-uvj9.vercel.app/](https://ai-trader-uvj9.vercel.app/)
- 🖥️ **Local Development**: Fully supported for both frontend and backend via Vite (React + TypeScript) and Node.js + Express
- 🚀 **Backend Hosting**: Live backend is hosted via [Render.com](https://render.com)
- 🔐 **Authentication**: GitHub OAuth is integrated and used for user authentication
- ☁️ **Database**: MongoDB Atlas cluster is used for cloud-based persistent storage
- 📦 **Mongo Cloud Services**: Fully integrated with the MongoDB cloud suite for scaling and monitoring

> This setup supports both development and production environments with full-stack parity.
