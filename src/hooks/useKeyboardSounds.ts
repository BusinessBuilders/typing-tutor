/**
 * Keyboard Sound Effects Hook
 * Step 118 - Audio feedback for typing interactions
 */

import { useCallback, useEffect, useRef } from 'react';
import { useSettingsStore } from '../store/useSettingsStore';

export type SoundType =
  | 'keyPress'
  | 'correct'
  | 'incorrect'
  | 'complete'
  | 'combo'
  | 'space'
  | 'backspace'
  | 'enter';

export interface SoundConfig {
  type: SoundType;
  volume: number;
  frequency?: number;
  duration?: number;
  waveType?: OscillatorType;
}

// Pre-defined sound configurations
const soundConfigs: Record<SoundType, SoundConfig> = {
  keyPress: {
    type: 'keyPress',
    volume: 0.3,
    frequency: 440,
    duration: 50,
    waveType: 'sine',
  },
  correct: {
    type: 'correct',
    volume: 0.4,
    frequency: 523.25, // C5
    duration: 100,
    waveType: 'sine',
  },
  incorrect: {
    type: 'incorrect',
    volume: 0.3,
    frequency: 196, // G3 (lower, gentle)
    duration: 150,
    waveType: 'triangle',
  },
  complete: {
    type: 'complete',
    volume: 0.5,
    frequency: 659.25, // E5
    duration: 300,
    waveType: 'sine',
  },
  combo: {
    type: 'combo',
    volume: 0.4,
    frequency: 783.99, // G5
    duration: 100,
    waveType: 'square',
  },
  space: {
    type: 'space',
    volume: 0.2,
    frequency: 330,
    duration: 40,
    waveType: 'sine',
  },
  backspace: {
    type: 'backspace',
    volume: 0.2,
    frequency: 220,
    duration: 60,
    waveType: 'triangle',
  },
  enter: {
    type: 'enter',
    volume: 0.4,
    frequency: 493.88, // B4
    duration: 120,
    waveType: 'sine',
  },
};

