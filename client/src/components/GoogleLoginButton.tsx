// ✅ src/components/UserAuth/GoogleLoginButton.tsx

import React from 'react';
import { Button } from 'react-bootstrap';
import { FaGoogle } from 'react-icons/fa';

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
      <Button
        variant="outline-dark"
        size="lg"
        onClick={handleGoogleLogin}
        className="d-flex align-items-center justify-content-center"
      >
        <FaGoogle className="me-2" />
        Sign in with Google
      </Button>
    </div>
  );
};

export default GoogleLoginButton;