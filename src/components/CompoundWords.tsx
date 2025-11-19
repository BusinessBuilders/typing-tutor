/**
 * Compound Words Component
 * Step 165 - Compound word building and practice
 */

import { motion, AnimatePresence } from 'framer-motion';
import { useState, useEffect } from 'react';
import { useSettingsStore } from '../store/useSettingsStore';

// Common compound words split into their parts
export const COMPOUND_WORDS = [
  { word: 'airplane', parts: ['air', 'plane'] },
  { word: 'baseball', parts: ['base', 'ball'] },
  { word: 'birthday', parts: ['birth', 'day'] },
  { word: 'butterfly', parts: ['butter', 'fly'] },
  { word: 'classroom', parts: ['class', 'room'] },
  { word: 'cupcake', parts: ['cup', 'cake'] },
  { word: 'daylight', parts: ['day', 'light'] },
  { word: 'doghouse', parts: ['dog', 'house'] },
  { word: 'doorbell', parts: ['door', 'bell'] },
  { word: 'eggshell', parts: ['egg', 'shell'] },
  { word: 'firefly', parts: ['fire', 'fly'] },
  { word: 'football', parts: ['foot', 'ball'] },
  { word: 'goldfish', parts: ['gold', 'fish'] },
  { word: 'grandmother', parts: ['grand', 'mother'] },
  { word: 'haircut', parts: ['hair', 'cut'] },
  { word: 'homework', parts: ['home', 'work'] },
  { word: 'hotdog', parts: ['hot', 'dog'] },
  { word: 'jellyfish', parts: ['jelly', 'fish'] },
  { word: 'keyboard', parts: ['key', 'board'] },
  { word: 'lighthouse', parts: ['light', 'house'] },
  { word: 'mailbox', parts: ['mail', 'box'] },
  { word: 'moonlight', parts: ['moon', 'light'] },
  { word: 'notebook', parts: ['note', 'book'] },
  { word: 'pancake', parts: ['pan', 'cake'] },
  { word: 'playground', parts: ['play', 'ground'] },
  { word: 'rainbow', parts: ['rain', 'bow'] },
  { word: 'sandbox', parts: ['sand', 'box'] },
  { word: 'seashell', parts: ['sea', 'shell'] },
  { word: 'snowball', parts: ['snow', 'ball'] },
  { word: 'starfish', parts: ['star', 'fish'] },
  { word: 'sunflower', parts: ['sun', 'flower'] },
  { word: 'sunshine', parts: ['sun', 'shine'] },
  { word: 'toothbrush', parts: ['tooth', 'brush'] },
  { word: 'waterfall', parts: ['water', 'fall'] },
  { word: 'weekend', parts: ['week', 'end'] },
];

export interface CompoundWordsProps {
  wordCount?: number;
  onComplete?: (accuracy: number) => void;
}

export default function CompoundWords({
  wordCount = 5,
  onComplete,
}: CompoundWordsProps) {
  const { settings } = useSettingsStore();
  const [words] = useState(() =>
    COMPOUND_WORDS.sort(() => Math.random() - 0.5).slice(0, wordCount)
  );

  const [currentIndex, setCurrentIndex] = useState(0);
  const [typed, setTyped] = useState('');
  const [correct, setCorrect] = useState(0);

  const current = words[currentIndex];

  const handleKeyPress = (key: string) => {
    if (key === 'Backspace') {
      setTyped(typed.slice(0, -1));
      return;
    }

    const newTyped = typed + key.toLowerCase();

    if (newTyped === current.word) {
      setCorrect(correct + 1);
      setTyped('');

      if (currentIndex < words.length - 1) {
        setCurrentIndex(currentIndex + 1);
      } else {
        const accuracy = (correct / words.length) * 100;
        onComplete?.(accuracy);
      }
    } else if (current.word.startsWith(newTyped)) {
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
  }, [typed, current, currentIndex, correct]);

  return (
    <div className="bg-white rounded-2xl shadow-xl p-8">
      <h2 className="text-2xl font-bold text-gray-800 mb-6 text-center">
        Compound Words Practice
      </h2>

      {/* Word parts */}
      <AnimatePresence mode="wait">
        <motion.div
          key={currentIndex}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          transition={{ duration: settings.reducedMotion ? 0 : 0.3 }}
          className="mb-8"
        >
          {/* Show parts joining together */}
          <div className="flex justify-center items-center gap-4 mb-6">
            <motion.div
              initial={{ x: -50, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ delay: 0.2 }}
              className="px-6 py-4 bg-blue-500 text-white rounded-xl font-bold text-3xl shadow-lg"
            >
              {current.parts[0]}
            </motion.div>

            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.4 }}
              className="text-4xl text-gray-400"
            >
              +
            </motion.div>

            <motion.div
              initial={{ x: 50, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ delay: 0.2 }}
              className="px-6 py-4 bg-purple-500 text-white rounded-xl font-bold text-3xl shadow-lg"
            >
              {current.parts[1]}
            </motion.div>

            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.6 }}
              className="text-4xl text-gray-400"
            >
              =
            </motion.div>

            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.8 }}
              className="px-6 py-4 bg-gradient-to-r from-blue-500 to-purple-500 text-white rounded-xl font-bold text-3xl shadow-lg"
            >
              {current.word}
            </motion.div>
          </div>

          <div className="text-center text-sm text-gray-600">
            Two words joined together make a compound word!
          </div>
        </motion.div>
      </AnimatePresence>

      {/* Typing area */}
      <div className="bg-gray-50 rounded-xl p-6 mb-6">
        <div className="text-4xl font-mono text-center min-h-[60px]">
          {typed.split('').map((char, index) => (
            <span
              key={index}
              className={char === current.word[index] ? 'text-success-600' : 'text-red-600'}
            >
              {char}
            </span>
          ))}
          <span className="animate-pulse">|</span>
        </div>
      </div>

      {/* Progress */}
      <div className="flex justify-between text-sm text-gray-600">
        <span>Word {currentIndex + 1} of {words.length}</span>
        <span className="font-bold text-success-600">{correct} correct</span>
      </div>
    </div>
  );
}

