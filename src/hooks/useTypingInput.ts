/**
 * Typing Input Handler Hook
 * Step 121 - Core typing input handler for exercises
 */

import { useState, useCallback, useEffect, useRef } from 'react';

export interface TypingInputState {
  targetText: string;
  currentInput: string;
  currentPosition: number;
  isActive: boolean;
  isComplete: boolean;
  startTime: number | null;
  endTime: number | null;
}

export interface TypingInputHandlers {
  handleInput: (char: string) => void;
  handleBackspace: () => void;
  handleClear: () => void;
  start: () => void;
  pause: () => void;
  resume: () => void;
  reset: () => void;
}

export interface UseTypingInputOptions {
  targetText: string;
  onComplete?: (stats: TypingStats) => void;
  onProgress?: (progress: TypingProgress) => void;
  onError?: (error: TypingError) => void;
  caseSensitive?: boolean;
  allowBackspace?: boolean;
  autoAdvance?: boolean;
}

export interface TypingStats {
  totalTime: number;
  charactersTyped: number;
  correctCharacters: number;
  incorrectCharacters: number;
  accuracy: number;
  wpm: number;
}

export interface TypingProgress {
  position: number;
  total: number;
  percentage: number;
  currentChar: string;
  nextChar: string;
}

export interface TypingError {
  position: number;
  expected: string;
  received: string;
  timestamp: number;
}

