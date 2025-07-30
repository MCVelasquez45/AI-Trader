// ✅ File: server/controllers/tradeController.js

import TradeRecommendation from '../models/TradeRecommendation.js';

export const analyzeTrade = async (req, res) => {
  try {
    const { capital, riskTolerance, watchlist, validatedContracts = {} } = req.body;

    const userIdentifier =
      (req.user && req.user.id) ||
      req.headers['x-guest-id'] ||
      'anonymous-' + Math.random().toString(36).substring(2, 15);

    // ... other logic to prepare trade recommendation data

    const tradeRecommendation = new TradeRecommendation({
      // ... other fields
      capital,
      riskTolerance,
      tickers: watchlist,
      // ... possibly other fields
      userIdentifier,
    });

    await tradeRecommendation.save();

    res.status(201).json(tradeRecommendation);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const getAllTrades = async (req, res) => {
  try {
    const userIdentifier =
      (req.user && req.user.id) ||
      req.headers['x-guest-id'];

    if (!userIdentifier) {
      return res.status(400).json({ error: 'Missing user identifier.' });
    }

    console.log(`📤 Fetching trades for userIdentifier: ${userIdentifier}`);

    const trades = await TradeRecommendation.find({ userIdentifier }).sort({ createdAt: -1 });

    res.status(200).json(trades);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
