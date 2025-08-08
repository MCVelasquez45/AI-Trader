// ✅ server/middleware/ensureAuth.js

/**
 * 🛡️ Middleware to ensure the user is authenticated before accessing a protected route.
 * If not logged in, the user receives a 401 Unauthorized response.
 */

export const ensureAuth = (req, res, next) => {
    // 🧪 Check if Passport session exists and log full user identifier
    if (req.isAuthenticated && req.isAuthenticated()) {
      console.log(`✅ Authenticated User: ${req.user.name} (${req.user.email}) - ID: ${req.user.id}`);
      return next(); // 🎯 Allow access
    }
  
    console.warn('🚫 Unauthorized access attempt.');
    res.status(401).json({ error: 'Unauthorized. Please log in with Google.' });
  };