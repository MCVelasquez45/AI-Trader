// Import required modules
const axios = require('axios');
const Trade = require('../models/Trade'); // Legacy model (optional)
const TradeRecommendation = require('../models/TradeRecommendation'); // Main model
const calculateIndicators = require('../utils/calculateIndicators'); // Utility for RSI/MACD/VWAP

// 📈 Get aggregate data for a single ticker (daily candles)
exports.getAggregate = async (req, res) => {
  const { ticker } = req.params;
  const polygon = req.app.get('polygon');

  try {
    const data = await polygon.stocks.aggregates(ticker, 1, "day", "2024-05-01", "2024-05-07");
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: `Failed to fetch aggregate for ${ticker}` });
  }
};

// 📊 Get aggregate data for multiple tickers at once
exports.getMultiAggregates = async (req, res) => {
  const { tickers } = req.body;
  const polygon = req.app.get('polygon');

  if (!Array.isArray(tickers)) {
    return res.status(400).json({ error: 'Tickers must be an array.' });
  }

  try {
    const results = await Promise.all(
      tickers.map(ticker =>
        polygon.stocks.aggregates(ticker, 1, "day", "2024-05-01", "2024-05-07")
          .then(data => ({ ticker, data }))
          .catch(error => ({ ticker, error: error.message }))
      )
    );
    res.json(results);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch multiple aggregates' });
  }
};

// 📍 Get latest trade and quote info for a ticker
exports.getSummary = async (req, res) => {
  const { ticker } = req.params;
  const polygon = req.app.get('polygon');

  try {
    const [trade, quote] = await Promise.all([
      polygon.stocks.lastTrade(ticker),
      polygon.stocks.lastQuote(ticker),
    ]);
    res.json({ trade, quote });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch summary' });
  }
};

// 🤖 Analyze trade using GPT + technical indicators
exports.analyzeTrade = async (req, res) => {
  const { tickers, capital, riskTolerance } = req.body;
  const polygon = req.app.get('polygon');

  try {
    // Fetch price history + calculate indicators for each ticker
    const results = await Promise.all(
      tickers.map(async (ticker) => {
        try {
          const raw = await polygon.stocks.aggregates(ticker, 1, "day", "2024-04-01", "2024-05-07");
          const candles = raw.results || [];
          const indicators = calculateIndicators(candles); // RSI, MACD, VWAP
          return { ticker, indicators, candles };
        } catch (error) {
          return { ticker, error: error.message };
        }
      })
    );

    // 🔮 Format prompt for GPT-4 using tech indicators
    const prompt = `You're an advanced options trader AI. Based on these technical indicators and the user's profile, suggest a trade strategy for each:

${results.map(r => `
Ticker: ${r.ticker}
RSI: ${r.indicators?.rsi}
MACD: ${JSON.stringify(r.indicators?.macd)}
VWAP: ${r.indicators?.vwap}
`).join('\n')}

User Capital: $${capital}
Risk Tolerance: ${riskTolerance}

Give a call or put with strike, expiry, and brief explanation for each.`;

    // 💬 Send prompt to OpenAI for trade ideas
    const gptResponse = await axios.post(
      'https://api.openai.com/v1/chat/completions',
      {
        model: 'gpt-4',
        messages: [{ role: 'user', content: prompt }],
        temperature: 0.3,
      },
      {
        headers: {
          Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
          'Content-Type': 'application/json',
        },
      }
    );

    const gptReply = gptResponse.data.choices[0].message.content;

    // 💾 Save to MongoDB for tracking and feedback loop
    await TradeRecommendation.create({
      tickers,
      capital,
      riskTolerance,
      gptResponse: gptReply
    });

    res.json({ analysis: gptReply });
  } catch (error) {
    console.error('❌ GPT analysis error:', error.message);
    res.status(500).json({ error: 'Failed to analyze trade' });
  }
};

// 📋 Get all trade recommendations (for dashboard or history page)
exports.getAllTrades = async (req, res) => {
  try {
    const trades = await TradeRecommendation.find().sort({ createdAt: -1 });
    res.json(trades);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch trade history' });
  }
};

// ✅ Update a trade with its final outcome and optional user notes
exports.updateTradeOutcome = async (req, res) => {
  const { id } = req.params;
  const { outcome, userNotes } = req.body;

  // Validate outcome field
  if (!['win', 'loss', 'pending'].includes(outcome)) {
    return res.status(400).json({ error: 'Invalid outcome value' });
  }

  try {
    const updated = await TradeRecommendation.findByIdAndUpdate(
      id,
      { outcome, userNotes },
      { new: true }
    );

    if (!updated) return res.status(404).json({ error: 'Trade not found' });

    res.json(updated);
  } catch (error) {
    res.status(500).json({ error: 'Failed to update trade outcome' });
  }
};

