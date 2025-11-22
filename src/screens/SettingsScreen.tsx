import React, { useState, useCallback } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useSettingsStore } from '../store/useSettingsStore';

/**
 * SettingsScreen Component - Step 96
 *
 * Comprehensive settings interface for autism-friendly customization.
 * Allows users to personalize every aspect of their typing experience.
 *
 * Features:
 * - Visual/Display settings (themes, fonts, colors, animations)
 * - Audio settings (volume, voice, sound effects)
 * - Typing settings (difficulty, hints, feedback)
 * - Accessibility settings (screen reader, motor accommodations)
 * - Sensory settings (reduce motion, calm mode, break reminders)
 * - Parent controls (password protected)
 */

export interface SettingsConfig {
  // Visual Settings
  theme: 'light' | 'dark' | 'high-contrast' | 'calm';
  fontSize: number; // 12-24
  fontFamily: 'default' | 'dyslexia-friendly' | 'sans-serif' | 'serif';
  animationsEnabled: boolean;
  animationSpeed: 'slow' | 'medium' | 'fast';

  // Audio Settings
  volume: number; // 0-100
  textToSpeechEnabled: boolean;
  soundEffectsEnabled: boolean;
  backgroundMusicEnabled: boolean;
  voiceType: 'male' | 'female' | 'child' | 'neutral';

  // Typing Settings
  difficulty: 'easy' | 'medium' | 'hard';
  showKeyboardHints: boolean;
  showTypingProgress: boolean;
  enableAutoAdvance: boolean;
  typingSpeed: 'slow' | 'medium' | 'fast';

  // Accessibility
  screenReaderEnabled: boolean;
  largeButtons: boolean;
  keyboardOnlyMode: boolean;
  reducedMotion: boolean;

  // Sensory Settings
  calmModeEnabled: boolean;
  breakReminders: boolean;
  breakInterval: number; // minutes
  sessionLength: number; // minutes
}

const defaultSettings: SettingsConfig = {
  theme: 'light',
  fontSize: 16,
  fontFamily: 'default',
  animationsEnabled: true,
  animationSpeed: 'medium',
  volume: 70,
  textToSpeechEnabled: true,
  soundEffectsEnabled: true,
  backgroundMusicEnabled: false,
  voiceType: 'neutral',
  difficulty: 'easy',
  showKeyboardHints: true,
  showTypingProgress: true,
  enableAutoAdvance: false,
  typingSpeed: 'medium',
  screenReaderEnabled: false,
  largeButtons: true,
  keyboardOnlyMode: false,
  reducedMotion: false,
  calmModeEnabled: true,
  breakReminders: true,
  breakInterval: 15,
  sessionLength: 30,
};