export function useTypingInput({
  targetText,
  onComplete,
  onProgress,
  onError,
  caseSensitive = false,
  allowBackspace = true,
  autoAdvance = true,
}: UseTypingInputOptions) {
  const [state, setState] = useState<TypingInputState>({
    targetText,
    currentInput: '',
    currentPosition: 0,
    isActive: false,
    isComplete: false,
    startTime: null,
    endTime: null,
  });

  const [errors, setErrors] = useState<TypingError[]>([]);
  const inputHistory = useRef<string[]>([]);

  // Update target text if it changes
  useEffect(() => {
    if (targetText !== state.targetText && !state.isActive) {
      setState((prev) => ({
        ...prev,
        targetText,
        currentInput: '',
        currentPosition: 0,
        isComplete: false,
      }));
    }
  }, [targetText, state.targetText, state.isActive]);

  // Start typing session
  const start = useCallback(() => {
    setState((prev) => ({
      ...prev,
      isActive: true,
      startTime: Date.now(),
      currentInput: '',
      currentPosition: 0,
      isComplete: false,
    }));
    setErrors([]);
    inputHistory.current = [];
  }, []);

  // Pause typing session
  const pause = useCallback(() => {
    setState((prev) => ({
      ...prev,
      isActive: false,
    }));
  }, []);

  // Resume typing session
  const resume = useCallback(() => {
    setState((prev) => ({
      ...prev,
      isActive: true,
    }));
  }, []);

  // Reset typing session
  const reset = useCallback(() => {
    setState((prev) => ({
      ...prev,
      currentInput: '',
      currentPosition: 0,
      isActive: false,
      isComplete: false,
      startTime: null,
      endTime: null,
    }));
    setErrors([]);
    inputHistory.current = [];
  }, []);

  // Handle character input
  const handleInput = useCallback(
    (char: string) => {
      if (!state.isActive || state.isComplete) return;

      const position = state.currentPosition;
      const expectedChar = state.targetText[position];

      if (!expectedChar) return; // At end of text

      // Compare characters
      const inputChar = caseSensitive ? char : char.toLowerCase();
      const targetChar = caseSensitive ? expectedChar : expectedChar.toLowerCase();

      const isCorrect = inputChar === targetChar;

      if (isCorrect) {
        // Correct input
        const newInput = state.currentInput + char;
        const newPosition = position + 1;
        const isComplete = newPosition >= state.targetText.length;

        setState((prev) => ({
          ...prev,
          currentInput: newInput,
          currentPosition: newPosition,
          isComplete,
          endTime: isComplete ? Date.now() : null,
        }));

        inputHistory.current.push(char);

        // Report progress
        if (onProgress) {
          onProgress({
            position: newPosition,
            total: state.targetText.length,
            percentage: (newPosition / state.targetText.length) * 100,
            currentChar: state.targetText[newPosition] || '',
            nextChar: state.targetText[newPosition + 1] || '',
          });
        }

        // Check if complete
        if (isComplete) {
          const totalTime = Date.now() - (state.startTime || Date.now());
          const stats: TypingStats = {
            totalTime,
            charactersTyped: inputHistory.current.length,
            correctCharacters: newPosition,
            incorrectCharacters: errors.length,
            accuracy:
              inputHistory.current.length > 0
                ? (newPosition / inputHistory.current.length) * 100
                : 100,
            wpm: calculateWPM(newPosition, totalTime),
          };

          onComplete?.(stats);
        }
      } else {
        // Incorrect input
        const error: TypingError = {
          position,
          expected: expectedChar,
          received: char,
          timestamp: Date.now(),
        };

        setErrors((prev) => [...prev, error]);
        inputHistory.current.push(char);

        onError?.(error);

        // Auto-advance on error (optional)
        if (autoAdvance) {
          const newInput = state.currentInput + char;
          const newPosition = position + 1;

          setState((prev) => ({
            ...prev,
            currentInput: newInput,
            currentPosition: newPosition,
          }));
        }
      }
    },
    [
      state.isActive,
      state.isComplete,
      state.currentPosition,
      state.targetText,
      state.currentInput,
      state.startTime,
      caseSensitive,
      autoAdvance,
      errors.length,
      onProgress,
      onComplete,
      onError,
    ]
  );

  // Handle backspace
  const handleBackspace = useCallback(() => {
    if (!state.isActive || state.currentPosition === 0 || !allowBackspace) return;

    const newPosition = state.currentPosition - 1;
    const newInput = state.currentInput.slice(0, -1);

    setState((prev) => ({
      ...prev,
      currentInput: newInput,
      currentPosition: newPosition,
      isComplete: false,
    }));

    // Remove last error if it was at this position
    setErrors((prev) => {
      const lastError = prev[prev.length - 1];
      if (lastError && lastError.position === state.currentPosition - 1) {
        return prev.slice(0, -1);
      }
      return prev;
    });

    // Report progress
    if (onProgress) {
      onProgress({
        position: newPosition,
        total: state.targetText.length,
        percentage: (newPosition / state.targetText.length) * 100,
        currentChar: state.targetText[newPosition] || '',
        nextChar: state.targetText[newPosition + 1] || '',
      });
    }
  }, [
    state.isActive,
    state.currentPosition,
    state.currentInput,
    state.targetText,
    allowBackspace,
    onProgress,
  ]);

  // Handle clear (clear all input)
  const handleClear = useCallback(() => {
    setState((prev) => ({
      ...prev,
      currentInput: '',
      currentPosition: 0,
      isComplete: false,
    }));
    setErrors([]);
  }, []);

  return {
    state,
    errors,
    handlers: {
      handleInput,
      handleBackspace,
      handleClear,
      start,
      pause,
      resume,
      reset,
    },
  };
}

// Helper: Calculate WPM
function calculateWPM(characters: number, timeMs: number): number {
  if (timeMs === 0) return 0;
  const minutes = timeMs / 1000 / 60;
  const words = characters / 5; // Standard: 5 characters = 1 word
  return Math.round(words / minutes);
}

// Hook variant for word-based typing
export function useWordTypingInput(words: string[]) {
  const [currentWordIndex, setCurrentWordIndex] = useState(0);
  const [completedWords, setCompletedWords] = useState<string[]>([]);

  const currentWord = words[currentWordIndex] || '';

  const typingInput = useTypingInput({
    targetText: currentWord,
    onComplete: () => {
      setCompletedWords((prev) => [...prev, currentWord]);
      setCurrentWordIndex((prev) => prev + 1);
    },
  });

  const reset = useCallback(() => {
    setCurrentWordIndex(0);
    setCompletedWords([]);
    typingInput.handlers.reset();
  }, [typingInput.handlers]);

  return {
    ...typingInput,
    currentWordIndex,
    completedWords,
    isAllComplete: currentWordIndex >= words.length,
    handlers: {
      ...typingInput.handlers,
      reset,
    },
  };
}
