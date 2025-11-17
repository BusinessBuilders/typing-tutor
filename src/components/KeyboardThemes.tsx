/**
 * Keyboard Themes Component
 * Step 117 - Visual themes for keyboard customization
 */

import { motion } from 'framer-motion';
import { useSettingsStore } from '../store/useSettingsStore';

export type KeyboardTheme =
  | 'default'
  | 'ocean'
  | 'forest'
  | 'sunset'
  | 'candy'
  | 'space'
  | 'rainbow'
  | 'highContrast'
  | 'pastel'
  | 'neon';

export interface ThemeConfig {
  id: KeyboardTheme;
  name: string;
  description: string;
  icon: string;
  keyColors: {
    background: string;
    text: string;
    hover: string;
    pressed: string;
    highlighted: string;
    highlightedText: string;
  };
  specialKeys: {
    background: string;
    text: string;
  };
  boardBackground: string;
  boardBorder?: string;
}

export const keyboardThemes: Record<KeyboardTheme, ThemeConfig> = {
  default: {
    id: 'default',
    name: 'Default',
    description: 'Clean and simple',
    icon: '⌨️',
    keyColors: {
      background: 'bg-white',
      text: 'text-gray-800',
      hover: 'hover:bg-gray-100',
      pressed: 'bg-primary-500 text-white',
      highlighted: 'bg-yellow-300',
      highlightedText: 'text-gray-900',
    },
    specialKeys: {
      background: 'bg-gray-100',
      text: 'text-gray-700',
    },
    boardBackground: 'bg-gradient-to-br from-gray-50 to-gray-100',
  },

  ocean: {
    id: 'ocean',
    name: 'Ocean',
    description: 'Cool blues and aqua',
    icon: '🌊',
    keyColors: {
      background: 'bg-gradient-to-br from-blue-100 to-cyan-100',
      text: 'text-blue-900',
      hover: 'hover:bg-blue-200',
      pressed: 'bg-blue-600 text-white',
      highlighted: 'bg-cyan-300',
      highlightedText: 'text-blue-900',
    },
    specialKeys: {
      background: 'bg-blue-200',
      text: 'text-blue-800',
    },
    boardBackground: 'bg-gradient-to-br from-blue-300 via-cyan-200 to-teal-300',
    boardBorder: 'border-4 border-blue-400',
  },

  forest: {
    id: 'forest',
    name: 'Forest',
    description: 'Natural greens',
    icon: '🌲',
    keyColors: {
      background: 'bg-gradient-to-br from-green-100 to-emerald-100',
      text: 'text-green-900',
      hover: 'hover:bg-green-200',
      pressed: 'bg-green-600 text-white',
      highlighted: 'bg-lime-300',
      highlightedText: 'text-green-900',
    },
    specialKeys: {
      background: 'bg-green-200',
      text: 'text-green-800',
    },
    boardBackground: 'bg-gradient-to-br from-green-300 via-emerald-200 to-teal-300',
    boardBorder: 'border-4 border-green-400',
  },

  sunset: {
    id: 'sunset',
    name: 'Sunset',
    description: 'Warm oranges and pinks',
    icon: '🌅',
    keyColors: {
      background: 'bg-gradient-to-br from-orange-100 to-pink-100',
      text: 'text-orange-900',
      hover: 'hover:bg-orange-200',
      pressed: 'bg-orange-600 text-white',
      highlighted: 'bg-yellow-300',
      highlightedText: 'text-orange-900',
    },
    specialKeys: {
      background: 'bg-pink-200',
      text: 'text-pink-800',
    },
    boardBackground: 'bg-gradient-to-br from-orange-300 via-pink-300 to-purple-300',
    boardBorder: 'border-4 border-orange-400',
  },

  candy: {
    id: 'candy',
    name: 'Candy',
    description: 'Sweet pastels',
    icon: '🍬',
    keyColors: {
      background: 'bg-gradient-to-br from-pink-200 to-purple-200',
      text: 'text-purple-900',
      hover: 'hover:bg-pink-300',
      pressed: 'bg-pink-600 text-white',
      highlighted: 'bg-yellow-200',
      highlightedText: 'text-purple-900',
    },
    specialKeys: {
      background: 'bg-purple-200',
      text: 'text-purple-800',
    },
    boardBackground: 'bg-gradient-to-br from-pink-300 via-purple-300 to-blue-300',
    boardBorder: 'border-4 border-pink-400',
  },

  space: {
    id: 'space',
    name: 'Space',
    description: 'Dark cosmic theme',
    icon: '🚀',
    keyColors: {
      background: 'bg-gradient-to-br from-gray-800 to-indigo-900',
      text: 'text-white',
      hover: 'hover:bg-indigo-700',
      pressed: 'bg-purple-600 text-white',
      highlighted: 'bg-yellow-400',
      highlightedText: 'text-gray-900',
    },
    specialKeys: {
      background: 'bg-indigo-800',
      text: 'text-indigo-100',
    },
    boardBackground: 'bg-gradient-to-br from-gray-900 via-indigo-900 to-purple-900',
    boardBorder: 'border-4 border-purple-500',
  },

  rainbow: {
    id: 'rainbow',
    name: 'Rainbow',
    description: 'Colorful and bright',
    icon: '🌈',
    keyColors: {
      background: 'bg-gradient-to-br from-red-200 via-yellow-200 to-blue-200',
      text: 'text-gray-900',
      hover: 'hover:bg-yellow-300',
      pressed: 'bg-purple-600 text-white',
      highlighted: 'bg-yellow-400',
      highlightedText: 'text-gray-900',
    },
    specialKeys: {
      background: 'bg-indigo-200',
      text: 'text-indigo-900',
    },
    boardBackground:
      'bg-gradient-to-br from-red-300 via-yellow-300 via-green-300 via-blue-300 to-purple-300',
    boardBorder: 'border-4 border-purple-400',
  },

  highContrast: {
    id: 'highContrast',
    name: 'High Contrast',
    description: 'Maximum readability',
    icon: '◐',
    keyColors: {
      background: 'bg-white',
      text: 'text-black',
      hover: 'hover:bg-gray-200',
      pressed: 'bg-black text-white',
      highlighted: 'bg-yellow-400',
      highlightedText: 'text-black',
    },
    specialKeys: {
      background: 'bg-gray-900',
      text: 'text-white',
    },
    boardBackground: 'bg-gray-200',
    boardBorder: 'border-4 border-black',
  },

  pastel: {
    id: 'pastel',
    name: 'Pastel',
    description: 'Soft and gentle',
    icon: '🌸',
    keyColors: {
      background: 'bg-gradient-to-br from-blue-100 to-pink-100',
      text: 'text-gray-800',
      hover: 'hover:bg-pink-200',
      pressed: 'bg-rose-400 text-white',
      highlighted: 'bg-yellow-200',
      highlightedText: 'text-gray-800',
    },
    specialKeys: {
      background: 'bg-purple-100',
      text: 'text-purple-700',
    },
    boardBackground: 'bg-gradient-to-br from-blue-100 via-pink-100 to-purple-100',
    boardBorder: 'border-4 border-pink-300',
  },

  neon: {
    id: 'neon',
    name: 'Neon',
    description: 'Bright and electric',
    icon: '⚡',
    keyColors: {
      background: 'bg-gradient-to-br from-cyan-400 to-purple-400',
      text: 'text-white',
      hover: 'hover:bg-pink-400',
      pressed: 'bg-pink-600 text-white',
      highlighted: 'bg-yellow-400',
      highlightedText: 'text-gray-900',
    },
    specialKeys: {
      background: 'bg-purple-500',
      text: 'text-white',
    },
    boardBackground: 'bg-gradient-to-br from-gray-900 via-purple-900 to-pink-900',
    boardBorder: 'border-4 border-cyan-400 shadow-lg shadow-cyan-400/50',
  },
};

