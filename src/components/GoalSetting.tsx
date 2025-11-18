/**
 * Goal Setting Component
 * Step 255 - Create goal setting and management system
 */

import { motion } from 'framer-motion';
import { useState } from 'react';
import { useSettingsStore } from '../store/useSettingsStore';

// Goal category
export type GoalCategory = 'speed' | 'accuracy' | 'consistency' | 'time' | 'lessons' | 'custom';

// Goal type
export type GoalType = 'daily' | 'weekly' | 'monthly' | 'long-term';

// Goal difficulty
export type GoalDifficulty = 'easy' | 'medium' | 'hard' | 'expert';

// Goal status
export type GoalStatus = 'active' | 'completed' | 'paused' | 'failed';

// Goal interface
export interface Goal {
  id: string;
  title: string;
  description: string;
  category: GoalCategory;
  type: GoalType;
  difficulty: GoalDifficulty;
  status: GoalStatus;
  target: number;
  current: number;
  unit: string;
  startDate: Date;
  deadline: Date;
  progress: number;
  reward: string;
  icon: string;
}

// Goal template
export interface GoalTemplate {
  id: string;
  title: string;
  description: string;
  category: GoalCategory;
  type: GoalType;
  difficulty: GoalDifficulty;
  target: number;
  unit: string;
  duration: number; // days
  icon: string;
  popular: boolean;
}

// New goal form data
export interface NewGoalData {
  title: string;
  description: string;
  category: GoalCategory;
  type: GoalType;
  difficulty: GoalDifficulty;
  target: number;
  unit: string;
  deadline: Date;
}

// Mock existing goals
const generateMockGoals = (): Goal[] => {
  const now = Date.now();
  return [
    {
      id: 'goal-1',
      title: 'Reach 80 WPM',
      description: 'Improve typing speed to 80 words per minute',
      category: 'speed',
      type: 'monthly',
      difficulty: 'medium',
      status: 'active',
      target: 80,
      current: 72,
      unit: 'WPM',
      startDate: new Date(now - 14 * 24 * 60 * 60 * 1000),
      deadline: new Date(now + 16 * 24 * 60 * 60 * 1000),
      progress: 90,
      reward: 'Speed Master Badge',
      icon: '⚡',
    },
    {
      id: 'goal-2',
      title: '95% Accuracy',
      description: 'Achieve 95% accuracy or higher',
      category: 'accuracy',
      type: 'weekly',
      difficulty: 'easy',
      status: 'active',
      target: 95,
      current: 94.5,
      unit: '%',
      startDate: new Date(now - 5 * 24 * 60 * 60 * 1000),
      deadline: new Date(now + 2 * 24 * 60 * 60 * 1000),
      progress: 99,
      reward: 'Accuracy Star',
      icon: '🎯',
    },
    {
      id: 'goal-3',
      title: 'Practice Daily',
      description: 'Practice typing every day for a week',
      category: 'time',
      type: 'weekly',
      difficulty: 'easy',
      status: 'active',
      target: 7,
      current: 5,
      unit: 'days',
      startDate: new Date(now - 5 * 24 * 60 * 60 * 1000),
      deadline: new Date(now + 2 * 24 * 60 * 60 * 1000),
      progress: 71,
      reward: 'Dedicated Typist',
      icon: '🔥',
    },
    {
      id: 'goal-4',
      title: '50 WPM Milestone',
      description: 'Reached 50 words per minute',
      category: 'speed',
      type: 'long-term',
      difficulty: 'easy',
      status: 'completed',
      target: 50,
      current: 72,
      unit: 'WPM',
      startDate: new Date(now - 60 * 24 * 60 * 60 * 1000),
      deadline: new Date(now - 30 * 24 * 60 * 60 * 1000),
      progress: 100,
      reward: 'Speed Novice Badge',
      icon: '⚡',
    },
  ];
};

