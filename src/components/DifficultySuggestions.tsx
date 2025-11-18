/**
 * Difficulty Suggestions Component
 * Step 259 - Add difficulty suggestions based on performance
 */

import { motion } from 'framer-motion';
import { useState } from 'react';
import { useSettingsStore } from '../store/useSettingsStore';

// Difficulty level
export type DifficultyLevel = 'beginner' | 'easy' | 'medium' | 'hard' | 'expert' | 'master';

// Performance indicator
export interface PerformanceIndicator {
  metric: string;
  current: number;
  required: number;
  unit: string;
  met: boolean;
}

// Difficulty suggestion
export interface DifficultySuggestion {
  currentLevel: DifficultyLevel;
  suggestedLevel: DifficultyLevel;
  confidence: number; // 0-100
  reason: string;
  indicators: PerformanceIndicator[];
  readyForNext: boolean;
  needsMorePractice: boolean;
}

// Content difficulty
export interface ContentDifficulty {
  id: string;
  title: string;
  category: string;
  currentDifficulty: DifficultyLevel;
  suggestedDifficulty: DifficultyLevel;
  reason: string;
  icon: string;
}

// Challenge suggestion
export interface ChallengeSuggestion {
  id: string;
  title: string;
  description: string;
  difficulty: DifficultyLevel;
  estimatedTime: string;
  reward: string;
  requirements: string[];
  icon: string;
}

// Mock difficulty suggestion
const generateMockSuggestion = (): DifficultySuggestion => {
  return {
    currentLevel: 'medium',
    suggestedLevel: 'hard',
    confidence: 85,
    reason: 'Your performance consistently exceeds medium level requirements',
    indicators: [
      {
        metric: 'Typing Speed',
        current: 72,
        required: 60,
        unit: 'WPM',
        met: true,
      },
      {
        metric: 'Accuracy',
        current: 94.5,
        required: 90,
        unit: '%',
        met: true,
      },
      {
        metric: 'Consistency',
        current: 88,
        required: 80,
        unit: '%',
        met: true,
      },
      {
        metric: 'Session Time',
        current: 18,
        required: 15,
        unit: 'min/day',
        met: true,
      },
    ],
    readyForNext: true,
    needsMorePractice: false,
  };
};

// Mock content suggestions
const generateMockContentDifficulty = (): ContentDifficulty[] => {
  return [
    {
      id: 'cont-1',
      title: 'Speed Drills',
      category: 'Practice',
      currentDifficulty: 'medium',
      suggestedDifficulty: 'hard',
      reason: 'You consistently achieve 95%+ on medium drills',
      icon: '⚡',
    },
    {
      id: 'cont-2',
      title: 'Accuracy Tests',
      category: 'Testing',
      currentDifficulty: 'medium',
      suggestedDifficulty: 'medium',
      reason: 'Current level is appropriate for your skill',
      icon: '🎯',
    },
    {
      id: 'cont-3',
      title: 'Number Practice',
      category: 'Lessons',
      currentDifficulty: 'hard',
      suggestedDifficulty: 'medium',
      reason: 'Lower difficulty recommended to build confidence',
      icon: '🔢',
    },
    {
      id: 'cont-4',
      title: 'Special Characters',
      category: 'Lessons',
      currentDifficulty: 'medium',
      suggestedDifficulty: 'easy',
      reason: 'Start with easier level for new content',
      icon: '🔣',
    },
  ];
};

// Mock challenges
const generateMockChallenges = (): ChallengeSuggestion[] => {
  return [
    {
      id: 'chal-1',
      title: 'Speed Challenge: 80 WPM',
      description: 'Reach 80 WPM with 95% accuracy',
      difficulty: 'hard',
      estimatedTime: '1-2 weeks',
      reward: '🏆 Speed Master Badge',
      requirements: ['Currently at 70+ WPM', 'Accuracy above 90%'],
      icon: '🚀',
    },
    {
      id: 'chal-2',
      title: 'Perfect Accuracy Week',
      description: 'Maintain 98%+ accuracy for 7 days',
      difficulty: 'expert',
      estimatedTime: '1 week',
      reward: '⭐ Precision Expert',
      requirements: ['Current accuracy 95%+', 'Practice daily'],
      icon: '🎯',
    },
    {
      id: 'chal-3',
      title: 'Number Row Mastery',
      description: 'Complete all number exercises with 90%+ accuracy',
      difficulty: 'medium',
      estimatedTime: '1 week',
      reward: '🔢 Number Ninja',
      requirements: ['Basic number knowledge', 'Practice 10 min/day'],
      icon: '🔢',
    },
  ];
};

// Custom hook for difficulty suggestions
export function useDifficultySuggestions() {
  const [suggestion] = useState<DifficultySuggestion>(generateMockSuggestion());
  const [contentSuggestions] = useState<ContentDifficulty[]>(generateMockContentDifficulty());
  const [challenges] = useState<ChallengeSuggestion[]>(generateMockChallenges());
  const [selectedTab, setSelectedTab] = useState<'overview' | 'content' | 'challenges'>('overview');

  const getMetricsMet = () => {
    return suggestion.indicators.filter((i) => i.met).length;
  };

  const getTotalMetrics = () => {
    return suggestion.indicators.length;
  };

  return {
    suggestion,
    contentSuggestions,
    challenges,
    selectedTab,
    setSelectedTab,
    metricsMet: getMetricsMet(),
    totalMetrics: getTotalMetrics(),
  };
}

