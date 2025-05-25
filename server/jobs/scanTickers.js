import getStockPrice from '../utils/getStockPrice.js';
import calculateIndicators from '../utils/calculateIndicators.js';
import getAffordableOptionContracts from '../utils/getAffordableOptionContracts.js';
import axios from 'axios';

const scanTickers = async ({ tickers, capital, riskTolerance }) => {
  const apiKey = process.env.POLYGON_API_KEY;

  for (const ticker of tickers) {
    console.log(`\n📡 Scanning ${ticker}`);

    const price = await getStockPrice(ticker);
    if (!price) continue;

    console.log(`💰 ${ticker} price: ${price}`);

    // Fetch candles
    let candles = [];
    try {
      const from = new Date(Date.now() - 20 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
      const to = new Date().toISOString().split('T')[0];
      const url = `https://api.polygon.io/v2/aggs/ticker/${ticker}/range/1/day/${from}/${to}?adjusted=true&sort=asc&limit=120&apiKey=${apiKey}`;

      const response = await axios.get(url);
      candles = response.data.results.map(c => ({
        c: c.c,
        h: c.h,
        l: c.l,
        v: c.v
      }));
    } catch (err) {
      console.warn(`❌ Failed to fetch candles for ${ticker}:`, err.message);
    }

    // Indicators
    const { rsi, vwap, macd } = calculateIndicators(candles);

    try {
      const { contracts } = await getAffordableOptionContracts({
        ticker,
        capital,
        riskTolerance,
        rsi,
        vwap,
        macd,
        apiKey
      });

      if (!contracts?.length) {
        console.warn(`⚠️ No affordable contracts found for ${ticker}`);
        continue;
      }

      console.log(`📥 ${contracts.length} contracts for ${ticker}`);
    } catch (err) {
      console.error(`❌ Contract scan error for ${ticker}:`, err.message);
    }
  }
};

export default scanTickers;
