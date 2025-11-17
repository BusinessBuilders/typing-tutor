/**
 * Progressive Hints Component
 * Step 146 - Hints that gradually reveal more information based on user needs
 */

import { motion, AnimatePresence } from 'framer-motion';
import { useState, useEffect } from 'react';
import { useSettingsStore } from '../store/useSettingsStore';

export interface ProgressiveHint {
  id: string;
  levels: Array<{
    level: number;
    message: string;
    icon?: string;
    delay?: number; // Milliseconds before showing this level
  }>;
}

export interface ProgressiveHintsProps {
  hint: ProgressiveHint;
  autoProgress?: boolean;
  manualControl?: boolean;
  onLevelChange?: (level: number) => void;
}

export default function ProgressiveHints({
  hint,
  autoProgress = true,
  manualControl = false,
  onLevelChange,
}: ProgressiveHintsProps) {
  const { settings } = useSettingsStore();
  const [currentLevel, setCurrentLevel] = useState(0);

  useEffect(() => {
    if (!autoProgress || manualControl) return;

    const level = hint.levels[currentLevel];
    if (!level || currentLevel >= hint.levels.length - 1) return;

    const delay = level.delay || 5000;
    const timer = setTimeout(() => {
      const nextLevel = currentLevel + 1;
      setCurrentLevel(nextLevel);
      onLevelChange?.(nextLevel);
    }, delay);

    return () => clearTimeout(timer);
  }, [currentLevel, autoProgress, manualControl, hint.levels, onLevelChange]);

  const handleNext = () => {
    if (currentLevel < hint.levels.length - 1) {
      const nextLevel = currentLevel + 1;
      setCurrentLevel(nextLevel);
      onLevelChange?.(nextLevel);
    }
  };

  const handlePrevious = () => {
    if (currentLevel > 0) {
      const prevLevel = currentLevel - 1;
      setCurrentLevel(prevLevel);
      onLevelChange?.(prevLevel);
    }
  };

  const level = hint.levels[currentLevel];

  return (
    <div className="bg-white rounded-xl shadow-lg p-6">
      <AnimatePresence mode="wait">
        <motion.div
          key={currentLevel}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
          transition={{ duration: settings.reducedMotion ? 0 : 0.3 }}
          className="flex items-start gap-3"
        >
          {/* Icon */}
          {level.icon && <div className="text-3xl flex-shrink-0">{level.icon}</div>}

          {/* Message */}
          <div className="flex-1">
            <div className="text-sm text-gray-600 mb-1">
              Hint Level {currentLevel + 1} of {hint.levels.length}
            </div>
            <div className="text-lg text-gray-900">{level.message}</div>
          </div>
        </motion.div>
      </AnimatePresence>

      {/* Manual controls */}
      {manualControl && (
        <div className="flex justify-between mt-4">
          <button
            onClick={handlePrevious}
            disabled={currentLevel === 0}
            className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg font-medium disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-300 transition-colors"
          >
            ← Previous
          </button>

          <button
            onClick={handleNext}
            disabled={currentLevel >= hint.levels.length - 1}
            className="px-4 py-2 bg-primary-500 text-white rounded-lg font-medium disabled:opacity-50 disabled:cursor-not-allowed hover:bg-primary-600 transition-colors"
          >
            Next →
          </button>
        </div>
      )}

      {/* Progress dots */}
      <div className="flex justify-center gap-2 mt-4">
        {hint.levels.map((_, index) => (
          <div
            key={index}
            className={`w-2 h-2 rounded-full transition-colors ${
              index === currentLevel
                ? 'bg-primary-500'
                : index < currentLevel
                ? 'bg-green-500'
                : 'bg-gray-300'
            }`}
          />
        ))}
      </div>
    </div>
  );
}

