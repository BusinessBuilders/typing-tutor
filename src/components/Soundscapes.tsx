/**
 * Soundscapes Component
 * Step 199 - Add ambient soundscapes for different environments
 */

import { motion } from 'framer-motion';
import { useState, useRef, useEffect } from 'react';
import { useSettingsStore } from '../store/useSettingsStore';

// Soundscape types
export type SoundscapeType =
  | 'forest'
  | 'ocean'
  | 'rain'
  | 'cafe'
  | 'library'
  | 'classroom'
  | 'nature'
  | 'space';

// Soundscape configuration
interface SoundscapeConfig {
  name: string;
  description: string;
  icon: string;
  color: string;
  frequencies: Array<{ freq: number; volume: number; waveType: OscillatorType }>;
}

const SOUNDSCAPES: Record<SoundscapeType, SoundscapeConfig> = {
  forest: {
    name: 'Forest',
    description: 'Birds chirping, gentle breeze',
    icon: '🌲',
    color: 'from-green-400 to-green-600',
    frequencies: [
      { freq: 200, volume: 0.05, waveType: 'sine' },
      { freq: 300, volume: 0.03, waveType: 'sine' },
      { freq: 500, volume: 0.04, waveType: 'triangle' },
    ],
  },
  ocean: {
    name: 'Ocean Waves',
    description: 'Calming ocean sounds',
    icon: '🌊',
    color: 'from-blue-400 to-blue-600',
    frequencies: [
      { freq: 80, volume: 0.08, waveType: 'sine' },
      { freq: 120, volume: 0.06, waveType: 'triangle' },
      { freq: 180, volume: 0.04, waveType: 'sine' },
    ],
  },
  rain: {
    name: 'Gentle Rain',
    description: 'Soft rainfall ambience',
    icon: '🌧️',
    color: 'from-gray-400 to-blue-500',
    frequencies: [
      { freq: 250, volume: 0.04, waveType: 'triangle' },
      { freq: 350, volume: 0.03, waveType: 'square' },
      { freq: 450, volume: 0.02, waveType: 'triangle' },
    ],
  },
  cafe: {
    name: 'Coffee Shop',
    description: 'Cozy cafe atmosphere',
    icon: '☕',
    color: 'from-amber-400 to-orange-500',
    frequencies: [
      { freq: 150, volume: 0.06, waveType: 'sine' },
      { freq: 220, volume: 0.04, waveType: 'triangle' },
      { freq: 280, volume: 0.03, waveType: 'sine' },
    ],
  },
  library: {
    name: 'Quiet Library',
    description: 'Peaceful study environment',
    icon: '📚',
    color: 'from-indigo-400 to-purple-500',
    frequencies: [
      { freq: 100, volume: 0.02, waveType: 'sine' },
      { freq: 150, volume: 0.01, waveType: 'sine' },
    ],
  },
  classroom: {
    name: 'Classroom',
    description: 'Friendly learning space',
    icon: '🏫',
    color: 'from-yellow-400 to-orange-400',
    frequencies: [
      { freq: 180, volume: 0.05, waveType: 'sine' },
      { freq: 240, volume: 0.03, waveType: 'triangle' },
      { freq: 320, volume: 0.04, waveType: 'sine' },
    ],
  },
  nature: {
    name: 'Nature',
    description: 'Outdoor ambience',
    icon: '🌿',
    color: 'from-lime-400 to-green-500',
    frequencies: [
      { freq: 220, volume: 0.05, waveType: 'sine' },
      { freq: 330, volume: 0.04, waveType: 'triangle' },
      { freq: 440, volume: 0.03, waveType: 'sine' },
    ],
  },
  space: {
    name: 'Space',
    description: 'Cosmic ambience',
    icon: '🌌',
    color: 'from-purple-600 to-indigo-800',
    frequencies: [
      { freq: 60, volume: 0.06, waveType: 'sine' },
      { freq: 90, volume: 0.04, waveType: 'triangle' },
      { freq: 120, volume: 0.03, waveType: 'sine' },
    ],
  },
};

