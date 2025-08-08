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
          congressTrades: Array.isArray(enrichedData.congress)
            ? enrichedData.congress.map(trade => ({
                ticker: trade.ticker || '',
                politician: trade.representative || '',
                transactionDate: new Date(trade.date),
                transactionType: trade.type.toLowerCase(),
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
            congressTrades: Array.isArray(enrichedData.congress)
              ? enrichedData.congress.map(trade => ({
                  ticker: trade.ticker || '',
                  politician: trade.representative || '',
                  transactionDate: new Date(trade.date),
                  transactionType: trade.type.toLowerCase(),
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
    
    // Convert any string-based congressional data to array format
    const processedTrades = trades.map(trade => {
      const tradeObj = trade.toObject();
      
      // Handle congressTrades field
      if (typeof tradeObj.congressTrades === 'string') {
        console.log('🔍 [getAllTrades] Converting congressional string to array format');
        try {
          // Try to parse as JSON first
          const parsed = JSON.parse(tradeObj.congressTrades);
          if (Array.isArray(parsed)) {
            tradeObj.congressTrades = parsed;
            console.log('✅ [getAllTrades] Converted to array format:', parsed.length, 'trades');
          } else {
            // If it's not an array, create a single item array
            tradeObj.congressTrades = [{
              politician: tradeObj.congressTrades,
              transactionType: 'N/A',
              amountRange: 'N/A',
              transactionDate: new Date().toISOString(),
              source: '#'
            }];
            console.log('✅ [getAllTrades] Created single item array from string');
          }
        } catch (error) {
          console.log('❌ [getAllTrades] Failed to parse string as JSON, creating fallback array');
          tradeObj.congressTrades = [{
            politician: tradeObj.congressTrades,
            transactionType: 'N/A',
            amountRange: 'N/A',
            transactionDate: new Date().toISOString(),
            source: '#'
          }];
        }
      } else if (Array.isArray(tradeObj.congressTrades) && tradeObj.congressTrades.length > 0) {
        console.log('🔍 [getAllTrades] Processing congressional array with', tradeObj.congressTrades.length, 'items');
        
        // Check if it's the broken character array format
        const firstItem = tradeObj.congressTrades[0];
        console.log('🔍 [getAllTrades] First item type:', typeof firstItem);
        console.log('🔍 [getAllTrades] First item keys:', Object.keys(firstItem));
        
        if (firstItem && typeof firstItem === 'object') {
          const keys = Object.keys(firstItem);
          const hasNumericKeys = keys.some(key => !isNaN(Number(key)));
          
          console.log('🔍 [getAllTrades] Has numeric keys:', hasNumericKeys);
          console.log('🔍 [getAllTrades] Sample keys:', keys.slice(0, 5));
          
          if (hasNumericKeys) {
            console.log('🔍 [getAllTrades] Converting broken character array format');
            try {
              // Reconstruct the string from character array
              const reconstructedString = keys
                .sort((a, b) => Number(a) - Number(b))
                .map(key => {
                  const value = tradeObj.congressTrades[key];
                  // Handle both string and object values
                  return typeof value === 'string' ? value : (value && typeof value === 'object' ? Object.values(value)[0] : '');
                })
                .join('');
              
              console.log('✅ [getAllTrades] Reconstructed string:', reconstructedString.substring(0, 100) + '...');
              
              // Parse the reconstructed string into structured congressional data
              const lines = reconstructedString.split('\n').filter(line => line.trim());
              console.log('🔍 [getAllTrades] Parsed lines:', lines.length);
              console.log('🔍 [getAllTrades] First few lines:', lines.slice(0, 8));
              
              const congressData = [];
              
              // Look for patterns like "• Name\nPartyInfo\nTransactionInfo\nLink"
              for (let i = 0; i < lines.length; i++) {
                const line = lines[i].trim();
                
                // Check if this line starts with a bullet point (•)
                if (line.startsWith('•')) {
                  // Extract politician name (remove the bullet point)
                  const politician = line.substring(1).trim();
                  
                  // Look for the next few lines to extract party, transaction, and link
                  let party = 'Unknown';
                  let transactionType = 'N/A';
                  let amountRange = 'N/A';
                  let transactionDate = 'N/A';
                  let source = '#';
                  
                  // Check next line for party info
                  if (i + 1 < lines.length) {
                    const partyLine = lines[i + 1].trim();
                    if (partyLine.includes('Republican') || partyLine.includes('Democrat')) {
                      party = partyLine;
                    }
                  }
                  
                  // Check next few lines for transaction info
                  for (let j = i + 1; j < Math.min(i + 4, lines.length); j++) {
                    const checkLine = lines[j].trim();
                    
                    // Look for transaction pattern: "BUY/SELL (amount) on date"
                    const transactionMatch = checkLine.match(/(BUY|SELL)\s+\(([^)]+)\)\s+on\s+(\d+\s+\w+)/);
                    if (transactionMatch) {
                      transactionType = transactionMatch[1].toLowerCase();
                      amountRange = transactionMatch[2];
                      transactionDate = transactionMatch[3];
                    }
                    
                    // Look for link pattern
                    const linkMatch = checkLine.match(/Link:\s*(https:\/\/[^\s]+)/);
                    if (linkMatch) {
                      source = linkMatch[1];
                    }
                  }
                  
                  congressData.push({
                    politician,
                    party,
                    transactionType,
                    amountRange,
                    transactionDate,
                    source
                  });
                  
                  console.log('✅ [getAllTrades] Parsed trade:', {
                    politician,
                    party,
                    transactionType,
                    amountRange,
                    transactionDate,
                    source
                  });
                }
              }
              
              if (congressData.length > 0) {
                tradeObj.congressTrades = congressData;
                console.log('✅ [getAllTrades] Converted to structured format:', congressData.length, 'trades');
              } else {
                // Fallback: create a single item with the reconstructed string
                tradeObj.congressTrades = [{
                  politician: reconstructedString.substring(0, 100) + '...',
                  transactionType: 'N/A',
                  amountRange: 'N/A',
                  transactionDate: 'N/A',
                  source: '#'
                }];
                console.log('⚠️ [getAllTrades] Fallback to string format');
              }
            } catch (error) {
              console.log('❌ [getAllTrades] Failed to reconstruct character array:', error.message);
              tradeObj.congressTrades = [];
            }
          }
        }
      } else if (!Array.isArray(tradeObj.congressTrades)) {
        // If it's not a string and not an array, set to empty array
        tradeObj.congressTrades = [];
        console.log('✅ [getAllTrades] Set undefined congressTrades to empty array');
      }
      
      return tradeObj;
    });
    
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
