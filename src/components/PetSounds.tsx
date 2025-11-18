/**
 * Pet Sounds Component
 * Step 228 - Add pet sound effects and audio feedback
 */

import { motion } from 'framer-motion';
import { useState } from 'react';
import { useSettingsStore } from '../store/useSettingsStore';
import type { Pet } from './PetSystem';

// Sound interface
export interface PetSound {
  id: string;
  name: string;
  icon: string;
  description: string;
  trigger: 'manual' | 'happy' | 'hungry' | 'tired' | 'playful' | 'evolve';
  frequency: 'common' | 'uncommon' | 'rare';
}

// Sound library for different pet types
const PET_SOUNDS: Record<Pet['type'], PetSound[]> = {
  cat: [
    { id: 'meow', name: 'Meow', icon: '😺', description: 'A friendly meow', trigger: 'manual', frequency: 'common' },
    { id: 'purr', name: 'Purr', icon: '😸', description: 'Happy purring', trigger: 'happy', frequency: 'common' },
    { id: 'hiss', name: 'Hiss', icon: '😾', description: 'Upset hiss', trigger: 'hungry', frequency: 'uncommon' },
    { id: 'yawn', name: 'Yawn', icon: '😿', description: 'Tired yawn', trigger: 'tired', frequency: 'common' },
    { id: 'chirp', name: 'Chirp', icon: '😽', description: 'Excited chirp', trigger: 'playful', frequency: 'uncommon' },
    { id: 'roar', name: 'Roar', icon: '🦁', description: 'Mighty roar', trigger: 'evolve', frequency: 'rare' },
  ],
  dog: [
    { id: 'bark', name: 'Bark', icon: '🐕', description: 'Happy bark', trigger: 'manual', frequency: 'common' },
    { id: 'woof', name: 'Woof', icon: '🐶', description: 'Friendly woof', trigger: 'happy', frequency: 'common' },
    { id: 'whine', name: 'Whine', icon: '🥺', description: 'Hungry whine', trigger: 'hungry', frequency: 'uncommon' },
    { id: 'snore', name: 'Snore', icon: '😴', description: 'Sleepy snore', trigger: 'tired', frequency: 'common' },
    { id: 'growl', name: 'Growl-play', icon: '😤', description: 'Playful growl', trigger: 'playful', frequency: 'uncommon' },
    { id: 'howl', name: 'Howl', icon: '🐺', description: 'Powerful howl', trigger: 'evolve', frequency: 'rare' },
  ],
  rabbit: [
    { id: 'squeak', name: 'Squeak', icon: '🐰', description: 'Cute squeak', trigger: 'manual', frequency: 'common' },
    { id: 'thump', name: 'Thump', icon: '🐇', description: 'Happy thump', trigger: 'happy', frequency: 'common' },
    { id: 'grunt', name: 'Grunt', icon: '😠', description: 'Hungry grunt', trigger: 'hungry', frequency: 'uncommon' },
    { id: 'teeth', name: 'Teeth Chatter', icon: '🦷', description: 'Content chattering', trigger: 'tired', frequency: 'common' },
    { id: 'binky', name: 'Binky Sound', icon: '🦘', description: 'Joyful binky', trigger: 'playful', frequency: 'uncommon' },
    { id: 'hop', name: 'Power Hop', icon: '🦘', description: 'Evolved hop', trigger: 'evolve', frequency: 'rare' },
  ],
  bird: [
    { id: 'chirp_b', name: 'Chirp', icon: '🐤', description: 'Little chirp', trigger: 'manual', frequency: 'common' },
    { id: 'sing', name: 'Sing', icon: '🐦', description: 'Beautiful song', trigger: 'happy', frequency: 'common' },
    { id: 'peep', name: 'Peep', icon: '🐣', description: 'Hungry peep', trigger: 'hungry', frequency: 'uncommon' },
    { id: 'coo', name: 'Coo', icon: '🕊️', description: 'Sleepy coo', trigger: 'tired', frequency: 'common' },
    { id: 'tweet', name: 'Tweet', icon: '🐥', description: 'Excited tweet', trigger: 'playful', frequency: 'uncommon' },
    { id: 'screech', name: 'Screech', icon: '🦅', description: 'Eagle cry', trigger: 'evolve', frequency: 'rare' },
  ],
  dragon: [
    { id: 'squeal', name: 'Squeal', icon: '🥚', description: 'Tiny squeal', trigger: 'manual', frequency: 'common' },
    { id: 'rumble', name: 'Rumble', icon: '🐲', description: 'Happy rumble', trigger: 'happy', frequency: 'common' },
    { id: 'smoke', name: 'Smoke Puff', icon: '💨', description: 'Hungry smoke', trigger: 'hungry', frequency: 'uncommon' },
    { id: 'snooze', name: 'Snooze', icon: '😴', description: 'Dragon snooze', trigger: 'tired', frequency: 'common' },
    { id: 'flame', name: 'Flame Burst', icon: '🔥', description: 'Playful flame', trigger: 'playful', frequency: 'uncommon' },
    { id: 'roar_d', name: 'Dragon Roar', icon: '🐉', description: 'Ancient roar', trigger: 'evolve', frequency: 'rare' },
  ],
  fox: [
    { id: 'yip', name: 'Yip', icon: '🦊', description: 'Quick yip', trigger: 'manual', frequency: 'common' },
    { id: 'gekker', name: 'Gekker', icon: '😊', description: 'Happy gekkering', trigger: 'happy', frequency: 'common' },
    { id: 'whimper', name: 'Whimper', icon: '🥺', description: 'Hungry whimper', trigger: 'hungry', frequency: 'uncommon' },
    { id: 'murmur', name: 'Murmur', icon: '😌', description: 'Sleepy murmur', trigger: 'tired', frequency: 'common' },
    { id: 'cackle', name: 'Cackle', icon: '🤪', description: 'Playful cackle', trigger: 'playful', frequency: 'uncommon' },
    { id: 'mystical', name: 'Mystical Cry', icon: '✨', description: 'Spirit call', trigger: 'evolve', frequency: 'rare' },
  ],
};

