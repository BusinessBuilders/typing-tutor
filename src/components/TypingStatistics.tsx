/**
 * Typing Statistics Component
 * Step 245 - Build comprehensive typing statistics
 */

import { motion } from 'framer-motion';
import { useState } from 'react';
import { useSettingsStore } from '../store/useSettingsStore';

// Comprehensive statistics interface
export interface TypingStatistics {
  overall: {
    totalSessions: number;
    totalTime: number; // minutes
    totalKeystrokes: number;
    totalWords: number;
    averageWPM: number;
    averageAccuracy: number;
    bestWPM: number;
    bestAccuracy: number;
  };
  speed: {
    currentWPM: number;
    last7DaysAvg: number;
    last30DaysAvg: number;
    allTimeAvg: number;
    improvement: number; // percentage
    percentile: number; // compared to all users
  };
  accuracy: {
    currentAccuracy: number;
    last7DaysAvg: number;
    last30DaysAvg: number;
    allTimeAvg: number;
    improvement: number;
    totalErrors: number;
  };
  consistency: {
    score: number; // 0-100
    varianceWPM: number;
    varianceAccuracy: number;
    streakQuality: number; // 0-100
  };
  progress: {
    lessonsCompleted: number;
    lessonsTotal: number;
    hoursSpent: number;
    daysActive: number;
    averageSessionLength: number; // minutes
  };
  milestones: {
    name: string;
    achieved: boolean;
    achievedAt?: Date;
    progress: number; // 0-100
    target: number;
    current: number;
  }[];
}

// Mock statistics data
const MOCK_STATISTICS: TypingStatistics = {
  overall: {
    totalSessions: 127,
    totalTime: 1847,
    totalKeystrokes: 245678,
    totalWords: 49135,
    averageWPM: 68,
    averageAccuracy: 94.5,
    bestWPM: 92,
    bestAccuracy: 99.2,
  },
  speed: {
    currentWPM: 72,
    last7DaysAvg: 70,
    last30DaysAvg: 68,
    allTimeAvg: 65,
    improvement: 10.8,
    percentile: 75,
  },
  accuracy: {
    currentAccuracy: 95.5,
    last7DaysAvg: 94.8,
    last30DaysAvg: 94.2,
    allTimeAvg: 93.5,
    improvement: 2.1,
    totalErrors: 2456,
  },
  consistency: {
    score: 82,
    varianceWPM: 8.5,
    varianceAccuracy: 3.2,
    streakQuality: 75,
  },
  progress: {
    lessonsCompleted: 127,
    lessonsTotal: 150,
    hoursSpent: 30.8,
    daysActive: 45,
    averageSessionLength: 14.5,
  },
  milestones: [
    {
      name: '50 WPM',
      achieved: true,
      achievedAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
      progress: 100,
      target: 50,
      current: 72,
    },
    {
      name: '75 WPM',
      achieved: false,
      progress: 96,
      target: 75,
      current: 72,
    },
    {
      name: '100 WPM',
      achieved: false,
      progress: 72,
      target: 100,
      current: 72,
    },
    {
      name: '95% Accuracy',
      achieved: true,
      achievedAt: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000),
      progress: 100,
      target: 95,
      current: 95.5,
    },
    {
      name: '100 Lessons',
      achieved: true,
      achievedAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
      progress: 100,
      target: 100,
      current: 127,
    },
  ],
};

