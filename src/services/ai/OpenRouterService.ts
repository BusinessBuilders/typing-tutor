/**
 * OpenRouter AI Service Implementation
 * Provides access to multiple AI models through OpenRouter API
 */

import { apiClient } from '../api/axiosConfig';
import {
  IAIProvider,
  AIConfig,
  AIProviderType,
  ContentGenerationRequest,
  ContentGenerationResponse,
  EncouragementRequest,
  EncouragementResponse,
  TypingEvaluationRequest,
  TypingEvaluationResponse,
  AIProviderError,
  InvalidAPIKeyError,
} from './types';
import { env } from '../../utils/env';

export class OpenRouterService implements IAIProvider {
  readonly provider: AIProviderType = 'openrouter';
  model: string;
  private apiKey: string = '';
  private temperature: number = 0.7;
  private maxTokens: number = 1000;
  private baseURL: string = 'https://openrouter.ai/api/v1';

  constructor() {
    this.model = 'anthropic/claude-3.5-sonnet';
  }

  initialize(config: AIConfig): void {
    this.apiKey = config.apiKey;
    this.model = config.model || this.model;
    this.temperature = config.temperature ?? this.temperature;
    this.maxTokens = config.maxTokens ?? this.maxTokens;

    // Set up axios default headers for OpenRouter
    if (this.apiKey) {
      apiClient.defaults.headers.common['Authorization'] = `Bearer ${this.apiKey}`;
      apiClient.defaults.headers.common['HTTP-Referer'] = 'https://autism-typing-tutor.app';
      apiClient.defaults.headers.common['X-Title'] = 'Autism Typing Tutor';
    }
  }

  isConfigured(): boolean {
    return !!this.apiKey && this.apiKey.length > 0;
  }

  async validateApiKey(): Promise<boolean> {
    if (!this.apiKey) return false;

    try {
      const response = await apiClient.get(`${this.baseURL}/auth/key`, {
        headers: {
          Authorization: `Bearer ${this.apiKey}`,
        },
      });

      return response.status === 200;
    } catch (error: any) {
      if (error.response?.status === 401) {
        throw new InvalidAPIKeyError(this.provider);
      }
      return false;
    }
  }

  private async makeRequest(prompt: string, systemPrompt?: string): Promise<string> {
    if (!this.isConfigured()) {
      throw new AIProviderError('OpenRouter not configured', this.provider);
    }

    try {
      const response = await apiClient.post(`${this.baseURL}/chat/completions`, {
        model: this.model,
        messages: [
          ...(systemPrompt ? [{ role: 'system', content: systemPrompt }] : []),
          { role: 'user', content: prompt },
        ],
        temperature: this.temperature,
        max_tokens: this.maxTokens,
      });

      const content = response.data.choices[0]?.message?.content;
      if (!content) {
        throw new AIProviderError('No content in response', this.provider);
      }

      return content.trim();
    } catch (error: any) {
      if (error.response?.status === 401) {
        throw new InvalidAPIKeyError(this.provider);
      }
      throw new AIProviderError(
        error.message || 'OpenRouter request failed',
        this.provider,
        error.code,
        error.response?.status
      );
    }
  }

