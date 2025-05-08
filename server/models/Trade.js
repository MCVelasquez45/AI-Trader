// Import mongoose to define a schema and model for MongoDB
const mongoose = require('mongoose');

// Define the schema for a basic trade (used before GPT analysis evolved to include indicators and outcomes)
const tradeSchema = new mongoose.Schema({
  // Array of ticker symbols involved in this trade (e.g., ["TSLA", "AAPL"])
  tickers: [String],

  // The dollar amount of capital the user wanted to invest in this trade
  capital: Number,

  // The user's selected risk level (e.g., "low", "medium", or "high")
  riskTolerance: String,

  // The AI-generated or manually written trade analysis result
  analysis: String,

  // The timestamp indicating when this trade recommendation was created
  createdAt: {
    type: Date,
    default: Date.now // Automatically sets the current date/time when the document is created
  }
});

// Export the model so it can be used in controllers and database queries
module.exports = mongoose.model('Trade', tradeSchema);
