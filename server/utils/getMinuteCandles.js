// ✅ File: /server/utils/getMinuteCandles.js
import axios from 'axios';

// 🔐 Load API key from .env
const POLY_API_KEY = process.env.POLYGON_API_KEY;

/**
 * 📈 Fetch historical daily candles (OHLCV) for the last ~40 days
 * Tries Polygon.io first, and falls back to Yahoo Finance if needed.
 * 
 * @param {string} ticker - Stock ticker symbol (e.g., "AAPL", "TSLA")
 * @returns {Promise<Array>} - Array of candles: { c, h, l, v, t }
 */
export default async function getMinuteCandles(ticker) {
  const endDate = new Date();                  // ⏳ Today
  const startDate = new Date(endDate);         // ⏪ 40 days ago
  startDate.setDate(endDate.getDate() - 40);

  // 🗓 Format to YYYY-MM-DD
  const from = startDate.toISOString().split('T')[0];
  const to = endDate.toISOString().split('T')[0];

  // 🌐 Polygon.io endpoint for daily candles
  const url = `https://api.polygon.io/v2/aggs/ticker/${ticker}/range/1/day/${from}/${to}?adjusted=true&sort=asc&limit=50&apiKey=${POLY_API_KEY}`;

  try {
    console.log(`📊 Fetching candles from Polygon for ${ticker}...`);
    const res = await axios.get(url);
    const candles = res.data.results;

    // 🛑 Polygon returned too little data
    if (!candles || candles.length < 26) {
      throw new Error('Not enough candle data from Polygon');
    }

    // ✅ Parse and filter Polygon response
    return candles
      .map(c => ({
        c: c.c, // close
        h: c.h, // high
        l: c.l, // low
        v: c.v, // volume
        t: c.t  // timestamp
      }))
      .filter(c => c.c && c.v)     // remove invalid candles
      .slice(-60);                 // keep most recent 60 entries

  } catch (err) {
    console.warn(`⚠️ Polygon failed for ${ticker}, trying Yahoo fallback...`);

    try {
      // 🌐 Yahoo Finance fallback (3-month daily range)
      const yahooUrl = `https://query1.finance.yahoo.com/v8/finance/chart/${ticker}?interval=1d&range=3mo`;
      const yahooRes = await axios.get(yahooUrl);
      const result = yahooRes.data.chart.result[0];

      const closes = result.indicators.quote[0].close;
      const highs = result.indicators.quote[0].high;
      const lows = result.indicators.quote[0].low;
      const volumes = result.indicators.quote[0].volume;
      const timestamps = result.timestamp;

      // 🛑 Yahoo also has too little data
      if (!closes || closes.length < 26) {
        throw new Error('Yahoo fallback also has too little data');
      }

      // ✅ Parse and return valid Yahoo candles
      return closes.map((c, i) => ({
        c,
        h: highs[i],
        l: lows[i],
        v: volumes[i],
        t: timestamps[i]
      }))
      .filter(c => c.c && c.v)    // filter invalid rows
      .slice(-60);                // return most recent 60

    } catch (yerr) {
      console.error(`❌ Yahoo fallback also failed for ${ticker}:`, yerr.message);
      return [];
    }
  }
}
