/**
 * Keyboard Hints Component
 * Step 142 - Visual hints on keyboard for next key to press
 */

import { motion, AnimatePresence } from 'framer-motion';
import { useState } from 'react';
import { useSettingsStore } from '../store/useSettingsStore';

export interface KeyboardHintProps {
  nextKey: string;
  showHint?: boolean;
  hintStyle?: 'glow' | 'arrow' | 'pulse' | 'highlight' | 'none';
  showKeyName?: boolean;
}

export default function KeyboardHints({
  nextKey,
  showHint = true,
  hintStyle = 'glow',
  showKeyName = true,
}: KeyboardHintProps) {
  const { settings } = useSettingsStore();

  if (!showHint || !nextKey) return null;

  const animations = {
    glow: {
      initial: { boxShadow: '0 0 0 rgba(59, 130, 246, 0)' },
      animate: {
        boxShadow: [
          '0 0 0 rgba(59, 130, 246, 0)',
          '0 0 20px rgba(59, 130, 246, 0.8)',
          '0 0 0 rgba(59, 130, 246, 0)',
        ],
      },
      transition: { duration: 1.5, repeat: Infinity },
    },
    pulse: {
      initial: { scale: 1 },
      animate: { scale: [1, 1.1, 1] },
      transition: { duration: 1, repeat: Infinity },
    },
    highlight: {
      initial: { backgroundColor: 'transparent' },
      animate: {
        backgroundColor: ['transparent', 'rgba(59, 130, 246, 0.2)', 'transparent'],
      },
      transition: { duration: 1.5, repeat: Infinity },
    },
  };

  const currentAnimation = settings.reducedMotion
    ? {}
    : animations[hintStyle as keyof typeof animations] || {};

  return (
    <div className="relative inline-block">
      {/* Arrow hint above key */}
      {hintStyle === 'arrow' && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{
            duration: settings.reducedMotion ? 0 : 0.3,
            y: {
              duration: 0.5,
              repeat: Infinity,
              repeatType: 'reverse',
            },
          }}
          className="absolute -top-12 left-1/2 -translate-x-1/2 text-primary-600"
        >
          <div className="text-4xl">⬇</div>
        </motion.div>
      )}

      {/* Key with hint */}
      <motion.div
        {...currentAnimation}
        className="px-4 py-3 bg-primary-500 text-white rounded-lg font-bold text-xl shadow-lg"
      >
        {nextKey}
      </motion.div>

      {/* Key name label */}
      {showKeyName && (
        <div className="absolute -bottom-8 left-1/2 -translate-x-1/2 text-xs text-gray-600 whitespace-nowrap">
          Press {nextKey}
        </div>
      )}
    </div>
  );
}

// Full keyboard with next key highlighted
export function KeyboardWithHints({
  nextKey,
  layout = 'qwerty',
  size = 'medium',
  hintStyle = 'glow',
}: {
  nextKey: string;
  layout?: 'qwerty' | 'abc';
  size?: 'small' | 'medium' | 'large';
  hintStyle?: 'glow' | 'highlight' | 'pulse';
}) {
  const { settings } = useSettingsStore();

  const qwertyLayout = [
    ['q', 'w', 'e', 'r', 't', 'y', 'u', 'i', 'o', 'p'],
    ['a', 's', 'd', 'f', 'g', 'h', 'j', 'k', 'l'],
    ['z', 'x', 'c', 'v', 'b', 'n', 'm'],
  ];

  const abcLayout = [
    ['a', 'b', 'c', 'd', 'e', 'f', 'g'],
    ['h', 'i', 'j', 'k', 'l', 'm', 'n'],
    ['o', 'p', 'q', 'r', 's', 't'],
    ['u', 'v', 'w', 'x', 'y', 'z'],
  ];

  const rows = layout === 'qwerty' ? qwertyLayout : abcLayout;

  const keySizes = {
    small: 'w-8 h-8 text-xs',
    medium: 'w-12 h-12 text-base',
    large: 'w-16 h-16 text-xl',
  };

  const getKeyAnimation = (key: string) => {
    if (key.toLowerCase() !== nextKey.toLowerCase()) return {};

    if (settings.reducedMotion) {
      return {
        className: 'bg-primary-500 text-white',
      };
    }

    switch (hintStyle) {
      case 'glow':
        return {
          animate: {
            boxShadow: [
              '0 0 0 rgba(59, 130, 246, 0)',
              '0 0 30px rgba(59, 130, 246, 1)',
              '0 0 0 rgba(59, 130, 246, 0)',
            ],
          },
          transition: { duration: 1.5, repeat: Infinity },
          className: 'bg-primary-500 text-white',
        };
      case 'pulse':
        return {
          animate: { scale: [1, 1.15, 1] },
          transition: { duration: 1, repeat: Infinity },
          className: 'bg-primary-500 text-white',
        };
      case 'highlight':
        return {
          animate: {
            backgroundColor: [
              'rgb(59, 130, 246)',
              'rgb(96, 165, 250)',
              'rgb(59, 130, 246)',
            ],
          },
          transition: { duration: 1.5, repeat: Infinity },
          className: 'text-white',
        };
      default:
        return {};
    }
  };

  return (
    <div className="bg-gray-100 rounded-2xl p-6 shadow-xl">
      <div className="space-y-2">
        {rows.map((row, rowIndex) => (
          <div key={rowIndex} className="flex justify-center gap-2">
            {row.map((key) => {
              const keyProps = getKeyAnimation(key);
              const isNextKey = key.toLowerCase() === nextKey.toLowerCase();

              return (
                <motion.div
                  key={key}
                  {...keyProps}
                  className={`${keySizes[size]} rounded-lg font-bold flex items-center justify-center uppercase ${
                    isNextKey
                      ? keyProps.className || 'bg-primary-500 text-white'
                      : 'bg-white text-gray-700'
                  } shadow-md`}
                >
                  {key}
                </motion.div>
              );
            })}
          </div>
        ))}
      </div>
    </div>
  );
}

