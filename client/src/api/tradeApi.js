import axios from 'axios';

const API = process.env.REACT_APP_API_URL;

export const analyzeTrade = async (payload) => {
  try {
    const response = await axios.post(`${API}/analyze-trade`, payload);
    return {
      analysis: response.data.analysis,
      prices: response.data.prices || [],
      errors: response.data.errors || []
    };
  } catch (error) {
    return {
      errors: [{
        error: error.response?.data?.error || 'Server connection failed'
      }]
    };
  }
};

export const getAllTrades = async () => {
  try {
    const response = await axios.get(`${API}/trades`);
    return response.data.map(trade => ({
      ...trade,
      expiryDate: new Date(trade.expiryDate).toLocaleDateString()
    }));
  } catch (error) {
    return [];
  }
};