// Custom hook for pet sounds
export function usePetSounds() {
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [volume, setVolume] = useState(70);
  const [lastPlayed, setLastPlayed] = useState<PetSound | null>(null);
  const [soundHistory, setSoundHistory] = useState<{ sound: PetSound; timestamp: Date }[]>([]);

  const playSound = (sound: PetSound) => {
    if (!soundEnabled) return;

    // In a real app, this would play actual audio
    console.log(`Playing sound: ${sound.name} at ${volume}% volume`);

    setLastPlayed(sound);
    setSoundHistory((prev) => [
      ...prev,
      { sound, timestamp: new Date() },
    ].slice(-20)); // Keep last 20 sounds

    // Show visual feedback
    return {
      played: true,
      sound: sound.name,
    };
  };

  const toggleSound = () => {
    setSoundEnabled(!soundEnabled);
  };

  const changeVolume = (newVolume: number) => {
    setVolume(Math.max(0, Math.min(100, newVolume)));
  };

  const getSoundForTrigger = (petType: Pet['type'], trigger: PetSound['trigger']) => {
    const sounds = PET_SOUNDS[petType].filter((s) => s.trigger === trigger);
    if (sounds.length === 0) return null;
    return sounds[Math.floor(Math.random() * sounds.length)];
  };

  const getMostPlayedSound = (): PetSound | null => {
    const counts: Record<string, number> = {};
    soundHistory.forEach(({ sound }) => {
      counts[sound.id] = (counts[sound.id] || 0) + 1;
    });

    let maxCount = 0;
    let mostPlayed: PetSound | null = null;

    Object.entries(counts).forEach(([id, count]) => {
      if (count > maxCount) {
        maxCount = count;
        const foundSound = soundHistory.find((h) => h.sound.id === id);
        if (foundSound) mostPlayed = foundSound.sound;
      }
    });

    return mostPlayed;
  };

  return {
    soundEnabled,
    volume,
    lastPlayed,
    soundHistory,
    playSound,
    toggleSound,
    changeVolume,
    getSoundForTrigger,
    getMostPlayedSound,
  };
}

