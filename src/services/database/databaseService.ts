/**
 * Database Service for Renderer Process
 * Uses IPC to communicate with Electron main process database
 */

import { UserProfile, Progress, TypingSession, Achievement } from '../../types';

// Check if we're running in Electron
const isElectron = typeof window !== 'undefined' && window.electronAPI;

/**
 * Browser fallback using localStorage
 */
const browserStorage = {
  getUsers(): any[] {
    const data = localStorage.getItem('typing_tutor_users');
    return data ? JSON.parse(data) : [];
  },
  saveUsers(users: any[]): void {
    localStorage.setItem('typing_tutor_users', JSON.stringify(users));
  },
  addUser(user: any): void {
    const users = this.getUsers();
    users.push(user);
    this.saveUsers(users);
  }
};

/**
 * Execute a database query
 */
export async function dbQuery<T = any>(sql: string, params: any[] = []): Promise<T[]> {
  if (!isElectron) {
    console.log('Using browser localStorage fallback');
    // Simple fallback for common queries
    if (sql.includes('SELECT') && sql.includes('FROM users')) {
      return browserStorage.getUsers() as T[];
    }
    return [];
  }

  try {
    return await window.electronAPI.dbQuery(sql, params);
  } catch (error) {
    console.error('Database query error:', error);
    throw error;
  }
}

/**
 * Execute a database statement
 */
export async function dbExecute(sql: string, params: any[] = []): Promise<any> {
  if (!isElectron) {
    console.log('Using browser localStorage fallback');
    return { changes: 1 };
  }

  try {
    return await window.electronAPI.dbExecute(sql, params);
  } catch (error) {
    console.error('Database execute error:', error);
    throw error;
  }
}

// Legacy function names for backwards compatibility
async function query<T>(sql: string, params: any[] = []): Promise<T[]> {
  return dbQuery<T>(sql, params);
}

async function execute(sql: string, params: any[] = []): Promise<any> {
  return dbExecute(sql, params);
}

