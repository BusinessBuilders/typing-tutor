/**
 * Speed Graphs Component
 * Step 242 - Build speed tracking graphs and visualizations
 */

import { motion } from 'framer-motion';
import { useState } from 'react';
import { useSettingsStore } from '../store/useSettingsStore';

// Speed data point interface
export interface SpeedDataPoint {
  timestamp: Date;
  wpm: number;
  lessonId: string;
  lessonName: string;
  accuracy: number;
  duration: number; // seconds
}

// Speed statistics interface
export interface SpeedStats {
  current: number;
  average: number;
  best: number;
  worst: number;
  median: number;
  trend: 'up' | 'down' | 'stable';
  improvement: number; // percentage
}

// Time range options
export type TimeRange = 'day' | 'week' | 'month' | 'year' | 'all';

// Mock speed data
const generateMockSpeedData = (): SpeedDataPoint[] => {
  const data: SpeedDataPoint[] = [];
  const now = Date.now();

  for (let i = 30; i >= 0; i--) {
    const baseWPM = 50 + Math.random() * 20;
    const trend = (30 - i) * 0.5; // Gradual improvement
    const variance = Math.random() * 10 - 5;

    data.push({
      timestamp: new Date(now - i * 24 * 60 * 60 * 1000),
      wpm: Math.round(baseWPM + trend + variance),
      lessonId: `lesson-${i}`,
      lessonName: `Lesson ${31 - i}`,
      accuracy: 90 + Math.random() * 10,
      duration: 300 + Math.random() * 300,
    });
  }

  return data;
};

// Custom hook for speed graphs
export function useSpeedGraphs() {
  const [data] = useState<SpeedDataPoint[]>(generateMockSpeedData());
  const [timeRange, setTimeRange] = useState<TimeRange>('week');
  const [graphType, setGraphType] = useState<'line' | 'bar' | 'area'>('line');

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

  const getStats = (): SpeedStats => {
    const filtered = getFilteredData();
    if (filtered.length === 0) {
      return {
        current: 0,
        average: 0,
        best: 0,
        worst: 0,
        median: 0,
        trend: 'stable',
        improvement: 0,
      };
    }

    const wpms = filtered.map((d) => d.wpm);
    const sorted = [...wpms].sort((a, b) => a - b);

    const current = wpms[wpms.length - 1];
    const average = Math.round(wpms.reduce((sum, wpm) => sum + wpm, 0) / wpms.length);
    const best = Math.max(...wpms);
    const worst = Math.min(...wpms);
    const median = sorted[Math.floor(sorted.length / 2)];

    // Calculate trend
    const firstHalf = wpms.slice(0, Math.floor(wpms.length / 2));
    const secondHalf = wpms.slice(Math.floor(wpms.length / 2));
    const firstAvg = firstHalf.reduce((sum, wpm) => sum + wpm, 0) / firstHalf.length;
    const secondAvg = secondHalf.reduce((sum, wpm) => sum + wpm, 0) / secondHalf.length;

    let trend: 'up' | 'down' | 'stable' = 'stable';
    const diff = secondAvg - firstAvg;
    if (diff > 2) trend = 'up';
    else if (diff < -2) trend = 'down';

    const improvement = firstAvg > 0 ? Math.round(((secondAvg - firstAvg) / firstAvg) * 100) : 0;

    return {
      current,
      average,
      best,
      worst,
      median,
      trend,
      improvement,
    };
  };

  const getMaxWPM = () => {
    const filtered = getFilteredData();
    return Math.max(...filtered.map((d) => d.wpm), 100);
  };

  const getChartPoints = () => {
    const filtered = getFilteredData();
    const maxWPM = getMaxWPM();
    const width = 100;
    const height = 100;

    return filtered.map((point, index) => {
      const x = (index / (filtered.length - 1)) * width;
      const y = height - (point.wpm / maxWPM) * height;
      return { x, y, data: point };
    });
  };

  const getSVGPath = () => {
    const points = getChartPoints();
    if (points.length === 0) return '';

    if (graphType === 'area') {
      const linePath = points.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x},${p.y}`).join(' ');
      return `${linePath} L ${points[points.length - 1].x},100 L ${points[0].x},100 Z`;
    } else if (graphType === 'line') {
      return points.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x},${p.y}`).join(' ');
    }

    return '';
  };

  return {
    data: getFilteredData(),
    timeRange,
    setTimeRange,
    graphType,
    setGraphType,
    getStats,
    getMaxWPM,
    getChartPoints,
    getSVGPath,
  };
}

