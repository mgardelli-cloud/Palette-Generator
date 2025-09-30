import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTheme } from '../contexts/ThemeContext';
import { Button } from './ui/Button';
import { 
  getContrastText, 
  generateAnalogous, 
  generateTriadic, 
  generateMonochromatic
} from '../utils/colorUtils';
import { 
  SunIcon, 
  MoonIcon, 
  ArrowPathIcon, 
  SwatchIcon, 
  PlusIcon, 
  TrashIcon, 
  CheckIcon 
} from '@heroicons/react/24/outline';
import ColorCard from './ColorCard';
import type { ColorPalette } from '../types';

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

  const [currentPalette, setCurrentPalette] = useState<ColorPalette>(themePalette || {
    name: 'My Color Palette',
    colors: ['#3b82f6', '#60a5fa', '#93c5fd', '#bfdbfe', '#dbeafe'],
    primary: '#3b82f6',
    secondary: '#60a5fa',
    accent: '#93c5fd',
    background: '#ffffff',
    text: '#111827'
  });
  
  // Animation key is used to force re-render
  const [, setAnimationKey] = useState(0);
  const [showSaveSuccess, setShowSaveSuccess] = useState(false);
  const [activeTab, setActiveTab] = useState<'current' | 'saved'>('current');
  const [paletteName, setPaletteName] = useState(currentPalette.name);
  const [isEditingName, setIsEditingName] = useState(false);

  useEffect(() => {
    setPaletteName(currentPalette.name);
  }, [currentPalette]);

  const handleColorSelect = (color: string) => {
    setCurrentPalette({
      ...currentPalette,
      primary: color,
      secondary: getContrastText(color),
      text: getContrastText(color),
    });
  };


  const handleSavePalette = () => {
    savePalette({
      ...currentPalette,
      name: paletteName.trim() || 'Unnamed Palette',
    });
    setShowSaveSuccess(true);
    setTimeout(() => setShowSaveSuccess(false), 2000);
    setIsEditingName(false);
  };

  const handleGenerateNew = () => {
    setAnimationKey(prev => prev + 1);
    generateNewPalette();
  };


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
        {/* Controls */}
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
            >
              <SwatchIcon className="h-4 w-4" />
              {activeTab === 'current' ? 'Saved Palettes' : 'Current Palette'}
            </Button>
            
            <Button
              onClick={handleGenerateNew}
              className="flex items-center gap-1.5"
            >
              <ArrowPathIcon className="h-4 w-4" />
              Generate New
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
                {/* Primary Color */}
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
    </div>
  );
};

export default ColorPaletteGenerator;
