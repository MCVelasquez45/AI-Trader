// ✅ File: /routes/tradeRoutes.js

import express from 'express';
import {
  getAggregate,
  getMultiAggregates,
  getSummary,
  analyzeTrade,
  updateTradeOutcome,
  getAllTrades,
  validateTicker,
  validateTradeRequest
} from '../controllers/tradeController.js';

import { cleanUnknownTrades } from '../controllers/cleanupController.js';

import { ensureAuth } from '../middleware/ensureAuth.js';

const router = express.Router();

/**
 * ✅ Utility wrapper to handle async route errors
 * Ensures unhandled promise rejections are passed to Express error middleware
 */
const asyncHandler = fn => (req, res, next) =>
  Promise.resolve(fn(req, res, next)).catch(next);

// ✅ GET daily candlestick data for a single ticker
router.get('/aggregate/:ticker', asyncHandler(getAggregate));

// ✅ POST multiple tickers for aggregate data (30-day snapshot)
router.post('/aggregate-multi', asyncHandler(getMultiAggregates));

// ✅ GET summary data (price, indicators, contracts, etc.)
router.get('/summary/:ticker', asyncHandler(getSummary));

// ✅ POST analyze trade request w/ validation middleware
router.post('/analyze-trade', validateTradeRequest, asyncHandler(analyzeTrade));

// ✅ GET all trades for the authenticated user from DB (protected)
console.log('🔍 [Debug] Registering /trades route with ensureAuth middleware');
router.get('/trades', asyncHandler((req, res, next) => {
  console.log('🛂 [Route] /trades accessed');
  console.log('🔍 Method:', req.method);
  console.log('📍 URL:', req.originalUrl);
  console.log('👤 Authenticated User:', req.user);
  console.log('🧠 Session Data:', req.session);
  return getAllTrades(req, res, next);
}));

// ✅ PUT update trade outcome manually
router.put('/trades/:id/outcome', asyncHandler(updateTradeOutcome));

// ✅ POST ticker validation (was GET - now corrected)
router.post('/validate-ticker', asyncHandler(validateTicker));

// ✅ DELETE cleanup: remove unknown or malformed trades
router.delete('/trades/clean-unknown', asyncHandler(cleanUnknownTrades));

export default router;