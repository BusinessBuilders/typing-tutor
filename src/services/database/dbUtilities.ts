/**
 * Database Utilities Module
 * Export, Import, Backup, Sync, Validation, Encryption, Cleanup, Analytics, Reports
 * Steps 81-90 implementation
 */

import { dbQuery, dbExecute } from './databaseService';
import { UserOperations, ProgressOperations } from './dbOperations';

// ============================================================================
// STEP 81: JSON EXPORT FUNCTION
// ============================================================================

export interface DatabaseExport {
  version: string;
  exportedAt: string;
  users: any[];
  sessions: any[];
  progress: any[];
  achievements: any[];
  custom_words: any[];
  typing_attempts: any[];
  user_settings: any[];
}

export const ExportOperations = {
  /**
   * Export user data to JSON
   */
  async exportUserData(userId: string): Promise<DatabaseExport> {
    const users = await dbQuery('SELECT * FROM users WHERE id = ?', [userId]);
    const sessions = await dbQuery('SELECT * FROM sessions WHERE user_id = ? ORDER BY start_time DESC', [userId]);
    const progress = await dbQuery('SELECT * FROM progress WHERE user_id = ?', [userId]);
    const achievements = await dbQuery('SELECT * FROM achievements WHERE user_id = ?', [userId]);
    const custom_words = await dbQuery('SELECT * FROM custom_words WHERE user_id = ?', [userId]);
    const typing_attempts = await dbQuery('SELECT * FROM typing_attempts WHERE user_id = ? ORDER BY timestamp DESC LIMIT 1000', [userId]);
    const user_settings = await dbQuery('SELECT * FROM user_settings WHERE user_id = ?', [userId]);

    return {
      version: '1.0.0',
      exportedAt: new Date().toISOString(),
      users,
      sessions,
      progress,
      achievements,
      custom_words,
      typing_attempts,
      user_settings,
    };
  },

  /**
   * Export all database data
   */
  async exportAllData(): Promise<DatabaseExport> {
    const users = await dbQuery('SELECT * FROM users');
    const sessions = await dbQuery('SELECT * FROM sessions ORDER BY start_time DESC');
    const progress = await dbQuery('SELECT * FROM progress');
    const achievements = await dbQuery('SELECT * FROM achievements');
    const custom_words = await dbQuery('SELECT * FROM custom_words');
    const typing_attempts = await dbQuery('SELECT * FROM typing_attempts ORDER BY timestamp DESC LIMIT 10000');
    const user_settings = await dbQuery('SELECT * FROM user_settings');

    return {
      version: '1.0.0',
      exportedAt: new Date().toISOString(),
      users,
      sessions,
      progress,
      achievements,
      custom_words,
      typing_attempts,
      user_settings,
    };
  },

  /**
   * Save export to file (browser download)
   */
  downloadExport(data: DatabaseExport, filename?: string): void {
    const json = JSON.stringify(data, null, 2);
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename || `typing-tutor-backup-${Date.now()}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  },
};

// ============================================================================
// STEP 82: IMPORT FROM BACKUP
// ============================================================================

export const ImportOperations = {
  /**
   * Import user data from JSON
   */
  async importUserData(data: DatabaseExport, userId: string): Promise<void> {
    // Validate data structure
    if (!data.version || !data.users) {
      throw new Error('Invalid backup file format');
    }

    // Import users
    for (const user of data.users.filter((u: any) => u.id === userId)) {
      await dbExecute(
        `INSERT OR REPLACE INTO users (id, name, age, avatar, created_at, updated_at)
         VALUES (?, ?, ?, ?, ?, ?)`,
        [user.id, user.name, user.age, user.avatar, user.created_at, user.updated_at]
      );
    }

    // Import user settings
    for (const settings of data.user_settings.filter((s: any) => s.user_id === userId)) {
      await dbExecute(
        `INSERT OR REPLACE INTO user_settings (
          user_id, theme, font_size, sound_enabled, music_enabled,
          reduced_motion, dyslexic_font, voice_gender, voice_speed
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          settings.user_id, settings.theme, settings.font_size,
          settings.sound_enabled, settings.music_enabled, settings.reduced_motion,
          settings.dyslexic_font, settings.voice_gender, settings.voice_speed
        ]
      );
    }

    // Import progress
    for (const prog of data.progress.filter((p: any) => p.user_id === userId)) {
      await dbExecute(
        `INSERT OR REPLACE INTO progress (
          user_id, current_level, total_sessions, total_words_typed,
          average_accuracy, average_wpm, streak, last_session_date
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          prog.user_id, prog.current_level, prog.total_sessions,
          prog.total_words_typed, prog.average_accuracy, prog.average_wpm,
          prog.streak, prog.last_session_date
        ]
      );
    }

    // Import achievements
    for (const ach of data.achievements.filter((a: any) => a.user_id === userId)) {
      await dbExecute(
        `INSERT OR IGNORE INTO achievements (
          id, user_id, title, description, icon, category, unlocked_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?)`,
        [ach.id, ach.user_id, ach.title, ach.description, ach.icon, ach.category, ach.unlocked_at]
      );
    }

    // Import custom words
    for (const word of data.custom_words.filter((w: any) => w.user_id === userId)) {
      await dbExecute(
        `INSERT OR REPLACE INTO custom_words (
          id, user_id, word, category, difficulty, image_url,
          pronunciation_url, times_practiced, last_practiced_at, created_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          word.id, word.user_id, word.word, word.category, word.difficulty,
          word.image_url, word.pronunciation_url, word.times_practiced,
          word.last_practiced_at, word.created_at
        ]
      );
    }
  },

  /**
   * Parse backup file from upload
   */
  async parseBackupFile(file: File): Promise<DatabaseExport> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();

      reader.onload = (e) => {
        try {
          const json = e.target?.result as string;
          const data = JSON.parse(json);
          resolve(data);
        } catch (error) {
          reject(new Error('Failed to parse backup file'));
        }
      };

      reader.onerror = () => {
        reject(new Error('Failed to read backup file'));
      };

      reader.readAsText(file);
    });
  },
};

