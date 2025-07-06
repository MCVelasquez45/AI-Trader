// ✅ File: utils/enrichTickerData.js

import getStockPrice from './getStockPrice.js';
import { getAffordableOptionContracts } from './getAffordableOptionContracts.js';
import getNewsSentiment from './getNewsSentiment.js';
import getCongressTrades from './getCongressTrades.js';
import getMinuteCandles from './getMinuteCandles.js';
import calculateIndicators from './calculateIndicators.js';

/**
 * 🧠 Enriches ticker data with all required analysis components:
 * - Real-time stock price
 * - Affordable option contracts
 * - News sentiment analysis
 * - Congressional trade activity
 * - Technical indicators (RSI, MACD, VWAP)
 * 
 * @param {Object} params
 * @param {string} params.ticker - Stock symbol to analyze
 * @param {number} params.capital - User's available capital
 * @param {string} [params.riskTolerance='medium'] - Risk profile (low/medium/high)
 * @param {string} [params.contractType='call'] - Option type to consider
 * @returns {Promise<Object|null>} Enriched data object or null if validation fails
 */
export const enrichTickerData = async ({
  ticker,
  capital,
  riskTolerance = 'medium',
  contractType = 'call'
}) => {
  console.log(`\n🔬 [enrichTickerData] STARTING ENRICHMENT FOR: ${ticker.toUpperCase()}`);
  console.log(`📥 Input Parameters — Capital: $${capital}, Risk: ${riskTolerance}, Option Type: ${contractType}`);

  // ========================
  // 🛡️ 1. INPUT VALIDATION
  // ========================
  if (!ticker || typeof ticker !== 'string') {
    console.error('❌ CRITICAL: Invalid ticker - must be non-empty string');
    return null;
  }
  if (!capital || isNaN(capital) || capital <= 0) {
    console.error(`❌ CRITICAL: Invalid capital $${capital} - must be positive number`);
    return null;
  }

  // ========================
  // 💹 2. STOCK PRICE FETCH
  // ========================
  console.log(`\n💰 [PHASE 1] Fetching real-time price for ${ticker}...`);
  const stockPrice = await getStockPrice(ticker);
  if (!stockPrice) {
    console.warn(`⚠️ ABORTING: Could not retrieve stock price for ${ticker}`);
    return null;
  }
  console.log(`✅ REAL-TIME PRICE: $${stockPrice}`);

  // ======================================
  // 📑 3. OPTION CONTRACTS IDENTIFICATION
  // ======================================
  console.log(`\n📑 [PHASE 2] Finding affordable ${contractType.toUpperCase()} contracts...`);
  const {
    contracts,
    cheapestUnaffordable,
    closestITM
  } = await getAffordableOptionContracts({
    ticker,
    capital,
    riskTolerance,
    contractType
  });

  // Select best available contract (prioritize ITM then first affordable)
  const itmContract = closestITM || contracts?.[0] || null;

  // Validate contract has required fields
  const contractValid = itmContract && 
    typeof itmContract.ask === 'number' && 
    typeof itmContract.strike_price === 'number';

  if (!contractValid) {
    console.warn(`⛔ NO VALID CONTRACTS: Skipping ${ticker} enrichment`);
    if (cheapestUnaffordable) {
      console.log(`ℹ️ Closest unaffordable contract: ${cheapestUnaffordable.ticker} ≈ $${(cheapestUnaffordable.midPrice * 100).toFixed(2)}`);
    }
    return null;
  }

  console.log(`🎯 SELECTED CONTRACT: ${itmContract.ticker}`);
  console.log(`📝 CONTRACT DETAILS:`, {
    ask: itmContract.ask,
    bid: itmContract.bid,
    strike: itmContract.strike_price,
    expiration: itmContract.expiration_date,
    delta: itmContract.delta,
    iv: itmContract.implied_volatility,
    oi: itmContract.open_interest
  });

  // =============================
  // 📰 4. NEWS SENTIMENT ANALYSIS
  // =============================
  console.log(`\n📰 [PHASE 3] Fetching news sentiment for ${ticker}...`);
  const sentiment = await getNewsSentiment(ticker);
  console.log(`✅ NEWS HEADLINES:\n${sentiment.replace(/- /g, '  - ')}`);

  // ================================
// 🏛️ 5. CONGRESSIONAL TRADE DATA
// ================================
console.log(`\n🏛️ [PHASE 4] Checking congressional trades for ${ticker}...`);
const rawCongress = await getCongressTrades(ticker);
console.log(`✅ CONGRESSIONAL TRADES FETCHED: ${rawCongress.length} records found. LINE 111 ENRICHTICKERDATA.JS`);

let congressSummary = 'No recent congressional trades found.';
let congressDataForLog = []; // For detailed logging

if (Array.isArray(rawCongress) && rawCongress.length > 0) {
  console.log(`📍 FOUND ${rawCongress.length} CONGRESSIONAL TRADES:`);
  
  // Format for GPT
  congressSummary = rawCongress.map(trade => {
    const { representative = 'Unknown', type = 'N/A', amount = '???', date = '??', link = '#' } = trade;
    return `• ${representative} ${type.toUpperCase()} (${amount}) on ${date}\n🔗 ${link}`;
  }).join('\n\n');
  
  // Store for detailed logging
  congressDataForLog = rawCongress;
}

// Log congressional data details
console.log(`🏛️ CONGRESSIONAL TRADES DETAILS:`, congressDataForLog);
console.log(`📝 CONGRESS SUMMARY FOR GPT:\n${congressSummary}`);
  // =================================
  // 📊 6. TECHNICAL INDICATOR ANALYSIS
  // =================================
  console.log(`\n📊 [PHASE 5] Calculating technical indicators...`);
  const candles = await getMinuteCandles(ticker);
  const indicators = calculateIndicators(candles);
  
  console.log('✅ TECHNICAL INDICATORS CALCULATED:');
  console.log(`  RSI: ${indicators.rsi ?? 'N/A'}`);
  console.log(`  VWAP: ${indicators.vwap ?? 'N/A'}`);
  if (indicators.macd) {
    console.log(`  MACD: ${indicators.macd.macd ?? 'N/A'}`);
    console.log(`  Signal: ${indicators.macd.signal ?? 'N/A'}`);
    console.log(`  Histogram: ${indicators.macd.histogram ?? 'N/A'}`);
  } else {
    console.log('  MACD: Not available');
  }

  // ========================
  // ✅ 7. FINAL ENRICHMENT
  // ========================
  console.log(`\n✅ [ENRICHMENT COMPLETE] Assembling final data for ${ticker}`);
  
// ✅ Enrichment Complete
const result = {
  ticker,
  stockPrice,
  capital,
  contract: itmContract,  // ✅ use contract instead of closestITM
  sentiment,
  congress: congressSummary,
  indicators
};


console.log(`✅ [ENRICHMENT COMPLETE] Assembling final data for ${ticker}`);
console.log(`📦 FINAL ENRICHED DATA STRUCTURE:`);
console.log(JSON.stringify({
  ...result,
  contract: result.contract // Explicitly log contract
}, null, 2));

return result;
};