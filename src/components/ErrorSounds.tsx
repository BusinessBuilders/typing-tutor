/**
 * Error Sounds Component
 * Step 193 - Add gentle error sounds for mistakes
 */

import { motion, AnimatePresence } from 'framer-motion';
import { useState } from 'react';
import { useSoundEffects } from './SoundEffects';
import { useSettingsStore } from '../store/useSettingsStore';

// Error severity levels
export type ErrorSeverity = 'gentle' | 'medium' | 'firm';

// Gentle error sound configurations
const ERROR_SOUNDS = {
  gentle: {
    frequency: 200,
    duration: 100,
    volume: 0.15,
    waveType: 'sine' as OscillatorType,
  },
  medium: {
    frequency: 180,
    duration: 150,
    volume: 0.2,
    waveType: 'triangle' as OscillatorType,
  },
  firm: {
    frequency: 150,
    duration: 200,
    volume: 0.25,
    waveType: 'square' as OscillatorType,
  },
};

// Custom hook for error sounds
export function useErrorSounds() {
  const { playSound } = useSoundEffects();
  const { settings } = useSettingsStore();

  const playErrorSound = (severity: ErrorSeverity = 'gentle') => {
    if (!settings.soundEnabled) return;

    const errorConfig = ERROR_SOUNDS[severity];
    playSound('incorrect', errorConfig);
  };

  // Gentle ascending "try again" sound
  const playTryAgainSound = () => {
    if (!settings.soundEnabled) return;

    const notes = [
      { frequency: 220, duration: 80 },
      { frequency: 247, duration: 80 },
      { frequency: 262, duration: 120 },
    ];

    let delay = 0;
    notes.forEach((note) => {
      setTimeout(() => {
        playSound('incorrect', {
          frequency: note.frequency,
          duration: note.duration,
          volume: 0.15,
          waveType: 'sine',
        });
      }, delay);
      delay += note.duration + 10;
    });
  };

  return { playErrorSound, playTryAgainSound };
}

// Demo component
export default function ErrorSounds() {
  const { playErrorSound, playTryAgainSound } = useErrorSounds();
  const { settings } = useSettingsStore();

  const errorTypes: Array<{
    severity: ErrorSeverity;
    label: string;
    description: string;
    color: string;
  }> = [
    {
      severity: 'gentle',
      label: 'Gentle',
      description: 'Soft reminder for minor mistakes',
      color: 'from-yellow-100 to-yellow-200 hover:from-yellow-200 hover:to-yellow-300',
    },
    {
      severity: 'medium',
      label: 'Medium',
      description: 'Moderate feedback for repeated errors',
      color: 'from-orange-100 to-orange-200 hover:from-orange-200 hover:to-orange-300',
    },
    {
      severity: 'firm',
      label: 'Firm',
      description: 'Clear signal for significant mistakes',
      color: 'from-red-100 to-red-200 hover:from-red-200 hover:to-red-300',
    },
  ];

  return (
    <div className="bg-white rounded-2xl shadow-xl p-8">
      <h2 className="text-2xl font-bold text-gray-800 mb-6 text-center">
        Gentle Error Sounds
      </h2>

      <div className="space-y-4 mb-8">
        {errorTypes.map(({ severity, label, description, color }, index) => (
          <motion.button
            key={severity}
            onClick={() => playErrorSound(severity)}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: settings.reducedMotion ? 0 : index * 0.1 }}
            whileHover={{ scale: settings.reducedMotion ? 1 : 1.02 }}
            className={`w-full bg-gradient-to-br ${color} rounded-xl p-6 text-left transition-all shadow-md`}
          >
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-bold text-gray-900 mb-1">
                  {label} Error Sound
                </h3>
                <p className="text-sm text-gray-700">{description}</p>
              </div>
              <div className="text-3xl">🔊</div>
            </div>
          </motion.button>
        ))}
      </div>

      <div className="bg-blue-50 rounded-xl p-6 mb-6">
        <h3 className="text-lg font-bold text-blue-900 mb-3">Try Again Sound</h3>
        <p className="text-sm text-blue-800 mb-4">
          A gentle, encouraging three-note melody that says "it's okay, try again"
        </p>
        <button
          onClick={playTryAgainSound}
          className="w-full py-3 bg-blue-500 text-white rounded-lg font-bold hover:bg-blue-600 transition-colors"
        >
          Play "Try Again" Sound
        </button>
      </div>

      <div className="bg-purple-50 rounded-xl p-6">
        <h3 className="text-lg font-bold text-purple-900 mb-3">
          Design Philosophy
        </h3>
        <ul className="space-y-2 text-sm text-purple-800">
          <li>✓ Gentle tones that don't startle or frustrate</li>
          <li>✓ Lower frequencies for a calmer response</li>
          <li>✓ Shorter durations to minimize disruption</li>
          <li>✓ Encouraging rather than punishing</li>
          <li>✓ Autism-friendly sensory considerations</li>
        </ul>
      </div>
    </div>
  );
}

