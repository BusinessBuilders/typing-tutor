/**
 * Case Practice Component
 * Step 153 - Uppercase and lowercase letter practice
 */

import { motion, AnimatePresence } from 'framer-motion';
import { useState, useEffect } from 'react';
import { useSettingsStore } from '../store/useSettingsStore';

export interface CasePracticeProps {
  letter: string;
  focusCase?: 'upper' | 'lower' | 'both';
  onComplete?: (accuracy: number) => void;
}

export default function CasePractice({
  letter,
  focusCase = 'both',
  onComplete,
}: CasePracticeProps) {
  const { settings } = useSettingsStore();
  const [currentCase, setCurrentCase] = useState<'upper' | 'lower'>(
    focusCase === 'both' ? (Math.random() > 0.5 ? 'upper' : 'lower') : focusCase
  );
  const [correct, setCorrect] = useState(0);
  const [attempts, setAttempts] = useState(0);

  const displayLetter = currentCase === 'upper' ? letter.toUpperCase() : letter.toLowerCase();

  const handleResponse = (isCorrect: boolean) => {
    setAttempts(attempts + 1);
    if (isCorrect) {
      setCorrect(correct + 1);
    }

    // Switch case for next round if practicing both
    if (focusCase === 'both') {
      setCurrentCase(currentCase === 'upper' ? 'lower' : 'upper');
    }

    // Complete after 10 attempts
    if (attempts + 1 >= 10) {
      onComplete?.((correct / (attempts + 1)) * 100);
    }
  };

  const accuracy = attempts > 0 ? (correct / attempts) * 100 : 0;

  return (
    <div className="bg-white rounded-2xl shadow-xl p-8">
      <h2 className="text-2xl font-bold text-gray-800 mb-6 text-center">
        Case Practice
      </h2>

      {/* Letter display */}
      <AnimatePresence mode="wait">
        <motion.div
          key={`${letter}-${currentCase}`}
          initial={{ opacity: 0, rotateY: 90 }}
          animate={{ opacity: 1, rotateY: 0 }}
          exit={{ opacity: 0, rotateY: -90 }}
          transition={{ duration: settings.reducedMotion ? 0 : 0.3 }}
          className="flex justify-center mb-8"
        >
          <div className="w-64 h-64 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-3xl flex items-center justify-center text-white shadow-2xl">
            <span className="text-9xl font-bold">{displayLetter}</span>
          </div>
        </motion.div>
      </AnimatePresence>

      {/* Question */}
      <div className="bg-blue-50 rounded-xl p-6 mb-6 text-center">
        <p className="text-xl text-blue-900 font-medium">
          Is this uppercase or lowercase?
        </p>
      </div>

      {/* Answer buttons */}
      <div className="grid grid-cols-2 gap-4 mb-6">
        <button
          onClick={() => handleResponse(currentCase === 'upper')}
          className="py-6 bg-primary-500 text-white rounded-xl font-bold text-xl hover:bg-primary-600 transition-colors"
        >
          Uppercase
        </button>
        <button
          onClick={() => handleResponse(currentCase === 'lower')}
          className="py-6 bg-purple-500 text-white rounded-xl font-bold text-xl hover:bg-purple-600 transition-colors"
        >
          Lowercase
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4">
        <div className="bg-gray-50 rounded-lg p-4 text-center">
          <div className="text-2xl font-bold text-gray-900">{attempts}</div>
          <div className="text-sm text-gray-600">Attempts</div>
        </div>
        <div className="bg-gray-50 rounded-lg p-4 text-center">
          <div className="text-2xl font-bold text-success-600">{correct}</div>
          <div className="text-sm text-gray-600">Correct</div>
        </div>
        <div className="bg-gray-50 rounded-lg p-4 text-center">
          <div className="text-2xl font-bold text-primary-600">
            {Math.round(accuracy)}%
          </div>
          <div className="text-sm text-gray-600">Accuracy</div>
        </div>
      </div>
    </div>
  );
}

