/**
 * Key Animations Component
 * Step 113 - Animated keyboard keys with visual feedback
 */

import { motion, Variants } from 'framer-motion';
import { ReactNode } from 'react';
import { useSettingsStore } from '../store/useSettingsStore';

export interface AnimatedKeyProps {
  children: ReactNode;
  isPressed?: boolean;
  isHighlighted?: boolean;
  isCorrect?: boolean;
  isIncorrect?: boolean;
  animationType?: 'bounce' | 'pulse' | 'glow' | 'shake' | 'pop';
  onClick?: () => void;
  disabled?: boolean;
}

export default function AnimatedKey({
  children,
  isPressed = false,
  isHighlighted = false,
  isCorrect = false,
  isIncorrect = false,
  animationType = 'bounce',
  onClick,
  disabled = false,
}: AnimatedKeyProps) {
  const { settings } = useSettingsStore();

  // Animation variants
  const animations: Record<string, Variants> = {
    bounce: {
      idle: { scale: 1, y: 0 },
      hover: { scale: settings.reducedMotion ? 1 : 1.05, y: -2 },
      pressed: { scale: settings.reducedMotion ? 1 : 0.95, y: 2 },
      highlighted: {
        scale: settings.reducedMotion ? 1 : [1, 1.1, 1],
        transition: { repeat: Infinity, duration: 1 },
      },
    },
    pulse: {
      idle: { scale: 1, opacity: 1 },
      hover: { scale: settings.reducedMotion ? 1 : 1.05 },
      pressed: { scale: settings.reducedMotion ? 1 : 0.95 },
      highlighted: {
        scale: settings.reducedMotion ? 1 : [1, 1.15, 1],
        opacity: [1, 0.8, 1],
        transition: { repeat: Infinity, duration: 1.5 },
      },
    },
    glow: {
      idle: { scale: 1, boxShadow: '0 2px 4px rgba(0,0,0,0.1)' },
      hover: {
        scale: settings.reducedMotion ? 1 : 1.05,
        boxShadow: '0 4px 12px rgba(59, 130, 246, 0.3)',
      },
      pressed: {
        scale: settings.reducedMotion ? 1 : 0.95,
        boxShadow: '0 1px 2px rgba(0,0,0,0.1)',
      },
      highlighted: {
        boxShadow: settings.reducedMotion
          ? '0 4px 12px rgba(250, 204, 21, 0.6)'
          : [
              '0 4px 12px rgba(250, 204, 21, 0.6)',
              '0 8px 24px rgba(250, 204, 21, 0.8)',
              '0 4px 12px rgba(250, 204, 21, 0.6)',
            ],
        transition: { repeat: Infinity, duration: 2 },
      },
    },
    shake: {
      idle: { x: 0, rotate: 0 },
      hover: { scale: settings.reducedMotion ? 1 : 1.05 },
      pressed: { scale: settings.reducedMotion ? 1 : 0.95 },
      highlighted: {
        x: settings.reducedMotion ? 0 : [0, -5, 5, -5, 5, 0],
        transition: { repeat: Infinity, duration: 0.5 },
      },
      incorrect: {
        x: settings.reducedMotion ? 0 : [-10, 10, -10, 10, 0],
        transition: { duration: 0.4 },
      },
    },
    pop: {
      idle: { scale: 1, rotate: 0 },
      hover: {
        scale: settings.reducedMotion ? 1 : 1.1,
        rotate: settings.reducedMotion ? 0 : -5,
      },
      pressed: {
        scale: settings.reducedMotion ? 1 : 0.9,
        rotate: settings.reducedMotion ? 0 : 5,
      },
      highlighted: {
        scale: settings.reducedMotion ? 1 : [1, 1.2, 1],
        rotate: settings.reducedMotion ? 0 : [0, -10, 10, 0],
        transition: { repeat: Infinity, duration: 1 },
      },
    },
  };

  const currentAnimation = animations[animationType];

  // Determine current state
  let animationState: keyof Variants = 'idle';
  if (isPressed) {
    animationState = 'pressed';
  } else if (isIncorrect) {
    animationState = 'incorrect';
  } else if (isHighlighted) {
    animationState = 'highlighted';
  }

  // Determine color based on state
  const getColor = () => {
    if (isPressed) return 'bg-primary-500 text-white';
    if (isCorrect) return 'bg-success-500 text-white';
    if (isIncorrect) return 'bg-red-500 text-white';
    if (isHighlighted) return 'bg-yellow-300 text-gray-900';
    return 'bg-white text-gray-800';
  };

  return (
    <motion.button
      variants={currentAnimation}
      initial="idle"
      animate={animationState}
      whileHover={!disabled ? 'hover' : undefined}
      whileTap={!disabled ? 'pressed' : undefined}
      onClick={onClick}
      disabled={disabled}
      className={`
        ${getColor()}
        rounded-lg font-bold shadow-md
        transition-colors duration-200
        disabled:opacity-50 disabled:cursor-not-allowed
        focus:outline-none focus:ring-2 focus:ring-primary-500
      `}
    >
      {children}
    </motion.button>
  );
}