// Mock goal templates
const generateMockTemplates = (): GoalTemplate[] => {
  return [
    {
      id: 'template-1',
      title: 'Speed Boost',
      description: 'Increase typing speed by 10 WPM',
      category: 'speed',
      type: 'monthly',
      difficulty: 'medium',
      target: 10,
      unit: 'WPM increase',
      duration: 30,
      icon: '⚡',
      popular: true,
    },
    {
      id: 'template-2',
      title: 'Perfect Week',
      description: 'Achieve 98%+ accuracy for 7 days',
      category: 'accuracy',
      type: 'weekly',
      difficulty: 'hard',
      target: 98,
      unit: '% accuracy',
      duration: 7,
      icon: '🎯',
      popular: true,
    },
    {
      id: 'template-3',
      title: 'Daily Dedication',
      description: 'Practice for 15 minutes every day',
      category: 'time',
      type: 'monthly',
      difficulty: 'easy',
      target: 30,
      unit: 'days',
      duration: 30,
      icon: '⏱️',
      popular: true,
    },
    {
      id: 'template-4',
      title: 'Lesson Master',
      description: 'Complete 20 lessons',
      category: 'lessons',
      type: 'monthly',
      difficulty: 'medium',
      target: 20,
      unit: 'lessons',
      duration: 30,
      icon: '📚',
      popular: false,
    },
    {
      id: 'template-5',
      title: 'Consistency Champion',
      description: 'Maintain 85%+ consistency score',
      category: 'consistency',
      type: 'weekly',
      difficulty: 'medium',
      target: 85,
      unit: '% consistency',
      duration: 7,
      icon: '📊',
      popular: false,
    },
  ];
};

// Custom hook for goal setting
export function useGoalSetting() {
  const [goals, setGoals] = useState<Goal[]>(generateMockGoals());
  const [templates] = useState<GoalTemplate[]>(generateMockTemplates());
  const [showNewGoalForm, setShowNewGoalForm] = useState(false);
  const [filterStatus, setFilterStatus] = useState<GoalStatus | 'all'>('all');
  const [selectedTemplate, setSelectedTemplate] = useState<string | null>(null);

  const [newGoal, setNewGoal] = useState<NewGoalData>({
    title: '',
    description: '',
    category: 'speed',
    type: 'weekly',
    difficulty: 'medium',
    target: 0,
    unit: 'WPM',
    deadline: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
  });

  const getFilteredGoals = () => {
    if (filterStatus === 'all') return goals;
    return goals.filter((goal) => goal.status === filterStatus);
  };

  const getActiveGoalsCount = () => {
    return goals.filter((goal) => goal.status === 'active').length;
  };

  const getCompletedGoalsCount = () => {
    return goals.filter((goal) => goal.status === 'completed').length;
  };

  const handleCreateGoal = () => {
    const newGoalItem: Goal = {
      id: `goal-${Date.now()}`,
      ...newGoal,
      status: 'active',
      current: 0,
      startDate: new Date(),
      progress: 0,
      reward: '🏆 Achievement Unlocked',
      icon: getCategoryIcon(newGoal.category),
    };

    setGoals([newGoalItem, ...goals]);
    setShowNewGoalForm(false);
    resetNewGoalForm();
  };

  const resetNewGoalForm = () => {
    setNewGoal({
      title: '',
      description: '',
      category: 'speed',
      type: 'weekly',
      difficulty: 'medium',
      target: 0,
      unit: 'WPM',
      deadline: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
    });
    setSelectedTemplate(null);
  };

  const loadTemplate = (template: GoalTemplate) => {
    setNewGoal({
      title: template.title,
      description: template.description,
      category: template.category,
      type: template.type,
      difficulty: template.difficulty,
      target: template.target,
      unit: template.unit,
      deadline: new Date(Date.now() + template.duration * 24 * 60 * 60 * 1000),
    });
    setSelectedTemplate(template.id);
  };

  const updateGoalStatus = (goalId: string, status: GoalStatus) => {
    setGoals(goals.map((goal) =>
      goal.id === goalId ? { ...goal, status } : goal
    ));
  };

  return {
    goals: getFilteredGoals(),
    allGoals: goals,
    templates,
    showNewGoalForm,
    setShowNewGoalForm,
    filterStatus,
    setFilterStatus,
    selectedTemplate,
    newGoal,
    setNewGoal,
    activeGoalsCount: getActiveGoalsCount(),
    completedGoalsCount: getCompletedGoalsCount(),
    handleCreateGoal,
    loadTemplate,
    updateGoalStatus,
    resetNewGoalForm,
  };
}

