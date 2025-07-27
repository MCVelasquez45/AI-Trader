// ✅ File: App.tsx
import React, { useEffect, useState } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { ContractProvider } from './contexts/ContractContext';
import { AuthProvider } from './contexts/AuthContext';

import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap/dist/js/bootstrap.bundle.min';
import './styles/theme.css';

import UserAuthModal from './components/UserAuthModal';
import Dashboard from './pages/Dashboard';
import MarketPage from './pages/MarketPage';

const App = () => {
  const [showAuthModal, setShowAuthModal] = useState(false);

  useEffect(() => {
    const tooltipTriggerList = Array.from(document.querySelectorAll('[data-bs-toggle="tooltip"]'));
    tooltipTriggerList.forEach((el) => {
      (window as any).bootstrap?.Tooltip && new (window as any).bootstrap.Tooltip(el);
    });
  }, []);

  console.log('🚀 <App> initialized — with routing and <Navbar>');

  return (
    <Router>
      <AuthProvider>
        <ContractProvider>
          {/* ✅ Global Modal */}
          <UserAuthModal show={showAuthModal} onClose={() => setShowAuthModal(false)} />

          {/* ✅ Routes pass modal toggle function */}
          <Routes>
            <Route path="/" element={<Dashboard setShowAuthModal={setShowAuthModal} />} />
            <Route path="/dashboard" element={<Dashboard setShowAuthModal={setShowAuthModal} />} />
            <Route path="/market" element={<MarketPage setShowAuthModal={setShowAuthModal} />} />
          </Routes>
        </ContractProvider>
      </AuthProvider>
    </Router>
  );
};

export default App;