// Hint overlay that appears above keyboard
export function KeyboardHintOverlay({
  message,
  nextKey,
  show = true,
}: {
  message: string;
  nextKey?: string;
  show?: boolean;
}) {
  const { settings } = useSettingsStore();

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 20 }}
          transition={{ duration: settings.reducedMotion ? 0 : 0.3 }}
          className="bg-gradient-to-r from-primary-500 to-purple-500 text-white rounded-xl shadow-2xl p-6"
        >
          <div className="text-center">
            <div className="text-lg font-bold mb-2">{message}</div>
            {nextKey && (
              <div className="flex justify-center items-center gap-3 mt-4">
                <span className="text-sm">Press:</span>
                <div className="px-6 py-3 bg-white text-primary-900 rounded-lg font-bold text-3xl shadow-lg">
                  {nextKey}
                </div>
              </div>
            )}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

// Key hint with finger position
export function KeyHintWithFinger({
  key,
  finger,
  hand,
}: {
  key: string;
  finger: 'pinky' | 'ring' | 'middle' | 'index' | 'thumb';
  hand: 'left' | 'right';
}) {
  const { settings } = useSettingsStore();

  const fingerEmojis = {
    left: {
      pinky: '🤙',
      ring: '💍',
      middle: '🖕',
      index: '👈',
      thumb: '👍',
    },
    right: {
      pinky: '🤙',
      ring: '💍',
      middle: '🖕',
      index: '👉',
      thumb: '👍',
    },
  };

  const fingerColors = {
    pinky: 'bg-pink-500',
    ring: 'bg-purple-500',
    middle: 'bg-blue-500',
    index: 'bg-green-500',
    thumb: 'bg-yellow-500',
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: settings.reducedMotion ? 0 : 0.3 }}
      className="text-center"
    >
      {/* Finger emoji */}
      <div className="text-4xl mb-2">{fingerEmojis[hand][finger]}</div>

      {/* Key */}
      <motion.div
        animate={settings.reducedMotion ? {} : { scale: [1, 1.1, 1] }}
        transition={{ duration: 1, repeat: Infinity }}
        className={`${fingerColors[finger]} text-white px-6 py-4 rounded-lg font-bold text-2xl shadow-lg`}
      >
        {key}
      </motion.div>

      {/* Finger name */}
      <div className="text-xs text-gray-600 mt-2 capitalize">
        {hand} {finger}
      </div>
    </motion.div>
  );
}

// Animated path showing key location
export function KeyLocationPath({
  fromKey,
  toKey,
}: {
  fromKey: string;
  toKey: string;
}) {
  const { settings } = useSettingsStore();

  return (
    <div className="relative">
      <div className="flex items-center justify-center gap-8">
        {/* Starting key */}
        <div className="px-4 py-3 bg-gray-300 text-gray-700 rounded-lg font-bold text-xl">
          {fromKey}
        </div>

        {/* Animated arrow */}
        <motion.div
          animate={settings.reducedMotion ? {} : { x: [0, 10, 0] }}
          transition={{ duration: 1, repeat: Infinity }}
          className="text-primary-600 text-3xl"
        >
          →
        </motion.div>

        {/* Target key */}
        <motion.div
          animate={
            settings.reducedMotion
              ? {}
              : {
                  scale: [1, 1.1, 1],
                  boxShadow: [
                    '0 0 0 rgba(59, 130, 246, 0)',
                    '0 0 20px rgba(59, 130, 246, 0.8)',
                    '0 0 0 rgba(59, 130, 246, 0)',
                  ],
                }
          }
          transition={{ duration: 1.5, repeat: Infinity }}
          className="px-4 py-3 bg-primary-500 text-white rounded-lg font-bold text-xl"
        >
          {toKey}
        </motion.div>
      </div>

      <div className="text-center mt-4 text-sm text-gray-600">
        Move from <span className="font-bold">{fromKey}</span> to{' '}
        <span className="font-bold text-primary-600">{toKey}</span>
      </div>
    </div>
  );
}

