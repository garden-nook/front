// src/contexts/AuthContext.tsx
import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { authApi } from '../api/endpoints/auth';
import type { MeResponse } from '../api/types/auth.types';

interface AuthContextType {
  user: MeResponse | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (displayName: string, email: string, password: string) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<MeResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const initAuth = async () => {
      const token = localStorage.getItem('access_token');
      
      if (token) {
        try {
          const response = await authApi.getMe();
          if (response.data?.data) {
            setUser(response.data.data);
          } else {
            localStorage.removeItem('access_token');
          }
        } catch {
          localStorage.removeItem('access_token');
        }
      }
      
      setIsLoading(false);
    };

    initAuth();
  }, []);

  const login = useCallback(async (email: string, password: string) => {
    const response = await authApi.login({ email, password });
    
    if (!response.data?.data?.access_token) {
      throw new Error('Неверный email или пароль');
    }

    localStorage.setItem('access_token', response.data.data.access_token);

    const meResponse = await authApi.getMe();
    if (meResponse.data?.data) {
      setUser(meResponse.data.data);
    } else {
      throw new Error('Не удалось получить профиль');
    }
  }, []);

  const register = useCallback(async (displayName: string, email: string, password: string) => {
    const response = await authApi.register({
      display_name: displayName,
      email,
      password,
    });

    if (!response.data?.data?.user_id) {
      throw new Error('Ошибка регистрации');
    }

    await login(email, password);
  }, [login]);

  const logout = useCallback(() => {
    localStorage.removeItem('access_token');
    setUser(null);
  }, []);

  const value = {
    user,
    isLoading,
    isAuthenticated: !!user && !!localStorage.getItem('access_token'),
    login,
    register,
    logout,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};