// Ripple effect on key press
export function RippleKey({
  children,
  isPressed,
  onClick,
}: {
  children: ReactNode;
  isPressed?: boolean;
  onClick?: () => void;
}) {
  const { settings } = useSettingsStore();

  return (
    <motion.button
      onClick={onClick}
      whileHover={{ scale: settings.reducedMotion ? 1 : 1.05 }}
      whileTap={{ scale: settings.reducedMotion ? 1 : 0.95 }}
      className="relative overflow-hidden bg-white text-gray-800 rounded-lg font-bold shadow-md"
    >
      {children}
      {isPressed && !settings.reducedMotion && (
        <motion.div
          initial={{ scale: 0, opacity: 0.5 }}
          animate={{ scale: 2, opacity: 0 }}
          transition={{ duration: 0.6 }}
          className="absolute inset-0 bg-primary-400 rounded-lg"
        />
      )}
    </motion.button>
  );
}

// Typing wave effect (keys animate in sequence)
export function WaveKey({
  children,
  index,
  totalKeys,
  isActive,
}: {
  children: ReactNode;
  index: number;
  totalKeys: number;
  isActive: boolean;
}) {
  const { settings } = useSettingsStore();

  const delay = (index / totalKeys) * 0.5;

  return (
    <motion.div
      initial={{ y: 20, opacity: 0 }}
      animate={{
        y: isActive ? 0 : 20,
        opacity: isActive ? 1 : 0.5,
      }}
      transition={{
        delay: settings.reducedMotion ? 0 : delay,
        duration: 0.3,
      }}
    >
      {children}
    </motion.div>
  );
}

// Floating key effect
export function FloatingKey({
  children,
  onClick,
}: {
  children: ReactNode;
  onClick?: () => void;
}) {
  const { settings } = useSettingsStore();

  return (
    <motion.button
      onClick={onClick}
      animate={
        settings.reducedMotion
          ? {}
          : {
              y: [0, -10, 0],
            }
      }
      transition={{
        duration: 2,
        repeat: Infinity,
        ease: 'easeInOut',
      }}
      whileHover={{ scale: settings.reducedMotion ? 1 : 1.1 }}
      whileTap={{ scale: settings.reducedMotion ? 1 : 0.9 }}
      className="bg-white text-gray-800 rounded-lg font-bold shadow-lg"
    >
      {children}
    </motion.button>
  );
}

// Success burst animation
export function SuccessBurst({ isVisible }: { isVisible: boolean }) {
  const particles = Array.from({ length: 8 });

  return (
    <div className="absolute inset-0 pointer-events-none">
      {isVisible &&
        particles.map((_, i) => {
          const angle = (i / particles.length) * Math.PI * 2;
          const x = Math.cos(angle) * 50;
          const y = Math.sin(angle) * 50;

          return (
            <motion.div
              key={i}
              initial={{ x: 0, y: 0, opacity: 1, scale: 1 }}
              animate={{
                x,
                y,
                opacity: 0,
                scale: 0,
              }}
              transition={{ duration: 0.6 }}
              className="absolute top-1/2 left-1/2 w-2 h-2 bg-success-500 rounded-full"
            />
          );
        })}
    </div>
  );
}

// Key trail effect (shows recent key presses)
export function KeyTrail({
  keys,
  maxTrail = 5,
}: {
  keys: string[];
  maxTrail?: number;
}) {
  const recentKeys = keys.slice(-maxTrail);

  return (
    <div className="flex space-x-2">
      {recentKeys.map((key, index) => (
        <motion.div
          key={`${key}-${index}`}
          initial={{ opacity: 0, scale: 0.5, y: -20 }}
          animate={{ opacity: 1 - index * 0.2, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.5 }}
          className="px-3 py-2 bg-primary-100 text-primary-800 rounded-lg font-bold shadow-sm"
        >
          {key}
        </motion.div>
      ))}
    </div>
  );
}

// Typing speed indicator (pulses faster with typing speed)
export function TypingPulse({ wpm }: { wpm: number }) {
  const { settings } = useSettingsStore();

  // Calculate pulse duration based on WPM (faster = quicker pulse)
  const duration = Math.max(0.5, 2 - wpm / 100);

  return (
    <motion.div
      animate={
        settings.reducedMotion
          ? {}
          : {
              scale: [1, 1.2, 1],
              opacity: [0.5, 1, 0.5],
            }
      }
      transition={{
        duration,
        repeat: Infinity,
        ease: 'easeInOut',
      }}
      className="w-4 h-4 bg-primary-500 rounded-full"
    />
  );
}