// Custom hook for soundscapes
export function useSoundscape() {
  const { settings } = useSettingsStore();
  const audioContextRef = useRef<AudioContext | null>(null);
  const oscillatorsRef = useRef<OscillatorNode[]>([]);
  const gainNodeRef = useRef<GainNode | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentScape, setCurrentScape] = useState<SoundscapeType | null>(null);

  useEffect(() => {
    // Initialize AudioContext
    if (typeof window !== 'undefined' && !audioContextRef.current) {
      audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
      gainNodeRef.current = audioContextRef.current.createGain();
      gainNodeRef.current.connect(audioContextRef.current.destination);
    }

    return () => {
      stop();
      if (audioContextRef.current) {
        audioContextRef.current.close();
      }
    };
  }, []);

  const play = (type: SoundscapeType) => {
    if (!settings.soundscapeEnabled || !audioContextRef.current || !gainNodeRef.current) return;

    stop(); // Stop any existing soundscape

    const ctx = audioContextRef.current;
    const gainNode = gainNodeRef.current;
    const config = SOUNDSCAPES[type];

    // Set master volume
    gainNode.gain.setValueAtTime(
      (settings.soundscapeVolume || 0.5) * 0.3,
      ctx.currentTime
    );

    // Create oscillators for this soundscape
    config.frequencies.forEach((freq) => {
      const oscillator = ctx.createOscillator();
      const oscGain = ctx.createGain();

      oscillator.type = freq.waveType;
      oscillator.frequency.setValueAtTime(freq.freq, ctx.currentTime);

      // Add slow LFO for natural variation
      const lfo = ctx.createOscillator();
      const lfoGain = ctx.createGain();
      lfo.frequency.setValueAtTime(0.1 + Math.random() * 0.2, ctx.currentTime);
      lfoGain.gain.setValueAtTime(freq.freq * 0.02, ctx.currentTime);
      lfo.connect(lfoGain);
      lfoGain.connect(oscillator.frequency);

      oscGain.gain.setValueAtTime(freq.volume, ctx.currentTime);

      oscillator.connect(oscGain);
      oscGain.connect(gainNode);

      oscillator.start();
      lfo.start();

      oscillatorsRef.current.push(oscillator);
    });

    setIsPlaying(true);
    setCurrentScape(type);
  };

  const stop = () => {
    oscillatorsRef.current.forEach((osc) => {
      try {
        osc.stop();
      } catch (e) {
        // Already stopped
      }
    });
    oscillatorsRef.current = [];
    setIsPlaying(false);
    setCurrentScape(null);
  };

  const setVolume = (volume: number) => {
    if (gainNodeRef.current && audioContextRef.current) {
      gainNodeRef.current.gain.setValueAtTime(
        volume * 0.3,
        audioContextRef.current.currentTime
      );
    }
  };

  return { play, stop, setVolume, isPlaying, currentScape };
}

// Main soundscapes component
export default function Soundscapes() {
  const { play, stop, isPlaying, currentScape } = useSoundscape();
  const { settings, updateSettings } = useSettingsStore();

  return (
    <div className="bg-white rounded-2xl shadow-xl p-8">
      <h2 className="text-2xl font-bold text-gray-800 mb-6 text-center">
        Ambient Soundscapes
      </h2>

      <div className="mb-6 text-center">
        {isPlaying && currentScape && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-primary-500 to-primary-600 text-white rounded-full shadow-lg"
          >
            <span className="text-2xl">{SOUNDSCAPES[currentScape].icon}</span>
            <span className="font-bold">Playing: {SOUNDSCAPES[currentScape].name}</span>
          </motion.div>
        )}
      </div>

      {/* Volume Control */}
      <div className="mb-8 bg-gray-50 rounded-xl p-6">
        <div className="flex justify-between items-center mb-3">
          <label className="text-sm font-bold text-gray-700">
            Soundscape Volume
          </label>
          <span className="text-sm text-gray-600">
            {Math.round((settings.soundscapeVolume || 0.5) * 100)}%
          </span>
        </div>
        <input
          type="range"
          min="0"
          max="1"
          step="0.1"
          value={settings.soundscapeVolume || 0.5}
          onChange={(e) => updateSettings({ soundscapeVolume: parseFloat(e.target.value) })}
          className="w-full h-3 bg-gray-200 rounded-lg appearance-none cursor-pointer"
        />
      </div>

      {/* Soundscape Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        {(Object.keys(SOUNDSCAPES) as SoundscapeType[]).map((type, index) => {
          const scape = SOUNDSCAPES[type];
          const isActive = currentScape === type && isPlaying;

          return (
            <motion.button
              key={type}
              onClick={() => (isActive ? stop() : play(type))}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: settings.reducedMotion ? 0 : index * 0.05 }}
              whileHover={{ scale: settings.reducedMotion ? 1 : 1.05 }}
              className={`p-6 rounded-xl text-center transition-all shadow-md ${
                isActive
                  ? `bg-gradient-to-br ${scape.color} text-white ring-4 ring-offset-2 ring-primary-400`
                  : `bg-gradient-to-br ${scape.color} opacity-60 hover:opacity-80 text-white`
              }`}
            >
              <div className="text-4xl mb-2">{scape.icon}</div>
              <div className="font-bold mb-1">{scape.name}</div>
              <div className="text-xs opacity-90">{scape.description}</div>
              {isActive && (
                <motion.div
                  animate={{ scale: [1, 1.2, 1] }}
                  transition={{ duration: 2, repeat: Infinity }}
                  className="mt-2 text-xl"
                >
                  🎵
                </motion.div>
              )}
            </motion.button>
          );
        })}
      </div>

      {/* Stop All Button */}
      {isPlaying && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center"
        >
          <button
            onClick={stop}
            className="px-8 py-4 bg-red-500 text-white rounded-xl font-bold hover:bg-red-600 transition-colors shadow-lg"
          >
            ⏸️ Stop Soundscape
          </button>
        </motion.div>
      )}

      <div className="mt-8 bg-blue-50 rounded-xl p-6">
        <h3 className="text-lg font-bold text-blue-900 mb-3">
          About Soundscapes
        </h3>
        <ul className="space-y-2 text-sm text-blue-800">
          <li>• Ambient background sounds to enhance focus</li>
          <li>• Generated using Web Audio API</li>
          <li>• Choose environments that help you concentrate</li>
          <li>• Automatically loops for continuous ambience</li>
          <li>• Can be combined with background music</li>
        </ul>
      </div>
    </div>
  );
}