  async generateWord(request: ContentGenerationRequest): Promise<ContentGenerationResponse> {
    const systemPrompt = `You are a helpful assistant for a typing tutor designed for children with autism. Generate age-appropriate, simple words for typing practice. Be encouraging and positive.`;

    const difficulty = request.difficulty || 'easy';
    const difficultyMap = {
      easy: '3-5 letters, common everyday words',
      medium: '5-8 letters, slightly more complex words',
      hard: '8+ letters, challenging but age-appropriate words',
    };

    let prompt = `Generate a single ${difficultyMap[difficulty]} word for a ${request.userAge || 8}-year-old child to practice typing.`;

    if (request.topic) {
      prompt += ` The word should be related to: ${request.topic}.`;
    }

    if (request.previousWords && request.previousWords.length > 0) {
      prompt += ` Avoid these recently used words: ${request.previousWords.join(', ')}.`;
    }

    prompt += ` Respond with ONLY the word, nothing else.`;

    const content = await this.makeRequest(prompt, systemPrompt);

    // Clean the response (remove quotes, extra whitespace, etc.)
    const word = content.replace(/['"]/g, '').trim().split(/\s+/)[0].toLowerCase();

    return {
      content: word,
      imageKeywords: [word],
      difficulty,
    };
  }

  async generateSentence(request: ContentGenerationRequest): Promise<ContentGenerationResponse> {
    const systemPrompt = `You are a helpful assistant for a typing tutor designed for children with autism. Generate simple, clear sentences for typing practice. Use autism-friendly language: direct, literal, and predictable. Be encouraging and positive.`;

    const difficulty = request.difficulty || 'easy';
    const difficultyMap = {
      easy: 'short (4-6 words), simple structure',
      medium: 'medium (6-10 words), with one conjunction or descriptor',
      hard: 'longer (10-15 words), with multiple clauses but still clear',
    };

    let prompt = `Generate a ${difficultyMap[difficulty]} sentence for a ${request.userAge || 8}-year-old autistic child to practice typing.`;

    if (request.topic) {
      prompt += ` The sentence should be about: ${request.topic}.`;
    }

    prompt += ` Use clear, literal language. Avoid idioms or figurative speech. Respond with ONLY the sentence, nothing else.`;

    const content = await this.makeRequest(prompt, systemPrompt);

    // Clean the response
    const sentence = content.replace(/['"]/g, '').trim();

    // Extract keywords for image search
    const keywords = await this.extractImageKeywords(sentence);

    return {
      content: sentence,
      imageKeywords: keywords,
      difficulty,
    };
  }

  async generateScene(request: ContentGenerationRequest): Promise<ContentGenerationResponse> {
    const systemPrompt = `You are a creative assistant for a typing tutor designed for children with autism. Generate vivid but clear scene descriptions for story-based typing practice. Use concrete, sensory details. Avoid metaphors or abstract concepts.`;

    let prompt = `Generate a detailed scene description (2-3 sentences) for a ${request.userAge || 8}-year-old autistic child to type.`;

    if (request.topic) {
      prompt += ` The scene should involve: ${request.topic}.`;
    }

    if (request.context) {
      prompt += ` Context: ${request.context}.`;
    }

    prompt += ` Use concrete, sensory language. Make it engaging but predictable. Respond with ONLY the scene description.`;

    const content = await this.makeRequest(prompt, systemPrompt);

    const scene = content.replace(/['"]/g, '').trim();
    const keywords = await this.extractImageKeywords(scene);

    return {
      content: scene,
      imageKeywords: keywords,
      difficulty: request.difficulty || 'medium',
    };
  }

  async generateEncouragement(request: EncouragementRequest): Promise<EncouragementResponse> {
    const systemPrompt = `You are an encouraging assistant for a typing tutor designed for children with autism. Provide specific, genuine praise. Avoid patronizing language. Be direct and sincere.`;

    let prompt = `Generate a short (1 sentence) encouraging message for a child who just completed typing practice. `;
    prompt += `Accuracy: ${request.accuracy}%, Words completed: ${request.wordsCompleted}, Mistakes: ${request.mistakeCount}. `;
    prompt += `Be specific about what they did well. Keep it simple and genuine.`;

    const message = await this.makeRequest(prompt, systemPrompt);

    // Determine tone based on performance
    let tone: 'celebratory' | 'encouraging' | 'supportive';
    if (request.accuracy >= 95 && request.mistakeCount <= 2) {
      tone = 'celebratory';
    } else if (request.accuracy >= 80) {
      tone = 'encouraging';
    } else {
      tone = 'supportive';
    }

    return {
      message: message.trim(),
      tone,
    };
  }

  async evaluateTyping(request: TypingEvaluationRequest): Promise<TypingEvaluationResponse> {
    const systemPrompt = `You are a supportive tutor for children with autism. Provide constructive, positive feedback on typing practice. Focus on specific strengths and gentle suggestions for improvement.`;

    const prompt = `Evaluate this typing practice:
Expected: "${request.expectedText}"
Typed: "${request.typedText}"
Time: ${request.timeSpent} seconds
Mistakes: ${request.mistakes.length}

Provide:
1. One specific thing they did well
2. One gentle suggestion for improvement
3. An encouraging message

Keep each point to one short sentence. Be warm and supportive.`;

    const response = await this.makeRequest(prompt, systemPrompt);

    // Parse the response (simplified - in production, you'd want more robust parsing)
    const lines = response.split('\n').filter((line) => line.trim());

    return {
      feedback: response,
      strengths: lines.slice(0, 1),
      areasToImprove: lines.slice(1, 2),
      encouragement: lines.slice(-1)[0] || 'Great effort! Keep practicing!',
    };
  }

  async extractImageKeywords(content: string): Promise<string[]> {
    const systemPrompt = `Extract 2-3 concrete nouns from the text that would make good image search keywords. Return ONLY the keywords separated by commas, nothing else.`;

    const response = await this.makeRequest(content, systemPrompt);

    // Parse keywords
    const keywords = response
      .split(',')
      .map((k) => k.trim().toLowerCase())
      .filter((k) => k.length > 0)
      .slice(0, 3);

    return keywords;
  }

  async generateAchievementMessage(achievementType: string, context: string): Promise<string> {
    const systemPrompt = `Generate a celebratory message for an achievement in a typing tutor for children with autism. Keep it brief, specific, and genuine.`;

    const prompt = `Generate a short (1 sentence) celebration message for: ${achievementType}. Context: ${context}`;

    return await this.makeRequest(prompt, systemPrompt);
  }

  async assessDifficulty(content: string): Promise<'easy' | 'medium' | 'hard'> {
    const systemPrompt = `Assess the typing difficulty of text for children. Consider word length, sentence complexity, and vocabulary. Respond with ONLY one word: easy, medium, or hard.`;

    const response = await this.makeRequest(content, systemPrompt);
    const difficulty = response.toLowerCase().trim();

    if (difficulty.includes('easy')) return 'easy';
    if (difficulty.includes('hard')) return 'hard';
    return 'medium';
  }
}

export default OpenRouterService;