// Custom hook for statistics
export function useTypingStatistics() {
  const [stats] = useState<TypingStatistics>(MOCK_STATISTICS);
  const [selectedCategory, setSelectedCategory] = useState<'overall' | 'speed' | 'accuracy' | 'progress'>('overall');

  const formatTime = (minutes: number): string => {
    const hours = Math.floor(minutes / 60);
    const mins = Math.floor(minutes % 60);
    if (hours > 0) return `${hours}h ${mins}m`;
    return `${mins}m`;
  };

  const formatNumber = (num: number): string => {
    return num.toLocaleString();
  };

  const getGradeFromScore = (score: number): { grade: string; color: string } => {
    if (score >= 95) return { grade: 'A+', color: 'from-green-500 to-emerald-600' };
    if (score >= 90) return { grade: 'A', color: 'from-green-400 to-green-600' };
    if (score >= 85) return { grade: 'B+', color: 'from-blue-400 to-blue-600' };
    if (score >= 80) return { grade: 'B', color: 'from-blue-300 to-blue-500' };
    if (score >= 75) return { grade: 'C+', color: 'from-yellow-400 to-yellow-600' };
    if (score >= 70) return { grade: 'C', color: 'from-yellow-300 to-yellow-500' };
    return { grade: 'D', color: 'from-red-400 to-red-600' };
  };

  return {
    stats,
    selectedCategory,
    setSelectedCategory,
    formatTime,
    formatNumber,
    getGradeFromScore,
  };
}

