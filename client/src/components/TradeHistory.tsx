// ✅ Full Updated TradeHistory.tsx — Fully Commented + Logged

import React, { useEffect, useState } from 'react';
import { Table, Accordion, Button } from 'react-bootstrap';
import { getAllTrades } from '../api/tradeApi';
import type { TradeRecord, OptionContract } from '../types/TradeHistory';

// ============================
// 🔗 Renders clickable congressional links or fallback
// ============================
const renderCongressTrades = (text?: string) => {
  if (!text) {
    return (
      <div>
        N/A
        <br />
        🔍 For full records, visit:{' '}
        <a
          href="https://www.capitoltrades.com/"
          target="_blank"
          rel="noopener noreferrer"
          className="text-info text-decoration-underline"
        >
          CapitolTrades.com
        </a>
      </div>
    );
  }

  return (
    <div style={{ whiteSpace: 'pre-wrap' }}>
      {text.split('\n').map((line, index) => {
        const url = line.replace(/^\u{1F517} |^Link: /u, '').trim();
        if (line.startsWith('🔗 ') || line.startsWith('Link: ')) {
          return (
            <div key={index}>
              🔗{' '}
              <a
                href={url}
                target="_blank"
                rel="noopener noreferrer"
                className="text-info text-decoration-underline"
              >
                {url}
              </a>
            </div>
          );
        }
        return <div key={index}>{line}</div>;
      })}
    </div>
  );
};

