// ✅ Import React (needed to define components using JSX)
import React from 'react';

// ✅ Import the trade form component that handles user input and GPT requests
import TradeForm from '../components/TradeForm';

/**
 * Dashboard Component
 * This is the main page rendered by App.jsx
 * It shows a title and the TradeForm component
 */
export default function Dashboard() {
  return (
    <div>
      {/* Page title with emoji for branding */}
      <h2 className="text-center mt-3">
        <span role="img" aria-label="brain">🧠</span> AI Trade Analyzer
      </h2>

      {/* Form that handles ticker input, capital, risk, and GPT recommendation */}
      <TradeForm />
    </div>
  );
}
