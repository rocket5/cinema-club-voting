import React, { createContext, useState, useContext, useEffect } from 'react';

const AppModeContext = createContext();

export function AppModeProvider({ children }) {
  const [isHostMode, setIsHostMode] = useState(() => {
    try {
      const saved = localStorage.getItem('isHostMode');
      return saved ? JSON.parse(saved) : false;
    } catch {
      return false;
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem('isHostMode', JSON.stringify(isHostMode));
    } catch (error) {
      console.error('Failed to save mode to localStorage:', error);
    }
  }, [isHostMode]);

  const toggleMode = () => {
    setIsHostMode(prev => !prev);
  };

  const value = {
    isHostMode,
    toggleMode
  };

  return (
    <AppModeContext.Provider value={value}>
      {children}
    </AppModeContext.Provider>
  );
}

export function useAppMode() {
  const context = useContext(AppModeContext);
  if (context === undefined) {
    throw new Error('useAppMode must be used within an AppModeProvider');
  }
  return context;
}