const TradeHistory: React.FC = () => {
  const [trades, setTrades] = useState<TradeRecord[]>([]);
  const [selected, setSelected] = useState<string | null>(null);

  // ============================
  // 🚀 Load trade history on mount
  // ============================
  useEffect(() => {
    const fetchTrades = async () => {
      try {
        const data = await getAllTrades();
        console.log('📥 Fetched trades:', data);

        if (!Array.isArray(data)) {
          console.error('❌ Expected array from getAllTrades, got:', typeof data);
          return;
        }

        if (data.length === 0) {
          console.warn('⚠️ No trade history returned');
        }

        setTrades(data.reverse()); // Most recent first
      } catch (err) {
        console.error('❌ Failed to fetch trades:', err);
      }
    };
    fetchTrades();
  }, []);

  // ============================
  // 💵 Format helpers
  // ============================
  const formatDollar = (val?: number | null) =>
    typeof val === 'number' ? `$${val.toFixed(2)}` : 'N/A';

  const formatNumber = (val?: number | null) =>
    typeof val === 'number' && !isNaN(val) ? val.toFixed(2) : 'N/A';

  const fallbackTarget = (entry?: number | null) =>
    typeof entry === 'number' ? `$${(entry * 1.05).toFixed(2)} (est.)` : 'N/A';

  const fallbackStop = (entry?: number | null) =>
    typeof entry === 'number' ? `$${(entry * 0.95).toFixed(2)} (est.)` : 'N/A';

  return (
    <div className="p-4 bg-dark bg-opacity-75 rounded shadow border border-secondary text-light">
      <h4 className="fw-bold mb-4">📘 GPT Trade History</h4>

      <Table striped bordered hover responsive variant="dark">
        <thead className="table-light text-dark">
          <tr>
            <th>Ticker</th>
            <th>Capital</th>
            <th>Direction</th>
            <th>Confidence</th>
            <th>Entry Price</th>
            <th>Expires</th>
            <th>Outcome</th>
            <th>Action</th>
          </tr>
        </thead>
        <tbody>
          {trades.map((trade) => {
            const key = trade._id || trade.tickers.join('-');
            const opt = (trade.option ?? {}) as OptionContract;
            console.log(`🧾 Option Contract for ${trade.tickers.join(', ')}:`, opt);

            return (
              <React.Fragment key={key}>
                <tr>
                  <td>{trade.tickers.join(', ')}</td>
                  <td>{formatDollar(trade.capital)}</td>
                  <td className={trade.recommendationDirection === 'put' ? 'text-danger' : 'text-success'}>
                    {trade.recommendationDirection.toUpperCase()}
                  </td>
                  <td>{trade.confidence?.toUpperCase() || 'N/A'}</td>
                  <td>{formatDollar(trade.entryPrice)}</td>
                  <td>
  {trade.option?.expiration_date
    ? new Date(trade.option.expiration_date).toLocaleDateString()
    : new Date(trade.expiryDate).toLocaleDateString()}
</td>

                  <td>{trade.outcome ?? 'pending'}</td>
                  <td>
                    <Button
                      variant="outline-info"
                      size="sm"
                      onClick={() => setSelected(selected === key ? null : key)}
                    >
                      {selected === key ? 'Hide' : 'View'}
                    </Button>
                  </td>
                </tr>

                {selected === key && (
                  <tr>
                    <td colSpan={8}>
                      <Accordion defaultActiveKey="0">
                        <Accordion.Item eventKey="0">
                          <Accordion.Header>
                            🧐 GPT Details for {trade.tickers.join(', ')}
                          </Accordion.Header>
                          <Accordion.Body className="bg-black text-light">
                            <div className="row">
                              {/* 🧠 Basic Recommendation Info */}
                              <div className="col-md-4 col-sm-6">
                                <p><strong>📣 Recommendation:</strong> {trade.recommendationDirection.toUpperCase()}</p>
                                <p><strong>💪 Confidence:</strong> {trade.confidence}</p>

                                <p><strong>🗓️ GPT Expiry Date:</strong> {trade.expiryDate}</p>
                                <p><strong>📍 Entry:</strong> {formatDollar(trade.entryPrice)}</p>
                                <p><strong>🎯 Target:</strong> {trade.targetPrice !== undefined ? formatDollar(trade.targetPrice) : fallbackTarget(trade.entryPrice)}</p>
                                <p><strong>🛑 Stop:</strong> {trade.stopLoss !== undefined ? formatDollar(trade.stopLoss) : fallbackStop(trade.entryPrice)}</p>
                              </div>

                              {/* 📊 Technical Indicators */}
                              <div className="col-md-4 col-sm-6">
                                <p><strong>📊 RSI:</strong> {formatNumber(trade.indicators?.rsi)}</p>
                                <p><strong>📉 VWAP:</strong> {formatNumber(trade.indicators?.vwap)}</p>
                                <p><strong>📈 MACD Histogram:</strong> {formatNumber(trade.indicators?.macd?.histogram)}</p>
                              </div>

                              {/* 🎟️ Option Contract Details */}
                              <div className="col-md-4 col-sm-6">
                                <p><strong>📈 Outcome:</strong> {trade.outcome ?? 'pending'}</p>
                                {trade.option && (
                                  <>
                                    <hr />
                                    <p><strong>🎟️ Option:</strong> Strike ${formatNumber(opt.strike_price)}, Exp {opt.expiration_date || 'N/A'}</p>
                                    <p><strong>📓 Contract:</strong> {opt.ticker || 'N/A'}</p>
                                    <p><strong>💰 Ask:</strong> {formatDollar(opt.ask)}</p>
                                    <p><strong>💰 Bid:</strong> {formatDollar(opt.bid)}</p>
                                    <p><strong>📊 Delta:</strong> {formatNumber(opt.delta)}</p>
                                    <p><strong>📈 IV:</strong> {formatNumber(opt.implied_volatility)}</p>
                                  </>
                                )}
                              </div>
                            </div>

                            <hr />
                            <p><strong>🧠 GPT Explanation:</strong></p>
                            <p className="text-light-emphasis">{trade.gptResponse}</p>

                            <Accordion className="mt-3">
                              <Accordion.Item eventKey="0">
                                <Accordion.Header>🗳️ News Sentiment</Accordion.Header>
                                <Accordion.Body>
                                  {trade.sentimentSummary ? (
                                    <ul className="small">
                                      {trade.sentimentSummary.split('\n').map((line, i) => {
                                        const clean = line.trim().replace(/^[-•\s]+/, '');
                                        return clean ? <li key={i}>• {clean}</li> : null;
                                      })}
                                    </ul>
                                  ) : 'N/A'}
                                </Accordion.Body>
                              </Accordion.Item>
                              <Accordion.Item eventKey="1">
                                <Accordion.Header>🏛️ Congressional Trade Activity</Accordion.Header>
                                <Accordion.Body>{renderCongressTrades(trade.congressTrades)}</Accordion.Body>
                              </Accordion.Item>
                            </Accordion>
                          </Accordion.Body>
                        </Accordion.Item>
                      </Accordion>
                    </td>
                  </tr>
                )}
              </React.Fragment>
            );
          })}
        </tbody>
      </Table>
    </div>
  );
};

export default TradeHistory;
