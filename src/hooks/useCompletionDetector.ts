/**
 * Completion Detector Hook
 * Step 130 - Detect when typing exercises are completed
 */

import { useState, useCallback, useEffect, useRef } from 'react';

export interface CompletionCriteria {
  requireFullText?: boolean; // Must type entire text
  minAccuracy?: number; // Minimum accuracy percentage
  minWPM?: number; // Minimum words per minute
  maxErrors?: number; // Maximum allowed errors
  minTime?: number; // Minimum time spent (ms)
  maxTime?: number; // Maximum time allowed (ms)
}

export interface CompletionState {
  isComplete: boolean;
  metCriteria: string[];
  unmetCriteria: string[];
  completionPercentage: number;
  completionTime: number | null;
}

export interface CompletionStats {
  finalAccuracy: number;
  finalWPM: number;
  totalErrors: number;
  timeElapsed: number;
  charactersTyped: number;
}

export function useCompletionDetector(
  criteria: CompletionCriteria = {},
  onComplete?: (stats: CompletionStats) => void
) {
  const [state, setState] = useState<CompletionState>({
    isComplete: false,
    metCriteria: [],
    unmetCriteria: [],
    completionPercentage: 0,
    completionTime: null,
  });

  const [stats, setStats] = useState<CompletionStats>({
    finalAccuracy: 0,
    finalWPM: 0,
    totalErrors: 0,
    timeElapsed: 0,
    charactersTyped: 0,
  });

  const hasTriggeredCompletion = useRef(false);

  // Check completion criteria
  const checkCompletion = useCallback(
    (currentStats: Partial<CompletionStats>): CompletionState => {
      const {
        requireFullText = true,
        minAccuracy,
        minWPM,
        maxErrors,
        minTime,
        maxTime,
      } = criteria;

      const metCriteria: string[] = [];
      const unmetCriteria: string[] = [];

      // Check full text requirement
      if (requireFullText) {
        if (currentStats.charactersTyped !== undefined && currentStats.charactersTyped > 0) {
          metCriteria.push('full-text');
        } else {
          unmetCriteria.push('full-text');
        }
      }

      // Check accuracy
      if (minAccuracy !== undefined) {
        if (
          currentStats.finalAccuracy !== undefined &&
          currentStats.finalAccuracy >= minAccuracy
        ) {
          metCriteria.push('accuracy');
        } else {
          unmetCriteria.push(`accuracy (min ${minAccuracy}%)`);
        }
      }

      // Check WPM
      if (minWPM !== undefined) {
        if (currentStats.finalWPM !== undefined && currentStats.finalWPM >= minWPM) {
          metCriteria.push('wpm');
        } else {
          unmetCriteria.push(`wpm (min ${minWPM})`);
        }
      }

      // Check errors
      if (maxErrors !== undefined) {
        if (
          currentStats.totalErrors !== undefined &&
          currentStats.totalErrors <= maxErrors
        ) {
          metCriteria.push('errors');
        } else {
          unmetCriteria.push(`errors (max ${maxErrors})`);
        }
      }

      // Check min time
      if (minTime !== undefined) {
        if (
          currentStats.timeElapsed !== undefined &&
          currentStats.timeElapsed >= minTime
        ) {
          metCriteria.push('min-time');
        } else {
          unmetCriteria.push(`min-time (${minTime}ms)`);
        }
      }

      // Check max time
      if (maxTime !== undefined) {
        if (
          currentStats.timeElapsed !== undefined &&
          currentStats.timeElapsed <= maxTime
        ) {
          metCriteria.push('max-time');
        } else {
          unmetCriteria.push(`max-time (${maxTime}ms)`);
        }
      }

      const totalCriteria = metCriteria.length + unmetCriteria.length;
      const completionPercentage =
        totalCriteria > 0 ? (metCriteria.length / totalCriteria) * 100 : 0;

      const isComplete = unmetCriteria.length === 0;

      return {
        isComplete,
        metCriteria,
        unmetCriteria,
        completionPercentage,
        completionTime: isComplete ? Date.now() : null,
      };
    },
    [criteria]
  );

  // Update stats and check completion
  const updateStats = useCallback(
    (newStats: Partial<CompletionStats>) => {
      const updatedStats = { ...stats, ...newStats };
      setStats(updatedStats as CompletionStats);

      const completionState = checkCompletion(updatedStats);
      setState(completionState);

      // Trigger completion callback once
      if (completionState.isComplete && !hasTriggeredCompletion.current) {
        hasTriggeredCompletion.current = true;
        onComplete?.(updatedStats as CompletionStats);
      }
    },
    [stats, checkCompletion, onComplete]
  );

  // Reset completion detector
  const reset = useCallback(() => {
    setState({
      isComplete: false,
      metCriteria: [],
      unmetCriteria: [],
      completionPercentage: 0,
      completionTime: null,
    });

    setStats({
      finalAccuracy: 0,
      finalWPM: 0,
      totalErrors: 0,
      timeElapsed: 0,
      charactersTyped: 0,
    });

    hasTriggeredCompletion.current = false;
  }, []);

  return {
    state,
    stats,
    updateStats,
    reset,
    isComplete: state.isComplete,
  };
}

