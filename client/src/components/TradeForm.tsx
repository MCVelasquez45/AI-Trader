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

  const removeTicker = (ticker: string) => {
    setTickers(prev => prev.filter(t => t !== ticker));
  };

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
    <form onSubmit={handleSubmit} className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-6 md:p-8 shadow-xl border border-gray-700 mb-12">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">Stock Ticker Symbol</label>
          <input
            type="text"
            value={tickerInput}
            onChange={(e) => setTickerInput(e.target.value.toUpperCase())}
            onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); addTicker(); } }}
            placeholder="e.g., AAPL"
            className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-white"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">Available Capital ($)</label>
          <input
            type="number"
            min="0"
            value={capital}
            onChange={(e) => setCapital(e.target.value)}
            placeholder="e.g., 5000"
            className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-white"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">Risk Tolerance</label>
          <select
            value={riskTolerance}
            onChange={(e) => setRiskTolerance(e.target.value as RiskLevel)}
            className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-white"
          >
            <option value="low">Low</option>
            <option value="medium">Medium</option>
            <option value="high">High</option>
          </select>
        </div>
      </div>

      {/* Tick list */}
      {tickers.length > 0 && (
        <div className="mt-4 flex flex-wrap gap-2">
          {tickers.map((ticker) => (
            <span
              key={ticker}
              onClick={() => removeTicker(ticker)}
              className="bg-gray-700 text-white px-3 py-1 rounded-full text-sm cursor-pointer hover:bg-red-600 transition"
            >
              {ticker} ✖
            </span>
          ))}
        </div>
      )}

      {/* Warnings / Feedback */}
      {validationResult?.contracts?.length === 0 && validationResult?.closestITM && (
        <div className="bg-yellow-800/50 border border-yellow-500 text-yellow-200 rounded mt-4 p-4">
          Closest ITM contract is <strong>${validationResult.closestITM.ask.toFixed(2)}</strong>, but your capital is only <strong>${parseFloat(capital).toFixed(2)}</strong>.
        </div>
      )}

      {error && <div className="bg-red-700 text-white px-4 py-2 mt-4 rounded">{error}</div>}
      {successMsg && <div className="bg-green-700 text-white px-4 py-2 mt-4 rounded">{successMsg}</div>}

      {/* Submit */}
      <button
        type="submit"
        disabled={loading}
        className="mt-6 w-full py-3 px-6 bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white font-medium rounded-lg transition-all duration-300 transform hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {loading ? (
          <span className="flex items-center justify-center">
            <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
            </svg>
            Analyzing...
          </span>
        ) : (
          'Get Recommendation'
        )}
      </button>
    </form>
  );
};

export default TradeForm;
