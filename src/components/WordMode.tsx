/**
 * Word Mode Component
 * Step 161 - Main word practice mode
 */

import { motion, AnimatePresence } from 'framer-motion';
import { useState, useEffect } from 'react';
import { useSettingsStore } from '../store/useSettingsStore';

export interface WordPracticeProps {
  words: string[];
  onComplete?: (accuracy: number) => void;
  showHints?: boolean;
  allowMistakes?: boolean;
}

export default function WordMode({
  words,
  onComplete,
  showHints = true,
  allowMistakes = true,
}: WordPracticeProps) {
  const { settings } = useSettingsStore();
  const [currentWordIndex, setCurrentWordIndex] = useState(0);
  const [typed, setTyped] = useState('');
  const [correct, setCorrect] = useState(0);
  const [mistakes, setMistakes] = useState(0);

  const currentWord = words[currentWordIndex];

  const handleKeyPress = (key: string) => {
    if (key === 'Backspace') {
      setTyped(typed.slice(0, -1));
      return;
    }

    const newTyped = typed + key;

    // Check if character is correct
    if (key === currentWord[typed.length]) {
      setTyped(newTyped);

      // Word completed
      if (newTyped === currentWord) {
        setCorrect(correct + 1);
        setTyped('');

        if (currentWordIndex < words.length - 1) {
          setCurrentWordIndex(currentWordIndex + 1);
        } else {
          // All words completed
          const accuracy = (correct / words.length) * 100;
          onComplete?.(accuracy);
        }
      }
    } else {
      // Mistake
      setMistakes(mistakes + 1);
      if (!allowMistakes) {
        setTyped('');
      }
    }
  };

  // Connect keyboard input
  useEffect(() => {
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
  }, [typed, currentWord, currentWordIndex, correct, mistakes]);

  const progress = ((currentWordIndex / words.length) * 100);

  return (
    <div className="bg-white rounded-2xl shadow-xl p-8">
      <h2 className="text-3xl font-bold text-gray-800 mb-8 text-center">
        Word Practice
      </h2>

      {/* Progress bar */}
      <div className="mb-8">
        <div className="flex justify-between text-sm text-gray-600 mb-2">
          <span>Progress</span>
          <span>{currentWordIndex + 1} / {words.length}</span>
        </div>
        <div className="h-4 bg-gray-200 rounded-full overflow-hidden">
          <motion.div
            animate={{ width: `${progress}%` }}
            className="h-full bg-gradient-to-r from-primary-500 to-success-500"
          />
        </div>
      </div>

      {/* Current word display */}
      <AnimatePresence mode="wait">
        <motion.div
          key={currentWordIndex}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          transition={{ duration: settings.reducedMotion ? 0 : 0.3 }}
          className="bg-gray-50 rounded-xl p-8 mb-6"
        >
          <div className="text-5xl font-bold text-center text-gray-900 mb-4">
            {currentWord}
          </div>

          {showHints && (
            <div className="text-sm text-gray-600 text-center">
              Type this word
            </div>
          )}
        </motion.div>
      </AnimatePresence>

      {/* Typed text display */}
      <div className="bg-blue-50 rounded-xl p-6 mb-6">
        <div className="text-4xl font-mono text-center min-h-[60px]">
          {typed.split('').map((char, index) => {
            const isCorrect = char === currentWord[index];
            return (
              <motion.span
                key={index}
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                className={isCorrect ? 'text-success-600' : 'text-red-600'}
              >
                {char}
              </motion.span>
            );
          })}
          <span className="animate-pulse">|</span>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4">
        <div className="bg-gray-50 rounded-lg p-4 text-center">
          <div className="text-2xl font-bold text-gray-900">{currentWordIndex + 1}</div>
          <div className="text-sm text-gray-600">Current</div>
        </div>

        <div className="bg-gray-50 rounded-lg p-4 text-center">
          <div className="text-2xl font-bold text-success-600">{correct}</div>
          <div className="text-sm text-gray-600">Correct</div>
        </div>

        <div className="bg-gray-50 rounded-lg p-4 text-center">
          <div className="text-2xl font-bold text-red-600">{mistakes}</div>
          <div className="text-sm text-gray-600">Mistakes</div>
        </div>
      </div>
    </div>
  );
}

