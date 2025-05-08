# 📊 AI Trade Analyzer – Full-Stack GPT-Powered Trading Assistant

This full-stack application uses real-time market data, technical indicators (RSI, MACD, VWAP), and GPT-4 to generate intelligent options trading recommendations based on user-defined capital and risk tolerance.

---

## ⚙️ Tech Stack

### Backend

* Node.js
* Express
* MongoDB
* Polygon.io API (real-time stock data)
* OpenAI GPT-4 API (trade strategy analysis)
* Cron Jobs (real-time ticker scanning)

### Frontend

* React
* Bootstrap 5
* Axios

---

## 🧠 Key Features

* GPT-4 powered trade analysis based on technical indicators
* Cron-based scanner saves live ticker data every 5 minutes
* RSI, MACD, and VWAP calculated in real-time
* Manual win/loss tracking with user notes
* Feedback loop for learning from trade outcomes
* Typing animation while GPT response is pending
* REST API for trades, outcomes, and historical stats
* Designed for expansion with rule-based and hybrid strategies

---

## 🚀 Getting Started

### 1. Clone the Repo

```bash
git clone https://github.com/yourusername/ai-trader.git
cd ai-trader
```

### 2. Setup Backend

```bash
cd server
npm install
cp .env.example .env
# Edit .env to include your POLY_API_KEY, OPENAI_API_KEY, and MONGO_URI
node server.js
```

### 3. Setup Frontend

```bash
cd client
npm install
cp .env.example .env
# Edit .env to set REACT_APP_API_URL=http://localhost:4545/api
npm start
```

---

## 📂 Project Structure

```
ai-trader/
├── server/
│   ├── config/
│   ├── controllers/
│   ├── jobs/
│   ├── models/
│   ├── routes/
│   └── utils/
├── client/
│   ├── public/
│   └── src/
│       ├── api/
│       ├── components/
│       ├── pages/
│       ├── App.jsx
│       └── index.js
```

---

## 🧪 Sample .env Files

### Backend (`server/.env`)

```
POLY_API_KEY=your_polygon_api_key
OPENAI_API_KEY=your_openai_api_key
MONGO_URI=mongodb://localhost:27017/ai-trader
```

### Frontend (`client/.env`)

```
REACT_APP_API_URL=http://localhost:4545/api
```

---

## 📈 Future Roadmap

* Add rule-based strategy engine
* Auto-evaluate trades from market movement
* Multi-user support and authentication
* Admin dashboard with performance analytics
* Email/SMS alerts using Twilio or SendGrid

---

## 👤 Author

**Mark Velasquez**
Remote Instructor | MERN Developer | AI & Market Automation Enthusiast
[GitHub Profile](https://github.com/yourusername) [https://github.com/MCVelasquez45](https://github.com/MCVelasquez45)

---

## 📝 License

MIT License

Copyright (c) 2025 Mark Velasquez

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

This project is for educational purposes and trade experimentation. Not financial advice.


