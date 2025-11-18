/**
 * Visualizations Component
 * Step 250 - Create comprehensive progress visualizations
 */

import { motion } from 'framer-motion';
import { useState } from 'react';
import { useSettingsStore } from '../store/useSettingsStore';

// Visualization types
export type VisualizationType = 'radar' | 'timeline' | 'comparison' | 'distribution';

// Skill radar data
export interface RadarDataPoint {
  category: string;
  value: number; // 0-100
  maxValue: number;
}

// Timeline event
export interface TimelineEvent {
  date: Date;
  type: 'achievement' | 'milestone' | 'lesson' | 'test';
  title: string;
  description: string;
  value?: number;
  icon: string;
}

// Distribution data
export interface DistributionData {
  range: string;
  count: number;
  percentage: number;
  color: string;
}

// Comparison data
export interface ComparisonData {
  category: string;
  you: number;
  average: number;
  top10: number;
}

// Mock radar data
const generateMockRadarData = (): RadarDataPoint[] => {
  return [
    { category: 'Speed', value: 78, maxValue: 100 },
    { category: 'Accuracy', value: 85, maxValue: 100 },
    { category: 'Consistency', value: 72, maxValue: 100 },
    { category: 'Technique', value: 68, maxValue: 100 },
    { category: 'Endurance', value: 65, maxValue: 100 },
    { category: 'Focus', value: 80, maxValue: 100 },
  ];
};

// Mock timeline events
const generateMockTimeline = (): TimelineEvent[] => {
  const now = Date.now();
  return [
    {
      date: new Date(now - 60 * 24 * 60 * 60 * 1000),
      type: 'milestone' as const,
      title: 'Started Journey',
      description: 'Began typing practice',
      icon: '🌱',
    },
    {
      date: new Date(now - 45 * 24 * 60 * 60 * 1000),
      type: 'achievement' as const,
      title: 'First 50 WPM',
      description: 'Reached 50 WPM milestone',
      value: 50,
      icon: '⚡',
    },
    {
      date: new Date(now - 30 * 24 * 60 * 60 * 1000),
      type: 'lesson' as const,
      title: 'Completed Home Row',
      description: 'Mastered home row keys',
      icon: '📚',
    },
    {
      date: new Date(now - 20 * 24 * 60 * 60 * 1000),
      type: 'achievement' as const,
      title: '90% Accuracy',
      description: 'Achieved 90% accuracy',
      value: 90,
      icon: '🎯',
    },
    {
      date: new Date(now - 10 * 24 * 60 * 60 * 1000),
      type: 'test' as const,
      title: 'Speed Test: 70 WPM',
      description: 'Passed intermediate speed test',
      value: 70,
      icon: '📝',
    },
    {
      date: new Date(now - 5 * 24 * 60 * 60 * 1000),
      type: 'milestone' as const,
      title: '10 Day Streak',
      description: 'Practiced for 10 consecutive days',
      value: 10,
      icon: '🔥',
    },
    {
      date: new Date(now - 1 * 24 * 60 * 60 * 1000),
      type: 'achievement' as const,
      title: 'Personal Best: 75 WPM',
      description: 'New personal record!',
      value: 75,
      icon: '🏆',
    },
  ].sort((a, b) => b.date.getTime() - a.date.getTime());
};

// Mock distribution data
const generateMockDistribution = (): DistributionData[] => {
  return [
    { range: '0-30 WPM', count: 5, percentage: 8, color: 'bg-red-400' },
    { range: '31-50 WPM', count: 12, percentage: 19, color: 'bg-orange-400' },
    { range: '51-70 WPM', count: 25, percentage: 40, color: 'bg-yellow-400' },
    { range: '71-90 WPM', count: 18, percentage: 29, color: 'bg-green-400' },
    { range: '90+ WPM', count: 2, percentage: 4, color: 'bg-blue-400' },
  ];
};

// Mock comparison data
const generateMockComparison = (): ComparisonData[] => {
  return [
    { category: 'Speed (WPM)', you: 72, average: 55, top10: 95 },
    { category: 'Accuracy (%)', you: 94.5, average: 91, top10: 98 },
    { category: 'Practice Time (hrs)', you: 25, average: 18, top10: 45 },
    { category: 'Lessons Completed', you: 35, average: 28, top10: 50 },
  ];
};

