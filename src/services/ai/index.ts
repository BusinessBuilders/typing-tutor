/**
 * AI Services Index
 * Central export point for all AI-related services
 */

// Core services
export { OpenRouterService } from './OpenRouterService';
export { OpenAIService } from './OpenAIService';
export { ClaudeService } from './ClaudeService';

// Factory
export {
  AIServiceFactory,
  getAIProvider,
  initializeAIProvider,
  isAIAvailable,
  getAvailableAIProviders,
} from './AIServiceFactory';

// Models
export {
  OPENROUTER_MODELS,
  OPENAI_MODELS,
  CLAUDE_MODELS,
  ALL_MODELS,
  getModelsByProvider,
  getModelById,
  getDefaultModel,
  getRecommendedModel,
  estimateCost,
  ModelSelector,
  createModelSelector,
} from './models';

// Rate limiter
export {
  RateLimiter,
  rateLimiter,
  checkRateLimit,
  consumeRateLimit,
  getRateLimitStatus,
} from './rateLimiter';

// Cache
export {
  ResponseCache,
  wordCache,
  sentenceCache,
  sceneCache,
  encouragementCache,
  imageKeywordsCache,
  cacheManager,
  CacheManager,
  getCachedOrGenerate,
} from './responseCache';

// Types
export type {
  AIProviderType,
  AIModel,
  AIRequestType,
  ContentGenerationRequest,
  ContentGenerationResponse,
  EncouragementRequest,
  EncouragementResponse,
  TypingEvaluationRequest,
  TypingEvaluationResponse,
  AIConfig,
  IAIProvider,
  AIResponse,
  RateLimitConfig,
  CacheEntry,
} from './types';

export {
  AIProviderError,
  RateLimitError,
  InvalidAPIKeyError,
  ContentFilterError,
} from './types';
