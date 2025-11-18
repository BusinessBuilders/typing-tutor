/**
 * Accuracy Charts Component
 * Step 243 - Add accuracy tracking charts and error analysis
 */

import { motion } from 'framer-motion';
import { useState } from 'react';
import { useSettingsStore } from '../store/useSettingsStore';

// Accuracy data point interface
export interface AccuracyDataPoint {
  timestamp: Date;
  accuracy: number;
  totalKeystrokes: number;
  correctKeystrokes: number;
  errors: number;
  lessonId: string;
  lessonName: string;
}

// Error breakdown interface
export interface ErrorBreakdown {
  character: string;
  count: number;
  percentage: number;
}

// Accuracy stats interface
export interface AccuracyStats {
  current: number;
  average: number;
  best: number;
  worst: number;
  consistency: number; // 0-100, how consistent the accuracy is
  totalErrors: number;
  mostCommonErrors: ErrorBreakdown[];
}

// Mock accuracy data
const generateMockAccuracyData = (): AccuracyDataPoint[] => {
  const data: AccuracyDataPoint[] = [];
  const now = Date.now();

  for (let i = 30; i >= 0; i--) {
    const baseAccuracy = 85 + Math.random() * 10;
    const trend = (30 - i) * 0.15; // Gradual improvement
    const variance = Math.random() * 5 - 2.5;
    const accuracy = Math.min(100, Math.max(0, baseAccuracy + trend + variance));

    const totalKeystrokes = 500 + Math.floor(Math.random() * 500);
    const correctKeystrokes = Math.floor((accuracy / 100) * totalKeystrokes);

    data.push({
      timestamp: new Date(now - i * 24 * 60 * 60 * 1000),
      accuracy: Number(accuracy.toFixed(1)),
      totalKeystrokes,
      correctKeystrokes,
      errors: totalKeystrokes - correctKeystrokes,
      lessonId: `lesson-${i}`,
      lessonName: `Lesson ${31 - i}`,
    });
  }

  return data;
};

// Mock error breakdown
const MOCK_ERRORS: ErrorBreakdown[] = [
  { character: 'e', count: 45, percentage: 15 },
  { character: 'a', count: 38, percentage: 12.7 },
  { character: 't', count: 32, percentage: 10.7 },
  { character: 'i', count: 28, percentage: 9.3 },
  { character: 'o', count: 25, percentage: 8.3 },
  { character: 'n', count: 22, percentage: 7.3 },
  { character: 's', count: 20, percentage: 6.7 },
  { character: 'r', count: 18, percentage: 6 },
];

