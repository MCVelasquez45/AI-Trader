// ✅ Full Updated TradeHistory.tsx — Fully Commented + Logged

import React, { useEffect, useState, useContext } from 'react';
import { Table, Accordion, Button } from 'react-bootstrap';
import { getAllTrades } from '../api/tradeApi';
import type { TradeRecord, OptionContract } from '../types/TradeHistory';
import { AuthContext } from '../contexts/AuthContext';

// ============================
// 🔗 Renders congressional trade data from MongoDB
// ============================
const renderCongressTrades = (congressData?: any) => {
  console.log('🧾 [CongressTrades] Input data:', congressData);
  console.log('🧾 [CongressTrades] Input data type:', typeof congressData);
  console.log('🧾 [CongressTrades] Is array:', Array.isArray(congressData));
  
  // Handle case where congressData is a string (legacy format)
  if (typeof congressData === 'string') {
    return renderSimpleCongressionalData(congressData);
  }
  
  // Handle case where congressData is an array of characters (broken JSON parsing)
  if (Array.isArray(congressData) && congressData.length > 0 && typeof congressData[0] === 'object' && congressData[0] !== null) {
    // Check if it's the broken character array format
    const firstItem = congressData[0];
    const hasNumericKeys = Object.keys(firstItem).some(key => !isNaN(Number(key)));
    
    if (hasNumericKeys) {
      console.log('🧾 [CongressTrades] Detected broken character array format, attempting to reconstruct...');
      
      // Reconstruct the string from character array
      const reconstructedString = congressData.map((charObj: any) => {
        const chars = Object.values(charObj).filter(val => typeof val === 'string');
        return chars.join('');
      }).join('');
      
      console.log('🧾 [CongressTrades] Reconstructed string:', reconstructedString);
      
      // Try to parse as JSON
      try {
        const parsedData = JSON.parse(reconstructedString);
        console.log('🧾 [CongressTrades] Successfully parsed JSON:', parsedData);
        console.log('🧾 [CongressTrades] Parsed data structure:', {
          isArray: Array.isArray(parsedData),
          length: Array.isArray(parsedData) ? parsedData.length : 'not array',
          firstItem: Array.isArray(parsedData) && parsedData.length > 0 ? parsedData[0] : 'no items'
        });
        
        if (Array.isArray(parsedData)) {
          return renderCongressTradesTable(parsedData);
        }
      } catch (error) {
        console.log('🧾 [CongressTrades] Failed to parse as JSON, displaying as raw string');
        return renderSimpleCongressionalData(reconstructedString);
      }
    }
  }
  
  // Handle case where congressData is not an array or is empty
  if (!congressData || !Array.isArray(congressData) || congressData.length === 0) {
    return (
      <div>
        <h6 className="mb-3">🏛️ Congressional Trade Activity</h6>
        <p className="text-muted">No congressional trade data available.</p>
      </div>
    );
  }

  // Handle normal array format
  return renderCongressTradesTable(congressData);
};

// ============================
// 📋 Simple congressional data renderer with basic HTML
// ============================
const renderSimpleCongressionalData = (congressString: string) => {
  const lines = congressString.split('\n').filter(line => line.trim());
  
  return (
    <div>
      <h6 className="mb-3">🏛️ Congressional Trade Activity</h6>
      <div className="bg-dark p-3 rounded">
        {lines.map((line, index) => {
          // Check if line contains a CapitolTrades link
          if (line.includes('capitoltrades.com')) {
            const url = line.replace('🔗', '').trim();
            return (
              <p key={index} className="mb-2">
                <a 
                  href={url} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-info"
                  style={{ color: '#00c6ff' }}
                >
                  {line}
                </a>
              </p>
            );
          }
          
          // Regular text line
          return (
            <p key={index} className="mb-2 text-light">
              {line}
            </p>
          );
        })}
      </div>
    </div>
  );
};