// Gentle error feedback component
export function GentleErrorFeedback({
  show,
  message = 'Oops! Try again',
  severity = 'gentle',
}: {
  show: boolean;
  message?: string;
  severity?: ErrorSeverity;
}) {
  const { playErrorSound } = useErrorSounds();

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.8 }}
          onAnimationStart={() => playErrorSound(severity)}
          className="inline-flex items-center gap-2 px-4 py-2 bg-yellow-100 text-yellow-900 rounded-full font-medium shadow-md"
        >
          <span className="text-xl">⚠️</span>
          <span>{message}</span>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

// Error shake animation with sound
export function ErrorShake({
  children,
  trigger,
  severity = 'gentle',
}: {
  children: React.ReactNode;
  trigger: boolean;
  severity?: ErrorSeverity;
}) {
  const { playErrorSound } = useErrorSounds();
  const { settings } = useSettingsStore();

  return (
    <motion.div
      animate={
        trigger && !settings.reducedMotion
          ? {
              x: [0, -5, 5, -5, 5, 0],
              transition: { duration: 0.4 },
            }
          : {}
      }
      onAnimationStart={() => {
        if (trigger) playErrorSound(severity);
      }}
    >
      {children}
    </motion.div>
  );
}

// Mistake counter with progressive feedback
export function MistakeCounter() {
  const [mistakes, setMistakes] = useState(0);
  const { playErrorSound } = useErrorSounds();

  const handleMistake = () => {
    const newCount = mistakes + 1;
    setMistakes(newCount);

    // Progressive severity based on consecutive mistakes
    if (newCount >= 5) {
      playErrorSound('firm');
    } else if (newCount >= 3) {
      playErrorSound('medium');
    } else {
      playErrorSound('gentle');
    }
  };

  const reset = () => setMistakes(0);

  return (
    <div className="bg-white rounded-xl shadow-lg p-6">
      <h3 className="text-xl font-bold text-gray-800 mb-4 text-center">
        Mistake Counter Demo
      </h3>

      <div className="text-center mb-6">
        <motion.div
          animate={{ scale: mistakes > 0 ? [1, 1.1, 1] : 1 }}
          className="text-6xl font-bold text-gray-900 mb-2"
        >
          {mistakes}
        </motion.div>
        <div className="text-sm text-gray-600">
          {mistakes === 0 && 'No mistakes yet - great job!'}
          {mistakes >= 1 && mistakes < 3 && 'Just a few mistakes - keep going!'}
          {mistakes >= 3 && mistakes < 5 && 'Take your time!'}
          {mistakes >= 5 && 'Maybe try a break?'}
        </div>
      </div>

      <div className="flex gap-3">
        <button
          onClick={handleMistake}
          className="flex-1 py-3 bg-red-100 text-red-900 rounded-lg font-bold hover:bg-red-200 transition-colors"
        >
          Make Mistake
        </button>
        <button
          onClick={reset}
          className="flex-1 py-3 bg-green-100 text-green-900 rounded-lg font-bold hover:bg-green-200 transition-colors"
        >
          Reset
        </button>
      </div>

      <div className="mt-4 bg-gray-50 rounded-lg p-4">
        <h4 className="text-sm font-bold text-gray-800 mb-2">
          Progressive Feedback:
        </h4>
        <ul className="text-xs text-gray-600 space-y-1">
          <li>• 1-2 mistakes: Gentle sound</li>
          <li>• 3-4 mistakes: Medium sound</li>
          <li>• 5+ mistakes: Firm sound (suggests break)</li>
        </ul>
      </div>
    </div>
  );
}

// Visual error indicator with sound
export function ErrorIndicator({ character }: { character: string }) {
  const { playErrorSound } = useErrorSounds();
  const [show, setShow] = useState(false);

  const handleError = () => {
    setShow(true);
    playErrorSound('gentle');
    setTimeout(() => setShow(false), 1000);
  };

  return (
    <div className="inline-block">
      <AnimatePresence>
        {show && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
            className="absolute -top-8 left-1/2 transform -translate-x-1/2"
          >
            <div className="bg-red-500 text-white px-3 py-1 rounded-full text-sm font-bold shadow-lg">
              Not quite!
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <motion.span
        animate={
          show
            ? {
                color: ['#000', '#ef4444', '#000'],
                backgroundColor: ['transparent', '#fee2e2', 'transparent'],
              }
            : {}
        }
        onClick={handleError}
        className="relative inline-block px-2 py-1 rounded cursor-pointer"
      >
        {character}
      </motion.span>
    </div>
  );
}
