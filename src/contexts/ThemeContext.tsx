import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useColorScheme } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

export type ThemeMode = 'light' | 'dark' | 'auto';

interface Theme {
  mode: ThemeMode;
  colors: {
    primary: string;
    primaryLight: string;
    accent: string;
    success: string;
    successLight: string;
    error: string;
    warning: string;
    background: string;
    backgroundSecondary: string;
    textPrimary: string;
    textSecondary: string;
    textLight: string;
    textWhite: string;
    border: string;
    shadow: string;
    card: string;
    cardBorder: string;
  };
}

const lightTheme: Theme['colors'] = {
  primary: '#007AFF',
  primaryLight: '#E5F1FF',
  accent: '#FF9500',
  success: '#34C759',
  successLight: '#E5F9E7',
  error: '#FF3B30',
  warning: '#FFCC00',
  background: '#F2F2F7',
  backgroundSecondary: '#FFFFFF',
  textPrimary: '#000000',
  textSecondary: '#6E6E73',
  textLight: '#8A8A8E',
  textWhite: '#FFFFFF',
  border: '#C6C6C8',
  shadow: '#000000',
  card: '#FFFFFF',
  cardBorder: '#E5E5EA',
};

const darkTheme: Theme['colors'] = {
  primary: '#0A84FF',
  primaryLight: '#1C1C1E',
  accent: '#FF9F0A',
  success: '#30D158',
  successLight: '#1C2E1F',
  error: '#FF453A',
  warning: '#FFD60A',
  background: '#000000',
  backgroundSecondary: '#1C1C1E',
  textPrimary: '#FFFFFF',
  textSecondary: '#98989D',
  textLight: '#636366',
  textWhite: '#FFFFFF',
  border: '#38383A',
  shadow: '#000000',
  card: '#1C1C1E',
  cardBorder: '#2C2C2E',
};

interface ThemeContextType {
  theme: Theme;
  setThemeMode: (mode: ThemeMode) => Promise<void>;
  toggleTheme: () => Promise<void>;
}

const ThemeContext = createContext<ThemeContextType>({
  theme: { mode: 'auto', colors: lightTheme },
  setThemeMode: async () => {},
  toggleTheme: async () => {},
});

interface ThemeProviderProps {
  children: ReactNode;
}

const THEME_STORAGE_KEY = '@trustmint_theme_mode';

export const ThemeProvider: React.FC<ThemeProviderProps> = ({ children }) => {
  const systemColorScheme = useColorScheme();
  const [themeMode, setThemeModeState] = useState<ThemeMode>('auto');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Load saved theme preference
    AsyncStorage.getItem(THEME_STORAGE_KEY)
      .then((savedMode) => {
        if (savedMode && (savedMode === 'light' || savedMode === 'dark' || savedMode === 'auto')) {
          setThemeModeState(savedMode as ThemeMode);
        }
        setIsLoading(false);
      })
      .catch(() => {
        setIsLoading(false);
      });
  }, []);

  const getEffectiveTheme = (): Theme['colors'] => {
    if (themeMode === 'auto') {
      return systemColorScheme === 'dark' ? darkTheme : lightTheme;
    }
    return themeMode === 'dark' ? darkTheme : lightTheme;
  };

  const setThemeMode = async (mode: ThemeMode) => {
    setThemeModeState(mode);
    try {
      await AsyncStorage.setItem(THEME_STORAGE_KEY, mode);
    } catch (error) {
      console.error('Error saving theme preference:', error);
    }
  };

  const toggleTheme = async () => {
    const newMode = themeMode === 'light' ? 'dark' : 'light';
    await setThemeMode(newMode);
  };

  const theme: Theme = {
    mode: themeMode,
    colors: isLoading ? lightTheme : getEffectiveTheme(),
  };

  return (
    <ThemeContext.Provider value={{ theme, setThemeMode, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => useContext(ThemeContext);

