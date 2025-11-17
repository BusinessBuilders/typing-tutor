/**
 * Virtual Keyboard Component
 * Step 111 - Interactive on-screen keyboard for typing practice
 */

import { motion } from 'framer-motion';
import { useSettingsStore } from '../store/useSettingsStore';

export interface KeyData {
  key: string;
  display: string;
  width?: number; // relative width (1 = standard key)
  type?: 'letter' | 'space' | 'enter' | 'backspace' | 'shift' | 'special';
}

export interface VirtualKeyboardProps {
  layout?: 'qwerty' | 'abc' | 'dvorak';
  highlightKey?: string;
  pressedKey?: string;
  onKeyPress?: (key: string) => void;
  showHands?: boolean;
  size?: 'small' | 'medium' | 'large';
  disabled?: boolean;
}

// Standard QWERTY layout
const qwertyLayout: KeyData[][] = [
  [
    { key: '1', display: '1', type: 'letter' },
    { key: '2', display: '2', type: 'letter' },
    { key: '3', display: '3', type: 'letter' },
    { key: '4', display: '4', type: 'letter' },
    { key: '5', display: '5', type: 'letter' },
    { key: '6', display: '6', type: 'letter' },
    { key: '7', display: '7', type: 'letter' },
    { key: '8', display: '8', type: 'letter' },
    { key: '9', display: '9', type: 'letter' },
    { key: '0', display: '0', type: 'letter' },
    { key: 'Backspace', display: '⌫', width: 2, type: 'backspace' },
  ],
  [
    { key: 'q', display: 'Q', type: 'letter' },
    { key: 'w', display: 'W', type: 'letter' },
    { key: 'e', display: 'E', type: 'letter' },
    { key: 'r', display: 'R', type: 'letter' },
    { key: 't', display: 'T', type: 'letter' },
    { key: 'y', display: 'Y', type: 'letter' },
    { key: 'u', display: 'U', type: 'letter' },
    { key: 'i', display: 'I', type: 'letter' },
    { key: 'o', display: 'O', type: 'letter' },
    { key: 'p', display: 'P', type: 'letter' },
  ],
  [
    { key: 'a', display: 'A', type: 'letter' },
    { key: 's', display: 'S', type: 'letter' },
    { key: 'd', display: 'D', type: 'letter' },
    { key: 'f', display: 'F', type: 'letter' },
    { key: 'g', display: 'G', type: 'letter' },
    { key: 'h', display: 'H', type: 'letter' },
    { key: 'j', display: 'J', type: 'letter' },
    { key: 'k', display: 'K', type: 'letter' },
    { key: 'l', display: 'L', type: 'letter' },
  ],
  [
    { key: 'Shift', display: '⇧', width: 1.5, type: 'shift' },
    { key: 'z', display: 'Z', type: 'letter' },
    { key: 'x', display: 'X', type: 'letter' },
    { key: 'c', display: 'C', type: 'letter' },
    { key: 'v', display: 'V', type: 'letter' },
    { key: 'b', display: 'B', type: 'letter' },
    { key: 'n', display: 'N', type: 'letter' },
    { key: 'm', display: 'M', type: 'letter' },
    { key: 'Enter', display: '↵', width: 1.5, type: 'enter' },
  ],
  [
    { key: ' ', display: 'Space', width: 8, type: 'space' },
  ],
];

// Alphabetical ABC layout
const abcLayout: KeyData[][] = [
  [
    { key: 'a', display: 'A', type: 'letter' },
    { key: 'b', display: 'B', type: 'letter' },
    { key: 'c', display: 'C', type: 'letter' },
    { key: 'd', display: 'D', type: 'letter' },
    { key: 'e', display: 'E', type: 'letter' },
    { key: 'f', display: 'F', type: 'letter' },
    { key: 'g', display: 'G', type: 'letter' },
    { key: 'Backspace', display: '⌫', width: 1.5, type: 'backspace' },
  ],
  [
    { key: 'h', display: 'H', type: 'letter' },
    { key: 'i', display: 'I', type: 'letter' },
    { key: 'j', display: 'J', type: 'letter' },
    { key: 'k', display: 'K', type: 'letter' },
    { key: 'l', display: 'L', type: 'letter' },
    { key: 'm', display: 'M', type: 'letter' },
    { key: 'n', display: 'N', type: 'letter' },
  ],
  [
    { key: 'o', display: 'O', type: 'letter' },
    { key: 'p', display: 'P', type: 'letter' },
    { key: 'q', display: 'Q', type: 'letter' },
    { key: 'r', display: 'R', type: 'letter' },
    { key: 's', display: 'S', type: 'letter' },
    { key: 't', display: 'T', type: 'letter' },
  ],
  [
    { key: 'u', display: 'U', type: 'letter' },
    { key: 'v', display: 'V', type: 'letter' },
    { key: 'w', display: 'W', type: 'letter' },
    { key: 'x', display: 'X', type: 'letter' },
    { key: 'y', display: 'Y', type: 'letter' },
    { key: 'z', display: 'Z', type: 'letter' },
  ],
  [
    { key: ' ', display: 'Space', width: 6, type: 'space' },
  ],
];

