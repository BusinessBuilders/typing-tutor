/**
 * Hint System Component
 * Step 141 - Context-sensitive hints and guidance for typing practice
 */

import { motion, AnimatePresence } from 'framer-motion';
import { useState, useEffect } from 'react';
import { useSettingsStore } from '../store/useSettingsStore';

export interface Hint {
  id: string;
  type: 'tip' | 'instruction' | 'warning' | 'success' | 'info';
  title: string;
  message: string;
  icon?: string;
  duration?: number; // Auto-dismiss after milliseconds
  dismissible?: boolean;
}

export interface HintSystemProps {
  hints: Hint[];
  position?: 'top' | 'bottom' | 'left' | 'right' | 'center';
  maxVisible?: number;
  onDismiss?: (hintId: string) => void;
}

export default function HintSystem({
  hints,
  position = 'top',
  maxVisible = 3,
  onDismiss,
}: HintSystemProps) {
  const { settings } = useSettingsStore();
  const [visibleHints, setVisibleHints] = useState<Hint[]>([]);

  useEffect(() => {
    setVisibleHints(hints.slice(0, maxVisible));
  }, [hints, maxVisible]);

  const handleDismiss = (hintId: string) => {
    setVisibleHints((prev) => prev.filter((h) => h.id !== hintId));
    onDismiss?.(hintId);
  };

  const positionClasses = {
    top: 'top-4 left-1/2 -translate-x-1/2',
    bottom: 'bottom-4 left-1/2 -translate-x-1/2',
    left: 'left-4 top-1/2 -translate-y-1/2',
    right: 'right-4 top-1/2 -translate-y-1/2',
    center: 'top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2',
  };

  const typeStyles = {
    tip: {
      bg: 'bg-blue-50',
      border: 'border-blue-200',
      text: 'text-blue-900',
      icon: '💡',
    },
    instruction: {
      bg: 'bg-purple-50',
      border: 'border-purple-200',
      text: 'text-purple-900',
      icon: '📝',
    },
    warning: {
      bg: 'bg-yellow-50',
      border: 'border-yellow-200',
      text: 'text-yellow-900',
      icon: '⚠️',
    },
    success: {
      bg: 'bg-green-50',
      border: 'border-green-200',
      text: 'text-green-900',
      icon: '✅',
    },
    info: {
      bg: 'bg-gray-50',
      border: 'border-gray-200',
      text: 'text-gray-900',
      icon: 'ℹ️',
    },
  };

  return (
    <div className={`fixed ${positionClasses[position]} z-50 pointer-events-none`}>
      <div className="flex flex-col gap-3 pointer-events-auto">
        <AnimatePresence>
          {visibleHints.map((hint, index) => {
            const style = typeStyles[hint.type];

            return (
              <motion.div
                key={hint.id}
                initial={{ opacity: 0, y: position === 'top' ? -20 : 20, scale: 0.9 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                transition={{
                  duration: settings.reducedMotion ? 0 : 0.3,
                  delay: settings.reducedMotion ? 0 : index * 0.05,
                }}
                className={`max-w-md ${style.bg} ${style.border} border-2 rounded-xl shadow-lg p-4`}
              >
                <div className="flex items-start gap-3">
                  {/* Icon */}
                  <div className="text-2xl flex-shrink-0">
                    {hint.icon || style.icon}
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <h3 className={`font-bold ${style.text} mb-1`}>{hint.title}</h3>
                    <p className={`text-sm ${style.text}`}>{hint.message}</p>
                  </div>

                  {/* Dismiss button */}
                  {hint.dismissible !== false && (
                    <button
                      onClick={() => handleDismiss(hint.id)}
                      className={`flex-shrink-0 w-6 h-6 rounded-full ${style.text} hover:bg-black hover:bg-opacity-10 transition-colors`}
                    >
                      ✕
                    </button>
                  )}
                </div>

                {/* Auto-dismiss timer */}
                {hint.duration && (
                  <AutoDismissTimer
                    duration={hint.duration}
                    onComplete={() => handleDismiss(hint.id)}
                  />
                )}
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>
    </div>
  );
}

// Auto-dismiss timer component
function AutoDismissTimer({
  duration,
  onComplete,
}: {
  duration: number;
  onComplete: () => void;
}) {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const interval = 50; // Update every 50ms
    const steps = duration / interval;
    let currentStep = 0;

    const timer = setInterval(() => {
      currentStep++;
      setProgress((currentStep / steps) * 100);

      if (currentStep >= steps) {
        clearInterval(timer);
        onComplete();
      }
    }, interval);

    return () => clearInterval(timer);
  }, [duration, onComplete]);

  return (
    <div className="mt-2 h-1 bg-black bg-opacity-10 rounded-full overflow-hidden">
      <motion.div
        className="h-full bg-black bg-opacity-20"
        initial={{ width: 0 }}
        animate={{ width: `${progress}%` }}
      />
    </div>
  );
}

// Context-aware hint manager
export function ContextualHints({
  context,
  showHints = true,
}: {
  context: 'typing' | 'menu' | 'settings' | 'results';
  showHints?: boolean;
}) {
  const [currentHints, setCurrentHints] = useState<Hint[]>([]);

  useEffect(() => {
    if (!showHints) {
      setCurrentHints([]);
      return;
    }

    const hints: Record<typeof context, Hint[]> = {
      typing: [
        {
          id: 'typing-posture',
          type: 'tip',
          title: 'Good Posture',
          message: 'Keep your back straight and feet flat on the floor',
          duration: 5000,
        },
        {
          id: 'typing-fingers',
          type: 'instruction',
          title: 'Use All Fingers',
          message: 'Try to use the correct finger for each key',
        },
      ],
      menu: [
        {
          id: 'menu-navigate',
          type: 'info',
          title: 'Getting Started',
          message: 'Choose a lesson to begin practicing',
        },
      ],
      settings: [
        {
          id: 'settings-save',
          type: 'tip',
          title: 'Auto-Save',
          message: 'Your settings are automatically saved',
          duration: 3000,
        },
      ],
      results: [
        {
          id: 'results-improvement',
          type: 'success',
          title: 'Great Progress!',
          message: 'Keep practicing to improve your speed and accuracy',
          duration: 5000,
        },
      ],
    };

    setCurrentHints(hints[context] || []);
  }, [context, showHints]);

  return <HintSystem hints={currentHints} position="top" />;
}

// Adaptive hint system based on performance
export function AdaptiveHints({
  accuracy,
  wpm,
  errors,
}: {
  accuracy: number;
  wpm: number;
  errors: number;
}) {
  const [hints, setHints] = useState<Hint[]>([]);

  useEffect(() => {
    const newHints: Hint[] = [];

    // Accuracy-based hints
    if (accuracy < 80) {
      newHints.push({
        id: 'hint-accuracy-low',
        type: 'warning',
        title: 'Focus on Accuracy',
        message: 'Slow down and focus on typing correctly. Speed will come with practice.',
        dismissible: true,
      });
    } else if (accuracy >= 95) {
      newHints.push({
        id: 'hint-accuracy-high',
        type: 'success',
        title: 'Excellent Accuracy!',
        message: 'You can try increasing your speed now',
        duration: 4000,
      });
    }

    // Speed-based hints
    if (wpm < 20 && accuracy > 90) {
      newHints.push({
        id: 'hint-speed-increase',
        type: 'tip',
        title: 'Ready for More Speed?',
        message: 'Your accuracy is great! Try typing a bit faster.',
        dismissible: true,
      });
    }

    // Error-based hints
    if (errors > 10) {
      newHints.push({
        id: 'hint-errors-many',
        type: 'instruction',
        title: 'Take Your Time',
        message: 'Look at the keyboard if needed. Accuracy is more important than speed.',
        dismissible: true,
      });
    }

    setHints(newHints);
  }, [accuracy, wpm, errors]);

  return <HintSystem hints={hints} position="top" maxVisible={2} />;
}

// Quick hint tooltip
export function QuickHint({
  message,
  show = true,
  position = 'top',
}: {
  message: string;
  show?: boolean;
  position?: 'top' | 'bottom' | 'left' | 'right';
}) {
  const { settings } = useSettingsStore();

  const positionClasses = {
    top: 'bottom-full mb-2 left-1/2 -translate-x-1/2',
    bottom: 'top-full mt-2 left-1/2 -translate-x-1/2',
    left: 'right-full mr-2 top-1/2 -translate-y-1/2',
    right: 'left-full ml-2 top-1/2 -translate-y-1/2',
  };

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.9 }}
          transition={{ duration: settings.reducedMotion ? 0 : 0.2 }}
          className={`absolute ${positionClasses[position]} z-50 pointer-events-none`}
        >
          <div className="bg-gray-900 text-white text-sm px-3 py-2 rounded-lg shadow-lg max-w-xs">
            {message}
            {/* Arrow */}
            <div
              className={`absolute w-2 h-2 bg-gray-900 transform rotate-45 ${
                position === 'top'
                  ? 'top-full -mt-1 left-1/2 -translate-x-1/2'
                  : position === 'bottom'
                  ? 'bottom-full -mb-1 left-1/2 -translate-x-1/2'
                  : position === 'left'
                  ? 'left-full -ml-1 top-1/2 -translate-y-1/2'
                  : 'right-full -mr-1 top-1/2 -translate-y-1/2'
              }`}
            />
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

// Hint badge for UI elements
export function HintBadge({
  count,
  pulse = false,
}: {
  count?: number;
  pulse?: boolean;
}) {
  return (
    <motion.div
      animate={pulse ? { scale: [1, 1.2, 1] } : {}}
      transition={{ duration: 1, repeat: Infinity }}
      className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-xs font-bold rounded-full flex items-center justify-center"
    >
      {count || '!'}
    </motion.div>
  );
}

// Progressive hint disclosure
export function ProgressiveHintDisclosure({
  hints,
  interval = 5000,
}: {
  hints: Hint[];
  interval?: number;
}) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [displayedHints, setDisplayedHints] = useState<Hint[]>([]);

  useEffect(() => {
    if (currentIndex >= hints.length) return;

    const timer = setTimeout(() => {
      setDisplayedHints((prev) => [...prev, hints[currentIndex]]);
      setCurrentIndex((prev) => prev + 1);
    }, interval);

    return () => clearTimeout(timer);
  }, [currentIndex, hints, interval]);

  return <HintSystem hints={displayedHints} position="bottom" />;
}

// Hint library for common scenarios
export const HINT_LIBRARY = {
  firstTime: {
    id: 'first-time',
    type: 'info' as const,
    title: 'Welcome!',
    message: 'Let\'s start with the basics. Place your fingers on the home row keys.',
    icon: '👋',
  },
  slowDown: {
    id: 'slow-down',
    type: 'tip' as const,
    title: 'Slow Down',
    message: 'Take your time. Accuracy is more important than speed at first.',
  },
  goodProgress: {
    id: 'good-progress',
    type: 'success' as const,
    title: 'Great Job!',
    message: 'You\'re making excellent progress. Keep it up!',
    duration: 3000,
  },
  takeBreak: {
    id: 'take-break',
    type: 'warning' as const,
    title: 'Take a Break',
    message: 'You\'ve been practicing for a while. Rest your hands and eyes.',
  },
  homeRow: {
    id: 'home-row',
    type: 'instruction' as const,
    title: 'Home Row Position',
    message: 'Place your fingers on A S D F for left hand, J K L ; for right hand.',
  },
  lookAhead: {
    id: 'look-ahead',
    type: 'tip' as const,
    title: 'Look Ahead',
    message: 'Try to look at the next few letters while typing the current one.',
  },
  rhythm: {
    id: 'rhythm',
    type: 'tip' as const,
    title: 'Find Your Rhythm',
    message: 'Type at a steady, consistent pace. Don\'t rush!',
  },
};
