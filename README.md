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
