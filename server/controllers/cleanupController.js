// ✅ File: server/controllers/cleanupController.js

import TradeRecommendation from '../models/TradeRecommendation.js';

/**
 * 🔍 Cleans up any trades where GPT failed to generate a valid recommendation.
 * These are trades marked with 'unknown' in either `recommendationDirection` or `confidence`.
 */
export const cleanUnknownTrades = async (req, res) => {
  console.log('🧹 Starting cleanup of unknown trades...');

  try {
    // 🧾 Define condition: remove trades where GPT failed to provide usable output
    const filter = {
      $or: [
        { recommendationDirection: 'unknown' },
        { confidence: 'unknown' }
      ]
    };

    // 🧼 Perform cleanup
    const result = await TradeRecommendation.deleteMany(filter);

    console.log(`✅ Cleanup complete — Deleted ${result.deletedCount} trades`);

    res.json({
      message: 'Unknown trades removed',
      deletedCount: result.deletedCount
    });
  } catch (err) {
    console.error('❌ Error deleting unknown trades:', err.message);
    res.status(500).json({ error: 'Failed to delete unknown trades' });
  }
};
