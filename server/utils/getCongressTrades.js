// /server/utils/getCongressTrades.js
import scrapeCapitolTrades from '../scrapers/scrapeCapitolTrades.js';
import tickerToIssuerId from '../scrapers/tickerToIssuerId.js';
import scrapePoliticianProfile from '../scrapers/scrapePoliticianProfile.js';

/**
 * Fetches congressional trades related to a stock ticker by:
 * 1. Resolving the ticker to an issuerId via Puppeteer.
 * 2. Scraping CapitolTrades for recent transactions for that issuer.
 * 
 * @param {string} ticker - Stock ticker symbol like "TSLA" or "SOFI"
 * @returns {Promise<string>} - Formatted summary of trades or message
 */
const getCongressTrades = async (ticker) => {
  try {
    console.log(`🔍 Resolving issuerId for ticker: ${ticker}`);
    const issuerId = await tickerToIssuerId(ticker);

    if (!issuerId) {
      console.warn(`⚠️ No issuer ID found for ${ticker}`);
      return `❌ No issuer ID found for ${ticker}`;
    }

    console.log(`✅ Resolved issuerId: ${issuerId}`);
    console.log(`📦 Fetching trades from CapitolTrades for issuerId ${issuerId}`);

    const trades = await scrapeCapitolTrades(issuerId);

    if (!trades.length) {
      console.warn(`⚠️ No trades found for issuer ${issuerId}`);
      return `❌ No trades found for ${ticker}`;
    }

    // Log raw trade info to terminal
    console.log(`📣 Raw Trades for Issuer ID ${issuerId}:\n`);
    trades.forEach((t, index) => {
      console.log(`#${index + 1}`);
      console.log(`🧑 ${t.representative}`);
      console.log(`📆 ${t.date}`);
      console.log(`💼 ${t.type.toUpperCase()} for ${t.amount}`);
      console.log(`🔗 ${t.link}`);
      console.log('---');
    });

    // Return formatted summary
    return trades.map(t => {
      return `• ${t.representative} ${t.type.toUpperCase()} (${t.amount}) on ${t.date}`;
    }).join('\n');

  } catch (err) {
    console.error(`❌ getCongressTrades error for ${ticker}:`, err.message);
    return `❌ Error fetching data for ${ticker}`;
  }
};

export default getCongressTrades;
