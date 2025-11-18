/**
 * Comparisons Component
 * Step 254 - Build comparison features for performance analysis
 */

import { motion } from 'framer-motion';
import { useState } from 'react';
import { useSettingsStore } from '../store/useSettingsStore';

// Comparison type
export type ComparisonType = 'self' | 'peers' | 'goals' | 'benchmark';

// Comparison period
export interface ComparisonPeriod {
  label: string;
  start: Date;
  end: Date;
}

// Metric comparison
export interface MetricComparison {
  metric: string;
  unit: string;
  current: number;
  comparison: number;
  difference: number;
  percentChange: number;
  better: boolean;
  icon: string;
}

// Peer comparison
export interface PeerComparison {
  category: string;
  yourScore: number;
  peerAverage: number;
  gradeAverage: number;
  topPercentile: number;
  yourPercentile: number;
  unit: string;
}

// Goal comparison
export interface GoalComparison {
  goal: string;
  target: number;
  current: number;
  progress: number;
  onTrack: boolean;
  daysRemaining: number;
  projectedCompletion: string;
  unit: string;
}

// Time period comparison
export interface TimeComparison {
  period: string;
  speed: number;
  accuracy: number;
  sessions: number;
  totalTime: number;
}

// Mock comparison periods
const generateMockPeriods = (): ComparisonPeriod[] => {
  const now = Date.now();
  return [
    {
      label: 'This Week vs Last Week',
      start: new Date(now - 14 * 24 * 60 * 60 * 1000),
      end: new Date(),
    },
    {
      label: 'This Month vs Last Month',
      start: new Date(now - 60 * 24 * 60 * 60 * 1000),
      end: new Date(),
    },
    {
      label: 'Last 30 Days vs Previous 30',
      start: new Date(now - 60 * 24 * 60 * 60 * 1000),
      end: new Date(),
    },
  ];
};

// Mock metric comparisons
const generateMockMetrics = (): MetricComparison[] => {
  return [
    {
      metric: 'Typing Speed',
      unit: 'WPM',
      current: 72,
      comparison: 65,
      difference: 7,
      percentChange: 10.8,
      better: true,
      icon: '⚡',
    },
    {
      metric: 'Accuracy',
      unit: '%',
      current: 94.5,
      comparison: 92.8,
      difference: 1.7,
      percentChange: 1.8,
      better: true,
      icon: '🎯',
    },
    {
      metric: 'Practice Time',
      unit: 'min/day',
      current: 18,
      comparison: 22,
      difference: -4,
      percentChange: -18.2,
      better: false,
      icon: '⏱️',
    },
    {
      metric: 'Error Rate',
      unit: '%',
      current: 5.5,
      comparison: 7.2,
      difference: -1.7,
      percentChange: -23.6,
      better: true,
      icon: '❌',
    },
    {
      metric: 'Consistency',
      unit: '%',
      current: 88,
      comparison: 85,
      difference: 3,
      percentChange: 3.5,
      better: true,
      icon: '📊',
    },
  ];
};

// Mock peer comparisons
const generateMockPeers = (): PeerComparison[] => {
  return [
    {
      category: 'Typing Speed',
      yourScore: 72,
      peerAverage: 58,
      gradeAverage: 55,
      topPercentile: 95,
      yourPercentile: 75,
      unit: 'WPM',
    },
    {
      category: 'Accuracy',
      yourScore: 94.5,
      peerAverage: 91,
      gradeAverage: 89,
      topPercentile: 99,
      yourPercentile: 82,
      unit: '%',
    },
    {
      category: 'Practice Time',
      yourScore: 126,
      peerAverage: 105,
      gradeAverage: 95,
      topPercentile: 200,
      yourPercentile: 68,
      unit: 'min/week',
    },
  ];
};

// Mock goal comparisons
const generateMockGoals = (): GoalComparison[] => {
  return [
    {
      goal: 'Reach 80 WPM',
      target: 80,
      current: 72,
      progress: 90,
      onTrack: true,
      daysRemaining: 14,
      projectedCompletion: '2 weeks',
      unit: 'WPM',
    },
    {
      goal: '95% Accuracy',
      target: 95,
      current: 94.5,
      progress: 99,
      onTrack: true,
      daysRemaining: 7,
      projectedCompletion: '1 week',
      unit: '%',
    },
    {
      goal: '30 Day Streak',
      target: 30,
      current: 12,
      progress: 40,
      onTrack: false,
      daysRemaining: 60,
      projectedCompletion: '8 weeks',
      unit: 'days',
    },
  ];
};