export interface ThemeSelectorProps {
  currentTheme: KeyboardTheme;
  onThemeChange: (theme: KeyboardTheme) => void;
}

export default function KeyboardThemeSelector({
  currentTheme,
  onThemeChange,
}: ThemeSelectorProps) {
  const { settings: _settings } = useSettingsStore();

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-gray-800 flex items-center space-x-2">
        <span>🎨</span>
        <span>Keyboard Themes</span>
      </h2>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {Object.values(keyboardThemes).map((theme) => (
          <ThemeCard
            key={theme.id}
            theme={theme}
            isSelected={currentTheme === theme.id}
            onSelect={() => onThemeChange(theme.id)}
          />
        ))}
      </div>
    </div>
  );
}

// Theme card component
function ThemeCard({
  theme,
  isSelected,
  onSelect,
}: {
  theme: ThemeConfig;
  isSelected: boolean;
  onSelect: () => void;
}) {
  const { settings } = useSettingsStore();

  return (
    <motion.button
      onClick={onSelect}
      whileHover={{ scale: settings.reducedMotion ? 1 : 1.03 }}
      whileTap={{ scale: settings.reducedMotion ? 1 : 0.97 }}
      className={`
        relative rounded-xl overflow-hidden shadow-lg transition-all
        ${isSelected ? 'ring-4 ring-primary-500' : 'hover:shadow-xl'}
      `}
    >
      {/* Background preview */}
      <div className={`${theme.boardBackground} p-4 aspect-square`}>
        {/* Mini keyboard preview */}
        <div className="flex flex-col space-y-1">
          <div className="flex space-x-1">
            <KeyPreview colors={theme.keyColors} />
            <KeyPreview colors={theme.keyColors} />
            <KeyPreview colors={theme.keyColors} />
          </div>
          <div className="flex space-x-1">
            <KeyPreview colors={theme.keyColors} />
            <KeyPreview colors={theme.keyColors} highlighted />
            <KeyPreview colors={theme.keyColors} />
          </div>
          <div className="flex space-x-1">
            <KeyPreview colors={theme.specialKeys} special />
          </div>
        </div>
      </div>

      {/* Theme info */}
      <div className="bg-white p-3">
        <div className="flex items-center justify-between mb-1">
          <h3 className="font-bold text-gray-800">{theme.name}</h3>
          <span className="text-2xl">{theme.icon}</span>
        </div>
        <p className="text-xs text-gray-600">{theme.description}</p>
      </div>

      {/* Selected indicator */}
      {isSelected && (
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          className="absolute top-2 right-2 w-8 h-8 bg-primary-500 rounded-full flex items-center justify-center text-white shadow-lg"
        >
          ✓
        </motion.div>
      )}
    </motion.button>
  );
}

