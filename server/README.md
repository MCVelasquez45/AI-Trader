# 🧠 AI Options Trading Assistant

A full-stack GPT-powered stock options analyzer that helps traders identify high-confidence, high-liquidity **call options** based on:

- Real-time stock and option market data
- Technical indicators like RSI, MACD, and VWAP
- Sentiment analysis from live financial news
- Congressional trading activity
- Risk tolerance and capital amount

---

## 📌 Project Capabilities

This application acts like an **AI trading analyst**. It can:

✅ Recommend whether to BUY a call option based on GPT analysis  
✅ Break down market indicators (RSI, MACD Histogram, VWAP, Delta, OI, IV)  
✅ Parse and summarize news headlines for sentiment  
✅ Cross-check congressional purchases/sales of the stock  
✅ Suggest strike price, expiration, target, and stop loss  
✅ Display GPT recommendation confidence  
✅ Save and display a full history of past trades with expandable views  
✅ Integrate fallback logic when data is missing (target price, stop loss, VWAP, etc.)

---

## ⚙️ Tech Stack

### Backend
- Node.js + Express.js
- MongoDB with Mongoose
- Polygon.io API (options data + snapshots)
- Yahoo Finance (stock price API)
- OpenAI GPT-4 (recommendation + sentiment)
- House Stock Watcher (congressional trades)
- Cron Jobs (optional for future automated scans)

### Frontend
- Vite + React + TypeScript
- Bootstrap 5.2 for clean UI
- Axios for API requests
- Animated GPT typing dot loader
- Modular UI: Trade Form, Recommendation Panel, Trade History

---

## 🧠 AI Logic (GPT Prompt Composition)

The AI evaluates:

- Capital and risk tolerance
- Entry price, strike, expiration
- RSI, MACD Histogram
- Implied volatility, delta, open interest
- News sentiment (extracted headlines)
- Recent congressional trades
- Confidence level ("low", "medium", "high")

---

## 🧭 About This Project

As I began learning how to trade options, I quickly realized how **many factors can influence the strength or weakness of a position** — not just price charts. Volatility, sentiment, government activity, and timing all play major roles.

This project is my way of solving a real problem I encountered as a trader:  
> **How can I quickly and intelligently analyze complex market data from multiple sources before making an options trade?**

With the help of AI (OpenAI’s GPT), this app analyzes:
- **Technical indicators** like RSI, MACD, Delta, and Implied Volatility
- **Real-time option contract data** via Polygon.io
- **Financial news sentiment** using GPT-4’s ability to parse tone
- **Congressional trades** through House Stock Watcher to understand if lawmakers are quietly buying or selling
- **My own capital and risk tolerance**

This started as a personal tool, but it’s become a full-stack GPT-powered trading assistant that mirrors the decision-making process of a thoughtful, data-driven trader.

My goal is to create a system that helps any trader — beginner or advanced — make **better-informed options trades with confidence** by unifying all these data points into a single intelligent assistant.

---

## 🧠 Backend AI Logic & Data Flow

The backend is the intelligent core of the AI Options Trading Assistant. It aggregates, analyzes, and interprets data from multiple financial sources before passing it to GPT for a recommendation.

### 🔍 Core Workflow (Trade Analysis)

```mermaid
graph TD;
  A[User Input: ticker, capital, riskTolerance] --> B[Fetch Stock Price (Yahoo)];
  B --> C[Get Candle Data (Polygon or Yahoo fallback)];
  C --> D[Calculate Indicators (RSI, MACD, VWAP)];
  D --> E[Get Affordable Options (Polygon + Snapshot)];
  E --> F[Analyze News Sentiment (Polygon)];
  E --> G[Analyze Congressional Trades (House Stock Watcher)];
  F & G & D & B & E --> H[Compose GPT Prompt];
  H --> I[Submit to OpenAI Assistant];
  I --> J[Return GPT recommendation + confidence + summary];
```

---

### 📦 Controllers & Utility Modules

#### `calculateIndicators.js`
Calculates RSI, MACD (macd/signal/histogram), and VWAP using `technicalindicators`.

- **RSI**: Measures momentum and potential overbought/oversold conditions.
- **MACD**: Measures trend direction and strength.
- **VWAP**: Volume-weighted average price, important for intraday positioning.

📄 Source: Real-time candle data from Polygon.io or Yahoo fallback

---

#### `getAffordableOptionContracts.js`
Filters for affordable, high-liquidity **CALL options** within your capital and expiration window based on risk tolerance:

- ✅ Delta, IV, OI filters
- ✅ Midpoint cost (bid/ask avg × 100)
- ✅ Fallback to VWAP if pricing is missing

📄 Source: Polygon Options Chain + Snapshot API

---

#### `getStockPrice.js`
Fetches the **live stock price** from Yahoo Finance to use in the GPT prompt and entry calculations.

📄 Source: Yahoo Finance API

---

#### `getMinuteCandles.js`
Pulls recent daily OHLCV data for calculating indicators.

- 🟢 Primary: Polygon.io
- 🔁 Fallback: Yahoo Finance (3mo data)

📄 Used in: `calculateIndicators.js`

---

### 📡 External Intelligence Sources

#### `getNewsSentiment.js` (🗞️ News Feed)
Scrapes the 5 latest **news headlines** for a ticker from Polygon.io.

- GPT parses titles and summarizes tone (bullish, bearish, neutral)
- Used to contextualize the trade (especially for volatility and catalysts)

📄 Source: Polygon Reference News API

---

#### `getCongressTrades.js` (🏛️ Congressional Activity)
Pulls from **House Stock Watcher**’s public disclosures of congressional stock transactions.

- Filters for recent trades (2023+) and sorts by date
- Summarizes recent purchase/sale activity and the lawmakers involved
- GPT uses this to gauge institutional sentiment and timing

📄 Source: `https://house-stock-watcher-data.s3-us-west-2.amazonaws.com/data/all_transactions.json`

---

#### `openaiAssistant.js`
Sends a **custom-crafted prompt** to an OpenAI Assistant (GPT-4) with:

- Ticker + Price + Strike
- RSI, MACD Histogram, VWAP
- News Sentiment
- Congressional Trades
- Risk Tolerance and Capital

🧠 GPT replies with:
- `recommendation`: CALL, HOLD, etc.
- `confidence`: low, medium, high
- `gptResponse`: full reasoning summary

📄 Source: OpenAI API (beta Threads & Assistant SDK)

---

## 👤 Author

**Mark Velasquez**  
Remote Instructor | MERN Developer | AI App Architect  
GitHub: [@MCVelasquez45](https://github.com/MCVelasquez45)  
Email: mcvelasquez45@gmail.com
