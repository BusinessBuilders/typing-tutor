/**
 * Progressive Level System
 * Defines skill levels, advancement criteria, and learning progression
 */

export interface Level {
  id: number;
  name: string;
  title: string;
  description: string;
  icon: string;
  color: string; // Tailwind gradient classes

  // Advancement criteria
  requirements: {
    minAccuracy: number; // Percentage
    minSessions: number; // Number of sessions to complete
    minWordsTyped: number; // Total words typed
    minConsistency: number; // Consistency score (0-100)
    specificSkills?: string[]; // Optional specific skills needed
  };

  // Content configuration
  contentFocus: {
    types: Array<'words' | 'sentences' | 'stories'>; // What content types are available
    difficulty: Array<'easy' | 'medium' | 'hard'>; // What difficulties are available
    recommendedDifficulty: 'easy' | 'medium' | 'hard'; // Starting difficulty for this level
    focusAreas: string[]; // What to focus on (e.g., "common letters", "capital letters")
  };

  // Rewards
  rewards: {
    badge: string; // Badge emoji
    celebrationMessage: string;
    unlocks?: string[]; // Features unlocked at this level
  };
}

export interface UserProgress {
  currentLevel: number;
  experience: number; // Experience points in current level
  experienceToNextLevel: number;
  levelsCompleted: number[];
  dateStartedCurrentLevel: number; // Timestamp
  lastLevelUpDate?: number; // Timestamp
}

const STORAGE_KEY_PROGRESS = 'typing_tutor_user_progress';

/**
 * Define all levels in the progression system
 */
export const LEVELS: Level[] = [
  {
    id: 1,
    name: 'Keyboard Explorer',
    title: 'Level 1: Keyboard Explorer',
    description: 'Learning the basics of typing. Starting with simple letters and words.',
    icon: '🔍',
    color: 'from-green-400 to-emerald-500',
    requirements: {
      minAccuracy: 70,
      minSessions: 3,
      minWordsTyped: 25,
      minConsistency: 50,
    },
    contentFocus: {
      types: ['words'],
      difficulty: ['easy'],
      recommendedDifficulty: 'easy',
      focusAreas: ['Home row letters', 'Common letters (a, e, i, o, t, s)'],
    },
    rewards: {
      badge: '🌟',
      celebrationMessage: 'You found your way around the keyboard! Time to practice more words!',
      unlocks: ['Words practice', 'Easy difficulty'],
    },
  },
  {
    id: 2,
    name: 'Letter Master',
    title: 'Level 2: Letter Master',
    description: 'Building confidence with all letters. Practicing more complex words.',
    icon: '✍️',
    color: 'from-blue-400 to-cyan-500',
    requirements: {
      minAccuracy: 75,
      minSessions: 5,
      minWordsTyped: 50,
      minConsistency: 60,
    },
    contentFocus: {
      types: ['words'],
      difficulty: ['easy', 'medium'],
      recommendedDifficulty: 'medium',
      focusAreas: ['All lowercase letters', 'Longer words', 'Letter combinations'],
    },
    rewards: {
      badge: '📝',
      celebrationMessage: 'You mastered the letters! Ready to build sentences?',
      unlocks: ['Medium difficulty words', 'Sentence practice'],
    },
  },
  {
    id: 3,
    name: 'Word Builder',
    title: 'Level 3: Word Builder',
    description: 'Mastering words and starting to build sentences.',
    icon: '🏗️',
    color: 'from-purple-400 to-pink-500',
    requirements: {
      minAccuracy: 80,
      minSessions: 8,
      minWordsTyped: 100,
      minConsistency: 65,
      specificSkills: ['Can type 5+ letter words', 'Comfortable with keyboard layout'],
    },
    contentFocus: {
      types: ['words', 'sentences'],
      difficulty: ['easy', 'medium'],
      recommendedDifficulty: 'easy',
      focusAreas: ['Simple sentences', 'Spacing between words', 'Capital letters at start'],
    },
    rewards: {
      badge: '🎯',
      celebrationMessage: 'You build amazing words! Let\'s make complete sentences!',
      unlocks: ['Sentence practice', 'Therapeutic sentences'],
    },
  },
  {
    id: 4,
    name: 'Sentence Pro',
    title: 'Level 4: Sentence Pro',
    description: 'Writing complete sentences with confidence and accuracy.',
    icon: '💬',
    color: 'from-orange-400 to-red-500',
    requirements: {
      minAccuracy: 85,
      minSessions: 12,
      minWordsTyped: 200,
      minConsistency: 70,
      specificSkills: ['Can type complete sentences', 'Good with capitals', 'Consistent spacing'],
    },
    contentFocus: {
      types: ['sentences'],
      difficulty: ['easy', 'medium', 'hard'],
      recommendedDifficulty: 'medium',
      focusAreas: ['Longer sentences', 'Punctuation', 'Proper capitalization'],
    },
    rewards: {
      badge: '🚀',
      celebrationMessage: 'You\'re a sentence pro! Ready for stories?',
      unlocks: ['Hard difficulty sentences', 'Story practice', 'AI Lesson Plans'],
    },
  },
  {
    id: 5,
    name: 'Story Teller',
    title: 'Level 5: Story Teller',
    description: 'Creating stories and typing longer passages with ease.',
    icon: '📖',
    color: 'from-pink-400 to-rose-500',
    requirements: {
      minAccuracy: 88,
      minSessions: 15,
      minWordsTyped: 350,
      minConsistency: 75,
      specificSkills: ['Can type paragraphs', 'Strong punctuation', 'Excellent spacing'],
    },
    contentFocus: {
      types: ['sentences', 'stories'],
      difficulty: ['medium', 'hard'],
      recommendedDifficulty: 'medium',
      focusAreas: ['Story narratives', 'Multiple sentences', 'Creative expression'],
    },
    rewards: {
      badge: '📚',
      celebrationMessage: 'You tell wonderful stories! Keep exploring new adventures!',
      unlocks: ['Story practice', 'Advanced lessons', 'Custom AI lessons'],
    },
  },
  {
    id: 6,
    name: 'Typing Champion',
    title: 'Level 6: Typing Champion',
    description: 'Mastering advanced typing with speed and precision.',
    icon: '👑',
    color: 'from-yellow-400 to-orange-500',
    requirements: {
      minAccuracy: 92,
      minSessions: 20,
      minWordsTyped: 500,
      minConsistency: 80,
      specificSkills: ['Excellent accuracy', 'Good typing speed', 'Consistent performance'],
    },
    contentFocus: {
      types: ['sentences', 'stories'],
      difficulty: ['medium', 'hard'],
      recommendedDifficulty: 'hard',
      focusAreas: ['Speed building', 'Complex sentences', 'Advanced vocabulary'],
    },
    rewards: {
      badge: '🏆',
      celebrationMessage: 'You\'re a typing champion! You\'ve mastered all the fundamentals!',
      unlocks: ['All content types', 'Speed challenges', 'Expert mode'],
    },
  },
  {
    id: 7,
    name: 'Expert Typist',
    title: 'Level 7: Expert Typist',
    description: 'Achieving expert-level typing skills with exceptional accuracy.',
    icon: '⭐',
    color: 'from-indigo-400 to-purple-600',
    requirements: {
      minAccuracy: 95,
      minSessions: 30,
      minWordsTyped: 800,
      minConsistency: 85,
    },
    contentFocus: {
      types: ['sentences', 'stories'],
      difficulty: ['hard'],
      recommendedDifficulty: 'hard',
      focusAreas: ['Maximum accuracy', 'Sustained speed', 'Perfect form'],
    },
    rewards: {
      badge: '💎',
      celebrationMessage: 'You\'re an expert typist! Your skills are incredible!',
      unlocks: ['Expert challenges', 'Speed tests', 'All features'],
    },
  },
];

