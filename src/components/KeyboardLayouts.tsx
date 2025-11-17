/**
 * Keyboard Layouts Component
 * Step 115 - Multiple keyboard layout options for different learning styles
 */

import { KeyData } from './VirtualKeyboard';

export type LayoutType = 'qwerty' | 'abc' | 'dvorak' | 'colemak' | 'simple' | 'numeric';

export interface KeyboardLayout {
  id: LayoutType;
  name: string;
  description: string;
  icon: string;
  rows: KeyData[][];
  difficulty?: 'beginner' | 'intermediate' | 'advanced';
}

// QWERTY Layout (Standard)
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
    { key: 'Backspace', display: '⌫', width: 1.5, type: 'backspace' },
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
  [{ key: ' ', display: 'Space', width: 10, type: 'space' }],
];

// ABC Layout (Alphabetical - Beginner Friendly)
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
  [{ key: ' ', display: 'Space', width: 6, type: 'space' }],
];

// Dvorak Layout (Alternative)
const dvorakLayout: KeyData[][] = [
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
    { key: 'Backspace', display: '⌫', width: 1.5, type: 'backspace' },
  ],
  [
    { key: "'", display: "'", type: 'letter' },
    { key: ',', display: ',', type: 'letter' },
    { key: '.', display: '.', type: 'letter' },
    { key: 'p', display: 'P', type: 'letter' },
    { key: 'y', display: 'Y', type: 'letter' },
    { key: 'f', display: 'F', type: 'letter' },
    { key: 'g', display: 'G', type: 'letter' },
    { key: 'c', display: 'C', type: 'letter' },
    { key: 'r', display: 'R', type: 'letter' },
    { key: 'l', display: 'L', type: 'letter' },
  ],
  [
    { key: 'a', display: 'A', type: 'letter' },
    { key: 'o', display: 'O', type: 'letter' },
    { key: 'e', display: 'E', type: 'letter' },
    { key: 'u', display: 'U', type: 'letter' },
    { key: 'i', display: 'I', type: 'letter' },
    { key: 'd', display: 'D', type: 'letter' },
    { key: 'h', display: 'H', type: 'letter' },
    { key: 't', display: 'T', type: 'letter' },
    { key: 'n', display: 'N', type: 'letter' },
    { key: 's', display: 'S', type: 'letter' },
  ],
  [
    { key: 'Shift', display: '⇧', width: 1.5, type: 'shift' },
    { key: ';', display: ';', type: 'letter' },
    { key: 'q', display: 'Q', type: 'letter' },
    { key: 'j', display: 'J', type: 'letter' },
    { key: 'k', display: 'K', type: 'letter' },
    { key: 'x', display: 'X', type: 'letter' },
    { key: 'b', display: 'B', type: 'letter' },
    { key: 'm', display: 'M', type: 'letter' },
    { key: 'w', display: 'W', type: 'letter' },
    { key: 'Enter', display: '↵', width: 1.5, type: 'enter' },
  ],
  [{ key: ' ', display: 'Space', width: 10, type: 'space' }],
];

// Colemak Layout (Ergonomic alternative)
const colemakLayout: KeyData[][] = [
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
    { key: 'Backspace', display: '⌫', width: 1.5, type: 'backspace' },
  ],
  [
    { key: 'q', display: 'Q', type: 'letter' },
    { key: 'w', display: 'W', type: 'letter' },
    { key: 'f', display: 'F', type: 'letter' },
    { key: 'p', display: 'P', type: 'letter' },
    { key: 'g', display: 'G', type: 'letter' },
    { key: 'j', display: 'J', type: 'letter' },
    { key: 'l', display: 'L', type: 'letter' },
    { key: 'u', display: 'U', type: 'letter' },
    { key: 'y', display: 'Y', type: 'letter' },
    { key: ';', display: ';', type: 'letter' },
  ],
  [
    { key: 'a', display: 'A', type: 'letter' },
    { key: 'r', display: 'R', type: 'letter' },
    { key: 's', display: 'S', type: 'letter' },
    { key: 't', display: 'T', type: 'letter' },
    { key: 'd', display: 'D', type: 'letter' },
    { key: 'h', display: 'H', type: 'letter' },
    { key: 'n', display: 'N', type: 'letter' },
    { key: 'e', display: 'E', type: 'letter' },
    { key: 'i', display: 'I', type: 'letter' },
    { key: 'o', display: 'O', type: 'letter' },
  ],
  [
    { key: 'Shift', display: '⇧', width: 1.5, type: 'shift' },
    { key: 'z', display: 'Z', type: 'letter' },
    { key: 'x', display: 'X', type: 'letter' },
    { key: 'c', display: 'C', type: 'letter' },
    { key: 'v', display: 'V', type: 'letter' },
    { key: 'b', display: 'B', type: 'letter' },
    { key: 'k', display: 'K', type: 'letter' },
    { key: 'm', display: 'M', type: 'letter' },
    { key: 'Enter', display: '↵', width: 1.5, type: 'enter' },
  ],
  [{ key: ' ', display: 'Space', width: 10, type: 'space' }],
];

