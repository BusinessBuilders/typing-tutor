/**
 * Pattern Analysis Component
 * Step 247 - Create pattern analysis for typing behavior
 */

import { motion } from 'framer-motion';
import { useState } from 'react';
import { useSettingsStore } from '../store/useSettingsStore';

// Pattern types
export interface TypingPattern {
  id: string;
  name: string;
  description: string;
  strength: number; // 0-100
  category: 'positive' | 'negative' | 'neutral';
  icon: string;
  details: string[];
}

// Key combination pattern
export interface KeyCombination {
  keys: string;
  frequency: number;
  averageSpeed: number;
  errorRate: number;
}

// Time of day pattern
export interface TimeOfDayPattern {
  hour: number;
  wpm: number;
  accuracy: number;
  sessions: number;
}

// Error tendency
export interface ErrorTendency {
  type: string;
  description: string;
  frequency: number;
  examples: string[];
  suggestion: string;
}

// Rhythm pattern
export interface RhythmPattern {
  type: 'consistent' | 'burst' | 'irregular';
  score: number; // 0-100
  variance: number;
  description: string;
}

// Pattern analysis data
export interface PatternAnalysisData {
  patterns: TypingPattern[];
  keyCombinations: KeyCombination[];
  timePatterns: TimeOfDayPattern[];
  errorTendencies: ErrorTendency[];
  rhythm: RhythmPattern;
  learningCurve: {
    trend: 'improving' | 'stable' | 'declining';
    rate: number; // percentage
    consistency: number; // 0-100
  };
}

// Mock pattern data
const generateMockPatterns = (): TypingPattern[] => {
  return [
    {
      id: 'home-row-mastery',
      name: 'Home Row Mastery',
      description: 'Strong foundation on home row keys',
      strength: 92,
      category: 'positive',
      icon: '✨',
      details: [
        'Excellent accuracy on A, S, D, F, J, K, L keys',
        'Fast return to home position',
        'Minimal errors on base keys',
      ],
    },
    {
      id: 'number-row-weakness',
      name: 'Number Row Challenge',
      description: 'Difficulty with number keys',
      strength: 45,
      category: 'negative',
      icon: '⚠️',
      details: [
        'Slower speed on number keys (35% below average)',
        'Higher error rate on 7, 8, 9',
        'Inconsistent finger positioning',
      ],
    },
    {
      id: 'consistent-rhythm',
      name: 'Consistent Rhythm',
      description: 'Steady and predictable typing pace',
      strength: 88,
      category: 'positive',
      icon: '🎵',
      details: [
        'Low variance in keystroke timing',
        'Predictable inter-key intervals',
        'Smooth typing flow',
      ],
    },
    {
      id: 'right-pinky-strain',
      name: 'Right Pinky Overuse',
      description: 'Heavy reliance on right pinky finger',
      strength: 62,
      category: 'negative',
      icon: '👆',
      details: [
        'Excessive use for shift and enter keys',
        'Slower recovery time',
        'May lead to fatigue',
      ],
    },
    {
      id: 'word-boundary-speed',
      name: 'Fast Word Transitions',
      description: 'Quick movement between words',
      strength: 85,
      category: 'positive',
      icon: '⚡',
      details: [
        'Minimal delay at space bar',
        'Efficient word-to-word flow',
        'Good space bar technique',
      ],
    },
    {
      id: 'backspace-tendency',
      name: 'Frequent Self-Correction',
      description: 'Often uses backspace to fix errors',
      strength: 58,
      category: 'neutral',
      icon: '⌫',
      details: [
        'Quick to notice and correct mistakes',
        'May interrupt typing flow',
        'Could benefit from accuracy focus',
      ],
    },
  ];
};

// Mock key combinations
const generateMockCombinations = (): KeyCombination[] => {
  const common = ['th', 'he', 'in', 'er', 'an', 'ed', 'on', 'at', 'en', 'nd'];
  return common.map((combo) => ({
    keys: combo,
    frequency: 50 + Math.floor(Math.random() * 150),
    averageSpeed: 100 + Math.floor(Math.random() * 100),
    errorRate: Math.random() * 10,
  }));
};

// Mock time patterns
const generateMockTimePatterns = (): TimeOfDayPattern[] => {
  const patterns: TimeOfDayPattern[] = [];
  for (let hour = 8; hour <= 22; hour++) {
    const baseWPM = 65;
    const peakHours = [10, 14, 19]; // Peak performance hours
    const boost = peakHours.includes(hour) ? 15 : 0;
    const variance = Math.random() * 10 - 5;

    patterns.push({
      hour,
      wpm: Math.round(baseWPM + boost + variance),
      accuracy: 90 + Math.random() * 8,
      sessions: Math.floor(Math.random() * 5),
    });
  }
  return patterns;
};

