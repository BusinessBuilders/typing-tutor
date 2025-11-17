/**
 * Auto-Advance Hook
 * Step 126 - Automatic progression through typing exercises
 */

import { useState, useEffect, useCallback, useRef } from 'react';

export interface AutoAdvanceOptions {
  enabled?: boolean;
  delay?: number; // Delay before auto-advancing (ms)
  requireAccuracy?: number; // Minimum accuracy to auto-advance (0-100)
  onAdvance?: (toIndex: number) => void;
  onComplete?: () => void;
}

export interface AutoAdvanceState {
  currentIndex: number;
  isComplete: boolean;
  canAdvance: boolean;
  timeUntilAdvance: number | null;
}

export function useAutoAdvance(
  totalItems: number,
  options: AutoAdvanceOptions = {}
) {
  const {
    enabled = true,
    delay = 1000,
    requireAccuracy,
    onAdvance,
    onComplete,
  } = options;

  const [state, setState] = useState<AutoAdvanceState>({
    currentIndex: 0,
    isComplete: false,
    canAdvance: false,
    timeUntilAdvance: null,
  });

  const advanceTimer = useRef<NodeJS.Timeout | null>(null);

  // Clear timer on unmount
  useEffect(() => {
    return () => {
      if (advanceTimer.current) {
        clearTimeout(advanceTimer.current);
      }
    };
  }, []);

  // Check if can advance
  const checkCanAdvance = useCallback(
    (accuracy?: number): boolean => {
      if (!enabled) return false;
      if (state.currentIndex >= totalItems - 1) return false;

      if (requireAccuracy !== undefined && accuracy !== undefined) {
        return accuracy >= requireAccuracy;
      }

      return true;
    },
    [enabled, state.currentIndex, totalItems, requireAccuracy]
  );

  // Trigger auto-advance
  const triggerAdvance = useCallback(
    (accuracy?: number) => {
      if (!checkCanAdvance(accuracy)) return;

      setState((prev) => ({
        ...prev,
        canAdvance: true,
        timeUntilAdvance: delay,
      }));

      // Clear existing timer
      if (advanceTimer.current) {
        clearTimeout(advanceTimer.current);
      }

      // Set new timer
      advanceTimer.current = setTimeout(() => {
        setState((prev) => {
          const newIndex = prev.currentIndex + 1;
          const isComplete = newIndex >= totalItems;

          onAdvance?.(newIndex);

          if (isComplete) {
            onComplete?.();
          }

          return {
            currentIndex: newIndex,
            isComplete,
            canAdvance: false,
            timeUntilAdvance: null,
          };
        });
      }, delay);
    },
    [checkCanAdvance, delay, totalItems, onAdvance, onComplete]
  );

  // Cancel auto-advance
  const cancelAdvance = useCallback(() => {
    if (advanceTimer.current) {
      clearTimeout(advanceTimer.current);
      advanceTimer.current = null;
    }

    setState((prev) => ({
      ...prev,
      canAdvance: false,
      timeUntilAdvance: null,
    }));
  }, []);

  // Manual advance
  const advanceNow = useCallback(() => {
    cancelAdvance();

    setState((prev) => {
      const newIndex = Math.min(prev.currentIndex + 1, totalItems - 1);
      const isComplete = newIndex >= totalItems - 1;

      onAdvance?.(newIndex);

      if (isComplete) {
        onComplete?.();
      }

      return {
        ...prev,
        currentIndex: newIndex,
        isComplete,
        canAdvance: false,
        timeUntilAdvance: null,
      };
    });
  }, [cancelAdvance, totalItems, onAdvance, onComplete]);

  // Go to previous item
  const goBack = useCallback(() => {
    cancelAdvance();

    setState((prev) => ({
      ...prev,
      currentIndex: Math.max(prev.currentIndex - 1, 0),
      isComplete: false,
    }));
  }, [cancelAdvance]);

  // Jump to specific index
  const goToIndex = useCallback(
    (index: number) => {
      cancelAdvance();

      const clampedIndex = Math.max(0, Math.min(index, totalItems - 1));

      setState({
        currentIndex: clampedIndex,
        isComplete: clampedIndex >= totalItems - 1,
        canAdvance: false,
        timeUntilAdvance: null,
      });

      onAdvance?.(clampedIndex);
    },
    [cancelAdvance, totalItems, onAdvance]
  );

  // Reset to beginning
  const reset = useCallback(() => {
    cancelAdvance();

    setState({
      currentIndex: 0,
      isComplete: false,
      canAdvance: false,
      timeUntilAdvance: null,
    });
  }, [cancelAdvance]);

  return {
    state,
    triggerAdvance,
    cancelAdvance,
    advanceNow,
    goBack,
    goToIndex,
    reset,
    canGoBack: state.currentIndex > 0,
    canGoForward: state.currentIndex < totalItems - 1,
    progress: (state.currentIndex / totalItems) * 100,
  };
}

