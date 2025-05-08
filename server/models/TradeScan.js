// Import mongoose to define and interact with MongoDB schemas
const mongoose = require('mongoose');

// Define the schema for storing scanned ticker data
const tradeScanSchema = new mongoose.Schema({
  // The stock symbol being scanned (e.g., "SOFI", "AAPL")
  ticker: String,

  // An array of candlestick objects returned by Polygon (each includes open, high, low, close, volume)
  candles: [Object],

  // The timestamp when this scan was performed
  scannedAt: {
    type: Date,
    default: Date.now // Automatically set to the current date/time when the document is created
  }
});

// Export the Mongoose model, making it available for querying and saving scans
module.exports = mongoose.model('TradeScan', tradeScanSchema);
