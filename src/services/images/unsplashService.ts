/**
 * Unsplash Image Service
 * Fetches child-appropriate images for typing practice
 */

import { apiClient } from '../api/axiosConfig';
import { env } from '../../utils/env';

export interface UnsplashImage {
  id: string;
  url: string;
  thumbnailUrl: string;
  alt: string;
  photographer: string;
  photographerUrl: string;
  width: number;
  height: number;
}

export interface ImageSearchOptions {
  query: string;
  count?: number;
  orientation?: 'landscape' | 'portrait' | 'squarish';
  color?: string;
  contentFilter?: 'low' | 'high';
}

/**
 * Unsplash Service Class
 */
export class UnsplashService {
  private apiKey: string;
  private baseURL: string = 'https://api.unsplash.com';
  private cache: Map<string, UnsplashImage[]> = new Map();

  constructor(apiKey?: string) {
    this.apiKey = apiKey || env.unsplashApiKey || '';
  }

  /**
   * Check if service is configured
   */
  isConfigured(): boolean {
    return !!this.apiKey && this.apiKey.length > 0;
  }

  /**
   * Search for images
   */
  async searchImages(options: ImageSearchOptions): Promise<UnsplashImage[]> {
    if (!this.isConfigured()) {
      console.warn('Unsplash API key not configured');
      return this.getFallbackImages(options.query);
    }

    const { query, count = 5, orientation = 'landscape', contentFilter = 'high' } = options;

    // Check cache first
    const cacheKey = `${query}-${count}-${orientation}`;
    if (this.cache.has(cacheKey)) {
      const cached = this.cache.get(cacheKey)!;
      return cached.slice(0, count);
    }

    try {
      const response = await apiClient.get(`${this.baseURL}/search/photos`, {
        params: {
          query,
          per_page: count * 2, // Get more for filtering
          orientation,
          content_filter: contentFilter,
        },
        headers: {
          Authorization: `Client-ID ${this.apiKey}`,
        },
      });

      const images: UnsplashImage[] = response.data.results.map((photo: any) => ({
        id: photo.id,
        url: photo.urls.regular,
        thumbnailUrl: photo.urls.small,
        alt: photo.alt_description || query,
        photographer: photo.user.name,
        photographerUrl: photo.user.links.html,
        width: photo.width,
        height: photo.height,
      }));

      // Filter for child-appropriate content
      const filtered = this.filterImages(images);

      // Cache results
      this.cache.set(cacheKey, filtered);

      return filtered.slice(0, count);
    } catch (error) {
      console.error('Unsplash API error:', error);
      return this.getFallbackImages(query);
    }
  }

  /**
   * Get a random image for a topic
   */
  async getRandomImage(topic: string): Promise<UnsplashImage | null> {
    const images = await this.searchImages({ query: topic, count: 10 });
    if (images.length === 0) return null;

    // Return random image from results
    const randomIndex = Math.floor(Math.random() * images.length);
    return images[randomIndex];
  }

  /**
   * Get multiple images for topics
   */
  async getImagesForTopics(topics: string[]): Promise<Map<string, UnsplashImage>> {
    const results = new Map<string, UnsplashImage>();

    for (const topic of topics) {
      const image = await getRandomImage(topic);
      if (image) {
        results.set(topic, image);
      }
    }

    return results;
  }

  /**
   * Filter images for child appropriateness
   */
  private filterImages(images: UnsplashImage[]): UnsplashImage[] {
    return images.filter((image) => {
      // Basic filters for child safety
      const alt = image.alt?.toLowerCase() || '';

      // Block potentially inappropriate content
      const blockedWords = ['sexy', 'nude', 'violence', 'weapon', 'blood', 'horror'];
      for (const word of blockedWords) {
        if (alt.includes(word)) {
          return false;
        }
      }

      return true;
    });
  }

  /**
   * Get fallback images when API is unavailable
   */
  private getFallbackImages(query: string): UnsplashImage[] {
    // Return placeholder images
    const fallbackImage: UnsplashImage = {
      id: 'fallback',
      url: `/images/fallback/${query.toLowerCase().replace(/\s+/g, '-')}.jpg`,
      thumbnailUrl: `/images/fallback/${query.toLowerCase().replace(/\s+/g, '-')}-thumb.jpg`,
      alt: query,
      photographer: 'Placeholder',
      photographerUrl: '#',
      width: 800,
      height: 600,
    };

    return [fallbackImage];
  }

  /**
   * Clear cache
   */
  clearCache(): void {
    this.cache.clear();
  }

  /**
   * Preload images
   */
  async preloadImages(topics: string[]): Promise<void> {
    const promises = topics.map((topic) =>
      this.searchImages({ query: topic, count: 3 })
    );

    await Promise.all(promises);
  }
}

// Export singleton instance
export const unsplashService = new UnsplashService();

/**
 * Convenience function to search images
 */
export async function searchImages(
  query: string,
  count: number = 5
): Promise<UnsplashImage[]> {
  return unsplashService.searchImages({ query, count });
}

/**
 * Convenience function to get random image
 */
export async function getRandomImage(topic: string): Promise<UnsplashImage | null> {
  return unsplashService.getRandomImage(topic);
}

export default unsplashService;
