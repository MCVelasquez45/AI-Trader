// ✅ File: components/Navbar.tsx

// 📦 React + Router + Auth Context
import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Button } from 'react-bootstrap';
import { useAuth } from '../contexts/AuthContext'; // ✅ Custom hook replaces useContext()

// ✅ Props: handles modal visibility toggle
interface NavbarProps {
  setShowAuthModal: (show: boolean) => void;
}

const Navbar: React.FC<NavbarProps> = ({ setShowAuthModal }) => {
  const location = useLocation(); // 🧭 Detect active page
  const { user, authenticated, logout } = useAuth(); // 🔐 Grab auth state from context

  // 🧪 Debug logs on component render
  console.log('🧭 [Navbar] Current path:', location.pathname);
  console.log('👤 [Navbar] Authenticated:', authenticated);
  console.log('👤 [Navbar] User:', user);

  return (
    <header className="py-4 border-bottom" style={{ backgroundColor: 'transparent' }}>
      <div className="container d-flex justify-content-between align-items-center">
        
        {/* 🌈 Logo / Brand Title */}
        <h1
          className="fs-3 fw-bold"
          style={{
            backgroundImage: 'linear-gradient(to right, #0ea5e9, #a855f7)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
          }}
        >
          AI Options Trading Assistant
        </h1>

        {/* 🧭 Navigation Links */}
        <nav className="d-none d-md-block">
          <Link
            to="/dashboard"
            className={`mx-2 text-decoration-none ${
              location.pathname === '/dashboard' ? 'text-warning' : 'text-light'
            }`}
          >
            Dashboard
          </Link>

          <Link
            to="/market"
            className={`mx-2 text-decoration-none ${
              location.pathname === '/market' ? 'text-warning' : 'text-light'
            }`}
          >
            Market Data
          </Link>

          <Link
            to="#"
            className="mx-2 text-decoration-none text-light"
          >
            Settings
          </Link>

          {/* 🔐 Auth Controls: Show user or sign-in modal trigger */}
          {authenticated ? (
            <span className="mx-2 text-light">
              👋 {user?.name?.split(' ')[0]} |{' '}
              <button
                onClick={() => {
                  console.log('👋 [Navbar] User clicked Sign Out');
                  logout();
                }}
                className="btn btn-link text-light p-0 ps-2"
              >
                Sign Out
              </button>
            </span>
          ) : (
            <Button
              variant="link"
              className="mx-2 text-light text-decoration-none"
              onClick={() => {
                console.log('🔐 [Navbar] User clicked Sign In / Join');
                setShowAuthModal(true);
              }}
            >
              Sign In / Join
            </Button>
          )}
        </nav>
      </div>
    </header>
  );
};

export default Navbar;