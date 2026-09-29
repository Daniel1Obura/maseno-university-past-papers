import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from 'react';

export type ThemeMode = 'light' | 'dark';

export type ThemeColors = {
  background: string;
  surface: string;
  surfaceAlt: string;
  border: string;
  text: string;
  textSecondary: string;
  textMuted: string;
  primary: string;
  primaryGradient: [string, string];
  danger: string;
  dangerSurface: string;
  success: string;
  successSurface: string;
};

const lightColors: ThemeColors = {
  background: '#F5F7FB',
  surface: '#FFFFFF',
  surfaceAlt: '#EAF1FF',
  border: '#E4EAF3',
  text: '#172033',
  textSecondary: '#354154',
  textMuted: '#7B879A',
  primary: '#0756D9',
  primaryGradient: ['#0756D9', '#063B96'],
  danger: '#E53935',
  dangerSurface: '#FFF1F1',
  success: '#1FA463',
  successSurface: '#E5F7ED',
};

const darkColors: ThemeColors = {
  background: '#0F1420',
  surface: '#1A2032',
  surfaceAlt: '#212A42',
  border: '#2B3550',
  text: '#F1F4F9',
  textSecondary: '#C7CEDB',
  textMuted: '#8A97AA',
  primary: '#4C8DFF',
  primaryGradient: ['#1B3A8C', '#0F224F'],
  danger: '#FF6B67',
  dangerSurface: '#3A2020',
  success: '#4ADE95',
  successSurface: '#1C3A2A',
};

type ThemeContextValue = {
  mode: ThemeMode;
  colors: ThemeColors;
  setMode: (mode: ThemeMode) => void;
  toggleMode: () => void;
  isLoaded: boolean;
};

const ThemeContext = createContext<ThemeContextValue | undefined>(undefined);

const STORAGE_KEY = 'sci-past-papers:theme-mode';

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [mode, setModeState] = useState<ThemeMode>('light');
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    AsyncStorage.getItem(STORAGE_KEY)
      .then((saved) => {
        if (saved === 'light' || saved === 'dark') {
          setModeState(saved);
        }
      })
      .finally(() => setIsLoaded(true));
  }, []);

  const setMode = (newMode: ThemeMode) => {
    setModeState(newMode);
    AsyncStorage.setItem(STORAGE_KEY, newMode).catch((error) => {
      console.error('Failed to save theme preference:', error);
    });
  };

  const toggleMode = () => {
    setMode(mode === 'light' ? 'dark' : 'light');
  };

  const colors = mode === 'dark' ? darkColors : lightColors;

  return (
    <ThemeContext.Provider
      value={{ mode, colors, setMode, toggleMode, isLoaded }}
    >
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);

  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }

  return context;
}