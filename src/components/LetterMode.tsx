/**
 * Letter Mode Component
 * Step 151 - Individual letter learning and practice
 */

import { motion, AnimatePresence } from 'framer-motion';
import { useState, useEffect } from 'react';
import { useSettingsStore } from '../store/useSettingsStore';

export interface LetterPracticeProps {
  letter: string;
  onComplete?: (accuracy: number) => void;
  showHints?: boolean;
}

export default function LetterMode({
  letter,
  onComplete,
  showHints = true,
}: LetterPracticeProps) {
  const { settings } = useSettingsStore();
  const [attempts, setAttempts] = useState(0);
  const [correct, setCorrect] = useState(0);

  const handleKeyPress = (key: string) => {
    setAttempts(attempts + 1);

    if (key.toLowerCase() === letter.toLowerCase()) {
      setCorrect(correct + 1);

      // Complete after 5 successful attempts
      if (correct + 1 >= 5) {
        const accuracy = ((correct + 1) / (attempts + 1)) * 100;
        onComplete?.(accuracy);
      }
    }
  };

  // Connect keyboard input
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      // Only handle alphanumeric keys
      if (event.key.length === 1 && /[a-zA-Z]/.test(event.key)) {
        handleKeyPress(event.key);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [attempts, correct, letter]);

  const accuracy = attempts > 0 ? (correct / attempts) * 100 : 0;

  return (
    <div className="bg-white rounded-2xl shadow-xl p-8">
      <h2 className="text-3xl font-bold text-gray-800 mb-8 text-center">
        Letter Practice: {letter.toUpperCase()}
      </h2>

      {/* Large letter display */}
      <div className="flex justify-center mb-8">
        <motion.div
          animate={
            settings.reducedMotion
              ? {}
              : {
                  scale: [1, 1.1, 1],
                  rotate: [0, 5, -5, 0],
                }
          }
          transition={{ duration: 2, repeat: Infinity }}
          className="w-48 h-48 bg-gradient-to-br from-primary-500 to-purple-600 rounded-3xl flex items-center justify-center text-white text-9xl font-bold shadow-2xl"
        >
          {letter.toUpperCase()}
        </motion.div>
      </div>

      {/* Instructions */}
      {showHints && (
        <div className="bg-blue-50 rounded-xl p-6 mb-6 text-center">
          <p className="text-xl text-blue-900 font-medium">
            Press the <span className="font-bold text-3xl">{letter.toUpperCase()}</span> key
          </p>
        </div>
      )}

      {/* Progress */}
      <div className="mb-6">
        <div className="flex justify-between text-sm text-gray-600 mb-2">
          <span>Progress</span>
          <span>{correct} / 5 correct</span>
        </div>
        <div className="h-4 bg-gray-200 rounded-full overflow-hidden">
          <motion.div
            animate={{ width: `${(correct / 5) * 100}%` }}
            className="h-full bg-success-500"
          />
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4">
        <div className="bg-gray-50 rounded-lg p-4 text-center">
          <div className="text-3xl font-bold text-gray-900">{attempts}</div>
          <div className="text-sm text-gray-600">Attempts</div>
        </div>

        <div className="bg-gray-50 rounded-lg p-4 text-center">
          <div className="text-3xl font-bold text-success-600">{correct}</div>
          <div className="text-sm text-gray-600">Correct</div>
        </div>

        <div className="bg-gray-50 rounded-lg p-4 text-center">
          <div className="text-3xl font-bold text-primary-600">
            {Math.round(accuracy)}%
          </div>
          <div className="text-sm text-gray-600">Accuracy</div>
        </div>
      </div>
    </div>
  );
}

