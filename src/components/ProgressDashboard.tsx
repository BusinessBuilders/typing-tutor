/**
 * Progress Dashboard Component
 * Step 241 - Create comprehensive progress dashboard
 */

import { motion } from 'framer-motion';
import { useState } from 'react';
import { useSettingsStore } from '../store/useSettingsStore';

// User progress data interface
export interface UserProgress {
  userId: string;
  username: string;
  level: number;
  xp: number;
  xpToNextLevel: number;
  totalLessons: number;
  completedLessons: number;
  totalPracticeTime: number; // in minutes
  averageWPM: number;
  bestWPM: number;
  averageAccuracy: number;
  currentStreak: number;
  longestStreak: number;
  achievements: number;
  badges: number;
  stickers: number;
  cards: number;
  lastActive: Date;
  joinDate: Date;
}

// Recent activity interface
export interface RecentActivity {
  id: string;
  type: 'lesson' | 'achievement' | 'level_up' | 'streak' | 'unlock';
  title: string;
  description: string;
  icon: string;
  timestamp: Date;
  color: string;
}

// Quick stats interface
export interface QuickStat {
  label: string;
  value: string | number;
  icon: string;
  change?: number; // Percentage change
  color: string;
}

// Mock user progress data
const MOCK_PROGRESS: UserProgress = {
  userId: '1',
  username: 'Tyler',
  level: 42,
  xp: 15750,
  xpToNextLevel: 18000,
  totalLessons: 150,
  completedLessons: 127,
  totalPracticeTime: 1847, // minutes
  averageWPM: 68,
  bestWPM: 92,
  averageAccuracy: 94.5,
  currentStreak: 7,
  longestStreak: 23,
  achievements: 45,
  badges: 18,
  stickers: 67,
  cards: 12,
  lastActive: new Date(),
  joinDate: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000), // 90 days ago
};

// Mock recent activities
const MOCK_ACTIVITIES: RecentActivity[] = [
  {
    id: '1',
    type: 'level_up',
    title: 'Level Up!',
    description: 'Reached Level 42',
    icon: '🎉',
    timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000),
    color: 'from-yellow-400 to-orange-500',
  },
  {
    id: '2',
    type: 'achievement',
    title: 'Speed Demon',
    description: 'Achieved 90+ WPM',
    icon: '⚡',
    timestamp: new Date(Date.now() - 5 * 60 * 60 * 1000),
    color: 'from-purple-400 to-pink-500',
  },
  {
    id: '3',
    type: 'lesson',
    title: 'Lesson Completed',
    description: 'Finished "Advanced Typing"',
    icon: '📚',
    timestamp: new Date(Date.now() - 8 * 60 * 60 * 1000),
    color: 'from-blue-400 to-cyan-500',
  },
  {
    id: '4',
    type: 'streak',
    title: '7 Day Streak',
    description: 'Practiced 7 days in a row',
    icon: '🔥',
    timestamp: new Date(Date.now() - 24 * 60 * 60 * 1000),
    color: 'from-red-400 to-orange-500',
  },
  {
    id: '5',
    type: 'unlock',
    title: 'New Sticker!',
    description: 'Unlocked Rainbow sticker',
    icon: '🌈',
    timestamp: new Date(Date.now() - 36 * 60 * 60 * 1000),
    color: 'from-green-400 to-teal-500',
  },
];

