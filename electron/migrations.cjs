/**
 * Database Migration System
 * Handles schema versioning and updates
 */

const fs = require('fs');
const path = require('path');

/**
 * Migration tracking table
 */
function createMigrationTable(db) {
  db.exec(`
    CREATE TABLE IF NOT EXISTS migrations (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      version INTEGER NOT NULL UNIQUE,
      name TEXT NOT NULL,
      applied_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);
}

/**
 * Get current schema version
 */
function getCurrentVersion(db) {
  try {
    const result = db
      .prepare('SELECT MAX(version) as version FROM migrations')
      .get();
    return result.version || 0;
  } catch (error) {
    return 0;
  }
}

/**
 * Record migration
 */
function recordMigration(db, version, name) {
  db.prepare('INSERT INTO migrations (version, name) VALUES (?, ?)')
    .run(version, name);
}

/**
 * Define all migrations
 */
const migrations = [
  {
    version: 1,
    name: 'initial_schema',
    up: (db) => {
      // Initial schema is already created by createTables()
      // This is just a placeholder for versioning
      console.log('Migration 1: Initial schema already created');
    },
    down: (db) => {
      // Cannot rollback initial schema
      console.log('Cannot rollback initial schema');
    },
  },
  {
    version: 2,
    name: 'add_custom_words_table',
    up: (db) => {
      db.exec(`
        CREATE TABLE IF NOT EXISTS custom_words (
          id TEXT PRIMARY KEY,
          user_id TEXT NOT NULL,
          word TEXT NOT NULL,
          category TEXT,
          difficulty TEXT DEFAULT 'easy',
          image_url TEXT,
          pronunciation_url TEXT,
          times_practiced INTEGER DEFAULT 0,
          last_practiced_at DATETIME,
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
        )
      `);
    },
    down: (db) => {
      db.exec('DROP TABLE IF EXISTS custom_words');
    },
  },
  {
    version: 3,
    name: 'add_typing_attempts_table',
    up: (db) => {
      db.exec(`
        CREATE TABLE IF NOT EXISTS typing_attempts (
          id TEXT PRIMARY KEY,
          session_id TEXT NOT NULL,
          exercise_id TEXT NOT NULL,
          user_id TEXT NOT NULL,
          expected_text TEXT NOT NULL,
          typed_text TEXT NOT NULL,
          is_correct INTEGER DEFAULT 0,
          time_taken INTEGER NOT NULL,
          wpm REAL DEFAULT 0.0,
          accuracy REAL DEFAULT 0.0,
          mistakes_count INTEGER DEFAULT 0,
          backspace_count INTEGER DEFAULT 0,
          hint_used INTEGER DEFAULT 0,
          timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
          FOREIGN KEY (session_id) REFERENCES sessions(id) ON DELETE CASCADE,
          FOREIGN KEY (exercise_id) REFERENCES exercises(id) ON DELETE CASCADE,
          FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
        )
      `);
    },
    down: (db) => {
      db.exec('DROP TABLE IF EXISTS typing_attempts');
    },
  },
  {
    version: 4,
    name: 'add_mistake_patterns_table',
    up: (db) => {
      db.exec(`
        CREATE TABLE IF NOT EXISTS mistake_patterns (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          user_id TEXT NOT NULL,
          pattern_type TEXT NOT NULL,
          from_char TEXT,
          to_char TEXT,
          word_context TEXT,
          frequency INTEGER DEFAULT 1,
          first_occurrence DATETIME DEFAULT CURRENT_TIMESTAMP,
          last_occurrence DATETIME DEFAULT CURRENT_TIMESTAMP,
          FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
        )
      `);
    },
    down: (db) => {
      db.exec('DROP TABLE IF EXISTS mistake_patterns');
    },
  },
  {
    version: 5,
    name: 'add_reports_table',
    up: (db) => {
      db.exec(`
        CREATE TABLE IF NOT EXISTS reports (
          id TEXT PRIMARY KEY,
          user_id TEXT NOT NULL,
          report_type TEXT NOT NULL,
          title TEXT NOT NULL,
          start_date DATE NOT NULL,
          end_date DATE NOT NULL,
          total_sessions INTEGER DEFAULT 0,
          total_words INTEGER DEFAULT 0,
          average_accuracy REAL DEFAULT 0.0,
          average_wpm REAL DEFAULT 0.0,
          improvement_rate REAL DEFAULT 0.0,
          strengths TEXT,
          areas_to_improve TEXT,
          achievements_earned TEXT,
          generated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          data_json TEXT,
          FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
        )
      `);
    },
    down: (db) => {
      db.exec('DROP TABLE IF EXISTS reports');
    },
  },
  {
    version: 6,
    name: 'add_performance_indexes',
    up: (db) => {
      db.exec(`
        CREATE INDEX IF NOT EXISTS idx_sessions_user_id ON sessions(user_id);
        CREATE INDEX IF NOT EXISTS idx_sessions_start_time ON sessions(start_time);
        CREATE INDEX IF NOT EXISTS idx_exercises_session_id ON exercises(session_id);
        CREATE INDEX IF NOT EXISTS idx_typing_attempts_user_id ON typing_attempts(user_id);
        CREATE INDEX IF NOT EXISTS idx_typing_attempts_session_id ON typing_attempts(session_id);
        CREATE INDEX IF NOT EXISTS idx_typing_attempts_timestamp ON typing_attempts(timestamp);
        CREATE INDEX IF NOT EXISTS idx_mistake_patterns_user_id ON mistake_patterns(user_id);
        CREATE INDEX IF NOT EXISTS idx_custom_words_user_id ON custom_words(user_id);
        CREATE INDEX IF NOT EXISTS idx_reports_user_id ON reports(user_id);
        CREATE INDEX IF NOT EXISTS idx_achievements_user_id ON achievements(user_id);
        CREATE INDEX IF NOT EXISTS idx_cache_expires_at ON cache(expires_at);
      `);
    },
    down: (db) => {
      db.exec(`
        DROP INDEX IF EXISTS idx_sessions_user_id;
        DROP INDEX IF EXISTS idx_sessions_start_time;
        DROP INDEX IF EXISTS idx_exercises_session_id;
        DROP INDEX IF EXISTS idx_typing_attempts_user_id;
        DROP INDEX IF EXISTS idx_typing_attempts_session_id;
        DROP INDEX IF EXISTS idx_typing_attempts_timestamp;
        DROP INDEX IF EXISTS idx_mistake_patterns_user_id;
        DROP INDEX IF EXISTS idx_custom_words_user_id;
        DROP INDEX IF EXISTS idx_reports_user_id;
        DROP INDEX IF EXISTS idx_achievements_user_id;
        DROP INDEX IF EXISTS idx_cache_expires_at;
      `);
    },
  },
];

/**
 * Run migrations
 */
function runMigrations(db) {
  console.log('Running database migrations...');

  // Create migration tracking table
  createMigrationTable(db);

  // Get current version
  const currentVersion = getCurrentVersion(db);
  console.log(`Current database version: ${currentVersion}`);

  // Run pending migrations
  const pendingMigrations = migrations.filter((m) => m.version > currentVersion);

  if (pendingMigrations.length === 0) {
    console.log('No pending migrations');
    return;
  }

  console.log(`Running ${pendingMigrations.length} pending migrations...`);

  // Run each migration in a transaction
  for (const migration of pendingMigrations) {
    try {
      console.log(`Applying migration ${migration.version}: ${migration.name}`);

      db.transaction(() => {
        migration.up(db);
        recordMigration(db, migration.version, migration.name);
      })();

      console.log(`Migration ${migration.version} applied successfully`);
    } catch (error) {
      console.error(`Failed to apply migration ${migration.version}:`, error);
      throw error;
    }
  }

  console.log('All migrations completed successfully');
}

/**
 * Rollback last migration
 */
function rollbackMigration(db) {
  const currentVersion = getCurrentVersion(db);

  if (currentVersion === 0) {
    console.log('No migrations to rollback');
    return;
  }

  const migration = migrations.find((m) => m.version === currentVersion);

  if (!migration) {
    console.error(`Migration version ${currentVersion} not found`);
    return;
  }

  console.log(`Rolling back migration ${migration.version}: ${migration.name}`);

  try {
    db.transaction(() => {
      migration.down(db);
      db.prepare('DELETE FROM migrations WHERE version = ?').run(currentVersion);
    })();

    console.log(`Migration ${migration.version} rolled back successfully`);
  } catch (error) {
    console.error(`Failed to rollback migration ${migration.version}:`, error);
    throw error;
  }
}

/**
 * Get migration status
 */
function getMigrationStatus(db) {
  createMigrationTable(db);
  const currentVersion = getCurrentVersion(db);
  const latestVersion = Math.max(...migrations.map((m) => m.version));
  const appliedMigrations = db.prepare('SELECT * FROM migrations ORDER BY version').all();

  return {
    currentVersion,
    latestVersion,
    upToDate: currentVersion === latestVersion,
    appliedMigrations,
    pendingMigrations: migrations.filter((m) => m.version > currentVersion),
  };
}

/**
 * Create a new migration file
 */
function createMigration(name) {
  const nextVersion = Math.max(...migrations.map((m) => m.version)) + 1;
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
  const filename = `${nextVersion}_${name}_${timestamp}.cjs`;

  const template = `/**
 * Migration: ${name}
 * Version: ${nextVersion}
 */

module.exports = {
  version: ${nextVersion},
  name: '${name}',
  up: (db) => {
    // Add your migration code here
    db.exec(\`
      -- Your SQL here
    \`);
  },
  down: (db) => {
    // Add your rollback code here
    db.exec(\`
      -- Your rollback SQL here
    \`);
  },
};
`;

  const migrationsDir = path.join(__dirname, 'migrations');
  if (!fs.existsSync(migrationsDir)) {
    fs.mkdirSync(migrationsDir, { recursive: true });
  }

  const filepath = path.join(migrationsDir, filename);
  fs.writeFileSync(filepath, template);

  console.log(`Created migration file: ${filepath}`);
  return filepath;
}

module.exports = {
  runMigrations,
  rollbackMigration,
  getMigrationStatus,
  createMigration,
  getCurrentVersion,
};