// Compact soundscape player
export function SoundscapePlayer() {
  const { play, stop, isPlaying, currentScape } = useSoundscape();
  const [selected, setSelected] = useState<SoundscapeType>('forest');

  return (
    <div className="bg-white rounded-xl shadow-lg p-6">
      <h3 className="text-lg font-bold text-gray-800 mb-4">Ambient Sound</h3>

      <div className="flex items-center gap-3 mb-4">
        <select
          value={selected}
          onChange={(e) => {
            const newScape = e.target.value as SoundscapeType;
            setSelected(newScape);
            if (isPlaying) {
              play(newScape);
            }
          }}
          className="flex-1 px-4 py-2 border-2 border-gray-300 rounded-lg focus:border-primary-500 focus:outline-none"
        >
          {(Object.keys(SOUNDSCAPES) as SoundscapeType[]).map((type) => (
            <option key={type} value={type}>
              {SOUNDSCAPES[type].icon} {SOUNDSCAPES[type].name}
            </option>
          ))}
        </select>

        <button
          onClick={() => (isPlaying ? stop() : play(selected))}
          className={`px-6 py-2 rounded-lg font-bold transition-colors ${
            isPlaying
              ? 'bg-red-500 text-white hover:bg-red-600'
              : 'bg-primary-500 text-white hover:bg-primary-600'
          }`}
        >
          {isPlaying ? '⏸️' : '▶️'}
        </button>
      </div>

      {isPlaying && currentScape && (
        <div className="text-center text-sm text-gray-600">
          Now playing: {SOUNDSCAPES[currentScape].name}
        </div>
      )}
    </div>
  );
}

// Soundscape recommendation based on activity
export function SoundscapeRecommendation({
  activity,
}: {
  activity: 'learning' | 'practicing' | 'testing' | 'relaxing';
}) {
  const { play } = useSoundscape();

  const recommendations: Record<typeof activity, SoundscapeType[]> = {
    learning: ['library', 'classroom', 'forest'],
    practicing: ['cafe', 'nature', 'rain'],
    testing: ['library', 'space', 'ocean'],
    relaxing: ['ocean', 'rain', 'forest'],
  };

  const recommended = recommendations[activity];

  return (
    <div className="bg-white rounded-xl shadow-lg p-6">
      <h3 className="text-lg font-bold text-gray-800 mb-2">
        Recommended Soundscapes
      </h3>
      <p className="text-sm text-gray-600 mb-4">
        For {activity}
      </p>

      <div className="flex gap-3">
        {recommended.map((type) => (
          <button
            key={type}
            onClick={() => play(type)}
            className={`flex-1 p-4 bg-gradient-to-br ${SOUNDSCAPES[type].color} text-white rounded-lg hover:opacity-90 transition-opacity`}
          >
            <div className="text-3xl mb-1">{SOUNDSCAPES[type].icon}</div>
            <div className="text-sm font-bold">{SOUNDSCAPES[type].name}</div>
          </button>
        ))}
      </div>
    </div>
  );
}
