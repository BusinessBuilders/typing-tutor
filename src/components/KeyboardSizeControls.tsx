/**
 * Keyboard Size Controls Component
 * Step 116 - Adjustable keyboard sizing for accessibility
 */

import { motion } from 'framer-motion';
import { useState } from 'react';
import { useSettingsStore } from '../store/useSettingsStore';

export type KeyboardSize = 'tiny' | 'small' | 'medium' | 'large' | 'xlarge' | 'jumbo';

export interface KeyboardSizeConfig {
  id: KeyboardSize;
  name: string;
  description: string;
  keySize: string; // Tailwind classes
  fontSize: string;
  spacing: string;
  icon: string;
  recommended?: string;
}

export const keyboardSizes: Record<KeyboardSize, KeyboardSizeConfig> = {
  tiny: {
    id: 'tiny',
    name: 'Tiny',
    description: 'Compact for small screens',
    keySize: 'w-8 h-8 min-w-[2rem]',
    fontSize: 'text-xs',
    spacing: 'gap-1',
    icon: '🔍',
    recommended: 'Mobile devices',
  },
  small: {
    id: 'small',
    name: 'Small',
    description: 'Smaller keys, more compact',
    keySize: 'w-10 h-10 min-w-[2.5rem]',
    fontSize: 'text-sm',
    spacing: 'gap-1.5',
    icon: '📱',
    recommended: 'Tablets',
  },
  medium: {
    id: 'medium',
    name: 'Medium',
    description: 'Standard size, balanced',
    keySize: 'w-12 h-12 min-w-[3rem]',
    fontSize: 'text-base',
    spacing: 'gap-2',
    icon: '💻',
    recommended: 'Desktop default',
  },
  large: {
    id: 'large',
    name: 'Large',
    description: 'Bigger keys, easier to tap',
    keySize: 'w-16 h-16 min-w-[4rem]',
    fontSize: 'text-lg',
    spacing: 'gap-3',
    icon: '🖥️',
    recommended: 'Better visibility',
  },
  xlarge: {
    id: 'xlarge',
    name: 'Extra Large',
    description: 'Very large, highly visible',
    keySize: 'w-20 h-20 min-w-[5rem]',
    fontSize: 'text-xl',
    spacing: 'gap-4',
    icon: '📺',
    recommended: 'Accessibility',
  },
  jumbo: {
    id: 'jumbo',
    name: 'Jumbo',
    description: 'Maximum size for accessibility',
    keySize: 'w-24 h-24 min-w-[6rem]',
    fontSize: 'text-2xl',
    spacing: 'gap-5',
    icon: '🎯',
    recommended: 'Motor challenges',
  },
};

export interface KeyboardSizeControlsProps {
  currentSize: KeyboardSize;
  onSizeChange: (size: KeyboardSize) => void;
  showPreview?: boolean;
}

