import mongoose from 'mongoose';

const TradeRecommendationSchema = new mongoose.Schema({
  ticker: { type: String, required: true },
  capital: { type: Number, required: true },
  riskTolerance: { type: String, required: true },
  userIdentifier: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  option: { type: Object, required: true },
  recommendationDirection: { type: String },
  confidence: { type: String, enum: ['low', 'medium', 'high'] },
  entryPrice: { type: Number },
  targetPrice: { type: Number },
  stopLoss: { type: Number },
  breakEvenPrice: { type: Number },
  expectedROI: { type: Number },
  indicators: { type: Object },
  gptResponse: { type: String },
  sentimentSummary: { type: String },
  congressTrades: { type: Array },
}, { timestamps: true });

TradeRecommendationSchema.index({ userIdentifier: 1 });

export default mongoose.model('TradeRecommendation', TradeRecommendationSchema);
