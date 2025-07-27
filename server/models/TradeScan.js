// ✅ File: /server/models/TradeScan.js

import mongoose from 'mongoose';

/**
 * 📈 TradeScan Schema
 * Stores historical candlestick data retrieved during a scan
 * Used to cache or record the market snapshot at scan time
 */
const tradeScanSchema = new mongoose.Schema({
  // Ticker symbol (e.g., AAPL, TSLA)
  ticker: {
    type: String,
    required: true,
    index: true, // Enables faster queries by ticker
    uppercase: true, // Enforce consistent casing
    trim: true
  },

  // Array of candle objects (daily OHLCV)
  candles: [{
    o: { type: Number, required: false }, // Open
    h: { type: Number, required: false }, // High
    l: { type: Number, required: false }, // Low
    c: { type: Number, required: true },  // Close
    v: { type: Number, required: true },  // Volume
    t: { type: Number, required: true }   // Timestamp (epoch ms)
  }],

  // Timestamp of when scan occurred
  scannedAt: {
    type: Date,
    default: Date.now
  }
});

// 📦 Export Mongoose model
export const TradeScan = mongoose.model('TradeScan', tradeScanSchema);
