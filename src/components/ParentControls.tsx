/**
 * Parent Controls Component
 * Step 148 - Parental monitoring and control features
 */

import { motion } from 'framer-motion';
import { useState } from 'react';

export interface ParentControlSettings {
  enabled: boolean;
  timeLimit: number; // Minutes per day
  sessionLimit: number; // Minutes per session
  difficultyLock: boolean;
  allowedLevels: string[];
  requireParentApproval: boolean;
  trackProgress: boolean;
  shareReports: boolean;
}

const DEFAULT_PARENT_CONTROLS: ParentControlSettings = {
  enabled: false,
  timeLimit: 30,
  sessionLimit: 15,
  difficultyLock: false,
  allowedLevels: ['beginner', 'intermediate'],
  requireParentApproval: false,
  trackProgress: true,
  shareReports: true,
};

export default function ParentControls({
  settings = DEFAULT_PARENT_CONTROLS,
  onChange,
}: {
  settings?: ParentControlSettings;
  onChange?: (settings: ParentControlSettings) => void;
}) {
  const [localSettings, setLocalSettings] = useState(settings);
  const [unlocked, setUnlocked] = useState(false);

  const handleChange = (key: keyof ParentControlSettings, value: any) => {
    const newSettings = { ...localSettings, [key]: value };
    setLocalSettings(newSettings);
    onChange?.(newSettings);
  };

  const handleUnlock = () => {
    // In a real app, this would require a PIN or password
    setUnlocked(true);
    setTimeout(() => setUnlocked(false), 60000); // Auto-lock after 1 minute
  };

  if (!unlocked) {
    return (
      <div className="bg-white rounded-2xl shadow-xl p-8">
        <div className="text-center">
          <div className="text-6xl mb-4">🔒</div>
          <h2 className="text-2xl font-bold text-gray-800 mb-2">
            Parent Controls
          </h2>
          <p className="text-gray-600 mb-6">
            Enter PIN to access parent controls
          </p>
          <button
            onClick={handleUnlock}
            className="px-8 py-3 bg-primary-500 text-white rounded-lg font-bold hover:bg-primary-600 transition-colors"
          >
            Unlock (Demo)
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl shadow-xl p-8">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-gray-800">Parent Controls</h2>
        <span className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm font-medium">
          🔓 Unlocked
        </span>
      </div>

      <div className="space-y-6">
        {/* Master enable */}
        <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
          <div>
            <h3 className="font-bold text-gray-900">Enable Parent Controls</h3>
            <p className="text-sm text-gray-600">
              Activate time limits and restrictions
            </p>
          </div>
          <button
            onClick={() => handleChange('enabled', !localSettings.enabled)}
            className={`relative w-16 h-9 rounded-full transition-colors ${
              localSettings.enabled ? 'bg-primary-500' : 'bg-gray-300'
            }`}
          >
            <motion.div
              animate={{ x: localSettings.enabled ? 28 : 0 }}
              transition={{ type: 'spring', stiffness: 500, damping: 30 }}
              className="absolute top-1 left-1 w-7 h-7 bg-white rounded-full shadow-md"
            />
          </button>
        </div>

        {/* Time limits */}
        <div className="space-y-4">
          <h3 className="font-bold text-gray-900">Time Limits</h3>

          <div>
            <label className="text-sm font-medium text-gray-700 mb-2 block">
              Daily Time Limit: {localSettings.timeLimit} minutes
            </label>
            <input
              type="range"
              min="5"
              max="120"
              step="5"
              value={localSettings.timeLimit}
              onChange={(e) =>
                handleChange('timeLimit', parseInt(e.target.value))
              }
              disabled={!localSettings.enabled}
              className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
            />
            <div className="flex justify-between text-xs text-gray-500 mt-1">
              <span>5 min</span>
              <span>2 hours</span>
            </div>
          </div>

          <div>
            <label className="text-sm font-medium text-gray-700 mb-2 block">
              Session Time Limit: {localSettings.sessionLimit} minutes
            </label>
            <input
              type="range"
              min="5"
              max="60"
              step="5"
              value={localSettings.sessionLimit}
              onChange={(e) =>
                handleChange('sessionLimit', parseInt(e.target.value))
              }
              disabled={!localSettings.enabled}
              className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
            />
            <div className="flex justify-between text-xs text-gray-500 mt-1">
              <span>5 min</span>
              <span>1 hour</span>
            </div>
          </div>
        </div>

        {/* Content restrictions */}
        <div>
          <h3 className="font-bold text-gray-900 mb-3">Content Restrictions</h3>

          <div className="space-y-3">
            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <div>
                <div className="font-medium text-gray-900">Lock Difficulty</div>
                <div className="text-sm text-gray-600">
                  Prevent changing difficulty without approval
                </div>
              </div>
              <button
                onClick={() =>
                  handleChange('difficultyLock', !localSettings.difficultyLock)
                }
                disabled={!localSettings.enabled}
                className={`relative w-12 h-7 rounded-full transition-colors ${
                  localSettings.difficultyLock ? 'bg-primary-500' : 'bg-gray-300'
                } disabled:opacity-50 disabled:cursor-not-allowed`}
              >
                <motion.div
                  animate={{ x: localSettings.difficultyLock ? 20 : 0 }}
                  transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                  className="absolute top-1 left-1 w-5 h-5 bg-white rounded-full shadow-sm"
                />
              </button>
            </div>

            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <div>
                <div className="font-medium text-gray-900">
                  Require Parent Approval
                </div>
                <div className="text-sm text-gray-600">
                  Ask for permission before advancing levels
                </div>
              </div>
              <button
                onClick={() =>
                  handleChange(
                    'requireParentApproval',
                    !localSettings.requireParentApproval
                  )
                }
                disabled={!localSettings.enabled}
                className={`relative w-12 h-7 rounded-full transition-colors ${
                  localSettings.requireParentApproval ? 'bg-primary-500' : 'bg-gray-300'
                } disabled:opacity-50 disabled:cursor-not-allowed`}
              >
                <motion.div
                  animate={{ x: localSettings.requireParentApproval ? 20 : 0 }}
                  transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                  className="absolute top-1 left-1 w-5 h-5 bg-white rounded-full shadow-sm"
                />
              </button>
            </div>
          </div>
        </div>

        {/* Monitoring */}
        <div>
          <h3 className="font-bold text-gray-900 mb-3">Monitoring</h3>

          <div className="space-y-3">
            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <div>
                <div className="font-medium text-gray-900">Track Progress</div>
                <div className="text-sm text-gray-600">
                  Keep detailed records of practice sessions
                </div>
              </div>
              <button
                onClick={() =>
                  handleChange('trackProgress', !localSettings.trackProgress)
                }
                disabled={!localSettings.enabled}
                className={`relative w-12 h-7 rounded-full transition-colors ${
                  localSettings.trackProgress ? 'bg-success-500' : 'bg-gray-300'
                } disabled:opacity-50 disabled:cursor-not-allowed`}
              >
                <motion.div
                  animate={{ x: localSettings.trackProgress ? 20 : 0 }}
                  transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                  className="absolute top-1 left-1 w-5 h-5 bg-white rounded-full shadow-sm"
                />
              </button>
            </div>

            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <div>
                <div className="font-medium text-gray-900">Share Reports</div>
                <div className="text-sm text-gray-600">
                  Send progress reports to parent email
                </div>
              </div>
              <button
                onClick={() =>
                  handleChange('shareReports', !localSettings.shareReports)
                }
                disabled={!localSettings.enabled}
                className={`relative w-12 h-7 rounded-full transition-colors ${
                  localSettings.shareReports ? 'bg-success-500' : 'bg-gray-300'
                } disabled:opacity-50 disabled:cursor-not-allowed`}
              >
                <motion.div
                  animate={{ x: localSettings.shareReports ? 20 : 0 }}
                  transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                  className="absolute top-1 left-1 w-5 h-5 bg-white rounded-full shadow-sm"
                />
              </button>
            </div>
          </div>
        </div>

        {/* Lock button */}
        <button
          onClick={() => setUnlocked(false)}
          className="w-full py-3 bg-gray-200 text-gray-700 rounded-lg font-medium hover:bg-gray-300 transition-colors"
        >
          🔒 Lock Parent Controls
        </button>
      </div>
    </div>
  );
}

// Progress report for parents
export function ProgressReport({
  childName,
  data,
}: {
  childName: string;
  data: {
    totalTime: number; // minutes
    sessionsCompleted: number;
    averageAccuracy: number;
    averageWPM: number;
    improvementRate: number;
  };
}) {
  return (
    <div className="bg-white rounded-xl shadow-lg p-6">
      <h3 className="text-lg font-bold text-gray-800 mb-4">
        Progress Report: {childName}
      </h3>

      <div className="grid grid-cols-2 gap-4">
        {[
          {
            label: 'Total Practice Time',
            value: `${data.totalTime} min`,
            icon: '⏱️',
          },
          {
            label: 'Sessions Completed',
            value: data.sessionsCompleted,
            icon: '✅',
          },
          {
            label: 'Average Accuracy',
            value: `${data.averageAccuracy}%`,
            icon: '🎯',
          },
          {
            label: 'Average Speed',
            value: `${data.averageWPM} WPM`,
            icon: '⚡',
          },
        ].map((stat, index) => (
          <div key={index} className="p-4 bg-gray-50 rounded-lg">
            <div className="text-2xl mb-2">{stat.icon}</div>
            <div className="text-2xl font-bold text-gray-900">{stat.value}</div>
            <div className="text-sm text-gray-600">{stat.label}</div>
          </div>
        ))}
      </div>

      {data.improvementRate > 0 && (
        <div className="mt-4 p-4 bg-success-50 rounded-lg border-2 border-success-200">
          <div className="flex items-center gap-2">
            <span className="text-2xl">📈</span>
            <div>
              <div className="font-bold text-success-900">
                Great Progress!
              </div>
              <div className="text-sm text-success-700">
                {data.improvementRate}% improvement this week
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// Export default settings
export { DEFAULT_PARENT_CONTROLS };
