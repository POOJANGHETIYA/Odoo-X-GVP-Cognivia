import React, { createContext, useContext, useState, useEffect } from 'react';

export interface User {
  id: string;
  name: string;
  email: string;
  role: string;
}

interface AuthContextType {
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
    // In a real app, this would be an API call
    // For now, we use a mocked hard-coded check
    return new Promise<void>((resolve, reject) => {
      setTimeout(() => {
        if (email === 'admin@fleetflow.in' && password === 'fleet1234') {
          const loggedInUser: User = {
            id: 'admin-123',
            name: 'Dispatcher Admin',
            email: 'admin@fleetflow.in',
            role: 'Dispatcher',
          };
          setUser(loggedInUser);
          sessionStorage.setItem('fleetflow_user', JSON.stringify(loggedInUser));
          resolve();
        } else {
          reject(new Error('Invalid email or password'));
        }
      }, 500); // 500ms fake delay
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