export class LevelSystem {
  private currentProgress: UserProgress;

  constructor() {
    this.currentProgress = this.loadProgress();
  }

  /**
   * Get current level details
   */
  getCurrentLevel(): Level {
    return LEVELS.find(level => level.id === this.currentProgress.currentLevel) || LEVELS[0];
  }

  /**
   * Get next level details
   */
  getNextLevel(): Level | null {
    const nextLevelId = this.currentProgress.currentLevel + 1;
    return LEVELS.find(level => level.id === nextLevelId) || null;
  }

  /**
   * Get all levels
   */
  getAllLevels(): Level[] {
    return LEVELS;
  }

  /**
   * Get user progress
   */
  getProgress(): UserProgress {
    return { ...this.currentProgress };
  }

  /**
   * Check if user meets requirements for level advancement
   */
  checkLevelAdvancement(metrics: {
    averageAccuracy: number;
    sessionsCompleted: number;
    totalWordsTyped: number;
    consistencyScore: number;
  }): { canAdvance: boolean; missingRequirements: string[] } {
    const currentLevel = this.getCurrentLevel();
    const nextLevel = this.getNextLevel();

    if (!nextLevel) {
      return {
        canAdvance: false,
        missingRequirements: ['You have reached the maximum level!'],
      };
    }

    const req = currentLevel.requirements;
    const missingRequirements: string[] = [];

    if (metrics.averageAccuracy < req.minAccuracy) {
      missingRequirements.push(`Accuracy: ${metrics.averageAccuracy.toFixed(1)}% (need ${req.minAccuracy}%)`);
    }

    if (metrics.sessionsCompleted < req.minSessions) {
      missingRequirements.push(`Sessions: ${metrics.sessionsCompleted} (need ${req.minSessions})`);
    }

    if (metrics.totalWordsTyped < req.minWordsTyped) {
      missingRequirements.push(`Words typed: ${metrics.totalWordsTyped} (need ${req.minWordsTyped})`);
    }

    if (metrics.consistencyScore < req.minConsistency) {
      missingRequirements.push(`Consistency: ${metrics.consistencyScore} (need ${req.minConsistency})`);
    }

    return {
      canAdvance: missingRequirements.length === 0,
      missingRequirements,
    };
  }

