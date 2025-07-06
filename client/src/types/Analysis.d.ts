// ✅ Option contract format from backend
export interface OptionContract {
  ticker: string;                   // e.g., O:SPY250621C00380000
  strike_price: number;            // Option strike price
  expiration_date: string;         // ISO format, e.g., "2025-06-21"
  midPrice?: number;               // Midpoint between bid/ask (optional)
  ask?: number;                    // Ask price of contract
  bid?: number;                    // Bid price of contract
  implied_volatility?: number;     // IV percentage
  delta?: number;                  // Delta Greek
  gamma?: number;                  // Gamma Greek
  theta?: number;                  // Theta Greek
  vega?: number;                   // Vega Greek
  open_interest?: number;         // Open interest
  contract_type?: 'call' | 'put';  // Required for UI coloring, direction label
}

// ✅ MACD indicator shape
export interface MACD {
  macd: number;
  signal: number;
  histogram: number;
}

// ✅ Combined technical indicators structure
export interface Indicators {
  rsi?: number;        // Relative Strength Index
  vwap?: number;       // Volume Weighted Average Price
  macd?: MACD;         // MACD object with signal/histogram
}

// ✅ Main GPT response analysis structure
export interface AnalysisData {
  // 🎟️ Option contract selected by GPT
  option?: OptionContract;

  // 📊 Technical indicators
  indicators?: Indicators;

  // 💵 Market pricing
  entryPrice?: number;             // Current stock price
  breakEvenPrice?: number;        // Strike + premium (for calls)
  targetPrice?: number;           // Projected upward move
  stopLoss?: number;              // Suggested cut-loss level
  expectedROI?: number;           // Projected return (in percent)

  // 🧠 GPT & Sentiment
  gptResponse?: string;           // Raw GPT explanation
  sentimentSummary?: string;      // News summary
  congressTrades?: string;        // Congressional trades string with URLs

  // 🧭 Recommendation quality
  confidence?: string;            // low | medium | high
  recommendationDirection?: 'call' | 'put' | 'hold' | 'avoid' | 'unknown'; // Direction call
  expiryDate?: string;            // When trade expires
}