// ============================================================================
// STEP 83: AUTO-BACKUP
// ============================================================================

export const BackupOperations = {
  /**
   * Create automatic backup
   */
  async createBackup(userId?: string): Promise<DatabaseExport> {
    if (userId) {
      return await ExportOperations.exportUserData(userId);
    } else {
      return await ExportOperations.exportAllData();
    }
  },

  /**
   * Save backup to localStorage
   */
  saveToLocalStorage(data: DatabaseExport, key: string = 'typing_tutor_backup'): void {
    try {
      localStorage.setItem(key, JSON.stringify(data));
      localStorage.setItem(`${key}_timestamp`, new Date().toISOString());
    } catch (error) {
      console.error('Failed to save backup to localStorage:', error);
    }
  },

  /**
   * Load backup from localStorage
   */
  loadFromLocalStorage(key: string = 'typing_tutor_backup'): DatabaseExport | null {
    try {
      const data = localStorage.getItem(key);
      if (!data) return null;
      return JSON.parse(data);
    } catch (error) {
      console.error('Failed to load backup from localStorage:', error);
      return null;
    }
  },

  /**
   * Get last backup timestamp
   */
  getLastBackupTime(key: string = 'typing_tutor_backup'): Date | null {
    try {
      const timestamp = localStorage.getItem(`${key}_timestamp`);
      if (!timestamp) return null;
      return new Date(timestamp);
    } catch (error) {
      return null;
    }
  },

  /**
   * Setup auto-backup interval
   */
  setupAutoBackup(intervalHours: number = 24, userId?: string): void {
    const intervalMs = intervalHours * 60 * 60 * 1000;

    setInterval(async () => {
      try {
        const backup = await this.createBackup(userId);
        this.saveToLocalStorage(backup);
        console.log('Auto-backup completed at', new Date());
      } catch (error) {
        console.error('Auto-backup failed:', error);
      }
    }, intervalMs);

    // Also backup on page unload
    window.addEventListener('beforeunload', async () => {
      try {
        const backup = await this.createBackup(userId);
        this.saveToLocalStorage(backup);
      } catch (error) {
        console.error('Backup on unload failed:', error);
      }
    });
  },
};

// ============================================================================
// STEP 84: SYNC MECHANISM (Local storage sync for web version)
// ============================================================================