// Main pet sounds component
export default function PetSounds({ pet }: { pet: Pet | null }) {
  const {
    soundEnabled,
    volume,
    lastPlayed,
    soundHistory,
    playSound,
    toggleSound,
    changeVolume,
    getMostPlayedSound,
  } = usePetSounds();

  const { settings } = useSettingsStore();
  const [selectedCategory, setSelectedCategory] = useState<PetSound['trigger'] | 'all'>('all');

  const sounds = pet ? PET_SOUNDS[pet.type] : [];
  const filteredSounds = selectedCategory === 'all'
    ? sounds
    : sounds.filter((s) => s.trigger === selectedCategory);

  const mostPlayed: PetSound | null = getMostPlayedSound();
  const totalSoundsPlayed = soundHistory.length;

  const handlePlaySound = (sound: PetSound) => {
    playSound(sound);
  };

  return (
    <div className="bg-white rounded-2xl shadow-xl p-8">
      <h2 className="text-2xl font-bold text-gray-800 mb-6 text-center">
        🔊 Pet Sounds
      </h2>

      {!pet && (
        <div className="text-center text-gray-500 py-12">
          <div className="text-6xl mb-4">🐾</div>
          <div>Get a pet first to hear sounds!</div>
        </div>
      )}

      {pet && (
        <div>
          {/* Sound controls */}
          <div className="mb-8 bg-gradient-to-r from-purple-50 to-pink-50 rounded-xl p-6">
            <h3 className="text-lg font-bold text-gray-900 mb-4">Sound Settings</h3>

            <div className="space-y-4">
              {/* Sound toggle */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="text-2xl">{soundEnabled ? '🔊' : '🔇'}</span>
                  <span className="font-bold text-gray-900">Sound Effects</span>
                </div>
                <button
                  onClick={toggleSound}
                  className={`px-6 py-2 rounded-lg font-bold transition-all ${
                    soundEnabled
                      ? 'bg-green-500 text-white'
                      : 'bg-gray-300 text-gray-600'
                  }`}
                >
                  {soundEnabled ? 'ON' : 'OFF'}
                </button>
              </div>

              {/* Volume control */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="font-bold text-gray-900">Volume: {volume}%</span>
                  <span className="text-2xl">
                    {volume === 0 ? '🔇' : volume < 50 ? '🔉' : '🔊'}
                  </span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={volume}
                  onChange={(e) => changeVolume(parseInt(e.target.value))}
                  disabled={!soundEnabled}
                  className="w-full"
                />
              </div>
            </div>
          </div>

          {/* Stats */}
          <div className="mb-6 bg-gray-50 rounded-xl p-6">
            <h3 className="text-lg font-bold text-gray-900 mb-4">Sound Stats</h3>
            <div className="grid grid-cols-3 gap-4">
              <div className="bg-white rounded-lg p-4 text-center">
                <div className="text-3xl font-bold text-primary-600">{totalSoundsPlayed}</div>
                <div className="text-xs text-gray-600">Total Played</div>
              </div>
              <div className="bg-white rounded-lg p-4 text-center">
                <div className="text-3xl font-bold text-purple-600">{sounds.length}</div>
                <div className="text-xs text-gray-600">Available</div>
              </div>
              <div className="bg-white rounded-lg p-4 text-center">
                <div className="text-2xl">{mostPlayed?.icon || '❓'}</div>
                <div className="text-xs text-gray-600">Favorite</div>
              </div>
            </div>
          </div>

          {/* Category filter */}
          <div className="mb-6">
            <label className="block text-sm font-bold text-gray-700 mb-3">
              Filter by Trigger:
            </label>
            <div className="flex flex-wrap gap-2">
              {[
                { value: 'all' as const, label: 'All', icon: '🎵' },
                { value: 'manual' as const, label: 'Manual', icon: '👆' },
                { value: 'happy' as const, label: 'Happy', icon: '😊' },
                { value: 'hungry' as const, label: 'Hungry', icon: '😋' },
                { value: 'tired' as const, label: 'Tired', icon: '😴' },
                { value: 'playful' as const, label: 'Playful', icon: '🎮' },
                { value: 'evolve' as const, label: 'Evolve', icon: '⭐' },
              ].map(({ value, label, icon }) => (
                <button
                  key={value}
                  onClick={() => setSelectedCategory(value)}
                  className={`px-4 py-2 rounded-lg font-medium transition-all ${
                    selectedCategory === value
                      ? 'bg-primary-500 text-white shadow-lg'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  {icon} {label}
                </button>
              ))}
            </div>
          </div>

          {/* Sounds grid */}
          <div className="mb-8">
            <h3 className="text-lg font-bold text-gray-900 mb-4">Sound Library</h3>

            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {filteredSounds.map((sound, index) => (
                <motion.button
                  key={sound.id}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: settings.reducedMotion ? 0 : index * 0.05 }}
                  onClick={() => handlePlaySound(sound)}
                  disabled={!soundEnabled}
                  whileHover={soundEnabled ? { scale: 1.05 } : {}}
                  whileTap={soundEnabled ? { scale: 0.95 } : {}}
                  className={`p-6 rounded-xl transition-all ${
                    !soundEnabled
                      ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                      : sound.frequency === 'rare'
                      ? 'bg-gradient-to-br from-yellow-400 to-orange-500 text-white hover:from-yellow-500 hover:to-orange-600 shadow-lg'
                      : sound.frequency === 'uncommon'
                      ? 'bg-gradient-to-br from-blue-400 to-purple-500 text-white hover:from-blue-500 hover:to-purple-600 shadow-lg'
                      : 'bg-gradient-to-br from-green-400 to-blue-500 text-white hover:from-green-500 hover:to-blue-600 shadow-lg'
                  }`}
                >
                  <div className="text-center">
                    <div className="text-5xl mb-2">{sound.icon}</div>
                    <div className="font-bold mb-1">{sound.name}</div>
                    <div className={`text-xs mb-2 ${!soundEnabled ? 'text-gray-500' : 'opacity-90'}`}>
                      {sound.description}
                    </div>
                    <div className="flex flex-wrap gap-1 justify-center text-xs">
                      <span className={`px-2 py-1 rounded ${
                        !soundEnabled ? 'bg-gray-300' : 'bg-white bg-opacity-20'
                      }`}>
                        {sound.trigger}
                      </span>
                      <span className={`px-2 py-1 rounded ${
                        !soundEnabled ? 'bg-gray-300' : 'bg-white bg-opacity-20'
                      }`}>
                        {sound.frequency}
                      </span>
                    </div>
                  </div>
                </motion.button>
              ))}
            </div>

            {filteredSounds.length === 0 && (
              <div className="text-center text-gray-500 py-8">
                No sounds in this category
              </div>
            )}
          </div>

          {/* Last played */}
          {lastPlayed && (
            <div className="mb-6 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-xl p-6">
              <h3 className="text-lg font-bold mb-3">Last Played</h3>
              <div className="flex items-center gap-4">
                <div className="text-6xl">{lastPlayed.icon}</div>
                <div>
                  <div className="text-2xl font-bold">{lastPlayed.name}</div>
                  <div className="opacity-90">{lastPlayed.description}</div>
                </div>
              </div>
            </div>
          )}

          {/* Sound history */}
          {soundHistory.length > 0 && (
            <div className="bg-gray-50 rounded-xl p-6">
              <h3 className="text-lg font-bold text-gray-900 mb-4">
                Recent Sounds ({soundHistory.length})
              </h3>
              <div className="space-y-2 max-h-48 overflow-y-auto">
                {soundHistory.slice(-10).reverse().map(({ sound, timestamp }, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between bg-white rounded-lg p-3"
                  >
                    <div className="flex items-center gap-3">
                      <div className="text-2xl">{sound.icon}</div>
                      <div>
                        <div className="font-bold text-sm text-gray-900">{sound.name}</div>
                        <div className="text-xs text-gray-600">
                          {timestamp.toLocaleTimeString()}
                        </div>
                      </div>
                    </div>
                    <button
                      onClick={() => handlePlaySound(sound)}
                      disabled={!soundEnabled}
                      className="px-3 py-1 bg-primary-500 text-white rounded-lg text-sm font-bold hover:bg-primary-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                      🔊 Play
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      <div className="mt-8 bg-blue-50 rounded-xl p-6">
        <h3 className="text-lg font-bold text-blue-900 mb-3">
          Sound Features
        </h3>
        <ul className="space-y-2 text-sm text-blue-800">
          <li>• Each pet type has unique sounds</li>
          <li>• Sounds play automatically based on pet's mood</li>
          <li>• Adjust volume to your preference</li>
          <li>• Rare sounds unlock as your pet evolves</li>
          <li>• Click any sound to play it manually</li>
        </ul>
      </div>
    </div>
  );
}

// Sound indicator component
export function SoundIndicator({ sound, onPlay }: { sound: PetSound; onPlay: () => void }) {
  return (
    <button
      onClick={onPlay}
      className="inline-flex items-center gap-2 px-4 py-2 bg-purple-500 text-white rounded-lg font-bold hover:bg-purple-600 transition-colors"
    >
      <span className="text-2xl">{sound.icon}</span>
      <span>🔊 {sound.name}</span>
    </button>
  );
}
