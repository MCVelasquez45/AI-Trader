import React, { useState } from 'react';
import TradeForm from '../components/TradeForm';
import RecommendationPanel from '../components/RecommendationPanel';
import TradeHistory from '../components/TradeHistory';
import { analyzeTrade } from '../api/tradeApi';
import TypingDots from '../components/TypingDots';

const Dashboard: React.FC = () => {
  const [analysisData, setAnalysisData] = useState({});
  const [loading, setLoading] = useState(false);
  const [activeTicker, setActiveTicker] = useState<string | null>(null);
  const [unaffordableTickers, setUnaffordableTickers] = useState<string[]>([]);
  const [showHistory, setShowHistory] = useState(false); // 👈 New toggle state

  const handleAnalyze = async (tickers: string[], capital: number, riskTolerance: string) => {
    setLoading(true);
    setUnaffordableTickers([]);

    try {
      const result = await analyzeTrade({
        watchlist: tickers,
        capital,
        riskTolerance
      });

      const unaffordable = result.errors || [];
      setUnaffordableTickers(unaffordable.map((e: any) => `- ${e.ticker || 'Unknown'}: ${e.error}`));

      if (!result?.recommendations?.length) {
        setAnalysisData({});
        setActiveTicker(null);
        return;
      }

      const updatedAnalysis: any = {};
      for (const trade of result.recommendations) {
        const ticker = trade.tickers?.[0] || 'Unknown';
        updatedAnalysis[ticker] = trade;
      }

      setAnalysisData(updatedAnalysis);
      setActiveTicker(result.recommendations[0].tickers[0]);

    } catch (err: any) {
      console.error('❌ Error analyzing:', err.response?.data || err.message || err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <TradeForm onAnalyze={handleAnalyze} />
      
      <div className="d-flex justify-content-end px-4 mb-3">
        <button className="btn btn-outline-secondary" onClick={() => setShowHistory(!showHistory)}>
          {showHistory ? 'Hide GPT History' : 'View GPT History'}
        </button>
      </div>

      {showHistory && <TradeHistory />}

      {loading && <TypingDots />}

      {unaffordableTickers.length > 0 && (
        <div className="alert alert-warning m-3">
          <strong>Some tickers from your watchlist were outside your price range:</strong>
          <ul>
            {unaffordableTickers.map((msg, idx) => <li key={idx}>{msg}</li>)}
          </ul>
          <p className="mb-0">We’ve excluded these and shown recommendations only for the tickers you could afford.</p>
        </div>
      )}

      {!loading && !activeTicker && unaffordableTickers.length > 0 && (
        <div className="alert alert-info m-3">
          No affordable trades found. Please try again with different tickers or increase your capital.
        </div>
      )}

      {activeTicker && (
        <RecommendationPanel analysis={analysisData[activeTicker]} />
      )}
    </>
  );
};

export default Dashboard;
