// ✅ File: client/components/UserAuthForm.tsx

import React, { useState } from 'react';
import axios from 'axios';
import { AuthCredentials, AuthResponse } from '../types/Auth';

// ✅ Props for determining mode (sign in or join) and success callback
interface UserAuthFormProps {
  mode: 'signin' | 'join';                      // 🔁 Determines POST /auth/login or /auth/signup
  onSuccess: (user: AuthResponse['user']) => void; // ✅ Callback if login/signup successful
}

// ✅ Auth Form Component
const UserAuthForm: React.FC<UserAuthFormProps> = ({ mode, onSuccess }) => {
  // 🔐 Form input state
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  
  // ⚙️ Status state
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  // 🔁 Handle form submit
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg('');

    const endpoint = mode === 'signin' ? '/auth/login' : '/auth/signup';
    const credentials: AuthCredentials = { email, password };

    console.log(`📤 Submitting to ${endpoint} with email: ${email}`);

    try {
      const res = await axios.post<AuthResponse>(endpoint, credentials, {
        withCredentials: true, // ✅ Allows cookie/session handling
      });

      if (res.data.success && res.data.user) {
        console.log('✅ Auth successful:', res.data.user);
        onSuccess(res.data.user); // 🚀 Trigger success callback to close modal or store user
      } else {
        console.warn('⚠️ Auth failed:', res.data.message);
        setErrorMsg(res.data.message || 'Something went wrong. Try again.');
      }
    } catch (err: any) {
      console.error('⛔ Server error during auth:', err);
      setErrorMsg(err.response?.data?.message || 'Server error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      {/* 📧 Email Input */}
      <div className="mb-3">
        <label htmlFor="email" className="form-label">📧 Email address</label>
        <input
          type="email"
          className="form-control"
          id="email"
          required
          value={email}
          onChange={e => setEmail(e.target.value)}
        />
      </div>

      {/* 🔑 Password Input */}
      <div className="mb-3">
        <label htmlFor="password" className="form-label">🔑 Password</label>
        <input
          type="password"
          className="form-control"
          id="password"
          required
          value={password}
          onChange={e => setPassword(e.target.value)}
        />
      </div>

      {/* ❌ Error Message Display */}
      {errorMsg && (
        <div className="alert alert-danger text-center">
          {errorMsg}
        </div>
      )}

      {/* 🟢 Submit Button */}
      <button
        type="submit"
        className="btn btn-success w-100"
        disabled={loading}
      >
        {loading
          ? '⏳ Please wait...'
          : mode === 'signin'
          ? '🔓 Sign In'
          : '🆕 Join'}
      </button>
    </form>
  );
};

export default UserAuthForm;