// Case matching game
export function CaseMatchingGame() {
  const { settings } = useSettingsStore();
  const [matched, setMatched] = useState<Set<string>>(new Set());

  const pairs = [
    { upper: 'A', lower: 'a' },
    { upper: 'B', lower: 'b' },
    { upper: 'C', lower: 'c' },
    { upper: 'D', lower: 'd' },
    { upper: 'E', lower: 'e' },
  ];

  const handleMatch = (letter: string) => {
    setMatched(new Set([...matched, letter]));
  };

  return (
    <div className="bg-white rounded-2xl shadow-xl p-8">
      <h2 className="text-2xl font-bold text-gray-800 mb-6 text-center">
        Match Uppercase to Lowercase
      </h2>

      <div className="grid grid-cols-2 gap-8">
        {/* Uppercase column */}
        <div className="space-y-3">
          <h3 className="font-bold text-gray-700 text-center mb-4">Uppercase</h3>
          {pairs.map((pair) => (
            <motion.button
              key={pair.upper}
              onClick={() => handleMatch(pair.upper)}
              disabled={matched.has(pair.upper)}
              whileHover={{ scale: settings.reducedMotion ? 1 : 1.05 }}
              className={`w-full py-4 rounded-xl font-bold text-3xl transition-colors ${
                matched.has(pair.upper)
                  ? 'bg-success-500 text-white'
                  : 'bg-gray-100 text-gray-800 hover:bg-gray-200'
              }`}
            >
              {pair.upper}
            </motion.button>
          ))}
        </div>

        {/* Lowercase column */}
        <div className="space-y-3">
          <h3 className="font-bold text-gray-700 text-center mb-4">Lowercase</h3>
          {pairs.map((pair) => (
            <div
              key={pair.lower}
              className={`py-4 rounded-xl text-center font-bold text-3xl ${
                matched.has(pair.upper)
                  ? 'bg-success-500 text-white'
                  : 'bg-blue-50 text-gray-800'
              }`}
            >
              {pair.lower}
            </div>
          ))}
        </div>
      </div>

      {matched.size === pairs.length && (
        <motion.div
          initial={{ opacity: 0, scale: 0 }}
          animate={{ opacity: 1, scale: 1 }}
          className="mt-8 text-center text-4xl"
        >
          🎉 All matched!
        </motion.div>
      )}
    </div>
  );
}

// Case conversion practice
export function CaseConversionPractice() {
  const { settings } = useSettingsStore();
  const [currentLetter, setCurrentLetter] = useState(0);
  const [score, setScore] = useState(0);

  const exercises = [
    { given: 'A', ask: 'lowercase', answer: 'a' },
    { given: 'b', ask: 'uppercase', answer: 'B' },
    { given: 'C', ask: 'lowercase', answer: 'c' },
    { given: 'd', ask: 'uppercase', answer: 'D' },
    { given: 'E', ask: 'lowercase', answer: 'e' },
  ];

  const exercise = exercises[currentLetter];

  const handleAnswer = (answer: string) => {
    if (answer === exercise.answer) {
      setScore(score + 1);
    }

    if (currentLetter < exercises.length - 1) {
      setCurrentLetter(currentLetter + 1);
    }
  };

  return (
    <div className="bg-white rounded-2xl shadow-xl p-8">
      <h2 className="text-2xl font-bold text-gray-800 mb-6 text-center">
        Convert the Case
      </h2>

      <AnimatePresence mode="wait">
        <motion.div
          key={currentLetter}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
          transition={{ duration: settings.reducedMotion ? 0 : 0.3 }}
        >
          {/* Given letter */}
          <div className="text-center mb-8">
            <div className="text-8xl font-bold text-gray-900 mb-4">
              {exercise.given}
            </div>
            <div className="text-xl text-gray-700">
              What is this in {exercise.ask}?
            </div>
          </div>

          {/* Virtual keyboard for answer */}
          <div className="flex justify-center gap-3">
            {['a', 'b', 'c', 'd', 'e'].map((letter) => {
              const displayLetter = exercise.ask === 'uppercase'
                ? letter.toUpperCase()
                : letter.toLowerCase();

              return (
                <motion.button
                  key={letter}
                  onClick={() => handleAnswer(displayLetter)}
                  whileHover={{ scale: settings.reducedMotion ? 1 : 1.1 }}
                  whileTap={{ scale: settings.reducedMotion ? 1 : 0.95 }}
                  className="w-16 h-16 bg-primary-500 text-white rounded-xl font-bold text-2xl hover:bg-primary-600 transition-colors"
                >
                  {displayLetter}
                </motion.button>
              );
            })}
          </div>
        </motion.div>
      </AnimatePresence>

      {/* Progress */}
      <div className="mt-8 text-center text-gray-700">
        Question {currentLetter + 1} of {exercises.length} • Score: {score}
      </div>
    </div>
  );
}

