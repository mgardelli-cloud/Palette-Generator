export interface ColorPalette {
  name: string;
  colors: string[];
  primary: string;
  secondary: string;
  accent: string;
  background: string;
  text: string;
}

export interface ThemeContextType {
  darkMode: boolean;
  toggleDarkMode: () => void;
  currentPalette: ColorPalette;
  generateNewPalette: () => void;
  palettes: ColorPalette[];
  savePalette: (palette: ColorPalette) => void;
  deletePalette: (paletteName: string) => void;
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
}
