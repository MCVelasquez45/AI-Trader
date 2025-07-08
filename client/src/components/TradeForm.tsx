// ✅ File: components/TradeForm.tsx

import React, { useState } from 'react';
import { analyzeTrade, validateTicker } from '../api/tradeApi';
import { useContractContext } from '../contexts/ContractContext';
import type { RiskLevel, TradeFormProps } from '../types/TradeForm';
import type { OptionContract } from '../types/OptionContract';

const TradeForm: React.FC<TradeFormProps> = ({ onAnalyze }) => {
  const [tickerInput, setTickerInput] = useState('');
  const [capital, setCapital] = useState('');
  const [riskTolerance, setRiskTolerance] = useState<RiskLevel>('medium');
  const [tickers, setTickers] = useState<string[]>([]);

  const { validatedContracts, setValidatedContracts } = useContractContext();

  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [loading, setLoading] = useState(false);
  const [validationResult, setValidationResult] = useState<any>(null);

  // ✅ Add ticker and validate
  const addTicker = async () => {
    const symbol = tickerInput.trim().toUpperCase();
    if (!symbol || tickers.includes(symbol)) return;

    const result = await validateTicker(symbol, parseFloat(capital), riskTolerance);
    if (!result?.valid || !result.closestITM) {
      setError(result?.message || `Invalid ticker: ${symbol}`);
      setValidationResult(result);
      return;
    }

    const closestITM = result.closestITM;
    if (!closestITM) return;

    setValidatedContracts(prev => ({ ...prev, [symbol]: closestITM }));
    setTickers(prev => [...prev, symbol]);
    setTickerInput('');
    setError('');
    setValidationResult(result);
  };

  // ❌ Remove ticker
  const removeTicker = (ticker: string) => {
    setTickers(prev => prev.filter(t => t !== ticker));
    setValidatedContracts(prev => {
      const updated = { ...prev };
      delete updated[ticker];
      return updated;
    });
  };

  // 🚀 Final submission
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

    const localContracts = { ...validatedContracts };
    let currentTickers = [...tickers];

    // Auto-validate current input if user forgot to add it
    if (tickerInput.trim()) {
      const symbol = tickerInput.trim().toUpperCase();
      if (!tickers.includes(symbol)) {
        const result = await validateTicker(symbol, numericCapital, riskTolerance);
        if (!result?.valid || !result.closestITM) {
          setError(result?.message || `Invalid ticker: ${symbol}`);
          setLoading(false);
          return;
        }

        const closestITM = result.closestITM;
        if (!closestITM) return;

        currentTickers.push(symbol);
        localContracts[symbol] = closestITM;
        setValidatedContracts(prev => ({ ...prev, [symbol]: closestITM }));
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

    const contractsSnapshot = currentTickers.reduce((acc, symbol) => {
      const contract = localContracts[symbol];
      if (contract) {
        const typed = contract as OptionContract;
        acc[symbol] = {
          ...typed,
          contract_type: typed.contract_type || typed.contractType || 'call'
        };
      }
      return acc;
    }, {} as Record<string, OptionContract & { contract_type: string }>);

    console.log('🧠 FINAL PAYLOAD TO analyzeTrade():', {
      tickers: currentTickers,
      capital: numericCapital,
      riskTolerance,
      validatedContracts: contractsSnapshot
    });

    try {
      const result = await analyzeTrade({
        watchlist: currentTickers,
        tickers: currentTickers,
        capital: numericCapital,
        riskTolerance,
        validatedContracts: contractsSnapshot
      });

      console.log('✅ Trade analysis complete.');
      setSuccessMsg('✅ Trade successfully analyzed.');

      // ✅ Pass the full payload to Dashboard
      onAnalyze({
        tickers: currentTickers,
        capital: numericCapital,
        riskTolerance,
        validatedContracts: contractsSnapshot,
        result
      });
    } catch (err: any) {
      const msg = err?.error || '❌ Error analyzing trade.';
      setError(msg);
      console.error('❌ Analyze Trade Error:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="rounded p-4 shadow border border-gray-700 mb-5"
      style={{ background: 'linear-gradient(to bottom right, #0f172a, #222936)', backdropFilter: 'blur(4px)' }}
    >
      {/* Inputs */}
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
            placeholder="e.g., 1000"
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

      {/* Selected tickers */}
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

      {/* Capital Warning */}
      {validationResult?.contracts?.length === 0 && validationResult?.closestITM && (
        <div className="alert alert-warning mt-3">
          Closest ITM contract is <strong>${validationResult.closestITM.ask.toFixed(2)}</strong>, 
          but your capital is only <strong>${parseFloat(capital).toFixed(2)}</strong>.
        </div>
      )}

      {/* Alerts */}
      {error && <div className="alert alert-danger mt-3">{error}</div>}
      {successMsg && <div className="alert alert-success mt-3">{successMsg}</div>}

      {/* Validated Contracts */}
      {Object.entries(validatedContracts).length > 0 && (
        <div className="alert alert-info mt-3">
          <strong>🧾 Validated Contracts:</strong>
          <ul className="mb-0">
            {Object.entries(validatedContracts).map(([ticker, contract]) => (
              <li key={ticker}>
                <strong>{ticker}</strong>: {contract?.ticker} | Strike: ${contract?.strike_price}
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Submit */}
      <button
        type="submit"
        disabled={loading}
        className="mt-4 w-100 fw-semibold py-2 rounded border-0 d-flex justify-content-center align-items-center"
        style={{
          background: 'linear-gradient(to right, #3b82f6, #9333ea)',
          color: '#fff',
          transition: 'transform 0.3s ease'
        }}
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
