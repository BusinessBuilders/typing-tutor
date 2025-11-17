/**
 * Finger Indicators Component
 * Step 144 - Visual indicators showing which finger to use for each key
 */

import { motion } from 'framer-motion';
import { useState } from 'react';
import { useSettingsStore } from '../store/useSettingsStore';

export type Finger = 'pinky' | 'ring' | 'middle' | 'index' | 'thumb';
export type Hand = 'left' | 'right';

export interface FingerMapping {
  key: string;
  finger: Finger;
  hand: Hand;
  color: string;
}

// Complete finger mapping for QWERTY keyboard
export const FINGER_MAPPINGS: FingerMapping[] = [
  // Left hand - Pinky
  { key: 'q', finger: 'pinky', hand: 'left', color: '#ec4899' },
  { key: 'a', finger: 'pinky', hand: 'left', color: '#ec4899' },
  { key: 'z', finger: 'pinky', hand: 'left', color: '#ec4899' },
  { key: '1', finger: 'pinky', hand: 'left', color: '#ec4899' },

  // Left hand - Ring
  { key: 'w', finger: 'ring', hand: 'left', color: '#a855f7' },
  { key: 's', finger: 'ring', hand: 'left', color: '#a855f7' },
  { key: 'x', finger: 'ring', hand: 'left', color: '#a855f7' },
  { key: '2', finger: 'ring', hand: 'left', color: '#a855f7' },

  // Left hand - Middle
  { key: 'e', finger: 'middle', hand: 'left', color: '#3b82f6' },
  { key: 'd', finger: 'middle', hand: 'left', color: '#3b82f6' },
  { key: 'c', finger: 'middle', hand: 'left', color: '#3b82f6' },
  { key: '3', finger: 'middle', hand: 'left', color: '#3b82f6' },

  // Left hand - Index
  { key: 'r', finger: 'index', hand: 'left', color: '#10b981' },
  { key: 'f', finger: 'index', hand: 'left', color: '#10b981' },
  { key: 'v', finger: 'index', hand: 'left', color: '#10b981' },
  { key: 't', finger: 'index', hand: 'left', color: '#10b981' },
  { key: 'g', finger: 'index', hand: 'left', color: '#10b981' },
  { key: 'b', finger: 'index', hand: 'left', color: '#10b981' },
  { key: '4', finger: 'index', hand: 'left', color: '#10b981' },
  { key: '5', finger: 'index', hand: 'left', color: '#10b981' },

  // Right hand - Index
  { key: 'y', finger: 'index', hand: 'right', color: '#10b981' },
  { key: 'h', finger: 'index', hand: 'right', color: '#10b981' },
  { key: 'n', finger: 'index', hand: 'right', color: '#10b981' },
  { key: 'u', finger: 'index', hand: 'right', color: '#10b981' },
  { key: 'j', finger: 'index', hand: 'right', color: '#10b981' },
  { key: 'm', finger: 'index', hand: 'right', color: '#10b981' },
  { key: '6', finger: 'index', hand: 'right', color: '#10b981' },
  { key: '7', finger: 'index', hand: 'right', color: '#10b981' },

  // Right hand - Middle
  { key: 'i', finger: 'middle', hand: 'right', color: '#3b82f6' },
  { key: 'k', finger: 'middle', hand: 'right', color: '#3b82f6' },
  { key: ',', finger: 'middle', hand: 'right', color: '#3b82f6' },
  { key: '8', finger: 'middle', hand: 'right', color: '#3b82f6' },

  // Right hand - Ring
  { key: 'o', finger: 'ring', hand: 'right', color: '#a855f7' },
  { key: 'l', finger: 'ring', hand: 'right', color: '#a855f7' },
  { key: '.', finger: 'ring', hand: 'right', color: '#a855f7' },
  { key: '9', finger: 'ring', hand: 'right', color: '#a855f7' },

  // Right hand - Pinky
  { key: 'p', finger: 'pinky', hand: 'right', color: '#ec4899' },
  { key: ';', finger: 'pinky', hand: 'right', color: '#ec4899' },
  { key: '/', finger: 'pinky', hand: 'right', color: '#ec4899' },
  { key: '0', finger: 'pinky', hand: 'right', color: '#ec4899' },

  // Space bar - Thumbs
  { key: ' ', finger: 'thumb', hand: 'left', color: '#f59e0b' },
];

