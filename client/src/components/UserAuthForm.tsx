// ✅ File: client/src/components/UserAuthForm.tsx

import React, { useState } from 'react';
import axios from 'axios';
import { AuthCredentials, AuthResponse } from '../types/Auth';

interface UserAuthFormProps {
  mode: 'signin' | 'join';
  onSuccess: (user: AuthResponse['user']) => void;
}

const UserAuthForm: React.FC<UserAuthFormProps> = ({ mode, onSuccess }) => {
  // 🔐 Default credentials (demo account)
  const defaultEmail = 'MarkCodes@gmail.com';
  const defaultPassword = 'password123';

  // 🔐 Prefill the form inputs with defaults
  const [email, setEmail] = useState(defaultEmail);
  const [password, setPassword] = useState(defaultPassword);

  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg('');

    const endpoint = mode === 'signin' ? '/auth/login' : '/auth/signup';
    const credentials: AuthCredentials = { email, password };
    console.log(`📤 Submitting to ${endpoint} with email: ${email}`);

    try {
      const res = await axios.post<AuthResponse>(endpoint, credentials, {
        withCredentials: true,
      });

      if (res.data.success && res.data.user) {
        console.log('✅ Auth successful:', res.data.user);
        onSuccess(res.data.user);
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

      {errorMsg && (
        <div className="alert alert-danger text-center">
          {errorMsg}
        </div>
      )}

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