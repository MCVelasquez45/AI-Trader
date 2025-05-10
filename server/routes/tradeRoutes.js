import express from 'express';
import {
  getAggregate,
  getMultiAggregates,
  getSummary,
  analyzeTrade,
  updateTradeOutcome,
  getAllTrades
} from '../controllers/tradeController.js';

const router = express.Router();

const asyncHandler = fn => (req, res, next) => 
  Promise.resolve(fn(req, res, next)).catch(next);

router.get('/aggregate/:ticker', asyncHandler(getAggregate));
router.post('/aggregate-multi', asyncHandler(getMultiAggregates));
router.get('/summary/:ticker', asyncHandler(getSummary));
router.post('/analyze-trade', asyncHandler(analyzeTrade));
router.get('/trades', asyncHandler(getAllTrades));
router.put('/trades/:id/outcome', asyncHandler(updateTradeOutcome));

export default router;