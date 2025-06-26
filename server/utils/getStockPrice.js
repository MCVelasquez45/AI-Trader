// ✅ File: /server/utils/getStockPrice.js

import axios from 'axios';

/**
 * 💵 Fetches the current market price of a stock using Yahoo Finance's unofficial API.
 *
 * @param {string} ticker - Stock symbol (e.g., "AAPL", "TSLA").
 * @returns {Promise<number|null>} - The latest regular market price or null if unavailable.
 */
export default async function getStockPrice(ticker) {
  try {
    // 🌐 Build Yahoo Finance endpoint for the given ticker
    const url = `https://query1.finance.yahoo.com/v8/finance/chart/${ticker}`;

    // 🛰️ Make GET request to fetch chart/quote data
    const response = await axios.get(url);

    // ✅ Parse the regular market price from metadata
    const price = response.data.chart.result?.[0]?.meta?.regularMarketPrice;

    // 🧾 Log and return the value
    console.log(`📈 [${ticker}] Current Price: $${price}`);
    return price;
  } catch (error) {
    // ❌ Gracefully handle API or parsing errors
    console.error(`❌ Yahoo API error for ${ticker}:`, error.message);
    return null;
  }
}