// Main statistics component
export default function TypingStatistics() {
  const {
    stats,
    selectedCategory,
    setSelectedCategory,
    formatTime,
    formatNumber,
    getGradeFromScore,
  } = useTypingStatistics();

  const { settings } = useSettingsStore();
  const consistencyGrade = getGradeFromScore(stats.consistency.score);

  return (
    <div className="bg-white rounded-2xl shadow-xl p-8">
      <h2 className="text-2xl font-bold text-gray-800 mb-6 text-center">
        📈 Typing Statistics
      </h2>

      {/* Overall grade */}
      <div className="mb-8 bg-gradient-to-r from-purple-400 to-pink-500 rounded-2xl p-8 text-white text-center">
        <div className="text-6xl font-bold mb-4">
          {consistencyGrade.grade}
        </div>
        <div className="text-2xl mb-2">Overall Performance</div>
        <div className="text-lg opacity-90">
          Consistency Score: {stats.consistency.score}/100
        </div>
      </div>

      {/* Category selector */}
      <div className="mb-8 flex gap-2 flex-wrap justify-center">
        {[
          { key: 'overall', label: 'Overall', icon: '📊' },
          { key: 'speed', label: 'Speed', icon: '⚡' },
          { key: 'accuracy', label: 'Accuracy', icon: '🎯' },
          { key: 'progress', label: 'Progress', icon: '📈' },
        ].map(({ key, label, icon }) => (
          <button
            key={key}
            onClick={() => setSelectedCategory(key as typeof selectedCategory)}
            className={`px-6 py-3 rounded-lg font-bold transition-colors ${
              selectedCategory === key
                ? 'bg-purple-500 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            {icon} {label}
          </button>
        ))}
      </div>

      {/* Overall statistics */}
      {selectedCategory === 'overall' && (
        <div className="space-y-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-gradient-to-br from-blue-400 to-blue-600 rounded-xl p-6 text-white"
            >
              <div className="text-sm opacity-90 mb-1">Total Sessions</div>
              <div className="text-4xl font-bold">{stats.overall.totalSessions}</div>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: settings.reducedMotion ? 0 : 0.1 }}
              className="bg-gradient-to-br from-green-400 to-green-600 rounded-xl p-6 text-white"
            >
              <div className="text-sm opacity-90 mb-1">Total Time</div>
              <div className="text-4xl font-bold">{formatTime(stats.overall.totalTime)}</div>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: settings.reducedMotion ? 0 : 0.2 }}
              className="bg-gradient-to-br from-purple-400 to-purple-600 rounded-xl p-6 text-white"
            >
              <div className="text-sm opacity-90 mb-1">Total Words</div>
              <div className="text-4xl font-bold">{formatNumber(stats.overall.totalWords)}</div>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: settings.reducedMotion ? 0 : 0.3 }}
              className="bg-gradient-to-br from-orange-400 to-red-600 rounded-xl p-6 text-white"
            >
              <div className="text-sm opacity-90 mb-1">Total Keystrokes</div>
              <div className="text-4xl font-bold">{formatNumber(stats.overall.totalKeystrokes)}</div>
            </motion.div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-gray-50 rounded-xl p-6">
              <h3 className="text-lg font-bold text-gray-900 mb-4">Best Performance</h3>
              <div className="space-y-3">
                <div className="flex items-center justify-between p-3 bg-white rounded-lg">
                  <span className="text-gray-700">Best Speed</span>
                  <span className="text-2xl font-bold text-purple-600">{stats.overall.bestWPM} WPM</span>
                </div>
                <div className="flex items-center justify-between p-3 bg-white rounded-lg">
                  <span className="text-gray-700">Best Accuracy</span>
                  <span className="text-2xl font-bold text-green-600">{stats.overall.bestAccuracy}%</span>
                </div>
              </div>
            </div>

            <div className="bg-gray-50 rounded-xl p-6">
              <h3 className="text-lg font-bold text-gray-900 mb-4">Average Performance</h3>
              <div className="space-y-3">
                <div className="flex items-center justify-between p-3 bg-white rounded-lg">
                  <span className="text-gray-700">Average Speed</span>
                  <span className="text-2xl font-bold text-blue-600">{stats.overall.averageWPM} WPM</span>
                </div>
                <div className="flex items-center justify-between p-3 bg-white rounded-lg">
                  <span className="text-gray-700">Average Accuracy</span>
                  <span className="text-2xl font-bold text-teal-600">{stats.overall.averageAccuracy}%</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Speed statistics */}
      {selectedCategory === 'speed' && (
        <div className="space-y-6">
          <div className="bg-gradient-to-br from-purple-400 to-purple-600 rounded-xl p-6 text-white">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-sm opacity-90 mb-1">Current Speed</div>
                <div className="text-5xl font-bold">{stats.speed.currentWPM} WPM</div>
              </div>
              <div className="text-6xl">⚡</div>
            </div>
            <div className="mt-4 flex items-center gap-2">
              <span className="text-sm opacity-90">Improvement:</span>
              <span className="text-lg font-bold text-green-200">
                +{stats.speed.improvement}%
              </span>
              <span className="text-sm opacity-90">• Top {100 - stats.speed.percentile}% globally</span>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-gray-50 rounded-xl p-6 text-center">
              <div className="text-sm text-gray-600 mb-2">Last 7 Days</div>
              <div className="text-4xl font-bold text-blue-600">{stats.speed.last7DaysAvg}</div>
              <div className="text-sm text-gray-600">WPM</div>
            </div>
            <div className="bg-gray-50 rounded-xl p-6 text-center">
              <div className="text-sm text-gray-600 mb-2">Last 30 Days</div>
              <div className="text-4xl font-bold text-green-600">{stats.speed.last30DaysAvg}</div>
              <div className="text-sm text-gray-600">WPM</div>
            </div>
            <div className="bg-gray-50 rounded-xl p-6 text-center">
              <div className="text-sm text-gray-600 mb-2">All Time</div>
              <div className="text-4xl font-bold text-purple-600">{stats.speed.allTimeAvg}</div>
              <div className="text-sm text-gray-600">WPM</div>
            </div>
          </div>
        </div>
      )}

      {/* Accuracy statistics */}
      {selectedCategory === 'accuracy' && (
        <div className="space-y-6">
          <div className="bg-gradient-to-br from-green-400 to-teal-600 rounded-xl p-6 text-white">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-sm opacity-90 mb-1">Current Accuracy</div>
                <div className="text-5xl font-bold">{stats.accuracy.currentAccuracy}%</div>
              </div>
              <div className="text-6xl">🎯</div>
            </div>
            <div className="mt-4 flex items-center gap-2">
              <span className="text-sm opacity-90">Improvement:</span>
              <span className="text-lg font-bold text-green-200">
                +{stats.accuracy.improvement}%
              </span>
              <span className="text-sm opacity-90">• {formatNumber(stats.accuracy.totalErrors)} total errors</span>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-gray-50 rounded-xl p-6 text-center">
              <div className="text-sm text-gray-600 mb-2">Last 7 Days</div>
              <div className="text-4xl font-bold text-blue-600">{stats.accuracy.last7DaysAvg}%</div>
            </div>
            <div className="bg-gray-50 rounded-xl p-6 text-center">
              <div className="text-sm text-gray-600 mb-2">Last 30 Days</div>
              <div className="text-4xl font-bold text-green-600">{stats.accuracy.last30DaysAvg}%</div>
            </div>
            <div className="bg-gray-50 rounded-xl p-6 text-center">
              <div className="text-sm text-gray-600 mb-2">All Time</div>
              <div className="text-4xl font-bold text-purple-600">{stats.accuracy.allTimeAvg}%</div>
            </div>
          </div>
        </div>
      )}

      {/* Progress statistics */}
      {selectedCategory === 'progress' && (
        <div className="space-y-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-gradient-to-br from-blue-400 to-blue-600 rounded-xl p-6 text-white">
              <div className="text-sm opacity-90 mb-1">Lessons</div>
              <div className="text-3xl font-bold">
                {stats.progress.lessonsCompleted}/{stats.progress.lessonsTotal}
              </div>
            </div>
            <div className="bg-gradient-to-br from-green-400 to-green-600 rounded-xl p-6 text-white">
              <div className="text-sm opacity-90 mb-1">Hours Spent</div>
              <div className="text-3xl font-bold">{stats.progress.hoursSpent.toFixed(1)}</div>
            </div>
            <div className="bg-gradient-to-br from-purple-400 to-purple-600 rounded-xl p-6 text-white">
              <div className="text-sm opacity-90 mb-1">Days Active</div>
              <div className="text-3xl font-bold">{stats.progress.daysActive}</div>
            </div>
            <div className="bg-gradient-to-br from-orange-400 to-red-600 rounded-xl p-6 text-white">
              <div className="text-sm opacity-90 mb-1">Avg Session</div>
              <div className="text-3xl font-bold">{stats.progress.averageSessionLength.toFixed(1)}m</div>
            </div>
          </div>

          {/* Milestones */}
          <div className="bg-gray-50 rounded-xl p-6">
            <h3 className="text-lg font-bold text-gray-900 mb-4">Milestones</h3>
            <div className="space-y-3">
              {stats.milestones.map((milestone, index) => (
                <motion.div
                  key={milestone.name}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: settings.reducedMotion ? 0 : index * 0.05 }}
                  className={`p-4 rounded-lg ${
                    milestone.achieved ? 'bg-green-50' : 'bg-white'
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-3">
                      <div className="text-2xl">
                        {milestone.achieved ? '✅' : '⏳'}
                      </div>
                      <div>
                        <div className="font-bold text-gray-900">{milestone.name}</div>
                        {milestone.achieved && milestone.achievedAt && (
                          <div className="text-sm text-gray-600">
                            Achieved {milestone.achievedAt.toLocaleDateString()}
                          </div>
                        )}
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-lg font-bold text-purple-600">
                        {milestone.current}/{milestone.target}
                      </div>
                    </div>
                  </div>
                  <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${milestone.progress}%` }}
                      transition={{ duration: settings.reducedMotion ? 0 : 1, delay: index * 0.1 }}
                      className={`h-full ${
                        milestone.achieved
                          ? 'bg-gradient-to-r from-green-400 to-green-600'
                          : 'bg-gradient-to-r from-purple-400 to-purple-600'
                      }`}
                    />
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Consistency breakdown */}
      <div className="mt-8 bg-gray-50 rounded-xl p-6">
        <h3 className="text-lg font-bold text-gray-900 mb-4">Consistency Analysis</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <div className="text-sm text-gray-600 mb-2">Speed Variance</div>
            <div className="text-3xl font-bold text-blue-600">±{stats.consistency.varianceWPM}</div>
            <div className="text-sm text-gray-600">WPM</div>
          </div>
          <div>
            <div className="text-sm text-gray-600 mb-2">Accuracy Variance</div>
            <div className="text-3xl font-bold text-green-600">±{stats.consistency.varianceAccuracy}</div>
            <div className="text-sm text-gray-600">%</div>
          </div>
          <div>
            <div className="text-sm text-gray-600 mb-2">Streak Quality</div>
            <div className="text-3xl font-bold text-purple-600">{stats.consistency.streakQuality}</div>
            <div className="text-sm text-gray-600">/100</div>
          </div>
        </div>
      </div>
    </div>
  );
}
