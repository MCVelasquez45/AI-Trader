import dotenv from 'dotenv';
dotenv.config();

import { calculateIndicators } from './calculateIndicators.js';
import getStockPrice from './getStockPrice.js';
import getAffordableOptionContracts from './getAffordableOptionContracts.js';
import { runOptionAssistant } from './openaiAssistant.js';

export default async function TradeScan(ticker, capital, riskTolerance) {
  try {
    console.log(`💰 Fetching price for ${ticker}...`);
    const stockPrice = await getStockPrice(ticker);
    console.log(`💰 ${ticker} price: ${stockPrice}`);

    const indicators = await calculateIndicators(ticker);
    console.log(`✅ RSI Result: ${indicators.rsi}`);
    console.log(`✅ VWAP Result: ${indicators.vwap}`);
    console.log(`📊 MACD:`, indicators.macd);

    const { contracts, skippedContracts } = await getAffordableOptionContracts(
      ticker,
      capital,
      process.env.POLYGON_API_KEY
    );

    console.log(`📦 ${ticker}: Found ${contracts.length} affordable contracts`);
    if (skippedContracts?.length) {
      console.warn(`⚠️ ${ticker}: ${skippedContracts.length} contracts skipped due to incomplete data`);
      skippedContracts.forEach(c => {
        console.warn(`⚠️ Skipped: ${c.ticker} | Reason: ${c.reason}`);
      });
    }

    if (!contracts.length) {
      console.log(`🚫 No affordable contracts found for ${ticker}.`);
      return null;
    }

    const selected = contracts[0];
    const gptPrompt = `
Analyze the following stock and recommend if a trader with a ${riskTolerance} risk tolerance should buy this CALL option:

Ticker: ${ticker}
Current Price: ${stockPrice}
Strike Price: ${selected.strike_price}
Expiration Date: ${selected.expiration_date}
Capital Available: ${capital}
Technical Indicators:
  - RSI: ${indicators.rsi}
  - VWAP: ${indicators.vwap}
  - MACD: ${indicators.macd.MACD}
  - MACD Signal: ${indicators.macd.signal}
  - MACD Histogram: ${indicators.macd.histogram}
`;

    const gptResponse = await runOptionAssistant(gptPrompt, { ticker, indicators, selected });

    return {
      ticker,
      capital,
      riskTolerance,
      gptResponse,
      expiryDate: selected.expiration_date,
      outcome: 'pending',
    };
  } catch (err) {
    console.error(`❌ TradeScan failed for ${ticker}: ${err.message}`);
    return null;
  }
}
