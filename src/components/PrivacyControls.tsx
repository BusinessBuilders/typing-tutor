import { useState } from 'react';
import { motion } from 'framer-motion';

// Types
export type PrivacyLevel = 'public' | 'friends' | 'private';

export type DataCategory =
  | 'progress'
  | 'achievements'
  | 'statistics'
  | 'certificates'
  | 'profile'
  | 'activity';

export interface PrivacySetting {
  id: string;
  category: DataCategory;
  label: string;
  description: string;
  level: PrivacyLevel;
  canShare: boolean;
  canExport: boolean;
}

export interface DataAccessLog {
  id: string;
  action: 'view' | 'export' | 'share' | 'delete';
  category: DataCategory;
  timestamp: Date;
  byUser: boolean; // true if action by user, false if by system
  details?: string;
}

export interface PrivacyPreferences {
  shareProgress: boolean;
  shareAchievements: boolean;
  showOnLeaderboard: boolean;
  allowAnalytics: boolean;
  allowPersonalization: boolean;
  allowNotifications: boolean;
  dataRetention: number; // days, 0 = forever
  autoDeleteAfterInactive: boolean;
  inactiveDays: number;
}

export interface DataExport {
  id: string;
  requestedAt: Date;
  completedAt?: Date;
  status: 'pending' | 'processing' | 'ready' | 'expired';
  format: 'json' | 'csv' | 'pdf';
  size?: number;
  expiresAt?: Date;
}

// Mock data generators
function generatePrivacySettings(): PrivacySetting[] {
  return [
    {
      id: 'privacy-1',
      category: 'progress',
      label: 'Typing Progress',
      description: 'Speed, accuracy, and improvement metrics',
      level: 'private',
      canShare: true,
      canExport: true,
    },
    {
      id: 'privacy-2',
      category: 'achievements',
      label: 'Achievements & Badges',
      description: 'Unlocked achievements and earned badges',
      level: 'friends',
      canShare: true,
      canExport: true,
    },
    {
      id: 'privacy-3',
      category: 'statistics',
      label: 'Detailed Statistics',
      description: 'Session history and performance analytics',
      level: 'private',
      canShare: false,
      canExport: true,
    },
    {
      id: 'privacy-4',
      category: 'certificates',
      label: 'Certificates',
      description: 'Earned certificates and awards',
      level: 'public',
      canShare: true,
      canExport: true,
    },
    {
      id: 'privacy-5',
      category: 'profile',
      label: 'Profile Information',
      description: 'Name, avatar, and bio',
      level: 'friends',
      canShare: true,
      canExport: true,
    },
    {
      id: 'privacy-6',
      category: 'activity',
      label: 'Recent Activity',
      description: 'Last active time and current streak',
      level: 'private',
      canShare: true,
      canExport: true,
    },
  ];
}

function generateAccessLogs(): DataAccessLog[] {
  return [
    {
      id: 'log-1',
      action: 'view',
      category: 'progress',
      timestamp: new Date(),
      byUser: true,
      details: 'Viewed progress dashboard',
    },
    {
      id: 'log-2',
      action: 'export',
      category: 'statistics',
      timestamp: new Date(Date.now() - 3600000),
      byUser: true,
      details: 'Exported data as JSON',
    },
    {
      id: 'log-3',
      action: 'share',
      category: 'achievements',
      timestamp: new Date(Date.now() - 7200000),
      byUser: true,
      details: 'Shared achievement on social media',
    },
    {
      id: 'log-4',
      action: 'view',
      category: 'profile',
      timestamp: new Date(Date.now() - 10800000),
      byUser: false,
      details: 'System backup process',
    },
  ];
}

function generateDataExports(): DataExport[] {
  return [
    {
      id: 'export-1',
      requestedAt: new Date(),
      completedAt: new Date(),
      status: 'ready',
      format: 'json',
      size: 1234567,
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
    },
    {
      id: 'export-2',
      requestedAt: new Date(Date.now() - 86400000),
      status: 'processing',
      format: 'pdf',
    },
    {
      id: 'export-3',
      requestedAt: new Date(Date.now() - 7 * 86400000),
      completedAt: new Date(Date.now() - 6 * 86400000),
      status: 'expired',
      format: 'csv',
      size: 987654,
      expiresAt: new Date(Date.now() - 1 * 86400000),
    },
  ];
}

