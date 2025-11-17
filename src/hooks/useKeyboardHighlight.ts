/**
 * Keyboard Highlighting Hook
 * Step 112 - Next-letter highlighting for guided typing
 */

import { useState, useEffect, useCallback } from 'react';

export interface HighlightState {
  nextKey: string | null;
  correctKeys: string[];
  incorrectKeys: string[];
  pressedKey: string | null;
}

export interface UseKeyboardHighlightOptions {
  targetText: string;
  currentPosition: number;
  onCorrectKey?: (key: string) => void;
  onIncorrectKey?: (key: string, expected: string) => void;
  caseSensitive?: boolean;
}

/**
 * Hook to manage keyboard highlighting state for typing practice
 */
export function useKeyboardHighlight({
  targetText,
  currentPosition,
  onCorrectKey,
  onIncorrectKey,
  caseSensitive = false,
}: UseKeyboardHighlightOptions) {
  const [highlightState, setHighlightState] = useState<HighlightState>({
    nextKey: null,
    correctKeys: [],
    incorrectKeys: [],
    pressedKey: null,
  });

  // Update next key to highlight
  useEffect(() => {
    if (currentPosition < targetText.length) {
      const nextChar = targetText[currentPosition];
      const nextKey = caseSensitive ? nextChar : nextChar.toLowerCase();
      setHighlightState((prev) => ({
        ...prev,
        nextKey,
      }));
    } else {
      setHighlightState((prev) => ({
        ...prev,
        nextKey: null,
      }));
    }
  }, [currentPosition, targetText, caseSensitive]);

  // Handle key press
  const handleKeyPress = useCallback(
    (key: string) => {
      const expectedKey = highlightState.nextKey;
      if (!expectedKey) return;

      const normalizedKey = caseSensitive ? key : key.toLowerCase();
      const isCorrect = normalizedKey === expectedKey;

      // Set pressed key with visual feedback
      setHighlightState((prev) => ({
        ...prev,
        pressedKey: key,
      }));

      // Clear pressed state after short delay
      setTimeout(() => {
        setHighlightState((prev) => ({
          ...prev,
          pressedKey: null,
        }));
      }, 200);

      if (isCorrect) {
        setHighlightState((prev) => ({
          ...prev,
          correctKeys: [...prev.correctKeys, key],
          incorrectKeys: prev.incorrectKeys.filter((k) => k !== key),
        }));
        onCorrectKey?.(key);
      } else {
        setHighlightState((prev) => ({
          ...prev,
          incorrectKeys: [...prev.incorrectKeys, key],
        }));
        onIncorrectKey?.(key, expectedKey);
      }
    },
    [highlightState.nextKey, caseSensitive, onCorrectKey, onIncorrectKey]
  );

  // Reset highlight state
  const reset = useCallback(() => {
    setHighlightState({
      nextKey: null,
      correctKeys: [],
      incorrectKeys: [],
      pressedKey: null,
    });
  }, []);

  return {
    highlightState,
    handleKeyPress,
    reset,
  };
}

/**
 * Hook for multi-key highlighting (e.g., word practice)
 */
export function useMultiKeyHighlight(targetKeys: string[]) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [highlightedKey, setHighlightedKey] = useState<string | null>(
    targetKeys[0] || null
  );

  useEffect(() => {
    if (currentIndex < targetKeys.length) {
      setHighlightedKey(targetKeys[currentIndex]);
    } else {
      setHighlightedKey(null);
    }
  }, [currentIndex, targetKeys]);

  const advance = useCallback(() => {
    setCurrentIndex((prev) => Math.min(prev + 1, targetKeys.length));
  }, [targetKeys.length]);

  const reset = useCallback(() => {
    setCurrentIndex(0);
    setHighlightedKey(targetKeys[0] || null);
  }, [targetKeys]);

  return {
    highlightedKey,
    currentIndex,
    isComplete: currentIndex >= targetKeys.length,
    advance,
    reset,
  };
}

/**
 * Hook for keyboard zone highlighting (left hand, right hand, home row)
 */
export function useKeyboardZoneHighlight() {
  type Zone = 'left' | 'right' | 'home' | 'top' | 'bottom' | null;

  const [activeZone, setActiveZone] = useState<Zone>(null);

  const keyZones: Record<string, Zone> = {
    // Left hand
    q: 'left',
    w: 'left',
    e: 'left',
    r: 'left',
    t: 'left',
    a: 'left',
    s: 'left',
    d: 'left',
    f: 'left',
    g: 'left',
    z: 'left',
    x: 'left',
    c: 'left',
    v: 'left',
    b: 'left',
    // Right hand
    y: 'right',
    u: 'right',
    i: 'right',
    o: 'right',
    p: 'right',
    h: 'right',
    j: 'right',
    k: 'right',
    l: 'right',
    n: 'right',
    m: 'right',
  };

  const homeRowKeys = ['a', 's', 'd', 'f', 'j', 'k', 'l', ';'];
  const topRowKeys = ['q', 'w', 'e', 'r', 't', 'y', 'u', 'i', 'o', 'p'];
  const bottomRowKeys = ['z', 'x', 'c', 'v', 'b', 'n', 'm'];

  const highlightZone = useCallback((key: string) => {
    const lowerKey = key.toLowerCase();

    if (homeRowKeys.includes(lowerKey)) {
      setActiveZone('home');
    } else if (topRowKeys.includes(lowerKey)) {
      setActiveZone('top');
    } else if (bottomRowKeys.includes(lowerKey)) {
      setActiveZone('bottom');
    } else {
      setActiveZone(keyZones[lowerKey] || null);
    }
  }, []);

  const clearZone = useCallback(() => {
    setActiveZone(null);
  }, []);

  const isKeyInZone = useCallback(
    (key: string, zone: Zone): boolean => {
      const lowerKey = key.toLowerCase();

      switch (zone) {
        case 'home':
          return homeRowKeys.includes(lowerKey);
        case 'top':
          return topRowKeys.includes(lowerKey);
        case 'bottom':
          return bottomRowKeys.includes(lowerKey);
        case 'left':
        case 'right':
          return keyZones[lowerKey] === zone;
        default:
          return false;
      }
    },
    []
  );

  return {
    activeZone,
    highlightZone,
    clearZone,
    isKeyInZone,
  };
}

/**
 * Hook for progressive key highlighting (reveal keys one by one)
 */
export function useProgressiveHighlight(
  keys: string[],
  revealDelay = 1000
) {
  const [revealedCount, setRevealedCount] = useState(0);

  useEffect(() => {
    if (revealedCount < keys.length) {
      const timer = setTimeout(() => {
        setRevealedCount((prev) => prev + 1);
      }, revealDelay);

      return () => clearTimeout(timer);
    }
  }, [revealedCount, keys.length, revealDelay]);

  const reset = useCallback(() => {
    setRevealedCount(0);
  }, []);

  const isRevealed = useCallback(
    (index: number) => index < revealedCount,
    [revealedCount]
  );

  return {
    revealedCount,
    isComplete: revealedCount >= keys.length,
    isRevealed,
    reset,
  };
}
