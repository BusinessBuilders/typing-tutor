/**
 * Summaries Component
 * Step 261 - Create comprehensive session and progress summaries
 */

import { motion } from 'framer-motion';
import { useState } from 'react';
import { useSettingsStore } from '../store/useSettingsStore';

// Summary period type
export type SummaryPeriod = 'session' | 'daily' | 'weekly' | 'monthly' | 'all-time';

// Session summary
export interface SessionSummary {
  id: string;
  date: Date;
  duration: number; // seconds
  activityType: string;
  wpm: number;
  accuracy: number;
  totalKeystrokes: number;
  errors: number;
  improvements: string[];
  highlights: string[];
}

// Period summary
export interface PeriodSummary {
  period: SummaryPeriod;
  startDate: Date;
  endDate: Date;
  totalSessions: number;
  totalTime: number; // minutes
  averageWPM: number;
  bestWPM: number;
  averageAccuracy: number;
  bestAccuracy: number;
  totalKeystrokes: number;
  lessonsCompleted: number;
  achievementsEarned: number;
  streak: number;
  topImprovement: string;
  areasForFocus: string[];
}

// Key achievement
export interface KeyAchievement {
  title: string;
  description: string;
  date: Date;
  icon: string;
}

// Performance trend
export interface PerformanceTrend {
  metric: string;
  direction: 'up' | 'down' | 'stable';
  change: number;
  description: string;
}

// Mock session summary
const generateMockSessionSummary = (): SessionSummary => {
  return {
    id: 'session-latest',
    date: new Date(),
    duration: 900, // 15 minutes
    activityType: 'Speed Practice',
    wpm: 72,
    accuracy: 94.5,
    totalKeystrokes: 1080,
    errors: 59,
    improvements: [
      'Improved speed by 5 WPM',
      'Better accuracy on home row',
      'Fewer errors on E and A keys',
    ],
    highlights: [
      'Personal best on speed drill!',
      'Completed session without breaks',
      'Maintained 90%+ accuracy throughout',
    ],
  };
};

// Mock period summaries
const generateMockPeriodSummaries = (): Record<SummaryPeriod, PeriodSummary> => {
  const now = new Date();

  return {
    session: {
      period: 'session',
      startDate: new Date(now.getTime() - 15 * 60 * 1000),
      endDate: now,
      totalSessions: 1,
      totalTime: 15,
      averageWPM: 72,
      bestWPM: 72,
      averageAccuracy: 94.5,
      bestAccuracy: 94.5,
      totalKeystrokes: 1080,
      lessonsCompleted: 0,
      achievementsEarned: 0,
      streak: 8,
      topImprovement: 'Speed increased by 5 WPM',
      areasForFocus: ['Number keys', 'Special characters'],
    },
    daily: {
      period: 'daily',
      startDate: new Date(now.getFullYear(), now.getMonth(), now.getDate()),
      endDate: now,
      totalSessions: 2,
      totalTime: 32,
      averageWPM: 71,
      bestWPM: 74,
      averageAccuracy: 93.8,
      bestAccuracy: 95.2,
      totalKeystrokes: 2240,
      lessonsCompleted: 1,
      achievementsEarned: 1,
      streak: 8,
      topImprovement: 'Accuracy improved by 2.5%',
      areasForFocus: ['Number row practice', 'Consistency'],
    },
    weekly: {
      period: 'weekly',
      startDate: new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000),
      endDate: now,
      totalSessions: 12,
      totalTime: 185,
      averageWPM: 70,
      bestWPM: 76,
      averageAccuracy: 93.2,
      bestAccuracy: 96.1,
      totalKeystrokes: 12950,
      lessonsCompleted: 3,
      achievementsEarned: 2,
      streak: 8,
      topImprovement: 'Speed increased by 8 WPM',
      areasForFocus: ['Number keys', 'Endurance', 'Special characters'],
    },
    monthly: {
      period: 'monthly',
      startDate: new Date(now.getFullYear(), now.getMonth(), 1),
      endDate: now,
      totalSessions: 48,
      totalTime: 745,
      averageWPM: 68,
      bestWPM: 76,
      averageAccuracy: 92.5,
      bestAccuracy: 96.1,
      totalKeystrokes: 50600,
      lessonsCompleted: 12,
      achievementsEarned: 7,
      streak: 8,
      topImprovement: 'Consistent practice habit',
      areasForFocus: ['Number keys', 'Speed consistency'],
    },
    'all-time': {
      period: 'all-time',
      startDate: new Date(now.getTime() - 60 * 24 * 60 * 60 * 1000),
      endDate: now,
      totalSessions: 92,
      totalTime: 1425,
      averageWPM: 65,
      bestWPM: 76,
      averageAccuracy: 91.2,
      bestAccuracy: 96.1,
      totalKeystrokes: 97150,
      lessonsCompleted: 24,
      achievementsEarned: 15,
      streak: 8,
      topImprovement: 'Overall speed increased by 20 WPM',
      areasForFocus: ['Advanced lessons', 'Speed optimization'],
    },
  };
};

