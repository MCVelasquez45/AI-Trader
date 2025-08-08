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
    guestId: string | null;        // 👤 Guest user ID
    logout: () => void;             // 🚪 Logout function
    refreshUser: () => Promise<void>; // 🔄 Manually refresh user session
  }
  
  // 🧠 Create and export the actual context (default values are empty and overridden by provider)
  export const AuthContext = createContext<AuthContextType>({} as AuthContextType);
  
  // 🧩 Provider component that wraps the app and shares auth state globally
  export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [user, setUser] = useState<AuthUser | null>(null);         // 👤 Google account user
    const [authenticated, setAuthenticated] = useState(false);       // 🔐 Is the user logged in?
    const [guestId, setGuestId] = useState<string | null>(null);     // 👤 Guest user ID
    
    // 🔄 Generate or retrieve guest ID
    const getGuestId = (): string => {
      const stored = localStorage.getItem('guestId');
      if (stored) {
        console.log('👤 [Auth] Retrieved stored guest ID:', stored);
        return stored;
      }
      // Use "anonymous" for backward compatibility with existing trades
      const newGuestId = 'anonymous';
      localStorage.setItem('guestId', newGuestId);
      console.log('👤 [Auth] Generated new guest ID:', newGuestId);
      return newGuestId;
    };
    
    // 🔄 Manually refresh user session
    const refreshUser = async () => {
      console.log(`[${new Date().toISOString()}] 🔄 [Auth] Manually refreshing user session...`);
      try {
        const res = await axiosInstance.get<CurrentUserResponse>('/api/auth/current-user', {
          withCredentials: true,
        });

        if (res.data?.authenticated) {
          setUser(res.data.user ?? null);
          setAuthenticated(true);
          console.log('✅ [Auth] Refreshed session for:', res.data.user?.email);
        } else {
          setUser(null);
          setAuthenticated(false);
          console.log('🔓 [Auth] Session not found');
        }
      } catch (err: any) {
        console.error('❌ [Auth] Refresh failed:', err.message);
        setUser(null);
        setAuthenticated(false);
      }
    };
  
    // 🚀 On mount, check session status via cookie-based auth
    useEffect(() => {
      const sessionEndpoint = '/api/auth/current-user';
      console.log(`[${new Date().toISOString()}] 🧠 [AuthProvider] Checking session at ${sessionEndpoint}...`);

      // Set up guest ID for non-authenticated users
      const guestIdValue = getGuestId();
      setGuestId(guestIdValue);
      
      // Set guest ID in axios headers for all requests
      if (guestIdValue) {
        axiosInstance.defaults.headers.common['x-guest-id'] = guestIdValue;
        console.log('👤 [Auth] Guest ID set in headers:', guestIdValue);
        console.log('👤 [Auth] Current axios headers:', axiosInstance.defaults.headers.common);
      } else {
        console.warn('⚠️ [Auth] No guest ID generated');
      }

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
          // Clear guest ID and localStorage
          localStorage.removeItem('guestId');
          setGuestId(null);
          delete axiosInstance.defaults.headers.common['x-guest-id'];
          console.log(`[${new Date().toISOString()}] ✅ [Auth] Logout response received.`);
          console.log('✅ [Auth] Logged out successfully');
        })
        .catch((err) => {
          console.error('❌ [Auth] Logout failed:', err.message);
        });
    };
  
    // 🧩 Provide context state + logout handler + refreshUser
    return (
      <AuthContext.Provider value={{ user, authenticated, guestId, logout, refreshUser }}>
        {children}
      </AuthContext.Provider>
    );
  };
  
  // ✅ Custom hook for easy use of AuthContext in components
  export const useAuth = () => useContext(AuthContext);