import { createContext, useContext, useState, useEffect, useMemo, useCallback } from 'react';
import type { ReactNode } from 'react';
import { apiClient } from '../services/api';

interface User {
  id: string;
  email: string;
  name: string;
  codingLanguages?: string;
}

const decodeToken = (token: string) => {
  try {
    const base64Url = token.split('.')[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(window.atob(base64).split('').map(function(c) {
      return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
    }).join(''));
    return JSON.parse(jsonPayload);
  } catch (e) {
    return null;
  }
};

interface AuthContextType {
  user: User | null;
  pendingEmail: string | null;
  login: (email: string, password: string) => Promise<void>;
  verifyOtp: (email: string, otp: string) => Promise<void>;
  loginWithGoogle: (token: string) => Promise<void>;
  register: (name: string, email: string, password: string, codingLanguages: string) => Promise<void>;
  logout: () => void;
  clearPendingEmail: () => void;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [pendingEmail, setPendingEmail] = useState<string | null>(null);
  const [pendingLoginData, setPendingLoginData] = useState<any>(null);

  useEffect(() => {
    // Check if user is logged in on mount
    try {
      const storedUser = localStorage.getItem('user');
      if (storedUser) {
        setUser(JSON.parse(storedUser));
      }
    } catch (error) {
      console.error('Error loading user from localStorage:', error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const login = useCallback(async (email: string, password: string): Promise<void> => {
    try {
      const data = await apiClient.login(email, password);
      // Store login response temporarily — don't finalize until OTP is verified
      setPendingLoginData({ data, email });
      setPendingEmail(email);
    } catch (error: any) {
      console.error('Error during login:', error);
      throw error;
    }
  }, []);

  const verifyOtp = useCallback(async (email: string, otp: string): Promise<void> => {
    try {
      await apiClient.verifyOtp(email, otp);

      // OTP verified — now finalize login with the stored data
      const pending = pendingLoginData;
      const data = pending?.data || {};

      const token = data.token || data.access;
      let decoded = null;
      if (token) {
        localStorage.setItem('token', token);
        decoded = decodeToken(token);
      }

      const userData = {
        id: String(data.user?.id || data.id || decoded?.user_id || decoded?.id || ''),
        email: data.user?.email || data.email || decoded?.email || email || '',
        name: data.user?.name || data.user?.username || data.name || data.username || decoded?.name || decoded?.username || email.split('@')[0] || '',
        codingLanguages: data.user?.codingLanguages || data.codingLanguages || decoded?.codingLanguages || '',
      };

      setUser(userData);
      localStorage.setItem('user', JSON.stringify(userData));
      setPendingEmail(null);
      setPendingLoginData(null);
    } catch (error: any) {
      console.error('Error during OTP verification:', error);
      throw error;
    }
  }, [pendingLoginData]);

  const loginWithGoogle = useCallback(async (googleToken: string): Promise<void> => {
    try {
      const data = await apiClient.loginWithGoogle(googleToken);
      
      const authToken = data.token || data.access;
      let decoded = null;
      if (authToken) {
        localStorage.setItem('token', authToken);
        decoded = decodeToken(authToken);
      }
      
      const userData = {
        id: String(data.user?.id || data.id || decoded?.user_id || decoded?.id || ''),
        email: data.user?.email || data.email || decoded?.email || '',
        name: data.user?.name || data.user?.username || data.name || data.username || decoded?.name || decoded?.username || '',
        codingLanguages: data.user?.codingLanguages || data.codingLanguages || decoded?.codingLanguages || '',
      };

      setUser(userData);
      localStorage.setItem('user', JSON.stringify(userData));
    } catch (error: any) {
      console.error('Error during Google login:', error);
      throw error;
    }
  }, []);

  const register = useCallback(async (name: string, email: string, password: string, codingLanguages: string): Promise<void> => {
    try {
      const data = await apiClient.register(name, email, password, codingLanguages);
      
      const token = data.token || data.access;
      let decoded = null;
      if (token) {
        localStorage.setItem('token', token);
        decoded = decodeToken(token);
      }
      
      const userData = {
        id: String(data.user?.id || data.id || decoded?.user_id || decoded?.id || ''),
        email: data.user?.email || data.email || decoded?.email || email || '',
        name: data.user?.name || data.user?.username || data.name || data.username || decoded?.name || decoded?.username || name || '',
        codingLanguages: data.user?.codingLanguages || data.codingLanguages || decoded?.codingLanguages || codingLanguages || '',
      };
      
      setUser(userData);
      localStorage.setItem('user', JSON.stringify(userData));
    } catch (error: any) {
      console.error('Error during signup:', error);
      throw error;
    }
  }, []);

  const logout = useCallback(() => {
    try {
      setUser(null);
      localStorage.removeItem('user');
      localStorage.removeItem('token');
      setPendingEmail(null);
      setPendingLoginData(null);
    } catch (error) {
      console.error('Error during logout:', error);
    }
  }, []);

  const clearPendingEmail = useCallback(() => {
    setPendingEmail(null);
    setPendingLoginData(null);
  }, []);

  const value = useMemo(
    () => ({ user, pendingEmail, login, verifyOtp, loginWithGoogle, register, logout, clearPendingEmail, isLoading }),
    [user, pendingEmail, login, verifyOtp, loginWithGoogle, register, logout, clearPendingEmail, isLoading]
  );

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

// eslint-disable-next-line react-refresh/only-export-components
export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}