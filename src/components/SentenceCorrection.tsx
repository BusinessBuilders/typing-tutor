/**
 * Sentence Correction Component
 * Step 177 - Find and fix mistakes in sentences
 */

import { motion, AnimatePresence } from 'framer-motion';
import { useState } from 'react';
import { useSettingsStore } from '../store/useSettingsStore';

// Sentences with errors to correct
export const CORRECTION_EXERCISES = [
  {
    incorrect: 'the cat is sleeping',
    correct: 'The cat is sleeping.',
    errorType: 'Capitalization and punctuation',
  },
  {
    incorrect: 'She go to school',
    correct: 'She goes to school.',
    errorType: 'Verb agreement',
  },
  {
    incorrect: 'i like apples',
    correct: 'I like apples.',
    errorType: 'Capital I',
  },
  {
    incorrect: 'Where is my book',
    correct: 'Where is my book?',
    errorType: 'Question mark',
  },
  {
    incorrect: 'The dog run fast',
    correct: 'The dog runs fast.',
    errorType: 'Verb form',
  },
];

export interface SentenceCorrectionProps {
  exerciseCount?: number;
  onComplete?: (accuracy: number) => void;
}

export default function SentenceCorrection({
  exerciseCount = 5,
  onComplete,
}: SentenceCorrectionProps) {
  const { settings } = useSettingsStore();
  const [exercises] = useState(() =>
    CORRECTION_EXERCISES.slice(0, exerciseCount)
  );

  const [currentIndex, setCurrentIndex] = useState(0);
  const [typed, setTyped] = useState('');
  const [correct, setCorrect] = useState(0);

  const current = exercises[currentIndex];

  // TODO: Connect to keyboard input
  // @ts-expect-error - Function will be used when keyboard input is implemented
  const handleKeyPress = (key: string) => {
    if (key === 'Backspace') {
      setTyped(typed.slice(0, -1));
      return;
    }

    const newTyped = typed + key;

    if (newTyped === current.correct) {
      setCorrect(correct + 1);
      setTyped('');

      if (currentIndex < exercises.length - 1) {
        setCurrentIndex(currentIndex + 1);
      } else {
        const accuracy = (correct / exercises.length) * 100;
        onComplete?.(accuracy);
      }
    } else if (current.correct.startsWith(newTyped)) {
      setTyped(newTyped);
    }
  };

  return (
    <div className="bg-white rounded-2xl shadow-xl p-8">
      <h2 className="text-2xl font-bold text-gray-800 mb-6 text-center">
        Fix the Sentence
      </h2>

      {/* Incorrect sentence */}
      <AnimatePresence mode="wait">
        <motion.div
          key={currentIndex}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          transition={{ duration: settings.reducedMotion ? 0 : 0.3 }}
          className="bg-red-50 rounded-xl p-6 mb-4 text-center"
        >
          <div className="text-sm text-red-900 mb-2">Incorrect:</div>
          <div className="text-2xl font-medium text-red-700 line-through">
            {current.incorrect}
          </div>
        </motion.div>
      </AnimatePresence>

      {/* Error type hint */}
      <div className="bg-yellow-50 rounded-xl p-3 mb-6 text-center">
        <div className="text-sm text-yellow-900">
          Error: <span className="font-bold">{current.errorType}</span>
        </div>
      </div>

      {/* Typing area */}
      <div className="bg-gray-50 rounded-xl p-6 mb-6">
        <div className="text-2xl font-mono min-h-[60px]">
          {typed.split('').map((char, index) => (
            <span
              key={index}
              className={char === current.correct[index] ? 'text-success-600' : 'text-red-600'}
            >
              {char}
            </span>
          ))}
          <span className="animate-pulse">|</span>
        </div>
      </div>

      {/* Progress */}
      <div className="flex justify-between text-sm text-gray-600">
        <span>Sentence {currentIndex + 1} of {exercises.length}</span>
        <span className="font-bold text-success-600">{correct} correct</span>
      </div>
    </div>
  );
}

