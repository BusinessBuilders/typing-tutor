/**
 * Time Tracking Component
 * Step 246 - Add time tracking for practice sessions
 */

import { motion } from 'framer-motion';
import { useState } from 'react';
import { useSettingsStore } from '../store/useSettingsStore';

// Time session interface
export interface TimeSession {
  id: string;
  startTime: Date;
  endTime: Date;
  duration: number; // seconds
  activityType: 'lesson' | 'practice' | 'test' | 'game' | 'review';
  activityName: string;
  completed: boolean;
  wpm?: number;
  accuracy?: number;
}

// Time breakdown by category
export interface TimeBreakdown {
  category: string;
  duration: number; // seconds
  sessions: number;
  percentage: number;
  color: string;
}

// Time statistics
export interface TimeStats {
  total: number; // total seconds
  today: number;
  thisWeek: number;
  thisMonth: number;
  average: number; // average session duration
  longestSession: number;
  totalSessions: number;
  activedays: number;
  breakdown: TimeBreakdown[];
}

// Time goals
export interface TimeGoal {
  type: 'daily' | 'weekly' | 'monthly';
  target: number; // minutes
  current: number; // minutes
  progress: number; // percentage
}

// Mock time data
const generateMockTimeSessions = (): TimeSession[] => {
  const sessions: TimeSession[] = [];
  const now = Date.now();
  const activities = [
    { type: 'lesson' as const, names: ['Home Row Basics', 'Top Row Practice', 'Number Keys'] },
    { type: 'practice' as const, names: ['Speed Drill', 'Accuracy Focus', 'Custom Practice'] },
    { type: 'test' as const, names: ['Speed Test', 'Accuracy Test', 'Full Assessment'] },
    { type: 'game' as const, names: ['Type Race', 'Word Catch', 'Letter Rain'] },
    { type: 'review' as const, names: ['Mistake Review', 'Progress Review', 'Skill Review'] },
  ];

  for (let i = 60; i >= 0; i--) {
    const dayOffset = Math.floor(i / 2);
    const activity = activities[Math.floor(Math.random() * activities.length)];
    const name = activity.names[Math.floor(Math.random() * activity.names.length)];
    const duration = 180 + Math.floor(Math.random() * 900); // 3-18 minutes
    const startTime = new Date(now - dayOffset * 24 * 60 * 60 * 1000 - Math.random() * 12 * 60 * 60 * 1000);
    const endTime = new Date(startTime.getTime() + duration * 1000);

    sessions.push({
      id: `session-${i}`,
      startTime,
      endTime,
      duration,
      activityType: activity.type,
      activityName: name,
      completed: Math.random() > 0.1,
      wpm: 50 + Math.floor(Math.random() * 50),
      accuracy: 85 + Math.random() * 15,
    });
  }

  return sessions.sort((a, b) => b.startTime.getTime() - a.startTime.getTime());
};

// Format duration helper
export const formatDuration = (seconds: number): string => {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const secs = seconds % 60;

  if (hours > 0) {
    return `${hours}h ${minutes}m`;
  } else if (minutes > 0) {
    return `${minutes}m ${secs}s`;
  } else {
    return `${secs}s`;
  }
};

// Format time to readable string
export const formatTime = (date: Date): string => {
  return date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
};

