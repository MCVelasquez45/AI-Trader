// ✅ Match backend TradeRecommendation.option structure
export interface OptionContract {
  ticker: string;               // Option contract symbol (e.g. TSLA240621C00200000)
  strike_price: number;         // Option strike price
  expiration_date: string;      // Expiry date in YYYY-MM-DD format
  midPrice?: number;            // Mid price (calculated from ask/bid)
  ask?: number;
  bid?: number;
  iv?: number;                  // Implied volatility
  delta?: number;
  openInterest?: number;
}

// ✅ MACD indicator structure from backend
export interface MACD {
  macd: number;
  signal: number;
  histogram: number;
}

// ✅ Technical indicators passed from backend
export interface Indicators {
  rsi?: number;
  vwap?: number;
  macd?: MACD;
}

// ✅ Main GPT Analysis object shape
export interface AnalysisData {
  option?: OptionContract;
  indicators?: Indicators;
  entryPrice?: number;
  targetPrice?: number;
  stopLoss?: number;
  gptResponse?: string;
  sentimentSummary?: string;
  congressTrades?: string;
  confidence?: string;
  recommendationDirection?: string;
  expiryDate?: string;
}
