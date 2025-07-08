// ✅ File: types/OptionContract.ts

/**
 * 🧾 Represents a single option contract returned from validation or enrichment.
 */
export interface OptionContract {
  ticker: string;
  ask: number;
  bid: number;
  strike_price: number;
  expiration_date: string;
  delta: number;
  gamma?: number;
  theta?: number;
  vega?: number;
  implied_volatility?: number;
  iv?: number; // sometimes returned as shorthand
  midPrice?: number;
  openInterest?: number;
  contractType?: string; // "call" or "put"
}

/**
 * ✅ ClosestITMContract inherits from OptionContract
 * Ensures validatedContracts remain compatible with OptionContract map.
 */
export interface ClosestITMContract extends OptionContract {}

/**
 * ✅ Result shape returned from validateTicker()
 */
export interface ValidateTickerResponse {
  valid: boolean;
  message?: string;
  stockPrice?: number;
  contracts?: OptionContract[];
  closestITM?: ClosestITMContract;
}
