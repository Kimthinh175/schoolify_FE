'use client';

import * as React from 'react';

export type Theme = 'light' | 'dark' | 'system';

interface ThemeContextType {
  theme: Theme;
  resolvedTheme: 'light' | 'dark';
  setTheme: (theme: Theme) => void;
  toggleTheme: () => void;
}

const ThemeContext = React.createContext<ThemeContextType | undefined>(undefined);

const THEME_STORAGE_KEY = 'schoolify_theme';

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setThemeState] = React.useState<Theme>('system');
  const [resolvedTheme, setResolvedTheme] = React.useState<'light' | 'dark'>('light');
  const [mounted, setMounted] = React.useState(false);

  // Apply theme to DOM
  const applyTheme = React.useCallback((targetTheme: Theme) => {
    if (typeof window === 'undefined') return;

    const root = document.documentElement;
    let effectiveTheme: 'light' | 'dark' = 'light';

    if (targetTheme === 'system') {
      const systemDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      effectiveTheme = systemDark ? 'dark' : 'light';
    } else {
      effectiveTheme = targetTheme;
    }

    if (effectiveTheme === 'dark') {
      root.classList.add('dark');
      root.setAttribute('data-theme', 'dark');
    } else {
      root.classList.remove('dark');
      root.setAttribute('data-theme', 'light');
    }

    setResolvedTheme(effectiveTheme);
  }, []);

  // Initialize theme from storage
  React.useEffect(() => {
    setMounted(true);
    let initialTheme: Theme = 'system';

    try {
      const stored = localStorage.getItem(THEME_STORAGE_KEY) as Theme | null;
      if (stored === 'light' || stored === 'dark' || stored === 'system') {
        initialTheme = stored;
      }
    } catch {}

    setThemeState(initialTheme);
    applyTheme(initialTheme);
  }, [applyTheme]);

  // Listen to system preference changes (Auto change when browser/OS theme changes)
  React.useEffect(() => {
    if (typeof window === 'undefined') return;

    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');

    const handleSystemThemeChange = (e: MediaQueryListEvent) => {
      // Only react if user is on 'system' mode
      const currentStored = localStorage.getItem(THEME_STORAGE_KEY) || 'system';
      if (currentStored === 'system') {
        const root = document.documentElement;
        if (e.matches) {
          root.classList.add('dark');
          root.setAttribute('data-theme', 'dark');
          setResolvedTheme('dark');
        } else {
          root.classList.remove('dark');
          root.setAttribute('data-theme', 'light');
          setResolvedTheme('light');
        }
      }
    };

    // Modern API
    if (mediaQuery.addEventListener) {
      mediaQuery.addEventListener('change', handleSystemThemeChange);
      return () => mediaQuery.removeEventListener('change', handleSystemThemeChange);
    } else if (mediaQuery.addListener) {
      // Legacy fallback
      mediaQuery.addListener(handleSystemThemeChange);
      return () => mediaQuery.removeListener(handleSystemThemeChange);
    }
  }, []);

  const setTheme = React.useCallback(
    (newTheme: Theme) => {
      setThemeState(newTheme);
      try {
        localStorage.setItem(THEME_STORAGE_KEY, newTheme);
      } catch {}
      applyTheme(newTheme);
    },
    [applyTheme]
  );

  const toggleTheme = React.useCallback(() => {
    // Luân phiên 3 chế độ: light -> dark -> system -> light
    setThemeState((currentTheme) => {
      let nextTheme: Theme = 'light';
      if (currentTheme === 'light') nextTheme = 'dark';
      else if (currentTheme === 'dark') nextTheme = 'system';
      else nextTheme = 'light';

      try {
        localStorage.setItem(THEME_STORAGE_KEY, nextTheme);
      } catch {}
      applyTheme(nextTheme);
      return nextTheme;
    });
  }, [applyTheme]);

  return (
    <ThemeContext.Provider value={{ theme, resolvedTheme, setTheme, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = React.useContext(ThemeContext);
  if (!context) {
    // Graceful fallback if used outside provider
    return {
      theme: 'system' as Theme,
      resolvedTheme: 'light' as 'light' | 'dark',
      setTheme: () => {},
      toggleTheme: () => {},
    };
  }
  return context;
}
