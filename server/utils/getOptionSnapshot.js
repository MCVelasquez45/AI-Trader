import axios from 'axios';
import dotenv from 'dotenv';
dotenv.config();

export async function getOptionSnapshot(ticker, contractId) {
  const apiKey = process.env.POLYGON_API_KEY || process.env.POLY_API_KEY;

  try {
    const v3Url = `https://api.polygon.io/v3/snapshot/options/${ticker}/${contractId}?apiKey=${apiKey}`;
    const v3Res = await axios.get(v3Url);
    const results = v3Res.data?.results;

    console.log(`📡 [${contractId}] Raw snapshot results:`);
    console.dir(results, { depth: null });

    if (!results) {
      console.warn(`⚠️ [${contractId}] Snapshot completely missing`);
      return null;
    }

    const quote = results.last_quote || {};

    // ✅ No longer requires ask/bid to exist
    return {
      ask: quote.ask ?? null,
      bid: quote.bid ?? null,
      vwap: results.day?.vwap ?? null,
      strike_price: results.details?.strike_price ?? null,
      delta: results.greeks?.delta ?? null,
      gamma: results.greeks?.gamma ?? null,
      theta: results.greeks?.theta ?? null,
      vega: results.greeks?.vega ?? null,
      implied_volatility: results.implied_volatility ?? null,
      open_interest: results.open_interest ?? null,
    };
  } catch (err) {
    console.error(`❌ Snapshot fetch failed for ${contractId}:`, err.response?.status || err.message);
    return null;
  }
}
