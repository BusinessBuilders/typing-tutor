/**
 * Assessments Component
 * Step 249 - Add comprehensive skill assessments
 */

import { motion } from 'framer-motion';
import { useState } from 'react';
import { useSettingsStore } from '../store/useSettingsStore';

// Skill level
export type SkillLevel = 'beginner' | 'intermediate' | 'advanced' | 'expert';

// Skill category
export interface SkillCategory {
  name: string;
  score: number; // 0-100
  level: SkillLevel;
  description: string;
  icon: string;
  strengths: string[];
  weaknesses: string[];
}

// Overall assessment
export interface OverallAssessment {
  level: SkillLevel;
  overallScore: number; // 0-100
  rank: string;
  percentile: number; // 0-100
  summary: string;
  nextLevel: {
    name: SkillLevel;
    progress: number; // 0-100
    requirements: string[];
  };
}

// Recommendation
export interface Recommendation {
  priority: 'high' | 'medium' | 'low';
  category: string;
  title: string;
  description: string;
  actions: string[];
  estimatedTime: string;
  impact: 'high' | 'medium' | 'low';
}

// Assessment history
export interface AssessmentHistory {
  date: Date;
  overallScore: number;
  level: SkillLevel;
  categories: { name: string; score: number }[];
}

// Benchmark comparison
export interface BenchmarkComparison {
  metric: string;
  yourScore: number;
  average: number;
  expert: number;
  unit: string;
  percentile: number;
}

// Mock skill categories
const generateMockCategories = (): SkillCategory[] => {
  return [
    {
      name: 'Speed',
      score: 78,
      level: 'advanced',
      description: 'Your typing speed is above average',
      icon: '⚡',
      strengths: [
        'Fast on common words',
        'Good word-per-minute rate',
        'Quick finger movement',
      ],
      weaknesses: [
        'Slower on number keys',
        'Inconsistent on special characters',
      ],
    },
    {
      name: 'Accuracy',
      score: 85,
      level: 'advanced',
      description: 'High accuracy with minimal errors',
      icon: '🎯',
      strengths: [
        'Excellent on home row',
        'Low error rate overall',
        'Good self-correction',
      ],
      weaknesses: [
        'Occasional typos on less common words',
        'Higher error rate when tired',
      ],
    },
    {
      name: 'Consistency',
      score: 72,
      level: 'intermediate',
      description: 'Performance varies between sessions',
      icon: '📊',
      strengths: [
        'Stable during focused sessions',
        'Improving trend',
      ],
      weaknesses: [
        'Performance drops in longer sessions',
        'Time-of-day variations',
      ],
    },
    {
      name: 'Technique',
      score: 68,
      level: 'intermediate',
      description: 'Room for improvement in typing technique',
      icon: '✋',
      strengths: [
        'Good finger positioning on home row',
        'Proper use of both hands',
      ],
      weaknesses: [
        'Overuse of certain fingers',
        'Inconsistent posture',
        'Not using all fingers equally',
      ],
    },
    {
      name: 'Endurance',
      score: 65,
      level: 'intermediate',
      description: 'Can maintain performance for moderate durations',
      icon: '💪',
      strengths: [
        'Good for short bursts',
        'Quick recovery between sessions',
      ],
      weaknesses: [
        'Speed decreases in long sessions',
        'Fatigue after 15+ minutes',
      ],
    },
  ];
};

// Mock overall assessment
const generateMockAssessment = (): OverallAssessment => {
  return {
    level: 'advanced',
    overallScore: 74,
    rank: 'Advanced Typist',
    percentile: 75,
    summary: 'You have strong typing skills with excellent speed and accuracy. Focus on consistency and technique to reach expert level.',
    nextLevel: {
      name: 'expert',
      progress: 48,
      requirements: [
        'Maintain 90+ WPM consistently',
        'Achieve 98%+ accuracy',
        'Master all keyboard sections including numbers and symbols',
        'Demonstrate consistent performance across all sessions',
      ],
    },
  };
};