// Custom hook for visualizations
export function useVisualizations() {
  const [visualizationType, setVisualizationType] = useState<VisualizationType>('radar');
  const [radarData] = useState<RadarDataPoint[]>(generateMockRadarData());
  const [timeline] = useState<TimelineEvent[]>(generateMockTimeline());
  const [distribution] = useState<DistributionData[]>(generateMockDistribution());
  const [comparison] = useState<ComparisonData[]>(generateMockComparison());

  // Calculate radar chart points
  const getRadarPoints = (): string => {
    const centerX = 50;
    const centerY = 50;
    const radius = 40;
    const angleStep = (2 * Math.PI) / radarData.length;

    const points = radarData.map((point, index) => {
      const angle = index * angleStep - Math.PI / 2;
      const distance = (point.value / point.maxValue) * radius;
      const x = centerX + distance * Math.cos(angle);
      const y = centerY + distance * Math.sin(angle);
      return `${x},${y}`;
    });

    return points.join(' ');
  };

  // Calculate radar max points (outer boundary)
  const getRadarMaxPoints = (): string => {
    const centerX = 50;
    const centerY = 50;
    const radius = 40;
    const angleStep = (2 * Math.PI) / radarData.length;

    const points = radarData.map((_, index) => {
      const angle = index * angleStep - Math.PI / 2;
      const x = centerX + radius * Math.cos(angle);
      const y = centerY + radius * Math.sin(angle);
      return `${x},${y}`;
    });

    return points.join(' ');
  };

  // Get radar label positions
  const getRadarLabels = () => {
    const centerX = 50;
    const centerY = 50;
    const radius = 48;
    const angleStep = (2 * Math.PI) / radarData.length;

    return radarData.map((point, index) => {
      const angle = index * angleStep - Math.PI / 2;
      const x = centerX + radius * Math.cos(angle);
      const y = centerY + radius * Math.sin(angle);
      return { x, y, label: point.category, value: point.value };
    });
  };

  return {
    visualizationType,
    setVisualizationType,
    radarData,
    timeline,
    distribution,
    comparison,
    getRadarPoints,
    getRadarMaxPoints,
    getRadarLabels,
  };
}

