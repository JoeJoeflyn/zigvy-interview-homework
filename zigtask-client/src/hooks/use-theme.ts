import { useContext } from 'react';
import { ThemeContext } from '../components/theme-provider';

// hook to use theme ( theme and toggle theme)
export function useTheme() {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error('useTheme must be used within ThemeProvider');
  return ctx;
}
