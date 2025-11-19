/**
 * Sentence Completion Component
 * Step 176 - Complete sentences with missing words
 */

import { motion, AnimatePresence } from 'framer-motion';
import { useState, useEffect } from 'react';
import { useSettingsStore } from '../store/useSettingsStore';

// Sentence completion exercises
export const COMPLETION_EXERCISES = [
  {
    sentence: 'The cat ___ on the mat.',
    options: ['sits', 'runs', 'flies'],
    correct: 'sits',
    complete: 'The cat sits on the mat.',
  },
  {
    sentence: 'I like to ___ books.',
    options: ['read', 'eat', 'throw'],
    correct: 'read',
    complete: 'I like to read books.',
  },
  {
    sentence: 'The sun is very ___.',
    options: ['cold', 'hot', 'wet'],
    correct: 'hot',
    complete: 'The sun is very hot.',
  },
  {
    sentence: 'We ___ to school every day.',
    options: ['go', 'sleep', 'eat'],
    correct: 'go',
    complete: 'We go to school every day.',
  },
  {
    sentence: 'The bird can ___ in the sky.',
    options: ['swim', 'fly', 'walk'],
    correct: 'fly',
    complete: 'The bird can fly in the sky.',
  },
];

// Fill in the blank exercises
export const FILL_IN_BLANK = [
  { sentence: 'The dog ___ fast.', blank: 'runs', hint: 'action word' },
  { sentence: 'She has ___ apples.', blank: 'two', hint: 'a number' },
  { sentence: 'The sky is ___.', blank: 'blue', hint: 'a color' },
  { sentence: 'I am ___ years old.', blank: 'six', hint: 'your age' },
];

export interface SentenceCompletionProps {
  exerciseCount?: number;
  onComplete?: (accuracy: number) => void;
}

