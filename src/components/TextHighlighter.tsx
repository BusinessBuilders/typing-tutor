/**
 * Text Highlighting System
 * Step 123 - Visual highlighting for typing practice
 */

import { motion } from 'framer-motion';
import { useSettingsStore } from '../store/useSettingsStore';

export interface TextHighlighterProps {
  text: string;
  currentPosition: number;
  errors?: number[]; // Array of error positions
  completed?: number[]; // Array of completed positions
  highlightCurrent?: boolean;
  highlightNext?: boolean;
  showCursor?: boolean;
  size?: 'small' | 'medium' | 'large' | 'xlarge';
}

export default function TextHighlighter({
  text,
  currentPosition,
  errors = [],
  completed: _completed = [],
  highlightCurrent = true,
  highlightNext = true,
  showCursor = true,
  size = 'large',
}: TextHighlighterProps) {
  const { settings } = useSettingsStore();

  const sizeClasses = {
    small: 'text-lg',
    medium: 'text-2xl',
    large: 'text-4xl',
    xlarge: 'text-6xl',
  };

  const getCharacterState = (index: number) => {
    if (index < currentPosition) {
      return errors.includes(index) ? 'error' : 'correct';
    }
    if (index === currentPosition) {
      return 'current';
    }
    if (index === currentPosition + 1 && highlightNext) {
      return 'next';
    }
    return 'pending';
  };

  const getCharacterColor = (state: string) => {
    switch (state) {
      case 'correct':
        return 'text-success-600';
      case 'error':
        return 'text-red-600 bg-red-100 rounded';
      case 'current':
        return highlightCurrent
          ? 'text-gray-900 bg-yellow-300 rounded font-bold'
          : 'text-gray-900';
      case 'next':
        return 'text-gray-500 bg-blue-50 rounded';
      case 'pending':
      default:
        return 'text-gray-400';
    }
  };

  return (
    <div className="bg-white rounded-2xl shadow-xl p-8">
      <div
        className={`${sizeClasses[size]} font-mono leading-relaxed tracking-wide flex flex-wrap items-center`}
      >
        {text.split('').map((char, index) => {
          const state = getCharacterState(index);
          const isCurrent = index === currentPosition;

          return (
            <motion.span
              key={index}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.02 }}
              className={`
                ${getCharacterColor(state)}
                ${char === ' ' ? 'mx-1' : ''}
                ${isCurrent ? 'relative' : ''}
                px-0.5 py-1 transition-all duration-200
              `}
            >
              {char === ' ' ? '\u00A0' : char}

              {/* Cursor */}
              {isCurrent && showCursor && (
                <motion.span
                  animate={
                    settings.reducedMotion
                      ? {}
                      : {
                          opacity: [1, 0, 1],
                        }
                  }
                  transition={{
                    duration: 1,
                    repeat: Infinity,
                    ease: 'easeInOut',
                  }}
                  className="absolute left-0 top-0 bottom-0 w-0.5 bg-primary-600"
                />
              )}
            </motion.span>
          );
        })}
      </div>
    </div>
  );
}

