/**
 * Volume Controls Component
 * Step 196 - Add volume controls for all audio
 */

import { motion } from 'framer-motion';
import { useSettingsStore } from '../store/useSettingsStore';

// Volume control component
export default function VolumeControls() {
  const { settings, updateSettings } = useSettingsStore();

  const handleSoundVolumeChange = (value: number) => {
    updateSettings({ soundVolume: value });
  };

  const handleMusicVolumeChange = (value: number) => {
    updateSettings({ musicVolume: value });
  };

  const handleVoiceVolumeChange = (value: number) => {
    updateSettings({ voiceVolume: value });
  };

  const handleMasterVolumeChange = (value: number) => {
    updateSettings({
      soundVolume: value,
      musicVolume: value,
      voiceVolume: value,
    });
  };

  return (
    <div className="bg-white rounded-2xl shadow-xl p-8">
      <h2 className="text-2xl font-bold text-gray-800 mb-6 text-center">
        Volume Controls
      </h2>

      <div className="space-y-8">
        {/* Master Volume */}
        <div className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-xl p-6">
          <div className="flex justify-between items-center mb-3">
            <div className="flex items-center gap-3">
              <span className="text-3xl">🎚️</span>
              <label className="text-lg font-bold text-gray-900">
                Master Volume
              </label>
            </div>
            <span className="text-2xl font-bold text-purple-700">
              {Math.round((settings.soundVolume || 1) * 100)}%
            </span>
          </div>
          <input
            type="range"
            min="0"
            max="1"
            step="0.1"
            value={settings.soundVolume || 1}
            onChange={(e) => handleMasterVolumeChange(parseFloat(e.target.value))}
            className="w-full h-4 bg-gradient-to-r from-purple-200 to-pink-200 rounded-lg appearance-none cursor-pointer"
          />
          <div className="flex justify-between text-xs text-gray-600 mt-2">
            <span>Silent</span>
            <span>Quiet</span>
            <span>Medium</span>
            <span>Loud</span>
          </div>
        </div>

        {/* Sound Effects Volume */}
        <div>
          <div className="flex justify-between items-center mb-3">
            <div className="flex items-center gap-3">
              <span className="text-2xl">🔊</span>
              <label className="text-lg font-bold text-gray-800">
                Sound Effects
              </label>
            </div>
            <span className="text-xl font-bold text-gray-700">
              {Math.round((settings.soundVolume || 1) * 100)}%
            </span>
          </div>
          <input
            type="range"
            min="0"
            max="1"
            step="0.1"
            value={settings.soundVolume || 1}
            onChange={(e) => handleSoundVolumeChange(parseFloat(e.target.value))}
            className="w-full h-3 bg-gray-200 rounded-lg appearance-none cursor-pointer"
          />
          <div className="text-xs text-gray-500 mt-1">
            Keypress, success, and error sounds
          </div>
        </div>

        {/* Background Music Volume */}
        <div>
          <div className="flex justify-between items-center mb-3">
            <div className="flex items-center gap-3">
              <span className="text-2xl">🎵</span>
              <label className="text-lg font-bold text-gray-800">
                Background Music
              </label>
            </div>
            <span className="text-xl font-bold text-gray-700">
              {Math.round((settings.musicVolume || 0.3) * 100)}%
            </span>
          </div>
          <input
            type="range"
            min="0"
            max="1"
            step="0.1"
            value={settings.musicVolume || 0.3}
            onChange={(e) => handleMusicVolumeChange(parseFloat(e.target.value))}
            className="w-full h-3 bg-gray-200 rounded-lg appearance-none cursor-pointer"
          />
          <div className="text-xs text-gray-500 mt-1">
            Ambient background music volume
          </div>
        </div>

        {/* Voice/TTS Volume */}
        <div>
          <div className="flex justify-between items-center mb-3">
            <div className="flex items-center gap-3">
              <span className="text-2xl">🗣️</span>
              <label className="text-lg font-bold text-gray-800">
                Voice (Text-to-Speech)
              </label>
            </div>
            <span className="text-xl font-bold text-gray-700">
              {Math.round((settings.voiceVolume || 1) * 100)}%
            </span>
          </div>
          <input
            type="range"
            min="0"
            max="1"
            step="0.1"
            value={settings.voiceVolume || 1}
            onChange={(e) => handleVoiceVolumeChange(parseFloat(e.target.value))}
            className="w-full h-3 bg-gray-200 rounded-lg appearance-none cursor-pointer"
          />
          <div className="text-xs text-gray-500 mt-1">
            Text-to-speech and pronunciation guides
          </div>
        </div>
      </div>

      <div className="mt-8 bg-blue-50 rounded-xl p-6">
        <h3 className="text-lg font-bold text-blue-900 mb-3">
          Volume Tips
        </h3>
        <ul className="space-y-2 text-sm text-blue-800">
          <li>• Master volume controls all audio at once</li>
          <li>• Individual controls let you fine-tune each type</li>
          <li>• Background music is recommended at 20-40% for focus</li>
          <li>• Voice should be louder than music for clarity</li>
          <li>• All volumes can be muted independently</li>
        </ul>
      </div>
    </div>
  );
}

