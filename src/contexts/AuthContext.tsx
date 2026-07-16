// src/context/AuthContext.tsx
import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { authApi, type MeResponse } from '../api';

// ===== ТИПЫ =====

interface AuthContextType {
  // Состояние
  user: MeResponse | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  
  // Методы
  login: (email: string, password: string) => Promise<void>;
  register: (displayName: string, email: string, password: string) => Promise<void>;
  logout: () => void;
}

// ===== КОНТЕКСТ =====

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// ===== ПРОВАЙДЕР =====

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<MeResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // ===== ИНИЦИАЛИЗАЦИЯ =====
  useEffect(() => {
    const initAuth = async () => {
      const token = localStorage.getItem('token');
      
      if (token) {
        try {
          const response = await authApi.getMe();
          if (response.success && response.data) {
            setUser(response.data);
          } else {
            // Токен невалидный
            localStorage.removeItem('token');
          }
        } catch {
          localStorage.removeItem('token');
        }
      }
      
      setIsLoading(false);
    };

    initAuth();
  }, []);

  // ===== МЕТОДЫ =====

  const login = useCallback(async (email: string, password: string) => {
    const response = await authApi.login({ email, password });
    
    if (!response.success || !response.data?.access_token) {
      throw new Error(response.error || 'Ошибка входа');
    }

    // Сохраняем токен
    localStorage.setItem('token', response.data.access_token);

    // Получаем профиль
    const meResponse = await authApi.getMe();
    if (meResponse.success && meResponse.data) {
      setUser(meResponse.data);
    } else {
      throw new Error(meResponse.error || 'Не удалось получить профиль');
    }
  }, []);

  const register = useCallback(async (displayName: string, email: string, password: string) => {
    const response = await authApi.register({
      display_name: displayName,
      email,
      password,
    });

    if (!response.success || !response.data?.user_id) {
      throw new Error(response.error || 'Ошибка регистрации');
    }

    // После регистрации автоматически входим
    await login(email, password);
  }, [login]);

  const logout = useCallback(() => {
    localStorage.removeItem('token');
    setUser(null);
  }, []);

  const value = {
    user,
    isLoading,
    isAuthenticated: !!user && !!localStorage.getItem('token'),
    login,
    register,
    logout,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

// ===== ХУК =====

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};