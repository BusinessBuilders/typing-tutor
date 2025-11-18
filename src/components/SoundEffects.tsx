/**
 * Sound Effects Component
 * Step 191 - Create sound effects system
 */

import { useRef, useEffect } from 'react';
import { useSettingsStore } from '../store/useSettingsStore';

// Sound effect types
export type SoundEffectType =
  | 'keypress'
  | 'correct'
  | 'incorrect'
  | 'success'
  | 'achievement'
  | 'levelUp'
  | 'click'
  | 'hover'
  | 'transition';

// Sound effect configuration
export interface SoundEffect {
  type: SoundEffectType;
  frequency: number;
  duration: number;
  volume: number;
  waveType?: OscillatorType;
}

// Pre-defined sound effects
export const SOUND_EFFECTS: Record<SoundEffectType, SoundEffect> = {
  keypress: {
    type: 'keypress',
    frequency: 440,
    duration: 50,
    volume: 0.2,
    waveType: 'sine',
  },
  correct: {
    type: 'correct',
    frequency: 523.25, // C5
    duration: 100,
    volume: 0.3,
    waveType: 'sine',
  },
  incorrect: {
    type: 'incorrect',
    frequency: 220, // A3
    duration: 150,
    volume: 0.2,
    waveType: 'triangle',
  },
  success: {
    type: 'success',
    frequency: 659.25, // E5
    duration: 200,
    volume: 0.4,
    waveType: 'sine',
  },
  achievement: {
    type: 'achievement',
    frequency: 783.99, // G5
    duration: 300,
    volume: 0.5,
    waveType: 'sine',
  },
  levelUp: {
    type: 'levelUp',
    frequency: 880, // A5
    duration: 400,
    volume: 0.5,
    waveType: 'sine',
  },
  click: {
    type: 'click',
    frequency: 400,
    duration: 30,
    volume: 0.1,
    waveType: 'square',
  },
  hover: {
    type: 'hover',
    frequency: 600,
    duration: 20,
    volume: 0.05,
    waveType: 'sine',
  },
  transition: {
    type: 'transition',
    frequency: 500,
    duration: 100,
    volume: 0.15,
    waveType: 'sine',
  },
};

// Custom hook for sound effects
export function useSoundEffects() {
  const { settings } = useSettingsStore();
  const audioContextRef = useRef<AudioContext | null>(null);

  useEffect(() => {
    // Initialize AudioContext
    if (typeof window !== 'undefined' && !audioContextRef.current) {
      audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
    }

    return () => {
      if (audioContextRef.current) {
        audioContextRef.current.close();
      }
    };
  }, []);

  const playSound = (type: SoundEffectType, customConfig?: Partial<SoundEffect>) => {
    if (!settings.soundEnabled || !audioContextRef.current) return;

    const effect = { ...SOUND_EFFECTS[type], ...customConfig };
    const ctx = audioContextRef.current;

    try {
      // Create oscillator
      const oscillator = ctx.createOscillator();
      const gainNode = ctx.createGain();

      oscillator.type = effect.waveType || 'sine';
      oscillator.frequency.setValueAtTime(effect.frequency, ctx.currentTime);

      // Set volume
      gainNode.gain.setValueAtTime(effect.volume * (settings.soundVolume || 1), ctx.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + effect.duration / 1000);

      // Connect nodes
      oscillator.connect(gainNode);
      gainNode.connect(ctx.destination);

      // Play
      oscillator.start(ctx.currentTime);
      oscillator.stop(ctx.currentTime + effect.duration / 1000);
    } catch (error) {
      console.error('Error playing sound:', error);
    }
  };

  return { playSound };
}

// Sound effect button component
export function SoundButton({
  children,
  onClick,
  soundType = 'click',
  className = '',
}: {
  children: React.ReactNode;
  onClick?: () => void;
  soundType?: SoundEffectType;
  className?: string;
}) {
  const { playSound } = useSoundEffects();

  const handleClick = () => {
    playSound(soundType);
    onClick?.();
  };

  return (
    <button onClick={handleClick} className={className}>
      {children}
    </button>
  );
}

// Demo component to test all sounds
export default function SoundEffectsDemo() {
  const { playSound } = useSoundEffects();
  const { settings } = useSettingsStore();

  const soundTypes: SoundEffectType[] = [
    'keypress',
    'correct',
    'incorrect',
    'success',
    'achievement',
    'levelUp',
    'click',
    'hover',
    'transition',
  ];

  return (
    <div className="bg-white rounded-2xl shadow-xl p-8">
      <h2 className="text-2xl font-bold text-gray-800 mb-6 text-center">
        Sound Effects Demo
      </h2>

      <div className="mb-6 text-center">
        <div className="text-sm text-gray-600 mb-2">
          Sound: {settings.soundEnabled ? 'On' : 'Off'}
        </div>
        <div className="text-sm text-gray-600">
          Volume: {Math.round((settings.soundVolume || 1) * 100)}%
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        {soundTypes.map((type) => (
          <button
            key={type}
            onClick={() => playSound(type)}
            className="px-6 py-4 bg-primary-100 text-primary-900 rounded-lg font-bold hover:bg-primary-200 transition-colors capitalize"
          >
            {type}
          </button>
        ))}
      </div>

      <div className="mt-8 bg-blue-50 rounded-xl p-6">
        <h3 className="text-lg font-bold text-blue-900 mb-3">
          Sound Effect Guide
        </h3>
        <ul className="space-y-2 text-sm text-blue-800">
          <li><strong>Keypress:</strong> Plays on each key typed</li>
          <li><strong>Correct:</strong> Plays when typing correct character</li>
          <li><strong>Incorrect:</strong> Plays when making a mistake</li>
          <li><strong>Success:</strong> Plays on completing a word/sentence</li>
          <li><strong>Achievement:</strong> Plays when unlocking achievements</li>
          <li><strong>Level Up:</strong> Plays when advancing levels</li>
          <li><strong>Click:</strong> Plays on button clicks</li>
          <li><strong>Hover:</strong> Plays on button hover</li>
          <li><strong>Transition:</strong> Plays during screen transitions</li>
        </ul>
      </div>
    </div>
  );
}

// Keyboard sound feedback component
export function KeyboardSoundFeedback({
  onKeyPress,
}: {
  onKeyPress?: (key: string) => void;
}) {
  const { playSound } = useSoundEffects();

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key.length === 1 || event.key === 'Backspace') {
        playSound('keypress');
        onKeyPress?.(event.key);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [playSound, onKeyPress]);

  return (
    <div className="bg-white rounded-xl shadow-lg p-6 text-center">
      <h3 className="text-xl font-bold text-gray-800 mb-4">
        Keyboard Sound Feedback
      </h3>
      <div className="text-gray-600">
        Type on your keyboard to hear sound feedback
      </div>
    </div>
  );
}
