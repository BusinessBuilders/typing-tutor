/**
 * Trend Indicators Component
 * Step 248 - Build trend indicators to show performance changes
 */

import { motion } from 'framer-motion';
import { useState } from 'react';
import { useSettingsStore } from '../store/useSettingsStore';

// Trend direction
export type TrendDirection = 'up' | 'down' | 'stable';

// Trend strength
export type TrendStrength = 'strong' | 'moderate' | 'weak';

// Single trend indicator
export interface TrendIndicator {
  metric: string;
  current: number;
  previous: number;
  change: number; // percentage change
  direction: TrendDirection;
  strength: TrendStrength;
  description: string;
  unit: string;
  good: boolean; // Is this trend good for the user?
}

// Time period comparison
export interface PeriodComparison {
  period: string;
  current: number;
  previous: number;
  change: number;
  unit: string;
}

// Projection data
export interface Projection {
  metric: string;
  current: number;
  projected: number;
  timeframe: string;
  confidence: number; // 0-100
  unit: string;
}

// Milestone progress
export interface MilestoneTrend {
  name: string;
  target: number;
  current: number;
  progress: number; // percentage
  trend: number; // progress change per week
  estimatedCompletion: string;
  unit: string;
}

// Mock trend data
const generateMockTrends = (): TrendIndicator[] => {
  return [
    {
      metric: 'Typing Speed',
      current: 72,
      previous: 65,
      change: 10.8,
      direction: 'up',
      strength: 'strong',
      description: 'Your typing speed has increased significantly',
      unit: 'WPM',
      good: true,
    },
    {
      metric: 'Accuracy',
      current: 94.5,
      previous: 92.8,
      change: 1.8,
      direction: 'up',
      strength: 'moderate',
      description: 'Accuracy is improving steadily',
      unit: '%',
      good: true,
    },
    {
      metric: 'Error Rate',
      current: 5.5,
      previous: 7.2,
      change: -23.6,
      direction: 'down',
      strength: 'strong',
      description: 'Making fewer mistakes overall',
      unit: '%',
      good: true,
    },
    {
      metric: 'Practice Time',
      current: 45,
      previous: 52,
      change: -13.5,
      direction: 'down',
      strength: 'moderate',
      description: 'Practicing less than last week',
      unit: 'min/day',
      good: false,
    },
    {
      metric: 'Consistency',
      current: 88,
      previous: 85,
      change: 3.5,
      direction: 'up',
      strength: 'weak',
      description: 'Performance is becoming more consistent',
      unit: '%',
      good: true,
    },
    {
      metric: 'Daily Streak',
      current: 12,
      previous: 8,
      change: 50,
      direction: 'up',
      strength: 'strong',
      description: 'Building a strong practice habit',
      unit: 'days',
      good: true,
    },
  ];
};

// Mock period comparisons
const generateMockComparisons = (): PeriodComparison[] => {
  return [
    { period: 'This Week vs Last Week', current: 72, previous: 65, change: 10.8, unit: 'WPM' },
    { period: 'This Month vs Last Month', current: 70, previous: 62, change: 12.9, unit: 'WPM' },
    { period: 'Last 30 Days vs Previous 30', current: 69, previous: 61, change: 13.1, unit: 'WPM' },
  ];
};

// Mock projections
const generateMockProjections = (): Projection[] => {
  return [
    {
      metric: 'Speed in 1 Month',
      current: 72,
      projected: 82,
      timeframe: '1 month',
      confidence: 85,
      unit: 'WPM',
    },
    {
      metric: 'Speed in 3 Months',
      current: 72,
      projected: 95,
      timeframe: '3 months',
      confidence: 68,
      unit: 'WPM',
    },
    {
      metric: 'Accuracy in 1 Month',
      current: 94.5,
      projected: 96.8,
      timeframe: '1 month',
      confidence: 78,
      unit: '%',
    },
  ];
};

// Mock milestone trends
const generateMockMilestones = (): MilestoneTrend[] => {
  return [
    {
      name: 'Reach 80 WPM',
      target: 80,
      current: 72,
      progress: 90,
      trend: 2.5,
      estimatedCompletion: '3 weeks',
      unit: 'WPM',
    },
    {
      name: '95% Accuracy',
      target: 95,
      current: 94.5,
      progress: 99.5,
      trend: 0.5,
      estimatedCompletion: '1 week',
      unit: '%',
    },
    {
      name: '30 Day Streak',
      target: 30,
      current: 12,
      progress: 40,
      trend: 1.5,
      estimatedCompletion: '12 weeks',
      unit: 'days',
    },
  ];
};

// Get trend icon
const getTrendIcon = (direction: TrendDirection, good: boolean): string => {
  if (direction === 'stable') return '➡️';
  if (direction === 'up') return good ? '📈' : '📉';
  return good ? '📉' : '📈';
};

// Get trend color
const getTrendColor = (direction: TrendDirection, good: boolean): string => {
  if (direction === 'stable') return 'text-gray-600';
  if (direction === 'up') return good ? 'text-green-600' : 'text-red-600';
  return good ? 'text-green-600' : 'text-red-600';
};

