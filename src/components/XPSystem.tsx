/**
 * XP System Component
 * Step 213 - Add experience points and leveling system
 */

import { motion, AnimatePresence } from 'framer-motion';
import { useState } from 'react';
import { useSettingsStore } from '../store/useSettingsStore';

// XP sources
export type XPSource =
  | 'practice'
  | 'accuracy'
  | 'speed'
  | 'completion'
  | 'streak'
  | 'challenge'
  | 'daily_goal';

// XP values
export const XP_VALUES: Record<XPSource, number> = {
  practice: 25,
  accuracy: 50,
  speed: 75,
  completion: 100,
  streak: 150,
  challenge: 200,
  daily_goal: 300,
};

// Calculate XP needed for next level
export function calculateXPForLevel(level: number): number {
  return Math.floor(100 * Math.pow(1.5, level - 1));
}

// Custom hook for XP system
export function useXPSystem() {
  const [currentXP, setCurrentXP] = useState(0);
  const [level, setLevel] = useState(1);
  const [totalXP, setTotalXP] = useState(0);
  const [showLevelUp, setShowLevelUp] = useState(false);

  const xpNeeded = calculateXPForLevel(level);
  const progress = (currentXP / xpNeeded) * 100;

  const gainXP = (amount: number, source?: XPSource) => {
    const newXP = currentXP + amount;
    const newTotalXP = totalXP + amount;
    setTotalXP(newTotalXP);

    // Check for level up
    if (newXP >= xpNeeded) {
      const overflow = newXP - xpNeeded;
      setCurrentXP(overflow);
      setLevel(level + 1);
      setShowLevelUp(true);
      setTimeout(() => setShowLevelUp(false), 3000);

      return {
        leveledUp: true,
        newLevel: level + 1,
        xpGained: amount,
        source,
      };
    } else {
      setCurrentXP(newXP);
      return {
        leveledUp: false,
        newLevel: level,
        xpGained: amount,
        source,
      };
    }
  };

  const gainXPFromSource = (source: XPSource) => {
    return gainXP(XP_VALUES[source], source);
  };

  const reset = () => {
    setCurrentXP(0);
    setLevel(1);
    setTotalXP(0);
  };

  return {
    currentXP,
    level,
    totalXP,
    xpNeeded,
    progress,
    gainXP,
    gainXPFromSource,
    showLevelUp,
    reset,
  };
}

