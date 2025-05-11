import React, { useState } from 'react';
import { analyzeTrade } from '../api/tradeApi';
import { Form, Button, Alert } from 'react-bootstrap';
import TypingDots from './TypingDots';

export default function TradeForm() {
  const [formData, setFormData] = useState({
    tickers: '',
    capital: '',
    riskTolerance: 'medium'
  });
  const [result, setResult] = useState(null);
  const [prices, setPrices] = useState([]);
  const [errors, setErrors] = useState([]);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const tickers = formData.tickers
      .split(',')
      .map(t => t.trim().toUpperCase())
      .filter(t => t);

    if (!tickers.length) {
      setErrors([{ error: 'Please enter at least one valid ticker' }]);
      return;
    }

    if (!formData.capital || isNaN(formData.capital)) {
      setErrors([{ error: 'Please enter valid capital amount' }]);
      return;
    }

    setLoading(true);
    try {
      const { analysis, prices, errors } = await analyzeTrade({
        tickers,
        capital: Number(formData.capital),
        riskTolerance: formData.riskTolerance
      });
      
      setResult(analysis);
      setPrices(prices || []);
      setErrors(errors || []);
      
    } catch (error) {
      setErrors([{ error: error.message || 'Analysis failed' }]);
    }
    setLoading(false);
  };

  return (
    <div className="p-4">
      <Form onSubmit={handleSubmit}>
        <Form.Group className="mb-3">
          <Form.Label>Tickers (comma-separated)</Form.Label>
          <Form.Control
            name="tickers"
            placeholder="SOFI, AAPL, TSLA"
            onChange={(e) => setFormData({...formData, tickers: e.target.value})}
          />
        </Form.Group>

        <Form.Group className="mb-3">
          <Form.Label>Capital ($)</Form.Label>
          <Form.Control
            name="capital"
            type="number"
            min="100"
            step="50"
            onChange={(e) => setFormData({...formData, capital: e.target.value})}
          />
        </Form.Group>

        <Form.Group className="mb-3">
          <Form.Label>Risk Tolerance</Form.Label>
          <Form.Select 
            name="riskTolerance"
            value={formData.riskTolerance}
            onChange={(e) => setFormData({...formData, riskTolerance: e.target.value})}
          >
            <option value="low">Low</option>
            <option value="medium">Medium</option>
            <option value="high">High</option>
          </Form.Select>
        </Form.Group>

        <Button variant="primary" type="submit" disabled={loading}>
          {loading ? 'Analyzing...' : 'Analyze Trade'}
        </Button>
      </Form>

      {loading && <TypingDots />}

      {errors.length > 0 && (
        <Alert variant="danger" className="mt-3">
          {errors.map((e, idx) => (
            <div key={idx}>{e.error}</div>
          ))}
        </Alert>
      )}

      {prices.length > 0 && (
        <div className="mt-3">
          <h5>Market Data</h5>
          {prices.map((p, idx) => (
            <div key={idx} className="mb-2">
              <strong>{p.ticker}:</strong> ${p.price?.toFixed(2)}<br />
              RSI: {p.rsi?.toFixed(2) || '—'}, 
              VWAP: {p.vwap?.toFixed(2) || '—'}, 
              MACD: {p.macd?.histogram?.toFixed(2) || '—'}
            </div>
          ))}
        </div>
      )}

      {result && (
        <Alert variant="success" className="mt-3">
          <Alert.Heading>Trade Recommendation</Alert.Heading>
          <pre style={{ whiteSpace: 'pre-wrap' }}>{result}</pre>
        </Alert>
      )}
    </div>
  );
}