import React, { createContext, useContext, useState, ReactNode } from 'react';

export type GardenTheme = 'spring' | 'summer' | 'autumn' | 'winter';

interface GardenThemeContextType {
  gardenTheme: GardenTheme;
  setGardenTheme: (theme: GardenTheme) => void;
}

const GardenThemeContext = createContext<GardenThemeContextType | undefined>(undefined);

export function useGardenTheme() {
  const context = useContext(GardenThemeContext);
  if (!context) {
    throw new Error('useGardenTheme must be used within a GardenThemeProvider');
  }
  return context;
}

export function GardenThemeProvider({ children }: { children: ReactNode }) {
  const [gardenTheme, setGardenTheme] = useState<GardenTheme>('spring');
  return (
    <GardenThemeContext.Provider value={{ gardenTheme, setGardenTheme }}>
      {children}
    </GardenThemeContext.Provider>
  );
} 