// ============================
// 🏛️ Renders the congressional trades table
// ============================
const renderCongressTradesTable = (congressData: any[]) => {
  return (
    <div>
      <h6 className="mb-3">🏛️ Congressional Trade Activity</h6>
      <div className="table-responsive">
        <table className="table table-dark table-striped table-hover">
          <thead>
            <tr>
              <th>👤 Representative</th>
              <th>🏛️ Party</th>
              <th>📅 Date</th>
              <th>💰 Amount</th>
              <th>📊 Type</th>
              <th>🔗 View Profile</th>
            </tr>
          </thead>
          <tbody>
            {congressData.map((trade, index) => {
              console.log(`🧾 [CongressTrades] Processing trade ${index + 1}:`, JSON.stringify(trade, null, 2));
              
              // Handle both new structure (politician) and legacy structure (representative)
              let politicianInfo, transactionType, amountRange, transactionDate, source;
              
              if (trade.politician) {
                // New structure: { politician, transactionDate, transactionType, amountRange, source }
                politicianInfo = trade.politician || '';
                transactionType = trade.transactionType || 'N/A';
                amountRange = trade.amountRange || 'N/A';
                transactionDate = trade.transactionDate ? new Date(trade.transactionDate).toLocaleDateString() : 'N/A';
                source = trade.source || '#';
              } else if (trade.representative) {
                // Legacy structure: { representative, type, amount, date, link }
                politicianInfo = trade.representative || '';
                transactionType = trade.type || 'N/A';
                amountRange = trade.amount || 'N/A';
                transactionDate = trade.date || 'N/A';
                source = trade.link || '#';
              } else {
                // Fallback for any other structure
                politicianInfo = trade.name || trade.politician || trade.representative || 'Unknown';
                transactionType = trade.transactionType || trade.type || 'N/A';
                amountRange = trade.amountRange || trade.amount || 'N/A';
                transactionDate = trade.transactionDate ? new Date(trade.transactionDate).toLocaleDateString() : (trade.date || 'N/A');
                source = trade.source || trade.link || '#';
              }
              
              // Extract name and party from politician info
              const [name, partyInfo] = politicianInfo.split('\n');
              const party = partyInfo ? partyInfo.replace(/(Republican|Democrat)(House|Senate)/, '$1 $2') : '';
              const isDemocrat = partyInfo?.includes('Democrat');
              const isRepublican = partyInfo?.includes('Republican');
              
              // Use the source from the data, fallback to generated URL
              const politicianUrl = source !== '#' ? source : (name ? `https://www.capitoltrades.com/politicians/${encodeURIComponent(name.toLowerCase().replace(/\s+/g, '-'))}` : '#');
              
              console.log(`🧾 [CongressTrades] Trade ${index + 1} parsed:`, {
                name,
                party,
                transactionDate,
                amount: amountRange,
                type: transactionType,
                link: source,
                politicianUrl
              });
              
              // Determine transaction type styling
              const isBuy = transactionType?.toLowerCase() === 'buy';
              
              return (
                <tr key={index}>
                  <td>
                    <span className="fw-bold text-primary">
                      {name || 'Unknown Representative'}
                    </span>
                  </td>
                  <td>
                    <span className={`badge ${isDemocrat ? 'bg-primary' : isRepublican ? 'bg-danger' : 'bg-secondary'}`}>
                      {party || 'Unknown'}
                    </span>
                  </td>
                  <td>{transactionDate}</td>
                  <td className="text-warning fw-bold">{amountRange}</td>
                  <td>
                    <span className={`badge ${isBuy ? 'bg-success' : 'bg-danger'}`}>
                      {isBuy ? '📈 BUY' : '📉 SELL'}
                    </span>
                  </td>
                  <td>
                    <a
                      href={politicianUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="btn btn-outline-info btn-sm"
                      title="View representative's trading history on CapitolTrades"
                    >
                      👤 View Profile
                    </a>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};

const TradeHistory: React.FC = () => {
  const [trades, setTrades] = useState<TradeRecord[]>([]);
  const [selected, setSelected] = useState<string | null>(null);
  const { guestId, user, authenticated } = useContext(AuthContext);

  // ============================
  // 🧹 Clear old localStorage guestId on mount
  // ============================
  useEffect(() => {
    const oldGuestId = localStorage.getItem('guestId');
    if (oldGuestId && oldGuestId !== 'anonymous') {
      console.log('🧹 Clearing old guestId from localStorage:', oldGuestId);
      localStorage.removeItem('guestId');
      console.log('🧹 localStorage cleared, will generate new anonymous guestId');
    }
  }, []);

  // ============================
  // 🚀 Load trade history on mount and when guestId changes
  // ============================
  useEffect(() => {
    const fetchTrades = async () => {
      try {
        console.log('📤 [TradeHistory] Fetching trades with guestId:', guestId);
        console.log('📤 [TradeHistory] User context:', { user, authenticated });
        
        // Log both the full response and check for userIdentifier warning in backend
        const data = await getAllTrades();
        console.log('📥 [TradeHistory] Raw response from getAllTrades:', data);
        console.log('📥 [TradeHistory] Response type:', typeof data);
        console.log('📥 [TradeHistory] Is array:', Array.isArray(data));
        
        if (!data) {
          console.warn('⚠️ [TradeHistory] No data returned from getAllTrades');
          setTrades([]);
          return;
        }
        
        if (!Array.isArray(data)) {
          console.error('❌ [TradeHistory] Expected array from getAllTrades, got:', typeof data);
          console.error('❌ [TradeHistory] Actual data:', data);
          setTrades([]);
          return;
        }
        
        console.log('📦 [TradeHistory] Received trades array length:', data.length);
        
        if (data.length === 0) {
          console.warn('⚠️ [TradeHistory] Empty trades array returned');
          setTrades([]);
          return;
        }
        
        // Log detailed information about each trade
        data.forEach((trade, index) => {
          console.log(`📦 [TradeHistory] Trade ${index + 1}:`);
          console.log(`  - ID: ${trade._id}`);
          console.log(`  - Tickers: ${trade.tickers?.join(', ') || 'Unknown'}`);
          console.log(`  - UserIdentifier: ${trade.userIdentifier}`);
          console.log(`  - CreatedAt: ${trade.createdAt}`);
          console.log(`  - Congress data:`, trade.congress);
          console.log(`  - Congress type:`, typeof trade.congress);
          console.log(`  - Congress length:`, Array.isArray(trade.congress) ? trade.congress.length : 'not array');
          console.log(`  - CongressTrades data:`, trade.congressTrades);
          console.log(`  - CongressTrades type:`, typeof trade.congressTrades);
          
          if (trade.congress && Array.isArray(trade.congress)) {
            console.log(`  - Congress items:`, trade.congress);
            trade.congress.forEach((item, itemIndex) => {
              console.log(`    Item ${itemIndex + 1}:`, item);
            });
          }
        });
        
        // Log first trade in detail
        if (data[0]) {
          console.log('📦 [TradeHistory] First trade detailed sample:', JSON.stringify(data[0], null, 2));
        }
        
        console.log('📦 [TradeHistory] Setting trades state with', data.length, 'trades');
        setTrades(data.reverse()); // Most recent first
        console.log('📦 [TradeHistory] Trades state updated successfully');
      } catch (err) {
        console.error('❌ [TradeHistory] Failed to fetch trades:', err);
        console.error('❌ [TradeHistory] Error details:', {
          message: err.message,
          stack: err.stack,
          name: err.name
        });
        setTrades([]);
      }
    };
    fetchTrades();
  }, [guestId, user, authenticated]);

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

  // Format date helper with fallback for option?.expiration_date or trade.expiryDate
  const formatDate = (date?: string | Date) =>
    date ? new Date(date).toLocaleDateString() : 'N/A';

  // ============================
  // 🧹 Manual localStorage clear function
  // ============================
  const clearLocalStorage = () => {
    localStorage.removeItem('guestId');
    console.log('🧹 Manual localStorage clear completed');
    window.location.reload();
  };

  return (
    <div className="p-4 bg-dark bg-opacity-75 rounded shadow border border-secondary text-light">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h4 className="fw-bold mb-0">📘 GPT Trade History</h4>
        <Button 
          variant="outline-warning" 
          size="sm" 
          onClick={clearLocalStorage}
          title="Clear localStorage and reload to fix data loading issues"
        >
          🔄 Clear Cache & Reload
        </Button>
      </div>

      {trades.length === 0 ? (
        <div className="text-center py-5">
          <h5 className="text-muted mb-3">📭 No trades found</h5>
          <p className="text-muted">
            Generate your first trade recommendation to see it here!
          </p>
          <Button 
            variant="outline-info" 
            onClick={clearLocalStorage}
            className="mt-3"
          >
            🔄 Try Clearing Cache
          </Button>
        </div>
      ) : (
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
            console.log(`🧾 Full trade object for ${trade.tickers.join(', ')}:`, JSON.stringify(trade, null, 2));
            console.log(`🧾 Option keys for ${trade.tickers.join(', ')}:`, trade.option ? Object.keys(trade.option) : 'No option');
            console.log(`🧾 Option type for ${trade.tickers.join(', ')}:`, typeof trade.option);

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
                    {(() => {
                      const expDate = trade.option?.expiration_date || trade.expiryDate;
                      console.log(`📅 Date for ${trade.tickers.join(', ')}:`, expDate, typeof expDate);
                      return formatDate(expDate);
                    })()}
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
                                <p><strong>📈 MACD Line:</strong> {formatNumber(trade.indicators?.macd?.macd)}</p>
                                <p><strong>📈 MACD Signal:</strong> {formatNumber(trade.indicators?.macd?.signal)}</p>
                                <p><strong>📈 MACD Histogram:</strong> {formatNumber(trade.indicators?.macd?.histogram)}</p>
                              </div>
 
                              {/* 🎟️ Option Contract Details */}
                              <div className="col-md-4 col-sm-6">
                                <p><strong>📈 Outcome:</strong> {trade.outcome ?? 'pending'}</p>
                                {trade.option && (
                                  <>
                                    <hr />
                                    <div className="row">
                                      <div className="col-md-6">
                                        <h6>🎟️ Option Contract Details</h6>
                                        <p><strong>📓 Contract:</strong> {trade.option.ticker || 'N/A'}</p>
                                        <p><strong>🎯 Strike:</strong> ${formatNumber(trade.option.strike_price)}</p>
                                        <p><strong>📅 Expires:</strong> {formatDate(trade.option.expiration_date)}</p>
                                        <p><strong>📊 Type:</strong> {trade.option.contract_type?.toUpperCase() || 'N/A'}</p>
                                      </div>
                                      <div className="col-md-6">
                                        <h6>💰 Pricing</h6>
                                        <p><strong>💰 Ask:</strong> {formatDollar(trade.option.ask)}</p>
                                        <p><strong>💰 Bid:</strong> {formatDollar(trade.option.bid)}</p>
                                        <p><strong>💰 Mid:</strong> {formatDollar(trade.option.ask && trade.option.bid ? ((trade.option.ask + trade.option.bid) / 2) : null)}</p>
                                      </div>
                                    </div>
                                    <div className="row mt-3">
                                      <div className="col-md-6">
                                        <h6>📊 Greeks</h6>
                                        <p><strong>📊 Delta:</strong> {formatNumber(trade.option.delta)}</p>
                                        <p><strong>📈 Gamma:</strong> {formatNumber(trade.option.gamma)}</p>
                                        <p><strong>📉 Theta:</strong> {formatNumber(trade.option.theta)}</p>
                                        <p><strong>📊 Vega:</strong> {formatNumber(trade.option.vega)}</p>
                                      </div>
                                      <div className="col-md-6">
                                        <h6>📈 Market Data</h6>
                                        <p><strong>📈 IV:</strong> {formatNumber(trade.option.implied_volatility)}</p>
                                        <p><strong>📊 OI:</strong> {formatNumber(trade.option.open_interest)}</p>
                                        <p><strong>💰 Cost:</strong> {formatDollar(trade.option?.estimatedCost)}</p>
                                        <p><strong>📊 Break Even:</strong> {formatDollar(trade.option?.strike_price ? (trade.option.contract_type === 'call' ? trade.option.strike_price + (trade.option.ask || 0) : trade.option.strike_price - (trade.option.ask || 0)) : null)}</p>
                                      </div>
                                    </div>
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
                                <Accordion.Body>
                                  {(() => {
                                    const congressData = trade.congress || trade.congressTrades;
                                    console.log('🧾 [TradeHistory] Rendering congress data for trade:', trade.tickers);
                                    console.log('🧾 [TradeHistory] Congress data:', congressData);
                                    return renderCongressTrades(congressData);
                                  })()}
                                </Accordion.Body>
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
      )}
    </div>
  );
};

export default TradeHistory;