// Hint panel showing multiple upcoming keys
export function UpcomingKeysHint({
  keys,
  showCount = 5,
}: {
  keys: string[];
  showCount?: number;
}) {
  const { settings } = useSettingsStore();
  const displayKeys = keys.slice(0, showCount);

  return (
    <div className="bg-white rounded-xl shadow-lg p-4">
      <h3 className="text-sm font-bold text-gray-600 mb-3">Next Keys:</h3>

      <div className="flex gap-2">
        {displayKeys.map((key, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{
              delay: settings.reducedMotion ? 0 : index * 0.05,
            }}
            className={`px-3 py-2 rounded-lg font-bold ${
              index === 0
                ? 'bg-primary-500 text-white text-xl'
                : 'bg-gray-200 text-gray-700 text-sm'
            }`}
            style={{
              opacity: index === 0 ? 1 : 1 - index * 0.15,
            }}
          >
            {key}
          </motion.div>
        ))}
      </div>
    </div>
  );
}

// Hint for special keys (Shift, Enter, Space, etc.)
export function SpecialKeyHint({
  keyType,
}: {
  keyType: 'shift' | 'enter' | 'space' | 'backspace' | 'tab';
}) {
  const { settings } = useSettingsStore();

  const keyInfo = {
    shift: {
      name: 'Shift',
      symbol: '⇧',
      description: 'Hold Shift for uppercase letters',
      color: 'bg-yellow-500',
    },
    enter: {
      name: 'Enter',
      symbol: '↵',
      description: 'Press Enter to start new line',
      color: 'bg-green-500',
    },
    space: {
      name: 'Space',
      symbol: '␣',
      description: 'Press Space bar between words',
      color: 'bg-blue-500',
    },
    backspace: {
      name: 'Backspace',
      symbol: '⌫',
      description: 'Press Backspace to delete',
      color: 'bg-red-500',
    },
    tab: {
      name: 'Tab',
      symbol: '⇥',
      description: 'Press Tab to indent',
      color: 'bg-purple-500',
    },
  };

  const info = keyInfo[keyType];

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: settings.reducedMotion ? 0 : 0.3 }}
      className="bg-white rounded-xl shadow-xl p-6"
    >
      <div className="flex items-center gap-4">
        {/* Symbol */}
        <motion.div
          animate={settings.reducedMotion ? {} : { scale: [1, 1.1, 1] }}
          transition={{ duration: 1, repeat: Infinity }}
          className={`${info.color} text-white w-20 h-20 rounded-xl flex items-center justify-center text-4xl font-bold shadow-lg`}
        >
          {info.symbol}
        </motion.div>

        {/* Info */}
        <div>
          <h3 className="text-xl font-bold text-gray-800 mb-1">{info.name}</h3>
          <p className="text-sm text-gray-600">{info.description}</p>
        </div>
      </div>
    </motion.div>
  );
}

// Interactive keyboard hint practice
export function KeyboardHintPractice({
  targetKeys,
}: {
  targetKeys: string[];
  onKeyPress?: (key: string, correct: boolean) => void;
}) {
  const [currentIndex] = useState(0);
  const [score] = useState(0);

  const currentKey = targetKeys[currentIndex];

  return (
    <div className="bg-white rounded-2xl shadow-xl p-8">
      <div className="text-center mb-8">
        <h2 className="text-2xl font-bold text-gray-800 mb-2">Find the Key!</h2>
        <div className="text-sm text-gray-600">
          Score: {score} / {targetKeys.length}
        </div>
      </div>

      {/* Current target key */}
      <div className="flex justify-center mb-8">
        <KeyboardHints
          nextKey={currentKey}
          showHint={true}
          hintStyle="pulse"
          showKeyName={true}
        />
      </div>

      {/* Keyboard */}
      <KeyboardWithHints
        nextKey={currentKey}
        layout="qwerty"
        size="large"
        hintStyle="glow"
      />

      {/* Progress */}
      <div className="mt-6">
        <div className="flex gap-1">
          {targetKeys.map((_, index) => (
            <div
              key={index}
              className={`flex-1 h-2 rounded ${
                index < currentIndex
                  ? 'bg-success-500'
                  : index === currentIndex
                  ? 'bg-primary-500'
                  : 'bg-gray-200'
              }`}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
