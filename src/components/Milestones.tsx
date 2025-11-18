/**
 * Milestones Component
 * Step 217 - Create milestones system for tracking achievements
 */

import { motion, AnimatePresence } from 'framer-motion';
import { useState } from 'react';
import { useSettingsStore } from '../store/useSettingsStore';

// Milestone interface
export interface Milestone {
  id: string;
  title: string;
  description: string;
  icon: string;
  category: 'typing' | 'accuracy' | 'speed' | 'practice' | 'achievement';
  target: number;
  current: number;
  unit: string;
  reward: string;
  completed: boolean;
  completedAt?: Date;
  color: string;
}

// Predefined milestones
const MILESTONES: Milestone[] = [
  // Typing milestones
  {
    id: 'type_100',
    title: 'First Steps',
    description: 'Type 100 characters',
    icon: '🔤',
    category: 'typing',
    target: 100,
    current: 0,
    unit: 'characters',
    reward: '50 XP',
    completed: false,
    color: 'from-blue-400 to-blue-500',
  },
  {
    id: 'type_1000',
    title: 'Getting Started',
    description: 'Type 1,000 characters',
    icon: '📝',
    category: 'typing',
    target: 1000,
    current: 0,
    unit: 'characters',
    reward: '100 XP + Bronze Badge',
    completed: false,
    color: 'from-green-400 to-green-500',
  },
  {
    id: 'type_10000',
    title: 'Dedicated Typist',
    description: 'Type 10,000 characters',
    icon: '⌨️',
    category: 'typing',
    target: 10000,
    current: 0,
    unit: 'characters',
    reward: '500 XP + Silver Badge',
    completed: false,
    color: 'from-purple-400 to-purple-500',
  },
  {
    id: 'type_100000',
    title: 'Master Typist',
    description: 'Type 100,000 characters',
    icon: '🏆',
    category: 'typing',
    target: 100000,
    current: 0,
    unit: 'characters',
    reward: '2000 XP + Gold Badge',
    completed: false,
    color: 'from-yellow-400 to-yellow-600',
  },

  // Accuracy milestones
  {
    id: 'accuracy_90',
    title: 'Careful Typist',
    description: 'Achieve 90% accuracy',
    icon: '🎯',
    category: 'accuracy',
    target: 90,
    current: 0,
    unit: '%',
    reward: '100 XP',
    completed: false,
    color: 'from-green-400 to-green-500',
  },
  {
    id: 'accuracy_95',
    title: 'Precision Expert',
    description: 'Achieve 95% accuracy',
    icon: '🎖️',
    category: 'accuracy',
    target: 95,
    current: 0,
    unit: '%',
    reward: '250 XP + Accuracy Badge',
    completed: false,
    color: 'from-blue-400 to-blue-500',
  },
  {
    id: 'accuracy_99',
    title: 'Perfect Precision',
    description: 'Achieve 99% accuracy',
    icon: '💎',
    category: 'accuracy',
    target: 99,
    current: 0,
    unit: '%',
    reward: '500 XP + Diamond Badge',
    completed: false,
    color: 'from-cyan-400 to-cyan-500',
  },

  // Speed milestones
  {
    id: 'wpm_20',
    title: 'Speedy Beginner',
    description: 'Type at 20 WPM',
    icon: '🚀',
    category: 'speed',
    target: 20,
    current: 0,
    unit: 'WPM',
    reward: '100 XP',
    completed: false,
    color: 'from-orange-400 to-orange-500',
  },
  {
    id: 'wpm_40',
    title: 'Fast Typer',
    description: 'Type at 40 WPM',
    icon: '⚡',
    category: 'speed',
    target: 40,
    current: 0,
    unit: 'WPM',
    reward: '300 XP + Speed Badge',
    completed: false,
    color: 'from-yellow-400 to-yellow-500',
  },
  {
    id: 'wpm_60',
    title: 'Lightning Hands',
    description: 'Type at 60 WPM',
    icon: '⚡⚡',
    category: 'speed',
    target: 60,
    current: 0,
    unit: 'WPM',
    reward: '800 XP + Lightning Badge',
    completed: false,
    color: 'from-purple-500 to-pink-500',
  },

  // Practice milestones
  {
    id: 'practice_10',
    title: 'Dedicated Student',
    description: 'Complete 10 practice sessions',
    icon: '📚',
    category: 'practice',
    target: 10,
    current: 0,
    unit: 'sessions',
    reward: '100 XP',
    completed: false,
    color: 'from-blue-400 to-blue-500',
  },
  {
    id: 'practice_50',
    title: 'Committed Learner',
    description: 'Complete 50 practice sessions',
    icon: '🎓',
    category: 'practice',
    target: 50,
    current: 0,
    unit: 'sessions',
    reward: '500 XP + Practice Badge',
    completed: false,
    color: 'from-green-400 to-green-500',
  },
  {
    id: 'practice_100',
    title: 'Practice Master',
    description: 'Complete 100 practice sessions',
    icon: '🏅',
    category: 'practice',
    target: 100,
    current: 0,
    unit: 'sessions',
    reward: '1500 XP + Master Badge',
    completed: false,
    color: 'from-purple-400 to-purple-500',
  },

  // Achievement milestones
  {
    id: 'streak_7',
    title: 'Week Warrior',
    description: 'Practice 7 days in a row',
    icon: '🔥',
    category: 'achievement',
    target: 7,
    current: 0,
    unit: 'days',
    reward: '300 XP + Streak Badge',
    completed: false,
    color: 'from-orange-400 to-red-500',
  },
  {
    id: 'all_letters',
    title: 'Alphabet Master',
    description: 'Type all letters of the alphabet',
    icon: '🔤',
    category: 'achievement',
    target: 26,
    current: 0,
    unit: 'letters',
    reward: '200 XP + Alphabet Badge',
    completed: false,
    color: 'from-blue-400 to-blue-500',
  },
  {
    id: 'perfect_lesson',
    title: 'Flawless Victory',
    description: 'Complete a lesson with 100% accuracy',
    icon: '⭐',
    category: 'achievement',
    target: 1,
    current: 0,
    unit: 'lesson',
    reward: '500 XP + Perfect Badge',
    completed: false,
    color: 'from-yellow-400 to-yellow-600',
  },
];

