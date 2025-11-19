/**
 * Therapeutic Content Generator
 * Creates autism-friendly typing content designed to help with brain connections
 * Tracks usage to prevent repetition
 */

import { AIServiceFactory, AIProviderType } from './AIServiceFactory';

export type ContentType = 'letters' | 'words' | 'sentences' | 'stories';

interface UsedContent {
  type: ContentType;
  content: string;
  usedAt: Date;
}

const STORAGE_KEY = 'therapeutic_content_history';
const MAX_HISTORY = 200; // Track last 200 items

/**
 * Therapeutic Content Generator Service
 */
export class TherapeuticContentGenerator {
  private aiProvider: AIProviderType;
  private initialized: boolean = false;
  private usedContent: Set<string> = new Set();

  constructor(aiProvider: AIProviderType = 'openai') {
    this.aiProvider = aiProvider;
    this.loadHistory();
  }

  /**
   * Initialize the AI service
   */
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

  /**
   * Load history of used content from localStorage
   */
  private loadHistory(): void {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const history: UsedContent[] = JSON.parse(stored);
        history.forEach(item => {
          this.usedContent.add(item.content.toLowerCase());
        });
      }
    } catch (error) {
      console.error('Failed to load content history:', error);
    }
  }

  /**
   * Save used content to history
   */
  private saveToHistory(type: ContentType, content: string): void {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      const history: UsedContent[] = stored ? JSON.parse(stored) : [];

      history.unshift({
        type,
        content,
        usedAt: new Date(),
      });

      // Keep only recent items
      const trimmed = history.slice(0, MAX_HISTORY);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(trimmed));

      this.usedContent.add(content.toLowerCase());
    } catch (error) {
      console.error('Failed to save content history:', error);
    }
  }

  /**
   * Generate therapeutic word for typing practice
   * Uses sensory, emotional, and connection-building vocabulary
   */
  async generateWord(difficulty: 'easy' | 'medium' | 'hard' = 'easy'): Promise<string> {
    if (!this.initialized) {
      await this.initialize();
    }

    const aiService = AIServiceFactory.getProvider(this.aiProvider);

    const difficultySpecs = {
      easy: { length: '3-5 letters', examples: 'hug, soft, warm, smile, happy, gentle' },
      medium: { length: '5-8 letters', examples: 'comfort, peaceful, friendly, helpful, kindness' },
      hard: { length: '8+ letters', examples: 'wonderful, meaningful, connection, understanding' },
    };

    const spec = difficultySpecs[difficulty];
    const forbiddenList = Array.from(this.usedContent).slice(0, 50).join(', ');

    const prompt = `Generate ONE word for autism typing therapy that helps build positive brain connections.

Requirements:
- Length: ${spec.length}
- Examples: ${spec.examples}
- MUST be a word that triggers positive emotions or sensory experiences
- Focus on: emotions, sensory words, social connection, nature, comfort, safety
- Should be concrete and easy to visualize

${forbiddenList ? `FORBIDDEN (already used): ${forbiddenList}` : ''}

Therapeutic categories to choose from:
- Emotions: happy, calm, safe, proud, loved
- Sensory: soft, warm, bright, quiet, smooth
- Social: friend, help, share, together, kind
- Nature: tree, bird, flower, sky, water
- Comfort: home, cozy, rest, gentle, peace

Choose a word that helps the child connect positive feelings with typing.

Respond with ONLY the word. Nothing else.`;

    try {
      const response = await aiService.generateSentence({
        type: 'sentence-generation',
        level: 'words',
        topic: 'therapeutic vocabulary',
        context: prompt,
        userAge: 8,
      });

      const word = response.content.trim().toLowerCase().replace(/[^a-z]/g, '');

      if (word && word.length > 0 && !this.usedContent.has(word)) {
        this.saveToHistory('words', word);
        return word;
      }
    } catch (error) {
      console.error('Word generation error:', error);
    }

    // Fallback to therapeutic word pool
    return this.getFallbackWord(difficulty);
  }

  /**
   * Generate therapeutic sentence for typing practice
   * Focuses on helping autism brain make positive connections
   */
  async generateSentence(): Promise<string> {
    if (!this.initialized) {
      await this.initialize();
    }

    const aiService = AIServiceFactory.getProvider(this.aiProvider);
    const forbiddenSentences = Array.from(this.usedContent)
      .filter(c => c.includes(' '))
      .slice(0, 30)
      .join('; ');

    const prompt = `Generate ONE therapeutic typing sentence for a child with autism.

THERAPEUTIC GOALS - Sentences should help with:
1. Emotional regulation (calm, safe, happy feelings)
2. Social connection (friends, family, belonging)
3. Sensory awareness (concrete, observable experiences)
4. Self-confidence (positive self-talk, "I can" statements)
5. Brain pattern building (predictable, reassuring structures)

THERAPEUTIC SENTENCE TYPES:
- Affirmations: "i am brave and strong"
- Sensory: "soft blankets feel cozy and warm"
- Social connection: "my friends like to play with me"
- Nature observation: "birds sing happy songs in the morning"
- Safe spaces: "my room is my special calm place"
- Positive activities: "reading books helps me learn new things"

REQUIREMENTS:
- 5-10 words
- lowercase only
- no punctuation
- concrete, literal language (no metaphors)
- positive or neutral tone
- uses sensory or emotional vocabulary
- helps build positive brain connections

${forbiddenSentences ? `FORBIDDEN (already used):\n${forbiddenSentences}\n\nYour sentence must be COMPLETELY DIFFERENT!` : ''}

Respond with ONLY the sentence. Nothing else.`;

    try {
      const response = await aiService.generateSentence({
        type: 'sentence-generation',
        level: 'sentences',
        topic: 'therapeutic content',
        context: prompt,
        userAge: 8,
      });

      const sentence = response.content.trim().toLowerCase()
        .replace(/[.,!?;:'"]/g, '')
        .replace(/\s+/g, ' ')
        .trim();

      if (sentence && !this.usedContent.has(sentence)) {
        this.saveToHistory('sentences', sentence);
        return sentence;
      }
    } catch (error) {
      console.error('Sentence generation error:', error);
    }

    // Fallback
    return this.getFallbackSentence();
  }

  /**
   * Generate mini therapeutic story (2-3 connected sentences)
   */
  async generateStory(): Promise<string> {
    if (!this.initialized) {
      await this.initialize();
    }

    const aiService = AIServiceFactory.getProvider(this.aiProvider);
    const forbiddenStories = Array.from(this.usedContent)
      .filter(c => c.split(' ').length > 15)
      .slice(0, 20);

    const prompt = `Create a SHORT therapeutic story (2-3 sentences) for autism typing practice.

THERAPEUTIC STORY GOALS:
- Build positive emotional associations
- Practice cause-and-effect thinking
- Reinforce social-emotional concepts
- Use concrete, visual language
- Create calming, predictable narratives

STORY THEMES:
- Overcoming small challenges successfully
- Acts of kindness and friendship
- Sensory comfort and safety
- Natural world observations
- Daily routines that feel good

EXAMPLE STORIES:
"lily found a smooth stone at the beach. she kept it in her pocket all day. it felt calm and nice to touch."

"the cat stretched in the warm sunshine. it purred softly on the soft cushion. stretching felt good after a long nap."

REQUIREMENTS:
- 2-3 simple sentences
- lowercase only, no punctuation
- 15-25 words total
- concrete, literal descriptions
- positive or peaceful tone
- helps child understand emotions/social situations

${forbiddenStories.length > 0 ? `AVOID SIMILAR PATTERNS TO:\n${forbiddenStories.slice(0, 5).join('\n\n')}` : ''}

Write ONLY the story. No labels or explanation.`;

    try {
      const response = await aiService.generateSentence({
        type: 'sentence-generation',
        level: 'sentences',
        topic: 'therapeutic stories',
        context: prompt,
        userAge: 8,
      });

      const story = response.content.trim().toLowerCase()
        .replace(/[.,!?;:'"]/g, '')
        .replace(/\s+/g, ' ')
        .trim();

      if (story && !this.usedContent.has(story)) {
        this.saveToHistory('stories', story);
        return story;
      }
    } catch (error) {
      console.error('Story generation error:', error);
    }

    return this.getFallbackStory();
  }

  /**
   * Get random letter (always fresh since there are only 26)
   */
  getRandomLetter(): string {
    const letters = 'abcdefghijklmnopqrstuvwxyz';
    return letters[Math.floor(Math.random() * letters.length)];
  }

  /**
   * Clear usage history (for testing or reset)
   */
  clearHistory(): void {
    localStorage.removeItem(STORAGE_KEY);
    this.usedContent.clear();
  }

  // Fallback therapeutic content pools
  private getFallbackWord(difficulty: 'easy' | 'medium' | 'hard'): string {
    const pools = {
      easy: ['calm', 'safe', 'soft', 'warm', 'happy', 'smile', 'hug', 'nice', 'kind', 'gentle'],
      medium: ['peaceful', 'comfort', 'friendly', 'helpful', 'patient', 'careful', 'thankful'],
      hard: ['wonderful', 'confident', 'thoughtful', 'understanding', 'appreciated', 'connected'],
    };

    const pool = pools[difficulty];
    const unused = pool.filter(w => !this.usedContent.has(w));

    if (unused.length > 0) {
      const word = unused[Math.floor(Math.random() * unused.length)];
      this.saveToHistory('words', word);
      return word;
    }

    // All used, pick random and re-mark as used
    const word = pool[Math.floor(Math.random() * pool.length)];
    this.saveToHistory('words', word);
    return word;
  }

  private getFallbackSentence(): string {
    const sentences = [
      'i feel calm and safe right now',
      'my breath is slow and peaceful',
      'soft things help me feel better',
      'i can take breaks when i need them',
      'my friends care about me',
      'listening helps me learn new things',
      'nature is beautiful and interesting',
      'i am doing my best today',
      'asking for help is a good thing',
      'everyone makes mistakes and that is okay',
    ];

    const unused = sentences.filter(s => !this.usedContent.has(s));
    const sentence = unused.length > 0
      ? unused[Math.floor(Math.random() * unused.length)]
      : sentences[Math.floor(Math.random() * sentences.length)];

    this.saveToHistory('sentences', sentence);
    return sentence;
  }

  private getFallbackStory(): string {
    const stories = [
      'the bird built a nest in the tall tree. it gathered soft twigs and leaves. the nest felt safe and cozy',
      'kai felt nervous about the loud noise. he put on soft headphones. the quiet music helped him feel calm again',
      'the garden grew beautiful flowers. bees visited them every morning. watching the bees made me smile',
    ];

    const unused = stories.filter(s => !this.usedContent.has(s));
    const story = unused.length > 0
      ? unused[Math.floor(Math.random() * unused.length)]
      : stories[Math.floor(Math.random() * stories.length)];

    this.saveToHistory('stories', story);
    return story;
  }
}

export default TherapeuticContentGenerator;
