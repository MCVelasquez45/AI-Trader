// ✅ File: utils/openaiAssistant.js

import OpenAI from 'openai';

// 🔐 Initialize OpenAI client with API key
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
  timeout: 30000, // 30-second timeout
});

/**
 * 🧠 Uses GPT-4 to analyze enriched stock data and generate trade recommendations
 * 
 * @param {Object} enrichedData - Enriched ticker data from enrichTickerData()
 * @returns {Promise<Object>} GPT-generated trade recommendation
 */
export const getGptRecommendation = async (enrichedData) => {
  let gptResponse = ''; // ⚠️ Declare outside for later reassignment and scope access

  try {
    console.log('\n🧠 [getGptRecommendation] STARTING GPT ANALYSIS');
    console.log('📦 Received enriched data structure:');
    console.log('🔑 Object keys:', Object.keys(enrichedData));

    // ✅ Contract presence check
    const contractExists = enrichedData.hasOwnProperty('contract');
    console.log(`🔍 Contract exists? ${contractExists}`);
    if (contractExists) {
      console.log('✅ Contract found in enrichedData');
      console.log('📝 Contract details:', {
        ticker: enrichedData.contract?.ticker,
        type: typeof enrichedData.contract,
        keys: enrichedData.contract ? Object.keys(enrichedData.contract) : 'N/A'
      });
    } else {
      console.error('❌ CRITICAL: contract property missing in enrichedData');
      console.log('⚠️ Full enrichedData structure:', enrichedData);
    }

    // =====================================
    // 🔍 1. DATA EXTRACTION & VALIDATION
    // =====================================
    const {
      ticker,
      stockPrice,
      indicators,
      sentiment,
      congress,
      contract
    } = enrichedData;

    console.log('📝 Extracted values:');
    console.log(`- ticker: ${ticker}`);
    console.log(`- stockPrice: ${stockPrice}`);
    console.log(`- contract: ${contract ? 'exists' : 'undefined'}`);

    if (!ticker || !stockPrice) {
      console.error('❌ CRITICAL: Missing ticker or stockPrice');
      return { error: 'Missing required data' };
    }

    const { rsi, vwap, macd } = indicators || {};
    const macdLine = macd?.macd ?? 'N/A';
    const signalLine = macd?.signal ?? 'N/A';
    const histogram = macd?.histogram ?? 'N/A';

    console.log('✅ Extracted technical indicators:');
    console.log(`  RSI: ${rsi}, VWAP: ${vwap}, MACD: ${macdLine}`);

    // 🔎 Contract diagnostics
    console.log('\n🔍 [CONTRACT VALIDATION]');
    if (!contract) {
      console.error('❌ CONTRACT IS UNDEFINED/NULL');
      return { error: 'Missing contract data' };
    } else if (!contract.ticker) {
      console.warn('⚠️ CONTRACT EXISTS BUT MISSING TICKER');
      console.log('Contract object:', contract);
    } else {
      console.log('✅ Contract validated with ticker:', contract.ticker);
    }

    // =====================================
    // 📜 2. PROMPT CONSTRUCTION
    // =====================================
    console.log('\n📝 [PHASE 2] Constructing GPT prompt...');
    const contractTicker = contract?.ticker ?? 'N/A';
    const contractStrike = contract?.strike_price?.toFixed(2) ?? 'N/A';
    const contractAsk = contract?.ask?.toFixed(2) ?? 'N/A';
    const contractExpiry = contract?.expiration_date ?? 'N/A';
    const contractDelta = contract?.delta?.toFixed(4) ?? 'N/A';
    const contractIV = contract?.implied_volatility
      ? `${(contract.implied_volatility * 100).toFixed(2)}%`
      : 'N/A';
    const contractOI = contract?.open_interest?.toLocaleString() ?? 'N/A';

    const prompt = `
# ROLE: Hedge Fund-Level Options Strategist
# MISSION: Evaluate optimal CALL/PUT setup using ALL available data

## STOCK DATA
📈 Ticker: ${ticker}
💵 Current Price: $${stockPrice.toFixed(2)}

## TECHNICAL ANALYSIS
📊 Indicators:
• RSI: ${rsi} ${rsi > 70 ? '(OVERBOUGHT)' : rsi < 30 ? '(OVERSOLD)' : ''}
• MACD Line: ${macdLine}
• MACD Signal: ${signalLine}
• MACD Histogram: ${histogram}
• VWAP: ${vwap ?? 'N/A'}

## MARKET SENTIMENT
📰 Recent News Headlines:
${sentiment || 'No significant news'}

## CONGRESSIONAL ACTIVITY
🏛️ Recent Trades by US Lawmakers:
${congress || 'No recent congressional trades'}

## OPTION CONTRACT DETAILS
📉 Selected Contract:
• Symbol: ${contractTicker}
• Strike: $${contractStrike}
• Ask: $${contractAsk}
• Expiry: ${contractExpiry}
• Delta: ${contractDelta}
• IV: ${contractIV}
• OI: ${contractOI}

## YOUR MISSION
1. Determine optimal trade direction (CALL or PUT)
2. Assess confidence level (High/Medium/Low)
3. Calculate precise entry, target and stop levels
4. Explain reasoning using ALL data points

## RESPONSE FORMAT
{
  "tradeType": "CALL" or "PUT",
  "confidence": "High|Medium|Low",
  "analysis": "Detailed technical and fundamental analysis...",
  "entryPrice": 00.00,
  "targetPrice": 00.00,
  "stopLoss": 00.00
}
`.trim();

    console.log('📤 FINAL PROMPT SENT TO GPT-4:');
    console.log(prompt);
    console.log(`📏 Prompt length: ${prompt.length} characters`);

    // =====================================
    // 🤖 3. GPT-4 API REQUEST
    // =====================================
    const startTime = Date.now();
    const completion = await openai.chat.completions.create({
      model: 'gpt-4',
      messages: [{ role: 'user', content: prompt }],
      temperature: 0.7,
      max_tokens: 1000
    });
    const responseTime = Date.now() - startTime;
    console.log(`✅ GPT-4 RESPONSE RECEIVED (${responseTime}ms)`);

    // =====================================
    // 📥 4. PARSE + VALIDATE RESPONSE
    // =====================================
    gptResponse = completion?.choices?.[0]?.message?.content?.trim();
    console.log('\n📥 RAW GPT OUTPUT:\n', gptResponse);

    if (!gptResponse) {
      console.error('❌ GPT RESPONSE EMPTY');
      return { error: 'Empty GPT response' };
    }

    try {
      console.log('\n🔎 [PHASE 5] Validating response format...');
      const parsed = JSON.parse(gptResponse);

      const requiredFields = ['tradeType', 'confidence', 'analysis', 'entryPrice', 'targetPrice', 'stopLoss'];
      const missing = requiredFields.filter(field => !(field in parsed));

      if (missing.length) {
        console.error(`❌ MISSING FIELDS: ${missing.join(', ')}`);
        return { error: 'Invalid GPT response format' };
      }

      if (!['CALL', 'PUT'].includes(parsed.tradeType)) {
        console.error(`❌ INVALID tradeType: ${parsed.tradeType}`);
        return { error: 'Invalid tradeType' };
      }

      if (!['High', 'Medium', 'Low'].includes(parsed.confidence)) {
        console.error(`❌ INVALID confidence: ${parsed.confidence}`);
        return { error: 'Invalid confidence level' };
      }

      console.log('✅ VALID RESPONSE RECEIVED:');
      console.log(`  ➤ ${parsed.tradeType} (${parsed.confidence} confidence)`);
      console.log(`  ➤ Entry: $${parsed.entryPrice}, Target: $${parsed.targetPrice}, Stop: $${parsed.stopLoss}`);

      return parsed;

    } catch (parseError) {
      console.error('❌ JSON PARSE ERROR:', parseError.message);
      console.log('🧪 Raw GPT Response:', gptResponse);

      const jsonMatch = gptResponse.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        try {
          const extracted = JSON.parse(jsonMatch[0]);
          console.log('✅ Extracted JSON after fallback parse');
          return extracted;
        } catch (e) {
          console.error('❌ Fallback extraction failed:', e.message);
        }
      }

      return { error: 'Failed to parse GPT response' };
    }

  } catch (error) {
    console.error('\n🔥 [GPT PROCESSING ERROR]:', error.message);
    console.error('Stack Trace:', error.stack);
    return { error: 'GPT recommendation failed', details: error.message };
  }
};
