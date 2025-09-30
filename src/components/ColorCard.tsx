import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckIcon, ClipboardDocumentIcon } from '@heroicons/react/24/outline';
import { cn, getTextColor, getContrastRatio, copyToClipboard } from '../lib/utils';

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

  const handleCopy = (e: React.MouseEvent) => {
    e.stopPropagation();
    copyToClipboard(color).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  // Calcolo stili materiale
  const blur = reflectiveness > 0 ? (100 - reflectiveness) / 10 : 0;
  const opacityShadow = reflectiveness / 200;
  const shadow = reflectiveness > 0 ? `inset 0 0 ${blur}px rgba(255, 255, 255, ${opacityShadow}), inset 0 0 10px rgba(0, 0, 0, ${opacityShadow / 2})` : 'none';

  return (
    <motion.div
      className={cn(
        'relative group rounded-xl overflow-hidden shadow-lg transition-all duration-200',
        'hover:shadow-xl hover:-translate-y-1',
        'dark:shadow-gray-900/30',
        className
      )}
      style={{
        backgroundColor: color,
        color: textColor,
        opacity: opacity / 100,
        boxShadow: shadow,
        backdropFilter: opacity < 100 ? `blur(${(100 - opacity) / 20}px)` : 'none',
      }}
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      onClick={onClick}
      onMouseEnter={() => setShowTooltip(true)}
      onMouseLeave={() => setShowTooltip(false)}
    >
      {/* Sfondo per simulare l'ambiente per l'opacità */}
      {opacity < 100 && (
        <div className="absolute inset-0 z-0 opacity-20"
             style={{
                backgroundImage: 'url("data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAyMCAyMCI+PGcgZmlsbD0ibm9uZSIgc3Ryb2tlPSIjZmZmZmZmIiBzdHJva2Utd2lkdGg9IjEiPjxyZWN0IHdpZHRoPSI5IiBoZWlnaHQ9IjkiLz48cmVjdCB4PSIxMCIgeT0iMTAiIHdpZHRoPSI5IiBoZWlnaHQ9IjkiLz48L2c+PC9zdmc+")',
                backgroundSize: '20px 20px'
             }}
        ></div>
      )}

      <div className="p-4 h-32 sm:h-40 flex flex-col justify-between relative z-10">
        <div className="flex justify-between items-start">
          <div>
            {name && (
              <h3 className="font-semibold text-sm sm:text-base truncate max-w-[80%]">
                {name}
              </h3>
            )}
            {showHex && (
              <p className="text-xs sm:text-sm opacity-90 mt-1 font-mono">
                {color.toUpperCase()}
              </p>
            )}
          </div>

          <button
            onClick={handleCopy}
            className={cn(
              'p-1.5 rounded-md transition-colors',
              'hover:bg-black/10 dark:hover:bg-white/20',
              'focus:outline-none focus:ring-2 focus:ring-current'
            )}
            aria-label="Copy color to clipboard"
          >
            {copied ? (
              <CheckIcon className="w-4 h-4" />
            ) : (
              <ClipboardDocumentIcon className="w-4 h-4" />
            )}
          </button>
        </div>

        {showContrast && contrastScore && (
          <div className="mt-auto">
            <div className="flex items-center justify-between text-xs">
              <span className="opacity-80">Contrast</span>
              <span className="font-mono">{contrastScore}:1</span>
            </div>
            <div className="h-1.5 bg-black/10 dark:bg-white/10 rounded-full mt-1 overflow-hidden">
              <div
                className="h-full rounded-full"
                style={{
                  width: `${Math.min(contrastScore * 10, 100)}%`,
                  backgroundColor: textColor,
                  opacity: 0.7
                }}
              />
            </div>
            <div className="text-[10px] mt-1 flex justify-between">
              <span>1</span>
              <span>3</span>
              <span>4.5</span>
              <span>7</span>
              <span>21</span>
            </div>
          </div>
        )}
      </div>

      <AnimatePresence>
        {showTooltip && (
          <motion.div
            className="absolute bottom-2 right-2 bg-black/80 text-white text-xs px-2 py-1 rounded-md"
            initial={{ opacity: 0, y: 5 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 5 }}
            transition={{ duration: 0.2 }}
          >
            Click to select
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

export default ColorCard;
