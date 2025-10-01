import { ThemeProvider } from './contexts/ThemeContext';
import ColorPaletteGenerator from './components/ColorPaletteGenerator';
function App() {
  return (
    <ThemeProvider>
      <ColorPaletteGenerator />
    </ThemeProvider>
  );
}

export default App;
