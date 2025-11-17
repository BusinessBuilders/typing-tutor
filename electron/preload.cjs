const { contextBridge, ipcRenderer } = require('electron');

// Expose protected methods that allow the renderer process to use
// the ipcRenderer without exposing the entire object
contextBridge.exposeInMainWorld('electronAPI', {
  // App information
  getAppVersion: () => ipcRenderer.invoke('app:getVersion'),
  getAppPath: (name) => ipcRenderer.invoke('app:getPath', name),

  // Platform information
  platform: process.platform,

  // File system operations (will be implemented in main process)
  readFile: (filePath) => ipcRenderer.invoke('fs:readFile', filePath),
  writeFile: (filePath, data) => ipcRenderer.invoke('fs:writeFile', filePath, data),
  fileExists: (filePath) => ipcRenderer.invoke('fs:fileExists', filePath),

  // Database operations (will be implemented later)
  dbQuery: (query, params) => ipcRenderer.invoke('db:query', query, params),
  dbExecute: (query, params) => ipcRenderer.invoke('db:execute', query, params),

  // Settings operations
  getSetting: (key) => ipcRenderer.invoke('settings:get', key),
  setSetting: (key, value) => ipcRenderer.invoke('settings:set', key, value),

  // Audio operations
  playSound: (soundName) => ipcRenderer.invoke('audio:play', soundName),

  // Window operations
  minimizeWindow: () => ipcRenderer.invoke('window:minimize'),
  maximizeWindow: () => ipcRenderer.invoke('window:maximize'),
  closeWindow: () => ipcRenderer.invoke('window:close'),

  // Event listeners (for receiving messages from main process)
  onProgressUpdate: (callback) => {
    ipcRenderer.on('progress:update', (event, data) => callback(data));
  },

  onSettingsChanged: (callback) => {
    ipcRenderer.on('settings:changed', (event, data) => callback(data));
  },

  // Remove listeners
  removeAllListeners: (channel) => {
    ipcRenderer.removeAllListeners(channel);
  },
});

// Expose a safe console for debugging (optional)
contextBridge.exposeInMainWorld('electronConsole', {
  log: (...args) => console.log('[Renderer]', ...args),
  warn: (...args) => console.warn('[Renderer]', ...args),
  error: (...args) => console.error('[Renderer]', ...args),
});

// Log that preload script has loaded
console.log('Preload script loaded successfully');
