'use client';
import { createContext, useContext, useState, useEffect, ReactNode } from 'react';

interface User {
  id: string;
  email: string;
  role: string;
}

interface AuthCtx {
  token: string | null;
  user: User | null;
  setAuth(t: string): void;
  logout(): void;
}

const AuthContext = createContext<AuthCtx | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [token, setToken] = useState<string | null>(null);
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    const stored = localStorage.getItem('veridit_token');
    if (stored) hydrate(stored);
  }, []);

  function hydrate(t: string) {
    try {
      const payload = JSON.parse(atob(t.split('.')[1]));
      const now = Math.floor(Date.now() / 1000);
      if (payload.exp && payload.exp < now) {
        localStorage.removeItem('veridit_token');
        return;
      }
      setToken(t);
      setUser({ id: payload.id, email: payload.email, role: payload.role });
    } catch {
      localStorage.removeItem('veridit_token');
    }
  }

  function setAuth(t: string) {
    localStorage.setItem('veridit_token', t);
    hydrate(t);
  }

  function logout() {
    localStorage.removeItem('veridit_token');
    setToken(null);
    setUser(null);
  }

  return (
    <AuthContext.Provider value={{ token, user, setAuth, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth fora do AuthProvider');
  return ctx;
}
