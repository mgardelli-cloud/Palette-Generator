import { useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence, useAnimation } from 'framer-motion';
import { useTheme } from '../contexts/ThemeContext';
import { 
  ArrowPathIcon, 
  CheckIcon, 
  ClipboardDocumentIcon,
  MoonIcon,
  SunIcon,
  SwatchIcon
} from '@heroicons/react/24/outline';

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
  const menuRef = useRef<HTMLDivElement>(null);

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
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                Color Palette Generator
              </h1>
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
            className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4"
            initial="hidden"
            animate={controls}
            variants={{
              hidden: { opacity: 0 },
              visible: {
                opacity: 1,
                transition: {
                  staggerChildren: 0.1,
                  delayChildren: 0.2
                }
              }
            }}
          >
            {currentPalette.colors.map((color, index) => (
              <motion.div
                key={`${color}-${index}`}
                variants={{
                  hidden: { opacity: 0, y: 20 },
                  visible: { 
                    opacity: 1, 
                    y: 0,
                    transition: { 
                      type: 'spring',
                      stiffness: 300,
                      damping: 20
                    }
                  }
                }}
                whileHover={{ 
                  y: -5,
                  boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)'
                }}
                className="rounded-xl overflow-hidden shadow-md"
              >
                <div 
                  className="h-40 flex items-end p-4 relative group"
                  style={{ backgroundColor: color }}
                >
                  <motion.button
                    onClick={() => handleCopy(color)}
                    className="absolute top-2 right-2 p-2 rounded-full bg-white/20 backdrop-blur-sm text-white opacity-0 group-hover:opacity-100 transition-opacity"
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                  >
                    {copied === color ? (
                      <CheckIcon className="h-5 w-5" />
                    ) : (
                      <ClipboardDocumentIcon className="h-5 w-5" />
                    )}
                  </motion.button>
                  
                  <div className="w-full">
                    <span className="text-sm font-medium text-white/90">
                      {color.toUpperCase()}
                    </span>
                  </div>
                </div>
                <div className="p-4 bg-white dark:bg-gray-800">
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium text-gray-900 dark:text-white">
                      Color {index + 1}
                    </span>
                    <span className="text-xs text-gray-500 dark:text-gray-400">
                      {Math.round(Math.random() * 100)}%
                    </span>
                  </div>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </AnimatePresence>
      </main>
      
      {/* Footer */}
      <footer className="fixed bottom-0 left-0 right-0 bg-white/80 dark:bg-gray-900/80 backdrop-blur-md border-t border-gray-200 dark:border-gray-800 py-4">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <p className="text-center text-sm text-gray-500 dark:text-gray-400">
            Made with ❤️ by Your Name
          </p>
        </div>
      </footer>
    </div>
  );
};

export default ModernColorPalette;
