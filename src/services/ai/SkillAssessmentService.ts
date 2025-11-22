/**
 * AI Skill Assessment Service
 * Analyzes typing performance to identify strengths, weaknesses, and learning patterns
 */

import { OpenAIService } from './OpenAIService';
import { AIConfig } from './types';

export interface TypingMistake {
  expected: string;
  typed: string;
  position: number;
  timestamp: number;
  context?: string; // The word/sentence being typed
}

export interface SkillMetrics {
  // Overall performance
  averageAccuracy: number;
  averageSpeed: number; // WPM
  totalWordsTyped: number;
  totalSentencesTyped: number;
  sessionsCompleted: number;

  // Letter-specific
  weakLetters: string[]; // Letters with high error rate
  strongLetters: string[]; // Letters with low error rate
  commonMistakes: Array<{ from: string; to: string; count: number }>; // What they type instead

  // Pattern analysis
  strugglesWithCapitals: boolean;
  strugglesWithNumbers: boolean;
  strugglesWithPunctuation: boolean;

  // Learning trends
  improvementRate: number; // Percentage improvement over last 10 sessions
  consistencyScore: number; // How consistent their performance is (0-100)

  // Recommendations
  nextFocusAreas: string[];
  readyForNextLevel: boolean;
}

export interface SkillAssessment {
  currentLevel: number;
  levelName: string;
  metrics: SkillMetrics;
  aiAnalysis: string; // AI-generated analysis of learning progress
  recommendations: string[]; // AI-generated specific recommendations
  strengths: string[]; // What they're doing well
  areasToImprove: string[]; // What needs work
  estimatedTimeToNextLevel: string; // e.g., "2-3 sessions"
}

export interface SessionPerformance {
  timestamp: number;
  accuracy: number;
  speed: number;
  wordsTyped: number;
  mistakes: TypingMistake[];
  contentType: 'words' | 'sentences' | 'stories';
  difficulty: 'easy' | 'medium' | 'hard';
}

const STORAGE_KEY_PERFORMANCE = 'typing_tutor_performance_history';
const STORAGE_KEY_METRICS = 'typing_tutor_skill_metrics';

export class SkillAssessmentService {
  private aiService: OpenAIService;
  private performanceHistory: SessionPerformance[] = [];

  constructor(aiConfig?: AIConfig) {
    this.aiService = new OpenAIService();
    if (aiConfig) {
      this.aiService.initialize(aiConfig);
    }
    this.loadPerformanceHistory();
  }

  /**
   * Initialize with API key from environment
   */
  async initialize(): Promise<void> {
    const apiKey = import.meta.env.VITE_OPENAI_API_KEY;
    if (apiKey) {
      this.aiService.initialize({
        provider: 'openai',
        apiKey,
        model: 'gpt-4o-mini',
        temperature: 0.7,
      });
    } else {
      console.warn('⚠️ No OpenAI API key found for skill assessment');
    }
  }

  /**
   * Record a completed typing session
   */
  recordSession(performance: SessionPerformance): void {
    console.log('📊 Recording session performance:', {
      accuracy: performance.accuracy,
      speed: performance.speed,
      mistakes: performance.mistakes.length,
    });

    this.performanceHistory.push(performance);

    // Keep only last 50 sessions
    if (this.performanceHistory.length > 50) {
      this.performanceHistory = this.performanceHistory.slice(-50);
    }

    this.savePerformanceHistory();
  }

  /**
   * Analyze all performance data and generate skill metrics
   */
  calculateMetrics(): SkillMetrics {
    if (this.performanceHistory.length === 0) {
      return this.getDefaultMetrics();
    }

    const recent = this.performanceHistory.slice(-10); // Last 10 sessions

    // Calculate averages
    const avgAccuracy = recent.reduce((sum, s) => sum + s.accuracy, 0) / recent.length;
    const avgSpeed = recent.reduce((sum, s) => sum + s.speed, 0) / recent.length;

    // Total counts
    const totalWords = this.performanceHistory.reduce((sum, s) => sum + s.wordsTyped, 0);
    const totalSentences = this.performanceHistory.filter(s => s.contentType === 'sentences').length;

    // Analyze mistakes
    const allMistakes = this.performanceHistory.flatMap(s => s.mistakes);
    const letterErrors = this.analyzeLetterErrors(allMistakes);

    // Calculate improvement rate
    const oldAvg = this.performanceHistory.slice(0, 10).reduce((sum, s) => sum + s.accuracy, 0) / Math.min(10, this.performanceHistory.length);
    const newAvg = avgAccuracy;
    const improvementRate = oldAvg > 0 ? ((newAvg - oldAvg) / oldAvg) * 100 : 0;

    // Calculate consistency (lower variance = higher consistency)
    const accuracyVariance = this.calculateVariance(recent.map(s => s.accuracy));
    const consistencyScore = Math.max(0, 100 - accuracyVariance);

    // Determine focus areas
    const nextFocusAreas = this.determineNextFocusAreas(letterErrors, avgAccuracy, recent);

    // Check if ready for next level
    const readyForNextLevel = avgAccuracy >= 85 && recent.length >= 5 && consistencyScore >= 70;

    return {
      averageAccuracy: Math.round(avgAccuracy * 10) / 10,
      averageSpeed: Math.round(avgSpeed * 10) / 10,
      totalWordsTyped: totalWords,
      totalSentencesTyped: totalSentences,
      sessionsCompleted: this.performanceHistory.length,
      weakLetters: letterErrors.weak,
      strongLetters: letterErrors.strong,
      commonMistakes: letterErrors.commonMistakes,
      strugglesWithCapitals: letterErrors.strugglesWithCapitals,
      strugglesWithNumbers: letterErrors.strugglesWithNumbers,
      strugglesWithPunctuation: letterErrors.strugglesWithPunctuation,
      improvementRate: Math.round(improvementRate * 10) / 10,
      consistencyScore: Math.round(consistencyScore),
      nextFocusAreas,
      readyForNextLevel,
    };
  }

