/**
 * Recommendations Component
 * Step 258 - Create personalized recommendations system
 */

import { motion } from 'framer-motion';
import { useState } from 'react';
import { useSettingsStore } from '../store/useSettingsStore';

// Recommendation category
export type RecommendationCategory = 'lessons' | 'practice' | 'exercises' | 'goals' | 'habits';

// Recommendation priority
export type RecommendationPriority = 'critical' | 'high' | 'medium' | 'low';

// Recommendation
export interface Recommendation {
  id: string;
  category: RecommendationCategory;
  priority: RecommendationPriority;
  title: string;
  description: string;
  reason: string;
  actionSteps: string[];
  estimatedTime: string;
  expectedImpact: string;
  icon: string;
  completed: boolean;
}

// Recommendation insight
export interface RecommendationInsight {
  type: 'strength' | 'weakness' | 'opportunity';
  title: string;
  description: string;
  icon: string;
}

// Mock recommendations
const generateMockRecommendations = (): Recommendation[] => {
  return [
    {
      id: 'rec-1',
      category: 'practice',
      priority: 'critical',
      title: 'Focus on Number Row',
      description: 'Your speed drops significantly when typing numbers',
      reason: 'Number keys have 35% lower speed and 18% higher error rate',
      actionSteps: [
        'Complete number row lessons',
        'Practice number combinations daily',
        'Use number-focused drills for 5 minutes',
      ],
      estimatedTime: '1-2 weeks',
      expectedImpact: 'Increase overall speed by 8-12%',
      icon: '🔢',
      completed: false,
    },
    {
      id: 'rec-2',
      category: 'habits',
      priority: 'high',
      title: 'Increase Practice Time',
      description: 'Your practice time has decreased over the last week',
      reason: 'Consistency is key to maintaining and improving skills',
      actionSteps: [
        'Set a daily reminder at 4:00 PM',
        'Start with just 10 minutes per day',
        'Gradually increase to 15-20 minutes',
      ],
      estimatedTime: '1 week',
      expectedImpact: 'Prevent skill regression and maintain progress',
      icon: '⏰',
      completed: false,
    },
    {
      id: 'rec-3',
      category: 'exercises',
      priority: 'high',
      title: 'Improve Right Hand Speed',
      description: 'Right hand is slower than left hand by 12%',
      reason: 'Balanced hand speed leads to better overall performance',
      actionSteps: [
        'Practice right-hand specific exercises',
        'Focus on P, L, and semicolon keys',
        'Do finger independence drills',
      ],
      estimatedTime: '2-3 weeks',
      expectedImpact: 'Balance hand speeds for smoother typing',
      icon: '✋',
      completed: false,
    },
    {
      id: 'rec-4',
      category: 'lessons',
      priority: 'medium',
      title: 'Complete Special Characters',
      description: 'You haven\'t practiced special characters yet',
      reason: 'Special characters are important for programming and writing',
      actionSteps: [
        'Start with brackets and parentheses',
        'Practice common symbols like @, #, $',
        'Complete special characters lesson series',
      ],
      estimatedTime: '1 week',
      expectedImpact: 'Become proficient in all keyboard sections',
      icon: '🔣',
      completed: false,
    },
    {
      id: 'rec-5',
      category: 'goals',
      priority: 'medium',
      title: 'Set Consistency Goal',
      description: 'Your performance varies significantly between sessions',
      reason: 'Consistent performance indicates mastery',
      actionSteps: [
        'Set a goal to practice at the same time daily',
        'Track consistency score weekly',
        'Aim for 85%+ consistency',
      ],
      estimatedTime: '2-4 weeks',
      expectedImpact: 'More predictable and reliable typing skills',
      icon: '📊',
      completed: false,
    },
    {
      id: 'rec-6',
      category: 'practice',
      priority: 'low',
      title: 'Try Speed Challenges',
      description: 'Challenge yourself with timed speed tests',
      reason: 'Speed tests can help you push beyond your comfort zone',
      actionSteps: [
        'Take weekly speed tests',
        'Compare results over time',
        'Focus on maintaining accuracy above 95%',
      ],
      estimatedTime: 'Ongoing',
      expectedImpact: 'Track and celebrate speed improvements',
      icon: '🏁',
      completed: false,
    },
  ];
};

