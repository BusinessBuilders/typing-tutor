/**
 * Goal Tracking Component
 * Step 256 - Add goal tracking with detailed progress analytics
 */

import { motion } from 'framer-motion';
import { useState } from 'react';
import { useSettingsStore } from '../store/useSettingsStore';

// Goal progress entry
export interface GoalProgressEntry {
  date: Date;
  value: number;
  note?: string;
}

// Tracked goal
export interface TrackedGoal {
  id: string;
  title: string;
  target: number;
  current: number;
  unit: string;
  startDate: Date;
  deadline: Date;
  icon: string;
  progressHistory: GoalProgressEntry[];
}

// Daily tracking
export interface DailyTracking {
  date: Date;
  completed: boolean;
  value: number;
  notes: string;
}

// Weekly summary
export interface WeeklySummary {
  week: string;
  startDate: Date;
  endDate: Date;
  averageProgress: number;
  daysActive: number;
  totalValue: number;
}

// Milestone
export interface Milestone {
  id: string;
  goalId: string;
  percentage: number;
  value: number;
  reached: boolean;
  reachedDate?: Date;
  reward: string;
}

// Mock tracked goals
const generateMockTrackedGoals = (): TrackedGoal[] => {
  const now = Date.now();

  // Generate progress history
  const generateHistory = (days: number, startValue: number, endValue: number): GoalProgressEntry[] => {
    const history: GoalProgressEntry[] = [];
    const increment = (endValue - startValue) / days;

    for (let i = 0; i <= days; i++) {
      history.push({
        date: new Date(now - (days - i) * 24 * 60 * 60 * 1000),
        value: Math.round(startValue + increment * i + (Math.random() * 2 - 1)),
      });
    }
    return history;
  };

  return [
    {
      id: 'goal-1',
      title: 'Reach 80 WPM',
      target: 80,
      current: 72,
      unit: 'WPM',
      startDate: new Date(now - 14 * 24 * 60 * 60 * 1000),
      deadline: new Date(now + 16 * 24 * 60 * 60 * 1000),
      icon: '⚡',
      progressHistory: generateHistory(14, 65, 72),
    },
    {
      id: 'goal-2',
      title: '95% Accuracy',
      target: 95,
      current: 94.5,
      unit: '%',
      startDate: new Date(now - 7 * 24 * 60 * 60 * 1000),
      deadline: new Date(now + 7 * 24 * 60 * 60 * 1000),
      icon: '🎯',
      progressHistory: generateHistory(7, 92, 94.5),
    },
  ];
};

// Mock daily tracking
const generateMockDailyTracking = (): DailyTracking[] => {
  const tracking: DailyTracking[] = [];
  const now = Date.now();

  for (let i = 13; i >= 0; i--) {
    tracking.push({
      date: new Date(now - i * 24 * 60 * 60 * 1000),
      completed: i < 10 || i === 11,
      value: i < 10 ? 15 + Math.floor(Math.random() * 10) : i === 11 ? 12 : 0,
      notes: i === 11 ? 'Short session today' : i >= 10 ? '' : 'Good progress!',
    });
  }

  return tracking;
};

// Mock weekly summaries
const generateMockWeeklySummaries = (): WeeklySummary[] => {
  const now = Date.now();
  return [
    {
      week: 'This Week',
      startDate: new Date(now - 7 * 24 * 60 * 60 * 1000),
      endDate: new Date(),
      averageProgress: 87,
      daysActive: 6,
      totalValue: 145,
    },
    {
      week: 'Last Week',
      startDate: new Date(now - 14 * 24 * 60 * 60 * 1000),
      endDate: new Date(now - 7 * 24 * 60 * 60 * 1000),
      averageProgress: 82,
      daysActive: 6,
      totalValue: 138,
    },
    {
      week: '2 Weeks Ago',
      startDate: new Date(now - 21 * 24 * 60 * 60 * 1000),
      endDate: new Date(now - 14 * 24 * 60 * 60 * 1000),
      averageProgress: 78,
      daysActive: 5,
      totalValue: 125,
    },
  ];
};