// Mixed case typing practice
export function MixedCaseTyping() {
  const [currentWord, setCurrentWord] = useState(0);
  const [typed, setTyped] = useState('');

  const words = [
    'Hello',
    'World',
    'Apple',
    'Banana',
    'Cat',
  ];

  const word = words[currentWord];

  const handleKeyPress = (key: string) => {
    if (key === 'Backspace') {
      setTyped(typed.slice(0, -1));
      return;
    }

    const newTyped = typed + key;

    if (newTyped === word) {
      // Correct!
      setTyped('');
      if (currentWord < words.length - 1) {
        setCurrentWord(currentWord + 1);
      }
    } else if (word.startsWith(newTyped)) {
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
  }, [typed, word, currentWord]);

  return (
    <div className="bg-white rounded-2xl shadow-xl p-8">
      <h2 className="text-2xl font-bold text-gray-800 mb-6 text-center">
        Type with Correct Case
      </h2>

      {/* Target word */}
      <div className="bg-gray-50 rounded-xl p-8 mb-6 text-center">
        <div className="text-5xl font-bold text-gray-900 mb-2">
          {word}
        </div>
        <div className="text-sm text-gray-600">
          Type this word exactly as shown
        </div>
      </div>

      {/* Typed text */}
      <div className="bg-blue-50 rounded-xl p-6 mb-6">
        <div className="text-4xl font-mono text-center min-h-[60px]">
          {typed.split('').map((char, index) => {
            const isCorrect = char === word[index];
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

      {/* Hint */}
      <div className="text-center text-gray-600">
        Remember: Uppercase letters need the Shift key!
      </div>

      {/* Progress */}
      <div className="mt-6 text-center text-sm text-gray-500">
        Word {currentWord + 1} of {words.length}
      </div>
    </div>
  );
}

// Shift key trainer
export function ShiftKeyTrainer() {
  const [shiftPressed, setShiftPressed] = useState(false);
  const [capitalCount, setCapitalCount] = useState(0);

  const handleShiftPress = () => {
    setShiftPressed(true);
    setTimeout(() => setShiftPressed(false), 1000);
  };

  const handleCapitalType = () => {
    if (shiftPressed) {
      setCapitalCount(capitalCount + 1);
    }
  };

  return (
    <div className="bg-white rounded-2xl shadow-xl p-8">
      <h2 className="text-2xl font-bold text-gray-800 mb-6 text-center">
        Shift Key Practice
      </h2>

      <div className="space-y-8">
        {/* Shift key visualization */}
        <div className="flex justify-center">
          <motion.div
            animate={
              shiftPressed
                ? { scale: 1.1, backgroundColor: '#10b981' }
                : { scale: 1, backgroundColor: '#6b7280' }
            }
            className="w-48 h-24 rounded-xl flex items-center justify-center text-white font-bold text-2xl shadow-lg cursor-pointer"
            onClick={handleShiftPress}
          >
            ⇧ SHIFT
          </motion.div>
        </div>

        {/* Instructions */}
        <div className="bg-blue-50 rounded-xl p-6 text-center">
          <p className="text-lg text-blue-900">
            <span className="font-bold">Step 1:</span> Press and hold Shift
            <br />
            <span className="font-bold">Step 2:</span> Press a letter key
            <br />
            <span className="font-bold">Result:</span> Uppercase letter!
          </p>
        </div>

        {/* Practice area */}
        <div className="bg-gray-50 rounded-xl p-6">
          <div className="text-center mb-4">
            <div className="text-sm text-gray-600 mb-2">Capitals typed:</div>
            <div className="text-4xl font-bold text-primary-600">
              {capitalCount}
            </div>
          </div>

          <div className="flex justify-center gap-2">
            {['A', 'B', 'C', 'D', 'E'].map((letter) => (
              <button
                key={letter}
                onClick={handleCapitalType}
                className="w-12 h-12 bg-primary-500 text-white rounded-lg font-bold hover:bg-primary-600 transition-colors"
              >
                {letter}
              </button>
            ))}
          </div>
        </div>

        {capitalCount >= 5 && (
          <motion.div
            initial={{ opacity: 0, scale: 0 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-center text-4xl"
          >
            🎉 Great job!
          </motion.div>
        )}
      </div>
    </div>
  );
}

// Case-sensitive word list
export function CaseSensitiveWordList() {
  const words = [
    { correct: 'Hello', wrong: ['hello', 'HELLO', 'HeLLo'] },
    { correct: 'World', wrong: ['world', 'WORLD', 'WoRLd'] },
    { correct: 'Apple', wrong: ['apple', 'APPLE', 'ApPLe'] },
  ];

  return (
    <div className="bg-white rounded-2xl shadow-xl p-8">
      <h2 className="text-2xl font-bold text-gray-800 mb-6 text-center">
        Case Matters!
      </h2>

      <div className="space-y-6">
        {words.map((item, index) => (
          <div key={index} className="bg-gray-50 rounded-xl p-6">
            {/* Correct version */}
            <div className="flex items-center gap-4 mb-4">
              <div className="w-8 h-8 bg-success-500 rounded-full flex items-center justify-center text-white font-bold">
                ✓
              </div>
              <div className="text-3xl font-bold text-success-700">
                {item.correct}
              </div>
            </div>

            {/* Wrong versions */}
            <div className="space-y-2 ml-12">
              {item.wrong.map((wrong, wIndex) => (
                <div key={wIndex} className="flex items-center gap-4">
                  <div className="w-8 h-8 bg-red-500 rounded-full flex items-center justify-center text-white font-bold">
                    ✗
                  </div>
                  <div className="text-2xl font-medium text-red-600 line-through">
                    {wrong}
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      <div className="mt-6 bg-yellow-50 rounded-xl p-4 text-center">
        <p className="text-yellow-900">
          <span className="font-bold">💡 Tip:</span> Pay attention to which letters are uppercase!
        </p>
      </div>
    </div>
  );
}
