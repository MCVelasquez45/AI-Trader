// ✅ controllers/tradeController.js

import dotenv from 'dotenv';
dotenv.config();

// Utility imports

import { getGptRecommendation } from '../utils/openaiAssistant.js';
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
    console.log("🚀 [analyzeTrade] CONTROLLER TRIGGERED");
    console.log("📥 Request Body:", JSON.stringify(req.body, null, 2));

    const { capital, riskTolerance, watchlist } = req.body;

    // ========================
    // 🛡️ INPUT VALIDATION
    // ========================
    if (!capital || !riskTolerance || !Array.isArray(watchlist) || watchlist.length === 0) {
      const errorMsg = "⚠️ Missing required fields: capital, riskTolerance, or watchlist";
      console.warn(errorMsg);
      return res.status(400).json({ error: errorMsg });
    }

    const enrichedTickers = [];
    console.log(`🔁 Processing ${watchlist.length} tickers in watchlist`);

    for (const ticker of watchlist) {
      let gptResponse; // ✅ Declare outside try so it's accessible after

      try {
        console.log(`\n🔍 [TICKER PROCESSING] Starting analysis for: ${ticker}`);

        // 📦 1. Enrich Data
        const enrichedData = await enrichTickerData({ ticker, capital, riskTolerance });

        if (!enrichedData) {
          console.warn(`⛔ SKIPPING: Enrichment failed for ${ticker}`);
          continue;
        }

        // Validate minimum required fields
        const missingFields = [];
        if (!enrichedData.stockPrice) missingFields.push('stockPrice');
        if (!enrichedData.contract) missingFields.push('contract');
        if (!enrichedData.indicators) missingFields.push('indicators');

        if (missingFields.length > 0) {
          console.warn(`⚠️ INCOMPLETE DATA: Missing ${missingFields.join(', ')} for ${ticker}`);
          continue;
        }

        const contract = enrichedData.contract;
        if (!contract || typeof contract.ask !== 'number' || typeof contract.strike_price !== 'number') {
          console.warn(`⚠️ INVALID CONTRACT STRUCTURE for ${ticker}`);
          continue;
        }

        // 🤖 GPT RECOMMENDATION
        try {
          console.log("🚀 Sending to getGptRecommendation...");
          gptResponse = await getGptRecommendation(enrichedData);

          if (!gptResponse?.tradeType) {
            console.error(`❌ INVALID GPT RESPONSE for ${ticker}:`, gptResponse);
            continue;
          }

          console.log(`📝 GPT RECOMMENDATION for ${ticker}: ${gptResponse.tradeType} (${gptResponse.confidence})`);
        } catch (gptError) {
          console.error(`🔥 GPT PROCESSING ERROR for ${ticker}:`, gptError.message);
          continue;
        }

        // Final response validation (after catch)
        if (!gptResponse || !gptResponse.tradeType || !gptResponse.confidence) {
          console.error(`❌ INVALID GPT RESPONSE OUTSIDE TRY for ${ticker}:`, gptResponse);
          continue;
        }
        // ========================
        // 💵 Calculate Additional Fields
        // ========================
        const estimatedCost = contract.midPrice * 100;
        const breakEvenPrice = contract.contract_type === 'call'
          ? contract.strike_price + contract.ask
          : contract.strike_price - contract.ask;

        const expectedROI = ((gptResponse.targetPrice - gptResponse.entryPrice) / gptResponse.entryPrice) * 100;


        // 💾 Save to MongoDB
        console.log(`💾 [PHASE 4] Saving recommendation for ${ticker}...`);
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
        console.log(`✅ RECOMMENDATION SAVED for ${ticker}`);

        // 📦 Append to final response array
        enrichedTickers.push({
          ticker,
          recommendation: gptResponse,
          option: contract
        });

      } catch (err) {
        console.error(`⚠️ ERROR PROCESSING ${ticker}:`, err.message);
        continue;
      }
    }

    // FINAL RESPONSE
    if (!enrichedTickers.length) {
      const errorMsg = "⚠️ No valid recommendations generated";
      console.warn(errorMsg);
      return res.status(500).json({ error: errorMsg });
    }

    console.log(`🎉 SUCCESS: Generated ${enrichedTickers.length} recommendations`);
    return res.status(200).json({
      message: "✅ Trade recommendations created",
      recommendations: enrichedTickers
    });

  } catch (err) {
    console.error("🔥 CRITICAL ERROR IN analyzeTrade:", err);
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
