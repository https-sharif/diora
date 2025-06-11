import React, { createContext, useContext, useState, useEffect } from 'react';
import { Platform } from 'react-native';

interface Theme {
  background: string;
  card: string;
  text: string;
  textSecondary: string;
  border: string;
  primary: string;
  success: string;
  warning: string;
  error: string;
}

interface ThemeContextType {
  theme: Theme;
  isDarkMode: boolean;
  toggleTheme: () => void;
}

const lightTheme: Theme = {
  background: '#f8f9fa',
  card: '#ffffff',
  text: '#000000',
  textSecondary: '#666666',
  border: '#e9ecef',
  primary: '#007AFF',
  success: '#4CAF50',
  warning: '#FF9500',
  error: '#FF3B30',
};

const darkTheme: Theme = {
  background: '#000000',
  card: '#1c1c1e',
  text: '#ffffff',
  textSecondary: '#8e8e93',
  border: '#38383a',
  primary: '#0a84ff',
  success: '#30d158',
  warning: '#ff9f0a',
  error: '#ff453a',
};

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [isDarkMode, setIsDarkMode] = useState(false);

  useEffect(() => {
    // In a real app, you'd load the saved theme preference from storage
    // For now, we'll default to light mode
  }, []);

  const toggleTheme = () => {
    setIsDarkMode(prev => !prev);
    // In a real app, you'd save the preference to storage here
  };

  const theme = isDarkMode ? darkTheme : lightTheme;

  return (
    <ThemeContext.Provider value={{
      theme,
      isDarkMode,
      toggleTheme,
    }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
}