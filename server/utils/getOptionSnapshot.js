import axios from 'axios';

/**
 * 🔍 Fetches detailed snapshot data for a specific option contract.
 * Uses the correct Polygon endpoint: /snapshot/options/{underlying}/{contract}
 *
 * @param {string} underlyingTicker - Stock symbol (e.g., "SOFI")
 * @param {string} contractTicker - Option symbol (e.g., "O:SOFI250718C00036000")
 * @param {string} apiKey - Polygon API Key (defaults to .env)
 * @returns {object|null} Snapshot data or null if invalid/missing
 */
export const getOptionSnapshot = async (
  underlyingTicker,
  contractTicker,
  apiKey = process.env.POLYGON_API_KEY
) => {
  console.log(`📡 [getOptionSnapshot] Fetching snapshot for: ${contractTicker}`);

  try {
    // ✅ Build correct URL format
    const endpoint = `https://api.polygon.io/v3/snapshot/options/${underlyingTicker}/${contractTicker}?apiKey=${apiKey}`;
    console.log(`🔗 Requesting snapshot from: ${endpoint}`);

    const { data } = await axios.get(endpoint);

    // ❌ Check for empty/malformed results
    if (!data || typeof data.results !== 'object' || Array.isArray(data.results)) {
      console.warn(`⚠️ [Snapshot Invalid] No usable data for ${contractTicker}:`, JSON.stringify(data?.results));
      return null;
    }

    const snapshot = data.results;
    const greeks = snapshot.greeks || {};
    const day = snapshot.day || {};
    const details = snapshot.details || {};

    // Extract relevant fields with fallbacks
    const {
      contract_type,
      expiration_date,
      shares_per_contract,
      strike_price
    } = details;

    const delta = greeks.delta ?? null;
    const gamma = greeks.gamma ?? null;
    const theta = greeks.theta ?? null;
    const vega = greeks.vega ?? null;
    const implied_volatility = snapshot.implied_volatility ?? null;
    const open_interest = snapshot.open_interest ?? null;

    const { vwap } = day;
    const close = day?.close ?? null;

    // Pricing fallback logic: use close → vwap
    const ask = close ?? vwap ?? null;
    const bid = close ?? vwap ?? null;

    // Validation: required fields
    const missing = [];
    if (delta == null) missing.push('delta');
    if (gamma == null) missing.push('gamma');
    if (theta == null) missing.push('theta');
    if (vega == null) missing.push('vega');
    if (implied_volatility == null) missing.push('implied_volatility');
    if (strike_price == null) missing.push('strike_price');
    if (contract_type == null) missing.push('contract_type');
    if (shares_per_contract == null) missing.push('shares_per_contract');

    if (missing.length > 0) {
      console.warn(`⚠️ Skipping ${contractTicker} — Missing fields: ${missing.join(', ')}`);
      return null;
    }

    console.log(`✅ Snapshot Validated — ${contractTicker} is usable`);

    return {
      ticker: contractTicker,
      underlying: underlyingTicker,
      strike_price,
      expiration_date,
      contract_type,
      shares_per_contract,
      delta,
      gamma,
      theta,
      vega,
      implied_volatility,
      open_interest,
      ask,
      bid,
      vwap,
      close,
      source: 'polygon-snapshot'
    };

  } catch (err) {
    console.error(`🔥 [getOptionSnapshot Error] Failed for ${contractTicker}: ${err.message}`);
    return null;
  }
};
