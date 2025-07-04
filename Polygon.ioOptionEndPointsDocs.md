
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
