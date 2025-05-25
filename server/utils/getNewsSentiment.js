// utils/getNewsSentiment.js
import axios from 'axios';

export default async function getNewsSentiment(ticker) {
  const API_KEY = process.env.POLYGON_API_KEY;
  const url = `https://api.polygon.io/v2/reference/news?ticker=${ticker}&limit=5&apiKey=${API_KEY}`;

  try {
    const { data } = await axios.get(url);
    const articles = data.results || [];

    if (!articles.length) return 'No relevant news found.';

    return articles.map(a => `- ${a.title}`).join('\n');
  } catch (err) {
    console.error(`❌ Polygon News failed for ${ticker}:`, err.message);
    return 'News sentiment unavailable.';
  }
}
