import axios from 'axios';

// ✅ Dynamically use the API base URL from Vite environment or fallback to localhost
const API = import.meta.env.VITE_API_URL ?? 'http://localhost:4545/api';

console.log("✅ API ENV:", import.meta.env.VITE_API_URL);
console.log('📡 Final API URL:', API);

// 🔁 POST /analyze-trade — Send trade payload to AI backend
export const analyzeTrade = async (payload: any) => {
  try {
    const response = await axios.post(`${API}/analyze-trade`, payload);
    return response.data;
  } catch (error: any) {
    console.error('❌ analyzeTrade failed:', error.response?.data || error.message);
    throw error;
  }
};

// 📥 GET /trades — Fetch all saved trade recommendations
export const getAllTrades = async () => {
  try {
    const response = await axios.get(`${API}/trades`);
    return response.data;
  } catch (error: any) {
    console.error('❌ getAllTrades failed:', error.response?.data || error.message);
    return [];
  }
};
