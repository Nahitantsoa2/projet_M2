import { createContext, useContext } from 'react';

export const themeContext = createContext();

export const useTheme = () => useContext(themeContext);