// Main XP system component
export default function XPSystem() {
  const {
    currentXP,
    level,
    totalXP,
    xpNeeded,
    progress,
    gainXPFromSource,
    showLevelUp,
    reset,
  } = useXPSystem();

  const { settings } = useSettingsStore();

  const sources: Array<{ source: XPSource; label: string; icon: string }> = [
    { source: 'practice', label: 'Practice Session', icon: '📝' },
    { source: 'accuracy', label: 'High Accuracy', icon: '🎯' },
    { source: 'speed', label: 'Speed Bonus', icon: '⚡' },
    { source: 'completion', label: 'Complete Lesson', icon: '✅' },
    { source: 'streak', label: 'Daily Streak', icon: '🔥' },
    { source: 'challenge', label: 'Challenge Win', icon: '💪' },
    { source: 'daily_goal', label: 'Daily Goal', icon: '🎯' },
  ];

  return (
    <div className="bg-white rounded-2xl shadow-xl p-8">
      <h2 className="text-2xl font-bold text-gray-800 mb-6 text-center">
        Experience Points (XP)
      </h2>

      {/* Level display */}
      <div className="mb-8 bg-gradient-to-r from-purple-500 to-pink-500 rounded-2xl p-8 text-center text-white">
        <div className="text-sm font-bold mb-2 uppercase tracking-wide opacity-90">
          Current Level
        </div>
        <div className="text-8xl font-bold mb-4">{level}</div>
        <div className="text-lg mb-4">
          Total XP: {totalXP.toLocaleString()}
        </div>
      </div>

      {/* XP Progress bar */}
      <div className="mb-8">
        <div className="flex justify-between items-center mb-2">
          <span className="text-sm font-bold text-gray-700">
            Level {level} Progress
          </span>
          <span className="text-sm text-gray-600">
            {currentXP} / {xpNeeded} XP
          </span>
        </div>
        <div className="h-6 bg-gray-200 rounded-full overflow-hidden">
          <motion.div
            animate={{ width: `${progress}%` }}
            className="h-full bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-end pr-2"
          >
            {progress > 10 && (
              <span className="text-xs font-bold text-white">
                {Math.round(progress)}%
              </span>
            )}
          </motion.div>
        </div>
      </div>

      {/* Level up notification */}
      <AnimatePresence>
        {showLevelUp && (
          <motion.div
            initial={{ opacity: 0, scale: 0.5 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.5 }}
            className="fixed inset-0 flex items-center justify-center z-50 pointer-events-none"
          >
            <div className="bg-gradient-to-r from-yellow-400 to-orange-500 text-white rounded-3xl p-12 shadow-2xl text-center">
              <motion.div
                animate={{
                  rotate: [0, 360],
                  scale: [1, 1.2, 1],
                }}
                transition={{ duration: 0.6 }}
                className="text-9xl mb-6"
              >
                ⭐
              </motion.div>
              <div className="text-5xl font-bold mb-4">LEVEL UP!</div>
              <div className="text-3xl">Level {level}</div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* XP sources */}
      <div className="mb-8 bg-gray-50 rounded-xl p-6">
        <h3 className="text-lg font-bold text-gray-900 mb-4">
          Earn XP
        </h3>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
          {sources.map(({ source, label, icon }, index) => (
            <motion.button
              key={source}
              onClick={() => gainXPFromSource(source)}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: settings.reducedMotion ? 0 : index * 0.05 }}
              whileHover={{ scale: settings.reducedMotion ? 1 : 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="p-4 bg-white hover:bg-blue-50 rounded-lg shadow-sm transition-all"
            >
              <div className="text-3xl mb-2">{icon}</div>
              <div className="text-sm font-bold text-gray-900 mb-1">{label}</div>
              <div className="text-xs text-blue-600 font-bold">
                +{XP_VALUES[source]} XP
              </div>
            </motion.button>
          ))}
        </div>
      </div>

      {/* Next levels preview */}
      <div className="mb-8 bg-blue-50 rounded-xl p-6">
        <h3 className="text-lg font-bold text-blue-900 mb-4">
          Upcoming Levels
        </h3>
        <div className="space-y-2">
          {[level + 1, level + 2, level + 3].map((lvl) => (
            <div key={lvl} className="flex items-center justify-between p-3 bg-white rounded-lg">
              <span className="font-bold text-gray-900">Level {lvl}</span>
              <span className="text-sm text-gray-600">
                {calculateXPForLevel(lvl).toLocaleString()} XP needed
              </span>
            </div>
          ))}
        </div>
      </div>

      <button
        onClick={reset}
        className="w-full py-3 bg-gray-200 text-gray-700 rounded-lg font-bold hover:bg-gray-300 transition-colors"
      >
        🔄 Reset XP
      </button>

      <div className="mt-8 bg-green-50 rounded-xl p-6">
        <h3 className="text-lg font-bold text-green-900 mb-3">
          XP System Info
        </h3>
        <ul className="space-y-2 text-sm text-green-800">
          <li>• Earn XP by practicing and completing activities</li>
          <li>• XP required increases with each level</li>
          <li>• Higher levels unlock new features and rewards</li>
          <li>• Keep practicing to level up faster!</li>
        </ul>
      </div>
    </div>
  );
}

// Compact XP bar
export function XPBar({ currentXP, xpNeeded, level }: { currentXP: number; xpNeeded: number; level: number }) {
  const progress = (currentXP / xpNeeded) * 100;

  return (
    <div className="bg-white rounded-lg shadow-md p-4">
      <div className="flex items-center justify-between mb-2">
        <span className="text-sm font-bold text-gray-700">Level {level}</span>
        <span className="text-xs text-gray-600">{currentXP} / {xpNeeded} XP</span>
      </div>
      <div className="h-3 bg-gray-200 rounded-full overflow-hidden">
        <div
          className="h-full bg-gradient-to-r from-blue-500 to-purple-500 transition-all duration-300"
          style={{ width: `${progress}%` }}
        />
      </div>
    </div>
  );
}

// XP gain notification
export function XPGainNotification({
  show,
  amount,
  source,
}: {
  show: boolean;
  amount: number;
  source?: string;
}) {
  return (
    <AnimatePresence>
      {show && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          className="fixed top-4 right-4 bg-blue-500 text-white rounded-xl shadow-2xl p-4 z-50"
        >
          <div className="flex items-center gap-2">
            <span className="text-2xl">✨</span>
            <div>
              <div className="font-bold">+{amount} XP</div>
              {source && <div className="text-xs opacity-90">{source}</div>}
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
