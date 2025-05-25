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
