// ✅ File: utils/openaiAssistant.js

import OpenAI from 'openai';

// 🔐 Initialize OpenAI client with API key
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
  timeout: 30000 // 30-second timeout
});

/**
 * 🧠 Uses GPT-4 to analyze enriched stock data and generate trade recommendations
 * 
 * @param {Object} enrichedData - Enriched ticker data from enrichTickerData()
 * @returns {Promise<Object>} GPT-generated trade recommendation
 */
export const getGptRecommendation = async (enrichedData) => {
  let gptResponse = '';
  try {
    console.log('\n🧠 [getGptRecommendation] STARTING GPT ANALYSIS');
    console.log('📦 Received enriched data structure:');

    // 1. CRITICAL: Log the actual keys present in the object
    console.log('🔑 Object keys:', Object.keys(enrichedData));

    // 2. Check for contract presence immediately
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

    // ==================================
    // 🔍 1. DATA EXTRACTION & VALIDATION
    // ==================================
    console.log('\n🔍 [PHASE 1] Extracting data from enrichedData');
    const {
      ticker,
      stockPrice,
      indicators,
      sentiment,
      congress,
      contract  // Destructured from enrichedData
    } = enrichedData;

    // Log each extracted value
    console.log('📝 Extracted values:');
    console.log(`- ticker: ${ticker} (${typeof ticker})`);
    console.log(`- stockPrice: ${stockPrice} (${typeof stockPrice})`);
    console.log(`- contract: ${contract ? 'exists' : 'undefined'} (${typeof contract})`);

    // Validate required parameters
    if (!ticker || !stockPrice) {
      console.error('❌ CRITICAL: Missing ticker or stockPrice');
      return { error: 'Missing required data' };
    }

    // Extract technical indicators with fallbacks
    const { rsi, vwap, macd } = indicators || {};
    const macdLine = macd?.macd ?? 'N/A';
    const signalLine = macd?.signal ?? 'N/A';
    const histogram = macd?.histogram ?? 'N/A';

    console.log('✅ Extracted technical indicators:');
    console.log(`  RSI: ${rsi}, VWAP: ${vwap}, MACD: ${macdLine}`);

    // Validate contract data - CRITICAL DIAGNOSTICS
    console.log('\n🔍 [CONTRACT VALIDATION]');
    if (!contract) {
      console.error('❌ CONTRACT IS UNDEFINED/NULL');
      console.log('🧪 Possible reasons:');
      console.log('- Property name mismatch in enrichedData');
      console.log('- Data not properly passed from controller');
      console.log('- Asynchronous data loading issue');
    } else if (!contract.ticker) {
      console.warn('⚠️ CONTRACT EXISTS BUT MISSING TICKER PROPERTY');
      console.log('Contract object structure:', contract);
      console.log('Contract keys:', Object.keys(contract));
    } else {
      console.log('✅ Contract validated with ticker:', contract.ticker);
    }

    // ==================================
    // 📜 2. PROMPT CONSTRUCTION
    // ==================================
    console.log('\n📝 [PHASE 2] Constructing GPT prompt...');

    // SAFE ACCESS: Use optional chaining with nullish coalescing
    const contractTicker = contract?.ticker ?? 'N/A';
    const contractStrike = contract?.strike_price?.toFixed(2) ?? 'N/A';
    const contractAsk = contract?.ask?.toFixed(2) ?? 'N/A';
    const contractExpiry = contract?.expiration_date ?? 'N/A';
    const contractDelta = contract?.delta?.toFixed(4) ?? 'N/A';
    const contractIV = contract?.implied_volatility
      ? (contract.implied_volatility * 100).toFixed(2) + '%'
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
• VWAP: ${vwap ?? "N/A"}

## MARKET SENTIMENT
📰 Recent News Headlines:
${sentiment || "No significant news"}

## CONGRESSIONAL ACTIVITY
🏛️ Recent Trades by US Lawmakers:
${congress || "No recent congressional trades"}

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

    // ==================================
    // 📨 3. GPT-4 API REQUEST
    // ==================================
    console.log('\n🚀 [PHASE 3] Sending request to GPT-4...');
    const startTime = Date.now();

    const completion = await openai.chat.completions.create({
      model: 'gpt-4',
      messages: [{
        role: 'user',
        content: prompt
      }],
      temperature: 0.7,
      max_tokens: 1000
    });

    const responseTime = Date.now() - startTime;
    console.log(`✅ GPT-4 RESPONSE RECEIVED (${responseTime}ms)`);

    // ==================================
    // 📥 4. RESPONSE PROCESSING
    // ==================================
    console.log('\n🔍 [PHASE 4] Processing GPT response...');
    gptResponse = completion?.choices?.[0]?.message?.content?.trim();

    if (!gptResponse) {
      console.error('❌ EMPTY RESPONSE: No content from GPT');
      return { error: 'Empty GPT response' };
    }

    console.log('📥 RAW GPT OUTPUT:');
    console.log(gptResponse);

    // ==================================
    // 🧩 5. RESPONSE VALIDATION
    // ==================================
    try {
      console.log('\n🔎 [PHASE 5] Validating response format...');
      const parsed = JSON.parse(gptResponse);

      // Validate required fields
      const requiredFields = ['tradeType', 'confidence', 'analysis', 'entryPrice', 'targetPrice', 'stopLoss'];
      const missingFields = requiredFields.filter(field => !(field in parsed));

      if (missingFields.length > 0) {
        console.error(`❌ INVALID RESPONSE: Missing fields - ${missingFields.join(', ')}`);
        console.dir(parsed, { depth: null });
        return { error: 'Invalid GPT response format' };
      }

      // Validate tradeType
      if (!['CALL', 'PUT'].includes(parsed.tradeType)) {
        console.error(`❌ INVALID TRADETYPE: ${parsed.tradeType}`);
        return { error: 'Invalid tradeType' };
      }

      // Validate confidence level
      if (!['High', 'Medium', 'Low'].includes(parsed.confidence)) {
        console.error(`❌ INVALID CONFIDENCE: ${parsed.confidence}`);
        return { error: 'Invalid confidence level' };
      }

      console.log('✅ VALID RESPONSE RECEIVED:');
      console.log(`  Recommendation: ${parsed.tradeType} (${parsed.confidence} confidence)`);
      console.log(`  Entry: $${parsed.entryPrice}, Target: $${parsed.targetPrice}, Stop: $${parsed.stopLoss}`);

      return parsed;

    } catch (parseError) {
      console.error('❌ JSON PARSE ERROR:', parseError.message);
      console.log('🧪 Problematic GPT response:');
      console.log(gptResponse);

      // Attempt to extract JSON from malformed response
      const jsonMatch = gptResponse.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        console.log('⚠️ Attempting to extract JSON from response...');
        try {
          const extracted = JSON.parse(jsonMatch[0]);
          console.log('✅ Successfully extracted JSON');
          return extracted;
        } catch (e) {
          console.error('❌ Extraction failed:', e.message);
        }
      }

      return { error: 'Failed to parse GPT response' };
    }

  } catch (error) {
    console.error('\n🔥 [GPT PROCESSING ERROR]:', error.message);
    console.error('Error stack:', error.stack);

    return {
      error: 'GPT recommendation failed',
      details: error.message
    };
  }
};