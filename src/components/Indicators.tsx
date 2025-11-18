import { useState } from 'react';
import { motion } from 'framer-motion';

// Types
export type IndicatorType =
  | 'progress'
  | 'skill'
  | 'streak'
  | 'achievement'
  | 'goal'
  | 'level';

export type IndicatorStyle = 'bar' | 'circle' | 'ring' | 'dots' | 'steps';

export type IndicatorSize = 'small' | 'medium' | 'large';

export interface ProgressIndicator {
  id: string;
  type: IndicatorType;
  label: string;
  current: number;
  target: number;
  unit?: string;
  color: string;
  icon?: string;
  showPercentage: boolean;
  showValue: boolean;
  animated: boolean;
}

export interface SkillIndicator {
  id: string;
  skill: string;
  level: number; // 0-5
  maxLevel: number;
  experience: number;
  nextLevelExp: number;
  color: string;
  description?: string;
}

export interface StreakIndicator {
  id: string;
  currentStreak: number;
  longestStreak: number;
  target: number;
  lastActivityDate: Date;
  active: boolean;
}

export interface AchievementIndicator {
  id: string;
  name: string;
  description: string;
  current: number;
  target: number;
  completed: boolean;
  tier: 'bronze' | 'silver' | 'gold' | 'platinum';
  icon: string;
}

export interface GoalIndicator {
  id: string;
  goal: string;
  progress: number; // 0-100
  deadline?: Date;
  status: 'on-track' | 'at-risk' | 'behind';
}

export interface LevelIndicator {
  id: string;
  currentLevel: number;
  currentExp: number;
  nextLevelExp: number;
  totalExp: number;
  title: string;
}

// Mock data generators
function generateProgressIndicators(): ProgressIndicator[] {
  return [
    {
      id: 'prog-1',
      type: 'progress',
      label: 'Daily Goal',
      current: 15,
      target: 20,
      unit: 'min',
      color: 'blue',
      showPercentage: true,
      showValue: true,
      animated: true,
    },
    {
      id: 'prog-2',
      type: 'progress',
      label: 'Weekly Lessons',
      current: 8,
      target: 10,
      unit: 'lessons',
      color: 'green',
      showPercentage: true,
      showValue: true,
      animated: true,
    },
    {
      id: 'prog-3',
      type: 'progress',
      label: 'Accuracy Goal',
      current: 92,
      target: 95,
      unit: '%',
      color: 'purple',
      showPercentage: false,
      showValue: true,
      animated: true,
    },
    {
      id: 'prog-4',
      type: 'progress',
      label: 'Speed Target',
      current: 38,
      target: 50,
      unit: 'WPM',
      color: 'orange',
      showPercentage: true,
      showValue: true,
      animated: true,
    },
  ];
}

function generateSkillIndicators(): SkillIndicator[] {
  return [
    {
      id: 'skill-1',
      skill: 'Home Row',
      level: 4,
      maxLevel: 5,
      experience: 750,
      nextLevelExp: 1000,
      color: 'blue',
      description: 'Master of ASDF JKL;',
    },
    {
      id: 'skill-2',
      skill: 'Top Row',
      level: 3,
      maxLevel: 5,
      experience: 420,
      nextLevelExp: 600,
      color: 'green',
      description: 'Getting better at numbers',
    },
    {
      id: 'skill-3',
      skill: 'Bottom Row',
      level: 2,
      maxLevel: 5,
      experience: 180,
      nextLevelExp: 300,
      color: 'purple',
      description: 'Learning ZXCV BNM',
    },
    {
      id: 'skill-4',
      skill: 'Special Characters',
      level: 1,
      maxLevel: 5,
      experience: 50,
      nextLevelExp: 150,
      color: 'orange',
      description: 'Just getting started',
    },
  ];
}

function generateStreakIndicator(): StreakIndicator {
  return {
    id: 'streak-1',
    currentStreak: 7,
    longestStreak: 14,
    target: 10,
    lastActivityDate: new Date(),
    active: true,
  };
}

