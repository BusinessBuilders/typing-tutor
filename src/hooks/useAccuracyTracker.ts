/**
 * Accuracy Tracker Hook
 * Step 128 - Track typing accuracy in real-time
 */

import { useState, useCallback, useRef } from 'react';

export interface AccuracyData {
  totalAttempts: number;
  correctAttempts: number;
  incorrectAttempts: number;
  currentAccuracy: number;
  averageAccuracy: number;
  accuracyHistory: number[];
  errorPositions: number[];
  commonErrors: Map<string, number>; // character -> error count
}

export interface AccuracyTrackerOptions {
  trackHistory?: boolean;
  historyLimit?: number;
  trackCommonErrors?: boolean;
}

export function useAccuracyTracker(options: AccuracyTrackerOptions = {}) {
  const {
    trackHistory = true,
    historyLimit = 100,
    trackCommonErrors = true,
  } = options;

  const [accuracy, setAccuracy] = useState<AccuracyData>({
    totalAttempts: 0,
    correctAttempts: 0,
    incorrectAttempts: 0,
    currentAccuracy: 100,
    averageAccuracy: 100,
    accuracyHistory: [],
    errorPositions: [],
    commonErrors: new Map(),
  });

  const sessionData = useRef<{
    correctChars: number[];
    incorrectChars: number[];
  }>({
    correctChars: [],
    incorrectChars: [],
  });

  // Record correct character
  const recordCorrect = useCallback((position: number) => {
    sessionData.current.correctChars.push(position);

    setAccuracy((prev) => {
      const totalAttempts = prev.totalAttempts + 1;
      const correctAttempts = prev.correctAttempts + 1;
      const currentAccuracy = (correctAttempts / totalAttempts) * 100;

      let accuracyHistory = prev.accuracyHistory;
      if (trackHistory) {
        accuracyHistory = [...accuracyHistory, currentAccuracy].slice(-historyLimit);
      }

      const averageAccuracy =
        accuracyHistory.length > 0
          ? accuracyHistory.reduce((sum, val) => sum + val, 0) / accuracyHistory.length
          : currentAccuracy;

      return {
        ...prev,
        totalAttempts,
        correctAttempts,
        currentAccuracy,
        averageAccuracy,
        accuracyHistory,
      };
    });
  }, [trackHistory, historyLimit]);

  // Record incorrect character
  const recordIncorrect = useCallback(
    (position: number, expectedChar: string, receivedChar: string) => {
      sessionData.current.incorrectChars.push(position);

      setAccuracy((prev) => {
        const totalAttempts = prev.totalAttempts + 1;
        const incorrectAttempts = prev.incorrectAttempts + 1;
        const currentAccuracy = (prev.correctAttempts / totalAttempts) * 100;

        let accuracyHistory = prev.accuracyHistory;
        if (trackHistory) {
          accuracyHistory = [...accuracyHistory, currentAccuracy].slice(-historyLimit);
        }

        const averageAccuracy =
          accuracyHistory.length > 0
            ? accuracyHistory.reduce((sum, val) => sum + val, 0) / accuracyHistory.length
            : currentAccuracy;

        const errorPositions = [...prev.errorPositions, position];

        const commonErrors = new Map(prev.commonErrors);
        if (trackCommonErrors) {
          const errorKey = `${expectedChar}→${receivedChar}`;
          commonErrors.set(errorKey, (commonErrors.get(errorKey) || 0) + 1);
        }

        return {
          ...prev,
          totalAttempts,
          incorrectAttempts,
          currentAccuracy,
          averageAccuracy,
          accuracyHistory,
          errorPositions,
          commonErrors,
        };
      });
    },
    [trackHistory, historyLimit, trackCommonErrors]
  );

  // Get accuracy for specific position range
  const getAccuracyForRange = useCallback(
    (startPos: number, endPos: number): number => {
      const correctInRange = sessionData.current.correctChars.filter(
        (pos) => pos >= startPos && pos <= endPos
      ).length;

      const incorrectInRange = sessionData.current.incorrectChars.filter(
        (pos) => pos >= startPos && pos <= endPos
      ).length;

      const totalInRange = correctInRange + incorrectInRange;

      if (totalInRange === 0) return 100;

      return (correctInRange / totalInRange) * 100;
    },
    []
  );

  // Get most common errors
  const getMostCommonErrors = useCallback((limit = 5) => {
    return Array.from(accuracy.commonErrors.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, limit)
      .map(([error, count]) => {
        const [expected, received] = error.split('→');
        return { expected, received, count };
      });
  }, [accuracy.commonErrors]);

  // Calculate accuracy trend
  const getAccuracyTrend = useCallback((): 'improving' | 'declining' | 'stable' => {
    if (accuracy.accuracyHistory.length < 10) return 'stable';

    const recentHistory = accuracy.accuracyHistory.slice(-10);
    const firstHalf = recentHistory.slice(0, 5);
    const secondHalf = recentHistory.slice(5);

    const firstAvg = firstHalf.reduce((sum, val) => sum + val, 0) / firstHalf.length;
    const secondAvg = secondHalf.reduce((sum, val) => sum + val, 0) / secondHalf.length;

    const diff = secondAvg - firstAvg;

    if (diff > 2) return 'improving';
    if (diff < -2) return 'declining';
    return 'stable';
  }, [accuracy.accuracyHistory]);

  // Reset tracker
  const reset = useCallback(() => {
    sessionData.current = {
      correctChars: [],
      incorrectChars: [],
    };

    setAccuracy({
      totalAttempts: 0,
      correctAttempts: 0,
      incorrectAttempts: 0,
      currentAccuracy: 100,
      averageAccuracy: 100,
      accuracyHistory: [],
      errorPositions: [],
      commonErrors: new Map(),
    });
  }, []);

  return {
    accuracy,
    recordCorrect,
    recordIncorrect,
    getAccuracyForRange,
    getMostCommonErrors,
    getAccuracyTrend,
    reset,
  };
}

