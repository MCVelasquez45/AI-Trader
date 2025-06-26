// ✅ File: utils/getCongressTrades.js

import scrapeCapitolTrades from '../scrapers/scrapeCapitolTrades.js';
import tickerToIssuerId from '../scrapers/tickerToIssuerId.js';

/**
 * 🔎 Fetch and format congressional trades for a given stock ticker.
 *
 * Step-by-step:
 * 1. Resolve stock ticker to CapitolTrades issuerId via Puppeteer.
 * 2. Scrape CapitolTrades using the issuerId for recent trades.
 * 3. Format and return trades as a human-readable string.
 *
 * @param {string} ticker - A valid stock ticker (e.g., "AAPL", "SOFI")
 * @returns {Promise<string>} - Formatted trade summary or fallback message
 */

const getCongressTrades = async (ticker) => {
  try {
    console.log(`\n🔍 Resolving issuerId for ticker: ${ticker}`);

    // 🧭 Step 1: Get the issuerId from ticker
    const issuerId = await tickerToIssuerId(ticker);

    if (!issuerId) {
      console.warn(`⚠️ No issuer ID found for ${ticker}`);
      return `❌ No issuer ID found for ${ticker}`;
    }

    console.log(`✅ Resolved issuerId: ${issuerId}`);
    console.log(`📦 Fetching trades from CapitolTrades for issuerId ${issuerId}`);

    // 📈 Step 2: Scrape trades from CapitolTrades
    const trades = await scrapeCapitolTrades(issuerId);

    if (!Array.isArray(trades) || trades.length === 0) {
      console.warn(`⚠️ No trades found for issuer ${issuerId}`);
      return `No recent congressional trades found.`;
    }

    // 🧾 Step 3: Format each trade into a readable summary
    const formatted = trades.map((t, i) => {
      console.log(`#${i + 1}`);
      console.log(`🧑 ${t.representative}`);
      console.log(`📆 ${t.date}`);
      console.log(`💼 ${t.type.toUpperCase()} for ${t.amount}`);
      console.log(`🔗 ${t.link}`);
      console.log('---');

      return `• ${t.representative}\n${t.type.toUpperCase()} (${t.amount}) on ${t.date}\n🔗 ${t.link}`;
    });

    // 🎯 Return formatted trades as a newline-separated string
    return formatted.join('\n\n');

  } catch (err) {
    console.error(`❌ getCongressTrades error for ${ticker}:`, err.message);
    return `❌ Error fetching congressional trades for ${ticker}`;
  }
};

export default getCongressTrades;
