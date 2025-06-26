// ✅ File: /server/utils/getNewsSentiment.js
import axios from 'axios';

/**
 * 📰 Fetches the 5 latest news article headlines related to a given stock ticker.
 * Uses Polygon.io's news endpoint.
 *
 * @param {string} ticker - Stock ticker symbol (e.g., "AAPL", "MSFT")
 * @returns {Promise<string>} - A newline-separated string of article titles or a fallback message.
 */
export default async function getNewsSentiment(ticker) {
  const API_KEY = process.env.POLYGON_API_KEY;

  // 🔗 Polygon.io News Endpoint
  const url = `https://api.polygon.io/v2/reference/news?ticker=${ticker}&limit=5&apiKey=${API_KEY}`;

  try {
    console.log(`📰 Fetching latest news for ${ticker}...`);
    const { data } = await axios.get(url);
    const articles = data.results || [];

    // ⚠️ No news returned for this ticker
    if (!articles.length) {
      console.warn(`ℹ️ No news found for ${ticker}`);
      return 'No relevant news found.';
    }

    // ✅ Return formatted headlines
    return articles.map(a => `- ${a.title}`).join('\n');

  } catch (err) {
    console.error(`❌ Polygon News failed for ${ticker}:`, err.message);
    return 'News sentiment unavailable.';
  }
}
