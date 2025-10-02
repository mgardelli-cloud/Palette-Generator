import { useEffect, useRef, useState, useCallback } from 'react';
import { motion, AnimatePresence, useAnimation } from 'framer-motion';
import { useTheme } from '../contexts/ThemeContext';
import { 
  ArrowPathIcon, 
  CheckIcon, 
  ClipboardDocumentIcon,
  MoonIcon,
  SunIcon,
  SwatchIcon,
  SparklesIcon,
  XMarkIcon
} from '@heroicons/react/24/outline';
import { HexColorPicker } from 'react-colorful';
import { getContrastText } from '../utils/colorUtils';

const ModernColorPalette = () => {
  const { 
    darkMode, 
    toggleDarkMode, 
    currentPalette, 
    generateNewPalette, 
    colorScheme,
    setColorScheme,
    schemeList,
    schemeLabels
  } = useTheme();
  
  const controls = useAnimation();
  const [copied, setCopied] = useState<string | null>(null);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isColorPickerOpen, setIsColorPickerOpen] = useState(false);
  const [selectedColorIndex, setSelectedColorIndex] = useState(0);
  const [isAnimating] = useState(true);
  const menuRef = useRef<HTMLDivElement>(null);
  const colorPickerRef = useRef<HTMLDivElement>(null);
  
  // Ripple effect for buttons
  const createRipple = useCallback((event: React.MouseEvent<HTMLButtonElement>) => {
    const button = event.currentTarget;
    const circle = document.createElement('span');
    const diameter = Math.max(button.clientWidth, button.clientHeight);
    const radius = diameter / 2;

    circle.style.width = circle.style.height = `${diameter}px`;
    circle.style.left = `${event.clientX - button.getBoundingClientRect().left - radius}px`;
    circle.style.top = `${event.clientY - button.getBoundingClientRect().top - radius}px`;
    circle.style.position = 'absolute';
    circle.style.borderRadius = '50%';
    circle.style.transform = 'scale(0)';
    circle.style.transition = 'transform 0.6s ease-out, opacity 0.6s ease-out';
    circle.style.background = 'rgba(255, 255, 255, 0.7)';
    circle.style.opacity = '0.7';
    circle.style.pointerEvents = 'none';

    button.appendChild(circle);

    const start = Date.now();
    const duration = 600;

    const animate = () => {
      const now = Date.now();
      const progress = (now - start) / duration;
      const scale = Math.min(progress * 2, 1);
      const opacity = 0.7 * (1 - progress);
      
      circle.style.transform = `scale(${scale})`;
      circle.style.opacity = `${opacity}`;

      if (progress < 1) {
        requestAnimationFrame(animate);
      } else {
        circle.remove();
      }
    };

    requestAnimationFrame(animate);
  }, []);

  // Close menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsMenuOpen(false);
      }
      if (colorPickerRef.current && !colorPickerRef.current.contains(event.target as Node)) {
        setIsColorPickerOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);
  
  // Auto-animate colors with smoother transition
  useEffect(() => {
    if (!isAnimating) return;
    
    let timeoutId: ReturnType<typeof setTimeout>;
    
    const animateColors = async () => {
      await controls.start({
        opacity: [1, 0.7, 1],
        transition: { duration: 1.5 }
      });
      
      generateNewPalette();
      
      timeoutId = setTimeout(animateColors, 5000);
    };
    
    animateColors();
    
    return () => {
      if (timeoutId) clearTimeout(timeoutId);
    };
  }, [isAnimating, generateNewPalette, controls]);

  // Enhanced animation when palette changes
  useEffect(() => {
    controls.start({
      opacity: [0, 0.7, 1],
      y: [10, 0],
      scale: [0.98, 1],
      transition: { 
        duration: 0.6,
        ease: [0.16, 1, 0.3, 1]
      }
    });
  }, [currentPalette.colors, controls]);

  const handleCopy = (color: string, e: React.MouseEvent<HTMLButtonElement>) => {
    e.stopPropagation();
    navigator.clipboard.writeText(color);
    setCopied(color);
    createRipple(e);
    setTimeout(() => setCopied(null), 2000);
  };

  const handleSchemeChange = (scheme: string) => {
    setColorScheme(scheme);
    setIsMenuOpen(false);
  };

  const formatColor = (color: string, format: 'hex' | 'rgb' | 'hsl'): string => {
    // Convert hex to RGB
    const hexToRgb = (hex: string) => {
      const r = parseInt(hex.slice(1, 3), 16);
      const g = parseInt(hex.slice(3, 5), 16);
      const b = parseInt(hex.slice(5, 7), 16);
      return { r, g, b };
    };

    // Convert RGB to HSL
    const rgbToHsl = (r: number, g: number, b: number) => {
      r /= 255;
      g /= 255;
      b /= 255;
      
      const max = Math.max(r, g, b);
      const min = Math.min(r, g, b);
      let h = 0;
      let s = 0;
      const l = (max + min) / 2;

      if (max !== min) {
        const d = max - min;
        s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
        
        switch (max) {
          case r: h = (g - b) / d + (g < b ? 6 : 0); break;
          case g: h = (b - r) / d + 2; break;
          case b: h = (r - g) / d + 4; break;
        }
        
        h = Math.round(h * 60);
        if (h < 0) h += 360;
      }
      
      s = Math.round(s * 100);
      const lPercent = Math.round(l * 100);
      
      return { h, s, l: lPercent };
    };

    try {
      if (color.startsWith('#')) {
        if (format === 'hex') return color.toUpperCase();
        
        const { r, g, b } = hexToRgb(color);
        if (format === 'rgb') return `rgb(${r}, ${g}, ${b})`;
        
        const { h, s, l } = rgbToHsl(r, g, b);
        return `hsl(${h}, ${s}%, ${l}%)`;
      }
      
      return color;
    } catch (e) {
      return color;
    }
  };

  return (
    <div className="min-h-screen bg-white dark:bg-black transition-colors duration-200">
      {/* Header */}
      <motion.header 
        className="bg-white dark:bg-black border-b border-gray-200 dark:border-gray-800 fixed top-0 left-0 right-0 z-40"
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        transition={{ type: 'spring', stiffness: 300, damping: 30 }}
      >
        <div className="max-w-7xl mx-auto px-4 py-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
            >
              <div className="relative inline-block group">
                <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white relative z-10 transition-all duration-300 group-hover:tracking-wider">
                  Palette Generator
                </h1>
                <div className="absolute -bottom-1 left-0 right-0 h-0.5 overflow-hidden">
                  <div className="relative h-full w-full">
                    <div className="absolute top-0 left-0 h-full w-full bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 bg-[length:200%_100%] animate-rainbow-shift" />
                    <div className="absolute top-0 left-0 h-full w-full bg-gradient-to-r from-pink-500 via-amber-500 to-blue-500 bg-[length:200%_100%] animate-rainbow-shift opacity-0 group-hover:opacity-100 transition-opacity duration-500" style={{ animationDelay: '0.2s' }} />
                  </div>
                </div>
              </div>
            </motion.div>
            
            <div className="flex items-center space-x-4">
              {/* Theme Toggle */}
              <motion.button
                onClick={toggleDarkMode}
                className="p-2 rounded-full bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                title={darkMode ? 'Switch to light mode' : 'Switch to dark mode'}
              >
                {darkMode ? (
                  <SunIcon className="h-5 w-5" />
                ) : (
                  <MoonIcon className="h-5 w-5" />
                )}
              </motion.button>
              
              {/* Color Scheme Selector */}
              <div className="relative" ref={menuRef}>
                <motion.button
                  onClick={() => setIsMenuOpen(!isMenuOpen)}
                  className="px-4 py-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg text-sm font-medium text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors flex items-center space-x-1"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <span>{schemeLabels[colorScheme as keyof typeof schemeLabels] || 'Color Scheme'}</span>
                  <motion.span
                    animate={{ rotate: isMenuOpen ? 180 : 0 }}
                    transition={{ duration: 0.2 }}
                  >
                    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </motion.span>
                </motion.button>
                
                <AnimatePresence>
                  {isMenuOpen && (
                    <motion.div
                      initial={{ opacity: 0, y: 10, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: 10, scale: 0.95 }}
                      transition={{ type: 'spring', damping: 25, stiffness: 300 }}
                      className="absolute right-0 mt-2 w-48 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 overflow-hidden z-50"
                    >
                      {schemeList.map((scheme) => (
                        <button
                          key={scheme}
                          onClick={() => handleSchemeChange(scheme)}
                          className={`w-full text-left px-4 py-2 text-sm ${
                            scheme === colorScheme
                              ? 'bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300'
                              : 'text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700'
                          } transition-colors`}
                        >
                          {schemeLabels[scheme as keyof typeof schemeLabels] || scheme}
                        </button>
                      ))}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
              
              {/* Generate New Palette */}
              <motion.button
                onClick={generateNewPalette}
                className="px-4 py-2 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-lg text-sm font-medium hover:from-blue-600 hover:to-purple-700 transition-all flex items-center space-x-1"
                whileHover={{ scale: 1.02, boxShadow: '0 4px 12px -2px rgba(99, 102, 241, 0.5)' }}
                whileTap={{ scale: 0.98 }}
              >
                <SparklesIcon className="h-4 w-4" />
                <span>Generate</span>
              </motion.button>
            </div>
          </div>
        </div>
      </motion.header>

      {/* Main content */}
      <main className="pt-24 pb-16 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <AnimatePresence mode="wait">
          <motion.div 
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-6"
            variants={{
              hidden: { opacity: 0 },
              show: {
                opacity: 1,
                transition: {
                  staggerChildren: 0.1,
                  delayChildren: 0.2
                }
              }
            }}
            initial="hidden"
            animate="show"
            exit="hidden"
          >
            {currentPalette.colors.map((color, index) => {
              const isLight = getContrastText(color) === '#000';
              const textColor = isLight ? 'rgba(0, 0, 0, 0.9)' : 'rgba(255, 255, 255, 0.95)';
              
              return (
                <motion.div
                  key={`${color}-${index}`}
                  variants={{
                    hidden: { opacity: 0, y: 20, scale: 0.95 },
                    visible: { 
                      opacity: 1, 
                      y: 0,
                      scale: 1,
                      transition: { 
                        type: 'spring',
                        stiffness: 400,
                        damping: 20,
                        mass: 0.5
                      }
                    }
                  }}
                  whileHover={{ 
                    y: -12,
                    scale: 1.03,
                    boxShadow: `0 35px 60px -15px ${color}60`,
                    zIndex: 10,
                    transition: {
                      type: 'spring',
                      stiffness: 300,
                      damping: 20
                    }
                  }}
                  className="relative group rounded-2xl overflow-hidden transition-all duration-300 hover:z-20"
                  style={{
                    background: `linear-gradient(145deg, ${color}cc, ${color}ee)`,
                    boxShadow: `0 15px 35px -5px ${color}30, 0 10px 15px -10px ${color}20`,
                  }}
                >
                  <div 
                    className="h-48 flex items-end p-6 relative overflow-hidden"
                    style={{ backgroundColor: color }}
                  >
                    {/* Animated background pattern */}
                    <div className="absolute inset-0 opacity-10">
                      <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KICA8cmVjdCB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIGZpbGw9IiNmZmYiIGZpbGwtb3BhY2l0eT0iMC4xIi8+Cjwvc3ZnPg==')]">
                      </div>
                    </div>
                    
                    <div className="absolute right-3 top-3 flex flex-col gap-2">
                      {/* Color picker button */}
                      <motion.button
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedColorIndex(index);
                          setIsColorPickerOpen(true);
                        }}
                        className={`p-2 rounded-full backdrop-blur-sm ${
                          isLight ? 'bg-black/10 hover:bg-black/20 text-gray-900' : 'bg-white/20 hover:bg-white/30 text-white'
                        } transition-colors`}
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                        title="Edit color"
                      >
                        <SwatchIcon className="h-4 w-4" />
                      </motion.button>
                      
                      {/* Copy button */}
                      <motion.button
                        onClick={(e) => handleCopy(color, e)}
                        className={`p-2 rounded-full backdrop-blur-sm ${
                          isLight ? 'bg-black/10 hover:bg-black/20 text-gray-900' : 'bg-white/20 hover:bg-white/30 text-white'
                        } transition-colors relative overflow-hidden ${copied === color ? 'scale-100' : 'scale-90 group-hover:scale-100'}`}
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                        initial={false}
                        animate={{
                          opacity: copied === color ? 1 : 0.8,
                          y: copied === color ? [0, -5, 0] : 0,
                        }}
                        transition={{ 
                          duration: 0.3,
                          y: { 
                            repeat: copied === color ? 3 : 0,
                            repeatType: 'reverse',
                            duration: 0.6 
                          }
                        }}
                        title="Copy color"
                      >
                        {copied === color ? (
                          <CheckIcon className="h-4 w-4" />
                        ) : (
                          <ClipboardDocumentIcon className="h-4 w-4" />
                        )}
                      </motion.button>
                    </div>
                    
                    {/* Color info */}
                    <div className="relative z-10 w-full">
                      <div className="flex justify-between items-center mb-3">
                        <div>
                          <motion.div 
                            className="text-lg font-bold tracking-tight"
                            style={{ color: textColor }}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.2 + (index * 0.05) }}
                          >
                            {color.toUpperCase()}
                          </motion.div>
                          
                          {/* Color format chips */}
                          <div className="flex items-center gap-2 mt-1">
                            <div className="flex items-center gap-1 text-xs">
                              <span className="opacity-70" style={{ color: textColor }}>RGB:</span>
                              <span className="font-mono" style={{ color: textColor }}>
                                {formatColor(color, 'rgb').replace('rgb(', '').replace(')', '')}
                              </span>
                            </div>
                            <div className="w-px h-3 bg-gray-400/30"></div>
                            <div className="flex items-center gap-1 text-xs">
                              <span className="opacity-70" style={{ color: textColor }}>HSL:</span>
                              <span className="font-mono" style={{ color: textColor }}>
                                {formatColor(color, 'hsl')
                                  .replace('hsl(', '')
                                  .replace(')', '')
                                  .split(',')
                                  .map((v, i) => i === 0 ? `${v.trim()}°` : v.trim())
                                  .join(', ')}
                              </span>
                            </div>
                          </div>
                        </div>
                        
                        <motion.span 
                          className="text-xs font-medium px-2 py-1 rounded-full"
                          style={{ 
                            backgroundColor: isLight ? 'rgba(0,0,0,0.1)' : 'rgba(255,255,255,0.15)',
                            color: textColor
                          }}
                          initial={{ opacity: 0, scale: 0.9 }}
                          animate={{ opacity: 1, scale: 1 }}
                          transition={{ delay: 0.3 + (index * 0.05) }}
                        >
                          {index + 1}
                        </motion.span>
                      </div>
                      
                      {/* Copy buttons */}
                      <div className="flex gap-2 mt-2">
                        <button 
                          onClick={(e) => handleCopy(color, e)}
                          className="text-xs px-2 py-1 rounded flex items-center gap-1 transition-colors"
                          style={{
                            backgroundColor: isLight ? 'rgba(0,0,0,0.05)' : 'rgba(255,255,255,0.1)',
                            color: textColor
                          }}
                        >
                          <ClipboardDocumentIcon className="h-3 w-3" />
                          <span>Copy HEX</span>
                        </button>
                        <button 
                          onClick={(e) => handleCopy(formatColor(color, 'rgb'), e)}
                          className="text-xs px-2 py-1 rounded flex items-center gap-1 transition-colors"
                          style={{
                            backgroundColor: isLight ? 'rgba(0,0,0,0.05)' : 'rgba(255,255,255,0.1)',
                            color: textColor
                          }}
                        >
                          <ClipboardDocumentIcon className="h-3 w-3" />
                          <span>Copy RGB</span>
                        </button>
                        <button 
                          onClick={(e) => handleCopy(formatColor(color, 'hsl'), e)}
                          className="text-xs px-2 py-1 rounded flex items-center gap-1 transition-colors"
                          style={{
                            backgroundColor: isLight ? 'rgba(0,0,0,0.05)' : 'rgba(255,255,255,0.1)',
                            color: textColor
                          }}
                        >
                          <ClipboardDocumentIcon className="h-3 w-3" />
                          <span>Copy HSL</span>
                        </button>
                      </div>
                    </div>
                  </div>
                  
                  {/* Luminance bar */}
                  <div className="h-1.5 bg-black/5 relative overflow-hidden">
                    <motion.div 
                      className="h-full"
                      initial={{ width: 0 }}
                      animate={{ width: '100%' }}
                      transition={{ 
                        delay: 0.2 + (index * 0.05),
                        duration: 0.8,
                        ease: [0.16, 1, 0.3, 1]
                      }}
                      style={{ 
                        backgroundColor: color,
                        boxShadow: `0 0 10px ${color}`
                      }}
                    />
                  </div>
                  
                  {/* Glass overlay effect */}
                  <div 
                    className="absolute inset-0 pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                    style={{
                      background: 'radial-gradient(circle at 80% 20%, rgba(255,255,255,0.15) 0%, transparent 40%)',
                    }}
                  />
                </motion.div>
              );
            })}
          </motion.div>
        </AnimatePresence>
      </main>
      
      {/* Footer */}
      <motion.footer 
        className="fixed bottom-0 left-0 right-0 py-4"
        initial={{ opacity: 0, y: 20 }}
        animate={{ 
          opacity: 1, 
          y: 0,
          transition: { delay: 0.5, duration: 0.8, ease: 'easeInOut' }
        }}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
          <div className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-lg rounded-xl p-4 shadow-lg border border-gray-100/20 dark:border-gray-800/50">
            <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
              <div className="flex items-center gap-3">
                <motion.div 
                  className="w-8 h-8 rounded-full flex items-center justify-center text-white"
                  style={{ boxShadow: '0 10px 20px rgba(0,0,0,0.19), 0 6px 6px rgba(0,0,0,0.23)' }}
                  whileHover={{ scale: 1.1 }}
                  animate={{
                    rotate: [0, 360],
                  }}
                  transition={{
                    rotate: {
                      duration: 20,
                      repeat: Infinity,
                      ease: 'linear'
                    }
                  }}
                >
                  <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M12 22C17.5228 22 22 17.5228 22 12C22 6.47715 17.5228 2 12 2C6.47715 2 2 6.47715 2 12C2 17.5228 6.47715 22 12 22Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    <path d="M12 6V12L16 14" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </motion.div>
                <div>
                  <h3 className="text-sm font-medium text-gray-900 dark:text-white">Palette Generator</h3>
                  <p className="text-xs text-gray-500 dark:text-gray-400">Create beautiful color palettes</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <motion.button
                  onClick={generateNewPalette}
                  className="px-4 py-2 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-lg text-sm font-medium hover:from-blue-600 hover:to-purple-700 transition-all flex items-center space-x-1"
                  whileHover={{ scale: 1.02, boxShadow: '0 4px 12px -2px rgba(99, 102, 241, 0.5)' }}
                  whileTap={{ scale: 0.98 }}
                >
                  <ArrowPathIcon className="h-4 w-4" />
                  <span>Generate New</span>
                </motion.button>
              </div>
            </div>
          </div>
        </div>
      </motion.footer>

      {/* Color picker modal */}
      <AnimatePresence>
        {isColorPickerOpen && selectedColorIndex !== null && (
          <div 
            className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={() => setIsColorPickerOpen(false)}
          >
            <motion.div 
              className="bg-white dark:bg-gray-900 rounded-2xl p-6 w-full max-w-md shadow-2xl border border-gray-200 dark:border-gray-800"
              initial={{ opacity: 0, y: 20, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 20, scale: 0.95 }}
              transition={{ type: 'spring', damping: 25, stiffness: 300 }}
              onClick={(e) => e.stopPropagation()}
              ref={colorPickerRef}
            >
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Edit Color</h3>
                <button 
                  onClick={() => setIsColorPickerOpen(false)}
                  className="text-gray-400 hover:text-gray-500 dark:text-gray-500 dark:hover:text-gray-400"
                  aria-label="Close"
                >
                  <XMarkIcon className="h-6 w-6" />
                </button>
              </div>
              <div className="mb-4">
                <HexColorPicker 
                  color={currentPalette.colors[selectedColorIndex]} 
                  onChange={(newColor) => {
                    const updatedColors = [...currentPalette.colors];
                    updatedColors[selectedColorIndex] = newColor;
                    // In a real app, you would update the state with the new color
                    console.log('Color updated to:', newColor);
                  }} 
                  className="w-full h-64 rounded-xl overflow-hidden"
                />
              </div>
              <div className="flex justify-end gap-3">
                <button
                  onClick={() => setIsColorPickerOpen(false)}
                  className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={() => {
                    // Here you would update the color in your state
                    console.log('Color applied:', currentPalette.colors[selectedColorIndex]);
                    setIsColorPickerOpen(false);
                  }}
                  className="px-4 py-2 text-sm font-medium text-white rounded-lg transition-colors"
                  style={{ backgroundColor: currentPalette.colors[selectedColorIndex] }}
                >
                  Apply
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default ModernColorPalette;