  /**
   * Generate comprehensive AI-powered skill assessment
   */
  async generateAssessment(currentLevel: number, levelName: string): Promise<SkillAssessment> {
    console.log('🤖 Generating AI skill assessment...');

    const metrics = this.calculateMetrics();

    if (!this.aiService.isConfigured()) {
      console.warn('⚠️ AI service not configured, returning basic assessment');
      return this.getBasicAssessment(currentLevel, levelName, metrics);
    }

    try {
      // Generate AI analysis
      const aiAnalysis = await this.generateAIAnalysis(metrics);
      const recommendations = await this.generateAIRecommendations(metrics);
      const { strengths, areasToImprove } = await this.generateStrengthsAndWeaknesses(metrics);
      const timeEstimate = this.estimateTimeToNextLevel(metrics);

      console.log('✅ AI assessment generated successfully');

      return {
        currentLevel,
        levelName,
        metrics,
        aiAnalysis,
        recommendations,
        strengths,
        areasToImprove,
        estimatedTimeToNextLevel: timeEstimate,
      };
    } catch (error) {
      console.error('❌ Failed to generate AI assessment:', error);
      return this.getBasicAssessment(currentLevel, levelName, metrics);
    }
  }

  /**
   * Generate AI analysis of learning progress
   */
  private async generateAIAnalysis(metrics: SkillMetrics): Promise<string> {
    const prompt = `You are an expert education specialist analyzing a child's typing progress. Here are their metrics:

PERFORMANCE:
- Average Accuracy: ${metrics.averageAccuracy}%
- Average Speed: ${metrics.averageSpeed} WPM
- Total Words Typed: ${metrics.totalWordsTyped}
- Sessions Completed: ${metrics.sessionsCompleted}

IMPROVEMENT:
- Improvement Rate: ${metrics.improvementRate}%
- Consistency Score: ${metrics.consistencyScore}/100

CHALLENGES:
- Weak Letters: ${metrics.weakLetters.join(', ') || 'None identified'}
- Common Mistakes: ${metrics.commonMistakes.slice(0, 3).map(m => `"${m.from}" → "${m.to}"`).join(', ')}
- Struggles with capitals: ${metrics.strugglesWithCapitals ? 'Yes' : 'No'}

TASK: Write a brief, encouraging analysis (2-3 sentences) of their learning progress. Be specific and positive. Focus on their growth and what they're mastering.`;

    const response = await this.aiService.generateSentence({
      type: 'sentence-generation',
      level: 'sentences',
      context: prompt,
      userAge: 8,
    });

    return response.content;
  }

  /**
   * Generate AI recommendations
   */
  private async generateAIRecommendations(metrics: SkillMetrics): Promise<string[]> {
    const prompt = `You are an expert education specialist. Based on these typing metrics, suggest 3 specific, actionable recommendations:

PERFORMANCE:
- Average Accuracy: ${metrics.averageAccuracy}%
- Weak Letters: ${metrics.weakLetters.join(', ') || 'None'}
- Focus Areas: ${metrics.nextFocusAreas.join(', ')}

FORMAT: Return ONLY 3 recommendations, one per line, no numbers or bullets. Each should be a clear, specific action.

Example format:
Practice words with the letter "t" to build confidence
Take short breaks between typing sessions
Try typing familiar words first before new ones`;

    const response = await this.aiService.generateSentence({
      type: 'sentence-generation',
      level: 'sentences',
      context: prompt,
      userAge: 8,
    });

    return response.content.split('\n').filter(line => line.trim()).slice(0, 3);
  }