function generateAchievementIndicators(): AchievementIndicator[] {
  return [
    {
      id: 'ach-1',
      name: 'Speed Demon',
      description: 'Type at 50 WPM',
      current: 38,
      target: 50,
      completed: false,
      tier: 'gold',
      icon: '⚡',
    },
    {
      id: 'ach-2',
      name: 'Perfect Practice',
      description: 'Complete 10 lessons with 100% accuracy',
      current: 6,
      target: 10,
      completed: false,
      tier: 'silver',
      icon: '🎯',
    },
    {
      id: 'ach-3',
      name: 'Dedicated Learner',
      description: 'Practice for 7 days in a row',
      current: 7,
      target: 7,
      completed: true,
      tier: 'bronze',
      icon: '🔥',
    },
    {
      id: 'ach-4',
      name: 'Master Typist',
      description: 'Reach level 10',
      current: 5,
      target: 10,
      completed: false,
      tier: 'platinum',
      icon: '👑',
    },
  ];
}

function generateGoalIndicators(): GoalIndicator[] {
  return [
    {
      id: 'goal-1',
      goal: 'Reach 45 WPM',
      progress: 76,
      deadline: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      status: 'on-track',
    },
    {
      id: 'goal-2',
      goal: 'Complete 20 lessons',
      progress: 85,
      deadline: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000),
      status: 'on-track',
    },
    {
      id: 'goal-3',
      goal: 'Improve accuracy to 98%',
      progress: 40,
      deadline: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000),
      status: 'at-risk',
    },
  ];
}

function generateLevelIndicator(): LevelIndicator {
  return {
    id: 'level-1',
    currentLevel: 5,
    currentExp: 350,
    nextLevelExp: 500,
    totalExp: 2350,
    title: 'Skilled Typist',
  };
}

// Custom hook
function useIndicators() {
  const [progressIndicators] = useState<ProgressIndicator[]>(
    generateProgressIndicators()
  );
  const [skillIndicators] = useState<SkillIndicator[]>(
    generateSkillIndicators()
  );
  const [streakIndicator] = useState<StreakIndicator>(
    generateStreakIndicator()
  );
  const [achievementIndicators] = useState<AchievementIndicator[]>(
    generateAchievementIndicators()
  );
  const [goalIndicators] = useState<GoalIndicator[]>(
    generateGoalIndicators()
  );
  const [levelIndicator] = useState<LevelIndicator>(
    generateLevelIndicator()
  );
  const [indicatorStyle, setIndicatorStyle] = useState<IndicatorStyle>('bar');
  const [indicatorSize, setIndicatorSize] = useState<IndicatorSize>('medium');

  return {
    progressIndicators,
    skillIndicators,
    streakIndicator,
    achievementIndicators,
    goalIndicators,
    levelIndicator,
    indicatorStyle,
    setIndicatorStyle,
    indicatorSize,
    setIndicatorSize,
  };
}