// Main speed graphs component
export default function SpeedGraphs() {
  const {
    data,
    timeRange,
    setTimeRange,
    graphType,
    setGraphType,
    getStats,
    getMaxWPM,
    getChartPoints,
    getSVGPath,
  } = useSpeedGraphs();

  const { settings } = useSettingsStore();
  const stats = getStats();
  const maxWPM = getMaxWPM();
  const chartPoints = getChartPoints();
  const [hoveredPoint, setHoveredPoint] = useState<number | null>(null);

  return (
    <div className="bg-white rounded-2xl shadow-xl p-8">
      <h2 className="text-2xl font-bold text-gray-800 mb-6 text-center">
        ⚡ Speed Tracking
      </h2>

      {/* Stats overview */}
      <div className="mb-8 grid grid-cols-2 md:grid-cols-5 gap-4">
        <div className="bg-gradient-to-br from-blue-400 to-blue-600 rounded-xl p-4 text-white">
          <div className="text-sm opacity-90 mb-1">Current</div>
          <div className="text-3xl font-bold">{stats.current}</div>
          <div className="text-xs opacity-80">WPM</div>
        </div>
        <div className="bg-gradient-to-br from-green-400 to-green-600 rounded-xl p-4 text-white">
          <div className="text-sm opacity-90 mb-1">Average</div>
          <div className="text-3xl font-bold">{stats.average}</div>
          <div className="text-xs opacity-80">WPM</div>
        </div>
        <div className="bg-gradient-to-br from-yellow-400 to-orange-600 rounded-xl p-4 text-white">
          <div className="text-sm opacity-90 mb-1">Best</div>
          <div className="text-3xl font-bold">{stats.best}</div>
          <div className="text-xs opacity-80">WPM</div>
        </div>
        <div className="bg-gradient-to-br from-purple-400 to-purple-600 rounded-xl p-4 text-white">
          <div className="text-sm opacity-90 mb-1">Median</div>
          <div className="text-3xl font-bold">{stats.median}</div>
          <div className="text-xs opacity-80">WPM</div>
        </div>
        <div className={`bg-gradient-to-br ${
          stats.trend === 'up' ? 'from-green-400 to-teal-600' :
          stats.trend === 'down' ? 'from-red-400 to-pink-600' :
          'from-gray-400 to-gray-600'
        } rounded-xl p-4 text-white`}>
          <div className="text-sm opacity-90 mb-1">Trend</div>
          <div className="text-3xl font-bold">
            {stats.trend === 'up' && '↗'}
            {stats.trend === 'down' && '↘'}
            {stats.trend === 'stable' && '→'}
          </div>
          <div className="text-xs opacity-80">
            {stats.improvement > 0 ? '+' : ''}{stats.improvement}%
          </div>
        </div>
      </div>

      {/* Controls */}
      <div className="mb-6 flex flex-wrap gap-4 justify-between">
        {/* Time range selector */}
        <div className="flex gap-2">
          {(['day', 'week', 'month', 'year', 'all'] as TimeRange[]).map((range) => (
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

        {/* Graph type selector */}
        <div className="flex gap-2">
          {(['line', 'bar', 'area'] as const).map((type) => (
            <button
              key={type}
              onClick={() => setGraphType(type)}
              className={`px-4 py-2 rounded-lg font-bold capitalize transition-colors ${
                graphType === type
                  ? 'bg-blue-500 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {type}
            </button>
          ))}
        </div>
      </div>

      {/* Main graph */}
      <div className="mb-8 bg-gray-50 rounded-xl p-6">
        <div className="relative" style={{ height: '400px' }}>
          {/* Y-axis labels */}
          <div className="absolute left-0 top-0 bottom-0 w-12 flex flex-col justify-between text-xs text-gray-600">
            {[maxWPM, Math.round(maxWPM * 0.75), Math.round(maxWPM * 0.5), Math.round(maxWPM * 0.25), 0].map((value) => (
              <div key={value} className="text-right pr-2">{value}</div>
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

              {/* Area/Line graph */}
              {graphType !== 'bar' && (
                <motion.path
                  d={getSVGPath()}
                  fill={graphType === 'area' ? 'url(#gradient)' : 'none'}
                  stroke="#8b5cf6"
                  strokeWidth="2"
                  initial={{ pathLength: 0 }}
                  animate={{ pathLength: 1 }}
                  transition={{ duration: settings.reducedMotion ? 0 : 1.5 }}
                />
              )}

              {/* Bar graph */}
              {graphType === 'bar' && chartPoints.map((point, i) => (
                <motion.rect
                  key={i}
                  x={point.x - 0.5}
                  y={point.y}
                  width="1"
                  height={100 - point.y}
                  fill="#8b5cf6"
                  initial={{ scaleY: 0 }}
                  animate={{ scaleY: 1 }}
                  transition={{ delay: settings.reducedMotion ? 0 : i * 0.02 }}
                  style={{ transformOrigin: `${point.x}px 100px` }}
                />
              ))}

              {/* Data points */}
              {chartPoints.map((point, i) => (
                <circle
                  key={i}
                  cx={point.x}
                  cy={point.y}
                  r={hoveredPoint === i ? 2 : 1}
                  fill="#8b5cf6"
                  stroke="white"
                  strokeWidth="0.5"
                  className="cursor-pointer transition-all"
                  onMouseEnter={() => setHoveredPoint(i)}
                  onMouseLeave={() => setHoveredPoint(null)}
                />
              ))}

              {/* Gradient for area chart */}
              <defs>
                <linearGradient id="gradient" x1="0%" y1="0%" x2="0%" y2="100%">
                  <stop offset="0%" stopColor="#8b5cf6" stopOpacity="0.3" />
                  <stop offset="100%" stopColor="#8b5cf6" stopOpacity="0" />
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
                <div className="font-bold">{chartPoints[hoveredPoint].data.wpm} WPM</div>
                <div className="text-xs opacity-80">
                  {chartPoints[hoveredPoint].data.lessonName}
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
              className="flex items-center justify-between p-3 bg-white rounded-lg"
            >
              <div>
                <div className="font-bold text-gray-900">{point.lessonName}</div>
                <div className="text-sm text-gray-600">
                  {point.timestamp.toLocaleDateString()} • {Math.floor(point.duration / 60)}m {point.duration % 60}s
                </div>
              </div>
              <div className="text-right">
                <div className="text-2xl font-bold text-purple-600">{point.wpm} WPM</div>
                <div className="text-sm text-gray-600">{point.accuracy.toFixed(1)}% accuracy</div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
}
