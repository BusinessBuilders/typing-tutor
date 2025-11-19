/**
 * Therapeutic Content Generator - OPTIMIZED FOR LOW API COSTS
 * Generates content in batches to minimize API calls
 * Caches content and tracks usage
 */

import { AIServiceFactory, AIProviderType } from './AIServiceFactory';

export type ContentType = 'letters' | 'words' | 'sentences' | 'stories';

interface ContentCache {
  words: string[];
  sentences: string[];
  stories: string[];
}

interface UsedContent {
  type: ContentType;
  content: string;
  usedAt: Date;
}

const STORAGE_KEY_USED = 'therapeutic_used_content';
const STORAGE_KEY_CACHE = 'therapeutic_content_cache';
const BATCH_SIZE = 15; // Generate 15 items at once
const MIN_CACHE_SIZE = 3; // Refill when cache drops below this

/**
 * Therapeutic Content Generator - Batch Optimized
 */
export class TherapeuticContentGenerator {
  private aiProvider: AIProviderType;
  private initialized: boolean = false;
  private usedContent: Set<string> = new Set();
  private cache: ContentCache = { words: [], sentences: [], stories: [] };

  constructor(aiProvider: AIProviderType = 'openai') {
    this.aiProvider = aiProvider;
    this.loadHistory();
    this.loadCache();
  }

  async initialize(): Promise<boolean> {
    try {
      const provider = AIServiceFactory.initializeFromEnv(this.aiProvider);
      if (provider) {
        this.initialized = true;
        return true;
      }
      return false;
    } catch (error) {
      console.error('Failed to initialize TherapeuticContentGenerator:', error);
      return false;
    }
  }

  private loadHistory(): void {
    try {
      const stored = localStorage.getItem(STORAGE_KEY_USED);
      if (stored) {
        const history: UsedContent[] = JSON.parse(stored);
        history.forEach(item => this.usedContent.add(item.content.toLowerCase()));
      }
    } catch (error) {
      console.error('Failed to load content history:', error);
    }
  }

  private loadCache(): void {
    try {
      const stored = localStorage.getItem(STORAGE_KEY_CACHE);
      if (stored) {
        this.cache = JSON.parse(stored);

        // IMPORTANT: Mark all cached items as used to prevent repeats
        this.cache.words.forEach(w => this.usedContent.add(w.toLowerCase()));
        this.cache.sentences.forEach(s => this.usedContent.add(s.toLowerCase()));
        this.cache.stories.forEach(s => this.usedContent.add(s.toLowerCase()));
      }
    } catch (error) {
      console.error('Failed to load content cache:', error);
    }
  }

  private saveCache(): void {
    try {
      localStorage.setItem(STORAGE_KEY_CACHE, JSON.stringify(this.cache));
    } catch (error) {
      console.error('Failed to save cache:', error);
    }
  }

  private saveToHistory(type: ContentType, content: string): void {
    try {
      const stored = localStorage.getItem(STORAGE_KEY_USED);
      const history: UsedContent[] = stored ? JSON.parse(stored) : [];

      history.unshift({ type, content, usedAt: new Date() });
      localStorage.setItem(STORAGE_KEY_USED, JSON.stringify(history.slice(0, 200)));

      this.usedContent.add(content.toLowerCase());
    } catch (error) {
      console.error('Failed to save to history:', error);
    }
  }

  /**
   * Generate batch of therapeutic words - ONE API call for 15 words
   */
  private async generateWordBatch(): Promise<string[]> {
    if (!this.initialized) await this.initialize();

    const aiService = AIServiceFactory.getProvider(this.aiProvider);
    const forbiddenList = Array.from(this.usedContent).slice(0, 30).join(', ');

    const prompt = `Generate ${BATCH_SIZE} therapeutic words for autism typing practice.

THERAPEUTIC CATEGORIES:
- Emotions: happy, calm, safe, proud, loved, brave, gentle
- Sensory: soft, warm, bright, quiet, smooth, cozy, fuzzy
- Social: friend, help, share, kind, together, care
- Nature: tree, bird, flower, sky, water, leaf, cloud
- Comfort: home, rest, peace, hug, smile

REQUIREMENTS:
- 3-6 letters each
- Positive emotion or sensory words
- Help build brain connections
- Easy to visualize

${forbiddenList ? `AVOID: ${forbiddenList}` : ''}

Return ${BATCH_SIZE} words as a comma-separated list. Just the words, nothing else.`;

    try {
      const response = await aiService.generateSentence({
        type: 'sentence-generation',
        level: 'words',
        topic: 'therapeutic vocabulary batch',
        context: prompt,
        userAge: 8,
      });

      const words = response.content
        .toLowerCase()
        .split(/[,\s\n]+/)
        .map(w => w.replace(/[^a-z]/g, ''))
        .filter(w => w.length >= 3 && w.length <= 8 && !this.usedContent.has(w));

      return words.slice(0, BATCH_SIZE);
    } catch (error) {
      console.error('Batch word generation error:', error);
      return this.getFallbackWords();
    }
  }

