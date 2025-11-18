/**
 * Feedback Component
 * Step 262 - Build constructive feedback system
 */

import { motion } from 'framer-motion';
import { useState } from 'react';
import { useSettingsStore } from '../store/useSettingsStore';

// Feedback type
export type FeedbackType = 'positive' | 'constructive' | 'motivational' | 'technical';

// Feedback category
export type FeedbackCategory = 'speed' | 'accuracy' | 'consistency' | 'technique' | 'progress';

// Feedback item
export interface FeedbackItem {
  id: string;
  type: FeedbackType;
  category: FeedbackCategory;
  title: string;
  message: string;
  details: string[];
  actionable: boolean;
  actions?: string[];
  icon: string;
  priority: number; // 1-5, higher is more important
}

// Performance feedback
export interface PerformanceFeedback {
  overall: string;
  strengths: string[];
  improvements: string[];
  nextSteps: string[];
  encouragement: string;
}

// Skill-specific feedback
export interface SkillFeedback {
  skill: string;
  currentLevel: string;
  feedback: string;
  tips: string[];
  exercises: string[];
}

// Mock feedback items
const generateMockFeedback = (): FeedbackItem[] => {
  return [
    {
      id: 'fb-1',
      type: 'positive',
      category: 'speed',
      title: 'Excellent Speed Progress!',
      message: 'Your typing speed has increased by 10 WPM this week',
      details: [
        'Consistent improvement over 7 days',
        'Fastest session: 76 WPM',
        'Average speed up from 65 to 72 WPM',
      ],
      actionable: false,
      icon: '🚀',
      priority: 5,
    },
    {
      id: 'fb-2',
      type: 'positive',
      category: 'accuracy',
      title: 'Great Accuracy!',
      message: 'You maintained 94%+ accuracy this week',
      details: [
        'Above target accuracy',
        'Fewer errors on common words',
        'Improved self-correction',
      ],
      actionable: false,
      icon: '🎯',
      priority: 4,
    },
    {
      id: 'fb-3',
      type: 'constructive',
      category: 'technique',
      title: 'Number Row Needs Attention',
      message: 'Your speed drops 35% when typing numbers',
      details: [
        'Number keys: 45 WPM vs 72 WPM average',
        'Higher error rate on 7, 8, 9 keys',
        'Inconsistent finger positioning',
      ],
      actionable: true,
      actions: [
        'Practice number row lessons daily',
        'Use number-specific drills',
        'Focus on proper finger placement',
      ],
      icon: '🔢',
      priority: 5,
    },
    {
      id: 'fb-4',
      type: 'constructive',
      category: 'consistency',
      title: 'Consistency Can Improve',
      message: 'Your performance varies between sessions',
      details: [
        'Speed range: 60-76 WPM',
        'Accuracy range: 88-96%',
        'Better in morning sessions',
      ],
      actionable: true,
      actions: [
        'Practice at consistent times',
        'Warm up before each session',
        'Take breaks during long sessions',
      ],
      icon: '📊',
      priority: 3,
    },
    {
      id: 'fb-5',
      type: 'motivational',
      category: 'progress',
      title: 'You\'re Making Great Progress!',
      message: 'Keep up the excellent work',
      details: [
        '8-day practice streak',
        '12 sessions this week',
        '3 new lessons completed',
      ],
      actionable: false,
      icon: '⭐',
      priority: 2,
    },
    {
      id: 'fb-6',
      type: 'technical',
      category: 'technique',
      title: 'Hand Position Observation',
      message: 'Right hand slower than left by 12%',
      details: [
        'Right hand average: 63 WPM',
        'Left hand average: 71 WPM',
        'Affects overall speed',
      ],
      actionable: true,
      actions: [
        'Practice right-hand exercises',
        'Focus on P, L, semicolon keys',
        'Balance hand usage',
      ],
      icon: '✋',
      priority: 4,
    },
  ];
};

