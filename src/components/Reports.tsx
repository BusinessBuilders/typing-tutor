/**
 * Reports Component
 * Step 252 - Create comprehensive progress reports
 */

import { motion } from 'framer-motion';
import { useState } from 'react';
import { useSettingsStore } from '../store/useSettingsStore';

// Report type
export type ReportType = 'overview' | 'detailed' | 'skills' | 'achievements' | 'custom';

// Report period
export type ReportPeriod = 'daily' | 'weekly' | 'monthly' | 'quarterly' | 'yearly' | 'custom';

// Report data
export interface ReportData {
  id: string;
  type: ReportType;
  period: ReportPeriod;
  generatedDate: Date;
  startDate: Date;
  endDate: Date;
  title: string;
  summary: string;
}

// Overview section
export interface OverviewSection {
  metric: string;
  value: string;
  change: number;
  trend: 'up' | 'down' | 'stable';
  icon: string;
}

// Performance metric
export interface PerformanceMetric {
  category: string;
  current: number;
  previous: number;
  change: number;
  unit: string;
  details: string;
}

// Skill breakdown
export interface SkillBreakdown {
  skill: string;
  level: string;
  score: number;
  progress: number;
  strengths: string[];
  improvements: string[];
}

// Achievement summary
export interface AchievementSummary {
  total: number;
  newThisPeriod: number;
  categories: {
    category: string;
    count: number;
    icon: string;
  }[];
  recent: {
    name: string;
    date: Date;
    icon: string;
  }[];
}

// Practice summary
export interface PracticeSummary {
  totalSessions: number;
  totalTime: number;
  averageSessionLength: number;
  longestSession: number;
  consistency: number;
  streakDays: number;
}

// Mock report data
const generateMockReport = (): ReportData => {
  const endDate = new Date();
  const startDate = new Date(endDate.getTime() - 7 * 24 * 60 * 60 * 1000);

  return {
    id: 'report-1',
    type: 'overview',
    period: 'weekly',
    generatedDate: new Date(),
    startDate,
    endDate,
    title: 'Weekly Progress Report',
    summary: 'Strong progress this week with consistent practice and skill improvements.',
  };
};

// Mock overview
const generateMockOverview = (): OverviewSection[] => {
  return [
    {
      metric: 'Typing Speed',
      value: '72 WPM',
      change: 8.5,
      trend: 'up',
      icon: '⚡',
    },
    {
      metric: 'Accuracy',
      value: '94.5%',
      change: 2.1,
      trend: 'up',
      icon: '🎯',
    },
    {
      metric: 'Practice Time',
      value: '3.2 hrs',
      change: -5.2,
      trend: 'down',
      icon: '⏱️',
    },
    {
      metric: 'Consistency',
      value: '88%',
      change: 0.8,
      trend: 'stable',
      icon: '📊',
    },
  ];
};

// Mock performance metrics
const generateMockPerformance = (): PerformanceMetric[] => {
  return [
    {
      category: 'Words Per Minute',
      current: 72,
      previous: 65,
      change: 10.8,
      unit: 'WPM',
      details: 'Significant improvement in typing speed',
    },
    {
      category: 'Accuracy Rate',
      current: 94.5,
      previous: 92.8,
      change: 1.8,
      unit: '%',
      details: 'Steady improvement in accuracy',
    },
    {
      category: 'Error Rate',
      current: 5.5,
      previous: 7.2,
      change: -23.6,
      unit: '%',
      details: 'Fewer mistakes overall',
    },
    {
      category: 'Average Session',
      current: 18.5,
      previous: 16.2,
      change: 14.2,
      unit: 'min',
      details: 'Longer practice sessions',
    },
  ];
};

// Mock skill breakdown
const generateMockSkills = (): SkillBreakdown[] => {
  return [
    {
      skill: 'Home Row Keys',
      level: 'Advanced',
      score: 92,
      progress: 85,
      strengths: ['Fast key recognition', 'Good muscle memory'],
      improvements: ['Maintain consistency'],
    },
    {
      skill: 'Number Row',
      level: 'Intermediate',
      score: 68,
      progress: 55,
      strengths: ['Improving steadily'],
      improvements: ['Practice number combinations', 'Focus on accuracy'],
    },
    {
      skill: 'Special Characters',
      level: 'Beginner',
      score: 45,
      progress: 30,
      strengths: ['Basic symbols mastered'],
      improvements: ['Practice less common symbols', 'Build muscle memory'],
    },
  ];
};

