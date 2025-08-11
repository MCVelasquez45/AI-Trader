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

/**
 * 🤖 analyzeTrade Controller
 * Accepts capital, risk tolerance, and watchlist
 * Enriches data → sends to GPT → stores trade recommendations in MongoDB
 */
export const analyzeTrade = async (req, res) => {
  try {
    console.log("\n🚀 [analyzeTrade] CONTROLLER TRIGGERED");
    console.log("📥 Incoming Request Body:", JSON.stringify(req.body, null, 2));

    // 🧾 Step 1: Extract and validate input
    const {
      capital,
      riskTolerance,
      watchlist,
      validatedContracts = {} // ✅ Optional: pre-validated contracts from frontend
    } = req.body;

    if (!capital || !riskTolerance || !Array.isArray(watchlist) || watchlist.length === 0) {
      const errorMsg = "⚠️ Missing capital, riskTolerance, or watchlist[]";
      console.warn(errorMsg);
      return res.status(400).json({ error: errorMsg });
    }

    // 📦 Container to hold all enriched ticker responses
    const enrichedTickers = [];
    console.log(`🔁 Processing ${watchlist.length} ticker(s)...`);

    // 🔄 Step 2: Loop through each ticker
    for (const ticker of watchlist) {
      console.log(`\n📊 [${ticker}] Starting full analysis pipeline`);
      let gptResponse = null;

      try {
        // 🧾 Step 2.1: Check if contract is already validated by user
        const preselectedContract = validatedContracts[ticker] || null;
        if (preselectedContract) {
          console.log(`✅ Pre-validated contract used for ${ticker}`);
          console.table(preselectedContract);
        } else {
          console.warn(`⚠️ No pre-validated contract provided for ${ticker}`);
        }

        // 🧠 Step 2.2: Enrich data (price, indicators, contract, news, etc)
        const enrichedData = await enrichTickerData({
          ticker,
          capital,
          riskTolerance,
          clientContract: preselectedContract
        });

        // ❌ Skip if enrichment fails
        if (!enrichedData) {
          console.warn(`⛔ Skipped ${ticker} — Enrichment returned null`);
          continue;
        }

        // 🔍 Step 2.3: Validate all critical fields
        const missing = [];
        if (!enrichedData.stockPrice) missing.push('stockPrice');
        if (!enrichedData.contract) missing.push('contract');
        if (!enrichedData.indicators) missing.push('indicators');

        if (missing.length) {
          console.warn(`⚠️ ${ticker} missing critical fields:`, missing.join(', '));
          continue;
        }

        // ⚠️ Step 2.4: Confirm contract structure is valid
        const contract = enrichedData.contract;
        if (!contract || typeof contract.ask !== 'number' || typeof contract.strike_price !== 'number') {
          console.warn(`⚠️ ${ticker} contract invalid:`, contract);
          continue;
        }

        // 🕓 Step 2.5: Normalize expiration to 4PM EST (20:00 UTC)
        const rawExpiry = contract.expiration_date;
        const normalizedExpiryDate = new Date(new Date(rawExpiry).setUTCHours(20, 0, 0, 0));

        // 🛠 Create a copy of the contract with normalized date for display
        const displayContract = { ...contract };
        displayContract.expiration_date = normalizedExpiryDate.toISOString().split('T')[0];

        console.log(`🗓️ [${ticker}] Normalized Expiration Date:`, displayContract.expiration_date);
        console.log(`🗓️ [${ticker}] Original Expiration Date:`, contract.expiration_date);

        // 🤖 Step 2.6: Send enriched data to GPT-4 for trade recommendation
        try {
          console.log("🤖 Sending to GPT for recommendation...");
          gptResponse = await getGptRecommendation(enrichedData);

          if (!gptResponse || !gptResponse.tradeType || !gptResponse.confidence) {
            console.error(`❌ GPT response invalid for ${ticker}:`, gptResponse);
            continue;
          }

          console.log(`📝 GPT says ${gptResponse.tradeType.toUpperCase()} with ${gptResponse.confidence.toUpperCase()} confidence.`);
        } catch (gptErr) {
          console.error(`🔥 GPT failed on ${ticker}:`, gptErr.message);
          continue;
        }

        // 💸 Step 2.7: Calculate financial stats
        const estimatedCost = contract.midPrice * 100;
        const breakEvenPrice =
          contract.contract_type === 'call'
            ? contract.strike_price + contract.ask
            : contract.strike_price - contract.ask;
        const expectedROI =
          ((gptResponse.targetPrice - gptResponse.entryPrice) / gptResponse.entryPrice) * 100;

        // 💾 Step 2.8: Save trade recommendation to MongoDB
        const userIdentifier = req.user?.email || req.headers['x-guest-id'] || 'anonymous';
        console.log(`💾 [analyzeTrade] Saving trade with userIdentifier: ${userIdentifier}`);
        const newRec = new TradeRecommendation({
          tickers: [ticker],
          capital: enrichedData.capital,
          riskTolerance,
          userIdentifier: userIdentifier,
          recommendationDirection: gptResponse.tradeType.toLowerCase(),
          confidence: gptResponse.confidence.toLowerCase(),
          gptPrompt: gptResponse.prompt ?? 'N/A',
          gptResponse: gptResponse.analysis,
          entryPrice: gptResponse.entryPrice,
          targetPrice: gptResponse.targetPrice,
          stopLoss: gptResponse.stopLoss,
          estimatedCost,
          breakEvenPrice,
          expectedROI,
          expiryDate: normalizedExpiryDate, // ✅ Use the normalized Date object for database
          option: contract, // ✅ Use original contract with proper date format
          sentimentSummary: enrichedData.sentiment,
          // Only include well-formed congressional trades; drop placeholder/unknown items
          congressTrades: Array.isArray(enrichedData.congress)
            ? enrichedData.congress
                .filter(trade => {
                  if (!trade) return false;
                  const rep = (trade.representative || '').toString().toLowerCase();
                  const type = (trade.type || '').toString();
                  const amt = (trade.amount || '').toString();
                  const link = (trade.link || '').toString();
                  // Drop placeholder/unknown entries
                  if (!rep || rep.includes('unknown')) return false;
                  if (!type || type === 'N/A') return false;
                  if (!amt || amt === 'N/A') return false;
                  if (!link || link === '#') return false;
                  return true;
                })
                .map(trade => ({
                  ticker: ticker,
                  politician: trade.representative,
                  transactionDate: trade.date ? new Date(trade.date) : undefined,
                  transactionType: trade.type ? trade.type.toLowerCase() : undefined,
                  amountRange: trade.amount,
                  source: trade.link
                }))
            : [],
          indicators: enrichedData.indicators
        });

        await newRec.save();
        console.log(`✅ Saved recommendation for ${ticker} to MongoDB`);

        // 🎁 Step 2.9: Add to frontend response object
        enrichedTickers.push({
          ticker,
          analysis: {
            tickers: [ticker],
            capital,
            riskTolerance,
            recommendationDirection: gptResponse.tradeType.toLowerCase(),
            confidence: gptResponse.confidence.toLowerCase(),
            gptResponse: gptResponse.analysis,
            entryPrice: gptResponse.entryPrice,
            targetPrice: gptResponse.targetPrice,
            stopLoss: gptResponse.stopLoss,
            breakEvenPrice,
            expectedROI,
            option: displayContract, // ✅ Use display contract for frontend
            sentimentSummary: enrichedData.sentiment || 'No news sentiment available.',
            // Only include well-formed congressional trades in the API response
            congressTrades: Array.isArray(enrichedData.congress)
              ? enrichedData.congress
                  .filter(trade => {
                    if (!trade) return false;
                    const rep = (trade.representative || '').toString().toLowerCase();
                    const type = (trade.type || '').toString();
                    const amt = (trade.amount || '').toString();
                    const link = (trade.link || '').toString();
                    if (!rep || rep.includes('unknown')) return false;
                    if (!type || type === 'N/A') return false;
                    if (!amt || amt === 'N/A') return false;
                    if (!link || link === '#') return false;
                    return true;
                  })
                  .map(trade => ({
                    ticker: ticker,
                    politician: trade.representative,
                    transactionDate: trade.date ? new Date(trade.date) : undefined,
                    transactionType: trade.type ? trade.type.toLowerCase() : undefined,
                    amountRange: trade.amount,
                    source: trade.link
                  }))
              : [],
            indicators: enrichedData.indicators ?? {
              rsi: null,
              macd: { histogram: null },
              vwap: null
            },
            expiryDate: displayContract.expiration_date // ✅ Use display date for UI
          }
        });

      } catch (err) {
        console.error(`❌ Error processing ${ticker}:`, err.message || err);
        continue;
      }
    }

    // 🚨 Step 3: Final fail-safe check
    if (!enrichedTickers.length) {
      console.warn("⚠️ No successful recommendations returned");
      return res.status(500).json({ error: "No trade recommendations generated." });
    }

    // 🎉 Step 4: Send response back to frontend
    console.log(`🎯 Returning ${enrichedTickers.length} trade recommendations`);
    return res.status(200).json({
      message: "✅ Trade recommendations created",
      recommendations: enrichedTickers
    });

  } catch (err) {
    console.error("🔥 Fatal error in analyzeTrade:", err.message || err);
    return res.status(500).json({ error: "Server error during trade analysis." });
  }
};


