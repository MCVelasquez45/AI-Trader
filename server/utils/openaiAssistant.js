// ✅ File: utils/openaiAssistant.js

import OpenAI from 'openai';

// 🔐 Initialize OpenAI client
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
  timeout: 30000 // ⏱️ 30-second timeout
});

/**
 * 🧠 Uses GPT-4 to analyze enriched stock data and generate trade recommendations
 * @param {Object} enrichedData - Enriched ticker data from enrichTickerData()
 * @returns {Promise<Object>} GPT-generated trade recommendation
 */
export const getGptRecommendation = async (enrichedData) => {
  let gptResponse = '';

  try {
    console.log('\n🧠 [getGptRecommendation] STARTING GPT ANALYSIS');
    console.log('🔑 Object keys in enrichedData:', Object.keys(enrichedData));

    // ✅ Extract components
    const {
      ticker,
      stockPrice,
      indicators,
      sentiment,
      congress,
      contract
    } = enrichedData;

    if (!ticker || !stockPrice) {
      console.error('❌ CRITICAL: Missing ticker or stockPrice');
      return { error: 'Missing required data' };
    }

    const { rsi, vwap, macd } = indicators || {};
    const macdLine = macd?.macd ?? 'N/A';
    const signalLine = macd?.signal ?? 'N/A';
    const histogram = macd?.histogram ?? 'N/A';

    // ✅ Contract safety
    if (!contract || !contract.ticker) {
      console.error('❌ Contract is missing or incomplete:', contract);
      return { error: 'Missing or invalid option contract' };
    }

    // 📝 Prompt Construction
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
Only respond with a raw JSON object — no explanations, no formatting. Wrap the JSON in triple backticks and make sure it is minified and valid.

\`\`\`json
{
  "tradeType": "CALL" or "PUT",
  "confidence": "High|Medium|Low",
  "analysis": "Detailed technical and fundamental analysis...",
  "entryPrice": 00.00,
  "targetPrice": 00.00,
  "stopLoss": 00.00
}
\`\`\`
`.trim();

    console.log('📤 Sending prompt to GPT-4...');
    console.log(prompt);

    const startTime = Date.now();
    const completion = await openai.chat.completions.create({
      model: 'gpt-4',
      messages: [{ role: 'user', content: prompt }],
      temperature: 0.7,
      max_tokens: 1000
    });
    const responseTime = Date.now() - startTime;

    gptResponse = completion?.choices?.[0]?.message?.content?.trim();
    console.log(`✅ GPT Response Received (${responseTime}ms)`);
    console.log('📥 RAW GPT OUTPUT:\n', gptResponse);

    if (!gptResponse) {
      console.error('❌ GPT RESPONSE EMPTY');
      return { error: 'Empty GPT response' };
    }

    // 🧼 Strip triple backticks if present
    let cleanResponse = gptResponse.trim();
    if (cleanResponse.startsWith('```')) {
      const match = cleanResponse.match(/```(?:json)?\s*([\s\S]*?)```/i);
      if (match) cleanResponse = match[1].trim();
    }

    // 🧪 Replace line breaks (helps prevent JSON.parse errors)
    cleanResponse = cleanResponse.replace(/\n/g, ' ');

    let parsed;
    try {
      parsed = JSON.parse(cleanResponse);
    } catch (err) {
      console.error('❌ JSON PARSE ERROR:', err.message);
      return { error: 'Failed to parse GPT response' };
    }

    // ✅ Field validation
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
      console.error(`❌ INVALID confidence level: ${parsed.confidence}`);
      return { error: 'Invalid confidence level' };
    }

    // ✅ Final log confirmation
    console.log('✅ Validated GPT response:');
    console.log(`🧭 Trade Type: ${parsed.tradeType}`);
    console.log(`🎯 Entry: $${parsed.entryPrice}, Target: $${parsed.targetPrice}, Stop: $${parsed.stopLoss}`);
    console.log(`📣 Confidence: ${parsed.confidence}`);

    return parsed;

  } catch (error) {
    console.error('\n🔥 [GPT PROCESSING ERROR]:', error.message);
    console.error('Stack Trace:', error.stack);
    return { error: 'GPT recommendation failed', details: error.message };
  }
};