// Mock recommendations
const generateMockRecommendations = (): Recommendation[] => {
  return [
    {
      priority: 'high',
      category: 'Consistency',
      title: 'Improve Session Consistency',
      description: 'Your performance varies significantly between sessions. Focus on maintaining steady results.',
      actions: [
        'Practice at the same time each day',
        'Take regular breaks during long sessions',
        'Use proper ergonomic setup',
      ],
      estimatedTime: '2-3 weeks',
      impact: 'high',
    },
    {
      priority: 'high',
      category: 'Technique',
      title: 'Balance Finger Usage',
      description: 'Some fingers are overused while others are underutilized.',
      actions: [
        'Practice finger-specific exercises',
        'Focus on weaker fingers (ring and pinky)',
        'Use typing drills for all fingers',
      ],
      estimatedTime: '3-4 weeks',
      impact: 'medium',
    },
    {
      priority: 'medium',
      category: 'Speed',
      title: 'Master Number Keys',
      description: 'Your speed drops significantly when typing numbers.',
      actions: [
        'Complete number row lessons',
        'Practice common number combinations',
        'Use number-focused speed drills',
      ],
      estimatedTime: '1-2 weeks',
      impact: 'medium',
    },
    {
      priority: 'low',
      category: 'Endurance',
      title: 'Build Typing Stamina',
      description: 'Increase your ability to maintain performance in longer sessions.',
      actions: [
        'Gradually increase session length',
        'Practice typing for 20+ minutes',
        'Focus on relaxation techniques',
      ],
      estimatedTime: '4-6 weeks',
      impact: 'low',
    },
  ];
};

// Mock history
const generateMockHistory = (): AssessmentHistory[] => {
  const history: AssessmentHistory[] = [];
  const now = Date.now();

  for (let i = 5; i >= 0; i--) {
    const baseScore = 60 + (5 - i) * 2.8;
    history.push({
      date: new Date(now - i * 30 * 24 * 60 * 60 * 1000),
      overallScore: Math.round(baseScore),
      level: baseScore < 50 ? 'beginner' : baseScore < 70 ? 'intermediate' : baseScore < 85 ? 'advanced' : 'expert',
      categories: [
        { name: 'Speed', score: Math.round(baseScore + Math.random() * 10 - 5) },
        { name: 'Accuracy', score: Math.round(baseScore + Math.random() * 10 - 5) },
        { name: 'Consistency', score: Math.round(baseScore + Math.random() * 10 - 5) },
      ],
    });
  }

  return history;
};

// Mock benchmarks
const generateMockBenchmarks = (): BenchmarkComparison[] => {
  return [
    {
      metric: 'Typing Speed',
      yourScore: 72,
      average: 55,
      expert: 90,
      unit: 'WPM',
      percentile: 75,
    },
    {
      metric: 'Accuracy',
      yourScore: 94.5,
      average: 91,
      expert: 98,
      unit: '%',
      percentile: 78,
    },
    {
      metric: 'Consistency',
      yourScore: 72,
      average: 70,
      expert: 90,
      unit: '%',
      percentile: 55,
    },
  ];
};

// Get level color
const getLevelColor = (level: SkillLevel): string => {
  switch (level) {
    case 'beginner':
      return 'text-orange-600';
    case 'intermediate':
      return 'text-blue-600';
    case 'advanced':
      return 'text-purple-600';
    case 'expert':
      return 'text-green-600';
  }
};

// Get level background
const getLevelBackground = (level: SkillLevel): string => {
  switch (level) {
    case 'beginner':
      return 'bg-orange-50';
    case 'intermediate':
      return 'bg-blue-50';
    case 'advanced':
      return 'bg-purple-50';
    case 'expert':
      return 'bg-green-50';
  }
};

// Get priority color
const getPriorityColor = (priority: 'high' | 'medium' | 'low'): string => {
  switch (priority) {
    case 'high':
      return 'bg-red-100 text-red-700';
    case 'medium':
      return 'bg-yellow-100 text-yellow-700';
    case 'low':
      return 'bg-blue-100 text-blue-700';
  }
};

// Custom hook for assessments
export function useAssessments() {
  const [categories] = useState<SkillCategory[]>(generateMockCategories());
  const [assessment] = useState<OverallAssessment>(generateMockAssessment());
  const [recommendations] = useState<Recommendation[]>(generateMockRecommendations());
  const [history] = useState<AssessmentHistory[]>(generateMockHistory());
  const [benchmarks] = useState<BenchmarkComparison[]>(generateMockBenchmarks());
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  return {
    categories,
    assessment,
    recommendations,
    history,
    benchmarks,
    selectedCategory,
    setSelectedCategory,
  };
}

