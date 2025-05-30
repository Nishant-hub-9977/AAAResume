import React, { createContext, useContext, useEffect, useState } from 'react';
import { ThemeMode, getThemePreference, setThemePreference, applyTheme } from '../styles/tokens';

interface ThemeContextType {
  theme: ThemeMode;
  setTheme: (theme: ThemeMode) => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [theme, setThemeState] = useState<ThemeMode>(getThemePreference());

  const setTheme = (newTheme: ThemeMode) => {
    setThemeState(newTheme);
    setThemePreference(newTheme);
  };

  useEffect(() => {
    // Apply theme on initial load
    applyTheme(theme);

    // Listen for OS theme changes if using system preference
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    const handleChange = () => {
      if (theme === 'system') {
        applyTheme('system');
      }
    };

    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, [theme]);

  return (
    <ThemeContext.Provider value={{ theme, setTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = (): ThemeContextType => {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};