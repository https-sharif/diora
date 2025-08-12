import React, { createContext, useContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Theme } from '@/types/Theme';
import { useAuthStore } from '@/stores/authStore';

const THEME_KEY = 'app_theme';

interface ThemeContextType {
  theme: Theme;
  isDarkMode: boolean;
  toggleTheme: () => void;
  lightTheme: Theme;
  darkTheme: Theme;
}

const lightTheme: Theme = {
  background: '#ffffff',
  card: '#f8f9fa',
  text: '#000000',
  textSecondary: '#666666',
  border: '#e9ecef',
  primary: '#B0B0B0',
  accent: '#A9A9A9',
  accentSecondary: '#D3D3D3',
  success: '#4CAF50',
  warning: '#FF9500',
  error: '#FF3B30',
  mode: 'light',
  blue: '#007AFF',
};


const darkTheme: Theme = {
  background: '#000000',
  card: '#1c1c1e',
  text: '#ffffff',
  textSecondary: '#8e8e93',
  border: '#2c2c2e',
  primary: '#C0C0C0',
  accent: '#A9A9A9',
  accentSecondary: '#D3D3D3',
  success: '#30d158',
  warning: '#ff9f0a',
  error: '#ff453a',
  mode: 'dark',
  blue: '#007AFF',
};


const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [isDarkMode, setIsDarkMode] = useState(false);

  useEffect(() => {
    const loadTheme = async () => {
      try {
        const user = useAuthStore.getState().user;
        if (user?.settings?.theme) {
          setIsDarkMode(user.settings.theme === 'dark');
          return;
        }

        const savedTheme = await AsyncStorage.getItem(THEME_KEY);
        if (savedTheme !== null) {
          setIsDarkMode(savedTheme === 'dark');
        }
      } catch (e) {
        console.log('Failed to load theme:', e);
      }
    };

    loadTheme();

    const unsubscribe = useAuthStore.subscribe((state, prevState) => {
      if (!prevState.user && state.user?.settings?.theme) {
        setIsDarkMode(state.user.settings.theme === 'dark');
      }
      else if (state.user?.settings?.theme !== prevState.user?.settings?.theme) {
        if (state.user?.settings?.theme) {
          setIsDarkMode(state.user.settings.theme === 'dark');
        }
      }
    });

    return unsubscribe;
  }, []);

  const toggleTheme = async () => {
    try {
      const newTheme = !isDarkMode;
      setIsDarkMode(newTheme);
      
      await AsyncStorage.setItem(THEME_KEY, newTheme ? 'dark' : 'light');
    } catch (e) {
      console.log('Failed to save theme:', e);
    }
  };

  const theme = isDarkMode ? darkTheme : lightTheme;

  return (
    <ThemeContext.Provider value={{
      theme,
      isDarkMode,
      toggleTheme,
      lightTheme,
      darkTheme,
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