// Component for progress bar
function ProgressBar({
  indicator,
  size,
}: {
  indicator: ProgressIndicator;
  size: IndicatorSize;
}) {
  const percentage = Math.min((indicator.current / indicator.target) * 100, 100);
  const heightClass = size === 'small' ? 'h-2' : size === 'medium' ? 'h-4' : 'h-6';

  return (
    <div className="space-y-2">
      <div className="flex justify-between items-center">
        <span className="font-medium">{indicator.label}</span>
        {indicator.showValue && (
          <span className="text-sm text-gray-600">
            {indicator.current}/{indicator.target} {indicator.unit}
          </span>
        )}
      </div>
      <div className={`bg-gray-200 rounded-full overflow-hidden ${heightClass}`}>
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${percentage}%` }}
          transition={{ duration: indicator.animated ? 1 : 0, ease: 'easeOut' }}
          className={`h-full bg-${indicator.color}-500 rounded-full`}
          style={{ backgroundColor: getColorValue(indicator.color) }}
        />
      </div>
      {indicator.showPercentage && (
        <div className="text-right text-sm text-gray-600">{percentage.toFixed(0)}%</div>
      )}
    </div>
  );
}

// Component for circular progress
function CircularProgress({
  indicator,
  size,
}: {
  indicator: ProgressIndicator;
  size: IndicatorSize;
}) {
  const percentage = Math.min((indicator.current / indicator.target) * 100, 100);
  const sizeValue = size === 'small' ? 60 : size === 'medium' ? 100 : 140;
  const strokeWidth = size === 'small' ? 4 : size === 'medium' ? 6 : 8;
  const radius = (sizeValue - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (percentage / 100) * circumference;

  return (
    <div className="flex flex-col items-center gap-2">
      <div className="relative" style={{ width: sizeValue, height: sizeValue }}>
        <svg width={sizeValue} height={sizeValue}>
          {/* Background circle */}
          <circle
            cx={sizeValue / 2}
            cy={sizeValue / 2}
            r={radius}
            fill="none"
            stroke="#e5e7eb"
            strokeWidth={strokeWidth}
          />
          {/* Progress circle */}
          <motion.circle
            cx={sizeValue / 2}
            cy={sizeValue / 2}
            r={radius}
            fill="none"
            stroke={getColorValue(indicator.color)}
            strokeWidth={strokeWidth}
            strokeLinecap="round"
            strokeDasharray={circumference}
            initial={{ strokeDashoffset: circumference }}
            animate={{ strokeDashoffset: offset }}
            transition={{ duration: indicator.animated ? 1 : 0, ease: 'easeOut' }}
            transform={`rotate(-90 ${sizeValue / 2} ${sizeValue / 2})`}
          />
        </svg>
        <div className="absolute inset-0 flex items-center justify-center flex-col">
          <div className="text-2xl font-bold">{percentage.toFixed(0)}%</div>
          {indicator.showValue && (
            <div className="text-xs text-gray-600">
              {indicator.current}/{indicator.target}
            </div>
          )}
        </div>
      </div>
      <div className="text-sm font-medium text-center">{indicator.label}</div>
    </div>
  );
}

// Helper function to get color values
function getColorValue(color: string): string {
  const colorMap: Record<string, string> = {
    blue: '#3b82f6',
    green: '#10b981',
    purple: '#a855f7',
    orange: '#f97316',
    red: '#ef4444',
    yellow: '#eab308',
    pink: '#ec4899',
    indigo: '#6366f1',
  };
  return colorMap[color] || '#3b82f6';
}

// Helper function to get tier color
function getTierColor(tier: string): string {
  const tierMap: Record<string, string> = {
    bronze: '#cd7f32',
    silver: '#c0c0c0',
    gold: '#ffd700',
    platinum: '#e5e4e2',
  };
  return tierMap[tier] || '#cd7f32';
}

// Main component
export default function Indicators() {
  const {
    progressIndicators,
    skillIndicators,
    streakIndicator,
    achievementIndicators,
    goalIndicators,
    levelIndicator,
    indicatorStyle,
    setIndicatorStyle,
    indicatorSize,
    setIndicatorSize,
  } = useIndicators();

  const [activeTab, setActiveTab] = useState<
    'progress' | 'skills' | 'streak' | 'achievements' | 'goals' | 'level'
  >('progress');

  return (
    <div className="max-w-6xl mx-auto p-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Progress Indicators</h1>
        <p className="text-gray-600">
          Visual indicators to track your progress and achievements
        </p>
      </div>

      {/* Controls */}
      <div className="bg-white p-4 rounded-lg border mb-6 flex gap-4 flex-wrap items-center">
        <div>
          <label className="text-sm text-gray-600 mb-1 block">Style</label>
          <select
            value={indicatorStyle}
            onChange={(e) => setIndicatorStyle(e.target.value as IndicatorStyle)}
            className="border rounded px-3 py-2"
          >
            <option value="bar">Bar</option>
            <option value="circle">Circle</option>
            <option value="ring">Ring</option>
            <option value="dots">Dots</option>
            <option value="steps">Steps</option>
          </select>
        </div>

        <div>
          <label className="text-sm text-gray-600 mb-1 block">Size</label>
          <select
            value={indicatorSize}
            onChange={(e) => setIndicatorSize(e.target.value as IndicatorSize)}
            className="border rounded px-3 py-2"
          >
            <option value="small">Small</option>
            <option value="medium">Medium</option>
            <option value="large">Large</option>
          </select>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 mb-6 border-b overflow-x-auto">
        {(['progress', 'skills', 'streak', 'achievements', 'goals', 'level'] as const).map(
          (tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-6 py-3 font-medium transition-colors border-b-2 -mb-px whitespace-nowrap ${
                activeTab === tab
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              {tab.charAt(0).toUpperCase() + tab.slice(1)}
            </button>
          )
        )}
      </div>

      {/* Progress Tab */}
      {activeTab === 'progress' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {progressIndicators.map((indicator) => (
            <div key={indicator.id} className="bg-white p-6 rounded-lg border">
              {indicatorStyle === 'bar' ? (
                <ProgressBar indicator={indicator} size={indicatorSize} />
              ) : (
                <CircularProgress indicator={indicator} size={indicatorSize} />
              )}
            </div>
          ))}
        </div>
      )}

      {/* Skills Tab */}
      {activeTab === 'skills' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {skillIndicators.map((skill) => (
            <div key={skill.id} className="bg-white p-6 rounded-lg border">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="text-lg font-semibold">{skill.skill}</h3>
                  {skill.description && (
                    <p className="text-sm text-gray-600">{skill.description}</p>
                  )}
                </div>
                <div className="text-right">
                  <div className="text-2xl font-bold">
                    Lv {skill.level}
                  </div>
                  <div className="text-xs text-gray-500">
                    Max {skill.maxLevel}
                  </div>
                </div>
              </div>

              {/* Level stars */}
              <div className="flex gap-1 mb-4">
                {Array.from({ length: skill.maxLevel }).map((_, i) => (
                  <div
                    key={i}
                    className={`w-8 h-8 rounded flex items-center justify-center text-lg ${
                      i < skill.level
                        ? 'bg-yellow-400 text-yellow-900'
                        : 'bg-gray-200 text-gray-400'
                    }`}
                  >
                    ★
                  </div>
                ))}
              </div>

              {/* Experience bar */}
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Experience</span>
                  <span className="text-gray-600">
                    {skill.experience}/{skill.nextLevelExp} XP
                  </span>
                </div>
                <div className="bg-gray-200 rounded-full h-3 overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{
                      width: `${(skill.experience / skill.nextLevelExp) * 100}%`,
                    }}
                    transition={{ duration: 1, ease: 'easeOut' }}
                    className="h-full rounded-full"
                    style={{ backgroundColor: getColorValue(skill.color) }}
                  />
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Streak Tab */}
      {activeTab === 'streak' && (
        <div className="max-w-2xl mx-auto">
          <div className="bg-gradient-to-br from-orange-50 to-red-50 p-8 rounded-lg border-2 border-orange-200">
            <div className="text-center mb-6">
              <div className="text-6xl mb-4">🔥</div>
              <div className="text-5xl font-bold text-orange-600 mb-2">
                {streakIndicator.currentStreak} Days
              </div>
              <div className="text-lg text-gray-700">Current Streak</div>
            </div>

            <div className="grid grid-cols-2 gap-4 mb-6">
              <div className="bg-white p-4 rounded-lg text-center">
                <div className="text-2xl font-bold text-blue-600">
                  {streakIndicator.longestStreak}
                </div>
                <div className="text-sm text-gray-600">Longest Streak</div>
              </div>
              <div className="bg-white p-4 rounded-lg text-center">
                <div className="text-2xl font-bold text-green-600">
                  {streakIndicator.target}
                </div>
                <div className="text-sm text-gray-600">Target</div>
              </div>
            </div>

            {/* Progress to target */}
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Progress to target</span>
                <span>
                  {streakIndicator.currentStreak}/{streakIndicator.target}
                </span>
              </div>
              <div className="bg-white rounded-full h-4 overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{
                    width: `${Math.min(
                      (streakIndicator.currentStreak / streakIndicator.target) * 100,
                      100
                    )}%`,
                  }}
                  transition={{ duration: 1, ease: 'easeOut' }}
                  className="h-full bg-gradient-to-r from-orange-400 to-red-500"
                />
              </div>
            </div>

            {streakIndicator.active && (
              <div className="mt-4 text-center text-sm text-green-700 bg-green-100 py-2 rounded">
                ✓ Keep it going! Practice today to maintain your streak
              </div>
            )}
          </div>
        </div>
      )}

      {/* Achievements Tab */}
      {activeTab === 'achievements' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {achievementIndicators.map((achievement) => (
            <div
              key={achievement.id}
              className={`p-6 rounded-lg border-2 ${
                achievement.completed
                  ? 'bg-gradient-to-br from-yellow-50 to-amber-50 border-yellow-300'
                  : 'bg-white border-gray-200'
              }`}
            >
              <div className="flex items-start gap-4 mb-4">
                <div
                  className="text-4xl p-3 rounded-lg"
                  style={{
                    backgroundColor: achievement.completed
                      ? getTierColor(achievement.tier) + '20'
                      : '#f3f4f6',
                  }}
                >
                  {achievement.icon}
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="text-lg font-semibold">{achievement.name}</h3>
                    <span
                      className="px-2 py-1 text-xs rounded"
                      style={{
                        backgroundColor: getTierColor(achievement.tier) + '40',
                        color: getTierColor(achievement.tier),
                      }}
                    >
                      {achievement.tier}
                    </span>
                  </div>
                  <p className="text-sm text-gray-600">{achievement.description}</p>
                </div>
              </div>

              {!achievement.completed && (
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Progress</span>
                    <span className="text-gray-600">
                      {achievement.current}/{achievement.target}
                    </span>
                  </div>
                  <div className="bg-gray-200 rounded-full h-3 overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{
                        width: `${(achievement.current / achievement.target) * 100}%`,
                      }}
                      transition={{ duration: 1, ease: 'easeOut' }}
                      className="h-full rounded-full"
                      style={{ backgroundColor: getTierColor(achievement.tier) }}
                    />
                  </div>
                </div>
              )}

              {achievement.completed && (
                <div className="text-center py-2 bg-green-100 text-green-700 rounded text-sm font-medium">
                  ✓ Completed!
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Goals Tab */}
      {activeTab === 'goals' && (
        <div className="space-y-4">
          {goalIndicators.map((goal) => (
            <div key={goal.id} className="bg-white p-6 rounded-lg border">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="text-lg font-semibold mb-1">{goal.goal}</h3>
                  {goal.deadline && (
                    <p className="text-sm text-gray-600">
                      Due: {goal.deadline.toLocaleDateString()}
                    </p>
                  )}
                </div>
                <span
                  className={`px-3 py-1 rounded-full text-sm font-medium ${
                    goal.status === 'on-track'
                      ? 'bg-green-100 text-green-700'
                      : goal.status === 'at-risk'
                        ? 'bg-yellow-100 text-yellow-700'
                        : 'bg-red-100 text-red-700'
                  }`}
                >
                  {goal.status === 'on-track'
                    ? '✓ On Track'
                    : goal.status === 'at-risk'
                      ? '⚠ At Risk'
                      : '✗ Behind'}
                </span>
              </div>

              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Progress</span>
                  <span className="font-medium">{goal.progress}%</span>
                </div>
                <div className="bg-gray-200 rounded-full h-4 overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${goal.progress}%` }}
                    transition={{ duration: 1, ease: 'easeOut' }}
                    className={`h-full ${
                      goal.status === 'on-track'
                        ? 'bg-green-500'
                        : goal.status === 'at-risk'
                          ? 'bg-yellow-500'
                          : 'bg-red-500'
                    }`}
                  />
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Level Tab */}
      {activeTab === 'level' && (
        <div className="max-w-2xl mx-auto">
          <div className="bg-gradient-to-br from-purple-50 to-blue-50 p-8 rounded-lg border-2 border-purple-200">
            <div className="text-center mb-6">
              <div className="text-6xl mb-4">👑</div>
              <div className="text-5xl font-bold text-purple-600 mb-2">
                Level {levelIndicator.currentLevel}
              </div>
              <div className="text-lg text-gray-700">{levelIndicator.title}</div>
            </div>

            {/* Level progress */}
            <div className="space-y-2 mb-6">
              <div className="flex justify-between text-sm">
                <span>Progress to Level {levelIndicator.currentLevel + 1}</span>
                <span className="text-gray-600">
                  {levelIndicator.currentExp}/{levelIndicator.nextLevelExp} XP
                </span>
              </div>
              <div className="bg-white rounded-full h-6 overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{
                    width: `${(levelIndicator.currentExp / levelIndicator.nextLevelExp) * 100}%`,
                  }}
                  transition={{ duration: 1, ease: 'easeOut' }}
                  className="h-full bg-gradient-to-r from-purple-500 to-blue-500"
                />
              </div>
              <div className="text-center text-sm text-gray-600">
                {Math.round(
                  (levelIndicator.currentExp / levelIndicator.nextLevelExp) * 100
                )}% complete
              </div>
            </div>

            {/* Total XP */}
            <div className="bg-white p-4 rounded-lg text-center">
              <div className="text-3xl font-bold text-indigo-600">
                {levelIndicator.totalExp.toLocaleString()}
              </div>
              <div className="text-sm text-gray-600">Total Experience</div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
