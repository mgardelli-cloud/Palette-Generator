import { useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence, useAnimation } from 'framer-motion';
import { useTheme } from '../contexts/ThemeContext';
import { 
  ArrowPathIcon, 
  CheckIcon, 
  ClipboardDocumentIcon,
  MoonIcon,
  SunIcon,
  SwatchIcon,
  SparklesIcon
} from '@heroicons/react/24/outline';
import { cn } from '../lib/utils';
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
  const [isAnimating] = useState(true);
  const menuRef = useRef<HTMLDivElement>(null);
  
  // Auto-animate colors
  useEffect(() => {
    if (!isAnimating) return;
    
    const interval = setInterval(() => {
      generateNewPalette();
    }, 5000);
    
    return () => clearInterval(interval);
  }, [isAnimating, generateNewPalette]);

  // Animazione quando cambia la palette
  useEffect(() => {
    controls.start({
      opacity: [0, 1],
      y: [20, 0],
      transition: { duration: 0.5 }
    });
  }, [currentPalette.colors, controls]);

  // Chiudi il menu quando si clicca fuori
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsMenuOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleCopy = (color: string) => {
    navigator.clipboard.writeText(color);
    setCopied(color);
    setTimeout(() => setCopied(null), 2000);
  };

  const handleSchemeChange = (scheme: string) => {
    setColorScheme(scheme);
    setIsMenuOpen(false);
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
              <motion.div className="relative" ref={menuRef}>
                <motion.button
                  onClick={() => setIsMenuOpen(!isMenuOpen)}
                  className="flex items-center space-x-2 px-4 py-2 rounded-lg bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-white hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <SwatchIcon className="h-5 w-5" />
                  <span>{schemeLabels[colorScheme as keyof typeof schemeLabels] || colorScheme}</span>
                </motion.button>
                
                <AnimatePresence>
                  {isMenuOpen && (
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10, transition: { duration: 0.2 } }}
                      className="absolute right-0 mt-2 w-48 rounded-lg bg-white dark:bg-gray-800 shadow-lg border border-gray-200 dark:border-gray-700 z-50 overflow-hidden"
                    >
                      <div className="py-1">
                        {schemeList.map((scheme) => (
                          <button
                            key={scheme}
                            onClick={() => handleSchemeChange(scheme)}
                            className={`w-full text-left px-4 py-2 text-sm ${
                              colorScheme === scheme
                                ? 'bg-blue-50 dark:bg-blue-900/50 text-blue-700 dark:text-blue-300'
                                : 'text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700'
                            }`}
                          >
                            {schemeLabels[scheme as keyof typeof schemeLabels] || scheme}
                          </button>
                        ))}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
              
              <motion.button
                onClick={generateNewPalette}
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.98 }}
                className="flex items-center space-x-2 px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white shadow-lg transition-colors"
              >
                <ArrowPathIcon className="h-4 w-4" />
                <span>Generate</span>
              </motion.button>
              <motion.button
                onClick={toggleDarkMode}
                className="p-2 rounded-full text-gray-700 dark:text-white hover:bg-gray-100 dark:hover:bg-gray-800 transition-all"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                aria-label={darkMode ? 'Switch to light mode' : 'Switch to dark mode'}
              >
                {darkMode ? (
                  <SunIcon className="h-5 w-5" />
                ) : (
                  <MoonIcon className="h-5 w-5" />
                )}
              </motion.button>
            </div>
          </div>
        </div>
      </motion.header>

      {/* Main Content */}
      <main className="pt-24 pb-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <AnimatePresence mode="wait">
          <motion.div 
            key={JSON.stringify(currentPalette.colors)}
            className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-6"
            initial="hidden"
            animate={controls}
            variants={{
              hidden: { opacity: 0 },
              visible: {
                opacity: 1,
                transition: {
                  staggerChildren: 0.1,
                  delayChildren: 0.1
                }
              }
            }}
          >
            {currentPalette.colors.map((color, index) => {
              const textColor = getContrastText(color);
              const isLight = textColor === '#000000';
              
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
                    y: -8,
                    scale: 1.02,
                    boxShadow: `0 25px 50px -12px ${color}40`,
                    zIndex: 10
                  }}
                  className="relative group rounded-2xl overflow-hidden transition-all duration-300"
                  style={{
                    background: `linear-gradient(145deg, ${color}cc, ${color}ee)`,
                    boxShadow: `0 10px 25px -5px ${color}20, 0 8px 10px -6px ${color}10`
                  }}
                >
                  {/* Color Display */}
                  <div 
                    className="h-48 flex items-end p-6 relative overflow-hidden"
                    style={{ backgroundColor: color }}
                  >
                    {/* Animated background pattern */}
                    <div className="absolute inset-0 opacity-10">
                      <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KICA8cmVjdCB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIGZpbGw9IiNmZmYiIGZpbGwtb3BhY2l0eT0iMC4xIi8+Cjwvc3ZnPg==')]">
                      </div>
                    </div>
                    
                    {/* Copy button */}
                    <motion.button
                      onClick={() => handleCopy(color)}
                      className={cn(
                        "absolute top-3 right-3 p-2.5 rounded-full backdrop-blur-sm transition-all",
                        isLight 
                          ? 'bg-black/10 hover:bg-black/20 text-gray-900' 
                          : 'bg-white/20 hover:bg-white/30 text-white',
                        copied === color ? 'scale-100' : 'scale-90 group-hover:scale-100',
                        "shadow-lg"
                      )}
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
                    >
                      {copied === color ? (
                        <CheckIcon className="h-4 w-4" />
                      ) : (
                        <ClipboardDocumentIcon className="h-4 w-4" />
                      )}
                    </motion.button>
                    
                    {/* Color info */}
                    <div className="relative z-10 w-full">
                      <motion.div 
                        className="text-sm font-mono font-bold mb-1"
                        style={{ color: isLight ? 'rgba(0,0,0,0.9)' : 'rgba(255,255,255,0.95)' }}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.2 + (index * 0.05) }}
                      >
                        {color.toUpperCase()}
                      </motion.div>
                      
                      <div className="flex items-center justify-between">
                        <motion.span 
                          className="text-xs font-medium px-2 py-1 rounded-full"
                          style={{ 
                            backgroundColor: isLight ? 'rgba(0,0,0,0.1)' : 'rgba(255,255,255,0.15)',
                            color: isLight ? 'rgba(0,0,0,0.9)' : 'rgba(255,255,255,0.9)'
                          }}
                          initial={{ opacity: 0, scale: 0.9 }}
                          animate={{ opacity: 1, scale: 1 }}
                          transition={{ delay: 0.3 + (index * 0.05) }}
                        >
                          {isLight ? 'Light' : 'Dark'} text
                        </motion.span>
                        
                        <motion.span 
                          className="text-xs font-medium"
                          style={{ color: isLight ? 'rgba(0,0,0,0.7)' : 'rgba(255,255,255,0.8)' }}
                          initial={{ opacity: 0, x: 10 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: 0.4 + (index * 0.05) }}
                        >
                          {['Primary', 'Secondary', 'Accent', 'Neutral', 'Success'][index] || `Color ${index + 1}`}
                        </motion.span>
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
                  <div className="absolute inset-0 pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-300"
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
          transition: { delay: 0.5 }
        }}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-lg rounded-xl p-4 shadow-lg border border-gray-100/20 dark:border-gray-800/50">
            <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
              <div className="flex items-center gap-3">
                <motion.div 
                  className="w-8 h-8 rounded-full flex items-center justify-center text-white"
                  style={{ backgroundColor: currentPalette.colors[0] || '#3b82f6' }}
                  animate={{
                    rotate: [0, 360],
                  }}
                  transition={{
                    duration: 8,
                    repeat: Infinity,
                    ease: 'linear',
                  }}
                >
                  <SwatchIcon className="h-4 w-4" />
                </motion.div>
                <div>
                  <p className="text-sm font-medium text-gray-900 dark:text-white">
                    {currentPalette.name}
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    {schemeLabels[colorScheme as keyof typeof schemeLabels] || colorScheme}
                  </p>
                </div>
              </div>
              
              <div className="flex items-center gap-2">
                <motion.button
                  onClick={generateNewPalette}
                  className={cn(
                    "px-4 py-2 rounded-lg flex items-center gap-2 text-sm font-medium",
                    "bg-gradient-to-r from-blue-500 to-purple-500 text-white",
                    "shadow-lg hover:shadow-xl transition-all duration-300",
                    "hover:scale-[1.02] active:scale-95"
                  )}
                  whileHover={{ 
                    y: -2,
                    boxShadow: '0 10px 15px -3px rgba(59, 130, 246, 0.3), 0 4px 6px -2px rgba(124, 58, 237, 0.3)'
                  }}
                  whileTap={{ scale: 0.98 }}
                >
                  <SparklesIcon className="h-4 w-4" />
                  <span>Generate New</span>
                </motion.button>
                
                <motion.button
                  onClick={toggleDarkMode}
                  className={cn(
                    "p-2 rounded-full flex items-center justify-center",
                    "bg-white/80 dark:bg-gray-800/80 text-gray-700 dark:text-gray-200",
                    "shadow-lg hover:shadow-xl transition-all duration-300",
                    "hover:scale-105 active:scale-95"
                  )}
                  whileHover={{ rotate: 15 }}
                  whileTap={{ scale: 0.9 }}
                  aria-label={darkMode ? 'Switch to light mode' : 'Switch to dark mode'}
                >
                  {darkMode ? (
                    <SunIcon className="h-5 w-5" />
                  ) : (
                    <MoonIcon className="h-5 w-5" />
                  )}
                </motion.button>
              </div>
            </div>
            
            <div className="mt-4 pt-4 border-t border-gray-100 dark:border-gray-800">
              <p className="text-center text-xs text-gray-500 dark:text-gray-400">
                Made with ❤️ by Gardo | {new Date().getFullYear()}
              </p>
            </div>
          </div>
        </div>
      </motion.footer>
    </div>
  );
};

export default ModernColorPalette;
