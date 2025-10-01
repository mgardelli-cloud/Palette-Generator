export interface ColorPalette {
  name: string;
  colors: string[];
  primary: string;
  secondary: string;
  accent: string;
  background: string;
  text: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface ThemeContextType {
  darkMode: boolean;
  toggleDarkMode: () => void;
  currentPalette: ColorPalette;
  generateNewPalette: () => void;
  palettes: ColorPalette[];
  savePalette: (palette: Omit<ColorPalette, 'name'> & { name?: string }) => void;
  deletePalette: (paletteName: string) => void;
  setCurrentPalette: (palette: ColorPalette) => void;
  colorScheme: string;
  setColorScheme: (scheme: string) => void;
  schemeList: readonly string[];
  schemeLabels: Record<string, string>;
}

export interface ColorUtils {
  generateAnalogous: (baseColor: string) => string[];
  generateComplementary: (baseColor: string) => string[];
  generateTriadic: (baseColor: string) => string[];
  generateTetradic: (baseColor: string) => string[];
  generateMonochromatic: (baseColor: string) => string[];
  hexToRgb: (hex: string) => { r: number; g: number; b: number };
  rgbToHex: (r: number, g: number, b: number) => string;
  getContrastText: (hexColor: string) => string;
  getLuminance: (hexColor: string) => number;
  getRandomColor: () => string;
  generateRandomPalette: (name?: string) => ColorPalette;
}

// Utility types
export type Omit<T, K extends keyof T> = Pick<T, Exclude<keyof T, K>>;
export type PartialBy<T, K extends keyof T> = Omit<T, K> & Partial<Pick<T, K>>;
export type WithRequired<T, K extends keyof T> = T & { [P in K]-?: T[P] };