// Main visualizations component
export default function Visualizations() {
  const {
    visualizationType,
    setVisualizationType,
    radarData,
    timeline,
    distribution,
    comparison,
    getRadarPoints,
    getRadarMaxPoints,
    getRadarLabels,
  } = useVisualizations();

  const { settings } = useSettingsStore();

  return (
    <div className="bg-white rounded-2xl shadow-xl p-8">
      <h2 className="text-2xl font-bold text-gray-800 mb-6 text-center">
        📈 Progress Visualizations
      </h2>

      {/* Visualization type selector */}
      <div className="mb-8 flex gap-2 flex-wrap justify-center">
        {[
          { type: 'radar' as const, label: 'Skill Radar', icon: '🎯' },
          { type: 'timeline' as const, label: 'Timeline', icon: '📅' },
          { type: 'comparison' as const, label: 'Comparison', icon: '📊' },
          { type: 'distribution' as const, label: 'Distribution', icon: '📈' },
        ].map(({ type, label, icon }) => (
          <button
            key={type}
            onClick={() => setVisualizationType(type)}
            className={`px-6 py-3 rounded-lg font-bold transition-colors ${
              visualizationType === type
                ? 'bg-purple-500 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            {icon} {label}
          </button>
        ))}
      </div>

      {/* Radar Chart */}
      {visualizationType === 'radar' && (
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: settings.reducedMotion ? 0 : 0.3 }}
          className="bg-gray-50 rounded-xl p-8"
        >
          <h3 className="text-lg font-bold text-gray-900 mb-6 text-center">
            Skills Radar Chart
          </h3>
          <div className="relative mx-auto" style={{ maxWidth: '500px', aspectRatio: '1' }}>
            <svg viewBox="0 0 100 100" className="w-full h-full">
              {/* Background circles */}
              {[0.25, 0.5, 0.75, 1].map((scale) => (
                <circle
                  key={scale}
                  cx="50"
                  cy="50"
                  r={40 * scale}
                  fill="none"
                  stroke="#e5e7eb"
                  strokeWidth="0.5"
                />
              ))}

              {/* Grid lines */}
              {radarData.map((_, index) => {
                const angleStep = (2 * Math.PI) / radarData.length;
                const angle = index * angleStep - Math.PI / 2;
                const x = 50 + 40 * Math.cos(angle);
                const y = 50 + 40 * Math.sin(angle);
                return (
                  <line
                    key={index}
                    x1="50"
                    y1="50"
                    x2={x}
                    y2={y}
                    stroke="#e5e7eb"
                    strokeWidth="0.5"
                  />
                );
              })}

              {/* Max boundary polygon */}
              <polygon
                points={getRadarMaxPoints()}
                fill="none"
                stroke="#cbd5e1"
                strokeWidth="1"
                strokeDasharray="2,2"
              />

              {/* Data polygon */}
              <motion.polygon
                points={getRadarPoints()}
                fill="url(#radarGradient)"
                stroke="#8b5cf6"
                strokeWidth="2"
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ duration: settings.reducedMotion ? 0 : 1 }}
                style={{ transformOrigin: '50% 50%' }}
              />

              {/* Data points */}
              {getRadarLabels().map((label, index) => {
                const angleStep = (2 * Math.PI) / radarData.length;
                const angle = index * angleStep - Math.PI / 2;
                const distance = (label.value / 100) * 40;
                const x = 50 + distance * Math.cos(angle);
                const y = 50 + distance * Math.sin(angle);
                return (
                  <circle
                    key={index}
                    cx={x}
                    cy={y}
                    r="2"
                    fill="#8b5cf6"
                    stroke="white"
                    strokeWidth="1"
                  />
                );
              })}

              {/* Gradient */}
              <defs>
                <linearGradient id="radarGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                  <stop offset="0%" stopColor="#8b5cf6" stopOpacity="0.4" />
                  <stop offset="100%" stopColor="#8b5cf6" stopOpacity="0.1" />
                </linearGradient>
              </defs>
            </svg>

            {/* Labels outside the chart */}
            <div className="absolute inset-0">
              {getRadarLabels().map((label, index) => {
                const angleStep = (2 * Math.PI) / radarData.length;
                const angle = index * angleStep - Math.PI / 2;
                const labelRadius = 55;
                const x = 50 + labelRadius * Math.cos(angle);
                const y = 50 + labelRadius * Math.sin(angle);

                return (
                  <div
                    key={index}
                    className="absolute bg-white px-3 py-1 rounded-lg shadow-md text-center"
                    style={{
                      left: `${x}%`,
                      top: `${y}%`,
                      transform: 'translate(-50%, -50%)',
                    }}
                  >
                    <div className="text-xs font-bold text-gray-900">{label.label}</div>
                    <div className="text-sm font-bold text-purple-600">{label.value}</div>
                  </div>
                );
              })}
            </div>
          </div>
        </motion.div>
      )}

      {/* Timeline */}
      {visualizationType === 'timeline' && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: settings.reducedMotion ? 0 : 0.3 }}
          className="bg-gray-50 rounded-xl p-8"
        >
          <h3 className="text-lg font-bold text-gray-900 mb-6 text-center">
            Progress Timeline
          </h3>
          <div className="relative">
            {/* Timeline line */}
            <div className="absolute left-8 top-0 bottom-0 w-0.5 bg-purple-200" />

            {/* Events */}
            <div className="space-y-6">
              {timeline.map((event, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: settings.reducedMotion ? 0 : index * 0.1 }}
                  className="relative flex items-start gap-4 pl-16"
                >
                  {/* Timeline dot */}
                  <div className="absolute left-6 w-4 h-4 bg-purple-500 rounded-full border-4 border-white shadow" />

                  {/* Event card */}
                  <div className={`flex-1 rounded-lg p-4 ${
                    event.type === 'achievement' ? 'bg-yellow-50 border-2 border-yellow-200' :
                    event.type === 'milestone' ? 'bg-purple-50 border-2 border-purple-200' :
                    event.type === 'test' ? 'bg-blue-50 border-2 border-blue-200' :
                    'bg-white border-2 border-gray-200'
                  }`}>
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <div className="text-2xl">{event.icon}</div>
                        <div>
                          <div className="font-bold text-gray-900">{event.title}</div>
                          <div className="text-sm text-gray-600">{event.description}</div>
                        </div>
                      </div>
                      {event.value && (
                        <div className="text-lg font-bold text-purple-600">
                          {event.value}
                        </div>
                      )}
                    </div>
                    <div className="text-xs text-gray-500">
                      {event.date.toLocaleDateString('en-US', {
                        month: 'long',
                        day: 'numeric',
                        year: 'numeric'
                      })}
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </motion.div>
      )}

      {/* Comparison Chart */}
      {visualizationType === 'comparison' && (
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: settings.reducedMotion ? 0 : 0.3 }}
          className="bg-gray-50 rounded-xl p-8"
        >
          <h3 className="text-lg font-bold text-gray-900 mb-6 text-center">
            Performance Comparison
          </h3>
          <div className="space-y-6">
            {comparison.map((item, index) => {
              const maxValue = Math.max(item.you, item.average, item.top10);
              return (
                <motion.div
                  key={item.category}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: settings.reducedMotion ? 0 : index * 0.1 }}
                  className="bg-white rounded-lg p-6"
                >
                  <div className="font-bold text-gray-900 mb-4">{item.category}</div>
                  <div className="space-y-3">
                    {/* You */}
                    <div>
                      <div className="flex items-center justify-between text-sm mb-1">
                        <span className="font-bold text-purple-700">You</span>
                        <span className="font-bold text-purple-600">{item.you}</span>
                      </div>
                      <div className="h-8 bg-gray-200 rounded-lg overflow-hidden">
                        <motion.div
                          initial={{ width: 0 }}
                          animate={{ width: `${(item.you / maxValue) * 100}%` }}
                          transition={{ duration: settings.reducedMotion ? 0 : 1, delay: index * 0.1 }}
                          className="h-full bg-gradient-to-r from-purple-400 to-purple-600 flex items-center justify-end pr-2"
                        >
                          <span className="text-white text-sm font-bold">●</span>
                        </motion.div>
                      </div>
                    </div>

                    {/* Average */}
                    <div>
                      <div className="flex items-center justify-between text-sm mb-1">
                        <span className="text-gray-600">Average</span>
                        <span className="font-bold text-gray-600">{item.average}</span>
                      </div>
                      <div className="h-6 bg-gray-200 rounded-lg overflow-hidden">
                        <motion.div
                          initial={{ width: 0 }}
                          animate={{ width: `${(item.average / maxValue) * 100}%` }}
                          transition={{ duration: settings.reducedMotion ? 0 : 1, delay: index * 0.1 + 0.1 }}
                          className="h-full bg-gradient-to-r from-blue-300 to-blue-400"
                        />
                      </div>
                    </div>

                    {/* Top 10% */}
                    <div>
                      <div className="flex items-center justify-between text-sm mb-1">
                        <span className="text-gray-600">Top 10%</span>
                        <span className="font-bold text-gray-600">{item.top10}</span>
                      </div>
                      <div className="h-6 bg-gray-200 rounded-lg overflow-hidden">
                        <motion.div
                          initial={{ width: 0 }}
                          animate={{ width: `${(item.top10 / maxValue) * 100}%` }}
                          transition={{ duration: settings.reducedMotion ? 0 : 1, delay: index * 0.1 + 0.2 }}
                          className="h-full bg-gradient-to-r from-green-300 to-green-400"
                        />
                      </div>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </motion.div>
      )}

      {/* Distribution Chart */}
      {visualizationType === 'distribution' && (
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: settings.reducedMotion ? 0 : 0.3 }}
          className="bg-gray-50 rounded-xl p-8"
        >
          <h3 className="text-lg font-bold text-gray-900 mb-6 text-center">
            Speed Distribution (Sessions)
          </h3>
          <div className="mb-8">
            <div className="flex items-end justify-between gap-4 h-64">
              {distribution.map((item, index) => {
                const maxCount = Math.max(...distribution.map((d) => d.count));
                const heightPercentage = (item.count / maxCount) * 100;
                return (
                  <motion.div
                    key={item.range}
                    initial={{ scaleY: 0 }}
                    animate={{ scaleY: 1 }}
                    transition={{ delay: settings.reducedMotion ? 0 : index * 0.1 }}
                    className="flex-1 flex flex-col items-center gap-2"
                    style={{ transformOrigin: 'bottom' }}
                  >
                    <div className="flex-1 w-full flex items-end">
                      <div
                        className={`w-full ${item.color} rounded-t-xl relative group cursor-pointer`}
                        style={{ height: `${heightPercentage}%` }}
                      >
                        <div className="absolute inset-0 flex items-center justify-center">
                          <div className="text-white font-bold text-lg">{item.count}</div>
                        </div>
                        <div className="absolute bottom-full mb-2 left-1/2 transform -translate-x-1/2 bg-gray-900 text-white px-3 py-1 rounded text-sm whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
                          {item.percentage}% of sessions
                        </div>
                      </div>
                    </div>
                    <div className="text-sm font-bold text-gray-700 text-center">
                      {item.range}
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </div>

          {/* Distribution summary */}
          <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
            {distribution.map((item, index) => (
              <motion.div
                key={item.range}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: settings.reducedMotion ? 0 : index * 0.05 }}
                className="bg-white rounded-lg p-3 text-center"
              >
                <div className={`w-4 h-4 ${item.color} rounded mx-auto mb-2`} />
                <div className="text-xs text-gray-600">{item.range}</div>
                <div className="font-bold text-gray-900">{item.percentage}%</div>
              </motion.div>
            ))}
          </div>
        </motion.div>
      )}
    </div>
  );
}
