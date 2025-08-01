// ✅ server/middleware/ensureAuth.js

/**
 * 🛡️ Middleware to ensure the user is authenticated before accessing a protected route.
 * Accepts both logged-in users or valid guest sessions via a custom header.
 */

export const ensureAuth = (req, res, next) => {
  // Check Passport session
  if (req.isAuthenticated?.() && req.user) {
    console.log(`✅ Authenticated User: ${req.user.name} (${req.user.email})`);
    return next();
  }

  // Optional: allow "guest" flow via custom header
  const guestId = req.headers['x-guest-id'];
  if (guestId) {
    console.log(`🧳 Guest session detected (x-guest-id=${guestId})`);
    req.guestId = guestId;
    return next();
  }

  console.warn('🚫 Unauthorized access attempt to protected route.');
  console.log('🍪 Cookies received:', req.headers.cookie);
  res.status(401).json({ error: 'Unauthorized. Please log in or start a guest session.' });
};