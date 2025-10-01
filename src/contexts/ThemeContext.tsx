import { createContext, useContext, useEffect, useState, useCallback, useMemo } from 'react';
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

// Available color schemes
const schemeList = [
  'LuminosityContrast',
  'MonochromaticAchromatic',
  'Monochromatic',
  'Analogous',
  'Complementary',
  'Triadic',
  'SplitComplementary',
  'Tetradic'
] as const;

// Color scheme labels
const schemeLabels: Record<string, string> = {
  LuminosityContrast: 'Luminosità',
  MonochromaticAchromatic: 'Mono Acromatico',
  Monochromatic: 'Monocromatico',
  Analogous: 'Analogo',
  Complementary: 'Complementare',
  Triadic: 'Triadico',
  SplitComplementary: 'Split Comp.',
  Tetradic: 'Tetradico'
};

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [darkMode, setDarkMode] = useState<boolean>(() => {
    if (typeof window !== 'undefined') {
      const savedTheme = localStorage.getItem('darkMode');
      return savedTheme ? JSON.parse(savedTheme) : window.matchMedia('(prefers-color-scheme: dark)').matches;
    }
    return false;
  });
  
  const [colorScheme, setColorScheme] = useState<string>('Analogous');
  
  // Save dark mode preference to localStorage and update document class
  useEffect(() => {
    localStorage.setItem('darkMode', JSON.stringify(darkMode));
    document.documentElement.classList.toggle('dark', darkMode);
  }, [darkMode]);

  const [palettes, setPalettes] = useState<ColorPalette[]>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem(PALETTE_STORAGE_KEY);
      return saved ? JSON.parse(saved) : [defaultPalette];
    }
    return [defaultPalette];
  });

  const [currentPalette, setCurrentPalette] = useState<ColorPalette>(defaultPalette);

  // Save palettes to localStorage when they change
  useEffect(() => {
    localStorage.setItem(PALETTE_STORAGE_KEY, JSON.stringify(palettes));
  }, [palettes]);

  const toggleDarkMode = useCallback(() => {
    setDarkMode(prev => !prev);
  }, []);

  const generateNewPalette = useCallback((): ColorPalette => {
    const newPalette = colorUtils.generateRandomPalette(`Palette ${palettes.length + 1}`);
    setCurrentPalette(newPalette);
    setPalettes(prev => [newPalette, ...prev]);
    return newPalette;
  }, [palettes.length]);

  const savePalette = useCallback((palette: Omit<ColorPalette, 'name'> & { name?: string }) => {
    const paletteWithName: ColorPalette = {
      name: palette.name || `Palette ${Date.now()}`,
      colors: [...palette.colors],
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
  }, []);

  const deletePalette = useCallback((paletteName: string) => {
    setPalettes(prev => {
      const newPalettes = prev.filter(p => p.name !== paletteName);
      // If we deleted the current palette, switch to the next available one
      if (currentPalette.name === paletteName) {
        setCurrentPalette(newPalettes[0] || defaultPalette);
      }
      return newPalettes;
    });
  }, [currentPalette.name]);

  const updateCurrentPalette = useCallback((palette: ColorPalette) => {
    setCurrentPalette(palette);
  }, []);

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

  // Create the context value
  const contextValue = useMemo(() => ({
    darkMode,
    toggleDarkMode,
    currentPalette,
    generateNewPalette,
    palettes,
    savePalette,
    deletePalette,
    setCurrentPalette: updateCurrentPalette,
    colorScheme,
    setColorScheme,
    schemeList,
    schemeLabels
  }), [
    darkMode,
    toggleDarkMode,
    currentPalette,
    generateNewPalette,
    palettes,
    savePalette,
    deletePalette,
    updateCurrentPalette,
    colorScheme,
    setColorScheme
  ]);

  return (
    <ThemeContext.Provider value={contextValue}>
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
