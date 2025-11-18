// Core type definitions for the Autism Typing Tutor app

// User and Profile Types
export interface UserProfile {
  id: string;
  name: string;
  age?: number;
  avatar?: string;
  createdAt: Date;
  settings: UserSettings;
}

export interface UserSettings {
  theme: 'light' | 'dark' | 'high-contrast';
  fontSize: 'small' | 'medium' | 'large' | 'extra-large';
  soundEnabled: boolean;
  musicEnabled: boolean;
  reducedMotion: boolean;
  dyslexicFont: boolean;
  voiceGender: 'male' | 'female' | 'neutral';
  voiceSpeed: number; // 0.5 to 2.0
  // Keyboard sound and feedback settings (Steps 118-119)
  soundEffects: boolean;
  volume: number; // 0-100
  hapticFeedback: boolean;
  keyboardTheme: string;
  // Audio volume controls (Steps 191-200)
  soundVolume?: number; // 0-1
  musicVolume?: number; // 0-1
  voiceVolume?: number; // 0-1
  voiceEnabled?: boolean;
  soundscapeEnabled?: boolean;
  soundscapeVolume?: number; // 0-1
}

// Learning and Progress Types
export interface TypingSession {
  id: string;
  userId: string;
  startTime: Date;
  endTime?: Date;
  level: LearningLevel;
  exercises: Exercise[];
  totalWords: number;
  correctWords: number;
  accuracy: number;
  wordsPerMinute: number;
}

export type LearningLevel = 'letters' | 'words' | 'sentences' | 'stories';

export interface Exercise {
  id: string;
  type: LearningLevel;
  content: string;
  imageUrl?: string;
  completed: boolean;
  attempts: number;
  mistakes: string[];
  timeSpent: number; // in seconds
}

export interface Progress {
  userId: string;
  currentLevel: LearningLevel;
  totalSessions: number;
  totalWordsTyped: number;
  averageAccuracy: number;
  averageWPM: number;
  streak: number;
  lastSessionDate: Date;
  achievements: Achievement[];
}

export interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: string;
  unlockedAt: Date;
  category: 'speed' | 'accuracy' | 'consistency' | 'milestone';
}

// AI Service Types
export type AIProvider = 'openai' | 'claude' | 'openrouter';

export interface AIConfig {
  provider: AIProvider;
  apiKey: string;
  model?: string;
  temperature?: number;
}

export interface AIPromptRequest {
  type: 'word' | 'sentence' | 'scene' | 'encouragement';
  context?: string;
  difficulty?: 'easy' | 'medium' | 'hard';
  topic?: string;
}

export interface AIPromptResponse {
  content: string;
  imageKeywords?: string[];
  metadata?: Record<string, any>;
}

// Gamification Types
export interface VirtualPet {
  name: string;
  type: string;
  level: number;
  happiness: number;
  experience: number;
  accessories: string[];
}

export interface Sticker {
  id: string;
  name: string;
  imageUrl: string;
  rarity: 'common' | 'rare' | 'epic' | 'legendary';
  category: string;
  unlocked: boolean;
}

// Component Props Types
export interface TypingDisplayProps {
  text: string;
  currentIndex: number;
  mistakes: number[];
  onCharacterTyped: (char: string) => void;
}

export interface VisualPromptProps {
  imageUrl: string;
  alt: string;
  word: string;
}

export interface KeyboardHintProps {
  nextKey: string;
  showHints: boolean;
}

// Utility Types
export type Theme = UserSettings['theme'];
export type FontSize = UserSettings['fontSize'];

// API Response Types
export interface APIResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
}
