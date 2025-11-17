/**
 * Image Description Service
 * Generates autism-friendly descriptions for images using AI
 */

import { getAIProvider } from '../ai/AIServiceFactory';
import { UnsplashImage } from './unsplashService';

export interface ImageDescription {
  short: string; // 1-2 words
  medium: string; // 1 sentence
  detailed: string; // 2-3 sentences
  keywords: string[];
}

export interface DescriptionOptions {
  style?: 'simple' | 'descriptive' | 'sensory';
  includeColors?: boolean;
  includeActions?: boolean;
  maxWords?: number;
}

/**
 * Image Description Service Class
 */
export class ImageDescriptionService {
  private cache: Map<string, ImageDescription> = new Map();

  /**
   * Generate autism-friendly description for an image
   */
  async generateDescription(
    image: UnsplashImage,
    options: DescriptionOptions = {}
  ): Promise<ImageDescription> {
    // Check cache first
    const cacheKey = `${image.id}-${JSON.stringify(options)}`;
    if (this.cache.has(cacheKey)) {
      return this.cache.get(cacheKey)!;
    }

    const provider = getAIProvider();
    if (!provider) {
      // Fallback to basic description from image alt text
      return this.createFallbackDescription(image);
    }

    try {
      const description = await this.generateWithAI(image, options, provider);
      this.cache.set(cacheKey, description);
      return description;
    } catch (error) {
      console.error('Failed to generate AI description:', error);
      return this.createFallbackDescription(image);
    }
  }

  /**
   * Generate description using AI
   */
  private async generateWithAI(
    image: UnsplashImage,
    options: DescriptionOptions,
    provider: any
  ): Promise<ImageDescription> {
    const { style = 'simple', includeColors = true, includeActions = true } = options;

    // Build prompt for AI
    const systemPrompt = `You are an expert at creating image descriptions for children with autism.
Your descriptions should be:
- Concrete and literal (no metaphors or figurative language)
- Clear and direct
- Focused on observable, tangible details
- Using simple, everyday vocabulary
- Organized from general to specific
- Calming and positive in tone

Avoid:
- Abstract concepts
- Idiomatic expressions
- Overly emotional language
- Confusing or ambiguous descriptions`;

    let userPrompt = `Create an autism-friendly description for this image.\n`;
    userPrompt += `Image info: "${image.alt || 'an image'}"\n\n`;
    userPrompt += `Style: ${style}\n`;

    if (includeColors) {
      userPrompt += `Include color descriptions when relevant.\n`;
    }

    if (includeActions) {
      userPrompt += `Include what's happening in the image.\n`;
    }

    userPrompt += `\nProvide three versions:\n`;
    userPrompt += `1. SHORT (1-2 words): A simple label\n`;
    userPrompt += `2. MEDIUM (1 sentence): A clear description\n`;
    userPrompt += `3. DETAILED (2-3 sentences): More sensory details\n\n`;
    userPrompt += `Also provide 3-5 keywords.\n\n`;
    userPrompt += `Format your response exactly like this:\n`;
    userPrompt += `SHORT: [description]\n`;
    userPrompt += `MEDIUM: [description]\n`;
    userPrompt += `DETAILED: [description]\n`;
    userPrompt += `KEYWORDS: [keyword1, keyword2, keyword3]`;

    // Use AI to generate description
    // We'll use the makeRequest method if available, or assessDifficulty as fallback
    const response = await this.requestFromProvider(provider, userPrompt, systemPrompt);

    // Parse the response
    return this.parseAIResponse(response, image);
  }

  /**
   * Make request to AI provider
   */
  private async requestFromProvider(
    provider: any,
    userPrompt: string,
    systemPrompt: string
  ): Promise<string> {
    // Try to use a general request method if available
    if (typeof provider.makeRequest === 'function') {
      return await provider.makeRequest(userPrompt, systemPrompt);
    }

    // Fallback: use generateSentence method
    if (typeof provider.generateSentence === 'function') {
      const result = await provider.generateSentence({
        topic: userPrompt,
        difficulty: 'easy',
      });
      return result.content;
    }

    throw new Error('Provider does not support description generation');
  }

