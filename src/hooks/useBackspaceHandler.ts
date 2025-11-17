/**
 * Backspace Handler Hook
 * Step 125 - Advanced backspace logic with undo/redo support
 */

import { useState, useCallback, useRef } from 'react';

export interface BackspaceState {
  canBackspace: boolean;
  backspaceCount: number;
  lastBackspaceTime: number | null;
}

export interface BackspaceOptions {
  enabled?: boolean;
  maxBackspaces?: number; // Limit backspaces per session
  backspaceDelay?: number; // Minimum time between backspaces (ms)
  allowBackspaceAfterError?: boolean;
  onBackspace?: (position: number) => void;
  onBackspaceLimitReached?: () => void;
}

export interface HistoryEntry {
  position: number;
  character: string;
  timestamp: number;
  isCorrect: boolean;
}

export function useBackspaceHandler(options: BackspaceOptions = {}) {
  const {
    enabled = true,
    maxBackspaces,
    backspaceDelay = 0,
    allowBackspaceAfterError = true,
    onBackspace,
    onBackspaceLimitReached,
  } = options;

  const [state, setState] = useState<BackspaceState>({
    canBackspace: enabled,
    backspaceCount: 0,
    lastBackspaceTime: null,
  });

  const history = useRef<HistoryEntry[]>([]);

  // Check if backspace is allowed
  const canBackspace = useCallback((): boolean => {
    if (!enabled) return false;

    // Check backspace limit
    if (maxBackspaces && state.backspaceCount >= maxBackspaces) {
      onBackspaceLimitReached?.();
      return false;
    }

    // Check backspace delay
    if (backspaceDelay && state.lastBackspaceTime) {
      const timeSinceLastBackspace = Date.now() - state.lastBackspaceTime;
      if (timeSinceLastBackspace < backspaceDelay) {
        return false;
      }
    }

    return true;
  }, [
    enabled,
    maxBackspaces,
    backspaceDelay,
    state.backspaceCount,
    state.lastBackspaceTime,
    onBackspaceLimitReached,
  ]);

  // Execute backspace
  const executeBackspace = useCallback(
    (currentPosition: number): boolean => {
      if (currentPosition === 0) return false;
      if (!canBackspace()) return false;

      // Check if last entry was an error (if allowBackspaceAfterError is false)
      if (!allowBackspaceAfterError && history.current.length > 0) {
        const lastEntry = history.current[history.current.length - 1];
        if (!lastEntry.isCorrect) {
          return false;
        }
      }

      setState((prev) => ({
        ...prev,
        backspaceCount: prev.backspaceCount + 1,
        lastBackspaceTime: Date.now(),
      }));

      // Remove from history
      history.current.pop();

      onBackspace?.(currentPosition - 1);
      return true;
    },
    [canBackspace, allowBackspaceAfterError, onBackspace]
  );

  // Add entry to history
  const addToHistory = useCallback(
    (character: string, position: number, isCorrect: boolean) => {
      history.current.push({
        position,
        character,
        timestamp: Date.now(),
        isCorrect,
      });
    },
    []
  );

  // Clear history
  const clearHistory = useCallback(() => {
    history.current = [];
    setState({
      canBackspace: enabled,
      backspaceCount: 0,
      lastBackspaceTime: null,
    });
  }, [enabled]);

  // Get statistics
  const getStats = useCallback(() => {
    return {
      totalBackspaces: state.backspaceCount,
      remainingBackspaces: maxBackspaces
        ? maxBackspaces - state.backspaceCount
        : Infinity,
      historyLength: history.current.length,
    };
  }, [state.backspaceCount, maxBackspaces]);

  return {
    state,
    canBackspace: canBackspace(),
    executeBackspace,
    addToHistory,
    clearHistory,
    getStats,
    history: history.current,
  };
}

// Hook for backspace animation/feedback
export function useBackspaceAnimation() {
  const [isAnimating, setIsAnimating] = useState(false);
  const [direction, setDirection] = useState<'left' | 'right'>('left');

  const triggerAnimation = useCallback((dir: 'left' | 'right' = 'left') => {
    setDirection(dir);
    setIsAnimating(true);

    setTimeout(() => {
      setIsAnimating(false);
    }, 300);
  }, []);

  return {
    isAnimating,
    direction,
    triggerAnimation,
  };
}