export const SyncOperations = {
  /**
   * Sync data to cloud (placeholder for future implementation)
   */
  async syncToCloud(_userId: string, _data: DatabaseExport): Promise<boolean> {
    // TODO: Implement cloud sync (e.g., to Firebase, AWS, etc.)
    console.log('Cloud sync not yet implemented');
    return false;
  },

  /**
   * Sync from cloud (placeholder)
   */
  async syncFromCloud(_userId: string): Promise<DatabaseExport | null> {
    // TODO: Implement cloud sync
    console.log('Cloud sync not yet implemented');
    return null;
  },

  /**
   * Check if data needs sync
   */
  needsSync(lastSyncTime: Date, changeTime: Date): boolean {
    return changeTime > lastSyncTime;
  },

  /**
   * Merge local and remote data (conflict resolution)
   */
  mergeData(local: DatabaseExport, remote: DatabaseExport): DatabaseExport {
    // Simple last-write-wins strategy
    const localTime = new Date(local.exportedAt).getTime();
    const remoteTime = new Date(remote.exportedAt).getTime();

    return remoteTime > localTime ? remote : local;
  },
};

// ============================================================================
// STEP 85: DATA VALIDATORS
// ============================================================================

export const ValidationOperations = {
  /**
   * Validate user data
   */
  validateUser(user: any): { valid: boolean; errors: string[] } {
    const errors: string[] = [];

    if (!user.id || typeof user.id !== 'string') {
      errors.push('User ID is required and must be a string');
    }
    if (!user.name || typeof user.name !== 'string') {
      errors.push('User name is required and must be a string');
    }
    if (user.age !== undefined && (typeof user.age !== 'number' || user.age < 0)) {
      errors.push('User age must be a positive number');
    }

    return { valid: errors.length === 0, errors };
  },

  /**
   * Validate session data
   */
  validateSession(session: any): { valid: boolean; errors: string[] } {
    const errors: string[] = [];

    if (!session.id || typeof session.id !== 'string') {
      errors.push('Session ID is required');
    }
    if (!session.user_id) {
      errors.push('User ID is required');
    }
    if (session.accuracy !== undefined && (session.accuracy < 0 || session.accuracy > 100)) {
      errors.push('Accuracy must be between 0 and 100');
    }
    if (session.words_per_minute !== undefined && session.words_per_minute < 0) {
      errors.push('WPM must be non-negative');
    }

    return { valid: errors.length === 0, errors };
  },

  /**
   * Validate backup data
   */
  validateBackup(data: any): { valid: boolean; errors: string[] } {
    const errors: string[] = [];

    if (!data.version) {
      errors.push('Backup version is required');
    }
    if (!data.exportedAt) {
      errors.push('Export timestamp is required');
    }
    if (!Array.isArray(data.users)) {
      errors.push('Users must be an array');
    }
    if (!Array.isArray(data.sessions)) {
      errors.push('Sessions must be an array');
    }

    return { valid: errors.length === 0, errors };
  },
};

// ============================================================================
// STEP 86: DATA ENCRYPTION (Simple obfuscation - for real apps use proper encryption)
// ============================================================================

export const EncryptionOperations = {
  /**
   * Simple encryption (for demonstration - use proper encryption in production)
   */
  encrypt(data: string, key: string): string {
    // Simple XOR encryption (NOT secure for production)
    let encrypted = '';
    for (let i = 0; i < data.length; i++) {
      encrypted += String.fromCharCode(
        data.charCodeAt(i) ^ key.charCodeAt(i % key.length)
      );
    }
    return btoa(encrypted); // Base64 encode
  },

  /**
   * Simple decryption
   */
  decrypt(encrypted: string, key: string): string {
    try {
      const decoded = atob(encrypted);
      let decrypted = '';
      for (let i = 0; i < decoded.length; i++) {
        decrypted += String.fromCharCode(
          decoded.charCodeAt(i) ^ key.charCodeAt(i % key.length)
        );
      }
      return decrypted;
    } catch (error) {
      throw new Error('Decryption failed');
    }
  },

  /**
   * Encrypt backup data
   */
  encryptBackup(data: DatabaseExport, password: string): string {
    const json = JSON.stringify(data);
    return this.encrypt(json, password);
  },

  /**
   * Decrypt backup data
   */
  decryptBackup(encrypted: string, password: string): DatabaseExport {
    const json = this.decrypt(encrypted, password);
    return JSON.parse(json);
  },
};

