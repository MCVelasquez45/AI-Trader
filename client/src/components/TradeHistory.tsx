// import React, { useEffect, useState } from 'react';

// import { getAllTrades } from '../api/tradeApi';

// // ✅ Define TypeScript interface for trade structure
// interface Trade {
//   tickers: string[];
//   capital: number;
//   confidence: string;
//   recommendationDirection: string;
//   expiryDate: string;
//   gptResponse: string;
//   sentimentSummary?: string;
//   congressTrades?: string;
//   entryPrice?: number;
//   targetPrice?: number;
//   stopLoss?: number;
//   outcome?: string;
//   indicators?: {
//     rsi?: number;
//     vwap?: number;
//     macd?: {
//       histogram?: number;
//     };
//   };
//   option?: {
//     strike_price: number;
//     expiration_date: string;
//     contract?: string;
//     estimatedCost?: number;
//   };
//   _id?: string;
// }

// // ✅ Helper to render formatted congressional trades with working 🔗 links
// const renderCongressTrades = (text?: string) => {
//   if (!text) return 'N/A';
//   console.log("📜 Rendering Congress Trade Data:\n", text); // Debug print

//   return (
//     <div style={{ whiteSpace: 'pre-wrap' }}>
//       {text.split('\n').map((line, index) => {
//         const url = line.replace(/^🔗 |^Link: /, '').trim();
//         if (line.startsWith('🔗 ') || line.startsWith('Link: ')) {
//           console.log("🔗 Link found:", url);
//           return (
//             <div key={index}>
//               🔗 <a href={url} target="_blank" rel="noopener noreferrer">{url}</a>
//             </div>
//           );
//         } else {
//           return <div key={index}>{line}</div>;
//         }
//       })}
//     </div>
//   );
// };

// const TradeHistory: React.FC = () => {
//   const [trades, setTrades] = useState<Trade[]>([]);
//   const [selected, setSelected] = useState<string | null>(null);

//   useEffect(() => {
//     const fetchTrades = async () => {
//       console.log("📥 Fetching trade history...");
//       const data = await getAllTrades();
//       console.log("✅ Trade data received:", data);
//       setTrades(data.reverse());
//     };
//     fetchTrades();
//   }, []);

//   // ✅ Format helpers
//   const formatDollar = (value?: number) => (value !== undefined && value !== null ? `$${value.toFixed(2)}` : 'N/A');
//   const formatNumber = (value?: number) => (value !== undefined && value !== null ? value.toFixed(2) : 'N/A');
//   const fallbackTarget = (entry?: number) => entry ? `$${(entry * 1.05).toFixed(2)} (est.)` : 'N/A';
//   const fallbackStop = (entry?: number) => entry ? `$${(entry * 0.95).toFixed(2)} (est.)` : 'N/A';

//   return (
//     <div className="p-4">
//       <h5>📘 GPT Trade History</h5>
//       <Table striped bordered hover responsive>
//         <thead>
//           <tr>
//             <th>Ticker</th>
//             <th>Capital</th>
//             <th>Direction</th>
//             <th>Confidence</th>
//             <th>Entry Price</th>
//             <th>Expires</th>
//             <th>Outcome</th>
//             <th>Action</th>
//           </tr>
//         </thead>
//         <tbody>
//           {trades.map((trade) => {
//             const key = trade._id || trade.tickers.join('-');
//             return (
//               <React.Fragment key={key}>
//                 <tr>
//                   <td>{trade.tickers.join(', ')}</td>
//                   <td>${trade.capital}</td>
//                   <td>{trade.recommendationDirection.toUpperCase()}</td>
//                   <td>{trade.confidence}</td>
//                   <td>{formatDollar(trade.entryPrice)}</td>
//                   <td>{new Date(trade.expiryDate).toLocaleDateString()}</td>
//                   <td>{trade.outcome ?? 'pending'}</td>
//                   <td>
//                     <Button
//                       variant="outline-primary"
//                       size="sm"
//                       onClick={() => {
//                         console.log("📌 Toggled trade details for:", key);
//                         setSelected(selected === key ? null : key);
//                       }}
//                     >
//                       {selected === key ? 'Hide' : 'View'}
//                     </Button>
//                   </td>
//                 </tr>

//                 {selected === key && (
//                   <tr>
//                     <td colSpan={8}>
//                       <Accordion defaultActiveKey="0">
//                         <Accordion.Item eventKey="0">
//                           <Accordion.Header>🧠 GPT Details for {trade.tickers.join(', ')}</Accordion.Header>
//                           <Accordion.Body>
//                             <p><strong>📣 Recommendation:</strong> {trade.recommendationDirection?.toUpperCase() || 'N/A'}</p>
//                             <p><strong>💪 Confidence:</strong> {trade.confidence || 'N/A'}</p>
//                             <p><strong>📅 Expiration Date:</strong> {new Date(trade.expiryDate).toLocaleDateString()}</p>
//                             <p><strong>📍 Entry Price:</strong> {formatDollar(trade.entryPrice)}</p>
//                             <p><strong>🎯 Target Price:</strong> {trade.targetPrice !== undefined ? formatDollar(trade.targetPrice) : fallbackTarget(trade.entryPrice)}</p>
//                             <p><strong>🛑 Stop Loss:</strong> {trade.stopLoss !== undefined ? formatDollar(trade.stopLoss) : fallbackStop(trade.entryPrice)}</p>
//                             <p><strong>📊 RSI:</strong> {formatNumber(trade.indicators?.rsi)}</p>
//                             <p><strong>📉 VWAP:</strong> {formatNumber(trade.indicators?.vwap)}</p>
//                             <p><strong>📊 MACD Histogram:</strong> {formatNumber(trade.indicators?.macd?.histogram)}</p>
//                             <p><strong>📈 Outcome:</strong> {trade.outcome ?? 'pending'}</p>
//                             <hr />
//                             <p><strong>🧠 GPT Explanation:</strong><br />{trade.gptResponse}</p>
//                             <hr />
//                             <Accordion>
//                               <Accordion.Item eventKey="0">
//                                 <Accordion.Header>🗞️ News Sentiment</Accordion.Header>
//                                 <Accordion.Body>
//                                   {trade.sentimentSummary || 'N/A'}
//                                 </Accordion.Body>
//                               </Accordion.Item>
//                               <Accordion.Item eventKey="1">
//                                 <Accordion.Header>🏛️ Congressional Trade Activity</Accordion.Header>
//                                 <Accordion.Body>
//                                   {renderCongressTrades(trade.congressTrades)}
//                                 </Accordion.Body>
//                               </Accordion.Item>
//                             </Accordion>
//                             {trade.option && (
//                               <>
//                                 <hr />
//                                 <p><strong>🎟️ Option:</strong> Strike ${trade.option.strike_price}, Expires {new Date(trade.option.expiration_date).toLocaleDateString()}</p>
//                                 {trade.option.contract && <p><strong>🧾 Contract:</strong> {trade.option.contract}</p>}
//                                 {trade.option.estimatedCost && <p><strong>💰 Estimated Cost:</strong> ${trade.option.estimatedCost}</p>}
//                               </>
//                             )}
//                           </Accordion.Body>
//                         </Accordion.Item>
//                       </Accordion>
//                     </td>
//                   </tr>
//                 )}
//               </React.Fragment>
//             );
//           })}
//         </tbody>
//       </Table>
//     </div>
//   );
// };

// export default TradeHistory;
