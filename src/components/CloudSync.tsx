import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';

// Types
export type SyncStatus = 'synced' | 'syncing' | 'pending' | 'failed' | 'offline';

export type SyncDataType =
  | 'progress'
  | 'settings'
  | 'achievements'
  | 'certificates'
  | 'backups'
  | 'all';

export interface SyncActivity {
  id: string;
  type: SyncDataType;
  action: 'upload' | 'download' | 'sync';
  status: SyncStatus;
  timestamp: Date;
  itemCount: number;
  dataSize: number;
  error?: string;
}

export interface SyncSettings {
  enabled: boolean;
  autoSync: boolean;
  syncInterval: number; // minutes
  wifiOnly: boolean;
  syncOnStartup: boolean;
  syncOnExit: boolean;
  conflictResolution: 'local' | 'cloud' | 'newest' | 'manual';
  dataTypes: SyncDataType[];
}

export interface SyncStats {
  lastSync?: Date;
  totalSyncs: number;
  totalUploads: number;
  totalDownloads: number;
  totalDataSynced: number; // bytes
  failedSyncs: number;
}

export interface CloudConnection {
  connected: boolean;
  provider: 'google' | 'dropbox' | 'onedrive' | 'icloud' | 'custom';
  email?: string;
  storageUsed: number;
  storageTotal: number;
}

// Mock data generators
function generateSyncActivity(): SyncActivity[] {
  return [
    {
      id: 'sync-1',
      type: 'all',
      action: 'sync',
      status: 'synced',
      timestamp: new Date(),
      itemCount: 45,
      dataSize: 523456,
    },
    {
      id: 'sync-2',
      type: 'progress',
      action: 'upload',
      status: 'synced',
      timestamp: new Date(Date.now() - 3600000),
      itemCount: 12,
      dataSize: 145678,
    },
    {
      id: 'sync-3',
      type: 'achievements',
      action: 'download',
      status: 'synced',
      timestamp: new Date(Date.now() - 7200000),
      itemCount: 8,
      dataSize: 87654,
    },
    {
      id: 'sync-4',
      type: 'settings',
      action: 'sync',
      status: 'failed',
      timestamp: new Date(Date.now() - 10800000),
      itemCount: 0,
      dataSize: 0,
      error: 'Network timeout',
    },
    {
      id: 'sync-5',
      type: 'certificates',
      action: 'upload',
      status: 'synced',
      timestamp: new Date(Date.now() - 14400000),
      itemCount: 3,
      dataSize: 234567,
    },
  ];
}

function generateSyncStats(): SyncStats {
  return {
    lastSync: new Date(),
    totalSyncs: 127,
    totalUploads: 68,
    totalDownloads: 59,
    totalDataSynced: 45678901,
    failedSyncs: 3,
  };
}

function generateCloudConnection(): CloudConnection {
  return {
    connected: true,
    provider: 'google',
    email: 'user@example.com',
    storageUsed: 12345678,
    storageTotal: 15728640000, // 15GB
  };
}

