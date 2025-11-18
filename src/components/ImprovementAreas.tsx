/**
 * Improvement Areas Component
 * Step 260 - Build improvement areas identification and tracking
 */

import { motion } from 'framer-motion';
import { useState } from 'react';
import { useSettingsStore } from '../store/useSettingsStore';

// Improvement area priority
export type ImprovementPriority = 'urgent' | 'high' | 'medium' | 'low';

// Improvement status
export type ImprovementStatus = 'not-started' | 'in-progress' | 'improving' | 'mastered';

// Improvement area
export interface ImprovementArea {
  id: string;
  title: string;
  description: string;
  priority: ImprovementPriority;
  status: ImprovementStatus;
  currentScore: number; // 0-100
  targetScore: number; // 0-100
  progress: number; // 0-100
  weaknessDetails: string[];
  practiceActivities: string[];
  estimatedTime: string;
  icon: string;
  category: string;
}

// Skill gap
export interface SkillGap {
  skill: string;
  currentLevel: number; // 0-100
  expectedLevel: number; // 0-100
  gap: number; // difference
  impact: 'high' | 'medium' | 'low';
}

// Practice focus
export interface PracticeFocus {
  area: string;
  minutesNeeded: number;
  daysPerWeek: number;
  expectedImprovement: string;
  exercises: string[];
}

// Improvement milestone
export interface ImprovementMilestone {
  id: string;
  areaId: string;
  description: string;
  targetDate: Date;
  achieved: boolean;
  achievedDate?: Date;
}

// Mock improvement areas
const generateMockImprovementAreas = (): ImprovementArea[] => {
  return [
    {
      id: 'imp-1',
      title: 'Number Row Proficiency',
      description: 'Accuracy and speed on number keys need improvement',
      priority: 'urgent',
      status: 'in-progress',
      currentScore: 65,
      targetScore: 90,
      progress: 35,
      weaknessDetails: [
        'Slow on keys 7, 8, 9',
        'Frequent errors on 0 key',
        'Inconsistent finger positioning',
      ],
      practiceActivities: [
        'Complete Number Row lessons 1-5',
        'Practice number combinations daily',
        'Do number-focused speed drills',
      ],
      estimatedTime: '2-3 weeks',
      icon: '🔢',
      category: 'Accuracy',
    },
    {
      id: 'imp-2',
      title: 'Right Hand Speed',
      description: 'Right hand is slower than left hand',
      priority: 'high',
      status: 'in-progress',
      currentScore: 72,
      targetScore: 85,
      progress: 45,
      weaknessDetails: [
        'P key is 20% slower',
        'Right pinky underutilized',
        'Hand position shifts too much',
      ],
      practiceActivities: [
        'Right-hand specific exercises',
        'Finger independence drills',
        'Focus on P, L, semicolon keys',
      ],
      estimatedTime: '3-4 weeks',
      icon: '✋',
      category: 'Speed',
    },
    {
      id: 'imp-3',
      title: 'Special Characters',
      description: 'Limited practice with special symbols',
      priority: 'medium',
      status: 'not-started',
      currentScore: 45,
      targetScore: 80,
      progress: 0,
      weaknessDetails: [
        'Unfamiliar with brackets',
        'Slow on @, #, $ symbols',
        'No practice with coding symbols',
      ],
      practiceActivities: [
        'Start Special Characters basics',
        'Practice common symbols',
        'Learn programming symbols',
      ],
      estimatedTime: '2 weeks',
      icon: '🔣',
      category: 'Coverage',
    },
    {
      id: 'imp-4',
      title: 'Typing Endurance',
      description: 'Speed decreases in longer sessions',
      priority: 'medium',
      status: 'improving',
      currentScore: 68,
      targetScore: 85,
      progress: 55,
      weaknessDetails: [
        'Speed drops after 15 minutes',
        'Accuracy suffers when tired',
        'Need better stamina',
      ],
      practiceActivities: [
        'Gradual session length increase',
        'Take strategic breaks',
        'Practice relaxation techniques',
      ],
      estimatedTime: '4-6 weeks',
      icon: '💪',
      category: 'Endurance',
    },
    {
      id: 'imp-5',
      title: 'Consistency',
      description: 'Performance varies between sessions',
      priority: 'high',
      status: 'in-progress',
      currentScore: 75,
      targetScore: 90,
      progress: 60,
      weaknessDetails: [
        'WPM varies by 15-20',
        'Time-of-day effects',
        'Inconsistent practice schedule',
      ],
      practiceActivities: [
        'Practice at same time daily',
        'Track performance patterns',
        'Develop routine',
      ],
      estimatedTime: '3 weeks',
      icon: '📊',
      category: 'Consistency',
    },
  ];
};