// Hook for character-level accuracy tracking
export function useCharacterAccuracy() {
  const [characterAccuracy, setCharacterAccuracy] = useState<
    Map<string, { correct: number; incorrect: number }>
  >(new Map());

  const recordCharacter = useCallback((char: string, isCorrect: boolean) => {
    setCharacterAccuracy((prev) => {
      const newMap = new Map(prev);
      const stats = newMap.get(char) || { correct: 0, incorrect: 0 };

      if (isCorrect) {
        stats.correct++;
      } else {
        stats.incorrect++;
      }

      newMap.set(char, stats);
      return newMap;
    });
  }, []);

  const getCharacterAccuracy = useCallback(
    (char: string): number => {
      const stats = characterAccuracy.get(char);
      if (!stats) return 100;

      const total = stats.correct + stats.incorrect;
      if (total === 0) return 100;

      return (stats.correct / total) * 100;
    },
    [characterAccuracy]
  );

  const getWeakestCharacters = useCallback((limit = 5) => {
    return Array.from(characterAccuracy.entries())
      .map(([char, stats]) => {
        const total = stats.correct + stats.incorrect;
        const accuracy = total > 0 ? (stats.correct / total) * 100 : 100;
        return { char, accuracy, total };
      })
      .filter((item) => item.total >= 5) // Only consider chars typed at least 5 times
      .sort((a, b) => a.accuracy - b.accuracy)
      .slice(0, limit);
  }, [characterAccuracy]);

  const reset = useCallback(() => {
    setCharacterAccuracy(new Map());
  }, []);

  return {
    characterAccuracy,
    recordCharacter,
    getCharacterAccuracy,
    getWeakestCharacters,
    reset,
  };
}

// Hook for accuracy-based adaptive difficulty
export function useAdaptiveDifficulty(initialDifficulty: 'easy' | 'medium' | 'hard' = 'medium') {
  const [difficulty, setDifficulty] = useState(initialDifficulty);
  const [sessionAccuracies, setSessionAccuracies] = useState<number[]>([]);

  const updateDifficulty = useCallback((accuracy: number) => {
    setSessionAccuracies((prev) => [...prev, accuracy]);

    // Adjust difficulty based on recent accuracy
    const recentAccuracies = [...sessionAccuracies, accuracy].slice(-5);
    const avgAccuracy =
      recentAccuracies.reduce((sum, val) => sum + val, 0) / recentAccuracies.length;

    if (recentAccuracies.length >= 5) {
      if (avgAccuracy >= 95 && difficulty !== 'hard') {
        setDifficulty('hard');
      } else if (avgAccuracy >= 85 && avgAccuracy < 95 && difficulty !== 'medium') {
        setDifficulty('medium');
      } else if (avgAccuracy < 85 && difficulty !== 'easy') {
        setDifficulty('easy');
      }
    }
  }, [difficulty, sessionAccuracies]);

  const reset = useCallback(() => {
    setDifficulty(initialDifficulty);
    setSessionAccuracies([]);
  }, [initialDifficulty]);

  return {
    difficulty,
    updateDifficulty,
    reset,
  };
}
