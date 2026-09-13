import React, { createContext, useContext, useEffect, useState } from 'react';
import { getUserSettings, saveUserSettings } from '../utils/userSettings';
import { darkTheme, lightTheme } from '../components/BrowserPanel/utils/theme';

const ThemeContext = createContext(null);

const getSystemTheme = () => (
  typeof window.matchMedia === 'function' && window.matchMedia('(prefers-color-scheme: dark)').matches
    ? 'dark'
    : 'light'
);

export const ThemeProvider = ({ children }) => {
  const [themeMode, setThemeModeState] = useState(() => getUserSettings().themeMode);
  const [systemTheme, setSystemTheme] = useState(getSystemTheme);
  const resolvedTheme = themeMode === 'auto' ? systemTheme : themeMode;
  const isDark = resolvedTheme === 'dark';

  useEffect(() => {
    if (typeof window.matchMedia !== 'function') return undefined;

    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    const handleChange = (event) => setSystemTheme(event.matches ? 'dark' : 'light');

    mediaQuery.addEventListener?.('change', handleChange);
    return () => mediaQuery.removeEventListener?.('change', handleChange);
  }, []);

  useEffect(() => {
    document.documentElement.dataset.theme = resolvedTheme;
    document.body.dataset.theme = resolvedTheme;
    window.electronAPI?.setTitleBarTheme?.({ mode: themeMode, resolvedTheme });
  }, [resolvedTheme, themeMode]);

  const setThemeMode = (mode) => {
    const nextMode = ['auto', 'light', 'dark'].includes(mode) ? mode : 'auto';
    setThemeModeState(nextMode);
    saveUserSettings({ ...getUserSettings(), themeMode: nextMode });
  };

  return (
    <ThemeContext.Provider
      value={{
        themeMode,
        setThemeMode,
        resolvedTheme,
        isDark,
        antdTheme: isDark ? darkTheme : lightTheme
      }}
    >
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => useContext(ThemeContext);