// Hook for undo/redo functionality
export function useUndoRedo<T>(initialState: T) {
  const [state, setState] = useState<T>(initialState);
  const [history, setHistory] = useState<T[]>([initialState]);
  const [currentIndex, setCurrentIndex] = useState(0);

  const canUndo = currentIndex > 0;
  const canRedo = currentIndex < history.length - 1;

  const updateState = useCallback((newState: T) => {
    setState(newState);
    setHistory((prev) => [...prev.slice(0, currentIndex + 1), newState]);
    setCurrentIndex((prev) => prev + 1);
  }, [currentIndex]);

  const undo = useCallback(() => {
    if (!canUndo) return;

    setCurrentIndex((prev) => prev - 1);
    setState(history[currentIndex - 1]);
  }, [canUndo, history, currentIndex]);

  const redo = useCallback(() => {
    if (!canRedo) return;

    setCurrentIndex((prev) => prev + 1);
    setState(history[currentIndex + 1]);
  }, [canRedo, history, currentIndex]);

  const reset = useCallback(() => {
    setState(initialState);
    setHistory([initialState]);
    setCurrentIndex(0);
  }, [initialState]);

  return {
    state,
    setState: updateState,
    undo,
    redo,
    canUndo,
    canRedo,
    reset,
    historyLength: history.length,
  };
}

// Backspace gesture detector (for touch devices)
export function useBackspaceGesture(
  onBackspace: () => void,
  options: {
    minSwipeDistance?: number;
    maxSwipeTime?: number;
  } = {}
) {
  const { minSwipeDistance = 50, maxSwipeTime = 300 } = options;

  const [touchStart, setTouchStart] = useState<{
    x: number;
    y: number;
    time: number;
  } | null>(null);

  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    const touch = e.touches[0];
    setTouchStart({
      x: touch.clientX,
      y: touch.clientY,
      time: Date.now(),
    });
  }, []);

  const handleTouchEnd = useCallback(
    (e: React.TouchEvent) => {
      if (!touchStart) return;

      const touch = e.changedTouches[0];
      const deltaX = touchStart.x - touch.clientX;
      const deltaY = Math.abs(touch.clientY - touchStart.y);
      const deltaTime = Date.now() - touchStart.time;

      // Swipe left to backspace
      if (
        deltaX > minSwipeDistance &&
        deltaY < 30 &&
        deltaTime < maxSwipeTime
      ) {
        onBackspace();
      }

      setTouchStart(null);
    },
    [touchStart, minSwipeDistance, maxSwipeTime, onBackspace]
  );

  return {
    handleTouchStart,
    handleTouchEnd,
  };
}

// Backspace rate limiter (prevent accidental rapid backspacing)
export function useBackspaceRateLimit(
  callback: () => void,
  options: {
    minInterval?: number; // Minimum time between backspaces (ms)
    maxBurst?: number; // Maximum backspaces in burst period
    burstWindow?: number; // Burst period window (ms)
  } = {}
) {
  const { minInterval = 100, maxBurst = 5, burstWindow = 1000 } = options;

  const lastBackspace = useRef<number>(0);
  const burstCount = useRef<number>(0);
  const burstStartTime = useRef<number>(0);

  const executeBackspace = useCallback(() => {
    const now = Date.now();

    // Check minimum interval
    if (now - lastBackspace.current < minInterval) {
      return false;
    }

    // Check burst limit
    if (now - burstStartTime.current > burstWindow) {
      // Reset burst counter
      burstCount.current = 0;
      burstStartTime.current = now;
    }

    if (burstCount.current >= maxBurst) {
      return false;
    }

    // Execute backspace
    lastBackspace.current = now;
    burstCount.current++;
    callback();
    return true;
  }, [callback, minInterval, maxBurst, burstWindow]);

  return executeBackspace;
}