// Main assessments component
export default function Assessments() {
  const {
    categories,
    assessment,
    recommendations,
    history,
    benchmarks,
    selectedCategory,
    setSelectedCategory,
  } = useAssessments();

  const { settings } = useSettingsStore();

  return (
    <div className="bg-white rounded-2xl shadow-xl p-8">
      <h2 className="text-2xl font-bold text-gray-800 mb-6 text-center">
        📋 Skill Assessment
      </h2>

      {/* Overall assessment */}
      <div className={`mb-8 rounded-xl p-6 ${getLevelBackground(assessment.level)}`}>
        <div className="text-center mb-6">
          <div className="text-6xl mb-4">
            {assessment.level === 'expert' && '👑'}
            {assessment.level === 'advanced' && '⭐'}
            {assessment.level === 'intermediate' && '📚'}
            {assessment.level === 'beginner' && '🌱'}
          </div>
          <div className={`text-3xl font-bold mb-2 capitalize ${getLevelColor(assessment.level)}`}>
            {assessment.rank}
          </div>
          <div className="text-lg text-gray-700 mb-4">{assessment.summary}</div>
          <div className="flex items-center justify-center gap-8 text-sm">
            <div>
              <div className="text-gray-600">Overall Score</div>
              <div className="text-2xl font-bold text-gray-900">{assessment.overallScore}/100</div>
            </div>
            <div>
              <div className="text-gray-600">Percentile</div>
              <div className="text-2xl font-bold text-gray-900">Top {100 - assessment.percentile}%</div>
            </div>
          </div>
        </div>

        {/* Progress to next level */}
        <div className="bg-white rounded-lg p-4">
          <div className="flex items-center justify-between mb-2">
            <div className="font-bold text-gray-900">
              Progress to {assessment.nextLevel.name.charAt(0).toUpperCase() + assessment.nextLevel.name.slice(1)}
            </div>
            <div className="text-lg font-bold text-purple-600">
              {assessment.nextLevel.progress}%
            </div>
          </div>
          <div className="h-3 bg-gray-200 rounded-full overflow-hidden mb-3">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${assessment.nextLevel.progress}%` }}
              transition={{ duration: settings.reducedMotion ? 0 : 1 }}
              className="h-full bg-gradient-to-r from-purple-400 to-purple-600"
            />
          </div>
          <div className="text-sm text-gray-700">
            <div className="font-bold mb-1">Requirements:</div>
            <ul className="space-y-1">
              {assessment.nextLevel.requirements.map((req, i) => (
                <li key={i} className="flex items-start gap-2">
                  <span className="text-purple-600">•</span>
                  <span>{req}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>

      {/* Skill categories */}
      <div className="mb-8">
        <h3 className="text-lg font-bold text-gray-900 mb-4">Skill Breakdown</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {categories.map((category, index) => (
            <motion.div
              key={category.name}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: settings.reducedMotion ? 0 : index * 0.05 }}
              className={`rounded-xl p-4 cursor-pointer transition-all ${
                selectedCategory === category.name ? 'ring-2 ring-purple-500' : ''
              } ${getLevelBackground(category.level)}`}
              onClick={() => setSelectedCategory(selectedCategory === category.name ? null : category.name)}
            >
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-3">
                  <div className="text-3xl">{category.icon}</div>
                  <div>
                    <div className="font-bold text-gray-900">{category.name}</div>
                    <div className={`text-sm capitalize ${getLevelColor(category.level)}`}>
                      {category.level}
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-2xl font-bold text-gray-900">{category.score}</div>
                  <div className="text-xs text-gray-600">/100</div>
                </div>
              </div>

              <div className="h-2 bg-gray-200 rounded-full overflow-hidden mb-3">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${category.score}%` }}
                  transition={{ duration: settings.reducedMotion ? 0 : 0.5, delay: index * 0.05 }}
                  className="h-full bg-gradient-to-r from-purple-400 to-purple-600"
                />
              </div>

              <div className="text-sm text-gray-700 mb-3">{category.description}</div>

              {/* Expanded details */}
              {selectedCategory === category.name && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  transition={{ duration: settings.reducedMotion ? 0 : 0.2 }}
                  className="mt-3 pt-3 border-t border-gray-300"
                >
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <div>
                      <div className="text-sm font-bold text-green-700 mb-1">✓ Strengths</div>
                      <ul className="space-y-1">
                        {category.strengths.map((strength, i) => (
                          <li key={i} className="text-sm text-gray-700 flex items-start gap-2">
                            <span className="text-green-600">+</span>
                            <span>{strength}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                    <div>
                      <div className="text-sm font-bold text-red-700 mb-1">⚠ Weaknesses</div>
                      <ul className="space-y-1">
                        {category.weaknesses.map((weakness, i) => (
                          <li key={i} className="text-sm text-gray-700 flex items-start gap-2">
                            <span className="text-red-600">-</span>
                            <span>{weakness}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </motion.div>
              )}
            </motion.div>
          ))}
        </div>
      </div>

      {/* Recommendations */}
      <div className="mb-8 bg-gray-50 rounded-xl p-6">
        <h3 className="text-lg font-bold text-gray-900 mb-4">Recommended Improvements</h3>
        <div className="space-y-3">
          {recommendations.map((rec, index) => (
            <motion.div
              key={rec.title}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: settings.reducedMotion ? 0 : index * 0.1 }}
              className="bg-white rounded-lg p-4"
            >
              <div className="flex items-start justify-between mb-3">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <div className={`px-2 py-1 rounded text-xs font-bold uppercase ${getPriorityColor(rec.priority)}`}>
                      {rec.priority}
                    </div>
                    <div className="text-xs text-gray-600">{rec.category}</div>
                  </div>
                  <div className="font-bold text-gray-900">{rec.title}</div>
                </div>
                <div className="text-xs text-gray-600">{rec.estimatedTime}</div>
              </div>

              <p className="text-sm text-gray-700 mb-3">{rec.description}</p>

              <div className="mb-3">
                <div className="text-sm font-bold text-gray-700 mb-1">Action Steps:</div>
                <ul className="space-y-1">
                  {rec.actions.map((action, i) => (
                    <li key={i} className="text-sm text-gray-600 flex items-start gap-2">
                      <span className="text-purple-600">▸</span>
                      <span>{action}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="flex items-center gap-2">
                <div className="text-xs text-gray-600">Impact:</div>
                <div className={`px-2 py-1 rounded text-xs font-bold ${
                  rec.impact === 'high' ? 'bg-green-100 text-green-700' :
                  rec.impact === 'medium' ? 'bg-yellow-100 text-yellow-700' :
                  'bg-gray-100 text-gray-700'
                }`}>
                  {rec.impact.toUpperCase()}
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Benchmark comparison */}
      <div className="mb-8 bg-gray-50 rounded-xl p-6">
        <h3 className="text-lg font-bold text-gray-900 mb-4">Benchmark Comparison</h3>
        <div className="space-y-4">
          {benchmarks.map((benchmark, index) => (
            <motion.div
              key={benchmark.metric}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: settings.reducedMotion ? 0 : index * 0.1 }}
              className="bg-white rounded-lg p-4"
            >
              <div className="flex items-center justify-between mb-3">
                <div className="font-bold text-gray-900">{benchmark.metric}</div>
                <div className="text-sm text-gray-600">
                  Top {100 - benchmark.percentile}% percentile
                </div>
              </div>

              <div className="relative h-8 bg-gray-200 rounded-lg overflow-hidden mb-2">
                {/* Average marker */}
                <div
                  className="absolute top-0 bottom-0 w-1 bg-blue-500"
                  style={{ left: `${(benchmark.average / benchmark.expert) * 100}%` }}
                />
                {/* Your score bar */}
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${(benchmark.yourScore / benchmark.expert) * 100}%` }}
                  transition={{ duration: settings.reducedMotion ? 0 : 1, delay: index * 0.1 }}
                  className="h-full bg-gradient-to-r from-purple-400 to-purple-600"
                />
              </div>

              <div className="flex items-center justify-between text-sm">
                <div className="text-gray-600">
                  Average: <span className="font-bold">{benchmark.average}{benchmark.unit}</span>
                </div>
                <div className="font-bold text-purple-600">
                  You: {benchmark.yourScore}{benchmark.unit}
                </div>
                <div className="text-gray-600">
                  Expert: <span className="font-bold">{benchmark.expert}{benchmark.unit}</span>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Assessment history */}
      <div className="bg-gray-50 rounded-xl p-6">
        <h3 className="text-lg font-bold text-gray-900 mb-4">Assessment History</h3>
        <div className="space-y-2">
          {history.map((item, index) => (
            <motion.div
              key={item.date.toISOString()}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: settings.reducedMotion ? 0 : index * 0.05 }}
              className={`rounded-lg p-3 ${getLevelBackground(item.level)}`}
            >
              <div className="flex items-center justify-between">
                <div>
                  <div className="font-bold text-gray-900">
                    {item.date.toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}
                  </div>
                  <div className={`text-sm capitalize ${getLevelColor(item.level)}`}>
                    {item.level}
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-2xl font-bold text-gray-900">{item.overallScore}</div>
                  <div className="text-xs text-gray-600">Score</div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
}
