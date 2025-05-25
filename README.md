# 🧠 AI Options Trading Assistant

A full-stack GPT-powered stock options analyzer that helps traders identify high-confidence, high-liquidity **call options** based on:

- Real-time stock and option market data
- Technical indicators like RSI, MACD, and VWAP
- Sentiment analysis from [Polygon.io News API](https://polygon.io/docs/rest/stocks/news)
- Congressional trading activity from [House Stock Watcher](https://housestockwatcher.com/)
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
- MongoDB + Mongoose
- Polygon.io API (live options data)
- Yahoo Finance API (stock price)
- OpenAI GPT-4 (prompt analysis)
- House Stock Watcher (congressional trades)
- Cron Jobs (for auto scans & evaluations)

### Frontend
- Vite + React + TypeScript
- Bootstrap 5.2
- Axios for API calls
- Modular Components: `TradeForm`, `TradeHistory`, `RecommendationPanel`

---

## 🧠 GPT Prompt Composition

The AI evaluates:

- Entry price, strike, expiration
- RSI, MACD Histogram, VWAP
- Implied volatility, delta, open interest
- News sentiment from headlines
- Congressional trades (recency, party, state)
- User’s capital + risk tolerance
- Confidence score and rationale

---

## 🧭 About This Project

As I began learning how to trade options, I realized how **many complex factors impact a trade decision** — volatility, momentum, institutional behavior, and even news headlines.

This app started as a personal tool to answer a critical question:

> *How can I intelligently evaluate multiple market signals before trading options?*

By combining data from Polygon.io, Yahoo Finance, and legislative disclosures — and feeding it all into GPT-4 — the system mimics a real-world analyst’s thought process.

My goal: help traders make smarter, faster decisions using AI.

---

## ✅ Key Features

- **TradeForm**: Users enter tickers, capital, and risk level
- **AI Analysis**: GPT-4 interprets market indicators and returns a recommendation
- **Trade History**: Displays all past trades, entry/exit price, and outcome
- **Auto Evaluation**: Trades are re-evaluated on expiry to determine win/loss

---

## 📂 Directory Structure

```
AI-Trader/
├── server/
│   ├── controllers/
│   ├── jobs/
│   ├── models/
│   ├── routes/
│   ├── utils/
│   └── server.js
├── client/
│   ├── public/
│   └── src/
│       ├── api/
│       ├── components/
│       ├── pages/
│       ├── types/
│       └── main.tsx
```

---

## 🧪 Local Setup

### 1. Clone the Repository

```bash
git clone https://github.com/MCVelasquez45/AI-Trader.git
cd AI-Trader
```

### 2. Backend Setup

```bash
cd server
npm install
cp .env.example .env
# Add your POLYGON_API_KEY, OPENAI_API_KEY, MONGO_URI
npm run dev
```

### 3. Frontend Setup

```bash
cd ../client
npm install
cp .env.example .env
# Set VITE_API_URL=http://localhost:4545/api
npm run dev
```

---

## 🔐 Environment Variables

### Backend `.env`

```env
OPENAI_API_KEY=your_openai_key
POLYGON_API_KEY=your_polygon_key
MONGO_URI=mongodb://localhost:27017/ai-trader
```

### Frontend `.env`

```env
VITE_API_URL=http://localhost:4545/api
```

---

## 🛣️ Roadmap

- ✅ MVP complete (GPT + Polygon + News + Congress)
- 🔜 Track outcomes with live market re-evaluation
- 🔜 Multi-user authentication
- 🔜 Admin dashboard for analysis
- 🔜 Cron job scanning every 5 minutes
- 🔜 Email/SMS alerts using SendGrid or Twilio

---

## ⚠️ Disclaimer

This project is intended for **educational and informational purposes only** and does **not constitute financial, investment, or trading advice**. AI recommendations may be inaccurate, incomplete, or outdated.

By using this tool, you agree that:
- You are responsible for any trades made using this app.
- You will consult a licensed financial advisor before making investment decisions.
- The developer is **not liable** for any financial loss or damages.

---

## 👨‍💻 Maintainers

**Mark Velasquez**  
Remote Instructor | Full-Stack Developer | AI App Architect  
GitHub: [@MCVelasquez45](https://github.com/MCVelasquez45)  
Email: mcvelasquez45@gmail.com

---

## 📄 License

MIT License © 2025 Mark Velasquez  
Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
```