// Custom hook
function useCloudSync() {
  const [syncActivity, setSyncActivity] = useState<SyncActivity[]>(
    generateSyncActivity()
  );
  const [stats, setStats] = useState<SyncStats>(generateSyncStats());
  const [connection, setConnection] = useState<CloudConnection>(
    generateCloudConnection()
  );
  const [settings, setSettings] = useState<SyncSettings>({
    enabled: true,
    autoSync: true,
    syncInterval: 15,
    wifiOnly: true,
    syncOnStartup: true,
    syncOnExit: true,
    conflictResolution: 'newest',
    dataTypes: ['all'],
  });
  const [isSyncing, setIsSyncing] = useState(false);
  const [currentStatus, setCurrentStatus] = useState<SyncStatus>('synced');

  useEffect(() => {
    // Simulate auto-sync
    if (settings.enabled && settings.autoSync && !isSyncing) {
      const interval = setInterval(() => {
        performSync('all', 'sync');
      }, settings.syncInterval * 60 * 1000);

      return () => clearInterval(interval);
    }
  }, [settings.enabled, settings.autoSync, settings.syncInterval, isSyncing]);

  const performSync = async (
    dataType: SyncDataType = 'all',
    action: 'upload' | 'download' | 'sync' = 'sync'
  ) => {
    if (!connection.connected) {
      setCurrentStatus('offline');
      return false;
    }

    setIsSyncing(true);
    setCurrentStatus('syncing');

    // Simulate sync process
    await new Promise((resolve) => setTimeout(resolve, 2000));

    const newActivity: SyncActivity = {
      id: `sync-${Date.now()}`,
      type: dataType,
      action,
      status: 'synced',
      timestamp: new Date(),
      itemCount: Math.floor(Math.random() * 50) + 1,
      dataSize: Math.floor(Math.random() * 1000000) + 100000,
    };

    setSyncActivity((prev) => [newActivity, ...prev]);
    setStats((prev) => ({
      ...prev,
      lastSync: new Date(),
      totalSyncs: prev.totalSyncs + 1,
      totalUploads: action === 'upload' ? prev.totalUploads + 1 : prev.totalUploads,
      totalDownloads: action === 'download' ? prev.totalDownloads + 1 : prev.totalDownloads,
      totalDataSynced: prev.totalDataSynced + newActivity.dataSize,
    }));

    setIsSyncing(false);
    setCurrentStatus('synced');

    return true;
  };

  const connectToCloud = async (
    provider: CloudConnection['provider'],
    email: string
  ) => {
    // Simulate connection process
    await new Promise((resolve) => setTimeout(resolve, 1500));

    setConnection({
      connected: true,
      provider,
      email,
      storageUsed: 0,
      storageTotal: 15728640000,
    });

    return true;
  };

  const disconnectFromCloud = () => {
    setConnection((prev) => ({
      ...prev,
      connected: false,
      email: undefined,
    }));
  };

  const updateSettings = (newSettings: Partial<SyncSettings>) => {
    setSettings((prev) => ({ ...prev, ...newSettings }));
  };

  const formatSize = (bytes: number): string => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return `${(bytes / Math.pow(k, i)).toFixed(2)} ${sizes[i]}`;
  };

  const getStoragePercentage = (): number => {
    if (!connection.storageTotal) return 0;
    return (connection.storageUsed / connection.storageTotal) * 100;
  };

  return {
    syncActivity,
    stats,
    connection,
    settings,
    isSyncing,
    currentStatus,
    performSync,
    connectToCloud,
    disconnectFromCloud,
    updateSettings,
    formatSize,
    getStoragePercentage,
  };
}

