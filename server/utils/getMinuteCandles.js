import axios from 'axios';

// ✅ New
const POLY_API_KEY = process.env.POLYGON_API_KEY;

export default async function getMinuteCandles(ticker) {
  const endDate = new Date();
  const startDate = new Date(endDate);
  startDate.setDate(endDate.getDate() - 40);

  const from = startDate.toISOString().split('T')[0];
  const to = endDate.toISOString().split('T')[0];

  const url = `https://api.polygon.io/v2/aggs/ticker/${ticker}/range/1/day/${from}/${to}?adjusted=true&sort=asc&limit=50&apiKey=${POLY_API_KEY}`;

  try {
    const res = await axios.get(url);
    const candles = res.data.results;

    if (!candles || candles.length < 26) {
      throw new Error('Not enough candle data from Polygon');
    }

    return candles.map(c => ({
      c: c.c,
      h: c.h,
      l: c.l,
      v: c.v,
      t: c.t
    })).filter(c => c.c && c.v).slice(-60);

  } catch (err) {
    console.warn(`⚠️ Polygon failed for ${ticker}, trying Yahoo fallback...`);

    try {
      const yahooUrl = `https://query1.finance.yahoo.com/v8/finance/chart/${ticker}?interval=1d&range=3mo`;
      const yahooRes = await axios.get(yahooUrl);
      const result = yahooRes.data.chart.result[0];

      const closes = result.indicators.quote[0].close;
      const highs = result.indicators.quote[0].high;
      const lows = result.indicators.quote[0].low;
      const volumes = result.indicators.quote[0].volume;
      const timestamps = result.timestamp;

      if (!closes || closes.length < 26) {
        throw new Error('Yahoo fallback also has too little data');
      }

      return closes.map((c, i) => ({
        c,
        h: highs[i],
        l: lows[i],
        v: volumes[i],
        t: timestamps[i]
      }))
      .filter(c => c.c && c.v)
      .slice(-60);
      
    } catch (yerr) {
      console.error(`❌ Yahoo fallback also failed for ${ticker}:`, yerr.message);
      return [];
    }
  }
}