// Custom hook for dashboard
export function useProgressDashboard() {
  const [progress] = useState<UserProgress>(MOCK_PROGRESS);
  const [activities] = useState<RecentActivity[]>(MOCK_ACTIVITIES);
  const [timeRange, setTimeRange] = useState<'day' | 'week' | 'month' | 'all'>('week');

  const getQuickStats = (): QuickStat[] => {
    return [
      {
        label: 'Average WPM',
        value: progress.averageWPM,
        icon: '⚡',
        change: 12,
        color: 'from-purple-400 to-purple-600',
      },
      {
        label: 'Accuracy',
        value: `${progress.averageAccuracy}%`,
        icon: '🎯',
        change: 3,
        color: 'from-blue-400 to-blue-600',
      },
      {
        label: 'Current Streak',
        value: `${progress.currentStreak} days`,
        icon: '🔥',
        change: progress.currentStreak > 0 ? 14 : -100,
        color: 'from-orange-400 to-red-600',
      },
      {
        label: 'Practice Time',
        value: `${Math.floor(progress.totalPracticeTime / 60)}h ${progress.totalPracticeTime % 60}m`,
        icon: '⏱️',
        change: 8,
        color: 'from-green-400 to-green-600',
      },
    ];
  };

  const getLevelProgress = () => {
    const percentage = Math.round((progress.xp / progress.xpToNextLevel) * 100);
    return {
      current: progress.xp,
      target: progress.xpToNextLevel,
      percentage,
    };
  };

  const getLessonProgress = () => {
    const percentage = Math.round((progress.completedLessons / progress.totalLessons) * 100);
    return {
      completed: progress.completedLessons,
      total: progress.totalLessons,
      percentage,
    };
  };

  const getDaysActive = () => {
    const days = Math.floor(
      (Date.now() - progress.joinDate.getTime()) / (1000 * 60 * 60 * 24)
    );
    return days;
  };

  const formatTimeAgo = (date: Date) => {
    const seconds = Math.floor((Date.now() - date.getTime()) / 1000);
    if (seconds < 60) return 'Just now';
    const minutes = Math.floor(seconds / 60);
    if (minutes < 60) return `${minutes}m ago`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours}h ago`;
    const days = Math.floor(hours / 24);
    return `${days}d ago`;
  };

  return {
    progress,
    activities,
    timeRange,
    setTimeRange,
    getQuickStats,
    getLevelProgress,
    getLessonProgress,
    getDaysActive,
    formatTimeAgo,
  };
}

// Main dashboard component
export default function ProgressDashboard() {
  const {
    progress,
    activities,
    timeRange,
    setTimeRange,
    getQuickStats,
    getLevelProgress,
    getLessonProgress,
    getDaysActive,
    formatTimeAgo,
  } = useProgressDashboard();

  const { settings } = useSettingsStore();
  const quickStats = getQuickStats();
  const levelProgress = getLevelProgress();
  const lessonProgress = getLessonProgress();

  return (
    <div className="bg-white rounded-2xl shadow-xl p-8">
      <h2 className="text-2xl font-bold text-gray-800 mb-6 text-center">
        📊 Progress Dashboard
      </h2>

      {/* Welcome header */}
      <div className="mb-8 bg-gradient-to-r from-purple-400 to-pink-500 rounded-2xl p-8 text-white">
        <div className="flex items-center justify-between mb-4">
          <div>
            <div className="text-3xl font-bold mb-2">
              Welcome back, {progress.username}! 👋
            </div>
            <div className="text-lg opacity-90">
              Level {progress.level} • {getDaysActive()} days active
            </div>
          </div>
          <div className="text-6xl">🎯</div>
        </div>

        {/* Level progress */}
        <div className="bg-white bg-opacity-20 rounded-xl p-4">
          <div className="flex items-center justify-between mb-2">
            <span className="font-bold">Level Progress</span>
            <span>
              {levelProgress.current.toLocaleString()} / {levelProgress.target.toLocaleString()} XP
            </span>
          </div>
          <div className="h-4 bg-white bg-opacity-30 rounded-full overflow-hidden">
            <motion.div
              animate={{ width: `${levelProgress.percentage}%` }}
              className="h-full bg-white"
              transition={{ duration: 1 }}
            />
          </div>
          <div className="text-center mt-2 text-sm opacity-90">
            {levelProgress.target - levelProgress.current} XP to Level {progress.level + 1}
          </div>
        </div>
      </div>

      {/* Quick stats */}
      <div className="mb-8">
        <h3 className="text-xl font-bold text-gray-900 mb-4">Quick Stats</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {quickStats.map((stat, index) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: settings.reducedMotion ? 0 : index * 0.1 }}
              className={`bg-gradient-to-br ${stat.color} rounded-xl p-6 text-white`}
            >
              <div className="text-4xl mb-2">{stat.icon}</div>
              <div className="text-3xl font-bold mb-1">{stat.value}</div>
              <div className="text-sm opacity-90 mb-2">{stat.label}</div>
              {stat.change !== undefined && (
                <div
                  className={`text-sm font-bold ${
                    stat.change > 0 ? 'text-green-200' : 'text-red-200'
                  }`}
                >
                  {stat.change > 0 ? '↑' : '↓'} {Math.abs(stat.change)}%
                </div>
              )}
            </motion.div>
          ))}
        </div>
      </div>

      {/* Progress overview */}
      <div className="mb-8 grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Lesson progress */}
        <div className="bg-gray-50 rounded-xl p-6">
          <h3 className="text-lg font-bold text-gray-900 mb-4">Lesson Progress</h3>
          <div className="text-center mb-4">
            <div className="text-5xl font-bold text-blue-600 mb-2">
              {lessonProgress.percentage}%
            </div>
            <div className="text-gray-600">
              {lessonProgress.completed} of {lessonProgress.total} lessons completed
            </div>
          </div>
          <div className="h-3 bg-gray-200 rounded-full overflow-hidden">
            <motion.div
              animate={{ width: `${lessonProgress.percentage}%` }}
              className="h-full bg-gradient-to-r from-blue-400 to-cyan-500"
              transition={{ duration: 1 }}
            />
          </div>
        </div>

        {/* Collection stats */}
        <div className="bg-gray-50 rounded-xl p-6">
          <h3 className="text-lg font-bold text-gray-900 mb-4">Collection</h3>
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-white rounded-lg p-4 text-center">
              <div className="text-4xl mb-2">🏆</div>
              <div className="text-3xl font-bold text-yellow-600">{progress.achievements}</div>
              <div className="text-sm text-gray-600">Achievements</div>
            </div>
            <div className="bg-white rounded-lg p-4 text-center">
              <div className="text-4xl mb-2">🎖️</div>
              <div className="text-3xl font-bold text-green-600">{progress.badges}</div>
              <div className="text-sm text-gray-600">Badges</div>
            </div>
            <div className="bg-white rounded-lg p-4 text-center">
              <div className="text-4xl mb-2">⭐</div>
              <div className="text-3xl font-bold text-purple-600">{progress.stickers}</div>
              <div className="text-sm text-gray-600">Stickers</div>
            </div>
            <div className="bg-white rounded-lg p-4 text-center">
              <div className="text-4xl mb-2">🎴</div>
              <div className="text-3xl font-bold text-pink-600">{progress.cards}</div>
              <div className="text-sm text-gray-600">Cards</div>
            </div>
          </div>
        </div>
      </div>

      {/* Recent activity */}
      <div className="mb-8 bg-gray-50 rounded-xl p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-bold text-gray-900">Recent Activity</h3>
          <div className="flex gap-2">
            {(['day', 'week', 'month', 'all'] as const).map((range) => (
              <button
                key={range}
                onClick={() => setTimeRange(range)}
                className={`px-3 py-1 rounded-lg text-sm font-bold capitalize transition-colors ${
                  timeRange === range
                    ? 'bg-purple-500 text-white'
                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                }`}
              >
                {range}
              </button>
            ))}
          </div>
        </div>

        <div className="space-y-3">
          {activities.map((activity, index) => (
            <motion.div
              key={activity.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: settings.reducedMotion ? 0 : index * 0.05 }}
              className={`bg-gradient-to-r ${activity.color} rounded-lg p-4 text-white`}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="text-4xl">{activity.icon}</div>
                  <div>
                    <div className="font-bold text-lg">{activity.title}</div>
                    <div className="text-sm opacity-90">{activity.description}</div>
                  </div>
                </div>
                <div className="text-sm opacity-80">{formatTimeAgo(activity.timestamp)}</div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Performance highlights */}
      <div className="bg-gradient-to-r from-indigo-400 to-purple-500 rounded-xl p-6 text-white">
        <h3 className="text-xl font-bold mb-4">🌟 Performance Highlights</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-white bg-opacity-20 rounded-lg p-4">
            <div className="text-sm opacity-90 mb-1">Best Speed</div>
            <div className="text-3xl font-bold">{progress.bestWPM} WPM</div>
          </div>
          <div className="bg-white bg-opacity-20 rounded-lg p-4">
            <div className="text-sm opacity-90 mb-1">Best Streak</div>
            <div className="text-3xl font-bold">{progress.longestStreak} days</div>
          </div>
          <div className="bg-white bg-opacity-20 rounded-lg p-4">
            <div className="text-sm opacity-90 mb-1">Total Practice</div>
            <div className="text-3xl font-bold">
              {Math.floor(progress.totalPracticeTime / 60)}h
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
