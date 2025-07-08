// ✅ File: App.tsx

import React from 'react';
import Dashboard from './pages/Dashboard';
import { ContractProvider } from './contexts/ContractContext'; // 👈 Scoped context for Dashboard only
import 'bootstrap/dist/css/bootstrap.min.css';
import './styles/theme.css';

/**
 * App — Entry point of the React application
 * We wrap only <Dashboard /> in <ContractProvider> so context is scoped.
 * This avoids unnecessary state access for other pages like Profile, Settings, etc.
 */
const App = () => {
  console.log('🚀 <App> initialized — loading <Dashboard> inside <ContractProvider>');
  return (
    <ContractProvider>
      <Dashboard />
    </ContractProvider>
  );
};

export default App;