  /**
   * Generate batch of therapeutic sentences - ONE API call for 15 sentences
   */
  private async generateSentenceBatch(): Promise<string[]> {
    if (!this.initialized) await this.initialize();

    const aiService = AIServiceFactory.getProvider(this.aiProvider);

    const prompt = `Generate ${BATCH_SIZE} therapeutic sentences for autism typing practice.

THERAPEUTIC GOALS - Help with:
- Emotional regulation: "i feel calm and safe"
- Self-confidence: "i can do hard things"
- Social connection: "my friends like me"
- Sensory awareness: "soft blankets feel nice"

SENTENCE TYPES:
- Affirmations: "i am brave and strong"
- Sensory: "warm sunshine feels good on my skin"
- Social: "my family loves me very much"
- Nature: "birds sing in the morning"
- Safety: "deep breaths help me feel calm"

REQUIREMENTS:
- 5-10 words each
- lowercase, no punctuation
- concrete, literal language
- positive or calming tone
- variety in topics and structure

Return ${BATCH_SIZE} different sentences, one per line. Just the sentences.`;

    try {
      const response = await aiService.generateSentence({
        type: 'sentence-generation',
        level: 'sentences',
        topic: 'therapeutic sentences batch',
        context: prompt,
        userAge: 8,
      });

      const sentences = response.content
        .toLowerCase()
        .split('\n')
        .map(s => s.replace(/[.,!?;:'"]/g, '').trim())
        .filter(s => {
          const words = s.split(' ').length;
          return words >= 4 && words <= 12 && !this.usedContent.has(s);
        });

      return sentences.slice(0, BATCH_SIZE);
    } catch (error) {
      console.error('Batch sentence generation error:', error);
      return this.getFallbackSentences();
    }
  }

  /**
   * Generate batch of mini stories - ONE API call for 10 stories
   */
  private async generateStoryBatch(): Promise<string[]> {
    if (!this.initialized) await this.initialize();

    const aiService = AIServiceFactory.getProvider(this.aiProvider);

    const prompt = `Generate 10 short therapeutic stories (2-3 sentences each) for autism typing.

STORY THEMES:
- Small successes and achievements
- Acts of kindness
- Sensory comfort
- Nature observations
- Daily routines

EXAMPLE:
"the cat found a sunny spot by the window. it curled up and purred softly. the warm sun felt perfect for a nap."

REQUIREMENTS:
- 2-3 sentences per story
- 15-30 words total per story
- lowercase, no punctuation
- concrete descriptions
- peaceful/positive tone

Return 10 stories separated by blank lines. Just the stories.`;

    try {
      const response = await aiService.generateSentence({
        type: 'sentence-generation',
        level: 'sentences',
        topic: 'therapeutic stories batch',
        context: prompt,
        userAge: 8,
      });

      const stories = response.content
        .toLowerCase()
        .split(/\n\n+/)
        .map(s => s.replace(/[.,!?;:'"]/g, '').replace(/\s+/g, ' ').trim())
        .filter(s => {
          const words = s.split(' ').length;
          return words >= 12 && words <= 40 && !this.usedContent.has(s);
        });

      return stories.slice(0, 10);
    } catch (error) {
      console.error('Batch story generation error:', error);
      return this.getFallbackStories();
    }
  }

  /**
   * Get a word - uses cache, generates batch when needed
   */
  async generateWord(): Promise<string> {
    if (this.cache.words.length < MIN_CACHE_SIZE) {
      const newWords = await this.generateWordBatch();
      const unused = newWords.filter(w => !this.usedContent.has(w.toLowerCase()));
      this.cache.words.push(...unused);
      this.saveCache();
    }

    // Get from cache, skip if already used
    let word = this.cache.words.shift();
    while (word && this.usedContent.has(word.toLowerCase()) && this.cache.words.length > 0) {
      word = this.cache.words.shift();
    }

    if (!word || this.usedContent.has(word.toLowerCase())) {
      const newWords = await this.generateWordBatch();
      const unused = newWords.filter(w => !this.usedContent.has(w.toLowerCase()));
      this.cache.words.push(...unused);
      word = this.cache.words.shift() || this.getFallbackWord();
    }

    this.saveCache();
    this.saveToHistory('words', word);
    return word;
  }

  /**
   * Get a sentence - uses cache, generates batch when needed
   */
  async generateSentence(): Promise<string> {
    if (this.cache.sentences.length < MIN_CACHE_SIZE) {
      const newSentences = await this.generateSentenceBatch();
      // Filter out any that might have been used (double-check)
      const unused = newSentences.filter(s => !this.usedContent.has(s.toLowerCase()));
      this.cache.sentences.push(...unused);
      this.saveCache();
    }

    // Get from cache, skip if already used
    let sentence = this.cache.sentences.shift();
    while (sentence && this.usedContent.has(sentence.toLowerCase()) && this.cache.sentences.length > 0) {
      sentence = this.cache.sentences.shift(); // Skip used ones
    }

    // If we ran out or all were used, generate new batch
    if (!sentence || this.usedContent.has(sentence.toLowerCase())) {
      const newSentences = await this.generateSentenceBatch();
      const unused = newSentences.filter(s => !this.usedContent.has(s.toLowerCase()));
      this.cache.sentences.push(...unused);
      sentence = this.cache.sentences.shift() || this.getFallbackSentence();
    }

    this.saveCache();
    this.saveToHistory('sentences', sentence);
    return sentence;
  }

  /**
   * Get a story - uses cache, generates batch when needed
   */
  async generateStory(): Promise<string> {
    if (this.cache.stories.length < MIN_CACHE_SIZE) {
      const newStories = await this.generateStoryBatch();
      this.cache.stories.push(...newStories);
      this.saveCache();
    }

    const story = this.cache.stories.shift() || this.getFallbackStory();
    this.saveCache();
    this.saveToHistory('stories', story);
    return story;
  }

  getRandomLetter(): string {
    const letters = 'abcdefghijklmnopqrstuvwxyz';
    return letters[Math.floor(Math.random() * letters.length)];
  }

  clearHistory(): void {
    localStorage.removeItem(STORAGE_KEY_USED);
    localStorage.removeItem(STORAGE_KEY_CACHE);
    this.usedContent.clear();
    this.cache = { words: [], sentences: [], stories: [] };
  }

  // Fallback content pools
  private getFallbackWord(): string {
    const words = ['calm', 'safe', 'soft', 'warm', 'happy', 'kind', 'gentle', 'peace', 'smile', 'hug'];
    return words[Math.floor(Math.random() * words.length)];
  }

  private getFallbackWords(): string[] {
    return ['calm', 'safe', 'soft', 'warm', 'happy', 'kind', 'gentle', 'peace', 'smile', 'hug', 'cozy', 'bright', 'quiet', 'rest', 'care'];
  }

  private getFallbackSentence(): string {
    const sentences = [
      'i feel calm and safe',
      'i can do hard things',
      'my friends care about me',
      'deep breaths help me relax',
      'i am brave and strong',
    ];
    return sentences[Math.floor(Math.random() * sentences.length)];
  }

  private getFallbackSentences(): string[] {
    return [
      'i feel calm and safe',
      'i can do hard things',
      'my friends care about me',
      'deep breaths help me relax',
      'i am brave and strong',
      'soft things feel nice',
      'asking for help is good',
      'everyone makes mistakes',
      'nature is beautiful',
      'listening helps me learn',
    ];
  }

  private getFallbackStory(): string {
    return 'the cat found a sunny spot. it curled up and purred. the warm sun felt perfect';
  }

  private getFallbackStories(): string[] {
    return [
      'the cat found a sunny spot. it curled up and purred. the warm sun felt perfect',
      'birds built a nest in the tree. they gathered soft twigs. the nest felt safe and cozy',
      'kai felt nervous about the noise. he put on headphones. the quiet music helped him calm down',
    ];
  }
}

export default TherapeuticContentGenerator;
