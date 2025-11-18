/**
 * Happiness Meter Component
 * Step 224 - Build happiness and mood tracking system for pets
 */

import { motion } from 'framer-motion';
import { useState, useEffect } from 'react';
import { useSettingsStore } from '../store/useSettingsStore';

// Mood levels
export type MoodLevel = 'ecstatic' | 'happy' | 'content' | 'okay' | 'sad' | 'unhappy';

// Mood interface
export interface Mood {
  level: MoodLevel;
  happiness: number;
  icon: string;
  message: string;
  color: string;
  animation: string;
}

// Happiness factor interface
export interface HappinessFactor {
  id: string;
  name: string;
  icon: string;
  impact: number; // -100 to +100
  description: string;
}

// Mood configurations
const MOOD_LEVELS: Record<MoodLevel, Omit<Mood, 'happiness'>> = {
  ecstatic: {
    level: 'ecstatic',
    icon: '🤩',
    message: "I'm so incredibly happy!",
    color: 'from-pink-400 to-pink-600',
    animation: 'bounce',
  },
  happy: {
    level: 'happy',
    icon: '😄',
    message: "I'm really happy!",
    color: 'from-green-400 to-green-600',
    animation: 'wiggle',
  },
  content: {
    level: 'content',
    icon: '😊',
    message: "I'm feeling good!",
    color: 'from-blue-400 to-blue-600',
    animation: 'gentle',
  },
  okay: {
    level: 'okay',
    icon: '😐',
    message: "I'm doing okay...",
    color: 'from-yellow-400 to-yellow-600',
    animation: 'subtle',
  },
  sad: {
    level: 'sad',
    icon: '😢',
    message: "I'm feeling a bit sad...",
    color: 'from-orange-400 to-orange-600',
    animation: 'droop',
  },
  unhappy: {
    level: 'unhappy',
    icon: '😭',
    message: "I need attention!",
    color: 'from-red-400 to-red-600',
    animation: 'shake',
  },
};

// Custom hook for happiness meter
export function useHappinessMeter(initialHappiness: number = 75) {
  const [happiness, setHappiness] = useState(initialHappiness);
  const [factors, setFactors] = useState<HappinessFactor[]>([]);
  const [history, setHistory] = useState<{ timestamp: Date; happiness: number; change: number }[]>([]);

  const getMood = (): Mood => {
    let level: MoodLevel;

    if (happiness >= 90) level = 'ecstatic';
    else if (happiness >= 70) level = 'happy';
    else if (happiness >= 50) level = 'content';
    else if (happiness >= 30) level = 'okay';
    else if (happiness >= 10) level = 'sad';
    else level = 'unhappy';

    return {
      ...MOOD_LEVELS[level],
      happiness,
    };
  };

  const changeHappiness = (amount: number, reason?: string) => {
    const oldHappiness = happiness;
    const newHappiness = Math.max(0, Math.min(100, happiness + amount));
    setHappiness(newHappiness);

    // Add to history
    setHistory((prev) => [
      ...prev,
      {
        timestamp: new Date(),
        happiness: newHappiness,
        change: amount,
      },
    ].slice(-20)); // Keep last 20 entries

    // Add factor if reason provided
    if (reason) {
      addFactor({
        id: Date.now().toString(),
        name: reason,
        icon: amount > 0 ? '📈' : '📉',
        impact: amount,
        description: `${amount > 0 ? 'Increased' : 'Decreased'} happiness by ${Math.abs(amount)}`,
      });
    }

    return {
      oldHappiness,
      newHappiness,
      change: amount,
      mood: getMood(),
    };
  };

  const addFactor = (factor: HappinessFactor) => {
    setFactors((prev) => [...prev, factor].slice(-10)); // Keep last 10 factors
  };

  const clearFactors = () => {
    setFactors([]);
  };

  const getAverageMood = () => {
    if (history.length === 0) return happiness;
    const sum = history.reduce((acc, entry) => acc + entry.happiness, 0);
    return Math.round(sum / history.length);
  };

  const getTrend = (): 'improving' | 'stable' | 'declining' => {
    if (history.length < 3) return 'stable';

    const recent = history.slice(-5);
    const changes = recent.map((entry) => entry.change);
    const totalChange = changes.reduce((acc, change) => acc + change, 0);

    if (totalChange > 10) return 'improving';
    if (totalChange < -10) return 'declining';
    return 'stable';
  };

  return {
    happiness,
    setHappiness,
    changeHappiness,
    getMood,
    factors,
    addFactor,
    clearFactors,
    history,
    getAverageMood,
    getTrend,
  };
}

