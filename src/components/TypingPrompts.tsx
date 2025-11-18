import React, { useState, useCallback, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

/**
 * TypingPrompts Component
 *
 * Dynamic typing prompt system for autism typing tutor.
 * Displays text for users to type with various display modes,
 * highlighting, progress tracking, and accessibility features.
 *
 * Features:
 * - Multiple display modes (standard, word-by-word, character-by-character)
 * - Real-time typing feedback with highlighting
 * - Error highlighting and correction
 * - Progress indicators
 * - WPM and accuracy tracking
 * - Customizable text size and spacing
 * - Focus mode to reduce distractions
 * - Color-coded feedback (correct, incorrect, current)
 * - Support for different difficulty levels
 * - Hint system for struggling users
 */

// Types for typing prompts
export type DisplayMode = 'standard' | 'word-by-word' | 'character-by-character' | 'sentence-by-sentence';
export type FeedbackType = 'instant' | 'word' | 'sentence' | 'none';
export type HighlightStyle = 'underline' | 'background' | 'border' | 'bold';

export interface TypingPromptConfig {
  displayMode: DisplayMode;
  feedbackType: FeedbackType;
  highlightStyle: HighlightStyle;
  showProgress: boolean;
  showStats: boolean;
  showErrors: boolean;
  showHints: boolean;
  focusMode: boolean;
  fontSize: number; // pixels
  lineHeight: number; // multiplier
  letterSpacing: number; // pixels
  wordSpacing: number; // pixels
  maxVisibleWords: number; // for word-by-word mode
  colorCorrect: string;
  colorIncorrect: string;
  colorCurrent: string;
  colorPending: string;
}

export interface TypingStats {
  wpm: number; // words per minute
  accuracy: number; // percentage
  errorCount: number;
  correctCount: number;
  totalCharacters: number;
  elapsedTime: number; // seconds
  startTime: Date | null;
  endTime: Date | null;
}

export interface CharacterState {
  char: string;
  index: number;
  status: 'pending' | 'correct' | 'incorrect' | 'current';
  typed?: string;
}

export interface WordState {
  word: string;
  startIndex: number;
  endIndex: number;
  status: 'pending' | 'correct' | 'incorrect' | 'current' | 'partial';
  characters: CharacterState[];
}

export interface Hint {
  type: 'next-char' | 'next-word' | 'correction' | 'tip';
  message: string;
  position: number;
}

// Custom hook for typing prompts
export function useTypingPrompts(
  promptText: string,
  initialConfig?: Partial<TypingPromptConfig>
) {
  const [config, setConfig] = useState<TypingPromptConfig>({
    displayMode: 'standard',
    feedbackType: 'instant',
    highlightStyle: 'background',
    showProgress: true,
    showStats: true,
    showErrors: true,
    showHints: true,
    focusMode: false,
    fontSize: 18,
    lineHeight: 1.8,
    letterSpacing: 0.5,
    wordSpacing: 4,
    maxVisibleWords: 3,
    colorCorrect: '#4CAF50',
    colorIncorrect: '#F44336',
    colorCurrent: '#2196F3',
    colorPending: '#9E9E9E',
    ...initialConfig,
  });

  const [typedText, setTypedText] = useState('');
  const [currentIndex, setCurrentIndex] = useState(0);
  const [words, setWords] = useState<WordState[]>([]);
  const [stats, setStats] = useState<TypingStats>({
    wpm: 0,
    accuracy: 100,
    errorCount: 0,
    correctCount: 0,
    totalCharacters: 0,
    elapsedTime: 0,
    startTime: null,
    endTime: null,
  });
  const [hints, setHints] = useState<Hint[]>([]);
  const [isComplete, setIsComplete] = useState(false);

  const updateConfig = useCallback((newConfig: Partial<TypingPromptConfig>) => {
    setConfig((prev) => ({ ...prev, ...newConfig }));
  }, []);

  // Initialize words from prompt text
  useEffect(() => {
    const wordArray = promptText.split(/(\s+)/);
    let charIndex = 0;

    const wordStates: WordState[] = wordArray.map((word) => {
      const startIndex = charIndex;
      const endIndex = charIndex + word.length - 1;
      const characters: CharacterState[] = word.split('').map((char, i) => ({
        char,
        index: charIndex + i,
        status: 'pending' as const,
      }));

      charIndex += word.length;

      return {
        word,
        startIndex,
        endIndex,
        status: 'pending',
        characters,
      };
    });

    setWords(wordStates);
  }, [promptText]);

  // Calculate stats
  const calculateStats = useCallback(() => {
    if (!stats.startTime) return;

    const now = new Date();
    const elapsedSeconds = (now.getTime() - stats.startTime.getTime()) / 1000;
    const elapsedMinutes = elapsedSeconds / 60;

    const wordsTyped = typedText.trim().split(/\s+/).length;
    const wpm = elapsedMinutes > 0 ? Math.round(wordsTyped / elapsedMinutes) : 0;

    const totalTyped = typedText.length;
    const correctChars = stats.correctCount;
    const accuracy = totalTyped > 0 ? Math.round((correctChars / totalTyped) * 100) : 100;

    setStats((prev) => ({
      ...prev,
      wpm,
      accuracy,
      elapsedTime: elapsedSeconds,
      totalCharacters: totalTyped,
    }));
  }, [typedText, stats.startTime, stats.correctCount]);

  // Update stats periodically
  useEffect(() => {
    if (!stats.startTime || isComplete) return;

    const interval = setInterval(() => {
      calculateStats();
    }, 1000);

    return () => clearInterval(interval);
  }, [stats.startTime, isComplete, calculateStats]);

  // Handle typed character
  const handleType = useCallback(
    (char: string) => {
      // Start timer on first character
      if (!stats.startTime) {
        setStats((prev) => ({
          ...prev,
          startTime: new Date(),
        }));
      }

      const expectedChar = promptText[currentIndex];

      if (!expectedChar) {
        // Completed
        setIsComplete(true);
        setStats((prev) => ({
          ...prev,
          endTime: new Date(),
        }));
        return;
      }

      const isCorrect = char === expectedChar;

      setTypedText((prev) => prev + char);
      setCurrentIndex((prev) => prev + 1);

      // Update stats
      setStats((prev) => ({
        ...prev,
        correctCount: isCorrect ? prev.correctCount + 1 : prev.correctCount,
        errorCount: !isCorrect ? prev.errorCount + 1 : prev.errorCount,
      }));

      // Update word states
      setWords((prevWords) =>
        prevWords.map((word) => {
          if (currentIndex >= word.startIndex && currentIndex <= word.endIndex) {
            const charIndex = currentIndex - word.startIndex;
            const updatedChars = word.characters.map((c, i) => {
              if (i === charIndex) {
                return {
                  ...c,
                  status: isCorrect ? ('correct' as const) : ('incorrect' as const),
                  typed: char,
                };
              } else if (i === charIndex + 1) {
                return { ...c, status: 'current' as const };
              }
              return c;
            });

            const allCorrect = updatedChars.every(
              (c) => c.status === 'correct' || c.status === 'pending'
            );
            const anyIncorrect = updatedChars.some((c) => c.status === 'incorrect');
            const hasTyped = updatedChars.some(
              (c) => c.status === 'correct' || c.status === 'incorrect'
            );

            return {
              ...word,
              characters: updatedChars,
              status: anyIncorrect
                ? 'incorrect'
                : hasTyped && allCorrect
                ? 'correct'
                : hasTyped
                ? 'partial'
                : 'pending',
            };
          }
          return word;
        })
      );

      // Generate hints if needed
      if (!isCorrect && config.showHints) {
        const hint: Hint = {
          type: 'correction',
          message: `Expected "${expectedChar}", got "${char}"`,
          position: currentIndex,
        };
        setHints((prev) => [...prev, hint].slice(-3)); // Keep last 3 hints
      }
    },
    [currentIndex, promptText, stats.startTime, config.showHints]
  );

  // Handle backspace
  const handleBackspace = useCallback(() => {
    if (currentIndex === 0) return;

    setTypedText((prev) => prev.slice(0, -1));
    setCurrentIndex((prev) => prev - 1);

    // Update word states
    setWords((prevWords) =>
      prevWords.map((word) => {
        if (currentIndex - 1 >= word.startIndex && currentIndex - 1 <= word.endIndex) {
          const charIndex = currentIndex - 1 - word.startIndex;
          const updatedChars = word.characters.map((c, i) => {
            if (i === charIndex) {
              return { ...c, status: 'current' as const, typed: undefined };
            } else if (i === charIndex + 1) {
              return { ...c, status: 'pending' as const };
            }
            return c;
          });

          return {
            ...word,
            characters: updatedChars,
            status: 'current',
          };
        }
        return word;
      })
    );
  }, [currentIndex]);

  // Reset typing session
  const reset = useCallback(() => {
    setTypedText('');
    setCurrentIndex(0);
    setStats({
      wpm: 0,
      accuracy: 100,
      errorCount: 0,
      correctCount: 0,
      totalCharacters: 0,
      elapsedTime: 0,
      startTime: null,
      endTime: null,
    });
    setHints([]);
    setIsComplete(false);

    // Reset words
    setWords((prevWords) =>
      prevWords.map((word) => ({
        ...word,
        status: 'pending',
        characters: word.characters.map((c, i) => ({
          ...c,
          status: i === 0 ? 'current' : 'pending',
          typed: undefined,
        })),
      }))
    );
  }, []);

  const getVisibleWords = useCallback(() => {
    if (config.displayMode === 'standard') {
      return words;
    }

    if (config.displayMode === 'word-by-word') {
      const currentWordIndex = words.findIndex(
        (w) => currentIndex >= w.startIndex && currentIndex <= w.endIndex
      );

      if (currentWordIndex === -1) return [];

      const start = Math.max(0, currentWordIndex - 1);
      const end = Math.min(words.length, currentWordIndex + config.maxVisibleWords);

      return words.slice(start, end);
    }

    return words;
  }, [config.displayMode, config.maxVisibleWords, words, currentIndex]);

  return {
    config,
    updateConfig,
    typedText,
    currentIndex,
    words,
    stats,
    hints,
    isComplete,
    handleType,
    handleBackspace,
    reset,
    getVisibleWords,
  };
}

// Main component
interface TypingPromptsProps {
  text: string;
  onComplete?: (stats: TypingStats) => void;
  initialConfig?: Partial<TypingPromptConfig>;
}

const TypingPrompts: React.FC<TypingPromptsProps> = ({
  text,
  onComplete,
  initialConfig,
}) => {
  const tp = useTypingPrompts(text, initialConfig);
  const inputRef = React.useRef<HTMLInputElement>(null);

  // Handle completion
  useEffect(() => {
    if (tp.isComplete && onComplete) {
      onComplete(tp.stats);
    }
  }, [tp.isComplete, tp.stats, onComplete]);

  // Handle keyboard input
  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (tp.isComplete) return;

      if (e.key === 'Backspace') {
        e.preventDefault();
        tp.handleBackspace();
      } else if (e.key.length === 1) {
        e.preventDefault();
        tp.handleType(e.key);
      }
    },
    [tp]
  );

  // Auto-focus input
  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  const visibleWords = tp.getVisibleWords();

  return (
    <div style={{ padding: '20px', maxWidth: '900px', margin: '0 auto' }}>
      {/* Stats Bar */}
      {tp.config.showStats && (
        <div
          style={{
            display: 'flex',
            gap: '20px',
            marginBottom: '20px',
            padding: '15px',
            backgroundColor: '#f5f5f5',
            borderRadius: '8px',
            justifyContent: 'space-around',
          }}
        >
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#2196F3' }}>
              {tp.stats.wpm}
            </div>
            <div style={{ fontSize: '12px', color: '#666' }}>WPM</div>
          </div>
          <div style={{ textAlign: 'center' }}>
            <div
              style={{
                fontSize: '24px',
                fontWeight: 'bold',
                color: tp.stats.accuracy >= 90 ? '#4CAF50' : '#FF9800',
              }}
            >
              {tp.stats.accuracy}%
            </div>
            <div style={{ fontSize: '12px', color: '#666' }}>Accuracy</div>
          </div>
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#9C27B0' }}>
              {Math.floor(tp.stats.elapsedTime)}s
            </div>
            <div style={{ fontSize: '12px', color: '#666' }}>Time</div>
          </div>
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#F44336' }}>
              {tp.stats.errorCount}
            </div>
            <div style={{ fontSize: '12px', color: '#666' }}>Errors</div>
          </div>
        </div>
      )}

      {/* Progress Bar */}
      {tp.config.showProgress && (
        <div
          style={{
            marginBottom: '20px',
            height: '8px',
            backgroundColor: '#e0e0e0',
            borderRadius: '4px',
            overflow: 'hidden',
          }}
        >
          <motion.div
            initial={{ width: 0 }}
            animate={{
              width: `${(tp.currentIndex / text.length) * 100}%`,
            }}
            style={{
              height: '100%',
              backgroundColor: '#4CAF50',
            }}
          />
        </div>
      )}

      {/* Typing Prompt Display */}
      <div
        style={{
          padding: '30px',
          backgroundColor: tp.config.focusMode ? '#f9f9f9' : 'white',
          borderRadius: '12px',
          border: tp.config.focusMode ? '2px solid #2196F3' : '2px solid #e0e0e0',
          marginBottom: '20px',
          minHeight: '200px',
        }}
      >
        <div
          style={{
            fontSize: `${tp.config.fontSize}px`,
            lineHeight: tp.config.lineHeight,
            letterSpacing: `${tp.config.letterSpacing}px`,
            fontFamily: 'monospace',
            userSelect: 'none',
          }}
        >
          {visibleWords.map((word, wordIndex) => (
            <span
              key={`${word.startIndex}-${wordIndex}`}
              style={{
                display: 'inline-block',
                marginRight: `${tp.config.wordSpacing}px`,
              }}
            >
              {word.characters.map((char) => {
                const isSpace = char.char === ' ';
                let backgroundColor = 'transparent';
                let color = tp.config.colorPending;
                let textDecoration = 'none';
                let borderBottom = 'none';
                let fontWeight = 'normal';

                if (char.status === 'correct') {
                  color = tp.config.colorCorrect;
                  if (tp.config.highlightStyle === 'background') {
                    backgroundColor = `${tp.config.colorCorrect}20`;
                  } else if (tp.config.highlightStyle === 'underline') {
                    textDecoration = `underline ${tp.config.colorCorrect}`;
                  } else if (tp.config.highlightStyle === 'border') {
                    borderBottom = `2px solid ${tp.config.colorCorrect}`;
                  } else if (tp.config.highlightStyle === 'bold') {
                    fontWeight = 'bold';
                  }
                } else if (char.status === 'incorrect') {
                  color = tp.config.colorIncorrect;
                  if (tp.config.highlightStyle === 'background') {
                    backgroundColor = `${tp.config.colorIncorrect}20`;
                  } else if (tp.config.highlightStyle === 'underline') {
                    textDecoration = `underline ${tp.config.colorIncorrect}`;
                  } else if (tp.config.highlightStyle === 'border') {
                    borderBottom = `2px solid ${tp.config.colorIncorrect}`;
                  }
                } else if (char.status === 'current') {
                  color = tp.config.colorCurrent;
                  backgroundColor = `${tp.config.colorCurrent}20`;
                  borderBottom = `2px solid ${tp.config.colorCurrent}`;
                }

                return (
                  <span
                    key={char.index}
                    style={{
                      backgroundColor,
                      color,
                      textDecoration,
                      borderBottom,
                      fontWeight,
                      padding: '2px 1px',
                      transition: 'all 0.1s',
                    }}
                  >
                    {isSpace ? '\u00A0' : char.char}
                  </span>
                );
              })}
            </span>
          ))}
        </div>
      </div>

      {/* Hidden Input for Keyboard Capture */}
      <input
        ref={inputRef}
        type="text"
        onKeyDown={handleKeyDown}
        value=""
        onChange={() => {}} // Controlled component
        style={{
          position: 'absolute',
          opacity: 0,
          pointerEvents: 'all',
          width: '1px',
          height: '1px',
        }}
        aria-label="Type here"
      />

      {/* Hints */}
      {tp.config.showHints && tp.hints.length > 0 && (
        <div
          style={{
            padding: '15px',
            backgroundColor: '#FFF3E0',
            borderRadius: '8px',
            marginBottom: '20px',
          }}
        >
          <h4 style={{ marginTop: 0, marginBottom: '10px' }}>💡 Hints:</h4>
          {tp.hints.map((hint, i) => (
            <div key={i} style={{ fontSize: '14px', marginBottom: '5px' }}>
              • {hint.message}
            </div>
          ))}
        </div>
      )}

      {/* Completion Message */}
      <AnimatePresence>
        {tp.isComplete && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            style={{
              padding: '30px',
              backgroundColor: '#E8F5E9',
              borderRadius: '12px',
              textAlign: 'center',
              border: '2px solid #4CAF50',
            }}
          >
            <div style={{ fontSize: '48px', marginBottom: '15px' }}>🎉</div>
            <h2 style={{ marginTop: 0, marginBottom: '10px' }}>
              Great Job!
            </h2>
            <p style={{ fontSize: '16px', marginBottom: '20px' }}>
              You completed the typing exercise with {tp.stats.wpm} WPM and{' '}
              {tp.stats.accuracy}% accuracy!
            </p>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => {
                tp.reset();
                inputRef.current?.focus();
              }}
              style={{
                padding: '12px 30px',
                backgroundColor: '#4CAF50',
                color: 'white',
                border: 'none',
                borderRadius: '8px',
                cursor: 'pointer',
                fontSize: '16px',
              }}
            >
              Try Again
            </motion.button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Focus Hint */}
      {!tp.stats.startTime && (
        <div
          style={{
            textAlign: 'center',
            color: '#999',
            fontSize: '14px',
            marginTop: '10px',
          }}
        >
          Click anywhere and start typing to begin...
        </div>
      )}
    </div>
  );
};

export default TypingPrompts;
