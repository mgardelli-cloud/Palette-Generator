import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { generateRandomPalette } from '../utils/colorUtils';
import type { ColorPalette } from '../types';

interface ThemeState {
  darkMode: boolean;
  currentPalette: ColorPalette;
  palettes: ColorPalette[];
  toggleDarkMode: () => void;
  generateNewPalette: () => void;
  savePalette: (palette: Omit<ColorPalette, 'name'> & { name?: string }) => void;
  deletePalette: (paletteName: string) => void;
  setCurrentPalette: (palette: ColorPalette) => void;
}

export const useThemeStore = create<ThemeState>()(
  persist(
    (set) => ({
      darkMode: false,
      currentPalette: {
        name: 'Default',
        colors: ['#3b82f6', '#60a5fa', '#93c5fd', '#bfdbfe', '#dbeafe'],
        primary: '#3b82f6',
        secondary: '#60a5fa',
        accent: '#93c5fd',
        background: '#ffffff',
        text: '#111827',
      },
      palettes: [],
      toggleDarkMode: () => {
        set((state) => {
          const newDarkMode = !state.darkMode;
          document.documentElement.classList.toggle('dark', newDarkMode);
          return { darkMode: newDarkMode };
        });
      },
      generateNewPalette: () => {
        const newPalette = generateRandomPalette('New Palette');
        set({ currentPalette: newPalette });
      },
      savePalette: (palette) => {
        set((state) => {
          const paletteName = palette.name || `Palette ${state.palettes.length + 1}`;
          const existingIndex = state.palettes.findIndex(p => p.name === paletteName);
          const newPalette = { 
            ...palette, 
            name: paletteName,
            updatedAt: new Date().toISOString(),
            createdAt: (palette as any).createdAt || new Date().toISOString(),
          };
          
          if (existingIndex >= 0) {
            const updatedPalettes = [...state.palettes];
            updatedPalettes[existingIndex] = newPalette;
            return { palettes: updatedPalettes };
          }
          
          return { palettes: [...state.palettes, newPalette] };
        });
      },
      deletePalette: (paletteName) => {
        set((state) => ({
          palettes: state.palettes.filter(p => p.name !== paletteName)
        }));
      },
      setCurrentPalette: (palette) => {
        set({ currentPalette: palette });
      },
    }),
    {
      name: 'theme-storage',
      partialize: (state) => ({ 
        darkMode: state.darkMode,
        palettes: state.palettes,
      }),
    }
  )
);

// Hook personalizzati per un accesso più pulito
export const useCurrentPalette = () => 
  useThemeStore((state) => state.currentPalette);

export const usePalettes = () => 
  useThemeStore((state) => state.palettes);

export const useThemeActions = () => 
  useThemeStore((state) => ({
    toggleDarkMode: state.toggleDarkMode,
    generateNewPalette: state.generateNewPalette,
    savePalette: state.savePalette,
    deletePalette: state.deletePalette,
    setCurrentPalette: state.setCurrentPalette,
  }));