// Compact volume slider
export function VolumeSlider({
  label,
  icon,
  value,
  onChange,
}: {
  label: string;
  icon: string;
  value: number;
  onChange: (value: number) => void;
}) {
  return (
    <div className="bg-white rounded-xl shadow-md p-4">
      <div className="flex items-center gap-3 mb-3">
        <span className="text-2xl">{icon}</span>
        <div className="flex-1">
          <div className="flex justify-between items-center mb-1">
            <label className="text-sm font-bold text-gray-800">{label}</label>
            <span className="text-sm font-bold text-gray-600">
              {Math.round(value * 100)}%
            </span>
          </div>
          <input
            type="range"
            min="0"
            max="1"
            step="0.1"
            value={value}
            onChange={(e) => onChange(parseFloat(e.target.value))}
            className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
          />
        </div>
      </div>
    </div>
  );
}

// Vertical volume control
export function VerticalVolumeControl({
  value,
  onChange,
  label,
}: {
  value: number;
  onChange: (value: number) => void;
  label?: string;
}) {
  return (
    <div className="flex flex-col items-center gap-3 p-4 bg-white rounded-xl shadow-md">
      <div className="text-sm font-bold text-gray-800">{label || 'Volume'}</div>

      <div className="relative h-40 w-8 bg-gray-200 rounded-full">
        <motion.div
          animate={{ height: `${value * 100}%` }}
          className="absolute bottom-0 w-full bg-gradient-to-t from-primary-500 to-primary-300 rounded-full"
        />

        <input
          type="range"
          min="0"
          max="1"
          step="0.05"
          value={value}
          onChange={(e) => onChange(parseFloat(e.target.value))}
          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
          style={{ transform: 'rotate(-90deg)', transformOrigin: 'center' }}
        />
      </div>

      <div className="text-lg font-bold text-gray-700">
        {Math.round(value * 100)}%
      </div>
    </div>
  );
}

// Quick volume presets
export function VolumePresets() {
  const { updateSettings } = useSettingsStore();

  const presets = [
    {
      name: 'Silent',
      icon: '🔇',
      sound: 0,
      music: 0,
      voice: 0,
    },
    {
      name: 'Quiet',
      icon: '🔉',
      sound: 0.3,
      music: 0.2,
      voice: 0.5,
    },
    {
      name: 'Medium',
      icon: '🔊',
      sound: 0.6,
      music: 0.3,
      voice: 0.8,
    },
    {
      name: 'Loud',
      icon: '📢',
      sound: 1,
      music: 0.5,
      voice: 1,
    },
  ];

  const applyPreset = (preset: typeof presets[0]) => {
    updateSettings({
      soundVolume: preset.sound,
      musicVolume: preset.music,
      voiceVolume: preset.voice,
    });
  };

  return (
    <div className="bg-white rounded-xl shadow-lg p-6">
      <h3 className="text-lg font-bold text-gray-800 mb-4">Quick Presets</h3>

      <div className="grid grid-cols-4 gap-3">
        {presets.map((preset) => (
          <button
            key={preset.name}
            onClick={() => applyPreset(preset)}
            className="flex flex-col items-center gap-2 p-4 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
          >
            <span className="text-3xl">{preset.icon}</span>
            <span className="text-sm font-bold text-gray-900">{preset.name}</span>
          </button>
        ))}
      </div>
    </div>
  );
}

// Audio mixer view
export function AudioMixer() {
  const { settings, updateSettings } = useSettingsStore();

  const channels = [
    {
      label: 'Effects',
      icon: '🔊',
      value: settings.soundVolume || 1,
      onChange: (v: number) => updateSettings({ soundVolume: v }),
      color: 'from-blue-400 to-blue-500',
    },
    {
      label: 'Music',
      icon: '🎵',
      value: settings.musicVolume || 0.3,
      onChange: (v: number) => updateSettings({ musicVolume: v }),
      color: 'from-purple-400 to-purple-500',
    },
    {
      label: 'Voice',
      icon: '🗣️',
      value: settings.voiceVolume || 1,
      onChange: (v: number) => updateSettings({ voiceVolume: v }),
      color: 'from-green-400 to-green-500',
    },
  ];

  return (
    <div className="bg-gradient-to-br from-gray-900 to-gray-800 rounded-2xl shadow-2xl p-8">
      <h2 className="text-2xl font-bold text-white mb-8 text-center">
        Audio Mixer
      </h2>

      <div className="flex justify-center items-end gap-8">
        {channels.map((channel) => (
          <div key={channel.label} className="flex flex-col items-center gap-4">
            <div className="text-3xl">{channel.icon}</div>

            <div className="relative h-48 w-12 bg-gray-700 rounded-lg overflow-hidden">
              <motion.div
                animate={{ height: `${channel.value * 100}%` }}
                className={`absolute bottom-0 w-full bg-gradient-to-t ${channel.color}`}
              />

              <input
                type="range"
                min="0"
                max="1"
                step="0.05"
                value={channel.value}
                onChange={(e) => channel.onChange(parseFloat(e.target.value))}
                className="absolute inset-0 opacity-0 cursor-ns-resize"
                style={{
                  width: '100%',
                  height: '100%',
                  WebkitAppearance: 'slider-vertical',
                } as React.CSSProperties}
              />
            </div>

            <div className="text-white font-bold">
              {Math.round(channel.value * 100)}
            </div>

            <div className="text-xs text-gray-400 font-medium">
              {channel.label}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