  /**
   * Generate strengths and areas to improve
   */
  private async generateStrengthsAndWeaknesses(metrics: SkillMetrics): Promise<{ strengths: string[]; areasToImprove: string[] }> {
    const prompt = `You are an expert education specialist. Based on these metrics, identify strengths and areas to improve:

METRICS:
- Average Accuracy: ${metrics.averageAccuracy}%
- Strong Letters: ${metrics.strongLetters.join(', ') || 'Building foundations'}
- Weak Letters: ${metrics.weakLetters.join(', ') || 'None identified'}
- Improvement Rate: ${metrics.improvementRate}%
- Consistency: ${metrics.consistencyScore}/100

FORMAT: Return in this exact format:
STRENGTHS:
[strength 1]
[strength 2]

AREAS TO IMPROVE:
[area 1]
[area 2]`;

    const response = await this.aiService.generateSentence({
      type: 'sentence-generation',
      level: 'sentences',
      context: prompt,
      userAge: 8,
    });

    const content = response.content;
    const strengthsMatch = content.match(/STRENGTHS:\s*([\s\S]*?)(?=AREAS TO IMPROVE:|$)/);
    const areasMatch = content.match(/AREAS TO IMPROVE:\s*([\s\S]*?)$/);

    const strengths = strengthsMatch
      ? strengthsMatch[1].split('\n').filter(line => line.trim()).slice(0, 3)
      : ['Making steady progress', 'Building typing skills'];

    const areasToImprove = areasMatch
      ? areasMatch[1].split('\n').filter(line => line.trim()).slice(0, 3)
      : metrics.weakLetters.length > 0
        ? [`Practice letters: ${metrics.weakLetters.join(', ')}`]
        : ['Keep practicing regularly'];

    return { strengths, areasToImprove };
  }

  /**
   * Analyze letter-specific errors
   */
  private analyzeLetterErrors(mistakes: TypingMistake[]): {
    weak: string[];
    strong: string[];
    commonMistakes: Array<{ from: string; to: string; count: number }>;
    strugglesWithCapitals: boolean;
    strugglesWithNumbers: boolean;
    strugglesWithPunctuation: boolean;
  } {
    if (mistakes.length === 0) {
      return {
        weak: [],
        strong: [],
        commonMistakes: [],
        strugglesWithCapitals: false,
        strugglesWithNumbers: false,
        strugglesWithPunctuation: false,
      };
    }

    // Count errors per letter
    const errorCounts: Record<string, number> = {};
    const mistakePairs: Record<string, number> = {};

    let capitalErrors = 0;
    let numberErrors = 0;
    let punctuationErrors = 0;

    mistakes.forEach(mistake => {
      const expected = mistake.expected.toLowerCase();
      const typed = mistake.typed.toLowerCase();

      // Count errors for expected letter
      errorCounts[expected] = (errorCounts[expected] || 0) + 1;

      // Track common mistake pairs
      const pairKey = `${expected}->${typed}`;
      mistakePairs[pairKey] = (mistakePairs[pairKey] || 0) + 1;

      // Check for specific struggles
      if (mistake.expected !== expected) capitalErrors++;
      if (/\d/.test(mistake.expected)) numberErrors++;
      if (/[.,!?;:]/.test(mistake.expected)) punctuationErrors++;
    });

    // Identify weak letters (top 5 most error-prone)
    const weakLetters = Object.entries(errorCounts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([letter]) => letter);

    // Identify strong letters (rarely make mistakes with)
    const allLetters = 'abcdefghijklmnopqrstuvwxyz'.split('');
    const strongLetters = allLetters.filter(letter => !errorCounts[letter] || errorCounts[letter] < 2).slice(0, 5);

    // Get common mistake pairs
    const commonMistakes = Object.entries(mistakePairs)
      .map(([pair, count]) => {
        const [from, to] = pair.split('->');
        return { from, to, count };
      })
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);

