import { useEffect } from 'react';
import { useThemeStore } from '../store/useThemeStore';
import { TooltipProvider } from './ui/tooltip';

interface LayoutProps {
  children: React.ReactNode;
}

export function Layout({ children }: LayoutProps) {
  const { darkMode } = useThemeStore();
  
  useEffect(() => {
    // Imposta la classe dark sul documento
    if (darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [darkMode]);

  return (
    <TooltipProvider>
      <div className="min-h-screen bg-background text-foreground transition-colors">
        {children}
      </div>
    </TooltipProvider>
  );
}
