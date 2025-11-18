/**
 * Sentence Mode Component
 * Step 171 - Main sentence practice mode
 */

import { motion, AnimatePresence } from 'framer-motion';
import { useState, useEffect } from 'react';
import { useSettingsStore } from '../store/useSettingsStore';

// Sample sentences by difficulty
export const SAMPLE_SENTENCES = {
  easy: [
    'The cat sat.',
    'I like dogs.',
    'The sun is hot.',
    'We can run fast.',
    'The bird can fly.',
    'I see a tree.',
    'The dog is big.',
    'We love to play.',
    'The car is red.',
    'I want ice cream.',
  ],
  medium: [
    'The quick brown fox jumps over the lazy dog.',
    'I went to the store to buy some milk.',
    'She likes to read books in the library.',
    'We played in the park all afternoon.',
    'The rainbow appeared after the storm.',
    'My favorite color is blue like the sky.',
    'The butterfly landed on the beautiful flower.',
    'He ran quickly to catch the school bus.',
  ],
  hard: [
    'The magnificent elephant wandered through the dense jungle.',
    'Scientists discovered a fascinating new species of butterfly.',
    'The adventurous children explored the mysterious ancient castle.',
    'She carefully arranged the colorful flowers in the crystal vase.',
    'The determined athlete trained vigorously for the championship.',
    'The brilliant sunset painted the sky with orange and purple.',
  ],
};

export interface SentenceModeProps {
  difficulty?: 'easy' | 'medium' | 'hard';
  sentenceCount?: number;
  onComplete?: (wpm: number, accuracy: number) => void;
}

export default function SentenceMode({
  difficulty = 'medium',
  sentenceCount = 5,
  onComplete,
}: SentenceModeProps) {
  const { settings } = useSettingsStore();
  const [sentences] = useState(() =>
    SAMPLE_SENTENCES[difficulty].slice(0, sentenceCount)
  );

  const [currentIndex, setCurrentIndex] = useState(0);
  const [typed, setTyped] = useState('');
  const [correct, setCorrect] = useState(0);
  const [startTime] = useState(Date.now());
  const [mistakes, setMistakes] = useState(0);

  const currentSentence = sentences[currentIndex];

  const handleKeyPress = (key: string) => {
    if (key === 'Backspace') {
      setTyped(typed.slice(0, -1));
      return;
    }

    const newTyped = typed + key;

    // Check character accuracy
    if (key === currentSentence[typed.length]) {
      setTyped(newTyped);

      // Sentence completed
      if (newTyped === currentSentence) {
        setCorrect(correct + 1);
        setTyped('');

        if (currentIndex < sentences.length - 1) {
          setCurrentIndex(currentIndex + 1);
        } else {
          // Calculate WPM and accuracy
          const timeElapsed = (Date.now() - startTime) / 60000; // minutes
          const totalChars = sentences.join('').length;
          const wpm = Math.round(totalChars / 5 / timeElapsed);
          const accuracy = ((totalChars - mistakes) / totalChars) * 100;
          onComplete?.(wpm, accuracy);
        }
      }
    } else {
      setMistakes(mistakes + 1);
    }
  };

  // Connect keyboard input
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      // Prevent default for backspace (don't navigate back)
      if (event.key === 'Backspace') {
        event.preventDefault();
      }

      // Handle special keys
      if (event.key === 'Backspace') {
        handleKeyPress('Backspace');
      } else if (event.key.length === 1) {
        // Regular character
        handleKeyPress(event.key);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [typed, currentSentence, currentIndex, correct, mistakes]);

  const progress = ((currentIndex + 1) / sentences.length) * 100;

  return (
    <div className="bg-white rounded-2xl shadow-xl p-8">
      <h2 className="text-2xl font-bold text-gray-800 mb-6 text-center">
        Sentence Practice - {difficulty.charAt(0).toUpperCase() + difficulty.slice(1)}
      </h2>

      {/* Progress */}
      <div className="mb-6">
        <div className="flex justify-between text-sm text-gray-600 mb-2">
          <span>Progress</span>
          <span>{currentIndex + 1} / {sentences.length}</span>
        </div>
        <div className="h-3 bg-gray-200 rounded-full overflow-hidden">
          <motion.div
            animate={{ width: `${progress}%` }}
            className="h-full bg-primary-500"
          />
        </div>
      </div>

      {/* Current sentence */}
      <AnimatePresence mode="wait">
        <motion.div
          key={currentIndex}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          transition={{ duration: settings.reducedMotion ? 0 : 0.3 }}
          className="bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl p-6 mb-6 text-center"
        >
          <div className="text-2xl font-medium text-white">
            {currentSentence}
          </div>
        </motion.div>
      </AnimatePresence>

      {/* Typed text */}
      <div className="bg-gray-50 rounded-xl p-6 mb-6">
        <div className="text-2xl font-mono min-h-[80px]">
          {typed.split('').map((char, index) => {
            const isCorrect = char === currentSentence[index];
            return (
              <span
                key={index}
                className={isCorrect ? 'text-success-600' : 'text-red-600'}
              >
                {char}
              </span>
            );
          })}
          <span className="animate-pulse">|</span>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4">
        <div className="bg-gray-50 rounded-lg p-4 text-center">
          <div className="text-2xl font-bold text-gray-900">{currentIndex + 1}</div>
          <div className="text-sm text-gray-600">Current</div>
        </div>

        <div className="bg-gray-50 rounded-lg p-4 text-center">
          <div className="text-2xl font-bold text-success-600">{correct}</div>
          <div className="text-sm text-gray-600">Completed</div>
        </div>

        <div className="bg-gray-50 rounded-lg p-4 text-center">
          <div className="text-2xl font-bold text-red-600">{mistakes}</div>
          <div className="text-sm text-gray-600">Mistakes</div>
        </div>
      </div>
    </div>
  );
}

