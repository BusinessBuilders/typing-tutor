/**
 * Typing Feedback Indicators Component
 * Step 114 - Visual and audio feedback for typing practice
 */

import { motion, AnimatePresence } from 'framer-motion';
import { useEffect, useState } from 'react';
import { useSettingsStore } from '../store/useSettingsStore';

export interface FeedbackProps {
  type: 'correct' | 'incorrect' | 'combo' | 'perfect' | 'warning';
  message?: string;
  position?: 'top' | 'center' | 'bottom' | 'inline';
  duration?: number;
  onComplete?: () => void;
}

export default function TypingFeedback({
  type,
  message,
  position = 'center',
  duration = 2000,
  onComplete,
}: FeedbackProps) {
  const { settings } = useSettingsStore();
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(false);
      onComplete?.();
    }, duration);

    return () => clearTimeout(timer);
  }, [duration, onComplete]);

  const positionClasses = {
    top: 'top-8 left-1/2 -translate-x-1/2',
    center: 'top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2',
    bottom: 'bottom-8 left-1/2 -translate-x-1/2',
    inline: 'relative',
  };

  const feedbackStyles = {
    correct: {
      icon: '✓',
      color: 'bg-success-500 text-white',
      emoji: '🎉',
    },
    incorrect: {
      icon: '✗',
      color: 'bg-red-500 text-white',
      emoji: '💭',
    },
    combo: {
      icon: '🔥',
      color: 'bg-orange-500 text-white',
      emoji: '🔥',
    },
    perfect: {
      icon: '⭐',
      color: 'bg-yellow-500 text-white',
      emoji: '⭐',
    },
    warning: {
      icon: '⚠',
      color: 'bg-amber-500 text-white',
      emoji: '💡',
    },
  };

  const style = feedbackStyles[type];

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0, scale: 0.5, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.5, y: -20 }}
          className={`
            ${position === 'inline' ? '' : 'fixed'}
            ${positionClasses[position]}
            ${style.color}
            px-6 py-3 rounded-full shadow-lg z-50
            flex items-center space-x-2
            font-bold text-lg
          `}
        >
          <motion.span
            animate={
              settings.reducedMotion
                ? {}
                : {
                    rotate: [0, -10, 10, -10, 10, 0],
                    scale: [1, 1.2, 1],
                  }
            }
            transition={{ duration: 0.5 }}
            className="text-2xl"
          >
            {style.emoji}
          </motion.span>
          {message && <span>{message}</span>}
        </motion.div>
      )}
    </AnimatePresence>
  );
}