// Spot the error
export function SpotTheError() {
  const [sentences] = useState([
    { text: 'the cat sleeps.', errorIndex: 0, correct: 'T', explanation: 'Start with capital letter' },
    { text: 'She go home.', errorIndex: 4, correct: 'goes', explanation: 'Verb should be "goes"' },
    { text: 'Where is it', errorIndex: 10, correct: '?', explanation: 'Question needs question mark' },
  ]);

  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);

  const current = sentences[currentIndex];

  const handleSelect = (index: number) => {
    setSelectedIndex(index);

    if (index === current.errorIndex) {
      setTimeout(() => {
        if (currentIndex < sentences.length - 1) {
          setCurrentIndex(currentIndex + 1);
          setSelectedIndex(null);
        }
      }, 2000);
    }
  };

  return (
    <div className="bg-white rounded-2xl shadow-xl p-8">
      <h2 className="text-2xl font-bold text-gray-800 mb-6 text-center">
        Spot the Error
      </h2>

      <div className="bg-blue-50 rounded-xl p-4 mb-6 text-center">
        <div className="text-sm text-blue-900">
          Click on the word or letter that has an error
        </div>
      </div>

      {/* Sentence with clickable parts */}
      <div className="bg-gray-50 rounded-xl p-8 mb-6">
        <div className="text-3xl font-mono flex flex-wrap justify-center gap-1">
          {current.text.split('').map((char, index) => (
            <motion.button
              key={index}
              onClick={() => char !== ' ' && handleSelect(index)}
              disabled={char === ' ' || selectedIndex !== null}
              whileHover={{ scale: char !== ' ' && selectedIndex === null ? 1.1 : 1 }}
              className={`min-w-[40px] h-14 flex items-center justify-center rounded ${
                char === ' '
                  ? 'cursor-default'
                  : selectedIndex === index
                  ? index === current.errorIndex
                    ? 'bg-success-500 text-white'
                    : 'bg-red-500 text-white'
                  : 'bg-gray-200 text-gray-800 hover:bg-primary-100'
              }`}
            >
              {char === ' ' ? '\u00A0' : char}
            </motion.button>
          ))}
        </div>
      </div>

      {/* Feedback */}
      {selectedIndex !== null && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className={`rounded-xl p-4 text-center ${
            selectedIndex === current.errorIndex
              ? 'bg-success-50 text-success-900'
              : 'bg-red-50 text-red-900'
          }`}
        >
          <div className="font-bold mb-1">
            {selectedIndex === current.errorIndex ? '✓ Correct!' : '✗ Try again'}
          </div>
          {selectedIndex === current.errorIndex && (
            <div className="text-sm">{current.explanation}</div>
          )}
        </motion.div>
      )}
    </div>
  );
}

// Before and after comparison
export function BeforeAfterComparison() {
  const [examples] = useState([
    {
      before: 'the dog run fast',
      after: 'The dog runs fast.',
      changes: ['Capitalized "The"', 'Changed "run" to "runs"', 'Added period'],
    },
    {
      before: 'she like ice cream',
      after: 'She likes ice cream.',
      changes: ['Capitalized "She"', 'Changed "like" to "likes"', 'Added period'],
    },
  ]);

  const [currentIndex, setCurrentIndex] = useState(0);

  const current = examples[currentIndex];

  return (
    <div className="bg-white rounded-2xl shadow-xl p-8">
      <h2 className="text-2xl font-bold text-gray-800 mb-6 text-center">
        Before & After
      </h2>

      {/* Before */}
      <div className="bg-red-50 rounded-xl p-6 mb-4">
        <div className="text-sm text-red-900 font-bold mb-2">Before (Incorrect):</div>
        <div className="text-xl font-medium text-red-700 line-through">
          {current.before}
        </div>
      </div>

      {/* After */}
      <div className="bg-green-50 rounded-xl p-6 mb-6">
        <div className="text-sm text-green-900 font-bold mb-2">After (Correct):</div>
        <div className="text-xl font-medium text-green-700">
          {current.after}
        </div>
      </div>

      {/* Changes made */}
      <div className="bg-blue-50 rounded-xl p-6 mb-6">
        <div className="text-sm text-blue-900 font-bold mb-3">Changes Made:</div>
        <ul className="space-y-2">
          {current.changes.map((change, index) => (
            <li key={index} className="text-blue-700 flex items-start">
              <span className="text-blue-500 mr-2">•</span>
              {change}
            </li>
          ))}
        </ul>
      </div>

      {/* Navigation */}
      <div className="flex justify-center gap-4">
        <button
          onClick={() => currentIndex > 0 && setCurrentIndex(currentIndex - 1)}
          disabled={currentIndex === 0}
          className="px-6 py-3 bg-gray-200 text-gray-700 rounded-lg font-bold hover:bg-gray-300 disabled:opacity-50 transition-colors"
        >
          ← Previous
        </button>
        <button
          onClick={() => currentIndex < examples.length - 1 && setCurrentIndex(currentIndex + 1)}
          disabled={currentIndex === examples.length - 1}
          className="px-6 py-3 bg-primary-500 text-white rounded-lg font-bold hover:bg-primary-600 disabled:opacity-50 transition-colors"
        >
          Next →
        </button>
      </div>
    </div>
  );
}
