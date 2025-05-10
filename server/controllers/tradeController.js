import axios from 'axios';
import { TradeRecommendation } from '../models/TradeRecommendation.js';
import  calculateIndicators  from '../utils/calculateIndicators.js';
import getStockPrice from '../utils/getStockPrice.js'; // top of file

// 📈 Get aggregate data for a single ticker (daily candles)
export const getAggregate = async (req, res) => {
  const { ticker } = req.params;
  const polygon = req.app.get('polygon');

  try {
    const endDate = new Date();
    const startDate = new Date(endDate);
    startDate.setDate(endDate.getDate() - 30);

    const data = await polygon.stocks.aggregates(
      ticker,
      1,
      "day",
      startDate.toISOString().split('T')[0],
      endDate.toISOString().split('T')[0]
    );
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: `Failed to fetch data for ${ticker}` });
  }
};

// 📊 Get aggregate data for multiple tickers at once
export const getMultiAggregates = async (req, res) => {
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
export const getSummary = async (req, res) => {
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
// Validation Middleware
export const validateTradeRequest = (req, res, next) => {
  const { tickers, capital, riskTolerance } = req.body;
  
  if (!Array.isArray(tickers)) {
    return res.status(400).json({ error: 'Tickers must be an array' });
  }

  if (typeof capital !== 'number' || capital <= 0) {
    return res.status(400).json({ error: 'Invalid capital amount' });
  }

  if (!['low', 'medium', 'high'].includes(riskTolerance)) {
    return res.status(400).json({ error: 'Invalid risk tolerance value' });
  }

  next();
};

// 🤖 Analyze trade (updated core logic)
export const analyzeTrade = async (req, res) => {
  const { tickers, capital, riskTolerance } = req.body;
  const polygon = req.app.get('polygon');

  try {
    const endDate = new Date();
    const startDate = new Date(endDate);
    startDate.setDate(endDate.getDate() - 30);

    const results = await Promise.all(
      tickers.map(async (ticker) => {
        try {
          const raw = await polygon.stocks.aggregates(
            ticker,
            1,
            "day",
            startDate.toISOString().split('T')[0],
            endDate.toISOString().split('T')[0]
          );
          
          const candles = raw.results || [];
          if (candles.length < 14) {
            throw new Error(`Insufficient data (${candles.length}/14 candles)`);
          }

       
          const entryPrice = await getStockPrice(ticker) || candles.at(-1)?.c;
          
          return { 
            ticker,
            entryPrice,
            indicators: calculateIndicators(candles),
            success: true 
          };
        } catch (error) {
          return { 
            ticker,
            error: error.message,
            success: false 
          };
        }
      })
    );

    const validResults = results.filter(r => r.success);
    const errors = results.filter(r => !r.success);

    if (validResults.length === 0) {
      return res.status(400).json({
        error: "Failed to analyze all tickers",
        details: errors
      });
    }

    const prompt = `As an expert trading AI, analyze these indicators:
${validResults.map(r => `
**${r.ticker}**
- Price: $${r.entryPrice?.toFixed(2) || 'N/A'}
- RSI: ${r.indicators.rsi?.toFixed(2) || 'N/A'}
- VWAP: ${r.indicators.vwap?.toFixed(2) || 'N/A'}
- MACD Histogram: ${r.indicators.macd?.histogram?.toFixed(2) || 'N/A'}
`).join('\n')}

User Profile:
- Capital: $${capital}
- Risk: ${riskTolerance.toUpperCase()}`;

    const gptResponse = await axios.post(
      'https://api.openai.com/v1/chat/completions',
      {
        model: 'gpt-4',
        messages: [{ role: 'user', content: prompt }],
        temperature: 0.3
      },
      {
        headers: {
          Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
          'Content-Type': 'application/json',
        },
      }
    );

    const gptReply = gptResponse.data.choices[0].message.content;

    await TradeRecommendation.create({
      tickers,
      capital,
      riskTolerance,
      gptResponse: gptReply,
      entryPrice: validResults[0].entryPrice,
      expiryDate: new Date(Date.now() + 
        ({ high: 7, medium: 21, low: 60 }[riskTolerance] || 21) * 86400000)
    });

    res.json({
      analysis: gptReply,
      prices: validResults.map(r => ({
        ticker: r.ticker,
        price: r.entryPrice,
        rsi: r.indicators.rsi,
        vwap: r.indicators.vwap,
        macd: r.indicators.macd
      })),
      errors
    });

  } catch (error) {
    console.error('Analysis Error:', error);
    res.status(500).json({ 
      error: 'Analysis failed',
      details: error.message 
    });
  }
};

// 📋 Get all trade recommendations
export const getAllTrades = async (req, res) => {
  try {
    const trades = await TradeRecommendation.find().sort({ createdAt: -1 });
    res.json(trades);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch trade history' });
  }
};

// ✅ Update a trade with its final outcome
export const updateTradeOutcome = async (req, res) => {
  const { id } = req.params;
  const { outcome, userNotes } = req.body;

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