// Custom hook for time tracking
export function useTimeTracking() {
  const [sessions] = useState<TimeSession[]>(generateMockTimeSessions());
  const [timeRange, setTimeRange] = useState<'today' | 'week' | 'month' | 'all'>('week');

  const getFilteredSessions = () => {
    const now = Date.now();
    const ranges = {
      today: 24 * 60 * 60 * 1000,
      week: 7 * 24 * 60 * 60 * 1000,
      month: 30 * 24 * 60 * 60 * 1000,
      all: Infinity,
    };

    const cutoff = now - ranges[timeRange];
    return sessions.filter((session) => session.startTime.getTime() >= cutoff);
  };

  const getStats = (): TimeStats => {
    const now = Date.now();
    const today = sessions.filter((s) => s.startTime.getTime() >= now - 24 * 60 * 60 * 1000);
    const week = sessions.filter((s) => s.startTime.getTime() >= now - 7 * 24 * 60 * 60 * 1000);
    const month = sessions.filter((s) => s.startTime.getTime() >= now - 30 * 24 * 60 * 60 * 1000);

    const totalSeconds = sessions.reduce((sum, s) => sum + s.duration, 0);
    const todaySeconds = today.reduce((sum, s) => sum + s.duration, 0);
    const weekSeconds = week.reduce((sum, s) => sum + s.duration, 0);
    const monthSeconds = month.reduce((sum, s) => sum + s.duration, 0);

    const averageSession = sessions.length > 0 ? totalSeconds / sessions.length : 0;
    const longestSession = Math.max(...sessions.map((s) => s.duration), 0);

    // Calculate active days
    const uniqueDays = new Set(
      sessions.map((s) => s.startTime.toLocaleDateString())
    );
    const activeDays = uniqueDays.size;

    // Calculate breakdown
    const categoryMap = new Map<string, { duration: number; sessions: number; color: string }>();
    categoryMap.set('lesson', { duration: 0, sessions: 0, color: 'bg-blue-500' });
    categoryMap.set('practice', { duration: 0, sessions: 0, color: 'bg-green-500' });
    categoryMap.set('test', { duration: 0, sessions: 0, color: 'bg-purple-500' });
    categoryMap.set('game', { duration: 0, sessions: 0, color: 'bg-yellow-500' });
    categoryMap.set('review', { duration: 0, sessions: 0, color: 'bg-orange-500' });

    sessions.forEach((session) => {
      const cat = categoryMap.get(session.activityType);
      if (cat) {
        cat.duration += session.duration;
        cat.sessions += 1;
      }
    });

    const breakdown: TimeBreakdown[] = Array.from(categoryMap.entries()).map(
      ([category, data]) => ({
        category: category.charAt(0).toUpperCase() + category.slice(1),
        duration: data.duration,
        sessions: data.sessions,
        percentage: totalSeconds > 0 ? (data.duration / totalSeconds) * 100 : 0,
        color: data.color,
      })
    ).sort((a, b) => b.duration - a.duration);

    return {
      total: totalSeconds,
      today: todaySeconds,
      thisWeek: weekSeconds,
      thisMonth: monthSeconds,
      average: averageSession,
      longestSession,
      totalSessions: sessions.length,
      activedays: activeDays,
      breakdown,
    };
  };

  const getGoals = (): TimeGoal[] => {
    const stats = getStats();
    const todayMinutes = Math.floor(stats.today / 60);
    const weekMinutes = Math.floor(stats.thisWeek / 60);
    const monthMinutes = Math.floor(stats.thisMonth / 60);

    return [
      {
        type: 'daily',
        target: 30,
        current: todayMinutes,
        progress: Math.min(100, (todayMinutes / 30) * 100),
      },
      {
        type: 'weekly',
        target: 180,
        current: weekMinutes,
        progress: Math.min(100, (weekMinutes / 180) * 100),
      },
      {
        type: 'monthly',
        target: 720,
        current: monthMinutes,
        progress: Math.min(100, (monthMinutes / 720) * 100),
      },
    ];
  };

  const getRecentSessions = (count: number = 10) => {
    return sessions.slice(0, count);
  };

  const getDailyActivity = () => {
    const now = Date.now();
    const days: { date: string; duration: number; sessions: number }[] = [];

    for (let i = 6; i >= 0; i--) {
      const date = new Date(now - i * 24 * 60 * 60 * 1000);
      const dateStr = date.toLocaleDateString('en-US', { weekday: 'short' });
      const daySessions = sessions.filter(
        (s) =>
          s.startTime.toLocaleDateString() === date.toLocaleDateString()
      );
      const duration = daySessions.reduce((sum, s) => sum + s.duration, 0);

      days.push({
        date: dateStr,
        duration,
        sessions: daySessions.length,
      });
    }

    return days;
  };

  return {
    sessions: getFilteredSessions(),
    timeRange,
    setTimeRange,
    getStats,
    getGoals,
    getRecentSessions,
    getDailyActivity,
  };
}

// Activity type icon helper
const getActivityIcon = (type: string) => {
  switch (type) {
    case 'lesson':
      return '📚';
    case 'practice':
      return '💪';
    case 'test':
      return '📝';
    case 'game':
      return '🎮';
    case 'review':
      return '📊';
    default:
      return '⏱️';
  }
};