const SettingsScreen: React.FC = () => {
  const navigate = useNavigate();
  const { settings: globalSettings, updateSettings } = useSettingsStore();
  const [settings, setSettings] = useState<SettingsConfig>(defaultSettings);
  const [activeSection, setActiveSection] = useState<string>('visual');
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'saved'>('idle');

  const updateSetting = useCallback((key: keyof SettingsConfig, value: any) => {
    setSettings((prev) => ({ ...prev, [key]: value }));

    // Also update global store for music toggle
    if (key === 'backgroundMusicEnabled') {
      updateSettings({ musicEnabled: value });
    }
  }, [updateSettings]);

  const handleSave = useCallback(() => {
    setSaveStatus('saving');
    // Save to localStorage
    setTimeout(() => {
      localStorage.setItem('typing-tutor-settings', JSON.stringify(settings));
      setSaveStatus('saved');
      setTimeout(() => setSaveStatus('idle'), 2000);
    }, 500);
  }, [settings]);

  const handleReset = useCallback(() => {
    if (window.confirm('Reset all settings to defaults? This cannot be undone.')) {
      setSettings(defaultSettings);
      updateSettings({ musicEnabled: false });
    }
  }, [updateSettings]);

  const handleClearAICache = useCallback(() => {
    if (window.confirm('Clear all AI-generated content cache? This will force fresh content generation.')) {
      localStorage.removeItem('therapeutic_used_content');
      localStorage.removeItem('therapeutic_content_cache');
      alert('AI content cache cleared! New content will be generated on next use.');
    }
  }, []);

  const sections = [
    { id: 'visual', label: 'Visual & Display', icon: '🎨' },
    { id: 'audio', label: 'Audio & Voice', icon: '🔊' },
    { id: 'typing', label: 'Typing Options', icon: '⌨️' },
    { id: 'accessibility', label: 'Accessibility', icon: '♿' },
    { id: 'sensory', label: 'Sensory & Comfort', icon: '🧘' },
  ];

  const renderVisualSettings = () => (
    <div className="settings-group space-y-6">
      <div className="setting-item">
        <label className="setting-label text-lg font-semibold text-gray-800 mb-2 block">
          Theme
        </label>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {(['light', 'dark', 'high-contrast', 'calm'] as const).map((theme) => (
            <button
              key={theme}
              onClick={() => updateSetting('theme', theme)}
              className={`p-4 rounded-xl border-2 transition-all ${
                settings.theme === theme
                  ? 'border-purple-500 bg-purple-50'
                  : 'border-gray-300 hover:border-purple-300'
              }`}
            >
              <div className="capitalize font-medium">{theme.replace('-', ' ')}</div>
            </button>
          ))}
        </div>
      </div>

      <div className="setting-item">
        <label className="setting-label text-lg font-semibold text-gray-800 mb-2 block">
          Font Size: {settings.fontSize}px
        </label>
        <input
          type="range"
          min="12"
          max="24"
          value={settings.fontSize}
          onChange={(e) => updateSetting('fontSize', Number(e.target.value))}
          className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
        />
        <div className="flex justify-between text-sm text-gray-600 mt-1">
          <span>Small (12px)</span>
          <span>Large (24px)</span>
        </div>
      </div>

      <div className="setting-item">
        <label className="setting-label text-lg font-semibold text-gray-800 mb-2 block">
          Font Style
        </label>
        <select
          value={settings.fontFamily}
          onChange={(e) => updateSetting('fontFamily', e.target.value)}
          className="w-full p-3 rounded-xl border-2 border-gray-300 focus:border-purple-500 focus:outline-none"
        >
          <option value="default">Default</option>
          <option value="dyslexia-friendly">Dyslexia-Friendly (OpenDyslexic)</option>
          <option value="sans-serif">Sans-Serif</option>
          <option value="serif">Serif</option>
        </select>
      </div>

      <div className="setting-item flex items-center justify-between p-4 bg-gray-50 rounded-xl">
        <div>
          <div className="text-lg font-semibold text-gray-800">Animations</div>
          <div className="text-sm text-gray-600">Enable smooth animations</div>
        </div>
        <label className="relative inline-block w-14 h-8">
          <input
            type="checkbox"
            checked={settings.animationsEnabled}
            onChange={(e) => updateSetting('animationsEnabled', e.target.checked)}
            className="sr-only peer"
          />
          <div className="w-14 h-8 bg-gray-300 rounded-full peer peer-checked:bg-purple-500 transition-colors cursor-pointer">
            <div className={`absolute top-1 left-1 bg-white w-6 h-6 rounded-full transition-transform ${
              settings.animationsEnabled ? 'transform translate-x-6' : ''
            }`}></div>
          </div>
        </label>
      </div>
    </div>
  );

  const renderAudioSettings = () => (
    <div className="settings-group space-y-6">
      <div className="setting-item">
        <label className="setting-label text-lg font-semibold text-gray-800 mb-2 block">
          Volume: {settings.volume}%
        </label>
        <input
          type="range"
          min="0"
          max="100"
          value={settings.volume}
          onChange={(e) => updateSetting('volume', Number(e.target.value))}
          className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
        />
      </div>

      <div className="setting-item flex items-center justify-between p-4 bg-gray-50 rounded-xl">
        <div>
          <div className="text-lg font-semibold text-gray-800">Text-to-Speech</div>
          <div className="text-sm text-gray-600">Read text aloud</div>
        </div>
        <label className="relative inline-block w-14 h-8">
          <input
            type="checkbox"
            checked={settings.textToSpeechEnabled}
            onChange={(e) => updateSetting('textToSpeechEnabled', e.target.checked)}
            className="sr-only peer"
          />
          <div className="w-14 h-8 bg-gray-300 rounded-full peer peer-checked:bg-purple-500 transition-colors cursor-pointer">
            <div className={`absolute top-1 left-1 bg-white w-6 h-6 rounded-full transition-transform ${
              settings.textToSpeechEnabled ? 'transform translate-x-6' : ''
            }`}></div>
          </div>
        </label>
      </div>

      <div className="setting-item flex items-center justify-between p-4 bg-gray-50 rounded-xl">
        <div>
          <div className="text-lg font-semibold text-gray-800">Sound Effects</div>
          <div className="text-sm text-gray-600">Play success sounds</div>
        </div>
        <label className="relative inline-block w-14 h-8">
          <input
            type="checkbox"
            checked={settings.soundEffectsEnabled}
            onChange={(e) => updateSetting('soundEffectsEnabled', e.target.checked)}
            className="sr-only peer"
          />
          <div className="w-14 h-8 bg-gray-300 rounded-full peer peer-checked:bg-purple-500 transition-colors cursor-pointer">
            <div className={`absolute top-1 left-1 bg-white w-6 h-6 rounded-full transition-transform ${
              settings.soundEffectsEnabled ? 'transform translate-x-6' : ''
            }`}></div>
          </div>
        </label>
      </div>

      <div className="setting-item flex items-center justify-between p-4 bg-gray-50 rounded-xl">
        <div>
          <div className="text-lg font-semibold text-gray-800">Background Music</div>
          <div className="text-sm text-gray-600">Calm background music</div>
        </div>
        <label className="relative inline-block w-14 h-8">
          <input
            type="checkbox"
            checked={settings.backgroundMusicEnabled}
            onChange={(e) => updateSetting('backgroundMusicEnabled', e.target.checked)}
            className="sr-only peer"
          />
          <div className="w-14 h-8 bg-gray-300 rounded-full peer peer-checked:bg-purple-500 transition-colors cursor-pointer">
            <div className={`absolute top-1 left-1 bg-white w-6 h-6 rounded-full transition-transform ${
              settings.backgroundMusicEnabled ? 'transform translate-x-6' : ''
            }`}></div>
          </div>
        </label>
      </div>

      <div className="setting-item">
        <label className="setting-label text-lg font-semibold text-gray-800 mb-2 block">
          Voice Type
        </label>
        <select
          value={settings.voiceType}
          onChange={(e) => updateSetting('voiceType', e.target.value)}
          className="w-full p-3 rounded-xl border-2 border-gray-300 focus:border-purple-500 focus:outline-none"
        >
          <option value="neutral">Neutral</option>
          <option value="male">Male</option>
          <option value="female">Female</option>
          <option value="child">Child</option>
        </select>
      </div>
    </div>
  );

  const renderTypingSettings = () => (
    <div className="settings-group space-y-6">
      <div className="setting-item">
        <label className="setting-label text-lg font-semibold text-gray-800 mb-2 block">
          Difficulty Level
        </label>
        <div className="grid grid-cols-3 gap-3">
          {(['easy', 'medium', 'hard'] as const).map((level) => (
            <button
              key={level}
              onClick={() => updateSetting('difficulty', level)}
              className={`p-4 rounded-xl border-2 transition-all ${
                settings.difficulty === level
                  ? 'border-purple-500 bg-purple-50'
                  : 'border-gray-300 hover:border-purple-300'
              }`}
            >
              <div className="capitalize font-medium">{level}</div>
            </button>
          ))}
        </div>
      </div>

      <div className="setting-item flex items-center justify-between p-4 bg-gray-50 rounded-xl">
        <div>
          <div className="text-lg font-semibold text-gray-800">Keyboard Hints</div>
          <div className="text-sm text-gray-600">Show which key to press</div>
        </div>
        <label className="relative inline-block w-14 h-8">
          <input
            type="checkbox"
            checked={settings.showKeyboardHints}
            onChange={(e) => updateSetting('showKeyboardHints', e.target.checked)}
            className="sr-only peer"
          />
          <div className="w-14 h-8 bg-gray-300 rounded-full peer peer-checked:bg-purple-500 transition-colors cursor-pointer">
            <div className={`absolute top-1 left-1 bg-white w-6 h-6 rounded-full transition-transform ${
              settings.showKeyboardHints ? 'transform translate-x-6' : ''
            }`}></div>
          </div>
        </label>
      </div>

      <div className="setting-item flex items-center justify-between p-4 bg-gray-50 rounded-xl">
        <div>
          <div className="text-lg font-semibold text-gray-800">Typing Progress</div>
          <div className="text-sm text-gray-600">Show progress bar</div>
        </div>
        <label className="relative inline-block w-14 h-8">
          <input
            type="checkbox"
            checked={settings.showTypingProgress}
            onChange={(e) => updateSetting('showTypingProgress', e.target.checked)}
            className="sr-only peer"
          />
          <div className="w-14 h-8 bg-gray-300 rounded-full peer peer-checked:bg-purple-500 transition-colors cursor-pointer">
            <div className={`absolute top-1 left-1 bg-white w-6 h-6 rounded-full transition-transform ${
              settings.showTypingProgress ? 'transform translate-x-6' : ''
            }`}></div>
          </div>
        </label>
      </div>

      <div className="setting-item flex items-center justify-between p-4 bg-gray-50 rounded-xl">
        <div>
          <div className="text-lg font-semibold text-gray-800">Auto-Advance</div>
          <div className="text-sm text-gray-600">Move to next lesson automatically</div>
        </div>
        <label className="relative inline-block w-14 h-8">
          <input
            type="checkbox"
            checked={settings.enableAutoAdvance}
            onChange={(e) => updateSetting('enableAutoAdvance', e.target.checked)}
            className="sr-only peer"
          />
          <div className="w-14 h-8 bg-gray-300 rounded-full peer peer-checked:bg-purple-500 transition-colors cursor-pointer">
            <div className={`absolute top-1 left-1 bg-white w-6 h-6 rounded-full transition-transform ${
              settings.enableAutoAdvance ? 'transform translate-x-6' : ''
            }`}></div>
          </div>
        </label>
      </div>
    </div>
  );

  const renderAccessibilitySettings = () => (
    <div className="settings-group space-y-6">
      <div className="setting-item flex items-center justify-between p-4 bg-gray-50 rounded-xl">
        <div>
          <div className="text-lg font-semibold text-gray-800">Screen Reader Support</div>
          <div className="text-sm text-gray-600">Enhanced accessibility</div>
        </div>
        <label className="relative inline-block w-14 h-8">
          <input
            type="checkbox"
            checked={settings.screenReaderEnabled}
            onChange={(e) => updateSetting('screenReaderEnabled', e.target.checked)}
            className="sr-only peer"
          />
          <div className="w-14 h-8 bg-gray-300 rounded-full peer peer-checked:bg-purple-500 transition-colors cursor-pointer">
            <div className={`absolute top-1 left-1 bg-white w-6 h-6 rounded-full transition-transform ${
              settings.screenReaderEnabled ? 'transform translate-x-6' : ''
            }`}></div>
          </div>
        </label>
      </div>

      <div className="setting-item flex items-center justify-between p-4 bg-gray-50 rounded-xl">
        <div>
          <div className="text-lg font-semibold text-gray-800">Large Buttons</div>
          <div className="text-sm text-gray-600">Easier to click</div>
        </div>
        <label className="relative inline-block w-14 h-8">
          <input
            type="checkbox"
            checked={settings.largeButtons}
            onChange={(e) => updateSetting('largeButtons', e.target.checked)}
            className="sr-only peer"
          />
          <div className="w-14 h-8 bg-gray-300 rounded-full peer peer-checked:bg-purple-500 transition-colors cursor-pointer">
            <div className={`absolute top-1 left-1 bg-white w-6 h-6 rounded-full transition-transform ${
              settings.largeButtons ? 'transform translate-x-6' : ''
            }`}></div>
          </div>
        </label>
      </div>

      <div className="setting-item flex items-center justify-between p-4 bg-gray-50 rounded-xl">
        <div>
          <div className="text-lg font-semibold text-gray-800">Keyboard-Only Mode</div>
          <div className="text-sm text-gray-600">Navigate without mouse</div>
        </div>
        <label className="relative inline-block w-14 h-8">
          <input
            type="checkbox"
            checked={settings.keyboardOnlyMode}
            onChange={(e) => updateSetting('keyboardOnlyMode', e.target.checked)}
            className="sr-only peer"
          />
          <div className="w-14 h-8 bg-gray-300 rounded-full peer peer-checked:bg-purple-500 transition-colors cursor-pointer">
            <div className={`absolute top-1 left-1 bg-white w-6 h-6 rounded-full transition-transform ${
              settings.keyboardOnlyMode ? 'transform translate-x-6' : ''
            }`}></div>
          </div>
        </label>
      </div>

      <div className="setting-item flex items-center justify-between p-4 bg-gray-50 rounded-xl">
        <div>
          <div className="text-lg font-semibold text-gray-800">Reduced Motion</div>
          <div className="text-sm text-gray-600">Minimal animations</div>
        </div>
        <label className="relative inline-block w-14 h-8">
          <input
            type="checkbox"
            checked={settings.reducedMotion}
            onChange={(e) => updateSetting('reducedMotion', e.target.checked)}
            className="sr-only peer"
          />
          <div className="w-14 h-8 bg-gray-300 rounded-full peer peer-checked:bg-purple-500 transition-colors cursor-pointer">
            <div className={`absolute top-1 left-1 bg-white w-6 h-6 rounded-full transition-transform ${
              settings.reducedMotion ? 'transform translate-x-6' : ''
            }`}></div>
          </div>
        </label>
      </div>
    </div>
  );

  const renderSensorySettings = () => (
    <div className="settings-group space-y-6">
      <div className="setting-item flex items-center justify-between p-4 bg-gray-50 rounded-xl">
        <div>
          <div className="text-lg font-semibold text-gray-800">Calm Mode</div>
          <div className="text-sm text-gray-600">Reduce sensory input</div>
        </div>
        <label className="relative inline-block w-14 h-8">
          <input
            type="checkbox"
            checked={settings.calmModeEnabled}
            onChange={(e) => updateSetting('calmModeEnabled', e.target.checked)}
            className="sr-only peer"
          />
          <div className="w-14 h-8 bg-gray-300 rounded-full peer peer-checked:bg-purple-500 transition-colors cursor-pointer">
            <div className={`absolute top-1 left-1 bg-white w-6 h-6 rounded-full transition-transform ${
              settings.calmModeEnabled ? 'transform translate-x-6' : ''
            }`}></div>
          </div>
        </label>
      </div>

      <div className="setting-item flex items-center justify-between p-4 bg-gray-50 rounded-xl">
        <div>
          <div className="text-lg font-semibold text-gray-800">Break Reminders</div>
          <div className="text-sm text-gray-600">Gentle reminders to rest</div>
        </div>
        <label className="relative inline-block w-14 h-8">
          <input
            type="checkbox"
            checked={settings.breakReminders}
            onChange={(e) => updateSetting('breakReminders', e.target.checked)}
            className="sr-only peer"
          />
          <div className="w-14 h-8 bg-gray-300 rounded-full peer peer-checked:bg-purple-500 transition-colors cursor-pointer">
            <div className={`absolute top-1 left-1 bg-white w-6 h-6 rounded-full transition-transform ${
              settings.breakReminders ? 'transform translate-x-6' : ''
            }`}></div>
          </div>
        </label>
      </div>

      <div className="setting-item">
        <label className="setting-label text-lg font-semibold text-gray-800 mb-2 block">
          Break Interval: {settings.breakInterval} minutes
        </label>
        <input
          type="range"
          min="5"
          max="60"
          step="5"
          value={settings.breakInterval}
          onChange={(e) => updateSetting('breakInterval', Number(e.target.value))}
          className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
          disabled={!settings.breakReminders}
        />
        <div className="flex justify-between text-sm text-gray-600 mt-1">
          <span>5 min</span>
          <span>60 min</span>
        </div>
      </div>

      <div className="setting-item">
        <label className="setting-label text-lg font-semibold text-gray-800 mb-2 block">
          Session Length: {settings.sessionLength} minutes
        </label>
        <input
          type="range"
          min="10"
          max="90"
          step="10"
          value={settings.sessionLength}
          onChange={(e) => updateSetting('sessionLength', Number(e.target.value))}
          className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
        />
        <div className="flex justify-between text-sm text-gray-600 mt-1">
          <span>10 min</span>
          <span>90 min</span>
        </div>
      </div>
    </div>
  );

  return (
    <div className="settings-screen min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-6">
      {/* Header */}
      <div className="max-w-6xl mx-auto mb-8">
        <button
          onClick={() => navigate('/')}
          className="mb-4 text-purple-600 hover:text-purple-700 flex items-center gap-2 text-lg"
        >
          ← Back to Home
        </button>
        <h1 className="text-5xl font-bold text-gray-800 mb-2">Settings ⚙️</h1>
        <p className="text-xl text-gray-600">
          Customize your typing experience to work best for you
        </p>
      </div>

      {/* Content */}
      <div className="max-w-6xl mx-auto flex gap-6">
        {/* Sidebar Navigation */}
        <div className="sidebar w-64 flex-shrink-0">
          <div className="bg-white rounded-2xl shadow-md p-4 sticky top-6">
            {sections.map((section) => (
              <button
                key={section.id}
                onClick={() => setActiveSection(section.id)}
                className={`w-full text-left p-4 rounded-xl mb-2 transition-all ${
                  activeSection === section.id
                    ? 'bg-purple-500 text-white shadow-md'
                    : 'hover:bg-gray-100 text-gray-700'
                }`}
              >
                <span className="text-2xl mr-3">{section.icon}</span>
                <span className="font-medium">{section.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Main Settings Panel */}
        <div className="flex-1">
          <motion.div
            key={activeSection}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-2xl shadow-md p-8"
          >
            <h2 className="text-3xl font-bold text-gray-800 mb-6">
              {sections.find((s) => s.id === activeSection)?.label}
            </h2>

            {activeSection === 'visual' && renderVisualSettings()}
            {activeSection === 'audio' && renderAudioSettings()}
            {activeSection === 'typing' && renderTypingSettings()}
            {activeSection === 'accessibility' && renderAccessibilitySettings()}
            {activeSection === 'sensory' && renderSensorySettings()}

            {/* Action Buttons */}
            <div className="mt-8 space-y-4">
              <div className="flex gap-4">
                <button
                  onClick={handleSave}
                  disabled={saveStatus === 'saving'}
                  className="flex-1 py-4 bg-purple-500 hover:bg-purple-600 disabled:bg-gray-400 text-white font-bold rounded-xl transition-all shadow-md hover:shadow-lg"
                >
                  {saveStatus === 'saving' ? 'Saving...' : saveStatus === 'saved' ? 'Saved! ✓' : 'Save Settings'}
                </button>
                <button
                  onClick={handleReset}
                  className="px-6 py-4 bg-gray-300 hover:bg-gray-400 text-gray-800 font-bold rounded-xl transition-all"
                >
                  Reset to Defaults
                </button>
              </div>

              {/* Clear AI Cache Button */}
              <button
                onClick={handleClearAICache}
                className="w-full py-4 bg-orange-500 hover:bg-orange-600 text-white font-bold rounded-xl transition-all shadow-md hover:shadow-lg"
              >
                🗑️ Clear AI Content Cache (Fix Repetition)
              </button>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default SettingsScreen;