// Mock achievement summary
const generateMockAchievements = (): AchievementSummary => {
  return {
    total: 24,
    newThisPeriod: 3,
    categories: [
      { category: 'Speed Milestones', count: 8, icon: '⚡' },
      { category: 'Accuracy Awards', count: 6, icon: '🎯' },
      { category: 'Streak Badges', count: 5, icon: '🔥' },
      { category: 'Special Achievements', count: 5, icon: '🏆' },
    ],
    recent: [
      { name: '7-Day Streak', date: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000), icon: '🔥' },
      { name: '70 WPM Milestone', date: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000), icon: '⚡' },
      { name: '95% Accuracy', date: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000), icon: '🎯' },
    ],
  };
};

// Mock practice summary
const generateMockPractice = (): PracticeSummary => {
  return {
    totalSessions: 14,
    totalTime: 245,
    averageSessionLength: 17.5,
    longestSession: 32,
    consistency: 88,
    streakDays: 9,
  };
};

// Custom hook for reports
export function useReports() {
  const [report] = useState<ReportData>(generateMockReport());
  const [overview] = useState<OverviewSection[]>(generateMockOverview());
  const [performance] = useState<PerformanceMetric[]>(generateMockPerformance());
  const [skills] = useState<SkillBreakdown[]>(generateMockSkills());
  const [achievements] = useState<AchievementSummary>(generateMockAchievements());
  const [practice] = useState<PracticeSummary>(generateMockPractice());
  const [selectedType, setSelectedType] = useState<ReportType>('overview');
  const [selectedPeriod, setSelectedPeriod] = useState<ReportPeriod>('weekly');

  return {
    report,
    overview,
    performance,
    skills,
    achievements,
    practice,
    selectedType,
    setSelectedType,
    selectedPeriod,
    setSelectedPeriod,
  };
}

// Get level color
const getLevelColor = (level: string): string => {
  switch (level.toLowerCase()) {
    case 'advanced':
    case 'expert':
      return 'text-green-600';
    case 'intermediate':
      return 'text-blue-600';
    case 'beginner':
      return 'text-orange-600';
    default:
      return 'text-gray-600';
  }
};

