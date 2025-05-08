// Import Express and create a new router instance
const express = require('express');
const router = express.Router();

// Import controller functions to handle each route
const {
  getAggregate,
  getMultiAggregates,
  getSummary,
  analyzeTrade,
  updateTradeOutcome,
  getAllTrades
} = require('../controllers/tradeController');


// 📈 Get aggregate price data for a single ticker (e.g., daily candles)
router.get('/aggregate/:ticker', getAggregate);

// 📊 Get aggregate data for multiple tickers at once (e.g., ["SOFI", "AAPL"])
router.post('/aggregate-multi', getMultiAggregates);

// 📍 Get the latest trade and quote info for a specific ticker
router.get('/summary/:ticker', getSummary);

// 🤖 Send tickers + user preferences to GPT and receive a trade recommendation
router.post('/analyze-trade', analyzeTrade);

// 📋 Fetch all saved GPT trade recommendations (can be used for history, stats, etc.)
router.get('/trades', getAllTrades);

// ✅ Update a trade recommendation with its outcome (win/loss/pending) and optional notes
router.put('/trades/:id/outcome', updateTradeOutcome);

// Export all defined routes so they can be used in server.js
module.exports = router;
