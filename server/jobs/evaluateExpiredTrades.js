// ✅ File: /utils/evaluateExpiredTrades.js

import dotenv from 'dotenv';
dotenv.config();

import axios from 'axios';
import TradeRecommendation from '../models/TradeRecommendation.js';

const POLYGON_API_KEY = process.env.POLYGON_API_KEY;

/**
 * 🔁 Fetch the close price from Polygon.io using the trade's actual expiry date.
 * This is critical for accurate outcome determination on expiration day.
 *
 * @param {string} ticker - Stock symbol (e.g., "AAPL")
 * @param {string} dateStr - Expiration date in YYYY-MM-DD format
 * @returns {Promise<object|null>} - Full close response from Polygon or null
 */
async function fetchCloseDataFromPolygon(ticker, dateStr) {
  try {
    const url = `https://api.polygon.io/v1/open-close/${ticker}/${dateStr}?adjusted=true&apiKey=${POLYGON_API_KEY}`;
    console.log(`📡 Fetching close price from Polygon: ${url}`);

    const response = await axios.get(url);

    // Validate response contains a usable close price
    if (!response.data || typeof response.data.close !== 'number') {
      throw new Error('Missing or invalid close price in Polygon response');
    }

    return response.data;
  } catch (err) {
    console.error(`❌ Polygon API failed for ${ticker} on ${dateStr}:`, err.message);
    return null;
  }
}

/**
 * 🧠 Main evaluation routine to determine trade outcomes.
 * - Evaluates all "pending" trades with expired contracts
 * - Uses Polygon close price on expiry to determine result
 * - Updates MongoDB with outcome, percentage gain/loss, and snapshot data
 */
async function evaluateExpiredTrades() {
  try {
    const now = new Date();

    // ⚠️ Don't evaluate until after U.S. market close (4PM EST = 20:00 UTC)
    const currentHourUTC = now.getUTCHours();
    const marketCloseUTC = 20;

    if (currentHourUTC < marketCloseUTC) {
      console.log('⏳ Market still open — evaluation postponed until after 4PM EST (20:00 UTC)');
      return;
    }

    console.log(`🕒 Starting trade evaluation at ${now.toISOString()}`);

    // 🗃 Query all expired trades that haven’t been evaluated yet
    const trades = await TradeRecommendation.find({
      outcome: 'pending',
      expiryDate: { $lte: now },
      entryPrice: { $ne: null }
    });

    console.log(`📊 Found ${trades.length} expired trades to evaluate`);

    for (const trade of trades) {
      // Format the expiration date into YYYY-MM-DD for the API
      const expiry = new Date(trade.expiryDate);
      const yyyy = expiry.getFullYear();
      const mm = String(expiry.getMonth() + 1).padStart(2, '0');
      const dd = String(expiry.getDate()).padStart(2, '0');
      const dateStr = `${yyyy}-${mm}-${dd}`;

      for (const ticker of trade.tickers) {
        try {
          console.log(`📈 Retrieving close price for ${ticker} on expiry (${dateStr})...`);

          const closeData = await fetchCloseDataFromPolygon(ticker, dateStr);

          if (!closeData) {
            console.warn(`⚠️ No close data found for ${ticker} — skipping this ticker`);
            continue;
          }

          const exitPrice = closeData.close;
          const entryPrice = trade.entryPrice;

          // 📈 Determine win/loss based on trade direction
          let outcome = 'pending';
          if (trade.recommendationDirection === 'call') {
            outcome = exitPrice > entryPrice ? 'win' : 'loss';
          } else if (trade.recommendationDirection === 'put') {
            outcome = exitPrice < entryPrice ? 'win' : 'loss';
          }

          // 📉 Calculate ROI as a percentage
          const percentageChange = ((exitPrice - entryPrice) / entryPrice) * 100;

          // 🧾 Update trade object with evaluation metadata
          trade.exitPrices = trade.exitPrices || {};
          trade.exitPrices[ticker] = exitPrice;

          trade.evaluationSnapshot = trade.evaluationSnapshot || {};
          trade.evaluationSnapshot[ticker] = closeData; // store entire Polygon snapshot for audit

          trade.percentageChange = percentageChange;
          trade.outcome = outcome;
          trade.evaluatedAt = new Date(); // track when evaluation happened

          // Ensure nested objects get saved
          trade.markModified('exitPrices');
          trade.markModified('evaluationSnapshot');

          await trade.save();

          console.log(`✅ ${ticker} → Outcome: ${outcome}, Exit: $${exitPrice.toFixed(2)}, ROI: ${percentageChange.toFixed(2)}%`);

        } catch (err) {
          console.error(`❌ Evaluation error for ${ticker}:`, err.message);

          // 🛠️ Record the evaluation error inside the document
          trade.evaluationErrors = trade.evaluationErrors || [];
          trade.evaluationErrors.push({
            ticker,
            error: err.message,
            timestamp: new Date()
          });

          await trade.save();
        }
      }
    }

    console.log('🏁 Evaluation complete — all eligible trades reviewed');
  } catch (err) {
    console.error('❌ Critical evaluation failure:', err.message);
  }
}

export default evaluateExpiredTrades;
