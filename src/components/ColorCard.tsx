import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckIcon, ClipboardDocumentIcon } from '@heroicons/react/24/outline';
import { cn, getTextColor, getContrastRatio, copyToClipboard, hexToRgb } from '../lib/utils';

interface ColorCardProps {
  color: string;
  name?: string;
  className?: string;
  showContrast?: boolean;
  showHex?: boolean;
  onClick?: () => void;
  reflectiveness?: number;
  opacity?: number;
}

const ColorCard: React.FC<ColorCardProps> = ({
  color,
  name,
  className = '',
  showContrast = true,
  showHex = true,
  onClick,
  reflectiveness = 0,
  opacity = 100,
}) => {
  const [copied, setCopied] = useState(false);
  const [showTooltip, setShowTooltip] = useState(false);
  const textColor = getTextColor(color);
  const contrastRatio = showContrast ? getContrastRatio(color, textColor) : null;
  const contrastScore = contrastRatio ? Math.round(contrastRatio * 10) / 10 : null;
  
  // Convert hex to RGB
  const rgbColor = hexToRgb(color) || { r: 0, g: 0, b: 0 };
  const rgbString = `RGB: ${rgbColor.r}, ${rgbColor.g}, ${rgbColor.b}`;

  const handleCopy = (e: React.MouseEvent) => {
    e.stopPropagation();
    copyToClipboard(color).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  // Material style calculation
  const blur = reflectiveness > 0 ? (100 - reflectiveness) / 10 : 0;
  const opacityShadow = reflectiveness / 200;
  const shadow = reflectiveness > 0 
    ? `inset 0 0 ${blur}px rgba(255, 255, 255, ${opacityShadow}), inset 0 0 10px rgba(0, 0, 0, ${opacityShadow / 2})` 
    : 'none';

  // Determina il colore del testo in base al contrasto
  const textStyle = {
    color: textColor === 'black' ? 'rgba(0, 0, 0, 0.9)' : 'rgba(255, 255, 255, 0.95)'
  };

  return (
    <motion.div
      className={cn(
        'relative overflow-hidden rounded-lg shadow-lg transition-all duration-300 group',
        'hover:shadow-xl hover:-translate-y-0.5',
        'h-40 flex flex-col',
        className
      )}
      style={{
        backgroundColor: color,
        opacity: `${opacity}%`,
        boxShadow: shadow,
      }}
      onClick={onClick}
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
    >
      {/* Copy button */}
      <motion.div 
        className="absolute right-0 top-0 p-2 z-20"
        onMouseEnter={() => setShowTooltip(true)}
        onMouseLeave={() => setShowTooltip(false)}
      >
        <motion.button
          className={cn(
            'p-1.5 rounded-full transition-all',
            'bg-white/20 backdrop-blur-sm',
            'hover:bg-white/30',
            'focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-white/50 focus:ring-white/50',
            'text-white',
            'transform transition-transform hover:scale-110',
            'flex items-center justify-center w-7 h-7' // Dimensione fissa per il bottone
          )}
          onClick={handleCopy}
          aria-label="Copy color to clipboard"
        >
          {copied ? (
            <CheckIcon className="w-3.5 h-3.5" />
          ) : (
            <ClipboardDocumentIcon className="w-3.5 h-3.5" />
          )}
        </motion.button>
      </motion.div>

      <div className="flex flex-col h-full p-4 relative z-10">
        {/* Nome del colore */}
        {name && (
          <h3 
            className="text-sm font-medium truncate mb-1"
            style={textStyle}
          >
            {name}
          </h3>
        )}

        {/* Codice esadecimale */}
        {showHex && (
          <p 
            className="text-xs font-mono mb-2"
            style={textStyle}
          >
            {color.toUpperCase()}
          </p>
        )}

        {/* Indicatore di contrasto */}
        {contrastScore !== null && (
          <div className="mt-auto">
            <div 
              className="h-1.5 w-full rounded-full overflow-hidden mb-1" 
              style={{ 
                backgroundColor: textColor === '#000000' ? 'rgba(0,0,0,0.1)' : 'rgba(255,255,255,0.2)'
              }}
            >
              <div 
                className="h-full"
                style={{ 
                  width: `${Math.min(100, contrastScore * 10)}%`,
                  backgroundColor: textStyle.color 
                }}
              />
            </div>
            <div className="flex justify-between text-xs" style={textStyle}>
              <span>Contrasto</span>
              <span className="font-mono">{contrastScore}:1</span>
            </div>
          </div>
        )}
      </div>

      {/* Tooltip */}
      <AnimatePresence>
        {showTooltip && (
          <motion.div
            className="absolute bottom-2 right-2 bg-black/80 text-white text-xs px-2 py-1 rounded-md z-30"
            initial={{ opacity: 0, y: 5 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 5 }}
            transition={{ duration: 0.2 }}
          >
            Clicca per copiare
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

export default ColorCard;
