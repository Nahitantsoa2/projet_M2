import { useEffect, useState, useMemo, useCallback } from 'react';
import { themeContext } from './ThemeContext';

export const ThemeProvider = ({ children }) => {
  const [isDarkMode, setIsDarkMode] = useState(() => {
    const saved = localStorage.getItem('darkMode');
    return saved === 'true' ? true : false;
  });

  useEffect(() => {
    localStorage.setItem('darkMode', isDarkMode);
    if (isDarkMode) {
      document.body.classList.add('dark');
      document.documentElement.classList.add('dark');
    } else {
      document.body.classList.remove('dark');
      document.documentElement.classList.remove('dark');
    }
  }, [isDarkMode]);

  const toggleTheme = useCallback(() => {
    setIsDarkMode((prev) => !prev);
  }, []);

  const value = useMemo(() => ({ isDarkMode, toggleTheme }), [isDarkMode, toggleTheme]);

  return (
    <themeContext.Provider value={value}>
      {children}
    </themeContext.Provider>
  );
};
