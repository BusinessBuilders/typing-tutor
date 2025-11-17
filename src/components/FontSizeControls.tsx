/**
 * Font Size Controls Component
 * Step 132 - Dynamic font sizing for accessibility
 */

import { motion } from 'framer-motion';
import { useSettingsStore } from '../store/useSettingsStore';

export type FontSize =
  | 'xs'
  | 'sm'
  | 'base'
  | 'lg'
  | 'xl'
  | '2xl'
  | '3xl'
  | '4xl'
  | '5xl'
  | '6xl';

export interface FontSizeConfig {
  id: FontSize;
  name: string;
  className: string;
  pixels: number;
  recommended: string;
}

export const fontSizes: Record<FontSize, FontSizeConfig> = {
  xs: {
    id: 'xs',
    name: 'Extra Small',
    className: 'text-xs',
    pixels: 12,
    recommended: 'Very small screens',
  },
  sm: {
    id: 'sm',
    name: 'Small',
    className: 'text-sm',
    pixels: 14,
    recommended: 'Compact view',
  },
  base: {
    id: 'base',
    name: 'Base',
    className: 'text-base',
    pixels: 16,
    recommended: 'Standard reading',
  },
  lg: {
    id: 'lg',
    name: 'Large',
    className: 'text-lg',
    pixels: 18,
    recommended: 'Comfortable reading',
  },
  xl: {
    id: 'xl',
    name: 'Extra Large',
    className: 'text-xl',
    pixels: 20,
    recommended: 'Easy reading',
  },
  '2xl': {
    id: '2xl',
    name: '2X Large',
    className: 'text-2xl',
    pixels: 24,
    recommended: 'Large display',
  },
  '3xl': {
    id: '3xl',
    name: '3X Large',
    className: 'text-3xl',
    pixels: 30,
    recommended: 'Very large display',
  },
  '4xl': {
    id: '4xl',
    name: '4X Large',
    className: 'text-4xl',
    pixels: 36,
    recommended: 'Accessibility',
  },
  '5xl': {
    id: '5xl',
    name: '5X Large',
    className: 'text-5xl',
    pixels: 48,
    recommended: 'Maximum visibility',
  },
  '6xl': {
    id: '6xl',
    name: '6X Large',
    className: 'text-6xl',
    pixels: 60,
    recommended: 'Visual impairment',
  },
};

export interface FontSizeControlsProps {
  currentSize: FontSize;
  onSizeChange: (size: FontSize) => void;
  showPreview?: boolean;
}

