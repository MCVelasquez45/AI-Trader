# 🧠 AI-Trader

> An AI-powered trading assistant that analyzes stock indicators and provides GPT-4-generated trade recommendations based on user risk tolerance and capital.

---

## 🚀 Project Overview

**AI-Trader** is a full-stack application designed to support traders with AI-generated insights. It:

* Accepts user inputs: ticker symbols, risk tolerance, and capital
* Pulls live market data using Polygon.io and Yahoo Finance
* Calculates technical indicators (RSI, VWAP, MACD)
* Sends data to GPT-4 to generate a trade strategy recommendation
* Stores all trade recommendations and their outcomes in MongoDB
* Includes auto-evaluation logic for determining trade outcomes

---

## 🔧 MVP Tech Stack

| Layer           | Technology                        |
| --------------- | --------------------------------- |
| Frontend        | Vite + React + Bootstrap          |
| Backend         | Node.js + Express + Vercel/Render |
| AI Integration  | OpenAI GPT-4 API                  |
| Market Data     | Polygon.io + Yahoo Finance        |
| Database        | MongoDB Atlas                     |
| Auth (optional) | Auth0 or Supabase Auth            |
| Hosting         | Vercel (Frontend), Railway (API)  |
| Shortcut Domain | Optional: `.new` via Google       |

---

## ✅ Key Features

* **TradeForm**: Users enter tickers, capital, and risk level
* **AI Analysis**: GPT-4 interprets market indicators and returns a recommendation
* **Trade History**: Stores and displays all past trades, entry/exit price, and outcome
* **Auto Evaluation**: Trades are re-evaluated after expiry to determine win/loss status

---

## 📂 Directory Structure

```
AI-Trader/
├── server/                # Express backend
│   ├── controllers/       # Main API logic
│   ├── jobs/              # Scheduled tasks (e.g., auto-evaluation)
│   ├── models/            # Mongoose models
│   ├── routes/            # Express routes
│   ├── utils/             # Indicator calculations, price fetching
│   └── server.js          # Main server entry point
│
├── client/                # Vite + React frontend
│   ├── src/
│   │   ├── components/    # TradeForm, TradeHistory
│   │   ├── api/           # Axios API helpers
│   │   ├── pages/         # Dashboard
│   │   └── App.jsx        # Main entry
│
├── .env                   # Environment variables (not committed)
└── README.md              # Project documentation
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
cp .env.example .env  # Add MongoDB, OpenAI, and Polygon keys
npm run dev
```

### 3. Frontend Setup

```bash
cd ../client
npm install
cp .env.example .env  # Add VITE_API_URL if needed
npm run dev
```

### 4. (Optional) Evaluate Expired Trades

```bash
cd server
node jobs/evaluateExpiredTrades.js
```

---

## 📈 Live Preview

Coming soon — deployed version on Vercel with `.new` domain support.

---

## ✨ Roadmap

* [x] GPT integration
* [x] Technical indicator calculations
* [x] Trade history storage
* [x] Expiry-based trade evaluation
* [ ] User authentication (Supabase/Auth0)
* [ ] Chart overlays for RSI/MACD
* [ ] `.new` domain launch for instant access
* [ ] Multi-user dashboards

---

## 🛡 Security Notes

* All sensitive API keys are stored server-side only
* Rate limiting and validation are used to protect backend endpoints
* MongoDB access is IP-restricted and protected with environment secrets

---

## 🤝 Contributing

Pull requests and issues are welcome. Please fork the repo and open a PR with a clear description.

---

## 📜 License

MIT License

Copyright (c) 2025 Mark Velasquez and Patrick Mikes

This project, including its architecture, technical implementations, and trade analysis methodology, is the intellectual property of Mark Velasquez. While the AI-Trader system is released under the MIT license to encourage open collaboration and innovation, all core technologies and design patterns are protected under copyright.

We actively welcome contributors who share our mission of improving access to intelligent trading tools. By contributing, you agree that your contributions may be incorporated into this copyrighted work and redistributed under the terms of this license.

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


---

## 👨‍💼 Maintainers

**Mark Velasquez**
Remote Instructor, Full-Stack Developer
[GitHub Profile](https://github.com/MCVelasquez45)

**Pat Mikes**
Remote Instructor,Full-Stack Developer
[GitHub Profile](https://github.com/patmikesdev/patmikesdev)


