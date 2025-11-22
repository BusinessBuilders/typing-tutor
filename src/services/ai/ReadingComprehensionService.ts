/**
 * AI Reading Comprehension Service
 * Uses smart AI to teach reading comprehension from single word typing to full understanding
 */

import { OpenAIService } from './OpenAIService';
import { AIConfig } from './types';

export interface EnhancedWord {
  word: string;
  definition: string; // Simple, child-friendly definition
  exampleSentence: string; // Word used in context
  imageKeywords: string[]; // Better keywords for finding pictures
  category: string; // e.g., "animal", "food", "emotion", "action"
  difficulty: 'easy' | 'medium' | 'hard';
  synonyms?: string[]; // Similar words they might know
  soundsLike?: string; // Phonetic help
}

export interface ComprehensionQuestion {
  question: string;
  correctAnswer: string;
  wrongAnswers: string[]; // Multiple choice options
  explanation: string; // Why the answer is correct
  questionType: 'meaning' | 'usage' | 'context' | 'inference';
  // Picture-based options for non-verbal/echolalia support
  correctPictureKeywords?: string[]; // Keywords for correct answer image
  wrongPictureKeywords?: string[][]; // Keywords for wrong answer images
  usePictures?: boolean; // Use pictures instead of text
}

export interface ReadingLesson {
  // Progressive learning stages
  stage: 'word-recognition' | 'word-meaning' | 'word-in-context' | 'sentence-comprehension' | 'story-comprehension';

  // Content
  targetWord: EnhancedWord;
  relatedWords?: EnhancedWord[]; // Build vocabulary around theme

  // Comprehension checks
  comprehensionQuestions: ComprehensionQuestion[];

  // Teaching approach
  teachingStrategy: string; // AI-suggested approach for this child
  difficultyReason: string; // Why this difficulty level was chosen
}

export interface ChildLearningProfile {
  // What they understand well
  strongCategories: string[]; // e.g., ["animals", "colors"]
  weakCategories: string[]; // Need more practice

  // Reading level
  vocabularySize: number; // Estimated words they know
  comprehensionLevel: 'emerging' | 'developing' | 'proficient' | 'advanced';

  // Learning preferences (AI-detected)
  respondsWellTo: string[]; // e.g., ["visual learning", "repetition", "stories"]
  strugglesWith: string[]; // e.g., ["abstract concepts", "long sentences"]

  // Recommendations
  nextSteps: string[];
  recommendedFocus: string;
}

const WORD_CATEGORIES = [
  'animals', 'colors', 'emotions', 'actions', 'food', 'family',
  'nature', 'home', 'school', 'toys', 'body-parts', 'weather'
];

export class ReadingComprehensionService {
  private aiService: OpenAIService;
  private learningHistory: Map<string, number> = new Map(); // word -> times practiced

  constructor() {
    this.aiService = new OpenAIService();
  }

  async initialize(): Promise<void> {
    const apiKey = import.meta.env.VITE_OPENAI_API_KEY;
    if (apiKey) {
      this.aiService.initialize({
        provider: 'openai',
        apiKey,
        model: 'gpt-4o-mini',
        temperature: 0.7,
        maxTokens: 2000,
      });
      console.log('✅ Reading Comprehension Service initialized with GPT-4o-mini');
    } else {
      console.warn('⚠️ No OpenAI API key found for reading comprehension');
    }
  }