  /**
   * Parse AI response into structured description
   */
  private parseAIResponse(response: string, image: UnsplashImage): ImageDescription {
    const lines = response.split('\n').map((line) => line.trim());

    let short = '';
    let medium = '';
    let detailed = '';
    let keywords: string[] = [];

    for (const line of lines) {
      if (line.startsWith('SHORT:')) {
        short = line.replace('SHORT:', '').trim();
      } else if (line.startsWith('MEDIUM:')) {
        medium = line.replace('MEDIUM:', '').trim();
      } else if (line.startsWith('DETAILED:')) {
        detailed = line.replace('DETAILED:', '').trim();
      } else if (line.startsWith('KEYWORDS:')) {
        const keywordStr = line.replace('KEYWORDS:', '').trim();
        keywords = keywordStr.split(',').map((k) => k.trim().toLowerCase());
      }
    }

    // Fallback if parsing failed
    if (!short || !medium || !detailed) {
      return this.createFallbackDescription(image);
    }

    return {
      short,
      medium,
      detailed,
      keywords: keywords.slice(0, 5), // Limit to 5 keywords
    };
  }

  /**
   * Create fallback description from image data
   */
  private createFallbackDescription(image: UnsplashImage): ImageDescription {
    const alt = image.alt || 'an image';
    const words = alt.split(' ').filter((w) => w.length > 0);

    return {
      short: words.slice(0, 2).join(' '),
      medium: alt,
      detailed: `This is ${alt}. It shows a clear, simple scene.`,
      keywords: words.slice(0, 5),
    };
  }

  /**
   * Generate multiple descriptions
   */
  async generateMultipleDescriptions(
    images: UnsplashImage[],
    options: DescriptionOptions = {}
  ): Promise<Map<string, ImageDescription>> {
    const results = new Map<string, ImageDescription>();

    // Process in batches to avoid rate limits
    const batchSize = 5;
    for (let i = 0; i < images.length; i += batchSize) {
      const batch = images.slice(i, i + batchSize);
      const promises = batch.map((image) => this.generateDescription(image, options));
      const descriptions = await Promise.all(promises);

      batch.forEach((image, idx) => {
        results.set(image.id, descriptions[idx]);
      });

      // Small delay between batches
      if (i + batchSize < images.length) {
        await new Promise((resolve) => setTimeout(resolve, 1000));
      }
    }

    return results;
  }

  /**
   * Generate child-friendly alt text
   */
  async generateAltText(image: UnsplashImage, maxWords: number = 10): Promise<string> {
    const description = await this.generateDescription(image, {
      style: 'simple',
      maxWords,
    });

    // Use medium description, but limit words
    const words = description.medium.split(' ');
    if (words.length <= maxWords) {
      return description.medium;
    }

    return words.slice(0, maxWords).join(' ') + '...';
  }

  /**
   * Generate sensory description (for autism-friendly experience)
   */
  async generateSensoryDescription(image: UnsplashImage): Promise<string> {
    const description = await this.generateDescription(image, {
      style: 'sensory',
      includeColors: true,
      includeActions: true,
    });

    return description.detailed;
  }

  /**
   * Clear cache
   */
  clearCache(): void {
    this.cache.clear();
  }

  /**
   * Get cache size
   */
  getCacheSize(): number {
    return this.cache.size;
  }
}

// Export singleton instance
export const imageDescriptionService = new ImageDescriptionService();

/**
 * Convenience function to generate description
 */
export async function generateImageDescription(
  image: UnsplashImage,
  options?: DescriptionOptions
): Promise<ImageDescription> {
  return imageDescriptionService.generateDescription(image, options);
}

/**
 * Convenience function to generate alt text
 */
export async function generateAltText(
  image: UnsplashImage,
  maxWords?: number
): Promise<string> {
  return imageDescriptionService.generateAltText(image, maxWords);
}

/**
 * Convenience function to generate sensory description
 */
export async function generateSensoryDescription(image: UnsplashImage): Promise<string> {
  return imageDescriptionService.generateSensoryDescription(image);
}

export default imageDescriptionService;