// Custom hook for milestones
export function useMilestones() {
  const [milestones, setMilestones] = useState<Milestone[]>(MILESTONES);
  const [showCelebration, setShowCelebration] = useState(false);
  const [completedMilestone, setCompletedMilestone] = useState<Milestone | null>(null);

  const updateProgress = (milestoneId: string, progress: number) => {
    setMilestones((prev) =>
      prev.map((m) => {
        if (m.id === milestoneId && !m.completed) {
          const newCurrent = Math.min(progress, m.target);
          const isCompleted = newCurrent >= m.target;

          if (isCompleted && !m.completed) {
            // Trigger celebration
            const completedM = { ...m, current: newCurrent, completed: true, completedAt: new Date() };
            setCompletedMilestone(completedM);
            setShowCelebration(true);
            setTimeout(() => setShowCelebration(false), 5000);
            return completedM;
          }

          return { ...m, current: newCurrent };
        }
        return m;
      })
    );
  };

  const resetMilestone = (milestoneId: string) => {
    setMilestones((prev) =>
      prev.map((m) =>
        m.id === milestoneId
          ? { ...m, current: 0, completed: false, completedAt: undefined }
          : m
      )
    );
  };

  const resetAll = () => {
    setMilestones(MILESTONES);
  };

  const getByCategory = (category: Milestone['category']) => {
    return milestones.filter((m) => m.category === category);
  };

  const getCompleted = () => {
    return milestones.filter((m) => m.completed);
  };

  const getInProgress = () => {
    return milestones.filter((m) => !m.completed && m.current > 0);
  };

  const getNotStarted = () => {
    return milestones.filter((m) => m.current === 0);
  };

  const getCompletionPercentage = () => {
    const completed = milestones.filter((m) => m.completed).length;
    return Math.round((completed / milestones.length) * 100);
  };

  return {
    milestones,
    updateProgress,
    resetMilestone,
    resetAll,
    getByCategory,
    getCompleted,
    getInProgress,
    getNotStarted,
    getCompletionPercentage,
    showCelebration,
    completedMilestone,
  };
}

