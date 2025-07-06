// 📦 React and Types
import React, { useState } from 'react';
import { analyzeTrade, validateTicker } from '../api/tradeApi';
import type { RiskLevel, TradeFormProps } from '../types/TradeForm';

const TradeForm: React.FC<TradeFormProps> = ({ onAnalyze }) => {
  const [tickerInput, setTickerInput] = useState('');
  const [capital, setCapital] = useState('');
  const [riskTolerance, setRiskTolerance] = useState<RiskLevel>('medium');
  const [tickers, setTickers] = useState<string[]>([]);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [loading, setLoading] = useState(false);
  const [validationResult, setValidationResult] = useState<any>(null);

  // ➕ Add ticker to the list if valid
  const addTicker = async () => {
    const symbol = tickerInput.trim().toUpperCase();
    if (!symbol || tickers.includes(symbol)) return;

    const result = await validateTicker(symbol, parseFloat(capital), riskTolerance);
    if (!result?.valid) {
      setError(result?.message || `Invalid ticker: ${symbol}`);
      setValidationResult(result);
      return;
    }

    setTickers(prev => [...prev, symbol]);
    setTickerInput('');
    setError('');
    setValidationResult(result);
  };

  // ❌ Remove a ticker
  const removeTicker = (ticker: string) => {
    setTickers(prev => prev.filter(t => t !== ticker));
  };

  // 📤 Submit trade analysis request
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccessMsg('');
    setValidationResult(null);
    setLoading(true);

    const numericCapital = parseFloat(capital);
    if (!capital || isNaN(numericCapital) || numericCapital <= 0) {
      setError('Please enter a valid capital amount greater than $0.');
      setLoading(false);
      return;
    }

    let currentTickers = [...tickers];
    if (tickerInput.trim()) {
      const symbol = tickerInput.trim().toUpperCase();
      if (!tickers.includes(symbol)) {
        const result = await validateTicker(symbol, numericCapital, riskTolerance);
        if (!result?.valid) {
          setError(result?.message || `Invalid ticker: ${symbol}`);
          setLoading(false);
          return;
        }
        currentTickers.push(symbol);
        setTickers(currentTickers);
        setValidationResult(result);
      }
      setTickerInput('');
    }

    if (currentTickers.length === 0) {
      setError('Please add at least one valid ticker.');
      setLoading(false);
      return;
    }

    try {
      await analyzeTrade({ watchlist: currentTickers, tickers: currentTickers, capital: numericCapital, riskTolerance });
      onAnalyze(currentTickers, numericCapital, riskTolerance);
      setSuccessMsg('✅ Trade successfully analyzed.');
    } catch (err: any) {
      const msg = err?.error || '❌ Error analyzing trade.';
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="rounded p-4 shadow border border-gray-700 mb-5"
      style={{
        background: 'linear-gradient(to bottom right, #1f1f1f, #0e0e0e)',
        backdropFilter: 'blur(4px)'
      }}
    >
      {/* 🎯 Input Fields */}
      <div className="row g-4">
        <div className="col-md-4">
          <label className="form-label text-light">Stock Ticker Symbol</label>
          <input
            type="text"
            value={tickerInput}
            onChange={(e) => setTickerInput(e.target.value.toUpperCase())}
            onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); addTicker(); } }}
            placeholder="e.g., AAPL"
            className="form-control bg-dark text-white border-secondary"
          />
        </div>

        <div className="col-md-4">
          <label className="form-label text-light">Available Capital ($)</label>
          <input
            type="number"
            min="0"
            value={capital}
            onChange={(e) => setCapital(e.target.value)}
            placeholder="e.g., 5000"
            className="form-control bg-dark text-white border-secondary"
          />
        </div>

        <div className="col-md-4">
          <label className="form-label text-light">Risk Tolerance</label>
          <select
            value={riskTolerance}
            onChange={(e) => setRiskTolerance(e.target.value as RiskLevel)}
            className="form-select bg-dark text-white border-secondary"
          >
            <option value="low">Low</option>
            <option value="medium">Medium</option>
            <option value="high">High</option>
          </select>
        </div>
      </div>

      {/* 🏷️ Selected Tickers */}
      {tickers.length > 0 && (
        <div className="mt-3 d-flex flex-wrap gap-2">
          {tickers.map((ticker) => (
            <span
              key={ticker}
              onClick={() => removeTicker(ticker)}
              className="badge bg-secondary text-white px-3 py-2 rounded-pill"
              style={{ cursor: 'pointer' }}
            >
              {ticker} ✖
            </span>
          ))}
        </div>
      )}

      {/* ⚠️ Validation Warning */}
      {validationResult?.contracts?.length === 0 && validationResult?.closestITM && (
        <div className="alert alert-warning mt-3">
          Closest ITM contract is <strong>${validationResult.closestITM.ask.toFixed(2)}</strong>, but your capital is only <strong>${parseFloat(capital).toFixed(2)}</strong>.
        </div>
      )}

      {/* 📛 Error & ✅ Success Feedback */}
      {error && <div className="alert alert-danger mt-3">{error}</div>}
      {successMsg && <div className="alert alert-success mt-3">{successMsg}</div>}

      {/* 🚀 Submit Button */}
      <button
        type="submit"
        disabled={loading}
        className="mt-4 w-100 fw-semibold py-2 rounded border-0 d-flex justify-content-center align-items-center"
        style={{ background: 'linear-gradient(to right, #3b82f6, #9333ea)', color: '#fff', transition: 'transform 0.3s ease' }}
      >
        {loading ? (
          <>
            <span className="spinner-border spinner-border-sm me-2"></span>
            Analyzing...
          </>
        ) : (
          'Get Recommendation'
        )}
      </button>
    </form>
  );
};

export default TradeForm;