// Progressive hints based on time stuck
export function TimeBasedProgressiveHints({
  onHintRequest,
}: {
  onHintRequest?: (level: number) => void;
}) {
  const [timeStuck, setTimeStuck] = useState(0);
  const [hintLevel, setHintLevel] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeStuck((prev) => prev + 1);

      // Escalate hints every 10 seconds
      if (timeStuck > 0 && timeStuck % 10 === 0) {
        const newLevel = Math.min(hintLevel + 1, 3);
        setHintLevel(newLevel);
        onHintRequest?.(newLevel);
      }
    }, 1000);

    return () => clearInterval(timer);
  }, [timeStuck, hintLevel, onHintRequest]);

  const hints = [
    { icon: '💡', message: 'Take your time and think about it' },
    { icon: '🤔', message: 'Look at the keyboard for guidance' },
    { icon: '👉', message: 'Try using your index finger for this key' },
    { icon: '🎯', message: 'The key is in the middle row, fourth from the left' },
  ];

  const currentHint = hints[Math.min(hintLevel, hints.length - 1)];

  return (
    <AnimatePresence>
      {hintLevel > 0 && (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          className="bg-blue-50 border-2 border-blue-200 rounded-xl p-4"
        >
          <div className="flex items-center gap-3">
            <span className="text-3xl">{currentHint.icon}</span>
            <span className="text-blue-900 font-medium">{currentHint.message}</span>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

// Progressive hint sequence for learning
export function LearningProgressiveHints({
  concept,
  onComplete,
}: {
  concept: string;
  onComplete?: () => void;
}) {
  const { settings } = useSettingsStore();
  const [step, setStep] = useState(0);

  const sequences: Record<string, ProgressiveHint> = {
    homeRow: {
      id: 'home-row-learning',
      levels: [
        {
          level: 0,
          message: 'Welcome! Let\'s learn about the home row.',
          icon: '👋',
        },
        {
          level: 1,
          message: 'The home row is where your fingers rest when not typing.',
          icon: '📍',
        },
        {
          level: 2,
          message: 'For left hand: A, S, D, F. For right hand: J, K, L, ;',
          icon: '✋',
        },
        {
          level: 3,
          message: 'Feel the bumps on F and J? They help you find home without looking!',
          icon: '🔍',
        },
        {
          level: 4,
          message: 'Now try placing your fingers on these keys.',
          icon: '🎯',
        },
      ],
    },
    typing: {
      id: 'typing-basics',
      levels: [
        {
          level: 0,
          message: 'Let\'s learn the basics of typing!',
          icon: '📝',
        },
        {
          level: 1,
          message: 'Always start with your fingers on the home row.',
          icon: '🏠',
        },
        {
          level: 2,
          message: 'Reach for other keys with the correct finger, then return to home.',
          icon: '↕️',
        },
        {
          level: 3,
          message: 'Keep your wrists straight and your hands relaxed.',
          icon: '🤲',
        },
        {
          level: 4,
          message: 'Practice makes perfect! Let\'s try some exercises.',
          icon: '💪',
        },
      ],
    },
  };

  const sequence = sequences[concept];

  if (!sequence) return null;

  const handleNext = () => {
    if (step < sequence.levels.length - 1) {
      setStep(step + 1);
    } else {
      onComplete?.();
    }
  };

  const currentLevel = sequence.levels[step];

  return (
    <div className="bg-white rounded-2xl shadow-xl p-8">
      <h2 className="text-2xl font-bold text-gray-800 mb-6 text-center">
        Learning Guide
      </h2>

      <AnimatePresence mode="wait">
        <motion.div
          key={step}
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          transition={{ duration: settings.reducedMotion ? 0 : 0.3 }}
          className="bg-gradient-to-br from-blue-50 to-purple-50 rounded-xl p-8 mb-6 min-h-[200px] flex flex-col items-center justify-center"
        >
          <div className="text-6xl mb-4">{currentLevel.icon}</div>
          <p className="text-xl text-gray-900 text-center max-w-md">
            {currentLevel.message}
          </p>
        </motion.div>
      </AnimatePresence>

      {/* Progress */}
      <div className="mb-6">
        <div className="flex justify-between text-sm text-gray-600 mb-2">
          <span>Progress</span>
          <span>
            {step + 1} / {sequence.levels.length}
          </span>
        </div>
        <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
          <motion.div
            animate={{ width: `${((step + 1) / sequence.levels.length) * 100}%` }}
            className="h-full bg-primary-500"
          />
        </div>
      </div>

      {/* Continue button */}
      <div className="flex justify-center">
        <button
          onClick={handleNext}
          className="px-8 py-4 bg-primary-500 text-white rounded-lg font-bold text-lg hover:bg-primary-600 transition-colors"
        >
          {step < sequence.levels.length - 1 ? 'Continue' : 'Start Practice'}
        </button>
      </div>
    </div>
  );
}

// Adaptive hints based on user performance
export function AdaptiveProgressiveHints({
  accuracy,
  attempts,
}: {
  accuracy: number;
  attempts: number;
}) {
  const [hintLevel, setHintLevel] = useState(0);

  useEffect(() => {
    // Determine hint level based on performance
    if (attempts < 3) {
      setHintLevel(0); // No hints yet
    } else if (accuracy < 50 && attempts >= 5) {
      setHintLevel(3); // Detailed hints
    } else if (accuracy < 70 && attempts >= 4) {
      setHintLevel(2); // Moderate hints
    } else if (accuracy < 85 && attempts >= 3) {
      setHintLevel(1); // Gentle hints
    }
  }, [accuracy, attempts]);

  const hints = [
    null, // No hint
    {
      icon: '💭',
      message: 'You\'re doing well! Just focus on accuracy.',
      color: 'bg-blue-50 border-blue-200',
    },
    {
      icon: '🎯',
      message: 'Slow down a bit and look at the keys if needed.',
      color: 'bg-yellow-50 border-yellow-200',
    },
    {
      icon: '🔍',
      message: 'Let\'s try a different approach. Watch the demonstration first.',
      color: 'bg-orange-50 border-orange-200',
    },
  ];

  const currentHint = hints[hintLevel];

  return (
    <AnimatePresence>
      {currentHint && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          exit={{ opacity: 0, height: 0 }}
          className={`${currentHint.color} border-2 rounded-xl p-4`}
        >
          <div className="flex items-center gap-3">
            <span className="text-3xl">{currentHint.icon}</span>
            <div>
              <div className="font-bold text-gray-900 mb-1">
                Hint Level {hintLevel}
              </div>
              <div className="text-gray-800">{currentHint.message}</div>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

// Hint request button with progressive disclosure
export function HintRequestButton({
  onHintRequest,
}: {
  onHintRequest?: (level: number) => void;
}) {
  const { settings } = useSettingsStore();
  const [requestCount, setRequestCount] = useState(0);

  const handleRequest = () => {
    const newCount = requestCount + 1;
    setRequestCount(newCount);
    onHintRequest?.(newCount);
  };

  const buttonLabels = [
    { text: 'Need a hint?', icon: '💡' },
    { text: 'Need more help?', icon: '🤔' },
    { text: 'Show me how', icon: '👀' },
    { text: 'I need detailed help', icon: '🆘' },
  ];

  const currentLabel = buttonLabels[Math.min(requestCount, buttonLabels.length - 1)];

  return (
    <motion.button
      onClick={handleRequest}
      whileHover={{ scale: settings.reducedMotion ? 1 : 1.05 }}
      whileTap={{ scale: settings.reducedMotion ? 1 : 0.95 }}
      className={`px-6 py-3 rounded-lg font-bold flex items-center gap-2 transition-colors ${
        requestCount === 0
          ? 'bg-blue-100 text-blue-900'
          : requestCount === 1
          ? 'bg-yellow-100 text-yellow-900'
          : requestCount === 2
          ? 'bg-orange-100 text-orange-900'
          : 'bg-red-100 text-red-900'
      }`}
    >
      <span className="text-2xl">{currentLabel.icon}</span>
      <span>{currentLabel.text}</span>
    </motion.button>
  );
}

// Multi-step hint carousel
export function HintCarousel({
  hints,
  autoAdvance = true,
  interval = 5000,
}: {
  hints: Array<{ icon: string; message: string }>;
  autoAdvance?: boolean;
  interval?: number;
}) {
  const { settings } = useSettingsStore();
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    if (!autoAdvance) return;

    const timer = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % hints.length);
    }, interval);

    return () => clearInterval(timer);
  }, [autoAdvance, interval, hints.length]);

  const handlePrevious = () => {
    setCurrentIndex((prev) => (prev - 1 + hints.length) % hints.length);
  };

  const handleNext = () => {
    setCurrentIndex((prev) => (prev + 1) % hints.length);
  };

  const currentHint = hints[currentIndex];

  return (
    <div className="bg-white rounded-xl shadow-lg p-6">
      <AnimatePresence mode="wait">
        <motion.div
          key={currentIndex}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          transition={{ duration: settings.reducedMotion ? 0 : 0.3 }}
          className="text-center py-8"
        >
          <div className="text-5xl mb-4">{currentHint.icon}</div>
          <p className="text-lg text-gray-900">{currentHint.message}</p>
        </motion.div>
      </AnimatePresence>

      {/* Navigation */}
      <div className="flex justify-between items-center mt-6">
        <button
          onClick={handlePrevious}
          className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
        >
          ←
        </button>

        <div className="flex gap-2">
          {hints.map((_, index) => (
            <div
              key={index}
              className={`w-2 h-2 rounded-full ${
                index === currentIndex ? 'bg-primary-500' : 'bg-gray-300'
              }`}
            />
          ))}
        </div>

        <button
          onClick={handleNext}
          className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
        >
          →
        </button>
      </div>
    </div>
  );
}

// Pre-defined progressive hint sequences
export const PROGRESSIVE_HINT_SEQUENCES: Record<string, ProgressiveHint> = {
  firstLesson: {
    id: 'first-lesson',
    levels: [
      {
        level: 0,
        message: 'Welcome to your first typing lesson!',
        icon: '🎉',
        delay: 0,
      },
      {
        level: 1,
        message: 'Let\'s start by finding the home row keys.',
        icon: '🔍',
        delay: 3000,
      },
      {
        level: 2,
        message: 'Place your fingers on A S D F (left) and J K L ; (right).',
        icon: '✋',
        delay: 5000,
      },
      {
        level: 3,
        message: 'Feel the small bumps on F and J? They\'re your guides!',
        icon: '👆',
        delay: 5000,
      },
    ],
  },
  struggling: {
    id: 'struggling',
    levels: [
      {
        level: 0,
        message: 'Having trouble? Let\'s take it step by step.',
        icon: '🤝',
      },
      {
        level: 1,
        message: 'First, make sure your fingers are on the home row.',
        icon: '🏠',
      },
      {
        level: 2,
        message: 'Look at which key lights up next.',
        icon: '💡',
      },
      {
        level: 3,
        message: 'Use the correct finger shown by the color.',
        icon: '🎨',
      },
      {
        level: 4,
        message: 'Take your time - accuracy is more important than speed!',
        icon: '🎯',
      },
    ],
  },
};
