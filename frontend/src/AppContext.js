import React, { createContext, useContext, useState } from 'react';

const AppContext = createContext();

export function AppProvider({ children }) {
  const [darkMode, setDarkMode] = useState(false);
  const [language, setLanguage] = useState('en'); // 'en' or 'np'

  const toggleDark = () => setDarkMode(prev => !prev);
  const toggleLang = () => setLanguage(prev => prev === 'en' ? 'np' : 'en');

  return (
    <AppContext.Provider value={{ darkMode, toggleDark, language, toggleLang }}>
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  return useContext(AppContext);
}