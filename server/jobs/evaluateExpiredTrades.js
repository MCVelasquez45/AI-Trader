import { TradeRecommendation } from '../models/TradeRecommendation.js';
import polygon from '../utils/polygonClient.js';

async function evaluateExpiredTrades() {
  try {
    const now = new Date();
    const trades = await TradeRecommendation.find({
      outcome: 'pending',
      expiryDate: { $lte: now },
      entryPrice: { $ne: null }
    });

    for (const trade of trades) {
      for (const ticker of trade.tickers) {
        try {
          const lastTrade = await polygon.stocks.lastTrade(ticker);
          const exitPrice = lastTrade?.results?.p;

          if (!exitPrice) continue;

          let outcome = 'pending';
          if (trade.recommendationDirection === 'call') {
            outcome = exitPrice > trade.entryPrice ? 'win' : 'loss';
          } else if (trade.recommendationDirection === 'put') {
            outcome = exitPrice < trade.entryPrice ? 'win' : 'loss';
          }

          trade.exitPrices = trade.exitPrices || {};
          trade.exitPrices[ticker] = exitPrice;
          trade.outcome = outcome;
          trade.markModified('exitPrices');
          await trade.save();
        } catch (err) {
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

    console.log('✅ Evaluation complete');
    process.exit(0);
  } catch (err) {
    console.error('❌ Evaluation failed:', err.message);
    process.exit(1);
  }
}

export default evaluateExpiredTrades;
