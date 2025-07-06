// 📦 Import React and hooks
import React, { useState } from 'react';

// 📦 Import components
import TradeForm from '../components/TradeForm';
import RecommendationPanel from '../components/RecommendationPanel';
// import TradeHistory from '../components/TradeHistory'; // Optional feature
import TypingDots from '../components/TypingDots';

// 📦 Import API function
import { analyzeTrade } from '../api/tradeApi';

// 🧠 Define TypeScript types
interface TradeAnalysisResult {
  tickers: string[];
  [key: string]: any;
}

// 📘 Dashboard Component — Main Page
const Dashboard: React.FC = () => {
  // 🔧 Local state
  const [analysisData, setAnalysisData] = useState<Record<string, TradeAnalysisResult>>({});
  const [loading, setLoading] = useState<boolean>(false);
  const [activeTicker, setActiveTicker] = useState<string | null>(null);
  const [unaffordableTickers, setUnaffordableTickers] = useState<string[]>([]);
  const [showHistory, setShowHistory] = useState<boolean>(false);

  // 🚀 Handles the core analysis logic
  const handleAnalyze = async (
    tickers: string[],
    capital: number,
    riskTolerance: string
  ) => {
    console.log('📡 Submitting tickers to backend:', tickers);
    console.log('💰 Capital:', capital, '| 🧠 Risk:', riskTolerance);
    setLoading(true);
    setUnaffordableTickers([]);

    try {
      const result = await analyzeTrade({ watchlist: tickers, capital, riskTolerance });

      if (!result || result.error) {
        alert(`❌ Backend error: ${result?.error || 'Unknown failure'}`);
        console.error('❌ analyzeTrade error:', result);
        setLoading(false);
        return;
      }

      const unaffordable = result.errors || [];
      if (unaffordable.length > 0) {
        console.warn('⚠️ Unaffordable tickers:', unaffordable);
        setUnaffordableTickers(
          unaffordable.map((e: any) => `- ${e.ticker || 'Unknown'}: ${e.error}`)
        );
      }

      if (!result?.recommendations?.length) {
        console.log('ℹ️ No recommendations returned');
        setAnalysisData({});
        setActiveTicker(null);
        return;
      }

      const updatedAnalysis: Record<string, TradeAnalysisResult> = {};
      for (const trade of result.recommendations) {
        const ticker = trade.tickers?.[0] || 'Unknown';
        updatedAnalysis[ticker] = trade;
      }

      setAnalysisData(updatedAnalysis);
      setActiveTicker(result.recommendations[0]?.tickers[0]);
      console.log('✅ Analysis complete. Active:', result.recommendations[0]?.tickers[0]);
    } catch (err: any) {
      const msg = err.response?.data?.error || err.message || 'Unknown error';
      alert(`❌ Failed to analyze trade: ${msg}`);
      console.error('❌ Error analyzing:', err.response?.data || err.message || err);
    } finally {
      setLoading(false);
    }
  };

  // 📦 Render UI
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 text-white">
      {/* 🔹 Header */}
      <header className="py-6 border-b border-gray-700">
        <div className="container mx-auto px-4 flex justify-between items-center">
          <h1 className="text-2xl md:text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-purple-600">
            AI Options Trading Assistant
          </h1>
          <nav className="space-x-4 hidden md:block">
            <a href="#" className="hover:text-blue-400 transition-colors">Dashboard</a>
            <a href="#" className="hover:text-blue-400 transition-colors">Market Data</a>
            <a href="#" className="hover:text-blue-400 transition-colors">Settings</a>
          </nav>
        </div>
      </header>

      {/* 🔹 Main Content */}
      <main className="container mx-auto px-4 py-12">
        <div className="max-w-4xl mx-auto">
          {/* 📌 Intro */}
          <div className="mb-12 text-center">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Analyze Your Trade Opportunity
            </h2>
            <p className="text-gray-400 max-w-xl mx-auto">
              Enter a stock ticker symbol, your available capital, and your risk tolerance level to get an AI-powered options trading recommendation.
            </p>
          </div>

          {/* 🧾 Trade Form */}
          <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-6 md:p-8 shadow-xl border border-gray-700 mb-12">
            <TradeForm onAnalyze={handleAnalyze} />
          </div>

          {/* ⏳ Loading State */}
          {loading && <TypingDots />}

          {/* ⚠️ Skipped tickers alert */}
          {unaffordableTickers.length > 0 && (
            <div className="bg-yellow-800/50 border border-yellow-500 rounded-lg p-4 text-yellow-300 mb-8">
              <strong>⚠️ Some tickers were skipped:</strong>
              <ul className="list-disc ml-6 mt-2">
                {unaffordableTickers.map((msg, idx) => (
                  <li key={idx}>{msg}</li>
                ))}
              </ul>
            </div>
          )}

          {/* ℹ️ Empty Results */}
          {!loading && !activeTicker && unaffordableTickers.length > 0 && (
            <div className="bg-blue-800/50 border border-blue-500 rounded-lg p-4 text-blue-300 text-center mb-8">
              No affordable trades found. Try increasing your capital or choosing different tickers.
            </div>
          )}

          {/* ✅ Analysis Result */}
          {activeTicker && !loading && (
            <RecommendationPanel analysis={analysisData[activeTicker]} />
          )}

          {/* 🕰️ GPT History Panel (optional) */}
          {showHistory && (
            <div className="mt-16">
              <div className="bg-gray-800/50 rounded-xl p-6 md:p-8 shadow-xl border border-gray-700">
                <h2 className="text-xl font-semibold mb-4 text-green-300">🕰️ GPT Trade History</h2>
                {/* <TradeHistory /> */}
              </div>
            </div>
          )}

          {/* 🔁 Toggle History Button */}
          <div className="flex justify-center mt-10">
            <button
              className="text-sm text-blue-400 hover:underline"
              onClick={() => setShowHistory(!showHistory)}
            >
              {showHistory ? 'Hide GPT History' : 'View GPT History'}
            </button>
          </div>
        </div>
      </main>

      {/* 🔻 Footer */}
      <footer className="py-8 border-t border-gray-800 mt-20">
        <div className="container mx-auto px-4 text-center text-gray-500">
          <p>© {new Date().getFullYear()} AI Options Trading Assistant. All rights reserved.</p>
          <p className="mt-2 text-sm">This is a demo application for educational purposes only.</p>
        </div>
      </footer>
    </div>
  );
};

export default Dashboard;
