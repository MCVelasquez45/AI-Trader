import mongoose from 'mongoose';  // Correct import syntax

const tradeScanSchema = new mongoose.Schema({
  ticker: {
    type: String,
    required: true,
    index: true
  },
  candles: [{
    o: Number,  // open
    h: Number,  // high
    l: Number,  // low
    c: Number,  // close
    v: Number,  // volume
    t: Number   // timestamp
  }],
  scannedAt: {
    type: Date,
    default: Date.now
  }
});

// Create and export model
export const TradeScan = mongoose.model('TradeScan', tradeScanSchema);