// Mock achievements
const generateMockKeyAchievements = (): KeyAchievement[] => {
  const now = Date.now();
  return [
    {
      title: '7-Day Streak',
      description: 'Practiced for 7 consecutive days',
      date: new Date(now - 1 * 24 * 60 * 60 * 1000),
      icon: '🔥',
    },
    {
      title: '70 WPM Milestone',
      description: 'Reached 70 words per minute',
      date: new Date(now - 3 * 24 * 60 * 60 * 1000),
      icon: '⚡',
    },
    {
      title: 'Perfect Accuracy',
      description: 'Achieved 100% accuracy on a lesson',
      date: new Date(now - 5 * 24 * 60 * 60 * 1000),
      icon: '🎯',
    },
  ];
};

// Mock trends
const generateMockTrends = (): PerformanceTrend[] => {
  return [
    {
      metric: 'Typing Speed',
      direction: 'up',
      change: 10.8,
      description: 'Speed has increased steadily this week',
    },
    {
      metric: 'Accuracy',
      direction: 'up',
      change: 2.5,
      description: 'Fewer mistakes overall',
    },
    {
      metric: 'Practice Time',
      direction: 'down',
      change: -12.5,
      description: 'Practicing less than previous week',
    },
    {
      metric: 'Consistency',
      direction: 'stable',
      change: 0.8,
      description: 'Performance is stable',
    },
  ];
};

// Custom hook for summaries
export function useSummaries() {
  const [selectedPeriod, setSelectedPeriod] = useState<SummaryPeriod>('weekly');
  const [sessionSummary] = useState<SessionSummary>(generateMockSessionSummary());
  const [periodSummaries] = useState(generateMockPeriodSummaries());
  const [keyAchievements] = useState<KeyAchievement[]>(generateMockKeyAchievements());
  const [trends] = useState<PerformanceTrend[]>(generateMockTrends());

  const getCurrentSummary = () => {
    return periodSummaries[selectedPeriod];
  };

  return {
    selectedPeriod,
    setSelectedPeriod,
    sessionSummary,
    currentSummary: getCurrentSummary(),
    keyAchievements,
    trends,
  };
}

// Format duration
const formatDuration = (seconds: number): string => {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const secs = seconds % 60;

  if (hours > 0) return `${hours}h ${minutes}m`;
  if (minutes > 0) return `${minutes}m ${secs}s`;
  return `${secs}s`;
};

// Get trend icon
const getTrendIcon = (direction: 'up' | 'down' | 'stable'): string => {
  switch (direction) {
    case 'up': return '📈';
    case 'down': return '📉';
    case 'stable': return '➡️';
  }
};

// Get trend color
const getTrendColor = (direction: 'up' | 'down' | 'stable'): string => {
  switch (direction) {
    case 'up': return 'text-green-600';
    case 'down': return 'text-red-600';
    case 'stable': return 'text-gray-600';
  }
};

