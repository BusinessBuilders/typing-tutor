// Application-wide constants

// App Information
export const APP_NAME = 'Autism Typing Tutor';
export const APP_VERSION = '0.1.0';
export const APP_DESCRIPTION = 'AI-Powered Learning Assistant';

// Learning Levels
export const LEARNING_LEVELS = {
  LETTERS: 'letters',
  WORDS: 'words',
  SENTENCES: 'sentences',
  STORIES: 'stories',
} as const;

// Default Settings
export const DEFAULT_SETTINGS = {
  theme: 'light',
  fontSize: 'medium',
  soundEnabled: true,
  musicEnabled: false,
  reducedMotion: false,
  dyslexicFont: false,
  voiceGender: 'neutral',
  voiceSpeed: 1.0,
  soundEffects: true,
  volume: 70,
  hapticFeedback: true,
  keyboardTheme: 'default',
} as const;

// Difficulty Levels
export const DIFFICULTY_LEVELS = {
  EASY: 'easy',
  MEDIUM: 'medium',
  HARD: 'hard',
} as const;

// AI Providers
export const AI_PROVIDERS = {
  OPENAI: 'openai',
  CLAUDE: 'claude',
  OPENROUTER: 'openrouter',
} as const;

// Default AI Models
export const DEFAULT_AI_MODELS = {
  openai: 'gpt-4',
  claude: 'claude-3-5-sonnet-20241022',
  openrouter: 'anthropic/claude-3.5-sonnet',
} as const;

// Color Themes
export const THEMES = {
  LIGHT: 'light',
  DARK: 'dark',
  HIGH_CONTRAST: 'high-contrast',
} as const;

// Font Sizes (in rem)
export const FONT_SIZES = {
  small: 1,
  medium: 1.125,
  large: 1.25,
  'extra-large': 1.5,
} as const;

// Achievement Categories
export const ACHIEVEMENT_CATEGORIES = {
  SPEED: 'speed',
  ACCURACY: 'accuracy',
  CONSISTENCY: 'consistency',
  MILESTONE: 'milestone',
} as const;

// Sticker Rarities
export const STICKER_RARITIES = {
  COMMON: 'common',
  RARE: 'rare',
  EPIC: 'epic',
  LEGENDARY: 'legendary',
} as const;

// Session Limits (in minutes)
export const SESSION_LIMITS = {
  DEFAULT: 15,
  SHORT: 10,
  MEDIUM: 20,
  LONG: 30,
} as const;

// Break Reminder Interval (in minutes)
export const BREAK_REMINDER_INTERVAL = 15;

// Local Storage Keys
export const STORAGE_KEYS = {
  USER_PROFILE: 'typing_tutor_user_profile',
  SETTINGS: 'typing_tutor_settings',
  PROGRESS: 'typing_tutor_progress',
  API_CONFIG: 'typing_tutor_api_config',
  LAST_SESSION: 'typing_tutor_last_session',
} as const;

// Database Settings
export const DB_CONFIG = {
  NAME: 'autism_typing_tutor.db',
  VERSION: 1,
} as const;

// API Timeouts (in milliseconds)
export const API_TIMEOUTS = {
  DEFAULT: 30000,
  LONG: 60000,
} as const;

// Typing Metrics
export const TYPING_METRICS = {
  MIN_WPM: 0,
  TARGET_WPM: 40,
  EXCELLENT_WPM: 60,
  MIN_ACCURACY: 0,
  TARGET_ACCURACY: 90,
  EXCELLENT_ACCURACY: 95,
} as const;

// Image Settings
export const IMAGE_CONFIG = {
  MAX_WIDTH: 800,
  MAX_HEIGHT: 600,
  QUALITY: 0.8,
  CACHE_SIZE: 50,
} as const;

// Audio Settings
export const AUDIO_CONFIG = {
  DEFAULT_VOLUME: 0.7,
  SUCCESS_SOUND: 'success.mp3',
  ERROR_SOUND: 'gentle-error.mp3',
  CELEBRATION_SOUND: 'celebration.mp3',
  CLICK_SOUND: 'click.mp3',
} as const;