// Mock error tendencies
const generateMockErrorTendencies = (): ErrorTendency[] => {
  return [
    {
      type: 'Adjacent Key Errors',
      description: 'Accidentally hitting keys next to the target',
      frequency: 45,
      examples: ['typing "teh" instead of "the"', 'typing "hte" instead of "the"'],
      suggestion: 'Practice slow, deliberate key presses. Focus on finger placement.',
    },
    {
      type: 'Skip Letters',
      description: 'Missing letters in the middle of words',
      frequency: 28,
      examples: ['typing "thee" instead of "three"', 'typing "wrking" instead of "working"'],
      suggestion: 'Slow down and ensure each key is pressed fully.',
    },
    {
      type: 'Transposition',
      description: 'Swapping the order of letters',
      frequency: 18,
      examples: ['typing "form" instead of "from"', 'typing "taht" instead of "that"'],
      suggestion: 'Practice common word patterns to build muscle memory.',
    },
    {
      type: 'Double Letters',
      description: 'Repeating keys unintentionally',
      frequency: 15,
      examples: ['typing "tthe" instead of "the"', 'typing "annd" instead of "and"'],
      suggestion: 'Focus on clean key releases. Lift fingers completely between presses.',
    },
  ];
};

// Custom hook for pattern analysis
export function usePatternAnalysis() {
  const [patterns] = useState<TypingPattern[]>(generateMockPatterns());
  const [keyCombinations] = useState<KeyCombination[]>(generateMockCombinations());
  const [timePatterns] = useState<TimeOfDayPattern[]>(generateMockTimePatterns());
  const [errorTendencies] = useState<ErrorTendency[]>(generateMockErrorTendencies());
  const [selectedCategory, setSelectedCategory] = useState<'all' | 'positive' | 'negative' | 'neutral'>('all');

  const getFilteredPatterns = () => {
    if (selectedCategory === 'all') return patterns;
    return patterns.filter((p) => p.category === selectedCategory);
  };

  const getRhythmPattern = (): RhythmPattern => {
    // Analyze typing rhythm based on patterns
    const hasConsistentPattern = patterns.some((p) => p.id === 'consistent-rhythm');

    if (hasConsistentPattern) {
      return {
        type: 'consistent',
        score: 88,
        variance: 12,
        description: 'You maintain a steady, predictable typing rhythm with minimal speed fluctuations.',
      };
    }

    return {
      type: 'burst',
      score: 65,
      variance: 35,
      description: 'Your typing speed varies significantly, with bursts of fast typing followed by slower periods.',
    };
  };

  const getLearningCurve = () => {
    return {
      trend: 'improving' as 'improving' | 'stable' | 'declining',
      rate: 12.5,
      consistency: 82,
    };
  };

  const getTopCombinations = (count: number = 5) => {
    return [...keyCombinations]
      .sort((a, b) => b.frequency - a.frequency)
      .slice(0, count);
  };

  const getPeakHours = () => {
    return [...timePatterns]
      .sort((a, b) => b.wpm - a.wpm)
      .slice(0, 3);
  };

  return {
    patterns: getFilteredPatterns(),
    allPatterns: patterns,
    keyCombinations: getTopCombinations(),
    timePatterns,
    errorTendencies,
    rhythm: getRhythmPattern(),
    learningCurve: getLearningCurve(),
    peakHours: getPeakHours(),
    selectedCategory,
    setSelectedCategory,
  };
}

