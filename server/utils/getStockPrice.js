// utils/getStockPrice.js
import axios from 'axios';

export default async function getStockPrice(ticker) {
  try {
    const url = `https://query1.finance.yahoo.com/v8/finance/chart/${ticker}`;
    const response = await axios.get(url);
    return response.data.chart.result[0].meta.regularMarketPrice;
  } catch (error) {
    console.error(`Yahoo API error for ${ticker}:`, error.message);
    return null;
  }
}
