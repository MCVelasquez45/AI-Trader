import axios from 'axios';
import type { RiskLevel} from '../types/TradeForm';
import type { ValidateTickerResponse } from '../types/OptionContract';

// 🌍 Automatically set API base URL depending on environment
const API_BASE = import.meta.env.DEV
  ? 'http://localhost:4545/api' // 🧪 Development
  : '/api';                     // 🚀 Production

console.log('🔁 API Base URL:', API_BASE);

// Type for payload sent to analyzeTrade
type TradePayload = Record<string, any>;

/**
 * 🔍 Analyze a trade using backend GPT-based strategy
 * POST /api/analyze-trade
 */
export const analyzeTrade = async (payload: TradePayload) => {
  console.log('📤 Sending trade payload to /analyze-trade:', payload);

  try {
    const response = await axios.post(`${API_BASE}/analyze-trade`, payload);

    console.log('📥 Trade analysis response:', response?.data);
    return response?.data;
  } catch (error: any) {
    const errMsg = error?.response?.data || error?.message || 'Unknown error';
    console.error('❌ analyzeTrade failed:', errMsg);
    throw new Error(errMsg);
  }
};

/**
 * 📊 Retrieve all saved trades from database
 * GET /api/trades
 */
export const getAllTrades = async () => {
  console.log('🔄 Fetching all trades from /trades');

  try {
    const response = await axios.get(`${API_BASE}/trades`);

    console.log('✅ Fetched trades:', response?.data);
    return response?.data || [];
  } catch (error: any) {
    const errMsg = error?.response?.data || error?.message || 'Unknown error';
    console.error('❌ getAllTrades failed:', errMsg);
    return [];
  }
};

/**
 * ✅ Validate a ticker symbol against backend contract logic
 * POST /api/validate-ticker
 *
 * @param ticker         - Stock ticker (e.g., 'NVDA')
 * @param capital        - User's available capital
 * @param riskTolerance  - 'low' | 'medium' | 'high'
 */
export const validateTicker = async (
  ticker: string,
  capital: number,
  riskTolerance: RiskLevel
): Promise<ValidateTickerResponse | null> => {
  console.log('🚀 validateTicker():', {
    ticker,
    capital,
    riskTolerance
  });

  // 🛑 Defensive checks before sending request
  if (!ticker || typeof ticker !== 'string') {
    console.warn('⚠️ Invalid ticker:', ticker);
    return null;
  }

  if (isNaN(capital) || capital <= 0) {
    console.warn('⚠️ Invalid capital:', capital);
    return null;
  }

  try {
    const response = await axios.post(`${API_BASE}/validate-ticker`, {
      ticker,
      capital,
      riskTolerance
    });

    console.log('📦 validateTicker response from backend:', response?.data);
    return response?.data || null;
  } catch (error: any) {
    const errMsg = error?.response?.data || error?.message || 'Unknown error';
    console.error(`❌ validateTicker failed for ${ticker}:`, errMsg);
    return null;
  }
};
