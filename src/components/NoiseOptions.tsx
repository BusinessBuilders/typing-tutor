import React, { useState, useCallback, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';

/**
 * Step 289: Add Noise Options
 *
 * Provides ambient noise and background sound options to help users focus
 * and mask distracting environmental sounds. Particularly helpful for users
 * with ADHD, autism, or auditory sensitivities.
 *
 * Features:
 * - Multiple noise types (white, pink, brown)
 * - Nature sounds (rain, ocean, forest, thunder)
 * - Ambient environments (cafe, library, office)
 * - Binaural beats for focus enhancement
 * - Volume mixing and balancing
 * - Custom sound combinations
 * - Timer-based auto-stop
 * - Saved presets
 */

export type NoiseType =
  | 'white'
  | 'pink'
  | 'brown'
  | 'violet'
  | 'rain'
  | 'ocean'
  | 'forest'
  | 'thunder'
  | 'fire'
  | 'wind'
  | 'stream'
  | 'birds'
  | 'cafe'
  | 'library'
  | 'office'
  | 'train'
  | 'fan'
  | 'binaural-alpha'
  | 'binaural-beta'
  | 'binaural-theta'
  | 'binaural-delta';

export type NoiseCategory = 'technical' | 'nature' | 'ambient' | 'binaural';

export interface NoiseProfile {
  type: NoiseType;
  category: NoiseCategory;
  name: string;
  description: string;
  benefits: string[];
  defaultVolume: number; // 0-100
  canMix: boolean;
  frequency?: string; // For technical and binaural
  icon: string;
}

export interface ActiveNoise {
  type: NoiseType;
  volume: number; // 0-100
  playing: boolean;
  startTime: Date;
}

export interface NoisePreset {
  id: string;
  name: string;
  description: string;
  noises: Array<{
    type: NoiseType;
    volume: number;
  }>;
  totalVolume: number; // Master volume 0-100
  autoStop?: number; // minutes
  icon: string;
}

export interface NoiseSettings {
  masterVolume: number; // 0-100
  fadeInDuration: number; // seconds
  fadeOutDuration: number; // seconds
  autoStopEnabled: boolean;
  autoStopAfter: number; // minutes
  playOnFocus: boolean;
  stopOnBreak: boolean;
  rememberLastSession: boolean;
  maxSimultaneous: number; // 1-5
}

export interface NoiseStats {
  totalPlayTime: number; // minutes
  favoriteNoise: NoiseType;
  mostUsedPreset: string;
  sessionCount: number;
  averageVolume: number;
  noiseUsage: Record<NoiseType, number>; // minutes per type
}

const noiseProfiles: NoiseProfile[] = [
  {
    type: 'white',
    category: 'technical',
    name: 'White Noise',
    description: 'Equal intensity across all frequencies',
    benefits: ['Masks distractions', 'Sleep aid', 'Tinnitus relief'],
    defaultVolume: 50,
    canMix: true,
    frequency: 'Full spectrum',
    icon: '📻',
  },
  {
    type: 'pink',
    category: 'technical',
    name: 'Pink Noise',
    description: 'Lower frequencies emphasized, softer than white',
    benefits: ['Deeper sleep', 'Memory enhancement', 'Gentle masking'],
    defaultVolume: 50,
    canMix: true,
    frequency: '1/f spectrum',
    icon: '🌸',
  },
  {
    type: 'brown',
    category: 'technical',
    name: 'Brown Noise',
    description: 'Deep, rumbling sound with even lower frequencies',
    benefits: ['Deep focus', 'Anxiety reduction', 'ADHD support'],
    defaultVolume: 50,
    canMix: true,
    frequency: '1/f² spectrum',
    icon: '🟤',
  },
  {
    type: 'violet',
    category: 'technical',
    name: 'Violet Noise',
    description: 'Higher frequencies emphasized, crisp sound',
    benefits: ['Alertness', 'Concentration', 'Hearing sensitivity'],
    defaultVolume: 40,
    canMix: true,
    frequency: 'f spectrum',
    icon: '🟣',
  },
  {
    type: 'rain',
    category: 'nature',
    name: 'Rain',
    description: 'Gentle rainfall with varying intensity',
    benefits: ['Relaxation', 'Sleep', 'Natural masking'],
    defaultVolume: 60,
    canMix: true,
    icon: '🌧️',
  },
  {
    type: 'ocean',
    category: 'nature',
    name: 'Ocean Waves',
    description: 'Rhythmic waves on shore',
    benefits: ['Meditation', 'Stress relief', 'Rhythmic focus'],
    defaultVolume: 55,
    canMix: true,
    icon: '🌊',
  },
  {
    type: 'forest',
    category: 'nature',
    name: 'Forest Ambience',
    description: 'Birds, rustling leaves, gentle wind',
    benefits: ['Nature connection', 'Calm focus', 'Mood elevation'],
    defaultVolume: 50,
    canMix: true,
    icon: '🌲',
  },
  {
    type: 'thunder',
    category: 'nature',
    name: 'Thunder Storm',
    description: 'Distant thunder with rain',
    benefits: ['Deep relaxation', 'Dramatic ambience', 'Power naps'],
    defaultVolume: 45,
    canMix: true,
    icon: '⛈️',
  },
  {
    type: 'fire',
    category: 'nature',
    name: 'Crackling Fire',
    description: 'Cozy fireplace with crackling logs',
    benefits: ['Warmth feeling', 'Evening relaxation', 'Comfort'],
    defaultVolume: 50,
    canMix: true,
    icon: '🔥',
  },
  {
    type: 'wind',
    category: 'nature',
    name: 'Wind',
    description: 'Gentle to moderate wind through trees',
    benefits: ['Movement sense', 'Natural flow', 'Outdoor feeling'],
    defaultVolume: 45,
    canMix: true,
    icon: '💨',
  },
  {
    type: 'stream',
    category: 'nature',
    name: 'Babbling Brook',
    description: 'Flowing water over rocks',
    benefits: ['Tranquility', 'Natural rhythm', 'Meditation'],
    defaultVolume: 55,
    canMix: true,
    icon: '💧',
  },
  {
    type: 'birds',
    category: 'nature',
    name: 'Birds Chirping',
    description: 'Morning bird songs',
    benefits: ['Morning energy', 'Nature connection', 'Peaceful focus'],
    defaultVolume: 40,
    canMix: true,
    icon: '🐦',
  },
  {
    type: 'cafe',
    category: 'ambient',
    name: 'Coffee Shop',
    description: 'Chatter, espresso machine, background music',
    benefits: ['Social presence', 'Creative boost', 'Cafe atmosphere'],
    defaultVolume: 50,
    canMix: false,
    icon: '☕',
  },
  {
    type: 'library',
    category: 'ambient',
    name: 'Library',
    description: 'Quiet room tone with occasional pages turning',
    benefits: ['Study focus', 'Quiet presence', 'Academic mood'],
    defaultVolume: 30,
    canMix: false,
    icon: '📚',
  },
  {
    type: 'office',
    category: 'ambient',
    name: 'Office',
    description: 'Keyboards, printer, air conditioning',
    benefits: ['Work mode', 'Productivity', 'Professional setting'],
    defaultVolume: 40,
    canMix: false,
    icon: '💼',
  },
  {
    type: 'train',
    category: 'ambient',
    name: 'Train Journey',
    description: 'Rhythmic train sounds and tracks',
    benefits: ['Travel feeling', 'Rhythmic motion', 'Journey mindset'],
    defaultVolume: 45,
    canMix: false,
    icon: '🚂',
  },
  {
    type: 'fan',
    category: 'ambient',
    name: 'Box Fan',
    description: 'Steady fan motor sound',
    benefits: ['Air circulation feel', 'Simple masking', 'Sleep aid'],
    defaultVolume: 50,
    canMix: true,
    icon: '🌀',
  },
  {
    type: 'binaural-alpha',
    category: 'binaural',
    name: 'Alpha Waves (8-13 Hz)',
    description: 'Relaxed focus and light meditation',
    benefits: ['Relaxed alertness', 'Creativity', 'Stress reduction'],
    defaultVolume: 40,
    canMix: false,
    frequency: '8-13 Hz',
    icon: '🧠',
  },
  {
    type: 'binaural-beta',
    category: 'binaural',
    name: 'Beta Waves (13-30 Hz)',
    description: 'Active thinking and concentration',
    benefits: ['Focus', 'Problem solving', 'Active learning'],
    defaultVolume: 40,
    canMix: false,
    frequency: '13-30 Hz',
    icon: '⚡',
  },
  {
    type: 'binaural-theta',
    category: 'binaural',
    name: 'Theta Waves (4-8 Hz)',
    description: 'Deep relaxation and meditation',
    benefits: ['Deep meditation', 'Intuition', 'Memory formation'],
    defaultVolume: 35,
    canMix: false,
    frequency: '4-8 Hz',
    icon: '🌙',
  },
  {
    type: 'binaural-delta',
    category: 'binaural',
    name: 'Delta Waves (0.5-4 Hz)',
    description: 'Deep sleep and healing',
    benefits: ['Deep sleep', 'Healing', 'Regeneration'],
    defaultVolume: 35,
    canMix: false,
    frequency: '0.5-4 Hz',
    icon: '😴',
  },
];

const defaultPresets: NoisePreset[] = [
  {
    id: 'focus-boost',
    name: 'Focus Boost',
    description: 'Brown noise with beta waves for maximum concentration',
    noises: [
      { type: 'brown', volume: 50 },
      { type: 'binaural-beta', volume: 30 },
    ],
    totalVolume: 70,
    icon: '🎯',
  },
  {
    id: 'rainy-day',
    name: 'Rainy Day',
    description: 'Rain with distant thunder for cozy focus',
    noises: [
      { type: 'rain', volume: 70 },
      { type: 'thunder', volume: 30 },
    ],
    totalVolume: 60,
    icon: '🌧️',
  },
  {
    id: 'nature-escape',
    name: 'Nature Escape',
    description: 'Forest sounds with stream for natural ambience',
    noises: [
      { type: 'forest', volume: 60 },
      { type: 'stream', volume: 40 },
    ],
    totalVolume: 55,
    icon: '🌲',
  },
  {
    id: 'ocean-calm',
    name: 'Ocean Calm',
    description: 'Waves with birds for peaceful focus',
    noises: [
      { type: 'ocean', volume: 70 },
      { type: 'birds', volume: 20 },
    ],
    totalVolume: 50,
    icon: '🌊',
  },
  {
    id: 'deep-work',
    name: 'Deep Work',
    description: 'Pink noise for extended concentration',
    noises: [{ type: 'pink', volume: 60 }],
    totalVolume: 60,
    icon: '📖',
  },
  {
    id: 'creative-flow',
    name: 'Creative Flow',
    description: 'Alpha waves with cafe ambience for creativity',
    noises: [
      { type: 'cafe', volume: 40 },
      { type: 'binaural-alpha', volume: 30 },
    ],
    totalVolume: 50,
    icon: '✨',
  },
];

const defaultSettings: NoiseSettings = {
  masterVolume: 70,
  fadeInDuration: 3,
  fadeOutDuration: 2,
  autoStopEnabled: false,
  autoStopAfter: 60,
  playOnFocus: false,
  stopOnBreak: false,
  rememberLastSession: true,
  maxSimultaneous: 3,
};

export const useNoiseOptions = () => {
  const [settings, setSettings] = useState<NoiseSettings>(defaultSettings);
  const [activeNoises, setActiveNoises] = useState<ActiveNoise[]>([]);
  const [presets] = useState<NoisePreset[]>(defaultPresets);
  const [customPresets, setCustomPresets] = useState<NoisePreset[]>([]);
  const [stats, setStats] = useState<NoiseStats>({
    totalPlayTime: 0,
    favoriteNoise: 'white',
    mostUsedPreset: 'focus-boost',
    sessionCount: 0,
    averageVolume: 70,
    noiseUsage: {} as Record<NoiseType, number>,
  });

  const autoStopTimerRef = useRef<NodeJS.Timeout | null>(null);

  const getNoiseProfile = useCallback(
    (type: NoiseType): NoiseProfile => {
      return noiseProfiles.find((p) => p.type === type) || noiseProfiles[0];
    },
    []
  );

  const isPlaying = useCallback(
    (type: NoiseType): boolean => {
      return activeNoises.some((n) => n.type === type && n.playing);
    },
    [activeNoises]
  );

  const canAddNoise = useCallback((): boolean => {
    const playingCount = activeNoises.filter((n) => n.playing).length;
    return playingCount < settings.maxSimultaneous;
  }, [activeNoises, settings.maxSimultaneous]);

  const playNoise = useCallback(
    (type: NoiseType, volume?: number) => {
      const profile = getNoiseProfile(type);

      // Check if already playing
      if (isPlaying(type)) {
        return;
      }

      // Check mixing rules
      if (!profile.canMix) {
        // Stop all other noises if this one can't mix
        setActiveNoises([]);
      } else {
        // Check if can add more
        if (!canAddNoise()) {
          console.warn('Maximum simultaneous noises reached');
          return;
        }

        // Stop any non-mixable noises
        setActiveNoises((prev) =>
          prev.filter((n) => getNoiseProfile(n.type).canMix)
        );
      }

      const noise: ActiveNoise = {
        type,
        volume: volume ?? profile.defaultVolume,
        playing: true,
        startTime: new Date(),
      };

      setActiveNoises((prev) => [...prev, noise]);

      // In a real implementation, this would start the actual audio
      console.log(`Playing ${profile.name} at ${noise.volume}% volume`);

      // Setup auto-stop if enabled
      if (settings.autoStopEnabled && settings.autoStopAfter > 0) {
        autoStopTimerRef.current = setTimeout(() => {
          stopAllNoises();
        }, settings.autoStopAfter * 60 * 1000);
      }
    },
    [getNoiseProfile, isPlaying, canAddNoise, settings]
  );

  const stopNoise = useCallback((type: NoiseType) => {
    setActiveNoises((prev) =>
      prev.map((n) => (n.type === type ? { ...n, playing: false } : n))
    );

    // Remove after fade out
    setTimeout(() => {
      setActiveNoises((prev) => prev.filter((n) => n.type !== type));
    }, settings.fadeOutDuration * 1000);

    console.log(`Stopping ${type}`);
  }, [settings.fadeOutDuration]);

  const toggleNoise = useCallback(
    (type: NoiseType) => {
      if (isPlaying(type)) {
        stopNoise(type);
      } else {
        playNoise(type);
      }
    },
    [isPlaying, stopNoise, playNoise]
  );

  const stopAllNoises = useCallback(() => {
    activeNoises.forEach((noise) => {
      if (noise.playing) {
        stopNoise(noise.type);
      }
    });

    if (autoStopTimerRef.current) {
      clearTimeout(autoStopTimerRef.current);
    }
  }, [activeNoises, stopNoise]);

  const setNoiseVolume = useCallback((type: NoiseType, volume: number) => {
    setActiveNoises((prev) =>
      prev.map((n) => (n.type === type ? { ...n, volume } : n))
    );

    console.log(`Setting ${type} volume to ${volume}%`);
  }, []);

  const setMasterVolume = useCallback((volume: number) => {
    setSettings((prev) => ({ ...prev, masterVolume: volume }));
  }, []);

  const playPreset = useCallback(
    (presetId: string) => {
      // Find preset
      const preset =
        [...presets, ...customPresets].find((p) => p.id === presetId) ||
        presets[0];

      // Stop all current noises
      stopAllNoises();

      // Play each noise in preset
      setTimeout(() => {
        preset.noises.forEach((noise) => {
          playNoise(noise.type, noise.volume);
        });

        // Set master volume
        setMasterVolume(preset.totalVolume);
      }, settings.fadeOutDuration * 1000);
    },
    [presets, customPresets, stopAllNoises, playNoise, setMasterVolume, settings]
  );

  const saveCustomPreset = useCallback(
    (name: string, description: string) => {
      if (activeNoises.length === 0) {
        console.warn('No active noises to save');
        return;
      }

      const preset: NoisePreset = {
        id: `custom-${Date.now()}`,
        name,
        description,
        noises: activeNoises.map((n) => ({
          type: n.type,
          volume: n.volume,
        })),
        totalVolume: settings.masterVolume,
        icon: '⭐',
      };

      setCustomPresets((prev) => [...prev, preset]);
      return preset.id;
    },
    [activeNoises, settings.masterVolume]
  );

  const deleteCustomPreset = useCallback((presetId: string) => {
    setCustomPresets((prev) => prev.filter((p) => p.id !== presetId));
  }, []);

  const updateSettings = useCallback((updates: Partial<NoiseSettings>) => {
    setSettings((prev) => ({ ...prev, ...updates }));
  }, []);

  const getNoisesByCategory = useCallback((category: NoiseCategory) => {
    return noiseProfiles.filter((p) => p.category === category);
  }, []);

  const clearStats = useCallback(() => {
    setStats({
      totalPlayTime: 0,
      favoriteNoise: 'white',
      mostUsedPreset: 'focus-boost',
      sessionCount: 0,
      averageVolume: 70,
      noiseUsage: {} as Record<NoiseType, number>,
    });
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (autoStopTimerRef.current) {
        clearTimeout(autoStopTimerRef.current);
      }
    };
  }, []);

  return {
    settings,
    updateSettings,
    activeNoises,
    allProfiles: noiseProfiles,
    getNoiseProfile,
    getNoisesByCategory,
    isPlaying,
    canAddNoise,
    playNoise,
    stopNoise,
    toggleNoise,
    stopAllNoises,
    setNoiseVolume,
    setMasterVolume,
    presets: [...presets, ...customPresets],
    defaultPresets: presets,
    customPresets,
    playPreset,
    saveCustomPreset,
    deleteCustomPreset,
    stats,
    clearStats,
  };
};

