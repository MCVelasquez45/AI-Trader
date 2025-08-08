import { axiosInstance } from '../api/axiosInstance';
import React, { useState, useEffect } from 'react';
import Layout from '../components/Layout';
import { useAuth } from '../contexts/AuthContext';
import { BsBank, BsBarChartFill, BsChatDotsFill } from 'react-icons/bs';

import TradeForm from '../components/TradeForm';
import RecommendationPanel from '../components/RecommendationPanel';
import TypingDots from '../components/TypingDots';
import TradeHistory from '../components/TradeHistory';

import type { AnalysisData } from '../types/Analysis';

// ✅ Props type for controlling modal visibility
type DashboardProps = {
  setShowAuthModal: React.Dispatch<React.SetStateAction<boolean>>;
};

const Dashboard: React.FC<DashboardProps> = ({ setShowAuthModal }) => {
  const [analysisData, setAnalysisData] = useState<Record<string, AnalysisData>>({});
  const [loading, setLoading] = useState<boolean>(false);
  const [activeTicker, setActiveTicker] = useState<string | null>(null);
  const [unaffordableTickers, setUnaffordableTickers] = useState<string[]>([]);
  const [showHistory, setShowHistory] = useState<boolean>(false);
  const { user } = useAuth();

  // 🔁 Load persisted recommendations from localStorage on page load (only for guests)
  useEffect(() => {
    if (!user) {
      const storedAnalysis = localStorage.getItem('analysisData');
      const storedTicker = localStorage.getItem('activeTicker');
      if (storedAnalysis) setAnalysisData(JSON.parse(storedAnalysis));
      if (storedTicker) setActiveTicker(storedTicker);
    }
  }, [user]);

  // 🧼 Reset dashboard state on sign out and load user trade history on sign in (only after user.email is available)
  useEffect(() => {
    if (typeof user === 'undefined') return;

    if (!user) {
      console.log('👋 User signed out, resetting dashboard state');
      setAnalysisData({});
      setActiveTicker(null);
      setUnaffordableTickers([]);
      localStorage.removeItem('analysisData');
      localStorage.removeItem('activeTicker');
      return;
    }

    if (!user.email) return;

    console.log(`🔁 Authenticated user detected: ${user.email} — Fetching trade history...`);

    const fetchUserTrades = async () => {
      try {
        const { data: trades } = await axiosInstance.get('/api/trades', { withCredentials: true });
        console.log('📦 Full trade history pulled:', trades);

        const loadedAnalysis: Record<string, AnalysisData> = {};

        trades.forEach((trade: any) => {
          if (trade && trade.option && trade.option.ticker) {
            const ticker = trade.option.ticker?.split(':')[1]?.substring(0, 4)?.toUpperCase() || trade.ticker?.toUpperCase() || 'UNKNOWN';

            loadedAnalysis[ticker] = {
              ticker,
              option: trade.option,
              recommendationDirection: trade.recommendationDirection,
              confidence: trade.confidence,
              entryPrice: trade.entryPrice,
              targetPrice: trade.targetPrice,
              stopLoss: trade.stopLoss,
              gptResponse: trade.gptResponse,
              sentimentSummary: trade.sentimentSummary || 'N/A',
              congressTrades: trade.congressTrades || 'N/A',
              breakEvenPrice: trade.breakEvenPrice ?? 'N/A',
              expectedROI: trade.expectedROI ?? 'N/A',
              indicators: trade.indicators ?? {
                rsi: null,
                macd: { histogram: null },
                vwap: null
              },
              expiryDate: trade.option?.expiration_date
            };
          }
        });

        setAnalysisData(loadedAnalysis);
        const firstTicker = Object.keys(loadedAnalysis)[0];
        setActiveTicker(firstTicker || null);
        console.log('✅ Loaded trade history for user');
      } catch (err) {
        console.error('❌ Error loading trade history:', err);
      }
    };

    fetchUserTrades();
  }, [user?.email]);

  // 💾 Persist recommendations in localStorage (only for guests)
  useEffect(() => {
    if (!user && Object.keys(analysisData).length > 0) {
      localStorage.setItem('analysisData', JSON.stringify(analysisData));
      if (activeTicker) localStorage.setItem('activeTicker', activeTicker);
    }
  }, [analysisData, activeTicker, user]);

  const handleAnalysisResult = async ({ tickers, capital, riskTolerance, result }: any) => {
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
        return;
      }

      // ✅ Merge new results into existing analysisData instead of replacing
      const newAnalysis: Record<string, AnalysisData> = { ...analysisData };

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

        newAnalysis[ticker] = {
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

        console.log(`✅ [${ticker}] Final Mapped Analysis:`, newAnalysis[ticker]);
      }

      const firstNewTicker = Object.keys(newAnalysis).find(
        t => !(t in analysisData)
      ) || Object.keys(newAnalysis)[0];

      setAnalysisData(newAnalysis);
      setActiveTicker(firstNewTicker);
      console.log('✅ Analysis complete. Active Ticker:', firstNewTicker);
    } catch (err: any) {
      const msg = err.response?.data?.error || err.message || 'Unknown error';
      alert(`❌ Failed to process analysis result: ${msg}`);
      console.error('❌ Error processing result:', err.response?.data || err.message || err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Layout setShowAuthModal={setShowAuthModal}>
      <main className="container py-5">
        <div className="mx-auto" style={{ maxWidth: '960px' }}>
          {/* ✍️ Header */}
          <div className="mb-5 text-center">
            <h2 className="fs-2 fw-bold mb-3">Analyze Your Trade Opportunity</h2>
            <p className="text-secondary">
              Enter a stock ticker symbol, your available capital, and your risk tolerance level to get an AI-powered options trading recommendation.
            </p>
          </div>

          {/* 🧾 Form to collect trade request */}
          <div id="trade-form-section" className="bg-opacity-75 rounded p-4 shadow border border-dark mb-4">
            <TradeForm onAnalyze={handleAnalysisResult} />
          </div>

          {/* 🔄 Spinner if loading */}
          {loading && <TypingDots />}

          {/* ⚠️ Show errors */}
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

          {/* 🚫 No active result */}
          {!loading && !activeTicker && (
            user ? (
              <div className="p-3 mb-5 mt-4 rounded border border-secondary bg-dark bg-opacity-50 text-start">
                <div className="d-flex align-items-start gap-3">
                  <img
                    src={
                      user?.avatar?.startsWith('/uploads/')
                        ? `${import.meta.env.VITE_BACKEND_URL || 'http://localhost:4545'}${user.avatar}`
                        : user?.avatar || 'https://via.placeholder.com/80'
                    }
                    alt={`${user?.name || 'User'}'s avatar`}
                    className="rounded-circle border border-secondary"
                    style={{
                      width: '80px',
                      height: '80px',
                      objectFit: 'cover',
                      objectPosition: 'center top'
                    }}
                  />
                  <div className="pt-1">
                    <h4 className="mb-1">{user?.name || 'AI-Trader Guest'}</h4>
                    <p className="fst-italic text-info small mt-2">“Dream big. Trade smart.”</p>
                    {user?.bio && <p className="text-secondary small mb-0">{user.bio}</p>}
                  </div>
                </div>
                <div className="mt-4">
                  <p className="text-secondary small text-center">
                    Fill out the form above to analyze your first options trade. Use the ticker, your capital, and risk level to get a recommendation.
                  </p>
                </div>
              </div>
            ) : (
              <div className="bg-dark bg-opacity-25 rounded-xl p-5 text-center border-4 border-dashed border-blue-800 mb-5">
                <svg width="64" height="64" className="text-gray-500 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                </svg>
                <h3 className="text-white text-lg font-semibold mb-3">No Analysis Yet</h3>
                <p className="text-gray-400">Enter your details above to get started with your options trade analysis.</p>
              </div>
            )
          )}

          {/* ✅ Recommendations section */}
          {!loading && Object.keys(analysisData).length > 0 && (
            <>
              {/* User profile block is also shown here above recommendations */}
              {user && (
                <div className="p-3 mb-5 mt-4 rounded border border-secondary bg-dark bg-opacity-50 text-start">
                  <div className="d-flex align-items-start gap-3">
                    <img
                      src={
                        user?.avatar?.startsWith('/uploads/')
                          ? `${import.meta.env.VITE_BACKEND_URL || 'http://localhost:4545'}${user.avatar}`
                          : user?.avatar || 'https://via.placeholder.com/80'
                      }
                      alt={`${user?.name || 'User'}'s avatar`}
                      className="rounded-circle border border-secondary"
                      style={{
                        width: '80px',
                        height: '80px',
                        objectFit: 'cover',
                        objectPosition: 'center top'
                      }}
                    />
                    <div className="pt-1">
                      <h4 className="mb-1">{user?.name || 'AI-Trader Guest'}</h4>
                      <p className="fst-italic text-info small mt-2">“Dream big. Trade smart.”</p>
                      {user?.bio && <p className="text-secondary small mb-0">{user.bio}</p>}
                    </div>
                  </div>
                  <div className="mt-4">
                    <p className="text-secondary small text-center">
                      Fill out the form above to analyze your first options trade. Use the ticker, your capital, and risk level to get a recommendation.
                    </p>
                  </div>
                </div>
              )}
              <h3 className="text-light mb-4">📈 Trade Recommendations</h3>

              <div className="d-flex flex-wrap gap-2 mb-3">
                {Object.keys(analysisData).map((ticker) => (
                  <button
                    key={ticker}
                    className={`btn btn-sm fw-bold ${activeTicker === ticker ? 'btn-info' : 'btn-outline-secondary'}`}
                    onClick={() => setActiveTicker(ticker)}
                  >
                    {ticker}
                  </button>
                ))}
              </div>

              {activeTicker && analysisData[activeTicker] && (
                <RecommendationPanel analysis={analysisData[activeTicker]} />
              )}
            </>
          )}

          {/* 🧠 Feature bullets */}
          <section className="mt-5">
            <h2 className="h4 fw-bold mb-4 text-center">How It Works</h2>
            <div className="row g-4">
              {[{
                title: 'Real-Time Market Data',
                description: 'We analyze real-time stock prices, volume, and technical indicators to identify potential opportunities.',
                icon: <BsBarChartFill size={32} className="text-info" />
              }, {
                title: 'Sentiment Analysis',
                description: 'Our AI scans news articles, social media, and analyst reports to gauge market sentiment around each stock.',
                icon: <BsChatDotsFill size={32} className="text-primary" />
              }, {
                title: 'Congressional Insights',
                description: 'Track insider trading activity and regulatory changes that could impact stock performance.',
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

          {/* CTA */}
          <section className="mt-5 text-center py-5 rounded border border-secondary" style={{ background: 'linear-gradient(to right, rgba(0, 123, 255, 0.1), rgba(138, 43, 226, 0.1))' }}>
            <h2 className="h4 fw-bold mb-3">Ready to Make Smarter Trades?</h2>
            <p className="text-secondary mb-4">Our AI-powered assistant combines multiple data sources to give you actionable options trading recommendations.</p>
            <button
              onClick={() => {
                const formSection = document.getElementById("trade-form-section");
                if (formSection) formSection.scrollIntoView({ behavior: 'smooth' });
              }}
              className="btn fw-semibold px-4 py-2"
              style={{ background: 'linear-gradient(to right, #0ea5e9, #a855f7)', color: '#fff', border: 'none' }}
            >
              Start Analyzing Now
            </button>
          </section>

          {/* GPT History Toggle */}
          {showHistory && (
            <div className="mt-5">
              <div className="bg-opacity-75 rounded p-4 shadow border border-dark">
                <h2 className="fs-5 fw-semibold mb-3 text-success">🕰️ GPT Trade History</h2>
                <TradeHistory />
              </div>
            </div>
          )}

          <div className="text-center mt-4">
            <button className="btn btn-link text-primary text-decoration-none" onClick={() => setShowHistory(!showHistory)}>
              {showHistory ? 'Hide GPT History' : 'View GPT History'}
            </button>
          </div>
        </div>
      </main>

      <footer className="py-4 border-top border-secondary mt-5">
        <div className="container text-center text-secondary">
          <p>© {new Date().getFullYear()} AI Options Trading Assistant. All rights reserved.</p>
          <p className="mt-2 small">This application is for educational purposes.</p>
        </div>
      </footer>
    </Layout>
  );
};

export default Dashboard;