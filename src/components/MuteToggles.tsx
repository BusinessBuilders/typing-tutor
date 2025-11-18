/**
 * Mute Toggles Component
 * Step 197 - Create mute toggles for audio controls
 */

import { motion } from 'framer-motion';
import { useSettingsStore } from '../store/useSettingsStore';

// Individual mute toggle
export function MuteToggle({
  label,
  icon,
  enabled,
  onToggle,
  size = 'medium',
}: {
  label: string;
  icon: string;
  enabled: boolean;
  onToggle: (enabled: boolean) => void;
  size?: 'small' | 'medium' | 'large';
}) {
  const sizes = {
    small: {
      button: 'w-12 h-12',
      icon: 'text-xl',
      label: 'text-xs',
    },
    medium: {
      button: 'w-16 h-16',
      icon: 'text-2xl',
      label: 'text-sm',
    },
    large: {
      button: 'w-20 h-20',
      icon: 'text-4xl',
      label: 'text-base',
    },
  };

  const sizeClasses = sizes[size];

  return (
    <div className="flex flex-col items-center gap-2">
      <motion.button
        onClick={() => onToggle(!enabled)}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        className={`${sizeClasses.button} rounded-full flex items-center justify-center transition-all shadow-lg ${
          enabled
            ? 'bg-primary-500 text-white'
            : 'bg-gray-300 text-gray-600'
        }`}
      >
        <span className={sizeClasses.icon}>
          {enabled ? icon : '🔇'}
        </span>
      </motion.button>
      <span className={`${sizeClasses.label} font-bold text-gray-700 text-center`}>
        {label}
      </span>
    </div>
  );
}

// Main mute controls component
export default function MuteToggles() {
  const { settings, updateSettings } = useSettingsStore();

  const toggles = [
    {
      label: 'Sound Effects',
      icon: '🔊',
      enabled: settings.soundEnabled ?? true,
      onToggle: (enabled: boolean) => updateSettings({ soundEnabled: enabled }),
    },
    {
      label: 'Music',
      icon: '🎵',
      enabled: settings.musicEnabled ?? true,
      onToggle: (enabled: boolean) => updateSettings({ musicEnabled: enabled }),
    },
    {
      label: 'Voice',
      icon: '🗣️',
      enabled: settings.voiceEnabled ?? true,
      onToggle: (enabled: boolean) => updateSettings({ voiceEnabled: enabled }),
    },
  ];

  const allEnabled = toggles.every((t) => t.enabled);
  const allDisabled = toggles.every((t) => !t.enabled);

  const toggleAll = () => {
    const newState = !allEnabled;
    updateSettings({
      soundEnabled: newState,
      musicEnabled: newState,
      voiceEnabled: newState,
    });
  };

  return (
    <div className="bg-white rounded-2xl shadow-xl p-8">
      <h2 className="text-2xl font-bold text-gray-800 mb-6 text-center">
        Mute Controls
      </h2>

      {/* Master mute toggle */}
      <div className="mb-8 flex justify-center">
        <div className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-2xl p-6">
          <MuteToggle
            label="Master Audio"
            icon={allDisabled ? '🔇' : '🔊'}
            enabled={!allDisabled}
            onToggle={toggleAll}
            size="large"
          />
        </div>
      </div>

      {/* Individual toggles */}
      <div className="flex justify-center gap-8 mb-8">
        {toggles.map((toggle) => (
          <MuteToggle
            key={toggle.label}
            {...toggle}
            size="medium"
          />
        ))}
      </div>

      {/* Status indicator */}
      <div className="bg-gray-50 rounded-xl p-6 text-center">
        <h3 className="text-lg font-bold text-gray-900 mb-3">
          Audio Status
        </h3>
        <div className="space-y-2">
          {toggles.map((toggle) => (
            <div key={toggle.label} className="flex items-center justify-between">
              <span className="text-gray-700">{toggle.label}:</span>
              <span className={`font-bold ${toggle.enabled ? 'text-green-600' : 'text-red-600'}`}>
                {toggle.enabled ? '✓ On' : '✗ Off'}
              </span>
            </div>
          ))}
        </div>
      </div>

      <div className="mt-6 bg-blue-50 rounded-xl p-6">
        <h3 className="text-lg font-bold text-blue-900 mb-3">
          Quick Tips
        </h3>
        <ul className="space-y-2 text-sm text-blue-800">
          <li>• Master toggle controls all audio at once</li>
          <li>• Individual toggles let you mute specific types</li>
          <li>• Muting doesn't affect volume settings</li>
          <li>• Great for focusing or quiet environments</li>
        </ul>
      </div>
    </div>
  );
}