export function getFingerMapping(key: string): FingerMapping | undefined {
  return FINGER_MAPPINGS.find(
    (m) => m.key.toLowerCase() === key.toLowerCase()
  );
}

export interface FingerIndicatorProps {
  targetKey: string;
  showFinger?: boolean;
  showColor?: boolean;
  animated?: boolean;
}

export default function FingerIndicator({
  targetKey,
  showFinger = true,
  showColor = true,
  animated = true,
}: FingerIndicatorProps) {
  const { settings } = useSettingsStore();
  const mapping = getFingerMapping(targetKey);

  if (!mapping) return null;

  const fingerEmojis: Record<Hand, Record<Finger, string>> = {
    left: {
      pinky: '🖐️',
      ring: '🖐️',
      middle: '🖐️',
      index: '☝️',
      thumb: '👍',
    },
    right: {
      pinky: '🤚',
      ring: '🤚',
      middle: '🤚',
      index: '☝️',
      thumb: '👍',
    },
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: settings.reducedMotion ? 0 : 0.3 }}
      className="inline-flex flex-col items-center gap-2"
    >
      {/* Finger emoji */}
      {showFinger && (
        <div className="text-4xl">{fingerEmojis[mapping.hand][mapping.finger]}</div>
      )}

      {/* Key with color */}
      <motion.div
        animate={
          animated && !settings.reducedMotion
            ? { scale: [1, 1.1, 1], rotate: [0, 5, -5, 0] }
            : {}
        }
        transition={{ duration: 1, repeat: Infinity }}
        className="px-6 py-4 rounded-lg font-bold text-2xl text-white shadow-lg"
        style={{ backgroundColor: showColor ? mapping.color : '#6b7280' }}
      >
        {targetKey}
      </motion.div>

      {/* Finger name */}
      <div className="text-sm text-gray-600 capitalize">
        {mapping.hand} {mapping.finger}
      </div>
    </motion.div>
  );
}

