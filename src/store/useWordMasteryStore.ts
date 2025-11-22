/**
 * Word Mastery Tracking Store
 * Tracks which words the child knows vs needs more practice
 * Uses spaced repetition principles for optimal learning
 */

import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export type MasteryLevel = 'new' | 'learning' | 'reviewing' | 'mastered';

export interface WordMastery {
  word: string;
  category: string;
  correctCount: number; // Times gotten correct
  wrongCount: number; // Times gotten wrong
  totalSeen: number; // Total times shown
  lastSeen: number; // Timestamp
  masteryLevel: MasteryLevel;
  comprehensionCorrect: number; // Comprehension questions correct
  comprehensionWrong: number; // Comprehension questions wrong
}

interface WordMasteryStore {
  words: Record<string, WordMastery>; // word -> mastery data

  // Record typing result
  recordTypingResult: (word: string, category: string, correct: boolean) => void;

  // Record comprehension result
  recordComprehensionResult: (word: string, correct: boolean) => void;

  // Get mastery status for a word
  getWordMastery: (word: string) => WordMastery | null;

  // Get words that need practice (got wrong or new)
  getWordsNeedingPractice: () => string[];

  // Get mastered words
  getMasteredWords: () => string[];

  // Get learning words (in progress)
  getLearningWords: () => string[];

  // Calculate mastery level based on performance
  updateMasteryLevel: (word: string) => void;

  // Get statistics
  getStats: () => {
    total: number;
    new: number;
    learning: number;
    reviewing: number;
    mastered: number;
  };
}

export const useWordMasteryStore = create<WordMasteryStore>()(
  persist(
    (set, get) => ({
      words: {},

      recordTypingResult: (word: string, category: string, correct: boolean) => {
        set((state) => {
          const existing = state.words[word] || {
            word,
            category,
            correctCount: 0,
            wrongCount: 0,
            totalSeen: 0,
            lastSeen: 0,
            masteryLevel: 'new' as MasteryLevel,
            comprehensionCorrect: 0,
            comprehensionWrong: 0,
          };

          const updated: WordMastery = {
            ...existing,
            totalSeen: existing.totalSeen + 1,
            correctCount: correct ? existing.correctCount + 1 : existing.correctCount,
            wrongCount: correct ? existing.wrongCount : existing.wrongCount + 1,
            lastSeen: Date.now(),
          };

          const newWords = {
            ...state.words,
            [word]: updated,
          };

          return { words: newWords };
        });

        // Update mastery level after recording
        get().updateMasteryLevel(word);

        console.log('📝 Recorded typing result:', {
          word,
          correct,
          mastery: get().words[word],
        });
      },

      recordComprehensionResult: (word: string, correct: boolean) => {
        set((state) => {
          const existing = state.words[word];
          if (!existing) return state; // Word not tracked yet

          const updated: WordMastery = {
            ...existing,
            comprehensionCorrect: correct
              ? existing.comprehensionCorrect + 1
              : existing.comprehensionCorrect,
            comprehensionWrong: correct
              ? existing.comprehensionWrong
              : existing.comprehensionWrong + 1,
          };

          return {
            words: {
              ...state.words,
              [word]: updated,
            },
          };
        });

        // Update mastery level after recording
        get().updateMasteryLevel(word);

        console.log('🤔 Recorded comprehension result:', {
          word,
          correct,
          mastery: get().words[word],
        });
      },

      updateMasteryLevel: (word: string) => {
        set((state) => {
          const mastery = state.words[word];
          if (!mastery) return state;

          let newLevel: MasteryLevel = 'new';

          // Calculate success rate
          const typingSuccessRate =
            mastery.totalSeen > 0
              ? mastery.correctCount / mastery.totalSeen
              : 0;
          const comprehensionTotal =
            mastery.comprehensionCorrect + mastery.comprehensionWrong;
          const comprehensionSuccessRate =
            comprehensionTotal > 0
              ? mastery.comprehensionCorrect / comprehensionTotal
              : 0;

          // Mastery criteria
          if (mastery.totalSeen === 0) {
            newLevel = 'new';
          } else if (
            mastery.correctCount >= 3 &&
            typingSuccessRate >= 0.8 &&
            mastery.comprehensionCorrect >= 2 &&
            comprehensionSuccessRate >= 0.7
          ) {
            // Mastered: 3+ correct typings with 80%+ accuracy AND 2+ comprehension correct with 70%+
            newLevel = 'mastered';
          } else if (
            mastery.correctCount >= 2 &&
            typingSuccessRate >= 0.6
          ) {
            // Reviewing: 2+ correct with 60%+ accuracy
            newLevel = 'reviewing';
          } else {
            // Learning: still practicing
            newLevel = 'learning';
          }

          return {
            words: {
              ...state.words,
              [word]: {
                ...mastery,
                masteryLevel: newLevel,
              },
            },
          };
        });
      },

      getWordMastery: (word: string) => {
        return get().words[word] || null;
      },

      getWordsNeedingPractice: () => {
        const words = get().words;
        return Object.values(words)
          .filter((w) => w.masteryLevel === 'learning' || w.wrongCount > 0)
          .sort((a, b) => b.wrongCount - a.wrongCount) // Prioritize most wrong
          .map((w) => w.word);
      },

      getMasteredWords: () => {
        const words = get().words;
        return Object.values(words)
          .filter((w) => w.masteryLevel === 'mastered')
          .map((w) => w.word);
      },

      getLearningWords: () => {
        const words = get().words;
        return Object.values(words)
          .filter((w) => w.masteryLevel === 'learning' || w.masteryLevel === 'reviewing')
          .map((w) => w.word);
      },

      getStats: () => {
        const words = Object.values(get().words);
        return {
          total: words.length,
          new: words.filter((w) => w.masteryLevel === 'new').length,
          learning: words.filter((w) => w.masteryLevel === 'learning').length,
          reviewing: words.filter((w) => w.masteryLevel === 'reviewing').length,
          mastered: words.filter((w) => w.masteryLevel === 'mastered').length,
        };
      },
    }),
    {
      name: 'word-mastery-storage',
    }
  )
);
