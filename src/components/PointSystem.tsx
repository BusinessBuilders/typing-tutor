/**
 * Point System Component
 * Step 211 - Create point earning and tracking system
 */

import { motion, AnimatePresence } from 'framer-motion';
import { useState } from 'react';
import { useSettingsStore } from '../store/useSettingsStore';

// Point earning reasons
export type PointReason =
  | 'correct_letter'
  | 'correct_word'
  | 'correct_sentence'
  | 'perfect_accuracy'
  | 'speed_bonus'
  | 'streak_bonus'
  | 'daily_login'
  | 'achievement'
  | 'milestone';

// Point values
export const POINT_VALUES: Record<PointReason, number> = {
  correct_letter: 10,
  correct_word: 50,
  correct_sentence: 100,
  perfect_accuracy: 200,
  speed_bonus: 150,
  streak_bonus: 100,
  daily_login: 50,
  achievement: 500,
  milestone: 1000,
};

// Point transaction interface
interface PointTransaction {
  id: string;
  reason: PointReason;
  points: number;
  timestamp: Date;
  description: string;
}

// Custom hook for point system
export function usePointSystem() {
  const [totalPoints, setTotalPoints] = useState(0);
  const [transactions, setTransactions] = useState<PointTransaction[]>([]);
  const [showNotification, setShowNotification] = useState(false);
  const [lastEarned, setLastEarned] = useState<PointTransaction | null>(null);

  const earnPoints = (reason: PointReason, description?: string) => {
    const points = POINT_VALUES[reason];
    const transaction: PointTransaction = {
      id: Date.now().toString(),
      reason,
      points,
      timestamp: new Date(),
      description: description || `Earned ${points} points for ${reason.replace(/_/g, ' ')}`,
    };

    setTotalPoints((prev) => prev + points);
    setTransactions((prev) => [transaction, ...prev]);
    setLastEarned(transaction);
    setShowNotification(true);

    setTimeout(() => setShowNotification(false), 3000);

    return points;
  };

  const getPointsByReason = (reason: PointReason) => {
    return transactions
      .filter((t) => t.reason === reason)
      .reduce((sum, t) => sum + t.points, 0);
  };

  const getTodaysPoints = () => {
    const today = new Date().toDateString();
    return transactions
      .filter((t) => t.timestamp.toDateString() === today)
      .reduce((sum, t) => sum + t.points, 0);
  };

  return {
    totalPoints,
    transactions,
    earnPoints,
    getPointsByReason,
    getTodaysPoints,
    showNotification,
    lastEarned,
  };
}

