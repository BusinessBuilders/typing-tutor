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
      console.log('🔧 Initializing TherapeuticContentGenerator with provider:', this.aiProvider);
      const provider = AIServiceFactory.initializeFromEnv(this.aiProvider);
      if (provider) {
        this.initialized = true;
        console.log('✅ TherapeuticContentGenerator initialized successfully');
        return true;
      }
      console.warn('❌ Failed to initialize AI provider - no API key found');
      return false;
    } catch (error) {
      console.error('❌ Failed to initialize TherapeuticContentGenerator:', error);
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
        // NOTE: We DON'T mark cached items as used here
        // They'll be marked as used when actually dispensed
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

    const prompt = `You are generating single words for a child's typing practice game. Each word must be therapeutic and calming.

YOUR TASK: Create ${BATCH_SIZE} DIFFERENT therapeutic words. Each word must be unique and NOT repeat.

WORD CATEGORIES TO USE:
- Emotions: happy, calm, safe, proud, loved, brave, gentle, peaceful
- Sensory: soft, warm, bright, quiet, smooth, cozy, fuzzy, light
- Social: friend, help, share, kind, together, care, trust, hug
- Nature: tree, bird, flower, sky, water, leaf, cloud, sun
- Comfort: home, rest, peace, smile, dream, hope, joy

STRICT RULES:
✅ Each word must be 3-6 letters long
✅ Only positive, calming words
✅ Simple, common words a child knows
✅ One word per item in your list
❌ NO instructional text
❌ NO explanations
❌ NO numbering or bullets
${forbiddenList ? `❌ NEVER use these words (already used): ${forbiddenList}` : ''}

FORMAT: Return EXACTLY ${BATCH_SIZE} words separated by commas, like this:
happy, calm, warm, soft, bird

Now generate ${BATCH_SIZE} words:`;

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

    // Build forbidden phrases from used content
    const forbiddenPhrases = new Set<string>();
    Array.from(this.usedContent).slice(0, 20).forEach(sentence => {
      if (sentence.includes(' ')) {
        const words = sentence.split(' ');
        for (let i = 0; i < words.length - 1; i++) {
          forbiddenPhrases.add(`${words[i]} ${words[i+1]}`);
        }
      }
    });
    const forbiddenList = Array.from(forbiddenPhrases).slice(0, 15).join(', ');

    const prompt = `You are creating therapeutic sentences for a child with autism to practice typing. These sentences should be calming, positive, and helpful.

YOUR TASK: Write ${BATCH_SIZE} COMPLETELY DIFFERENT therapeutic sentences.

SENTENCE THEMES (mix these up):
1. Emotional regulation: "i feel calm when i breathe slowly"
2. Self-confidence: "i can learn new things every day"
3. Social connection: "my friends enjoy spending time with me"
4. Sensory comfort: "soft blankets help me feel cozy"
5. Nature appreciation: "birds chirp sweetly in the morning"
6. Safety and peace: "taking deep breaths helps me relax"

STRICT FORMATTING RULES:
✅ Each sentence must be 5-10 words long
✅ All lowercase letters only
✅ NO punctuation at all (no periods, commas, quotes, etc)
✅ Simple, concrete, literal language
✅ Positive or calming tone
✅ Each sentence must be COMPLETELY UNIQUE
❌ NO instructional text or labels
❌ NO numbering or bullets
❌ NO quotation marks around sentences
${forbiddenList ? `❌ NEVER use these phrases (already used): ${forbiddenList}` : ''}

EXAMPLE FORMAT (write ${BATCH_SIZE} sentences like these):
i feel happy when the sun is shining
my family cares about me very much
soft music helps me feel peaceful

Now write ${BATCH_SIZE} therapeutic sentences (one per line, no numbers, no punctuation):`;

    try {
      console.log('🤖 Calling AI to generate', BATCH_SIZE, 'therapeutic sentences...');
      const response = await aiService.generateSentence({
        type: 'sentence-generation',
        level: 'sentences',
        topic: 'therapeutic sentences batch',
        context: prompt,
        userAge: 8,
      });

      console.log('📝 AI Response received (full):', response.content);

      const sentences = response.content
        .toLowerCase()
        .split('\n')
        .map(s => s.replace(/[.,!?;:'"]/g, '').replace(/^\d+[\.\)]\s*/, '').trim())
        .filter(s => {
          const words = s.split(' ').length;
          const isValid = words >= 4 && words <= 12 && !this.usedContent.has(s) && s.length > 0;
          if (!isValid) {
            console.log('⚠️ Filtered out:', s, `(words: ${words}, used: ${this.usedContent.has(s)})`);
          }
          return isValid;
        });

      console.log('✅ Generated', sentences.length, 'valid sentences from AI out of', response.content.split('\n').length, 'total lines');
      return sentences.slice(0, BATCH_SIZE);
    } catch (error) {
      console.error('❌ Batch sentence generation error:', error);
      console.log('⚠️ Falling back to hardcoded sentences');
      return this.getFallbackSentences();
    }
  }

  /**
   * Generate batch of mini stories - ONE API call for 10 stories
   */
  private async generateStoryBatch(): Promise<string[]> {
    if (!this.initialized) await this.initialize();

    const aiService = AIServiceFactory.getProvider(this.aiProvider);

    // Build forbidden phrases from used stories
    const forbiddenPhrases = new Set<string>();
    Array.from(this.usedContent).slice(0, 10).forEach(story => {
      if (story.includes(' ')) {
        const words = story.split(' ');
        for (let i = 0; i < words.length - 2; i++) {
          forbiddenPhrases.add(`${words[i]} ${words[i+1]} ${words[i+2]}`);
        }
      }
    });
    const forbiddenList = Array.from(forbiddenPhrases).slice(0, 10).join(', ');

    const prompt = `You are writing short, calming stories for a child with autism to practice typing. Each story should be peaceful and positive.

YOUR TASK: Write 10 COMPLETELY DIFFERENT mini-stories.

STORY THEMES (use different ones):
1. Small successes: a child learns to tie their shoes
2. Acts of kindness: helping a friend feel better
3. Sensory comfort: enjoying a cozy blanket
4. Nature observations: watching butterflies in the garden
5. Daily routines: making breakfast together
6. Animal moments: a puppy playing with a toy
7. Peaceful scenes: rain falling gently on leaves

STRICT RULES:
✅ Each story is 2-3 sentences (15-30 words total)
✅ All lowercase letters only
✅ NO punctuation (no periods, commas, quotes, etc)
✅ Concrete, sensory descriptions
✅ Peaceful, positive tone
✅ Each story must be COMPLETELY UNIQUE
❌ NO instructional text
❌ NO numbering or labels
❌ NO quotation marks
${forbiddenList ? `❌ NEVER use these phrases (already used): ${forbiddenList}` : ''}

EXAMPLE FORMAT (write 10 stories like this, separated by blank lines):

the puppy found his favorite ball under the couch. he wagged his tail with joy. playing fetch made him very happy

the rain fell softly on the garden. flowers opened up to drink the water. everything smelled fresh and clean

Now write 10 different mini-stories (separated by blank lines):`;

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
          return words >= 12 && words <= 40 && !this.usedContent.has(s) && s.length > 0;
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
      // Filter out any that might have been used (double-check)
      const unused = newStories.filter(s => !this.usedContent.has(s.toLowerCase()));
      this.cache.stories.push(...unused);
      this.saveCache();
    }

    // Get from cache, skip if already used
    let story = this.cache.stories.shift();
    while (story && this.usedContent.has(story.toLowerCase()) && this.cache.stories.length > 0) {
      story = this.cache.stories.shift(); // Skip used ones
    }

    // If we ran out or all were used, generate new batch
    if (!story || this.usedContent.has(story.toLowerCase())) {
      const newStories = await this.generateStoryBatch();
      const unused = newStories.filter(s => !this.usedContent.has(s.toLowerCase()));
      this.cache.stories.push(...unused);
      story = this.cache.stories.shift() || this.getFallbackStory();
    }

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
