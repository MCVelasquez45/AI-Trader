// server/models/TradeScan.js
import mongoose from 'mongoose';

const tradeScanSchema = new mongoose.Schema({
  ticker: {
    type: String,
    required: true,
    index: true
  },
  candles: [{
    o: Number,
    h: Number,
    l: Number,
    c: Number,
    v: Number,
    t: Number
  }],
  scannedAt: {
    type: Date,
    default: Date.now
  }
});

export const TradeScan = mongoose.model('TradeScan', tradeScanSchema);