// Main component
export default function CloudSync() {
  const {
    syncActivity,
    stats,
    connection,
    settings,
    isSyncing,
    currentStatus,
    performSync,
    connectToCloud,
    disconnectFromCloud,
    updateSettings,
    formatSize,
    getStoragePercentage,
  } = useCloudSync();

  const [activeTab, setActiveTab] = useState<'overview' | 'activity' | 'settings'>(
    'overview'
  );
  const [showConnectModal, setShowConnectModal] = useState(false);
  const [selectedProvider, setSelectedProvider] = useState<CloudConnection['provider']>('google');

  const getStatusColor = (status: SyncStatus) => {
    switch (status) {
      case 'synced':
        return 'text-green-600 bg-green-50';
      case 'syncing':
        return 'text-blue-600 bg-blue-50';
      case 'pending':
        return 'text-yellow-600 bg-yellow-50';
      case 'failed':
        return 'text-red-600 bg-red-50';
      case 'offline':
        return 'text-gray-600 bg-gray-50';
    }
  };

  const getStatusIcon = (status: SyncStatus) => {
    switch (status) {
      case 'synced':
        return '✓';
      case 'syncing':
        return '⟳';
      case 'pending':
        return '⏸';
      case 'failed':
        return '✗';
      case 'offline':
        return '📡';
    }
  };

  const getProviderIcon = (provider: CloudConnection['provider']) => {
    switch (provider) {
      case 'google':
        return '🔵';
      case 'dropbox':
        return '🔷';
      case 'onedrive':
        return '🔶';
      case 'icloud':
        return '☁️';
      case 'custom':
        return '🔧';
    }
  };

  return (
    <div className="max-w-6xl mx-auto p-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Cloud Sync</h1>
        <p className="text-gray-600">
          Sync your data across devices with cloud storage
        </p>
      </div>

      {/* Status banner */}
      <div
        className={`mb-6 p-6 rounded-lg ${getStatusColor(currentStatus)} border-2 border-current/20`}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="text-3xl">{getStatusIcon(currentStatus)}</div>
            <div>
              <div className="font-semibold text-lg capitalize">{currentStatus}</div>
              {stats.lastSync && (
                <div className="text-sm opacity-75">
                  Last synced: {stats.lastSync.toLocaleString()}
                </div>
              )}
            </div>
          </div>

          {connection.connected && !isSyncing && (
            <button
              onClick={() => performSync()}
              className="px-6 py-3 bg-white hover:bg-gray-50 rounded-lg font-medium transition-colors shadow-sm"
            >
              Sync Now
            </button>
          )}

          {!connection.connected && (
            <button
              onClick={() => setShowConnectModal(true)}
              className="px-6 py-3 bg-blue-500 hover:bg-blue-600 text-white rounded-lg font-medium transition-colors"
            >
              Connect to Cloud
            </button>
          )}
        </div>
      </div>

      {/* Connection card */}
      {connection.connected && (
        <div className="bg-white p-6 rounded-lg border mb-6">
          <div className="flex items-start justify-between mb-4">
            <div className="flex items-center gap-4">
              <div className="text-5xl">{getProviderIcon(connection.provider)}</div>
              <div>
                <h3 className="text-xl font-semibold capitalize">
                  {connection.provider} Drive
                </h3>
                {connection.email && (
                  <p className="text-sm text-gray-600">{connection.email}</p>
                )}
              </div>
            </div>
            <button
              onClick={disconnectFromCloud}
              className="px-4 py-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors text-sm"
            >
              Disconnect
            </button>
          </div>

          {/* Storage */}
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Storage Used</span>
              <span className="font-medium">
                {formatSize(connection.storageUsed)} of{' '}
                {formatSize(connection.storageTotal)}
              </span>
            </div>
            <div className="bg-gray-200 rounded-full h-3 overflow-hidden">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${getStoragePercentage()}%` }}
                transition={{ duration: 1, ease: 'easeOut' }}
                className={`h-full ${
                  getStoragePercentage() > 90
                    ? 'bg-red-500'
                    : getStoragePercentage() > 75
                      ? 'bg-yellow-500'
                      : 'bg-blue-500'
                }`}
              />
            </div>
            <div className="text-right text-xs text-gray-500">
              {getStoragePercentage().toFixed(1)}% used
            </div>
          </div>
        </div>
      )}

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-white p-6 rounded-lg border">
          <div className="text-3xl font-bold text-blue-600 mb-1">
            {stats.totalSyncs}
          </div>
          <div className="text-sm text-gray-600">Total Syncs</div>
        </div>

        <div className="bg-white p-6 rounded-lg border">
          <div className="text-3xl font-bold text-green-600 mb-1">
            {stats.totalUploads}
          </div>
          <div className="text-sm text-gray-600">Uploads</div>
        </div>

        <div className="bg-white p-6 rounded-lg border">
          <div className="text-3xl font-bold text-purple-600 mb-1">
            {stats.totalDownloads}
          </div>
          <div className="text-sm text-gray-600">Downloads</div>
        </div>

        <div className="bg-white p-6 rounded-lg border">
          <div className="text-3xl font-bold text-orange-600 mb-1">
            {formatSize(stats.totalDataSynced)}
          </div>
          <div className="text-sm text-gray-600">Data Synced</div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 mb-6 border-b">
        {(['overview', 'activity', 'settings'] as const).map((tab) => (
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

      {/* Overview Tab */}
      {activeTab === 'overview' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Quick actions */}
          <div className="bg-white p-6 rounded-lg border">
            <h3 className="text-lg font-semibold mb-4">Quick Actions</h3>
            <div className="space-y-3">
              <button
                onClick={() => performSync('progress', 'upload')}
                disabled={isSyncing || !connection.connected}
                className="w-full px-4 py-3 bg-blue-50 hover:bg-blue-100 text-blue-700 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-3"
              >
                <span>⬆️</span>
                <span>Upload Progress</span>
              </button>

              <button
                onClick={() => performSync('settings', 'upload')}
                disabled={isSyncing || !connection.connected}
                className="w-full px-4 py-3 bg-green-50 hover:bg-green-100 text-green-700 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-3"
              >
                <span>⬆️</span>
                <span>Upload Settings</span>
              </button>

              <button
                onClick={() => performSync('achievements', 'upload')}
                disabled={isSyncing || !connection.connected}
                className="w-full px-4 py-3 bg-purple-50 hover:bg-purple-100 text-purple-700 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-3"
              >
                <span>⬆️</span>
                <span>Upload Achievements</span>
              </button>

              <button
                onClick={() => performSync('all', 'download')}
                disabled={isSyncing || !connection.connected}
                className="w-full px-4 py-3 bg-orange-50 hover:bg-orange-100 text-orange-700 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-3"
              >
                <span>⬇️</span>
                <span>Download All Data</span>
              </button>
            </div>
          </div>

          {/* Sync info */}
          <div className="bg-white p-6 rounded-lg border">
            <h3 className="text-lg font-semibold mb-4">Sync Information</h3>
            <div className="space-y-4">
              <div>
                <div className="text-sm text-gray-600 mb-1">Auto Sync</div>
                <div className="font-medium">
                  {settings.autoSync
                    ? `Every ${settings.syncInterval} minutes`
                    : 'Disabled'}
                </div>
              </div>

              <div>
                <div className="text-sm text-gray-600 mb-1">Conflict Resolution</div>
                <div className="font-medium capitalize">
                  {settings.conflictResolution}
                </div>
              </div>

              <div>
                <div className="text-sm text-gray-600 mb-1">WiFi Only</div>
                <div className="font-medium">
                  {settings.wifiOnly ? 'Enabled' : 'Disabled'}
                </div>
              </div>

              <div>
                <div className="text-sm text-gray-600 mb-1">Failed Syncs</div>
                <div className="font-medium text-red-600">{stats.failedSyncs}</div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Activity Tab */}
      {activeTab === 'activity' && (
        <div className="space-y-3">
          {syncActivity.length === 0 ? (
            <div className="bg-white p-12 rounded-lg border text-center">
              <div className="text-6xl mb-4">🔄</div>
              <h3 className="text-xl font-semibold mb-2">No Sync Activity Yet</h3>
              <p className="text-gray-600">Perform your first sync to see activity here</p>
            </div>
          ) : (
            syncActivity.map((activity) => (
              <motion.div
                key={activity.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                className="bg-white p-6 rounded-lg border"
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-4 flex-1">
                    <div className="text-3xl">
                      {activity.action === 'upload'
                        ? '⬆️'
                        : activity.action === 'download'
                          ? '⬇️'
                          : '🔄'}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="text-lg font-semibold capitalize">
                          {activity.action} {activity.type}
                        </h3>
                        <span
                          className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(
                            activity.status
                          )}`}
                        >
                          {activity.status}
                        </span>
                      </div>

                      <div className="grid grid-cols-3 gap-4 text-sm">
                        <div>
                          <div className="text-gray-500">Items</div>
                          <div className="font-medium">{activity.itemCount}</div>
                        </div>
                        <div>
                          <div className="text-gray-500">Size</div>
                          <div className="font-medium">
                            {formatSize(activity.dataSize)}
                          </div>
                        </div>
                        <div>
                          <div className="text-gray-500">Time</div>
                          <div className="font-medium">
                            {activity.timestamp.toLocaleTimeString()}
                          </div>
                        </div>
                      </div>

                      {activity.error && (
                        <div className="mt-2 text-sm text-red-600 bg-red-50 p-2 rounded">
                          Error: {activity.error}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </motion.div>
            ))
          )}
        </div>
      )}

      {/* Settings Tab */}
      {activeTab === 'settings' && (
        <div className="bg-white p-6 rounded-lg border space-y-6">
          <h3 className="text-lg font-semibold">Sync Settings</h3>

          <div>
            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={settings.enabled}
                onChange={(e) => updateSettings({ enabled: e.target.checked })}
                className="w-5 h-5"
              />
              <div>
                <div className="font-medium">Enable Cloud Sync</div>
                <div className="text-sm text-gray-600">
                  Sync your data to the cloud
                </div>
              </div>
            </label>
          </div>

          <div>
            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={settings.autoSync}
                onChange={(e) => updateSettings({ autoSync: e.target.checked })}
                className="w-5 h-5"
                disabled={!settings.enabled}
              />
              <div>
                <div className="font-medium">Automatic Sync</div>
                <div className="text-sm text-gray-600">
                  Sync automatically on a schedule
                </div>
              </div>
            </label>
          </div>

          {settings.autoSync && (
            <div>
              <label className="block mb-2 font-medium">Sync Interval (minutes)</label>
              <input
                type="number"
                value={settings.syncInterval}
                onChange={(e) =>
                  updateSettings({ syncInterval: parseInt(e.target.value) || 15 })
                }
                min="5"
                max="120"
                className="border rounded px-3 py-2 w-full max-w-xs"
              />
            </div>
          )}

          <div>
            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={settings.wifiOnly}
                onChange={(e) => updateSettings({ wifiOnly: e.target.checked })}
                className="w-5 h-5"
              />
              <div>
                <div className="font-medium">WiFi Only</div>
                <div className="text-sm text-gray-600">
                  Only sync when connected to WiFi
                </div>
              </div>
            </label>
          </div>

          <div>
            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={settings.syncOnStartup}
                onChange={(e) => updateSettings({ syncOnStartup: e.target.checked })}
                className="w-5 h-5"
              />
              <div>
                <div className="font-medium">Sync on Startup</div>
                <div className="text-sm text-gray-600">
                  Automatically sync when app starts
                </div>
              </div>
            </label>
          </div>

          <div>
            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={settings.syncOnExit}
                onChange={(e) => updateSettings({ syncOnExit: e.target.checked })}
                className="w-5 h-5"
              />
              <div>
                <div className="font-medium">Sync on Exit</div>
                <div className="text-sm text-gray-600">
                  Automatically sync when app closes
                </div>
              </div>
            </label>
          </div>

          <div>
            <label className="block mb-2 font-medium">Conflict Resolution</label>
            <select
              value={settings.conflictResolution}
              onChange={(e) =>
                updateSettings({
                  conflictResolution: e.target.value as SyncSettings['conflictResolution'],
                })
              }
              className="border rounded px-3 py-2 w-full max-w-xs"
            >
              <option value="local">Prefer Local Changes</option>
              <option value="cloud">Prefer Cloud Changes</option>
              <option value="newest">Use Newest Version</option>
              <option value="manual">Ask Every Time</option>
            </select>
          </div>
        </div>
      )}

      {/* Connect modal */}
      {showConnectModal && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
          onClick={() => setShowConnectModal(false)}
        >
          <motion.div
            initial={{ scale: 0.9, y: 20 }}
            animate={{ scale: 1, y: 0 }}
            className="bg-white rounded-2xl p-8 max-w-md w-full"
            onClick={(e) => e.stopPropagation()}
          >
            <h2 className="text-2xl font-bold mb-6">Connect to Cloud Storage</h2>

            <div className="space-y-3 mb-6">
              {(['google', 'dropbox', 'onedrive', 'icloud'] as const).map((provider) => (
                <button
                  key={provider}
                  onClick={() => setSelectedProvider(provider)}
                  className={`w-full px-4 py-4 rounded-lg border-2 transition-all flex items-center gap-3 ${
                    selectedProvider === provider
                      ? 'border-blue-500 bg-blue-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <span className="text-3xl">{getProviderIcon(provider)}</span>
                  <span className="font-medium capitalize">{provider}</span>
                </button>
              ))}
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => {
                  connectToCloud(selectedProvider, 'user@example.com');
                  setShowConnectModal(false);
                }}
                className="flex-1 px-6 py-3 bg-blue-500 hover:bg-blue-600 text-white rounded-lg font-medium transition-colors"
              >
                Connect
              </button>
              <button
                onClick={() => setShowConnectModal(false)}
                className="px-6 py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg font-medium transition-colors"
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
