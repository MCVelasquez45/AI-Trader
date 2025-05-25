export type RiskLevel = 'low' | 'medium' | 'high';

export interface TradeFormProps {
  onAnalyze: (tickers: string[], capital: number, risk: RiskLevel) => void;
}