// Main time tracking component
export default function TimeTracking() {
  const {
    timeRange,
    setTimeRange,
    getStats,
    getGoals,
    getRecentSessions,
    getDailyActivity,
  } = useTimeTracking();

  const { settings } = useSettingsStore();
  const stats = getStats();
  const goals = getGoals();
  const recentSessions = getRecentSessions(8);
  const dailyActivity = getDailyActivity();
  const [hoveredCategory, setHoveredCategory] = useState<string | null>(null);

  return (
    <div className="bg-white rounded-2xl shadow-xl p-8">
      <h2 className="text-2xl font-bold text-gray-800 mb-6 text-center">
        ⏱️ Time Tracking
      </h2>

      {/* Overall stats */}
      <div className="mb-8 grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-gradient-to-br from-blue-400 to-blue-600 rounded-xl p-4 text-white">
          <div className="text-sm opacity-90 mb-1">Total Time</div>
          <div className="text-2xl font-bold">{formatDuration(stats.total)}</div>
          <div className="text-xs opacity-80">{stats.totalSessions} sessions</div>
        </div>
        <div className="bg-gradient-to-br from-green-400 to-green-600 rounded-xl p-4 text-white">
          <div className="text-sm opacity-90 mb-1">This Week</div>
          <div className="text-2xl font-bold">{formatDuration(stats.thisWeek)}</div>
          <div className="text-xs opacity-80">Practice time</div>
        </div>
        <div className="bg-gradient-to-br from-purple-400 to-purple-600 rounded-xl p-4 text-white">
          <div className="text-sm opacity-90 mb-1">Avg Session</div>
          <div className="text-2xl font-bold">{formatDuration(Math.floor(stats.average))}</div>
          <div className="text-xs opacity-80">Duration</div>
        </div>
        <div className="bg-gradient-to-br from-orange-400 to-orange-600 rounded-xl p-4 text-white">
          <div className="text-sm opacity-90 mb-1">Active Days</div>
          <div className="text-2xl font-bold">{stats.activedays}</div>
          <div className="text-xs opacity-80">Days practiced</div>
        </div>
      </div>

      {/* Time goals */}
      <div className="mb-8 bg-gray-50 rounded-xl p-6">
        <h3 className="text-lg font-bold text-gray-900 mb-4">Time Goals</h3>
        <div className="space-y-4">
          {goals.map((goal, index) => (
            <motion.div
              key={goal.type}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: settings.reducedMotion ? 0 : index * 0.1 }}
              className="bg-white rounded-lg p-4"
            >
              <div className="flex items-center justify-between mb-2">
                <div>
                  <div className="font-bold text-gray-900 capitalize">{goal.type} Goal</div>
                  <div className="text-sm text-gray-600">
                    {goal.current} / {goal.target} minutes
                  </div>
                </div>
                <div className={`text-2xl font-bold ${
                  goal.progress >= 100 ? 'text-green-600' :
                  goal.progress >= 50 ? 'text-blue-600' :
                  'text-orange-600'
                }`}>
                  {Math.floor(goal.progress)}%
                </div>
              </div>
              <div className="h-3 bg-gray-200 rounded-full overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${Math.min(100, goal.progress)}%` }}
                  transition={{ duration: settings.reducedMotion ? 0 : 1, delay: index * 0.1 }}
                  className={`h-full ${
                    goal.progress >= 100 ? 'bg-gradient-to-r from-green-400 to-green-600' :
                    goal.progress >= 50 ? 'bg-gradient-to-r from-blue-400 to-blue-600' :
                    'bg-gradient-to-r from-orange-400 to-orange-600'
                  }`}
                />
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Time breakdown pie chart */}
      <div className="mb-8 bg-gray-50 rounded-xl p-6">
        <h3 className="text-lg font-bold text-gray-900 mb-4">Time Breakdown</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Visual pie representation */}
          <div className="flex items-center justify-center">
            <div className="relative w-64 h-64">
              <svg viewBox="0 0 100 100" className="transform -rotate-90">
                {stats.breakdown.reduce((acc, item, index) => {
                  const prevPercentage = stats.breakdown
                    .slice(0, index)
                    .reduce((sum, i) => sum + i.percentage, 0);
                  const strokeDasharray = `${item.percentage} ${100 - item.percentage}`;
                  const strokeDashoffset = -prevPercentage;

                  acc.push(
                    <motion.circle
                      key={item.category}
                      cx="50"
                      cy="50"
                      r="15.915"
                      fill="transparent"
                      stroke={item.color.replace('bg-', '#').replace('-500', '')}
                      strokeWidth="31.831"
                      strokeDasharray={strokeDasharray}
                      strokeDashoffset={strokeDashoffset}
                      initial={{ strokeDasharray: '0 100' }}
                      animate={{ strokeDasharray }}
                      transition={{ duration: settings.reducedMotion ? 0 : 1, delay: index * 0.1 }}
                      onMouseEnter={() => setHoveredCategory(item.category)}
                      onMouseLeave={() => setHoveredCategory(null)}
                      className="cursor-pointer"
                      style={{
                        filter: hoveredCategory === item.category ? 'brightness(1.2)' : 'brightness(1)',
                      }}
                    />
                  );
                  return acc;
                }, [] as JSX.Element[])}
              </svg>
              {hoveredCategory && (
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                  <div className="text-center bg-white rounded-lg p-3 shadow-xl">
                    <div className="text-sm font-bold text-gray-900">{hoveredCategory}</div>
                    <div className="text-xs text-gray-600">
                      {formatDuration(stats.breakdown.find((b) => b.category === hoveredCategory)?.duration || 0)}
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Breakdown legend */}
          <div className="space-y-3">
            {stats.breakdown.map((item, index) => (
              <motion.div
                key={item.category}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: settings.reducedMotion ? 0 : index * 0.05 }}
                className="flex items-center justify-between p-3 bg-white rounded-lg cursor-pointer"
                onMouseEnter={() => setHoveredCategory(item.category)}
                onMouseLeave={() => setHoveredCategory(null)}
              >
                <div className="flex items-center gap-3">
                  <div className={`w-4 h-4 ${item.color} rounded`} />
                  <div>
                    <div className="font-bold text-gray-900">{item.category}</div>
                    <div className="text-sm text-gray-600">{item.sessions} sessions</div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="font-bold text-gray-900">{formatDuration(item.duration)}</div>
                  <div className="text-sm text-gray-600">{item.percentage.toFixed(1)}%</div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>

      {/* Daily activity bar chart */}
      <div className="mb-8 bg-gray-50 rounded-xl p-6">
        <h3 className="text-lg font-bold text-gray-900 mb-4">Last 7 Days Activity</h3>
        <div className="flex items-end justify-between gap-2 h-48">
          {dailyActivity.map((day, index) => {
            const maxDuration = Math.max(...dailyActivity.map((d) => d.duration), 1);
            const heightPercentage = (day.duration / maxDuration) * 100;

            return (
              <motion.div
                key={day.date}
                initial={{ scaleY: 0 }}
                animate={{ scaleY: 1 }}
                transition={{ delay: settings.reducedMotion ? 0 : index * 0.1 }}
                className="flex-1 flex flex-col items-center gap-2"
                style={{ transformOrigin: 'bottom' }}
              >
                <div className="flex-1 w-full flex items-end">
                  <div
                    className="w-full bg-gradient-to-t from-purple-500 to-purple-300 rounded-t-lg relative group cursor-pointer"
                    style={{ height: `${heightPercentage}%` }}
                  >
                    <div className="absolute bottom-full mb-2 left-1/2 transform -translate-x-1/2 bg-gray-900 text-white px-2 py-1 rounded text-xs whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
                      {formatDuration(day.duration)}
                      <br />
                      {day.sessions} sessions
                    </div>
                  </div>
                </div>
                <div className="text-xs text-gray-600 font-bold">{day.date}</div>
              </motion.div>
            );
          })}
        </div>
      </div>

      {/* Time range selector */}
      <div className="mb-6 flex gap-2 justify-center">
        {(['today', 'week', 'month', 'all'] as const).map((range) => (
          <button
            key={range}
            onClick={() => setTimeRange(range)}
            className={`px-6 py-2 rounded-lg font-bold capitalize transition-colors ${
              timeRange === range
                ? 'bg-purple-500 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            {range}
          </button>
        ))}
      </div>

      {/* Recent sessions */}
      <div className="bg-gray-50 rounded-xl p-6">
        <h3 className="text-lg font-bold text-gray-900 mb-4">Recent Sessions</h3>
        <div className="space-y-2">
          {recentSessions.map((session, index) => (
            <motion.div
              key={session.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: settings.reducedMotion ? 0 : index * 0.05 }}
              className={`flex items-center justify-between p-4 rounded-lg ${
                session.completed ? 'bg-white' : 'bg-yellow-50'
              }`}
            >
              <div className="flex items-center gap-4">
                <div className="text-3xl">{getActivityIcon(session.activityType)}</div>
                <div>
                  <div className="font-bold text-gray-900">{session.activityName}</div>
                  <div className="text-sm text-gray-600">
                    {session.startTime.toLocaleDateString()} • {formatTime(session.startTime)} - {formatTime(session.endTime)}
                  </div>
                  <div className="text-xs text-gray-500">
                    {session.wpm && `${Math.floor(session.wpm)} WPM`}
                    {session.wpm && session.accuracy && ' • '}
                    {session.accuracy && `${session.accuracy.toFixed(1)}% accuracy`}
                  </div>
                </div>
              </div>
              <div className="text-right">
                <div className="text-xl font-bold text-purple-600">
                  {formatDuration(session.duration)}
                </div>
                <div className="text-xs text-gray-600">
                  {session.completed ? '✓ Completed' : '○ Incomplete'}
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
}
