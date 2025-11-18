import { useState } from 'react';
import { motion } from 'framer-motion';

// Types
export type BackupStatus = 'pending' | 'in-progress' | 'completed' | 'failed';

export type BackupType = 'full' | 'incremental' | 'manual' | 'auto';

export interface Backup {
  id: string;
  name: string;
  type: BackupType;
  size: number; // bytes
  createdAt: Date;
  status: BackupStatus;
  dataIncluded: string[];
  location: 'local' | 'cloud' | 'both';
  error?: string;
}

export interface BackupSettings {
  autoBackup: boolean;
  backupFrequency: 'daily' | 'weekly' | 'monthly';
  backupLocation: 'local' | 'cloud' | 'both';
  maxBackups: number;
  includeProgress: boolean;
  includeSettings: boolean;
  includeAchievements: boolean;
  includeCertificates: boolean;
  compression: boolean;
  encryption: boolean;
}

export interface RestorePoint {
  backup: Backup;
  canRestore: boolean;
  warningMessage?: string;
}

// Mock data generators
function generateBackups(): Backup[] {
  return [
    {
      id: 'backup-1',
      name: 'Auto Backup - January 18, 2025',
      type: 'auto',
      size: 2456789,
      createdAt: new Date(),
      status: 'completed',
      dataIncluded: ['Progress', 'Settings', 'Achievements', 'Certificates'],
      location: 'cloud',
    },
    {
      id: 'backup-2',
      name: 'Manual Backup - January 17, 2025',
      type: 'manual',
      size: 2423456,
      createdAt: new Date(Date.now() - 86400000),
      status: 'completed',
      dataIncluded: ['Progress', 'Settings', 'Achievements'],
      location: 'local',
    },
    {
      id: 'backup-3',
      name: 'Auto Backup - January 17, 2025',
      type: 'auto',
      size: 2398765,
      createdAt: new Date(Date.now() - 86400000),
      status: 'completed',
      dataIncluded: ['Progress', 'Settings', 'Achievements', 'Certificates'],
      location: 'cloud',
    },
    {
      id: 'backup-4',
      name: 'Weekly Backup - January 11, 2025',
      type: 'incremental',
      size: 1234567,
      createdAt: new Date(Date.now() - 7 * 86400000),
      status: 'completed',
      dataIncluded: ['Progress', 'Settings'],
      location: 'both',
    },
    {
      id: 'backup-5',
      name: 'Failed Backup - January 10, 2025',
      type: 'auto',
      size: 0,
      createdAt: new Date(Date.now() - 8 * 86400000),
      status: 'failed',
      dataIncluded: [],
      location: 'cloud',
      error: 'Network connection lost',
    },
  ];
}

