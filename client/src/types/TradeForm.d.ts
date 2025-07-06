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

export interface ClosestITMContract {
  ticker: string;
  ask: number;
  strike_price: number;
  expiration_date: string;
  delta: number;
}

export interface ValidateTickerResponse {
  valid: boolean;
  message?: string;
  stockPrice?: number;
  contracts?: OptionContract[];
  closestITM?: ClosestITMContract;
}