export default function VirtualKeyboard({
  layout = 'qwerty',
  highlightKey,
  pressedKey,
  onKeyPress,
  showHands = false,
  size = 'medium',
  disabled = false,
}: VirtualKeyboardProps) {
  const { settings } = useSettingsStore();

  const layoutData = layout === 'abc' ? abcLayout : qwertyLayout;

  const sizes = {
    small: { key: 'text-sm py-2 px-3', container: 'gap-1' },
    medium: { key: 'text-base py-3 px-4', container: 'gap-2' },
    large: { key: 'text-lg py-4 px-6', container: 'gap-3' },
  };

  const sizeClasses = sizes[size];

  const getKeyColor = (keyData: KeyData) => {
    const isPressed = pressedKey === keyData.key;
    const isHighlighted = highlightKey === keyData.key;

    if (isPressed) {
      return 'bg-success-500 text-white shadow-inner';
    }

    if (isHighlighted) {
      return 'bg-yellow-300 text-gray-900 ring-4 ring-yellow-400 animate-pulse';
    }

    switch (keyData.type) {
      case 'letter':
        return 'bg-white text-gray-800 hover:bg-gray-100';
      case 'space':
        return 'bg-blue-100 text-gray-700 hover:bg-blue-200';
      case 'enter':
        return 'bg-success-100 text-success-800 hover:bg-success-200';
      case 'backspace':
        return 'bg-red-100 text-red-800 hover:bg-red-200';
      case 'shift':
        return 'bg-gray-100 text-gray-700 hover:bg-gray-200';
      default:
        return 'bg-gray-100 text-gray-700 hover:bg-gray-200';
    }
  };

  const handleKeyClick = (keyData: KeyData) => {
    if (disabled) return;
    onKeyPress?.(keyData.key);
  };

  return (
    <div className={`bg-gradient-to-br from-gray-50 to-gray-100 rounded-2xl shadow-xl p-6 ${disabled ? 'opacity-50 pointer-events-none' : ''}`}>
      {/* Hand Position Indicators */}
      {showHands && (
        <div className="flex justify-center items-center space-x-8 mb-4">
          <div className="flex items-center space-x-2">
            <span className="text-3xl">👈</span>
            <span className="text-sm text-gray-600">Left Hand: A S D F</span>
          </div>
          <div className="flex items-center space-x-2">
            <span className="text-sm text-gray-600">Right Hand: J K L ;</span>
            <span className="text-3xl">👉</span>
          </div>
        </div>
      )}

      {/* Keyboard Layout */}
      <div className={`flex flex-col ${sizeClasses.container}`}>
        {layoutData.map((row, rowIndex) => (
          <div key={rowIndex} className={`flex justify-center ${sizeClasses.container}`}>
            {row.map((keyData) => {
              const widthClass = keyData.width
                ? `flex-grow-${Math.floor(keyData.width * 10)}`
                : 'flex-1';

              return (
                <motion.button
                  key={keyData.key}
                  onClick={() => handleKeyClick(keyData)}
                  whileHover={{ scale: settings.reducedMotion ? 1 : 1.05 }}
                  whileTap={{ scale: settings.reducedMotion ? 1 : 0.95 }}
                  className={`
                    ${sizeClasses.key}
                    ${getKeyColor(keyData)}
                    ${widthClass}
                    rounded-lg font-bold shadow-md
                    transition-all duration-150
                    disabled:opacity-50 disabled:cursor-not-allowed
                    focus:outline-none focus:ring-2 focus:ring-primary-500
                  `}
                  style={{
                    minWidth: keyData.width ? `${keyData.width * 4}rem` : '3rem',
                  }}
                  disabled={disabled}
                  aria-label={keyData.display}
                >
                  {keyData.display}
                </motion.button>
              );
            })}
          </div>
        ))}
      </div>
    </div>
  );
}

// Mini keyboard (simplified for small spaces)
export function MiniKeyboard({
  letters,
  highlightLetter,
  onLetterClick,
}: {
  letters: string[];
  highlightLetter?: string;
  onLetterClick?: (letter: string) => void;
}) {
  const { settings } = useSettingsStore();

  return (
    <div className="flex flex-wrap gap-2 justify-center">
      {letters.map((letter) => (
        <motion.button
          key={letter}
          onClick={() => onLetterClick?.(letter)}
          whileHover={{ scale: settings.reducedMotion ? 1 : 1.1 }}
          whileTap={{ scale: settings.reducedMotion ? 1 : 0.9 }}
          className={`
            w-12 h-12 rounded-lg font-bold text-lg shadow-md
            transition-all
            ${
              highlightLetter === letter
                ? 'bg-yellow-300 text-gray-900 ring-4 ring-yellow-400'
                : 'bg-white text-gray-800 hover:bg-gray-100'
            }
          `}
        >
          {letter.toUpperCase()}
        </motion.button>
      ))}
    </div>
  );
}
