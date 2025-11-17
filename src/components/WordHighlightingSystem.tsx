/**
 * Word Highlighting System
 * Step 134 - Enhanced word-level highlighting for reading comprehension
 */

import { motion } from 'framer-motion';
import { useSettingsStore } from '../store/useSettingsStore';

export interface WordHighlightConfig {
  word: string;
  style?: 'underline' | 'background' | 'border' | 'bold' | 'color';
  color?: string;
  onClick?: () => void;
}

export interface WordHighlightingProps {
  text: string;
  highlightedWords?: WordHighlightConfig[];
  currentWordIndex?: number;
  onWordClick?: (word: string, index: number) => void;
  showWordBoundaries?: boolean;
}

export default function WordHighlightingSystem({
  text,
  highlightedWords = [],
  currentWordIndex,
  onWordClick,
  showWordBoundaries = false,
}: WordHighlightingProps) {
  const { settings } = useSettingsStore();
  const words = text.split(/(\s+)/); // Split but keep spaces

  const getWordStyle = (word: string, index: number) => {
    // Check if word is in highlighted list
    const highlight = highlightedWords.find((h) => h.word === word.trim());
    const isCurrent = currentWordIndex === Math.floor(index / 2); // Adjust for spaces

    if (isCurrent) {
      return 'bg-yellow-300 text-gray-900 font-bold px-1 rounded';
    }

    if (highlight) {
      switch (highlight.style) {
        case 'underline':
          return `underline decoration-4 ${highlight.color || 'decoration-primary-500'}`;
        case 'background':
          return `${highlight.color || 'bg-blue-100'} px-1 rounded`;
        case 'border':
          return `border-2 ${highlight.color || 'border-primary-500'} px-1 rounded`;
        case 'bold':
          return `font-bold ${highlight.color || 'text-primary-600'}`;
        case 'color':
          return highlight.color || 'text-primary-600';
        default:
          return 'bg-blue-50 px-1 rounded';
      }
    }

    return '';
  };

  return (
    <div className="bg-white rounded-2xl shadow-xl p-8">
      <div className="text-3xl leading-relaxed">
        {words.map((word, index) => {
          const isSpace = /^\s+$/.test(word);
          const wordIndex = Math.floor(index / 2);

          if (isSpace) {
            return <span key={index}>{word}</span>;
          }

          return (
            <motion.span
              key={index}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: settings.reducedMotion ? 0 : index * 0.02 }}
              onClick={() => onWordClick?.(word, wordIndex)}
              className={`
                ${getWordStyle(word, index)}
                ${showWordBoundaries ? 'border border-dashed border-gray-300' : ''}
                ${onWordClick ? 'cursor-pointer hover:bg-gray-100' : ''}
                transition-all duration-200
                inline-block
              `}
            >
              {word}
            </motion.span>
          );
        })}
      </div>
    </div>
  );
}

// Semantic word highlighting (nouns, verbs, adjectives)
export function SemanticWordHighlighter({
  text,
  wordCategories,
}: {
  text: string;
  wordCategories: {
    nouns?: string[];
    verbs?: string[];
    adjectives?: string[];
    other?: string[];
  };
}) {
  const words = text.split(/(\s+)/);

  const getCategory = (word: string): string => {
    const cleanWord = word.trim().toLowerCase();

    if (wordCategories.nouns?.includes(cleanWord)) {
      return 'bg-blue-100 text-blue-800';
    }
    if (wordCategories.verbs?.includes(cleanWord)) {
      return 'bg-green-100 text-green-800';
    }
    if (wordCategories.adjectives?.includes(cleanWord)) {
      return 'bg-purple-100 text-purple-800';
    }
    if (wordCategories.other?.includes(cleanWord)) {
      return 'bg-yellow-100 text-yellow-800';
    }

    return 'text-gray-700';
  };

  return (
    <div className="bg-white rounded-2xl shadow-xl p-8">
      {/* Legend */}
      <div className="flex flex-wrap gap-4 mb-6 text-sm">
        <div className="flex items-center space-x-2">
          <div className="w-4 h-4 bg-blue-100 rounded"></div>
          <span>Nouns</span>
        </div>
        <div className="flex items-center space-x-2">
          <div className="w-4 h-4 bg-green-100 rounded"></div>
          <span>Verbs</span>
        </div>
        <div className="flex items-center space-x-2">
          <div className="w-4 h-4 bg-purple-100 rounded"></div>
          <span>Adjectives</span>
        </div>
        <div className="flex items-center space-x-2">
          <div className="w-4 h-4 bg-yellow-100 rounded"></div>
          <span>Other</span>
        </div>
      </div>

      {/* Highlighted text */}
      <div className="text-2xl leading-relaxed">
        {words.map((word, index) => {
          const isSpace = /^\s+$/.test(word);

          if (isSpace) {
            return <span key={index}>{word}</span>;
          }

          return (
            <span
              key={index}
              className={`${getCategory(word)} px-2 py-1 rounded font-medium inline-block`}
            >
              {word}
            </span>
          );
        })}
      </div>
    </div>
  );
}

