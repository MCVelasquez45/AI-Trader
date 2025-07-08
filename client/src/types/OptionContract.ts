// ✅ File: types/OptionContract.ts

/**
 * 🧾 Canonical OptionContract used across validation, enrichment, and GPT analysis.
 */
export interface OptionContract {
  ticker: string;
  strike_price: number;
  expiration_date: string;
  contract_type: 'call' | 'put'; // normalized snake_case for backend
  ask: number;
  bid: number;
  delta: number;
  gamma?: number;
  theta?: number;
  vega?: number;
  implied_volatility?: number;
  iv?: number;               // shorthand alias for implied_volatility
  open_interest?: number;    // snake_case as returned from Polygon
  openInterest?: number;     // camelCase fallback
  midPrice?: number;         // frontend-calculated mid price
  contractType?: string;     // camelCase alias if needed from older data
}

/**
 * 🔁 ClosestITMContract is always a valid OptionContract
 */
export interface ClosestITMContract extends OptionContract {}

/**
 * 🧪 Returned by validateTicker()
 */
export interface ValidateTickerResponse {
  valid: boolean;
  message?: string;
  stockPrice?: number;
  contracts?: OptionContract[];
  closestITM?: ClosestITMContract;
}
