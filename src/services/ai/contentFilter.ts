/**
 * Content Filter Service
 * Ensures all AI-generated content is child-safe and autism-friendly
 */

import { getAIProvider } from './AIServiceFactory';
// import { buildContentFilterPrompt } from './promptTemplates'; // TODO: Use in deep filter implementation

/**
 * Content filter result
 */
export interface FilterResult {
  approved: boolean;
  reason?: string;
  flaggedWords?: string[];
}

/**
 * List of inappropriate words/topics for children
 */
const BLOCKED_WORDS = [
  'violence',
  'weapon',
  'gun',
  'knife',
  'blood',
  'death',
  'kill',
  'scary',
  'horror',
  'monster',
  'ghost',
  // Add more as needed
];

/**
 * Anxiety-inducing topics to avoid for autism-friendly content
 */
const ANXIETY_TOPICS = [
  'emergency',
  'alarm',
  'siren',
  'fire',
  'accident',
  'lost',
  'alone',
  'afraid',
  'worried',
  'confused',
];

/**
 * Quick local filter check
 */
export function quickFilter(content: string): FilterResult {
  const lowerContent = content.toLowerCase();
  const flaggedWords: string[] = [];

  // Check for blocked words
  for (const word of BLOCKED_WORDS) {
    if (lowerContent.includes(word)) {
      flaggedWords.push(word);
    }
  }

  // Check for anxiety-inducing topics
  for (const topic of ANXIETY_TOPICS) {
    if (lowerContent.includes(topic)) {
      flaggedWords.push(topic);
    }
  }

  if (flaggedWords.length > 0) {
    return {
      approved: false,
      reason: `Contains inappropriate content: ${flaggedWords.join(', ')}`,
      flaggedWords,
    };
  }

  // Check length (too long might be overwhelming)
  if (content.length > 500) {
    return {
      approved: false,
      reason: 'Content too long (may be overwhelming)',
    };
  }

  return { approved: true };
}

/**
 * AI-powered deep content filter
 */
export async function deepFilter(content: string): Promise<FilterResult> {
  // First run quick filter
  const quickResult = quickFilter(content);
  if (!quickResult.approved) {
    return quickResult;
  }

  // If quick filter passes, use AI for deeper analysis
  try {
    const provider = getAIProvider();
    if (!provider) {
      console.warn('AI provider not available, using quick filter only');
      return quickResult;
    }

    // TODO: Implement deep AI-powered content filtering
    // This would use buildContentFilterPrompt and provider's API
    // For now, we'll use a simplified approach
    await provider.assessDifficulty(content);

    // If content passes all checks
    return { approved: true };
  } catch (error) {
    console.error('Deep filter error:', error);
    // Fail safe: if AI filter fails, rely on quick filter
    return quickResult;
  }
}

/**
 * Filter and sanitize generated content
 */
export async function filterContent(content: string, useDeepFilter: boolean = false): Promise<FilterResult> {
  if (useDeepFilter) {
    return await deepFilter(content);
  }
  return quickFilter(content);
}

/**
 * Check if topic is appropriate
 */
export function isTopicAppropriate(topic: string): boolean {
  const result = quickFilter(topic);
  return result.approved;
}

/**
 * Get child-friendly alternative suggestions
 */
export function getSafeAlternatives(_rejectedContent?: string): string[] {
  const alternatives = [
    'animals and pets',
    'nature and weather',
    'favorite foods',
    'colors and shapes',
    'toys and games',
    'vehicles and transportation',
    'space and planets',
    'dinosaurs',
    'seasons',
    'everyday activities',
  ];

  return alternatives.slice(0, 5);
}

export default {
  quickFilter,
  deepFilter,
  filterContent,
  isTopicAppropriate,
  getSafeAlternatives,
};