// Mock milestones
const generateMockMilestones = (goalId: string): Milestone[] => {
  return [
    {
      id: 'm-1',
      goalId,
      percentage: 25,
      value: 20,
      reached: true,
      reachedDate: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000),
      reward: '🎖️ Quarter Way There',
    },
    {
      id: 'm-2',
      goalId,
      percentage: 50,
      value: 40,
      reached: true,
      reachedDate: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
      reward: '🏅 Halfway Champion',
    },
    {
      id: 'm-3',
      goalId,
      percentage: 75,
      value: 60,
      reached: true,
      reachedDate: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
      reward: '⭐ Almost There',
    },
    {
      id: 'm-4',
      goalId,
      percentage: 90,
      value: 72,
      reached: true,
      reachedDate: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
      reward: '🔥 Final Sprint',
    },
    {
      id: 'm-5',
      goalId,
      percentage: 100,
      value: 80,
      reached: false,
      reward: '🏆 Goal Achieved!',
    },
  ];
};

// Custom hook for goal tracking
export function useGoalTracking() {
  const [goals] = useState<TrackedGoal[]>(generateMockTrackedGoals());
  const [selectedGoal, setSelectedGoal] = useState<string>(goals[0]?.id || '');
  const [dailyTracking] = useState<DailyTracking[]>(generateMockDailyTracking());
  const [weeklySummaries] = useState<WeeklySummary[]>(generateMockWeeklySummaries());
  const [viewMode, setViewMode] = useState<'chart' | 'calendar' | 'stats'>('chart');

  const getCurrentGoal = () => {
    return goals.find((g) => g.id === selectedGoal);
  };

  const getMilestones = () => {
    return generateMockMilestones(selectedGoal);
  };

  const getProgressRate = () => {
    const goal = getCurrentGoal();
    if (!goal || goal.progressHistory.length < 2) return '0.00';

    const recent = goal.progressHistory.slice(-7);
    const first = recent[0].value;
    const last = recent[recent.length - 1].value;
    return ((last - first) / 7).toFixed(2);
  };

  const getDaysRemaining = () => {
    const goal = getCurrentGoal();
    if (!goal) return 0;
    return Math.ceil((goal.deadline.getTime() - Date.now()) / (24 * 60 * 60 * 1000));
  };

  const getProjectedCompletion = () => {
    const goal = getCurrentGoal();
    const rate = parseFloat(getProgressRate());
    if (!goal || rate <= 0) return 'N/A';

    const remaining = goal.target - goal.current;
    const daysNeeded = Math.ceil(remaining / rate);
    return `${daysNeeded} days`;
  };

  return {
    goals,
    selectedGoal,
    setSelectedGoal,
    currentGoal: getCurrentGoal(),
    dailyTracking,
    weeklySummaries,
    milestones: getMilestones(),
    viewMode,
    setViewMode,
    progressRate: getProgressRate(),
    daysRemaining: getDaysRemaining(),
    projectedCompletion: getProjectedCompletion(),
  };
}

