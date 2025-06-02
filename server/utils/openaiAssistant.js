import dotenv from 'dotenv';
dotenv.config();

import OpenAI from 'openai';
import getCongressTrades from '../utils/getCongressTrades.js';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

/**
 * Runs a GPT assistant analysis with extended context
 * including sentiment, indicators, congress trades,
 * and affordable options status.
 */
export async function runOptionAssistant(prompt, context) {
  try {
    const assistantId = process.env.OPTION_ASSISTANT_ID;
    const thread = await openai.beta.threads.create();

    // 📥 Inject CapitolTrades data if ticker provided
    if (context?.ticker) {
      const tradesSummary = await getCongressTrades(context.ticker);
      prompt += `\n\n📊 Congressional Trades for ${context.ticker}:\n${tradesSummary}`;
      console.log(`📥 Injected CapitolTrades data for ${context.ticker} into GPT prompt`);
    }

    // 🔍 If no affordable options, provide instruction for GPT to still give guidance
    if (context?.noAffordableOptions) {
      prompt += `\n\n⚠️ No affordable option contracts were found within the user's capital of $${context.capital}.`;
      prompt += ` Still, analyze the overall market setup, indicators (RSI, MACD, VWAP), news sentiment, and congress trades to determine if a CALL, PUT, or AVOID is best based on market trends.`;
    }

    await openai.beta.threads.messages.create(thread.id, {
      role: 'user',
      content: prompt
    });

    const run = await openai.beta.threads.runs.create(thread.id, {
      assistant_id: assistantId
    });

    let status = run.status;
    while (status !== 'completed') {
      await new Promise(r => setTimeout(r, 1500));
      const updated = await openai.beta.threads.runs.retrieve(thread.id, run.id);
      status = updated.status;
    }

    const messages = await openai.beta.threads.messages.list(thread.id);
    const assistantMessage = messages.data.find(msg => msg.role === 'assistant');

    return assistantMessage?.content?.[0]?.text?.value ?? 'No GPT response generated.';
  } catch (err) {
    console.error('❌ GPT Assistant error:', err.message);
    return 'GPT Assistant failed to respond.';
  }
}