export function useKeyboardSounds() {
  const { settings } = useSettingsStore();
  const audioContextRef = useRef<AudioContext | null>(null);

  // Initialize audio context
  useEffect(() => {
    if (settings.soundEffects && !audioContextRef.current) {
      audioContextRef.current = new (window.AudioContext ||
        (window as any).webkitAudioContext)();
    }

    return () => {
      audioContextRef.current?.close();
      audioContextRef.current = null;
    };
  }, [settings.soundEffects]);

  // Play sound using Web Audio API
  const playSound = useCallback(
    (soundType: SoundType, customConfig?: Partial<SoundConfig>) => {
      if (!settings.soundEffects || !audioContextRef.current) return;

      const config = { ...soundConfigs[soundType], ...customConfig };
      const ctx = audioContextRef.current;

      try {
        // Create oscillator
        const oscillator = ctx.createOscillator();
        const gainNode = ctx.createGain();

        oscillator.type = config.waveType || 'sine';
        oscillator.frequency.value = config.frequency || 440;

        // Apply volume from settings
        const volume = config.volume * (settings.volume / 100);
        gainNode.gain.setValueAtTime(volume, ctx.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(
          0.01,
          ctx.currentTime + (config.duration || 100) / 1000
        );

        oscillator.connect(gainNode);
        gainNode.connect(ctx.destination);

        oscillator.start(ctx.currentTime);
        oscillator.stop(ctx.currentTime + (config.duration || 100) / 1000);
      } catch (error) {
        console.error('Error playing sound:', error);
      }
    },
    [settings.soundEffects, settings.volume]
  );

  // Play melody (sequence of notes)
  const playMelody = useCallback(
    (notes: Array<{ frequency: number; duration: number; delay?: number }>) => {
      if (!settings.soundEffects || !audioContextRef.current) return;

      const ctx = audioContextRef.current;
      let currentTime = ctx.currentTime;

      notes.forEach((note) => {
        const startTime = currentTime + (note.delay || 0) / 1000;
        const oscillator = ctx.createOscillator();
        const gainNode = ctx.createGain();

        oscillator.type = 'sine';
        oscillator.frequency.value = note.frequency;

        const volume = 0.3 * (settings.volume / 100);
        gainNode.gain.setValueAtTime(volume, startTime);
        gainNode.gain.exponentialRampToValueAtTime(
          0.01,
          startTime + note.duration / 1000
        );

        oscillator.connect(gainNode);
        gainNode.connect(ctx.destination);

        oscillator.start(startTime);
        oscillator.stop(startTime + note.duration / 1000);

        currentTime = startTime + note.duration / 1000;
      });
    },
    [settings.soundEffects, settings.volume]
  );

  // Pre-defined melodies
  const playSuccessMelody = useCallback(() => {
    playMelody([
      { frequency: 523.25, duration: 100 }, // C5
      { frequency: 659.25, duration: 100, delay: 50 }, // E5
      { frequency: 783.99, duration: 200, delay: 50 }, // G5
    ]);
  }, [playMelody]);

  const playLevelUpMelody = useCallback(() => {
    playMelody([
      { frequency: 523.25, duration: 100 }, // C5
      { frequency: 587.33, duration: 100, delay: 50 }, // D5
      { frequency: 659.25, duration: 100, delay: 50 }, // E5
      { frequency: 783.99, duration: 100, delay: 50 }, // G5
      { frequency: 1046.5, duration: 300, delay: 50 }, // C6
    ]);
  }, [playMelody]);

  const playErrorMelody = useCallback(() => {
    playMelody([
      { frequency: 293.66, duration: 150 }, // D4
      { frequency: 246.94, duration: 200, delay: 50 }, // B3
    ]);
  }, [playMelody]);

  // Typing rhythm sound (adjusts to WPM)
  const playTypingRhythm = useCallback(
    (wpm: number) => {
      if (!settings.soundEffects) return;

      // Higher WPM = higher pitch
      const frequency = 400 + (wpm * 2);
      const duration = Math.max(30, 100 - wpm / 2);

      playSound('keyPress', { frequency, duration });
    },
    [playSound, settings.soundEffects]
  );

  return {
    playSound,
    playMelody,
    playSuccessMelody,
    playLevelUpMelody,
    playErrorMelody,
    playTypingRhythm,
  };
}

// Hook for haptic feedback (mobile devices)
export function useHapticFeedback() {
  const { settings } = useSettingsStore();

  const vibrate = useCallback(
    (pattern: number | number[]) => {
      if (!settings.hapticFeedback || !navigator.vibrate) return;

      try {
        navigator.vibrate(pattern);
      } catch (error) {
        console.error('Vibration not supported:', error);
      }
    },
    [settings.hapticFeedback]
  );

  const vibrateKeyPress = useCallback(() => {
    vibrate(10);
  }, [vibrate]);

  const vibrateCorrect = useCallback(() => {
    vibrate([20, 50, 20]);
  }, [vibrate]);

  const vibrateIncorrect = useCallback(() => {
    vibrate([50, 100, 50]);
  }, [vibrate]);

  const vibrateSuccess = useCallback(() => {
    vibrate([30, 50, 30, 50, 60]);
  }, [vibrate]);

  return {
    vibrate,
    vibrateKeyPress,
    vibrateCorrect,
    vibrateIncorrect,
    vibrateSuccess,
  };
}

// Combined audio + haptic feedback hook
export function useKeyboardFeedback() {
  const sounds = useKeyboardSounds();
  const haptics = useHapticFeedback();
  const { settings } = useSettingsStore();

  const feedbackKeyPress = useCallback(
    (key: string) => {
      if (key === ' ') {
        sounds.playSound('space');
      } else if (key === 'Backspace') {
        sounds.playSound('backspace');
      } else if (key === 'Enter') {
        sounds.playSound('enter');
      } else {
        sounds.playSound('keyPress');
      }

      if (settings.hapticFeedback) {
        haptics.vibrateKeyPress();
      }
    },
    [sounds, haptics, settings.hapticFeedback]
  );

  const feedbackCorrect = useCallback(() => {
    sounds.playSound('correct');
    if (settings.hapticFeedback) {
      haptics.vibrateCorrect();
    }
  }, [sounds, haptics, settings.hapticFeedback]);

  const feedbackIncorrect = useCallback(() => {
    sounds.playSound('incorrect');
    if (settings.hapticFeedback) {
      haptics.vibrateIncorrect();
    }
  }, [sounds, haptics, settings.hapticFeedback]);

  const feedbackCombo = useCallback(
    (comboCount: number) => {
      // Pitch increases with combo
      const frequency = 500 + comboCount * 50;
      sounds.playSound('combo', { frequency });
      if (settings.hapticFeedback) {
        haptics.vibrate(20);
      }
    },
    [sounds, haptics, settings.hapticFeedback]
  );

  const feedbackComplete = useCallback(() => {
    sounds.playSuccessMelody();
    if (settings.hapticFeedback) {
      haptics.vibrateSuccess();
    }
  }, [sounds, haptics, settings.hapticFeedback]);

  const feedbackLevelUp = useCallback(() => {
    sounds.playLevelUpMelody();
    if (settings.hapticFeedback) {
      haptics.vibrateSuccess();
    }
  }, [sounds, haptics, settings.hapticFeedback]);

  return {
    feedbackKeyPress,
    feedbackCorrect,
    feedbackIncorrect,
    feedbackCombo,
    feedbackComplete,
    feedbackLevelUp,
  };
}

// Note: SoundControls component moved to src/components/SoundControls.tsx
