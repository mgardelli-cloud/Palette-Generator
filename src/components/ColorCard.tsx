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
}

const ColorCard: React.FC<ColorCardProps> = ({
  color,
  name,
  className = '',
  showContrast = true,
  showHex = true,
  onClick,
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

  return (
    <motion.div
      className={cn(
        'relative group rounded-xl overflow-hidden shadow-lg transition-all duration-200',
        'hover:shadow-xl hover:-translate-y-1',
        'dark:shadow-gray-900/30',
        className
      )}
      style={{ backgroundColor: color, color: textColor }}
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      onClick={onClick}
      onMouseEnter={() => setShowTooltip(true)}
      onMouseLeave={() => setShowTooltip(false)}
    >
      <div className="p-4 h-32 sm:h-40 flex flex-col justify-between">
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
