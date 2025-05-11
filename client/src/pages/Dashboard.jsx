// ✅ Import React (needed to define components using JSX)
import React, { useState } from 'react';

// ✅ Import the trade form component that handles user input and GPT requests
import TradeForm from '../components/TradeForm';
import TradeHistory from '../components/TradeHistory';
import { Button, Container } from 'react-bootstrap';

/**
 * Dashboard Component
 * This is the main page rendered by App.jsx
 * It toggles between TradeForm and TradeHistory
 */
export default function Dashboard() {
  const [showHistory, setShowHistory] = useState(false);

  return (
    <Container className="mt-4">
      {/* Page title with emoji for branding */}
      {/* eslint-disable-next-line jsx-a11y/accessible-emoji */}
      <h2 className="text-center mb-3">
        <span role="img" aria-label="brain">🧠</span> AI Trade Analyzer
      </h2>

      {/* Toggle button */}
      <div className="text-center mb-4">
        <Button variant="primary" onClick={() => setShowHistory(!showHistory)}>
          {showHistory ? '🔍 Back to Trade Analyzer' : '📊 View Trade History'}
        </Button>
      </div>

      {/* Conditional rendering of views */}
      {showHistory ? <TradeHistory /> : <TradeForm />}
    </Container>
  );
}