// Main summaries component
export default function Summaries() {
  const {
    selectedPeriod,
    setSelectedPeriod,
    sessionSummary,
    currentSummary,
    keyAchievements,
    trends,
  } = useSummaries();

  const { settings } = useSettingsStore();

  return (
    <div className="bg-white rounded-2xl shadow-xl p-8">
      <h2 className="text-2xl font-bold text-gray-800 mb-6 text-center">
        📊 Progress Summaries
      </h2>

      {/* Period selector */}
      <div className="mb-8 flex gap-2 flex-wrap justify-center">
        {[
          { period: 'session' as const, label: 'Last Session' },
          { period: 'daily' as const, label: 'Today' },
          { period: 'weekly' as const, label: 'This Week' },
          { period: 'monthly' as const, label: 'This Month' },
          { period: 'all-time' as const, label: 'All Time' },
        ].map(({ period, label }) => (
          <button
            key={period}
            onClick={() => setSelectedPeriod(period)}
            className={`px-6 py-3 rounded-lg font-bold transition-colors ${
              selectedPeriod === period
                ? 'bg-purple-500 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      {/* Header card */}
      <div className="mb-8 bg-gradient-to-br from-purple-400 to-purple-600 rounded-xl p-6 text-white">
        <div className="text-center mb-4">
          <div className="text-5xl mb-3">📈</div>
          <div className="text-3xl font-bold mb-2 capitalize">
            {selectedPeriod === 'all-time' ? 'All Time' : selectedPeriod} Summary
          </div>
          <div className="text-lg opacity-90">
            {currentSummary.startDate.toLocaleDateString()} - {currentSummary.endDate.toLocaleDateString()}
          </div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <div className="bg-white/20 rounded-lg p-3 text-center">
            <div className="text-sm opacity-90">Sessions</div>
            <div className="text-2xl font-bold">{currentSummary.totalSessions}</div>
          </div>
          <div className="bg-white/20 rounded-lg p-3 text-center">
            <div className="text-sm opacity-90">Total Time</div>
            <div className="text-2xl font-bold">{currentSummary.totalTime}m</div>
          </div>
          <div className="bg-white/20 rounded-lg p-3 text-center">
            <div className="text-sm opacity-90">Avg Speed</div>
            <div className="text-2xl font-bold">{currentSummary.averageWPM} WPM</div>
          </div>
          <div className="bg-white/20 rounded-lg p-3 text-center">
            <div className="text-sm opacity-90">Avg Accuracy</div>
            <div className="text-2xl font-bold">{currentSummary.averageAccuracy.toFixed(1)}%</div>
          </div>
        </div>
      </div>

      {/* Key metrics grid */}
      <div className="mb-8 grid grid-cols-2 md:grid-cols-3 gap-4">
        <div className="bg-green-50 rounded-xl p-4 border-2 border-green-200">
          <div className="text-green-600 text-sm font-bold mb-1">Best Speed</div>
          <div className="text-3xl font-bold text-gray-900">{currentSummary.bestWPM}</div>
          <div className="text-sm text-gray-600">WPM</div>
        </div>

        <div className="bg-blue-50 rounded-xl p-4 border-2 border-blue-200">
          <div className="text-blue-600 text-sm font-bold mb-1">Best Accuracy</div>
          <div className="text-3xl font-bold text-gray-900">{currentSummary.bestAccuracy.toFixed(1)}</div>
          <div className="text-sm text-gray-600">%</div>
        </div>

        <div className="bg-purple-50 rounded-xl p-4 border-2 border-purple-200">
          <div className="text-purple-600 text-sm font-bold mb-1">Keystrokes</div>
          <div className="text-3xl font-bold text-gray-900">{currentSummary.totalKeystrokes.toLocaleString()}</div>
          <div className="text-sm text-gray-600">total</div>
        </div>

        <div className="bg-yellow-50 rounded-xl p-4 border-2 border-yellow-200">
          <div className="text-yellow-600 text-sm font-bold mb-1">Lessons</div>
          <div className="text-3xl font-bold text-gray-900">{currentSummary.lessonsCompleted}</div>
          <div className="text-sm text-gray-600">completed</div>
        </div>

        <div className="bg-orange-50 rounded-xl p-4 border-2 border-orange-200">
          <div className="text-orange-600 text-sm font-bold mb-1">Achievements</div>
          <div className="text-3xl font-bold text-gray-900">{currentSummary.achievementsEarned}</div>
          <div className="text-sm text-gray-600">earned</div>
        </div>

        <div className="bg-red-50 rounded-xl p-4 border-2 border-red-200">
          <div className="text-red-600 text-sm font-bold mb-1">Current Streak</div>
          <div className="text-3xl font-bold text-gray-900">{currentSummary.streak}</div>
          <div className="text-sm text-gray-600">days</div>
        </div>
      </div>

      {/* Top improvement */}
      <div className="mb-8 bg-gradient-to-br from-green-400 to-emerald-500 rounded-xl p-6 text-white">
        <div className="flex items-center gap-4">
          <div className="text-5xl">🎉</div>
          <div>
            <div className="text-sm opacity-90 mb-1">Top Improvement</div>
            <div className="text-2xl font-bold">{currentSummary.topImprovement}</div>
          </div>
        </div>
      </div>

      {/* Performance trends */}
      <div className="mb-8 bg-gray-50 rounded-xl p-6">
        <h3 className="text-lg font-bold text-gray-900 mb-4">Performance Trends</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {trends.map((trend, index) => (
            <motion.div
              key={trend.metric}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: settings.reducedMotion ? 0 : index * 0.05 }}
              className="bg-white rounded-lg p-4 flex items-center justify-between"
            >
              <div className="flex items-center gap-3">
                <div className="text-3xl">{getTrendIcon(trend.direction)}</div>
                <div>
                  <div className="font-bold text-gray-900">{trend.metric}</div>
                  <div className="text-sm text-gray-600">{trend.description}</div>
                </div>
              </div>
              <div className={`text-xl font-bold ${getTrendColor(trend.direction)}`}>
                {trend.change > 0 ? '+' : ''}{trend.change.toFixed(1)}%
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Key achievements */}
      {keyAchievements.length > 0 && (
        <div className="mb-8 bg-gray-50 rounded-xl p-6">
          <h3 className="text-lg font-bold text-gray-900 mb-4">Recent Achievements</h3>
          <div className="space-y-3">
            {keyAchievements.map((achievement, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: settings.reducedMotion ? 0 : index * 0.1 }}
                className="bg-yellow-50 border-2 border-yellow-200 rounded-lg p-4 flex items-center gap-4"
              >
                <div className="text-4xl">{achievement.icon}</div>
                <div className="flex-1">
                  <div className="font-bold text-gray-900">{achievement.title}</div>
                  <div className="text-sm text-gray-600">{achievement.description}</div>
                </div>
                <div className="text-xs text-gray-500">
                  {achievement.date.toLocaleDateString()}
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      )}

      {/* Areas for focus */}
      <div className="bg-blue-50 border-2 border-blue-200 rounded-xl p-6">
        <h3 className="text-lg font-bold text-gray-900 mb-4">💡 Suggested Focus Areas</h3>
        <div className="space-y-2">
          {currentSummary.areasForFocus.map((area, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: settings.reducedMotion ? 0 : index * 0.05 }}
              className="flex items-center gap-2 text-gray-700"
            >
              <div className="text-blue-600 font-bold">▸</div>
              <div>{area}</div>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Session details (if session view) */}
      {selectedPeriod === 'session' && (
        <div className="mt-8 bg-gray-50 rounded-xl p-6">
          <h3 className="text-lg font-bold text-gray-900 mb-4">Session Details</h3>

          <div className="mb-6 grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-white rounded-lg p-3">
              <div className="text-xs text-gray-600">Duration</div>
              <div className="text-xl font-bold text-gray-900">{formatDuration(sessionSummary.duration)}</div>
            </div>
            <div className="bg-white rounded-lg p-3">
              <div className="text-xs text-gray-600">Activity</div>
              <div className="text-xl font-bold text-gray-900">{sessionSummary.activityType}</div>
            </div>
            <div className="bg-white rounded-lg p-3">
              <div className="text-xs text-gray-600">Keystrokes</div>
              <div className="text-xl font-bold text-gray-900">{sessionSummary.totalKeystrokes}</div>
            </div>
            <div className="bg-white rounded-lg p-3">
              <div className="text-xs text-gray-600">Errors</div>
              <div className="text-xl font-bold text-gray-900">{sessionSummary.errors}</div>
            </div>
          </div>

          {sessionSummary.improvements.length > 0 && (
            <div className="mb-4">
              <div className="text-sm font-bold text-gray-700 mb-2">Improvements:</div>
              <ul className="space-y-1">
                {sessionSummary.improvements.map((improvement, i) => (
                  <li key={i} className="text-sm text-gray-600 flex items-start gap-2">
                    <span className="text-green-600">✓</span>
                    <span>{improvement}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {sessionSummary.highlights.length > 0 && (
            <div>
              <div className="text-sm font-bold text-gray-700 mb-2">Highlights:</div>
              <ul className="space-y-1">
                {sessionSummary.highlights.map((highlight, i) => (
                  <li key={i} className="text-sm text-gray-600 flex items-start gap-2">
                    <span className="text-yellow-600">⭐</span>
                    <span>{highlight}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
