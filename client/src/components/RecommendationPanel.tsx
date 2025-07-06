// 📦 Import dependencies
import React from 'react';
import { AnalysisData } from '../types/Analysis';

interface Props {
  analysis?: AnalysisData;
}

const RecommendationPanel: React.FC<Props> = ({ analysis }) => {
  if (!analysis) return null;

  const {
    option,
    entryPrice,
    targetPrice,
    stopLoss,
    gptResponse,
    sentimentSummary,
    congressTrades,
    confidence,
    recommendationDirection,
    expiryDate,
    indicators,
    breakEvenPrice,
    expectedROI
  } = analysis;

  const format = (val: number | undefined | null, prefix = '$') =>
    typeof val === 'number' ? `${prefix}${val.toFixed(2)}` : 'N/A';

  const fallbackTarget = entryPrice ? `${(entryPrice * 1.05).toFixed(2)} (est.)` : 'N/A';
  const fallbackStop = entryPrice ? `${(entryPrice * 0.95).toFixed(2)} (est.)` : 'N/A';

  const confidenceBadge = (level: string | undefined) => {
    switch (level) {
      case 'High':
      case 'Very High': return 'bg-success text-light';
      case 'Medium': return 'bg-warning text-dark';
      case 'Low':
      default: return 'bg-danger text-light';
    }
  };

  const recommendationColor = (dir: string | undefined) => {
    switch (dir?.toLowerCase()) {
      case 'call': return 'text-success';
      case 'put': return 'text-danger';
      default: return 'text-secondary';
    }
  };

  return (
    <div className="bg-secondary bg-opacity-75 rounded p-4 shadow border border-dark">
      {/* 🔹 Title & Confidence */}
      <div className="d-flex justify-content-between align-items-start mb-4">
        <h3 className="h4">
          Trade Analysis: <span className="text-info">{option?.ticker || 'N/A'}</span>
        </h3>
        <span className={`badge px-3 py-2 ${confidenceBadge(confidence)}`}>Confidence: {confidence}</span>
      </div>

      {/* 🧠 Top Recommendation Blocks */}
      <div className="row g-3 mb-4">
        <div className="col-md-6">
          <div className="bg-dark rounded p-3">
            <h5 className="fw-semibold mb-2">Recommendation</h5>
            <div className={`fs-4 fw-bold ${recommendationColor(recommendationDirection)}`}>
              {recommendationDirection?.toUpperCase() || 'N/A'}
            </div>
          </div>
        </div>
        <div className="col-md-6">
          <div className="bg-dark rounded p-3">
            <h5 className="fw-semibold mb-2">Sentiment</h5>
            <div className="fs-5">{sentimentSummary || 'N/A'}</div>
          </div>
        </div>
      </div>

      {/* 📊 Trade Numbers */}
      <div className="row g-3 mb-4">
        <div className="col-md-6"><h6>📈 Entry Price</h6><p>{format(entryPrice)}</p></div>
        <div className="col-md-6"><h6>🎯 Target Price</h6><p>{targetPrice ? format(targetPrice) : fallbackTarget}</p></div>
        <div className="col-md-6"><h6>🛑 Stop Loss</h6><p>{stopLoss ? format(stopLoss) : fallbackStop}</p></div>
        <div className="col-md-6"><h6>📊 Break-Even</h6><p>{format(breakEvenPrice)}</p></div>
        <div className="col-md-6"><h6>📆 Expiry</h6><p>{expiryDate ? new Date(expiryDate).toLocaleDateString() : 'N/A'}</p></div>
        <div className="col-md-6"><h6>💹 ROI</h6><p>{expectedROI ? `${expectedROI}%` : 'N/A'}</p></div>
      </div>

      {/* 📈 Indicators */}
      <div className="row g-3 mb-4">
        <div className="col-md-4"><h6>📊 RSI</h6><p>{indicators?.rsi?.toFixed(2) || 'N/A'}</p></div>
        <div className="col-md-4"><h6>💵 VWAP</h6><p>{indicators?.vwap?.toFixed(2) || 'N/A'}</p></div>
        <div className="col-md-4"><h6>📈 MACD Histogram</h6><p>{indicators?.macd?.histogram?.toFixed(2) || 'N/A'}</p></div>
      </div>

      {/* 🧾 Option Contract Info */}
      {option && (
        <div className="mb-4">
          <h5 className="fw-semibold mb-3">🎟️ Option Details</h5>
          <ul className="list-unstyled">
            <li><strong>Type:</strong> {option.contract_type?.toUpperCase() || 'N/A'}</li>
            <li><strong>Strike:</strong> {format(option.strike_price)}</li>
            <li><strong>Expires:</strong> {new Date(option.expiration_date).toLocaleDateString()}</li>
            <li><strong>Cost:</strong> {format(option.ask ? option.ask * 100 : undefined)}</li>
            <li><strong>Delta:</strong> {option.delta?.toFixed(3) || 'N/A'}</li>
            <li><strong>Gamma:</strong> {option.gamma?.toFixed(3) || 'N/A'}</li>
            <li><strong>Theta:</strong> {option.theta?.toFixed(3) || 'N/A'}</li>
            <li><strong>Vega:</strong> {option.vega?.toFixed(3) || 'N/A'}</li>
            <li><strong>Open Interest:</strong> {option.open_interest || 'N/A'}</li>
          </ul>
        </div>
      )}

      {/* 🧠 GPT + 🏛️ Congress */}
      <div className="border-top border-dark pt-4">
        <div className="mb-3">
          <h5 className="fw-semibold mb-2">🧠 GPT Explanation</h5>
          <p className="text-light-emphasis">{gptResponse || 'No explanation available.'}</p>
        </div>
        <div>
          <h5 className="fw-semibold mb-2">🏛️ Congressional Activity</h5>
          <pre className="bg-dark text-light p-3 rounded small">
            {congressTrades || 'N/A'}
          </pre>
        </div>
      </div>
    </div>
  );
};

export default RecommendationPanel;