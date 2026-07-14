import { createContext, useContext, useState, useEffect} from 'react';
import type { ReactNode } from 'react';

export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  avatarUrl?: string;
}

interface AuthContextType {
  user: User | null;
  login: (email: string, password: string) => User | null;
  logout: () => void;
  updateUser: (updatedUser: User) => void;
  register: (email: string, password: string, firstName: string, lastName: string) => boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(() => {
    if (typeof window !== 'undefined') {
      const savedUser = localStorage.getItem('currentUser');
      return savedUser ? JSON.parse(savedUser) : null;
    }
    return null;
  });

  // Создаем демо-пользователя при первом запуске
  useEffect(() => {
    const users = JSON.parse(localStorage.getItem('users') || '[]');
    if (users.length === 0) {
      const demoUser = {
        id: 'demo-1',
        email: 'demo@ogorod.ru',
        password: '123456',
        firstName: 'Демо',
        lastName: 'Пользователь',
        avatarUrl: '',
      };
      localStorage.setItem('users', JSON.stringify([demoUser]));
      console.log('✅ Демо-пользователь создан: demo@ogorod.ru / 123456');
    }
  }, []);

  const register = (email: string, password: string, firstName: string, lastName: string): boolean => {
    try {
      const users = JSON.parse(localStorage.getItem('users') || '[]');
      
      if (users.some((u: any) => u.email === email)) {
        console.error('❌ Пользователь с таким email уже существует');
        return false;
      }

      const newUser = {
        id: Date.now().toString(),
        email,
        password,
        firstName,
        lastName,
        avatarUrl: '',
      };

      users.push(newUser);
      localStorage.setItem('users', JSON.stringify(users));
      console.log('✅ Регистрация успешна:', email);
      return true;
    } catch (error) {
      console.error('❌ Ошибка регистрации:', error);
      return false;
    }
  };

  const login = (email: string, password: string): User | null => {
    try {
      const users = JSON.parse(localStorage.getItem('users') || '[]');
      console.log('🔍 Ищем пользователя:', email);
      console.log('Все пользователи:', users);
      
      const foundUser = users.find((u: any) => 
        u.email === email && u.password === password
      );

      if (foundUser) {
        const { password: _, ...userWithoutPassword } = foundUser;
        setUser(userWithoutPassword);
        localStorage.setItem('currentUser', JSON.stringify(userWithoutPassword));
        console.log('✅ Вход успешен:', userWithoutPassword);
        return userWithoutPassword;
      }

      console.error('❌ Неверный email или пароль');
      return null;
    } catch (error) {
      console.error(' Ошибка входа:', error);
      return null;
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('currentUser');
    console.log(' Выход выполнен');
  };

  const updateUser = (updatedUser: User) => {
    setUser(updatedUser);
    localStorage.setItem('currentUser', JSON.stringify(updatedUser));
    
    const users = JSON.parse(localStorage.getItem('users') || '[]');
    const updatedUsers = users.map((u: any) => 
      u.id === updatedUser.id ? { ...u, ...updatedUser } : u
    );
    localStorage.setItem('users', JSON.stringify(updatedUsers));
    console.log('✅ Профиль обновлен');
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, updateUser, register }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}