// Mini key preview
function KeyPreview({
  colors,
  highlighted = false,
  special = false,
}: {
  colors: any;
  highlighted?: boolean;
  special?: boolean;
}) {
  return (
    <div
      className={`
        ${highlighted ? colors.highlighted : colors.background}
        ${highlighted ? colors.highlightedText : colors.text}
        ${special ? 'flex-1' : 'w-6 h-6'}
        rounded shadow-sm flex items-center justify-center text-xs font-bold
      `}
    >
      {special ? '━' : 'A'}
    </div>
  );
}

// Hook to use keyboard theme
export function useKeyboardTheme(defaultTheme: KeyboardTheme = 'default') {
  const { settings, updateSettings } = useSettingsStore();

  const currentTheme = (settings.keyboardTheme as KeyboardTheme) || defaultTheme;

  const setTheme = (theme: KeyboardTheme) => {
    updateSettings({ keyboardTheme: theme as any });
  };

  const getThemeConfig = () => keyboardThemes[currentTheme];

  return {
    theme: currentTheme,
    setTheme,
    config: getThemeConfig(),
  };
}

// Apply theme classes helper
export function getKeyClassName(
  theme: ThemeConfig,
  state: {
    isHighlighted?: boolean;
    isPressed?: boolean;
    isSpecial?: boolean;
  }
) {
  const { isHighlighted, isPressed, isSpecial } = state;

  if (isPressed) {
    return theme.keyColors.pressed;
  }

  if (isHighlighted) {
    return `${theme.keyColors.highlighted} ${theme.keyColors.highlightedText}`;
  }

  if (isSpecial) {
    return `${theme.specialKeys.background} ${theme.specialKeys.text}`;
  }

  return `${theme.keyColors.background} ${theme.keyColors.text} ${theme.keyColors.hover}`;
}
