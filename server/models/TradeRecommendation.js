import mongoose from 'mongoose';


 const tradeSchema = new mongoose.Schema({
  tickers: { type: [String], required: true },
  capital: { type: Number, required: true },
  riskTolerance: { type: String, enum: ['low', 'medium', 'high'], required: true },
  gptResponse: { type: String, required: true },
  entryPrice: { type: Number },
  exitPrices: { type: Map, of: Number }, // Store prices per ticker
  expiryDate: { type: Date, required: true },
  recommendationDirection: { type: String, enum: ['call', 'put'] },
  outcome: { type: String, enum: ['win', 'loss', 'pending'], default: 'pending' },
  evaluationErrors: [{
    ticker: String,
    error: String,
    timestamp: Date
  }],
  createdAt: { type: Date, default: Date.now }
});

export const TradeRecommendation = mongoose.model('TradeRecommendation', tradeSchema);