export default function KeyboardSizeControls({
  currentSize,
  onSizeChange,
  showPreview = true,
}: KeyboardSizeControlsProps) {
  const { settings } = useSettingsStore();
  const [previewSize, setPreviewSize] = useState<KeyboardSize>(currentSize);

  const handleSizeChange = (size: KeyboardSize) => {
    setPreviewSize(size);
    onSizeChange(size);
  };

  return (
    <div className="space-y-6">
      {/* Size Slider */}
      <div className="bg-white rounded-xl shadow-lg p-6">
        <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center space-x-2">
          <span>🎚️</span>
          <span>Keyboard Size</span>
        </h3>

        {/* Visual slider */}
        <div className="space-y-4">
          {Object.values(keyboardSizes).map((size) => (
            <motion.div
              key={size.id}
              whileHover={{ scale: settings.reducedMotion ? 1 : 1.01 }}
              onClick={() => handleSizeChange(size.id)}
              className={`
                p-4 rounded-lg border-2 cursor-pointer transition-all
                ${
                  currentSize === size.id
                    ? 'border-primary-500 bg-primary-50'
                    : 'border-gray-200 hover:border-primary-300 hover:bg-gray-50'
                }
              `}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <span className="text-2xl">{size.icon}</span>
                  <div>
                    <h4 className="font-bold text-gray-800">{size.name}</h4>
                    <p className="text-sm text-gray-600">{size.description}</p>
                    {size.recommended && (
                      <p className="text-xs text-primary-600 mt-1">
                        💡 {size.recommended}
                      </p>
                    )}
                  </div>
                </div>

                {/* Preview button */}
                <div
                  className={`
                    ${size.keySize} ${size.fontSize}
                    bg-gradient-to-br from-primary-400 to-primary-600
                    text-white rounded-lg shadow-md
                    flex items-center justify-center font-bold
                  `}
                >
                  A
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Live Preview */}
      {showPreview && (
        <div className="bg-white rounded-xl shadow-lg p-6">
          <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center space-x-2">
            <span>👀</span>
            <span>Preview</span>
          </h3>

          <KeyboardPreview size={previewSize} />
        </div>
      )}

      {/* Quick Size Buttons */}
      <div className="flex justify-center space-x-3">
        <SizeButton size="small" current={currentSize} onChange={handleSizeChange} />
        <SizeButton size="medium" current={currentSize} onChange={handleSizeChange} />
        <SizeButton size="large" current={currentSize} onChange={handleSizeChange} />
        <SizeButton size="xlarge" current={currentSize} onChange={handleSizeChange} />
      </div>
    </div>
  );
}

// Quick size button
function SizeButton({
  size,
  current,
  onChange,
}: {
  size: KeyboardSize;
  current: KeyboardSize;
  onChange: (size: KeyboardSize) => void;
}) {
  const config = keyboardSizes[size];
  const { settings } = useSettingsStore();

  return (
    <motion.button
      onClick={() => onChange(size)}
      whileHover={{ scale: settings.reducedMotion ? 1 : 1.1 }}
      whileTap={{ scale: settings.reducedMotion ? 1 : 0.9 }}
      className={`
        px-4 py-2 rounded-lg font-medium transition-all
        ${
          current === size
            ? 'bg-primary-600 text-white shadow-lg'
            : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
        }
      `}
    >
      {config.name}
    </motion.button>
  );
}

// Keyboard preview component
function KeyboardPreview({ size }: { size: KeyboardSize }) {
  const config = keyboardSizes[size];

  const sampleKeys = ['Q', 'W', 'E', 'R', 'T', 'Y'];

  return (
    <div className="flex justify-center">
      <div className={`flex ${config.spacing} flex-wrap justify-center max-w-2xl`}>
        {sampleKeys.map((key) => (
          <motion.div
            key={key}
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.2 }}
            className={`
              ${config.keySize} ${config.fontSize}
              bg-gradient-to-br from-white to-gray-100
              text-gray-800 rounded-lg shadow-md
              flex items-center justify-center font-bold
              border-2 border-gray-200
            `}
          >
            {key}
          </motion.div>
        ))}
      </div>
    </div>
  );
}

// Size comparison chart
export function SizeComparisonChart() {
  return (
    <div className="bg-white rounded-xl shadow-lg p-6">
      <h3 className="text-lg font-bold text-gray-800 mb-4">Size Comparison</h3>

      <div className="space-y-6">
        {Object.values(keyboardSizes).map((size) => (
          <div key={size.id} className="flex items-center space-x-4">
            <div className="w-24 text-sm font-medium text-gray-600">{size.name}</div>

            <div className="flex-1 bg-gray-100 rounded-lg p-2 flex items-center">
              <div
                className={`
                  ${size.keySize} ${size.fontSize}
                  bg-primary-500 text-white rounded-lg shadow-md
                  flex items-center justify-center font-bold
                `}
              >
                A
              </div>
            </div>

            <div className="text-xs text-gray-500 w-32">
              {size.recommended || size.description}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// Hook to manage keyboard size
export function useKeyboardSize(defaultSize: KeyboardSize = 'medium') {
  const [size, setSize] = useState<KeyboardSize>(defaultSize);

  const getSizeConfig = () => keyboardSizes[size];

  const increaseSize = () => {
    const sizes: KeyboardSize[] = ['tiny', 'small', 'medium', 'large', 'xlarge', 'jumbo'];
    const currentIndex = sizes.indexOf(size);
    if (currentIndex < sizes.length - 1) {
      setSize(sizes[currentIndex + 1]);
    }
  };

  const decreaseSize = () => {
    const sizes: KeyboardSize[] = ['tiny', 'small', 'medium', 'large', 'xlarge', 'jumbo'];
    const currentIndex = sizes.indexOf(size);
    if (currentIndex > 0) {
      setSize(sizes[currentIndex - 1]);
    }
  };

  return {
    size,
    setSize,
    config: getSizeConfig(),
    increaseSize,
    decreaseSize,
  };
}