// User operations
export const UserDB = {
  async create(user: UserProfile): Promise<void> {
    if (!isElectron) {
      // Browser mode: save to localStorage
      browserStorage.addUser({
        id: user.id,
        name: user.name,
        age: user.age,
        avatar: user.avatar,
        created_at: user.createdAt.toISOString(),
        ...user.settings
      });
      console.log('Profile saved to localStorage:', user.name);
      return;
    }

    // Electron mode: use SQLite
    await execute(
      'INSERT INTO users (id, name, age, avatar, created_at) VALUES (?, ?, ?, ?, ?)',
      [user.id, user.name, user.age || null, user.avatar || null, user.createdAt.toISOString()]
    );

    // Create default settings
    await execute(
      `INSERT INTO user_settings (user_id, theme, font_size, sound_enabled, music_enabled,
       reduced_motion, dyslexic_font, voice_gender, voice_speed)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        user.id,
        user.settings.theme,
        user.settings.fontSize,
        user.settings.soundEnabled ? 1 : 0,
        user.settings.musicEnabled ? 1 : 0,
        user.settings.reducedMotion ? 1 : 0,
        user.settings.dyslexicFont ? 1 : 0,
        user.settings.voiceGender,
        user.settings.voiceSpeed,
      ]
    );

    // Initialize progress
    await execute('INSERT INTO progress (user_id) VALUES (?)', [user.id]);
  },

  async getAll(): Promise<UserProfile[]> {
    const users = await query<any>(
      `SELECT u.*, s.* FROM users u
       LEFT JOIN user_settings s ON u.id = s.user_id`
    );

    return users.map((row: any) => ({
      id: row.id,
      name: row.name,
      age: row.age,
      avatar: row.avatar,
      createdAt: new Date(row.created_at),
      settings: {
        theme: row.theme,
        fontSize: row.font_size,
        soundEnabled: Boolean(row.sound_enabled),
        musicEnabled: Boolean(row.music_enabled),
        reducedMotion: Boolean(row.reduced_motion),
        dyslexicFont: Boolean(row.dyslexic_font),
        voiceGender: row.voice_gender,
        voiceSpeed: row.voice_speed,
        soundEffects: row.sound_effects !== undefined ? Boolean(row.sound_effects) : true,
        volume: row.volume !== undefined ? row.volume : 70,
        hapticFeedback: row.haptic_feedback !== undefined ? Boolean(row.haptic_feedback) : true,
        keyboardTheme: row.keyboard_theme || 'default',
      },
    }));
  },

  async getById(id: string): Promise<UserProfile | null> {
    const users = await query<any>(
      `SELECT u.*, s.* FROM users u
       LEFT JOIN user_settings s ON u.id = s.user_id
       WHERE u.id = ?`,
      [id]
    );

    if (users.length === 0) return null;

    const row = users[0];
    return {
      id: row.id,
      name: row.name,
      age: row.age,
      avatar: row.avatar,
      createdAt: new Date(row.created_at),
      settings: {
        theme: row.theme,
        fontSize: row.font_size,
        soundEnabled: Boolean(row.sound_enabled),
        musicEnabled: Boolean(row.music_enabled),
        reducedMotion: Boolean(row.reduced_motion),
        dyslexicFont: Boolean(row.dyslexic_font),
        voiceGender: row.voice_gender,
        voiceSpeed: row.voice_speed,
        soundEffects: row.sound_effects !== undefined ? Boolean(row.sound_effects) : true,
        volume: row.volume !== undefined ? row.volume : 70,
        hapticFeedback: row.haptic_feedback !== undefined ? Boolean(row.haptic_feedback) : true,
        keyboardTheme: row.keyboard_theme || 'default',
      },
    };
  },

  async update(id: string, updates: Partial<UserProfile>): Promise<void> {
    if (updates.name || updates.age || updates.avatar) {
      const fields: string[] = [];
      const values: any[] = [];

      if (updates.name) {
        fields.push('name = ?');
        values.push(updates.name);
      }
      if (updates.age !== undefined) {
        fields.push('age = ?');
        values.push(updates.age);
      }
      if (updates.avatar) {
        fields.push('avatar = ?');
        values.push(updates.avatar);
      }

      fields.push('updated_at = ?');
      values.push(new Date().toISOString());
      values.push(id);

      await execute(`UPDATE users SET ${fields.join(', ')} WHERE id = ?`, values);
    }

    if (updates.settings) {
      await execute(
        `UPDATE user_settings SET
         theme = ?, font_size = ?, sound_enabled = ?, music_enabled = ?,
         reduced_motion = ?, dyslexic_font = ?, voice_gender = ?, voice_speed = ?
         WHERE user_id = ?`,
        [
          updates.settings.theme,
          updates.settings.fontSize,
          updates.settings.soundEnabled ? 1 : 0,
          updates.settings.musicEnabled ? 1 : 0,
          updates.settings.reducedMotion ? 1 : 0,
          updates.settings.dyslexicFont ? 1 : 0,
          updates.settings.voiceGender,
          updates.settings.voiceSpeed,
          id,
        ]
      );
    }
  },

  async delete(id: string): Promise<void> {
    await execute('DELETE FROM users WHERE id = ?', [id]);
  },
};

// Session operations
export const SessionDB = {
  async create(session: TypingSession): Promise<void> {
    await execute(
      `INSERT INTO sessions (id, user_id, start_time, level, total_words, correct_words, accuracy, words_per_minute)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        session.id,
        session.userId,
        session.startTime.toISOString(),
        session.level,
        session.totalWords,
        session.correctWords,
        session.accuracy,
        session.wordsPerMinute,
      ]
    );
  },

  async update(id: string, updates: Partial<TypingSession>): Promise<void> {
    const fields: string[] = [];
    const values: any[] = [];

    if (updates.endTime) {
      fields.push('end_time = ?');
      values.push(updates.endTime.toISOString());
    }
    if (updates.totalWords !== undefined) {
      fields.push('total_words = ?');
      values.push(updates.totalWords);
    }
    if (updates.correctWords !== undefined) {
      fields.push('correct_words = ?');
      values.push(updates.correctWords);
    }
    if (updates.accuracy !== undefined) {
      fields.push('accuracy = ?');
      values.push(updates.accuracy);
    }
    if (updates.wordsPerMinute !== undefined) {
      fields.push('words_per_minute = ?');
      values.push(updates.wordsPerMinute);
    }

    values.push(id);

    if (fields.length > 0) {
      await execute(`UPDATE sessions SET ${fields.join(', ')} WHERE id = ?`, values);
    }
  },

  async getByUserId(userId: string, limit: number = 10): Promise<TypingSession[]> {
    const rows = await query<any>(
      'SELECT * FROM sessions WHERE user_id = ? ORDER BY start_time DESC LIMIT ?',
      [userId, limit]
    );

    return rows.map((row) => ({
      id: row.id,
      userId: row.user_id,
      startTime: new Date(row.start_time),
      endTime: row.end_time ? new Date(row.end_time) : undefined,
      level: row.level,
      exercises: [],
      totalWords: row.total_words,
      correctWords: row.correct_words,
      accuracy: row.accuracy,
      wordsPerMinute: row.words_per_minute,
    }));
  },
};