export default function FontSizeControls({
  currentSize,
  onSizeChange,
  showPreview = true,
}: FontSizeControlsProps) {
  const { settings } = useSettingsStore();

  const sizeOptions: FontSize[] = ['sm', 'base', 'lg', 'xl', '2xl', '3xl', '4xl', '5xl', '6xl'];

  return (
    <div className="bg-white rounded-xl shadow-lg p-6 space-y-6">
      <h3 className="text-lg font-bold text-gray-800 flex items-center space-x-2">
        <span>🔤</span>
        <span>Font Size</span>
      </h3>

      {/* Size slider */}
      <div className="space-y-4">
        {sizeOptions.map((size) => {
          const config = fontSizes[size];
          const isSelected = currentSize === size;

          return (
            <motion.button
              key={size}
              onClick={() => onSizeChange(size)}
              whileHover={{ scale: settings.reducedMotion ? 1 : 1.02 }}
              whileTap={{ scale: settings.reducedMotion ? 1 : 0.98 }}
              className={`
                w-full p-4 rounded-lg border-2 text-left transition-all
                ${
                  isSelected
                    ? 'border-primary-500 bg-primary-50'
                    : 'border-gray-200 hover:border-primary-300 hover:bg-gray-50'
                }
              `}
            >
              <div className="flex items-center justify-between">
                <div>
                  <div className="font-bold text-gray-800">{config.name}</div>
                  <div className="text-sm text-gray-600">{config.pixels}px</div>
                  <div className="text-xs text-primary-600 mt-1">
                    💡 {config.recommended}
                  </div>
                </div>

                {/* Preview */}
                <div className={`${config.className} font-bold text-gray-800`}>
                  Aa
                </div>
              </div>
            </motion.button>
          );
        })}
      </div>

      {/* Live preview */}
      {showPreview && (
        <div className="mt-6 p-6 bg-gray-50 rounded-lg">
          <div className="text-sm text-gray-600 mb-3">Preview:</div>
          <div className={`${fontSizes[currentSize].className} text-gray-800 font-medium`}>
            The quick brown fox jumps over the lazy dog
          </div>
        </div>
      )}

      {/* Quick size buttons */}
      <div className="flex justify-center space-x-2 mt-6">
        <QuickSizeButton
          label="A-"
          onClick={() => {
            const currentIndex = sizeOptions.indexOf(currentSize);
            if (currentIndex > 0) {
              onSizeChange(sizeOptions[currentIndex - 1]);
            }
          }}
          disabled={sizeOptions.indexOf(currentSize) === 0}
        />

        <QuickSizeButton
          label="A"
          onClick={() => onSizeChange('base')}
          disabled={currentSize === 'base'}
        />

        <QuickSizeButton
          label="A+"
          onClick={() => {
            const currentIndex = sizeOptions.indexOf(currentSize);
            if (currentIndex < sizeOptions.length - 1) {
              onSizeChange(sizeOptions[currentIndex + 1]);
            }
          }}
          disabled={sizeOptions.indexOf(currentSize) === sizeOptions.length - 1}
        />
      </div>
    </div>
  );
}

// Quick size adjustment button
function QuickSizeButton({
  label,
  onClick,
  disabled,
}: {
  label: string;
  onClick: () => void;
  disabled?: boolean;
}) {
  const { settings } = useSettingsStore();

  return (
    <motion.button
      onClick={onClick}
      disabled={disabled}
      whileHover={{ scale: settings.reducedMotion || disabled ? 1 : 1.1 }}
      whileTap={{ scale: settings.reducedMotion || disabled ? 1 : 0.9 }}
      className={`
        px-6 py-3 rounded-lg font-bold transition-all
        ${
          disabled
            ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
            : 'bg-primary-500 text-white hover:bg-primary-600'
        }
      `}
    >
      {label}
    </motion.button>
  );
}

// Responsive font size hook
export function useResponsiveFontSize(baseSize: FontSize = 'base') {
  const { settings } = useSettingsStore();

  // Get current font size from settings or use base
  const currentSize = (settings.fontSize as FontSize) || baseSize;

  return {
    fontSize: currentSize,
    className: fontSizes[currentSize].className,
    pixels: fontSizes[currentSize].pixels,
  };
}

// Font size comparison view
export function FontSizeComparison() {
  const sizes: FontSize[] = ['sm', 'base', 'lg', 'xl', '2xl', '3xl', '4xl'];

  return (
    <div className="bg-white rounded-xl shadow-lg p-6 space-y-6">
      <h3 className="text-lg font-bold text-gray-800">Font Size Comparison</h3>

      <div className="space-y-6">
        {sizes.map((size) => {
          const config = fontSizes[size];

          return (
            <div key={size} className="border-b border-gray-200 pb-4 last:border-b-0">
              <div className="flex items-baseline justify-between mb-2">
                <span className="text-sm font-medium text-gray-600">
                  {config.name} ({config.pixels}px)
                </span>
              </div>
              <div className={`${config.className} text-gray-800`}>
                The quick brown fox jumps over the lazy dog
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// Adaptive font size (adjusts based on screen size)
export function useAdaptiveFontSize() {
  const getAdaptiveSize = (): FontSize => {
    if (typeof window === 'undefined') return 'base';

    const width = window.innerWidth;

    if (width < 640) return 'sm'; // Mobile
    if (width < 768) return 'base'; // Tablet
    if (width < 1024) return 'lg'; // Small desktop
    if (width < 1280) return 'xl'; // Desktop
    return '2xl'; // Large desktop
  };

  return getAdaptiveSize();
}
