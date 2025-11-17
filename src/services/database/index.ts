/**
 * Database Services Index
 * Central export point for all database operations
 */

// Base database service
export * from './databaseService';

// Core operations (Steps 73-76)
export {
  UserOperations,
  SessionOperations,
  ProgressOperations,
  AchievementOperations,
} from './dbOperations';

export type {
  User,
  Session,
  Progress,
  Achievement,
} from './dbOperations';

// Advanced operations (Steps 77-80)
export {
  SettingsOperations,
  WordListOperations,
  AttemptOperations,
  MistakePatternOperations,
  CacheOperations,
} from './dbOperationsAdvanced';

export type {
  UserSettings,
  CustomWord,
  TypingAttempt,
  MistakePattern,
  CacheEntry,
} from './dbOperationsAdvanced';

// Utilities (Steps 81-90)
export {
  ExportOperations,
  ImportOperations,
  BackupOperations,
  SyncOperations,
  ValidationOperations,
  EncryptionOperations,
  CleanupOperations,
  AnalyticsOperations,
  ReportOperations,
} from './dbUtilities';

export type { DatabaseExport } from './dbUtilities';

// Default export with all operations grouped
import dbOps from './dbOperations';
import dbOpsAdv from './dbOperationsAdvanced';
import dbUtils from './dbUtilities';

export const DB = {
  ...dbOps,
  ...dbOpsAdv,
  ...dbUtils,
};

export default DB;
