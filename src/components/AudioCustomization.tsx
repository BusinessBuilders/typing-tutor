/**
 * Audio Customization Component
 * Step 198 - Build audio customization options
 */

import { motion } from 'framer-motion';
import { useState } from 'react';
import { useSettingsStore } from '../store/useSettingsStore';
import { useSoundEffects } from './SoundEffects';
import { useBackgroundMusic, MusicMood } from './BackgroundMusic';

// Sound profile types
export type SoundProfile = 'minimal' | 'balanced' | 'rich' | 'custom';

// Pre-defined sound profiles
const SOUND_PROFILES: Record<SoundProfile, {
  name: string;
  description: string;
  soundEnabled: boolean;
  soundVolume: number;
  musicEnabled: boolean;
  musicVolume: number;
  voiceEnabled: boolean;
  voiceVolume: number;
}> = {
  minimal: {
    name: 'Minimal',
    description: 'Essential sounds only, no music',
    soundEnabled: true,
    soundVolume: 0.3,
    musicEnabled: false,
    musicVolume: 0,
    voiceEnabled: true,
    voiceVolume: 0.8,
  },
  balanced: {
    name: 'Balanced',
    description: 'Moderate sounds with gentle music',
    soundEnabled: true,
    soundVolume: 0.6,
    musicEnabled: true,
    musicVolume: 0.3,
    voiceEnabled: true,
    voiceVolume: 1,
  },
  rich: {
    name: 'Rich',
    description: 'Full audio experience with all features',
    soundEnabled: true,
    soundVolume: 1,
    musicEnabled: true,
    musicVolume: 0.5,
    voiceEnabled: true,
    voiceVolume: 1,
  },
  custom: {
    name: 'Custom',
    description: 'Create your own audio settings',
    soundEnabled: true,
    soundVolume: 0.7,
    musicEnabled: true,
    musicVolume: 0.3,
    voiceEnabled: true,
    voiceVolume: 0.9,
  },
};