// Get category icon
const getCategoryIcon = (category: GoalCategory): string => {
  switch (category) {
    case 'speed': return '⚡';
    case 'accuracy': return '🎯';
    case 'consistency': return '📊';
    case 'time': return '⏱️';
    case 'lessons': return '📚';
    case 'custom': return '✨';
  }
};

// Get difficulty color
const getDifficultyColor = (difficulty: GoalDifficulty): string => {
  switch (difficulty) {
    case 'easy': return 'bg-green-100 text-green-700';
    case 'medium': return 'bg-yellow-100 text-yellow-700';
    case 'hard': return 'bg-orange-100 text-orange-700';
    case 'expert': return 'bg-red-100 text-red-700';
  }
};

// Main goal setting component
export default function GoalSetting() {
  const {
    goals,
    templates,
    showNewGoalForm,
    setShowNewGoalForm,
    filterStatus,
    setFilterStatus,
    selectedTemplate,
    newGoal,
    setNewGoal,
    activeGoalsCount,
    completedGoalsCount,
    handleCreateGoal,
    loadTemplate,
    updateGoalStatus,
    resetNewGoalForm,
  } = useGoalSetting();

  const { settings } = useSettingsStore();

  return (
    <div className="bg-white rounded-2xl shadow-xl p-8">
      <h2 className="text-2xl font-bold text-gray-800 mb-6 text-center">
        🎯 Goal Setting
      </h2>

      {/* Summary */}
      <div className="mb-8 grid grid-cols-2 md:grid-cols-3 gap-4">
        <div className="bg-gradient-to-br from-blue-400 to-blue-600 rounded-xl p-4 text-white">
          <div className="text-sm opacity-90 mb-1">Active Goals</div>
          <div className="text-3xl font-bold">{activeGoalsCount}</div>
        </div>
        <div className="bg-gradient-to-br from-green-400 to-green-600 rounded-xl p-4 text-white">
          <div className="text-sm opacity-90 mb-1">Completed</div>
          <div className="text-3xl font-bold">{completedGoalsCount}</div>
        </div>
        <div className="col-span-2 md:col-span-1">
          <button
            onClick={() => setShowNewGoalForm(true)}
            className="w-full h-full bg-gradient-to-br from-purple-400 to-purple-600 rounded-xl p-4 text-white font-bold text-lg hover:from-purple-500 hover:to-purple-700 transition-all"
          >
            + New Goal
          </button>
        </div>
      </div>

      {/* New goal form */}
      {showNewGoalForm && (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8 bg-gray-50 rounded-xl p-6"
        >
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-bold text-gray-900">Create New Goal</h3>
            <button
              onClick={() => {
                setShowNewGoalForm(false);
                resetNewGoalForm();
              }}
              className="text-gray-500 hover:text-gray-700 text-2xl"
            >
              ×
            </button>
          </div>

          {/* Templates */}
          <div className="mb-6">
            <div className="text-sm font-bold text-gray-700 mb-3">Popular Templates</div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
              {templates.filter((t) => t.popular).map((template) => (
                <button
                  key={template.id}
                  onClick={() => loadTemplate(template)}
                  className={`text-left p-3 rounded-lg transition-colors ${
                    selectedTemplate === template.id
                      ? 'bg-purple-500 text-white'
                      : 'bg-white hover:bg-gray-100'
                  }`}
                >
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-xl">{template.icon}</span>
                    <span className="font-bold text-sm">{template.title}</span>
                  </div>
                  <div className={`text-xs ${
                    selectedTemplate === template.id ? 'opacity-90' : 'text-gray-600'
                  }`}>
                    {template.description}
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Form fields */}
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-bold text-gray-700 block mb-2">Goal Title</label>
                <input
                  type="text"
                  value={newGoal.title}
                  onChange={(e) => setNewGoal({ ...newGoal, title: e.target.value })}
                  className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:border-purple-500 focus:outline-none"
                  placeholder="Enter goal title"
                />
              </div>

              <div>
                <label className="text-sm font-bold text-gray-700 block mb-2">Category</label>
                <select
                  value={newGoal.category}
                  onChange={(e) => setNewGoal({ ...newGoal, category: e.target.value as GoalCategory })}
                  className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:border-purple-500 focus:outline-none"
                >
                  <option value="speed">Speed</option>
                  <option value="accuracy">Accuracy</option>
                  <option value="consistency">Consistency</option>
                  <option value="time">Practice Time</option>
                  <option value="lessons">Lessons</option>
                  <option value="custom">Custom</option>
                </select>
              </div>
            </div>

            <div>
              <label className="text-sm font-bold text-gray-700 block mb-2">Description</label>
              <textarea
                value={newGoal.description}
                onChange={(e) => setNewGoal({ ...newGoal, description: e.target.value })}
                className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:border-purple-500 focus:outline-none"
                placeholder="Describe your goal"
                rows={2}
              />
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div>
                <label className="text-sm font-bold text-gray-700 block mb-2">Target</label>
                <input
                  type="number"
                  value={newGoal.target || ''}
                  onChange={(e) => setNewGoal({ ...newGoal, target: Number(e.target.value) })}
                  className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:border-purple-500 focus:outline-none"
                  placeholder="0"
                />
              </div>

              <div>
                <label className="text-sm font-bold text-gray-700 block mb-2">Unit</label>
                <input
                  type="text"
                  value={newGoal.unit}
                  onChange={(e) => setNewGoal({ ...newGoal, unit: e.target.value })}
                  className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:border-purple-500 focus:outline-none"
                  placeholder="WPM"
                />
              </div>

              <div>
                <label className="text-sm font-bold text-gray-700 block mb-2">Type</label>
                <select
                  value={newGoal.type}
                  onChange={(e) => setNewGoal({ ...newGoal, type: e.target.value as GoalType })}
                  className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:border-purple-500 focus:outline-none"
                >
                  <option value="daily">Daily</option>
                  <option value="weekly">Weekly</option>
                  <option value="monthly">Monthly</option>
                  <option value="long-term">Long-term</option>
                </select>
              </div>

              <div>
                <label className="text-sm font-bold text-gray-700 block mb-2">Difficulty</label>
                <select
                  value={newGoal.difficulty}
                  onChange={(e) => setNewGoal({ ...newGoal, difficulty: e.target.value as GoalDifficulty })}
                  className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:border-purple-500 focus:outline-none"
                >
                  <option value="easy">Easy</option>
                  <option value="medium">Medium</option>
                  <option value="hard">Hard</option>
                  <option value="expert">Expert</option>
                </select>
              </div>
            </div>

            <div className="flex gap-3">
              <button
                onClick={handleCreateGoal}
                disabled={!newGoal.title || !newGoal.target}
                className="flex-1 px-6 py-3 bg-purple-500 text-white rounded-lg font-bold hover:bg-purple-600 transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed"
              >
                Create Goal
              </button>
              <button
                onClick={() => {
                  setShowNewGoalForm(false);
                  resetNewGoalForm();
                }}
                className="px-6 py-3 bg-gray-200 text-gray-700 rounded-lg font-bold hover:bg-gray-300 transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        </motion.div>
      )}

      {/* Filter */}
      <div className="mb-6 flex gap-2">
        {[
          { status: 'all' as const, label: 'All Goals' },
          { status: 'active' as const, label: 'Active' },
          { status: 'completed' as const, label: 'Completed' },
          { status: 'paused' as const, label: 'Paused' },
        ].map(({ status, label }) => (
          <button
            key={status}
            onClick={() => setFilterStatus(status)}
            className={`px-4 py-2 rounded-lg font-bold transition-colors ${
              filterStatus === status
                ? 'bg-purple-500 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      {/* Goals list */}
      <div className="space-y-4">
        {goals.map((goal, index) => (
          <motion.div
            key={goal.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: settings.reducedMotion ? 0 : index * 0.05 }}
            className={`rounded-xl p-6 ${
              goal.status === 'completed' ? 'bg-green-50' :
              goal.status === 'paused' ? 'bg-gray-50' :
              'bg-blue-50'
            }`}
          >
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-start gap-4">
                <div className="text-4xl">{goal.icon}</div>
                <div>
                  <div className="font-bold text-gray-900 text-lg">{goal.title}</div>
                  <div className="text-sm text-gray-600 mb-2">{goal.description}</div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="px-2 py-1 bg-white rounded text-xs font-bold capitalize">
                      {goal.type}
                    </span>
                    <span className={`px-2 py-1 rounded text-xs font-bold capitalize ${getDifficultyColor(goal.difficulty)}`}>
                      {goal.difficulty}
                    </span>
                    <span className="px-2 py-1 bg-purple-100 text-purple-700 rounded text-xs font-bold capitalize">
                      {goal.category}
                    </span>
                  </div>
                </div>
              </div>
              <div className="text-right">
                <div className="text-3xl font-bold text-purple-600">{goal.progress}%</div>
                <div className="text-sm text-gray-600">
                  {goal.current} / {goal.target} {goal.unit}
                </div>
              </div>
            </div>

            <div className="mb-4">
              <div className="h-3 bg-gray-200 rounded-full overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${goal.progress}%` }}
                  transition={{ duration: settings.reducedMotion ? 0 : 1, delay: index * 0.05 }}
                  className={`h-full ${
                    goal.status === 'completed' ? 'bg-gradient-to-r from-green-400 to-green-600' :
                    goal.status === 'paused' ? 'bg-gradient-to-r from-gray-400 to-gray-600' :
                    'bg-gradient-to-r from-blue-400 to-purple-600'
                  }`}
                />
              </div>
            </div>

            <div className="flex items-center justify-between">
              <div className="text-sm text-gray-600">
                {goal.status === 'completed' ? (
                  <span className="text-green-600 font-bold">✓ Completed • Reward: {goal.reward}</span>
                ) : (
                  <>
                    Deadline: {goal.deadline.toLocaleDateString()} •
                    {' '}{Math.ceil((goal.deadline.getTime() - Date.now()) / (24 * 60 * 60 * 1000))} days left
                  </>
                )}
              </div>
              {goal.status === 'active' && (
                <div className="flex gap-2">
                  <button
                    onClick={() => updateGoalStatus(goal.id, 'paused')}
                    className="px-3 py-1 bg-gray-200 text-gray-700 rounded text-sm font-bold hover:bg-gray-300"
                  >
                    Pause
                  </button>
                  <button
                    onClick={() => updateGoalStatus(goal.id, 'completed')}
                    className="px-3 py-1 bg-green-500 text-white rounded text-sm font-bold hover:bg-green-600"
                  >
                    Mark Complete
                  </button>
                </div>
              )}
              {goal.status === 'paused' && (
                <button
                  onClick={() => updateGoalStatus(goal.id, 'active')}
                  className="px-3 py-1 bg-blue-500 text-white rounded text-sm font-bold hover:bg-blue-600"
                >
                  Resume
                </button>
              )}
            </div>
          </motion.div>
        ))}
      </div>

      {goals.length === 0 && (
        <div className="text-center py-12 text-gray-500">
          No goals found. Create your first goal to get started!
        </div>
      )}
    </div>
  );
}
