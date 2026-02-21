import React, { createContext, useContext, useState, useEffect } from 'react';

export interface User {
  id: string;
  name: string;
  email: string;
  role: string;
}

export interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Check sessionStorage on initial load
    const storedUser = sessionStorage.getItem('fleetflow_user');
    if (storedUser) {
      try {
        setUser(JSON.parse(storedUser));
      } catch (e) {
        console.error('Failed to parse stored user session');
      }
    }
    setIsLoading(false);
  }, []);

  const login = async (email: string, password: string) => {
    return new Promise<void>((resolve, reject) => {
      setTimeout(() => {
        const users = [
          {
            email: 'admin@fleetflow.in',
            password: 'fleet1234',
            user: { id: 'usr-001', name: 'System Admin', email: 'admin@fleetflow.in', role: 'admin' }
          },
          {
            email: 'ops@fleetflow.in',
            password: 'fleet1234',
            user: { id: 'usr-002', name: 'Operations Chief', email: 'ops@fleetflow.in', role: 'dispatcher' }
          },
          {
            email: 'finance@fleetflow.in',
            password: 'fleet1234',
            user: { id: 'usr-003', name: 'Finance Controller', email: 'finance@fleetflow.in', role: 'finance' }
          },
          {
            email: 'service@fleetflow.in',
            password: 'fleet1234',
            user: { id: 'usr-004', name: 'Maintenance Lead', email: 'service@fleetflow.in', role: 'maintenance' }
          }
        ];

        const match = users.find(u => u.email === email && u.password === password);

        if (match) {
          setUser(match.user);
          sessionStorage.setItem('fleetflow_user', JSON.stringify(match.user));
          resolve();
        } else {
          reject(new Error('Invalid email or security key. Access denied.'));
        }
      }, 800);
    });
  };

  const logout = () => {
    setUser(null);
    sessionStorage.removeItem('fleetflow_user');
  };

  return (
    <AuthContext.Provider value={{ user, isAuthenticated: !!user, login, logout, isLoading }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