// Get difficulty color
const getDifficultyColor = (level: DifficultyLevel): string => {
  switch (level) {
    case 'beginner':
      return 'bg-gray-100 text-gray-700';
    case 'easy':
      return 'bg-green-100 text-green-700';
    case 'medium':
      return 'bg-blue-100 text-blue-700';
    case 'hard':
      return 'bg-orange-100 text-orange-700';
    case 'expert':
      return 'bg-red-100 text-red-700';
    case 'master':
      return 'bg-purple-100 text-purple-700';
  }
};

// Get difficulty badge
const getDifficultyBadge = (level: DifficultyLevel): string => {
  switch (level) {
    case 'beginner':
      return 'bg-gray-500';
    case 'easy':
      return 'bg-green-500';
    case 'medium':
      return 'bg-blue-500';
    case 'hard':
      return 'bg-orange-500';
    case 'expert':
      return 'bg-red-500';
    case 'master':
      return 'bg-purple-500';
  }
};

// Get level icon
const getLevelIcon = (level: DifficultyLevel): string => {
  switch (level) {
    case 'beginner':
      return '🌱';
    case 'easy':
      return '📘';
    case 'medium':
      return '📙';
    case 'hard':
      return '📕';
    case 'expert':
      return '💎';
    case 'master':
      return '👑';
  }
};