// Main point system component
export default function PointSystem() {
  const {
    totalPoints,
    transactions,
    earnPoints,
    getTodaysPoints,
    showNotification,
    lastEarned,
  } = usePointSystem();

  const { settings } = useSettingsStore();

  const reasons: Array<{ reason: PointReason; label: string; icon: string }> = [
    { reason: 'correct_letter', label: 'Correct Letter', icon: '🔤' },
    { reason: 'correct_word', label: 'Correct Word', icon: '📝' },
    { reason: 'correct_sentence', label: 'Correct Sentence', icon: '📄' },
    { reason: 'perfect_accuracy', label: 'Perfect Accuracy', icon: '🎯' },
    { reason: 'speed_bonus', label: 'Speed Bonus', icon: '⚡' },
    { reason: 'streak_bonus', label: 'Streak Bonus', icon: '🔥' },
    { reason: 'daily_login', label: 'Daily Login', icon: '📅' },
    { reason: 'achievement', label: 'Achievement', icon: '🏆' },
    { reason: 'milestone', label: 'Milestone', icon: '⭐' },
  ];

  return (
    <div className="bg-white rounded-2xl shadow-xl p-8">
      <h2 className="text-2xl font-bold text-gray-800 mb-6 text-center">
        Point System
      </h2>

      {/* Total points display */}
      <div className="mb-8 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-2xl p-8 text-center">
        <div className="text-white text-sm font-bold mb-2 uppercase tracking-wide">
          Total Points
        </div>
        <motion.div
          animate={{ scale: showNotification ? [1, 1.1, 1] : 1 }}
          className="text-white text-6xl font-bold"
        >
          {totalPoints.toLocaleString()}
        </motion.div>
        <div className="text-white text-sm mt-2">
          Today: +{getTodaysPoints().toLocaleString()} points
        </div>
      </div>

      {/* Point notification */}
      <AnimatePresence>
        {showNotification && lastEarned && (
          <motion.div
            initial={{ opacity: 0, y: -20, scale: 0.8 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.8 }}
            className="fixed top-4 right-4 bg-green-500 text-white rounded-xl shadow-2xl p-6 z-50 max-w-sm"
          >
            <div className="flex items-center gap-3">
              <div className="text-4xl">🎉</div>
              <div>
                <div className="font-bold text-xl">+{lastEarned.points} Points!</div>
                <div className="text-sm opacity-90">{lastEarned.description}</div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Test buttons */}
      <div className="mb-8 bg-gray-50 rounded-xl p-6">
        <h3 className="text-lg font-bold text-gray-900 mb-4">
          Try Earning Points
        </h3>
        <div className="grid grid-cols-3 gap-3">
          {reasons.map(({ reason, label, icon }, index) => (
            <motion.button
              key={reason}
              onClick={() => earnPoints(reason)}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: settings.reducedMotion ? 0 : index * 0.05 }}
              whileHover={{ scale: settings.reducedMotion ? 1 : 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="px-4 py-3 bg-white hover:bg-gray-100 rounded-lg shadow-sm transition-all text-center"
            >
              <div className="text-2xl mb-1">{icon}</div>
              <div className="text-xs font-bold text-gray-900">{label}</div>
              <div className="text-xs text-gray-600">+{POINT_VALUES[reason]}</div>
            </motion.button>
          ))}
        </div>
      </div>

      {/* Recent transactions */}
      {transactions.length > 0 && (
        <div>
          <h3 className="text-lg font-bold text-gray-900 mb-4">
            Recent Activity
          </h3>
          <div className="space-y-2 max-h-96 overflow-y-auto">
            {transactions.slice(0, 10).map((transaction, index) => (
              <motion.div
                key={transaction.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: settings.reducedMotion ? 0 : index * 0.05 }}
                className="flex items-center justify-between p-4 bg-gray-50 rounded-lg"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-green-100 text-green-700 rounded-full flex items-center justify-center font-bold">
                    +{transaction.points}
                  </div>
                  <div>
                    <div className="font-medium text-gray-900">
                      {transaction.description}
                    </div>
                    <div className="text-sm text-gray-500">
                      {transaction.timestamp.toLocaleTimeString()}
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      )}

      {transactions.length === 0 && (
        <div className="text-center text-gray-500 py-12">
          Start practicing to earn points!
        </div>
      )}

      <div className="mt-8 bg-blue-50 rounded-xl p-6">
        <h3 className="text-lg font-bold text-blue-900 mb-3">
          How to Earn Points
        </h3>
        <ul className="space-y-2 text-sm text-blue-800">
          <li>• Type correct letters, words, and sentences</li>
          <li>• Achieve perfect accuracy on exercises</li>
          <li>• Type fast to earn speed bonuses</li>
          <li>• Build streaks for bonus points</li>
          <li>• Log in daily for login bonuses</li>
          <li>• Unlock achievements and reach milestones</li>
        </ul>
      </div>
    </div>
  );
}

// Compact points display
export function PointsDisplay({ points }: { points: number }) {
  return (
    <div className="inline-flex items-center gap-2 bg-yellow-400 text-yellow-900 px-4 py-2 rounded-full font-bold shadow-md">
      <span className="text-xl">⭐</span>
      <span>{points.toLocaleString()} pts</span>
    </div>
  );
}

// Floating points animation
export function FloatingPoints({ points, x, y }: { points: number; x: number; y: number }) {
  return (
    <motion.div
      initial={{ opacity: 1, y: 0, x }}
      animate={{ opacity: 0, y: -50 }}
      transition={{ duration: 1 }}
      className="fixed pointer-events-none z-50"
      style={{ top: y, left: x }}
    >
      <div className="text-2xl font-bold text-green-500">
        +{points}
      </div>
    </motion.div>
  );
}