// Mock insights
const generateMockInsights = (): RecommendationInsight[] => {
  return [
    {
      type: 'strength',
      title: 'Excellent Home Row Skills',
      description: 'You have mastered home row keys with 95%+ accuracy',
      icon: '⭐',
    },
    {
      type: 'strength',
      title: 'Consistent Practice Habit',
      description: 'You\'ve practiced 6 out of 7 days this week',
      icon: '🔥',
    },
    {
      type: 'weakness',
      title: 'Number Key Struggles',
      description: 'Number keys are your weakest area with 65% accuracy',
      icon: '⚠️',
    },
    {
      type: 'weakness',
      title: 'Inconsistent Session Length',
      description: 'Your practice sessions vary from 5 to 30 minutes',
      icon: '📉',
    },
    {
      type: 'opportunity',
      title: 'Ready for Advanced Lessons',
      description: 'Your skills qualify you for intermediate/advanced content',
      icon: '🚀',
    },
    {
      type: 'opportunity',
      title: 'Join Typing Challenges',
      description: 'Compete with others to stay motivated and engaged',
      icon: '🏆',
    },
  ];
};

// Custom hook for recommendations
export function useRecommendations() {
  const [recommendations, setRecommendations] = useState<Recommendation[]>(
    generateMockRecommendations()
  );
  const [insights] = useState<RecommendationInsight[]>(generateMockInsights());
  const [filterCategory, setFilterCategory] = useState<RecommendationCategory | 'all'>('all');
  const [filterPriority, setFilterPriority] = useState<RecommendationPriority | 'all'>('all');
  const [showCompleted, setShowCompleted] = useState(false);

  const getFilteredRecommendations = () => {
    let filtered = recommendations;

    // Filter by category
    if (filterCategory !== 'all') {
      filtered = filtered.filter((r) => r.category === filterCategory);
    }

    // Filter by priority
    if (filterPriority !== 'all') {
      filtered = filtered.filter((r) => r.priority === filterPriority);
    }

    // Filter by completion
    if (!showCompleted) {
      filtered = filtered.filter((r) => !r.completed);
    }

    return filtered;
  };

  const markAsCompleted = (id: string) => {
    setRecommendations(
      recommendations.map((r) => (r.id === id ? { ...r, completed: true } : r))
    );
  };

  const getInsightsByType = (type: 'strength' | 'weakness' | 'opportunity') => {
    return insights.filter((i) => i.type === type);
  };

  const getCounts = () => {
    return {
      total: recommendations.length,
      critical: recommendations.filter((r) => r.priority === 'critical' && !r.completed).length,
      high: recommendations.filter((r) => r.priority === 'high' && !r.completed).length,
      completed: recommendations.filter((r) => r.completed).length,
    };
  };

  return {
    recommendations: getFilteredRecommendations(),
    allRecommendations: recommendations,
    insights,
    filterCategory,
    setFilterCategory,
    filterPriority,
    setFilterPriority,
    showCompleted,
    setShowCompleted,
    markAsCompleted,
    getInsightsByType,
    counts: getCounts(),
  };
}

// Get priority color
const getPriorityColor = (priority: RecommendationPriority): string => {
  switch (priority) {
    case 'critical':
      return 'bg-red-100 text-red-700 border-red-300';
    case 'high':
      return 'bg-orange-100 text-orange-700 border-orange-300';
    case 'medium':
      return 'bg-yellow-100 text-yellow-700 border-yellow-300';
    case 'low':
      return 'bg-blue-100 text-blue-700 border-blue-300';
  }
};

// Get priority badge
const getPriorityBadge = (priority: RecommendationPriority): string => {
  switch (priority) {
    case 'critical':
      return 'bg-red-500 text-white';
    case 'high':
      return 'bg-orange-500 text-white';
    case 'medium':
      return 'bg-yellow-500 text-white';
    case 'low':
      return 'bg-blue-500 text-white';
  }
};