  /**
   * Generate an enhanced word with full educational context
   */
  async generateEnhancedWord(
    difficulty: 'easy' | 'medium' | 'hard',
    category?: string,
    avoidWords?: string[]
  ): Promise<EnhancedWord> {
    const chosenCategory = category || WORD_CATEGORIES[Math.floor(Math.random() * WORD_CATEGORIES.length)];

    const prompt = `You are an expert reading teacher for children with autism. Generate ONE educational word for typing practice.

REQUIREMENTS:
- Category: ${chosenCategory}
- Difficulty: ${difficulty} (easy: 3-5 letters, medium: 5-8 letters, hard: 8+ letters)
${avoidWords && avoidWords.length > 0 ? `- AVOID these words: ${avoidWords.join(', ')}` : ''}

RESPOND IN EXACTLY THIS FORMAT:
WORD: [the word]
DEFINITION: [simple 5-8 word definition a child would understand]
EXAMPLE: [short sentence using the word, 6-10 words]
IMAGE_KEYWORDS: [3 specific keywords for finding good pictures, comma-separated]
SYNONYMS: [2-3 simpler similar words, comma-separated]
SOUNDS_LIKE: [phonetic spelling to help with pronunciation]

Example:
WORD: butterfly
DEFINITION: a colorful insect with big beautiful wings
EXAMPLE: the butterfly landed softly on the flower
IMAGE_KEYWORDS: monarch butterfly, colorful butterfly wings, butterfly on flower
SYNONYMS: moth, flying insect
SOUNDS_LIKE: but-ter-fly

NOW GENERATE:`;

    try {
      const response = await this.aiService.generateSentence({
        type: 'sentence-generation',
        level: 'sentences',
        context: prompt,
        userAge: 8,
      });

      const content = response.content;

      // Parse AI response
      const wordMatch = content.match(/WORD:\s*(.+)/i);
      const defMatch = content.match(/DEFINITION:\s*(.+)/i);
      const exampleMatch = content.match(/EXAMPLE:\s*(.+)/i);
      const imageMatch = content.match(/IMAGE_KEYWORDS:\s*(.+)/i);
      const synonymsMatch = content.match(/SYNONYMS:\s*(.+)/i);
      const soundsMatch = content.match(/SOUNDS_LIKE:\s*(.+)/i);

      const word = wordMatch ? wordMatch[1].trim().toLowerCase() : 'cat';
      const definition = defMatch ? defMatch[1].trim() : 'a small furry animal';
      const exampleSentence = exampleMatch ? exampleMatch[1].trim() : `I see a ${word}`;
      const imageKeywords = imageMatch
        ? imageMatch[1].split(',').map(k => k.trim())
        : [word, chosenCategory, 'colorful'];
      const synonyms = synonymsMatch
        ? synonymsMatch[1].split(',').map(s => s.trim())
        : [];
      const soundsLike = soundsMatch ? soundsMatch[1].trim() : word;

      console.log('📚 Generated enhanced word:', { word, category: chosenCategory, definition });

      return {
        word,
        definition,
        exampleSentence,
        imageKeywords,
        category: chosenCategory,
        difficulty,
        synonyms,
        soundsLike,
      };
    } catch (error) {
      console.error('Failed to generate enhanced word:', error);
      // Fallback
      return this.getFallbackWord(difficulty, chosenCategory);
    }
  }

  /**
   * Generate comprehension questions about a word/sentence they just typed
   * NOW PICTURE-BASED: Only 2 options (correct + 1 wrong) to reduce cognitive load
   * and prevent positional bias / echolalia issues
   */
  async generateComprehensionQuestions(
    content: string,
    contentType: 'word' | 'sentence' | 'story',
    enhancedWord?: EnhancedWord
  ): Promise<ComprehensionQuestion[]> {
    const prompt = `You are a reading comprehension teacher for children with autism who may have echolalia and positional bias. Create 1 PICTURE-BASED comprehension question:

CONTENT: "${content}"
TYPE: ${contentType}
${enhancedWord ? `DEFINITION: ${enhancedWord.definition}` : ''}
${enhancedWord ? `CATEGORY: ${enhancedWord.category}` : ''}

REQUIREMENTS:
1. Question will be SHOWN AS PICTURES (child clicks picture, not text)
2. Only 2 options: CORRECT + 1 WRONG (not 3! simpler choice)
3. Wrong answer should be from DIFFERENT category (easy to distinguish visually)
4. Provide image keywords for each option

FORMAT (create 1 question):
QUESTION: [simple question for audio - "Which one is a [word]?"]
CORRECT: [correct answer text]
CORRECT_IMAGE: [3 specific keywords for finding correct image, comma-separated]
WRONG: [one wrong answer from different category]
WRONG_IMAGE: [3 specific keywords for finding wrong image, comma-separated]
EXPLANATION: [why correct answer is right, simple terms]
TYPE: meaning

Example for "butterfly" (animal category):
QUESTION: Which one is a butterfly?
CORRECT: butterfly
CORRECT_IMAGE: monarch butterfly, colorful butterfly wings, butterfly close-up
WRONG: banana
WRONG_IMAGE: yellow banana fruit, fresh banana, ripe banana
EXPLANATION: a butterfly is an insect with colorful wings
TYPE: meaning

NOW GENERATE (only 1 question with 2 options):`;

    try {
      const response = await this.aiService.generateSentence({
        type: 'sentence-generation',
        level: 'sentences',
        context: prompt,
        userAge: 8,
      });

      const questions = this.parsePictureComprehensionQuestions(response.content);
      console.log(`🎯 Generated ${questions.length} picture-based comprehension questions (2 options each)`);
      return questions;
    } catch (error) {
      console.error('Failed to generate comprehension questions:', error);
      return this.getFallbackQuestions(content, enhancedWord);
    }
  }

