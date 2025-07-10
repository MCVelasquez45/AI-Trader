// ============================
// 📦 Option Contract
// ============================
export interface OptionContract {
  contract: string;            // E.g., "O:SOFI250711C00015000"
  strike: number;              // Strike price (e.g., 15)
  expiration: string;          // Expiry date (ISO string)
  estimatedCost: number;       // Total cost in dollars
}

// ============================
// 📊 MACD + Indicators
// ============================
export interface MACD {
  macd: number;
  signal: number;
  histogram: number;
}

export interface Indicators {
  rsi?: number;
  vwap?: number;
  macd?: MACD;
}

// ============================
// 📘 Trade Record
// ============================
export interface TradeRecord {
  _id: string;
  tickers: string[];
  capital: number;
  riskTolerance: string;
  entryPrice: number;
  expiryDate: string;
  outcome: string;
  gptResponse: string;
  gptPrompt: string;
  recommendationDirection: string;
  confidence: string;
  option?: OptionContract;
  indicators?: Indicators;
  congressTrades?: string;
  sentimentSummary?: string;
  targetPrice?: number;
  stopLoss?: number;
  createdAt: string;
}
