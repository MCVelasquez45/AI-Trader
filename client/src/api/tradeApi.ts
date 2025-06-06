import axios from 'axios';

// ✅ Automatically switch between localhost (dev) and relative path (prod)
const API_BASE = import.meta.env.DEV
  ? 'http://localhost:4545/api'
  : '/api';

console.log("🔁 API Base:", API_BASE);

type TradePayload = Record<string, any>;

// 🔁 POST /api/analyze-trade — Analyze trade with GPT
export const analyzeTrade = async (payload: TradePayload) => {
  try {
    const response = await axios.post(`${API_BASE}/analyze-trade`, payload);
    return response?.data;
  } catch (error: any) {
    console.error('❌ analyzeTrade failed:', error.response?.data || error.message);
    throw error;
  }
};

// 📥 GET /api/trades — Fetch saved trades
export const getAllTrades = async () => {
  try {
    const response = await axios.get(`${API_BASE}/trades`);
    return response?.data || [];
  } catch (error: any) {
    console.error('❌ getAllTrades failed:', error.response?.data || error.message);
    return [];
  }
};
