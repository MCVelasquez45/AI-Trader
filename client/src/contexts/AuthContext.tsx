// ✅ File: contexts/AuthContext.tsx

import React, {
    createContext,
    useState,
    useEffect,
    useContext,
    ReactNode,
  } from 'react';
  
  import { axiosInstance } from '../api/axiosInstance';
  import type { AuthUser, CurrentUserResponse } from '../types/Auth';
  
  // 🧠 Define the shape of our context state
  interface AuthContextType {
    user: AuthUser | null;           // 👤 Authenticated user info
    authenticated: boolean;         // 🔐 Auth status flag
    logout: () => void;             // 🚪 Logout function
  }
  
  // 🧠 Create and export the actual context (default values are empty and overridden by provider)
  export const AuthContext = createContext<AuthContextType>({} as AuthContextType);
  
  // 🧩 Provider component that wraps the app and shares auth state globally
  export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [user, setUser] = useState<AuthUser | null>(null);         // 👤 Google account user
    const [authenticated, setAuthenticated] = useState(false);       // 🔐 Is the user logged in?
  
    // 🚀 On mount, check session status via cookie-based auth
    useEffect(() => {
      const sessionEndpoint = '/api/auth/current-user';
      console.log(`[${new Date().toISOString()}] 🧠 [AuthProvider] Checking session at ${sessionEndpoint}...`);

      axiosInstance
        .get<CurrentUserResponse>(sessionEndpoint, {
          withCredentials: true, // 🧠 Ensures cookie is sent for session auth
        })
        .then((res) => {
          console.log(`[${new Date().toISOString()}] 🧠 [Auth] Session check response:`, res.data);
          if (res.data?.authenticated) {
            setUser(res.data.user ?? null);
            setAuthenticated(true);
            console.log('✅ [Auth] Session active:', res.data.user?.email);
          } else {
            setUser(null);
            setAuthenticated(false);
            console.log('🔓 [Auth] No active session');
          }
        })
        .catch((err) => {
          console.error('❌ [Auth] Session check failed:', err.message);
          setUser(null);
          setAuthenticated(false);
        });
    }, []);
  
    // 👋 Logout user and clear local auth state
    const logout = () => {
      console.log(`[${new Date().toISOString()}] 👋 [Auth] Logging out...`);

      axiosInstance
        .get('/api/auth/logout', {
          withCredentials: true, // 🧠 Send cookie for logout
        })
        .then(() => {
          setUser(null);
          setAuthenticated(false);
          console.log(`[${new Date().toISOString()}] ✅ [Auth] Logout response received.`);
          console.log('✅ [Auth] Logged out successfully');
        })
        .catch((err) => {
          console.error('❌ [Auth] Logout failed:', err.message);
        });
    };
  
    // 🧩 Provide context state + logout handler
    return (
      <AuthContext.Provider value={{ user, authenticated, logout }}>
        {children}
      </AuthContext.Provider>
    );
  };
  
  // ✅ Custom hook for easy use of AuthContext in components
  export const useAuth = () => useContext(AuthContext);