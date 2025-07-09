// ✅ File: App.tsx

import React, { useEffect } from 'react';
import Dashboard from './pages/Dashboard';
import { ContractProvider } from './contexts/ContractContext'; // 👈 Scoped context for Dashboard only
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap/dist/js/bootstrap.bundle.min'; // 👈 Required for tooltips/popovers
import './styles/theme.css';

const App = () => {
  useEffect(() => {
    // ✅ Initialize all tooltips on page
    const tooltipTriggerList = Array.from(document.querySelectorAll('[data-bs-toggle="tooltip"]'));
    tooltipTriggerList.forEach((el) => {
      new window.bootstrap.Tooltip(el);
    });
  }, []);

  console.log('🚀 <App> initialized — loading <Dashboard> inside <ContractProvider>');

  return (
    <ContractProvider>
      <Dashboard />
    </ContractProvider>
  );
};

export default App;
