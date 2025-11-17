/**
 * AI Prompt Templates
 * Centralized, autism-friendly prompt templates for content generation
 */

import { ContentGenerationRequest, EncouragementRequest, TypingEvaluationRequest } from './types';

/**
 * System prompts for different AI contexts
 */
export const SYSTEM_PROMPTS = {
  wordGeneration: `You are a helpful assistant for a typing tutor designed specifically for children with autism. Your role is to generate age-appropriate, simple words for typing practice.

Key guidelines:
- Use concrete, literal language
- Avoid abstract concepts or idioms
- Choose words with clear, visual meanings
- Be encouraging and positive
- Consider sensory-friendly vocabulary
- Avoid words that might trigger anxiety or overwhelm`,

  sentenceGeneration: `You are a helpful assistant for a typing tutor designed for children with autism. Generate simple, clear sentences for typing practice.

Autism-friendly language principles:
- Direct and literal (no idioms or figurative speech)
- Predictable sentence structure
- Clear subject-verb-object patterns
- Concrete, sensory details
- Positive or neutral tone
- Avoid complex emotions or social ambiguity`,

  sceneGeneration: `You are a creative assistant for a typing tutor designed for children with autism. Generate vivid but clear scene descriptions.

Scene description guidelines:
- Use concrete, sensory details (what you can see, hear, touch)
- Avoid metaphors or abstract concepts
- Create predictable, structured narratives
- Focus on observable actions and objects
- Use calm, measured pacing
- Make it engaging but not overwhelming`,

  encouragement: `You are an encouraging assistant for a typing tutor for children with autism. Provide specific, genuine praise.

Encouragement principles:
- Be specific about what they did well
- Avoid patronizing or exaggerated language
- Use direct, sincere praise
- Focus on effort and progress, not just outcomes
- Keep it simple and genuine
- Avoid overly emotional language`,

  evaluation: `You are a supportive tutor for children with autism. Provide constructive, positive feedback.

Feedback principles:
- Lead with specific strengths
- Frame suggestions positively
- Avoid negative language or criticism
- Be concrete and actionable
- Maintain encouraging tone throughout
- Respect individual learning pace`,
};

/**
 * Word generation prompt builder
 */
export function buildWordPrompt(request: ContentGenerationRequest): string {
  const { difficulty = 'easy', topic, previousWords = [], userAge = 8 } = request;

  const difficultySpecs = {
    easy: {
      length: '3-5 letters',
      complexity: 'common everyday words like "cat", "sun", "tree"',
      examples: 'ball, dog, car, book, star',
    },
    medium: {
      length: '5-8 letters',
      complexity: 'slightly more complex but familiar words',
      examples: 'garden, window, bicycle, rainbow, kitchen',
    },
    hard: {
      length: '8+ letters',
      complexity: 'challenging but age-appropriate words',
      examples: 'butterfly, adventure, incredible, magnificent',
    },
  };

  const spec = difficultySpecs[difficulty];

  let prompt = `Generate a single word for a ${userAge}-year-old child to practice typing.

Requirements:
- Length: ${spec.length}
- Complexity: ${spec.complexity}
- Examples of similar words: ${spec.examples}
- The word should be concrete and visual (can be easily pictured)
- Use simple, clear vocabulary`;

  if (topic) {
    prompt += `\n- Related to topic: ${topic}`;
  }

  if (previousWords.length > 0) {
    prompt += `\n- Avoid these recently used words: ${previousWords.slice(-10).join(', ')}`;
  }

  prompt += `\n\nRespond with ONLY the word itself, nothing else. No punctuation, quotes, or explanations.`;

  return prompt;
}

/**
 * Sentence generation prompt builder
 */
export function buildSentencePrompt(request: ContentGenerationRequest): string {
  const { difficulty = 'easy', topic, userAge = 8, context } = request;

  const difficultySpecs = {
    easy: {
      structure: 'Simple 4-6 word sentences with basic subject-verb-object',
      examples: 'The dog runs fast. I like to read. The sun is bright.',
    },
    medium: {
      structure: 'Medium 6-10 word sentences with one descriptor or conjunction',
      examples: 'The big brown dog runs in the park. I like to read books at night.',
    },
    hard: {
      structure: 'Longer 10-15 word sentences with multiple clauses but still clear',
      examples:
        'The big brown dog runs quickly through the green park while children play.',
    },
  };

  const spec = difficultySpecs[difficulty];

  let prompt = `Generate a sentence for a ${userAge}-year-old autistic child to practice typing.

Requirements:
- Structure: ${spec.structure}
- Examples: ${spec.examples}
- Use clear, literal language (no idioms or figures of speech)
- Use concrete, observable descriptions
- Positive or neutral tone
- Predictable structure`;

  if (topic) {
    prompt += `\n- Topic: ${topic}`;
  }

  if (context) {
    prompt += `\n- Context: ${context}`;
  }

  prompt += `\n\nRespond with ONLY the sentence. No quotes, explanations, or preamble.`;

  return prompt;
}

/**
 * Scene generation prompt builder
 */