// Mock skill gaps
const generateMockSkillGaps = (): SkillGap[] => {
  return [
    {
      skill: 'Number Keys',
      currentLevel: 65,
      expectedLevel: 85,
      gap: 20,
      impact: 'high',
    },
    {
      skill: 'Special Characters',
      currentLevel: 45,
      expectedLevel: 75,
      gap: 30,
      impact: 'medium',
    },
    {
      skill: 'Right Hand Speed',
      currentLevel: 72,
      expectedLevel: 85,
      gap: 13,
      impact: 'medium',
    },
    {
      skill: 'Endurance',
      currentLevel: 68,
      expectedLevel: 80,
      gap: 12,
      impact: 'low',
    },
  ];
};

// Mock practice focus
const generateMockPracticeFocus = (): PracticeFocus[] => {
  return [
    {
      area: 'Number Row',
      minutesNeeded: 10,
      daysPerWeek: 5,
      expectedImprovement: '+15-20% accuracy in 2 weeks',
      exercises: ['Number drills', 'Combination practice', 'Speed tests'],
    },
    {
      area: 'Right Hand',
      minutesNeeded: 8,
      daysPerWeek: 4,
      expectedImprovement: '+10% speed in 3 weeks',
      exercises: ['Finger exercises', 'Right-hand drills', 'Targeted practice'],
    },
  ];
};

// Custom hook for improvement areas
export function useImprovementAreas() {
  const [areas] = useState<ImprovementArea[]>(generateMockImprovementAreas());
  const [skillGaps] = useState<SkillGap[]>(generateMockSkillGaps());
  const [practiceFocus] = useState<PracticeFocus[]>(generateMockPracticeFocus());
  const [filterPriority, setFilterPriority] = useState<ImprovementPriority | 'all'>('all');
  const [filterStatus, setFilterStatus] = useState<ImprovementStatus | 'all'>('all');
  const [sortBy, setSortBy] = useState<'priority' | 'progress' | 'score'>('priority');

  const getFilteredAreas = () => {
    let filtered = areas;

    // Filter by priority
    if (filterPriority !== 'all') {
      filtered = filtered.filter((a) => a.priority === filterPriority);
    }

    // Filter by status
    if (filterStatus !== 'all') {
      filtered = filtered.filter((a) => a.status === filterStatus);
    }

    // Sort
    const sorted = [...filtered].sort((a, b) => {
      if (sortBy === 'priority') {
        const priorityOrder = { urgent: 0, high: 1, medium: 2, low: 3 };
        return priorityOrder[a.priority] - priorityOrder[b.priority];
      } else if (sortBy === 'progress') {
        return b.progress - a.progress;
      } else {
        return a.currentScore - b.currentScore;
      }
    });

    return sorted;
  };

  const getAreaStats = () => {
    return {
      total: areas.length,
      urgent: areas.filter((a) => a.priority === 'urgent').length,
      inProgress: areas.filter((a) => a.status === 'in-progress').length,
      mastered: areas.filter((a) => a.status === 'mastered').length,
      averageProgress: Math.round(areas.reduce((sum, a) => sum + a.progress, 0) / areas.length),
    };
  };

  return {
    areas: getFilteredAreas(),
    allAreas: areas,
    skillGaps,
    practiceFocus,
    filterPriority,
    setFilterPriority,
    filterStatus,
    setFilterStatus,
    sortBy,
    setSortBy,
    stats: getAreaStats(),
  };
}

// Get priority color
const getPriorityColor = (priority: ImprovementPriority): string => {
  switch (priority) {
    case 'urgent':
      return 'bg-red-100 text-red-700 border-red-300';
    case 'high':
      return 'bg-orange-100 text-orange-700 border-orange-300';
    case 'medium':
      return 'bg-yellow-100 text-yellow-700 border-yellow-300';
    case 'low':
      return 'bg-blue-100 text-blue-700 border-blue-300';
  }
};

// Get status color
const getStatusColor = (status: ImprovementStatus): string => {
  switch (status) {
    case 'not-started':
      return 'bg-gray-100 text-gray-700';
    case 'in-progress':
      return 'bg-blue-100 text-blue-700';
    case 'improving':
      return 'bg-yellow-100 text-yellow-700';
    case 'mastered':
      return 'bg-green-100 text-green-700';
  }
};

