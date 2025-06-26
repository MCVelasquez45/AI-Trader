// ✅ File: server/models/TradeRecommendation.js

import mongoose from 'mongoose';

/**
 * 🧠 TradeRecommendation Schema
 * Stores GPT-based trade ideas, technical indicators, and contract details
 */
const tradeRecommendationSchema = new mongoose.Schema({
  // 🧾 User input
  tickers: [String],  // User's watchlist
  capital: { type: Number, required: true },   // User’s available capital
  riskTolerance: {
    type: String,
    enum: ['low', 'medium', 'high'],
    default: 'medium'
  },

  // 📈 Stock price + ROI assumptions
  entryPrice: Number,              // Underlying stock’s price at time of scan
  estimatedCost: Number,           // Cost of the option (contract * 100)
  breakEvenPrice: Number,          // Strike + cost (for calls)
  expectedROI: Number,             // Estimated ROI at target price

  // ⏳ Option contract logic
  expiryDate: String,
  targetPrice: Number,             // GPT predicted price target
  stopLoss: Number,                // Stop loss threshold

  option: {
    ticker: String,
    strike_price: Number,
    expiration_date: String,
    contract_type: {
      type: String,
      enum: ['call', 'put']
    },
    ask: Number,
    bid: Number,
    delta: Number,
    gamma: Number,
    theta: Number,
    vega: Number,
    implied_volatility: Number,
    open_interest: Number
  },

  // 🤖 GPT prompt + response
  gptPrompt: String,
  gptResponse: String,
  recommendationDirection: {
    type: String,
    enum: ['call', 'put', 'hold', 'avoid']
  },
  confidence: {
    type: String,
    enum: ['low', 'medium', 'high'],
    default: 'medium'
  },

  // 📊 Technical indicator snapshot
  indicators: {
    rsi: Number,
    vwap: Number,
    macd: {
      macd: Number,
      signal: Number,
      histogram: Number
    }
  },

  // 🏛️ Contextual data
  congressTrades: String,           // Optional HTML string
  sentimentSummary: String,         // News headline summary

  // ✅ Trade result tracking
  outcome: {
    type: String,
    enum: ['win', 'loss', 'pending'],
    default: 'pending'
  },

  // 🗒️ Notes for future UX input
  userNotes: String

}, { timestamps: true }); // auto adds createdAt and updatedAt

export default mongoose.model('TradeRecommendation', tradeRecommendationSchema);
