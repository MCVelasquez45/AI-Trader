// ✅ Import Axios for making HTTP requests
import axios from 'axios';

// 🌐 Load the backend base URL from your .env file (must start with REACT_APP_)
const API = process.env.REACT_APP_API_URL;

// 🧪 Confirm the API URL is correctly loaded (for dev troubleshooting)
console.log("📦 REACT_APP_API_URL:", process.env.REACT_APP_API_URL);

/**
 * Sends a trade analysis request to the backend.
 * @param {Object} payload - Includes tickers, capital, and riskTolerance
 * @returns {Object} - The response from GPT (e.g., trade strategy)
 */
export const analyzeTrade = async (payload) => {
  const response = await axios.post(`${API}/analyze-trade`, payload);
  return response.data;
};
