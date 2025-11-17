/**
 * Image Manager
 * Coordinates image fetching, caching, and selection
 */

import { unsplashService, UnsplashImage } from './unsplashService';
import { imageCache, getFallbackImage, categorizeTopicForFallback } from './imageCache';

export interface ImageManagerOptions {
  preferCache?: boolean;
  fallbackToPlaceholder?: boolean;
  preload?: boolean;
}

/**
 * Image Manager Class
 * High-level API for image operations
 */
export class ImageManager {
  private recentlyUsed: Map<string, number> = new Map(); // topic -> timestamp
  private diversityWindow: number = 300000; // 5 minutes

  /**
   * Get image for a word or topic
   */
  async getImageForWord(
    word: string,
    options: ImageManagerOptions = {}
  ): Promise<UnsplashImage | null> {
    const { preferCache = true, fallbackToPlaceholder = true, preload = false } = options;

    try {
      // Try to get from cache first if preferred
      if (preferCache) {
        const cached = this.getFromRecentlyUsed(word);
        if (cached) {
          return cached;
        }
      }

      // Search for new image
      const images = await unsplashService.searchImages({
        query: word,
        count: 5,
        contentFilter: 'high',
      });

      if (images.length === 0) {
        return this.handleNoResults(word, fallbackToPlaceholder);
      }

      // Select best image
      const selectedImage = this.selectBestImage(images, word);

      // Cache the image
      if (preload) {
        await imageCache.cacheImage(selectedImage);
      }

      // Track usage
      this.markAsUsed(word, selectedImage);

      return selectedImage;
    } catch (error) {
      console.error('Error getting image for word:', error);
      return this.handleError(word, fallbackToPlaceholder);
    }
  }

  /**
   * Get images for multiple keywords
   */
  async getImagesForKeywords(
    keywords: string[],
    options: ImageManagerOptions = {}
  ): Promise<Map<string, UnsplashImage>> {
    const results = new Map<string, UnsplashImage>();

    // Process keywords in parallel
    const promises = keywords.map(async (keyword) => {
      const image = await this.getImageForWord(keyword, options);
      return { keyword, image };
    });

    const imageResults = await Promise.all(promises);

    // Build result map
    for (const { keyword, image } of imageResults) {
      if (image) {
        results.set(keyword, image);
      }
    }

    return results;
  }

  /**
   * Get image for sentence (extracts best keyword)
   */
  async getImageForSentence(
    sentence: string,
    keywords?: string[],
    options: ImageManagerOptions = {}
  ): Promise<UnsplashImage | null> {
    // If keywords provided, use the first one
    if (keywords && keywords.length > 0) {
      return this.getImageForWord(keywords[0], options);
    }

    // Otherwise, extract keywords from sentence
    const extractedKeywords = this.extractKeywordsFromSentence(sentence);
    if (extractedKeywords.length > 0) {
      return this.getImageForWord(extractedKeywords[0], options);
    }

    return this.handleNoResults(sentence, options.fallbackToPlaceholder);
  }

  /**
   * Preload images for upcoming content
   */
  async preloadImagesForContent(
    words: string[]
  ): Promise<void> {
    const uniqueWords = [...new Set(words)];

    // Fetch images (will be cached automatically)
    await Promise.all(
      uniqueWords.map((word) =>
        this.getImageForWord(word, { preferCache: false, preload: true })
      )
    );
  }

  /**
   * Select best image from results
   */
  private selectBestImage(images: UnsplashImage[], query: string): UnsplashImage {
    // Scoring system for image selection
    const scoredImages = images.map((image) => {
      let score = 0;

      // Prefer images with alt text matching query
      if (image.alt?.toLowerCase().includes(query.toLowerCase())) {
        score += 10;
      }

      // Prefer landscape orientation (better for display)
      if (image.width > image.height) {
        score += 5;
      }

      // Prefer higher resolution (but not too high)
      const resolution = image.width * image.height;
      if (resolution > 500000 && resolution < 2000000) {
        score += 3;
      }

      // Add some randomness for variety
      score += Math.random() * 2;

      return { image, score };
    });

    // Sort by score and return best
    scoredImages.sort((a, b) => b.score - a.score);
    return scoredImages[0].image;
  }

  /**
   * Extract keywords from sentence
   */
  private extractKeywordsFromSentence(sentence: string): string[] {
    // Simple keyword extraction (nouns usually)
    const words = sentence.toLowerCase().split(/\s+/);

    // Filter out common words
    const stopWords = ['the', 'a', 'an', 'is', 'are', 'was', 'were', 'to', 'and', 'or', 'but', 'in', 'on', 'at'];
    const keywords = words.filter((word) => !stopWords.includes(word) && word.length > 3);

    return keywords.slice(0, 3); // Return top 3
  }

  /**
   * Get from recently used cache
   */
  private getFromRecentlyUsed(topic: string): UnsplashImage | null {
    const lastUsed = this.recentlyUsed.get(topic);

    if (!lastUsed) {
      return null;
    }

    // Check if within diversity window
    if (Date.now() - lastUsed < this.diversityWindow) {
      // Don't reuse too quickly
      return null;
    }

    return null; // For now, always fetch fresh images
  }

  /**
   * Mark image as used for a topic
   */
  private markAsUsed(topic: string, _image: UnsplashImage): void {
    this.recentlyUsed.set(topic, Date.now());

    // Limit size of recently used cache
    if (this.recentlyUsed.size > 100) {
      const oldestTopic = Array.from(this.recentlyUsed.entries()).sort(
        (a, b) => a[1] - b[1]
      )[0]?.[0];

      if (oldestTopic) {
        this.recentlyUsed.delete(oldestTopic);
      }
    }
  }

  /**
   * Handle no results
   */
  private handleNoResults(
    query: string,
    useFallback?: boolean
  ): UnsplashImage | null {
    if (!useFallback) {
      return null;
    }

    const category = categorizeTopicForFallback(query);
    const fallbackUrl = getFallbackImage(category);

    return {
      id: `fallback-${query}`,
      url: fallbackUrl,
      thumbnailUrl: fallbackUrl,
      alt: query,
      photographer: 'Placeholder',
      photographerUrl: '#',
      width: 800,
      height: 600,
    };
  }

  /**
   * Handle errors
   */
  private handleError(query: string, useFallback?: boolean): UnsplashImage | null {
    console.error('Image manager error for query:', query);
    return this.handleNoResults(query, useFallback);
  }

  /**
   * Clear caches
   */
  clearCaches(): void {
    this.recentlyUsed.clear();
    imageCache.clearAll();
  }

  /**
   * Get statistics
   */
  getStats(): {
    recentlyUsedCount: number;
    cacheStats: any;
  } {
    return {
      recentlyUsedCount: this.recentlyUsed.size,
      cacheStats: imageCache.getStats(),
    };
  }
}

// Export singleton instance
export const imageManager = new ImageManager();

/**
 * Convenience functions
 */

export async function getImageForWord(
  word: string,
  options?: ImageManagerOptions
): Promise<UnsplashImage | null> {
  return imageManager.getImageForWord(word, options);
}

export async function getImageForSentence(
  sentence: string,
  keywords?: string[],
  options?: ImageManagerOptions
): Promise<UnsplashImage | null> {
  return imageManager.getImageForSentence(sentence, keywords, options);
}

export async function preloadImages(words: string[]): Promise<void> {
  return imageManager.preloadImagesForContent(words);
}

export default imageManager;
