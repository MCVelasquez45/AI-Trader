// ✅ File: App.tsx

import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { ContractProvider } from './contexts/ContractContext';

import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap/dist/js/bootstrap.bundle.min'; // Required for tooltips/popovers
import './styles/theme.css';

import Navbar from './components/Navbar';
import Dashboard from './pages/Dashboard';
import MarketPage from './pages/MarketPage';

const App = () => {
useEffect(() => {
  const tooltipTriggerList = Array.from(document.querySelectorAll('[data-bs-toggle="tooltip"]'));
  tooltipTriggerList.forEach((el) => {
    (window as any).bootstrap.Tooltip && new (window as any).bootstrap.Tooltip(el);
  });
}, []);


  console.log('🚀 <App> initialized — with routing and <Navbar>');

  return (
    <Router>
      <ContractProvider>
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/market" element={<MarketPage />} />
        </Routes>
      </ContractProvider>
    </Router>
  );
};

export default App;
