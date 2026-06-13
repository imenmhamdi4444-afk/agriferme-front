import React, { createContext, useContext, useState, useEffect } from 'react';

interface DarkModeContextType {
  darkMode: boolean;
  toggleDarkMode: () => void;
  bg: string;
  cardBg: string;
  text: string;
  textSecondary: string;
  border: string;
  inputBg: string;
  tableHeaderBg: string;
  navBg: string;
  subNavBg: string;
}

const DarkModeContext = createContext<DarkModeContextType>({
  darkMode: false, toggleDarkMode: () => {},
  bg: '#ecf0f1', cardBg: '#ffffff', text: '#2c3e50',
  textSecondary: '#7f8c8d', border: '#bdc3c7', inputBg: '#ffffff',
  tableHeaderBg: '#f8f9fa', navBg: '#2c3e50', subNavBg: '#34495e',
});

export const DarkModeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [darkMode, setDarkMode] = useState(() => localStorage.getItem('darkMode') === 'true');

  useEffect(() => {
    if (darkMode) {
      document.body.classList.add('dark');
    } else {
      document.body.classList.remove('dark');
    }
    localStorage.setItem('darkMode', String(darkMode));
  }, [darkMode]);

  const toggleDarkMode = () => setDarkMode(p => !p);

  const light = {
    bg: '#ecf0f1', cardBg: '#ffffff', text: '#2c3e50',
    textSecondary: '#7f8c8d', border: '#bdc3c7', inputBg: '#ffffff',
    tableHeaderBg: '#f8f9fa', navBg: '#2c3e50', subNavBg: '#34495e',
  };
  const dark = {
    bg: '#0f1923', cardBg: '#1e2d3d', text: '#f0f4f8',
    textSecondary: '#a0aec0', border: '#2d4a6b', inputBg: '#162535',
    tableHeaderBg: '#162535', navBg: '#050d1a', subNavBg: '#0a1628',
  };

  return (
    <DarkModeContext.Provider value={{ darkMode, toggleDarkMode, ...(darkMode ? dark : light) }}>
      {children}
    </DarkModeContext.Provider>
  );
};

export const useDarkMode = () => useContext(DarkModeContext);