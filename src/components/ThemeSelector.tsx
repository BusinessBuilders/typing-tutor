/**
 * Theme Selector Component
 * Step 95 - Autism-friendly theme customization
 */

import { motion } from 'framer-motion';
import { useSettingsStore } from '../store/useSettingsStore';
import { useAppStore } from '../store/useAppStore';

const THEMES = [
  {
    id: 'light',
    name: 'Light',
    icon: '☀️',
    description: 'Bright and clear',
    preview: { bg: 'bg-white', text: 'text-gray-900', accent: 'bg-blue-500' },
  },
  {
    id: 'dark',
    name: 'Dark',
    icon: '🌙',
    description: 'Easy on the eyes',
    preview: { bg: 'bg-gray-900', text: 'text-white', accent: 'bg-blue-400' },
  },
  {
    id: 'calm',
    name: 'Calm',
    icon: '🌊',
    description: 'Soothing colors',
    preview: { bg: 'bg-blue-50', text: 'text-blue-900', accent: 'bg-blue-600' },
  },
  {
    id: 'warm',
    name: 'Warm',
    icon: '🌅',
    description: 'Cozy and comfortable',
    preview: { bg: 'bg-orange-50', text: 'text-orange-900', accent: 'bg-orange-500' },
  },
  {
    id: 'nature',
    name: 'Nature',
    icon: '🌿',
    description: 'Natural greens',
    preview: { bg: 'bg-green-50', text: 'text-green-900', accent: 'bg-green-600' },
  },
  {
    id: 'sunset',
    name: 'Sunset',
    icon: '🌆',
    description: 'Purple twilight',
    preview: { bg: 'bg-purple-50', text: 'text-purple-900', accent: 'bg-purple-600' },
  },
];

const FONT_SIZES = [
  { id: 'small', name: 'Small', size: 'text-sm', example: '14px' },
  { id: 'medium', name: 'Medium', size: 'text-base', example: '16px' },
  { id: 'large', name: 'Large', size: 'text-lg', example: '18px' },
  { id: 'extra-large', name: 'Extra Large', size: 'text-xl', example: '20px' },
];

