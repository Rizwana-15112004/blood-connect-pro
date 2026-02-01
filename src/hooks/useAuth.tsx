import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { useNavigate } from 'react-router-dom';

type AppRole = 'admin' | 'donor';

interface User {
  id: number;
  email: string; // Django username
  role: AppRole;
}

interface AuthContextType {
  signUp: (email: string, password: string, isEligible: boolean) => Promise<{ error: Error | null }>;
  signIn: (email: string, password: string) => Promise<{ error: Error | null }>;
  signOut: () => Promise<void>;
  isAdmin: boolean;
  isDonor: boolean;
  user: User | null;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

import { api } from '@/services/api';

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    try {
      const data = await api.checkAuth();
      if (data && data.user) {
        setUser(data.user);
      } else {
        setUser(null);
      }
    } catch (error) {
      console.warn("Auth check failed", error);
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  const signUp = async (email: string, password: string, isEligible: boolean) => {
    try {
      const data = await api.register(email, password, isEligible);
      setUser(data.user);
      return { error: null };
    } catch (error: any) {
      return { error: error };
    }
  };

  const signIn = async (email: string, password: string) => {
    try {
      const data = await api.login(email.trim(), password);
      setUser(data.user);
      return { error: null };
    } catch (error: any) {
      return { error: new Error(error.message || 'Login failed') };
    }
  };

  const signOut = async () => {
    await api.logout();
    setUser(null);
    window.location.href = '/';
  };

  const value = {
    user,
    loading,
    signUp,
    signIn,
    signOut,
    isAdmin: user?.role === 'admin',
    isDonor: user?.role === 'donor',
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
