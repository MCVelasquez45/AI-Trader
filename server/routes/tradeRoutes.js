import express from 'express';
import {
  getAggregate,
  getMultiAggregates,
  getSummary,
  analyzeTrade,
  updateTradeOutcome,
  getAllTrades
} from '../controllers/tradeController.js';

import { cleanUnknownTrades } from '../controllers/cleanupController.js';

const router = express.Router();

// ✅ Async wrapper to catch errors in async routes
const asyncHandler = fn => (req, res, next) =>
  Promise.resolve(fn(req, res, next)).catch(next);

// ✅ Trade-related routes
router.get('/aggregate/:ticker', asyncHandler(getAggregate));
router.post('/aggregate-multi', asyncHandler(getMultiAggregates));
router.get('/summary/:ticker', asyncHandler(getSummary));
router.post('/analyze-trade', asyncHandler(analyzeTrade));
router.get('/trades', asyncHandler(getAllTrades));
router.put('/trades/:id/outcome', asyncHandler(updateTradeOutcome));

// ✅ Cleanup route for old/unknown trades
router.delete('/trades/clean-unknown', asyncHandler(cleanUnknownTrades));

export default router;