// Main customization component
export default function AudioCustomization() {
  const { settings, updateSettings } = useSettingsStore();
  const [selectedProfile, setSelectedProfile] = useState<SoundProfile>('balanced');
  const { playSound } = useSoundEffects();

  const applyProfile = (profile: SoundProfile) => {
    const profileSettings = SOUND_PROFILES[profile];
    setSelectedProfile(profile);
    updateSettings({
      soundEnabled: profileSettings.soundEnabled,
      soundVolume: profileSettings.soundVolume,
      musicEnabled: profileSettings.musicEnabled,
      musicVolume: profileSettings.musicVolume,
      voiceEnabled: profileSettings.voiceEnabled,
      voiceVolume: profileSettings.voiceVolume,
    });
    playSound('success');
  };

  return (
    <div className="bg-white rounded-2xl shadow-xl p-8">
      <h2 className="text-2xl font-bold text-gray-800 mb-6 text-center">
        Audio Customization
      </h2>

      {/* Sound Profiles */}
      <div className="mb-8">
        <h3 className="text-lg font-bold text-gray-800 mb-4">
          Sound Profiles
        </h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {(Object.keys(SOUND_PROFILES) as SoundProfile[]).map((profile) => {
            const config = SOUND_PROFILES[profile];
            return (
              <motion.button
                key={profile}
                onClick={() => applyProfile(profile)}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className={`p-6 rounded-xl text-center transition-all ${
                  selectedProfile === profile
                    ? 'bg-gradient-to-br from-primary-500 to-primary-600 text-white shadow-xl ring-4 ring-primary-200'
                    : 'bg-gray-100 hover:bg-gray-200 text-gray-900'
                }`}
              >
                <div className="text-3xl mb-2">
                  {profile === 'minimal' && '🔇'}
                  {profile === 'balanced' && '🎵'}
                  {profile === 'rich' && '🎶'}
                  {profile === 'custom' && '⚙️'}
                </div>
                <div className="font-bold mb-1">{config.name}</div>
                <div className={`text-xs ${
                  selectedProfile === profile ? 'text-white opacity-90' : 'text-gray-600'
                }`}>
                  {config.description}
                </div>
              </motion.button>
            );
          })}
        </div>
      </div>

      {/* Custom Settings */}
      {selectedProfile === 'custom' && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8 bg-gradient-to-br from-purple-50 to-pink-50 rounded-xl p-6"
        >
          <h3 className="text-lg font-bold text-gray-900 mb-4">
            Custom Audio Settings
          </h3>

          <div className="space-y-4">
            {/* Sound Effects */}
            <div>
              <label className="flex items-center gap-2 mb-2">
                <input
                  type="checkbox"
                  checked={settings.soundEnabled ?? true}
                  onChange={(e) => updateSettings({ soundEnabled: e.target.checked })}
                  className="w-5 h-5 rounded"
                />
                <span className="font-bold text-gray-900">Enable Sound Effects</span>
              </label>
              {settings.soundEnabled && (
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.1"
                  value={settings.soundVolume || 1}
                  onChange={(e) => updateSettings({ soundVolume: parseFloat(e.target.value) })}
                  className="w-full h-2 bg-blue-200 rounded-lg"
                />
              )}
            </div>

            {/* Music */}
            <div>
              <label className="flex items-center gap-2 mb-2">
                <input
                  type="checkbox"
                  checked={settings.musicEnabled ?? true}
                  onChange={(e) => updateSettings({ musicEnabled: e.target.checked })}
                  className="w-5 h-5 rounded"
                />
                <span className="font-bold text-gray-900">Enable Background Music</span>
              </label>
              {settings.musicEnabled && (
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.1"
                  value={settings.musicVolume || 0.3}
                  onChange={(e) => updateSettings({ musicVolume: parseFloat(e.target.value) })}
                  className="w-full h-2 bg-purple-200 rounded-lg"
                />
              )}
            </div>

            {/* Voice */}
            <div>
              <label className="flex items-center gap-2 mb-2">
                <input
                  type="checkbox"
                  checked={settings.voiceEnabled ?? true}
                  onChange={(e) => updateSettings({ voiceEnabled: e.target.checked })}
                  className="w-5 h-5 rounded"
                />
                <span className="font-bold text-gray-900">Enable Text-to-Speech</span>
              </label>
              {settings.voiceEnabled && (
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.1"
                  value={settings.voiceVolume || 1}
                  onChange={(e) => updateSettings({ voiceVolume: parseFloat(e.target.value) })}
                  className="w-full h-2 bg-green-200 rounded-lg"
                />
              )}
            </div>
          </div>
        </motion.div>
      )}

      {/* Current Settings Display */}
      <div className="bg-gray-50 rounded-xl p-6">
        <h3 className="text-lg font-bold text-gray-900 mb-4">
          Current Configuration
        </h3>
        <div className="grid grid-cols-3 gap-4 text-center">
          <div className="bg-white rounded-lg p-4">
            <div className="text-3xl mb-2">🔊</div>
            <div className="text-sm font-bold text-gray-700">Effects</div>
            <div className="text-xl font-bold text-primary-600">
              {settings.soundEnabled ? `${Math.round((settings.soundVolume || 1) * 100)}%` : 'Off'}
            </div>
          </div>

          <div className="bg-white rounded-lg p-4">
            <div className="text-3xl mb-2">🎵</div>
            <div className="text-sm font-bold text-gray-700">Music</div>
            <div className="text-xl font-bold text-primary-600">
              {settings.musicEnabled ? `${Math.round((settings.musicVolume || 0.3) * 100)}%` : 'Off'}
            </div>
          </div>

          <div className="bg-white rounded-lg p-4">
            <div className="text-3xl mb-2">🗣️</div>
            <div className="text-sm font-bold text-gray-700">Voice</div>
            <div className="text-xl font-bold text-primary-600">
              {settings.voiceEnabled ? `${Math.round((settings.voiceVolume || 1) * 100)}%` : 'Off'}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// Music mood selector
export function MusicMoodSelector() {
  const [selectedMood, setSelectedMood] = useState<MusicMood>('calm');
  const { play, stop, isPlaying } = useBackgroundMusic();

  const moods: Array<{
    mood: MusicMood;
    name: string;
    icon: string;
    color: string;
  }> = [
    { mood: 'calm', name: 'Calm', icon: '🌙', color: 'from-blue-400 to-blue-500' },
    { mood: 'focus', name: 'Focus', icon: '🎯', color: 'from-purple-400 to-purple-500' },
    { mood: 'energetic', name: 'Energetic', icon: '⚡', color: 'from-orange-400 to-orange-500' },
    { mood: 'playful', name: 'Playful', icon: '🎈', color: 'from-pink-400 to-pink-500' },
  ];

  return (
    <div className="bg-white rounded-xl shadow-lg p-6">
      <h3 className="text-lg font-bold text-gray-800 mb-4">Music Mood</h3>

      <div className="grid grid-cols-2 gap-3 mb-4">
        {moods.map(({ mood, name, icon, color }) => (
          <button
            key={mood}
            onClick={() => {
              setSelectedMood(mood);
              if (isPlaying) {
                play(mood);
              }
            }}
            className={`p-4 rounded-lg transition-all ${
              selectedMood === mood
                ? `bg-gradient-to-br ${color} text-white shadow-lg`
                : 'bg-gray-100 text-gray-900 hover:bg-gray-200'
            }`}
          >
            <div className="text-2xl mb-1">{icon}</div>
            <div className="text-sm font-bold">{name}</div>
          </button>
        ))}
      </div>

      <button
        onClick={() => (isPlaying ? stop() : play(selectedMood))}
        className={`w-full py-3 rounded-lg font-bold transition-colors ${
          isPlaying
            ? 'bg-red-500 text-white hover:bg-red-600'
            : 'bg-primary-500 text-white hover:bg-primary-600'
        }`}
      >
        {isPlaying ? '⏸️ Stop' : '▶️ Play'}
      </button>
    </div>
  );
}

// Accessibility audio presets
export function AccessibilityAudioPresets() {
  const { updateSettings } = useSettingsStore();

  const presets = [
    {
      name: 'Sensory Sensitive',
      description: 'Reduced sounds for sensory sensitivity',
      icon: '🤫',
      settings: {
        soundEnabled: true,
        soundVolume: 0.2,
        musicEnabled: false,
        musicVolume: 0,
        voiceEnabled: true,
        voiceVolume: 0.6,
      },
    },
    {
      name: 'Focus Mode',
      description: 'Voice only, no distractions',
      icon: '🎯',
      settings: {
        soundEnabled: false,
        soundVolume: 0,
        musicEnabled: false,
        musicVolume: 0,
        voiceEnabled: true,
        voiceVolume: 1,
      },
    },
    {
      name: 'Full Support',
      description: 'All audio features enabled',
      icon: '🎧',
      settings: {
        soundEnabled: true,
        soundVolume: 0.8,
        musicEnabled: true,
        musicVolume: 0.4,
        voiceEnabled: true,
        voiceVolume: 1,
      },
    },
  ];

  return (
    <div className="bg-white rounded-xl shadow-lg p-6">
      <h3 className="text-lg font-bold text-gray-800 mb-4">
        Accessibility Presets
      </h3>

      <div className="space-y-3">
        {presets.map((preset) => (
          <button
            key={preset.name}
            onClick={() => updateSettings(preset.settings)}
            className="w-full text-left p-4 bg-gradient-to-r from-green-50 to-blue-50 hover:from-green-100 hover:to-blue-100 rounded-lg transition-all"
          >
            <div className="flex items-center gap-3 mb-2">
              <span className="text-3xl">{preset.icon}</span>
              <div>
                <div className="font-bold text-gray-900">{preset.name}</div>
                <div className="text-sm text-gray-600">{preset.description}</div>
              </div>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}

// Save/Load audio preferences
export function AudioPreferences() {
  const { settings, updateSettings } = useSettingsStore();
  const [savedPresets, setSavedPresets] = useState<Array<{
    name: string;
    settings: any;
  }>>([]);

  const saveCurrentPreset = () => {
    const name = prompt('Name this preset:');
    if (!name) return;

    const preset = {
      name,
      settings: {
        soundEnabled: settings.soundEnabled,
        soundVolume: settings.soundVolume,
        musicEnabled: settings.musicEnabled,
        musicVolume: settings.musicVolume,
        voiceEnabled: settings.voiceEnabled,
        voiceVolume: settings.voiceVolume,
      },
    };

    setSavedPresets([...savedPresets, preset]);
  };

  return (
    <div className="bg-white rounded-xl shadow-lg p-6">
      <h3 className="text-lg font-bold text-gray-800 mb-4">
        Audio Preferences
      </h3>

      <button
        onClick={saveCurrentPreset}
        className="w-full mb-4 py-3 bg-primary-500 text-white rounded-lg font-bold hover:bg-primary-600 transition-colors"
      >
        💾 Save Current Settings
      </button>

      {savedPresets.length > 0 && (
        <div className="space-y-2">
          <div className="text-sm font-bold text-gray-700 mb-2">
            Saved Presets:
          </div>
          {savedPresets.map((preset, index) => (
            <div
              key={index}
              className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
            >
              <span className="text-gray-900">{preset.name}</span>
              <button
                onClick={() => updateSettings(preset.settings)}
                className="px-4 py-1 bg-blue-500 text-white rounded font-bold text-sm hover:bg-blue-600"
              >
                Load
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
