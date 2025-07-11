import axios from 'axios';
import type { RiskLevel } from '../types/TradeForm';
import type { ValidateTickerResponse } from '../types/OptionContract';

const API_BASE =
  import.meta.env.DEV
    ? 'http://localhost:4545/api'
    : (import.meta.env.VITE_API_URL || '/api').trim();

console.log('🔁 API Base URL:', API_BASE);



type TradePayload = Record<string, any>;

export const analyzeTrade = async (payload: TradePayload) => {
  console.log('📤 Sending trade payload to /analyze-trade:', payload);
  try {
    const res = await axios.post(`${API_BASE}/analyze-trade`, payload);
    console.log('📥 Trade analysis response:', res?.data);
    return res?.data;
  } catch (error: any) {
    const errMsg = error?.response?.data || error?.message || 'Unknown error';
    console.error('❌ analyzeTrade failed:', errMsg);
    throw new Error(errMsg);
  }
};
export const getAllTrades = async () => {
  try {
    const response = await axios.get(`${API_BASE}/trades`);
    if (!Array.isArray(response.data)) {
      console.warn('⚠️ Invalid response:', response.data);
      return [];
    }
    return response.data;
  } catch (error: any) {
    const errMsg = error?.response?.data?.error || error.message || 'Unknown error';
    console.error('❌ getAllTrades failed:', errMsg);
    return [];
  }
};



export const validateTicker = async (
  ticker: string,
  capital: number,
  riskTolerance: RiskLevel
): Promise<ValidateTickerResponse | null> => {
  console.log('🚀 validateTicker():', { ticker, capital, riskTolerance });

  if (!ticker || typeof ticker !== 'string') {
    console.warn('⚠️ Invalid ticker:', ticker);
    return null;
  }

  if (isNaN(capital) || capital <= 0) {
    console.warn('⚠️ Invalid capital:', capital);
    return null;
  }

  try {
    const res = await axios.post(`${API_BASE}/validate-ticker`, {
      ticker,
      capital,
      riskTolerance,
    });

    console.log('📦 validateTicker response from backend:', res?.data);
    return res?.data || null;
  } catch (error: any) {
    const errMsg = error?.response?.data || error?.message || 'Unknown error';
    console.error(`❌ validateTicker failed for ${ticker}:`, errMsg);
    return null;
  }
};
