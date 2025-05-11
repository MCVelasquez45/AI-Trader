async function evaluateExpiredTrades() {
  try {
    const now = new Date();
    const trades = await TradeRecommendation.find({
      outcome: 'pending',
      expiryDate: { $lte: now },
      entryPrice: { $ne: null }
    });

    console.log(`Evaluating ${trades.length} expired trades...`);

    for (const trade of trades) {
      for (const ticker of trade.tickers) { // Process all tickers
        try {
          const lastTrade = await polygon.stocks.lastTrade(ticker);
          const exitPrice = lastTrade?.results?.p;
          
          if (!exitPrice) {
            console.warn(`No exit price for ${ticker}`);
            continue;
          }

          let outcome = 'pending';
          if (trade.recommendationDirection === 'call') {
            outcome = exitPrice > trade.entryPrice ? 'win' : 'loss';
          } else if (trade.recommendationDirection === 'put') {
            outcome = exitPrice < trade.entryPrice ? 'win' : 'loss';
          }

          // Update trade with ticker-specific outcome
          trade.exitPrices = trade.exitPrices || {};
          trade.exitPrices[ticker] = exitPrice;
          trade.outcome = outcome;
          trade.markModified('exitPrices');
          await trade.save();

          console.log(`${ticker} evaluation saved`);

        } catch (err) {
          console.error(`Error evaluating ${ticker}:`, err.message);
          // Store evaluation error
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
    
    console.log('Evaluation completed');
    process.exit(0);
  } catch (err) {
    console.error('Evaluation failed:', err);
    process.exit(1);
  }
}
