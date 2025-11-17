/**
 * Hint Settings Component
 * Step 147 - Customize hint preferences and behavior
 */

import { motion } from 'framer-motion';
import { useState } from 'react';

export interface HintPreferences {
  enabled: boolean;
  autoShow: boolean;
  frequency: 'never' | 'sometimes' | 'often' | 'always';
  progressiveHints: boolean;
  detailLevel: 'minimal' | 'moderate' | 'detailed';
  showKeyboardHighlights: boolean;
  showFingerGuides: boolean;
  showGhostTyping: boolean;
  hintDelay: number; // Seconds before showing hints
  autoAdvance: boolean;
}

const DEFAULT_HINT_PREFERENCES: HintPreferences = {
  enabled: true,
  autoShow: true,
  frequency: 'sometimes',
  progressiveHints: true,
  detailLevel: 'moderate',
  showKeyboardHighlights: true,
  showFingerGuides: true,
  showGhostTyping: false,
  hintDelay: 5,
  autoAdvance: true,
};

export default function HintSettings({
  preferences = DEFAULT_HINT_PREFERENCES,
  onChange,
}: {
  preferences?: HintPreferences;
  onChange?: (prefs: HintPreferences) => void;
}) {
  const [localPrefs, setLocalPrefs] = useState(preferences);

  const handleChange = (key: keyof HintPreferences, value: any) => {
    const newPrefs = { ...localPrefs, [key]: value };
    setLocalPrefs(newPrefs);
    onChange?.(newPrefs);
  };

  return (
    <div className="bg-white rounded-2xl shadow-xl p-8">
      <h2 className="text-2xl font-bold text-gray-800 mb-6">Hint Settings</h2>

      <div className="space-y-6">
        {/* Master enable/disable */}
        <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
          <div>
            <h3 className="font-bold text-gray-900">Enable Hints</h3>
            <p className="text-sm text-gray-600">Show helpful hints during typing</p>
          </div>
          <button
            onClick={() => handleChange('enabled', !localPrefs.enabled)}
            className={`relative w-16 h-9 rounded-full transition-colors ${
              localPrefs.enabled ? 'bg-primary-500' : 'bg-gray-300'
            }`}
          >
            <motion.div
              animate={{ x: localPrefs.enabled ? 28 : 0 }}
              transition={{ type: 'spring', stiffness: 500, damping: 30 }}
              className="absolute top-1 left-1 w-7 h-7 bg-white rounded-full shadow-md"
            />
          </button>
        </div>

        {/* Hint frequency */}
        <div>
          <label className="font-bold text-gray-900 mb-3 block">
            Hint Frequency
          </label>
          <div className="grid grid-cols-4 gap-2">
            {(['never', 'sometimes', 'often', 'always'] as const).map((freq) => (
              <button
                key={freq}
                onClick={() => handleChange('frequency', freq)}
                disabled={!localPrefs.enabled}
                className={`py-3 rounded-lg font-medium transition-colors capitalize ${
                  localPrefs.frequency === freq
                    ? 'bg-primary-500 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                } disabled:opacity-50 disabled:cursor-not-allowed`}
              >
                {freq}
              </button>
            ))}
          </div>
        </div>

        {/* Detail level */}
        <div>
          <label className="font-bold text-gray-900 mb-3 block">
            Hint Detail Level
          </label>
          <div className="grid grid-cols-3 gap-2">
            {(['minimal', 'moderate', 'detailed'] as const).map((level) => (
              <button
                key={level}
                onClick={() => handleChange('detailLevel', level)}
                disabled={!localPrefs.enabled}
                className={`py-3 rounded-lg font-medium transition-colors capitalize ${
                  localPrefs.detailLevel === level
                    ? 'bg-primary-500 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                } disabled:opacity-50 disabled:cursor-not-allowed`}
              >
                {level}
              </button>
            ))}
          </div>
        </div>

        {/* Hint delay */}
        <div>
          <label className="font-bold text-gray-900 mb-2 block">
            Hint Delay: {localPrefs.hintDelay} seconds
          </label>
          <input
            type="range"
            min="0"
            max="30"
            step="1"
            value={localPrefs.hintDelay}
            onChange={(e) => handleChange('hintDelay', parseInt(e.target.value))}
            disabled={!localPrefs.enabled}
            className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
          />
          <div className="flex justify-between text-xs text-gray-500 mt-1">
            <span>Instant</span>
            <span>30s</span>
          </div>
        </div>

        {/* Visual hint options */}
        <div className="space-y-3">
          <h3 className="font-bold text-gray-900">Visual Hints</h3>

          {[
            {
              key: 'showKeyboardHighlights' as const,
              label: 'Keyboard Highlights',
              description: 'Highlight the next key to press',
            },
            {
              key: 'showFingerGuides' as const,
              label: 'Finger Guides',
              description: 'Show which finger to use',
            },
            {
              key: 'showGhostTyping' as const,
              label: 'Ghost Typing',
              description: 'Demonstrate typing animations',
            },
            {
              key: 'progressiveHints' as const,
              label: 'Progressive Hints',
              description: 'Gradually show more detailed hints',
            },
            {
              key: 'autoAdvance' as const,
              label: 'Auto-Advance Hints',
              description: 'Automatically progress through hint levels',
            },
          ].map((option) => (
            <div
              key={option.key}
              className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
            >
              <div className="flex-1">
                <div className="font-medium text-gray-900">{option.label}</div>
                <div className="text-sm text-gray-600">{option.description}</div>
              </div>

              <button
                onClick={() =>
                  handleChange(option.key, !localPrefs[option.key])
                }
                disabled={!localPrefs.enabled}
                className={`relative w-12 h-7 rounded-full transition-colors ${
                  localPrefs[option.key] ? 'bg-success-500' : 'bg-gray-300'
                } disabled:opacity-50 disabled:cursor-not-allowed`}
              >
                <motion.div
                  animate={{ x: localPrefs[option.key] ? 20 : 0 }}
                  transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                  className="absolute top-1 left-1 w-5 h-5 bg-white rounded-full shadow-sm"
                />
              </button>
            </div>
          ))}
        </div>

        {/* Auto-show hints */}
        <div className="flex items-center justify-between p-4 bg-blue-50 rounded-lg border-2 border-blue-200">
          <div>
            <h3 className="font-bold text-blue-900">Auto-Show Hints</h3>
            <p className="text-sm text-blue-700">
              Automatically show hints when you seem stuck
            </p>
          </div>
          <button
            onClick={() => handleChange('autoShow', !localPrefs.autoShow)}
            disabled={!localPrefs.enabled}
            className={`relative w-16 h-9 rounded-full transition-colors ${
              localPrefs.autoShow ? 'bg-blue-500' : 'bg-gray-300'
            } disabled:opacity-50 disabled:cursor-not-allowed`}
          >
            <motion.div
              animate={{ x: localPrefs.autoShow ? 28 : 0 }}
              transition={{ type: 'spring', stiffness: 500, damping: 30 }}
              className="absolute top-1 left-1 w-7 h-7 bg-white rounded-full shadow-md"
            />
          </button>
        </div>

        {/* Reset to defaults */}
        <button
          onClick={() => {
            setLocalPrefs(DEFAULT_HINT_PREFERENCES);
            onChange?.(DEFAULT_HINT_PREFERENCES);
          }}
          className="w-full py-3 bg-gray-200 text-gray-700 rounded-lg font-medium hover:bg-gray-300 transition-colors"
        >
          Reset to Defaults
        </button>
      </div>
    </div>
  );
}