// Main goal tracking component
export default function GoalTracking() {
  const {
    goals,
    selectedGoal,
    setSelectedGoal,
    currentGoal,
    dailyTracking,
    weeklySummaries,
    milestones,
    viewMode,
    setViewMode,
    progressRate,
    daysRemaining,
    projectedCompletion,
  } = useGoalTracking();

  const { settings } = useSettingsStore();

  if (!currentGoal) {
    return (
      <div className="bg-white rounded-2xl shadow-xl p-8">
        <h2 className="text-2xl font-bold text-gray-800 mb-6 text-center">
          📊 Goal Tracking
        </h2>
        <div className="text-center text-gray-500 py-12">
          No goals to track. Create a goal to get started!
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl shadow-xl p-8">
      <h2 className="text-2xl font-bold text-gray-800 mb-6 text-center">
        📊 Goal Tracking
      </h2>

      {/* Goal selector */}
      {goals.length > 1 && (
        <div className="mb-6">
          <div className="text-sm font-bold text-gray-700 mb-2">Select Goal:</div>
          <div className="flex gap-2">
            {goals.map((goal) => (
              <button
                key={goal.id}
                onClick={() => setSelectedGoal(goal.id)}
                className={`px-4 py-2 rounded-lg font-bold transition-colors ${
                  selectedGoal === goal.id
                    ? 'bg-purple-500 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {goal.icon} {goal.title}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Goal header */}
      <div className="mb-8 bg-gradient-to-br from-purple-400 to-purple-600 rounded-xl p-6 text-white">
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-4">
            <div className="text-6xl">{currentGoal.icon}</div>
            <div>
              <div className="text-3xl font-bold mb-2">{currentGoal.title}</div>
              <div className="text-lg opacity-90">
                {currentGoal.current} / {currentGoal.target} {currentGoal.unit}
              </div>
            </div>
          </div>
          <div className="text-right">
            <div className="text-5xl font-bold mb-1">
              {Math.round((currentGoal.current / currentGoal.target) * 100)}%
            </div>
            <div className="text-sm opacity-90">Complete</div>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-4">
          <div className="bg-white/20 rounded-lg p-3">
            <div className="text-sm opacity-90">Daily Rate</div>
            <div className="text-xl font-bold">+{progressRate} {currentGoal.unit}/day</div>
          </div>
          <div className="bg-white/20 rounded-lg p-3">
            <div className="text-sm opacity-90">Days Remaining</div>
            <div className="text-xl font-bold">{daysRemaining} days</div>
          </div>
          <div className="bg-white/20 rounded-lg p-3">
            <div className="text-sm opacity-90">Projected</div>
            <div className="text-xl font-bold">{projectedCompletion}</div>
          </div>
        </div>
      </div>

      {/* View mode selector */}
      <div className="mb-6 flex gap-2">
        {[
          { mode: 'chart' as const, label: '📈 Progress Chart' },
          { mode: 'calendar' as const, label: '📅 Calendar View' },
          { mode: 'stats' as const, label: '📊 Statistics' },
        ].map(({ mode, label }) => (
          <button
            key={mode}
            onClick={() => setViewMode(mode)}
            className={`px-4 py-2 rounded-lg font-bold transition-colors ${
              viewMode === mode
                ? 'bg-blue-500 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      {/* Progress chart view */}
      {viewMode === 'chart' && (
        <div className="space-y-6">
          {/* Line chart */}
          <div className="bg-gray-50 rounded-xl p-6">
            <h3 className="text-lg font-bold text-gray-900 mb-4">Progress Over Time</h3>
            <div className="relative h-64 bg-white rounded-lg p-4">
              <svg viewBox="0 0 100 100" className="w-full h-full" preserveAspectRatio="none">
                {/* Grid lines */}
                {[0, 25, 50, 75, 100].map((y) => (
                  <line
                    key={y}
                    x1="0"
                    y1={100 - y}
                    x2="100"
                    y2={100 - y}
                    stroke="#e5e7eb"
                    strokeWidth="0.5"
                  />
                ))}

                {/* Target line */}
                <line
                  x1="0"
                  y1={100 - (currentGoal.target / currentGoal.target) * 100}
                  x2="100"
                  y2={100 - (currentGoal.target / currentGoal.target) * 100}
                  stroke="#10b981"
                  strokeWidth="1"
                  strokeDasharray="2,2"
                />

                {/* Progress line */}
                <motion.polyline
                  points={currentGoal.progressHistory
                    .map((entry, index) => {
                      const x = (index / (currentGoal.progressHistory.length - 1)) * 100;
                      const y = 100 - (entry.value / currentGoal.target) * 100;
                      return `${x},${y}`;
                    })
                    .join(' ')}
                  fill="none"
                  stroke="#8b5cf6"
                  strokeWidth="2"
                  initial={{ pathLength: 0 }}
                  animate={{ pathLength: 1 }}
                  transition={{ duration: settings.reducedMotion ? 0 : 1.5 }}
                />

                {/* Data points */}
                {currentGoal.progressHistory.map((entry, index) => {
                  const x = (index / (currentGoal.progressHistory.length - 1)) * 100;
                  const y = 100 - (entry.value / currentGoal.target) * 100;
                  return (
                    <circle
                      key={index}
                      cx={x}
                      cy={y}
                      r="1.5"
                      fill="#8b5cf6"
                      stroke="white"
                      strokeWidth="0.5"
                    />
                  );
                })}
              </svg>

              {/* Y-axis labels */}
              <div className="absolute left-0 top-0 bottom-0 w-12 flex flex-col justify-between text-xs text-gray-600 pr-2">
                <div>{currentGoal.target}</div>
                <div>{Math.round(currentGoal.target * 0.75)}</div>
                <div>{Math.round(currentGoal.target * 0.5)}</div>
                <div>{Math.round(currentGoal.target * 0.25)}</div>
                <div>0</div>
              </div>
            </div>
          </div>

          {/* Milestones */}
          <div className="bg-gray-50 rounded-xl p-6">
            <h3 className="text-lg font-bold text-gray-900 mb-4">Milestones</h3>
            <div className="space-y-3">
              {milestones.map((milestone, index) => (
                <motion.div
                  key={milestone.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: settings.reducedMotion ? 0 : index * 0.1 }}
                  className={`flex items-center justify-between p-4 rounded-lg ${
                    milestone.reached ? 'bg-green-50' : 'bg-white'
                  }`}
                >
                  <div className="flex items-center gap-4">
                    <div className={`text-3xl ${milestone.reached ? '' : 'opacity-30'}`}>
                      {milestone.reached ? '✅' : '⭕'}
                    </div>
                    <div>
                      <div className="font-bold text-gray-900">
                        {milestone.percentage}% Milestone
                      </div>
                      <div className="text-sm text-gray-600">
                        {milestone.value} {currentGoal.unit}
                      </div>
                      {milestone.reachedDate && (
                        <div className="text-xs text-gray-500">
                          Reached {milestone.reachedDate.toLocaleDateString()}
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="text-right">
                    <div className={`font-bold ${
                      milestone.reached ? 'text-green-600' : 'text-gray-400'
                    }`}>
                      {milestone.reward}
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Calendar view */}
      {viewMode === 'calendar' && (
        <div className="bg-gray-50 rounded-xl p-6">
          <h3 className="text-lg font-bold text-gray-900 mb-4">Daily Tracking</h3>
          <div className="grid grid-cols-7 gap-2">
            {dailyTracking.map((day, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: settings.reducedMotion ? 0 : index * 0.02 }}
                className={`aspect-square rounded-lg p-2 flex flex-col items-center justify-center ${
                  day.completed ? 'bg-green-100 border-2 border-green-300' :
                  day.value > 0 ? 'bg-yellow-100 border-2 border-yellow-300' :
                  'bg-white border-2 border-gray-200'
                }`}
              >
                <div className="text-xs font-bold text-gray-600">
                  {day.date.getDate()}
                </div>
                {day.completed && <div className="text-lg">✓</div>}
                {day.value > 0 && (
                  <div className="text-xs font-bold text-gray-700">{day.value}</div>
                )}
              </motion.div>
            ))}
          </div>
        </div>
      )}

      {/* Stats view */}
      {viewMode === 'stats' && (
        <div className="space-y-6">
          {/* Weekly summaries */}
          <div className="bg-gray-50 rounded-xl p-6">
            <h3 className="text-lg font-bold text-gray-900 mb-4">Weekly Progress</h3>
            <div className="space-y-3">
              {weeklySummaries.map((week, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: settings.reducedMotion ? 0 : index * 0.1 }}
                  className="bg-white rounded-lg p-4"
                >
                  <div className="flex items-center justify-between mb-3">
                    <div>
                      <div className="font-bold text-gray-900">{week.week}</div>
                      <div className="text-sm text-gray-600">
                        {week.startDate.toLocaleDateString()} - {week.endDate.toLocaleDateString()}
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-2xl font-bold text-purple-600">{week.averageProgress}%</div>
                      <div className="text-sm text-gray-600">Avg Progress</div>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="text-gray-600">Days Active:</span>
                      <span className="font-bold text-gray-900 ml-2">{week.daysActive}/7</span>
                    </div>
                    <div>
                      <span className="text-gray-600">Total:</span>
                      <span className="font-bold text-gray-900 ml-2">{week.totalValue} min</span>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>

          {/* Consistency metrics */}
          <div className="bg-gray-50 rounded-xl p-6">
            <h3 className="text-lg font-bold text-gray-900 mb-4">Consistency Metrics</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="bg-white rounded-lg p-4 text-center">
                <div className="text-3xl mb-2">🔥</div>
                <div className="text-2xl font-bold text-gray-900">8</div>
                <div className="text-sm text-gray-600">Day Streak</div>
              </div>
              <div className="bg-white rounded-lg p-4 text-center">
                <div className="text-3xl mb-2">📅</div>
                <div className="text-2xl font-bold text-gray-900">12/14</div>
                <div className="text-sm text-gray-600">Days Active</div>
              </div>
              <div className="bg-white rounded-lg p-4 text-center">
                <div className="text-3xl mb-2">⚡</div>
                <div className="text-2xl font-bold text-gray-900">86%</div>
                <div className="text-sm text-gray-600">Completion Rate</div>
              </div>
              <div className="bg-white rounded-lg p-4 text-center">
                <div className="text-3xl mb-2">📈</div>
                <div className="text-2xl font-bold text-gray-900">+{progressRate}</div>
                <div className="text-sm text-gray-600">{currentGoal.unit}/day</div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