  /**
   * Advance to next level
   */
  advanceLevel(): { success: boolean; newLevel?: Level; message: string } {
    const nextLevel = this.getNextLevel();

    if (!nextLevel) {
      return {
        success: false,
        message: 'You are already at the maximum level!',
      };
    }

    // Update progress
    this.currentProgress.levelsCompleted.push(this.currentProgress.currentLevel);
    this.currentProgress.currentLevel = nextLevel.id;
    this.currentProgress.experience = 0;
    this.currentProgress.dateStartedCurrentLevel = Date.now();
    this.currentProgress.lastLevelUpDate = Date.now();

    this.saveProgress();

    console.log('🎉 LEVEL UP!', {
      newLevel: nextLevel.name,
      levelId: nextLevel.id,
    });

    return {
      success: true,
      newLevel: nextLevel,
      message: nextLevel.rewards.celebrationMessage,
    };
  }

  /**
   * Add experience points
   */
  addExperience(points: number): void {
    this.currentProgress.experience += points;
    this.saveProgress();
  }

  /**
   * Calculate experience points for a session
   */
  calculateExperiencePoints(metrics: {
    accuracy: number;
    wordsTyped: number;
    mistakeCount: number;
  }): number {
    let xp = 0;

    // Base XP for completion
    xp += 10;

    // Accuracy bonus
    if (metrics.accuracy >= 95) xp += 20;
    else if (metrics.accuracy >= 90) xp += 15;
    else if (metrics.accuracy >= 85) xp += 10;
    else if (metrics.accuracy >= 80) xp += 5;

    // Words typed bonus
    xp += Math.min(metrics.wordsTyped * 2, 50);

    // Perfect performance bonus
    if (metrics.accuracy === 100) xp += 30;

    // Few mistakes bonus
    if (metrics.mistakeCount === 0) xp += 20;
    else if (metrics.mistakeCount <= 2) xp += 10;

    return xp;
  }

  /**
   * Get recommended content type based on level
   */
  getRecommendedContentType(): 'words' | 'sentences' | 'stories' {
    const level = this.getCurrentLevel();
    const types = level.contentFocus.types;

    // Return the most advanced available type
    if (types.includes('stories')) return 'stories';
    if (types.includes('sentences')) return 'sentences';
    return 'words';
  }

  /**
   * Get recommended difficulty based on level
   */
  getRecommendedDifficulty(): 'easy' | 'medium' | 'hard' {
    const level = this.getCurrentLevel();
    return level.contentFocus.recommendedDifficulty;
  }

  /**
   * Check if content type is unlocked
   */
  isContentTypeUnlocked(type: 'words' | 'sentences' | 'stories'): boolean {
    const level = this.getCurrentLevel();
    return level.contentFocus.types.includes(type);
  }

  /**
   * Check if difficulty is unlocked
   */
  isDifficultyUnlocked(difficulty: 'easy' | 'medium' | 'hard'): boolean {
    const level = this.getCurrentLevel();
    return level.contentFocus.difficulty.includes(difficulty);
  }

  /**
   * Get progress percentage to next level
   */
  getProgressPercentage(metrics: {
    averageAccuracy: number;
    sessionsCompleted: number;
    totalWordsTyped: number;
    consistencyScore: number;
  }): number {
    const level = this.getCurrentLevel();
    const req = level.requirements;

    // Calculate progress for each requirement
    const accuracyProgress = Math.min((metrics.averageAccuracy / req.minAccuracy) * 100, 100);
    const sessionsProgress = Math.min((metrics.sessionsCompleted / req.minSessions) * 100, 100);
    const wordsProgress = Math.min((metrics.totalWordsTyped / req.minWordsTyped) * 100, 100);
    const consistencyProgress = Math.min((metrics.consistencyScore / req.minConsistency) * 100, 100);

    // Average all progress metrics
    const totalProgress = (accuracyProgress + sessionsProgress + wordsProgress + consistencyProgress) / 4;

    return Math.round(totalProgress);
  }

  /**
   * Reset progress (for testing or user request)
   */
  resetProgress(): void {
    this.currentProgress = {
      currentLevel: 1,
      experience: 0,
      experienceToNextLevel: 100,
      levelsCompleted: [],
      dateStartedCurrentLevel: Date.now(),
    };
    this.saveProgress();
    console.log('🔄 Progress reset to Level 1');
  }

  /**
   * Load progress from localStorage
   */
  private loadProgress(): UserProgress {
    try {
      const stored = localStorage.getItem(STORAGE_KEY_PROGRESS);
      if (stored) {
        const progress = JSON.parse(stored);
        console.log('📊 Loaded user progress:', progress);
        return progress;
      }
    } catch (error) {
      console.error('Failed to load progress:', error);
    }

    // Default progress for new users
    return {
      currentLevel: 1,
      experience: 0,
      experienceToNextLevel: 100,
      levelsCompleted: [],
      dateStartedCurrentLevel: Date.now(),
    };
  }

  /**
   * Save progress to localStorage
   */
  private saveProgress(): void {
    try {
      localStorage.setItem(STORAGE_KEY_PROGRESS, JSON.stringify(this.currentProgress));
    } catch (error) {
      console.error('Failed to save progress:', error);
    }
  }
}

export default LevelSystem;
