/**
 * Background Music Component
 * Step 195 - Build background music system
 */

import { motion } from 'framer-motion';
import { useState, useRef, useEffect } from 'react';
import { useSettingsStore } from '../store/useSettingsStore';

// Music track types
export type MusicMood = 'calm' | 'focus' | 'energetic' | 'playful';

// Background music using Web Audio API
export function useBackgroundMusic() {
  const { settings } = useSettingsStore();
  const audioContextRef = useRef<AudioContext | null>(null);
  const oscillatorsRef = useRef<OscillatorNode[]>([]);
  const gainNodeRef = useRef<GainNode | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);

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

  // Musical scales and progressions
  const scales = {
    calm: [
      { freq: 261.63, weight: 1 }, // C4
      { freq: 293.66, weight: 0.7 }, // D4
      { freq: 329.63, weight: 0.8 }, // E4
      { freq: 349.23, weight: 0.6 }, // F4
      { freq: 392.0, weight: 0.9 }, // G4
    ],
    focus: [
      { freq: 220.0, weight: 1 }, // A3
      { freq: 246.94, weight: 0.6 }, // B3
      { freq: 261.63, weight: 0.8 }, // C4
      { freq: 293.66, weight: 0.5 }, // D4
      { freq: 329.63, weight: 0.7 }, // E4
    ],
    energetic: [
      { freq: 329.63, weight: 1 }, // E4
      { freq: 392.0, weight: 0.9 }, // G4
      { freq: 440.0, weight: 0.8 }, // A4
      { freq: 493.88, weight: 0.7 }, // B4
      { freq: 523.25, weight: 0.9 }, // C5
    ],
    playful: [
      { freq: 349.23, weight: 1 }, // F4
      { freq: 392.0, weight: 0.8 }, // G4
      { freq: 440.0, weight: 0.9 }, // A4
      { freq: 466.16, weight: 0.6 }, // A#4
      { freq: 523.25, weight: 0.7 }, // C5
    ],
  };

  const play = (mood: MusicMood = 'calm') => {
    if (!settings.musicEnabled || !audioContextRef.current || !gainNodeRef.current) return;

    stop(); // Stop any existing music

    const ctx = audioContextRef.current;
    const gainNode = gainNodeRef.current;
    const scale = scales[mood];

    // Set volume
    gainNode.gain.setValueAtTime(
      (settings.musicVolume || 0.3) * 0.2, // Keep background music quiet
      ctx.currentTime
    );

    // Create ambient drone with multiple oscillators
    scale.forEach((note) => {
      const oscillator = ctx.createOscillator();
      const noteGain = ctx.createGain();

      oscillator.type = 'sine';
      oscillator.frequency.setValueAtTime(note.freq, ctx.currentTime);

      // Set individual note volume based on weight
      noteGain.gain.setValueAtTime(note.weight * 0.1, ctx.currentTime);

      // Add slight vibrato
      const lfo = ctx.createOscillator();
      const lfoGain = ctx.createGain();
      lfo.frequency.setValueAtTime(0.5 + Math.random() * 0.5, ctx.currentTime);
      lfoGain.gain.setValueAtTime(2, ctx.currentTime);
      lfo.connect(lfoGain);
      lfoGain.connect(oscillator.frequency);

      oscillator.connect(noteGain);
      noteGain.connect(gainNode);

      oscillator.start();
      lfo.start();

      oscillatorsRef.current.push(oscillator);
    });

    setIsPlaying(true);
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
  };

  const setVolume = (volume: number) => {
    if (gainNodeRef.current && audioContextRef.current) {
      gainNodeRef.current.gain.setValueAtTime(
        volume * 0.2,
        audioContextRef.current.currentTime
      );
    }
  };

  return { play, stop, setVolume, isPlaying };
}

