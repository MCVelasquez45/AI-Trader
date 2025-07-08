// ✅ controllers/tradeController.js

import dotenv from 'dotenv';
dotenv.config();

// Utility imports

import { getGptRecommendation } from '../utils/openaiAssistant.js';
import { enrichTickerData } from '../utils/enrichTickerData.js';
import TradeRecommendation from '../models/TradeRecommendation.js';
// 🧠 Validates a single ticker and returns affordable options based on user capital
// ✅ Import required utilities at the top
import getStockPrice from '../utils/getStockPrice.js'; // 🔍 Fetches real-time stock price
import { getAffordableOptionContracts } from '../utils/getAffordableOptionContracts.js'; // 📦 Filters affordable CALL options


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



// 🧠 Validates a single ticker and checks affordable options
export const validateTicker = async (req, res) => {
  const { ticker, capital = 1000, riskTolerance = 'medium' } = req.body;
  const apiKey = process.env.POLYGON_API_KEY;

  // 🧠 Step-by-step logging
  console.log('\n🧠 Validating Ticker & Checking Affordability...');
  console.log(`  📈 Ticker: ${ticker}`);
  console.log(`  💵 Capital: $${capital}`);
  console.log(`  ⚖️ Risk Tolerance: ${riskTolerance}`);
  console.log(`  🔑 API Key Present: ${!!apiKey}`);

  // 🛑 Guard clause — missing ticker
  if (!ticker) {
    console.warn('⛔ Ticker symbol is missing from request.');
    return res.status(400).json({ valid: false, error: 'Ticker symbol is required.' });
  }

  try {
    // 📉 Step 1: Validate Ticker via Price
    const stockPrice = await getStockPrice(ticker);
    console.log(`  💹 Fetched Stock Price for ${ticker}: $${stockPrice}`);

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

    // 💰 Step 2: Fetch affordable CALL option contracts
    const { contracts, cheapestUnaffordable, closestITM } = await getAffordableOptionContracts({
      ticker,
      capital,
      riskTolerance,
      apiKey,
      contractType: 'call'
    });

    console.log(`  📊 Contracts fetched: ${contracts.length}`);
    if (closestITM) {
      console.log(`  🎯 Closest ITM Contract: ${closestITM.ticker} | Strike: ${closestITM.strike_price} | Ask: ${closestITM.ask}`);
    } else {
      console.log('  ⚠️ No closest ITM contract found.');
    }

    // ⚠️ Case: No affordable contracts but a fallback exists
    if (!contracts.length && cheapestUnaffordable) {
      console.log(`  💸 No affordable contracts for $${capital}. Returning closest ITM contract as reference.`);
      return res.status(200).json({
        valid: true,
        message: `No CALL contracts under $${capital}. Closest ITM contract returned.`,
        stockPrice,
        contracts: [],
        closestITM
      });
    }

    // ❌ Case: No contracts at all
    if (!contracts.length && !cheapestUnaffordable) {
      console.warn(`  ❌ No CALL contracts available for ${ticker}`);
      return res.status(200).json({
        valid: true,
        message: `No CALL contracts found for "${ticker}".`,
        stockPrice,
        contracts: [],
        closestITM: null
      });
    }

    // ✅ Final case: Return affordable contracts
    console.log(`  ✅ Returning ${contracts.length} affordable CALL contracts.`);
    return res.status(200).json({
      valid: true,
      message: `Found ${contracts.length} affordable CALL contracts.`,
      stockPrice,
      contracts,
      closestITM
    });

  } catch (err) {
    // 🔥 Top-level error logging
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
// ✅ analyzeTrade Controller — Handles trade recommendations end-to-end
export const analyzeTrade = async (req, res) => {
  try {
    console.log("🚀 [analyzeTrade] CONTROLLER TRIGGERED");
    console.log("📥 Request Body:", JSON.stringify(req.body, null, 2));

    const {
      capital,
      riskTolerance,
      watchlist,
      validatedContracts = {} // ✅ Expected as object: { [ticker]: contract }
    } = req.body;

    // 🛡️ Input Validation
    if (!capital || !riskTolerance || !Array.isArray(watchlist) || watchlist.length === 0) {
      const errorMsg = "⚠️ Missing required fields: capital, riskTolerance, or watchlist";
      console.warn(errorMsg);
      return res.status(400).json({ error: errorMsg });
    }

    const enrichedTickers = [];
    console.log(`🔁 Processing ${watchlist.length} ticker(s) in watchlist`);

    // 🔁 Loop through each ticker in the watchlist
    for (const ticker of watchlist) {
      console.log(`\n🔍 [TICKER START] Processing: ${ticker}`);
      let gptResponse = null;

      try {
        // 🧾 STEP 0: Extract pre-validated contract from validatedContracts
        const preselectedContract = validatedContracts[ticker] || null;

        if (preselectedContract) {
          console.log(`✅ Pre-validated contract found for ${ticker}:`);
          console.table(preselectedContract);
        } else {
          console.warn(`⚠️ No pre-validated contract passed for ${ticker}. Enrichment may fail.`);
        }

        // 📦 STEP 1: Enrich Ticker Data
        const enrichedData = await enrichTickerData({
          ticker,
          capital,
          riskTolerance,
          clientContract: preselectedContract
        });

        // ⛔ Skip if enrichment fails
        if (!enrichedData) {
          console.warn(`⛔ SKIPPED: No enrichment data returned for ${ticker}`);
          continue;
        }

        // ✅ STEP 2: Validate Enriched Data Fields
        const missing = [];
        if (!enrichedData.stockPrice) missing.push('stockPrice');
        if (!enrichedData.contract) missing.push('contract');
        if (!enrichedData.indicators) missing.push('indicators');

        if (missing.length) {
          console.warn(`⚠️ Missing fields for ${ticker}:`, missing.join(', '));
          continue;
        }

        // ⚠️ STEP 2b: Validate Contract Structure
        const contract = enrichedData.contract;
        if (!contract || typeof contract.ask !== 'number' || typeof contract.strike_price !== 'number') {
          console.warn(`⚠️ INVALID CONTRACT STRUCTURE for ${ticker}:`, contract);
          continue;
        }

        // 🤖 STEP 3: Generate GPT Recommendation
        try {
          console.log("🤖 Sending enriched data to GPT...");
          gptResponse = await getGptRecommendation(enrichedData);

          if (!gptResponse || !gptResponse.tradeType || !gptResponse.confidence) {
            console.error(`❌ GPT returned invalid data for ${ticker}:`, gptResponse);
            continue;
          }

          console.log(`📝 GPT RECOMMENDATION for ${ticker}: ${gptResponse.tradeType} | Confidence: ${gptResponse.confidence}`);
        } catch (gptErr) {
          console.error(`🔥 GPT ERROR for ${ticker}:`, gptErr.message);
          continue;
        }

        // 💸 STEP 4: Financial Metrics
        const estimatedCost = contract.midPrice * 100;
        const breakEvenPrice = contract.contract_type === 'call'
          ? contract.strike_price + contract.ask
          : contract.strike_price - contract.ask;

        const expectedROI = ((gptResponse.targetPrice - gptResponse.entryPrice) / gptResponse.entryPrice) * 100;

        // 💾 STEP 5: Save Recommendation to MongoDB
        console.log(`💾 Saving recommendation for ${ticker} to MongoDB...`);
        const newRec = new TradeRecommendation({
          tickers: [ticker],
          capital: enrichedData.capital,
          riskTolerance,
          recommendationDirection: gptResponse.tradeType.toLowerCase(),
          confidence: gptResponse.confidence.toLowerCase(),
          gptResponse: gptResponse.analysis,
          entryPrice: gptResponse.entryPrice,
          targetPrice: gptResponse.targetPrice,
          stopLoss: gptResponse.stopLoss,
          estimatedCost,
          breakEvenPrice,
          expectedROI,
          option: contract,
          expiryDate: contract?.expiration_date,
          sentimentSummary: enrichedData.sentiment,
          congressTrades: enrichedData.congress,
          indicators: enrichedData.indicators
        });

        await newRec.save();
        console.log(`✅ SAVED to DB: ${ticker}`);

        // 📦 STEP 6: Add Enriched Result to Final Array
        enrichedTickers.push({
          tickers: [ticker],
          capital,
          riskTolerance,
          ...gptResponse,
          option: contract
        });

      } catch (err) {
        console.error(`❌ ERROR PROCESSING ${ticker}:`, err.message || err);
        continue;
      }
    }

    // 📮 FINAL RESPONSE
    if (!enrichedTickers.length) {
      const errorMsg = "⚠️ No valid recommendations generated";
      console.warn(errorMsg);
      return res.status(500).json({ error: errorMsg });
    }

    console.log(`🎉 SUCCESS: ${enrichedTickers.length} recommendation(s) generated`);
    return res.status(200).json({
      message: "✅ Trade recommendations created",
      recommendations: enrichedTickers
    });

  } catch (err) {
    console.error("🔥 FATAL ERROR in analyzeTrade:", err.message || err);
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