// Mock performance feedback
const generateMockPerformanceFeedback = (): PerformanceFeedback => {
  return {
    overall: 'Strong performance this week with notable speed improvements!',
    strengths: [
      'Typing speed increased by 10 WPM',
      'Maintained high accuracy above 93%',
      'Excellent practice consistency with 8-day streak',
      'Quick improvement on home row keys',
    ],
    improvements: [
      'Number keys need more practice',
      'Right hand speed could be more balanced',
      'Session-to-session consistency',
      'Special characters still unfamiliar',
    ],
    nextSteps: [
      'Focus on number row practice for 5 minutes daily',
      'Complete right-hand specific exercises',
      'Try to practice at the same time each day',
      'Start special characters basics next week',
    ],
    encouragement: 'You\'re progressing faster than most learners at your level. Keep practicing and you\'ll reach 80 WPM soon!',
  };
};

// Mock skill feedback
const generateMockSkillFeedback = (): SkillFeedback[] => {
  return [
    {
      skill: 'Home Row Keys',
      currentLevel: 'Advanced',
      feedback: 'Excellent mastery of home row keys with 95%+ accuracy',
      tips: [
        'Maintain proper finger position',
        'Keep up the good muscle memory',
      ],
      exercises: ['Advanced home row drills', 'Speed challenges'],
    },
    {
      skill: 'Top Row Keys',
      currentLevel: 'Intermediate',
      feedback: 'Good progress but room for improvement on Q, W, P keys',
      tips: [
        'Practice Q and P with pinky fingers',
        'Work on W key speed',
        'Maintain accuracy while increasing speed',
      ],
      exercises: ['Top row practice drills', 'Q-W-P specific exercises'],
    },
    {
      skill: 'Number Row',
      currentLevel: 'Beginner',
      feedback: 'Needs significant improvement - this is holding back overall speed',
      tips: [
        'Learn proper finger-to-number mapping',
        'Practice without looking at keyboard',
        'Start slow and build accuracy first',
      ],
      exercises: ['Number basics', 'Number combinations', 'Number speed drills'],
    },
  ];
};

// Custom hook for feedback
export function useFeedback() {
  const [feedbackItems] = useState<FeedbackItem[]>(generateMockFeedback());
  const [performanceFeedback] = useState<PerformanceFeedback>(generateMockPerformanceFeedback());
  const [skillFeedback] = useState<SkillFeedback[]>(generateMockSkillFeedback());
  const [filterType, setFilterType] = useState<FeedbackType | 'all'>('all');
  const [filterCategory, setFilterCategory] = useState<FeedbackCategory | 'all'>('all');

  const getFilteredFeedback = () => {
    let filtered = feedbackItems;

    if (filterType !== 'all') {
      filtered = filtered.filter((item) => item.type === filterType);
    }

    if (filterCategory !== 'all') {
      filtered = filtered.filter((item) => item.category === filterCategory);
    }

    return filtered.sort((a, b) => b.priority - a.priority);
  };

  const getCounts = () => {
    return {
      total: feedbackItems.length,
      positive: feedbackItems.filter((f) => f.type === 'positive').length,
      constructive: feedbackItems.filter((f) => f.type === 'constructive').length,
      actionable: feedbackItems.filter((f) => f.actionable).length,
    };
  };

  return {
    feedbackItems: getFilteredFeedback(),
    performanceFeedback,
    skillFeedback,
    filterType,
    setFilterType,
    filterCategory,
    setFilterCategory,
    counts: getCounts(),
  };
}

// Get feedback type color
const getFeedbackTypeColor = (type: FeedbackType): string => {
  switch (type) {
    case 'positive':
      return 'bg-green-50 border-green-300';
    case 'constructive':
      return 'bg-blue-50 border-blue-300';
    case 'motivational':
      return 'bg-purple-50 border-purple-300';
    case 'technical':
      return 'bg-orange-50 border-orange-300';
  }
};

// Get feedback type badge
const getFeedbackTypeBadge = (type: FeedbackType): string => {
  switch (type) {
    case 'positive':
      return 'bg-green-500 text-white';
    case 'constructive':
      return 'bg-blue-500 text-white';
    case 'motivational':
      return 'bg-purple-500 text-white';
    case 'technical':
      return 'bg-orange-500 text-white';
  }
};