// Get impact color
const getImpactColor = (impact: 'high' | 'medium' | 'low'): string => {
  switch (impact) {
    case 'high':
      return 'bg-red-500';
    case 'medium':
      return 'bg-yellow-500';
    case 'low':
      return 'bg-blue-500';
  }
};

// Main improvement areas component
export default function ImprovementAreas() {
  const {
    areas,
    skillGaps,
    practiceFocus,
    filterPriority,
    setFilterPriority,
    sortBy,
    setSortBy,
    stats,
  } = useImprovementAreas();

  const { settings } = useSettingsStore();

  return (
    <div className="bg-white rounded-2xl shadow-xl p-8">
      <h2 className="text-2xl font-bold text-gray-800 mb-6 text-center">
        🎯 Improvement Areas
      </h2>

      {/* Stats overview */}
      <div className="mb-8 grid grid-cols-2 md:grid-cols-5 gap-3">
        <div className="bg-gradient-to-br from-purple-400 to-purple-600 rounded-lg p-3 text-white text-center">
          <div className="text-2xl font-bold">{stats.total}</div>
          <div className="text-xs opacity-90">Total Areas</div>
        </div>
        <div className="bg-gradient-to-br from-red-400 to-red-600 rounded-lg p-3 text-white text-center">
          <div className="text-2xl font-bold">{stats.urgent}</div>
          <div className="text-xs opacity-90">Urgent</div>
        </div>
        <div className="bg-gradient-to-br from-blue-400 to-blue-600 rounded-lg p-3 text-white text-center">
          <div className="text-2xl font-bold">{stats.inProgress}</div>
          <div className="text-xs opacity-90">In Progress</div>
        </div>
        <div className="bg-gradient-to-br from-green-400 to-green-600 rounded-lg p-3 text-white text-center">
          <div className="text-2xl font-bold">{stats.mastered}</div>
          <div className="text-xs opacity-90">Mastered</div>
        </div>
        <div className="bg-gradient-to-br from-yellow-400 to-yellow-600 rounded-lg p-3 text-white text-center">
          <div className="text-2xl font-bold">{stats.averageProgress}%</div>
          <div className="text-xs opacity-90">Avg Progress</div>
        </div>
      </div>

      {/* Skill gaps */}
      <div className="mb-8 bg-gray-50 rounded-xl p-6">
        <h3 className="text-lg font-bold text-gray-900 mb-4">Skill Gaps Analysis</h3>
        <div className="space-y-3">
          {skillGaps.map((gap, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: settings.reducedMotion ? 0 : index * 0.05 }}
              className="bg-white rounded-lg p-4"
            >
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-3">
                  <div className={`w-3 h-3 rounded-full ${getImpactColor(gap.impact)}`} />
                  <div className="font-bold text-gray-900">{gap.skill}</div>
                </div>
                <div className="text-sm font-bold text-red-600">Gap: {gap.gap} points</div>
              </div>
              <div className="relative h-4 bg-gray-200 rounded-full overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${gap.currentLevel}%` }}
                  transition={{ duration: settings.reducedMotion ? 0 : 1, delay: index * 0.05 }}
                  className="absolute h-full bg-gradient-to-r from-orange-400 to-orange-600"
                />
                <div
                  className="absolute h-full border-r-2 border-green-500"
                  style={{ left: `${gap.expectedLevel}%` }}
                />
              </div>
              <div className="flex items-center justify-between text-xs text-gray-600 mt-1">
                <span>Current: {gap.currentLevel}%</span>
                <span>Target: {gap.expectedLevel}%</span>
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Practice focus */}
      <div className="mb-8 bg-blue-50 border-2 border-blue-200 rounded-xl p-6">
        <h3 className="text-lg font-bold text-gray-900 mb-4">📅 Recommended Practice Focus</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {practiceFocus.map((focus, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: settings.reducedMotion ? 0 : index * 0.1 }}
              className="bg-white rounded-lg p-4"
            >
              <div className="font-bold text-gray-900 text-lg mb-2">{focus.area}</div>
              <div className="grid grid-cols-2 gap-2 mb-3 text-sm">
                <div>
                  <span className="text-gray-600">Time:</span>
                  <span className="font-bold text-gray-900 ml-2">{focus.minutesNeeded} min/day</span>
                </div>
                <div>
                  <span className="text-gray-600">Days:</span>
                  <span className="font-bold text-gray-900 ml-2">{focus.daysPerWeek}x/week</span>
                </div>
              </div>
              <div className="text-sm text-green-700 font-bold mb-2">{focus.expectedImprovement}</div>
              <div className="text-xs text-gray-600">
                {focus.exercises.join(' • ')}
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Filters and sorting */}
      <div className="mb-6 space-y-3">
        <div className="flex gap-2 flex-wrap items-center">
          <span className="text-sm font-bold text-gray-700">Filter:</span>
          {[
            { filter: 'all' as const, label: 'All' },
            { filter: 'urgent' as const, label: 'Urgent' },
            { filter: 'high' as const, label: 'High' },
            { filter: 'medium' as const, label: 'Medium' },
            { filter: 'low' as const, label: 'Low' },
          ].map(({ filter, label }) => (
            <button
              key={filter}
              onClick={() => setFilterPriority(filter)}
              className={`px-3 py-1 rounded-lg text-sm font-bold transition-colors ${
                filterPriority === filter
                  ? 'bg-purple-500 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {label}
            </button>
          ))}
        </div>

        <div className="flex gap-2 flex-wrap items-center">
          <span className="text-sm font-bold text-gray-700">Sort by:</span>
          {[
            { sort: 'priority' as const, label: 'Priority' },
            { sort: 'progress' as const, label: 'Progress' },
            { sort: 'score' as const, label: 'Score' },
          ].map(({ sort, label }) => (
            <button
              key={sort}
              onClick={() => setSortBy(sort)}
              className={`px-3 py-1 rounded-lg text-sm font-bold transition-colors ${
                sortBy === sort
                  ? 'bg-blue-500 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      {/* Improvement areas list */}
      <div className="space-y-4">
        {areas.map((area, index) => (
          <motion.div
            key={area.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: settings.reducedMotion ? 0 : index * 0.05 }}
            className={`rounded-xl p-6 border-2 ${getPriorityColor(area.priority)}`}
          >
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-start gap-4">
                <div className="text-4xl">{area.icon}</div>
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <div className="font-bold text-gray-900 text-lg">{area.title}</div>
                    <span className={`px-2 py-1 rounded text-xs font-bold uppercase ${getStatusColor(area.status)}`}>
                      {area.status.replace('-', ' ')}
                    </span>
                  </div>
                  <div className="text-sm text-gray-600 mb-2">{area.description}</div>
                  <div className="text-xs text-gray-500">{area.category} • {area.estimatedTime}</div>
                </div>
              </div>
              <div className="text-right">
                <div className="text-3xl font-bold text-purple-600">{area.progress}%</div>
                <div className="text-sm text-gray-600">Progress</div>
              </div>
            </div>

            {/* Progress bar */}
            <div className="mb-4">
              <div className="flex items-center justify-between text-xs text-gray-600 mb-1">
                <span>Current: {area.currentScore}</span>
                <span>Target: {area.targetScore}</span>
              </div>
              <div className="h-3 bg-gray-200 rounded-full overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${area.progress}%` }}
                  transition={{ duration: settings.reducedMotion ? 0 : 1, delay: index * 0.05 }}
                  className="h-full bg-gradient-to-r from-purple-400 to-purple-600"
                />
              </div>
            </div>

            {/* Weaknesses */}
            <div className="mb-4">
              <div className="text-sm font-bold text-gray-700 mb-2">Weaknesses:</div>
              <ul className="space-y-1">
                {area.weaknessDetails.map((weakness, i) => (
                  <li key={i} className="text-sm text-gray-600 flex items-start gap-2">
                    <span className="text-red-500">•</span>
                    <span>{weakness}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Practice activities */}
            <div>
              <div className="text-sm font-bold text-gray-700 mb-2">Practice Activities:</div>
              <ul className="space-y-1">
                {area.practiceActivities.map((activity, i) => (
                  <li key={i} className="text-sm text-gray-700 flex items-start gap-2">
                    <span className="text-green-600">✓</span>
                    <span>{activity}</span>
                  </li>
                ))}
              </ul>
            </div>
          </motion.div>
        ))}
      </div>

      {areas.length === 0 && (
        <div className="text-center py-12 text-gray-500">
          No improvement areas found for the selected filters.
        </div>
      )}
    </div>
  );
}
