// ✅ File: utils/openaiAssistant.js

import OpenAI from 'openai';

// 🔐 Initialize OpenAI with API key from environment variables
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

/**
 * 📈 Generates a GPT trade recommendation based on enriched financial data.
 *
 * @param {Object} data - Contains:
 *   - ticker (string): Stock ticker symbol
 *   - stockPrice (number): Current price of the stock
 *   - indicators (object): Technical indicators (RSI, MACD, VWAP)
 *   - sentiment (string): News sentiment summary
 *   - congress (string): Congressional trades summary (formatted string)
 *   - contract (object): Closest ITM options contract
 *
 * @returns {Promise<string|object>} - GPT trade recommendation or error object
 */
export const getGptRecommendation = async ({
  ticker,
  stockPrice,
  indicators,
  sentiment,
  congress,
  contract
}) => {
  try {
    // 🧠 Destructure technical indicators
    const { rsi, macd, vwap } = indicators;

    // 🔍 Log the entire enriched data input before building the prompt
    console.log('\n🧠 [getGptRecommendation] Enriched Data Received:');
    console.dir({
      ticker,
      stockPrice,
      indicators,
      sentiment,
      congress,
      contract
    }, { depth: null });

    // 📝 Build professional-grade GPT prompt
    const prompt = `
You are a hedge fund-level options strategist and AI trader.

Your objective is to evaluate whether a CALL or PUT contract is the superior setup for the stock below, considering technicals, sentiment, volatility, and congressional positioning.

📈 Ticker: ${ticker}
💵 Stock Price: $${stockPrice}

📊 Technical Indicators:
• RSI: ${rsi}
• MACD: ${macd?.macd} (MACD line)
• Signal Line: ${macd?.signal}
• Histogram: ${macd?.histogram}
• VWAP: ${vwap}

📰 News Sentiment:
${sentiment || "No recent sentiment data available."}

🏛️ Congressional Trades:
${congress || "No recent trades reported by elected officials."}

📉 Closest In-the-Money Option Contract:
• Ticker: ${contract?.ticker}
• Strike: $${contract?.strike_price}
• Ask Price: $${contract?.ask}
• Expiration: ${contract?.expiration_date}
• Delta: ${contract?.delta}
• IV: ${contract?.implied_volatility}
• Open Interest: ${contract?.open_interest}

🎯 Your recommendation must include:
1. CALL or PUT
2. Confidence level (High | Medium | Low)
3. Entry price, target price, and stop loss
4. Reasoning based on ALL data above

💬 Format your reply EXACTLY like this:
{
  "tradeType": "CALL" or "PUT",
  "confidence": "High" | "Medium" | "Low",
  "analysis": "Explain using RSI, MACD, VWAP, IV, sentiment, and political trades.",
  "entryPrice": 00.00,
  "targetPrice": 00.00,
  "stopLoss": 00.00
}
`;

    // 🧾 Log the entire prompt for full traceability
    console.log('\n📤 [Prompt to GPT-4]:\n' + prompt);

    // 🚀 Send to OpenAI's GPT-4
    const completion = await openai.chat.completions.create({
      model: 'gpt-4',
      messages: [{ role: 'user', content: prompt }],
      temperature: 0.7
    });

    // 🧠 Extract the content from GPT-4 response
    const gptResponse = completion.choices[0]?.message?.content?.trim();

    // ✅ Log the final GPT recommendation
    console.log('\n📥 [GPT Output] Recommendation Response Received ✅');
    console.log(gptResponse);

    return gptResponse;

  } catch (error) {
    // ❌ Catch and log any error from OpenAI API call
    console.error('\n❌ [GPT ERROR]:', error.message || error);
    return { error: 'GPT recommendation failed.' };
  }
};