// Compact mute panel
export function CompactMutePanel() {
  const { settings, updateSettings } = useSettingsStore();

  return (
    <div className="bg-white rounded-xl shadow-md p-4">
      <div className="flex items-center gap-3">
        <button
          onClick={() => updateSettings({ soundEnabled: !settings.soundEnabled })}
          className={`p-2 rounded-lg transition-colors ${
            settings.soundEnabled
              ? 'bg-blue-100 text-blue-700'
              : 'bg-gray-200 text-gray-500'
          }`}
        >
          {settings.soundEnabled ? '🔊' : '🔇'}
        </button>

        <button
          onClick={() => updateSettings({ musicEnabled: !settings.musicEnabled })}
          className={`p-2 rounded-lg transition-colors ${
            settings.musicEnabled
              ? 'bg-purple-100 text-purple-700'
              : 'bg-gray-200 text-gray-500'
          }`}
        >
          {settings.musicEnabled ? '🎵' : '🔇'}
        </button>

        <button
          onClick={() => updateSettings({ voiceEnabled: !settings.voiceEnabled })}
          className={`p-2 rounded-lg transition-colors ${
            settings.voiceEnabled
              ? 'bg-green-100 text-green-700'
              : 'bg-gray-200 text-gray-500'
          }`}
        >
          {settings.voiceEnabled ? '🗣️' : '🔇'}
        </button>
      </div>
    </div>
  );
}

// Floating mute button
export function FloatingMuteButton() {
  const { settings, updateSettings } = useSettingsStore();

  const allMuted = !settings.soundEnabled && !settings.musicEnabled && !settings.voiceEnabled;

  const toggleAll = () => {
    const newState = allMuted;
    updateSettings({
      soundEnabled: newState,
      musicEnabled: newState,
      voiceEnabled: newState,
    });
  };

  return (
    <motion.button
      onClick={toggleAll}
      whileHover={{ scale: 1.1 }}
      whileTap={{ scale: 0.9 }}
      className={`fixed bottom-4 right-4 w-14 h-14 rounded-full shadow-2xl flex items-center justify-center text-2xl transition-colors z-50 ${
        allMuted
          ? 'bg-red-500 text-white'
          : 'bg-primary-500 text-white'
      }`}
    >
      {allMuted ? '🔇' : '🔊'}
    </motion.button>
  );
}

// Keyboard shortcut mute (M key)
export function KeyboardMuteControl() {
  const { settings } = useSettingsStore();

  return (
    <div className="bg-white rounded-xl shadow-lg p-6">
      <h3 className="text-lg font-bold text-gray-800 mb-4">
        Keyboard Shortcuts
      </h3>

      <div className="space-y-3">
        <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
          <span className="text-gray-700">Toggle All Audio</span>
          <kbd className="px-3 py-1 bg-gray-900 text-white rounded font-mono text-sm">
            M
          </kbd>
        </div>

        <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
          <span className="text-gray-700">Mute Sound Effects</span>
          <kbd className="px-3 py-1 bg-gray-900 text-white rounded font-mono text-sm">
            S
          </kbd>
        </div>

        <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
          <span className="text-gray-700">Mute Music</span>
          <kbd className="px-3 py-1 bg-gray-900 text-white rounded font-mono text-sm">
            B
          </kbd>
        </div>

        <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
          <span className="text-gray-700">Mute Voice</span>
          <kbd className="px-3 py-1 bg-gray-900 text-white rounded font-mono text-sm">
            V
          </kbd>
        </div>
      </div>

      <div className="mt-4 p-3 bg-blue-50 rounded-lg">
        <div className="text-sm text-blue-900">
          <strong>Status:</strong>{' '}
          {!settings.soundEnabled && !settings.musicEnabled && !settings.voiceEnabled
            ? 'All audio muted'
            : 'Some audio enabled'}
        </div>
      </div>
    </div>
  );
}

// Toggle switch style mute
export function ToggleSwitchMute({
  label,
  enabled,
  onToggle,
}: {
  label: string;
  enabled: boolean;
  onToggle: (enabled: boolean) => void;
}) {
  return (
    <div className="flex items-center justify-between p-4 bg-white rounded-lg shadow-md">
      <span className="text-gray-900 font-bold">{label}</span>

      <button
        onClick={() => onToggle(!enabled)}
        className={`relative w-14 h-8 rounded-full transition-colors ${
          enabled ? 'bg-green-500' : 'bg-gray-300'
        }`}
      >
        <motion.div
          animate={{ x: enabled ? 24 : 2 }}
          transition={{ type: 'spring', stiffness: 500, damping: 30 }}
          className="absolute top-1 w-6 h-6 bg-white rounded-full shadow-md"
        />
      </button>
    </div>
  );
}

// Audio settings panel with mutes
export function AudioSettingsPanel() {
  const { settings, updateSettings } = useSettingsStore();

  return (
    <div className="bg-white rounded-2xl shadow-xl p-8 space-y-4">
      <h2 className="text-2xl font-bold text-gray-800 mb-6">
        Audio Settings
      </h2>

      <ToggleSwitchMute
        label="Sound Effects"
        enabled={settings.soundEnabled ?? true}
        onToggle={(enabled) => updateSettings({ soundEnabled: enabled })}
      />

      <ToggleSwitchMute
        label="Background Music"
        enabled={settings.musicEnabled ?? true}
        onToggle={(enabled) => updateSettings({ musicEnabled: enabled })}
      />

      <ToggleSwitchMute
        label="Text-to-Speech"
        enabled={settings.voiceEnabled ?? true}
        onToggle={(enabled) => updateSettings({ voiceEnabled: enabled })}
      />
    </div>
  );
}
