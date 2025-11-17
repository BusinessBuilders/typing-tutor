/**
 * Image Cache Service
 * Caches downloaded images and manages offline fallbacks
 */

import { UnsplashImage } from './unsplashService';

export interface CachedImage extends UnsplashImage {
  cachedAt: number;
  expiresAt: number;
  blob?: Blob;
  localUrl?: string;
}

/**
 * Image Cache Class
 */
export class ImageCache {
  private cache: Map<string, CachedImage> = new Map();
  private maxCacheSize: number = 50;
  private defaultTTL: number = 86400000; // 24 hours
  private preloadQueue: string[] = [];

  /**
   * Add image to cache
   */
  async cacheImage(image: UnsplashImage, ttl?: number): Promise<CachedImage> {
    const now = Date.now();
    const expiresAt = now + (ttl || this.defaultTTL);

    // Try to fetch and cache the actual image data
    let blob: Blob | undefined;
    let localUrl: string | undefined;

    try {
      const response = await fetch(image.url);
      blob = await response.blob();
      localUrl = URL.createObjectURL(blob);
    } catch (error) {
      console.error('Failed to cache image:', error);
    }

    const cachedImage: CachedImage = {
      ...image,
      cachedAt: now,
      expiresAt,
      blob,
      localUrl: localUrl || image.url,
    };

    // Remove oldest if cache is full
    if (this.cache.size >= this.maxCacheSize) {
      const oldestKey = Array.from(this.cache.entries()).sort(
        (a, b) => a[1].cachedAt - b[1].cachedAt
      )[0]?.[0];

      if (oldestKey) {
        this.removeFromCache(oldestKey);
      }
    }

    this.cache.set(image.id, cachedImage);
    return cachedImage;
  }

  /**
   * Get image from cache
   */
  getFromCache(imageId: string): CachedImage | null {
    const cached = this.cache.get(imageId);

    if (!cached) {
      return null;
    }

    // Check if expired
    if (Date.now() > cached.expiresAt) {
      this.removeFromCache(imageId);
      return null;
    }

    return cached;
  }

  /**
   * Remove image from cache
   */
  removeFromCache(imageId: string): void {
    const cached = this.cache.get(imageId);

    // Revoke object URL to free memory
    if (cached?.localUrl && cached.localUrl.startsWith('blob:')) {
      URL.revokeObjectURL(cached.localUrl);
    }

    this.cache.delete(imageId);
  }

  /**
   * Clear all cached images
   */
  clearAll(): void {
    // Revoke all object URLs
    for (const cached of this.cache.values()) {
      if (cached.localUrl && cached.localUrl.startsWith('blob:')) {
        URL.revokeObjectURL(cached.localUrl);
      }
    }

    this.cache.clear();
  }

  /**
   * Get cache statistics
   */
  getStats(): {
    size: number;
    maxSize: number;
    totalSize: number;
    oldestEntry: number | null;
  } {
    let totalSize = 0;
    let oldestEntry: number | null = null;

    for (const cached of this.cache.values()) {
      if (cached.blob) {
        totalSize += cached.blob.size;
      }

      if (oldestEntry === null || cached.cachedAt < oldestEntry) {
        oldestEntry = cached.cachedAt;
      }
    }

    return {
      size: this.cache.size,
      maxSize: this.maxCacheSize,
      totalSize,
      oldestEntry,
    };
  }

  /**
   * Preload images for upcoming use
   */
  async preload(images: UnsplashImage[]): Promise<void> {
    const promises = images.map((image) => {
      // Check if already cached
      if (!this.cache.has(image.id)) {
        return this.cacheImage(image);
      }
      return Promise.resolve(this.cache.get(image.id)!);
    });

    await Promise.all(promises);
  }

  /**
   * Add to preload queue
   */
  queuePreload(imageId: string): void {
    if (!this.preloadQueue.includes(imageId)) {
      this.preloadQueue.push(imageId);
    }
  }

  /**
   * Process preload queue
   */
  async processPreloadQueue(images: UnsplashImage[]): Promise<void> {
    const toPreload = images.filter((img) => this.preloadQueue.includes(img.id));

    await this.preload(toPreload);

    // Clear queue
    this.preloadQueue = [];
  }

  /**
   * Clean expired entries
   */
  cleanExpired(): number {
    const now = Date.now();
    let removed = 0;

    for (const [id, cached] of this.cache.entries()) {
      if (now > cached.expiresAt) {
        this.removeFromCache(id);
        removed++;
      }
    }

    return removed;
  }
}

// Export singleton instance
export const imageCache = new ImageCache();

/**
 * Offline fallback images
 */
export const FALLBACK_IMAGES: Record<string, string> = {
  // Categories of fallback images
  animal: '/images/fallbacks/animal.svg',
  nature: '/images/fallbacks/nature.svg',
  food: '/images/fallbacks/food.svg',
  vehicle: '/images/fallbacks/vehicle.svg',
  toy: '/images/fallbacks/toy.svg',
  space: '/images/fallbacks/space.svg',
  default: '/images/fallbacks/default.svg',
};

/**
 * Get fallback image for a category
 */
export function getFallbackImage(category: string): string {
  return FALLBACK_IMAGES[category.toLowerCase()] || FALLBACK_IMAGES.default;
}

/**
 * Categorize topic for fallback
 */
export function categorizeTopicForFallback(topic: string): string {
  const lowerTopic = topic.toLowerCase();

  const categories: Record<string, string[]> = {
    animal: ['dog', 'cat', 'bird', 'fish', 'pet', 'animal'],
    nature: ['tree', 'flower', 'plant', 'sun', 'moon', 'star', 'cloud', 'rain'],
    food: ['apple', 'banana', 'cake', 'pizza', 'food', 'eat'],
    vehicle: ['car', 'bus', 'train', 'plane', 'bike', 'vehicle'],
    toy: ['ball', 'doll', 'toy', 'game', 'play'],
    space: ['rocket', 'planet', 'space', 'star', 'moon', 'astronaut'],
  };

  for (const [category, keywords] of Object.entries(categories)) {
    if (keywords.some((keyword) => lowerTopic.includes(keyword))) {
      return category;
    }
  }

  return 'default';
}

export default imageCache;
