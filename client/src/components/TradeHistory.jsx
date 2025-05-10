import React, { useEffect, useState } from 'react';
import { getAllTrades } from '../api/tradeApi';
import { Container, Table, Badge, Spinner } from 'react-bootstrap';

export default function TradeHistory() {
  const [trades, setTrades] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchTrades() {
      const data = await getAllTrades();
      setTrades(data);
      setLoading(false);
    }
    fetchTrades();
  }, []);

  const formatDate = (dateStr) => new Date(dateStr).toLocaleDateString();

  const outcomeBadge = (outcome) => {
    const variant = outcome === 'win' ? 'success' : outcome === 'loss' ? 'danger' : 'secondary';
    return <Badge bg={variant}>{outcome.toUpperCase()}</Badge>;
  };

  return (
    <Container className="mt-5">
      <h3 className="mb-4">
        <span role="img" aria-label="chart">📊</span> Trade History
      </h3>
      {loading ? (
        <Spinner animation="border" variant="primary" />
      ) : (
        <Table striped bordered hover responsive>
          <thead>
            <tr>
              <th>Ticker(s)</th>
              <th>Capital</th>
              <th>Entry</th>
              <th>Exit</th>
              <th>Direction</th>
              <th>Outcome</th>
              <th>Expiry</th>
            </tr>
          </thead>
          <tbody>
            {trades.map((trade, idx) => (
              <tr key={idx}>
                <td>{trade.tickers.join(', ')}</td>
                <td>${trade.capital}</td>
                <td>${trade.entryPrice ?? '—'}</td>
                <td>
                  {trade.exitPrices
                    ? trade.tickers.map(ticker => (
                        <div key={ticker}>
                          <strong>{ticker}:</strong> ${trade.exitPrices[ticker]?.toFixed(2) ?? '—'}
                        </div>
                      ))
                    : '—'}
                </td>
                <td>{trade.recommendationDirection ?? '—'}</td>
                <td>{outcomeBadge(trade.outcome)}</td>
                <td>{trade.expiryDate ? formatDate(trade.expiryDate) : '—'}</td>
              </tr>
            ))}
          </tbody>
        </Table>
      )}
    </Container>
  );
}
