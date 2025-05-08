import React, { useState } from 'react';
import { analyzeTrade } from '../api/tradeApi'; // API call to backend
import { Form, Button, Container, Alert } from 'react-bootstrap';
import TypingDots from '../components/TypingDots'; // Animated "GPT is thinking..." indicator

/**
 * TradeForm Component
 * Allows users to input tickers, capital, and risk level to get GPT trade recommendations
 */
export default function TradeForm() {
  // 🧠 Local state for form inputs and result handling
  const [formData, setFormData] = useState({ tickers: '', capital: '', riskTolerance: 'medium' });
  const [result, setResult] = useState(null);     // GPT result
  const [loading, setLoading] = useState(false);  // Whether we're waiting on GPT

  // Handle form input changes (dynamic field name binding)
  const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);      // Show loading spinner
    setResult(null);       // Clear old result

    // Prepare payload for backend
    const payload = {
      tickers: formData.tickers.split(',').map(t => t.trim().toUpperCase()),
      capital: Number(formData.capital),
      riskTolerance: formData.riskTolerance
    };

    // 🔥 Call the API and update state with GPT result
    const data = await analyzeTrade(payload);
    setResult(data.analysis);
    setLoading(false);
  };

  return (
    <Container className="mt-4" style={{ maxWidth: '700px' }}>
      {/* 📋 Form for user inputs */}
      <Form onSubmit={handleSubmit}>
        <Form.Group>
          <Form.Label>Tickers</Form.Label>
          <Form.Control name="tickers" placeholder="e.g. SOFI, AAPL" onChange={handleChange} />
        </Form.Group>

        <Form.Group className="mt-2">
          <Form.Label>Capital ($)</Form.Label>
          <Form.Control name="capital" type="number" placeholder="200" onChange={handleChange} />
        </Form.Group>

        <Form.Group className="mt-2">
          <Form.Label>Risk Tolerance</Form.Label>
          <Form.Select name="riskTolerance" onChange={handleChange} defaultValue="medium">
            <option value="low">Low</option>
            <option value="medium">Medium</option>
            <option value="high">High</option>
          </Form.Select>
        </Form.Group>

        <Button className="mt-3" type="submit">Analyze</Button>
      </Form>

      {/* ✅ Output section: shows loader or GPT result */}
      <div className="mt-4" style={{ position: 'sticky', top: '1rem', zIndex: 10 }}>
        {loading && <TypingDots />}  {/* Animated loader */}
        {result && (
          <Alert variant="success">
            <Alert.Heading>GPT Trade Recommendation</Alert.Heading>
            <div style={{ whiteSpace: 'pre-wrap' }}>{result}</div> {/* Preserves line breaks */}
          </Alert>
        )}
      </div>
    </Container>
  );
}

