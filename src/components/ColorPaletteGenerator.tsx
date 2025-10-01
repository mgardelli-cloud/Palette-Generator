import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTheme } from '../contexts/ThemeContext';
import { Button } from './ui/Button';
import {
  getContrastText,
  generateAnalogous,
  generateTriadic,
  generateMonochromatic,
  generateComplementary,
  generateSplitComplementary,
  generateTetradic,
} from '../utils/colorUtils';
import {
  SunIcon,
  MoonIcon,
  ArrowPathIcon,
  SwatchIcon,
  PlusIcon,
  TrashIcon,
  CheckIcon,
  ArrowDownTrayIcon,
  DocumentArrowUpIcon,
} from '@heroicons/react/24/outline';
import ColorCard from './ColorCard';
import type { ColorPalette } from '../types';

// Definizione dei tipi di schema colore
type ColorSchemeType = 'Analogous' | 'Complementary' | 'Triadic' | 'Monochromatic' | 'SplitComplementary' | 'Tetradic' | 'MonochromaticAchromatic' | 'LuminosityContrast';

// Definizioni per la UI degli schemi colore
const schemeList: ColorSchemeType[] = [
  'LuminosityContrast',
  'MonochromaticAchromatic',
  'Monochromatic',
  'Analogous',
  'Complementary',
  'Triadic',
  'SplitComplementary',
  'Tetradic'
];

const schemeLabels: Record<ColorSchemeType, string> = {
  LuminosityContrast: 'Luminosità',
  MonochromaticAchromatic: 'Mono Acromatico',
  Monochromatic: 'Monocromatico',
  Analogous: 'Analogo',
  Complementary: 'Complementare',
  Triadic: 'Triadico',
  SplitComplementary: 'Split Comp.',
  Tetradic: 'Tetradico'
};

interface Color {
  hex: string;
  description: string;
}

