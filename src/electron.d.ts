// Type definitions for Electron API exposed via preload script

export interface ElectronAPI {
  // App information
  getAppVersion: () => Promise<string>;
  getAppPath: (name: string) => Promise<string>;

  // Platform information
  platform: 'win32' | 'darwin' | 'linux';

  // File system operations
  readFile: (filePath: string) => Promise<string>;
  writeFile: (filePath: string, data: string) => Promise<void>;
  fileExists: (filePath: string) => Promise<boolean>;

  // Database operations
  dbQuery: (query: string, params?: any[]) => Promise<any[]>;
  dbExecute: (query: string, params?: any[]) => Promise<void>;

  // Settings operations
  getSetting: (key: string) => Promise<any>;
  setSetting: (key: string, value: any) => Promise<void>;

  // Audio operations
  playSound: (soundName: string) => Promise<void>;

  // Window operations
  minimizeWindow: () => Promise<void>;
  maximizeWindow: () => Promise<void>;
  closeWindow: () => Promise<void>;

  // Event listeners
  onProgressUpdate: (callback: (data: any) => void) => void;
  onSettingsChanged: (callback: (data: any) => void) => void;
  removeAllListeners: (channel: string) => void;
}

export interface ElectronConsole {
  log: (...args: any[]) => void;
  warn: (...args: any[]) => void;
  error: (...args: any[]) => void;
}

declare global {
  interface Window {
    electronAPI: ElectronAPI;
    electronConsole: ElectronConsole;
  }
}

export {};