// Quick hint presets
export function HintPresets({
  onSelect,
}: {
  onSelect?: (prefs: HintPreferences) => void;
}) {
  const presets: Array<{
    name: string;
    description: string;
    icon: string;
    preferences: HintPreferences;
  }> = [
    {
      name: 'Beginner',
      description: 'Maximum help and guidance',
      icon: '🌱',
      preferences: {
        ...DEFAULT_HINT_PREFERENCES,
        frequency: 'always',
        detailLevel: 'detailed',
        showKeyboardHighlights: true,
        showFingerGuides: true,
        showGhostTyping: true,
        hintDelay: 3,
      },
    },
    {
      name: 'Intermediate',
      description: 'Balanced hints when needed',
      icon: '💪',
      preferences: {
        ...DEFAULT_HINT_PREFERENCES,
        frequency: 'sometimes',
        detailLevel: 'moderate',
        showKeyboardHighlights: true,
        showFingerGuides: false,
        showGhostTyping: false,
        hintDelay: 5,
      },
    },
    {
      name: 'Advanced',
      description: 'Minimal hints for practice',
      icon: '⭐',
      preferences: {
        ...DEFAULT_HINT_PREFERENCES,
        frequency: 'sometimes',
        detailLevel: 'minimal',
        showKeyboardHighlights: false,
        showFingerGuides: false,
        showGhostTyping: false,
        hintDelay: 10,
      },
    },
    {
      name: 'No Hints',
      description: 'Independent practice mode',
      icon: '🎯',
      preferences: {
        ...DEFAULT_HINT_PREFERENCES,
        enabled: false,
        frequency: 'never',
      },
    },
  ];

  return (
    <div className="bg-white rounded-xl shadow-lg p-6">
      <h3 className="text-lg font-bold text-gray-800 mb-4">Quick Presets</h3>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {presets.map((preset) => (
          <button
            key={preset.name}
            onClick={() => onSelect?.(preset.preferences)}
            className="p-4 bg-gradient-to-br from-gray-50 to-gray-100 hover:from-primary-50 hover:to-primary-100 rounded-xl border-2 border-gray-200 hover:border-primary-300 transition-colors group"
          >
            <div className="text-4xl mb-2">{preset.icon}</div>
            <div className="font-bold text-gray-900 mb-1 group-hover:text-primary-600">
              {preset.name}
            </div>
            <div className="text-xs text-gray-600">{preset.description}</div>
          </button>
        ))}
      </div>
    </div>
  );
}