// Custom hook for accuracy charts
export function useAccuracyCharts() {
  const [data] = useState<AccuracyDataPoint[]>(generateMockAccuracyData());
  const [timeRange, setTimeRange] = useState<'day' | 'week' | 'month' | 'year' | 'all'>('week');

  const getFilteredData = () => {
    const now = Date.now();
    const ranges = {
      day: 24 * 60 * 60 * 1000,
      week: 7 * 24 * 60 * 60 * 1000,
      month: 30 * 24 * 60 * 60 * 1000,
      year: 365 * 24 * 60 * 60 * 1000,
      all: Infinity,
    };

    const cutoff = now - ranges[timeRange];
    return data.filter((point) => point.timestamp.getTime() >= cutoff);
  };

  const getStats = (): AccuracyStats => {
    const filtered = getFilteredData();
    if (filtered.length === 0) {
      return {
        current: 0,
        average: 0,
        best: 0,
        worst: 0,
        consistency: 0,
        totalErrors: 0,
        mostCommonErrors: [],
      };
    }

    const accuracies = filtered.map((d) => d.accuracy);
    const current = accuracies[accuracies.length - 1];
    const average = Number((accuracies.reduce((sum, acc) => sum + acc, 0) / accuracies.length).toFixed(1));
    const best = Math.max(...accuracies);
    const worst = Math.min(...accuracies);

    // Calculate consistency (100 - variance)
    const variance = accuracies.reduce((sum, acc) => sum + Math.abs(acc - average), 0) / accuracies.length;
    const consistency = Math.max(0, Math.min(100, 100 - variance * 2));

    const totalErrors = filtered.reduce((sum, point) => sum + point.errors, 0);

    return {
      current,
      average,
      best,
      worst,
      consistency: Number(consistency.toFixed(1)),
      totalErrors,
      mostCommonErrors: MOCK_ERRORS.slice(0, 5),
    };
  };

  const getChartPoints = () => {
    const filtered = getFilteredData();
    const width = 100;
    const height = 100;

    return filtered.map((point, index) => {
      const x = (index / (filtered.length - 1)) * width;
      const y = height - (point.accuracy / 100) * height;
      return { x, y, data: point };
    });
  };

  const getSVGPath = () => {
    const points = getChartPoints();
    if (points.length === 0) return '';

    const linePath = points.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x},${p.y}`).join(' ');
    return `${linePath} L ${points[points.length - 1].x},100 L ${points[0].x},100 Z`;
  };

  return {
    data: getFilteredData(),
    timeRange,
    setTimeRange,
    getStats,
    getChartPoints,
    getSVGPath,
  };
}

// Main accuracy charts component
export default function AccuracyCharts() {
  const {
    data,
    timeRange,
    setTimeRange,
    getStats,
    getChartPoints,
    getSVGPath,
  } = useAccuracyCharts();

  const { settings } = useSettingsStore();
  const stats = getStats();
  const chartPoints = getChartPoints();
  const [hoveredPoint, setHoveredPoint] = useState<number | null>(null);

  return (
    <div className="bg-white rounded-2xl shadow-xl p-8">
      <h2 className="text-2xl font-bold text-gray-800 mb-6 text-center">
        🎯 Accuracy Tracking
      </h2>

      {/* Stats overview */}
      <div className="mb-8 grid grid-cols-2 md:grid-cols-5 gap-4">
        <div className="bg-gradient-to-br from-blue-400 to-blue-600 rounded-xl p-4 text-white">
          <div className="text-sm opacity-90 mb-1">Current</div>
          <div className="text-3xl font-bold">{stats.current}%</div>
          <div className="text-xs opacity-80">Accuracy</div>
        </div>
        <div className="bg-gradient-to-br from-green-400 to-green-600 rounded-xl p-4 text-white">
          <div className="text-sm opacity-90 mb-1">Average</div>
          <div className="text-3xl font-bold">{stats.average}%</div>
          <div className="text-xs opacity-80">Accuracy</div>
        </div>
        <div className="bg-gradient-to-br from-yellow-400 to-orange-600 rounded-xl p-4 text-white">
          <div className="text-sm opacity-90 mb-1">Best</div>
          <div className="text-3xl font-bold">{stats.best}%</div>
          <div className="text-xs opacity-80">Accuracy</div>
        </div>
        <div className="bg-gradient-to-br from-purple-400 to-purple-600 rounded-xl p-4 text-white">
          <div className="text-sm opacity-90 mb-1">Consistency</div>
          <div className="text-3xl font-bold">{stats.consistency}%</div>
          <div className="text-xs opacity-80">Score</div>
        </div>
        <div className="bg-gradient-to-br from-red-400 to-pink-600 rounded-xl p-4 text-white">
          <div className="text-sm opacity-90 mb-1">Total Errors</div>
          <div className="text-3xl font-bold">{stats.totalErrors}</div>
          <div className="text-xs opacity-80">Mistakes</div>
        </div>
      </div>

      {/* Time range selector */}
      <div className="mb-6 flex gap-2">
        {(['day', 'week', 'month', 'year', 'all'] as const).map((range) => (
          <button
            key={range}
            onClick={() => setTimeRange(range)}
            className={`px-4 py-2 rounded-lg font-bold capitalize transition-colors ${
              timeRange === range
                ? 'bg-purple-500 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            {range}
          </button>
        ))}
      </div>

      {/* Main chart */}
      <div className="mb-8 bg-gray-50 rounded-xl p-6">
        <div className="relative" style={{ height: '400px' }}>
          {/* Y-axis labels */}
          <div className="absolute left-0 top-0 bottom-0 w-12 flex flex-col justify-between text-xs text-gray-600">
            {[100, 75, 50, 25, 0].map((value) => (
              <div key={value} className="text-right pr-2">{value}%</div>
            ))}
          </div>

          {/* Graph area */}
          <div className="absolute left-12 right-0 top-0 bottom-12">
            <svg
              viewBox="0 0 100 100"
              preserveAspectRatio="none"
              className="w-full h-full"
            >
              {/* Grid lines */}
              {[0, 25, 50, 75, 100].map((y) => (
                <line
                  key={y}
                  x1="0"
                  y1={y}
                  x2="100"
                  y2={y}
                  stroke="#e5e7eb"
                  strokeWidth="0.5"
                />
              ))}

              {/* Target line (90% accuracy) */}
              <line
                x1="0"
                y1={10}
                x2="100"
                y2={10}
                stroke="#22c55e"
                strokeWidth="0.5"
                strokeDasharray="2,2"
                opacity="0.5"
              />

              {/* Area chart */}
              <motion.path
                d={getSVGPath()}
                fill="url(#accuracyGradient)"
                stroke="#3b82f6"
                strokeWidth="2"
                initial={{ pathLength: 0 }}
                animate={{ pathLength: 1 }}
                transition={{ duration: settings.reducedMotion ? 0 : 1.5 }}
              />

              {/* Data points */}
              {chartPoints.map((point, i) => (
                <circle
                  key={i}
                  cx={point.x}
                  cy={point.y}
                  r={hoveredPoint === i ? 2 : 1}
                  fill={point.data.accuracy >= 90 ? '#22c55e' : '#3b82f6'}
                  stroke="white"
                  strokeWidth="0.5"
                  className="cursor-pointer transition-all"
                  onMouseEnter={() => setHoveredPoint(i)}
                  onMouseLeave={() => setHoveredPoint(null)}
                />
              ))}

              {/* Gradient */}
              <defs>
                <linearGradient id="accuracyGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                  <stop offset="0%" stopColor="#3b82f6" stopOpacity="0.3" />
                  <stop offset="100%" stopColor="#3b82f6" stopOpacity="0" />
                </linearGradient>
              </defs>
            </svg>

            {/* Tooltip */}
            {hoveredPoint !== null && chartPoints[hoveredPoint] && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="absolute bg-gray-900 text-white px-4 py-2 rounded-lg text-sm shadow-xl pointer-events-none"
                style={{
                  left: `${chartPoints[hoveredPoint].x}%`,
                  top: `${chartPoints[hoveredPoint].y}%`,
                  transform: 'translate(-50%, -120%)',
                }}
              >
                <div className="font-bold">{chartPoints[hoveredPoint].data.accuracy}% Accuracy</div>
                <div className="text-xs opacity-80">
                  {chartPoints[hoveredPoint].data.errors} errors
                </div>
                <div className="text-xs opacity-80">
                  {chartPoints[hoveredPoint].data.timestamp.toLocaleDateString()}
                </div>
              </motion.div>
            )}
          </div>

          {/* X-axis labels */}
          <div className="absolute left-12 right-0 bottom-0 h-12 flex justify-between items-end text-xs text-gray-600">
            {data.length > 0 && [0, Math.floor(data.length / 2), data.length - 1].map((i) => (
              <div key={i} className="text-center">
                {data[i]?.timestamp.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Error analysis */}
      <div className="mb-8 bg-gray-50 rounded-xl p-6">
        <h3 className="text-lg font-bold text-gray-900 mb-4">Most Common Errors</h3>
        <div className="space-y-3">
          {stats.mostCommonErrors.map((error, index) => (
            <motion.div
              key={error.character}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: settings.reducedMotion ? 0 : index * 0.05 }}
              className="flex items-center gap-4"
            >
              <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center">
                <span className="text-2xl font-bold text-red-600">{error.character}</span>
              </div>
              <div className="flex-1">
                <div className="flex items-center justify-between mb-1">
                  <span className="font-bold text-gray-900">'{error.character}' key</span>
                  <span className="text-sm text-gray-600">
                    {error.count} errors ({error.percentage}%)
                  </span>
                </div>
                <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${error.percentage}%` }}
                    transition={{ duration: settings.reducedMotion ? 0 : 0.5, delay: index * 0.05 }}
                    className="h-full bg-gradient-to-r from-red-400 to-red-600"
                  />
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Recent sessions */}
      <div className="bg-gray-50 rounded-xl p-6">
        <h3 className="text-lg font-bold text-gray-900 mb-4">Recent Sessions</h3>
        <div className="space-y-2">
          {data.slice(-5).reverse().map((point, index) => (
            <motion.div
              key={point.lessonId}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: settings.reducedMotion ? 0 : index * 0.05 }}
              className={`flex items-center justify-between p-3 rounded-lg ${
                point.accuracy >= 95 ? 'bg-green-50' :
                point.accuracy >= 90 ? 'bg-blue-50' :
                point.accuracy >= 80 ? 'bg-yellow-50' :
                'bg-red-50'
              }`}
            >
              <div>
                <div className="font-bold text-gray-900">{point.lessonName}</div>
                <div className="text-sm text-gray-600">
                  {point.timestamp.toLocaleDateString()} • {point.totalKeystrokes} keystrokes
                </div>
              </div>
              <div className="text-right">
                <div className={`text-2xl font-bold ${
                  point.accuracy >= 95 ? 'text-green-600' :
                  point.accuracy >= 90 ? 'text-blue-600' :
                  point.accuracy >= 80 ? 'text-yellow-600' :
                  'text-red-600'
                }`}>
                  {point.accuracy}%
                </div>
                <div className="text-sm text-gray-600">{point.errors} errors</div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
}