  /**
   * Analyze child's learning and suggest personalized teaching approach
   */
  async analyzeAndSuggestApproach(
    performanceData: {
      wordsTyped: string[];
      accuracy: number;
      comprehensionCorrect: number;
      comprehensionTotal: number;
      struggledWords: string[];
    }
  ): Promise<string> {
    const prompt = `You are an expert reading specialist for children with autism. Analyze this child's performance and suggest the best teaching approach.

PERFORMANCE DATA:
- Words practiced: ${performanceData.wordsTyped.slice(-10).join(', ')}
- Typing accuracy: ${performanceData.accuracy}%
- Comprehension: ${performanceData.comprehensionCorrect}/${performanceData.comprehensionTotal} correct
- Struggled with: ${performanceData.struggledWords.join(', ') || 'none identified'}

TASK: Provide a 2-3 sentence recommendation on:
1. What reading comprehension stage to focus on next
2. What type of content would help most (categories, difficulty)
3. What teaching strategy to emphasize (visual, repetition, context, etc.)

Be specific and actionable.`;

    try {
      const response = await this.aiService.generateSentence({
        type: 'sentence-generation',
        level: 'sentences',
        context: prompt,
        userAge: 8,
      });

      return response.content;
    } catch (error) {
      console.error('Failed to generate teaching approach:', error);
      return 'Continue practicing with words and their meanings. Try using pictures to connect words to their definitions.';
    }
  }

  /**
   * Create a complete reading lesson with progression
   */
  async createReadingLesson(
    currentStage: ReadingLesson['stage'],
    childLevel: 'beginner' | 'intermediate' | 'advanced',
    focusCategory?: string
  ): Promise<ReadingLesson> {
    console.log('📖 Creating reading lesson:', { currentStage, childLevel, focusCategory });

    // Determine difficulty based on level and stage
    const difficulty = this.getDifficultyForStage(currentStage, childLevel);

    // Generate enhanced word
    const enhancedWord = await this.generateEnhancedWord(difficulty, focusCategory);

    // Generate related words for context
    const relatedWords: EnhancedWord[] = [];
    if (currentStage !== 'word-recognition') {
      // Add 2 related words to build vocabulary
      for (let i = 0; i < 2; i++) {
        const related = await this.generateEnhancedWord(difficulty, enhancedWord.category, [enhancedWord.word]);
        relatedWords.push(related);
      }
    }

    // Generate comprehension questions based on stage
    const comprehensionQuestions = await this.generateComprehensionQuestions(
      currentStage === 'word-recognition' ? enhancedWord.word : enhancedWord.exampleSentence,
      currentStage === 'word-recognition' ? 'word' : 'sentence',
      enhancedWord
    );

    // AI suggests teaching strategy
    const teachingStrategy = await this.suggestTeachingStrategy(currentStage, enhancedWord);

    return {
      stage: currentStage,
      targetWord: enhancedWord,
      relatedWords,
      comprehensionQuestions,
      teachingStrategy,
      difficultyReason: this.explainDifficulty(difficulty, currentStage),
    };
  }