// 📚 Fetch all saved trade recommendations (filtered by user/guest)
export const getAllTrades = async (req, res) => {
  try {
    console.log('🧠 [getAllTrades] Request received');
    console.log('🧠 [getAllTrades] Headers:', req.headers);
    console.log('🧠 [getAllTrades] req.user:', req.user);
    console.log('🧠 [getAllTrades] req.user.email:', req.user?.email);
    console.log('🧠 [getAllTrades] req.user._id:', req.user?._id);
    
    const userId = req.user?._id?.toString();
    const userEmail = req.user?.email;
    const guestId = req.headers['x-guest-id'];
    const userIdentifier = userEmail || guestId || 'anonymous';

    console.log('🧠 [getAllTrades] userIdentifier:', userIdentifier);
    console.log('🧠 [getAllTrades] guestId from headers:', guestId);
    console.log('🧠 [getAllTrades] userId:', userId);
    console.log('🧠 [getAllTrades] userEmail:', userEmail);

    // Build query based on authentication status
    let query = {};
    
    if (req.user && req.user.email) {
      // Authenticated user - get their trades AND legacy trades for backward compatibility
      query = {
        $or: [
          { userIdentifier: req.user.email },
          { userIdentifier: { $in: ['undefined', 'anonymous', null] } }
        ]
      };
      console.log('🔐 [getAllTrades] Fetching trades for authenticated user:', req.user.email);
      console.log('🔐 [getAllTrades] Query for authenticated user:', JSON.stringify(query));
    } else if (guestId) {
      // Guest user with ID - get their trades OR all anonymous trades for backward compatibility
      if (guestId === 'anonymous') {
        // For anonymous users, return all trades (including legacy undefined trades)
        query = {};
        console.log('🌐 [getAllTrades] Fetching all trades for anonymous user');
      } else {
        // For specific guest IDs, return ALL trades (including legacy undefined trades and anonymous trades)
        // This ensures guest users can see all previous trade recommendations
        query = {};
        console.log('👤 [getAllTrades] Fetching all trades for guest user:', guestId);
      }
    } else {
      // No guest ID - get all trades (including legacy undefined trades and anonymous trades)
      query = {};
      console.log('🌐 [getAllTrades] Fetching all trades for anonymous user');
    }

    console.log('🧠 [getAllTrades] Final query:', JSON.stringify(query));
    const trades = await TradeRecommendation.find(query).sort({ createdAt: -1 });
    const allTrades = await TradeRecommendation.find({});
    console.log(`📊 Matched trades for userIdentifier="${userIdentifier}": ${trades.length}`);
    console.log(`📊 Total trades in DB: ${allTrades.length}`);
    console.log('🕵️ All trades in DB with userIdentifiers:');
    allTrades.slice(0, 10).forEach((trade, index) => {
      console.log(`  ${index + 1}. userIdentifier: "${trade.userIdentifier}", tickers: ${trade.tickers}, createdAt: ${trade.createdAt}`);
    });
    if (trades.length === 0) {
      console.log('⚠️ No trades found for current userIdentifier');
    }

    console.log('🧠 [getAllTrades] Sending response with', trades.length, 'trades');
    console.log('🧠 [getAllTrades] First trade sample:', trades[0] ? {
      id: trades[0]._id,
      tickers: trades[0].tickers,
      userIdentifier: trades[0].userIdentifier,
      createdAt: trades[0].createdAt
    } : 'No trades');
    
    // Log detailed information about the first few trades
    if (trades.length > 0) {
      console.log('🧠 [getAllTrades] Detailed sample of first 3 trades:');
      trades.slice(0, 3).forEach((trade, index) => {
        console.log(`  Trade ${index + 1}:`);
        console.log(`    - ID: ${trade._id}`);
        console.log(`    - Tickers: ${trade.tickers}`);
        console.log(`    - UserIdentifier: ${trade.userIdentifier}`);
        console.log(`    - CreatedAt: ${trade.createdAt}`);
        console.log(`    - Congress: ${typeof trade.congress} - ${Array.isArray(trade.congress) ? trade.congress.length : 'not array'}`);
        console.log(`    - CongressTrades: ${typeof trade.congressTrades} - ${Array.isArray(trade.congressTrades) ? trade.congressTrades.length : 'not array'}`);
      });
    }
    
    // Convert congressional data to clean array format for UI
    const processedTrades = trades.map(trade => {
      const tradeObj = trade.toObject();
      
      // Preserve the original congress field if it exists
      if (Array.isArray(tradeObj.congress) && tradeObj.congress.length > 0) {
        // Use the congress field as-is if it's already in the correct format
        console.log(`✅ [getAllTrades] Trade ${tradeObj._id} has congress field with ${tradeObj.congress.length} entries`);
      } else if (Array.isArray(tradeObj.congressTrades) && tradeObj.congressTrades.length > 0) {
        // congressTrades is already an array - preserve it
        console.log(`✅ [getAllTrades] Trade ${tradeObj._id} has congressTrades array with ${tradeObj.congressTrades.length} entries`);
      } else if (tradeObj.congressTrades && typeof tradeObj.congressTrades === 'object' && !Array.isArray(tradeObj.congressTrades)) {
        // congressTrades is an object - log its structure for debugging
        console.log(`🔍 [getAllTrades] Trade ${tradeObj._id} has congressTrades object:`, {
          type: typeof tradeObj.congressTrades,
          keys: Object.keys(tradeObj.congressTrades),
          sampleValues: Object.values(tradeObj.congressTrades).slice(0, 3)
        });
      } else if (!Array.isArray(tradeObj.congressTrades) && typeof tradeObj.congressTrades === 'string') {
        const text = tradeObj.congressTrades;
        const items = [];
        // Split into blocks by blank line, then extract fields
        const blocks = text.split(/\n\s*\n/).map(b => b.trim()).filter(Boolean);
        for (const block of blocks) {
          const lines = block.split('\n').map(l => l.trim()).filter(Boolean);
          const nameLine = lines.find(l => l.startsWith('•')) || lines[0];
          const metaLine = lines.find(l => /(BUY|SELL)\s*\(/i.test(l)) || '';
          const linkLine = lines.find(l => l.startsWith('🔗')) || '';
          const politician = nameLine ? nameLine.replace(/^•\s*/, '').trim() : '';
          const transactionTypeMatch = metaLine.match(/(BUY|SELL)/i);
          const amountMatch = metaLine.match(/\(([^)]+)\)/);
          const dateMatch = metaLine.match(/on\s+(.+)$/i);
          const urlMatch = linkLine.match(/https?:\/\/\S+/);
          const obj = {
            politician: politician || undefined,
            transactionType: transactionTypeMatch ? transactionTypeMatch[1].toLowerCase() : undefined,
            amountRange: amountMatch ? amountMatch[1] : undefined,
            transactionDate: dateMatch ? new Date(dateMatch[1]).toISOString() : undefined,
            source: urlMatch ? urlMatch[0] : undefined
          };
          // Keep only well-formed entries
          if (
            obj.politician &&
            obj.transactionType &&
            obj.amountRange &&
            obj.source && obj.source !== '#'
          ) {
            items.push(obj);
          }
        }
        tradeObj.congressTrades = items;
      }

      // Ensure array shape and drop invalid/placeholder entries
      if (!Array.isArray(tradeObj.congressTrades)) {
        tradeObj.congressTrades = [];
      } else if (tradeObj.congressTrades.length > 0) {
        tradeObj.congressTrades = tradeObj.congressTrades
          .map((ct) => {
            if (typeof ct === 'object' && ct !== null) {
              // Already structured
              if (ct.politician && ct.transactionType && ct.amountRange && ct.source && ct.source !== '#') {
                return ct;
              }
              // Convert old shape
              if (ct.representative && ct.type && ct.amount) {
                return {
                  politician: ct.representative,
                  transactionType: ct.type.toLowerCase(),
                  amountRange: ct.amount,
                  transactionDate: ct.date ? new Date(ct.date).toISOString() : undefined,
                  source: ct.link || undefined
                };
              }
            }
            // Skip invalid entries
            return null;
          })
          .filter((ct) => !!ct && ct.politician && !ct.politician.toLowerCase().includes('unknown') && ct.source && ct.source !== '#');
      }
      
      // Ensure congress field is preserved if it exists
      if (Array.isArray(tradeObj.congress) && tradeObj.congress.length > 0) {
        // Keep the original congress field
        console.log(`✅ [getAllTrades] Preserving congress field for trade ${tradeObj._id}: ${tradeObj.congress.length} entries`);
      } else if (Array.isArray(tradeObj.congressTrades) && tradeObj.congressTrades.length > 0) {
        // Copy congressTrades to congress field for consistency
        tradeObj.congress = tradeObj.congressTrades;
        console.log(`✅ [getAllTrades] Copied congressTrades to congress field for trade ${tradeObj._id}: ${tradeObj.congress.length} entries`);
      } else if (tradeObj.congressTrades && typeof tradeObj.congressTrades === 'object' && !Array.isArray(tradeObj.congressTrades)) {
        // Handle case where congressTrades is an object (like from your logs: "object - 15")
        // Convert object to array format
        const congressArray = Object.values(tradeObj.congressTrades).filter(val => 
          val && typeof val === 'object' && (val.politician || val.representative)
        );
        if (congressArray.length > 0) {
          tradeObj.congress = congressArray;
          tradeObj.congressTrades = congressArray;
          console.log(`✅ [getAllTrades] Converted congressTrades object to array for trade ${tradeObj._id}: ${congressArray.length} entries`);
        }
      }
      
      // Final count log
      console.log(`✅ [getAllTrades] Final congressional data for trade ${tradeObj._id}:`, {
        congress: tradeObj.congress?.length || 0,
        congressTrades: tradeObj.congressTrades?.length || 0
      });
      
      return tradeObj;
    });
    
    // Log what we're sending
    console.log('🧠 [getAllTrades] Sending response with processed trades:');
    if (processedTrades.length > 0) {
      const sampleTrade = processedTrades[0];
      console.log('🧠 [getAllTrades] Sample processed trade congressional data:', {
        id: sampleTrade._id,
        congress: sampleTrade.congress?.length || 0,
        congressTrades: sampleTrade.congressTrades?.length || 0,
        congressSample: sampleTrade.congress?.[0] || 'none',
        congressTradesSample: sampleTrade.congressTrades?.[0] || 'none'
      });
    }
    
    // Ensure we're sending the full array
    return res.status(200).json(processedTrades);
  } catch (error) {
    console.error('❌ [getAllTrades] Error:', error);
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