// Custom hook
function usePrivacyControls() {
  const [settings, setSettings] = useState<PrivacySetting[]>(
    generatePrivacySettings()
  );
  const [preferences, setPreferences] = useState<PrivacyPreferences>({
    shareProgress: false,
    shareAchievements: true,
    showOnLeaderboard: false,
    allowAnalytics: true,
    allowPersonalization: true,
    allowNotifications: true,
    dataRetention: 365,
    autoDeleteAfterInactive: false,
    inactiveDays: 180,
  });
  const [accessLogs] = useState<DataAccessLog[]>(
    generateAccessLogs()
  );
  const [dataExports, setDataExports] = useState<DataExport[]>(
    generateDataExports()
  );

  const updatePrivacyLevel = (categoryId: string, level: PrivacyLevel) => {
    setSettings((prev) =>
      prev.map((s) => (s.id === categoryId ? { ...s, level } : s))
    );
  };

  const updateSharePermission = (categoryId: string, canShare: boolean) => {
    setSettings((prev) =>
      prev.map((s) => (s.id === categoryId ? { ...s, canShare } : s))
    );
  };

  const updatePreferences = (newPrefs: Partial<PrivacyPreferences>) => {
    setPreferences((prev) => ({ ...prev, ...newPrefs }));
  };

  const requestDataExport = async (format: DataExport['format']) => {
    const newExport: DataExport = {
      id: `export-${Date.now()}`,
      requestedAt: new Date(),
      status: 'processing',
      format,
    };

    setDataExports((prev) => [newExport, ...prev]);

    // Simulate export processing
    setTimeout(() => {
      setDataExports((prev) =>
        prev.map((exp) =>
          exp.id === newExport.id
            ? {
                ...exp,
                status: 'ready',
                completedAt: new Date(),
                size: Math.floor(Math.random() * 2000000) + 500000,
                expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
              }
            : exp
        )
      );
    }, 3000);

    return newExport;
  };

  const downloadExport = (exportId: string) => {
    console.log('Downloading export:', exportId);
    // This would trigger actual download
  };

  const deleteAllData = async () => {
    // This would delete all user data
    console.log('Deleting all data...');
    await new Promise((resolve) => setTimeout(resolve, 2000));
    return true;
  };

  const formatSize = (bytes: number): string => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return `${(bytes / Math.pow(k, i)).toFixed(2)} ${sizes[i]}`;
  };

  return {
    settings,
    preferences,
    accessLogs,
    dataExports,
    updatePrivacyLevel,
    updateSharePermission,
    updatePreferences,
    requestDataExport,
    downloadExport,
    deleteAllData,
    formatSize,
  };
}

