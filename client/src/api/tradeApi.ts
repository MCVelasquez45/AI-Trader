// ✅ File: src/api/tradeApi.ts

import { axiosInstance } from './axiosInstance';
import type { RiskLevel } from '../types/TradeForm';
import type { ValidateTickerResponse } from '../types/OptionContract';

// ----------------------
// 📡 POST: /analyze-trade
// ----------------------
type TradePayload = Record<string, any>;

export const analyzeTrade = async (payload: TradePayload) => {
  console.log('📤 [analyzeTrade] Sending trade payload:', payload);
  try {
    const res = await axiosInstance.post('/api/analyze-trade', payload);
    console.log('📥 [analyzeTrade] Response:', res?.data);
    return res?.data;
  } catch (error: any) {
    const errMsg = error?.response?.data || error?.message || 'Unknown error';
    console.error('❌ [analyzeTrade] Request failed:', errMsg);
    throw new Error(errMsg);
  }
};

// ----------------------
// 📡 GET: /trades
// ----------------------
export const getAllTrades = async () => {
  console.log('📤 [getAllTrades] Requesting all trades...');
  console.log('📤 [getAllTrades] Headers:', axiosInstance.defaults.headers);
  console.log('📤 [getAllTrades] Guest ID header:', axiosInstance.defaults.headers.common['x-guest-id']);
  console.log('📤 [getAllTrades] Base URL:', axiosInstance.defaults.baseURL);
  console.log('📤 [getAllTrades] With credentials:', axiosInstance.defaults.withCredentials);
  
  try {
    const response = await axiosInstance.get('/api/trades');
    console.log('📥 [getAllTrades] Response status:', response.status);
    console.log('📥 [getAllTrades] Response headers:', response.headers);
    console.log('📥 [getAllTrades] Response data type:', typeof response.data);
    console.log('📥 [getAllTrades] Response data is array:', Array.isArray(response.data));
    console.log('📥 [getAllTrades] Response data length:', Array.isArray(response.data) ? response.data.length : 'not array');
    
    if (!Array.isArray(response.data)) {
      console.warn('⚠️ [getAllTrades] Invalid response format:', response.data);
      console.warn('⚠️ [getAllTrades] Response data:', JSON.stringify(response.data, null, 2));
      return [];
    }
    
    console.log('📥 [getAllTrades] Trades received:', response.data.length);
    
    // Log detailed information about the first few trades
    if (response.data.length > 0) {
      console.log('📥 [getAllTrades] First trade keys:', Object.keys(response.data[0]));
      console.log('📥 [getAllTrades] First trade sample:', JSON.stringify(response.data[0], null, 2));
      
      response.data.slice(0, 3).forEach((trade, index) => {
        console.log(`📥 [getAllTrades] Trade ${index + 1}:`);
        console.log(`  - ID: ${trade._id}`);
        console.log(`  - Tickers: ${trade.tickers}`);
        console.log(`  - UserIdentifier: ${trade.userIdentifier}`);
        console.log(`  - Congress: ${typeof trade.congress} - ${Array.isArray(trade.congress) ? trade.congress.length : 'not array'}`);
        console.log(`  - CongressTrades: ${typeof trade.congressTrades} - ${Array.isArray(trade.congressTrades) ? trade.congressTrades.length : 'not array'}`);
      });
    }
    
    return response.data;
  } catch (error: any) {
    console.error('❌ [getAllTrades] Full error:', error);
    console.error('❌ [getAllTrades] Error response:', error.response);
    console.error('❌ [getAllTrades] Error message:', error.message);
    const errMsg = error?.response?.data?.error || error.message || 'Unknown error';
    console.error('❌ [getAllTrades] Request failed:', errMsg);
    return [];
  }
};

// ----------------------
// 📡 POST: /validate-ticker
// ----------------------
export const validateTicker = async (
  ticker: string,
  capital: number,
  riskTolerance: RiskLevel
): Promise<ValidateTickerResponse | null> => {
  console.log('🚀 [validateTicker] Params:', { ticker, capital, riskTolerance });

  if (!ticker || typeof ticker !== 'string') {
    console.warn('⚠️ [validateTicker] Invalid ticker:', ticker);
    return null;
  }

  if (isNaN(capital) || capital <= 0) {
    console.warn('⚠️ [validateTicker] Invalid capital:', capital);
    return null;
  }

  try {
    const res = await axiosInstance.post('/api/validate-ticker', {
      ticker,
      capital,
      riskTolerance,
    });

    console.log('📦 [validateTicker] Backend response:', res?.data);
    return res?.data || null;
  } catch (error: any) {
    const errMsg = error?.response?.data || error?.message || 'Unknown error';
    console.error(`❌ [validateTicker] Failed for ${ticker}:`, errMsg);
    return null;
  }
};

// ----------------------
// 🔐 GET: /api/auth/current-user
// ----------------------
export const getCurrentUser = async () => {
  try {
    const res = await axiosInstance.get('/api/auth/current-user');
    console.log('👤 [getCurrentUser] Response:', res?.data);
    console.log('🧠 [getCurrentUser] Authenticated user payload:', res?.data);
    return res?.data;
  } catch (error: any) {
    console.error('❌ [getCurrentUser] Failed:', error?.message);
    return null;
  }
};

// ----------------------
// 🔐 OAuth: /auth/google
// ----------------------
export const getGoogleLoginUrl = () => {
  console.log('🌐 [getGoogleLoginUrl] Returning Google OAuth login route');
  return `/auth/google`; // ✅ Uses Vite proxy + Express route
};