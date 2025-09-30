import { createContext, useContext, useEffect, useState } from 'react';
import type { ColorPalette, ThemeContextType } from '../types';
import colorUtils from '../utils/colorUtils';

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

const PALETTE_STORAGE_KEY = 'colorPalettes';

const defaultPalette: ColorPalette = {
  name: 'Default',
  colors: ['#3b82f6', '#60a5fa', '#93c5fd', '#bfdbfe', '#dbeafe'],
  primary: '#3b82f6',
  secondary: '#60a5fa',
  accent: '#93c5fd',
  background: '#ffffff',
  text: '#111827',
};

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [darkMode, setDarkMode] = useState<boolean>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('darkMode');
      return saved ? JSON.parse(saved) : window.matchMedia('(prefers-color-scheme: dark)').matches;
    }
    return false;
  });

  const [palettes, setPalettes] = useState<ColorPalette[]>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem(PALETTE_STORAGE_KEY);
      return saved ? JSON.parse(saved) : [defaultPalette];
    }
    return [defaultPalette];
  });

  const [currentPalette, setCurrentPalette] = useState<ColorPalette>(defaultPalette);

  // Save to localStorage when darkMode or palettes change
  useEffect(() => {
    localStorage.setItem('darkMode', JSON.stringify(darkMode));
    document.documentElement.classList.toggle('dark', darkMode);
  }, [darkMode]);

  useEffect(() => {
    localStorage.setItem(PALETTE_STORAGE_KEY, JSON.stringify(palettes));
  }, [palettes]);

  const toggleDarkMode = () => {
    setDarkMode(!darkMode);
  };

  const generateNewPalette = () => {
    const newPalette = colorUtils.generateRandomPalette(`Palette ${palettes.length + 1}`);
    setCurrentPalette(newPalette);
    setPalettes(prev => [newPalette, ...prev]);
  };

  const savePalette = (palette: Omit<ColorPalette, 'name'> & { name?: string }) => {
    const paletteWithName: ColorPalette = {
      name: palette.name || `Palette ${Date.now()}`,
      colors: palette.colors,
      primary: palette.primary,
      secondary: palette.secondary,
      accent: palette.accent,
      background: palette.background,
      text: palette.text,
    };

    setPalettes(prev => {
      const exists = prev.some(p => p.name === paletteWithName.name);
      if (exists) {
        return prev.map(p => p.name === paletteWithName.name ? paletteWithName : p);
      }
      return [paletteWithName, ...prev];
    });
    setCurrentPalette(paletteWithName);
  };

  const deletePalette = (paletteName: string) => {
    setPalettes(prev => {
      const newPalettes = prev.filter(p => p.name !== paletteName);
      // Se abbiamo eliminato la palette corrente, passa alla successiva disponibile
      if (currentPalette.name === paletteName && newPalettes.length > 0) {
        setCurrentPalette(newPalettes[0]);
      } else if (newPalettes.length === 0) {
        // Se non ci sono più palette, usa quella di default
        setCurrentPalette(defaultPalette);
      }
      return newPalettes;
    });
  };

  const updateCurrentPalette = (palette: ColorPalette) => {
    setCurrentPalette(palette);
  };

  // Apply the current palette to the document
  useEffect(() => {
    if (typeof document !== 'undefined') {
      const root = document.documentElement;
      root.style.setProperty('--color-primary', currentPalette.primary);
      root.style.setProperty('--color-secondary', currentPalette.secondary);
      root.style.setProperty('--color-accent', currentPalette.accent);
      root.style.setProperty('--color-background', currentPalette.background);
      root.style.setProperty('--color-text', currentPalette.text);
    }
  }, [currentPalette]);

  return (
    <ThemeContext.Provider
      value={{
        darkMode,
        toggleDarkMode,
        currentPalette,
        generateNewPalette,
        palettes,
        savePalette,
        deletePalette,
        setCurrentPalette: updateCurrentPalette,
      }}
    >
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = (): ThemeContextType => {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};

export default ThemeContext;
