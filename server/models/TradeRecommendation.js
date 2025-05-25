import mongoose from 'mongoose';

const tradeSchema = new mongoose.Schema({
  tickers: { type: [String], required: true },
  capital: { type: Number, required: true },
  riskTolerance: { type: String, enum: ['low', 'medium', 'high'], required: true },
  gptResponse: { type: String, required: true },
  gptPrompt: { type: String },

  entryPrice: { type: Number }, // stock entry price

  option: {
    contract: { type: String },
    strike: { type: Number },
    estimatedCost: { type: Number },
    expiration: { type: String },
    sharesPerContract: { type: Number },
    style: { type: String }
  },

  expiryDate: { type: Date, required: true },
  outcome: { type: String, enum: ['win', 'loss', 'pending'], default: 'pending' },

  // ✅ NEW FIELDS
  recommendationDirection: {
    type: String,
    enum: ['call', 'put', 'hold', 'unknown'],
    default: 'unknown'
  },
  confidence: { type: String, default: 'unknown' },

  indicators: {
    rsi: Number,
    vwap: Number,
    macd: {
      macd: Number,
      signal: Number,
      histogram: Number
    }
  },

  congressTrades: {
    type: String,
    default: 'Not available'
  },
  
  sentimentSummary: {
    type: String,
    default: 'Not available'
  },

  evaluationErrors: [{
    ticker: String,
    error: String,
    timestamp: Date
  }],

  createdAt: { type: Date, default: Date.now }
});

export const TradeRecommendation = mongoose.model('TradeRecommendation', tradeSchema);
