import type { ColorPalette } from '../types';

// Export individual functions
export const getRandomColor = (): string => {
  return `#${Math.floor(Math.random() * 16777215).toString(16).padStart(6, '0')}`;
};

export const hexToRgb = (hex: string): { r: number; g: number; b: number } => {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result ? {
    r: parseInt(result[1], 16),
    g: parseInt(result[2], 16),
    b: parseInt(result[3], 16)
  } : { r: 0, g: 0, b: 0 };
};

export const rgbToHex = (r: number, g: number, b: number): string => {
  return `#${[r, g, b].map(x => {
    const hex = x.toString(16);
    return hex.length === 1 ? '0' + hex : hex;
  }).join('')}`;
};

export const getLuminance = (hexColor: string): number => {
  const { r, g, b } = hexToRgb(hexColor);
  const a = [r, g, b].map(v => {
    v /= 255;
    return v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4);
  });
  return a[0] * 0.2126 + a[1] * 0.7152 + a[2] * 0.0722;
};

export const getContrastText = (hexColor: string): string => {
  const luminance = getLuminance(hexColor);
  return luminance > 0.5 ? '#000000' : '#ffffff';
};

export const generateAnalogous = (baseColor: string): string[] => {
  const baseHsl = hexToHsl(baseColor);
  const colors: string[] = [];

  for (let i = -2; i <= 2; i++) {
    const hue = (baseHsl.h + i * 30 + 360) % 360;
    colors.push(hslToHex(hue, baseHsl.s, baseHsl.l));
  }

  return colors;
};

export const generateComplementary = (baseColor: string): string[] => {
  const baseHsl = hexToHsl(baseColor);
  const complementaryHue = (baseHsl.h + 180) % 360;
  return [
    baseColor,
    hslToHex(complementaryHue, baseHsl.s, baseHsl.l)
  ];
};

export const generateTriadic = (baseColor: string): string[] => {
  const baseHsl = hexToHsl(baseColor);
  return [
    baseColor,
    hslToHex((baseHsl.h + 120) % 360, baseHsl.s, baseHsl.l),
    hslToHex((baseHsl.h + 240) % 360, baseHsl.s, baseHsl.l)
  ];
};

export const generateSplitComplementary = (baseColor: string): string[] => {
  const baseHsl = hexToHsl(baseColor);
  const complementaryHue = (baseHsl.h + 180) % 360;
  return [
    baseColor,
    hslToHex((complementaryHue + 30) % 360, baseHsl.s, baseHsl.l),
    hslToHex((complementaryHue - 30 + 360) % 360, baseHsl.s, baseHsl.l)
  ];
};

export const generateTetradic = (baseColor: string): string[] => {
  const baseHsl = hexToHsl(baseColor);
  return [
    baseColor,
    hslToHex((baseHsl.h + 90) % 360, baseHsl.s, baseHsl.l),
    hslToHex((baseHsl.h + 180) % 360, baseHsl.s, baseHsl.l),
    hslToHex((baseHsl.h + 270) % 360, baseHsl.s, baseHsl.l)
  ];
};

export const generateMonochromatic = (baseColor: string): string[] => {
  const baseHsl = hexToHsl(baseColor);
  const colors: string[] = [];

  for (let i = 0; i < 5; i++) {
    const lightness = 10 + (i * 20);
    colors.push(hslToHex(baseHsl.h, baseHsl.s, lightness));
  }

  return colors;
};

export const generateMonochromaticAchromatic = (baseColor: string): string[] => {
  return [
    baseColor,
    '#FFFFFF',
    '#E5E7EB',
    '#4B5563',
    '#000000',
  ];
};

export const generateLuminosityContrast = (baseColor: string, lightness: number): string => {
  const baseHsl = hexToHsl(baseColor);
  return hslToHex(baseHsl.h, baseHsl.s, lightness);
};

// Helper: Convert hex to HSL
export const hexToHsl = (hex: string): { h: number; s: number; l: number } => {
  let { r, g, b } = hexToRgb(hex);
  r /= 255, g /= 255, b /= 255;

  const max = Math.max(r, g, b), min = Math.min(r, g, b);
  let h = 0, s, l = (max + min) / 2;

  if (max === min) {
    h = s = 0; // achromatic
  } else {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);

    switch (max) {
      case r: h = (g - b) / d + (g < b ? 6 : 0); break;
      case g: h = (b - r) / d + 2; break;
      case b: h = (r - g) / d + 4; break;
    }

    h /= 6;
  }

  return { h: Math.round(h * 360), s: Math.round(s * 100), l: Math.round(l * 100) };
};

// Helper: Convert HSL to hex
export const hslToHex = (h: number, s: number, l: number): string => {
  s /= 100;
  l /= 100;

  let c = (1 - Math.abs(2 * l - 1)) * s;
  let x = c * (1 - Math.abs((h / 60) % 2 - 1));
  let m = l - c / 2;
  let r = 0, g = 0, b = 0;

  if (0 <= h && h < 60) {
    r = c; g = x; b = 0;
  } else if (60 <= h && h < 120) {
    r = x; g = c; b = 0;
  } else if (120 <= h && h < 180) {
    r = 0; g = c; b = x;
  } else if (180 <= h && h < 240) {
    r = 0; g = x; b = c;
  } else if (240 <= h && h < 300) {
    r = x; g = 0; b = c;
  } else if (300 <= h && h < 360) {
    r = c; g = 0; b = x;
  }

  r = Math.round((r + m) * 255);
  g = Math.round((g + m) * 255);
  b = Math.round((b + m) * 255);

  return rgbToHex(r, g, b);
};

// Generate a random palette
export const generateRandomPalette = (name: string): ColorPalette => {
  const baseColor = getRandomColor();
  const schemes: Array<(color: string) => string[]> = [
    generateAnalogous,
    generateComplementary,
    generateTriadic,
    generateTetradic,
    generateMonochromatic
  ];

  const scheme = schemes[Math.floor(Math.random() * schemes.length)];
  const colors = scheme(baseColor);

  const primaryColor = colors[0];
  return {
    name: name || `Palette ${Math.floor(Math.random() * 1000)}`,
    colors,
    primary: primaryColor,
    secondary: colors[1] || primaryColor,
    accent: colors[2] || colors[1] || primaryColor,
    background: getContrastText(primaryColor) === '#ffffff' ? '#111827' : '#f9fafb',
    text: getContrastText(primaryColor)
  };
};

// Export all functions as default for backward compatibility
export default {
  getRandomColor,
  hexToRgb,
  rgbToHex,
  getLuminance,
  getContrastText,
  generateAnalogous,
  generateComplementary,
  generateTriadic,
  generateTetradic,
  generateMonochromatic,
  generateSplitComplementary,
  generateMonochromaticAchromatic,
  generateLuminosityContrast,
  hexToHsl,
  hslToHex,
  generateRandomPalette
};
