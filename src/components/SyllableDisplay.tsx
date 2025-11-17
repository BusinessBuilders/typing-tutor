/**
 * Syllable Display Component
 * Step 135 - Display text with syllable breaks for easier reading
 */

import { motion } from 'framer-motion';
import { useSettingsStore } from '../store/useSettingsStore';
import { getSyllables, countSyllables } from '../utils/syllableBreaker';

export interface SyllableDisplayProps {
  text: string;
  separator?: string;
  highlightSyllables?: boolean;
  colorCode?: boolean;
  showCount?: boolean;
}

export default function SyllableDisplay({
  text,
  separator = '·',
  highlightSyllables = true,
  colorCode = false,
  showCount = false,
}: SyllableDisplayProps) {
  const { settings } = useSettingsStore();
  const words = text.split(/\s+/);

  const syllableColors = [
    'text-blue-600',
    'text-purple-600',
    'text-green-600',
    'text-orange-600',
    'text-pink-600',
  ];

  return (
    <div className="bg-white rounded-2xl shadow-xl p-8">
      <div className="text-3xl leading-relaxed">
        {words.map((word, wordIndex) => {
          const syllables = getSyllables(word);
          const syllableCount = syllables.length;

          return (
            <span key={wordIndex} className="inline-block mx-2 my-1">
              {syllables.map((syllable, syllableIndex) => (
                <span key={syllableIndex}>
                  <motion.span
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{
                      delay: settings.reducedMotion
                        ? 0
                        : (wordIndex * syllableCount + syllableIndex) * 0.02,
                    }}
                    className={`
                      ${highlightSyllables ? 'hover:bg-yellow-100 transition-colors' : ''}
                      ${colorCode ? syllableColors[syllableIndex % syllableColors.length] : 'text-gray-800'}
                      font-medium
                    `}
                  >
                    {syllable}
                  </motion.span>

                  {/* Syllable separator */}
                  {syllableIndex < syllables.length - 1 && (
                    <span className="text-gray-400 text-sm mx-0.5">{separator}</span>
                  )}
                </span>
              ))}

              {/* Syllable count badge */}
              {showCount && syllableCount > 1 && (
                <sup className="ml-1 text-xs text-primary-600 font-bold">
                  {syllableCount}
                </sup>
              )}
            </span>
          );
        })}
      </div>
    </div>
  );
}

// Syllable-by-syllable reveal
export function SyllableRevealDisplay({
  word,
  revealedSyllableIndex,
}: {
  word: string;
  revealedSyllableIndex: number;
}) {
  const { settings } = useSettingsStore();
  const syllables = getSyllables(word);

  return (
    <div className="bg-white rounded-2xl shadow-xl p-8 text-center">
      <div className="text-6xl font-bold">
        {syllables.map((syllable, index) => {
          const isRevealed = index <= revealedSyllableIndex;
          const isCurrent = index === revealedSyllableIndex;

          return (
            <motion.span
              key={index}
              initial={{ opacity: 0, scale: 0 }}
              animate={{
                opacity: isRevealed ? 1 : 0.2,
                scale: isCurrent ? 1.2 : 1,
              }}
              transition={{
                duration: settings.reducedMotion ? 0 : 0.3,
              }}
              className={`
                inline-block mx-1
                ${isCurrent ? 'text-primary-600' : 'text-gray-700'}
                ${!isRevealed ? 'blur-sm' : ''}
              `}
            >
              {syllable}
            </motion.span>
          );
        })}
      </div>

      {/* Progress indicator */}
      <div className="mt-6 text-sm text-gray-600">
        Syllable {Math.min(revealedSyllableIndex + 1, syllables.length)} of{' '}
        {syllables.length}
      </div>
    </div>
  );
}

