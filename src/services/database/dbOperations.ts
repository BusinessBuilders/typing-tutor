/**
 * Database Operations Module
 * Comprehensive CRUD and analytical operations for all database tables
 * Steps 73-80 implementation
 */

import { dbQuery, dbExecute } from './databaseService';

// ============================================================================
// STEP 73: USER CRUD OPERATIONS
// ============================================================================

export interface User {
  id: string;
  name: string;
  age?: number;
  avatar?: string;
  created_at: string;
  updated_at: string;
}

export const UserOperations = {
  /**
   * Create a new user
   */
  async create(user: Omit<User, 'created_at' | 'updated_at'>): Promise<User> {
    const sql = `
      INSERT INTO users (id, name, age, avatar)
      VALUES (?, ?, ?, ?)
    `;
    await dbExecute(sql, [user.id, user.name, user.age || null, user.avatar || null]);
    return this.getById(user.id);
  },

  /**
   * Get user by ID
   */
  async getById(id: string): Promise<User> {
    const sql = 'SELECT * FROM users WHERE id = ?';
    const results = await dbQuery(sql, [id]);
    if (results.length === 0) {
      throw new Error(`User not found: ${id}`);
    }
    return results[0] as User;
  },

  /**
   * Get all users
   */
  async getAll(): Promise<User[]> {
    const sql = 'SELECT * FROM users ORDER BY created_at DESC';
    const results = await dbQuery(sql);
    return results as User[];
  },

  /**
   * Update user
   */
  async update(id: string, updates: Partial<Omit<User, 'id' | 'created_at'>>): Promise<User> {
    const fields: string[] = [];
    const values: any[] = [];

    if (updates.name !== undefined) {
      fields.push('name = ?');
      values.push(updates.name);
    }
    if (updates.age !== undefined) {
      fields.push('age = ?');
      values.push(updates.age);
    }
    if (updates.avatar !== undefined) {
      fields.push('avatar = ?');
      values.push(updates.avatar);
    }

    fields.push('updated_at = CURRENT_TIMESTAMP');
    values.push(id);

    const sql = `UPDATE users SET ${fields.join(', ')} WHERE id = ?`;
    await dbExecute(sql, values);
    return this.getById(id);
  },

  /**
   * Delete user
   */
  async delete(id: string): Promise<boolean> {
    const sql = 'DELETE FROM users WHERE id = ?';
    const result = await dbExecute(sql, [id]);
    return result.changes > 0;
  },

  /**
   * Check if user exists
   */
  async exists(id: string): Promise<boolean> {
    const sql = 'SELECT COUNT(*) as count FROM users WHERE id = ?';
    const results = await dbQuery(sql, [id]);
    return results[0].count > 0;
  },
};

// ============================================================================
// STEP 74: SESSION LOGGING
// ============================================================================

export interface Session {
  id: string;
  user_id: string;
  start_time: string;
  end_time?: string;
  level: string;
  total_words: number;
  correct_words: number;
  accuracy: number;
  words_per_minute: number;
}

export const SessionOperations = {
  /**
   * Start a new session
   */
  async start(sessionData: {
    id: string;
    user_id: string;
    level: string;
  }): Promise<Session> {
    const sql = `
      INSERT INTO sessions (id, user_id, start_time, level)
      VALUES (?, ?, datetime('now'), ?)
    `;
    await dbExecute(sql, [sessionData.id, sessionData.user_id, sessionData.level]);
    return this.getById(sessionData.id);
  },

  /**
   * End a session
   */
  async end(
    sessionId: string,
    stats: {
      total_words: number;
      correct_words: number;
      accuracy: number;
      words_per_minute: number;
    }
  ): Promise<Session> {
    const sql = `
      UPDATE sessions
      SET end_time = datetime('now'),
          total_words = ?,
          correct_words = ?,
          accuracy = ?,
          words_per_minute = ?
      WHERE id = ?
    `;
    await dbExecute(sql, [
      stats.total_words,
      stats.correct_words,
      stats.accuracy,
      stats.words_per_minute,
      sessionId,
    ]);
    return this.getById(sessionId);
  },

  /**
   * Get session by ID
   */
  async getById(id: string): Promise<Session> {
    const sql = 'SELECT * FROM sessions WHERE id = ?';
    const results = await dbQuery(sql, [id]);
    if (results.length === 0) {
      throw new Error(`Session not found: ${id}`);
    }
    return results[0] as Session;
  },

  /**
   * Get user sessions
   */
  async getByUserId(userId: string, limit: number = 50): Promise<Session[]> {
    const sql = `
      SELECT * FROM sessions
      WHERE user_id = ?
      ORDER BY start_time DESC
      LIMIT ?
    `;
    const results = await dbQuery(sql, [userId, limit]);
    return results as Session[];
  },

  /**
   * Get recent sessions
   */
  async getRecent(userId: string, days: number = 7): Promise<Session[]> {
    const sql = `
      SELECT * FROM sessions
      WHERE user_id = ?
        AND start_time >= datetime('now', '-${days} days')
      ORDER BY start_time DESC
    `;
    const results = await dbQuery(sql, [userId]);
    return results as Session[];
  },
};