// Color-coded keyboard with finger zones
export function ColorCodedKeyboard({ highlightKey }: { highlightKey?: string }) {
  const { settings } = useSettingsStore();

  const keyboardLayout = [
    ['1', '2', '3', '4', '5', '6', '7', '8', '9', '0'],
    ['q', 'w', 'e', 'r', 't', 'y', 'u', 'i', 'o', 'p'],
    ['a', 's', 'd', 'f', 'g', 'h', 'j', 'k', 'l', ';'],
    ['z', 'x', 'c', 'v', 'b', 'n', 'm', ',', '.', '/'],
  ];

  return (
    <div className="bg-white rounded-2xl shadow-xl p-6">
      <h3 className="text-lg font-bold text-gray-800 mb-4 text-center">
        Color-Coded Keyboard
      </h3>

      <div className="space-y-2">
        {keyboardLayout.map((row, rowIndex) => (
          <div key={rowIndex} className="flex justify-center gap-2">
            {row.map((key) => {
              const mapping = getFingerMapping(key);
              const isHighlighted =
                highlightKey?.toLowerCase() === key.toLowerCase();

              return (
                <motion.div
                  key={key}
                  initial={{ opacity: 0, scale: 0 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{
                    delay: settings.reducedMotion ? 0 : rowIndex * 0.1 + row.indexOf(key) * 0.02,
                  }}
                  whileHover={{ scale: settings.reducedMotion ? 1 : 1.1 }}
                  className={`w-12 h-12 rounded-lg font-bold flex items-center justify-center uppercase text-white ${
                    isHighlighted ? 'ring-4 ring-yellow-400' : ''
                  }`}
                  style={{
                    backgroundColor: mapping?.color || '#9ca3af',
                  }}
                >
                  {key}
                </motion.div>
              );
            })}
          </div>
        ))}

        {/* Space bar */}
        <div className="flex justify-center mt-2">
          <div
            className="w-64 h-12 rounded-lg font-bold flex items-center justify-center text-white"
            style={{ backgroundColor: '#f59e0b' }}
          >
            SPACE
          </div>
        </div>
      </div>

      {/* Legend */}
      <div className="mt-6 grid grid-cols-2 md:grid-cols-5 gap-3">
        {[
          { finger: 'Pinky', color: '#ec4899' },
          { finger: 'Ring', color: '#a855f7' },
          { finger: 'Middle', color: '#3b82f6' },
          { finger: 'Index', color: '#10b981' },
          { finger: 'Thumb', color: '#f59e0b' },
        ].map((item) => (
          <div key={item.finger} className="flex items-center gap-2">
            <div
              className="w-4 h-4 rounded"
              style={{ backgroundColor: item.color }}
            />
            <span className="text-sm text-gray-700">{item.finger}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

// Finger path indicator showing movement between keys
export function FingerPathIndicator({
  fromKey,
  toKey,
}: {
  fromKey: string;
  toKey: string;
}) {
  const { settings } = useSettingsStore();
  const fromMapping = getFingerMapping(fromKey);
  const toMapping = getFingerMapping(toKey);

  if (!fromMapping || !toMapping) return null;

  const sameFinger =
    fromMapping.finger === toMapping.finger &&
    fromMapping.hand === toMapping.hand;

  return (
    <div className="bg-white rounded-xl shadow-lg p-6">
      <h3 className="text-lg font-bold text-gray-800 mb-4 text-center">
        Finger Movement
      </h3>

      <div className="flex items-center justify-center gap-8">
        {/* From key */}
        <div className="text-center">
          <div
            className="w-16 h-16 rounded-lg font-bold text-2xl flex items-center justify-center text-white shadow-lg mb-2"
            style={{ backgroundColor: fromMapping.color }}
          >
            {fromKey}
          </div>
          <div className="text-xs text-gray-600 capitalize">
            {fromMapping.hand} {fromMapping.finger}
          </div>
        </div>

        {/* Arrow */}
        <motion.div
          animate={settings.reducedMotion ? {} : { x: [0, 10, 0] }}
          transition={{ duration: 1, repeat: Infinity }}
          className="text-3xl"
          style={{ color: fromMapping.color }}
        >
          →
        </motion.div>

        {/* To key */}
        <div className="text-center">
          <motion.div
            animate={
              settings.reducedMotion
                ? {}
                : { scale: [1, 1.1, 1], boxShadow: ['0 0 0', '0 0 20px', '0 0 0'] }
            }
            transition={{ duration: 1.5, repeat: Infinity }}
            className="w-16 h-16 rounded-lg font-bold text-2xl flex items-center justify-center text-white shadow-lg mb-2"
            style={{ backgroundColor: toMapping.color }}
          >
            {toKey}
          </motion.div>
          <div className="text-xs text-gray-600 capitalize">
            {toMapping.hand} {toMapping.finger}
          </div>
        </div>
      </div>

      {/* Message */}
      <div className="mt-6 text-center">
        {sameFinger ? (
          <div className="bg-blue-50 rounded-lg p-3 text-blue-900 text-sm">
            ✅ Same finger - just move it to the next key!
          </div>
        ) : (
          <div className="bg-purple-50 rounded-lg p-3 text-purple-900 text-sm">
            🔄 Different finger - switch fingers for this key
          </div>
        )}
      </div>
    </div>
  );
}

// Finger heat map showing key frequency
export function FingerHeatMap({
  keyPresses,
}: {
  keyPresses: Record<string, number>;
}) {
  const fingerStats = FINGER_MAPPINGS.reduce((acc, mapping) => {
    const count = keyPresses[mapping.key.toLowerCase()] || 0;
    const key = `${mapping.hand}-${mapping.finger}`;

    if (!acc[key]) {
      acc[key] = { finger: mapping.finger, hand: mapping.hand, count: 0, color: mapping.color };
    }
    acc[key].count += count;

    return acc;
  }, {} as Record<string, { finger: Finger; hand: Hand; count: number; color: string }>);

  const maxCount = Math.max(...Object.values(fingerStats).map((s) => s.count), 1);

  return (
    <div className="bg-white rounded-xl shadow-lg p-6">
      <h3 className="text-lg font-bold text-gray-800 mb-4">Finger Usage</h3>

      <div className="grid grid-cols-2 gap-6">
        {/* Left hand */}
        <div>
          <h4 className="text-sm font-bold text-gray-600 mb-3">Left Hand</h4>
          <div className="space-y-2">
            {(['pinky', 'ring', 'middle', 'index', 'thumb'] as Finger[]).map(
              (finger) => {
                const stats = fingerStats[`left-${finger}`];
                const percentage = stats ? (stats.count / maxCount) * 100 : 0;

                return (
                  <div key={finger}>
                    <div className="flex justify-between text-xs text-gray-600 mb-1">
                      <span className="capitalize">{finger}</span>
                      <span>{stats?.count || 0}</span>
                    </div>
                    <div className="h-4 bg-gray-200 rounded-full overflow-hidden">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${percentage}%` }}
                        transition={{ duration: 0.5 }}
                        className="h-full rounded-full"
                        style={{ backgroundColor: stats?.color || '#9ca3af' }}
                      />
                    </div>
                  </div>
                );
              }
            )}
          </div>
        </div>

        {/* Right hand */}
        <div>
          <h4 className="text-sm font-bold text-gray-600 mb-3">Right Hand</h4>
          <div className="space-y-2">
            {(['thumb', 'index', 'middle', 'ring', 'pinky'] as Finger[]).map(
              (finger) => {
                const stats = fingerStats[`right-${finger}`];
                const percentage = stats ? (stats.count / maxCount) * 100 : 0;

                return (
                  <div key={finger}>
                    <div className="flex justify-between text-xs text-gray-600 mb-1">
                      <span className="capitalize">{finger}</span>
                      <span>{stats?.count || 0}</span>
                    </div>
                    <div className="h-4 bg-gray-200 rounded-full overflow-hidden">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${percentage}%` }}
                        transition={{ duration: 0.5 }}
                        className="h-full rounded-full"
                        style={{ backgroundColor: stats?.color || '#9ca3af' }}
                      />
                    </div>
                  </div>
                );
              }
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

// Interactive finger training game
export function FingerTrainingGame() {
  const [targetKey] = useState('f');
  const [score] = useState(0);
  const [attempts] = useState(0);

  const mapping = getFingerMapping(targetKey);
  const accuracy = attempts > 0 ? (score / attempts) * 100 : 0;

  return (
    <div className="bg-white rounded-2xl shadow-xl p-8">
      <h2 className="text-2xl font-bold text-gray-800 mb-6 text-center">
        Finger Training
      </h2>

      {/* Stats */}
      <div className="flex justify-center gap-8 mb-8">
        <div className="text-center">
          <div className="text-3xl font-bold text-primary-600">{score}</div>
          <div className="text-sm text-gray-600">Score</div>
        </div>
        <div className="text-center">
          <div className="text-3xl font-bold text-gray-800">
            {Math.round(accuracy)}%
          </div>
          <div className="text-sm text-gray-600">Accuracy</div>
        </div>
      </div>

      {/* Target finger indicator */}
      {mapping && (
        <div className="flex justify-center mb-8">
          <FingerIndicator
            targetKey={targetKey}
            showFinger={true}
            showColor={true}
            animated={true}
          />
        </div>
      )}

      {/* Keyboard */}
      <ColorCodedKeyboard highlightKey={targetKey} />

      {/* Instructions */}
      <div className="mt-6 bg-blue-50 rounded-xl p-4 text-center">
        <p className="text-blue-900">
          Use the{' '}
          <span className="font-bold capitalize">
            {mapping?.hand} {mapping?.finger}
          </span>{' '}
          finger to press <span className="font-bold text-xl">{targetKey}</span>
        </p>
      </div>
    </div>
  );
}
