// ✅ File: src/api/tradeApi.ts

import { axiosInstance } from './axiosInstance';
import type { RiskLevel } from '../types/TradeForm';
import type { ValidateTickerResponse } from '../types/OptionContract';
import type { AuthCredentials, AuthResponse } from '../types/Auth';

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
  try {
    const response = await axiosInstance.get('/api/trades');
    if (!Array.isArray(response.data)) {
      console.warn('⚠️ [getAllTrades] Invalid response format:', response.data);
      return [];
    }
    console.log('📥 [getAllTrades] Trades received:', response.data.length);
    return response.data;
  } catch (error: any) {
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
// 🔐 POST: /auth/signup
// ----------------------
export const signupUser = async (credentials: AuthCredentials): Promise<AuthResponse> => {
  try {
    const res = await axiosInstance.post('/auth/signup', credentials);
    console.log('📝 [signupUser] Response:', res?.data);
    return res?.data;
  } catch (error: any) {
    const errMsg = error?.response?.data || error?.message || 'Unknown error';
    console.error('❌ [signupUser] Failed:', errMsg);
    throw new Error(errMsg);
  }
};

// ----------------------
// 🔐 POST: /auth/login
// ----------------------
export const loginUser = async (credentials: AuthCredentials): Promise<AuthResponse> => {
  try {
    const res = await axiosInstance.post('/auth/login', credentials);
    console.log('🔑 [loginUser] Response:', res?.data);
    return res?.data;
  } catch (error: any) {
    const errMsg = error?.response?.data || error?.message || 'Unknown error';
    console.error('❌ [loginUser] Failed:', errMsg);
    throw new Error(errMsg);
  }
};

// ----------------------
// 🔐 GET: /auth/current-user
// ----------------------
export const getCurrentUser = async (): Promise<AuthResponse | null> => {
  try {
    const res = await axiosInstance.get('/auth/current-user');
    console.log('👤 [getCurrentUser] Response:', res?.data);
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
  return `/auth/google`; // ✅ Uses Vite proxy + Express route
};