  /**
   * Build a learning profile for the child
   */
  async buildLearningProfile(
    wordHistory: string[],
    categoryPerformance: Map<string, { correct: number; total: number }>,
    comprehensionScores: number[]
  ): Promise<ChildLearningProfile> {
    // Calculate vocabulary size
    const vocabularySize = new Set(wordHistory).size;

    // Identify strong and weak categories
    const strongCategories: string[] = [];
    const weakCategories: string[] = [];

    categoryPerformance.forEach((perf, category) => {
      const accuracy = perf.correct / perf.total;
      if (accuracy >= 0.8) strongCategories.push(category);
      else if (accuracy < 0.6) weakCategories.push(category);
    });

    // Determine comprehension level
    const avgComprehension = comprehensionScores.reduce((a, b) => a + b, 0) / comprehensionScores.length;
    const comprehensionLevel =
      avgComprehension >= 0.9 ? 'advanced' :
      avgComprehension >= 0.7 ? 'proficient' :
      avgComprehension >= 0.5 ? 'developing' : 'emerging';

    // Get AI recommendations
    const aiRecommendations = await this.getAIRecommendations({
      vocabularySize,
      strongCategories,
      weakCategories,
      comprehensionLevel,
    });

    return {
      strongCategories,
      weakCategories,
      vocabularySize,
      comprehensionLevel,
      respondsWellTo: this.detectLearningPreferences(wordHistory, comprehensionScores),
      strugglesWith: this.detectStruggles(weakCategories, comprehensionLevel),
      nextSteps: aiRecommendations.nextSteps,
      recommendedFocus: aiRecommendations.focus,
    };
  }

  // ============= HELPER METHODS =============

  private getDifficultyForStage(
    stage: ReadingLesson['stage'],
    childLevel: 'beginner' | 'intermediate' | 'advanced'
  ): 'easy' | 'medium' | 'hard' {
    if (childLevel === 'beginner') return 'easy';
    if (childLevel === 'advanced') return 'hard';

    // Intermediate adjusts based on stage
    if (stage === 'word-recognition' || stage === 'word-meaning') return 'easy';
    if (stage === 'story-comprehension') return 'hard';
    return 'medium';
  }

  private async suggestTeachingStrategy(
    stage: ReadingLesson['stage'],
    word: EnhancedWord
  ): Promise<string> {
    const stageDescriptions = {
      'word-recognition': 'focusing on recognizing and typing the word correctly',
      'word-meaning': 'understanding what the word means with pictures and definitions',
      'word-in-context': 'seeing how the word is used in sentences',
      'sentence-comprehension': 'understanding complete sentences with the word',
      'story-comprehension': 'understanding stories that use the word',
    };

    return `At the ${stage.replace(/-/g, ' ')} stage, ${stageDescriptions[stage]}. Use the picture of "${word.word}" to connect the word to its meaning: "${word.definition}". Practice typing while looking at the picture to build the connection.`;
  }

  private explainDifficulty(difficulty: 'easy' | 'medium' | 'hard', stage: ReadingLesson['stage']): string {
    const reasons = {
      easy: 'short word with common letters, good for building confidence',
      medium: 'moderate length word, building typing skill and vocabulary',
      hard: 'longer word with more complex spelling, advancing reading ability',
    };
    return reasons[difficulty];
  }

