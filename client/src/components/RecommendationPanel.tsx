import React, { useEffect, useState } from 'react';
import { AnalysisData } from '../types/Analysis';

interface Props {
  analysis?: AnalysisData;
}

const RecommendationPanel: React.FC<Props> = ({ analysis }) => {
  if (!analysis) return null;

  const [showCongress, setShowCongress] = useState<boolean>(false);

  // 🔍 Log analysis payload on change
  useEffect(() => {
    console.log('[DEBUG] analysis payload:', analysis);
  }, [analysis]);

  // 🧩 Destructure all expected fields from analysis object
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

  // 💲 Format numerical values for display (currency or decimals)
  const format = (val: number | undefined | null, prefix = '$', digits = 2) =>
    val === 0 || (typeof val === 'number' && isFinite(val)) ? `${prefix}${val.toFixed(digits)}` : 'N/A';

  // 🔁 Backup values if target/stop are missing
  const fallbackTarget = entryPrice ? `${(entryPrice * 1.05).toFixed(2)} (est.)` : 'N/A';
  const fallbackStop = entryPrice ? `${(entryPrice * 0.95).toFixed(2)} (est.)` : 'N/A';

  // 🎯 Style badges based on confidence level
  const confidenceBadge = (level: string | undefined) => {
    switch (level?.toLowerCase()) {
      case 'very high':
      case 'high':
        return 'bg-success text-white';
      case 'medium':
        return 'bg-warning text-dark';
      case 'low':
      default:
        return 'bg-danger text-white';
    }
  };

  // 🎨 Color recommendation direction (CALL/PUT)
  const recommendationColor = (dir: string | undefined) => {
    switch (dir?.toLowerCase()) {
      case 'call':
        return 'text-success';
      case 'put':
        return 'text-danger';
      default:
        return 'text-secondary';
    }
  };

  return (
    <div className="bg-dark bg-opacity-75 rounded p-4 shadow border border-secondary">
      {/* 🔹 Header */}
      <div className="d-flex justify-content-between align-items-start mb-4">
        <h3 className="h4 mb-0">
          Trade Analysis: <span className="text-info">{option?.ticker || 'N/A'}</span>
        </h3>
        <span className={`badge px-3 py-2 ${confidenceBadge(confidence)}`}>
          Confidence: {confidence?.toUpperCase() || 'N/A'}
        </span>
      </div>

      {/* 🧠 Recommendation & Sentiment */}
      <div className="row g-3 mb-4">
        <div className="col-md-6">
          <div className="bg-black bg-opacity-50 rounded p-3">
            <h6 className="fw-bold text-uppercase mb-1">Recommendation</h6>
            <div className={`fs-4 fw-bold ${recommendationColor(recommendationDirection)}`}>
              {recommendationDirection?.toUpperCase() || 'N/A'}
            </div>
          </div>
        </div>
        <div className="col-md-6">
          <div className="bg-black bg-opacity-50 rounded p-3">
            <h6 className="fw-bold text-uppercase mb-1">Sentiment Headlines</h6>
            {sentimentSummary ? (
              <ul className="mb-0 small">
                {sentimentSummary.split('\n').map((line, i) => {
                  const cleanLine = line.trim().replace(/^[-•]+/, '').trim();
                  return cleanLine ? <li key={i}> {cleanLine}</li> : null;
                })}
              </ul>
            ) : (
              <p className="text-light-emphasis">N/A</p>
            )}
          </div>
        </div>
      </div>

      {/* 📊 Price Targets */}
      <div className="row g-3 mb-4">
        <div className="col-md-4 col-sm-6"><h6>📈 Entry Price</h6><p>{format(entryPrice)}</p></div>
        <div className="col-md-4 col-sm-6"><h6>🎯 Target Price</h6><p>{targetPrice ? format(targetPrice) : fallbackTarget}</p></div>
        <div className="col-md-4 col-sm-6"><h6>🛑 Stop Loss</h6><p>{stopLoss ? format(stopLoss) : fallbackStop}</p></div>
        <div className="col-md-4 col-sm-6"><h6>📊 Break-Even</h6><p>{format(breakEvenPrice)}</p></div>

        {/* ✅ FIXED: Use 'T00:00:00' to avoid timezone shift */}
        <div className="col-md-4 col-sm-6">
          <h6>📆 Expiry</h6>
          <p>{expiryDate ? new Date(`${expiryDate}T00:00:00`).toLocaleDateString() : 'N/A'}</p>
        </div>

        <div className="col-md-4 col-sm-6">
          <h6>💹 ROI</h6>
          <p>{typeof expectedROI === 'number' ? `${expectedROI.toFixed(2)}%` : 'N/A'}</p>
        </div>
      </div>

      {/* 📈 Technical Indicators (with definitions) */}
<div className="row g-3 mb-4">
  <div className="col-md-4 col-sm-6">
    <h6>📊 RSI <small className="text-light-emphasis">(Relative Strength Index)</small></h6>
    <p>{format(indicators?.rsi, '', 2)}</p>
  </div>

  <div className="col-md-4 col-sm-6">
    <h6>💵 VWAP <small className="text-light-emphasis">(Volume Weighted Average Price)</small></h6>
    <p>{format(indicators?.vwap)}</p>
  </div>

  <div className="col-md-4 col-sm-6">
    <h6>📈 MACD <small className="text-light-emphasis">(Moving Average Convergence Divergence)</small></h6>
    <p>{format(indicators?.macd?.macd, '', 2)}</p>
  </div>

  <div className="col-md-4 col-sm-6">
    <h6>📉 Signal <small className="text-light-emphasis">(MACD Signal Line)</small></h6>
    <p>{format(indicators?.macd?.signal, '', 2)}</p>
  </div>

  <div className="col-md-4 col-sm-6">
    <h6>📊 Histogram <small className="text-light-emphasis">(MACD - Signal)</small></h6>
    <p>{format(indicators?.macd?.histogram, '', 2)}</p>
  </div>
</div>


      {/* 🎟️ Option Contract Details */}
      {option && (
        <div className="mb-4">
          <h5 className="fw-semibold mb-3">🎟️ Option Contract Details</h5>
          <ul className="list-unstyled small">
            <li><strong>Type:</strong> {option.contract_type?.toUpperCase() || 'N/A'}</li>
            <li><strong>Strike:</strong> {format(option.strike_price)}</li>

            {/* ✅ FIXED: Use pinned midnight for expiration date */}
            <li>
              <strong>Expires:</strong>{' '}
              {option.expiration_date ? new Date(`${option.expiration_date}T00:00:00`).toLocaleDateString() : 'N/A'}
            </li>

            <li>
              <strong>Cost:</strong> {format(option.ask ? option.ask * 100 : undefined)}
              <span
                className="text-info ms-2"
                data-bs-toggle="tooltip"
                title="Options contracts typically represent 100 shares"
                style={{ cursor: 'help' }}
              >ⓘ</span>
            </li>
            <li><strong>Implied Volatility:</strong> {format(option.implied_volatility, '', 2)}</li>
            <li><strong>Delta:</strong> {format(option.delta, '', 3)}</li>
            <li><strong>Gamma:</strong> {format(option.gamma, '', 3)}</li>
            <li><strong>Theta:</strong> {format(option.theta, '', 3)}</li>
            <li><strong>Vega:</strong> {format(option.vega, '', 3)}</li>
            <li><strong>Open Interest:</strong> {option.open_interest ?? 'N/A'}</li>
          </ul>
        </div>
      )}

      {/* 🧠 GPT Rationale */}
      <div className="border-top border-secondary pt-4 mb-4">
        <h5 className="fw-bold mb-2">🧠 GPT Rationale</h5>
        <p className="text-light-emphasis">{gptResponse || 'No explanation available.'}</p>
      </div>

      {/* 🏛️ Congressional Activity */}
      <div>
        <h5 className="fw-bold mb-2">🏛️ Congressional Activity</h5>
        <button
          className="btn btn-outline-info btn-sm mb-2"
          onClick={() => setShowCongress(!showCongress)}
          aria-expanded={showCongress}
        >
          {showCongress ? 'Hide Activity' : 'View Congressional Trades'}
        </button>

        {showCongress && (
          <div
            className="bg-black text-light p-3 rounded small"
            style={{ whiteSpace: 'pre-wrap', wordBreak: 'break-word' }}
            dangerouslySetInnerHTML={{
              __html: (typeof congressTrades === 'string'
                ? congressTrades
                : JSON.stringify(congressTrades || 'N/A', null, 2)
              ).replace(
                /(https?:\/\/[^\s]+)/g,
                (url) =>
                  `<a href="${url}" class="text-info text-decoration-underline" target="_blank" rel="noopener noreferrer">${url}</a>`
              )
            }}
          />
        )}
      </div>
    </div>
  );
};

export default RecommendationPanel;
