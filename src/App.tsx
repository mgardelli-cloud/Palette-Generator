import React, { lazy, Suspense } from 'react';
import { ThemeProvider } from './contexts/ThemeContext';
import { motion, AnimatePresence } from 'framer-motion';
import { LoadingSpinner } from './components/ui/loading-spinner';
import { GlassCard } from './components/ui/GlassCard';
import { SunIcon, MoonIcon } from '@heroicons/react/24/outline';

const ColorPaletteGenerator = lazy(() => import('./components/ColorPaletteGenerator'));

const AnimatedBackground = () => (
  <div className="fixed inset-0 -z-10 overflow-hidden">
    <div className="absolute inset-0 bg-gradient-to-br from-white to-gray-50 dark:from-gray-900 dark:to-gray-950 transition-colors duration-500" />
    <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-transparent via-white/30 to-transparent dark:from-transparent dark:via-black/20 dark:to-transparent" />
  </div>
);

function App() {
  return (
    <ThemeProvider>
      <AnimatePresence mode="wait">
        <div className="min-h-screen bg-gradient-to-br from-white to-gray-50 dark:from-gray-900 dark:to-gray-950 transition-colors duration-500">
          <AnimatedBackground />
          
          <div className="relative z-10 min-h-screen flex flex-col">
            <motion.header 
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, ease: [0.4, 0, 0.2, 1] }}
              className="sticky top-0 z-50 bg-white/80 dark:bg-gray-900/80 backdrop-blur-md border-b border-gray-200/50 dark:border-gray-800/50"
            >
              <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
                <div className="flex items-center justify-between">
                  <h1 className="text-2xl font-bold bg-gradient-to-r from-indigo-600 via-purple-500 to-pink-500 bg-clip-text text-transparent">
                    Spectra
                  </h1>
                  <button
                    onClick={() => document.documentElement.classList.toggle('dark')}
                    className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                    aria-label="Toggle dark mode"
                  >
                    <div className="w-5 h-5">
                      <SunIcon className="w-5 h-5 text-gray-600 dark:text-gray-300 transition-opacity duration-300 dark:opacity-0 absolute" />
                      <MoonIcon className="w-5 h-5 text-gray-600 dark:text-gray-300 transition-opacity duration-300 opacity-0 dark:opacity-100" />
                    </div>
                  </button>
                </div>
              </div>
            </motion.header>

            <main className="flex-1 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto w-full py-8 md:py-12">
              <GlassCard 
                className="p-6 sm:p-8"
              >
                <Suspense fallback={
                  <div className="flex items-center justify-center h-64">
                    <LoadingSpinner size="lg" />
                  </div>
                }>
                  <ColorPaletteGenerator />
                </Suspense>
              </GlassCard>
            </main>
            
            <motion.footer 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3, duration: 0.5 }}
              className="mt-auto py-6"
            >
              <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <p className="text-center text-sm text-gray-600 dark:text-gray-400 font-medium">
                  Made by Gardo
                </p>
              </div>
            </motion.footer>
          </div>
        </div>
      </AnimatePresence>
    </ThemeProvider>
  );
}

export default App;