  /**
   * Parse picture-based comprehension questions (NEW FORMAT)
   */
  private parsePictureComprehensionQuestions(content: string): ComprehensionQuestion[] {
    const questions: ComprehensionQuestion[] = [];

    const questionMatch = content.match(/QUESTION:\s*(.+?)(?=CORRECT:|$)/s);
    const correctMatch = content.match(/CORRECT:\s*(.+?)(?=CORRECT_IMAGE:|$)/s);
    const correctImageMatch = content.match(/CORRECT_IMAGE:\s*(.+?)(?=WRONG:|$)/s);
    const wrongMatch = content.match(/WRONG:\s*(.+?)(?=WRONG_IMAGE:|$)/s);
    const wrongImageMatch = content.match(/WRONG_IMAGE:\s*(.+?)(?=EXPLANATION:|$)/s);
    const explanationMatch = content.match(/EXPLANATION:\s*(.+?)(?=TYPE:|$)/s);
    const typeMatch = content.match(/TYPE:\s*(\w+)/);

    if (questionMatch && correctMatch && correctImageMatch && wrongMatch && wrongImageMatch) {
      const correctImageKeywords = correctImageMatch[1].split(',').map(k => k.trim()).filter(k => k);
      const wrongImageKeywords = wrongImageMatch[1].split(',').map(k => k.trim()).filter(k => k);

      questions.push({
        question: questionMatch[1].trim(),
        correctAnswer: correctMatch[1].trim(),
        wrongAnswers: [wrongMatch[1].trim()], // Only 1 wrong answer now
        explanation: explanationMatch ? explanationMatch[1].trim() : 'Good job!',
        questionType: (typeMatch?.[1].toLowerCase() as any) || 'meaning',
        usePictures: true,
        correctPictureKeywords: correctImageKeywords,
        wrongPictureKeywords: [wrongImageKeywords],
      });
    }

    console.log('📸 Parsed picture-based question:', questions[0]);
    return questions.slice(0, 1); // Only 1 question
  }

  /**
   * Old text-based parser (kept for backward compatibility)
   */
  private parseComprehensionQuestions(content: string): ComprehensionQuestion[] {
    const questions: ComprehensionQuestion[] = [];

    // Split by QUESTION: markers
    const questionBlocks = content.split(/QUESTION:/i).slice(1);

    for (const block of questionBlocks) {
      const questionMatch = block.match(/^(.+?)(?=CORRECT:)/s);
      const correctMatch = block.match(/CORRECT:\s*(.+?)(?=WRONG1:)/s);
      const wrong1Match = block.match(/WRONG1:\s*(.+?)(?=WRONG2:)/s);
      const wrong2Match = block.match(/WRONG2:\s*(.+?)(?=EXPLANATION:)/s);
      const explanationMatch = block.match(/EXPLANATION:\s*(.+?)(?=TYPE:|$)/s);
      const typeMatch = block.match(/TYPE:\s*(\w+)/);

      if (questionMatch && correctMatch && wrong1Match && wrong2Match) {
        questions.push({
          question: questionMatch[1].trim(),
          correctAnswer: correctMatch[1].trim(),
          wrongAnswers: [wrong1Match[1].trim(), wrong2Match[1].trim()],
          explanation: explanationMatch ? explanationMatch[1].trim() : 'Good job!',
          questionType: (typeMatch?.[1].toLowerCase() as any) || 'meaning',
        });
      }
    }

    return questions.slice(0, 3); // Max 3 questions
  }

  private getFallbackWord(difficulty: 'easy' | 'medium' | 'hard', category: string): EnhancedWord {
    const fallbacks: Record<string, EnhancedWord> = {
      'easy-animals': {
        word: 'cat',
        definition: 'a small furry pet that says meow',
        exampleSentence: 'the cat sleeps on the soft bed',
        imageKeywords: ['cute cat', 'sleeping cat', 'pet cat'],
        category: 'animals',
        difficulty: 'easy',
        synonyms: ['kitten', 'pet'],
        soundsLike: 'kat',
      },
      'medium-animals': {
        word: 'elephant',
        definition: 'a very large gray animal with a long trunk',
        exampleSentence: 'the elephant uses its trunk to drink water',
        imageKeywords: ['elephant trunk', 'african elephant', 'elephant drinking'],
        category: 'animals',
        difficulty: 'medium',
        synonyms: ['mammal', 'large animal'],
        soundsLike: 'el-eh-fant',
      },
    };

    return fallbacks[`${difficulty}-${category}`] || fallbacks['easy-animals'];
  }