// Mock time comparisons
const generateMockTimeComparisons = (): TimeComparison[] => {
  return [
    {
      period: 'This Week',
      speed: 72,
      accuracy: 94.5,
      sessions: 8,
      totalTime: 145,
    },
    {
      period: 'Last Week',
      speed: 65,
      accuracy: 92.8,
      sessions: 9,
      totalTime: 165,
    },
    {
      period: '2 Weeks Ago',
      speed: 62,
      accuracy: 91.5,
      sessions: 7,
      totalTime: 125,
    },
  ];
};

// Custom hook for comparisons
export function useComparisons() {
  const [comparisonType, setComparisonType] = useState<ComparisonType>('self');
  const [selectedPeriod, setSelectedPeriod] = useState(0);
  const [periods] = useState<ComparisonPeriod[]>(generateMockPeriods());
  const [metrics] = useState<MetricComparison[]>(generateMockMetrics());
  const [peers] = useState<PeerComparison[]>(generateMockPeers());
  const [goals] = useState<GoalComparison[]>(generateMockGoals());
  const [timeComparisons] = useState<TimeComparison[]>(generateMockTimeComparisons());

  const getImprovementCount = () => {
    return metrics.filter((m) => m.better && m.percentChange > 0).length;
  };

  return {
    comparisonType,
    setComparisonType,
    selectedPeriod,
    setSelectedPeriod,
    periods,
    metrics,
    peers,
    goals,
    timeComparisons,
    improvementCount: getImprovementCount(),
  };
}

