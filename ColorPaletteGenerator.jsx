import React, { useState, useCallback, useMemo, useEffect } from 'react';

// --- Tipi di Colore e Schema ---

/**
 * Definisce l'interfaccia per un singolo colore con il suo valore esadecimale e la descrizione dello schema.
 * Viene utilizzato per tipizzare l'output della palette.
 */
interface Color {
  hex: string;
  description: string;
}

/**
 * Definisce i tipi di schema di colore supportati dall'applicazione.
 */
type ColorSchemeType = 'Analogous' | 'Complementary' | 'Triadic' | 'Monochromatic' | 'SplitComplementary' | 'Tetradic' | 'MonochromaticAchromatic' | 'LuminosityContrast';

// --- Logica HSL per la Manipolazione dei Colori ---

/**
 * Converte il colore da HEX a HSL.
 * @param hex Il colore esadecimale (es. "#FF0000").
 * @returns Un oggetto con tonalità (h), saturazione (s) e luminosità (l).
 */
const hexToHsl = (hex: string): { h: number, s: number, l: number } => {
  let r = 0, g = 0, b = 0;
  // Gestione esadecimale abbreviata o completa
  if (hex.length === 4) {
    r = parseInt(hex[1] + hex[1], 16);
    g = parseInt(hex[2] + hex[2], 16);
    b = parseInt(hex[3] + hex[3], 16);
  } else if (hex.length === 7) {
    r = parseInt(hex.substring(1, 3), 16);
    g = parseInt(hex.substring(3, 5), 16);
    b = parseInt(hex.substring(5, 7), 16);
  } else {
    return { h: 0, s: 0, l: 0 }; // Fallback
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

  // Ritorna HSL con H in [0, 360), S e L in [0, 100]
  return {
    h: Math.round(h * 360),
    s: Math.round(s * 100),
    l: Math.round(l * 100),
  };
};

/**
 * Converte il colore da HSL a HEX.
 * @param h Tonalità (0-360)
 * @param s Saturazione (0-100)
 * @param l Luminosità (0-100)
 * @returns Il valore esadecimale del colore (es. "#FF0000").
 */
const hslToHex = (h: number, s: number, l: number): string => {
  h /= 360;
  s /= 100;
  l /= 100;

  let r, g, b;

  if (s === 0) {
    r = g = b = l; // Grayscale
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

/**
 * Normalizza la tonalità (h) in un intervallo [0, 360).
 */
const normalizeHue = (h: number): number => (h % 360 + 360) % 360;

// --- Logica di Generazione della Palette ---

/**
 * Genera una palette di colori in base al colore base e al tipo di schema.
 * @param baseHex Il colore esadecimale di base.
 * @param scheme Il tipo di schema di colore.
 * @returns Una lista di oggetti Color.
 */
const generatePalette = (baseHex: string, scheme: ColorSchemeType): Color[] => {
  const baseHsl = hexToHsl(baseHex);
  const { h: baseH, s: baseS, l: baseL } = baseHsl;

  // Funzione helper per generare sfumature attorno a un dato Hue (H)
  const getShades = (hue: number, label: string): Color[] => {
    const h = normalizeHue(hue);
    
    // Per i colori principali, usiamo S e L del colore base.
    const principalColor = {
        hex: hslToHex(h, baseS, baseL),
        description: label,
    };

    // Variazioni per dare profondità alla palette
    const lighterShade = {
        hex: hslToHex(h, Math.min(baseS + 10, 100), Math.min(baseL + 20, 90)), // Luminosità più accentuata
        description: `${label} (Luminoso)`,
    };
    const darkerShade = {
        hex: hslToHex(h, Math.max(baseS - 10, 0), Math.max(baseL - 20, 10)), // Scuro
        description: `${label} (Scuro)`,
    };
    
    return [
      principalColor,
      lighterShade,
      darkerShade
    ];
  };

  let palette: Color[] = [];
  // Aggiunge sempre il colore base (Base)
  // Nota: viene rimosso successivamente se duplicato in Monochromatic
  palette.push({ hex: baseHex, description: 'Base' });

  switch (scheme) {
    case 'LuminosityContrast': {
      // Luminosity Contrast: mantiene H e S, varia solo L (sequenza di sfumature)
      const luminositySteps = [10, 25, 40, 55, 70, 85, 95];
      const grades = ['900', '700', '500', '300', '200', '100', '50']; // Nomi di fantasia, in ordine inverso di luminosità

      palette = luminositySteps.map((l, index) => ({
          hex: hslToHex(baseH, baseS, l),
          description: `Sfumatura ${grades[index]} (L=${l}%)`,
      }));
      // Inverte l'ordine per avere la tonalità più scura in cima come di consueto nelle palette
      palette = palette.reverse();
      break;
    }
    case 'MonochromaticAchromatic': {
        // Monocromatico Acromatico: Base color + 4 Neutri (Bianco, Nero, 2 Grigio)
        palette = [
            { hex: baseHex, description: 'Base (Accento)' },
            { hex: '#FFFFFF', description: 'Neutro (Bianco)' },
            { hex: '#E5E7EB', description: 'Neutro (Grigio Chiaro)' }, // tailwind gray-200
            { hex: '#4B5563', description: 'Neutro (Grigio Scuro)' },  // tailwind gray-600
            { hex: '#000000', description: 'Neutro (Nero)' },
        ];
        break;
    }
    case 'Monochromatic': {
        // Monocromatico: mantiene H, varia S e L. Usiamo le sfumature di S/L sul colore base.
        // Sovrascriviamo l'array palette per avere solo variazioni del colore base.
        palette = [
            { hex: baseHex, description: 'Base (Originale)' },
            // Variazione Luminosità/Saturazione (Chiara)
            { hex: hslToHex(baseH, Math.min(baseS + 15, 100), Math.min(baseL + 30, 95)), description: 'Monocromatico (Chiaro 1)' },
            { hex: hslToHex(baseH, Math.min(baseS + 5, 100), Math.min(baseL + 15, 80)), description: 'Monocromatico (Chiaro 2)' },
            // Variazione Luminosità/Saturazione (Scura)
            { hex: hslToHex(baseH, Math.max(baseS - 15, 0), Math.max(baseL - 30, 5)), description: 'Monocromatico (Scuro 1)' },
            { hex: hslToHex(baseH, Math.max(baseS - 5, 0), Math.max(baseL - 15, 20)), description: 'Monocromatico (Scuro 2)' },
        ];
        break;
    }
    case 'Analogous': {
      // Tonalità adiacenti (± 30 gradi)
      const h1 = normalizeHue(baseH + 30);
      const h2 = normalizeHue(baseH - 30);
      palette.push(...getShades(h1, 'Analogo 1'));
      palette.push(...getShades(h2, 'Analogo 2'));
      break;
    }
    case 'Complementary': {
      // Tonalità opposta (± 180 gradi)
      const compH = normalizeHue(baseH + 180);
      palette.push(...getShades(compH, 'Complementare'));
      // Aggiunge anche due variazioni per bilanciare la palette
      const compH1 = normalizeHue(compH + 15);
      const compH2 = normalizeHue(compH - 15);
      palette.push(...getShades(compH1, 'Complementare Variante 1'));
      palette.push(...getShades(compH2, 'Complementare Variante 2'));
      break;
    }
    case 'Triadic': {
      // Tre tonalità equidistanti (0, 120, 240 gradi)
      const h1 = normalizeHue(baseH + 120);
      const h2 = normalizeHue(baseH + 240);
      palette.push(...getShades(h1, 'Triadico 1'));
      palette.push(...getShades(h2, 'Triadico 2'));
      break;
    }
    case 'SplitComplementary': {
        // Complementare Diviso: Base + (180 +/- 30)
        const compH = normalizeHue(baseH + 180);
        const h1 = normalizeHue(compH + 30);
        const h2 = normalizeHue(compH - 30);
        palette.push(...getShades(h1, 'Split Comp. 1'));
        palette.push(...getShades(h2, 'Split Comp. 2'));
        break;
    }
    case 'Tetradic': {
        // Tetradic (Quadrato): 0, +90, +180, +270 gradi
        const h1 = normalizeHue(baseH + 90);
        const h2 = normalizeHue(baseH + 180);
        const h3 = normalizeHue(baseH + 270);
        palette.push(...getShades(h1, 'Tetradico 1 (90°)'));
        palette.push(...getShades(h2, 'Tetradico 2 (180°)'));
        palette.push(...getShades(h3, 'Tetradico 3 (270°)'));
        break;
    }
  }

  // Rimuove eventuali sfumature duplicate
  const uniqueHexs = new Set();
  const finalPalette = [];
  for (const color of palette) {
    // Non aggiunge il colore base come "Base" se è già stato gestito (es. in LuminosityContrast)
    if (scheme !== 'LuminosityContrast' && color.hex === baseHex && color.description !== 'Base') {
        continue;
    }
    if (!uniqueHexs.has(color.hex)) {
      uniqueHexs.add(color.hex);
      finalPalette.push(color);
    }
  }
  return finalPalette;
};

// --- Componenti UI ---

/**
 * Componente per visualizzare e copiare un singolo colore della palette.
 * Accetta i parametri di riflessione e opacità per lo styling dinamico.
 */
const ColorCard: React.FC<{ color: Color, reflectiveness: number, opacity: number }> = React.memo(({ color, reflectiveness, opacity }) => {
  const [copied, setCopied] = useState(false);

  const copyToClipboard = useCallback(() => {
    // Usiamo document.execCommand('copy') come fallback per l'ambiente iframe
    const el = document.createElement('textarea');
    el.value = color.hex;
    document.body.appendChild(el);
    el.select();
    try {
      document.execCommand('copy');
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Impossibile copiare il testo', err);
    }
    document.body.removeChild(el);
  }, [color.hex]);

  // Determina se il testo deve essere scuro o chiaro in base alla luminosità del colore
  const isDark = useMemo(() => {
    const { l } = hexToHsl(color.hex);
    // Se la luminosità è alta ( > 60) o se è bianco puro
    return l > 60 || color.hex === '#FFFFFF'; 
  }, [color.hex]);

  const textColor = isDark ? 'text-gray-900' : 'text-gray-100';

  // --- Calcolo Stili Materiale ---
  // Reflectiveness (0-100): Usiamo un'ombra interna per simulare la lucentezza (più è alto, meno sfocato)
  const blur = (100 - reflectiveness) / 10; // Ruvidità: meno riflettività = più sfocatura (blur)
  const opacityShadow = reflectiveness / 200; // Intensità: più riflettività = ombra più scura/visibile
  const shadow = `inset 0 0 ${blur}px rgba(255, 255, 255, ${opacityShadow}), inset 0 0 10px rgba(0, 0, 0, ${opacityShadow / 2})`;

  return (
    <div
      className="relative flex flex-col items-center justify-center p-4 rounded-xl shadow-lg transition-all transform hover:scale-[1.02] cursor-pointer ring-4 ring-offset-4 ring-offset-white/50 dark:ring-offset-gray-900/50 overflow-hidden"
      style={{ 
        backgroundColor: color.hex,
        opacity: opacity / 100, // Applica Opacità
        boxShadow: reflectiveness > 0 ? shadow : 'none', // Applica Riflettività
        backdropFilter: opacity < 100 ? `blur(${(100 - opacity) / 20}px)` : 'none', // Simula effetto vetro/plastica
      }}
      onClick={copyToClipboard}
      title={`Clicca per copiare: ${color.hex}`}
    >
        {/* Sfondo per simulare l'ambiente per l'opacità */}
        {opacity < 100 && (
            <div className="absolute inset-0 z-0 opacity-20"
                 style={{ 
                    backgroundImage: 'url("data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAyMCAyMCI+PGcgZmlsbD0ibm9uZSIgc3Ryb2tlPSIjZmZmZmZmIiBzdHJva2Utd2lkdGg9IjEiPjxyZWN0IHdpZHRoPSI5IiBoZWlnaHQ9IjkiLz48cmVjdCB4PSIxMCIgeT0iMTAiIHdpZHRoPSI5IiBoZWlnaHQ9IjkiLz48L2c+PC9zdmc+")',
                    backgroundSize: '20px 20px'
                }}
            ></div>
        )}

      <div className={`relative z-10 flex flex-col items-center justify-center ${textColor}`}>
        <div className={`text-sm font-semibold`}>{color.hex}</div>
        <div className={`text-xs mt-1 opacity-70`}>{color.description}</div>
      </div>
      
      {copied && (
        <div className="absolute top-0 right-0 mt-2 mr-2 bg-gray-900 text-white text-xs font-medium px-2 py-1 rounded-full shadow-xl animate-pulse z-20">
          Copiato!
        </div>
      )}
    </div>
  );
});

/**
 * Componente principale dell'applicazione.
 */
const App: React.FC = () => {
  const [baseColor, setBaseColor] = useState<string>('#4F46E5'); // Viola Indaco di Tailwind come default
  const [schemeType, setSchemeType] = useState<ColorSchemeType>('LuminosityContrast'); // Default al nuovo schema
  
  // STATO MATERIALE AGGIUNTO
  const [reflectiveness, setReflectiveness] = useState(50); // Riflettività (0-100)
  const [opacity, setOpacity] = useState(100); // Opacità (1-100)
  
  const [isDarkMode, setIsDarkMode] = useState(true);

  // Calcola la palette ogni volta che il colore base o lo schema cambiano
  const palette = useMemo(() => {
    // Gestione baseColor non valido (ad esempio, se l'utente digita un valore parziale)
    if (!/^#([0-9A-F]{3}){1,2}$/i.test(baseColor)) return [];
    return generatePalette(baseColor, schemeType);
  }, [baseColor, schemeType]);

  // Gestione del Dark Mode
  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [isDarkMode]);
  
  // Assicura che la classe 'dark' sia applicata all'avvio
  useEffect(() => {
    document.documentElement.classList.add('dark');
  }, []);

  // Funzione per gestire il cambio di input del colore
  const handleColorChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.toUpperCase();
    // Esegue il cambio solo se il valore è un HEX valido o parziale
    if (value.match(/^#([0-9A-F]{0,6})$/i)) {
      setBaseColor(value);
    }
  }, []);

  // Lista degli schemi per il layout
  const schemeList: ColorSchemeType[] = [
    'LuminosityContrast', 
    'MonochromaticAchromatic', 
    'Monochromatic', 
    'Analogous', 
    'Triadic', 
    'Complementary', 
    'SplitComplementary', 
    'Tetradic'
  ];
  
  // Mappa per abbreviare i nomi dei pulsanti
  const schemeLabels: Record<ColorSchemeType, string> = {
    'LuminosityContrast': 'Contrasto L',
    'MonochromaticAchromatic': 'Accento/Neutro',
    'Monochromatic': 'Mono',
    'Analogous': 'Analogo',
    'Triadic': 'Triadico',
    'Complementary': 'Comp.',
    'SplitComplementary': 'Split Comp.',
    'Tetradic': 'Tetradico',
  };


  return (
    <div className={`min-h-screen p-4 sm:p-8 transition-colors duration-500 ${isDarkMode ? 'bg-gray-900 text-white' : 'bg-gray-50 text-gray-900'}`}>
      <script src="https://cdn.tailwindcss.com"></script>
      <style>
        {`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@100..900&display=swap');
        body { font-family: 'Inter', sans-serif; }
        /* Stile per l'input color per nascondere l'icona e mantenere pulito */
        input[type="color"]::-webkit-color-swatch-wrapper { padding: 0; }
        input[type="color"]::-webkit-color-swatch { border: none; border-radius: 9999px; }
        .scheme-button {
          transition: background-color 0.3s, color 0.3s, border-color 0.3s, transform 0.1s;
        }
        .scheme-button:hover {
          transform: translateY(-1px);
        }
        .scheme-button.active {
          box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -2px rgba(0, 0, 0, 0.1);
        }
        /* Grid responsive per i bottoni */
        .scheme-grid {
            grid-template-columns: repeat(3, minmax(0, 1fr));
        }
        @media (min-width: 640px) {
             .scheme-grid {
                grid-template-columns: repeat(4, minmax(0, 1fr));
            }
        }
        /* Stile per simulare il 'vetro' con sfondo a scacchiera per trasparenza */
        .glass-background {
            background-color: transparent;
            /* Inserito pattern direttamente nel componente ColorCard per consistenza */
        }
        `}
      </style>

      <div className="max-w-4xl mx-auto">
        {/* Intestazione e Toggle Dark Mode */}
        <header className="flex justify-between items-center mb-8 pb-4 border-b border-gray-200 dark:border-gray-700">
          <h1 className="text-3xl font-extrabold text-indigo-600 dark:text-indigo-400">
            Palette<span className="text-gray-900 dark:text-gray-100">Gen</span>
          </h1>
          <button
            onClick={() => setIsDarkMode(!isDarkMode)}
            className="p-2 rounded-full bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 shadow-md hover:shadow-lg transition-all"
            title={isDarkMode ? "Passa a Modalità Chiara" : "Passa a Modalità Scura"}
          >
            {isDarkMode ? (
              <svg className="w-6 h-6 text-yellow-400" fill="currentColor" viewBox="0 0 20 20"><path d="M10 2a1 1 0 011 1v1a1 1 0 01-2 0V3a1 1 0 011-1zm4 10a4 4 0 01-4 4 4 4 0 01-4-4 4 4 0 014-4 4 4 0 014 4zM6.293 6.293a1 1 0 001.414 0l1.414-1.414a1 1 0 00-1.414-1.414L6.293 4.879a1 1 0 000 1.414zm7.414 7.414a1 1 0 00-1.414 0L12.086 13a1 1 0 001.414 1.414l1.414-1.414zm-4.414 2.828a1 1 0 000 1.414h1.414a1 1 0 000-1.414H9.293zm-7.414-7.414a1 1 0 00-1.414 0v1.414a1 1 0 001.414 0l1.414-1.414zM4 10a1 1 0 011-1h1a1 1 0 010 2H5a1 1 0 01-1-1z" clipRule="evenodd" fillRule="evenodd"></path></svg>
            ) : (
              <svg className="w-6 h-6 text-gray-600" fill="currentColor" viewBox="0 0 20 20"><path d="M17.293 13.707a1 1 0 010-1.414l1.414-1.414a1 1 0 011.414 1.414L18.707 13.707a1 1 0 01-1.414 0zM5.707 6.293a1 1 0 010 1.414L4.293 8.707a1 1 0 01-1.414-1.414l1.414-1.414a1 1 0 011.414 0zM10 18a1 1 0 01-1-1v-1a1 1 0 112 0v1a1 1 0 01-1 1zm4 10a4 4 0 01-4 4 4 4 0 01-4-4 4 4 0 014-4 4 4 0 014 4zM5.707 13.707a1 1 0 01-1.414 0L3.586 12.086a1 1 0 011.414-1.414l1.414 1.414a1 1 0 010 1.414zm7.414 7.414a1 1 0 010-1.414l1.414-1.414a1 1 0 011.414 1.414l-1.414 1.414a1 1 0 01-1.414 0zM18 10a1 1 0 01-1 1h-1a1 1 0 110-2h1a1 1 0 011 1zM2 10a1 1 0 01-1-1v-1a1 1 0 012 0v1a1 1 0 01-1 1zM10 2a1 1 0 01-1-1V0a1 1 0 012 0v1a1 1 0 01-1 1z" clipRule="evenodd" fillRule="evenodd"></path></svg>
            )}
          </button>
        </header>

        {/* Controlli Input */}
        <div className="mb-10 p-6 bg-white dark:bg-gray-800 rounded-xl shadow-2xl border border-indigo-100 dark:border-indigo-900/50">
          <p className="text-lg font-medium mb-4 text-gray-700 dark:text-gray-300">Scegli il tuo colore base e lo schema:</p>

          <div className="flex flex-col lg:flex-row gap-6">
            {/* Input Colore Base & Schema Selection (Left Column) */}
            <div className='flex flex-col w-full lg:w-1/2 gap-6'>
                {/* 1. Input Colore Base */}
                <div className="flex flex-col">
                    <label htmlFor="baseColor" className="mb-2 text-sm font-medium text-gray-600 dark:text-gray-400">
                        Colore Base (HEX):
                    </label>
                    <div className="flex items-stretch rounded-lg shadow-sm overflow-hidden border border-gray-300 dark:border-gray-600">
                        <input
                        type="color"
                        id="color-picker"
                        value={baseColor}
                        onChange={handleColorChange}
                        className="w-12 h-12 cursor-pointer border-none"
                        aria-label="Selettore colore base"
                        />
                        <input
                        type="text"
                        id="baseColor"
                        value={baseColor}
                        onChange={handleColorChange}
                        maxLength={7}
                        className="flex-1 px-4 py-2 text-lg font-mono tracking-wider focus:ring-2 focus:ring-indigo-500 focus:outline-none dark:bg-gray-700 dark:text-white"
                        placeholder="#4F46E5"
                        />
                    </div>
                </div>

                {/* 2. Selezione Schema */}
                <div className="flex flex-col">
                    <label className="mb-2 text-sm font-medium text-gray-600 dark:text-gray-400">
                        Tipo di Schema:
                    </label>
                    <div className="grid scheme-grid gap-3">
                        {schemeList.map((scheme) => (
                        <button
                            key={scheme}
                            onClick={() => setSchemeType(scheme)}
                            className={`scheme-button text-[10px] sm:text-xs font-semibold py-3 px-1 rounded-lg border-2
                            ${schemeType === scheme
                                ? 'bg-indigo-600 text-white border-indigo-700 active'
                                : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 border-gray-300 dark:border-gray-600 hover:bg-gray-200 dark:hover:bg-gray-600'
                            }`}
                        >
                            {schemeLabels[scheme]}
                        </button>
                        ))}
                    </div>
                </div>
            </div>

            {/* Controlli Materiale (Right Column) */}
            <div className='flex flex-col w-full lg:w-1/2 gap-6 p-4 border border-gray-200 dark:border-gray-700 rounded-xl bg-gray-50 dark:bg-gray-700/50'>
                <p className="text-base font-semibold text-gray-700 dark:text-gray-200">
                    Proprietà Materiale (Simulazione CSS)
                </p>

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
                        className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer dark:bg-gray-600 range-sm"
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
                        className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer dark:bg-gray-600 range-sm"
                    />
                     <p className='text-[11px] text-gray-500 dark:text-gray-400 mt-1'>
                        100% = Solido (Solid), 10% = Vetro/Plastica (Translucent).
                    </p>
                </div>
            </div>
          </div>
        </div>

        {/* Visualizzazione Palette */}
        {palette.length > 0 ? (
          <div className="mt-8">
            <h2 className="text-2xl font-bold mb-6 text-gray-800 dark:text-gray-200">
              Palette Generata ({schemeType})
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
              {palette.map((color, index) => (
                <ColorCard 
                    key={index} 
                    color={color} 
                    reflectiveness={reflectiveness} 
                    opacity={opacity}
                />
              ))}
            </div>
            <p className="mt-6 text-sm text-gray-500 dark:text-gray-400 text-center italic">
              *Clicca su una casella di colore per copiare il valore HEX negli appunti.
            </p>
          </div>
        ) : (
          <div className="mt-8 text-center p-12 bg-white dark:bg-gray-800 rounded-xl shadow-lg">
            <p className="text-xl font-medium text-red-500 dark:text-red-400">
              Inserisci un valore esadecimale valido (es. #RRGGBB) per generare la palette.
            </p>
          </div>
        )}

      </div>
    </div>
  );
};

export default App;