// Word-based highlighter
export function WordHighlighter({
  words,
  currentWordIndex,
  currentCharIndex,
  wordErrors,
  size = 'large',
}: {
  words: string[];
  currentWordIndex: number;
  currentCharIndex: number;
  wordErrors: Record<number, number[]>; // wordIndex -> error positions
  size?: 'small' | 'medium' | 'large' | 'xlarge';
}) {
  const { settings } = useSettingsStore();

  const sizeClasses = {
    small: 'text-lg',
    medium: 'text-2xl',
    large: 'text-4xl',
    xlarge: 'text-6xl',
  };

  const getWordState = (wordIndex: number) => {
    if (wordIndex < currentWordIndex) return 'completed';
    if (wordIndex === currentWordIndex) return 'current';
    return 'pending';
  };

  return (
    <div className="bg-white rounded-2xl shadow-xl p-8">
      <div
        className={`${sizeClasses[size]} font-mono leading-relaxed flex flex-wrap gap-4`}
      >
        {words.map((word, wordIndex) => {
          const wordState = getWordState(wordIndex);
          const isCurrent = wordIndex === currentWordIndex;
          const errors = wordErrors[wordIndex] || [];

          return (
            <motion.div
              key={wordIndex}
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              className={`
                inline-flex
                ${wordState === 'completed' ? 'opacity-50' : ''}
                ${isCurrent ? 'ring-4 ring-primary-300 rounded-lg px-2' : ''}
              `}
            >
              {word.split('').map((char, charIndex) => {
                const isError = errors.includes(charIndex);
                const isCurrentChar = isCurrent && charIndex === currentCharIndex;
                const isCompleted = wordIndex < currentWordIndex;

                return (
                  <motion.span
                    key={charIndex}
                    className={`
                      ${isCompleted ? 'text-success-600' : ''}
                      ${isError ? 'text-red-600 bg-red-100 rounded' : ''}
                      ${isCurrentChar ? 'bg-yellow-300 text-gray-900 font-bold rounded' : ''}
                      ${!isCompleted && !isError && !isCurrentChar ? 'text-gray-700' : ''}
                      px-0.5 relative
                    `}
                  >
                    {char}

                    {/* Current char cursor */}
                    {isCurrentChar && (
                      <motion.span
                        animate={
                          settings.reducedMotion
                            ? {}
                            : {
                                opacity: [1, 0, 1],
                              }
                        }
                        transition={{
                          duration: 1,
                          repeat: Infinity,
                        }}
                        className="absolute left-0 top-0 bottom-0 w-0.5 bg-primary-600"
                      />
                    )}
                  </motion.span>
                );
              })}
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}

// Sentence highlighter with line breaks
export function SentenceHighlighter({
  sentences,
  currentPosition,
  errors = [],
}: {
  sentences: string[];
  currentPosition: number;
  errors?: number[];
}) {
  let charCount = 0;

  return (
    <div className="bg-white rounded-2xl shadow-xl p-8 space-y-4">
      {sentences.map((sentence, index) => {
        const sentenceStart = charCount;
        const sentenceEnd = charCount + sentence.length;
        const isCurrent =
          currentPosition >= sentenceStart && currentPosition < sentenceEnd;

        charCount += sentence.length;

        return (
          <div
            key={index}
            className={`
              text-3xl font-mono leading-relaxed
              ${isCurrent ? 'ring-2 ring-primary-300 rounded-lg p-4' : 'opacity-50'}
            `}
          >
            <TextHighlighter
              text={sentence}
              currentPosition={
                isCurrent ? currentPosition - sentenceStart : sentence.length
              }
              errors={errors
                .filter((e) => e >= sentenceStart && e < sentenceEnd)
                .map((e) => e - sentenceStart)}
            />
          </div>
        );
      })}
    </div>
  );
}

// Character-by-character reveal highlighter
export function RevealHighlighter({
  text,
  revealedCount,
  currentPosition,
}: {
  text: string;
  revealedCount: number;
  currentPosition: number;
}) {
  return (
    <div className="bg-white rounded-2xl shadow-xl p-8">
      <div className="text-4xl font-mono leading-relaxed flex flex-wrap">
        {text.split('').map((char, index) => {
          const isRevealed = index < revealedCount;
          const isCurrent = index === currentPosition;
          const isCompleted = index < currentPosition;

          if (!isRevealed && !isCurrent) {
            return (
              <span key={index} className="text-gray-300">
                ●
              </span>
            );
          }

          return (
            <motion.span
              key={index}
              initial={{ opacity: 0, scale: 0 }}
              animate={{ opacity: 1, scale: 1 }}
              className={`
                ${isCompleted ? 'text-success-600' : ''}
                ${isCurrent ? 'text-gray-900 bg-yellow-300 font-bold rounded' : ''}
                ${!isCompleted && !isCurrent ? 'text-gray-700' : ''}
                px-0.5
              `}
            >
              {char === ' ' ? '\u00A0' : char}
            </motion.span>
          );
        })}
      </div>
    </div>
  );
}

// Colorful rainbow highlighter for autism-friendly visual appeal
export function RainbowHighlighter({
  text,
  currentPosition,
}: {
  text: string;
  currentPosition: number;
}) {
  const colors = [
    'text-red-500',
    'text-orange-500',
    'text-yellow-500',
    'text-green-500',
    'text-blue-500',
    'text-indigo-500',
    'text-purple-500',
  ];

  return (
    <div className="bg-white rounded-2xl shadow-xl p-8">
      <div className="text-4xl font-bold leading-relaxed flex flex-wrap">
        {text.split('').map((char, index) => {
          const colorIndex = index % colors.length;
          const isCurrent = index === currentPosition;
          const isCompleted = index < currentPosition;

          return (
            <motion.span
              key={index}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.03 }}
              className={`
                ${isCompleted ? 'opacity-50' : colors[colorIndex]}
                ${isCurrent ? 'scale-125 bg-yellow-200 rounded px-1' : ''}
                transition-all duration-200
              `}
            >
              {char === ' ' ? '\u00A0' : char}
            </motion.span>
          );
        })}
      </div>
    </div>
  );
}