// Main pattern analysis component
export default function PatternAnalysis() {
  const {
    patterns,
    allPatterns,
    keyCombinations,
    timePatterns,
    errorTendencies,
    rhythm,
    learningCurve,
    peakHours,
    selectedCategory,
    setSelectedCategory,
  } = usePatternAnalysis();

  const { settings } = useSettingsStore();
  const [expandedPattern, setExpandedPattern] = useState<string | null>(null);

  // Calculate pattern category counts
  const categoryCounts = {
    all: allPatterns.length,
    positive: allPatterns.filter((p) => p.category === 'positive').length,
    negative: allPatterns.filter((p) => p.category === 'negative').length,
    neutral: allPatterns.filter((p) => p.category === 'neutral').length,
  };

  return (
    <div className="bg-white rounded-2xl shadow-xl p-8">
      <h2 className="text-2xl font-bold text-gray-800 mb-6 text-center">
        🔍 Pattern Analysis
      </h2>

      {/* Learning curve overview */}
      <div className="mb-8 bg-gradient-to-br from-purple-400 to-purple-600 rounded-xl p-6 text-white">
        <h3 className="text-lg font-bold mb-2">Learning Progress</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <div className="text-sm opacity-90">Trend</div>
            <div className="text-2xl font-bold capitalize flex items-center gap-2">
              {learningCurve.trend === 'improving' && '📈 Improving'}
              {learningCurve.trend === 'stable' && '➡️ Stable'}
              {learningCurve.trend === 'declining' && '📉 Declining'}
            </div>
          </div>
          <div>
            <div className="text-sm opacity-90">Improvement Rate</div>
            <div className="text-2xl font-bold">+{learningCurve.rate}%</div>
          </div>
          <div>
            <div className="text-sm opacity-90">Consistency</div>
            <div className="text-2xl font-bold">{learningCurve.consistency}%</div>
          </div>
        </div>
      </div>

      {/* Rhythm analysis */}
      <div className="mb-8 bg-gray-50 rounded-xl p-6">
        <h3 className="text-lg font-bold text-gray-900 mb-4">Typing Rhythm</h3>
        <div className="flex items-start gap-4">
          <div className="text-5xl">🎵</div>
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-2">
              <div className="font-bold text-xl text-gray-900 capitalize">{rhythm.type} Rhythm</div>
              <div className="px-3 py-1 bg-purple-100 text-purple-700 rounded-full text-sm font-bold">
                {rhythm.score}% Score
              </div>
            </div>
            <p className="text-gray-700 mb-3">{rhythm.description}</p>
            <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${rhythm.score}%` }}
                transition={{ duration: settings.reducedMotion ? 0 : 1 }}
                className="h-full bg-gradient-to-r from-purple-400 to-purple-600"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Category filter */}
      <div className="mb-6 flex gap-2 flex-wrap">
        {(['all', 'positive', 'negative', 'neutral'] as const).map((category) => (
          <button
            key={category}
            onClick={() => setSelectedCategory(category)}
            className={`px-6 py-3 rounded-lg font-bold capitalize transition-colors ${
              selectedCategory === category
                ? 'bg-purple-500 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            {category} {category !== 'all' && `(${categoryCounts[category]})`}
          </button>
        ))}
      </div>

      {/* Detected patterns */}
      <div className="mb-8">
        <h3 className="text-lg font-bold text-gray-900 mb-4">Detected Patterns</h3>
        <div className="space-y-3">
          {patterns.map((pattern, index) => (
            <motion.div
              key={pattern.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: settings.reducedMotion ? 0 : index * 0.05 }}
              className={`rounded-xl p-4 cursor-pointer transition-all ${
                pattern.category === 'positive' ? 'bg-green-50 hover:bg-green-100' :
                pattern.category === 'negative' ? 'bg-red-50 hover:bg-red-100' :
                'bg-blue-50 hover:bg-blue-100'
              }`}
              onClick={() => setExpandedPattern(expandedPattern === pattern.id ? null : pattern.id)}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="text-3xl">{pattern.icon}</div>
                  <div>
                    <div className="font-bold text-gray-900">{pattern.name}</div>
                    <div className="text-sm text-gray-600">{pattern.description}</div>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <div className="text-right">
                    <div className={`text-2xl font-bold ${
                      pattern.category === 'positive' ? 'text-green-600' :
                      pattern.category === 'negative' ? 'text-red-600' :
                      'text-blue-600'
                    }`}>
                      {pattern.strength}%
                    </div>
                    <div className="text-xs text-gray-600">Strength</div>
                  </div>
                  <div className="text-2xl text-gray-400">
                    {expandedPattern === pattern.id ? '▼' : '▶'}
                  </div>
                </div>
              </div>

              {/* Expanded details */}
              {expandedPattern === pattern.id && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  transition={{ duration: settings.reducedMotion ? 0 : 0.2 }}
                  className="mt-4 pt-4 border-t border-gray-300"
                >
                  <div className="text-sm font-bold text-gray-900 mb-2">Details:</div>
                  <ul className="space-y-1">
                    {pattern.details.map((detail, i) => (
                      <li key={i} className="text-sm text-gray-700 flex items-start gap-2">
                        <span className="text-purple-600">•</span>
                        <span>{detail}</span>
                      </li>
                    ))}
                  </ul>
                </motion.div>
              )}
            </motion.div>
          ))}
        </div>
      </div>

      {/* Common key combinations */}
      <div className="mb-8 bg-gray-50 rounded-xl p-6">
        <h3 className="text-lg font-bold text-gray-900 mb-4">Most Common Key Combinations</h3>
        <div className="space-y-3">
          {keyCombinations.map((combo, index) => (
            <motion.div
              key={combo.keys}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: settings.reducedMotion ? 0 : index * 0.05 }}
              className="flex items-center justify-between p-3 bg-white rounded-lg"
            >
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 bg-purple-100 rounded-lg flex items-center justify-center">
                  <span className="text-2xl font-bold text-purple-600">{combo.keys}</span>
                </div>
                <div>
                  <div className="font-bold text-gray-900">"{combo.keys}" combination</div>
                  <div className="text-sm text-gray-600">
                    Used {combo.frequency} times • {combo.averageSpeed}ms avg speed
                  </div>
                </div>
              </div>
              <div className={`px-4 py-2 rounded-lg font-bold ${
                combo.errorRate < 3 ? 'bg-green-100 text-green-700' :
                combo.errorRate < 6 ? 'bg-yellow-100 text-yellow-700' :
                'bg-red-100 text-red-700'
              }`}>
                {combo.errorRate.toFixed(1)}% errors
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Time of day patterns */}
      <div className="mb-8 bg-gray-50 rounded-xl p-6">
        <h3 className="text-lg font-bold text-gray-900 mb-4">Performance by Time of Day</h3>
        <div className="mb-4">
          <div className="text-sm font-bold text-gray-700 mb-2">Peak Performance Hours:</div>
          <div className="flex gap-2">
            {peakHours.map((peak) => (
              <div
                key={peak.hour}
                className="px-4 py-2 bg-yellow-100 text-yellow-700 rounded-lg font-bold"
              >
                {peak.hour}:00 - {peak.wpm} WPM
              </div>
            ))}
          </div>
        </div>
        <div className="h-48 flex items-end justify-between gap-1">
          {timePatterns.map((pattern, index) => {
            const maxWPM = Math.max(...timePatterns.map((p) => p.wpm));
            const heightPercentage = (pattern.wpm / maxWPM) * 100;
            const isPeak = peakHours.some((p) => p.hour === pattern.hour);

            return (
              <motion.div
                key={pattern.hour}
                initial={{ scaleY: 0 }}
                animate={{ scaleY: 1 }}
                transition={{ delay: settings.reducedMotion ? 0 : index * 0.02 }}
                className="flex-1 flex flex-col items-center gap-1"
                style={{ transformOrigin: 'bottom' }}
              >
                <div className="flex-1 w-full flex items-end">
                  <div
                    className={`w-full rounded-t relative group cursor-pointer ${
                      isPeak ? 'bg-gradient-to-t from-yellow-500 to-yellow-300' :
                      'bg-gradient-to-t from-blue-500 to-blue-300'
                    }`}
                    style={{ height: `${heightPercentage}%` }}
                  >
                    <div className="absolute bottom-full mb-2 left-1/2 transform -translate-x-1/2 bg-gray-900 text-white px-2 py-1 rounded text-xs whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
                      {pattern.hour}:00
                      <br />
                      {pattern.wpm} WPM
                      <br />
                      {pattern.accuracy.toFixed(1)}% accuracy
                    </div>
                  </div>
                </div>
                <div className="text-xs text-gray-600 font-bold">{pattern.hour}</div>
              </motion.div>
            );
          })}
        </div>
      </div>

      {/* Error tendencies */}
      <div className="bg-gray-50 rounded-xl p-6">
        <h3 className="text-lg font-bold text-gray-900 mb-4">Error Tendencies</h3>
        <div className="space-y-4">
          {errorTendencies.map((tendency, index) => (
            <motion.div
              key={tendency.type}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: settings.reducedMotion ? 0 : index * 0.1 }}
              className="bg-white rounded-lg p-4"
            >
              <div className="flex items-start justify-between mb-3">
                <div>
                  <div className="font-bold text-gray-900">{tendency.type}</div>
                  <div className="text-sm text-gray-600">{tendency.description}</div>
                </div>
                <div className="px-3 py-1 bg-red-100 text-red-700 rounded-full text-sm font-bold">
                  {tendency.frequency} errors
                </div>
              </div>
              <div className="mb-3">
                <div className="text-sm font-bold text-gray-700 mb-1">Examples:</div>
                <ul className="space-y-1">
                  {tendency.examples.map((example, i) => (
                    <li key={i} className="text-sm text-gray-600 flex items-start gap-2">
                      <span className="text-red-500">•</span>
                      <span>{example}</span>
                    </li>
                  ))}
                </ul>
              </div>
              <div className="bg-blue-50 border-l-4 border-blue-500 p-3 rounded">
                <div className="text-sm font-bold text-blue-900 mb-1">💡 Suggestion:</div>
                <div className="text-sm text-blue-800">{tendency.suggestion}</div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
}