// Progressive word reveal
export function ProgressiveWordReveal({
  words,
  revealedCount,
  highlightCurrent = true,
}: {
  words: string[];
  revealedCount: number;
  highlightCurrent?: boolean;
}) {
  const { settings } = useSettingsStore();

  return (
    <div className="bg-white rounded-2xl shadow-xl p-8">
      <div className="text-3xl leading-relaxed flex flex-wrap gap-3">
        {words.map((word, index) => {
          const isRevealed = index < revealedCount;
          const isCurrent = index === revealedCount && highlightCurrent;
          const isHidden = index > revealedCount;

          return (
            <motion.span
              key={index}
              initial={{ opacity: 0, scale: 0 }}
              animate={{
                opacity: isHidden ? 0.2 : 1,
                scale: isCurrent ? 1.1 : 1,
              }}
              transition={{
                duration: settings.reducedMotion ? 0 : 0.3,
                delay: settings.reducedMotion ? 0 : index * 0.05,
              }}
              className={`
                inline-block px-2 py-1 rounded font-medium
                ${isRevealed ? 'text-success-600' : ''}
                ${isCurrent ? 'bg-yellow-300 text-gray-900 font-bold' : ''}
                ${isHidden ? 'text-gray-400 blur-sm' : ''}
              `}
            >
              {isHidden ? '●'.repeat(word.length) : word}
            </motion.span>
          );
        })}
      </div>
    </div>
  );
}

// Word difficulty highlighting
export function WordDifficultyHighlighter({
  words,
  getDifficulty,
}: {
  words: string[];
  getDifficulty: (word: string) => 'easy' | 'medium' | 'hard';
}) {
  const difficultyColors = {
    easy: 'bg-green-100 text-green-800',
    medium: 'bg-yellow-100 text-yellow-800',
    hard: 'bg-red-100 text-red-800',
  };

  return (
    <div className="bg-white rounded-2xl shadow-xl p-8">
      {/* Legend */}
      <div className="flex gap-4 mb-6 text-sm">
        <div className="flex items-center space-x-2">
          <div className="w-4 h-4 bg-green-100 rounded"></div>
          <span>Easy</span>
        </div>
        <div className="flex items-center space-x-2">
          <div className="w-4 h-4 bg-yellow-100 rounded"></div>
          <span>Medium</span>
        </div>
        <div className="flex items-center space-x-2">
          <div className="w-4 h-4 bg-red-100 rounded"></div>
          <span>Hard</span>
        </div>
      </div>

      {/* Highlighted text */}
      <div className="text-2xl leading-relaxed flex flex-wrap gap-3">
        {words.map((word, index) => {
          const difficulty = getDifficulty(word);

          return (
            <span
              key={index}
              className={`${difficultyColors[difficulty]} px-3 py-1 rounded font-medium`}
            >
              {word}
            </span>
          );
        })}
      </div>
    </div>
  );
}

// Bionic reading style (bold first letters)
export function BionicReadingHighlighter({ text }: { text: string }) {
  const words = text.split(/(\s+)/);

  const getBoldPortion = (word: string): { bold: string; normal: string } => {
    const trimmed = word.trim();
    if (trimmed.length === 0) return { bold: '', normal: word };

    const boldLength = Math.ceil(trimmed.length / 2);
    return {
      bold: trimmed.slice(0, boldLength),
      normal: trimmed.slice(boldLength),
    };
  };

  return (
    <div className="bg-white rounded-2xl shadow-xl p-8">
      <div className="text-2xl leading-relaxed">
        {words.map((word, index) => {
          const isSpace = /^\s+$/.test(word);

          if (isSpace) {
            return <span key={index}>{word}</span>;
          }

          const { bold, normal } = getBoldPortion(word);

          return (
            <span key={index} className="text-gray-700">
              <span className="font-bold text-gray-900">{bold}</span>
              {normal}
            </span>
          );
        })}
      </div>
    </div>
  );
}

// Reading guide with word tracking
export function ReadingGuideHighlighter({
  text,
  currentWordIndex,
  showPrevious = 2,
  showNext = 3,
}: {
  text: string;
  currentWordIndex: number;
  showPrevious?: number;
  showNext?: number;
}) {
  const words = text.split(/\s+/);

  const getWordOpacity = (index: number): string => {
    if (index === currentWordIndex) return 'opacity-100';
    if (index < currentWordIndex && index >= currentWordIndex - showPrevious) {
      return 'opacity-40';
    }
    if (index > currentWordIndex && index <= currentWordIndex + showNext) {
      return 'opacity-60';
    }
    return 'opacity-10';
  };

  return (
    <div className="bg-white rounded-2xl shadow-xl p-8">
      <div className="text-4xl leading-loose text-center">
        {words.map((word, index) => {
          const isCurrent = index === currentWordIndex;

          return (
            <motion.span
              key={index}
              animate={{
                scale: isCurrent ? 1.2 : 1,
              }}
              className={`
                inline-block mx-2 transition-all duration-300
                ${getWordOpacity(index)}
                ${isCurrent ? 'text-primary-600 font-bold' : 'text-gray-700'}
              `}
            >
              {word}
            </motion.span>
          );
        })}
      </div>
    </div>
  );
}
