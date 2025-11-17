/**
 * Settings Screen Component
 * Step 96 - Comprehensive settings with parent controls
 */

import { motion } from 'framer-motion';
import { useSettingsStore } from '../../store/useSettingsStore';
import { useAppStore } from '../../store/useAppStore';
import ThemeSelector from '../ThemeSelector';

export default function SettingsScreen() {
  const { settings, updateSettings } = useSettingsStore();
  const { showNotification } = useAppStore();

  const handleToggle = (setting: keyof typeof settings, value: boolean) => {
    updateSettings({ [setting]: value } as any);
    showNotification('Setting updated', 'success');
  };

  const voiceOptions = [
    { id: 'neutral', label: 'Neutral', icon: '🤖' },
    { id: 'female', label: 'Female', icon: '👩' },
    { id: 'male', label: 'Male', icon: '👨' },
  ];

  return (
    <div className="max-w-4xl mx-auto">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8"
      >
        <h1 className="text-4xl font-bold mb-2 text-gray-800 flex items-center space-x-3">
          <span>⚙️</span>
          <span>Settings</span>
        </h1>
        <p className="text-gray-600">
          Customize your typing experience
        </p>
      </motion.div>

      <div className="space-y-8">
        {/* Theme Settings */}
        <motion.section
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="bg-white rounded-xl shadow-lg p-6"
        >
          <ThemeSelector />
        </motion.section>

        {/* Audio Settings */}
        <motion.section
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white rounded-xl shadow-lg p-6"
        >
          <h2 className="text-2xl font-bold mb-6 text-gray-800 flex items-center space-x-2">
            <span>🔊</span>
            <span>Audio Settings</span>
          </h2>

          {/* Sound Effects Toggle */}
          <div className="flex items-center justify-between py-4 border-b border-gray-200">
            <div>
              <h3 className="font-medium text-gray-800">Sound Effects</h3>
              <p className="text-sm text-gray-600">Play sounds for typing actions</p>
            </div>
            <button
              onClick={() => handleToggle('soundEnabled', !settings.soundEnabled)}
              className={`relative w-16 h-8 rounded-full transition-colors ${
                settings.soundEnabled ? 'bg-primary-600' : 'bg-gray-300'
              }`}
            >
              <motion.div
                animate={{ x: settings.soundEnabled ? 32 : 0 }}
                transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                className="absolute top-1 left-1 w-6 h-6 bg-white rounded-full shadow-md"
              />
            </button>
          </div>

          {/* Background Music Toggle */}
          <div className="flex items-center justify-between py-4 border-b border-gray-200">
            <div>
              <h3 className="font-medium text-gray-800">Background Music</h3>
              <p className="text-sm text-gray-600">Play calm background music</p>
            </div>
            <button
              onClick={() => handleToggle('musicEnabled', !settings.musicEnabled)}
              className={`relative w-16 h-8 rounded-full transition-colors ${
                settings.musicEnabled ? 'bg-primary-600' : 'bg-gray-300'
              }`}
            >
              <motion.div
                animate={{ x: settings.musicEnabled ? 32 : 0 }}
                transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                className="absolute top-1 left-1 w-6 h-6 bg-white rounded-full shadow-md"
              />
            </button>
          </div>

          {/* Voice Selection */}
          <div className="py-4">
            <h3 className="font-medium text-gray-800 mb-3">Voice Type</h3>
            <div className="grid grid-cols-3 gap-3">
              {voiceOptions.map((voice) => (
                <button
                  key={voice.id}
                  onClick={() => updateSettings({ voiceGender: voice.id as any })}
                  className={`p-4 rounded-lg border-2 transition-all ${
                    settings.voiceGender === voice.id
                      ? 'border-primary-500 bg-primary-50'
                      : 'border-gray-300 bg-white hover:border-gray-400'
                  }`}
                >
                  <div className="text-3xl mb-1">{voice.icon}</div>
                  <div className="text-sm font-medium">{voice.label}</div>
                </button>
              ))}
            </div>
          </div>

          {/* Voice Speed Slider */}
          <div className="py-4">
            <h3 className="font-medium text-gray-800 mb-3">Voice Speed</h3>
            <div className="flex items-center space-x-4">
              <span className="text-2xl">🐢</span>
              <input
                type="range"
                min="0.5"
                max="2"
                step="0.1"
                value={settings.voiceSpeed}
                onChange={(e) => updateSettings({ voiceSpeed: parseFloat(e.target.value) })}
                className="flex-1 h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
              />
              <span className="text-2xl">🐰</span>
              <span className="text-sm font-medium text-gray-600 w-12">
                {settings.voiceSpeed.toFixed(1)}x
              </span>
            </div>
          </div>
        </motion.section>

        {/* Accessibility Settings */}
        <motion.section
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white rounded-xl shadow-lg p-6"
        >
          <h2 className="text-2xl font-bold mb-6 text-gray-800 flex items-center space-x-2">
            <span>♿</span>
            <span>Accessibility</span>
          </h2>

          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-medium text-gray-800">Reduced Motion</h3>
                <p className="text-sm text-gray-600">Minimize animations</p>
              </div>
              <button
                onClick={() => handleToggle('reducedMotion', !settings.reducedMotion)}
                className={`relative w-16 h-8 rounded-full transition-colors ${
                  settings.reducedMotion ? 'bg-primary-600' : 'bg-gray-300'
                }`}
              >
                <motion.div
                  animate={{ x: settings.reducedMotion ? 32 : 0 }}
                  transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                  className="absolute top-1 left-1 w-6 h-6 bg-white rounded-full shadow-md"
                />
              </button>
            </div>

            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-medium text-gray-800">Dyslexia-Friendly Font</h3>
                <p className="text-sm text-gray-600">Use OpenDyslexic font</p>
              </div>
              <button
                onClick={() => handleToggle('dyslexicFont', !settings.dyslexicFont)}
                className={`relative w-16 h-8 rounded-full transition-colors ${
                  settings.dyslexicFont ? 'bg-primary-600' : 'bg-gray-300'
                }`}
              >
                <motion.div
                  animate={{ x: settings.dyslexicFont ? 32 : 0 }}
                  transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                  className="absolute top-1 left-1 w-6 h-6 bg-white rounded-full shadow-md"
                />
              </button>
            </div>
          </div>
        </motion.section>

        {/* Parent Dashboard Link */}
        <motion.section
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-gradient-to-r from-purple-100 to-pink-100 rounded-xl shadow-lg p-6 border-2 border-purple-300"
        >
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <h2 className="text-2xl font-bold mb-2 text-gray-800 flex items-center space-x-2">
                <span>👨‍👩‍👧</span>
                <span>Parent Dashboard</span>
              </h2>
              <p className="text-gray-600 mb-4">
                View detailed progress reports, customize learning paths, and manage profiles
              </p>
              <button className="px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors font-medium">
                Open Parent Dashboard
              </button>
            </div>
            <div className="text-6xl">📊</div>
          </div>
        </motion.section>

        {/* About Section */}
        <motion.section
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.4 }}
          className="bg-white rounded-xl shadow-lg p-6"
        >
          <h2 className="text-2xl font-bold mb-4 text-gray-800 flex items-center space-x-2">
            <span>ℹ️</span>
            <span>About</span>
          </h2>
          <div className="text-gray-600 space-y-2">
            <p><strong>Version:</strong> 1.0.0</p>
            <p><strong>AI-Powered Autism Typing Tutor</strong></p>
            <p>A patient, adaptive typing tutor designed specifically for children with autism.</p>
            <p className="text-sm mt-4">
              Built with ❤️ to make typing fun and accessible for every child.
            </p>
          </div>
        </motion.section>
      </div>
    </div>
  );
}
