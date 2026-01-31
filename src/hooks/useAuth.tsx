import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { useNavigate } from 'react-router-dom';

type AppRole = 'admin' | 'donor';

interface User {
  id: number;
  email: string; // Django username
  role: AppRole;
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  signUp: (email: string, password: string) => Promise<{ error: Error | null }>;
  signIn: (email: string, password: string) => Promise<{ error: Error | null }>;
  signOut: () => Promise<void>;
  isAdmin: boolean;
  isDonor: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    checkAuth();
  }, []);

  const getCSRFToken = () => {
    const name = 'csrftoken';
    let cookieValue = null;
    if (document.cookie && document.cookie !== '') {
      const cookies = document.cookie.split(';');
      for (let i = 0; i < cookies.length; i++) {
        const cookie = cookies[i].trim();
        if (cookie.substring(0, name.length + 1) === (name + '=')) {
          cookieValue = decodeURIComponent(cookie.substring(name.length + 1));
          break;
        }
      }
    }
    return cookieValue;
  };

  const fetchWithCSRF = async (url: string, options: RequestInit = {}) => {
    // Ensure we have a CSRF token for mutations
    if (options.method && ['POST', 'PUT', 'DELETE'].includes(options.method)) {
      let csrftoken = getCSRFToken();
      if (!csrftoken) {
        // If missing, hit the CSRF endpoint to set the cookie
        await fetch('/api/csrf');
        csrftoken = getCSRFToken();
      }

      const headers = {
        'Content-Type': 'application/json',
        'X-CSRFToken': csrftoken || '',
        ...options.headers,
      };
      options.headers = headers as HeadersInit;
    }

    options.credentials = 'same-origin'; // Send cookies with same-origin requests
    return fetch(url, options);
  };

  const checkAuth = async () => {
    try {
      // First ensure CSRF cookie is present
      await fetch('/api/csrf', { credentials: 'same-origin' });

      const res = await fetchWithCSRF('/api/user');
      const data = await res.json();

      if (data.user) {
        setUser(data.user);
      } else {
        setUser(null);
      }
    } catch (error) {
      console.error("Auth check failed:", error);
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  const signUp = async (email: string, password: string) => {
    try {
      const res = await fetchWithCSRF('/api/register', {
        method: 'POST',
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Registration failed');
      }

      setUser(data.user);
      return { error: null };
    } catch (error: any) {
      return { error };
    }
  };

  const signIn = async (email: string, password: string) => {
    try {
      const res = await fetchWithCSRF('/api/login', {
        method: 'POST',
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Login failed');
      }

      setUser(data.user);
      return { error: null };
    } catch (error: any) {
      return { error };
    }
  };

  const signOut = async () => {
    try {
      await fetchWithCSRF('/api/logout', { method: 'POST' });
      setUser(null);
      // specific navigation to prevent "back" button from restoring the session view
      window.location.href = '/';
    } catch (error) {
      console.error("Logout failed:", error);
    }
  };

  const value = {
    user,
    loading,
    signUp,
    signIn,
    signOut,
    isAdmin: user?.role === 'admin',
    isDonor: user?.role === 'donor', // Default to donor logic
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
