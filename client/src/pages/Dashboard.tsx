// 📦 Import React and hooks
import React, { useState } from 'react';
import { BsBank, BsBarChartFill, BsChatDotsFill } from 'react-icons/bs';

// 📦 Import components
import TradeForm from '../components/TradeForm';
import RecommendationPanel from '../components/RecommendationPanel';
import TypingDots from '../components/TypingDots';
import TradeHistory from '../components/TradeHistory';

// 🎯 Use AnalysisData type for trade recommendations
import type { AnalysisData } from '../types/Analysis';

type AnalysisResultPayload = {
  tickers: string[];
  capital: number;
  riskTolerance: string;
  validatedContracts: any;
  result: any;
};

// 📘 Dashboard Component — Main Page
const Dashboard: React.FC = () => {
  const [analysisData, setAnalysisData] = useState<Record<string, AnalysisData>>({});
  const [loading, setLoading] = useState<boolean>(false);
  const [activeTicker, setActiveTicker] = useState<string | null>(null);
  const [unaffordableTickers, setUnaffordableTickers] = useState<string[]>([]);
  const [showHistory, setShowHistory] = useState<boolean>(false);

  // ✅ Called by <TradeForm> with final backend result
  const handleAnalysisResult = async ({
    tickers,
    capital,
    riskTolerance,
    result
  }: AnalysisResultPayload) => {
    console.log('📬 Received analysis result from <TradeForm>');
    console.log('📈 Tickers:', tickers);
    console.log('💰 Capital:', capital);
    console.log('🧠 Risk Tolerance:', riskTolerance);
    console.log('🧾 Full Backend Result:', result);

    setLoading(true);
    setUnaffordableTickers([]);

    try {
      if (!result || result.error) {
        alert(`❌ Backend error: ${result?.error || 'Unknown failure'}`);
        console.error('❌ analyzeTrade error:', result);
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

      // ✅ Flatten backend structure to match RecommendationPanel
      const updatedAnalysis: Record<string, AnalysisData> = {};
     for (const trade of result.recommendations) {
  const details = trade.analysis || trade;

  if (!details || typeof details !== 'object' || !details.option || !details.entryPrice) {
    console.warn(`⚠️ Skipping malformed trade payload:`, trade);
    continue;
  }

  let rawTicker =
    details.ticker ||
    details.tickers?.[0] ||
    (details.option?.ticker?.includes(':') ? details.option.ticker.split(':')[1].substring(0, 4) : null) ||
    'UNKNOWN';

  const ticker = rawTicker.toUpperCase();

  updatedAnalysis[ticker] = {
    ticker,
    option: details.option,
    recommendationDirection: details.tradeType || details.recommendationDirection,
    confidence: details.confidence,
    entryPrice: details.entryPrice,
    targetPrice: details.targetPrice,
    stopLoss: details.stopLoss,
    gptResponse: details.gptResponse || details.analysis,
    sentimentSummary: details.sentimentSummary || details.sentiment || 'N/A',
    congressTrades: details.congressTrades || details.congress || 'N/A',
    breakEvenPrice: details.breakEvenPrice ?? 'N/A',
    expectedROI: details.expectedROI ?? 'N/A',
    indicators: details.indicators ?? {
      rsi: null,
      macd: { histogram: null },
      vwap: null
    },
    expiryDate: details.option?.expiration_date
  };

  console.log(`✅ [${ticker}] Final Mapped Analysis:`, updatedAnalysis[ticker]);
}


      const firstTicker = result.recommendations[0]?.ticker || result.recommendations[0]?.tickers?.[0];
      setAnalysisData(updatedAnalysis);
      setActiveTicker(firstTicker);
      console.log('✅ Analysis complete. Active Ticker:', firstTicker);
    } catch (err: any) {
      const msg = err.response?.data?.error || err.message || 'Unknown error';
      alert(`❌ Failed to process analysis result: ${msg}`);
      console.error('❌ Error processing result:', err.response?.data || err.message || err);
    } finally {
      setLoading(false);
    }
  };

  // 📦 Render UI
  return (
    <div className="min-vh-100 text-white" style={{ background: 'linear-gradient(to bottom right, #0f172a, #0b1120)' }}>
      {/* 🔝 Header */}
      <header className="py-4 border-bottom ">
        <div className="container d-flex justify-content-between align-items-center">
          <h1 className="fs-3 fw-bold" style={{ backgroundImage: 'linear-gradient(to right, #0ea5e9, #a855f7)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
            AI Options Trading Assistant
          </h1>
          <nav className="d-none d-md-block">
            <a href="#" className="text-light mx-2 text-decoration-none">Dashboard</a>
            <a href="#" className="text-light mx-2 text-decoration-none">Market Data</a>
            <a href="#" className="text-light mx-2 text-decoration-none">Settings</a>
          </nav>
        </div>
      </header>

      {/* 🔧 Main Content */}
      <main className="container py-5">
        <div className="mx-auto" style={{ maxWidth: '960px' }}>
          {/* 📌 Intro Section */}
          <div className="mb-5 text-center">
            <h2 className="fs-2 fw-bold mb-3">Analyze Your Trade Opportunity</h2>
            <p className="text-secondary">Enter a stock ticker symbol, your available capital, and your risk tolerance level to get an AI-powered options trading recommendation.</p>
          </div>

          {/* 📾 Trade Form */}
          <div className="bg-opacity-75 rounded p-4 shadow border border-dark mb-4">
            <TradeForm onAnalyze={handleAnalysisResult} />
          </div>

          {/* ⏳ Loading State */}
          {loading && <TypingDots />}

          {/* ⚠️ Skipped Tickers */}
          {unaffordableTickers.length > 0 && (
            <div className="alert alert-warning">
              <strong>⚠️ Some tickers were skipped:</strong>
              <ul className="mb-0 ps-4">
                {unaffordableTickers.map((msg, idx) => (
                  <li key={idx}>{msg}</li>
                ))}
              </ul>
            </div>
          )}

          {/* 📟 Empty State */}
          {!loading && !activeTicker && (
            <div className="bg-dark bg-opacity-25 rounded-xl p-5 text-center border-4 border-dashed border-blue-800 mb-5">
              <svg width="64" height="64" className="text-gray-500 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
              <h3 className="text-white text-lg font-semibold mb-3">No Analysis Yet</h3>
              <p className="text-gray-400">Enter your details above to get started with your options trade analysis.</p>
            </div>
          )}

          {/* ✅ Analysis Result Panel */}
          {activeTicker && !loading && (
            <RecommendationPanel analysis={analysisData[activeTicker]} />
          )}

          {/* 💡 How It Works */}
          <section className="mt-5">
            <h2 className="h4 fw-bold mb-4 text-center">How It Works</h2>
            <div className="row g-4">
              {[{
                title: "Real-Time Market Data",
                description: "We analyze real-time stock prices, volume, and technical indicators to identify potential opportunities.",
                icon: <BsBarChartFill size={32} className="text-info" />
              }, {
                title: "Sentiment Analysis",
                description: "Our AI scans news articles, social media, and analyst reports to gauge market sentiment around each stock.",
                icon: <BsChatDotsFill size={32} className="text-primary" />
              }, {
                title: "Congressional Insights",
                description: "Track insider trading activity and regulatory changes that could impact stock performance.",
                icon: <BsBank size={32} className="text-success" />
              }].map((feature, index) => (
                <div key={index} className="col-md-4">
                  <div className="rounded p-4 h-100 border border-secondary text-center">
                    <div className="mb-3 d-flex justify-content-center">{feature.icon}</div>
                    <h4 className="h6 fw-semibold mb-2">{feature.title}</h4>
                    <p className="text-secondary small">{feature.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* 🚀 Call To Action Section */}
          <section className="mt-5 text-center py-5 rounded border border-secondary" style={{ background: 'linear-gradient(to right, rgba(0, 123, 255, 0.1), rgba(138, 43, 226, 0.1))' }}>
            <h2 className="h4 fw-bold mb-3">Ready to Make Smarter Trades?</h2>
            <p className="text-secondary mb-4">Our AI-powered assistant combines multiple data sources to give you actionable options trading recommendations.</p>
            <button className="btn fw-semibold px-4 py-2" style={{ background: 'linear-gradient(to right, #0ea5e9, #a855f7)', color: '#fff', border: 'none' }}>Start Analyzing Now</button>
          </section>

          {/* 🕰️ History Section */}
          {showHistory && (
            <div className="mt-5">
              <div className="bg-secondary bg-opacity-75 rounded p-4 shadow border border-dark">
                <h2 className="fs-5 fw-semibold mb-3 text-success">🕰️ GPT Trade History</h2>
                <TradeHistory />
              </div>
            </div>
          )}

          {/* 🔁 Toggle GPT History Button */}
          <div className="text-center mt-4">
            <button className="btn btn-link text-primary text-decoration-none" onClick={() => setShowHistory(!showHistory)}>
              {showHistory ? 'Hide GPT History' : 'View GPT History'}
            </button>
          </div>
        </div>
      </main>

      {/* 🔻 Footer */}
      <footer className="py-4 border-top border-secondary mt-5">
        <div className="container text-center text-secondary">
          <p>© {new Date().getFullYear()} AI Options Trading Assistant. All rights reserved.</p>
          <p className="mt-2 small">This  application for educational purposes .</p>
        </div>
      </footer>
    </div>
  );
};

export default Dashboard;