// Main comparisons component
export default function Comparisons() {
  const {
    comparisonType,
    setComparisonType,
    selectedPeriod,
    setSelectedPeriod,
    periods,
    metrics,
    peers,
    goals,
    timeComparisons,
    improvementCount,
  } = useComparisons();

  const { settings } = useSettingsStore();

  return (
    <div className="bg-white rounded-2xl shadow-xl p-8">
      <h2 className="text-2xl font-bold text-gray-800 mb-6 text-center">
        ⚖️ Performance Comparisons
      </h2>

      {/* Comparison type selector */}
      <div className="mb-8">
        <div className="text-sm font-bold text-gray-700 mb-3">Compare To:</div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
          {[
            { type: 'self' as const, label: 'Past Performance', icon: '📈' },
            { type: 'peers' as const, label: 'Peers & Grade', icon: '👥' },
            { type: 'goals' as const, label: 'Goals', icon: '🎯' },
            { type: 'benchmark' as const, label: 'Benchmarks', icon: '📊' },
          ].map(({ type, label, icon }) => (
            <button
              key={type}
              onClick={() => setComparisonType(type)}
              className={`px-4 py-3 rounded-lg font-bold transition-colors ${
                comparisonType === type
                  ? 'bg-purple-500 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {icon} {label}
            </button>
          ))}
        </div>
      </div>

      {/* Self comparison */}
      {comparisonType === 'self' && (
        <div className="space-y-6">
          {/* Period selector */}
          <div>
            <div className="text-sm font-bold text-gray-700 mb-3">Time Period:</div>
            <div className="flex gap-2 flex-wrap">
              {periods.map((period, index) => (
                <button
                  key={index}
                  onClick={() => setSelectedPeriod(index)}
                  className={`px-4 py-2 rounded-lg font-bold transition-colors ${
                    selectedPeriod === index
                      ? 'bg-blue-500 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  {period.label}
                </button>
              ))}
            </div>
          </div>

          {/* Summary */}
          <div className="bg-gradient-to-br from-green-400 to-emerald-500 rounded-xl p-6 text-white">
            <div className="text-5xl mb-3">📊</div>
            <div className="text-3xl font-bold mb-2">
              {improvementCount} of {metrics.length} Metrics Improved
            </div>
            <div className="text-lg opacity-90">
              You're making great progress in most areas!
            </div>
          </div>

          {/* Metric comparisons */}
          <div className="space-y-4">
            {metrics.map((metric, index) => (
              <motion.div
                key={metric.metric}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: settings.reducedMotion ? 0 : index * 0.05 }}
                className={`rounded-xl p-6 ${
                  metric.better && metric.difference > 0 ? 'bg-green-50' :
                  !metric.better && metric.difference < 0 ? 'bg-red-50' :
                  'bg-gray-50'
                }`}
              >
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="text-3xl">{metric.icon}</div>
                    <div>
                      <div className="font-bold text-gray-900 text-lg">{metric.metric}</div>
                      <div className="text-sm text-gray-600">
                        Comparison: {metric.comparison}{metric.unit}
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-3xl font-bold text-purple-600">
                      {metric.current}{metric.unit}
                    </div>
                    <div className={`text-sm font-bold flex items-center justify-end gap-1 ${
                      (metric.better && metric.difference > 0) || (!metric.better && metric.difference < 0)
                        ? 'text-green-600'
                        : (metric.better && metric.difference < 0) || (!metric.better && metric.difference > 0)
                        ? 'text-red-600'
                        : 'text-gray-600'
                    }`}>
                      {metric.difference > 0 ? '↗' : metric.difference < 0 ? '↘' : '→'}
                      {metric.difference > 0 ? '+' : ''}{metric.difference.toFixed(1)}{metric.unit}
                      ({metric.percentChange > 0 ? '+' : ''}{metric.percentChange.toFixed(1)}%)
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>

          {/* Time period comparison table */}
          <div className="bg-gray-50 rounded-xl p-6">
            <h3 className="text-lg font-bold text-gray-900 mb-4">Performance Over Time</h3>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b-2 border-gray-300">
                    <th className="text-left py-3 px-2 font-bold text-gray-900">Period</th>
                    <th className="text-center py-3 px-2 font-bold text-gray-900">Speed</th>
                    <th className="text-center py-3 px-2 font-bold text-gray-900">Accuracy</th>
                    <th className="text-center py-3 px-2 font-bold text-gray-900">Sessions</th>
                    <th className="text-center py-3 px-2 font-bold text-gray-900">Total Time</th>
                  </tr>
                </thead>
                <tbody>
                  {timeComparisons.map((comp, index) => (
                    <motion.tr
                      key={comp.period}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: settings.reducedMotion ? 0 : index * 0.1 }}
                      className={`border-b border-gray-200 ${
                        index === 0 ? 'bg-purple-50' : 'hover:bg-gray-50'
                      }`}
                    >
                      <td className="py-3 px-2 font-bold text-gray-900">{comp.period}</td>
                      <td className="py-3 px-2 text-center">{comp.speed} WPM</td>
                      <td className="py-3 px-2 text-center">{comp.accuracy}%</td>
                      <td className="py-3 px-2 text-center">{comp.sessions}</td>
                      <td className="py-3 px-2 text-center">{comp.totalTime} min</td>
                    </motion.tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Peer comparison */}
      {comparisonType === 'peers' && (
        <div className="space-y-6">
          <div className="bg-gradient-to-br from-blue-400 to-purple-500 rounded-xl p-6 text-white">
            <div className="text-5xl mb-3">👥</div>
            <div className="text-2xl font-bold mb-2">Peer Comparison</div>
            <div className="text-lg opacity-90">
              See how you compare to others in your grade level
            </div>
          </div>

          {peers.map((peer, index) => (
            <motion.div
              key={peer.category}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: settings.reducedMotion ? 0 : index * 0.1 }}
              className="bg-gray-50 rounded-xl p-6"
            >
              <div className="flex items-center justify-between mb-4">
                <div>
                  <div className="font-bold text-gray-900 text-lg">{peer.category}</div>
                  <div className="text-sm text-gray-600">
                    You're in the top {100 - peer.yourPercentile}%
                  </div>
                </div>
                <div className="text-3xl font-bold text-purple-600">
                  {peer.yourScore}{peer.unit}
                </div>
              </div>

              <div className="space-y-3">
                {/* Your score */}
                <div>
                  <div className="flex items-center justify-between text-sm mb-1">
                    <span className="font-bold text-purple-700">Your Score</span>
                    <span className="font-bold text-purple-600">{peer.yourScore}{peer.unit}</span>
                  </div>
                  <div className="h-8 bg-gray-200 rounded-lg overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${(peer.yourScore / peer.topPercentile) * 100}%` }}
                      transition={{ duration: settings.reducedMotion ? 0 : 1, delay: index * 0.1 }}
                      className="h-full bg-gradient-to-r from-purple-400 to-purple-600"
                    />
                  </div>
                </div>

                {/* Peer average */}
                <div>
                  <div className="flex items-center justify-between text-sm mb-1">
                    <span className="text-gray-600">Peer Average</span>
                    <span className="font-bold text-gray-600">{peer.peerAverage}{peer.unit}</span>
                  </div>
                  <div className="h-6 bg-gray-200 rounded-lg overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${(peer.peerAverage / peer.topPercentile) * 100}%` }}
                      transition={{ duration: settings.reducedMotion ? 0 : 1, delay: index * 0.1 + 0.1 }}
                      className="h-full bg-gradient-to-r from-blue-300 to-blue-400"
                    />
                  </div>
                </div>

                {/* Grade average */}
                <div>
                  <div className="flex items-center justify-between text-sm mb-1">
                    <span className="text-gray-600">Grade Average</span>
                    <span className="font-bold text-gray-600">{peer.gradeAverage}{peer.unit}</span>
                  </div>
                  <div className="h-6 bg-gray-200 rounded-lg overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${(peer.gradeAverage / peer.topPercentile) * 100}%` }}
                      transition={{ duration: settings.reducedMotion ? 0 : 1, delay: index * 0.1 + 0.2 }}
                      className="h-full bg-gradient-to-r from-green-300 to-green-400"
                    />
                  </div>
                </div>

                {/* Top 10% */}
                <div>
                  <div className="flex items-center justify-between text-sm mb-1">
                    <span className="text-gray-600">Top 10%</span>
                    <span className="font-bold text-gray-600">{peer.topPercentile}{peer.unit}</span>
                  </div>
                  <div className="h-6 bg-gray-200 rounded-lg overflow-hidden">
                    <div className="h-full bg-gradient-to-r from-yellow-300 to-orange-400 w-full" />
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      {/* Goal comparison */}
      {comparisonType === 'goals' && (
        <div className="space-y-6">
          <div className="bg-gradient-to-br from-yellow-400 to-orange-500 rounded-xl p-6 text-white">
            <div className="text-5xl mb-3">🎯</div>
            <div className="text-2xl font-bold mb-2">Goal Progress</div>
            <div className="text-lg opacity-90">
              Track your progress toward your goals
            </div>
          </div>

          {goals.map((goal, index) => (
            <motion.div
              key={goal.goal}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: settings.reducedMotion ? 0 : index * 0.1 }}
              className={`rounded-xl p-6 ${
                goal.onTrack ? 'bg-green-50' : 'bg-yellow-50'
              }`}
            >
              <div className="flex items-center justify-between mb-4">
                <div>
                  <div className="font-bold text-gray-900 text-lg">{goal.goal}</div>
                  <div className="text-sm text-gray-600">
                    {goal.current} / {goal.target} {goal.unit}
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-3xl font-bold text-purple-600">
                    {goal.progress}%
                  </div>
                  <div className={`text-xs font-bold ${
                    goal.onTrack ? 'text-green-600' : 'text-orange-600'
                  }`}>
                    {goal.onTrack ? 'On Track' : 'Needs Effort'}
                  </div>
                </div>
              </div>

              <div className="mb-4">
                <div className="h-4 bg-gray-200 rounded-full overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${goal.progress}%` }}
                    transition={{ duration: settings.reducedMotion ? 0 : 1, delay: index * 0.1 }}
                    className={`h-full ${
                      goal.onTrack
                        ? 'bg-gradient-to-r from-green-400 to-green-600'
                        : 'bg-gradient-to-r from-orange-400 to-orange-600'
                    }`}
                  />
                </div>
              </div>

              <div className="flex items-center justify-between text-sm text-gray-600">
                <div>Estimated completion: <span className="font-bold">{goal.projectedCompletion}</span></div>
                <div>{goal.daysRemaining} days remaining</div>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      {/* Benchmark comparison */}
      {comparisonType === 'benchmark' && (
        <div className="space-y-6">
          <div className="bg-gradient-to-br from-indigo-400 to-purple-500 rounded-xl p-6 text-white">
            <div className="text-5xl mb-3">📊</div>
            <div className="text-2xl font-bold mb-2">Benchmark Comparison</div>
            <div className="text-lg opacity-90">
              Compare your performance to industry standards
            </div>
          </div>

          <div className="bg-blue-50 border-2 border-blue-200 rounded-xl p-6">
            <div className="flex items-start gap-3">
              <div className="text-3xl">💡</div>
              <div>
                <div className="font-bold text-blue-900 mb-2">Coming Soon</div>
                <div className="text-sm text-blue-800">
                  Benchmark comparison features are being developed. You'll soon be able to compare your typing skills against industry standards and professional typists.
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
