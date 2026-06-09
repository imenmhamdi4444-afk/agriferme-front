import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { login as loginApi } from '../api/auth';
import { LoginResponse } from '../types';

interface AuthContextType {
  user: LoginResponse | null;
  token: string | null;
  login: (email: string, password: string) => Promise<LoginResponse>;
  logout: () => void;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<LoginResponse | null>(() => {
    const saved = localStorage.getItem('user');
    return saved ? JSON.parse(saved) : null;
  });
  const [token, setToken] = useState<string | null>(() => localStorage.getItem('token'));

  useEffect(() => {
    if (token) {
      localStorage.setItem('token', token);
    } else {
      localStorage.removeItem('token');
    }
  }, [token]);

  const login = async (email: string, password: string) => {
    const response = await loginApi(email, password);
    setToken(response.token);
    setUser(response);
    localStorage.setItem('user', JSON.stringify(response));
    localStorage.setItem('token', response.token);
    localStorage.setItem('uid', String(response.id));
    return response;
  };

  const logout = () => {
    setToken(null);
    setUser(null);
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    localStorage.removeItem('uid');
  };

  return (
    <AuthContext.Provider value={{ user, token, login, logout, isAuthenticated: !!token }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
};
