import { createContext, useContext, useState, useEffect, useMemo, useCallback } from 'react';
import type { ReactNode } from 'react';
import { apiClient } from '../services/api';

interface User {
  id: string;
  email: string;
  name: string;
  codingLanguages?: string;
}

interface AuthContextType {
  user: User | null;
  login: (email: string, password: string) => Promise<boolean>;
  loginWithGoogle: (token: string) => Promise<boolean>;
  register: (name: string, email: string, password: string, codingLanguages: string) => Promise<boolean>;
  logout: () => void;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

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

  const login = useCallback(async (email: string, password: string): Promise<boolean> => {
    try {
      const data = await apiClient.login(email, password);
      
      if (data.token) {
        localStorage.setItem('token', data.token);
      }
      
      const userData = {
        id: data.user?.id || data.id,
        email: data.user?.email || data.email,
        name: data.user?.name || data.name,
      };
      
      setUser(userData);
      localStorage.setItem('user', JSON.stringify(userData));
      return true;
    } catch (error) {
      console.error('Error during login:', error);
      return false;
    }
  }, []);

  const loginWithGoogle = useCallback(async (token: string): Promise<boolean> => {
    try {
      const data = await apiClient.loginWithGoogle(token);
      
      if (data.token) {
        localStorage.setItem('token', data.token);
      }
      
      const userData = {
        id: data.user?.id || data.id,
        email: data.user?.email || data.email,
        name: data.user?.name || data.name,
      };

      setUser(userData);
      localStorage.setItem('user', JSON.stringify(userData));
      return true;
    } catch (error) {
      console.error('Error during Google login:', error);
      return false;
    }
  }, []);

  const register = useCallback(async (name: string, email: string, password: string, codingLanguages: string): Promise<boolean> => {
    try {
      const data = await apiClient.register(name, email, password, codingLanguages);
      
      if (data.token) {
        localStorage.setItem('token', data.token);
      }
      
      const userData = {
        id: data.user?.id || data.id,
        email: data.user?.email || data.email,
        name: data.user?.name || data.name,
      };
      
      setUser(userData);
      localStorage.setItem('user', JSON.stringify(userData));
      
      return true;
    } catch (error) {
      console.error('Error during signup:', error);
      return false;
    }
  }, []);

  const logout = useCallback(() => {
    try {
      setUser(null);
      localStorage.removeItem('user');
    } catch (error) {
      console.error('Error during logout:', error);
    }
  }, []);

  const value = useMemo(
    () => ({ user, login, loginWithGoogle, register, logout, isLoading }),
    [user, login, loginWithGoogle, register, logout, isLoading]
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