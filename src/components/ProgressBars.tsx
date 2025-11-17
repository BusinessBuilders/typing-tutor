/**
 * Progress Bars Component
 * Step 129 - Visual progress indicators for typing practice
 */

import { motion } from 'framer-motion';
import { useSettingsStore } from '../store/useSettingsStore';

export interface ProgressBarProps {
  current: number;
  total: number;
  label?: string;
  showPercentage?: boolean;
  showCount?: boolean;
  color?: 'primary' | 'success' | 'warning' | 'error';
  size?: 'small' | 'medium' | 'large';
  animated?: boolean;
}

export default function ProgressBar({
  current,
  total,
  label,
  showPercentage = true,
  showCount = false,
  color = 'primary',
  size = 'medium',
  animated = true,
}: ProgressBarProps) {
  const { settings } = useSettingsStore();
  const percentage = total > 0 ? (current / total) * 100 : 0;

  const colors = {
    primary: 'from-primary-400 to-primary-600',
    success: 'from-success-400 to-success-600',
    warning: 'from-yellow-400 to-yellow-600',
    error: 'from-red-400 to-red-600',
  };

  const sizes = {
    small: 'h-2',
    medium: 'h-4',
    large: 'h-6',
  };

  return (
    <div className="w-full">
      {label && (
        <div className="flex justify-between items-center mb-2">
          <span className="text-sm font-medium text-gray-700">{label}</span>
          <div className="flex items-center space-x-2">
            {showPercentage && (
              <span className="text-sm font-bold text-gray-800">
                {Math.round(percentage)}%
              </span>
            )}
            {showCount && (
              <span className="text-xs text-gray-600">
                {current}/{total}
              </span>
            )}
          </div>
        </div>
      )}

      <div className={`relative ${sizes[size]} bg-gray-200 rounded-full overflow-hidden`}>
        <motion.div
          initial={{ width: 0 }}
          animate={{
            width: `${percentage}%`,
          }}
          transition={{
            duration: animated && !settings.reducedMotion ? 0.5 : 0,
            ease: 'easeOut',
          }}
          className={`h-full bg-gradient-to-r ${colors[color]} rounded-full`}
        />
      </div>
    </div>
  );
}