// Get insight color
const getInsightColor = (type: 'strength' | 'weakness' | 'opportunity'): string => {
  switch (type) {
    case 'strength':
      return 'bg-green-50 border-green-300';
    case 'weakness':
      return 'bg-red-50 border-red-300';
    case 'opportunity':
      return 'bg-purple-50 border-purple-300';
  }
};

// Main recommendations component
export default function Recommendations() {
  const {
    recommendations,
    filterCategory,
    setFilterCategory,
    filterPriority,
    setFilterPriority,
    showCompleted,
    setShowCompleted,
    markAsCompleted,
    getInsightsByType,
    counts,
  } = useRecommendations();

  const { settings } = useSettingsStore();

  return (
    <div className="bg-white rounded-2xl shadow-xl p-8">
      <h2 className="text-2xl font-bold text-gray-800 mb-6 text-center">
        💡 Personalized Recommendations
      </h2>

      {/* Summary */}
      <div className="mb-8 grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-gradient-to-br from-purple-400 to-purple-600 rounded-xl p-4 text-white">
          <div className="text-sm opacity-90 mb-1">Total</div>
          <div className="text-3xl font-bold">{counts.total}</div>
        </div>
        <div className="bg-gradient-to-br from-red-400 to-red-600 rounded-xl p-4 text-white">
          <div className="text-sm opacity-90 mb-1">Critical</div>
          <div className="text-3xl font-bold">{counts.critical}</div>
        </div>
        <div className="bg-gradient-to-br from-orange-400 to-orange-600 rounded-xl p-4 text-white">
          <div className="text-sm opacity-90 mb-1">High Priority</div>
          <div className="text-3xl font-bold">{counts.high}</div>
        </div>
        <div className="bg-gradient-to-br from-green-400 to-green-600 rounded-xl p-4 text-white">
          <div className="text-sm opacity-90 mb-1">Completed</div>
          <div className="text-3xl font-bold">{counts.completed}</div>
        </div>
      </div>

      {/* Insights */}
      <div className="mb-8">
        <h3 className="text-lg font-bold text-gray-900 mb-4">Key Insights</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Strengths */}
          <div>
            <div className="text-sm font-bold text-green-700 mb-2">✓ Strengths</div>
            <div className="space-y-2">
              {getInsightsByType('strength').map((insight, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: settings.reducedMotion ? 0 : index * 0.05 }}
                  className={`p-3 rounded-lg border-2 ${getInsightColor(insight.type)}`}
                >
                  <div className="flex items-start gap-2">
                    <div className="text-xl">{insight.icon}</div>
                    <div>
                      <div className="text-sm font-bold text-gray-900">{insight.title}</div>
                      <div className="text-xs text-gray-600">{insight.description}</div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>

          {/* Weaknesses */}
          <div>
            <div className="text-sm font-bold text-red-700 mb-2">⚠ Areas to Improve</div>
            <div className="space-y-2">
              {getInsightsByType('weakness').map((insight, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: settings.reducedMotion ? 0 : index * 0.05 }}
                  className={`p-3 rounded-lg border-2 ${getInsightColor(insight.type)}`}
                >
                  <div className="flex items-start gap-2">
                    <div className="text-xl">{insight.icon}</div>
                    <div>
                      <div className="text-sm font-bold text-gray-900">{insight.title}</div>
                      <div className="text-xs text-gray-600">{insight.description}</div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>

          {/* Opportunities */}
          <div>
            <div className="text-sm font-bold text-purple-700 mb-2">🚀 Opportunities</div>
            <div className="space-y-2">
              {getInsightsByType('opportunity').map((insight, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: settings.reducedMotion ? 0 : index * 0.05 }}
                  className={`p-3 rounded-lg border-2 ${getInsightColor(insight.type)}`}
                >
                  <div className="flex items-start gap-2">
                    <div className="text-xl">{insight.icon}</div>
                    <div>
                      <div className="text-sm font-bold text-gray-900">{insight.title}</div>
                      <div className="text-xs text-gray-600">{insight.description}</div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="mb-6 space-y-4">
        <div>
          <div className="text-sm font-bold text-gray-700 mb-2">Filter by Category:</div>
          <div className="flex gap-2 flex-wrap">
            {[
              { category: 'all' as const, label: 'All' },
              { category: 'lessons' as const, label: 'Lessons' },
              { category: 'practice' as const, label: 'Practice' },
              { category: 'exercises' as const, label: 'Exercises' },
              { category: 'goals' as const, label: 'Goals' },
              { category: 'habits' as const, label: 'Habits' },
            ].map(({ category, label }) => (
              <button
                key={category}
                onClick={() => setFilterCategory(category)}
                className={`px-4 py-2 rounded-lg font-bold transition-colors ${
                  filterCategory === category
                    ? 'bg-purple-500 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {label}
              </button>
            ))}
          </div>
        </div>

        <div>
          <div className="text-sm font-bold text-gray-700 mb-2">Filter by Priority:</div>
          <div className="flex gap-2 flex-wrap items-center">
            {[
              { priority: 'all' as const, label: 'All Priorities' },
              { priority: 'critical' as const, label: 'Critical' },
              { priority: 'high' as const, label: 'High' },
              { priority: 'medium' as const, label: 'Medium' },
              { priority: 'low' as const, label: 'Low' },
            ].map(({ priority, label }) => (
              <button
                key={priority}
                onClick={() => setFilterPriority(priority)}
                className={`px-4 py-2 rounded-lg font-bold transition-colors ${
                  filterPriority === priority
                    ? 'bg-blue-500 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {label}
              </button>
            ))}
            <label className="flex items-center gap-2 px-4 py-2 bg-gray-100 rounded-lg cursor-pointer hover:bg-gray-200">
              <input
                type="checkbox"
                checked={showCompleted}
                onChange={(e) => setShowCompleted(e.target.checked)}
                className="w-4 h-4 rounded text-purple-600"
              />
              <span className="text-sm font-bold text-gray-700">Show Completed</span>
            </label>
          </div>
        </div>
      </div>

      {/* Recommendations list */}
      <div className="space-y-4">
        {recommendations.map((rec, index) => (
          <motion.div
            key={rec.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: settings.reducedMotion ? 0 : index * 0.05 }}
            className={`rounded-xl p-6 border-2 ${
              rec.completed ? 'bg-gray-50 border-gray-300 opacity-60' : getPriorityColor(rec.priority)
            }`}
          >
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-start gap-4">
                <div className="text-4xl">{rec.icon}</div>
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <div className="font-bold text-gray-900 text-lg">{rec.title}</div>
                    <span className={`px-2 py-1 rounded text-xs font-bold uppercase ${getPriorityBadge(rec.priority)}`}>
                      {rec.priority}
                    </span>
                    {rec.completed && (
                      <span className="px-2 py-1 bg-green-500 text-white rounded text-xs font-bold">
                        ✓ DONE
                      </span>
                    )}
                  </div>
                  <div className="text-sm text-gray-600 mb-2">{rec.description}</div>
                  <div className="text-xs text-gray-500 italic">{rec.reason}</div>
                </div>
              </div>
            </div>

            <div className="mb-4">
              <div className="text-sm font-bold text-gray-700 mb-2">Action Steps:</div>
              <ul className="space-y-1">
                {rec.actionSteps.map((step, i) => (
                  <li key={i} className="text-sm text-gray-700 flex items-start gap-2">
                    <span className="text-purple-600 font-bold">{i + 1}.</span>
                    <span>{step}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex gap-4 text-sm text-gray-600">
                <div>
                  <span className="font-bold">Time:</span> {rec.estimatedTime}
                </div>
                <div>
                  <span className="font-bold">Impact:</span> {rec.expectedImpact}
                </div>
              </div>
              {!rec.completed && (
                <button
                  onClick={() => markAsCompleted(rec.id)}
                  className="px-4 py-2 bg-green-500 text-white rounded-lg font-bold hover:bg-green-600 transition-colors"
                >
                  Mark Complete
                </button>
              )}
            </div>
          </motion.div>
        ))}
      </div>

      {recommendations.length === 0 && (
        <div className="text-center py-12 text-gray-500">
          No recommendations found for the selected filters.
        </div>
      )}
    </div>
  );
}