// Background music player component
export default function BackgroundMusic() {
  const { play, stop, isPlaying } = useBackgroundMusic();
  const [selectedMood, setSelectedMood] = useState<MusicMood>('calm');
  const { settings } = useSettingsStore();

  const moods: Array<{
    mood: MusicMood;
    label: string;
    description: string;
    icon: string;
    color: string;
  }> = [
    {
      mood: 'calm',
      label: 'Calm',
      description: 'Peaceful, relaxing tones',
      icon: '🌙',
      color: 'from-blue-100 to-blue-200 hover:from-blue-200 hover:to-blue-300',
    },
    {
      mood: 'focus',
      label: 'Focus',
      description: 'Steady, concentration-friendly',
      icon: '🎯',
      color: 'from-purple-100 to-purple-200 hover:from-purple-200 hover:to-purple-300',
    },
    {
      mood: 'energetic',
      label: 'Energetic',
      description: 'Upbeat, motivating',
      icon: '⚡',
      color: 'from-orange-100 to-orange-200 hover:from-orange-200 hover:to-orange-300',
    },
    {
      mood: 'playful',
      label: 'Playful',
      description: 'Fun, lighthearted',
      icon: '🎈',
      color: 'from-pink-100 to-pink-200 hover:from-pink-200 hover:to-pink-300',
    },
  ];

  const handlePlay = (mood: MusicMood) => {
    setSelectedMood(mood);
    play(mood);
  };

  return (
    <div className="bg-white rounded-2xl shadow-xl p-8">
      <h2 className="text-2xl font-bold text-gray-800 mb-6 text-center">
        Background Music
      </h2>

      <div className="mb-8 text-center">
        <div className="flex items-center justify-center gap-4 mb-4">
          <button
            onClick={() => (isPlaying ? stop() : handlePlay(selectedMood))}
            className={`px-8 py-4 rounded-xl font-bold text-xl transition-all shadow-lg ${
              isPlaying
                ? 'bg-red-500 hover:bg-red-600 text-white'
                : 'bg-primary-500 hover:bg-primary-600 text-white'
            }`}
          >
            {isPlaying ? '⏸️ Stop Music' : '▶️ Play Music'}
          </button>
        </div>

        {isPlaying && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-sm text-gray-600"
          >
            Now playing: {selectedMood} mode
          </motion.div>
        )}
      </div>

      <div className="grid grid-cols-2 gap-4 mb-8">
        {moods.map(({ mood, label, description, icon, color }, index) => (
          <motion.button
            key={mood}
            onClick={() => handlePlay(mood)}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: settings.reducedMotion ? 0 : index * 0.1 }}
            whileHover={{ scale: settings.reducedMotion ? 1 : 1.05 }}
            className={`bg-gradient-to-br ${color} rounded-xl p-6 text-left transition-all shadow-md ${
              selectedMood === mood && isPlaying ? 'ring-4 ring-primary-500' : ''
            }`}
          >
            <div className="text-4xl mb-2">{icon}</div>
            <h3 className="text-lg font-bold text-gray-900 mb-1">{label}</h3>
            <p className="text-sm text-gray-700">{description}</p>
          </motion.button>
        ))}
      </div>

      <div className="bg-blue-50 rounded-xl p-6">
        <h3 className="text-lg font-bold text-blue-900 mb-3">
          About Background Music
        </h3>
        <ul className="space-y-2 text-sm text-blue-800">
          <li>✓ Gentle ambient tones to enhance focus</li>
          <li>✓ Generated using Web Audio API</li>
          <li>✓ Volume automatically kept low</li>
          <li>✓ Different moods for different activities</li>
          <li>✓ Can be disabled in settings</li>
        </ul>
      </div>
    </div>
  );
}

// Compact music player
export function MusicPlayer() {
  const { play, stop, isPlaying } = useBackgroundMusic();
  const [mood, setMood] = useState<MusicMood>('calm');

  return (
    <div className="bg-white rounded-xl shadow-lg p-4 flex items-center gap-4">
      <button
        onClick={() => (isPlaying ? stop() : play(mood))}
        className="px-4 py-2 bg-primary-500 text-white rounded-lg font-bold hover:bg-primary-600 transition-colors"
      >
        {isPlaying ? '⏸️' : '▶️'}
      </button>

      <select
        value={mood}
        onChange={(e) => {
          const newMood = e.target.value as MusicMood;
          setMood(newMood);
          if (isPlaying) {
            play(newMood);
          }
        }}
        className="px-3 py-2 border-2 border-gray-300 rounded-lg focus:border-primary-500 focus:outline-none"
      >
        <option value="calm">🌙 Calm</option>
        <option value="focus">🎯 Focus</option>
        <option value="energetic">⚡ Energetic</option>
        <option value="playful">🎈 Playful</option>
      </select>

      {isPlaying && (
        <motion.div
          animate={{ scale: [1, 1.2, 1] }}
          transition={{ duration: 1, repeat: Infinity }}
          className="text-primary-500"
        >
          🎵
        </motion.div>
      )}
    </div>
  );
}

// Auto-play music on mount
export function AutoPlayMusic({ mood = 'calm' }: { mood?: MusicMood }) {
  const { play } = useBackgroundMusic();

  useEffect(() => {
    // Auto-play after a short delay
    const timer = setTimeout(() => {
      play(mood);
    }, 1000);

    return () => clearTimeout(timer);
  }, [mood, play]);

  return null;
}