// Compound word builder game
export function CompoundWordBuilder() {
  const { settings } = useSettingsStore();

  const word1Options = ['sun', 'rain', 'snow', 'star', 'fire'];
  const word2Options = ['bow', 'ball', 'fish', 'fly', 'flower'];

  const [word1, setWord1] = useState('');
  const [word2, setWord2] = useState('');

  const compound = word1 && word2 ? word1 + word2 : '';
  const isValid = compound && COMPOUND_WORDS.some(cw => cw.word === compound);

  return (
    <div className="bg-white rounded-2xl shadow-xl p-8">
      <h2 className="text-2xl font-bold text-gray-800 mb-6 text-center">
        Build Compound Words
      </h2>

      {/* Result display */}
      <div className="flex justify-center items-center gap-4 mb-8">
        <div className={`px-8 py-6 rounded-xl font-bold text-3xl shadow-lg ${
          word1 ? 'bg-blue-500 text-white' : 'bg-gray-200 text-gray-400'
        }`}>
          {word1 || '?'}
        </div>

        <div className="text-3xl text-gray-400">+</div>

        <div className={`px-8 py-6 rounded-xl font-bold text-3xl shadow-lg ${
          word2 ? 'bg-purple-500 text-white' : 'bg-gray-200 text-gray-400'
        }`}>
          {word2 || '?'}
        </div>
      </div>

      {/* Selection buttons */}
      <div className="space-y-4 mb-6">
        <div>
          <h3 className="text-sm font-bold text-gray-700 mb-2">First Word:</h3>
          <div className="flex gap-2">
            {word1Options.map((w) => (
              <motion.button
                key={w}
                onClick={() => setWord1(w)}
                whileHover={{ scale: settings.reducedMotion ? 1 : 1.05 }}
                className={`px-4 py-2 rounded-lg font-bold ${
                  word1 === w
                    ? 'bg-blue-500 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {w}
              </motion.button>
            ))}
          </div>
        </div>

        <div>
          <h3 className="text-sm font-bold text-gray-700 mb-2">Second Word:</h3>
          <div className="flex gap-2">
            {word2Options.map((w) => (
              <motion.button
                key={w}
                onClick={() => setWord2(w)}
                whileHover={{ scale: settings.reducedMotion ? 1 : 1.05 }}
                className={`px-4 py-2 rounded-lg font-bold ${
                  word2 === w
                    ? 'bg-purple-500 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {w}
              </motion.button>
            ))}
          </div>
        </div>
      </div>

      {/* Result */}
      {compound && (
        <motion.div
          initial={{ opacity: 0, scale: 0 }}
          animate={{ opacity: 1, scale: 1 }}
          className={`text-center p-6 rounded-xl ${
            isValid
              ? 'bg-success-50 border-2 border-success-500'
              : 'bg-red-50 border-2 border-red-500'
          }`}
        >
          <div className={`text-4xl font-bold mb-2 ${
            isValid ? 'text-success-700' : 'text-red-700'
          }`}>
            {compound}
          </div>
          <div className={`text-sm ${
            isValid ? 'text-success-600' : 'text-red-600'
          }`}>
            {isValid ? '✓ Valid compound word!' : '✗ Not a compound word'}
          </div>
        </motion.div>
      )}
    </div>
  );
}

// Compound word matching game
export function CompoundWordMatching() {
  const [pairs] = useState(() =>
    COMPOUND_WORDS.sort(() => Math.random() - 0.5).slice(0, 5)
  );

  const [selectedPart1, setSelectedPart1] = useState<string | null>(null);
  const [matched, setMatched] = useState<Set<string>>(new Set());

  const handleSelectPart2 = (part2: string) => {
    if (!selectedPart1) return;

    const compound = selectedPart1 + part2;
    if (pairs.some(p => p.word === compound)) {
      setMatched(new Set([...matched, compound]));
    }

    setSelectedPart1(null);
  };

  return (
    <div className="bg-white rounded-2xl shadow-xl p-8">
      <h2 className="text-2xl font-bold text-gray-800 mb-6 text-center">
        Match to Make Compound Words
      </h2>

      <div className="grid grid-cols-2 gap-8">
        {/* First parts */}
        <div className="space-y-3">
          <h3 className="font-bold text-gray-700 text-center mb-4">
            First Part
          </h3>
          {pairs.map((pair) => {
            const isMatched = matched.has(pair.word);
            return (
              <motion.button
                key={pair.parts[0]}
                onClick={() => !isMatched && setSelectedPart1(pair.parts[0])}
                disabled={isMatched}
                whileHover={{ scale: isMatched ? 1 : 1.02 }}
                className={`w-full py-4 rounded-xl font-bold text-xl transition-colors ${
                  isMatched
                    ? 'bg-success-500 text-white'
                    : selectedPart1 === pair.parts[0]
                    ? 'bg-blue-500 text-white'
                    : 'bg-gray-100 text-gray-800 hover:bg-blue-100'
                }`}
              >
                {pair.parts[0]}
              </motion.button>
            );
          })}
        </div>

        {/* Second parts */}
        <div className="space-y-3">
          <h3 className="font-bold text-gray-700 text-center mb-4">
            Second Part
          </h3>
          {pairs.map((pair) => {
            const isMatched = matched.has(pair.word);
            return (
              <motion.button
                key={pair.parts[1]}
                onClick={() => handleSelectPart2(pair.parts[1])}
                disabled={isMatched}
                whileHover={{ scale: isMatched ? 1 : 1.02 }}
                className={`w-full py-4 rounded-xl font-bold text-xl transition-colors ${
                  isMatched
                    ? 'bg-success-500 text-white'
                    : 'bg-gray-100 text-gray-800 hover:bg-purple-100'
                }`}
              >
                {pair.parts[1]}
              </motion.button>
            );
          })}
        </div>
      </div>

      {/* Instruction */}
      {selectedPart1 && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mt-6 bg-blue-50 rounded-xl p-4 text-center"
        >
          <div className="text-blue-900 font-medium">
            Selected: <span className="font-bold">{selectedPart1}</span>
            <br />
            Now choose the second part
          </div>
        </motion.div>
      )}

      {/* Completion */}
      {matched.size === pairs.length && (
        <motion.div
          initial={{ opacity: 0, scale: 0 }}
          animate={{ opacity: 1, scale: 1 }}
          className="mt-6 text-center text-4xl"
        >
          🎉 All matched!
        </motion.div>
      )}
    </div>
  );
}

// Split compound word game
export function SplitCompoundWord() {
  const [words] = useState(() =>
    COMPOUND_WORDS.sort(() => Math.random() - 0.5).slice(0, 8)
  );

  const [currentIndex, setCurrentIndex] = useState(0);
  const [splits, setSplits] = useState<Record<string, string[]>>({});

  const current = words[currentIndex];
  const hasSplit = splits[current.word];

  const handleSplit = () => {
    setSplits({
      ...splits,
      [current.word]: current.parts,
    });

    setTimeout(() => {
      if (currentIndex < words.length - 1) {
        setCurrentIndex(currentIndex + 1);
      }
    }, 1500);
  };

  return (
    <div className="bg-white rounded-2xl shadow-xl p-8">
      <h2 className="text-2xl font-bold text-gray-800 mb-6 text-center">
        Split the Compound Word
      </h2>

      {/* Current word */}
      <AnimatePresence mode="wait">
        <motion.div
          key={currentIndex}
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.8 }}
          className="mb-8"
        >
          <div className="bg-gradient-to-br from-indigo-500 to-purple-600 rounded-2xl p-8 mb-6 text-center">
            <div className="text-6xl font-bold text-white mb-2">
              {current.word}
            </div>
            <div className="text-white text-sm">
              Can you split this into two words?
            </div>
          </div>

          {/* Split result */}
          {hasSplit ? (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex justify-center items-center gap-4"
            >
              <div className="px-6 py-4 bg-blue-500 text-white rounded-xl font-bold text-3xl">
                {current.parts[0]}
              </div>
              <div className="text-2xl text-gray-400">+</div>
              <div className="px-6 py-4 bg-purple-500 text-white rounded-xl font-bold text-3xl">
                {current.parts[1]}
              </div>
            </motion.div>
          ) : (
            <div className="text-center">
              <button
                onClick={handleSplit}
                className="px-8 py-4 bg-primary-500 text-white rounded-xl font-bold text-xl hover:bg-primary-600 transition-colors shadow-lg"
              >
                Split Word
              </button>
            </div>
          )}
        </motion.div>
      </AnimatePresence>

      {/* Progress */}
      <div className="text-center text-gray-600">
        Word {currentIndex + 1} of {words.length}
      </div>
    </div>
  );
}
