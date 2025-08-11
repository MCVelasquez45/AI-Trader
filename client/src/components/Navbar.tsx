// ✅ File: components/Navbar.tsx

// 📦 React + Router + Auth Context
import React, { useCallback, useMemo } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Button } from 'react-bootstrap';
import { useAuth } from '../contexts/AuthContext';

interface NavbarProps {
  setShowAuthModal: (show: boolean) => void;
}

const Navbar: React.FC<NavbarProps> = React.memo(({ setShowAuthModal }) => {
  const location = useLocation();
  const { user, authenticated, logout } = useAuth();

  console.log('🧭 [Navbar] Current path:', location.pathname);
  console.log('👤 [Navbar] Authenticated:', authenticated);
  console.log('👤 [Navbar] User:', user);

  // 🔄 Memoized event handlers to prevent unnecessary re-renders
  const handleLogout = useCallback(() => {
    console.log('👋 [Navbar] User clicked Sign Out');
    logout();
  }, [logout]);

  const handleSignInClick = useCallback(() => {
    console.log('🔐 [Navbar] User clicked Sign In / Join');
    setShowAuthModal(true);
  }, [setShowAuthModal]);

  // 🎨 Memoized computed values
  const isDashboardActive = useMemo(() => location.pathname === '/dashboard', [location.pathname]);
  const isMarketActive = useMemo(() => location.pathname === '/market', [location.pathname]);
  const userFirstName = useMemo(() => user?.name?.split(' ')[0] || 'User', [user?.name]);

  return (
    <header className="py-3 border-bottom" style={{ backgroundColor: 'transparent' }}>
      <div className="container">
        <nav className="navbar navbar-expand-md p-0">
          <Link to="/" className="navbar-brand fs-4 fw-bold text-gradient">
            AI Options Trading
          </Link>
          <button
            className="navbar-toggler bg-dark border border-light"
            type="button"
            data-bs-toggle="collapse"
            data-bs-target="#mainNavbar"
            aria-controls="mainNavbar"
            aria-expanded="false"
            aria-label="Toggle navigation"
          >
            <span className="navbar-toggler-icon" style={{ filter: 'invert(1)' }}></span>
          </button>
          <div className="collapse navbar-collapse" id="mainNavbar">
            <ul className="navbar-nav me-auto">
              <li className="nav-item">
                <Link
                  to="/dashboard"
                  className={`nav-link ${isDashboardActive ? 'text-warning' : 'text-light'}`}
                >
                  Dashboard
                </Link>
              </li>
              <li className="nav-item">
                <Link
                  to="/market"
                  className={`nav-link ${isMarketActive ? 'text-warning' : 'text-light'}`}
                >
                  Market Data
                </Link>
              </li>
              <li className="nav-item">
                <Link to="/settings" className="nav-link text-light">
                  Settings
                </Link>
              </li>
            </ul>
            <div className="d-flex align-items-center">
              {authenticated ? (
                <span className="nav-item text-light">
                  👋 {userFirstName}
                  <button
                    onClick={handleLogout}
                    className="btn btn-link text-light p-0 ps-2"
                  >
                    Sign Out
                  </button>
                </span>
              ) : (
                <Button
                  variant="link"
                  className="nav-item text-light text-decoration-none"
                  onClick={handleSignInClick}
                >
                  Sign In / Join
                </Button>
              )}
            </div>
          </div>
        </nav>
      </div>
    </header>
  );
});

Navbar.displayName = 'Navbar';

export default Navbar;