export function buildScenePrompt(request: ContentGenerationRequest): string {
  const { topic, context, userAge = 8, difficulty = 'medium' } = request;

  const lengthSpecs = {
    easy: '1-2 simple sentences',
    medium: '2-3 detailed sentences',
    hard: '3-4 richly detailed sentences',
  };

  let prompt = `Generate a scene description for a ${userAge}-year-old autistic child to type as part of a story.

Requirements:
- Length: ${lengthSpecs[difficulty]}
- Use concrete, sensory details (visual, auditory, tactile)
- Describe observable actions and objects
- Create a calm, predictable atmosphere
- Avoid abstract concepts or complex emotions
- Use clear, sequential descriptions`;

  if (topic) {
    prompt += `\n- Scene involves: ${topic}`;
  }

  if (context) {
    prompt += `\n- Story context: ${context}`;
  }

  prompt += `\n\nProvide vivid but clear imagery. Make it engaging but not overwhelming. Respond with ONLY the scene description.`;

  return prompt;
}

/**
 * Encouragement message prompt builder
 */
export function buildEncouragementPrompt(request: EncouragementRequest): string {
  const { accuracy, wordsCompleted, mistakeCount, context } = request;

  let prompt = `Generate a short (1 sentence) encouraging message for a child who just completed typing practice.

Performance:
- Accuracy: ${accuracy}%
- Words completed: ${wordsCompleted}
- Mistakes: ${mistakeCount}`;

  if (context) {
    prompt += `\n- Context: ${context}`;
  }

  // Tailor encouragement based on performance
  if (accuracy >= 95 && mistakeCount <= 2) {
    prompt += `\n\nThis is excellent performance! Celebrate their accuracy and precision.`;
  } else if (accuracy >= 80) {
    prompt += `\n\nThis is good progress! Encourage their effort and highlight improvement.`;
  } else {
    prompt += `\n\nThey're working hard! Focus on effort, persistence, and specific things they did well.`;
  }

  prompt += `\n\nBe specific, genuine, and direct. Avoid exaggerated language.`;

  return prompt;
}

/**
 * Typing evaluation prompt builder
 */
export function buildEvaluationPrompt(request: TypingEvaluationRequest): string {
  const { expectedText, typedText, timeSpent, mistakes } = request;

  const accuracy = expectedText.length > 0
    ? ((expectedText.length - mistakes.length) / expectedText.length) * 100
    : 0;

  let prompt = `Evaluate this typing practice for a child with autism:

Expected text: "${expectedText}"
Typed text: "${typedText}"
Time: ${timeSpent} seconds
Accuracy: ${accuracy.toFixed(1)}%
Number of mistakes: ${mistakes.length}

Provide feedback in exactly this format:
1. [One specific thing they did well]
2. [One gentle, positive suggestion for next time]
3. [One encouraging message]

Guidelines:
- Be specific and concrete
- Lead with strengths
- Frame suggestions positively
- Keep each point to one simple sentence
- Maintain warm, supportive tone`;

  return prompt;
}

/**
 * Image keyword extraction prompt
 */
export function buildKeywordExtractionPrompt(content: string): string {
  return `Extract 2-3 concrete nouns from this text that would make good image search keywords:

"${content}"

Choose words that:
- Are concrete objects (not abstract concepts)
- Can be easily visualized
- Would return clear, appropriate images
- Are suitable for children

Respond with ONLY the keywords separated by commas. No other text.`;
}

/**
 * Achievement message prompt builder
 */
export function buildAchievementPrompt(achievementType: string, context: string): string {
  return `Generate a celebratory message for this achievement in a typing tutor for children with autism:

Achievement: ${achievementType}
Context: ${context}

Requirements:
- One short sentence (maximum 15 words)
- Specific to the achievement
- Genuine and warm (not overly enthusiastic)
- Direct and clear language
- Celebratory but calm tone

Respond with ONLY the message.`;
}

/**
 * Difficulty assessment prompt
 */
export function buildDifficultyAssessmentPrompt(content: string): string {
  return `Assess the typing difficulty of this text for children:

"${content}"

Consider:
- Word length and complexity
- Sentence structure
- Vocabulary level
- Overall readability for children aged 6-12

Respond with ONLY one word: easy, medium, or hard.`;
}

/**
 * Content filter prompt
 */
export function buildContentFilterPrompt(content: string): string {
  return `Evaluate if this content is appropriate for children with autism in a typing tutor:

"${content}"

Check for:
- Age-appropriate vocabulary
- No violent or scary content
- No complex social situations
- No anxiety-inducing themes
- Clear, literal language
- Concrete concepts

Respond with either:
- APPROVED (if content is appropriate)
- REJECTED: [brief reason] (if content is inappropriate)`;
}

/**
 * Topic suggestion prompt
 */
export function buildTopicSuggestionPrompt(userAge: number, interests?: string[]): string {
  let prompt = `Suggest 5 engaging topics for typing practice for a ${userAge}-year-old autistic child.

Topics should be:
- Concrete and visual
- Positive and calm
- Special interests friendly
- Sensory-appropriate
- Not overwhelming`;

  if (interests && interests.length > 0) {
    prompt += `\n\nThe child is interested in: ${interests.join(', ')}`;
  }

  prompt += `\n\nProvide topics as a simple comma-separated list.`;

  return prompt;
}

export default {
  SYSTEM_PROMPTS,
  buildWordPrompt,
  buildSentencePrompt,
  buildScenePrompt,
  buildEncouragementPrompt,
  buildEvaluationPrompt,
  buildKeywordExtractionPrompt,
  buildAchievementPrompt,
  buildDifficultyAssessmentPrompt,
  buildContentFilterPrompt,
  buildTopicSuggestionPrompt,
};
