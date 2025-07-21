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
