// ✅ controllers/tradeController.js

import dotenv from 'dotenv';
dotenv.config();

// Utility imports
import getStockPrice from '../utils/getStockPrice.js';
import { getGptRecommendation } from '../utils/openaiAssistant.js';
import { getAffordableOptionContracts } from '../utils/getAffordableOptionContracts.js';
import { enrichTickerData } from '../utils/enrichTickerData.js';
import TradeRecommendation from '../models/TradeRecommendation.js';


// 🔍 Fetch aggregate (candlestick) data for a single ticker over the past 30 days
export const getAggregate = async (req, res) => {
  const { ticker } = req.params;
  const polygon = req.app.get('polygon');

  try {
    const endDate = new Date();
    const startDate = new Date(endDate);
    startDate.setDate(endDate.getDate() - 30); // Get 30-day window

    const data = await polygon.stocks.aggregates(
      ticker,
      1,
      "day",
      startDate.toISOString().split('T')[0],
      endDate.toISOString().split('T')[0]
    );

    res.json(data);
  } catch (error) {
    res.status(500).json({ error: `Failed to fetch data for ${ticker}` });
  }
};


// 🔍 Fetch aggregates for multiple tickers (useful for bulk analysis)
export const getMultiAggregates = async (req, res) => {
  const { tickers } = req.body;
  const polygon = req.app.get('polygon');

  if (!Array.isArray(tickers)) {
    return res.status(400).json({ error: 'Tickers must be an array.' });
  }

  try {
    const results = await Promise.all(
      tickers.map(ticker =>
        polygon.stocks.aggregates(ticker, 1, "day", "2024-05-01", "2024-05-07")
          .then(data => ({ ticker, data }))
          .catch(error => ({ ticker, error: error.message }))
      )
    );

    res.json(results);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch multiple aggregates' });
  }
};


// 🧾 Get summary of last day’s data + latest trade recommendation for a given ticker
export const getSummary = async (req, res) => {
  const { ticker } = req.params;
  const polygon = req.app.get('polygon');

  console.log(`🔍 getSummary (fallback) for: ${ticker}`);

  try {
    const endDate = new Date();
    const startDate = new Date(endDate);
    startDate.setDate(endDate.getDate() - 2); // last 2 days

    const agg = await polygon.stocks.aggregates(
      ticker,
      1,
      "day",
      startDate.toISOString().split('T')[0],
      endDate.toISOString().split('T')[0]
    );

    const lastDay = agg.results?.at(-1) || null;
    const trade = await TradeRecommendation.findOne({ tickers: ticker }).sort({ createdAt: -1 });

    res.json({
      trade,
      quote: lastDay ? {
        open: lastDay.o,
        high: lastDay.h,
        low: lastDay.l,
        close: lastDay.c,
        volume: lastDay.v,
        date: new Date(lastDay.t).toISOString()
      } : null
    });

  } catch (error) {
    console.error('🔥 Fallback summary error:', error.message);
    res.status(500).json({ error: 'Summary fallback failed', message: error.message });
  }
};


export const validateTradeRequest = (req, res, next) => {
  let { tickers, ticker, watchlist, capital, riskTolerance } = req.body;

  // Normalize to tickers[]
  if (!tickers) {
    if (Array.isArray(watchlist)) {
      tickers = watchlist;
      req.body.tickers = tickers;
    } else if (ticker) {
      tickers = [ticker];
      req.body.tickers = tickers;
    }
  }

  if (!Array.isArray(tickers)) {
    return res.status(400).json({ error: 'Tickers must be an array or ticker must be provided' });
  }

  if (typeof capital !== 'number' || capital <= 0) {
    return res.status(400).json({ error: 'Invalid capital amount' });
  }

  if (!['low', 'medium', 'high'].includes(riskTolerance)) {
    return res.status(400).json({ error: 'Invalid risk tolerance value (must be low, medium, or high)' });
  }

  next();
};

