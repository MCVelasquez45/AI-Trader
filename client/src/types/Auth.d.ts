// ✅ types/Auth.d.ts

/**
 * 🧑‍💼 Represents a signed-in user from either Google OAuth or local email/password auth.
 * Used throughout the frontend app to access user profile information.
 */
export interface AuthUser {
    _id: string;             // MongoDB ObjectId for the user
    googleId?: string;       // Optional — present only if authenticated via Google OAuth
    name: string;            // User's full name
    email: string;           // User's email address
    avatar?: string;         // Optional profile image (Google photo or custom upload)
    image?: string;          // ✅ Optional — sometimes used in Google profile responses
    bio?: string;            // Optional user-written bio (for dashboards/profile pages)
    createdAt: string;       // ISO date string from MongoDB (e.g. 2025-07-25T17:52:00Z)
  }
  
  /**
   * 🔍 Represents the response shape from GET /auth/current-user
   * Used by the frontend to determine if a user is currently authenticated.
   */
  export interface CurrentUserResponse {
    authenticated: boolean;  // ✅ true if session is active
    user?: AuthUser;         // 👤 user object is only present if authenticated
  }
  
  /**
   * ✏️ Used when submitting email/password forms (POST /auth/signup or /auth/login)
   * Also usable for validating input on the frontend.
   */
  export interface AuthCredentials {
    email: string;
    password: string;
    name?: string;
    bio?: string;
    avatar?: string | File; // ✅ can be URL or uploaded File
  }
  /**
   * 📬 Generic shape of server response after login/signup
   * Can be reused for form submission feedback.
   */
  export interface AuthResponse {
    success: boolean;        // ✅ true if signup/login was successful
    token?: string;          // 🧪 optional — JWT or session token (future support)
    user?: AuthUser;         // 👤 full user object returned after success
    message?: string;        // 📜 optional server message for error/success feedback
  }
  