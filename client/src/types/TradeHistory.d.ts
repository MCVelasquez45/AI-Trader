export interface OptionContract {
  contract: string;
  strike: number;
  expiration: string;
  estimatedCost: number;
}

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