// Get skill level color
const getSkillLevelColor = (level: string): string => {
  switch (level.toLowerCase()) {
    case 'advanced':
      return 'text-green-600';
    case 'intermediate':
      return 'text-blue-600';
    case 'beginner':
      return 'text-orange-600';
    default:
      return 'text-gray-600';
  }
};

// Main feedback component
export default function Feedback() {
  const {
    feedbackItems,
    performanceFeedback,
    skillFeedback,
    filterType,
    setFilterType,
    filterCategory,
    setFilterCategory,
    counts,
  } = useFeedback();

  const { settings } = useSettingsStore();

  return (
    <div className="bg-white rounded-2xl shadow-xl p-8">
      <h2 className="text-2xl font-bold text-gray-800 mb-6 text-center">
        💬 Performance Feedback
      </h2>

      {/* Summary cards */}
      <div className="mb-8 grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-gradient-to-br from-purple-400 to-purple-600 rounded-lg p-4 text-white text-center">
          <div className="text-3xl font-bold">{counts.total}</div>
          <div className="text-sm opacity-90">Total Feedback</div>
        </div>
        <div className="bg-gradient-to-br from-green-400 to-green-600 rounded-lg p-4 text-white text-center">
          <div className="text-3xl font-bold">{counts.positive}</div>
          <div className="text-sm opacity-90">Positive</div>
        </div>
        <div className="bg-gradient-to-br from-blue-400 to-blue-600 rounded-lg p-4 text-white text-center">
          <div className="text-3xl font-bold">{counts.constructive}</div>
          <div className="text-sm opacity-90">Constructive</div>
        </div>
        <div className="bg-gradient-to-br from-orange-400 to-orange-600 rounded-lg p-4 text-white text-center">
          <div className="text-3xl font-bold">{counts.actionable}</div>
          <div className="text-sm opacity-90">Actionable</div>
        </div>
      </div>

      {/* Overall performance feedback */}
      <div className="mb-8 bg-gradient-to-br from-indigo-50 to-purple-50 border-2 border-purple-200 rounded-xl p-6">
        <h3 className="text-lg font-bold text-gray-900 mb-3">Overall Performance</h3>
        <p className="text-gray-700 text-lg mb-4">{performanceFeedback.overall}</p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          <div>
            <div className="text-sm font-bold text-green-700 mb-2">✓ Strengths</div>
            <ul className="space-y-1">
              {performanceFeedback.strengths.map((strength, i) => (
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
              {performanceFeedback.improvements.map((improvement, i) => (
                <li key={i} className="text-sm text-gray-700 flex items-start gap-2">
                  <span className="text-blue-600">▸</span>
                  <span>{improvement}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="bg-white rounded-lg p-4 mb-4">
          <div className="text-sm font-bold text-purple-700 mb-2">Next Steps</div>
          <ul className="space-y-1">
            {performanceFeedback.nextSteps.map((step, i) => (
              <li key={i} className="text-sm text-gray-700 flex items-start gap-2">
                <span className="text-purple-600 font-bold">{i + 1}.</span>
                <span>{step}</span>
              </li>
            ))}
          </ul>
        </div>

        <div className="bg-yellow-50 border-l-4 border-yellow-500 p-4 rounded">
          <div className="flex items-start gap-2">
            <div className="text-2xl">💪</div>
            <div>
              <div className="text-sm font-bold text-yellow-900 mb-1">Encouragement</div>
              <div className="text-sm text-yellow-800">{performanceFeedback.encouragement}</div>
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="mb-6 space-y-3">
        <div className="flex gap-2 flex-wrap items-center">
          <span className="text-sm font-bold text-gray-700">Type:</span>
          {[
            { type: 'all' as const, label: 'All' },
            { type: 'positive' as const, label: 'Positive' },
            { type: 'constructive' as const, label: 'Constructive' },
            { type: 'motivational' as const, label: 'Motivational' },
            { type: 'technical' as const, label: 'Technical' },
          ].map(({ type, label }) => (
            <button
              key={type}
              onClick={() => setFilterType(type)}
              className={`px-3 py-1 rounded-lg text-sm font-bold transition-colors ${
                filterType === type
                  ? 'bg-purple-500 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {label}
            </button>
          ))}
        </div>

        <div className="flex gap-2 flex-wrap items-center">
          <span className="text-sm font-bold text-gray-700">Category:</span>
          {[
            { category: 'all' as const, label: 'All' },
            { category: 'speed' as const, label: 'Speed' },
            { category: 'accuracy' as const, label: 'Accuracy' },
            { category: 'consistency' as const, label: 'Consistency' },
            { category: 'technique' as const, label: 'Technique' },
            { category: 'progress' as const, label: 'Progress' },
          ].map(({ category, label }) => (
            <button
              key={category}
              onClick={() => setFilterCategory(category)}
              className={`px-3 py-1 rounded-lg text-sm font-bold transition-colors ${
                filterCategory === category
                  ? 'bg-blue-500 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      {/* Feedback items */}
      <div className="mb-8 space-y-4">
        {feedbackItems.map((item, index) => (
          <motion.div
            key={item.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: settings.reducedMotion ? 0 : index * 0.05 }}
            className={`rounded-xl p-6 border-2 ${getFeedbackTypeColor(item.type)}`}
          >
            <div className="flex items-start justify-between mb-3">
              <div className="flex items-start gap-4">
                <div className="text-4xl">{item.icon}</div>
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <div className="font-bold text-gray-900 text-lg">{item.title}</div>
                    <span className={`px-2 py-1 rounded text-xs font-bold uppercase ${getFeedbackTypeBadge(item.type)}`}>
                      {item.type}
                    </span>
                  </div>
                  <div className="text-sm text-gray-700 mb-2">{item.message}</div>
                  <div className="text-xs text-gray-500 capitalize">{item.category}</div>
                </div>
              </div>
            </div>

            {item.details.length > 0 && (
              <div className="mb-3">
                <div className="text-sm font-bold text-gray-700 mb-1">Details:</div>
                <ul className="space-y-1">
                  {item.details.map((detail, i) => (
                    <li key={i} className="text-sm text-gray-600 flex items-start gap-2">
                      <span className="text-gray-400">•</span>
                      <span>{detail}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {item.actionable && item.actions && (
              <div className="bg-white/50 rounded-lg p-3">
                <div className="text-sm font-bold text-gray-700 mb-2">Recommended Actions:</div>
                <ul className="space-y-1">
                  {item.actions.map((action, i) => (
                    <li key={i} className="text-sm text-gray-700 flex items-start gap-2">
                      <span className="text-green-600">▸</span>
                      <span>{action}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </motion.div>
        ))}
      </div>

      {/* Skill-specific feedback */}
      <div className="bg-gray-50 rounded-xl p-6">
        <h3 className="text-lg font-bold text-gray-900 mb-4">Skill-Specific Feedback</h3>
        <div className="space-y-4">
          {skillFeedback.map((skill, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: settings.reducedMotion ? 0 : index * 0.1 }}
              className="bg-white rounded-lg p-4"
            >
              <div className="flex items-center justify-between mb-2">
                <div className="font-bold text-gray-900 text-lg">{skill.skill}</div>
                <div className={`text-sm font-bold capitalize ${getSkillLevelColor(skill.currentLevel)}`}>
                  {skill.currentLevel}
                </div>
              </div>

              <p className="text-sm text-gray-700 mb-3">{skill.feedback}</p>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div>
                  <div className="text-xs font-bold text-gray-700 mb-1">Tips:</div>
                  <ul className="space-y-1">
                    {skill.tips.map((tip, i) => (
                      <li key={i} className="text-xs text-gray-600 flex items-start gap-1">
                        <span className="text-blue-600">•</span>
                        <span>{tip}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div>
                  <div className="text-xs font-bold text-gray-700 mb-1">Exercises:</div>
                  <ul className="space-y-1">
                    {skill.exercises.map((exercise, i) => (
                      <li key={i} className="text-xs text-gray-600 flex items-start gap-1">
                        <span className="text-green-600">▸</span>
                        <span>{exercise}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
}