export default function SentenceCompletion({
  exerciseCount = 5,
  onComplete,
}: SentenceCompletionProps) {
  const { settings } = useSettingsStore();
  const [exercises] = useState(() =>
    COMPLETION_EXERCISES.slice(0, exerciseCount)
  );

  const [currentIndex, setCurrentIndex] = useState(0);
  const [selected, setSelected] = useState<string | null>(null);
  const [correct, setCorrect] = useState(0);

  const current = exercises[currentIndex];

  const handleSelect = (option: string) => {
    setSelected(option);

    if (option === current.correct) {
      setCorrect(correct + 1);
    }

    setTimeout(() => {
      if (currentIndex < exercises.length - 1) {
        setCurrentIndex(currentIndex + 1);
        setSelected(null);
      } else {
        const accuracy = (correct / exercises.length) * 100;
        onComplete?.(accuracy);
      }
    }, 1500);
  };

  return (
    <div className="bg-white rounded-2xl shadow-xl p-8">
      <h2 className="text-2xl font-bold text-gray-800 mb-6 text-center">
        Complete the Sentence
      </h2>

      {/* Sentence with blank */}
      <AnimatePresence mode="wait">
        <motion.div
          key={currentIndex}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          transition={{ duration: settings.reducedMotion ? 0 : 0.3 }}
          className="bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl p-8 mb-6 text-center"
        >
          <div className="text-3xl font-medium text-white">
            {current.sentence.split('___').map((part, index, arr) => (
              <span key={index}>
                {part}
                {index < arr.length - 1 && (
                  <span className="inline-block min-w-[120px] border-b-4 border-yellow-300 mx-2">
                    {selected || '___'}
                  </span>
                )}
              </span>
            ))}
          </div>
        </motion.div>
      </AnimatePresence>

      {/* Word options */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        {current.options.map((option) => {
          const isCorrect = option === current.correct;
          const showResult = selected !== null;

          return (
            <motion.button
              key={option}
              onClick={() => handleSelect(option)}
              disabled={selected !== null}
              whileHover={{ scale: selected === null && !settings.reducedMotion ? 1.05 : 1 }}
              className={`py-6 rounded-xl font-bold text-xl transition-colors ${
                showResult
                  ? isCorrect
                    ? 'bg-success-500 text-white'
                    : selected === option
                    ? 'bg-red-500 text-white'
                    : 'bg-gray-200 text-gray-400'
                  : 'bg-primary-100 text-primary-900 hover:bg-primary-200'
              }`}
            >
              {option}
            </motion.button>
          );
        })}
      </div>

      {/* Progress */}
      <div className="flex justify-between text-sm text-gray-600">
        <span>Sentence {currentIndex + 1} of {exercises.length}</span>
        <span className="font-bold text-success-600">{correct} correct</span>
      </div>
    </div>
  );
}

// Fill in the blank typing
export function FillInBlankTyping() {
  const [exercises] = useState(FILL_IN_BLANK);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [typed, setTyped] = useState('');

  const current = exercises[currentIndex];

  const handleKeyPress = (key: string) => {
    if (key === 'Backspace') {
      setTyped(typed.slice(0, -1));
      return;
    }

    const newTyped = typed + key.toLowerCase();

    if (newTyped === current.blank.toLowerCase()) {
      setTimeout(() => {
        if (currentIndex < exercises.length - 1) {
          setCurrentIndex(currentIndex + 1);
          setTyped('');
        }
      }, 1000);
    } else if (current.blank.toLowerCase().startsWith(newTyped)) {
      setTyped(newTyped);
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
  }, [typed, current, currentIndex]);

  return (
    <div className="bg-white rounded-2xl shadow-xl p-8">
      <h2 className="text-2xl font-bold text-gray-800 mb-6 text-center">
        Fill in the Blank
      </h2>

      {/* Sentence */}
      <div className="bg-gray-50 rounded-xl p-6 mb-4 text-center">
        <div className="text-2xl font-medium text-gray-900">
          {current.sentence}
        </div>
      </div>

      {/* Hint */}
      <div className="bg-blue-50 rounded-xl p-3 mb-6 text-center">
        <div className="text-sm text-blue-900">
          Hint: <span className="font-bold">{current.hint}</span>
        </div>
      </div>

      {/* Typing area */}
      <div className="bg-yellow-50 rounded-xl p-6 mb-6">
        <div className="text-3xl font-mono text-center min-h-[60px]">
          {typed.split('').map((char, index) => (
            <span
              key={index}
              className={char === current.blank[index]?.toLowerCase() ? 'text-success-600' : 'text-red-600'}
            >
              {char}
            </span>
          ))}
          <span className="animate-pulse">|</span>
        </div>
      </div>

      {/* Progress */}
      <div className="text-center text-gray-600">
        Exercise {currentIndex + 1} of {exercises.length}
      </div>
    </div>
  );
}

// Multiple blanks
export function MultipleBlanksCompletion() {
  const [exercise] = useState({
    sentence: 'The ___ cat ___ on the ___ mat.',
    blanks: ['big', 'sits', 'red'],
    options: ['big', 'sits', 'red', 'small', 'runs', 'blue'],
  });

  const [filled, setFilled] = useState<string[]>([]);

  const handleSelectWord = (word: string) => {
    if (filled.length < exercise.blanks.length) {
      setFilled([...filled, word]);
    }
  };

  const handleReset = () => {
    setFilled([]);
  };

  const isComplete = filled.length === exercise.blanks.length;
  const isCorrect = isComplete && filled.every((word, index) => word === exercise.blanks[index]);

  return (
    <div className="bg-white rounded-2xl shadow-xl p-8">
      <h2 className="text-2xl font-bold text-gray-800 mb-6 text-center">
        Fill All the Blanks
      </h2>

      {/* Sentence with blanks */}
      <div className="bg-gradient-to-br from-teal-500 to-cyan-600 rounded-xl p-8 mb-6 text-center">
        <div className="text-2xl font-medium text-white">
          {exercise.sentence.split('___').map((part, index, arr) => (
            <span key={index}>
              {part}
              {index < arr.length - 1 && (
                <span className="inline-block min-w-[100px] border-b-4 border-yellow-300 mx-2 font-bold">
                  {filled[index] || '___'}
                </span>
              )}
            </span>
          ))}
        </div>
      </div>

      {/* Word options */}
      <div className="mb-6">
        <div className="flex flex-wrap gap-3 justify-center">
          {exercise.options
            .filter(word => !filled.includes(word))
            .map((word) => (
              <motion.button
                key={word}
                onClick={() => handleSelectWord(word)}
                whileHover={{ scale: 1.05 }}
                className="px-6 py-3 bg-primary-100 text-primary-900 rounded-lg font-bold hover:bg-primary-200 transition-colors"
              >
                {word}
              </motion.button>
            ))}
        </div>
      </div>

      {/* Controls */}
      <div className="flex justify-center">
        <button
          onClick={handleReset}
          className="px-8 py-3 bg-gray-200 text-gray-700 rounded-lg font-bold hover:bg-gray-300 transition-colors"
        >
          Reset
        </button>
      </div>

      {/* Feedback */}
      {isComplete && (
        <motion.div
          initial={{ opacity: 0, scale: 0 }}
          animate={{ opacity: 1, scale: 1 }}
          className={`mt-6 rounded-xl p-6 text-center ${
            isCorrect
              ? 'bg-success-50'
              : 'bg-red-50'
          }`}
        >
          <div className={`text-2xl font-bold ${
            isCorrect ? 'text-success-900' : 'text-red-900'
          }`}>
            {isCorrect ? '✓ Perfect!' : '✗ Try again!'}
          </div>
        </motion.div>
      )}
    </div>
  );
}