// Simple Layout (Extra Large keys for beginners)
const simpleLayout: KeyData[][] = [
  [
    { key: 'a', display: 'A', type: 'letter', width: 2 },
    { key: 'b', display: 'B', type: 'letter', width: 2 },
    { key: 'c', display: 'C', type: 'letter', width: 2 },
    { key: 'd', display: 'D', type: 'letter', width: 2 },
  ],
  [
    { key: 'e', display: 'E', type: 'letter', width: 2 },
    { key: 'f', display: 'F', type: 'letter', width: 2 },
    { key: 'g', display: 'G', type: 'letter', width: 2 },
    { key: 'h', display: 'H', type: 'letter', width: 2 },
  ],
  [
    { key: 'i', display: 'I', type: 'letter', width: 2 },
    { key: 'j', display: 'J', type: 'letter', width: 2 },
    { key: 'k', display: 'K', type: 'letter', width: 2 },
    { key: 'l', display: 'L', type: 'letter', width: 2 },
  ],
  [
    { key: 'm', display: 'M', type: 'letter', width: 2 },
    { key: 'n', display: 'N', type: 'letter', width: 2 },
    { key: 'o', display: 'O', type: 'letter', width: 2 },
    { key: 'p', display: 'P', type: 'letter', width: 2 },
  ],
  [
    { key: ' ', display: 'Space', width: 4, type: 'space' },
    { key: 'Backspace', display: '⌫', width: 4, type: 'backspace' },
  ],
];

// Numeric Layout (Numbers only)
const numericLayout: KeyData[][] = [
  [
    { key: '1', display: '1', type: 'letter', width: 2 },
    { key: '2', display: '2', type: 'letter', width: 2 },
    { key: '3', display: '3', type: 'letter', width: 2 },
  ],
  [
    { key: '4', display: '4', type: 'letter', width: 2 },
    { key: '5', display: '5', type: 'letter', width: 2 },
    { key: '6', display: '6', type: 'letter', width: 2 },
  ],
  [
    { key: '7', display: '7', type: 'letter', width: 2 },
    { key: '8', display: '8', type: 'letter', width: 2 },
    { key: '9', display: '9', type: 'letter', width: 2 },
  ],
  [
    { key: 'Backspace', display: '⌫', width: 2, type: 'backspace' },
    { key: '0', display: '0', type: 'letter', width: 2 },
    { key: 'Enter', display: '✓', width: 2, type: 'enter' },
  ],
];

// Export all layouts
export const keyboardLayouts: Record<LayoutType, KeyboardLayout> = {
  qwerty: {
    id: 'qwerty',
    name: 'QWERTY',
    description: 'Standard keyboard layout - most common',
    icon: '⌨️',
    rows: qwertyLayout,
    difficulty: 'intermediate',
  },
  abc: {
    id: 'abc',
    name: 'ABC',
    description: 'Alphabetical order - great for beginners',
    icon: '🔤',
    rows: abcLayout,
    difficulty: 'beginner',
  },
  dvorak: {
    id: 'dvorak',
    name: 'Dvorak',
    description: 'Alternative efficient layout',
    icon: '🎹',
    rows: dvorakLayout,
    difficulty: 'advanced',
  },
  colemak: {
    id: 'colemak',
    name: 'Colemak',
    description: 'Ergonomic and comfortable',
    icon: '✨',
    rows: colemakLayout,
    difficulty: 'advanced',
  },
  simple: {
    id: 'simple',
    name: 'Simple',
    description: 'Extra large keys for easy tapping',
    icon: '🎯',
    rows: simpleLayout,
    difficulty: 'beginner',
  },
  numeric: {
    id: 'numeric',
    name: 'Numbers',
    description: 'Number pad for counting practice',
    icon: '🔢',
    rows: numericLayout,
    difficulty: 'beginner',
  },
};

// Layout selector component
import { motion } from 'framer-motion';
import { useSettingsStore } from '../store/useSettingsStore';

export function LayoutSelector({
  currentLayout,
  onLayoutChange,
}: {
  currentLayout: LayoutType;
  onLayoutChange: (layout: LayoutType) => void;
}) {
  const { settings } = useSettingsStore();

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
      {Object.values(keyboardLayouts).map((layout) => (
        <motion.button
          key={layout.id}
          onClick={() => onLayoutChange(layout.id)}
          whileHover={{ scale: settings.reducedMotion ? 1 : 1.02 }}
          whileTap={{ scale: settings.reducedMotion ? 1 : 0.98 }}
          className={`
            p-4 rounded-xl shadow-md text-left transition-all
            ${
              currentLayout === layout.id
                ? 'bg-primary-500 text-white ring-4 ring-primary-300'
                : 'bg-white text-gray-800 hover:shadow-lg'
            }
          `}
        >
          <div className="text-3xl mb-2">{layout.icon}</div>
          <h3 className="font-bold text-lg mb-1">{layout.name}</h3>
          <p
            className={`text-sm ${
              currentLayout === layout.id ? 'text-primary-100' : 'text-gray-600'
            }`}
          >
            {layout.description}
          </p>
          {layout.difficulty && (
            <div className="mt-2">
              <span
                className={`
                text-xs px-2 py-1 rounded-full
                ${
                  currentLayout === layout.id
                    ? 'bg-white bg-opacity-20 text-white'
                    : 'bg-gray-100 text-gray-700'
                }
              `}
              >
                {layout.difficulty}
              </span>
            </div>
          )}
        </motion.button>
      ))}
    </div>
  );
}

// Helper function to get layout
export function getLayout(layoutType: LayoutType): KeyData[][] {
  return keyboardLayouts[layoutType]?.rows || qwertyLayout;
}
