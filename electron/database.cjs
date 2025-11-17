const Database = require('better-sqlite3');
const path = require('path');
const fs = require('fs');
const { app } = require('electron');

let db = null;

/**
 * Get the database file path
 */
function getDbPath() {
  const userDataPath = app.getPath('userData');
  return path.join(userDataPath, 'autism_typing_tutor.db');
}

/**
 * Initialize the database connection and create tables
 */
function initializeDatabase() {
  try {
    const dbPath = getDbPath();
    const dbDir = path.dirname(dbPath);

    // Ensure directory exists
    if (!fs.existsSync(dbDir)) {
      fs.mkdirSync(dbDir, { recursive: true });
    }

    // Create/open database
    db = new Database(dbPath);
    db.pragma('journal_mode = WAL'); // Write-Ahead Logging for better concurrency

    console.log('Database initialized at:', dbPath);

    // Create tables
    createTables();

    return db;
  } catch (error) {
    console.error('Failed to initialize database:', error);
    throw error;
  }
}

/**
 * Create all necessary tables
 */
function createTables() {
  // Users table
  db.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      age INTEGER,
      avatar TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);

  // User settings table
  db.exec(`
    CREATE TABLE IF NOT EXISTS user_settings (
      user_id TEXT PRIMARY KEY,
      theme TEXT DEFAULT 'light',
      font_size TEXT DEFAULT 'medium',
      sound_enabled INTEGER DEFAULT 1,
      music_enabled INTEGER DEFAULT 0,
      reduced_motion INTEGER DEFAULT 0,
      dyslexic_font INTEGER DEFAULT 0,
      voice_gender TEXT DEFAULT 'neutral',
      voice_speed REAL DEFAULT 1.0,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    )
  `);

  // Sessions table
  db.exec(`
    CREATE TABLE IF NOT EXISTS sessions (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL,
      start_time DATETIME NOT NULL,
      end_time DATETIME,
      level TEXT NOT NULL,
      total_words INTEGER DEFAULT 0,
      correct_words INTEGER DEFAULT 0,
      accuracy REAL DEFAULT 100.0,
      words_per_minute REAL DEFAULT 0.0,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    )
  `);

  // Exercises table
  db.exec(`
    CREATE TABLE IF NOT EXISTS exercises (
      id TEXT PRIMARY KEY,
      session_id TEXT NOT NULL,
      type TEXT NOT NULL,
      content TEXT NOT NULL,
      image_url TEXT,
      completed INTEGER DEFAULT 0,
      attempts INTEGER DEFAULT 0,
      time_spent INTEGER DEFAULT 0,
      FOREIGN KEY (session_id) REFERENCES sessions(id) ON DELETE CASCADE
    )
  `);

  // Mistakes table
  db.exec(`
    CREATE TABLE IF NOT EXISTS mistakes (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      exercise_id TEXT NOT NULL,
      mistake TEXT NOT NULL,
      timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (exercise_id) REFERENCES exercises(id) ON DELETE CASCADE
    )
  `);

  // Progress table
  db.exec(`
    CREATE TABLE IF NOT EXISTS progress (
      user_id TEXT PRIMARY KEY,
      current_level TEXT DEFAULT 'letters',
      total_sessions INTEGER DEFAULT 0,
      total_words_typed INTEGER DEFAULT 0,
      average_accuracy REAL DEFAULT 0.0,
      average_wpm REAL DEFAULT 0.0,
      streak INTEGER DEFAULT 0,
      last_session_date DATE,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    )
  `);

  // Achievements table
  db.exec(`
    CREATE TABLE IF NOT EXISTS achievements (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL,
      title TEXT NOT NULL,
      description TEXT NOT NULL,
      icon TEXT NOT NULL,
      category TEXT NOT NULL,
      unlocked_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    )
  `);

  // Virtual pet table
  db.exec(`
    CREATE TABLE IF NOT EXISTS virtual_pets (
      user_id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      type TEXT NOT NULL,
      level INTEGER DEFAULT 1,
      happiness INTEGER DEFAULT 100,
      experience INTEGER DEFAULT 0,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    )
  `);

  // Stickers table
  db.exec(`
    CREATE TABLE IF NOT EXISTS stickers (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL,
      name TEXT NOT NULL,
      image_url TEXT NOT NULL,
      rarity TEXT NOT NULL,
      category TEXT NOT NULL,
      unlocked INTEGER DEFAULT 0,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    )
  `);

  // Cache table (for AI responses and images)
  db.exec(`
    CREATE TABLE IF NOT EXISTS cache (
      key TEXT PRIMARY KEY,
      value TEXT NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      expires_at DATETIME
    )
  `);

  console.log('Database tables created successfully');
}

/**
 * Execute a query and return results
 */
function query(sql, params = []) {
  try {
    const stmt = db.prepare(sql);
    return stmt.all(params);
  } catch (error) {
    console.error('Query error:', error);
    throw error;
  }
}

/**
 * Execute a statement (INSERT, UPDATE, DELETE)
 */
function execute(sql, params = []) {
  try {
    const stmt = db.prepare(sql);
    return stmt.run(params);
  } catch (error) {
    console.error('Execute error:', error);
    throw error;
  }
}

/**
 * Get database instance
 */
function getDatabase() {
  if (!db) {
    throw new Error('Database not initialized');
  }
  return db;
}

/**
 * Close database connection
 */
function closeDatabase() {
  if (db) {
    db.close();
    db = null;
    console.log('Database connection closed');
  }
}

module.exports = {
  initializeDatabase,
  getDatabase,
  query,
  execute,
  closeDatabase,
  getDbPath,
};