// Word list selector
export function WordListSelector({
  onSelectList,
  lists = [],
}: {
  onSelectList?: (list: string[]) => void;
  lists?: Array<{ name: string; words: string[]; difficulty: string }>;
}) {
  const { settings } = useSettingsStore();

  const defaultLists = [
    {
      name: 'Beginner Words',
      words: ['cat', 'dog', 'sun', 'hat', 'run'],
      difficulty: 'easy',
    },
    {
      name: 'CVC Words',
      words: ['bag', 'sit', 'top', 'fun', 'wet'],
      difficulty: 'easy',
    },
    {
      name: 'Common Words',
      words: ['the', 'and', 'you', 'for', 'are'],
      difficulty: 'medium',
    },
  ];

  const allLists = lists.length > 0 ? lists : defaultLists;

  return (
    <div className="bg-white rounded-2xl shadow-xl p-8">
      <h2 className="text-2xl font-bold text-gray-800 mb-6 text-center">
        Choose a Word List
      </h2>

      <div className="space-y-4">
        {allLists.map((list, index) => (
          <motion.button
            key={list.name}
            onClick={() => onSelectList?.(list.words)}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{
              delay: settings.reducedMotion ? 0 : index * 0.1,
            }}
            whileHover={{ scale: settings.reducedMotion ? 1 : 1.02 }}
            className="w-full bg-gray-50 hover:bg-primary-50 rounded-xl p-6 text-left transition-colors border-2 border-transparent hover:border-primary-500"
          >
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">
                  {list.name}
                </h3>
                <p className="text-sm text-gray-600">
                  {list.words.length} words • {list.difficulty}
                </p>
              </div>
              <div className="text-primary-600 text-2xl">→</div>
            </div>
          </motion.button>
        ))}
      </div>
    </div>
  );
}

// Quick word practice
export function QuickWordPractice({ word }: { word: string }) {
  const [typed, setTyped] = useState('');
  const [completed, setCompleted] = useState(false);

  const handleType = (char: string) => {
    if (char === 'Backspace') {
      setTyped(typed.slice(0, -1));
      return;
    }

    const newTyped = typed + char;

    if (newTyped === word) {
      setCompleted(true);
    } else if (word.startsWith(newTyped)) {
      setTyped(newTyped);
    }
  };

  // Connect keyboard input
  useEffect(() => {
    if (completed) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Backspace') {
        event.preventDefault();
        handleType('Backspace');
      } else if (event.key.length === 1) {
        handleType(event.key);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [typed, word, completed]);

  return (
    <div className="bg-gradient-to-br from-purple-500 to-pink-600 rounded-2xl shadow-xl p-8 text-white">
      <h3 className="text-xl font-bold mb-4 text-center">Practice Word</h3>

      <div className="bg-white bg-opacity-20 rounded-xl p-6 mb-4">
        <div className="text-4xl font-bold text-center mb-2">{word}</div>
      </div>

      <div className="bg-white bg-opacity-20 rounded-xl p-4">
        <div className="text-3xl font-mono text-center min-h-[50px]">
          {typed}
          {!completed && <span className="animate-pulse">|</span>}
        </div>
      </div>

      {completed && (
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          className="mt-4 text-center text-2xl"
        >
          🎉 Perfect!
        </motion.div>
      )}
    </div>
  );
}

// Word typing with image
export function WordWithImage({
  word,
  imageUrl,
}: {
  word: string;
  imageUrl?: string;
}) {
  const [typed] = useState('');

  return (
    <div className="bg-white rounded-2xl shadow-xl p-8">
      {/* Image */}
      {imageUrl && (
        <div className="mb-6 rounded-xl overflow-hidden">
          <img
            src={imageUrl}
            alt={word}
            className="w-full h-48 object-cover"
          />
        </div>
      )}

      {/* Word */}
      <div className="text-center mb-6">
        <div className="text-5xl font-bold text-gray-900 mb-2">{word}</div>
        <div className="text-sm text-gray-600">Type this word</div>
      </div>

      {/* Input area */}
      <div className="bg-blue-50 rounded-xl p-6">
        <div className="text-3xl font-mono text-center">
          {typed}
          <span className="animate-pulse">|</span>
        </div>
      </div>
    </div>
  );
}