// Main milestones component
export default function Milestones() {
  const {
    milestones,
    updateProgress,
    resetMilestone,
    getByCategory,
    getCompleted,
    getInProgress,
    getNotStarted,
    getCompletionPercentage,
    showCelebration,
    completedMilestone,
  } = useMilestones();

  const { settings } = useSettingsStore();
  const [selectedCategory, setSelectedCategory] = useState<Milestone['category'] | 'all'>('all');

  const categories: Array<{ value: Milestone['category'] | 'all'; label: string; icon: string }> = [
    { value: 'all', label: 'All', icon: '📋' },
    { value: 'typing', label: 'Typing', icon: '⌨️' },
    { value: 'accuracy', label: 'Accuracy', icon: '🎯' },
    { value: 'speed', label: 'Speed', icon: '⚡' },
    { value: 'practice', label: 'Practice', icon: '📚' },
    { value: 'achievement', label: 'Achievement', icon: '🏆' },
  ];

  const filteredMilestones =
    selectedCategory === 'all'
      ? milestones
      : getByCategory(selectedCategory);

  const completed = getCompleted();
  const inProgress = getInProgress();
  const notStarted = getNotStarted();

  return (
    <div className="bg-white rounded-2xl shadow-xl p-8">
      <h2 className="text-2xl font-bold text-gray-800 mb-6 text-center">
        Milestones
      </h2>

      {/* Celebration notification */}
      <AnimatePresence>
        {showCelebration && completedMilestone && (
          <motion.div
            initial={{ opacity: 0, scale: 0.5, y: 50 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.5, y: -50 }}
            className="fixed inset-0 flex items-center justify-center z-50 pointer-events-none"
          >
            <div className={`bg-gradient-to-r ${completedMilestone.color} text-white rounded-3xl p-12 shadow-2xl text-center max-w-md`}>
              <motion.div
                animate={{
                  rotate: [0, 360],
                  scale: [1, 1.3, 1],
                }}
                transition={{ duration: 0.8 }}
                className="text-9xl mb-6"
              >
                {completedMilestone.icon}
              </motion.div>
              <div className="text-4xl font-bold mb-4">
                Milestone Complete!
              </div>
              <div className="text-2xl mb-2">{completedMilestone.title}</div>
              <div className="text-xl opacity-90 mb-4">
                {completedMilestone.description}
              </div>
              <div className="text-lg font-bold bg-white bg-opacity-20 rounded-lg py-2 px-4 inline-block">
                Reward: {completedMilestone.reward}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Overall progress */}
      <div className="mb-8 bg-gradient-to-r from-purple-50 to-pink-50 rounded-xl p-6">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-lg font-bold text-gray-900">Overall Progress</h3>
          <div className="text-3xl font-bold text-purple-700">
            {getCompletionPercentage()}%
          </div>
        </div>

        <div className="h-4 bg-gray-200 rounded-full overflow-hidden mb-4">
          <motion.div
            animate={{ width: `${getCompletionPercentage()}%` }}
            className="h-full bg-gradient-to-r from-purple-500 to-pink-500"
            transition={{ duration: 0.5 }}
          />
        </div>

        <div className="grid grid-cols-3 gap-3 text-center">
          <div className="bg-white rounded-lg p-3">
            <div className="text-2xl font-bold text-green-600">{completed.length}</div>
            <div className="text-xs text-gray-600">Completed</div>
          </div>
          <div className="bg-white rounded-lg p-3">
            <div className="text-2xl font-bold text-blue-600">{inProgress.length}</div>
            <div className="text-xs text-gray-600">In Progress</div>
          </div>
          <div className="bg-white rounded-lg p-3">
            <div className="text-2xl font-bold text-gray-600">{notStarted.length}</div>
            <div className="text-xs text-gray-600">Not Started</div>
          </div>
        </div>
      </div>

      {/* Category filter */}
      <div className="mb-6">
        <label className="block text-sm font-bold text-gray-700 mb-3">
          Filter by Category:
        </label>
        <div className="flex flex-wrap gap-2">
          {categories.map(({ value, label, icon }) => (
            <button
              key={value}
              onClick={() => setSelectedCategory(value)}
              className={`px-4 py-2 rounded-lg font-medium transition-all ${
                selectedCategory === value
                  ? 'bg-primary-500 text-white shadow-lg'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {icon} {label}
            </button>
          ))}
        </div>
      </div>

      {/* Milestones list */}
      <div className="space-y-4">
        {filteredMilestones.map((milestone, index) => (
          <MilestoneCard
            key={milestone.id}
            milestone={milestone}
            index={index}
            onTest={(progress) => updateProgress(milestone.id, progress)}
            onReset={() => resetMilestone(milestone.id)}
            settings={settings}
          />
        ))}
      </div>

      {filteredMilestones.length === 0 && (
        <div className="text-center text-gray-500 py-12">
          No milestones in this category
        </div>
      )}

      <div className="mt-8 bg-blue-50 rounded-xl p-6">
        <h3 className="text-lg font-bold text-blue-900 mb-3">
          About Milestones
        </h3>
        <ul className="space-y-2 text-sm text-blue-800">
          <li>• Track your progress across different categories</li>
          <li>• Complete milestones to earn rewards</li>
          <li>• Milestones are automatically updated as you practice</li>
          <li>• Each completed milestone gives XP and badges</li>
          <li>• Challenge yourself to complete them all!</li>
        </ul>
      </div>
    </div>
  );
}

// Milestone card component
function MilestoneCard({
  milestone,
  index,
  onTest,
  onReset,
  settings,
}: {
  milestone: Milestone;
  index: number;
  onTest: (progress: number) => void;
  onReset: () => void;
  settings: any;
}) {
  const progress = (milestone.current / milestone.target) * 100;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: settings.reducedMotion ? 0 : index * 0.05 }}
      className={`rounded-xl p-6 transition-all ${
        milestone.completed
          ? `bg-gradient-to-r ${milestone.color} text-white shadow-lg`
          : 'bg-gray-50'
      }`}
    >
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-start gap-4 flex-1">
          <div className="text-5xl">{milestone.icon}</div>
          <div className="flex-1">
            <div className={`font-bold text-lg mb-1 ${
              milestone.completed ? 'text-white' : 'text-gray-900'
            }`}>
              {milestone.title}
              {milestone.completed && ' ✓'}
            </div>
            <div className={`text-sm mb-2 ${
              milestone.completed ? 'text-white opacity-90' : 'text-gray-600'
            }`}>
              {milestone.description}
            </div>
            <div className={`text-sm font-medium ${
              milestone.completed ? 'text-white opacity-80' : 'text-gray-700'
            }`}>
              {milestone.current} / {milestone.target} {milestone.unit}
            </div>
          </div>
        </div>

        <div className={`px-3 py-1 rounded-lg text-sm font-bold ${
          milestone.completed
            ? 'bg-white bg-opacity-30 text-white'
            : 'bg-purple-100 text-purple-700'
        }`}>
          {milestone.reward}
        </div>
      </div>

      {!milestone.completed && (
        <div className="mb-4">
          <div className="h-3 bg-gray-200 rounded-full overflow-hidden">
            <motion.div
              animate={{ width: `${progress}%` }}
              className={`h-full bg-gradient-to-r ${milestone.color}`}
              transition={{ duration: 0.5 }}
            />
          </div>
          <div className="text-right text-xs text-gray-600 mt-1">
            {Math.round(progress)}%
          </div>
        </div>
      )}

      {milestone.completed && milestone.completedAt && (
        <div className="text-sm text-white opacity-80 mb-3">
          Completed on {milestone.completedAt.toLocaleDateString()}
        </div>
      )}

      {/* Test controls (for demo purposes) */}
      {!milestone.completed && (
        <div className="flex gap-2">
          <button
            onClick={() => onTest(milestone.current + Math.floor(milestone.target / 10))}
            className="flex-1 py-2 bg-green-500 text-white rounded-lg font-bold text-sm hover:bg-green-600 transition-colors"
          >
            + Progress
          </button>
          <button
            onClick={() => onTest(milestone.target)}
            className="flex-1 py-2 bg-blue-500 text-white rounded-lg font-bold text-sm hover:bg-blue-600 transition-colors"
          >
            Complete
          </button>
          {milestone.current > 0 && (
            <button
              onClick={onReset}
              className="px-4 py-2 bg-red-100 text-red-700 rounded-lg font-bold text-sm hover:bg-red-200 transition-colors"
            >
              Reset
            </button>
          )}
        </div>
      )}
    </motion.div>
  );
}

// Milestone progress indicator (compact)
export function MilestoneProgress({ milestone }: { milestone: Milestone }) {
  const progress = (milestone.current / milestone.target) * 100;

  return (
    <div className="bg-white rounded-lg shadow-md p-4">
      <div className="flex items-center gap-3 mb-2">
        <div className="text-2xl">{milestone.icon}</div>
        <div className="flex-1">
          <div className="font-bold text-sm text-gray-900">{milestone.title}</div>
          <div className="text-xs text-gray-600">
            {milestone.current} / {milestone.target} {milestone.unit}
          </div>
        </div>
      </div>
      <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
        <motion.div
          animate={{ width: `${progress}%` }}
          className={`h-full bg-gradient-to-r ${milestone.color}`}
        />
      </div>
    </div>
  );
}
