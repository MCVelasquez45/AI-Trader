import dotenv from 'dotenv';
dotenv.config(); // ✅ Ensures .env values are loaded

import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY // ✅ Safe access to your API key
});

export async function runOptionAssistant(prompt, context) {
  try {
    const assistantId = process.env.OPTION_ASSISTANT_ID;
    const thread = await openai.beta.threads.create();

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

    return assistantMessage?.content?.[0]?.text?.value ?? 'No response';
  } catch (err) {
    console.error('❌ Assistant error:', err.message);
    return 'GPT Assistant failed to respond.';
  }
}
