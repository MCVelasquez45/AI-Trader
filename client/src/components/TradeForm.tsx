import React, { useState } from 'react';
import { Card, Form, Button, InputGroup, ListGroup } from 'react-bootstrap';
import { TradeFormProps, RiskLevel } from '../types/TradeForm';

/**
 * TradeForm Component
 * Collects user input for tickers, capital, and risk tolerance.
 */
const TradeForm: React.FC<TradeFormProps> = ({ onAnalyze }) => {
  const [tickers, setTickers] = useState<string[]>([]);
  const [input, setInput] = useState<string>('');
  const [capital, setCapital] = useState<number>(1000);
  const [risk, setRisk] = useState<'low' | 'medium' | 'high'>('medium');

  // Adds ticker symbols from input to the list and triggers analysis
  const addTicker = () => {
    const cleanTickers = input
      .toUpperCase()
      .split(/[,\s]+/)
      .map(t => t.trim())
      .filter(t => t && !tickers.includes(t));

    if (cleanTickers.length > 0) {
      const updated = [...tickers, ...cleanTickers];
      setTickers(updated);

      // ✅ Send as 'watchlist' array to backend
      onAnalyze(updated, capital, risk);
    }

    setInput('');
  };

  // Allows pressing Enter to trigger the addTicker function
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      addTicker();
    }
  };

  return (
    <Card className="m-3">
      <Card.Header>
        <span role="img" aria-label="clipboard">📋</span> Trade Setup
      </Card.Header>
      <Card.Body>
        <Form>
          {/* Ticker input */}
          <Form.Group className="mb-3">
            <Form.Label>Ticker Symbol(s)</Form.Label>
            <InputGroup>
              <Form.Control
                placeholder="e.g. AAPL TSLA META"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
              />
              <Button onClick={addTicker}>Add</Button>
            </InputGroup>
            <Form.Text className="text-muted">
              Separate multiple tickers with commas or spaces
            </Form.Text>
          </Form.Group>

          {/* Capital input */}
          <Form.Group className="mb-3">
            <Form.Label>Capital ($)</Form.Label>
            <Form.Control
              type="number"
              value={capital}
              onChange={(e) => setCapital(Number(e.target.value))}
            />
          </Form.Group>

          {/* Risk tolerance dropdown */}
          <Form.Group className="mb-3">
            <Form.Label>Risk Tolerance</Form.Label>
            <Form.Select value={risk} onChange={(e) => setRisk(e.target.value as RiskLevel)}>
              <option value="low">Low</option>
              <option value="medium">Medium</option>
              <option value="high">High</option>
            </Form.Select>
          </Form.Group>

          {/* Display added tickers */}
          {tickers.length > 0 && (
            <>
              <hr />
              <h6>
                <span role="img" aria-label="brain">🧠</span> Active Tickers
              </h6>
              <ListGroup>
                {tickers.map((t) => (
                  <ListGroup.Item key={t}>{t}</ListGroup.Item>
                ))}
              </ListGroup>
            </>
          )}
        </Form>
      </Card.Body>
    </Card>
  );
};

export default TradeForm;