// 🧠 Validates a single ticker and returns affordable options based on user capital
export const validateTicker = async (req, res) => {
  const { ticker, capital = 1000, riskTolerance = 'medium' } = req.body;
  const apiKey = process.env.POLYGON_API_KEY;

  console.log('\n🧠 Validating Ticker & Checking Affordability...');
  console.log(`  📈 Ticker: ${ticker}`);
  console.log(`  💵 Capital: $${capital}`);
  console.log(`  ⚖️ Risk Tolerance: ${riskTolerance}`);
  console.log(`  🔑 API Key Present: ${!!apiKey}`);

  if (!ticker) {
    return res.status(400).json({ valid: false, error: 'Ticker symbol is required.' });
  }

  try {
    // Step 1: Validate ticker
    const stockPrice = await getStockPrice(ticker);
    if (!stockPrice) {
      console.warn(`❌ Invalid ticker "${ticker}" — No price data`);
      return res.status(404).json({
        valid: false,
        message: `Ticker "${ticker}" not found.`,
        stockPrice: null,
        contracts: [],
        closestITM: null
      });
    }

    // Step 2: Fetch CALL contracts user can afford
    const { contracts, cheapestUnaffordable, closestITM } = await getAffordableOptionContracts({
      ticker,
      capital,
      riskTolerance,
      apiKey,
      contractType: 'call'
    });

    // 💡 Log the closest ITM contract
    if (closestITM) {
      console.log(`🎯 Closest ITM Contract Found: ${closestITM.ticker} | Strike: ${closestITM.strike_price}`);
    } else {
      console.log(`⚠️ No closest ITM found.`);
    }

    // Edge case: No affordable contracts
    if (!contracts.length && cheapestUnaffordable) {
      console.log(`📉 No affordable contracts. Returning closest ITM fallback.`);
      return res.status(200).json({
        valid: true,
        message: `No CALL contracts under $${capital}. Closest ITM contract returned.`,
        stockPrice,
        contracts: [],
        closestITM
      });
    }

    // No contracts at all
    if (!contracts.length && !cheapestUnaffordable) {
      console.log(`❌ No viable contracts at all for ${ticker}.`);
      return res.status(200).json({
        valid: true,
        message: `No CALL contracts found for "${ticker}".`,
        stockPrice,
        contracts: [],
        closestITM: null
      });
    }

    // ✅ Success: return all affordable CALL contracts
    console.log(`✅ ${contracts.length} affordable contracts returned.`);
    return res.status(200).json({
      valid: true,
      message: `Found ${contracts.length} affordable CALL contracts.`,
      stockPrice,
      contracts,
      closestITM
    });

  } catch (err) {
    console.error('🔥 Error during ticker validation:', err.message);
    return res.status(500).json({
      valid: false,
      error: 'Internal server error during ticker validation.',
      stockPrice: null,
      contracts: [],
      closestITM: null
    });
  }
};


/* ============================================================================
 🧠 ANALYZE TRADE — Main controller for processing trade recommendation
============================================================================ */
// ✅ Controller: analyzeTrade — Main endpoint to generate trade recommendations



export const analyzeTrade = async (req, res) => {
  try {
    console.log("🚀 [analyzeTrade] Controller triggered");
    const { capital, riskTolerance, watchlist } = req.body;

    if (!capital || !riskTolerance || !Array.isArray(watchlist) || watchlist.length === 0) {
      return res.status(400).json({ error: 'Missing required fields: capital, riskTolerance, or watchlist' });
    }

    const enrichedTickers = [];

    for (const ticker of watchlist) {
      console.log(`🔍 Running trade analysis for: ${ticker}`);

      const enrichedData = await enrichTickerData({ ticker, capital, riskTolerance });

      const { closestITM } = enrichedData || {};

      // 🛑 Defensive check for closestITM validity
      const hasValidContract =
        closestITM &&
        typeof closestITM === 'object' &&
        typeof closestITM.ask === 'number' &&
        typeof closestITM.strike_price === 'number';

      if (!hasValidContract) {
        console.warn(`⚠️ Skipping GPT prompt due to invalid or incomplete contract data for ${ticker}`);
        console.warn(`🧪 closestITM debug:`, closestITM);
        continue;
      }

      console.log("✅ GPT prompt ready with contract:", {
        ticker,
        ask: closestITM.ask,
        strike: closestITM.strike_price
      });

      const gptResponse = await getGptRecommendation(enrichedData);

      if (!gptResponse?.tradeType || !gptResponse?.confidence) {
        return res.status(500).json({ error: "GPT did not return a valid trade recommendation." });
      }

    const newRec = new TradeRecommendation({
  tickers: [ticker],
  capital: enrichedData.capital || capital, // ✅ Ensure capital is saved properly
  riskTolerance,
  recommendationDirection: gptResponse.tradeType,
  confidence: gptResponse.confidence,
  analysis: gptResponse.analysis,
  entryPrice: gptResponse.entryPrice,
  targetPrice: gptResponse.targetPrice,
  stopLoss: gptResponse.stopLoss,
  option: closestITM
});
      console.log(`📈 [MongoDB] Creating recommendation for ${ticker} with type ${gptResponse.tradeType}`);
      await newRec.save();
      console.log(`💾 [MongoDB] Saved recommendation for ${ticker}`);

      enrichedTickers.push({
        ticker,
        recommendation: gptResponse,
        option: closestITM
      });
    }

    if (!enrichedTickers.length) {
      return res.status(500).json({ error: "No valid recommendations generated." });
    }

    return res.status(200).json({
      message: "✅ Trade recommendations created",
      recommendations: enrichedTickers
    });

  } catch (err) {
    console.error("🔥 [analyzeTrade] Server error:", err);
    return res.status(500).json({ error: "Server error during trade analysis." });
  }
};



// 📚 Fetch all saved trade recommendations
export const getAllTrades = async (req, res) => {
  try {
    const trades = await TradeRecommendation.find().sort({ createdAt: -1 });
    res.json(trades);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch trade history' });
  }
};


// ✏️ Manually update trade outcome (win/loss/pending)
export const updateTradeOutcome = async (req, res) => {
  const { id } = req.params;
  const { outcome, userNotes } = req.body;

  if (!['win', 'loss', 'pending'].includes(outcome)) {
    return res.status(400).json({ error: 'Invalid outcome value' });
  }

  try {
    const updated = await TradeRecommendation.findByIdAndUpdate(
      id,
      { outcome, userNotes },
      { new: true }
    );

    if (!updated) return res.status(404).json({ error: 'Trade not found' });

    res.json(updated);
  } catch (error) {
    res.status(500).json({ error: 'Failed to update trade outcome' });
  }
};