// Progress operations
export const ProgressDB = {
  async get(userId: string): Promise<Progress | null> {
    const rows = await query<any>('SELECT * FROM progress WHERE user_id = ?', [userId]);

    if (rows.length === 0) return null;

    const row = rows[0];
    return {
      userId: row.user_id,
      currentLevel: row.current_level,
      totalSessions: row.total_sessions,
      totalWordsTyped: row.total_words_typed,
      averageAccuracy: row.average_accuracy,
      averageWPM: row.average_wpm,
      streak: row.streak,
      lastSessionDate: row.last_session_date ? new Date(row.last_session_date) : new Date(),
      achievements: [], // Will be loaded separately
    };
  },

  async update(userId: string, updates: Partial<Progress>): Promise<void> {
    const fields: string[] = [];
    const values: any[] = [];

    if (updates.currentLevel) {
      fields.push('current_level = ?');
      values.push(updates.currentLevel);
    }
    if (updates.totalSessions !== undefined) {
      fields.push('total_sessions = ?');
      values.push(updates.totalSessions);
    }
    if (updates.totalWordsTyped !== undefined) {
      fields.push('total_words_typed = ?');
      values.push(updates.totalWordsTyped);
    }
    if (updates.averageAccuracy !== undefined) {
      fields.push('average_accuracy = ?');
      values.push(updates.averageAccuracy);
    }
    if (updates.averageWPM !== undefined) {
      fields.push('average_wpm = ?');
      values.push(updates.averageWPM);
    }
    if (updates.streak !== undefined) {
      fields.push('streak = ?');
      values.push(updates.streak);
    }
    if (updates.lastSessionDate) {
      fields.push('last_session_date = ?');
      values.push(updates.lastSessionDate.toISOString().split('T')[0]);
    }

    values.push(userId);

    if (fields.length > 0) {
      await execute(`UPDATE progress SET ${fields.join(', ')} WHERE user_id = ?`, values);
    }
  },
};

// Achievement operations
export const AchievementDB = {
  async create(achievement: Achievement, userId: string): Promise<void> {
    await execute(
      `INSERT INTO achievements (id, user_id, title, description, icon, category, unlocked_at)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [
        achievement.id,
        userId,
        achievement.title,
        achievement.description,
        achievement.icon,
        achievement.category,
        achievement.unlockedAt.toISOString(),
      ]
    );
  },

  async getByUserId(userId: string): Promise<Achievement[]> {
    const rows = await query<any>('SELECT * FROM achievements WHERE user_id = ?', [userId]);

    return rows.map((row) => ({
      id: row.id,
      title: row.title,
      description: row.description,
      icon: row.icon,
      category: row.category,
      unlockedAt: new Date(row.unlocked_at),
    }));
  },
};

export default {
  UserDB,
  SessionDB,
  ProgressDB,
  AchievementDB,
};