// ============================================================================
// STEP 87: CLEANUP ROUTINES
// ============================================================================

export const CleanupOperations = {
  /**
   * Clean up old cache entries
   */
  async cleanCache(daysOld: number = 30): Promise<number> {
    const sql = `
      DELETE FROM cache
      WHERE created_at < datetime('now', '-${daysOld} days')
    `;
    const result = await dbExecute(sql);
    return result.changes || 0;
  },

  /**
   * Clean up old sessions
   */
  async cleanOldSessions(userId: string, daysToKeep: number = 365): Promise<number> {
    const sql = `
      DELETE FROM sessions
      WHERE user_id = ?
        AND start_time < datetime('now', '-${daysToKeep} days')
    `;
    const result = await dbExecute(sql, [userId]);
    return result.changes || 0;
  },

  /**
   * Clean up orphaned attempts (sessions that were deleted)
   */
  async cleanOrphanedAttempts(): Promise<number> {
    const sql = `
      DELETE FROM typing_attempts
      WHERE session_id NOT IN (SELECT id FROM sessions)
    `;
    const result = await dbExecute(sql);
    return result.changes || 0;
  },

  /**
   * Vacuum database (optimize size)
   */
  async vacuum(): Promise<void> {
    await dbExecute('VACUUM');
  },

  /**
   * Full cleanup routine
   */
  async fullCleanup(userId: string): Promise<{
    cacheDeleted: number;
    sessionsDeleted: number;
    attemptsDeleted: number;
  }> {
    const cacheDeleted = await this.cleanCache();
    const sessionsDeleted = await this.cleanOldSessions(userId);
    const attemptsDeleted = await this.cleanOrphanedAttempts();
    await this.vacuum();

    return { cacheDeleted, sessionsDeleted, attemptsDeleted };
  },
};

// ============================================================================
// STEP 88: ANALYTICS QUERIES
// ============================================================================

export const AnalyticsOperations = {
  /**
   * Get typing trends over time
   */
  async getTypingTrends(userId: string, days: number = 30): Promise<any[]> {
    const sql = `
      SELECT
        DATE(start_time) as date,
        COUNT(*) as sessions,
        AVG(accuracy) as avg_accuracy,
        AVG(words_per_minute) as avg_wpm,
        SUM(total_words) as total_words
      FROM sessions
      WHERE user_id = ?
        AND start_time >= datetime('now', '-${days} days')
      GROUP BY DATE(start_time)
      ORDER BY date ASC
    `;
    return await dbQuery(sql, [userId]);
  },

  /**
   * Get most common mistakes
   */
  async getCommonMistakes(userId: string, limit: number = 10): Promise<any[]> {
    const sql = `
      SELECT
        from_char,
        to_char,
        pattern_type,
        SUM(frequency) as total_frequency
      FROM mistake_patterns
      WHERE user_id = ?
      GROUP BY from_char, to_char, pattern_type
      ORDER BY total_frequency DESC
      LIMIT ?
    `;
    return await dbQuery(sql, [userId, limit]);
  },

  /**
   * Get performance by level
   */
  async getPerformanceByLevel(userId: string): Promise<any[]> {
    const sql = `
      SELECT
        level,
        COUNT(*) as sessions,
        AVG(accuracy) as avg_accuracy,
        AVG(words_per_minute) as avg_wpm
      FROM sessions
      WHERE user_id = ?
      GROUP BY level
    `;
    return await dbQuery(sql, [userId]);
  },

  /**
   * Get practice time statistics
   */
  async getPracticeTimeStats(userId: string): Promise<any> {
    const sql = `
      SELECT
        COUNT(*) as total_sessions,
        SUM(CASE WHEN start_time >= datetime('now', '-7 days') THEN 1 ELSE 0 END) as sessions_this_week,
        SUM(CASE WHEN start_time >= datetime('now', '-30 days') THEN 1 ELSE 0 END) as sessions_this_month
      FROM sessions
      WHERE user_id = ? AND end_time IS NOT NULL
    `;
    const results = await dbQuery(sql, [userId]);
    return results[0];
  },
};

// ============================================================================
// STEP 90: REPORT GENERATOR
// ============================================================================

