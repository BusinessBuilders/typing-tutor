/**
 * Curriculum Database Operations
 * Tracks lessons, curriculum plans, and homework
 */

import { dbQuery, dbExecute } from './databaseService';
import {
  CurriculumLesson,
  CompletedLesson,
  LearningGoal,
  HomeworkTask,
} from '../ai/CurriculumPlanner';

/**
 * Initialize curriculum tables (if they don't exist)
 */
export async function initializeCurriculumTables(): Promise<void> {
  const tables = [
    `CREATE TABLE IF NOT EXISTS learning_goals (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL,
      goal TEXT NOT NULL,
      target_skills TEXT,
      priority TEXT DEFAULT 'medium',
      created_at TEXT NOT NULL,
      completed INTEGER DEFAULT 0,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    )`,

    `CREATE TABLE IF NOT EXISTS curriculum_lessons (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL,
      title TEXT NOT NULL,
      description TEXT,
      category TEXT NOT NULL,
      difficulty INTEGER DEFAULT 5,
      skills_targeted TEXT,
      estimated_minutes INTEGER DEFAULT 15,
      prerequisites TEXT,
      topic_focus TEXT,
      ai_generated INTEGER DEFAULT 1,
      created_at TEXT NOT NULL,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    )`,

    `CREATE TABLE IF NOT EXISTS completed_lessons (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL,
      lesson_id TEXT NOT NULL,
      lesson_title TEXT,
      completed_at TEXT NOT NULL,
      accuracy REAL DEFAULT 0,
      time_spent INTEGER DEFAULT 0,
      enjoyment_rating INTEGER,
      struggled_with TEXT,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    )`,

    `CREATE TABLE IF NOT EXISTS homework_tasks (
      id TEXT PRIMARY KEY,
      lesson_id TEXT NOT NULL,
      user_id TEXT NOT NULL,
      title TEXT NOT NULL,
      description TEXT,
      type TEXT DEFAULT 'typing',
      content TEXT NOT NULL,
      target_accuracy REAL,
      target_wpm REAL,
      completed INTEGER DEFAULT 0,
      completed_at TEXT,
      actual_accuracy REAL,
      actual_wpm REAL,
      created_at TEXT NOT NULL,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    )`,

    `CREATE TABLE IF NOT EXISTS lesson_sessions (
      id TEXT PRIMARY KEY,
      lesson_id TEXT NOT NULL,
      user_id TEXT NOT NULL,
      session_number INTEGER NOT NULL,
      content TEXT NOT NULL,
      completed INTEGER DEFAULT 0,
      accuracy REAL,
      created_at TEXT NOT NULL,
      completed_at TEXT,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    )`,
  ];

  try {
    for (const sql of tables) {
      await dbExecute(sql);
    }
    console.log('Curriculum tables initialized successfully');
  } catch (error) {
    console.error('Failed to initialize curriculum tables:', error);
  }
}

/**
 * Save learning goals for a user
 */
export async function saveLearningGoals(goals: LearningGoal[]): Promise<void> {
  for (const goal of goals) {
    await dbExecute(
      `INSERT OR REPLACE INTO learning_goals (id, user_id, goal, target_skills, priority, created_at)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [
        goal.id,
        goal.userId,
        goal.goal,
        JSON.stringify(goal.targetSkills),
        goal.priority,
        goal.createdAt.toISOString(),
      ]
    );
  }
}

/**
 * Get learning goals for a user
 */
export async function getLearningGoals(userId: string): Promise<LearningGoal[]> {
  const rows = await dbQuery<any>(
    'SELECT * FROM learning_goals WHERE user_id = ? AND completed = 0',
    [userId]
  );

  return rows.map((row) => ({
    id: row.id,
    userId: row.user_id,
    goal: row.goal,
    targetSkills: row.target_skills ? JSON.parse(row.target_skills) : [],
    priority: row.priority as 'high' | 'medium' | 'low',
    createdAt: new Date(row.created_at),
  }));
}

/**
 * Save a curriculum lesson
 */
export async function saveCurriculumLesson(lesson: CurriculumLesson): Promise<void> {
  await dbExecute(
    `INSERT OR REPLACE INTO curriculum_lessons
     (id, user_id, title, description, category, difficulty, skills_targeted,
      estimated_minutes, prerequisites, topic_focus, ai_generated, created_at)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      lesson.id,
      lesson.userId,
      lesson.title,
      lesson.description,
      lesson.category,
      lesson.difficulty,
      JSON.stringify(lesson.skillsTargeted),
      lesson.estimatedMinutes,
      JSON.stringify(lesson.prerequisites),
      lesson.title, // topic_focus
      lesson.aiGenerated ? 1 : 0,
      lesson.createdAt.toISOString(),
    ]
  );
}