// Circular progress indicator
export function CircularProgress({
  current,
  total,
  size = 100,
  strokeWidth = 8,
  label,
  color = 'primary',
}: {
  current: number;
  total: number;
  size?: number;
  strokeWidth?: number;
  label?: string;
  color?: 'primary' | 'success' | 'warning' | 'error';
}) {
  const { settings } = useSettingsStore();
  const percentage = total > 0 ? (current / total) * 100 : 0;
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  const offset = circumference - (percentage / 100) * circumference;

  const colors = {
    primary: '#3b82f6',
    success: '#10b981',
    warning: '#f59e0b',
    error: '#ef4444',
  };

  return (
    <div className="relative inline-flex items-center justify-center">
      <svg width={size} height={size} className="transform -rotate-90">
        {/* Background circle */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke="#e5e7eb"
          strokeWidth={strokeWidth}
          fill="none"
        />

        {/* Progress circle */}
        <motion.circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke={colors[color]}
          strokeWidth={strokeWidth}
          fill="none"
          strokeLinecap="round"
          strokeDasharray={circumference}
          initial={{ strokeDashoffset: circumference }}
          animate={{
            strokeDashoffset: settings.reducedMotion ? offset : circumference,
          }}
          transition={{
            strokeDashoffset: {
              duration: settings.reducedMotion ? 0 : 1,
              ease: 'easeInOut',
            },
          }}
          style={{
            strokeDashoffset: offset,
          }}
        />
      </svg>

      {/* Center text */}
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-2xl font-bold text-gray-800">
          {Math.round(percentage)}%
        </span>
        {label && <span className="text-xs text-gray-600 mt-1">{label}</span>}
      </div>
    </div>
  );
}

// Multi-stage progress bar
export function MultiStageProgress({
  stages,
  currentStage,
}: {
  stages: Array<{ label: string; icon?: string }>;
  currentStage: number;
}) {
  return (
    <div className="w-full">
      <div className="flex items-center justify-between">
        {stages.map((stage, index) => {
          const isComplete = index < currentStage;
          const isCurrent = index === currentStage;

          return (
            <div key={index} className="flex-1 relative">
              {/* Stage indicator */}
              <div className="flex flex-col items-center">
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  className={`
                    w-12 h-12 rounded-full flex items-center justify-center font-bold text-lg
                    ${
                      isComplete
                        ? 'bg-success-500 text-white'
                        : isCurrent
                        ? 'bg-primary-500 text-white ring-4 ring-primary-200'
                        : 'bg-gray-200 text-gray-500'
                    }
                  `}
                >
                  {isComplete ? '✓' : stage.icon || index + 1}
                </motion.div>

                <span
                  className={`mt-2 text-xs font-medium ${
                    isCurrent ? 'text-primary-600' : 'text-gray-600'
                  }`}
                >
                  {stage.label}
                </span>
              </div>

              {/* Connector line */}
              {index < stages.length - 1 && (
                <div className="absolute top-6 left-1/2 w-full h-1 bg-gray-200">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{
                      width: isComplete ? '100%' : '0%',
                    }}
                    className="h-full bg-success-500"
                  />
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

// Animated skill progress bars
export function SkillProgress({
  skills,
}: {
  skills: Array<{ name: string; level: number; maxLevel: number }>;
}) {
  const { settings } = useSettingsStore();

  return (
    <div className="space-y-4">
      {skills.map((skill, index) => {
        const percentage = (skill.level / skill.maxLevel) * 100;

        return (
          <motion.div
            key={index}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.1 }}
            className="bg-white rounded-lg p-4 shadow-md"
          >
            <div className="flex justify-between items-center mb-2">
              <span className="font-medium text-gray-800">{skill.name}</span>
              <span className="text-sm text-gray-600">
                Level {skill.level}/{skill.maxLevel}
              </span>
            </div>

            <div className="relative h-3 bg-gray-200 rounded-full overflow-hidden">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${percentage}%` }}
                transition={{
                  duration: settings.reducedMotion ? 0 : 0.8,
                  delay: index * 0.1,
                }}
                className="h-full bg-gradient-to-r from-blue-400 to-purple-600 rounded-full"
              />
            </div>
          </motion.div>
        );
      })}
    </div>
  );
}

// Real-time typing progress with stats
export function TypingProgress({
  current,
  total,
  accuracy,
  wpm,
  errors,
}: {
  current: number;
  total: number;
  accuracy: number;
  wpm: number;
  errors: number;
}) {
  const percentage = total > 0 ? (current / total) * 100 : 0;

  return (
    <div className="bg-white rounded-2xl shadow-xl p-6">
      {/* Main progress bar */}
      <div className="mb-6">
        <div className="flex justify-between items-center mb-2">
          <span className="text-lg font-bold text-gray-800">Progress</span>
          <span className="text-2xl font-bold text-primary-600">
            {Math.round(percentage)}%
          </span>
        </div>

        <div className="relative h-6 bg-gray-200 rounded-full overflow-hidden">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${percentage}%` }}
            className="h-full bg-gradient-to-r from-primary-400 to-primary-600 rounded-full"
          />

          {/* Character count overlay */}
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="text-xs font-bold text-gray-700">
              {current} / {total} characters
            </span>
          </div>
        </div>
      </div>

      {/* Stats grid */}
      <div className="grid grid-cols-3 gap-4">
        <div className="text-center">
          <div className="text-3xl font-bold text-success-600">{accuracy}%</div>
          <div className="text-xs text-gray-600 mt-1">Accuracy</div>
        </div>

        <div className="text-center">
          <div className="text-3xl font-bold text-blue-600">{wpm}</div>
          <div className="text-xs text-gray-600 mt-1">WPM</div>
        </div>

        <div className="text-center">
          <div className="text-3xl font-bold text-red-600">{errors}</div>
          <div className="text-xs text-gray-600 mt-1">Errors</div>
        </div>
      </div>
    </div>
  );
}

// Streaks and milestones progress
export function StreakProgress({
  currentStreak,
  bestStreak,
  nextMilestone,
}: {
  currentStreak: number;
  bestStreak: number;
  nextMilestone: number;
}) {
  const progress = (currentStreak / nextMilestone) * 100;

  return (
    <div className="bg-gradient-to-r from-orange-100 to-yellow-100 rounded-xl p-6">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-lg font-bold text-gray-800">Current Streak</h3>
          <p className="text-4xl font-bold text-orange-600">{currentStreak} 🔥</p>
        </div>

        <div className="text-right">
          <p className="text-sm text-gray-600">Best Streak</p>
          <p className="text-2xl font-bold text-yellow-600">{bestStreak} ⭐</p>
        </div>
      </div>

      <div className="mt-4">
        <div className="flex justify-between text-sm text-gray-600 mb-1">
          <span>Next milestone</span>
          <span>{nextMilestone}</span>
        </div>

        <div className="h-3 bg-white bg-opacity-50 rounded-full overflow-hidden">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${Math.min(progress, 100)}%` }}
            className="h-full bg-gradient-to-r from-orange-400 to-yellow-500 rounded-full"
          />
        </div>
      </div>
    </div>
  );
}
