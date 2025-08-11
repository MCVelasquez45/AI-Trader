import React, { useEffect, useState, useMemo, useCallback } from 'react';
import { AnalysisData, CongressTrade } from '../types/Analysis';

interface Props {
  analysis?: AnalysisData;
}

const RecommendationPanel: React.FC<Props> = React.memo(({ analysis }) => {
  if (!analysis) return null;

  // 🔍 Log analysis payload on change
  useEffect(() => {
    console.log('[DEBUG] RecommendationPanel - analysis payload:', analysis);
  }, [analysis]);

  const [showCongress, setShowCongress] = useState<boolean>(false);
  const [showErrors, setShowErrors] = useState<boolean>(false);

  // 🧩 Destructure all expected fields from analysis object
  const {
    option,
    entryPrice,
    targetPrice,
    stopLoss,
    gptResponse,
    sentimentSummary,
    congressTrades,
    congress,
    confidence,
    recommendationDirection,
    expiryDate,
    indicators,
    breakEvenPrice,
    expectedROI,
    capital,
    riskTolerance,
    estimatedCost,
    outcome,
    evaluationErrors,
    createdAt,
    updatedAt,
    gptPrompt,
    tickers
  } = analysis;

  // 💲 Format numerical values for display (currency or decimals) - memoized
  const format = useCallback((val: number | undefined | null, prefix = '$', digits = 2) =>
    val === 0 || (typeof val === 'number' && isFinite(val)) ? `${prefix}${val.toFixed(digits)}` : 'N/A', []);

  // 🗓️ Robust date formatter handling strings and Date objects
  const formatDate = useCallback((value?: string | Date) => {
    if (!value) return 'N/A';
    let d: Date;
    if (typeof value === 'string') {
      d = new Date(value.includes('T') ? value : `${value}T00:00:00`);
    } else {
      d = new Date(value);
    }
    return isNaN(d.getTime()) ? 'N/A' : d.toLocaleDateString();
  }, []);

  // 🔁 Backup values if target/stop are missing - memoized
  const fallbackTarget = useMemo(() => 
    entryPrice ? `${(entryPrice * 1.05).toFixed(2)} (est.)` : 'N/A', [entryPrice]);
  
  const fallbackStop = useMemo(() => 
    entryPrice ? `${(entryPrice * 0.95).toFixed(2)} (est.)` : 'N/A', [entryPrice]);

  // 🎯 Style badges based on confidence level - memoized
  const confidenceBadge = useCallback((level: string | undefined) => {
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
  }, []);

  // 🎨 Color recommendation direction (CALL/PUT) - memoized
  const recommendationColor = useCallback((dir: string | undefined) => {
    switch (dir?.toLowerCase()) {
      case 'call':
        return 'text-success';
      case 'put':
        return 'text-danger';
      default:
        return 'text-secondary';
    }
  }, []);

  // 🎨 Color outcome status - memoized
  const outcomeBadge = useCallback((status: string | undefined) => {
    switch (status?.toLowerCase()) {
      case 'profitable':
        return 'bg-success text-white';
      case 'unprofitable':
        return 'bg-danger text-white';
      case 'breakeven':
        return 'bg-warning text-dark';
      case 'expired':
        return 'bg-secondary text-white';
      case 'pending':
      default:
        return 'bg-info text-white';
    }
  }, []);

  // 🎨 Color risk tolerance - memoized
  const riskBadge = useCallback((risk: string | undefined) => {
    switch (risk?.toLowerCase()) {
      case 'high':
        return 'bg-danger text-white';
      case 'medium':
        return 'bg-warning text-dark';
      case 'low':
        return 'bg-success text-white';
      default:
        return 'bg-secondary text-white';
    }
  }, []);

  // 🎨 Memoized sentiment lines to prevent recreation
  const sentimentLines = useMemo(() => {
    if (!sentimentSummary) return [];
    return sentimentSummary.split('\n')
      .map(line => line.trim().replace(/^[-•]+/, '').trim())
      .filter(line => line.length > 0);
  }, [sentimentSummary]);

  // 🎨 Memoized congressional trades HTML (for legacy string data)
  const congressTradesHTML = useMemo(() => {
    if (!congressTrades) return 'N/A';
    const content = typeof congressTrades === 'string' ? congressTrades : JSON.stringify(congressTrades, null, 2);
    return content.replace(
      /(https?:\/\/[^\s]+)/g,
      (url) => `<a href="${url}" class="text-info text-decoration-underline" target="_blank" rel="noopener noreferrer">${url}</a>`
    );
  }, [congressTrades]);

  // 🧹 Get congressional data from both sources (congress is preferred, congressTrades is legacy)
  const congressionalData = useMemo(() => {
    // Prefer the new congress array format, fallback to congressTrades
    return congress || congressTrades || [];
  }, [congress, congressTrades]);

  // 🧹 Filter out placeholder/unknown congressional items for display
  const filteredCongressTrades = useMemo(() => {
    if (!Array.isArray(congressionalData)) return [];
    return congressionalData.filter((ct: any) => {
      const pol = (ct?.politician || ct?.representative || '').toString();
      const type = (ct?.transactionType || ct?.type || '').toString();
      const amt = (ct?.amountRange || ct?.amount || '').toString();
      const src = (ct?.source || ct?.link || '').toString();
      // Drop obvious placeholders
      if (!pol || pol.toLowerCase().includes('unknown')) return false;
      if (!src || src === '#') return false;
      if (!type || type === 'N/A') return false;
      if (!amt || amt === 'N/A') return false;
      return true;
    }) as CongressTrade[];
  }, [congressionalData]);

  // 🔍 Log congressional data for debugging
  useEffect(() => {
    console.log('[DEBUG] RecommendationPanel - congress data:', congress);
    console.log('[DEBUG] RecommendationPanel - congressTrades data:', congressTrades);
    console.log('[DEBUG] RecommendationPanel - congressionalData computed:', congressionalData);
    console.log('[DEBUG] RecommendationPanel - filteredCongressTrades:', filteredCongressTrades);
  }, [congress, congressTrades, congressionalData, filteredCongressTrades]);

  // 🎨 Memoized formatted dates
  const formattedExpiryDate = useMemo(() => formatDate(expiryDate), [expiryDate, formatDate]);
  const formattedCreatedDate = useMemo(() => (createdAt ? formatDate(createdAt) : 'N/A'), [createdAt, formatDate]);
  const formattedUpdatedDate = useMemo(() => (updatedAt ? formatDate(updatedAt) : 'N/A'), [updatedAt, formatDate]);

  // 🎨 Memoized option expiration date
  const formattedOptionExpiryDate = useMemo(() => formatDate(option?.expiration_date), [option?.expiration_date, formatDate]);

  // 🔄 Memoized event handlers
  const handleCongressToggle = useCallback(() => setShowCongress(!showCongress), [showCongress]);
  const handleErrorsToggle = useCallback(() => setShowErrors(!showErrors), [showErrors]);

  return (
    <div className="container-fluid px-2 px-md-4">
      <div className="bg-dark bg-opacity-75 rounded p-4 shadow border border-secondary">
      {/* 🔹 Header */}
      <div className="row mb-4">
        <div className="col-12 col-md-8">
          <h3 className="h4 mb-2 mb-md-0">
            Trade Analysis: <span className="text-info">{option?.ticker || 'N/A'}</span>
          </h3>
          {tickers && tickers.length > 0 && (
            <p className="text-muted small mb-0">
              Analyzed tickers: {tickers.join(', ')}
            </p>
          )}
        </div>
        <div className="col-12 col-md-4 text-md-end">
          <div className="d-flex flex-column gap-2 align-items-end">
            <span
              className={`badge px-3 py-2 ${confidenceBadge(confidence)}`}
              style={{ fontSize: '0.95rem', whiteSpace: 'normal', wordBreak: 'break-word' }}
            >
              Confidence: {confidence?.toUpperCase() || 'N/A'}
            </span>
            {outcome && (
              <span className={`badge px-3 py-2 ${outcomeBadge(outcome)}`}>
                {outcome.toUpperCase()}
              </span>
            )}
          </div>
        </div>
      </div>

      {/* 💰 Capital & Risk Management */}
      <div className="row g-3 mb-4">
        <div className="col-md-4 col-sm-6">
          <h6>💰 Capital</h6>
          <p>{format(capital)}</p>
        </div>
        <div className="col-md-4 col-sm-6">
          <h6>⚠️ Risk Tolerance</h6>
          <span className={`badge ${riskBadge(riskTolerance)}`}>
            {riskTolerance?.toUpperCase() || 'N/A'}
          </span>
        </div>
        <div className="col-md-4 col-sm-6">
          <h6>💸 Estimated Cost</h6>
          <p>{format(estimatedCost)}</p>
        </div>
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
            {sentimentLines.length > 0 ? (
              <ul className="mb-0 small">
                {sentimentLines.map((line, i) => (
                  <li key={i}> {line}</li>
                ))}
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

        <div className="col-md-4 col-sm-6">
          <h6>📆 Expiry</h6>
          <p>{formattedExpiryDate}</p>
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

            <li>
              <strong>Expires:</strong>{' '}
              {formattedOptionExpiryDate}
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

      {/* 📝 GPT Prompt (if available) */}
      {gptPrompt && gptPrompt !== 'N/A' && (
        <div className="border-top border-secondary pt-4 mb-4">
          <h5 className="fw-bold mb-2">📝 GPT Prompt</h5>
          <div className="bg-black bg-opacity-50 rounded p-3">
            <p className="text-light-emphasis small mb-0">{gptPrompt}</p>
          </div>
        </div>
      )}

      {/* 🏛️ Congressional Activity */}
      <div>
        <h5 className="fw-bold mb-2">🏛️ Congressional Activity</h5>
        <button
          className="btn btn-outline-info btn-sm mb-2"
          onClick={handleCongressToggle}
          aria-expanded={showCongress}
        >
          {showCongress ? 'Hide Activity' : 'View Congressional Trades'}
        </button>

        {showCongress && (
          <div className="bg-black bg-opacity-50 rounded p-3">
            {Array.isArray(congressionalData) && filteredCongressTrades.length > 0 ? (
              <ul className="list-unstyled mb-0 small">
                {filteredCongressTrades.map((ct: any, idx: number) => (
                  <li key={idx} className="mb-2">
                    <div className="d-flex flex-wrap gap-2 align-items-center">
                      <span className="fw-semibold">{ct.politician || ct.representative || 'Unknown'}</span>
                      <span className="badge bg-secondary">{((ct.transactionType || ct.type || 'N/A')).toUpperCase()}</span>
                      <span className="text-light-emphasis">{ct.amountRange || ct.amount || 'N/A'}</span>
                      <span className="text-light-emphasis">{formatDate(ct.transactionDate || ct.date)}</span>
                      {(ct.source || ct.link) && (
                        <a href={ct.source || ct.link} target="_blank" rel="noopener noreferrer" className="text-info text-decoration-underline">
                          Source
                        </a>
                      )}
                    </div>
                  </li>
                ))}
              </ul>
            ) : (
              <div className="small text-light-emphasis mb-0">
                {typeof congressionalData === 'string' && congressionalData.trim().length > 0 ? (
                  <div dangerouslySetInnerHTML={{ __html: congressTradesHTML }} />
                ) : (
                  <p className="mb-0">No congressional trades found.</p>
                )}
              </div>
            )}
          </div>
        )}
      </div>

      {/* ❌ Evaluation Errors (if any) */}
      {evaluationErrors && evaluationErrors.length > 0 && (
        <div className="border-top border-secondary pt-4 mb-4">
          <h5 className="fw-bold mb-2 text-warning">❌ Evaluation Errors</h5>
          <button
            className="btn btn-outline-warning btn-sm mb-2"
            onClick={handleErrorsToggle}
            aria-expanded={showErrors}
          >
            {showErrors ? 'Hide Errors' : 'View Errors'}
          </button>

          {showErrors && (
            <div className="bg-black bg-opacity-50 rounded p-3">
              <ul className="mb-0 small text-warning">
                {evaluationErrors.map((error, index) => (
                  <li key={index}>{error}</li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}

      {/* Removed timestamps section per UX request */}
      </div>
    </div>
  );
});

RecommendationPanel.displayName = 'RecommendationPanel';

export default RecommendationPanel;