interface NoiseOptionsControlsProps {
  noiseOptions: ReturnType<typeof useNoiseOptions>;
}

export const NoiseOptionsControls: React.FC<NoiseOptionsControlsProps> = ({
  noiseOptions,
}) => {
  const {
    settings,
    updateSettings,
    activeNoises,
    allProfiles,
    getNoisesByCategory,
    isPlaying,
    toggleNoise,
    stopAllNoises,
    setNoiseVolume,
    setMasterVolume,
    presets,
    playPreset,
    saveCustomPreset,
  } = noiseOptions;

  const [selectedCategory, setSelectedCategory] =
    useState<NoiseCategory>('nature');
  const [presetName, setPresetName] = useState('');
  const [presetDescription, setPresetDescription] = useState('');

  const categories: { id: NoiseCategory; name: string; icon: string }[] = [
    { id: 'nature', name: 'Nature', icon: '🌿' },
    { id: 'technical', name: 'Technical', icon: '📊' },
    { id: 'ambient', name: 'Ambient', icon: '🏢' },
    { id: 'binaural', name: 'Binaural', icon: '🧠' },
  ];

  const handleSavePreset = () => {
    if (presetName.trim()) {
      saveCustomPreset(presetName, presetDescription);
      setPresetName('');
      setPresetDescription('');
    }
  };

  return (
    <div
      style={{
        padding: '20px',
        fontFamily: 'system-ui, -apple-system, sans-serif',
        maxWidth: '1000px',
      }}
    >
      <h2 style={{ marginBottom: '20px' }}>Ambient Noise Options</h2>

      {/* Master Volume */}
      <div
        style={{
          marginBottom: '24px',
          padding: '20px',
          background: '#f5f5f5',
          borderRadius: '8px',
          border: '2px solid #ddd',
        }}
      >
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: '12px',
          }}
        >
          <h3 style={{ margin: 0 }}>Master Volume</h3>
          <button
            onClick={stopAllNoises}
            disabled={activeNoises.length === 0}
            style={{
              padding: '8px 16px',
              background: '#f44336',
              color: 'white',
              border: 'none',
              borderRadius: '6px',
              cursor: activeNoises.length === 0 ? 'not-allowed' : 'pointer',
              opacity: activeNoises.length === 0 ? 0.5 : 1,
            }}
          >
            ⏹️ Stop All
          </button>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <span style={{ fontSize: '24px' }}>🔊</span>
          <input
            type="range"
            min="0"
            max="100"
            value={settings.masterVolume}
            onChange={(e) => setMasterVolume(parseInt(e.target.value))}
            style={{ flex: 1 }}
          />
          <span style={{ fontSize: '18px', fontWeight: 'bold', width: '50px' }}>
            {settings.masterVolume}%
          </span>
        </div>
        <div style={{ marginTop: '12px', fontSize: '13px', color: '#666' }}>
          {activeNoises.length > 0 ? (
            <div>
              Playing {activeNoises.length} sound
              {activeNoises.length > 1 ? 's' : ''}: {activeNoises.map((n) => allProfiles.find((p) => p.type === n.type)?.name).join(', ')}
            </div>
          ) : (
            <div>No sounds playing</div>
          )}
        </div>
      </div>

      {/* Presets */}
      <div style={{ marginBottom: '24px' }}>
        <h3 style={{ marginBottom: '12px' }}>Quick Presets</h3>
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))',
            gap: '12px',
          }}
        >
          {presets.slice(0, 6).map((preset) => (
            <motion.button
              key={preset.id}
              onClick={() => playPreset(preset.id)}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              style={{
                padding: '16px',
                background: 'white',
                border: '2px solid #ddd',
                borderRadius: '8px',
                cursor: 'pointer',
                textAlign: 'left',
              }}
            >
              <div style={{ fontSize: '24px', marginBottom: '8px' }}>
                {preset.icon}
              </div>
              <div style={{ fontWeight: 'bold', marginBottom: '4px' }}>
                {preset.name}
              </div>
              <div style={{ fontSize: '12px', color: '#666' }}>
                {preset.description}
              </div>
            </motion.button>
          ))}
        </div>
      </div>

      {/* Category Selection */}
      <div style={{ marginBottom: '16px' }}>
        <div style={{ display: 'flex', gap: '8px' }}>
          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(cat.id)}
              style={{
                padding: '10px 20px',
                background: selectedCategory === cat.id ? '#2196f3' : 'white',
                color: selectedCategory === cat.id ? 'white' : '#333',
                border: '2px solid #ddd',
                borderRadius: '6px',
                cursor: 'pointer',
                fontWeight: selectedCategory === cat.id ? 'bold' : 'normal',
              }}
            >
              {cat.icon} {cat.name}
            </button>
          ))}
        </div>
      </div>

      {/* Noise Options */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))',
          gap: '16px',
          marginBottom: '24px',
        }}
      >
        {getNoisesByCategory(selectedCategory).map((profile) => {
          const playing = isPlaying(profile.type);
          const activeNoise = activeNoises.find((n) => n.type === profile.type);

          return (
            <motion.div
              key={profile.type}
              style={{
                padding: '16px',
                background: playing ? '#e3f2fd' : 'white',
                border: playing ? '2px solid #2196f3' : '2px solid #ddd',
                borderRadius: '8px',
              }}
            >
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  marginBottom: '12px',
                }}
              >
                <div style={{ flex: 1 }}>
                  <div
                    style={{
                      fontSize: '20px',
                      marginBottom: '4px',
                    }}
                  >
                    {profile.icon} {profile.name}
                  </div>
                  <div style={{ fontSize: '12px', color: '#666' }}>
                    {profile.description}
                  </div>
                  {profile.frequency && (
                    <div
                      style={{
                        fontSize: '11px',
                        color: '#999',
                        marginTop: '2px',
                      }}
                    >
                      {profile.frequency}
                    </div>
                  )}
                </div>
                <button
                  onClick={() => toggleNoise(profile.type)}
                  style={{
                    padding: '8px 16px',
                    background: playing ? '#f44336' : '#4caf50',
                    color: 'white',
                    border: 'none',
                    borderRadius: '6px',
                    cursor: 'pointer',
                    height: 'fit-content',
                  }}
                >
                  {playing ? '⏸️' : '▶️'}
                </button>
              </div>

              {playing && activeNoise && (
                <div style={{ marginTop: '12px' }}>
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px',
                    }}
                  >
                    <span style={{ fontSize: '12px' }}>Vol:</span>
                    <input
                      type="range"
                      min="0"
                      max="100"
                      value={activeNoise.volume}
                      onChange={(e) =>
                        setNoiseVolume(profile.type, parseInt(e.target.value))
                      }
                      style={{ flex: 1 }}
                    />
                    <span style={{ fontSize: '12px', width: '35px' }}>
                      {activeNoise.volume}%
                    </span>
                  </div>
                </div>
              )}

              <div
                style={{
                  marginTop: '12px',
                  fontSize: '11px',
                  color: '#888',
                }}
              >
                Benefits: {profile.benefits.slice(0, 2).join(', ')}
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* Save Custom Preset */}
      {activeNoises.length > 0 && (
        <div
          style={{
            padding: '16px',
            background: '#fff3e0',
            border: '2px solid #ff9800',
            borderRadius: '8px',
            marginBottom: '24px',
          }}
        >
          <h3 style={{ marginBottom: '12px' }}>Save Current Mix as Preset</h3>
          <div style={{ display: 'flex', gap: '12px', marginBottom: '8px' }}>
            <input
              type="text"
              placeholder="Preset name"
              value={presetName}
              onChange={(e) => setPresetName(e.target.value)}
              style={{
                flex: 1,
                padding: '8px',
                border: '1px solid #ddd',
                borderRadius: '4px',
              }}
            />
            <button
              onClick={handleSavePreset}
              disabled={!presetName.trim()}
              style={{
                padding: '8px 16px',
                background: '#4caf50',
                color: 'white',
                border: 'none',
                borderRadius: '6px',
                cursor: presetName.trim() ? 'pointer' : 'not-allowed',
                opacity: presetName.trim() ? 1 : 0.5,
              }}
            >
              💾 Save
            </button>
          </div>
          <input
            type="text"
            placeholder="Description (optional)"
            value={presetDescription}
            onChange={(e) => setPresetDescription(e.target.value)}
            style={{
              width: '100%',
              padding: '8px',
              border: '1px solid #ddd',
              borderRadius: '4px',
            }}
          />
        </div>
      )}

      {/* Settings */}
      <div
        style={{
          padding: '16px',
          background: 'white',
          border: '2px solid #ddd',
          borderRadius: '8px',
        }}
      >
        <h3 style={{ marginBottom: '12px' }}>Settings</h3>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          <label style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <input
              type="checkbox"
              checked={settings.autoStopEnabled}
              onChange={(e) =>
                updateSettings({ autoStopEnabled: e.target.checked })
              }
            />
            Auto-stop after{' '}
            <input
              type="number"
              value={settings.autoStopAfter}
              onChange={(e) =>
                updateSettings({ autoStopAfter: parseInt(e.target.value) })
              }
              style={{ width: '60px', padding: '4px' }}
              disabled={!settings.autoStopEnabled}
            />{' '}
            minutes
          </label>
          <label style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <input
              type="checkbox"
              checked={settings.playOnFocus}
              onChange={(e) =>
                updateSettings({ playOnFocus: e.target.checked })
              }
            />
            Auto-play when entering focus mode
          </label>
          <label style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <input
              type="checkbox"
              checked={settings.stopOnBreak}
              onChange={(e) =>
                updateSettings({ stopOnBreak: e.target.checked })
              }
            />
            Auto-stop during breaks
          </label>
          <label style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <input
              type="checkbox"
              checked={settings.rememberLastSession}
              onChange={(e) =>
                updateSettings({ rememberLastSession: e.target.checked })
              }
            />
            Remember last session
          </label>
        </div>
      </div>
    </div>
  );
};

export default NoiseOptionsControls;
