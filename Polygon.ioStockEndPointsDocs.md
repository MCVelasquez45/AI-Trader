
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

