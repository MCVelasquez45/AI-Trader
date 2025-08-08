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
  const [name, setName] = useState('');
  const [bio, setBio] = useState('');
  const [avatarFile, setAvatarFile] = useState<File | null>(null);

  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg('');

    const endpoint = mode === 'signin' ? '/api/auth/login' : '/api/auth/signup';

    // 🧾 Logging extracted values before submitting
    console.log('🧾 [UserAuthForm] Submitting to:', endpoint);
    if (mode === 'join') {
      console.log('📸 Avatar file selected:', avatarFile);
      console.log('🧍 Name:', name);
      console.log('🧠 Bio:', bio);
    }
    console.log('📧 Email:', email);
    console.log('🔑 Password:', password);

    if (mode === 'join' && !email) {
      setErrorMsg('📧 Email is required to sign up.');
      setLoading(false);
      return;
    }

    let payload: any = { email, password };
    if (mode === 'join') {
      payload = new FormData();
      payload.append('email', email);
      payload.append('password', password);
      payload.append('name', name);
      payload.append('bio', bio);
      if (avatarFile) payload.append('avatar', avatarFile);
    } else {
      // Convert payload into a regular object (not FormData)
      payload = { email, password };
    }

    try {
      const res = await axios.post<AuthResponse>(endpoint, payload, {
        withCredentials: true,
        headers: mode === 'join'
          ? { 'Content-Type': 'multipart/form-data' }
          : undefined
      });

      if (res.data.success && res.data.user) {
        console.log('🎉 [UserAuthForm] Auth success, user payload:', res.data.user);
        onSuccess(res.data.user);
        window.location.reload(); // 🔁 Force refresh to sync frontend AuthContext
      } else {
        console.warn('⚠️ Auth failed:', res.data.message);
        setErrorMsg(res.data.message || 'Something went wrong. Try again.');
      }
    } catch (err: any) {
      console.error('⛔ Server error during auth:', err);
      console.log('❌ [UserAuthForm] Error response payload:', err.response?.data);
      if (err.response?.data?.error?.includes('already registered')) {
        setErrorMsg('🚫 Email already registered. Please sign in instead.');
      } else if (err.response?.status === 400) {
        setErrorMsg(
          err.response?.data?.error || '❌ Invalid request. Please check your input.'
        );
      } else {
        setErrorMsg(err.response?.data?.message || 'Server error. Please try again.');
      }
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
        <div className="input-group">
          <input
            type={showPassword ? 'text' : 'password'}
            className="form-control"
            id="password"
            required
            value={password}
            onChange={e => setPassword(e.target.value)}
          />
          <button
            type="button"
            className="btn btn-outline-secondary"
            onClick={() => setShowPassword(prev => !prev)}
            tabIndex={-1}
          >
            {showPassword ? '🙈 Hide' : '👁️ Show'}
          </button>
        </div>
      </div>

      {mode === 'join' && (
        <>
          <div className="mb-3">
            <label htmlFor="name" className="form-label">🙍 Name</label>
            <input
              type="text"
              className="form-control"
              id="name"
              required
              value={name}
              onChange={e => setName(e.target.value)}
            />
          </div>

          <div className="mb-3">
            <label htmlFor="bio" className="form-label">🧠 Bio</label>
            <input
              type="text"
              className="form-control"
              id="bio"
              value={bio}
              onChange={e => setBio(e.target.value)}
            />
          </div>

          <div className="mb-3">
            <label htmlFor="avatar" className="form-label">🖼️ Profile Picture</label>
            <input
              type="file"
              className="form-control"
              id="avatar"
              accept="image/*"
              onChange={e => setAvatarFile(e.target.files?.[0] || null)}
            />
          </div>
        </>
      )}

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