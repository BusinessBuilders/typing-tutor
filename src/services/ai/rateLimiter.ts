/**
 * Rate Limiter for AI API Requests
 * Implements token bucket algorithm for rate limiting
 */

import { AIProviderType, RateLimitError, RateLimitConfig } from './types';

interface RateLimitBucket {
  tokens: number;
  lastRefill: number;
  requestCount: number;
  lastHourReset: number;
}

/**
 * Rate Limiter Class
 * Implements token bucket algorithm with per-minute and per-hour limits
 */
export class RateLimiter {
  private buckets: Map<AIProviderType, RateLimitBucket> = new Map();
  private configs: Map<AIProviderType, RateLimitConfig> = new Map();

  // Default rate limits (conservative)
  private defaultConfig: RateLimitConfig = {
    requestsPerMinute: 20,
    requestsPerHour: 500,
    tokensPerMinute: 10000,
  };

  constructor() {
    // Initialize default configs for each provider
    this.setProviderConfig('openrouter', {
      requestsPerMinute: 20,
      requestsPerHour: 500,
    });

    this.setProviderConfig('openai', {
      requestsPerMinute: 60,
      requestsPerHour: 3000,
      tokensPerMinute: 90000,
    });

    this.setProviderConfig('claude', {
      requestsPerMinute: 50,
      requestsPerHour: 1000,
      tokensPerMinute: 100000,
    });
  }

  /**
   * Set rate limit configuration for a provider
   */
  setProviderConfig(provider: AIProviderType, config: Partial<RateLimitConfig>): void {
    const existingConfig = this.configs.get(provider) || this.defaultConfig;
    this.configs.set(provider, { ...existingConfig, ...config });
  }

  /**
   * Get rate limit configuration for a provider
   */
  getProviderConfig(provider: AIProviderType): RateLimitConfig {
    return this.configs.get(provider) || this.defaultConfig;
  }

  /**
   * Initialize bucket for a provider
   */
  private initializeBucket(provider: AIProviderType): RateLimitBucket {
    const config = this.getProviderConfig(provider);
    const now = Date.now();

    const bucket: RateLimitBucket = {
      tokens: config.requestsPerMinute,
      lastRefill: now,
      requestCount: 0,
      lastHourReset: now,
    };

    this.buckets.set(provider, bucket);
    return bucket;
  }

  /**
   * Get or create bucket for a provider
   */
  private getBucket(provider: AIProviderType): RateLimitBucket {
    return this.buckets.get(provider) || this.initializeBucket(provider);
  }

  /**
   * Refill tokens based on time elapsed
   */
  private refillTokens(provider: AIProviderType): void {
    const bucket = this.getBucket(provider);
    const config = this.getProviderConfig(provider);
    const now = Date.now();

    // Calculate time elapsed since last refill (in minutes)
    const minutesElapsed = (now - bucket.lastRefill) / (60 * 1000);

    // Refill tokens based on elapsed time
    const tokensToAdd = Math.floor(minutesElapsed * config.requestsPerMinute);

    if (tokensToAdd > 0) {
      bucket.tokens = Math.min(bucket.tokens + tokensToAdd, config.requestsPerMinute);
      bucket.lastRefill = now;
    }

    // Reset hourly counter if an hour has passed
    const hoursElapsed = (now - bucket.lastHourReset) / (60 * 60 * 1000);
    if (hoursElapsed >= 1) {
      bucket.requestCount = 0;
      bucket.lastHourReset = now;
    }
  }

  /**
   * Check if a request can be made
   */
  async checkLimit(provider: AIProviderType, estimatedTokens: number = 1000): Promise<boolean> {
    this.refillTokens(provider);

    const bucket = this.getBucket(provider);
    const config = this.getProviderConfig(provider);

    // Check per-minute limit
    if (bucket.tokens < 1) {
      return false;
    }

    // Check per-hour limit
    if (bucket.requestCount >= config.requestsPerHour) {
      return false;
    }

    // Check token limit if configured
    if (config.tokensPerMinute && estimatedTokens > config.tokensPerMinute) {
      return false;
    }

    return true;
  }

  /**
   * Consume a token (make a request)
   */
  async consume(provider: AIProviderType, estimatedTokens: number = 1000): Promise<void> {
    const canProceed = await this.checkLimit(provider, estimatedTokens);

    if (!canProceed) {
      const bucket = this.getBucket(provider);
      const config = this.getProviderConfig(provider);

      // Calculate retry after time
      const minutesUntilRefill = bucket.tokens < 1 ? 1 : 0;
      const hoursUntilReset =
        bucket.requestCount >= config.requestsPerHour
          ? Math.ceil((60 - (Date.now() - bucket.lastHourReset) / (60 * 1000)) / 60)
          : 0;

      const retryAfter = Math.max(minutesUntilRefill, hoursUntilReset);

      throw new RateLimitError(provider, retryAfter);
    }

    // Consume token
    const bucket = this.getBucket(provider);
    bucket.tokens -= 1;
    bucket.requestCount += 1;
  }

  /**
   * Get current rate limit status
   */
  getStatus(provider: AIProviderType): {
    tokensAvailable: number;
    requestsThisHour: number;
    minuteLimit: number;
    hourLimit: number;
  } {
    this.refillTokens(provider);

    const bucket = this.getBucket(provider);
    const config = this.getProviderConfig(provider);

    return {
      tokensAvailable: bucket.tokens,
      requestsThisHour: bucket.requestCount,
      minuteLimit: config.requestsPerMinute,
      hourLimit: config.requestsPerHour,
    };
  }

  /**
   * Reset rate limits for a provider
   */
  reset(provider: AIProviderType): void {
    this.buckets.delete(provider);
  }

  /**
   * Reset all rate limits
   */
  resetAll(): void {
    this.buckets.clear();
  }

  /**
   * Get time until next token refill (in milliseconds)
   */
  getTimeUntilRefill(provider: AIProviderType): number {
    const bucket = this.getBucket(provider);
    const now = Date.now();
    const timeSinceLastRefill = now - bucket.lastRefill;
    const timeUntilNextMinute = 60 * 1000 - timeSinceLastRefill;

    return Math.max(0, timeUntilNextMinute);
  }
}

// Export singleton instance
export const rateLimiter = new RateLimiter();

/**
 * Convenience function to check rate limit
 */
export async function checkRateLimit(
  provider: AIProviderType,
  estimatedTokens?: number
): Promise<boolean> {
  return rateLimiter.checkLimit(provider, estimatedTokens);
}

/**
 * Convenience function to consume rate limit
 */
export async function consumeRateLimit(
  provider: AIProviderType,
  estimatedTokens?: number
): Promise<void> {
  return rateLimiter.consume(provider, estimatedTokens);
}

/**
 * Convenience function to get rate limit status
 */
export function getRateLimitStatus(provider: AIProviderType) {
  return rateLimiter.getStatus(provider);
}

export default rateLimiter;
