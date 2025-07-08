// ✅ File: types/TradeForm.d.ts

import type { OptionContract } from './OptionContract';

/**
 * 🧪 Type for risk tolerance levels
 */
export type RiskLevel = 'low' | 'medium' | 'high';

/**
 * ✅ Final result payload passed to Dashboard from TradeForm
 */
export interface AnalysisResultPayload {
  tickers: string[];
  capital: number;
  riskTolerance: RiskLevel;
  validatedContracts: Record<string, OptionContract & { contract_type: string }>;
  result: any;
}

/**
 * 🎛️ Props expected by the TradeForm component
 */
export interface TradeFormProps {
  onAnalyze: (payload: AnalysisResultPayload) => void;
}