// Letter selection menu
export function LetterSelector({
  onSelect,
  masteredLetters = [],
}: {
  onSelect?: (letter: string) => void;
  masteredLetters?: string[];
}) {
  const { settings } = useSettingsStore();
  const alphabet = 'abcdefghijklmnopqrstuvwxyz'.split('');

  return (
    <div className="bg-white rounded-2xl shadow-xl p-8">
      <h2 className="text-3xl font-bold text-gray-800 mb-8 text-center">
        Choose a Letter
      </h2>

      <div className="grid grid-cols-6 md:grid-cols-9 gap-3">
        {alphabet.map((letter, index) => {
          const isMastered = masteredLetters.includes(letter);

          return (
            <motion.button
              key={letter}
              onClick={() => onSelect?.(letter)}
              initial={{ opacity: 0, scale: 0 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{
                delay: settings.reducedMotion ? 0 : index * 0.02,
              }}
              whileHover={{ scale: settings.reducedMotion ? 1 : 1.1 }}
              whileTap={{ scale: settings.reducedMotion ? 1 : 0.95 }}
              className={`aspect-square rounded-xl font-bold text-2xl transition-colors ${
                isMastered
                  ? 'bg-success-500 text-white'
                  : 'bg-gray-100 text-gray-800 hover:bg-primary-100 hover:text-primary-700'
              }`}
            >
              {letter.toUpperCase()}
              {isMastered && (
                <div className="text-xs mt-1">✓</div>
              )}
            </motion.button>
          );
        })}
      </div>
    </div>
  );
}

// Uppercase and lowercase letter practice
export function LetterCasePractice({ letter }: { letter: string }) {
  const { settings } = useSettingsStore();
  const [showingCase, setShowingCase] = useState<'upper' | 'lower'>('upper');

  return (
    <div className="bg-white rounded-2xl shadow-xl p-8">
      <h2 className="text-2xl font-bold text-gray-800 mb-6 text-center">
        Uppercase & Lowercase
      </h2>

      {/* Toggle buttons */}
      <div className="flex gap-4 justify-center mb-8">
        <button
          onClick={() => setShowingCase('upper')}
          className={`px-6 py-3 rounded-lg font-bold transition-colors ${
            showingCase === 'upper'
              ? 'bg-primary-500 text-white'
              : 'bg-gray-200 text-gray-700'
          }`}
        >
          Uppercase
        </button>
        <button
          onClick={() => setShowingCase('lower')}
          className={`px-6 py-3 rounded-lg font-bold transition-colors ${
            showingCase === 'lower'
              ? 'bg-primary-500 text-white'
              : 'bg-gray-200 text-gray-700'
          }`}
        >
          Lowercase
        </button>
      </div>

      {/* Letter display */}
      <AnimatePresence mode="wait">
        <motion.div
          key={showingCase}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          transition={{ duration: settings.reducedMotion ? 0 : 0.3 }}
          className="flex justify-center"
        >
          <div className="w-64 h-64 bg-gradient-to-br from-blue-500 to-purple-600 rounded-3xl flex items-center justify-center text-white shadow-2xl">
            <span className="text-9xl font-bold">
              {showingCase === 'upper' ? letter.toUpperCase() : letter.toLowerCase()}
            </span>
          </div>
        </motion.div>
      </AnimatePresence>

      {/* Both cases side by side */}
      <div className="mt-8 flex justify-center gap-8">
        <div className="text-center">
          <div className="text-6xl font-bold text-gray-800 mb-2">
            {letter.toUpperCase()}
          </div>
          <div className="text-sm text-gray-600">Uppercase</div>
        </div>

        <div className="text-center">
          <div className="text-6xl font-bold text-gray-800 mb-2">
            {letter.toLowerCase()}
          </div>
          <div className="text-sm text-gray-600">Lowercase</div>
        </div>
      </div>
    </div>
  );
}

// Animated letter tracing
export function LetterTracing({ letter }: { letter: string }) {
  const [traceProgress, setTraceProgress] = useState(0);

  const handleTrace = () => {
    if (traceProgress < 100) {
      setTraceProgress(traceProgress + 10);
    }
  };

  return (
    <div className="bg-white rounded-2xl shadow-xl p-8">
      <h2 className="text-2xl font-bold text-gray-800 mb-6 text-center">
        Trace the Letter
      </h2>

      {/* Large letter outline */}
      <div className="flex justify-center mb-6">
        <div className="relative w-64 h-64 bg-gray-50 rounded-2xl border-4 border-dashed border-gray-300 flex items-center justify-center">
          <div className="text-9xl font-bold text-gray-300 select-none">
            {letter.toUpperCase()}
          </div>

          {/* Trace overlay */}
          <div
            className="absolute inset-0 bg-primary-500 opacity-20 rounded-2xl"
            style={{ clipPath: `inset(0 ${100 - traceProgress}% 0 0)` }}
          />
        </div>
      </div>

      {/* Progress */}
      <div className="mb-6">
        <div className="text-sm text-gray-600 mb-2 text-center">
          Tracing Progress: {traceProgress}%
        </div>
        <div className="h-4 bg-gray-200 rounded-full overflow-hidden">
          <div
            className="h-full bg-primary-500 transition-all duration-300"
            style={{ width: `${traceProgress}%` }}
          />
        </div>
      </div>

      {/* Trace button */}
      <div className="flex justify-center">
        <button
          onClick={handleTrace}
          disabled={traceProgress >= 100}
          className="px-8 py-4 bg-primary-500 text-white rounded-lg font-bold hover:bg-primary-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {traceProgress >= 100 ? 'Complete!' : 'Trace →'}
        </button>
      </div>

      {traceProgress >= 100 && (
        <motion.div
          initial={{ opacity: 0, scale: 0 }}
          animate={{ opacity: 1, scale: 1 }}
          className="mt-6 text-center text-4xl"
        >
          🎉 Great job!
        </motion.div>
      )}
    </div>
  );
}

// Letter memory game
export function LetterMemoryGame({
  targetLetter,
  distractorCount = 5,
}: {
  targetLetter: string;
  distractorCount?: number;
}) {
  const { settings } = useSettingsStore();
  const [foundCount, setFoundCount] = useState(0);
  const [clicks, setClicks] = useState(0);

  // Generate random letters with target letter mixed in
  const generateLetters = () => {
    const letters: string[] = [];
    const alphabet = 'abcdefghijklmnopqrstuvwxyz';

    // Add target letters
    for (let i = 0; i < 3; i++) {
      letters.push(targetLetter);
    }

    // Add distractors
    for (let i = 0; i < distractorCount; i++) {
      let randomLetter;
      do {
        randomLetter = alphabet[Math.floor(Math.random() * alphabet.length)];
      } while (randomLetter === targetLetter);
      letters.push(randomLetter);
    }

    // Shuffle
    return letters.sort(() => Math.random() - 0.5);
  };

  const [letters] = useState(generateLetters());
  const [revealed, setRevealed] = useState<Set<number>>(new Set());

  const handleLetterClick = (index: number, letter: string) => {
    if (revealed.has(index)) return;

    setClicks(clicks + 1);

    if (letter === targetLetter) {
      setRevealed(new Set([...revealed, index]));
      setFoundCount(foundCount + 1);
    }
  };

  const isComplete = foundCount >= 3;

  return (
    <div className="bg-white rounded-2xl shadow-xl p-8">
      <h2 className="text-2xl font-bold text-gray-800 mb-4 text-center">
        Find All the {targetLetter.toUpperCase()}'s
      </h2>

      <div className="text-center mb-6">
        <div className="text-lg text-gray-700">
          Found: {foundCount} / 3
        </div>
      </div>

      {/* Letter grid */}
      <div className="grid grid-cols-4 gap-4 mb-6">
        {letters.map((letter, index) => {
          const isRevealed = revealed.has(index);

          return (
            <motion.button
              key={index}
              onClick={() => handleLetterClick(index, letter)}
              disabled={isRevealed}
              whileHover={{ scale: settings.reducedMotion ? 1 : 1.05 }}
              whileTap={{ scale: settings.reducedMotion ? 1 : 0.95 }}
              className={`aspect-square rounded-xl font-bold text-4xl transition-colors ${
                isRevealed
                  ? 'bg-success-500 text-white'
                  : 'bg-gray-100 text-gray-800 hover:bg-gray-200'
              }`}
            >
              {letter.toUpperCase()}
            </motion.button>
          );
        })}
      </div>

      {/* Result */}
      {isComplete && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-success-50 rounded-xl p-6 text-center"
        >
          <div className="text-4xl mb-2">🎉</div>
          <div className="text-xl font-bold text-success-900 mb-2">
            Perfect!
          </div>
          <div className="text-sm text-success-700">
            You found all {foundCount} letters in {clicks} clicks!
          </div>
        </motion.div>
      )}
    </div>
  );
}