// Main reports component
export default function Reports() {
  const {
    report,
    overview,
    performance,
    skills,
    achievements,
    practice,
    selectedType,
    setSelectedType,
    selectedPeriod,
    setSelectedPeriod,
  } = useReports();

  const { settings } = useSettingsStore();

  return (
    <div className="bg-white rounded-2xl shadow-xl p-8">
      <h2 className="text-2xl font-bold text-gray-800 mb-6 text-center">
        📊 Progress Reports
      </h2>

      {/* Report controls */}
      <div className="mb-8 space-y-4">
        {/* Report type selector */}
        <div>
          <div className="text-sm font-bold text-gray-700 mb-2">Report Type</div>
          <div className="flex gap-2 flex-wrap">
            {[
              { type: 'overview' as const, label: '📋 Overview' },
              { type: 'detailed' as const, label: '📈 Detailed' },
              { type: 'skills' as const, label: '🎯 Skills' },
              { type: 'achievements' as const, label: '🏆 Achievements' },
            ].map(({ type, label }) => (
              <button
                key={type}
                onClick={() => setSelectedType(type)}
                className={`px-4 py-2 rounded-lg font-bold transition-colors ${
                  selectedType === type
                    ? 'bg-purple-500 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {label}
              </button>
            ))}
          </div>
        </div>

        {/* Period selector */}
        <div>
          <div className="text-sm font-bold text-gray-700 mb-2">Time Period</div>
          <div className="flex gap-2 flex-wrap">
            {[
              { period: 'daily' as const, label: 'Daily' },
              { period: 'weekly' as const, label: 'Weekly' },
              { period: 'monthly' as const, label: 'Monthly' },
              { period: 'quarterly' as const, label: 'Quarterly' },
              { period: 'yearly' as const, label: 'Yearly' },
            ].map(({ period, label }) => (
              <button
                key={period}
                onClick={() => setSelectedPeriod(period)}
                className={`px-4 py-2 rounded-lg font-bold transition-colors ${
                  selectedPeriod === period
                    ? 'bg-blue-500 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Report header */}
      <div className="mb-8 bg-gradient-to-br from-purple-400 to-purple-600 rounded-xl p-6 text-white">
        <div className="text-3xl font-bold mb-2">{report.title}</div>
        <div className="text-lg opacity-90 mb-4">{report.summary}</div>
        <div className="flex items-center gap-6 text-sm">
          <div>
            <span className="opacity-80">Period: </span>
            <span className="font-bold">
              {report.startDate.toLocaleDateString()} - {report.endDate.toLocaleDateString()}
            </span>
          </div>
          <div>
            <span className="opacity-80">Generated: </span>
            <span className="font-bold">{report.generatedDate.toLocaleDateString()}</span>
          </div>
        </div>
      </div>

      {/* Overview report */}
      {selectedType === 'overview' && (
        <div className="space-y-8">
          {/* Quick stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {overview.map((item, index) => (
              <motion.div
                key={item.metric}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: settings.reducedMotion ? 0 : index * 0.05 }}
                className={`rounded-xl p-4 ${
                  item.trend === 'up' ? 'bg-green-50' :
                  item.trend === 'down' ? 'bg-red-50' :
                  'bg-gray-50'
                }`}
              >
                <div className="text-3xl mb-2">{item.icon}</div>
                <div className="text-sm text-gray-600 mb-1">{item.metric}</div>
                <div className="text-2xl font-bold text-gray-900 mb-1">{item.value}</div>
                <div className={`text-sm font-bold flex items-center gap-1 ${
                  item.trend === 'up' ? 'text-green-600' :
                  item.trend === 'down' ? 'text-red-600' :
                  'text-gray-600'
                }`}>
                  {item.trend === 'up' && '↗'}
                  {item.trend === 'down' && '↘'}
                  {item.trend === 'stable' && '→'}
                  {item.change > 0 ? '+' : ''}{item.change.toFixed(1)}%
                </div>
              </motion.div>
            ))}
          </div>

          {/* Practice summary */}
          <div className="bg-gray-50 rounded-xl p-6">
            <h3 className="text-lg font-bold text-gray-900 mb-4">Practice Summary</h3>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              <div>
                <div className="text-sm text-gray-600">Total Sessions</div>
                <div className="text-2xl font-bold text-purple-600">{practice.totalSessions}</div>
              </div>
              <div>
                <div className="text-sm text-gray-600">Total Time</div>
                <div className="text-2xl font-bold text-purple-600">
                  {Math.floor(practice.totalTime / 60)}h {practice.totalTime % 60}m
                </div>
              </div>
              <div>
                <div className="text-sm text-gray-600">Avg Session</div>
                <div className="text-2xl font-bold text-purple-600">
                  {practice.averageSessionLength.toFixed(1)} min
                </div>
              </div>
              <div>
                <div className="text-sm text-gray-600">Longest Session</div>
                <div className="text-2xl font-bold text-purple-600">{practice.longestSession} min</div>
              </div>
              <div>
                <div className="text-sm text-gray-600">Consistency</div>
                <div className="text-2xl font-bold text-purple-600">{practice.consistency}%</div>
              </div>
              <div>
                <div className="text-sm text-gray-600">Current Streak</div>
                <div className="text-2xl font-bold text-purple-600">{practice.streakDays} days</div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Detailed report */}
      {selectedType === 'detailed' && (
        <div className="space-y-6">
          <h3 className="text-lg font-bold text-gray-900">Performance Metrics</h3>
          {performance.map((metric, index) => (
            <motion.div
              key={metric.category}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: settings.reducedMotion ? 0 : index * 0.1 }}
              className="bg-gray-50 rounded-xl p-6"
            >
              <div className="flex items-center justify-between mb-4">
                <div>
                  <div className="font-bold text-gray-900 text-lg">{metric.category}</div>
                  <div className="text-sm text-gray-600">{metric.details}</div>
                </div>
                <div className="text-right">
                  <div className="text-3xl font-bold text-purple-600">
                    {metric.current}{metric.unit}
                  </div>
                  <div className={`text-sm font-bold ${
                    metric.change > 0 ? 'text-green-600' :
                    metric.change < 0 ? 'text-red-600' :
                    'text-gray-600'
                  }`}>
                    {metric.change > 0 ? '+' : ''}{metric.change.toFixed(1)}%
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-4 text-sm text-gray-600">
                <div>Previous: {metric.previous}{metric.unit}</div>
                <div>→</div>
                <div>Current: {metric.current}{metric.unit}</div>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      {/* Skills report */}
      {selectedType === 'skills' && (
        <div className="space-y-4">
          <h3 className="text-lg font-bold text-gray-900">Skill Breakdown</h3>
          {skills.map((skill, index) => (
            <motion.div
              key={skill.skill}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: settings.reducedMotion ? 0 : index * 0.1 }}
              className="bg-gray-50 rounded-xl p-6"
            >
              <div className="flex items-center justify-between mb-4">
                <div>
                  <div className="font-bold text-gray-900 text-lg">{skill.skill}</div>
                  <div className={`text-sm font-bold ${getLevelColor(skill.level)}`}>
                    {skill.level} Level
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-3xl font-bold text-purple-600">{skill.score}</div>
                  <div className="text-sm text-gray-600">Score</div>
                </div>
              </div>

              <div className="mb-4">
                <div className="flex items-center justify-between text-sm text-gray-600 mb-1">
                  <span>Progress to Mastery</span>
                  <span className="font-bold">{skill.progress}%</span>
                </div>
                <div className="h-3 bg-gray-200 rounded-full overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${skill.progress}%` }}
                    transition={{ duration: settings.reducedMotion ? 0 : 1, delay: index * 0.1 }}
                    className="h-full bg-gradient-to-r from-purple-400 to-purple-600"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <div className="text-sm font-bold text-green-700 mb-2">✓ Strengths</div>
                  <ul className="space-y-1">
                    {skill.strengths.map((strength, i) => (
                      <li key={i} className="text-sm text-gray-700 flex items-start gap-2">
                        <span className="text-green-600">+</span>
                        <span>{strength}</span>
                      </li>
                    ))}
                  </ul>
                </div>
                <div>
                  <div className="text-sm font-bold text-blue-700 mb-2">→ Areas to Improve</div>
                  <ul className="space-y-1">
                    {skill.improvements.map((improvement, i) => (
                      <li key={i} className="text-sm text-gray-700 flex items-start gap-2">
                        <span className="text-blue-600">▸</span>
                        <span>{improvement}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      {/* Achievements report */}
      {selectedType === 'achievements' && (
        <div className="space-y-6">
          {/* Summary cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-gradient-to-br from-yellow-400 to-orange-500 rounded-xl p-6 text-white">
              <div className="text-5xl mb-2">🏆</div>
              <div className="text-4xl font-bold mb-1">{achievements.total}</div>
              <div className="text-lg opacity-90">Total Achievements</div>
            </div>
            <div className="bg-gradient-to-br from-green-400 to-emerald-500 rounded-xl p-6 text-white">
              <div className="text-5xl mb-2">✨</div>
              <div className="text-4xl font-bold mb-1">{achievements.newThisPeriod}</div>
              <div className="text-lg opacity-90">New This Period</div>
            </div>
          </div>

          {/* Categories */}
          <div className="bg-gray-50 rounded-xl p-6">
            <h3 className="text-lg font-bold text-gray-900 mb-4">Achievement Categories</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {achievements.categories.map((cat, index) => (
                <motion.div
                  key={cat.category}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: settings.reducedMotion ? 0 : index * 0.05 }}
                  className="bg-white rounded-lg p-4 flex items-center justify-between"
                >
                  <div className="flex items-center gap-3">
                    <div className="text-3xl">{cat.icon}</div>
                    <div className="font-bold text-gray-900">{cat.category}</div>
                  </div>
                  <div className="text-2xl font-bold text-purple-600">{cat.count}</div>
                </motion.div>
              ))}
            </div>
          </div>

          {/* Recent achievements */}
          <div className="bg-gray-50 rounded-xl p-6">
            <h3 className="text-lg font-bold text-gray-900 mb-4">Recently Earned</h3>
            <div className="space-y-3">
              {achievements.recent.map((achievement, index) => (
                <motion.div
                  key={achievement.name}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: settings.reducedMotion ? 0 : index * 0.1 }}
                  className="bg-white rounded-lg p-4 flex items-center justify-between"
                >
                  <div className="flex items-center gap-4">
                    <div className="text-4xl">{achievement.icon}</div>
                    <div>
                      <div className="font-bold text-gray-900">{achievement.name}</div>
                      <div className="text-sm text-gray-600">
                        {achievement.date.toLocaleDateString()}
                      </div>
                    </div>
                  </div>
                  <div className="px-3 py-1 bg-yellow-100 text-yellow-700 rounded-full text-sm font-bold">
                    NEW
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Export/Print buttons */}
      <div className="mt-8 flex gap-3 justify-center">
        <button className="px-6 py-3 bg-purple-500 text-white rounded-lg font-bold hover:bg-purple-600 transition-colors flex items-center gap-2">
          📥 Export Report
        </button>
        <button className="px-6 py-3 bg-blue-500 text-white rounded-lg font-bold hover:bg-blue-600 transition-colors flex items-center gap-2">
          🖨️ Print Report
        </button>
        <button className="px-6 py-3 bg-green-500 text-white rounded-lg font-bold hover:bg-green-600 transition-colors flex items-center gap-2">
          📧 Email Report
        </button>
      </div>
    </div>
  );
}
