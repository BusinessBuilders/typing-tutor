/**
 * Advanced Database Operations Module
 * Settings, Word Lists, Attempts, and Cache Management
 * Steps 77-80 implementation
 */

import { dbQuery, dbExecute } from './databaseService';

// ============================================================================
// STEP 77: SETTINGS PERSISTENCE
// ============================================================================

export interface UserSettings {
  user_id: string;
  theme: string;
  font_size: string;
  sound_enabled: boolean;
  music_enabled: boolean;
  reduced_motion: boolean;
  dyslexic_font: boolean;
  voice_gender: string;
  voice_speed: number;
}

export const SettingsOperations = {
  /**
   * Get user settings
   */
  async get(userId: string): Promise<UserSettings> {
    const sql = 'SELECT * FROM user_settings WHERE user_id = ?';
    const results = await dbQuery(sql, [userId]);

    if (results.length === 0) {
      // Create default settings
      return this.createDefaults(userId);
    }

    // Convert SQLite integers to booleans
    const settings = results[0];
    return {
      ...settings,
      sound_enabled: Boolean(settings.sound_enabled),
      music_enabled: Boolean(settings.music_enabled),
      reduced_motion: Boolean(settings.reduced_motion),
      dyslexic_font: Boolean(settings.dyslexic_font),
    } as UserSettings;
  },

  /**
   * Create default settings
   */
  async createDefaults(userId: string): Promise<UserSettings> {
    const defaults = {
      user_id: userId,
      theme: 'light',
      font_size: 'medium',
      sound_enabled: true,
      music_enabled: false,
      reduced_motion: false,
      dyslexic_font: false,
      voice_gender: 'neutral',
      voice_speed: 1.0,
    };

    const sql = `
      INSERT INTO user_settings (
        user_id, theme, font_size, sound_enabled, music_enabled,
        reduced_motion, dyslexic_font, voice_gender, voice_speed
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;

    await dbExecute(sql, [
      defaults.user_id,
      defaults.theme,
      defaults.font_size,
      defaults.sound_enabled ? 1 : 0,
      defaults.music_enabled ? 1 : 0,
      defaults.reduced_motion ? 1 : 0,
      defaults.dyslexic_font ? 1 : 0,
      defaults.voice_gender,
      defaults.voice_speed,
    ]);

    return defaults;
  },

  /**
   * Update settings
   */
  async update(userId: string, settings: Partial<Omit<UserSettings, 'user_id'>>): Promise<UserSettings> {
    const fields: string[] = [];
    const values: any[] = [];

    if (settings.theme !== undefined) {
      fields.push('theme = ?');
      values.push(settings.theme);
    }
    if (settings.font_size !== undefined) {
      fields.push('font_size = ?');
      values.push(settings.font_size);
    }
    if (settings.sound_enabled !== undefined) {
      fields.push('sound_enabled = ?');
      values.push(settings.sound_enabled ? 1 : 0);
    }
    if (settings.music_enabled !== undefined) {
      fields.push('music_enabled = ?');
      values.push(settings.music_enabled ? 1 : 0);
    }
    if (settings.reduced_motion !== undefined) {
      fields.push('reduced_motion = ?');
      values.push(settings.reduced_motion ? 1 : 0);
    }
    if (settings.dyslexic_font !== undefined) {
      fields.push('dyslexic_font = ?');
      values.push(settings.dyslexic_font ? 1 : 0);
    }
    if (settings.voice_gender !== undefined) {
      fields.push('voice_gender = ?');
      values.push(settings.voice_gender);
    }
    if (settings.voice_speed !== undefined) {
      fields.push('voice_speed = ?');
      values.push(settings.voice_speed);
    }

    if (fields.length === 0) {
      return this.get(userId);
    }

    values.push(userId);
    const sql = `UPDATE user_settings SET ${fields.join(', ')} WHERE user_id = ?`;
    await dbExecute(sql, values);

    return this.get(userId);
  },

  /**
   * Reset to defaults
   */
  async reset(userId: string): Promise<UserSettings> {
    await dbExecute('DELETE FROM user_settings WHERE user_id = ?', [userId]);
    return this.createDefaults(userId);
  },
};

// ============================================================================
// STEP 78: WORD LIST MANAGER
// ============================================================================

export interface CustomWord {
  id: string;
  user_id: string;
  word: string;
  category?: string;
  difficulty: 'easy' | 'medium' | 'hard';
  image_url?: string;
  pronunciation_url?: string;
  times_practiced: number;
  last_practiced_at?: string;
  created_at: string;
}

export const WordListOperations = {
  /**
   * Add custom word
   */
  async add(word: Omit<CustomWord, 'times_practiced' | 'created_at'>): Promise<CustomWord> {
    const sql = `
      INSERT INTO custom_words (
        id, user_id, word, category, difficulty, image_url, pronunciation_url
      ) VALUES (?, ?, ?, ?, ?, ?, ?)
    `;
    await dbExecute(sql, [
      word.id,
      word.user_id,
      word.word,
      word.category || null,
      word.difficulty,
      word.image_url || null,
      word.pronunciation_url || null,
    ]);

    return this.getById(word.id);
  },

  /**
   * Get word by ID
   */
  async getById(id: string): Promise<CustomWord> {
    const sql = 'SELECT * FROM custom_words WHERE id = ?';
    const results = await dbQuery(sql, [id]);
    if (results.length === 0) {
      throw new Error(`Custom word not found: ${id}`);
    }
    return results[0] as CustomWord;
  },

  /**
   * Get user's custom words
   */
  async getByUserId(userId: string, filters?: {
    category?: string;
    difficulty?: string;
  }): Promise<CustomWord[]> {
    let sql = 'SELECT * FROM custom_words WHERE user_id = ?';
    const params: any[] = [userId];

    if (filters?.category) {
      sql += ' AND category = ?';
      params.push(filters.category);
    }

    if (filters?.difficulty) {
      sql += ' AND difficulty = ?';
      params.push(filters.difficulty);
    }

    sql += ' ORDER BY created_at DESC';

    const results = await dbQuery(sql, params);
    return results as CustomWord[];
  },

  /**
   * Update word
   */
  async update(id: string, updates: Partial<Omit<CustomWord, 'id' | 'user_id' | 'created_at'>>): Promise<CustomWord> {
    const fields: string[] = [];
    const values: any[] = [];

    if (updates.word !== undefined) {
      fields.push('word = ?');
      values.push(updates.word);
    }
    if (updates.category !== undefined) {
      fields.push('category = ?');
      values.push(updates.category);
    }
    if (updates.difficulty !== undefined) {
      fields.push('difficulty = ?');
      values.push(updates.difficulty);
    }
    if (updates.image_url !== undefined) {
      fields.push('image_url = ?');
      values.push(updates.image_url);
    }

    if (fields.length === 0) {
      return this.getById(id);
    }

    values.push(id);
    const sql = `UPDATE custom_words SET ${fields.join(', ')} WHERE id = ?`;
    await dbExecute(sql, values);

    return this.getById(id);
  },

  /**
   * Record practice
   */
  async recordPractice(wordId: string): Promise<void> {
    const sql = `
      UPDATE custom_words
      SET times_practiced = times_practiced + 1,
          last_practiced_at = datetime('now')
      WHERE id = ?
    `;
    await dbExecute(sql, [wordId]);
  },

  /**
   * Delete word
   */
  async delete(id: string): Promise<boolean> {
    const sql = 'DELETE FROM custom_words WHERE id = ?';
    const result = await dbExecute(sql, [id]);
    return result.changes > 0;
  },

  /**
   * Get words needing practice
   */
  async getNeedingPractice(userId: string, limit: number = 10): Promise<CustomWord[]> {
    const sql = `
      SELECT * FROM custom_words
      WHERE user_id = ?
      ORDER BY times_practiced ASC, last_practiced_at ASC NULLS FIRST
      LIMIT ?
    `;
    const results = await dbQuery(sql, [userId, limit]);
    return results as CustomWord[];
  },
};

// ============================================================================
// STEP 79: ATTEMPT RECORDER
// ============================================================================

export interface TypingAttempt {
  id: string;
  session_id: string;
  exercise_id: string;
  user_id: string;
  expected_text: string;
  typed_text: string;
  is_correct: boolean;
  time_taken: number; // milliseconds
  wpm: number;
  accuracy: number;
  mistakes_count: number;
  backspace_count: number;
  hint_used: boolean;
  timestamp: string;
}

export const AttemptOperations = {
  /**
   * Record typing attempt
   */
  async record(attempt: Omit<TypingAttempt, 'timestamp'>): Promise<TypingAttempt> {
    const sql = `
      INSERT INTO typing_attempts (
        id, session_id, exercise_id, user_id, expected_text, typed_text,
        is_correct, time_taken, wpm, accuracy, mistakes_count,
        backspace_count, hint_used
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;

    await dbExecute(sql, [
      attempt.id,
      attempt.session_id,
      attempt.exercise_id,
      attempt.user_id,
      attempt.expected_text,
      attempt.typed_text,
      attempt.is_correct ? 1 : 0,
      attempt.time_taken,
      attempt.wpm,
      attempt.accuracy,
      attempt.mistakes_count,
      attempt.backspace_count,
      attempt.hint_used ? 1 : 0,
    ]);

    // Also record mistake patterns
    if (attempt.mistakes_count > 0) {
      await this.analyzeMistakes(attempt);
    }

    return this.getById(attempt.id);
  },

  /**
   * Get attempt by ID
   */
  async getById(id: string): Promise<TypingAttempt> {
    const sql = 'SELECT * FROM typing_attempts WHERE id = ?';
    const results = await dbQuery(sql, [id]);
    if (results.length === 0) {
      throw new Error(`Attempt not found: ${id}`);
    }

    const attempt = results[0];
    return {
      ...attempt,
      is_correct: Boolean(attempt.is_correct),
      hint_used: Boolean(attempt.hint_used),
    } as TypingAttempt;
  },

  /**
   * Get session attempts
   */
  async getBySessionId(sessionId: string): Promise<TypingAttempt[]> {
    const sql = 'SELECT * FROM typing_attempts WHERE session_id = ? ORDER BY timestamp ASC';
    const results = await dbQuery(sql, [sessionId]);
    return results.map((r: any) => ({
      ...r,
      is_correct: Boolean(r.is_correct),
      hint_used: Boolean(r.hint_used),
    })) as TypingAttempt[];
  },

  /**
   * Get user attempts
   */
  async getByUserId(userId: string, limit: number = 100): Promise<TypingAttempt[]> {
    const sql = `
      SELECT * FROM typing_attempts
      WHERE user_id = ?
      ORDER BY timestamp DESC
      LIMIT ?
    `;
    const results = await dbQuery(sql, [userId, limit]);
    return results.map((r: any) => ({
      ...r,
      is_correct: Boolean(r.is_correct),
      hint_used: Boolean(r.hint_used),
    })) as TypingAttempt[];
  },

  /**
   * Analyze mistakes and store patterns
   */
  async analyzeMistakes(attempt: Omit<TypingAttempt, 'timestamp'>): Promise<void> {
    const expected = attempt.expected_text;
    const typed = attempt.typed_text;

    // Simple character-by-character comparison
    for (let i = 0; i < Math.max(expected.length, typed.length); i++) {
      const expectedChar = expected[i] || '';
      const typedChar = typed[i] || '';

      if (expectedChar !== typedChar) {
        await MistakePatternOperations.record(attempt.user_id, {
          pattern_type: typedChar ? 'substitution' : 'omission',
          from_char: expectedChar,
          to_char: typedChar,
          word_context: expected,
        });
      }
    }
  },

  /**
   * Get attempt statistics
   */
  async getStats(userId: string, days: number = 30): Promise<{
    total_attempts: number;
    correct_attempts: number;
    average_wpm: number;
    average_accuracy: number;
    total_mistakes: number;
  }> {
    const sql = `
      SELECT
        COUNT(*) as total_attempts,
        SUM(CASE WHEN is_correct = 1 THEN 1 ELSE 0 END) as correct_attempts,
        AVG(wpm) as average_wpm,
        AVG(accuracy) as average_accuracy,
        SUM(mistakes_count) as total_mistakes
      FROM typing_attempts
      WHERE user_id = ?
        AND timestamp >= datetime('now', '-${days} days')
    `;

    const results = await dbQuery(sql, [userId]);
    return results[0];
  },
};

// ============================================================================
// MISTAKE PATTERNS (Helper for Step 79)
// ============================================================================

export interface MistakePattern {
  id: number;
  user_id: string;
  pattern_type: string;
  from_char?: string;
  to_char?: string;
  word_context?: string;
  frequency: number;
  first_occurrence: string;
  last_occurrence: string;
}

export const MistakePatternOperations = {
  /**
   * Record mistake pattern
   */
  async record(
    userId: string,
    pattern: {
      pattern_type: string;
      from_char?: string;
      to_char?: string;
      word_context?: string;
    }
  ): Promise<void> {
    // Check if pattern exists
    const checkSql = `
      SELECT id, frequency FROM mistake_patterns
      WHERE user_id = ?
        AND pattern_type = ?
        AND from_char IS ?
        AND to_char IS ?
    `;

    const existing = await dbQuery(checkSql, [
      userId,
      pattern.pattern_type,
      pattern.from_char || null,
      pattern.to_char || null,
    ]);

    if (existing.length > 0) {
      // Update frequency
      const updateSql = `
        UPDATE mistake_patterns
        SET frequency = frequency + 1,
            last_occurrence = datetime('now')
        WHERE id = ?
      `;
      await dbExecute(updateSql, [existing[0].id]);
    } else {
      // Insert new pattern
      const insertSql = `
        INSERT INTO mistake_patterns (
          user_id, pattern_type, from_char, to_char, word_context
        ) VALUES (?, ?, ?, ?, ?)
      `;
      await dbExecute(insertSql, [
        userId,
        pattern.pattern_type,
        pattern.from_char || null,
        pattern.to_char || null,
        pattern.word_context || null,
      ]);
    }
  },

  /**
   * Get user's most common mistakes
   */
  async getTopPatterns(userId: string, limit: number = 10): Promise<MistakePattern[]> {
    const sql = `
      SELECT * FROM mistake_patterns
      WHERE user_id = ?
      ORDER BY frequency DESC
      LIMIT ?
    `;
    const results = await dbQuery(sql, [userId, limit]);
    return results as MistakePattern[];
  },

  /**
   * Clear old patterns
   */
  async cleanup(userId: string, daysOld: number = 90): Promise<number> {
    const sql = `
      DELETE FROM mistake_patterns
      WHERE user_id = ?
        AND last_occurrence < datetime('now', '-${daysOld} days')
    `;
    const result = await dbExecute(sql, [userId]);
    return result.changes;
  },
};

// ============================================================================
// STEP 80: CACHE MANAGER
// ============================================================================

export interface CacheEntry {
  key: string;
  value: string;
  created_at: string;
  expires_at?: string;
}

export const CacheOperations = {
  /**
   * Set cache entry
   */
  async set(key: string, value: any, ttlSeconds?: number): Promise<void> {
    const valueStr = typeof value === 'string' ? value : JSON.stringify(value);
    const expiresAt = ttlSeconds
      ? new Date(Date.now() + ttlSeconds * 1000).toISOString()
      : null;

    const sql = `
      INSERT INTO cache (key, value, expires_at)
      VALUES (?, ?, ?)
      ON CONFLICT(key) DO UPDATE SET
        value = excluded.value,
        created_at = CURRENT_TIMESTAMP,
        expires_at = excluded.expires_at
    `;

    await dbExecute(sql, [key, valueStr, expiresAt]);
  },

  /**
   * Get cache entry
   */
  async get<T = any>(key: string): Promise<T | null> {
    const sql = `
      SELECT * FROM cache
      WHERE key = ?
        AND (expires_at IS NULL OR expires_at > datetime('now'))
    `;

    const results = await dbQuery(sql, [key]);
    if (results.length === 0) {
      return null;
    }

    try {
      return JSON.parse(results[0].value) as T;
    } catch {
      return results[0].value as T;
    }
  },

  /**
   * Delete cache entry
   */
  async delete(key: string): Promise<boolean> {
    const sql = 'DELETE FROM cache WHERE key = ?';
    const result = await dbExecute(sql, [key]);
    return result.changes > 0;
  },

  /**
   * Clear expired entries
   */
  async clearExpired(): Promise<number> {
    const sql = "DELETE FROM cache WHERE expires_at IS NOT NULL AND expires_at <= datetime('now')";
    const result = await dbExecute(sql);
    return result.changes;
  },

  /**
   * Clear all cache
   */
  async clearAll(): Promise<number> {
    const sql = 'DELETE FROM cache';
    const result = await dbExecute(sql);
    return result.changes;
  },

  /**
   * Get cache stats
   */
  async getStats(): Promise<{
    total_entries: number;
    expired_entries: number;
    total_size_bytes: number;
  }> {
    const sql = `
      SELECT
        COUNT(*) as total_entries,
        SUM(CASE WHEN expires_at IS NOT NULL AND expires_at <= datetime('now')
            THEN 1 ELSE 0 END) as expired_entries,
        SUM(LENGTH(value)) as total_size_bytes
      FROM cache
    `;

    const results = await dbQuery(sql);
    return results[0];
  },
};

// ============================================================================
// Export all operations
// ============================================================================

export default {
  Settings: SettingsOperations,
  WordList: WordListOperations,
  Attempt: AttemptOperations,
  MistakePattern: MistakePatternOperations,
  Cache: CacheOperations,
};