// Hook for simple completion detection (just checks if text is fully typed)
export function useSimpleCompletion(
  totalCharacters: number,
  onComplete?: () => void
) {
  const [currentPosition, setCurrentPosition] = useState(0);
  const [isComplete, setIsComplete] = useState(false);
  const hasCompleted = useRef(false);

  const updatePosition = useCallback(
    (position: number) => {
      setCurrentPosition(position);

      if (position >= totalCharacters && !hasCompleted.current) {
        setIsComplete(true);
        hasCompleted.current = true;
        onComplete?.();
      }
    },
    [totalCharacters, onComplete]
  );

  const reset = useCallback(() => {
    setCurrentPosition(0);
    setIsComplete(false);
    hasCompleted.current = false;
  }, []);

  return {
    currentPosition,
    isComplete,
    progress: (currentPosition / totalCharacters) * 100,
    updatePosition,
    reset,
  };
}

// Hook for multi-exercise completion tracking
export function useExerciseSetCompletion(
  exercises: any[],
  _criteria: CompletionCriteria = {}
) {
  const [completedExercises, setCompletedExercises] = useState<Set<number>>(new Set());
  const [currentExerciseIndex, setCurrentExerciseIndex] = useState(0);
  const [setComplete, setSetComplete] = useState(false);

  const completeCurrentExercise = useCallback(
    (_stats: CompletionStats) => {
      setCompletedExercises((prev) => new Set([...prev, currentExerciseIndex]));

      // Check if all exercises are complete
      if (completedExercises.size + 1 >= exercises.length) {
        setSetComplete(true);
      }
    },
    [currentExerciseIndex, completedExercises.size, exercises.length]
  );

  const advanceToNext = useCallback(() => {
    if (currentExerciseIndex < exercises.length - 1) {
      setCurrentExerciseIndex((prev) => prev + 1);
    }
  }, [currentExerciseIndex, exercises.length]);

  const goToExercise = useCallback((index: number) => {
    if (index >= 0 && index < exercises.length) {
      setCurrentExerciseIndex(index);
    }
  }, [exercises.length]);

  const reset = useCallback(() => {
    setCompletedExercises(new Set());
    setCurrentExerciseIndex(0);
    setSetComplete(false);
  }, []);

  return {
    currentExerciseIndex,
    currentExercise: exercises[currentExerciseIndex],
    completedExercises,
    completedCount: completedExercises.size,
    totalExercises: exercises.length,
    completionPercentage: (completedExercises.size / exercises.length) * 100,
    isSetComplete: setComplete,
    completeCurrentExercise,
    advanceToNext,
    goToExercise,
    reset,
  };
}

// Hook for time-based completion (e.g., practice for 5 minutes)
export function useTimedCompletion(
  durationMs: number,
  onComplete?: () => void,
  onTick?: (remainingMs: number) => void
) {
  const [isActive, setIsActive] = useState(false);
  const [elapsedMs, setElapsedMs] = useState(0);
  const [isComplete, setIsComplete] = useState(false);
  const startTimeRef = useRef<number | null>(null);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  const start = useCallback(() => {
    setIsActive(true);
    setIsComplete(false);
    startTimeRef.current = Date.now() - elapsedMs;

    timerRef.current = setInterval(() => {
      if (startTimeRef.current) {
        const elapsed = Date.now() - startTimeRef.current;
        setElapsedMs(elapsed);

        const remaining = Math.max(0, durationMs - elapsed);
        onTick?.(remaining);

        if (elapsed >= durationMs) {
          setIsComplete(true);
          setIsActive(false);
          onComplete?.();

          if (timerRef.current) {
            clearInterval(timerRef.current);
          }
        }
      }
    }, 100); // Update every 100ms
  }, [elapsedMs, durationMs, onComplete, onTick]);

  const pause = useCallback(() => {
    setIsActive(false);
    if (timerRef.current) {
      clearInterval(timerRef.current);
    }
  }, []);

  const resume = useCallback(() => {
    if (!isComplete) {
      start();
    }
  }, [isComplete, start]);

  const reset = useCallback(() => {
    setIsActive(false);
    setElapsedMs(0);
    setIsComplete(false);
    startTimeRef.current = null;

    if (timerRef.current) {
      clearInterval(timerRef.current);
    }
  }, []);

  useEffect(() => {
    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, []);

  return {
    isActive,
    isComplete,
    elapsedMs,
    remainingMs: Math.max(0, durationMs - elapsedMs),
    percentage: (elapsedMs / durationMs) * 100,
    start,
    pause,
    resume,
    reset,
  };
}