// Get trend background
const getTrendBackground = (direction: TrendDirection, good: boolean): string => {
  if (direction === 'stable') return 'bg-gray-50';
  if (direction === 'up') return good ? 'bg-green-50' : 'bg-red-50';
  return good ? 'bg-green-50' : 'bg-red-50';
};

// Custom hook for trend indicators
export function useTrendIndicators() {
  const [trends] = useState<TrendIndicator[]>(generateMockTrends());
  const [comparisons] = useState<PeriodComparison[]>(generateMockComparisons());
  const [projections] = useState<Projection[]>(generateMockProjections());
  const [milestones] = useState<MilestoneTrend[]>(generateMockMilestones());
  const [filterType, setFilterType] = useState<'all' | 'positive' | 'negative'>('all');

  const getFilteredTrends = () => {
    if (filterType === 'all') return trends;
    if (filterType === 'positive') {
      return trends.filter((t) => t.good === (t.direction === 'up'));
    }
    return trends.filter((t) => t.good === (t.direction === 'down'));
  };

  const getOverallTrend = (): TrendDirection => {
    const goodTrends = trends.filter((t) =>
      (t.direction === 'up' && t.good) || (t.direction === 'down' && !t.good)
    ).length;
    const badTrends = trends.filter((t) =>
      (t.direction === 'down' && t.good) || (t.direction === 'up' && !t.good)
    ).length;

    if (goodTrends > badTrends + 2) return 'up';
    if (badTrends > goodTrends + 2) return 'down';
    return 'stable';
  };

  return {
    trends: getFilteredTrends(),
    allTrends: trends,
    comparisons,
    projections,
    milestones,
    filterType,
    setFilterType,
    overallTrend: getOverallTrend(),
  };
}

