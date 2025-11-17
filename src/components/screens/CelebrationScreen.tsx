/**
 * Celebration Screen Component
 * Step 99 - Positive reinforcement with celebrations
 */

import { motion, AnimatePresence } from 'framer-motion';
import { useState, useEffect } from 'react';

interface CelebrationScreenProps {
  achievement?: {
    title: string;
    description?: string;
    icon?: string;
    points?: number;
  };
  onContinue?: () => void;
  autoClose?: number; // milliseconds
}

export default function CelebrationScreen({
  achievement = {
    title: 'Great Job!',
    description: 'You did it!',
    icon: '⭐',
    points: 10,
  },
  onContinue,
  autoClose,
}: CelebrationScreenProps) {
  const [confetti, setConfetti] = useState<Array<{ id: number; x: number; emoji: string }>>([]);

  useEffect(() => {
    // Generate confetti
    const emojis = ['🎉', '✨', '⭐', '🌟', '💫', '🎊', '🎈'];
    const newConfetti = Array.from({ length: 20 }, (_, i) => ({
      id: i,
      x: Math.random() * 100,
      emoji: emojis[Math.floor(Math.random() * emojis.length)],
    }));
    setConfetti(newConfetti);

    // Auto-close if specified
    if (autoClose && onContinue) {
      const timer = setTimeout(onContinue, autoClose);
      return () => clearTimeout(timer);
    }
  }, [autoClose, onContinue]);

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <motion.div
        initial={{ opacity: 0, scale: 0.5 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.5 }}
        transition={{ type: 'spring', duration: 0.5 }}
        className="relative bg-gradient-to-br from-yellow-100 to-orange-100 rounded-3xl shadow-2xl p-8 max-w-md w-full mx-4"
      >
        {/* Confetti */}
        <AnimatePresence>
          {confetti.map((item) => (
            <motion.div
              key={item.id}
              initial={{ y: -100, x: `${item.x}%`, opacity: 1 }}
              animate={{
                y: 600,
                rotate: 360,
                opacity: 0,
              }}
              transition={{
                duration: 2 + Math.random() * 2,
                ease: 'easeIn',
              }}
              className="absolute text-3xl pointer-events-none"
            >
              {item.emoji}
            </motion.div>
          ))}
        </AnimatePresence>

        {/* Main Content */}
        <div className="relative z-10 text-center">
          {/* Icon */}
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2, type: 'spring' }}
            className="text-9xl mb-4"
          >
            {achievement.icon}
          </motion.div>

          {/* Title */}
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="text-4xl font-bold text-gray-800 mb-3"
          >
            {achievement.title}
          </motion.h1>

          {/* Description */}
          {achievement.description && (
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.4 }}
              className="text-xl text-gray-600 mb-6"
            >
              {achievement.description}
            </motion.p>
          )}

          {/* Points */}
          {achievement.points && (
            <motion.div
              initial={{ opacity: 0, scale: 0.5 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.5, type: 'spring' }}
              className="inline-block bg-white rounded-full px-6 py-3 shadow-lg mb-6"
            >
              <span className="text-2xl font-bold text-yellow-600">
                +{achievement.points} points!
              </span>
            </motion.div>
          )}

          {/* Continue Button */}
          {onContinue && (
            <motion.button
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6 }}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={onContinue}
              className="px-8 py-4 bg-success-600 text-white text-lg rounded-xl hover:bg-success-700 transition-colors shadow-lg font-medium"
            >
              Continue ✨
            </motion.button>
          )}
        </div>
      </motion.div>
    </div>
  );
}

// Level Up variant
export function LevelUpScreen({ level, onContinue }: { level: number; onContinue?: () => void }) {
  return (
    <CelebrationScreen
      achievement={{
        title: 'Level Up!',
        description: `You reached Level ${level}!`,
        icon: '🚀',
        points: level * 10,
      }}
      onContinue={onContinue}
    />
  );
}

// Achievement Unlocked variant
export function AchievementUnlockedScreen({
  name,
  icon,
  onContinue,
}: {
  name: string;
  icon: string;
  onContinue?: () => void;
}) {
  return (
    <CelebrationScreen
      achievement={{
        title: 'Achievement Unlocked!',
        description: name,
        icon,
        points: 50,
      }}
      onContinue={onContinue}
    />
  );
}

// Success Message (inline, non-modal)
export function SuccessMessage({ message }: { message: string }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="bg-success-100 border-2 border-success-400 rounded-lg p-4 flex items-center space-x-3"
    >
      <span className="text-3xl">✅</span>
      <p className="text-success-800 font-medium">{message}</p>
    </motion.div>
  );
}
