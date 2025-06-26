// ✅ File: utils/enrichTickerData.js

import getStockPrice from '../utils/getStockPrice.js';
import { getAffordableOptionContracts } from '../utils/getAffordableOptionContracts.js';
import getNewsSentiment from '../utils/getNewsSentiment.js';
import getCongressTrades from '../utils/getCongressTrades.js';
import getMinuteCandles from '../utils/getMinuteCandles.js';
import calculateIndicators from '../utils/calculateIndicators.js';

/**
 * 🧠 Enriches ticker data with:
 * - ✅ Current stock price
 * - ✅ Most affordable in-the-money (ITM) options contract
 * - ✅ News sentiment analysis
 * - ✅ Recent congressional trading activity
 * - ✅ Technical indicators from minute-level candle data
 *
 * This object is passed to GPT to build a fully informed options recommendation.
 */
export const enrichTickerData = async ({ ticker, capital, riskTolerance = 'medium', contractType = 'call' }) => {
  console.log(`\n🔬 [enrichTickerData] Starting enrichment...`);
  console.log(`➡️ Ticker: ${ticker}, Capital: $${capital}, Risk: ${riskTolerance}, Type: ${contractType}`);

  // 🛡️ Input Validation
  if (!ticker || typeof ticker !== 'string') {
    console.error('❌ Invalid or missing ticker. Must be a non-empty string.');
    return null;
  }
  if (!capital || isNaN(capital) || capital <= 0) {
    console.error('❌ Invalid or missing capital. Must be a number > 0.');
    return null;
  }

  // 1️⃣ GET STOCK PRICE
  const stockPrice = await getStockPrice(ticker);
  if (!stockPrice) {
    console.warn(`⚠️ Could not retrieve current stock price for ${ticker}. Aborting enrichment.`);
    return null;
  }
  console.log(`💲 [Price] Current ${ticker} price: $${stockPrice}`);

  // 2️⃣ GET AFFORDABLE OPTION CONTRACTS
  const { contracts, cheapestUnaffordable } = await getAffordableOptionContracts({
    ticker,
    capital,
    riskTolerance,
    contractType
  });

  const itmContract = contracts?.[0] || null;

  if (!itmContract) {
    console.warn(`⚠️ No valid ITM contracts found within budget for ${ticker}.`);
    if (cheapestUnaffordable) {
      console.log(`💡 [Fallback] Cheapest outside budget: ${cheapestUnaffordable.ticker} (~$${(cheapestUnaffordable.midPrice * 100).toFixed(2)})`);
    } else {
      console.log(`🛑 [No Fallback] No ITM or unaffordable contracts found for ${ticker}`);
    }
  } else {
    // Log all key contract fields for debugging
    console.log(`🎯 [Option] Selected ITM Contract: ${itmContract.ticker}`);
    console.log('📦 [Details]', {
      ask: itmContract.ask,
      bid: itmContract.bid,
      strike_price: itmContract.strike_price,
      expiration_date: itmContract.expiration_date,
      contract_type: itmContract.contract_type,
      delta: itmContract.delta,
      implied_volatility: itmContract.implied_volatility,
      open_interest: itmContract.open_interest
    });

    // Guard: If any of the key fields are invalid, warn here
    if (!itmContract.ask || !itmContract.strike_price) {
      console.warn(`⚠️ Incomplete contract returned: ask=${itmContract.ask}, strike_price=${itmContract.strike_price}`);
    }
  }

  // 3️⃣ GET NEWS SENTIMENT DATA
  const sentiment = await getNewsSentiment(ticker);
  console.log('📰 [Sentiment] News sentiment result:', sentiment);

  // 4️⃣ GET CONGRESSIONAL TRADES
  const congressRaw = await getCongressTrades(ticker);
  let congressArray = [];

  if (Array.isArray(congressRaw)) {
    congressArray = congressRaw;
  } else if (congressRaw && typeof congressRaw === 'object') {
    congressArray = [congressRaw];
  } else {
    console.warn(`⚠️ Unexpected format from congress data endpoint for ${ticker}:`, congressRaw);
  }

  // 🛠️ Build a readable and safe congress summary
let congressSummary = 'No recent congressional trades found.';

if (Array.isArray(congressArray) && congressArray.length > 0) {
  congressSummary = congressArray.map((t, i) => {
    const name = t.representative || 'Unknown';
const type = t.type?.toUpperCase?.() || 'N/A';
const amount = t.amount || '???';
const date = t.date || '??';
const link = t.link || '#';

console.log(`📍 Congress Trade [#${i + 1}]: ${name}, ${type}, ${amount}, ${date}`);

return `• ${name} ${type} (${amount}) on ${date}\n🔗 ${link}`;

  }).join('\n\n');
}

console.log(`🏛️ [Congress] ${congressArray.length} trade(s) for ${ticker}`);
if (congressArray.length > 0) console.log(congressSummary);


  // 5️⃣ GET TECHNICAL INDICATORS (from 1-min candles)
  const candles = await getMinuteCandles(ticker);
  const indicators = calculateIndicators(candles);
  console.log('📊 [Indicators] Calculated technical indicators:', indicators);

 // ✅ FINAL STRUCTURE TO RETURN TO AI
const result = {
  ticker,
  stockPrice,
  capital, // ✅ Include capital for downstream use
  closestITM: itmContract,
  sentiment,
  congress: congressSummary,
  indicators
};

console.log(`✅ [Success] Enrichment complete for ${ticker}`);
console.dir(result, { depth: null });

return result;

};