// Main happiness meter component
export default function HappinessMeter({ initialHappiness = 75 }: { initialHappiness?: number }) {
  const {
    happiness,
    changeHappiness,
    getMood,
    factors,
    clearFactors,
    history,
    getAverageMood,
    getTrend,
  } = useHappinessMeter(initialHappiness);

  const { settings } = useSettingsStore();
  const mood = getMood();
  const trend = getTrend();
  const averageMood = getAverageMood();

  // Simulate automatic happiness decay
  useEffect(() => {
    const interval = setInterval(() => {
      changeHappiness(-0.5, 'Natural decay');
    }, 30000); // Decrease by 0.5 every 30 seconds

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="bg-white rounded-2xl shadow-xl p-8">
      <h2 className="text-2xl font-bold text-gray-800 mb-6 text-center">
        💕 Happiness Meter
      </h2>

      {/* Main mood display */}
      <div className={`mb-8 bg-gradient-to-r ${mood.color} rounded-2xl p-8 text-white text-center`}>
        <motion.div
          animate={{
            scale: mood.animation === 'bounce' ? [1, 1.2, 1] : [1, 1.05, 1],
            rotate: mood.animation === 'wiggle' ? [0, 5, -5, 0] : 0,
          }}
          transition={{
            duration: mood.animation === 'bounce' ? 0.5 : 2,
            repeat: Infinity,
            repeatType: 'reverse',
          }}
          className="text-9xl mb-4"
        >
          {mood.icon}
        </motion.div>

        <div className="text-3xl font-bold mb-2">{mood.level.toUpperCase()}</div>
        <div className="text-xl opacity-90 mb-4">{mood.message}</div>
        <div className="text-6xl font-bold">{happiness}%</div>
      </div>

      {/* Happiness bar */}
      <div className="mb-6 bg-gray-50 rounded-xl p-6">
        <div className="flex items-center justify-between mb-3">
          <span className="text-sm font-bold text-gray-700">Happiness Level</span>
          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-600">{happiness}/100</span>
            {trend === 'improving' && <span className="text-green-600">📈</span>}
            {trend === 'declining' && <span className="text-red-600">📉</span>}
            {trend === 'stable' && <span className="text-blue-600">➡️</span>}
          </div>
        </div>

        <div className="h-6 bg-gray-200 rounded-full overflow-hidden">
          <motion.div
            animate={{ width: `${happiness}%` }}
            className={`h-full bg-gradient-to-r ${mood.color} transition-all duration-500`}
          />
        </div>

        <div className="mt-3 text-xs text-gray-600 text-center">
          Trend: {trend.charAt(0).toUpperCase() + trend.slice(1)}
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        <div className="bg-blue-50 rounded-xl p-4 text-center">
          <div className="text-3xl font-bold text-blue-700">{averageMood}%</div>
          <div className="text-xs text-gray-600">Average</div>
        </div>
        <div className="bg-green-50 rounded-xl p-4 text-center">
          <div className="text-3xl font-bold text-green-700">
            {history.filter((h) => h.change > 0).length}
          </div>
          <div className="text-xs text-gray-600">Positive Events</div>
        </div>
        <div className="bg-purple-50 rounded-xl p-4 text-center">
          <div className="text-3xl font-bold text-purple-700">{history.length}</div>
          <div className="text-xs text-gray-600">Total Changes</div>
        </div>
      </div>

      {/* Test buttons */}
      <div className="mb-6 bg-gray-50 rounded-xl p-6">
        <h3 className="text-lg font-bold text-gray-900 mb-4">Test Actions</h3>
        <div className="grid grid-cols-2 gap-3">
          <button
            onClick={() => changeHappiness(10, 'Played together')}
            className="py-3 bg-green-500 text-white rounded-lg font-bold hover:bg-green-600 transition-colors"
          >
            +10 Play
          </button>
          <button
            onClick={() => changeHappiness(20, 'Got a treat')}
            className="py-3 bg-blue-500 text-white rounded-lg font-bold hover:bg-blue-600 transition-colors"
          >
            +20 Treat
          </button>
          <button
            onClick={() => changeHappiness(-10, 'Feeling lonely')}
            className="py-3 bg-orange-500 text-white rounded-lg font-bold hover:bg-orange-600 transition-colors"
          >
            -10 Lonely
          </button>
          <button
            onClick={() => changeHappiness(-20, 'Hungry')}
            className="py-3 bg-red-500 text-white rounded-lg font-bold hover:bg-red-600 transition-colors"
          >
            -20 Hungry
          </button>
        </div>
      </div>

      {/* Recent factors */}
      {factors.length > 0 && (
        <div className="mb-6 bg-gray-50 rounded-xl p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-bold text-gray-900">Recent Factors</h3>
            <button
              onClick={clearFactors}
              className="text-sm text-red-600 hover:text-red-700 font-bold"
            >
              Clear
            </button>
          </div>

          <div className="space-y-2">
            {factors.slice(-5).reverse().map((factor, index) => (
              <motion.div
                key={factor.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: settings.reducedMotion ? 0 : index * 0.05 }}
                className={`flex items-center justify-between p-3 rounded-lg ${
                  factor.impact > 0 ? 'bg-green-50' : 'bg-red-50'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className="text-2xl">{factor.icon}</div>
                  <div>
                    <div className="font-bold text-gray-900">{factor.name}</div>
                    <div className="text-xs text-gray-600">{factor.description}</div>
                  </div>
                </div>
                <div className={`text-lg font-bold ${
                  factor.impact > 0 ? 'text-green-600' : 'text-red-600'
                }`}>
                  {factor.impact > 0 ? '+' : ''}{factor.impact}
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      )}

      {/* History graph (simple) */}
      {history.length > 0 && (
        <div className="mb-6 bg-gray-50 rounded-xl p-6">
          <h3 className="text-lg font-bold text-gray-900 mb-4">Happiness History</h3>

          <div className="flex items-end gap-1 h-32">
            {history.slice(-20).map((entry, i) => (
              <div
                key={i}
                className="flex-1 bg-primary-500 rounded-t"
                style={{
                  height: `${entry.happiness}%`,
                  opacity: 0.5 + (i / history.length) * 0.5,
                }}
                title={`${entry.happiness}% at ${entry.timestamp.toLocaleTimeString()}`}
              />
            ))}
          </div>

          <div className="flex justify-between text-xs text-gray-600 mt-2">
            <span>Earlier</span>
            <span>Recent</span>
          </div>
        </div>
      )}

      <div className="bg-purple-50 rounded-xl p-6">
        <h3 className="text-lg font-bold text-purple-900 mb-3">
          Happiness Tips
        </h3>
        <ul className="space-y-2 text-sm text-purple-800">
          <li>• Play with your pet regularly to boost happiness</li>
          <li>• Feed them their favorite foods</li>
          <li>• Pet them often for small happiness boosts</li>
          <li>• Don't leave them alone for too long</li>
          <li>• Keep all stats (hunger, energy) balanced</li>
        </ul>
      </div>
    </div>
  );
}

// Compact happiness display
export function HappinessDisplay({ happiness }: { happiness: number }) {
  const getMoodIcon = () => {
    if (happiness >= 90) return '🤩';
    if (happiness >= 70) return '😄';
    if (happiness >= 50) return '😊';
    if (happiness >= 30) return '😐';
    if (happiness >= 10) return '😢';
    return '😭';
  };

  const getMoodColor = () => {
    if (happiness >= 70) return 'from-green-400 to-green-600';
    if (happiness >= 50) return 'from-blue-400 to-blue-600';
    if (happiness >= 30) return 'from-yellow-400 to-yellow-600';
    return 'from-red-400 to-red-600';
  };

  return (
    <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r ${getMoodColor()} text-white shadow-md`}>
      <span className="text-2xl">{getMoodIcon()}</span>
      <div>
        <div className="text-xs opacity-90">Happiness</div>
        <div className="font-bold">{happiness}%</div>
      </div>
    </div>
  );
}

// Mood indicator
export function MoodIndicator({ mood }: { mood: Mood }) {
  return (
    <div className={`inline-flex items-center gap-3 px-6 py-3 rounded-2xl bg-gradient-to-r ${mood.color} text-white shadow-lg`}>
      <span className="text-4xl">{mood.icon}</span>
      <div>
        <div className="font-bold text-lg">{mood.level.toUpperCase()}</div>
        <div className="text-sm opacity-90">{mood.message}</div>
      </div>
    </div>
  );
}
