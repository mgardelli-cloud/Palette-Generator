import { ThemeProvider } from './contexts/ThemeContext';
import ColorPaletteGenerator from './components/ColorPaletteGenerator';
import './App.css';

function App() {
  return (
    <ThemeProvider>
      <ColorPaletteGenerator />
    </ThemeProvider>
  );
}

export default App;
