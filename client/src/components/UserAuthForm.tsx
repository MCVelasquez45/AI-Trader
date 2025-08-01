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
  const [name, setName] = useState('');
  const [bio, setBio] = useState('');
  const [avatarFile, setAvatar] = useState<File | null>(null);

  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg('');

    try {
      const endpoint = mode === 'signin' ? '/api/auth/login' : '/api/auth/signup';
      let res;
      if (mode === 'signin') {
        const credentials: AuthCredentials = { email, password };
        console.log(`📤 Submitting to ${endpoint} with email: ${email}`);
        console.log('📤 Sending credentials:', credentials);
        res = await axios.post<AuthResponse>(endpoint, credentials, {
          withCredentials: true,
        });
      } else {
        const formData = new FormData();
        formData.append('email', email);
        formData.append('password', password);
        formData.append('name', name);
        formData.append('bio', bio);
        if (avatarFile) formData.append('avatar', avatarFile);
        console.log(`📤 Submitting to ${endpoint} with FormData (email: ${email})`);
        for (let pair of formData.entries()) {
          console.log(`📤 FormData field: ${pair[0]} =>`, pair[1]);
        }
        res = await axios.post<AuthResponse>(endpoint, formData, {
          headers: { 'Content-Type': 'multipart/form-data' },
          withCredentials: true,
        });
      }

      if (res.data.success && res.data.user) {
        console.log('✅ Auth successful:', res.data.user);
        console.log('📥 Full backend response:', res.data);
        const fullUser = {
          _id: res.data.user._id,
          email: res.data.user.email,
          name: res.data.user.name || res.data.user.email.split('@')[0], // fallback
          avatar: res.data.user.avatar || res.data.user.image || '/defaultGuest.png', // support both fields
          bio: res.data.user.bio || '',
          createdAt: res.data.user.createdAt || new Date().toISOString()
        };
        onSuccess(fullUser);
      } else {
        console.warn('⚠️ Auth failed:', res.data.message);
        setErrorMsg(res.data.message || 'Something went wrong. Try again.');
      }
    } catch (err: any) {
      console.error('⛔ Server error during auth:', err);
      console.log('❌ Error response data:', err.response?.data);
      setErrorMsg(err.response?.data?.message || 'Server error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      {mode === 'join' && (
        <>
          <div className="mb-3">
            <label htmlFor="name" className="form-label">🧑 Name</label>
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
            <label htmlFor="bio" className="form-label">📝 Bio</label>
            <textarea
              className="form-control"
              id="bio"
              rows={2}
              value={bio}
              onChange={e => setBio(e.target.value)}
            />
          </div>

          <div className="mb-3">
            <label htmlFor="avatar" className="form-label">🌄 Upload Avatar</label>
            <input
              type="file"
              className="form-control"
              id="avatar"
              accept="image/*"
              onChange={e => {
                const file = e.target.files?.[0];
                if (file) setAvatar(file);
              }}
            />
          </div>
        </>
      )}

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