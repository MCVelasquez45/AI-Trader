// ✅ src/components/UserAuth/GoogleLoginButton.tsx

import React from 'react';

/**
 * 🔐 Redirects the user to the Google OAuth flow.
 * Uses VITE_BACKEND_URL from environment for the backend URL.
 * Falls back to empty string if not defined, avoiding "undefined" in URL.
 */
const handleGoogleLogin = () => {
  const backendUrl = import.meta.env.VITE_BACKEND_URL ?? '';
  console.log('🔐 [GoogleLogin] Redirecting to Google OAuth at:', `${backendUrl}/api/auth/google`);
  window.location.href = `${backendUrl}/api/auth/google`;
};

/**
 * 🧠 Google Login Button Component
 * Styled to look familiar and trustworthy
 */
const GoogleLoginButton: React.FC = () => {
  return (
    <div className="d-grid gap-2">
      <a
        onClick={handleGoogleLogin}
        style={{
          textDecoration: 'none',
          display: 'inline-flex',
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: '#f8f9fa', // slightly off-white for contrast
          color: '#3c4043',
          border: '1px solid #dadce0',
          borderRadius: '4px',
          fontSize: '14px',
          fontWeight: 500,
          height: '40px',
          padding: '0 24px',
          boxShadow: '0px 1px 2px rgba(0,0,0,0.1)',
          cursor: 'pointer',
          transition: 'background-color 0.2s ease'
        }}
        onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#e8eaed')}
        onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = '#f8f9fa')}
        role="button"
      >
        <img
          src="https://developers.google.com/identity/images/g-logo.png"
          alt="Google logo"
          style={{ width: '18px', height: '18px', marginRight: '12px' }}
        />
        Sign in with Google
      </a>
    </div>
  );
};

export default GoogleLoginButton;