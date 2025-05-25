// ✅ File: server/controllers/cleanupController.js
import { TradeRecommendation } from '../models/TradeRecommendation.js';

export const cleanUnknownTrades = async (req, res) => {
  try {
    const result = await TradeRecommendation.deleteMany({
      $or: [
        { recommendationDirection: 'unknown' },
        { confidence: 'unknown' }
      ]
    });

    res.json({
      message: 'Unknown trades removed',
      deletedCount: result.deletedCount
    });
  } catch (err) {
    console.error('❌ Error deleting unknown trades:', err);
    res.status(500).json({ error: 'Failed to delete unknown trades' });
  }
};
