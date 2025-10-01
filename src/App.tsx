import { ThemeProvider } from './contexts/ThemeContext';
import { motion, AnimatePresence } from 'framer-motion';
import { lazy, Suspense } from 'react';
import { LoadingSpinner } from './components/ui/loading-spinner';

const ColorPaletteGenerator = lazy(() => import('./components/ColorPaletteGenerator'));

function App() {
  return (
    <ThemeProvider>
      <AnimatePresence mode="wait">
        <div className="min-h-screen bg-white dark:bg-black transition-colors duration-200">
          <main className="px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
            >
              <ColorPaletteGenerator />
            </motion.div>
          </main>
          
          {/* Footer */}
          <footer className="fixed bottom-0 left-0 right-0 bg-white/40 dark:bg-black/60 backdrop-blur-md border-t border-gray-200/50 dark:border-gray-800/50 py-4">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <p className="text-center text-sm text-gray-900 dark:text-gray-400 font-medium">
                Made by Gardo
              </p>
            </div>
          </footer>
        </div>
      </AnimatePresence>
    </ThemeProvider>
  );
}

export default App;
