// ✅ File: /utils/evaluateExpiredTrades.js

import dotenv from 'dotenv';
dotenv.config();

import axios from 'axios';
import TradeRecommendation from '../models/TradeRecommendation.js';

/**
 * 🔁 Fallback function: Get the last known close price from Yahoo Finance
 * Used when Polygon or other data sources aren't accessible
 * @param {string} ticker - Stock symbol (e.g., "AAPL")
 * @returns {Promise<number|null>}
 */
async function getLastCloseFromYahoo(ticker) {
  const url = `https://query1.finance.yahoo.com/v8/finance/chart/${ticker}?range=1d&interval=1d`;

  try {
    const response = await axios.get(url);
    const data = response.data.chart.result?.[0];

    // 📉 Extract final close price for 1-day interval
    const close = data?.indicators?.quote?.[0]?.close?.[0];
    if (typeof close !== 'number') throw new Error('Invalid close price');
    return close;
  } catch (err) {
    console.error(`❌ Yahoo fallback failed for ${ticker}:`, err.message);
    return null;
  }
}

/**
 * 🧠 Main function: Evaluate all expired trades that are still marked as 'pending'
 * Updates each trade’s outcome as either 'win' or 'loss' based on final stock price
 */
async function evaluateExpiredTrades() {
  try {
    const now = new Date();
    console.log(`🕒 Evaluating expired trades at ${now.toISOString()}`);

    // 🔍 Find all pending trades whose expiration date has passed
    const trades = await TradeRecommendation.find({
      outcome: 'pending',
      expiryDate: { $lte: now },
      entryPrice: { $ne: null }
    });

    console.log(`📊 Found ${trades.length} expired trades to evaluate`);

    for (const trade of trades) {
      for (const ticker of trade.tickers) {
        try {
          console.log(`📈 Fetching last close price for ${ticker}...`);
          const exitPrice = await getLastCloseFromYahoo(ticker);

          // 🛑 Skip if no valid price was returned
          if (typeof exitPrice !== 'number') {
            console.warn(`⚠️ No valid exit price for ${ticker}`);
            continue;
          }

          // ✅ Determine outcome based on entry vs. exit and trade direction
          let outcome = 'pending';
          if (trade.recommendationDirection === 'call') {
            outcome = exitPrice > trade.entryPrice ? 'win' : 'loss';
          } else if (trade.recommendationDirection === 'put') {
            outcome = exitPrice < trade.entryPrice ? 'win' : 'loss';
          }

          // 📝 Update trade with result and exit price
          trade.exitPrices = trade.exitPrices || {};
          trade.exitPrices[ticker] = exitPrice;
          trade.outcome = outcome;
          trade.markModified('exitPrices'); // Required for nested field

          await trade.save();
          console.log(`✅ ${ticker} evaluated — Outcome: ${outcome}, Exit: $${exitPrice}`);
        } catch (err) {
          // 🚨 Log any evaluation errors for transparency
          console.error(`❌ Error evaluating ${ticker}:`, err.message);

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

    console.log('🏁 Finished evaluating all expired trades');
  } catch (err) {
    console.error('❌ Evaluation failed:', err.message);
  }
}

export default evaluateExpiredTrades;
