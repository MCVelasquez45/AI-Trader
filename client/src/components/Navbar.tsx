// File: components/Navbar.tsx
import React from 'react';
import { Link, useLocation } from 'react-router-dom';

const Navbar: React.FC = () => {
  const location = useLocation();

  return (
    <header className="py-4 border-bottom" style={{ backgroundColor: 'transparent' }}>
      <div className="container d-flex justify-content-between align-items-center">
        <h1
          className="fs-3 fw-bold"
          style={{
            backgroundImage: 'linear-gradient(to right, #0ea5e9, #a855f7)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent'
          }}
        >
          AI Options Trading Assistant
        </h1>

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
          <Link to="#" className="mx-2 text-decoration-none text-light">
            Settings
          </Link>
        </nav>
      </div>
    </header>
  );
};

export default Navbar;
