// Import mongoose to define the schema and model
const mongoose = require('mongoose');

// Define the schema for GPT-generated trade recommendations
const tradeRecommendationSchema = new mongoose.Schema({
  // Array of tickers analyzed in this trade recommendation (e.g., ["SOFI", "AAPL"])
  tickers: [String],

  // Amount of capital the user planned to allocate for this trade
  capital: Number,

  // Risk tolerance setting used in the GPT prompt ("low", "medium", or "high")
  riskTolerance: String,

  // Full GPT response containing trade ideas and reasoning
  gptResponse: String,

  // Outcome of the trade, updated later by the user or system
  outcome: {
    type: String,
    enum: ['win', 'loss', 'pending'], // Valid values
    default: 'pending'               // Default is "pending" until evaluated
  },

  // Optional notes added by the user to reflect performance, thoughts, or results
  userNotes: String,

  // Timestamp of when the recommendation was created
  createdAt: {
    type: Date,
    default: Date.now
  }
});

// Export the model for use in controllers and API logic
module.exports = mongoose.model('TradeRecommendation', tradeRecommendationSchema);