// Accuracy meter
export function AccuracyMeter({ accuracy }: { accuracy: number }) {
  const getColor = () => {
    if (accuracy >= 95) return 'from-success-400 to-success-600';
    if (accuracy >= 85) return 'from-yellow-400 to-yellow-600';
    if (accuracy >= 70) return 'from-orange-400 to-orange-600';
    return 'from-red-400 to-red-600';
  };

  const getEmoji = () => {
    if (accuracy >= 95) return '🎯';
    if (accuracy >= 85) return '👍';
    if (accuracy >= 70) return '🤔';
    return '💪';
  };

  return (
    <div className="bg-white rounded-xl shadow-lg p-4">
      <div className="flex items-center justify-between mb-2">
        <span className="text-sm font-medium text-gray-600">Accuracy</span>
        <span className="text-2xl">{getEmoji()}</span>
      </div>

      <div className="relative h-6 bg-gray-200 rounded-full overflow-hidden">
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${accuracy}%` }}
          transition={{ duration: 0.5, ease: 'easeOut' }}
          className={`h-full bg-gradient-to-r ${getColor()} rounded-full`}
        />
      </div>

      <div className="text-center mt-2">
        <span className="text-2xl font-bold text-gray-800">{accuracy.toFixed(1)}%</span>
      </div>
    </div>
  );
}

// WPM speedometer
export function WPMIndicator({ wpm, target = 40 }: { wpm: number; target?: number }) {
  const percentage = Math.min((wpm / target) * 100, 100);
  const { settings } = useSettingsStore();

  const getSpeedLevel = () => {
    if (wpm >= target) return { label: 'Fast!', color: 'text-success-600', emoji: '🚀' };
    if (wpm >= target * 0.75) return { label: 'Good', color: 'text-blue-600', emoji: '⚡' };
    if (wpm >= target * 0.5) return { label: 'Keep Going', color: 'text-yellow-600', emoji: '🐢' };
    return { label: 'Slow', color: 'text-gray-600', emoji: '🐌' };
  };

  const level = getSpeedLevel();

  return (
    <div className="bg-white rounded-xl shadow-lg p-4">
      <div className="flex items-center justify-between mb-2">
        <span className="text-sm font-medium text-gray-600">Speed</span>
        <motion.span
          animate={
            settings.reducedMotion
              ? {}
              : {
                  scale: wpm > 0 ? [1, 1.2, 1] : 1,
                }
          }
          transition={{ duration: 1, repeat: Infinity }}
          className="text-2xl"
        >
          {level.emoji}
        </motion.span>
      </div>

      <div className="relative">
        {/* Speedometer arc */}
        <svg viewBox="0 0 100 60" className="w-full">
          {/* Background arc */}
          <path
            d="M 10 50 A 40 40 0 0 1 90 50"
            fill="none"
            stroke="#e5e7eb"
            strokeWidth="8"
            strokeLinecap="round"
          />
          {/* Progress arc */}
          <motion.path
            d="M 10 50 A 40 40 0 0 1 90 50"
            fill="none"
            stroke="url(#gradient)"
            strokeWidth="8"
            strokeLinecap="round"
            initial={{ pathLength: 0 }}
            animate={{ pathLength: percentage / 100 }}
            transition={{ duration: 0.5 }}
            strokeDasharray="1"
            strokeDashoffset="0"
          />
          <defs>
            <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#3b82f6" />
              <stop offset="100%" stopColor="#10b981" />
            </linearGradient>
          </defs>
        </svg>

        <div className="text-center -mt-4">
          <div className="text-3xl font-bold text-gray-800">{Math.round(wpm)}</div>
          <div className="text-xs text-gray-600">WPM</div>
          <div className={`text-sm font-medium ${level.color}`}>{level.label}</div>
        </div>
      </div>
    </div>
  );
}

// Combo streak indicator
export function ComboStreak({ streak }: { streak: number }) {
  const { settings } = useSettingsStore();

  if (streak < 3) return null;

  return (
    <motion.div
      initial={{ scale: 0, rotate: -180 }}
      animate={{ scale: 1, rotate: 0 }}
      exit={{ scale: 0, rotate: 180 }}
      className="fixed top-20 right-8 bg-gradient-to-br from-orange-400 to-red-500 text-white px-6 py-4 rounded-xl shadow-xl z-50"
    >
      <div className="flex items-center space-x-3">
        <motion.div
          animate={
            settings.reducedMotion
              ? {}
              : {
                  scale: [1, 1.3, 1],
                  rotate: [0, -10, 10, 0],
                }
          }
          transition={{ duration: 0.5, repeat: Infinity }}
          className="text-4xl"
        >
          🔥
        </motion.div>
        <div>
          <div className="text-sm font-medium opacity-90">Streak!</div>
          <div className="text-3xl font-bold">{streak}</div>
        </div>
      </div>
    </motion.div>
  );
}

// Error shake indicator
export function ErrorShake({ children, trigger }: { children: React.ReactNode; trigger: boolean }) {
  const { settings } = useSettingsStore();

  return (
    <motion.div
      animate={
        trigger && !settings.reducedMotion
          ? {
              x: [-10, 10, -10, 10, 0],
            }
          : {}
      }
      transition={{ duration: 0.4 }}
    >
      {children}
    </motion.div>
  );
}

// Live typing stats
export function LiveStats({
  wpm,
  accuracy,
  errors,
  timeElapsed,
}: {
  wpm: number;
  accuracy: number;
  errors: number;
  timeElapsed: number;
}) {
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="grid grid-cols-4 gap-4">
      <StatCard icon="⚡" label="Speed" value={`${Math.round(wpm)} WPM`} />
      <StatCard icon="🎯" label="Accuracy" value={`${accuracy.toFixed(1)}%`} />
      <StatCard icon="❌" label="Errors" value={errors.toString()} color="text-red-600" />
      <StatCard icon="⏱️" label="Time" value={formatTime(timeElapsed)} />
    </div>
  );
}

function StatCard({
  icon,
  label,
  value,
  color = 'text-primary-600',
}: {
  icon: string;
  label: string;
  value: string;
  color?: string;
}) {
  return (
    <div className="bg-white rounded-lg shadow p-3 text-center">
      <div className="text-2xl mb-1">{icon}</div>
      <div className="text-xs text-gray-600 mb-1">{label}</div>
      <div className={`text-lg font-bold ${color}`}>{value}</div>
    </div>
  );
}

// Progress bar with encouragement
export function ProgressIndicator({
  current,
  total,
  showEncouragement = true,
}: {
  current: number;
  total: number;
  showEncouragement?: boolean;
}) {
  const percentage = (current / total) * 100;

  const getEncouragement = () => {
    if (percentage >= 90) return { text: 'Almost there!', emoji: '🎉' };
    if (percentage >= 75) return { text: 'Great progress!', emoji: '⭐' };
    if (percentage >= 50) return { text: 'Halfway!', emoji: '💪' };
    if (percentage >= 25) return { text: 'Keep going!', emoji: '🚀' };
    return { text: 'You got this!', emoji: '💫' };
  };

  const encouragement = getEncouragement();

  return (
    <div className="bg-white rounded-xl shadow-lg p-4">
      {showEncouragement && (
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-medium text-gray-800">{encouragement.text}</span>
          <span className="text-xl">{encouragement.emoji}</span>
        </div>
      )}

      <div className="relative h-4 bg-gray-200 rounded-full overflow-hidden">
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${percentage}%` }}
          transition={{ duration: 0.5 }}
          className="h-full bg-gradient-to-r from-primary-400 to-primary-600 rounded-full"
        />
      </div>

      <div className="text-center mt-2 text-sm text-gray-600">
        {current} / {total} characters
      </div>
    </div>
  );
}