// Custom hook
function useBackups() {
  const [backups, setBackups] = useState<Backup[]>(generateBackups());
  const [settings, setSettings] = useState<BackupSettings>({
    autoBackup: true,
    backupFrequency: 'daily',
    backupLocation: 'cloud',
    maxBackups: 10,
    includeProgress: true,
    includeSettings: true,
    includeAchievements: true,
    includeCertificates: true,
    compression: true,
    encryption: true,
  });
  const [isCreatingBackup, setIsCreatingBackup] = useState(false);
  const [isRestoring, setIsRestoring] = useState(false);
  const [selectedBackup, setSelectedBackup] = useState<Backup | null>(null);

  const createBackup = async (type: BackupType = 'manual', name?: string) => {
    setIsCreatingBackup(true);

    // Simulate backup creation
    await new Promise((resolve) => setTimeout(resolve, 2000));

    const dataIncluded: string[] = [];
    if (settings.includeProgress) dataIncluded.push('Progress');
    if (settings.includeSettings) dataIncluded.push('Settings');
    if (settings.includeAchievements) dataIncluded.push('Achievements');
    if (settings.includeCertificates) dataIncluded.push('Certificates');

    const newBackup: Backup = {
      id: `backup-${Date.now()}`,
      name: name || `${type === 'manual' ? 'Manual' : 'Auto'} Backup - ${new Date().toLocaleDateString()}`,
      type,
      size: Math.floor(Math.random() * 3000000) + 1000000,
      createdAt: new Date(),
      status: 'completed',
      dataIncluded,
      location: settings.backupLocation === 'both' ? 'cloud' : settings.backupLocation,
    };

    setBackups((prev) => [newBackup, ...prev]);
    setIsCreatingBackup(false);

    return newBackup;
  };

  const deleteBackup = (backupId: string) => {
    setBackups((prev) => prev.filter((b) => b.id !== backupId));
  };

  const restoreBackup = async (backup: Backup) => {
    setIsRestoring(true);
    setSelectedBackup(backup);

    // Simulate restore process
    await new Promise((resolve) => setTimeout(resolve, 3000));

    setIsRestoring(false);
    setSelectedBackup(null);

    return true;
  };

  const downloadBackup = (backup: Backup) => {
    // This would trigger a download
    console.log('Downloading backup:', backup);
  };

  const updateSettings = (newSettings: Partial<BackupSettings>) => {
    setSettings((prev) => ({ ...prev, ...newSettings }));
  };

  const formatSize = (bytes: number): string => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return `${(bytes / Math.pow(k, i)).toFixed(2)} ${sizes[i]}`;
  };

  return {
    backups,
    settings,
    isCreatingBackup,
    isRestoring,
    selectedBackup,
    setSelectedBackup,
    createBackup,
    deleteBackup,
    restoreBackup,
    downloadBackup,
    updateSettings,
    formatSize,
  };
}