export default function ThemeSelector() {
  const { settings, updateSettings } = useSettingsStore();
  const { showNotification } = useAppStore();

  const handleThemeChange = (themeId: string) => {
    updateSettings({ theme: themeId as any });
    showNotification(`Theme changed to ${THEMES.find(t => t.id === themeId)?.name}`, 'success');
  };

  const handleFontSizeChange = (fontSize: string) => {
    updateSettings({ fontSize: fontSize as any });
    showNotification(`Font size changed to ${FONT_SIZES.find(f => f.id === fontSize)?.name}`, 'success');
  };

  return (
    <div className="space-y-8">
      {/* Theme Selection */}
      <div>
        <h2 className="text-2xl font-bold mb-4 text-gray-800 flex items-center space-x-2">
          <span>🎨</span>
          <span>Choose Your Theme</span>
        </h2>
        <p className="text-gray-600 mb-6">
          Pick colors that feel comfortable for you
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {THEMES.map((theme) => {
            const isSelected = settings.theme === theme.id;

            return (
              <motion.button
                key={theme.id}
                whileHover={{ scale: settings.reducedMotion ? 1 : 1.03 }}
                whileTap={{ scale: settings.reducedMotion ? 1 : 0.97 }}
                onClick={() => handleThemeChange(theme.id)}
                className={`
                  relative p-4 rounded-xl border-2 transition-all text-left
                  ${isSelected
                    ? 'border-primary-500 ring-4 ring-primary-200 shadow-lg'
                    : 'border-gray-300 hover:border-gray-400 shadow-md'
                  }
                `}
              >
                {/* Selected Indicator */}
                {isSelected && (
                  <div className="absolute top-2 right-2 bg-primary-600 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm">
                    ✓
                  </div>
                )}

                {/* Theme Preview */}
                <div className={`${theme.preview.bg} rounded-lg p-4 mb-3 border border-gray-200`}>
                  <div className={`${theme.preview.text} font-medium mb-2`}>
                    Aa Bb Cc 123
                  </div>
                  <div className="flex space-x-2">
                    <div className={`${theme.preview.accent} w-8 h-8 rounded`}></div>
                    <div className="bg-gray-300 w-8 h-8 rounded"></div>
                    <div className="bg-gray-200 w-8 h-8 rounded"></div>
                  </div>
                </div>

                {/* Theme Info */}
                <div className="flex items-center space-x-2 mb-1">
                  <span className="text-2xl">{theme.icon}</span>
                  <h3 className="font-bold text-gray-800">{theme.name}</h3>
                </div>
                <p className="text-sm text-gray-600">{theme.description}</p>
              </motion.button>
            );
          })}
        </div>
      </div>

      {/* Font Size Selection */}
      <div>
        <h2 className="text-2xl font-bold mb-4 text-gray-800 flex items-center space-x-2">
          <span>🔤</span>
          <span>Text Size</span>
        </h2>
        <p className="text-gray-600 mb-6">
          Choose a text size that's easy to read
        </p>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {FONT_SIZES.map((fontSize) => {
            const isSelected = settings.fontSize === fontSize.id;

            return (
              <motion.button
                key={fontSize.id}
                whileHover={{ scale: settings.reducedMotion ? 1 : 1.05 }}
                whileTap={{ scale: settings.reducedMotion ? 1 : 0.95 }}
                onClick={() => handleFontSizeChange(fontSize.id)}
                className={`
                  p-6 rounded-xl border-2 transition-all
                  ${isSelected
                    ? 'border-primary-500 bg-primary-50 ring-4 ring-primary-200'
                    : 'border-gray-300 bg-white hover:border-gray-400'
                  }
                `}
              >
                <div className={`${fontSize.size} font-bold mb-2 text-gray-800`}>
                  Aa
                </div>
                <div className="text-sm font-medium text-gray-700">
                  {fontSize.name}
                </div>
                <div className="text-xs text-gray-500">
                  {fontSize.example}
                </div>
              </motion.button>
            );
          })}
        </div>
      </div>

      {/* Dyslexia-Friendly Font Toggle */}
      <div className="bg-blue-50 rounded-xl p-6 border-2 border-blue-200">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <h3 className="text-lg font-bold text-gray-800 mb-2 flex items-center space-x-2">
              <span>📖</span>
              <span>Dyslexia-Friendly Font</span>
            </h3>
            <p className="text-gray-600 mb-4">
              Uses OpenDyslexic font for better readability
            </p>
          </div>

          <motion.button
            whileTap={{ scale: settings.reducedMotion ? 1 : 0.95 }}
            onClick={() => updateSettings({ dyslexicFont: !settings.dyslexicFont })}
            className={`
              relative w-16 h-8 rounded-full transition-colors
              ${settings.dyslexicFont ? 'bg-primary-600' : 'bg-gray-300'}
            `}
          >
            <motion.div
              animate={{ x: settings.dyslexicFont ? 32 : 0 }}
              transition={{ type: 'spring', stiffness: 500, damping: 30 }}
              className="absolute top-1 left-1 w-6 h-6 bg-white rounded-full shadow-md"
            />
          </motion.button>
        </div>
      </div>

      {/* Reduced Motion Toggle */}
      <div className="bg-purple-50 rounded-xl p-6 border-2 border-purple-200">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <h3 className="text-lg font-bold text-gray-800 mb-2 flex items-center space-x-2">
              <span>🎬</span>
              <span>Reduce Motion</span>
            </h3>
            <p className="text-gray-600 mb-4">
              Minimizes animations and movement for comfort
            </p>
          </div>

          <motion.button
            whileTap={{ scale: 0.95 }}
            onClick={() => updateSettings({ reducedMotion: !settings.reducedMotion })}
            className={`
              relative w-16 h-8 rounded-full transition-colors
              ${settings.reducedMotion ? 'bg-primary-600' : 'bg-gray-300'}
            `}
          >
            <motion.div
              animate={{ x: settings.reducedMotion ? 32 : 0 }}
              transition={{ type: 'spring', stiffness: 500, damping: 30 }}
              className="absolute top-1 left-1 w-6 h-6 bg-white rounded-full shadow-md"
            />
          </motion.button>
        </div>
      </div>

      {/* Preview Card */}
      <div className="bg-gradient-to-r from-primary-100 to-success-100 rounded-xl p-6 border-2 border-primary-300">
        <h3 className="text-lg font-bold text-gray-800 mb-2 flex items-center space-x-2">
          <span>👁️</span>
          <span>Preview</span>
        </h3>
        <div className={`bg-white rounded-lg p-6 ${settings.dyslexicFont ? 'font-dyslexic' : ''}`}>
          <p className={`${FONT_SIZES.find(f => f.id === settings.fontSize)?.size} text-gray-800`}>
            The quick brown fox jumps over the lazy dog.
            <br />
            Type this sentence to practice typing!
          </p>
        </div>
      </div>
    </div>
  );
}
