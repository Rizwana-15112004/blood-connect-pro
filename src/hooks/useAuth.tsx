import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { useNavigate } from 'react-router-dom';
import { mockService } from '@/lib/mockData';

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
        // Try to get CSRF token, but don't crash if it fails (HTML response etc)
        try {
          await fetch('/api/csrf');
          csrftoken = getCSRFToken();
        } catch (e) {
          // Ignore error
        }
      }

      const headers = {
        'Content-Type': 'application/json',
        'X-CSRFToken': csrftoken || '',
        ...options.headers,
      };
      options.headers = headers as HeadersInit;
    }

    options.credentials = 'same-origin';
    return fetch(url, options);
  };

  const checkAuth = async () => {
    try {
      try {
        await fetch('/api/csrf', { credentials: 'same-origin' });
      } catch (e) { /* ignore */ }

      const res = await fetchWithCSRF('/api/user');

      // Strict JSON check
      const contentType = res.headers.get("content-type");
      if (!contentType || !contentType.includes("application/json")) {
        throw new Error("Response is not JSON");
      }

      const data = await res.json();
      if (data.user) {
        setUser(data.user);
      } else {
        setUser(null);
      }
    } catch (error) {
      console.warn("Auth check failed (Demo Mode Active)", error);
      // Demo persistence
      try {
        const demoUser = localStorage.getItem('demo_user');
        if (demoUser) {
          setUser(JSON.parse(demoUser));
        } else {
          setUser(null);
        }
      } catch (e) { setUser(null); }
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

      if (!res.ok) throw new Error("API Error");
      const data = await res.json();
      setUser(data.user);
      return { error: null };
    } catch (error: any) {
      console.warn("Using Mock SignUp");

      // Check if user already exists
      const existing = await mockService.verifyCredentials(email);
      if (existing) {
        return { error: new Error("User already exists. Please Sign In.") };
      }

      // Register new user in mock DB. Pass minimal required fields.
      // addDonor expects: full_name, email, phone, date_of_birth, gender, blood_group, weight, is_eligible
      await mockService.addDonor({
        full_name: email.split('@')[0],
        email: email,
        phone: '',
        date_of_birth: '', // Profile will prompt for this
        gender: 'other',
        blood_group: 'Unknown',
        weight: 0,
        is_eligible: true
      });

      const mockUser: User = {
        id: Math.floor(Math.random() * 10000),
        email: email,
        role: 'donor'
      };
      setUser(mockUser);
      localStorage.setItem('demo_user', JSON.stringify(mockUser));
      return { error: null };
    }
  };

  const signIn = async (email: string, password: string) => {
    try {
      const res = await fetchWithCSRF('/api/login', {
        method: 'POST',
        body: JSON.stringify({ email, password }),
      });

      // Validating response is JSON before parsing
      const contentType = res.headers.get("content-type");
      if (!contentType || !contentType.includes("application/json")) {
        throw new Error("Not JSON");
      }

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Login failed');

      setUser(data.user);
      return { error: null };
    } catch (error: any) {
      console.warn("Using Mock SignIn");

      // Verify against mock DB
      const verifiedUser = await mockService.verifyCredentials(email);

      if (verifiedUser) {
        // Admin password check
        if (email === 'admin@example.com' && password !== 'admin') {
          return { error: new Error('Invalid credentials') };
        }

        const appUser: User = {
          id: Number(verifiedUser.id) || 999,
          email: verifiedUser.email,
          role: verifiedUser.role as AppRole
        };
        setUser(appUser);
        localStorage.setItem('demo_user', JSON.stringify(appUser));
        return { error: null };
      }

      // No fallback allowed!
      return { error: new Error('User not found. Please Sign Up.') };
    }
  };

  const signOut = async () => {
    try {
      await fetchWithCSRF('/api/logout', { method: 'POST' });
    } catch (e) { }

    setUser(null);
    localStorage.removeItem('demo_user');
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