// Main component
export default function Backups() {
  const {
    backups,
    settings,
    isCreatingBackup,
    isRestoring,
    selectedBackup,
    setSelectedBackup,
    createBackup,
    deleteBackup,
    restoreBackup,
    downloadBackup,
    updateSettings,
    formatSize,
  } = useBackups();

  const [activeTab, setActiveTab] = useState<'backups' | 'restore' | 'settings'>('backups');
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<string | null>(null);

  const getStatusColor = (status: BackupStatus) => {
    switch (status) {
      case 'completed':
        return 'text-green-600 bg-green-50';
      case 'in-progress':
        return 'text-blue-600 bg-blue-50';
      case 'failed':
        return 'text-red-600 bg-red-50';
      case 'pending':
        return 'text-yellow-600 bg-yellow-50';
    }
  };

  const getTypeIcon = (type: BackupType) => {
    switch (type) {
      case 'full':
        return '💾';
      case 'incremental':
        return '📁';
      case 'manual':
        return '✋';
      case 'auto':
        return '⚙️';
    }
  };

  return (
    <div className="max-w-6xl mx-auto p-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Backup & Restore</h1>
        <p className="text-gray-600">
          Protect your progress with automatic backups and easy restore
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-white p-6 rounded-lg border">
          <div className="text-3xl font-bold text-blue-600 mb-1">
            {backups.filter((b) => b.status === 'completed').length}
          </div>
          <div className="text-sm text-gray-600">Successful Backups</div>
        </div>

        <div className="bg-white p-6 rounded-lg border">
          <div className="text-3xl font-bold text-green-600 mb-1">
            {backups.length > 0 ? formatSize(
              backups
                .filter((b) => b.status === 'completed')
                .reduce((sum, b) => sum + b.size, 0)
            ) : '0 B'}
          </div>
          <div className="text-sm text-gray-600">Total Size</div>
        </div>

        <div className="bg-white p-6 rounded-lg border">
          <div className="text-3xl font-bold text-purple-600 mb-1">
            {backups.length > 0 ? backups[0].createdAt.toLocaleDateString() : 'Never'}
          </div>
          <div className="text-sm text-gray-600">Last Backup</div>
        </div>

        <div className="bg-white p-6 rounded-lg border">
          <div className="text-3xl font-bold text-orange-600 mb-1">
            {settings.autoBackup ? settings.backupFrequency : 'Manual'}
          </div>
          <div className="text-sm text-gray-600">Backup Schedule</div>
        </div>
      </div>

      {/* Create backup button */}
      <div className="mb-6">
        <button
          onClick={() => createBackup('manual')}
          disabled={isCreatingBackup}
          className="px-6 py-3 bg-blue-500 hover:bg-blue-600 text-white rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
        >
          {isCreatingBackup ? (
            <>
              <span className="animate-spin">⟳</span>
              Creating Backup...
            </>
          ) : (
            <>
              <span>💾</span>
              Create Manual Backup
            </>
          )}
        </button>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 mb-6 border-b">
        {(['backups', 'restore', 'settings'] as const).map((tab) => (
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

      {/* Backups Tab */}
      {activeTab === 'backups' && (
        <div className="space-y-3">
          {backups.length === 0 ? (
            <div className="bg-white p-12 rounded-lg border text-center">
              <div className="text-6xl mb-4">📁</div>
              <h3 className="text-xl font-semibold mb-2">No Backups Yet</h3>
              <p className="text-gray-600 mb-6">
                Create your first backup to protect your progress
              </p>
              <button
                onClick={() => createBackup('manual')}
                className="px-6 py-3 bg-blue-500 hover:bg-blue-600 text-white rounded-lg font-medium transition-colors"
              >
                Create Backup Now
              </button>
            </div>
          ) : (
            backups.map((backup) => (
              <motion.div
                key={backup.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white p-6 rounded-lg border"
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-4 flex-1">
                    <div className="text-4xl">{getTypeIcon(backup.type)}</div>
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="text-lg font-semibold">{backup.name}</h3>
                        <span
                          className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(
                            backup.status
                          )}`}
                        >
                          {backup.status}
                        </span>
                        <span className="px-2 py-1 bg-gray-100 text-gray-600 rounded text-xs">
                          {backup.location}
                        </span>
                      </div>

                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-3 text-sm">
                        <div>
                          <div className="text-gray-500">Size</div>
                          <div className="font-medium">{formatSize(backup.size)}</div>
                        </div>
                        <div>
                          <div className="text-gray-500">Created</div>
                          <div className="font-medium">
                            {backup.createdAt.toLocaleString()}
                          </div>
                        </div>
                        <div>
                          <div className="text-gray-500">Type</div>
                          <div className="font-medium capitalize">{backup.type}</div>
                        </div>
                        <div>
                          <div className="text-gray-500">Data</div>
                          <div className="font-medium">
                            {backup.dataIncluded.length} items
                          </div>
                        </div>
                      </div>

                      {backup.dataIncluded.length > 0 && (
                        <div className="flex gap-2 flex-wrap">
                          {backup.dataIncluded.map((item, index) => (
                            <span
                              key={index}
                              className="px-2 py-1 bg-blue-50 text-blue-700 rounded text-xs"
                            >
                              {item}
                            </span>
                          ))}
                        </div>
                      )}

                      {backup.error && (
                        <div className="mt-2 text-sm text-red-600 bg-red-50 p-2 rounded">
                          Error: {backup.error}
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="flex gap-2">
                    {backup.status === 'completed' && (
                      <>
                        <button
                          onClick={() => downloadBackup(backup)}
                          className="px-3 py-2 bg-green-50 hover:bg-green-100 text-green-700 rounded transition-colors text-sm"
                          title="Download"
                        >
                          ⬇️
                        </button>
                        <button
                          onClick={() => {
                            setSelectedBackup(backup);
                            setActiveTab('restore');
                          }}
                          className="px-3 py-2 bg-blue-50 hover:bg-blue-100 text-blue-700 rounded transition-colors text-sm"
                          title="Restore"
                        >
                          ↻
                        </button>
                      </>
                    )}
                    <button
                      onClick={() => setShowDeleteConfirm(backup.id)}
                      className="px-3 py-2 bg-red-50 hover:bg-red-100 text-red-700 rounded transition-colors text-sm"
                      title="Delete"
                    >
                      🗑️
                    </button>
                  </div>
                </div>

                {/* Delete confirmation */}
                {showDeleteConfirm === backup.id && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    className="mt-4 p-4 bg-red-50 rounded border border-red-200"
                  >
                    <p className="text-sm text-red-900 mb-3">
                      Are you sure you want to delete this backup? This action cannot be
                      undone.
                    </p>
                    <div className="flex gap-2">
                      <button
                        onClick={() => {
                          deleteBackup(backup.id);
                          setShowDeleteConfirm(null);
                        }}
                        className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded text-sm font-medium transition-colors"
                      >
                        Delete
                      </button>
                      <button
                        onClick={() => setShowDeleteConfirm(null)}
                        className="px-4 py-2 bg-white hover:bg-gray-100 text-gray-700 rounded text-sm font-medium transition-colors border"
                      >
                        Cancel
                      </button>
                    </div>
                  </motion.div>
                )}
              </motion.div>
            ))
          )}
        </div>
      )}

      {/* Restore Tab */}
      {activeTab === 'restore' && (
        <div className="space-y-6">
          {selectedBackup ? (
            <div className="bg-white p-8 rounded-lg border">
              <h3 className="text-2xl font-bold mb-6">Restore from Backup</h3>

              <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 mb-6">
                <div className="flex items-start gap-3">
                  <div className="text-2xl">⚠️</div>
                  <div>
                    <h4 className="font-semibold text-yellow-900 mb-1">
                      Warning
                    </h4>
                    <p className="text-sm text-yellow-800">
                      Restoring this backup will replace your current data. Make sure you
                      want to proceed.
                    </p>
                  </div>
                </div>
              </div>

              <div className="bg-gray-50 p-6 rounded-lg mb-6">
                <h4 className="font-semibold mb-4">Backup Details</h4>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <div className="text-gray-500">Name</div>
                    <div className="font-medium">{selectedBackup.name}</div>
                  </div>
                  <div>
                    <div className="text-gray-500">Created</div>
                    <div className="font-medium">
                      {selectedBackup.createdAt.toLocaleString()}
                    </div>
                  </div>
                  <div>
                    <div className="text-gray-500">Size</div>
                    <div className="font-medium">{formatSize(selectedBackup.size)}</div>
                  </div>
                  <div>
                    <div className="text-gray-500">Location</div>
                    <div className="font-medium capitalize">
                      {selectedBackup.location}
                    </div>
                  </div>
                </div>

                <div className="mt-4">
                  <div className="text-gray-500 text-sm mb-2">Data Included:</div>
                  <div className="flex gap-2 flex-wrap">
                    {selectedBackup.dataIncluded.map((item, index) => (
                      <span
                        key={index}
                        className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm"
                      >
                        ✓ {item}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              <div className="flex gap-3">
                <button
                  onClick={() => restoreBackup(selectedBackup)}
                  disabled={isRestoring}
                  className="px-6 py-3 bg-blue-500 hover:bg-blue-600 text-white rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isRestoring ? (
                    <>
                      <span className="animate-spin inline-block mr-2">⟳</span>
                      Restoring...
                    </>
                  ) : (
                    'Restore This Backup'
                  )}
                </button>
                <button
                  onClick={() => setSelectedBackup(null)}
                  disabled={isRestoring}
                  className="px-6 py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg font-medium transition-colors disabled:opacity-50"
                >
                  Cancel
                </button>
              </div>
            </div>
          ) : (
            <div className="bg-white p-12 rounded-lg border text-center">
              <div className="text-6xl mb-4">↻</div>
              <h3 className="text-xl font-semibold mb-2">Select a Backup to Restore</h3>
              <p className="text-gray-600 mb-6">
                Choose a backup from the Backups tab to restore your data
              </p>
              <button
                onClick={() => setActiveTab('backups')}
                className="px-6 py-3 bg-blue-500 hover:bg-blue-600 text-white rounded-lg font-medium transition-colors"
              >
                View Backups
              </button>
            </div>
          )}
        </div>
      )}

      {/* Settings Tab */}
      {activeTab === 'settings' && (
        <div className="bg-white p-6 rounded-lg border space-y-6">
          <h3 className="text-lg font-semibold">Backup Settings</h3>

          <div>
            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={settings.autoBackup}
                onChange={(e) => updateSettings({ autoBackup: e.target.checked })}
                className="w-5 h-5"
              />
              <div>
                <div className="font-medium">Automatic Backups</div>
                <div className="text-sm text-gray-600">
                  Automatically create backups on schedule
                </div>
              </div>
            </label>
          </div>

          {settings.autoBackup && (
            <div>
              <label className="block mb-2 font-medium">Backup Frequency</label>
              <select
                value={settings.backupFrequency}
                onChange={(e) =>
                  updateSettings({
                    backupFrequency: e.target.value as 'daily' | 'weekly' | 'monthly',
                  })
                }
                className="border rounded px-3 py-2 w-full max-w-xs"
              >
                <option value="daily">Daily</option>
                <option value="weekly">Weekly</option>
                <option value="monthly">Monthly</option>
              </select>
            </div>
          )}

          <div>
            <label className="block mb-2 font-medium">Backup Location</label>
            <select
              value={settings.backupLocation}
              onChange={(e) =>
                updateSettings({
                  backupLocation: e.target.value as 'local' | 'cloud' | 'both',
                })
              }
              className="border rounded px-3 py-2 w-full max-w-xs"
            >
              <option value="local">Local Storage</option>
              <option value="cloud">Cloud Storage</option>
              <option value="both">Both Local & Cloud</option>
            </select>
          </div>

          <div>
            <label className="block mb-2 font-medium">Maximum Backups to Keep</label>
            <input
              type="number"
              value={settings.maxBackups}
              onChange={(e) =>
                updateSettings({ maxBackups: parseInt(e.target.value) || 10 })
              }
              min="1"
              max="50"
              className="border rounded px-3 py-2 w-full max-w-xs"
            />
            <p className="text-sm text-gray-600 mt-1">
              Older backups will be automatically deleted
            </p>
          </div>

          <div className="border-t pt-6">
            <h4 className="font-semibold mb-4">Data to Include</h4>

            <div className="space-y-3">
              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={settings.includeProgress}
                  onChange={(e) =>
                    updateSettings({ includeProgress: e.target.checked })
                  }
                  className="w-5 h-5"
                />
                <span>Progress and Statistics</span>
              </label>

              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={settings.includeSettings}
                  onChange={(e) =>
                    updateSettings({ includeSettings: e.target.checked })
                  }
                  className="w-5 h-5"
                />
                <span>Settings and Preferences</span>
              </label>

              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={settings.includeAchievements}
                  onChange={(e) =>
                    updateSettings({ includeAchievements: e.target.checked })
                  }
                  className="w-5 h-5"
                />
                <span>Achievements and Milestones</span>
              </label>

              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={settings.includeCertificates}
                  onChange={(e) =>
                    updateSettings({ includeCertificates: e.target.checked })
                  }
                  className="w-5 h-5"
                />
                <span>Certificates</span>
              </label>
            </div>
          </div>

          <div className="border-t pt-6">
            <h4 className="font-semibold mb-4">Advanced Options</h4>

            <div className="space-y-3">
              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={settings.compression}
                  onChange={(e) => updateSettings({ compression: e.target.checked })}
                  className="w-5 h-5"
                />
                <div>
                  <div className="font-medium">Compress Backups</div>
                  <div className="text-sm text-gray-600">
                    Reduce backup size (recommended)
                  </div>
                </div>
              </label>

              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={settings.encryption}
                  onChange={(e) => updateSettings({ encryption: e.target.checked })}
                  className="w-5 h-5"
                />
                <div>
                  <div className="font-medium">Encrypt Backups</div>
                  <div className="text-sm text-gray-600">
                    Protect your data with encryption
                  </div>
                </div>
              </label>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