// ============================================================================
// STEP 75: PROGRESS CALCULATIONS
// ============================================================================

export interface Progress {
  user_id: string;
  current_level: string;
  total_sessions: number;
  total_words_typed: number;
  average_accuracy: number;
  average_wpm: number;
  streak: number;
  last_session_date: string;
}

export const ProgressOperations = {
  /**
   * Calculate and update user progress
   */
  async calculate(userId: string): Promise<Progress> {
    // Get user sessions
    const sessionsSql = `
      SELECT
        COUNT(*) as total_sessions,
        SUM(total_words) as total_words,
        AVG(accuracy) as avg_accuracy,
        AVG(words_per_minute) as avg_wpm,
        MAX(start_time) as last_session
      FROM sessions
      WHERE user_id = ? AND end_time IS NOT NULL
    `;
    const stats = await dbQuery(sessionsSql, [userId]);
    const sessionStats = stats[0];

    // Calculate streak
    const streak = await this.calculateStreak(userId);

    // Determine current level based on average accuracy and words typed
    const currentLevel = this.determineLevelrecommendation(
      sessionStats.avg_accuracy,
      sessionStats.total_words
    );

    // Update or insert progress
    const upsertSql = `
      INSERT INTO progress (user_id, current_level, total_sessions, total_words_typed,
                           average_accuracy, average_wpm, streak, last_session_date)
      VALUES (?, ?, ?, ?, ?, ?, ?, date(?))
      ON CONFLICT(user_id) DO UPDATE SET
        current_level = excluded.current_level,
        total_sessions = excluded.total_sessions,
        total_words_typed = excluded.total_words_typed,
        average_accuracy = excluded.average_accuracy,
        average_wpm = excluded.average_wpm,
        streak = excluded.streak,
        last_session_date = excluded.last_session_date
    `;

    await dbExecute(upsertSql, [
      userId,
      currentLevel,
      sessionStats.total_sessions || 0,
      sessionStats.total_words || 0,
      sessionStats.avg_accuracy || 0,
      sessionStats.avg_wpm || 0,
      streak,
      sessionStats.last_session || new Date().toISOString(),
    ]);

    return this.get(userId);
  },

  /**
   * Get user progress
   */
  async get(userId: string): Promise<Progress> {
    const sql = 'SELECT * FROM progress WHERE user_id = ?';
    const results = await dbQuery(sql, [userId]);
    if (results.length === 0) {
      // Initialize progress if doesn't exist
      await this.calculate(userId);
      return this.get(userId);
    }
    return results[0] as Progress;
  },

  /**
   * Calculate current streak
   */
  async calculateStreak(userId: string): Promise<number> {
    const sql = `
      SELECT DATE(start_time) as session_date
      FROM sessions
      WHERE user_id = ? AND end_time IS NOT NULL
      ORDER BY start_time DESC
      LIMIT 365
    `;
    const results = await dbQuery(sql, [userId]);

    if (results.length === 0) return 0;

    let streak = 0;
    let currentDate = new Date();
    currentDate.setHours(0, 0, 0, 0);

    for (const row of results) {
      const sessionDate = new Date(row.session_date);
      sessionDate.setHours(0, 0, 0, 0);

      const daysDiff = Math.floor(
        (currentDate.getTime() - sessionDate.getTime()) / (1000 * 60 * 60 * 24)
      );

      if (daysDiff === streak) {
        streak++;
      } else if (daysDiff > streak) {
        break;
      }
    }

    return streak;
  },

  /**
   * Determine level recommendation
   */
  determineLevelrecommendation(avgAccuracy: number, totalWords: number): string {
    if (totalWords < 50 || avgAccuracy < 70) return 'letters';
    if (totalWords < 200 || avgAccuracy < 80) return 'words';
    if (totalWords < 500 || avgAccuracy < 85) return 'sentences';
    return 'scenes';
  },

  /**
   * Get improvement rate
   */
  async getImprovementRate(userId: string, days: number = 30): Promise<number> {
    const sql = `
      SELECT
        AVG(CASE WHEN start_time >= datetime('now', '-${days / 2} days') THEN accuracy END) as recent_avg,
        AVG(CASE WHEN start_time < datetime('now', '-${days / 2} days')
                      AND start_time >= datetime('now', '-${days} days')
             THEN accuracy END) as older_avg
      FROM sessions
      WHERE user_id = ? AND end_time IS NOT NULL
    `;
    const results = await dbQuery(sql, [userId]);
    const { recent_avg, older_avg } = results[0];

    if (!recent_avg || !older_avg) return 0;
    return ((recent_avg - older_avg) / older_avg) * 100;
  },
};

// ============================================================================
// STEP 76: ACHIEVEMENT CHECKER
// ============================================================================

