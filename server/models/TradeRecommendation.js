// 📦 Mongoose model for storing AI-generated trade recommendations
import mongoose from 'mongoose';

/**
 * 🧠 TradeRecommendation Schema
 * Stores GPT-based trade ideas, technical indicators, and option contract details.
 * Used for analysis, history tracking, and evaluation of outcomes.
 */
const tradeRecommendationSchema = new mongoose.Schema({                                                                              
  // 🧾 User input
  tickers: [String],                         // Watchlist tickers (e.g., ['AAPL', 'TSLA'])
  capital: { type: Number, required: true }, // User’s available capital for trade
  riskTolerance: {
    type: String,
    enum: ['low', 'medium', 'high'],
    default: 'medium'                        // Used to determine contract expiry length
  },

  // 📈 Stock price + cost assumptions
  entryPrice: Number,                        // Price of the underlying stock at time of recommendation
  estimatedCost: Number,                     // Cost to purchase 1 contract (price * 100)
  breakEvenPrice: Number,                    // Entry price + cost (for calls) or - cost (for puts)
  expectedROI: Number,                       // ROI at target price (estimated)

  // ⏳ Option contract logic
  expiryDate: { type: Date, required: true },         // Expiration date of trade (used for evaluation)
  targetPrice: Number,                                 // GPT-predicted target for underlying
  stopLoss: Number,                                    // Estimated exit price to cut loss

  // 🎟️ Option contract details
  option: {
    ticker: String,                                    // Option symbol (e.g., "O:AMD250719C00090000")
    strike_price: Number,                              // Strike price of contract
    expiration_date: { type: Date },                   // Contract expiration (ISO date string)
    contract_type: {
      type: String,
      enum: ['call', 'put']
    },
    ask: Number,                                       // Ask price
    bid: Number,                                       // Bid price
    delta: Number, gamma: Number,
    theta: Number, vega: Number,
    implied_volatility: Number,
    open_interest: Number
  },

  // 🤖 GPT prompt + response
  gptPrompt: String,                                   // Full GPT prompt for auditing
  gptResponse: String,                                 // GPT-generated reasoning and recommendation
  recommendationDirection: {
    type: String,
    enum: ['call', 'put', 'hold', 'avoid']
  },
  confidence: {
    type: String,
    enum: ['low', 'medium', 'high'],
    default: 'medium'                                  // GPT response certainty
  },

  // 📊 Technical indicator snapshot
  indicators: {
    rsi: Number,                                        // Relative Strength Index
    vwap: Number,                                       // Volume Weighted Average Price
    macd: {
      macd: Number,
      signal: Number,
      histogram: Number                                // MACD histogram = macd - signal
    }
  },

  // 🏛️ Contextual data
  congressTrades: [                                    // List of congressional trades
    {
      ticker: String,
      politician: String,
      transactionDate: Date,
      transactionType: { type: String, enum: ['buy', 'sell'] },
      amountRange: String,
      source: String
    }
  ],
  sentimentSummary: String,                            // Summary of news sentiment from GPT

  // ✅ Trade evaluation results
  outcome: {
    type: String,
    enum: ['win', 'loss', 'pending'],
    default: 'pending'                                 // Set to win/loss after expiry is evaluated
  },
  exitPrices: Object,                                  // Exit prices for each ticker
  evaluationSnapshot: Object,                          // Raw Polygon API response at evaluation time
  percentageChange: Number,                            // % change from entry → exit
  evaluatedAt: Date,                                   // Timestamp when trade was evaluated
  evaluationErrors: Array,                             // Optional error log during evaluation

  // 🗒️ Notes and annotations
  userNotes: String                                    // Free-form notes (e.g., strategy or feedback)

}, { timestamps: true }); // ⏱️ Adds createdAt and updatedAt fields

export default mongoose.model('TradeRecommendation', tradeRecommendationSchema);