/**
 * Get curriculum lessons for a user
 */
export async function getCurriculumLessons(userId: string): Promise<CurriculumLesson[]> {
  const rows = await dbQuery<any>(
    'SELECT * FROM curriculum_lessons WHERE user_id = ? ORDER BY created_at ASC',
    [userId]
  );

  return rows.map((row) => ({
    id: row.id,
    userId: row.user_id,
    title: row.title,
    description: row.description || '',
    category: row.category,
    difficulty: row.difficulty,
    skillsTargeted: row.skills_targeted ? JSON.parse(row.skills_targeted) : [],
    estimatedMinutes: row.estimated_minutes,
    prerequisites: row.prerequisites ? JSON.parse(row.prerequisites) : [],
    content: [], // Loaded separately
    aiGenerated: Boolean(row.ai_generated),
    createdAt: new Date(row.created_at),
  }));
}

/**
 * Mark a lesson as completed
 */
export async function markLessonCompleted(
  userId: string,
  lessonId: string,
  lessonTitle: string,
  accuracy: number,
  timeSpent: number,
  enjoymentRating?: number
): Promise<void> {
  const id = `completed_${userId}_${lessonId}_${Date.now()}`;

  await dbExecute(
    `INSERT INTO completed_lessons
     (id, user_id, lesson_id, lesson_title, completed_at, accuracy, time_spent, enjoyment_rating)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      id,
      userId,
      lessonId,
      lessonTitle,
      new Date().toISOString(),
      accuracy,
      timeSpent,
      enjoymentRating || null,
    ]
  );
}

/**
 * Get completed lessons for a user
 */
export async function getCompletedLessons(userId: string): Promise<CompletedLesson[]> {
  const rows = await dbQuery<any>(
    'SELECT * FROM completed_lessons WHERE user_id = ? ORDER BY completed_at DESC',
    [userId]
  );

  return rows.map((row) => ({
    id: row.id,
    userId: row.user_id,
    lessonId: row.lesson_id,
    completedAt: new Date(row.completed_at),
    accuracy: row.accuracy,
    timeSpent: row.time_spent,
    enjoymentRating: row.enjoyment_rating,
    struggledWith: row.struggled_with ? JSON.parse(row.struggled_with) : [],
  }));
}

/**
 * Save homework tasks
 */
export async function saveHomeworkTasks(tasks: HomeworkTask[], lessonId: string, userId: string): Promise<void> {
  for (const task of tasks) {
    await dbExecute(
      `INSERT OR REPLACE INTO homework_tasks
       (id, lesson_id, user_id, title, description, type, content, target_accuracy, target_wpm, created_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        task.id,
        lessonId,
        userId,
        task.title,
        task.description,
        task.type,
        task.content,
        task.targetAccuracy || null,
        task.targetWPM || null,
        new Date().toISOString(),
      ]
    );
  }
}

/**
 * Get homework tasks for a user
 */
export async function getHomeworkTasks(userId: string, includeCompleted: boolean = false): Promise<HomeworkTask[]> {
  const sql = includeCompleted
    ? 'SELECT * FROM homework_tasks WHERE user_id = ? ORDER BY created_at DESC'
    : 'SELECT * FROM homework_tasks WHERE user_id = ? AND completed = 0 ORDER BY created_at DESC';

  const rows = await dbQuery<any>(sql, [userId]);

  return rows.map((row) => ({
    id: row.id,
    title: row.title,
    description: row.description || '',
    type: row.type,
    content: row.content,
    targetAccuracy: row.target_accuracy,
    targetWPM: row.target_wpm,
    completed: Boolean(row.completed),
  }));
}

/**
 * Mark homework task as completed
 */
export async function markHomeworkCompleted(
  taskId: string,
  accuracy: number,
  wpm?: number
): Promise<void> {
  await dbExecute(
    `UPDATE homework_tasks
     SET completed = 1, completed_at = ?, actual_accuracy = ?, actual_wpm = ?
     WHERE id = ?`,
    [new Date().toISOString(), accuracy, wpm || null, taskId]
  );
}

/**
 * Check if a lesson has been completed
 */
export async function hasCompletedLesson(userId: string, lessonId: string): Promise<boolean> {
  const rows = await dbQuery<any>(
    'SELECT COUNT(*) as count FROM completed_lessons WHERE user_id = ? AND lesson_id = ?',
    [userId, lessonId]
  );

  return rows.length > 0 && rows[0].count > 0;
}

export default {
  initializeCurriculumTables,
  saveLearningGoals,
  getLearningGoals,
  saveCurriculumLesson,
  getCurriculumLessons,
  markLessonCompleted,
  getCompletedLessons,
  saveHomeworkTasks,
  getHomeworkTasks,
  markHomeworkCompleted,
  hasCompletedLesson,
};
