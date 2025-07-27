// ✅ server/routes/authRoutes.js

// 📦 Import required modules
import express from 'express';
import passport from 'passport';
import { signup, login } from '../controllers/authController.js'; // ✨ Local auth handlers

const router = express.Router();

/**
 * 🔐 STEP 1: Start Google OAuth login flow
 * Redirects user to Google's OAuth consent screen
 * Requested scopes: profile info + email
 */
router.get(
  '/google',
  passport.authenticate('google', {
    scope: ['profile', 'email'] // request access to user's public profile + email
  })
);

/**
 * 🔁 STEP 2: Google redirects here after login
 * Passport automatically exchanges code for user profile
 * On success: redirects to frontend dashboard
 * On failure: redirects to homepage
 */
router.get(
  '/google/callback',
  passport.authenticate('google', {
    failureRedirect: '/' // ❌ Redirect to home if auth fails
  }),
  (req, res) => {
    console.log('✅ [Auth] Google login successful:', req.user?.email);
    
    // 👇 Redirect to Vite frontend or fallback to localhost:5173
    res.redirect(process.env.CLIENT_URL || 'http://localhost:5173');
  }
);

/**
 * 🔓 STEP 3: Logout route
 * Destroys session and logs out user
 */
router.get('/logout', (req, res) => {
  req.logout(err => {
    if (err) {
      console.error('❌ [Auth] Logout error:', err);
      return res.status(500).json({ error: 'Logout failed' });
    }

    console.log('👋 [Auth] User logged out successfully');
    res.redirect('/'); // ✅ Optional: redirect to homepage or login page
  });
});

/**
 * 🔍 STEP 4: Check if user is logged in
 * Used on frontend to determine session/auth state
 */
router.get('/current-user', (req, res) => {
  if (!req.user) {
    console.log('🔐 [Auth] No active session found');
    return res.json({ authenticated: false });
  }

  console.log('✅ [Auth] User is authenticated:', req.user.email);
  res.json({
    authenticated: true,
    user: {
      name: req.user.name,
      email: req.user.email,
      avatar: req.user.avatar
    }
  });
});

/**
 * 🧠 STEP 5: Local Email/Password Authentication
 * These routes support creating and logging into local accounts
 */

// 🆕 Register new user with email + password
router.post('/signup', signup); // 🔐 POST /auth/signup

// 🔑 Login existing user with credentials
router.post('/login', login);   // 🔐 POST /auth/login

// ✅ Export router to be used in server.js
export default router;