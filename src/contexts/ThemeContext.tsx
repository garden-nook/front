import { createContext, useContext, useState, useEffect } from 'react';
import type { ReactNode } from 'react';

type Theme = 'light' | 'dark';

interface ThemeColors {
  // Фоны
  bgPrimary: string;
  bgSecondary: string;
  bgCard: string;
  bgInput: string;
  bgHover: string;
  
  // Текст
  textPrimary: string;
  textSecondary: string;
  textMuted: string;
  
  // Границы
  border: string;
  borderLight: string;
  
  // Акценты
  primary: string;
  primaryHover: string;
  primaryText: string;
  danger: string;
  dangerBg: string;
  success: string;
  successBg: string;
  warning: string;
  warningBg: string;
  
  // Шапка
  headerBg: string;
  headerBorder: string;
  
  // Специальные
  canvasBg: string;
  bedDefault: string;
  bedSelected: string;
  bedBorder: string;
  modalOverlay: string;
}

const lightColors: ThemeColors = {
  bgPrimary: '#F8FAFC',
  bgSecondary: 'white',
  bgCard: 'white',
  bgInput: 'white',
  bgHover: '#F3F4F6',
  textPrimary: '#1F2937',
  textSecondary: '#4B5563',
  textMuted: '#6B7280',
  border: '#E5E7EB',
  borderLight: '#D1D5DB',
  primary: '#22C55E',
  primaryHover: '#16A34A',
  primaryText: 'white',
  danger: '#DC2626',
  dangerBg: '#FEE2E2',
  success: '#16A34A',
  successBg: '#DCFCE7',
  warning: '#F59E0B',
  warningBg: '#FEF3C7',
  headerBg: 'white',
  headerBorder: '#22C55E',
  canvasBg: '#D1D5DB',
  bedDefault: '#D1D5DB',
  bedSelected: '#9CA3AF',
  bedBorder: '#9CA3AF',
  modalOverlay: 'rgba(0, 0, 0, 0.5)',
};

const darkColors: ThemeColors = {
  bgPrimary: '#0F172A',
  bgSecondary: '#1E293B',
  bgCard: '#1E293B',
  bgInput: '#334155',
  bgHover: '#334155',
  textPrimary: '#F1F5F9',
  textSecondary: '#CBD5E1',
  textMuted: '#94A3B8',
  border: '#334155',
  borderLight: '#475569',
  primary: '#22C55E',
  primaryHover: '#16A34A',
  primaryText: 'white',
  danger: '#EF4444',
  dangerBg: '#7F1D1D',
  success: '#10B981',
  successBg: '#064E3B',
  warning: '#F59E0B',
  warningBg: '#78350F',
  headerBg: '#1E293B',
  headerBorder: '#22C55E',
  canvasBg: '#475569',
  bedDefault: '#64748B',
  bedSelected: '#94A3B8',
  bedBorder: '#475569',
  modalOverlay: 'rgba(0, 0, 0, 0.7)',
};

interface ThemeContextType {
  theme: Theme;
  toggleTheme: () => void;
  colors: ThemeColors;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [theme, setTheme] = useState<Theme>(() => {
    const saved = localStorage.getItem('theme');
    return (saved === 'dark' || saved === 'light') ? saved : 'light';
  });

  useEffect(() => {
    localStorage.setItem('theme', theme);
    // Меняем цвет фона body для плавного перехода
    document.body.style.backgroundColor = theme === 'dark' ? '#0F172A' : '#F8FAFC';
    document.body.style.transition = 'background-color 0.3s ease';
  }, [theme]);

  const toggleTheme = () => {
    setTheme(prev => prev === 'light' ? 'dark' : 'light');
  };

  const colors = theme === 'dark' ? darkColors : lightColors;

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme, colors }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within ThemeProvider');
  }
  return context;
}