// Main difficulty suggestions component
export default function DifficultySuggestions() {
  const {
    suggestion,
    contentSuggestions,
    challenges,
    selectedTab,
    setSelectedTab,
    metricsMet,
    totalMetrics,
  } = useDifficultySuggestions();

  const { settings } = useSettingsStore();

  return (
    <div className="bg-white rounded-2xl shadow-xl p-8">
      <h2 className="text-2xl font-bold text-gray-800 mb-6 text-center">
        🎚️ Difficulty Suggestions
      </h2>

      {/* Tab selector */}
      <div className="mb-8 flex gap-2">
        {[
          { tab: 'overview' as const, label: '📊 Overview' },
          { tab: 'content' as const, label: '📚 Content Levels' },
          { tab: 'challenges' as const, label: '🏆 Challenges' },
        ].map(({ tab, label }) => (
          <button
            key={tab}
            onClick={() => setSelectedTab(tab)}
            className={`flex-1 px-4 py-3 rounded-lg font-bold transition-colors ${
              selectedTab === tab
                ? 'bg-purple-500 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      {/* Overview tab */}
      {selectedTab === 'overview' && (
        <div className="space-y-6">
          {/* Current status */}
          <div className={`rounded-xl p-6 ${
            suggestion.readyForNext ? 'bg-green-50 border-2 border-green-300' :
            suggestion.needsMorePractice ? 'bg-yellow-50 border-2 border-yellow-300' :
            'bg-blue-50 border-2 border-blue-300'
          }`}>
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center gap-4">
                <div className="text-6xl">{getLevelIcon(suggestion.currentLevel)}</div>
                <div>
                  <div className="text-sm text-gray-600 mb-1">Current Level</div>
                  <div className="text-3xl font-bold text-gray-900 capitalize mb-2">
                    {suggestion.currentLevel}
                  </div>
                  <div className="text-sm text-gray-700">{suggestion.reason}</div>
                </div>
              </div>
              <div className="text-right">
                <div className="text-sm text-gray-600 mb-1">Confidence</div>
                <div className="text-4xl font-bold text-purple-600">{suggestion.confidence}%</div>
              </div>
            </div>

            {suggestion.readyForNext && (
              <div className="bg-white rounded-lg p-4 border-2 border-green-400">
                <div className="flex items-center gap-3">
                  <div className="text-3xl">🎉</div>
                  <div>
                    <div className="font-bold text-green-900 text-lg">Ready for Next Level!</div>
                    <div className="text-sm text-green-800">
                      Suggested: <span className="font-bold capitalize">{suggestion.suggestedLevel}</span>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {suggestion.needsMorePractice && (
              <div className="bg-white rounded-lg p-4 border-2 border-yellow-400">
                <div className="flex items-center gap-3">
                  <div className="text-3xl">💪</div>
                  <div>
                    <div className="font-bold text-yellow-900 text-lg">Keep Practicing</div>
                    <div className="text-sm text-yellow-800">
                      You're doing great! A bit more practice at {suggestion.currentLevel} level.
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Performance indicators */}
          <div className="bg-gray-50 rounded-xl p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold text-gray-900">Performance Indicators</h3>
              <div className="text-sm font-bold text-gray-600">
                {metricsMet} of {totalMetrics} requirements met
              </div>
            </div>

            <div className="space-y-3">
              {suggestion.indicators.map((indicator, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: settings.reducedMotion ? 0 : index * 0.05 }}
                  className={`p-4 rounded-lg ${
                    indicator.met ? 'bg-green-50' : 'bg-red-50'
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-3">
                      <div className="text-2xl">{indicator.met ? '✓' : '○'}</div>
                      <div>
                        <div className="font-bold text-gray-900">{indicator.metric}</div>
                        <div className="text-sm text-gray-600">
                          Required: {indicator.required}{indicator.unit}
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className={`text-2xl font-bold ${
                        indicator.met ? 'text-green-600' : 'text-red-600'
                      }`}>
                        {indicator.current}{indicator.unit}
                      </div>
                      <div className="text-xs text-gray-600">
                        {indicator.met ? 'Met' : 'Not Met'}
                      </div>
                    </div>
                  </div>
                  <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${Math.min(100, (indicator.current / indicator.required) * 100)}%` }}
                      transition={{ duration: settings.reducedMotion ? 0 : 1, delay: index * 0.05 }}
                      className={`h-full ${
                        indicator.met ? 'bg-gradient-to-r from-green-400 to-green-600' :
                        'bg-gradient-to-r from-red-400 to-red-600'
                      }`}
                    />
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Content levels tab */}
      {selectedTab === 'content' && (
        <div className="space-y-4">
          <div className="bg-blue-50 border-2 border-blue-200 rounded-xl p-4 mb-6">
            <div className="flex items-start gap-3">
              <div className="text-2xl">💡</div>
              <div>
                <div className="font-bold text-blue-900 mb-1">Personalized Difficulty</div>
                <div className="text-sm text-blue-800">
                  We analyze your performance to suggest the right difficulty level for each activity.
                </div>
              </div>
            </div>
          </div>

          {contentSuggestions.map((content, index) => (
            <motion.div
              key={content.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: settings.reducedMotion ? 0 : index * 0.05 }}
              className="bg-gray-50 rounded-xl p-6"
            >
              <div className="flex items-start justify-between">
                <div className="flex items-start gap-4">
                  <div className="text-4xl">{content.icon}</div>
                  <div>
                    <div className="font-bold text-gray-900 text-lg mb-1">{content.title}</div>
                    <div className="text-sm text-gray-600 mb-2">{content.category}</div>
                    <div className="text-sm text-gray-700 italic">{content.reason}</div>
                  </div>
                </div>
                <div className="flex gap-2">
                  <div className="text-center">
                    <div className="text-xs text-gray-600 mb-1">Current</div>
                    <div className={`px-3 py-1 rounded-lg text-sm font-bold capitalize ${getDifficultyColor(content.currentDifficulty)}`}>
                      {content.currentDifficulty}
                    </div>
                  </div>
                  <div className="flex items-center px-2">
                    <div className="text-2xl">→</div>
                  </div>
                  <div className="text-center">
                    <div className="text-xs text-gray-600 mb-1">Suggested</div>
                    <div className={`px-3 py-1 rounded-lg text-sm font-bold capitalize ${getDifficultyBadge(content.suggestedDifficulty)} text-white`}>
                      {content.suggestedDifficulty}
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      {/* Challenges tab */}
      {selectedTab === 'challenges' && (
        <div className="space-y-4">
          <div className="bg-yellow-50 border-2 border-yellow-200 rounded-xl p-4 mb-6">
            <div className="flex items-start gap-3">
              <div className="text-2xl">🏆</div>
              <div>
                <div className="font-bold text-yellow-900 mb-1">Challenge Yourself</div>
                <div className="text-sm text-yellow-800">
                  Push your limits with challenges matched to your skill level.
                </div>
              </div>
            </div>
          </div>

          {challenges.map((challenge, index) => (
            <motion.div
              key={challenge.id}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: settings.reducedMotion ? 0 : index * 0.05 }}
              className={`rounded-xl p-6 border-2 ${getDifficultyColor(challenge.difficulty)}`}
            >
              <div className="flex items-start gap-4 mb-4">
                <div className="text-5xl">{challenge.icon}</div>
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <div className="font-bold text-gray-900 text-lg">{challenge.title}</div>
                    <span className={`px-3 py-1 rounded-lg text-sm font-bold capitalize ${getDifficultyBadge(challenge.difficulty)} text-white`}>
                      {challenge.difficulty}
                    </span>
                  </div>
                  <div className="text-sm text-gray-700 mb-3">{challenge.description}</div>

                  <div className="mb-3">
                    <div className="text-sm font-bold text-gray-700 mb-1">Requirements:</div>
                    <ul className="space-y-1">
                      {challenge.requirements.map((req, i) => (
                        <li key={i} className="text-sm text-gray-600 flex items-start gap-2">
                          <span className="text-purple-600">•</span>
                          <span>{req}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="flex gap-4 text-sm text-gray-600">
                      <div>
                        <span className="font-bold">Time:</span> {challenge.estimatedTime}
                      </div>
                      <div>
                        <span className="font-bold">Reward:</span> {challenge.reward}
                      </div>
                    </div>
                    <button className="px-6 py-2 bg-purple-500 text-white rounded-lg font-bold hover:bg-purple-600 transition-colors">
                      Start Challenge
                    </button>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}