// Hook for sequential exercise progression with conditions
export function useConditionalAdvance(
  exercises: any[],
  conditions: {
    minAccuracy?: number;
    minWPM?: number;
    minTime?: number;
    maxErrors?: number;
  } = {}
) {
  const [currentExerciseIndex, setCurrentExerciseIndex] = useState(0);
  const [completedExercises, setCompletedExercises] = useState<number[]>([]);
  const [blockedExercises, setBlockedExercises] = useState<number[]>([]);

  const checkConditions = useCallback(
    (stats: {
      accuracy?: number;
      wpm?: number;
      time?: number;
      errors?: number;
    }): { passed: boolean; failedConditions: string[] } => {
      const failedConditions: string[] = [];

      if (
        conditions.minAccuracy !== undefined &&
        stats.accuracy !== undefined &&
        stats.accuracy < conditions.minAccuracy
      ) {
        failedConditions.push(`Accuracy must be at least ${conditions.minAccuracy}%`);
      }

      if (
        conditions.minWPM !== undefined &&
        stats.wpm !== undefined &&
        stats.wpm < conditions.minWPM
      ) {
        failedConditions.push(`Speed must be at least ${conditions.minWPM} WPM`);
      }

      if (
        conditions.minTime !== undefined &&
        stats.time !== undefined &&
        stats.time < conditions.minTime
      ) {
        failedConditions.push(`Must practice for at least ${conditions.minTime}ms`);
      }

      if (
        conditions.maxErrors !== undefined &&
        stats.errors !== undefined &&
        stats.errors > conditions.maxErrors
      ) {
        failedConditions.push(`Too many errors (max ${conditions.maxErrors})`);
      }

      return {
        passed: failedConditions.length === 0,
        failedConditions,
      };
    },
    [conditions]
  );

  const completeExercise = useCallback(
    (
      stats: {
        accuracy?: number;
        wpm?: number;
        time?: number;
        errors?: number;
      }
    ): { canAdvance: boolean; reason?: string } => {
      const { passed, failedConditions } = checkConditions(stats);

      if (passed) {
        setCompletedExercises((prev) => [...new Set([...prev, currentExerciseIndex])]);
        return { canAdvance: true };
      } else {
        setBlockedExercises((prev) => [...new Set([...prev, currentExerciseIndex])]);
        return {
          canAdvance: false,
          reason: failedConditions.join(', '),
        };
      }
    },
    [checkConditions, currentExerciseIndex]
  );

  const advanceToNext = useCallback(() => {
    const nextIndex = currentExerciseIndex + 1;
    if (nextIndex < exercises.length) {
      setCurrentExerciseIndex(nextIndex);
    }
  }, [currentExerciseIndex, exercises.length]);

  const reset = useCallback(() => {
    setCurrentExerciseIndex(0);
    setCompletedExercises([]);
    setBlockedExercises([]);
  }, []);

  return {
    currentExerciseIndex,
    currentExercise: exercises[currentExerciseIndex],
    completedExercises,
    blockedExercises,
    completeExercise,
    advanceToNext,
    reset,
    isComplete: currentExerciseIndex >= exercises.length - 1,
    completionPercentage: (completedExercises.length / exercises.length) * 100,
  };
}

// Auto-advance with countdown timer
export function useAutoAdvanceCountdown(
  onAdvance: () => void,
  countdownSeconds = 3
) {
  const [isCountingDown, setIsCountingDown] = useState(false);
  const [secondsRemaining, setSecondsRemaining] = useState(countdownSeconds);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  const startCountdown = useCallback(() => {
    setIsCountingDown(true);
    setSecondsRemaining(countdownSeconds);

    intervalRef.current = setInterval(() => {
      setSecondsRemaining((prev) => {
        if (prev <= 1) {
          setIsCountingDown(false);
          if (intervalRef.current) {
            clearInterval(intervalRef.current);
          }
          onAdvance();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  }, [countdownSeconds, onAdvance]);

  const cancelCountdown = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }
    setIsCountingDown(false);
    setSecondsRemaining(countdownSeconds);
  }, [countdownSeconds]);

  useEffect(() => {
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, []);

  return {
    isCountingDown,
    secondsRemaining,
    startCountdown,
    cancelCountdown,
  };
}
