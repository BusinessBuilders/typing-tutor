/**
 * AI Service Type Definitions
 * Defines interfaces for AI providers and their interactions
 */

import { LearningLevel } from '../../types';

// AI Provider types
export type AIProviderType = 'openai' | 'claude' | 'openrouter';

// AI Model configurations
export interface AIModel {
  id: string;
  name: string;
  provider: AIProviderType;
  maxTokens: number;
  costPer1kTokens?: number;
}

// AI Request types
export type AIRequestType =
  | 'word-generation'
  | 'sentence-generation'
  | 'scene-generation'
  | 'encouragement'
  | 'image-keywords'
  | 'typing-evaluation'
  | 'achievement-message'
  | 'difficulty-assessment';

// Content generation request
export interface ContentGenerationRequest {
  type: AIRequestType;
  level: LearningLevel;
  difficulty?: 'easy' | 'medium' | 'hard';
  topic?: string;
  context?: string;
  previousWords?: string[];
  userAge?: number;
}

// Content generation response
export interface ContentGenerationResponse {
  content: string;
  imageKeywords?: string[];
  difficulty?: 'easy' | 'medium' | 'hard';
  metadata?: Record<string, any>;
}

// Encouragement request
export interface EncouragementRequest {
  accuracy: number;
  wordsCompleted: number;
  mistakeCount: number;
  context?: string;
}

// Encouragement response
export interface EncouragementResponse {
  message: string;
  tone: 'celebratory' | 'encouraging' | 'supportive';
}

// Typing evaluation request
export interface TypingEvaluationRequest {
  expectedText: string;
  typedText: string;
  timeSpent: number; // in seconds
  mistakes: string[];
}

// Typing evaluation response
export interface TypingEvaluationResponse {
  feedback: string;
  strengths: string[];
  areasToImprove: string[];
  encouragement: string;
}

// AI Configuration
export interface AIConfig {
  provider: AIProviderType;
  apiKey: string;
  model?: string;
  temperature?: number; // 0-2, controls randomness
  maxTokens?: number;
  timeout?: number; // in milliseconds
}

// AI Provider Interface - All providers must implement this
export interface IAIProvider {
  readonly provider: AIProviderType;
  readonly model: string;

  /**
   * Initialize the AI provider
   */
  initialize(config: AIConfig): void;

  /**
   * Check if the provider is properly configured
   */
  isConfigured(): boolean;

  /**
   * Validate API key
   */
  validateApiKey(): Promise<boolean>;

  /**
   * Generate word for typing practice
   */
  generateWord(request: ContentGenerationRequest): Promise<ContentGenerationResponse>;

  /**
   * Generate sentence for typing practice
   */
  generateSentence(request: ContentGenerationRequest): Promise<ContentGenerationResponse>;

  /**
   * Generate scene description for story mode
   */
  generateScene(request: ContentGenerationRequest): Promise<ContentGenerationResponse>;

  /**
   * Generate encouragement message
   */
  generateEncouragement(request: EncouragementRequest): Promise<EncouragementResponse>;

  /**
   * Evaluate typing performance
   */
  evaluateTyping(request: TypingEvaluationRequest): Promise<TypingEvaluationResponse>;

  /**
   * Extract image keywords from content
   */
  extractImageKeywords(content: string): Promise<string[]>;

  /**
   * Generate achievement message
   */
  generateAchievementMessage(achievementType: string, context: string): Promise<string>;

  /**
   * Assess difficulty level of content
   */
  assessDifficulty(content: string): Promise<'easy' | 'medium' | 'hard'>;
}

// AI Response with metadata
export interface AIResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  tokensUsed?: number;
  model?: string;
  cached?: boolean;
}

// Rate limiting configuration
export interface RateLimitConfig {
  requestsPerMinute: number;
  requestsPerHour: number;
  tokensPerMinute?: number;
}

// Cache entry
export interface CacheEntry<T> {
  key: string;
  value: T;
  timestamp: number;
  expiresAt: number;
}

// API Error types
export class AIProviderError extends Error {
  constructor(
    message: string,
    public provider: AIProviderType,
    public code?: string,
    public statusCode?: number
  ) {
    super(message);
    this.name = 'AIProviderError';
  }
}

export class RateLimitError extends AIProviderError {
  constructor(provider: AIProviderType, retryAfter?: number) {
    super('Rate limit exceeded', provider, 'RATE_LIMIT', 429);
    this.name = 'RateLimitError';
  }
}

export class InvalidAPIKeyError extends AIProviderError {
  constructor(provider: AIProviderType) {
    super('Invalid API key', provider, 'INVALID_API_KEY', 401);
    this.name = 'InvalidAPIKeyError';
  }
}

export class ContentFilterError extends AIProviderError {
  constructor(provider: AIProviderType, reason: string) {
    super(`Content filtered: ${reason}`, provider, 'CONTENT_FILTER', 400);
    this.name = 'ContentFilterError';
  }
}
