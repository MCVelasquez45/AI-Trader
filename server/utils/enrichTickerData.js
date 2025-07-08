// ✅ File: utils/enrichTickerData.js

// 📦 Imports
import getStockPrice from './getStockPrice.js';
import getNewsSentiment from './getNewsSentiment.js';
import getCongressTrades from './getCongressTrades.js';
import getMinuteCandles from './getMinuteCandles.js';
import calculateIndicators from './calculateIndicators.js';

/**
 * 🧠 Enriches ticker data with all required analysis components:
 * - Real-time stock price
 * - Option contract (provided by client)
 * - News sentiment analysis
 * - Congressional trade activity
 * - Technical indicators (RSI, MACD, VWAP)
 */
export const enrichTickerData = async ({
  ticker,
  capital,
  riskTolerance = 'medium',
  contractType = 'call',
  clientContract = null // ✅ Must be passed in from frontend; backend no longer performs contract lookup
}) => {
  console.log(`\n🔬 [enrichTickerData] STARTING ENRICHMENT FOR: ${ticker.toUpperCase()}`);
  console.log(`📥 Input Parameters — Capital: $${capital}, Risk: ${riskTolerance}, Option Type: ${contractType}`);
  if (clientContract) console.log(`🧾 Client-provided contract included: ${clientContract.ticker}`);

  // ========================
  // 🛡️ 1. INPUT VALIDATION
  // ========================
  if (!ticker || typeof ticker !== 'string') {
    console.error('❌ CRITICAL: Invalid ticker - must be non-empty string');
    return null;
  }

  if (!capital || isNaN(capital) || capital <= 0) {
    console.error(`❌ CRITICAL: Invalid capital $${capital} - must be a positive number`);
    return null;
  }

  // ===================================
  // 📑 2. VALIDATE CLIENT CONTRACT
  // ===================================
  const isValidContract = clientContract &&
    typeof clientContract.ticker === 'string' &&
    typeof clientContract.strike_price === 'number' &&
    typeof clientContract.ask === 'number' &&
    typeof clientContract.expiration_date === 'string' &&
    typeof clientContract.contract_type === 'string';

  if (!isValidContract) {
    console.error(`❌ ERROR: Invalid or missing client contract. enrichTickerData requires a fully structured contract.`);
    return null;
  }

  const itmContract = clientContract;
  console.log(`✅ Using client-provided contract: ${itmContract.ticker}`);
  console.log(`📝 CONTRACT DETAILS:`, {
    ask: itmContract.ask,
    bid: itmContract.bid,
    strike: itmContract.strike_price,
    expiration: itmContract.expiration_date,
    delta: itmContract.delta,
    iv: itmContract.implied_volatility,
    oi: itmContract.open_interest
  });

  // ========================
  // 💹 3. FETCH STOCK PRICE
  // ========================
  console.log(`\n💰 [PHASE 1] Fetching real-time price for ${ticker}...`);
  const stockPrice = await getStockPrice(ticker);
  if (!stockPrice) {
    console.warn(`⚠️ ABORTING: Could not retrieve stock price for ${ticker}`);
    return null;
  }
  console.log(`✅ REAL-TIME PRICE: $${stockPrice}`);

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
  console.log(`✅ CONGRESSIONAL TRADES FETCHED: ${rawCongress.length} records found.`);

  let congressSummary = 'No recent congressional trades found.';
  let congressDataForLog = [];

  if (Array.isArray(rawCongress) && rawCongress.length > 0) {
    congressSummary = rawCongress.map(trade => {
      const { representative = 'Unknown', type = 'N/A', amount = '???', date = '??', link = '#' } = trade;
      return `• ${representative} ${type.toUpperCase()} (${amount}) on ${date}\n🔗 ${link}`;
    }).join('\n\n');

    congressDataForLog = rawCongress;
  }

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
  // ✅ 7. FINAL RESULT
  // ========================
  console.log(`\n✅ [ENRICHMENT COMPLETE] Assembling final data for ${ticker}`);
  const result = {
    ticker,
    stockPrice,
    capital,
    contract: itmContract,
    sentiment,
    congress: congressSummary,
    indicators
  };

  console.log(`📦 FINAL ENRICHED DATA STRUCTURE:`);
  console.log(JSON.stringify({ ...result, contract: result.contract }, null, 2));

  return result;
};
