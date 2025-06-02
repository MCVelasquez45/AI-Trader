// /server/controllers/capitolTradesController.js
import tickerToIssuerId from '../scrapers/tickerToIssuerId.js';
import scrapeCapitolTrades from '../scrapers/scrapeCapitolTrades.js';

/**
 * Express route controller to handle GET /capitol-trades/:ticker
 * Resolves ticker to internal issuerId, scrapes trades, and returns JSON.
 */
export const getCapitolTrades = async (req, res) => {
  const { ticker } = req.params;

  // Basic validation: make sure ticker is provided
  if (!ticker) {
    console.warn('⚠️ Missing ticker in query');
    return res.status(400).json({ error: 'Missing ticker. Use ?ticker=SOFI' });
  }

  try {
    console.log(`🔎 Resolving issuerId for: ${ticker}`);
    const issuerId = await tickerToIssuerId(ticker);

    // If ticker not found, return early
    if (!issuerId) {
      console.warn(`❌ Issuer ID not found for ${ticker}`);
      return res.status(404).json({ error: `Issuer not found for ticker "${ticker}"` });
    }

    console.log(`✅ Found issuerId for ${ticker}: ${issuerId}`);
    console.log(`🕵️ Scraping trades from CapitolTrades for issuerId ${issuerId}...`);

    const trades = await scrapeCapitolTrades(issuerId);

    // Handle empty result set
    if (!trades.length) {
      console.warn(`⚠️ No trades found for issuerId ${issuerId}`);
      return res.json({
        ticker,
        issuerId,
        summary: `❌ No trades found for issuer ${issuerId}`,
        trades: []
      });
    }

    // Log each trade for dev output
    console.log(`📣 Trades for ${ticker} (issuerId: ${issuerId}):\n`);
    trades.forEach((trade, i) => {
      console.log(`#${i + 1}`);
      console.log(`🧑 ${trade.representative}`);
      console.log(`📆 ${trade.date}`);
      console.log(`💼 ${trade.type.toUpperCase()} for ${trade.amount}`);
      console.log(`🔗 ${trade.link}`);
      console.log('---');
    });

    // Format human-readable summary string
    const summary = trades.map(trade =>
      `• ${trade.representative} ${trade.type.toUpperCase()} (${trade.amount}) on ${trade.date}`
    ).join('\n');

    // Respond with full structured JSON
    res.json({
      ticker,
      issuerId,
      count: trades.length,
      summary,
      trades
    });

  } catch (err) {
    console.error(`❌ Capitol Trade Scraper Error for ${ticker}:`, err.message);
    res.status(500).json({
      error: 'Scraper failed',
      message: err.message
    });
  }
};
