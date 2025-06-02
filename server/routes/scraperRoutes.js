// routes/scraperRoutes.js
import express from 'express';
import { getCapitolTrades } from '../controllers/capitolTradesController.js';

const router = express.Router();

router.get('/capitol-trades/:ticker', getCapitolTrades);

export default router;
