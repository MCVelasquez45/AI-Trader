// ✅ File: utils/getCongressTrades.js

import scrapeCapitolTrades from '../scrapers/scrapeCapitolTrades.js';
import tickerToIssuerId from '../scrapers/tickerToIssuerId.js';

/**
 * 🔎 Fetches congressional trades for a given ticker using Puppeteer scraping.
 *
 * @param {string} ticker - Stock symbol (e.g., "AAPL", "SOFI")
 * @returns {Promise<Array<Object>>} - Array of trade objects with fields:
 *   { representative, type, amount, date, link }
 */
const getCongressTrades = async (ticker) => {
  try {
    console.log(`\n🔍 [getCongressTrades] Resolving issuerId for ${ticker}...`);

    const issuerId = await tickerToIssuerId(ticker);

    if (!issuerId) {
      console.warn(`⚠️ No issuerId resolved for ticker: ${ticker}`);
      return []; // ✅ Always return array
    }

    console.log(`✅ IssuerId resolved: ${issuerId}`);
    console.log(`🌐 Scraping CapitolTrades for issuer: ${issuerId}...`);

    const trades = await scrapeCapitolTrades(issuerId);

    if (!Array.isArray(trades) || trades.length === 0) {
      console.warn(`⚠️ No congressional trades found for issuerId ${issuerId}`);
      return []; // ✅ Consistent: return empty array
    }

    console.log(`📊 ${trades.length} congressional trade(s) scraped for ${ticker}:`);
    trades.forEach((t, i) => {
      console.log(`#${i + 1} — ${t.representative} | ${t.type} | ${t.amount} | ${t.date} | ${t.link}`);
    });

    // ✅ Normalize and return trades
    return trades.map(t => ({
      representative: t.representative ?? 'Unknown',
      type: t.type ?? 'N/A',
      amount: t.amount ?? 'N/A',
      date: t.date ?? 'N/A',
      link: t.link ?? '#'
    }));

  } catch (err) {
    console.error(`❌ getCongressTrades error for ${ticker}: ${err.message}`);
    return []; // ✅ Always return array on failure
  }
};

export default getCongressTrades;