// Interactive syllable practice
export function SyllablePractice({
  word,
  onSyllableClick,
}: {
  word: string;
  onSyllableClick?: (syllable: string, index: number) => void;
}) {
  const { settings } = useSettingsStore();
  const syllables = getSyllables(word);

  return (
    <div className="bg-white rounded-2xl shadow-xl p-8">
      <h3 className="text-lg font-bold text-gray-800 mb-4 text-center">
        Tap each syllable to practice
      </h3>

      <div className="flex justify-center gap-4">
        {syllables.map((syllable, index) => (
          <motion.button
            key={index}
            onClick={() => onSyllableClick?.(syllable, index)}
            whileHover={{ scale: settings.reducedMotion ? 1 : 1.1 }}
            whileTap={{ scale: settings.reducedMotion ? 1 : 0.9 }}
            className="px-8 py-6 bg-gradient-to-br from-primary-400 to-primary-600 text-white rounded-2xl shadow-lg font-bold text-4xl"
          >
            {syllable}
          </motion.button>
        ))}
      </div>

      {/* Word reconstruction */}
      <div className="mt-8 text-center">
        <div className="text-sm text-gray-600 mb-2">Complete word:</div>
        <div className="text-5xl font-bold text-gray-800">{word}</div>
      </div>
    </div>
  );
}

// Syllable breakdown with phonetic guide
export function SyllableBreakdown({ word }: { word: string }) {
  const syllables = getSyllables(word);

  return (
    <div className="bg-white rounded-xl shadow-lg p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-bold text-gray-800">Syllable Breakdown</h3>
        <span className="text-sm text-gray-600">{syllables.length} syllables</span>
      </div>

      <div className="space-y-3">
        {syllables.map((syllable, index) => (
          <div
            key={index}
            className="flex items-center space-x-4 p-3 bg-gray-50 rounded-lg"
          >
            <div className="w-12 h-12 bg-primary-500 text-white rounded-full flex items-center justify-center font-bold">
              {index + 1}
            </div>

            <div className="flex-1">
              <div className="text-2xl font-bold text-gray-800">{syllable}</div>
            </div>

            <div className="w-12 h-12 bg-success-100 text-success-600 rounded-full flex items-center justify-center font-bold text-lg">
              ✓
            </div>
          </div>
        ))}
      </div>

      {/* Combined view */}
      <div className="mt-6 p-4 bg-primary-50 rounded-lg text-center">
        <div className="text-sm text-gray-600 mb-2">Full word:</div>
        <div className="text-4xl font-bold text-gray-800">
          {syllables.map((syllable, index) => (
            <span key={index}>
              <span className="text-primary-600">{syllable}</span>
              {index < syllables.length - 1 && (
                <span className="text-gray-400">·</span>
              )}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}

// Syllable difficulty indicator
export function SyllableDifficultyDisplay({ words }: { words: string[] }) {
  const getDifficulty = (syllableCount: number): {
    level: string;
    color: string;
    emoji: string;
  } => {
    if (syllableCount === 1)
      return { level: 'Easy', color: 'bg-green-100 text-green-800', emoji: '😊' };
    if (syllableCount === 2)
      return { level: 'Medium', color: 'bg-yellow-100 text-yellow-800', emoji: '🤔' };
    if (syllableCount === 3)
      return { level: 'Hard', color: 'bg-orange-100 text-orange-800', emoji: '💪' };
    return {
      level: 'Very Hard',
      color: 'bg-red-100 text-red-800',
      emoji: '🚀',
    };
  };

  return (
    <div className="bg-white rounded-2xl shadow-xl p-8">
      {/* Legend */}
      <div className="flex flex-wrap gap-3 mb-6 text-sm">
        <div className="flex items-center space-x-2">
          <div className="w-4 h-4 bg-green-100 rounded"></div>
          <span>1 syllable</span>
        </div>
        <div className="flex items-center space-x-2">
          <div className="w-4 h-4 bg-yellow-100 rounded"></div>
          <span>2 syllables</span>
        </div>
        <div className="flex items-center space-x-2">
          <div className="w-4 h-4 bg-orange-100 rounded"></div>
          <span>3 syllables</span>
        </div>
        <div className="flex items-center space-x-2">
          <div className="w-4 h-4 bg-red-100 rounded"></div>
          <span>4+ syllables</span>
        </div>
      </div>

      {/* Words with difficulty */}
      <div className="flex flex-wrap gap-3">
        {words.map((word, index) => {
          const syllableCount = countSyllables(word);
          const difficulty = getDifficulty(syllableCount);

          return (
            <motion.div
              key={index}
              initial={{ opacity: 0, scale: 0 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: index * 0.05 }}
              className={`${difficulty.color} px-4 py-2 rounded-lg font-medium`}
            >
              <span className="mr-2">{difficulty.emoji}</span>
              {word}
              <sup className="ml-1 text-xs">{syllableCount}</sup>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