// Main trend indicators component
export default function TrendIndicators() {
  const {
    trends,
    comparisons,
    projections,
    milestones,
    filterType,
    setFilterType,
    overallTrend,
  } = useTrendIndicators();

  const { settings } = useSettingsStore();

  return (
    <div className="bg-white rounded-2xl shadow-xl p-8">
      <h2 className="text-2xl font-bold text-gray-800 mb-6 text-center">
        📊 Trend Indicators
      </h2>

      {/* Overall trend */}
      <div className={`mb-8 rounded-xl p-6 ${
        overallTrend === 'up' ? 'bg-gradient-to-br from-green-400 to-green-600' :
        overallTrend === 'down' ? 'bg-gradient-to-br from-red-400 to-red-600' :
        'bg-gradient-to-br from-gray-400 to-gray-600'
      } text-white`}>
        <div className="text-center">
          <div className="text-6xl mb-4">
            {overallTrend === 'up' && '🚀'}
            {overallTrend === 'down' && '⚠️'}
            {overallTrend === 'stable' && '🎯'}
          </div>
          <div className="text-2xl font-bold mb-2">
            {overallTrend === 'up' && 'Excellent Progress!'}
            {overallTrend === 'down' && 'Needs Attention'}
            {overallTrend === 'stable' && 'Maintaining Performance'}
          </div>
          <div className="text-lg opacity-90">
            {overallTrend === 'up' && 'Most of your metrics are trending positively'}
            {overallTrend === 'down' && 'Several metrics need improvement'}
            {overallTrend === 'stable' && 'Your performance is steady and consistent'}
          </div>
        </div>
      </div>

      {/* Filter buttons */}
      <div className="mb-6 flex gap-2 justify-center">
        {(['all', 'positive', 'negative'] as const).map((type) => (
          <button
            key={type}
            onClick={() => setFilterType(type)}
            className={`px-6 py-3 rounded-lg font-bold capitalize transition-colors ${
              filterType === type
                ? 'bg-purple-500 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            {type === 'all' && '📊 All Trends'}
            {type === 'positive' && '✅ Positive Trends'}
            {type === 'negative' && '⚠️ Needs Work'}
          </button>
        ))}
      </div>

      {/* Individual trends */}
      <div className="mb-8 grid grid-cols-1 md:grid-cols-2 gap-4">
        {trends.map((trend, index) => (
          <motion.div
            key={trend.metric}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: settings.reducedMotion ? 0 : index * 0.05 }}
            className={`rounded-xl p-6 ${getTrendBackground(trend.direction, trend.good)}`}
          >
            <div className="flex items-start justify-between mb-4">
              <div>
                <div className="text-sm text-gray-600 mb-1">{trend.metric}</div>
                <div className="text-3xl font-bold text-gray-900">
                  {trend.current}{trend.unit}
                </div>
              </div>
              <div className={`text-4xl ${getTrendColor(trend.direction, trend.good)}`}>
                {getTrendIcon(trend.direction, trend.good)}
              </div>
            </div>

            <div className="flex items-center gap-2 mb-2">
              <div className={`text-2xl font-bold ${getTrendColor(trend.direction, trend.good)}`}>
                {trend.change > 0 ? '+' : ''}{trend.change.toFixed(1)}%
              </div>
              <div className="px-2 py-1 bg-white rounded text-xs font-bold text-gray-600">
                {trend.strength.toUpperCase()}
              </div>
            </div>

            <div className="text-sm text-gray-700">
              {trend.description}
            </div>

            <div className="mt-4 flex items-center justify-between text-xs text-gray-600">
              <span>Previous: {trend.previous}{trend.unit}</span>
              <span>Current: {trend.current}{trend.unit}</span>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Period comparisons */}
      <div className="mb-8 bg-gray-50 rounded-xl p-6">
        <h3 className="text-lg font-bold text-gray-900 mb-4">Period Comparisons</h3>
        <div className="space-y-3">
          {comparisons.map((comparison, index) => (
            <motion.div
              key={comparison.period}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: settings.reducedMotion ? 0 : index * 0.1 }}
              className="bg-white rounded-lg p-4"
            >
              <div className="flex items-center justify-between mb-2">
                <div className="font-bold text-gray-900">{comparison.period}</div>
                <div className={`text-xl font-bold ${
                  comparison.change > 0 ? 'text-green-600' :
                  comparison.change < 0 ? 'text-red-600' :
                  'text-gray-600'
                }`}>
                  {comparison.change > 0 ? '+' : ''}{comparison.change.toFixed(1)}%
                </div>
              </div>
              <div className="flex items-center gap-4 text-sm text-gray-600">
                <div>
                  Previous: <span className="font-bold">{comparison.previous}{comparison.unit}</span>
                </div>
                <div>→</div>
                <div>
                  Current: <span className="font-bold text-purple-600">{comparison.current}{comparison.unit}</span>
                </div>
              </div>
              <div className="mt-2 h-2 bg-gray-200 rounded-full overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${Math.abs(comparison.change)}%` }}
                  transition={{ duration: settings.reducedMotion ? 0 : 0.5, delay: index * 0.1 }}
                  className={`h-full ${
                    comparison.change > 0 ? 'bg-gradient-to-r from-green-400 to-green-600' :
                    'bg-gradient-to-r from-red-400 to-red-600'
                  }`}
                />
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Projections */}
      <div className="mb-8 bg-gray-50 rounded-xl p-6">
        <h3 className="text-lg font-bold text-gray-900 mb-4">Future Projections</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {projections.map((projection, index) => (
            <motion.div
              key={projection.metric}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: settings.reducedMotion ? 0 : index * 0.1 }}
              className="bg-white rounded-lg p-4"
            >
              <div className="text-sm text-gray-600 mb-1">{projection.metric}</div>
              <div className="flex items-baseline gap-2 mb-3">
                <div className="text-3xl font-bold text-purple-600">
                  {projection.projected}{projection.unit}
                </div>
                <div className="text-sm text-gray-600">
                  from {projection.current}{projection.unit}
                </div>
              </div>
              <div className="mb-2">
                <div className="flex items-center justify-between text-xs text-gray-600 mb-1">
                  <span>Confidence</span>
                  <span className="font-bold">{projection.confidence}%</span>
                </div>
                <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${projection.confidence}%` }}
                    transition={{ duration: settings.reducedMotion ? 0 : 1, delay: index * 0.1 }}
                    className={`h-full ${
                      projection.confidence >= 80 ? 'bg-gradient-to-r from-green-400 to-green-600' :
                      projection.confidence >= 60 ? 'bg-gradient-to-r from-yellow-400 to-yellow-600' :
                      'bg-gradient-to-r from-orange-400 to-orange-600'
                    }`}
                  />
                </div>
              </div>
              <div className="text-xs text-gray-600">
                Based on current improvement rate
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Milestone trends */}
      <div className="bg-gray-50 rounded-xl p-6">
        <h3 className="text-lg font-bold text-gray-900 mb-4">Milestone Progress Trends</h3>
        <div className="space-y-4">
          {milestones.map((milestone, index) => (
            <motion.div
              key={milestone.name}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: settings.reducedMotion ? 0 : index * 0.1 }}
              className="bg-white rounded-lg p-4"
            >
              <div className="flex items-start justify-between mb-3">
                <div>
                  <div className="font-bold text-gray-900">{milestone.name}</div>
                  <div className="text-sm text-gray-600">
                    {milestone.current} / {milestone.target} {milestone.unit}
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-2xl font-bold text-purple-600">
                    {milestone.progress.toFixed(0)}%
                  </div>
                  <div className="text-xs text-gray-600">Complete</div>
                </div>
              </div>

              <div className="mb-3">
                <div className="h-3 bg-gray-200 rounded-full overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${milestone.progress}%` }}
                    transition={{ duration: settings.reducedMotion ? 0 : 1, delay: index * 0.1 }}
                    className="h-full bg-gradient-to-r from-purple-400 to-purple-600"
                  />
                </div>
              </div>

              <div className="flex items-center justify-between text-sm">
                <div className="flex items-center gap-2 text-green-600">
                  <span className="text-xl">↗</span>
                  <span className="font-bold">+{milestone.trend} {milestone.unit}/week</span>
                </div>
                <div className="text-gray-600">
                  Est. completion: <span className="font-bold">{milestone.estimatedCompletion}</span>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
}
