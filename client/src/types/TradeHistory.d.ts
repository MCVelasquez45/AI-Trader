// ============================
// 📦 Option Contract Interface
// ============================
// This defines the structure of an option contract associated with a trade.
// These details come from Polygon.io's options endpoint and snapshot data.

export interface OptionContract {
  contract: string;              // 🔗 Full contract symbol, e.g., "O:SOFI250711C00015000"
  strike_price: number;          // 🎯 Strike price of the option (e.g., 15)
  expiration_date: string;       // 📅 Expiration date (ISO format "YYYY-MM-DD" from backend or MongoDB)
  estimatedCost?: number;        // 💵 Total cost for the contract (premium * 100), optional

  // ✅ Additional fields from Polygon snapshot data
  ask?: number;                  // 📈 Current ask price
  bid?: number;                  // 📉 Current bid price
  delta?: number;                // ⚖️ Delta: Price sensitivity to underlying
  gamma?: number;                // 📐 Gamma: Rate of delta change
  implied_volatility?: number;   // 🌪️ IV: Expected future volatility
  open_interest?: number;        // 📊 Open Interest: liquidity metric
  contract_type?: string;        // 🎭 Type: 'call' or 'put'
  ticker?: string;               // 🏷️ Short ticker symbol (e.g., "O:SOFI...")
  vega?: number;                 // 💨 Vega: Vol sensitivity
  theta?: number;                // ⌛ Theta: Time decay
}

// ============================
// 📊 Technical Indicator Interfaces
// ============================

export interface MACD {
  macd: number;            // 📈 MACD line
  signal: number;          // 📉 Signal line
  histogram: number;       // 🟩 MACD - Signal
}

export interface Indicators {
  rsi?: number;            // 🧮 RSI: Relative Strength Index
  vwap?: number;           // 🧮 VWAP: Volume Weighted Avg Price
  macd?: MACD;             // 📊 MACD metrics
}

// ============================
// 📘 Trade Record Interface
// ============================

export interface TradeRecord {
  _id: string;                         // 🆔 MongoDB document ID
  tickers: string[];                  // 📈 Ticker(s) in trade
  capital: number;                    // 💵 Capital used for trade
  riskTolerance: string;             // ⚖️ 'low', 'medium', 'high'
  entryPrice: number;                // 💵 Entry price of stock at trade time
  expiryDate: string;                // 📅 Option expiry (ISO: "YYYY-MM-DD")
  outcome: string;                   // 🟢 'win', 🔴 'loss', ⏳ 'pending'
  gptResponse: string;               // 🧠 GPT explanation summary
  gptPrompt: string;                 // 📜 Prompt sent to GPT
  recommendationDirection: string;  // 🎯 'call' or 'put'
  confidence: string;                // 💪 GPT confidence ('low', 'medium', 'high')

  // ✅ Optional trade details
  option?: OptionContract;           // 🎟️ Option contract data
  indicators?: Indicators;           // 📊 RSI, MACD, VWAP, etc.
  congressTrades?: string;           // 🏛️ CapitolTrades notes (legacy)
  congress?: any[];                  // 🏛️ Congressional trade data (new format)
  sentimentSummary?: string;         // 🗞️ News sentiment summary
  targetPrice?: number;              // 🎯 Target (profit)
  stopLoss?: number;                 // 🛑 Stop loss

  createdAt: string;                 // ⏰ When trade was created
}
