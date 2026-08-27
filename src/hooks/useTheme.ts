import { useState, useEffect } from 'react';

export type ThemeMode = 'light' | 'dark';

export const useTheme = () => {
  const [theme, setThemeState] = useState<ThemeMode>(() => {
    const saved = localStorage.getItem('netraai-theme');
    if (saved === 'dark' || saved === 'light') return saved;
    return 'light';
  });

  useEffect(() => {
    const root = document.documentElement;
    if (theme === 'dark') {
      root.classList.add('dark', 'dark-theme', 'dark-mode');
      root.classList.remove('light');
    } else {
      root.classList.remove('dark', 'dark-theme', 'dark-mode');
      root.classList.add('light');
    }
    localStorage.setItem('netraai-theme', theme);
  }, [theme]);

  const toggleTheme = (newTheme?: ThemeMode) => {
    if (newTheme) {
      setThemeState(newTheme);
    } else {
      setThemeState((prev) => (prev === 'dark' ? 'light' : 'dark'));
    }
  };

  return { theme, isDark: theme === 'dark', toggleTheme, setTheme: setThemeState };
};
