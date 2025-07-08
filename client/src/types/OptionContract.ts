export interface OptionContract {
  ticker: string;
  strike_price: number;
  expiration_date: string;
  contract_type: 'call' | 'put';
  ask: number;
  bid: number;
  delta: number;
  gamma: number;
  theta: number;
  vega: number;
  implied_volatility: number;
  open_interest: number;
  midPrice?: number;
}
// ✅ File: types/OptionContract.ts

export interface OptionContract {
  ticker: string;
  ask: number;
  bid: number;
  strike_price: number;
  expiration_date: string;
  delta: number;
  iv?: number;
  midPrice?: number;
  openInterest?: number;
  contractType?: string;
}

// ✅ Export this too
export interface ClosestITMContract {
  ticker: string;
  ask: number;
  strike_price: number;
  expiration_date: string;
  delta: number;
}