// Letter sound association (for phonics)
export function LetterSoundAssociation({ letter }: { letter: string }) {
  const [playing, setPlaying] = useState(false);

  const playSound = () => {
    setPlaying(true);
    // In a real app, this would play the letter sound
    setTimeout(() => setPlaying(false), 1000);
  };

  const commonWords = {
    a: ['Apple', 'Ant', 'Airplane'],
    b: ['Ball', 'Bear', 'Boat'],
    c: ['Cat', 'Car', 'Cake'],
    d: ['Dog', 'Duck', 'Drum'],
    e: ['Elephant', 'Egg', 'Earth'],
    // ... more letters
  };

  const words = commonWords[letter.toLowerCase() as keyof typeof commonWords] || [''];

  return (
    <div className="bg-white rounded-2xl shadow-xl p-8">
      <h2 className="text-2xl font-bold text-gray-800 mb-6 text-center">
        {letter.toUpperCase()} says...
      </h2>

      {/* Letter with sound button */}
      <div className="flex justify-center mb-8">
        <button
          onClick={playSound}
          className="relative group"
        >
          <motion.div
            animate={playing ? { scale: [1, 1.1, 1] } : {}}
            transition={{ duration: 0.5 }}
            className="w-48 h-48 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-3xl flex items-center justify-center text-white text-9xl font-bold shadow-2xl"
          >
            {letter.toUpperCase()}
          </motion.div>

          {!playing && (
            <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-0 group-hover:bg-opacity-20 rounded-3xl transition-opacity">
              <div className="text-white text-4xl">🔊</div>
            </div>
          )}
        </button>
      </div>

      {/* Example words */}
      <div className="bg-blue-50 rounded-xl p-6">
        <h3 className="font-bold text-gray-800 mb-3 text-center">
          Words that start with {letter.toUpperCase()}
        </h3>

        <div className="flex flex-wrap justify-center gap-3">
          {words.map((word, index) => (
            <div
              key={index}
              className="px-4 py-2 bg-white rounded-lg font-medium text-gray-800"
            >
              <span className="text-primary-600 font-bold text-xl">
                {letter.toUpperCase()}
              </span>
              {word.slice(1)}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
