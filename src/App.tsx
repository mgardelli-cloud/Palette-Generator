import { ThemeProvider } from './contexts/ThemeContext';
import { motion, AnimatePresence } from 'framer-motion';
import ColorPaletteGenerator from './components/ColorPaletteGenerator';
import Navbar from './components/Navbar';

function App() {
  return (
    <ThemeProvider>
      <AnimatePresence mode="wait">
        <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 transition-colors duration-200">
          <Navbar />
          <main className="pt-20 pb-16 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
            >
              <ColorPaletteGenerator />
            </motion.div>
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
      </AnimatePresence>
    </ThemeProvider>
  );
}

export default App;
