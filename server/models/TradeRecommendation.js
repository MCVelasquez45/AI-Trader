// server/models/TradeRecommendation.js
import mongoose from 'mongoose';

const tradeSchema = new mongoose.Schema({
  tickers: [String],
  capital: Number,
  riskTolerance: {
    type: String,
    enum: ['low', 'medium', 'high']
  },
  entryPrice: Number,
  expiryDate: Date,
  targetPrice: Number,
  stopLoss: Number,

  option: {
    ticker: String,
    strike_price: Number,
    expiration_date: String,
    ask: Number,
    bid: Number,
    implied_volatility: Number,
    delta: Number,
    gamma: Number,
    theta: Number,
    vega: Number,
    open_interest: Number
  },

  gptPrompt: String,
  gptResponse: String,
  recommendationDirection: {
    type: String,
    enum: ['call', 'put', 'hold', 'unknown'],
    default: 'unknown'
  },
  confidence: String,

  indicators: {
    rsi: Number,
    vwap: Number,
    macd: {
      macd: Number,
      signal: Number,
      histogram: Number
    }
  },

  congressTrades: String,
  sentimentSummary: String,

  evaluationErrors: [{
    ticker: String,
    error: String,
    timestamp: Date
  }],

  outcome: {
    type: String,
    enum: ['win', 'loss', 'pending'],
    default: 'pending'
  },

  userNotes: String,
  createdAt: {
    type: Date,
    default: Date.now
  }
});

export const TradeRecommendation = mongoose.model('TradeRecommendation', tradeSchema);