const ColorPaletteGenerator: React.FC = () => {
  const {
    darkMode,
    toggleDarkMode,
    currentPalette: themePalette,
    generateNewPalette,
    palettes,
    savePalette,
    deletePalette,
  } = useTheme();

  // Stato per la palette corrente con funzionalità avanzate
  const [currentPalette, setCurrentPalette] = useState<ColorPalette>(themePalette || {
    name: 'My Color Palette',
    colors: ['#4F46E5', '#7C3AED', '#EC4899', '#F59E0B', '#10B981'],
    primary: '#4F46E5',
    secondary: '#7C3AED',
    accent: '#EC4899',
    background: '#ffffff',
    text: '#111827'
  });

  // Stato per le funzionalità avanzate
  const [baseColor, setBaseColor] = useState<string>('#4F46E5');
  const [schemeType, setSchemeType] = useState<ColorSchemeType>('LuminosityContrast');
  const [reflectiveness, setReflectiveness] = useState(50);
  const [opacity, setOpacity] = useState(100);
  const [generatedPalette, setGeneratedPalette] = useState<Color[]>([]);

  // Animation key is used to force re-render
  const [showSaveSuccess, setShowSaveSuccess] = useState(false);
  const [activeTab, setActiveTab] = useState<'current' | 'saved'>('current');
  const [paletteName, setPaletteName] = useState(currentPalette.name);
  const [isEditingName, setIsEditingName] = useState(false);

  // Funzione avanzata per generare palette di colori
  const generateAdvancedPalette = (baseHex: string, scheme: ColorSchemeType): Color[] => {
    switch (scheme) {
      case 'LuminosityContrast': {
        const luminositySteps = [10, 25, 40, 55, 70, 85, 95];
        const grades = ['900', '700', '500', '300', '200', '100', '50'];
        return luminositySteps.map((l, index) => ({
          hex: generateLuminosityContrast(baseHex, l),
          description: `Sfumatura ${grades[index]} (L=${l}%)`,
        })).reverse();
      }
      case 'MonochromaticAchromatic': {
        return [
          { hex: baseHex, description: 'Base (Accento)' },
          { hex: '#FFFFFF', description: 'Neutro (Bianco)' },
          { hex: '#E5E7EB', description: 'Neutro (Grigio Chiaro)' },
          { hex: '#4B5563', description: 'Neutro (Grigio Scuro)' },
          { hex: '#000000', description: 'Neutro (Nero)' },
        ];
      }
      case 'Monochromatic': {
        return [
          { hex: baseHex, description: 'Base (Originale)' },
          ...generateMonochromatic(baseHex).slice(1).map((color, i) => ({ hex: color, description: `Mono ${i + 1}` }))
        ];
      }
      case 'Analogous': {
        return [
          { hex: baseHex, description: 'Base' },
          ...generateAnalogous(baseHex).slice(1).map((color, i) => ({ hex: color, description: `Analogo ${i + 1}` }))
        ];
      }
      case 'Complementary': {
        return [
          { hex: baseHex, description: 'Base' },
          ...generateComplementary(baseHex).slice(1).map((color, i) => ({ hex: color, description: `Complementare ${i + 1}` }))
        ];
      }
      case 'Triadic': {
        return [
          { hex: baseHex, description: 'Base' },
          ...generateTriadic(baseHex).slice(1).map((color, i) => ({ hex: color, description: `Triadico ${i + 1}` }))
        ];
      }
      case 'SplitComplementary': {
        return [
          { hex: baseHex, description: 'Base' },
          ...generateSplitComplementary(baseHex).slice(1).map((color, i) => ({ hex: color, description: `Split Comp. ${i + 1}` }))
        ];
      }
      case 'Tetradic': {
        return [
          { hex: baseHex, description: 'Base' },
          ...generateTetradic(baseHex).slice(1).map((color, i) => ({ hex: color, description: `Tetradico ${i + 1}` }))
        ];
      }
      default:
        return [];
    }
  };

  // Funzioni helper per generazione colori
  const hexToHsl = (hex: string): { h: number, s: number, l: number } => {
    let r = 0, g = 0, b = 0;
    if (hex.length === 4) {
      r = parseInt(hex[1] + hex[1], 16);
      g = parseInt(hex[2] + hex[2], 16);
      b = parseInt(hex[3] + hex[3], 16);
    } else if (hex.length === 7) {
      r = parseInt(hex.substring(1, 3), 16);
      g = parseInt(hex.substring(3, 5), 16);
      b = parseInt(hex.substring(5, 7), 16);
    }

    r /= 255;
    g /= 255;
    b /= 255;

    const max = Math.max(r, g, b);
    const min = Math.min(r, g, b);
    let h = 0, s = 0, l = (max + min) / 2;

    if (max !== min) {
      const d = max - min;
      s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
      switch (max) {
        case r: h = (g - b) / d + (g < b ? 6 : 0); break;
        case g: h = (b - r) / d + 2; break;
        case b: h = (r - g) / d + 4; break;
      }
      h /= 6;
    }

    return {
      h: Math.round(h * 360),
      s: Math.round(s * 100),
      l: Math.round(l * 100),
    };
  };

  const hslToHex = (h: number, s: number, l: number): string => {
    h /= 360;
    s /= 100;
    l /= 100;

    let r, g, b;

    if (s === 0) {
      r = g = b = l;
    } else {
      const hue2rgb = (p: number, q: number, t: number) => {
        if (t < 0) t += 1;
        if (t > 1) t -= 1;
        if (t < 1 / 6) return p + (q - p) * 6 * t;
        if (t < 1 / 2) return q;
        if (t < 2 / 3) return p + (q - p) * (2 / 3 - t) * 6;
        return p;
      };
      const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
      const p = 2 * l - q;
      r = hue2rgb(p, q, h + 1 / 3);
      g = hue2rgb(p, q, h);
      b = hue2rgb(p, q, h - 1 / 3);
    }

    const toHex = (c: number) => {
      const hex = Math.round(c * 255).toString(16);
      return hex.length === 1 ? '0' + hex : hex;
    };

    return `#${toHex(r)}${toHex(g)}${toHex(b)}`;
  };

  const generateLuminosityContrast = (hex: string, lightness: number): string => {
    const { h, s } = hexToHsl(hex);
    return hslToHex(h, s, lightness);
  };

  // Aggiorna la palette quando cambiano i parametri
  useEffect(() => {
    if (baseColor && /^#([0-9A-F]{3}){1,2}$/i.test(baseColor)) {
      const newPalette = generateAdvancedPalette(baseColor, schemeType);
      setGeneratedPalette(newPalette);

      // Aggiorna anche la palette corrente nel tema
      setCurrentPalette(prev => ({
        ...prev,
        colors: newPalette.map(c => c.hex),
        primary: newPalette[0]?.hex || baseColor,
        secondary: newPalette[1]?.hex || baseColor,
        accent: newPalette[2]?.hex || baseColor,
      }));
    }
  }, [baseColor, schemeType]);

  const handleColorSelect = useCallback((color: string) => {
    setCurrentPalette({
      ...currentPalette,
      primary: color,
      secondary: getContrastText(color),
      text: getContrastText(color),
    });
    setBaseColor(color);
  }, [currentPalette]);

  const handleSavePalette = useCallback(() => {
    if (currentPalette.colors.length === 0) {
      alert('Nessuna palette da salvare. Genera prima una palette.');
      return;
    }

    savePalette({
      ...currentPalette,
      name: paletteName.trim() || 'Unnamed Palette',
    });
    setShowSaveSuccess(true);
    setTimeout(() => setShowSaveSuccess(false), 2000);
    setIsEditingName(false);
  }, [currentPalette, paletteName, savePalette]);

  const handleExportPalette = () => {
    const paletteData = {
      name: currentPalette.name,
      colors: currentPalette.colors,
      primary: currentPalette.primary,
      secondary: currentPalette.secondary,
      accent: currentPalette.accent,
      background: currentPalette.background,
      text: currentPalette.text,
      exportedAt: new Date().toISOString(),
    };

    const blob = new Blob([JSON.stringify(paletteData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${currentPalette.name.replace(/\s+/g, '_').toLowerCase()}_palette.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleGenerateNew = useCallback(() => {
    // Genera una nuova palette usando il context
    generateNewPalette();
    // Genera anche un nuovo colore base casuale
    const newBaseColor = `#${Math.floor(Math.random() * 16777215).toString(16).padStart(6, '0')}`;
    setBaseColor(newBaseColor);
  }, [generateNewPalette]);

  const handleImportPalette = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Reset del valore dell'input per permettere di importare lo stesso file più volte
    event.target.value = '';

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const result = e.target?.result;
        if (!result || typeof result !== 'string') {
          throw new Error('Errore nella lettura del file');
        }

        const importedData = JSON.parse(result);

        // Validazione più robusta dei dati importati
        if (!importedData || typeof importedData !== 'object') {
          throw new Error('Il file non contiene dati validi');
        }

        if (!importedData.colors || !Array.isArray(importedData.colors) || importedData.colors.length === 0) {
          throw new Error('Il file non contiene colori validi');
        }

        // Validazione che tutti gli elementi siano stringhe hex valide
        const validColors = importedData.colors.filter((color: any) =>
          typeof color === 'string' && /^#([0-9A-F]{3}){1,2}$/i.test(color)
        );

        if (validColors.length === 0) {
          throw new Error('Nessun colore valido trovato nel file');
        }

        // Crea la palette importata
        const importedPalette: ColorPalette = {
          name: importedData.name || 'Imported Palette',
          colors: validColors,
          primary: importedData.primary || validColors[0],
          secondary: importedData.secondary || validColors[1] || validColors[0],
          accent: importedData.accent || validColors[2] || validColors[1] || validColors[0],
          background: importedData.background || '#ffffff',
          text: importedData.text || '#000000',
        };

        setCurrentPalette(importedPalette);
        setBaseColor(validColors[0]);

        // Mostra messaggio di successo
        alert(`Palette "${importedPalette.name}" importata con successo! (${validColors.length} colori)`);

      } catch (error) {
        console.error('Errore durante l\'importazione del file:', error);
        const errorMessage = error instanceof Error ? error.message : 'Errore sconosciuto';
        alert(`Errore durante l'importazione: ${errorMessage}\n\nAssicurati che il file sia un JSON valido con colori esadecimali.`);
      }
    };

    reader.onerror = () => {
      alert('Errore nella lettura del file. Riprova.');
    };

    reader.readAsText(file);
  }, []);

return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors duration-200">
      {/* Header */}
      <header className="bg-white dark:bg-gray-800 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            Colorful
            <span className="ml-2 text-primary-600 dark:text-primary-400">Palette</span>
          </h1>

          <div className="flex items-center space-x-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={toggleDarkMode}
              aria-label={darkMode ? 'Switch to light mode' : 'Switch to dark mode'}
            >
              {darkMode ? (
                <SunIcon className="h-5 w-5" />
              ) : (
                <MoonIcon className="h-5 w-5" />
              )}
            </Button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Controlli avanzati */}
        <div className="mb-8 p-6 bg-white dark:bg-gray-800 rounded-xl shadow-2xl border border-indigo-100 dark:border-indigo-900/50">
          <h2 className="text-lg font-medium mb-4 text-gray-700 dark:text-gray-300">Genera la tua palette perfetta</h2>

          <div className="flex flex-col lg:flex-row gap-6">
            {/* Controlli colore e schema */}
            <div className='flex flex-col w-full lg:w-1/2 gap-6'>
              {/* Input Colore Base */}
              <div className="flex flex-col">
                <label htmlFor="baseColor" className="mb-2 text-sm font-medium text-gray-600 dark:text-gray-400">
                  Colore Base (HEX):
                </label>
                <div className="flex items-stretch rounded-lg shadow-sm overflow-hidden border border-gray-300 dark:border-gray-600">
                  <input
                    type="color"
                    id="color-picker"
                    value={baseColor}
                    onChange={(e) => setBaseColor(e.target.value.toUpperCase())}
                    className="w-12 h-12 cursor-pointer border-none"
                    aria-label="Selettore colore base"
                  />
                  <input
                    type="text"
                    id="baseColor"
                    value={baseColor}
                    onChange={(e) => {
                      const value = e.target.value.toUpperCase();
                      if (value.match(/^#([0-9A-F]{0,6})$/i)) {
                        setBaseColor(value);
                      }
                    }}
                    maxLength={7}
                    className="flex-1 px-4 py-2 text-lg font-mono tracking-wider focus:ring-2 focus:ring-indigo-500 focus:outline-none dark:bg-gray-700 dark:text-white"
                    placeholder="#4F46E5"
                    aria-label="Inserisci colore esadecimale"
                    aria-describedby="base-color-help"
                  />
                </div>
                <div id="base-color-help" className="sr-only">
                  Inserisci un colore esadecimale valido nel formato #RRGGBB o #RGB
                </div>
              </div>

              {/* Selezione Schema */}
              <div className="flex flex-col">
                <label className="mb-2 text-sm font-medium text-gray-600 dark:text-gray-400">
                  Tipo di Schema:
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
                  {schemeList.map((scheme) => (
                    <button
                      key={scheme}
                      onClick={() => setSchemeType(scheme)}
                      className={`text-xs font-semibold py-2 px-2 rounded-lg border-2 transition-all ${
                        schemeType === scheme
                          ? 'bg-indigo-600 text-white border-indigo-700'
                          : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 border-gray-300 dark:border-gray-600 hover:bg-gray-200 dark:hover:bg-gray-600'
                      }`}
                      aria-pressed={schemeType === scheme}
                      aria-label={`Seleziona schema ${schemeLabels[scheme]}`}
                    >
                      {schemeLabels[scheme]}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Controlli Materiale */}
            <div className='flex flex-col w-full lg:w-1/2 gap-6 p-4 border border-gray-200 dark:border-gray-700 rounded-xl bg-gray-50 dark:bg-gray-700/50'>
              <h3 className="text-base font-semibold text-gray-700 dark:text-gray-200">
                Proprietà Materiale (Simulazione CSS)
              </h3>

              {/* Slider Riflettività */}
              <div className="flex flex-col">
                <div className='flex justify-between items-center mb-1'>
                  <label htmlFor="reflectiveness" className="text-sm font-medium text-gray-600 dark:text-gray-400">
                    Riflettività / Lucentezza:
                  </label>
                  <span className='text-sm font-mono text-indigo-600 dark:text-indigo-400'>{reflectiveness}%</span>
                </div>
                <input
                  type="range"
                  id="reflectiveness"
                  min="0"
                  max="100"
                  value={reflectiveness}
                  onChange={(e) => setReflectiveness(parseInt(e.target.value))}
                  className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer dark:bg-gray-600"
                />
                <p className='text-[11px] text-gray-500 dark:text-gray-400 mt-1'>
                  0% = Opaco/Ruvido (Matte), 100% = Riflettente/Liscio (Glossy).
                </p>
              </div>

              {/* Slider Opacità */}
              <div className="flex flex-col">
                <div className='flex justify-between items-center mb-1'>
                  <label htmlFor="opacity" className="text-sm font-medium text-gray-600 dark:text-gray-400">
                    Opacità / Trasparenza:
                  </label>
                  <span className='text-sm font-mono text-indigo-600 dark:text-indigo-400'>{opacity}%</span>
                </div>
                <input
                  type="range"
                  id="opacity"
                  min="10"
                  max="100"
                  value={opacity}
                  onChange={(e) => setOpacity(parseInt(e.target.value))}
                  className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer dark:bg-gray-600"
                />
                <p className='text-[11px] text-gray-500 dark:text-gray-400 mt-1'>
                  100% = Solido (Solid), 10% = Vetro/Plastica (Translucent).
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Visualizzazione Palette */}
        {generatedPalette.length > 0 ? (
          <div className="mt-8">
            <h2 className="text-2xl font-bold mb-6 text-gray-800 dark:text-gray-200">
              Palette Generata ({schemeType})
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
              {generatedPalette.map((color, index) => (
                <ColorCard
                  key={`${color.hex}-${index}`}
                  color={color.hex}
                  name={color.description}
                  reflectiveness={reflectiveness}
                  opacity={opacity}
                  onClick={() => handleColorSelect(color.hex)}
                  showHex={true}
                  showContrast={true}
                />
              ))}
            </div>
            <p className="mt-6 text-sm text-gray-500 dark:text-gray-400 text-center italic">
              *Clicca su una casella di colore per selezionarla come colore primario.
            </p>
          </div>
        ) : (
          <div className="mt-8 text-center p-12 bg-white dark:bg-gray-800 rounded-xl shadow-lg">
            <p className="text-xl font-medium text-red-500 dark:text-red-400">
              Inserisci un valore esadecimale valido (es. #RRGGBB) per generare la palette.
            </p>
          </div>
        )}

        {/* Controlli palette corrente */}
        <div className="mb-8 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div className="flex-1">
            {isEditingName ? (
              <div className="flex items-center space-x-2">
                <input
                  type="text"
                  value={paletteName}
                  onChange={(e) => setPaletteName(e.target.value)}
                  className="bg-transparent border-b border-gray-300 dark:border-gray-600 focus:outline-none focus:border-primary-500 text-xl font-semibold text-gray-900 dark:text-white"
                  autoFocus
                  onBlur={handleSavePalette}
                  onKeyDown={(e) => e.key === 'Enter' && handleSavePalette()}
                />
                <button
                  onClick={handleSavePalette}
                  className="text-green-500 hover:text-green-600 dark:text-green-400 dark:hover:text-green-300"
                >
                  <CheckIcon className="h-5 w-5" />
                </button>
              </div>
            ) : (
              <h2
                className="text-xl font-semibold text-gray-900 dark:text-white cursor-text hover:opacity-80 transition-opacity"
                onClick={() => setIsEditingName(true)}
              >
                {currentPalette.name}
              </h2>
            )}
            {showSaveSuccess && (
              <motion.p
                className="text-sm text-green-600 dark:text-green-400 mt-1"
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
              >
                Palette saved!
              </motion.p>
            )}
          </div>

          <div className="flex flex-wrap gap-2">
            <Button
              variant="outline"
              onClick={() => setActiveTab(activeTab === 'current' ? 'saved' : 'current')}
              className="flex items-center gap-1.5"
              aria-label={`Passa a ${activeTab === 'current' ? 'palette salvate' : 'palette corrente'}`}
            >
              <SwatchIcon className="h-4 w-4" />
              {activeTab === 'current' ? 'Saved Palettes' : 'Current Palette'}
            </Button>

            <Button
              onClick={handleGenerateNew}
              className="flex items-center gap-1.5 text-gray-900 dark:text-white"
              aria-label="Genera nuova palette casuale"
              variant="primary"
            >
              <ArrowPathIcon className="h-4 w-4" />
              Generate New
            </Button>

            <Button
              variant="outline"
              onClick={handleExportPalette}
              className="flex items-center gap-1.5 text-gray-900 dark:text-white"
              aria-label="Esporta palette corrente come file JSON"
            >
              <ArrowDownTrayIcon className="h-4 w-4" />
              Export JSON
            </Button>

            <Button
              variant="outline"
              className="flex items-center gap-1.5"
              onClick={() => document.getElementById('import-palette')?.click()}
              aria-label="Importa palette da file JSON"
            >
              <DocumentArrowUpIcon className="h-4 w-4" />
              Import JSON
            </Button>

            {activeTab === 'current' && (
              <Button
                variant="primary"
                onClick={handleSavePalette}
                className="flex items-center gap-1.5"
              >
                <PlusIcon className="h-4 w-4" />
                Save Palette
              </Button>
            )}
          </div>
        </div>

        {/* Main Content */}
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
            className="space-y-6"
          >
            {activeTab === 'current' ? (
              <div className="space-y-6">
                {/* Primary Colors */}
                <div>
                  <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Primary Colors</h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
                    <ColorCard
                      color={currentPalette.primary}
                      name="Primary"
                      onClick={() => handleColorSelect(currentPalette.primary)}
                    />
                    <ColorCard
                      color={currentPalette.secondary}
                      name="Secondary"
                      onClick={() => handleColorSelect(currentPalette.secondary)}
                    />
                    <ColorCard
                      color={currentPalette.accent}
                      name="Accent"
                      onClick={() => handleColorSelect(currentPalette.accent)}
                    />
                  </div>
                </div>

                {/* Color Palette */}
                <div>
                  <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Color Palette</h3>
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 lg:grid-cols-10 gap-3">
                    {currentPalette.colors.map((color, index) => (
                      <div
                        key={`${color}-${index}`}
                        className="aspect-square rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-shadow cursor-pointer"
                        style={{ backgroundColor: color }}
                        onClick={() => handleColorSelect(color)}
                        title={`${color.toUpperCase()}`}
                      >
                        <div className="h-full w-full group relative">
                          <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity bg-black/30">
                            <span className="text-white text-xs font-mono font-bold px-2 py-1 bg-black/50 rounded">
                              {color.toUpperCase()}
                            </span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Color Harmony */}
                <div>
                  <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Color Harmony</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    <div>
                      <h4 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-2">Analogous</h4>
                      <div className="grid grid-cols-5 gap-2">
                        {generateAnalogous(currentPalette.primary).map((color: string, i: number) => (
                          <div
                            key={`analogous-${i}`}
                            className="aspect-square rounded-md"
                            style={{ backgroundColor: color }}
                            title={`${color.toUpperCase()}`}
                          />
                        ))}
                      </div>
                    </div>

                    <div>
                      <h4 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-2">Triadic</h4>
                      <div className="grid grid-cols-3 gap-2">
                        {generateTriadic(currentPalette.primary).map((color: string, i: number) => (
                          <div
                            key={`triadic-${i}`}
                            className="aspect-square rounded-md"
                            style={{ backgroundColor: color }}
                            title={`${color.toUpperCase()}`}
                          />
                        ))}
                      </div>
                    </div>

                    <div>
                      <h4 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-2">Monochromatic</h4>
                      <div className="grid grid-cols-5 gap-2">
                        {generateMonochromatic(currentPalette.primary).map((color: string, i: number) => (
                          <div
                            key={`mono-${i}`}
                            className="aspect-square rounded-md"
                            style={{ backgroundColor: color }}
                            title={`${color.toUpperCase()}`}
                          />
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div>
                <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Saved Palettes</h3>

                {palettes.length === 0 ? (
                  <div className="text-center py-12 bg-white dark:bg-gray-800 rounded-lg shadow">
                    <SwatchIcon className="mx-auto h-12 w-12 text-gray-400" />
                    <h3 className="mt-2 text-sm font-medium text-gray-900 dark:text-white">No saved palettes</h3>
                    <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                      Generate and save your first palette to see it here.
                    </p>
                    <div className="mt-6">
                      <Button
                        onClick={() => setActiveTab('current')}
                        variant="primary"
                      >
                        <PlusIcon className="-ml-1 mr-2 h-5 w-5" />
                        New Palette
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                    {palettes.map((palette) => (
                      <motion.div
                        key={palette.name}
                        className="bg-white dark:bg-gray-800 rounded-xl shadow-md overflow-hidden border border-gray-100 dark:border-gray-700"
                        whileHover={{ y: -4, boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.1)' }}
                        transition={{ duration: 0.2 }}
                      >
                        <div className="p-4">
                          <div className="flex justify-between items-start">
                            <h4 className="font-medium text-gray-900 dark:text-white">{palette.name}</h4>
                            <div className="flex space-x-2">
                              <button
                                onClick={() => {
                                  setCurrentPalette(palette);
                                  setActiveTab('current');
                                }}
                                className="text-primary-600 hover:text-primary-800 dark:text-primary-400 dark:hover:text-primary-300"
                                title="Use this palette"
                              >
                                <CheckIcon className="h-5 w-5" />
                              </button>
                              <button
                                onClick={() => deletePalette(palette.name)}
                                className="text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-300"
                                title="Delete palette"
                              >
                                <TrashIcon className="h-5 w-5" />
                              </button>
                            </div>
                          </div>
                          <div className="mt-3 grid grid-cols-5 gap-1">
                            {palette.colors.slice(0, 5).map((color, i) => (
                              <div
                                key={`${palette.name}-${i}`}
                                className="aspect-square rounded"
                                style={{ backgroundColor: color }}
                                title={`${color.toUpperCase()}`}
                              />
                            ))}
                          </div>
                          <div className="mt-2 flex items-center justify-between text-xs text-gray-500 dark:text-gray-400">
                            <span>{palette.colors.length} colors</span>
                            <span>
                              {new Date().toLocaleDateString()}
                            </span>
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </motion.div>
        </AnimatePresence>
      </main>

      <footer className="mt-16 py-6 border-t border-gray-200 dark:border-gray-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <p className="text-center text-sm text-gray-500 dark:text-gray-400">
            Created with ❤️ using React, TypeScript & Tailwind CSS
          </p>
        </div>
      </footer>

      {/* Hidden input for importing palettes */}
      <input
        id="import-palette"
        type="file"
        accept=".json"
        onChange={handleImportPalette}
        className="hidden"
      />
    </div>
  );
};

export default ColorPaletteGenerator;