// Hint behavior customization
export function HintBehaviorSettings() {
  const [dismissible, setDismissible] = useState(true);
  const [persistent, setPersistent] = useState(false);
  const [soundEffects, setSoundEffects] = useState(true);
  const [vibration, setVibration] = useState(false);

  return (
    <div className="bg-white rounded-xl shadow-lg p-6">
      <h3 className="text-lg font-bold text-gray-800 mb-4">Hint Behavior</h3>

      <div className="space-y-3">
        {[
          {
            label: 'Dismissible Hints',
            description: 'Allow closing hints manually',
            value: dismissible,
            onChange: setDismissible,
          },
          {
            label: 'Persistent Hints',
            description: 'Keep hints visible until dismissed',
            value: persistent,
            onChange: setPersistent,
          },
          {
            label: 'Sound Effects',
            description: 'Play sound when hint appears',
            value: soundEffects,
            onChange: setSoundEffects,
          },
          {
            label: 'Vibration',
            description: 'Vibrate device when hint appears',
            value: vibration,
            onChange: setVibration,
          },
        ].map((setting) => (
          <div
            key={setting.label}
            className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
          >
            <div>
              <div className="font-medium text-gray-900">{setting.label}</div>
              <div className="text-sm text-gray-600">{setting.description}</div>
            </div>

            <button
              onClick={() => setting.onChange(!setting.value)}
              className={`relative w-12 h-7 rounded-full transition-colors ${
                setting.value ? 'bg-primary-500' : 'bg-gray-300'
              }`}
            >
              <motion.div
                animate={{ x: setting.value ? 20 : 0 }}
                transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                className="absolute top-1 left-1 w-5 h-5 bg-white rounded-full shadow-sm"
              />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}

// Export default hint preferences
export { DEFAULT_HINT_PREFERENCES };