    return {
      weak: weakLetters,
      strong: strongLetters,
      commonMistakes,
      strugglesWithCapitals: capitalErrors > mistakes.length * 0.3,
      strugglesWithNumbers: numberErrors > mistakes.length * 0.3,
      strugglesWithPunctuation: punctuationErrors > mistakes.length * 0.3,
    };
  }

  /**
   * Determine next focus areas based on performance
   */
  private determineNextFocusAreas(letterErrors: ReturnType<typeof this.analyzeLetterErrors>, avgAccuracy: number, recentSessions: SessionPerformance[]): string[] {
    const focusAreas: string[] = [];

    // Letter-specific focus
    if (letterErrors.weak.length > 0) {
      focusAreas.push(`Letters: ${letterErrors.weak.slice(0, 3).join(', ')}`);
    }

    // Accuracy focus
    if (avgAccuracy < 80) {
      focusAreas.push('Slow down for accuracy');
    } else if (avgAccuracy >= 95) {
      focusAreas.push('Increase typing speed');
    }

    // Capital letters
    if (letterErrors.strugglesWithCapitals) {
      focusAreas.push('Practice capital letters');
    }

    // Content type progression
    const hasWordPractice = recentSessions.some(s => s.contentType === 'words');
    const hasSentencePractice = recentSessions.some(s => s.contentType === 'sentences');

    if (!hasWordPractice) {
      focusAreas.push('Practice individual words');
    } else if (!hasSentencePractice && avgAccuracy >= 85) {
      focusAreas.push('Ready for sentences');
    } else if (hasSentencePractice && avgAccuracy >= 90) {
      focusAreas.push('Ready for stories');
    }

    return focusAreas.slice(0, 3);
  }

  /**
   * Calculate variance for consistency score
   */
  private calculateVariance(values: number[]): number {
    if (values.length === 0) return 0;

    const mean = values.reduce((sum, val) => sum + val, 0) / values.length;
    const squaredDiffs = values.map(val => Math.pow(val - mean, 2));
    const variance = squaredDiffs.reduce((sum, val) => sum + val, 0) / values.length;

    return Math.sqrt(variance);
  }

  /**
   * Estimate time to next level
   */
  private estimateTimeToNextLevel(metrics: SkillMetrics): string {
    if (metrics.readyForNextLevel) {
      return 'Ready now!';
    }

    const accuracyGap = Math.max(0, 85 - metrics.averageAccuracy);
    const consistencyGap = Math.max(0, 70 - metrics.consistencyScore);

    const sessionsNeeded = Math.ceil((accuracyGap + consistencyGap) / 10);

    if (sessionsNeeded <= 2) return '1-2 sessions';
    if (sessionsNeeded <= 5) return '3-5 sessions';
    if (sessionsNeeded <= 10) return '6-10 sessions';
    return 'Keep practicing!';
  }

  /**
   * Get default metrics for new users
   */
  private getDefaultMetrics(): SkillMetrics {
    return {
      averageAccuracy: 0,
      averageSpeed: 0,
      totalWordsTyped: 0,
      totalSentencesTyped: 0,
      sessionsCompleted: 0,
      weakLetters: [],
      strongLetters: [],
      commonMistakes: [],
      strugglesWithCapitals: false,
      strugglesWithNumbers: false,
      strugglesWithPunctuation: false,
      improvementRate: 0,
      consistencyScore: 0,
      nextFocusAreas: ['Start with simple words', 'Focus on accuracy first'],
      readyForNextLevel: false,
    };
  }

  /**
   * Get basic assessment without AI
   */
  private getBasicAssessment(currentLevel: number, levelName: string, metrics: SkillMetrics): SkillAssessment {
    return {
      currentLevel,
      levelName,
      metrics,
      aiAnalysis: `You've completed ${metrics.sessionsCompleted} sessions with ${metrics.averageAccuracy.toFixed(1)}% accuracy. Keep up the great work!`,
      recommendations: metrics.nextFocusAreas.length > 0 ? metrics.nextFocusAreas : ['Keep practicing', 'Try different content types', 'Take breaks when needed'],
      strengths: metrics.strongLetters.length > 0 ? [`Good with letters: ${metrics.strongLetters.join(', ')}`] : ['Building foundations'],
      areasToImprove: metrics.weakLetters.length > 0 ? [`Practice letters: ${metrics.weakLetters.join(', ')}`] : ['Keep improving accuracy'],
      estimatedTimeToNextLevel: this.estimateTimeToNextLevel(metrics),
    };
  }

  /**
   * Load performance history from localStorage
   */
  private loadPerformanceHistory(): void {
    try {
      const stored = localStorage.getItem(STORAGE_KEY_PERFORMANCE);
      if (stored) {
        this.performanceHistory = JSON.parse(stored);
        console.log('📊 Loaded performance history:', this.performanceHistory.length, 'sessions');
      }
    } catch (error) {
      console.error('Failed to load performance history:', error);
      this.performanceHistory = [];
    }
  }

  /**
   * Save performance history to localStorage
   */
  private savePerformanceHistory(): void {
    try {
      localStorage.setItem(STORAGE_KEY_PERFORMANCE, JSON.stringify(this.performanceHistory));
    } catch (error) {
      console.error('Failed to save performance history:', error);
    }
  }

  /**
   * Clear all performance data
   */
  clearHistory(): void {
    this.performanceHistory = [];
    localStorage.removeItem(STORAGE_KEY_PERFORMANCE);
    localStorage.removeItem(STORAGE_KEY_METRICS);
    console.log('🗑️ Performance history cleared');
  }
}

export default SkillAssessmentService;