  private getFallbackQuestions(content: string, word?: EnhancedWord): ComprehensionQuestion[] {
    if (!word) {
      return [{
        question: `Which one did you just type?`,
        correctAnswer: content,
        wrongAnswers: ['different'], // Only 1 wrong option
        explanation: `You typed "${content}" correctly!`,
        questionType: 'meaning',
        usePictures: true,
        correctPictureKeywords: [content],
        wrongPictureKeywords: [['random object', 'different thing']],
      }];
    }

    // Get a contrasting category for wrong answer
    const categoryPairs: Record<string, string[]> = {
      'animals': ['banana fruit', 'yellow banana', 'ripe banana'],
      'food': ['dog animal', 'pet dog', 'cute dog'],
      'colors': ['tree nature', 'green tree', 'tall tree'],
      'default': ['contrasting object', 'different item', 'unrelated thing'],
    };

    const wrongImageKeywords = categoryPairs[word.category] || categoryPairs['default'];

    return [{
      question: `Which one is a ${word.word}?`,
      correctAnswer: word.word,
      wrongAnswers: ['different thing'], // Only 1 wrong option
      explanation: `A ${word.word} is ${word.definition}`,
      questionType: 'meaning',
      usePictures: true,
      correctPictureKeywords: word.imageKeywords || [word.word],
      wrongPictureKeywords: [wrongImageKeywords],
    }];
  }

  private detectLearningPreferences(wordHistory: string[], scores: number[]): string[] {
    const preferences: string[] = [];

    // High consistency = responds well to repetition
    const avgScore = scores.reduce((a, b) => a + b, 0) / scores.length;
    if (avgScore > 0.8) preferences.push('repetition and practice');

    // Always include visual learning for children with autism
    preferences.push('visual learning with pictures');
    preferences.push('clear examples and demonstrations');

    return preferences;
  }

  private detectStruggles(weakCategories: string[], comprehensionLevel: string): string[] {
    const struggles: string[] = [];

    if (weakCategories.length > 2) {
      struggles.push('multiple word categories need practice');
    }

    if (comprehensionLevel === 'emerging' || comprehensionLevel === 'developing') {
      struggles.push('connecting words to their meanings');
    }

    return struggles.length > 0 ? struggles : ['building confidence with new words'];
  }

  private async getAIRecommendations(profile: {
    vocabularySize: number;
    strongCategories: string[];
    weakCategories: string[];
    comprehensionLevel: string;
  }): Promise<{ nextSteps: string[]; focus: string }> {
    const prompt = `You are a reading specialist. Suggest next steps for a child with this profile:

PROFILE:
- Vocabulary size: ${profile.vocabularySize} words
- Strong categories: ${profile.strongCategories.join(', ') || 'building foundation'}
- Weak categories: ${profile.weakCategories.join(', ') || 'none yet'}
- Comprehension level: ${profile.comprehensionLevel}

Provide:
1. Three specific next steps (one per line, starting with a dash)
2. One main focus area (one sentence)

Format:
NEXT_STEPS:
- [step 1]
- [step 2]
- [step 3]
FOCUS: [focus area]`;

    try {
      const response = await this.aiService.generateSentence({
        type: 'sentence-generation',
        level: 'sentences',
        context: prompt,
        userAge: 8,
      });

      const stepsMatch = response.content.match(/NEXT_STEPS:([\s\S]+?)FOCUS:/);
      const focusMatch = response.content.match(/FOCUS:\s*(.+)/);

      const nextSteps = stepsMatch
        ? stepsMatch[1].split('\n').filter(line => line.trim().startsWith('-')).map(line => line.trim().substring(1).trim()).slice(0, 3)
        : ['Practice more words in weak categories', 'Review word meanings with pictures', 'Try simple sentences'];

      const focus = focusMatch
        ? focusMatch[1].trim()
        : 'Focus on connecting words to pictures and meanings';

      return { nextSteps, focus };
    } catch (error) {
      return {
        nextSteps: ['Practice more words', 'Review meanings', 'Try sentences'],
        focus: 'Build vocabulary with pictures',
      };
    }
  }
}

export default ReadingComprehensionService;
