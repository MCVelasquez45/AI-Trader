// ✅ Option contract format from backend
export interface OptionContract {
  ticker: string;
  strike_price: number;
  expiration_date: string;
  midPrice?: number;
  ask?: number;
  bid?: number;
  implied_volatility?: number;
  delta?: number;
  gamma?: number;
  theta?: number;
  vega?: number;
  open_interest?: number;
  contract_type?: 'call' | 'put';
}

// ✅ MACD indicator shape
export interface MACD {
  macd: number;
  signal: number;
  histogram: number;
}

// ✅ Combined technical indicators structure
export interface Indicators {
  rsi?: number;
  vwap?: number;
  macd?: MACD;
}

// ✅ Congressional trade item
export interface CongressTrade {
  ticker?: string;
  politician: string;
  transactionType?: string;
  amountRange?: string;
  transactionDate?: string | Date;
  source?: string;
}

// ✅ Main GPT response analysis structure - Updated to match MongoDB schema
export interface AnalysisData {
  // 🎟️ Option contract selected by GPT
  option?: OptionContract;

  // 📊 Technical indicators
  indicators?: Indicators;

  // 💵 Market pricing
  entryPrice?: number;
  breakEvenPrice?: number;
  targetPrice?: number;
  stopLoss?: number;
  expectedROI?: number;

  // 🧠 GPT & Sentiment
  gptResponse?: string;
  sentimentSummary?: string;
  congressTrades?: CongressTrade[] | string;
  congress?: any[]; // 🏛️ New congressional data format from MongoDB

  // 🧭 Recommendation quality
  confidence?: string;
  recommendationDirection?: 'call' | 'put' | 'hold' | 'avoid' | 'unknown';
  expiryDate?: string | Date;

  // 🆕 Ticker field (important for rendering and key tracking)
  ticker: string;

  // 💰 Capital and risk management
  capital?: number;
  riskTolerance?: string;
  estimatedCost?: number;

  // 📈 Trade outcome tracking
  outcome?: 'pending' | 'profitable' | 'unprofitable' | 'breakeven' | 'expired';
  evaluationErrors?: string[];

  // 🕒 Timestamps
  createdAt?: string | Date;
  updatedAt?: string | Date;

  // 🔗 Additional fields from MongoDB
  gptPrompt?: string;
  tickers?: string[];
}
