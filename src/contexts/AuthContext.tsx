import { createContext, useContext, useState, useEffect, useMemo, useCallback } from "react";
import type { ReactNode } from "react";
import { apiClient } from "../services/api";

interface User {
  id: string;
  email: string;
  name: string;
  codingLanguages?: string;
}

interface AuthContextType {
  user: User | null;
  login: (email: string, password: string) => Promise<boolean>;
  loginWithGoogle: (email: string, name?: string) => Promise<boolean>;
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
      const storedUser = localStorage.getItem("user");
      if (storedUser) {
        setUser(JSON.parse(storedUser));
      }
    } catch (error) {
      console.error("Error loading user from localStorage:", error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const login = useCallback(async (email: string, password: string): Promise<boolean> => {
    try {
      const response = await apiClient.login(email, password);
      const userData = {
        id: response.user.id,
        email: response.user.email,
        name: response.user.name,
      };
      setUser(userData);
      localStorage.setItem("user", JSON.stringify(userData));
      localStorage.setItem("token", response.token);
      return true;
    } catch (error) {
      console.error("Login error:", error);
      return false;
    }
  }, []);

  const loginWithGoogle = useCallback(async (email: string, name?: string): Promise<boolean> => {
    try {
      // In a real app this would be handled by Google OAuth,
      // here we simulate signing in directly via an account chooser token flow.
      const storedUsers = localStorage.getItem("users");
      const users = storedUsers ? JSON.parse(storedUsers) : [];

      let user = users.find((u: Record<string, string>) => u.email === email);
      if (!user) {
        // Auto-register mock Google accounts
        user = {
          id: Date.now().toString(),
          email,
          name: name || email.split("@")[0],
          password: "google-oauth-mock"
        };
        users.push(user);
        localStorage.setItem("users", JSON.stringify(users));
      }

      const userData = {
        id: user.id,
        email: user.email,
        name: user.name,
      };

      setUser(userData);
      localStorage.setItem("user", JSON.stringify(userData));
      return true;
    } catch (error) {
      console.error("Error during Google login:", error);
      return false;
    }
  }, []);

  const register = useCallback(async (name: string, email: string, password: string, codingLanguages: string): Promise<boolean> => {
    try {
      const response = await apiClient.register(name, email, password, codingLanguages);
      const userData = {
        id: response.user.id,
        email: response.user.email,
        name: response.user.name,
      };
      setUser(userData);
      localStorage.setItem("user", JSON.stringify(userData));
      localStorage.setItem("token", response.token);
      return true;
    } catch (error) {
      console.error("Registration error:", error);
      return false;
    }
  }, []);

  const logout = useCallback(() => {
    setUser(null);
    localStorage.removeItem("user");
    localStorage.removeItem("token");
  }, []);

  const value = useMemo(() => ({
    user,
    login,
    loginWithGoogle,
    register,
    logout,
    isLoading,
  }), [user, login, loginWithGoogle, register, logout, isLoading]);

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