export interface Achievement {
  id: string;
  user_id: string;
  title: string;
  description: string;
  icon: string;
  category: string;
  unlocked_at: string;
}

export const AchievementOperations = {
  /**
   * Check and unlock achievements for user
   */
  async check(userId: string): Promise<Achievement[]> {
    const newAchievements: Achievement[] = [];

    // Get user progress
    const progress = await ProgressOperations.get(userId);

    // Define achievement criteria
    const achievements = [
      {
        id: 'first_session',
        title: 'First Steps',
        description: 'Completed your first typing session!',
        icon: '🎉',
        category: 'milestone',
        check: () => progress.total_sessions >= 1,
      },
      {
        id: 'ten_sessions',
        title: 'Getting Started',
        description: 'Completed 10 typing sessions',
        icon: '⭐',
        category: 'milestone',
        check: () => progress.total_sessions >= 10,
      },
      {
        id: 'fifty_sessions',
        title: 'Dedicated Learner',
        description: 'Completed 50 typing sessions',
        icon: '🏆',
        category: 'milestone',
        check: () => progress.total_sessions >= 50,
      },
      {
        id: 'hundred_words',
        title: 'Word Warrior',
        description: 'Typed 100 words total',
        icon: '📝',
        category: 'progress',
        check: () => progress.total_words_typed >= 100,
      },
      {
        id: 'thousand_words',
        title: 'Master Typist',
        description: 'Typed 1000 words total',
        icon: '🎯',
        category: 'progress',
        check: () => progress.total_words_typed >= 1000,
      },
      {
        id: 'accuracy_90',
        title: 'Precision Pro',
        description: 'Achieved 90% average accuracy',
        icon: '🎖️',
        category: 'skill',
        check: () => progress.average_accuracy >= 90,
      },
      {
        id: 'accuracy_95',
        title: 'Perfect Precision',
        description: 'Achieved 95% average accuracy',
        icon: '💎',
        category: 'skill',
        check: () => progress.average_accuracy >= 95,
      },
      {
        id: 'streak_7',
        title: 'Week Warrior',
        description: '7-day practice streak',
        icon: '🔥',
        category: 'consistency',
        check: () => progress.streak >= 7,
      },
      {
        id: 'streak_30',
        title: 'Month Master',
        description: '30-day practice streak',
        icon: '🌟',
        category: 'consistency',
        check: () => progress.streak >= 30,
      },
      {
        id: 'speed_20wpm',
        title: 'Speed Starter',
        description: 'Average 20 words per minute',
        icon: '⚡',
        category: 'speed',
        check: () => progress.average_wpm >= 20,
      },
      {
        id: 'speed_40wpm',
        title: 'Speed Master',
        description: 'Average 40 words per minute',
        icon: '🚀',
        category: 'speed',
        check: () => progress.average_wpm >= 40,
      },
    ];

    // Check each achievement
    for (const ach of achievements) {
      if (ach.check()) {
        // Check if already unlocked
        const exists = await this.hasAchievement(userId, ach.id);
        if (!exists) {
          const unlocked = await this.unlock(userId, ach);
          newAchievements.push(unlocked);
        }
      }
    }

    return newAchievements;
  },

  /**
   * Unlock achievement
   */
  async unlock(
    userId: string,
    achievement: Omit<Achievement, 'user_id' | 'unlocked_at'>
  ): Promise<Achievement> {
    const sql = `
      INSERT INTO achievements (id, user_id, title, description, icon, category)
      VALUES (?, ?, ?, ?, ?, ?)
    `;
    await dbExecute(sql, [
      achievement.id,
      userId,
      achievement.title,
      achievement.description,
      achievement.icon,
      achievement.category,
    ]);

    return this.getById(achievement.id, userId);
  },

  /**
   * Check if user has achievement
   */
  async hasAchievement(userId: string, achievementId: string): Promise<boolean> {
    const sql = 'SELECT COUNT(*) as count FROM achievements WHERE user_id = ? AND id = ?';
    const results = await dbQuery(sql, [userId, achievementId]);
    return results[0].count > 0;
  },

  /**
   * Get achievement by ID
   */
  async getById(id: string, userId: string): Promise<Achievement> {
    const sql = 'SELECT * FROM achievements WHERE id = ? AND user_id = ?';
    const results = await dbQuery(sql, [id, userId]);
    if (results.length === 0) {
      throw new Error(`Achievement not found: ${id}`);
    }
    return results[0] as Achievement;
  },

  /**
   * Get all user achievements
   */
  async getByUserId(userId: string): Promise<Achievement[]> {
    const sql = 'SELECT * FROM achievements WHERE user_id = ? ORDER BY unlocked_at DESC';
    const results = await dbQuery(sql, [userId]);
    return results as Achievement[];
  },
};

// ============================================================================
// Export all operations
// ============================================================================

export default {
  User: UserOperations,
  Session: SessionOperations,
  Progress: ProgressOperations,
  Achievement: AchievementOperations,
};
