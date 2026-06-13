import React, { createContext, useContext, useState, useEffect } from 'react';

interface ThemeContextType {
  darkMode: boolean;
  toggleDark: () => void;
  c: {
    bg: string;
    card: string;
    text: string;
    textSecondary: string;
    border: string;
    input: string;
    tableHeader: string;
    hover: string;
    navBg: string;
    subNavBg: string;
  };
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [darkMode, setDarkMode] = useState(() => localStorage.getItem('darkMode') === 'true');

  useEffect(() => {
    localStorage.setItem('darkMode', String(darkMode));
  }, [darkMode]);

  const toggleDark = () => setDarkMode(prev => !prev);

  const c = darkMode ? {
    bg: '#0f1923',
    card: '#1e2d3d',
    text: '#f0f4f8',
    textSecondary: '#a8b8c8',
    border: '#2d4055',
    input: '#16253a',
    tableHeader: '#162535',
    hover: '#253a50',
    navBg: '#0a1520',
    subNavBg: '#0d1e2d',
  } : {
    bg: '#ecf0f1',
    card: '#ffffff',
    text: '#2c3e50',
    textSecondary: '#7f8c8d',
    border: '#bdc3c7',
    input: '#ffffff',
    tableHeader: '#f8f9fa',
    hover: '#f0f4f8',
    navBg: '#2c3e50',
    subNavBg: '#34495e',
  };

  return (
    <ThemeContext.Provider value={{ darkMode, toggleDark, c }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error('useTheme must be used within ThemeProvider');
  return ctx;
};