// ✅ Import your main page component
import Dashboard from './pages/Dashboard';

// ✅ Import Bootstrap styles globally
import 'bootstrap/dist/css/bootstrap.min.css';

// ✅ Import React (required when using JSX syntax)
import React from 'react';

/**
 * Main entry point of your React app
 * Currently renders only the Dashboard component
 */
function App() {
  return <Dashboard />;
}

// ✅ Export App so it can be rendered in index.js
export default App;
