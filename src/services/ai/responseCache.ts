/**
 * AI Response Cache
 * Caches AI responses to reduce API calls and improve performance
 */

import { CacheEntry } from './types';

/**
 * Response Cache Class
 * Implements LRU (Least Recently Used) cache with TTL (Time To Live)
 */
export class ResponseCache<T> {
  private cache: Map<string, CacheEntry<T>> = new Map();
  private maxSize: number;
  private defaultTTL: number; // in milliseconds

  constructor(maxSize: number = 100, defaultTTL: number = 3600000) {
    // Default: 100 entries, 1 hour TTL
    this.maxSize = maxSize;
    this.defaultTTL = defaultTTL;
  }

  /**
   * Generate cache key from parameters
   */
  private generateKey(params: Record<string, any>): string {
    // Sort keys to ensure consistent hashing
    const sortedKeys = Object.keys(params).sort();
    const keyString = sortedKeys.map((key) => `${key}:${JSON.stringify(params[key])}`).join('|');

    return this.hashString(keyString);
  }

  /**
   * Simple string hash function
   */
  private hashString(str: string): string {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i);
      hash = (hash << 5) - hash + char;
      hash = hash & hash; // Convert to 32bit integer
    }
    return Math.abs(hash).toString(36);
  }

  /**
   * Set cache entry
   */
  set(key: string | Record<string, any>, value: T, ttl?: number): void {
    const cacheKey = typeof key === 'string' ? key : this.generateKey(key);
    const now = Date.now();
    const expiresAt = now + (ttl || this.defaultTTL);

    const entry: CacheEntry<T> = {
      key: cacheKey,
      value,
      timestamp: now,
      expiresAt,
    };

    // Remove oldest entry if cache is full
    if (this.cache.size >= this.maxSize && !this.cache.has(cacheKey)) {
      const oldestKey = this.cache.keys().next().value;
      if (oldestKey) {
        this.cache.delete(oldestKey);
      }
    }

    this.cache.set(cacheKey, entry);
  }

  /**
   * Get cache entry
   */
  get(key: string | Record<string, any>): T | null {
    const cacheKey = typeof key === 'string' ? key : this.generateKey(key);
    const entry = this.cache.get(cacheKey);

    if (!entry) {
      return null;
    }

    // Check if entry has expired
    if (Date.now() > entry.expiresAt) {
      this.cache.delete(cacheKey);
      return null;
    }

    // Move to end (LRU behavior)
    this.cache.delete(cacheKey);
    this.cache.set(cacheKey, entry);

    return entry.value;
  }

  /**
   * Check if key exists in cache
   */
  has(key: string | Record<string, any>): boolean {
    return this.get(key) !== null;
  }

  /**
   * Delete cache entry
   */
  delete(key: string | Record<string, any>): boolean {
    const cacheKey = typeof key === 'string' ? key : this.generateKey(key);
    return this.cache.delete(cacheKey);
  }

  /**
   * Clear all cache entries
   */
  clear(): void {
    this.cache.clear();
  }

  /**
   * Get cache size
   */
  size(): number {
    return this.cache.size;
  }

  /**
   * Clean expired entries
   */
  cleanExpired(): number {
    const now = Date.now();
    let removedCount = 0;

    for (const [key, entry] of this.cache.entries()) {
      if (now > entry.expiresAt) {
        this.cache.delete(key);
        removedCount++;
      }
    }

    return removedCount;
  }

  /**
   * Get cache statistics
   */
  getStats(): {
    size: number;
    maxSize: number;
    hitRate: number;
    expiredEntries: number;
  } {
    const now = Date.now();
    let expiredCount = 0;

    for (const entry of this.cache.values()) {
      if (now > entry.expiresAt) {
        expiredCount++;
      }
    }

    return {
      size: this.cache.size,
      maxSize: this.maxSize,
      hitRate: 0, // Would need hit/miss tracking
      expiredEntries: expiredCount,
    };
  }
}

/**
 * AI-specific cache implementations
 */

// Word generation cache
export const wordCache = new ResponseCache<string>(200, 7200000); // 2 hours

// Sentence generation cache
export const sentenceCache = new ResponseCache<string>(150, 3600000); // 1 hour

// Scene generation cache
export const sceneCache = new ResponseCache<string>(100, 3600000); // 1 hour

// Encouragement cache
export const encouragementCache = new ResponseCache<string>(50, 1800000); // 30 minutes

// Image keywords cache
export const imageKeywordsCache = new ResponseCache<string[]>(200, 7200000); // 2 hours

/**
 * Cache manager for all AI caches
 */
export class CacheManager {
  private caches: Map<string, ResponseCache<any>> = new Map();

  constructor() {
    this.caches.set('word', wordCache);
    this.caches.set('sentence', sentenceCache);
    this.caches.set('scene', sceneCache);
    this.caches.set('encouragement', encouragementCache);
    this.caches.set('imageKeywords', imageKeywordsCache);
  }

  /**
   * Get cache by name
   */
  getCache<T>(name: string): ResponseCache<T> | undefined {
    return this.caches.get(name);
  }

  /**
   * Clear all caches
   */
  clearAll(): void {
    for (const cache of this.caches.values()) {
      cache.clear();
    }
  }

  /**
   * Clean expired entries from all caches
   */
  cleanAllExpired(): number {
    let totalRemoved = 0;
    for (const cache of this.caches.values()) {
      totalRemoved += cache.cleanExpired();
    }
    return totalRemoved;
  }

  /**
   * Get statistics for all caches
   */
  getAllStats(): Record<string, any> {
    const stats: Record<string, any> = {};
    for (const [name, cache] of this.caches.entries()) {
      stats[name] = cache.getStats();
    }
    return stats;
  }

  /**
   * Start automatic cleanup interval
   */
  startAutoCleanup(intervalMs: number = 600000): NodeJS.Timeout {
    // Default: every 10 minutes
    return setInterval(() => {
      const removed = this.cleanAllExpired();
      if (removed > 0) {
        console.log(`Cache cleanup: removed ${removed} expired entries`);
      }
    }, intervalMs);
  }
}

// Export singleton instance
export const cacheManager = new CacheManager();

/**
 * Convenience function to get cached response or generate new one
 */
export async function getCachedOrGenerate<T>(
  cacheName: string,
  key: Record<string, any>,
  generator: () => Promise<T>,
  ttl?: number
): Promise<{ value: T; cached: boolean }> {
  const cache = cacheManager.getCache<T>(cacheName);

  if (cache) {
    const cached = cache.get(key);
    if (cached !== null) {
      return { value: cached, cached: true };
    }
  }

  // Generate new value
  const value = await generator();

  // Cache it
  if (cache) {
    cache.set(key, value, ttl);
  }

  return { value, cached: false };
}

export default {
  ResponseCache,
  wordCache,
  sentenceCache,
  sceneCache,
  encouragementCache,
  imageKeywordsCache,
  cacheManager,
  getCachedOrGenerate,
};