// Sentence difficulty selector
export function SentenceDifficultySelector({
  onSelectDifficulty,
}: {
  onSelectDifficulty?: (difficulty: 'easy' | 'medium' | 'hard') => void;
}) {
  const { settings } = useSettingsStore();

  const difficulties: Array<{
    key: 'easy' | 'medium' | 'hard';
    name: string;
    description: string;
    color: string;
  }> = [
    {
      key: 'easy',
      name: 'Easy',
      description: 'Short, simple sentences',
      color: 'from-green-400 to-teal-500',
    },
    {
      key: 'medium',
      name: 'Medium',
      description: 'Longer sentences with more words',
      color: 'from-blue-400 to-indigo-500',
    },
    {
      key: 'hard',
      name: 'Hard',
      description: 'Complex sentences with big words',
      color: 'from-purple-400 to-pink-500',
    },
  ];

  return (
    <div className="bg-white rounded-2xl shadow-xl p-8">
      <h2 className="text-2xl font-bold text-gray-800 mb-6 text-center">
        Choose Difficulty
      </h2>

      <div className="space-y-4">
        {difficulties.map((diff, index) => (
          <motion.button
            key={diff.key}
            onClick={() => onSelectDifficulty?.(diff.key)}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{
              delay: settings.reducedMotion ? 0 : index * 0.1,
            }}
            whileHover={{ scale: settings.reducedMotion ? 1 : 1.02 }}
            className={`w-full bg-gradient-to-r ${diff.color} text-white rounded-xl p-6 shadow-lg hover:shadow-xl transition-shadow`}
          >
            <div className="flex items-center justify-between">
              <div className="text-left">
                <h3 className="text-2xl font-bold mb-1">{diff.name}</h3>
                <p className="text-sm opacity-90">{diff.description}</p>
                <p className="text-xs opacity-75 mt-1">
                  {SAMPLE_SENTENCES[diff.key].length} sentences available
                </p>
              </div>
              <div className="text-3xl">→</div>
            </div>
          </motion.button>
        ))}
      </div>
    </div>
  );
}

// Sentence word-by-word practice
export function SentenceWordByWord({ sentence }: { sentence: string }) {
  const words = sentence.split(' ');
  const [currentWordIndex, setCurrentWordIndex] = useState(0);
  const [typed, setTyped] = useState('');
  const [completed, setCompleted] = useState(false);

  const currentWord = words[currentWordIndex];

  const handleKeyPress = (key: string) => {
    if (key === 'Backspace') {
      setTyped(typed.slice(0, -1));
      return;
    }

    const newTyped = typed + key;

    if (newTyped === currentWord) {
      setTyped('');
      if (currentWordIndex < words.length - 1) {
        setCurrentWordIndex(currentWordIndex + 1);
      } else {
        setCompleted(true);
      }
    } else if (currentWord.startsWith(newTyped)) {
      setTyped(newTyped);
    }
  };

  // Connect keyboard input
  useEffect(() => {
    if (completed) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Backspace') {
        event.preventDefault();
        handleKeyPress('Backspace');
      } else if (event.key.length === 1) {
        handleKeyPress(event.key);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [typed, currentWord, currentWordIndex, completed]);

  return (
    <div className="bg-white rounded-2xl shadow-xl p-8">
      <h2 className="text-2xl font-bold text-gray-800 mb-6 text-center">
        Type Word by Word
      </h2>

      {/* Sentence with current word highlighted */}
      <div className="bg-gray-50 rounded-xl p-6 mb-6">
        <div className="text-2xl text-center flex flex-wrap justify-center gap-2">
          {words.map((word, index) => (
            <span
              key={index}
              className={`${
                index < currentWordIndex
                  ? 'text-success-600'
                  : index === currentWordIndex
                  ? 'text-primary-600 font-bold'
                  : 'text-gray-400'
              }`}
            >
              {word}
            </span>
          ))}
        </div>
      </div>

      {/* Current word typing */}
      {!completed && (
        <div className="bg-primary-50 rounded-xl p-6 mb-6">
          <div className="text-3xl font-mono text-center">
            {typed.split('').map((char, index) => (
              <span
                key={index}
                className={char === currentWord[index] ? 'text-success-600' : 'text-red-600'}
              >
                {char}
              </span>
            ))}
            <span className="animate-pulse">|</span>
          </div>
        </div>
      )}

      {/* Progress */}
      <div className="text-center text-gray-600">
        {completed ? (
          <motion.div
            initial={{ opacity: 0, scale: 0 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-4xl"
          >
            🎉 Sentence complete!
          </motion.div>
        ) : (
          <div>Word {currentWordIndex + 1} of {words.length}</div>
        )}
      </div>
    </div>
  );
}
