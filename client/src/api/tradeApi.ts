import axios from 'axios';

// ✅ Use Vite-compatible env variable
const API = import.meta.env.VITE_API_URL ?? 'http://localhost:4545/api';
console.log("✅ API ENV:", import.meta.env.VITE_API_URL);

console.log('API URL:', API);
export const analyzeTrade = async (payload: any) => {
  try {
    const response = await axios.post(`${API}/analyze-trade`, payload);
    return response.data;
  } catch (error: any) {
    console.error('❌ analyzeTrade failed:', error.response?.data || error.message);
    throw error;
  }
};

export const getAllTrades = async () => {
  try {
    const response = await axios.get(`${API}/trades`);
    return response.data;
  } catch (error: any) {
    console.error('❌ getAllTrades failed:', error.response?.data || error.message);
    return [];
  }
};
