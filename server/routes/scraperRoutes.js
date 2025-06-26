// ✅ File: /routes/scraperRoutes.js

import express from 'express';
import { getCapitolTrades } from '../controllers/capitolTradesController.js';

const router = express.Router();

/**
 * 📊 GET /api/scrape/capitol-trades/:ticker
 * Calls the controller to scrape and return congressional trades for a given stock ticker.
 *
 * @route GET /api/scrape/capitol-trades/:ticker
 * @param {string} req.params.ticker - Stock symbol like "TSLA"
 * @returns {Array<Object>} - Array of trades with metadata (representative, date, type, etc.)
 */
router.get('/capitol-trades/:ticker', getCapitolTrades);

export default router;