// Main component
export default function PrivacyControls() {
  const {
    settings,
    preferences,
    accessLogs,
    dataExports,
    updatePrivacyLevel,
    updateSharePermission,
    updatePreferences,
    requestDataExport,
    downloadExport,
    deleteAllData,
    formatSize,
  } = usePrivacyControls();

  const [activeTab, setActiveTab] = useState<
    'settings' | 'preferences' | 'data' | 'logs'
  >('settings');
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const getPrivacyLevelColor = (level: PrivacyLevel) => {
    switch (level) {
      case 'public':
        return 'bg-blue-100 text-blue-700 border-blue-300';
      case 'friends':
        return 'bg-yellow-100 text-yellow-700 border-yellow-300';
      case 'private':
        return 'bg-red-100 text-red-700 border-red-300';
    }
  };

  const getPrivacyLevelIcon = (level: PrivacyLevel) => {
    switch (level) {
      case 'public':
        return '🌍';
      case 'friends':
        return '👥';
      case 'private':
        return '🔒';
    }
  };

  const handleDeleteAllData = async () => {
    setIsDeleting(true);
    await deleteAllData();
    setIsDeleting(false);
    setShowDeleteConfirm(false);
  };

  return (
    <div className="max-w-6xl mx-auto p-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Privacy Controls</h1>
        <p className="text-gray-600">
          Manage your privacy settings and control your data
        </p>
      </div>

      {/* Privacy overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="bg-white p-6 rounded-lg border">
          <div className="text-3xl font-bold text-green-600 mb-1">
            {settings.filter((s) => s.level === 'private').length}
          </div>
          <div className="text-sm text-gray-600">Private Categories</div>
        </div>

        <div className="bg-white p-6 rounded-lg border">
          <div className="text-3xl font-bold text-blue-600 mb-1">
            {settings.filter((s) => s.canShare).length}
          </div>
          <div className="text-sm text-gray-600">Shareable Categories</div>
        </div>

        <div className="bg-white p-6 rounded-lg border">
          <div className="text-3xl font-bold text-purple-600 mb-1">
            {accessLogs.filter((log) => log.byUser).length}
          </div>
          <div className="text-sm text-gray-600">Recent User Actions</div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 mb-6 border-b">
        {(['settings', 'preferences', 'data', 'logs'] as const).map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-6 py-3 font-medium transition-colors border-b-2 -mb-px ${
              activeTab === tab
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            {tab.charAt(0).toUpperCase() + tab.slice(1)}
          </button>
        ))}
      </div>

      {/* Settings Tab */}
      {activeTab === 'settings' && (
        <div className="space-y-4">
          {settings.map((setting) => (
            <div key={setting.id} className="bg-white p-6 rounded-lg border">
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <h3 className="text-lg font-semibold mb-1">{setting.label}</h3>
                  <p className="text-sm text-gray-600">{setting.description}</p>
                </div>
                <div className={`px-4 py-2 rounded-full border-2 ${getPrivacyLevelColor(setting.level)} flex items-center gap-2`}>
                  <span>{getPrivacyLevelIcon(setting.level)}</span>
                  <span className="font-medium capitalize">{setting.level}</span>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Privacy level */}
                <div>
                  <label className="block text-sm font-medium mb-2">
                    Privacy Level
                  </label>
                  <div className="flex gap-2">
                    {(['public', 'friends', 'private'] as const).map((level) => (
                      <button
                        key={level}
                        onClick={() => updatePrivacyLevel(setting.id, level)}
                        className={`flex-1 px-3 py-2 rounded-lg border-2 transition-all ${
                          setting.level === level
                            ? getPrivacyLevelColor(level)
                            : 'border-gray-200 hover:border-gray-300'
                        }`}
                      >
                        <div className="text-lg mb-1">
                          {getPrivacyLevelIcon(level)}
                        </div>
                        <div className="text-xs capitalize">{level}</div>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Permissions */}
                <div>
                  <label className="block text-sm font-medium mb-2">
                    Permissions
                  </label>
                  <div className="space-y-2">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={setting.canShare}
                        onChange={(e) =>
                          updateSharePermission(setting.id, e.target.checked)
                        }
                        className="w-4 h-4"
                      />
                      <span className="text-sm">Allow sharing</span>
                    </label>
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={setting.canExport}
                        disabled
                        className="w-4 h-4"
                      />
                      <span className="text-sm text-gray-500">
                        Allow export (always enabled)
                      </span>
                    </label>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Preferences Tab */}
      {activeTab === 'preferences' && (
        <div className="bg-white p-6 rounded-lg border space-y-6">
          <div>
            <h3 className="text-lg font-semibold mb-4">Sharing Preferences</h3>
            <div className="space-y-3">
              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={preferences.shareProgress}
                  onChange={(e) =>
                    updatePreferences({ shareProgress: e.target.checked })
                  }
                  className="w-5 h-5"
                />
                <div>
                  <div className="font-medium">Share Progress Updates</div>
                  <div className="text-sm text-gray-600">
                    Allow sharing progress milestones
                  </div>
                </div>
              </label>

              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={preferences.shareAchievements}
                  onChange={(e) =>
                    updatePreferences({ shareAchievements: e.target.checked })
                  }
                  className="w-5 h-5"
                />
                <div>
                  <div className="font-medium">Share Achievements</div>
                  <div className="text-sm text-gray-600">
                    Allow sharing earned achievements
                  </div>
                </div>
              </label>

              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={preferences.showOnLeaderboard}
                  onChange={(e) =>
                    updatePreferences({ showOnLeaderboard: e.target.checked })
                  }
                  className="w-5 h-5"
                />
                <div>
                  <div className="font-medium">Show on Leaderboard</div>
                  <div className="text-sm text-gray-600">
                    Display your name on public leaderboards
                  </div>
                </div>
              </label>
            </div>
          </div>

          <div className="border-t pt-6">
            <h3 className="text-lg font-semibold mb-4">Data Usage</h3>
            <div className="space-y-3">
              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={preferences.allowAnalytics}
                  onChange={(e) =>
                    updatePreferences({ allowAnalytics: e.target.checked })
                  }
                  className="w-5 h-5"
                />
                <div>
                  <div className="font-medium">Allow Analytics</div>
                  <div className="text-sm text-gray-600">
                    Help improve the app with usage data
                  </div>
                </div>
              </label>

              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={preferences.allowPersonalization}
                  onChange={(e) =>
                    updatePreferences({ allowPersonalization: e.target.checked })
                  }
                  className="w-5 h-5"
                />
                <div>
                  <div className="font-medium">Allow Personalization</div>
                  <div className="text-sm text-gray-600">
                    Customize experience based on your usage
                  </div>
                </div>
              </label>

              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={preferences.allowNotifications}
                  onChange={(e) =>
                    updatePreferences({ allowNotifications: e.target.checked })
                  }
                  className="w-5 h-5"
                />
                <div>
                  <div className="font-medium">Allow Notifications</div>
                  <div className="text-sm text-gray-600">
                    Receive updates and reminders
                  </div>
                </div>
              </label>
            </div>
          </div>

          <div className="border-t pt-6">
            <h3 className="text-lg font-semibold mb-4">Data Retention</h3>

            <div className="mb-4">
              <label className="block mb-2 font-medium">
                Keep Data For (days)
              </label>
              <input
                type="number"
                value={preferences.dataRetention}
                onChange={(e) =>
                  updatePreferences({
                    dataRetention: parseInt(e.target.value) || 365,
                  })
                }
                min="0"
                className="border rounded px-3 py-2 w-full max-w-xs"
              />
              <p className="text-sm text-gray-600 mt-1">
                Set to 0 to keep data forever
              </p>
            </div>

            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={preferences.autoDeleteAfterInactive}
                onChange={(e) =>
                  updatePreferences({ autoDeleteAfterInactive: e.target.checked })
                }
                className="w-5 h-5"
              />
              <div>
                <div className="font-medium">Auto-delete After Inactivity</div>
                <div className="text-sm text-gray-600">
                  Automatically delete data if inactive
                </div>
              </div>
            </label>

            {preferences.autoDeleteAfterInactive && (
              <div className="ml-8 mt-3">
                <label className="block mb-2 text-sm">Inactive Days</label>
                <input
                  type="number"
                  value={preferences.inactiveDays}
                  onChange={(e) =>
                    updatePreferences({
                      inactiveDays: parseInt(e.target.value) || 180,
                    })
                  }
                  min="30"
                  className="border rounded px-3 py-2 w-full max-w-xs"
                />
              </div>
            )}
          </div>
        </div>
      )}

      {/* Data Tab */}
      {activeTab === 'data' && (
        <div className="space-y-6">
          {/* Export data */}
          <div className="bg-white p-6 rounded-lg border">
            <h3 className="text-lg font-semibold mb-4">Export Your Data</h3>
            <p className="text-gray-600 mb-4">
              Download a copy of your data in your preferred format
            </p>

            <div className="flex gap-3 mb-6">
              <button
                onClick={() => requestDataExport('json')}
                className="px-6 py-3 bg-blue-500 hover:bg-blue-600 text-white rounded-lg font-medium transition-colors"
              >
                Export as JSON
              </button>
              <button
                onClick={() => requestDataExport('csv')}
                className="px-6 py-3 bg-green-500 hover:bg-green-600 text-white rounded-lg font-medium transition-colors"
              >
                Export as CSV
              </button>
              <button
                onClick={() => requestDataExport('pdf')}
                className="px-6 py-3 bg-purple-500 hover:bg-purple-600 text-white rounded-lg font-medium transition-colors"
              >
                Export as PDF
              </button>
            </div>

            {/* Export history */}
            {dataExports.length > 0 && (
              <div className="border-t pt-4">
                <h4 className="font-semibold mb-3">Recent Exports</h4>
                <div className="space-y-2">
                  {dataExports.map((exp) => (
                    <div
                      key={exp.id}
                      className="flex items-center justify-between p-3 bg-gray-50 rounded"
                    >
                      <div className="flex-1">
                        <div className="font-medium uppercase">{exp.format}</div>
                        <div className="text-sm text-gray-600">
                          Requested: {exp.requestedAt.toLocaleString()}
                        </div>
                        {exp.size && (
                          <div className="text-xs text-gray-500">
                            Size: {formatSize(exp.size)}
                          </div>
                        )}
                      </div>
                      <div className="flex items-center gap-3">
                        <span
                          className={`px-3 py-1 rounded-full text-xs font-medium ${
                            exp.status === 'ready'
                              ? 'bg-green-100 text-green-700'
                              : exp.status === 'processing'
                                ? 'bg-blue-100 text-blue-700'
                                : exp.status === 'expired'
                                  ? 'bg-gray-100 text-gray-700'
                                  : 'bg-yellow-100 text-yellow-700'
                          }`}
                        >
                          {exp.status}
                        </span>
                        {exp.status === 'ready' && (
                          <button
                            onClick={() => downloadExport(exp.id)}
                            className="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded text-sm font-medium transition-colors"
                          >
                            Download
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Delete data */}
          <div className="bg-red-50 p-6 rounded-lg border-2 border-red-200">
            <h3 className="text-lg font-semibold text-red-900 mb-2">
              Delete All Data
            </h3>
            <p className="text-sm text-red-700 mb-4">
              Permanently delete all your data. This action cannot be undone.
            </p>
            <button
              onClick={() => setShowDeleteConfirm(true)}
              className="px-6 py-3 bg-red-600 hover:bg-red-700 text-white rounded-lg font-medium transition-colors"
            >
              Delete All Data
            </button>
          </div>
        </div>
      )}

      {/* Logs Tab */}
      {activeTab === 'logs' && (
        <div className="space-y-3">
          {accessLogs.length === 0 ? (
            <div className="bg-white p-12 rounded-lg border text-center">
              <div className="text-6xl mb-4">📋</div>
              <h3 className="text-xl font-semibold mb-2">No Activity Logs</h3>
              <p className="text-gray-600">Your data access history will appear here</p>
            </div>
          ) : (
            accessLogs.map((log) => (
              <motion.div
                key={log.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                className="bg-white p-6 rounded-lg border"
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-4 flex-1">
                    <div className="text-3xl">
                      {log.action === 'view' && '👁️'}
                      {log.action === 'export' && '📥'}
                      {log.action === 'share' && '📤'}
                      {log.action === 'delete' && '🗑️'}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-1">
                        <h3 className="text-lg font-semibold capitalize">
                          {log.action} {log.category}
                        </h3>
                        <span
                          className={`px-2 py-1 rounded text-xs ${
                            log.byUser
                              ? 'bg-blue-100 text-blue-700'
                              : 'bg-gray-100 text-gray-700'
                          }`}
                        >
                          {log.byUser ? 'User' : 'System'}
                        </span>
                      </div>
                      <p className="text-sm text-gray-600 mb-2">{log.details}</p>
                      <div className="text-xs text-gray-500">
                        {log.timestamp.toLocaleString()}
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))
          )}
        </div>
      )}

      {/* Delete confirmation modal */}
      {showDeleteConfirm && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
        >
          <motion.div
            initial={{ scale: 0.9, y: 20 }}
            animate={{ scale: 1, y: 0 }}
            className="bg-white rounded-2xl p-8 max-w-md w-full"
          >
            <div className="text-center mb-6">
              <div className="text-6xl mb-4">⚠️</div>
              <h2 className="text-2xl font-bold mb-2">Delete All Data?</h2>
              <p className="text-gray-600">
                This will permanently delete all your progress, achievements, and
                settings. This action cannot be undone.
              </p>
            </div>

            <div className="flex gap-3">
              <button
                onClick={handleDeleteAllData}
                disabled={isDeleting}
                className="flex-1 px-6 py-3 bg-red-600 hover:bg-red-700 text-white rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isDeleting ? 'Deleting...' : 'Yes, Delete Everything'}
              </button>
              <button
                onClick={() => setShowDeleteConfirm(false)}
                disabled={isDeleting}
                className="flex-1 px-6 py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg font-medium transition-colors disabled:opacity-50"
              >
                Cancel
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </div>
  );
}