export const ReportOperations = {
  /**
   * Generate progress report
   */
  async generateProgressReport(
    userId: string,
    startDate: Date,
    endDate: Date
  ): Promise<any> {
    // Get user info
    const user = await UserOperations.getById(userId);

    // Get sessions in range
    const sql = `
      SELECT * FROM sessions
      WHERE user_id = ?
        AND start_time >= ?
        AND start_time <= ?
      ORDER BY start_time ASC
    `;
    const sessions = await dbQuery(sql, [
      userId,
      startDate.toISOString(),
      endDate.toISOString(),
    ]);

    // Calculate statistics
    const totalSessions = sessions.length;
    const totalWords = sessions.reduce((sum: number, s: any) => sum + (s.total_words || 0), 0);
    const avgAccuracy = sessions.reduce((sum: number, s: any) => sum + (s.accuracy || 0), 0) / totalSessions || 0;
    const avgWpm = sessions.reduce((sum: number, s: any) => sum + (s.words_per_minute || 0), 0) / totalSessions || 0;

    // Get improvement rate
    const improvementRate = await ProgressOperations.getImprovementRate(userId);

    // Get achievements in range
    const achievements = await dbQuery(
      `SELECT * FROM achievements
       WHERE user_id = ?
         AND unlocked_at >= ?
         AND unlocked_at <= ?`,
      [userId, startDate.toISOString(), endDate.toISOString()]
    );

    // Determine strengths and areas to improve
    const strengths: string[] = [];
    const areasToImprove: string[] = [];

    if (avgAccuracy >= 90) {
      strengths.push('High accuracy');
    } else if (avgAccuracy < 70) {
      areasToImprove.push('Focus on accuracy');
    }

    if (avgWpm >= 30) {
      strengths.push('Good typing speed');
    } else if (avgWpm < 15) {
      areasToImprove.push('Practice for better speed');
    }

    const report = {
      id: `report-${Date.now()}`,
      user_id: userId,
      report_type: 'progress',
      title: `Progress Report for ${user.name}`,
      start_date: startDate.toISOString().split('T')[0],
      end_date: endDate.toISOString().split('T')[0],
      total_sessions: totalSessions,
      total_words: totalWords,
      average_accuracy: avgAccuracy,
      average_wpm: avgWpm,
      improvement_rate: improvementRate,
      strengths: strengths.join(', '),
      areas_to_improve: areasToImprove.join(', '),
      achievements_earned: achievements.map((a: any) => a.title).join(', '),
      generated_at: new Date().toISOString(),
      data_json: JSON.stringify({ sessions, achievements }),
    };

    // Save report to database
    await dbExecute(
      `INSERT INTO reports (
        id, user_id, report_type, title, start_date, end_date,
        total_sessions, total_words, average_accuracy, average_wpm,
        improvement_rate, strengths, areas_to_improve, achievements_earned, data_json
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        report.id, report.user_id, report.report_type, report.title,
        report.start_date, report.end_date, report.total_sessions,
        report.total_words, report.average_accuracy, report.average_wpm,
        report.improvement_rate, report.strengths, report.areas_to_improve,
        report.achievements_earned, report.data_json,
      ]
    );

    return report;
  },

  /**
   * Get saved reports
   */
  async getReports(userId: string): Promise<any[]> {
    const sql = `
      SELECT * FROM reports
      WHERE user_id = ?
      ORDER BY generated_at DESC
    `;
    return await dbQuery(sql, [userId]);
  },

  /**
   * Export report as PDF-ready format
   */
  async formatReportForExport(reportId: string): Promise<any> {
    const sql = 'SELECT * FROM reports WHERE id = ?';
    const results = await dbQuery(sql, [reportId]);

    if (results.length === 0) {
      throw new Error('Report not found');
    }

    const report = results[0];
    const data = JSON.parse(report.data_json);

    return {
      ...report,
      sessions: data.sessions,
      achievements: data.achievements,
      formattedDate: new Date(report.generated_at).toLocaleDateString(),
    };
  },
};

// ============================================================================
// Export all utilities
// ============================================================================

export default {
  Export: ExportOperations,
  Import: ImportOperations,
  Backup: BackupOperations,
  Sync: SyncOperations,
  Validation: ValidationOperations,
  Encryption: EncryptionOperations,
  Cleanup: CleanupOperations,
  Analytics: AnalyticsOperations,
  Report: ReportOperations,
};
