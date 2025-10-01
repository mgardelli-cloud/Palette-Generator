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

  return (
    <motion.div
      className={cn(
        'relative group rounded-xl overflow-hidden shadow-lg transition-all duration-200',
        'hover:shadow-xl hover:-translate-y-1 flex flex-col',
        'dark:shadow-gray-900/30 h-full',
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
      {/* Background for opacity simulation */}
      {opacity < 100 && (
        <div 
          className="absolute inset-0 z-0 opacity-20"
          style={{
            backgroundImage: 'url("data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAyMCAyMCI+PGcgZmlsbD0ibm9uZSIgc3Ryb2tlPSIjMDAwIiBzdHJva2Utd2lkdGg9IjEiPjxyZWN0IHdpZHRoPSI5IiBoZWlnaHQ9IjkiLz48cmVjdCB4PSIxMCIgeT0iMTAiIHdpZHRoPSI5IiBoZWlnaHQ9IjkiLz48L2c+PC9zdmc+")',
            backgroundSize: '20px 20px'
          }}
        />
      )}

      <div className="p-4 flex flex-col h-full relative z-10">
        <div className="flex justify-between items-start mb-2">
          <div className="space-y-1">
            <div className="min-w-0">
              {name && (
                <h3 className="font-semibold text-sm sm:text-base truncate max-w-[180px] sm:max-w-[220px]" title={name}>
                  {name}
                </h3>
              )}
              <div className="space-y-0.5">
                {showHex && (
                  <p className="text-xs sm:text-sm opacity-90 font-mono truncate" title={color.toUpperCase()}>
                    {color.toUpperCase()}
                  </p>
                )}
                <p className="text-xs sm:text-sm opacity-90 font-mono truncate" title={rgbString}>
                  {rgbString}
                </p>
              </div>
            </div>
          </div>

          <button
            onClick={handleCopy}
            className={cn(
              'p-1.5 rounded-md transition-colors flex-shrink-0',
              'hover:bg-black/10 dark:hover:bg-white/20',
              'focus:outline-none focus:ring-2 focus:ring-current',
              'self-start mt-1'
            )}
            aria-label="Copy color to clipboard"
          >
            <AnimatePresence mode="wait">
              <motion.span
                key={copied ? 'copied' : 'copy'}
                initial={{ opacity: 0, y: 5 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -5 }}
                transition={{ duration: 0.1 }}
                className="block"
              >
                {copied ? (
                  <CheckIcon className="h-4 w-4" />
                ) : (
                  <ClipboardDocumentIcon className="h-4 w-4" />
                )}
              </motion.span>
            </AnimatePresence>
          </button>
        </div>

        <div className="mt-auto pt-3">
          {contrastScore !== null && (
            <div className="text-xs opacity-80">
              <div className="h-1.5 w-full bg-black/10 dark:bg-white/10 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-current"
                  style={{ 
                    width: `${Math.min(100, contrastScore * 10)}%`,
                    backgroundColor: textColor 
                  }}
                />
              </div>
              <div className="mt-1 flex justify-between">
                <span>Contrast</span>
                <span className="font-mono">{contrastScore}:1</span>
              </div>
            </div>
          )}
          {onClick && (
            <div className="mt-2">
              {/* Empty div to maintain spacing */}
              <div className="h-4"></div>
            </div>
          )}
        </div>
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
