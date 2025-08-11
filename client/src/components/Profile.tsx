// ✅ File: src/components/Profile.tsx
import React from 'react';
import { useAuth } from '../contexts/AuthContext';

/**
 * 🧠 Profile Component
 * Renders the authenticated user's profile using shared AuthContext
 * - Works for both Google-authenticated and local users
 * - Displays avatar, name, email, and motivational bio
 */
const Profile: React.FC = () => {
  const { user } = useAuth();

  // 🔐 If user is not logged in, display fallback UI
  if (!user) {
    console.log('🔒 [Profile] No authenticated user found.');
    return <div className="text-center">🔐 Not signed in</div>;
  }

  // ✅ Log full user object
  console.log('👤 [Profile] Rendering user profile:', user);

  return (
    <div className="card shadow p-4 mt-4">
      <div className="d-flex align-items-center gap-4">
        {/* 🖼️ Avatar (fallback to placeholder if none provided) */}
        <img
          src={user.avatar || 'https://via.placeholder.com/80'}
          alt={`${user.name}'s avatar`}
          className="rounded-circle border"
          style={{
            width: '80px',
            height: '80px',
            objectFit: 'cover',
            objectPosition: 'center top'
          }}
        />

        {/* 📋 Name, Email, Bio */}
        <div>
          <h4 className="mb-1">{user.name}</h4>
          <p className="text-muted mb-1">{user.email}</p>
          <p className="fst-italic text-secondary">
            {user.bio || '🚀 Keep dreaming big! The market rewards the prepared.'}
          </p>
        </div>
      </div>
    </div>
  );
};

export default Profile;