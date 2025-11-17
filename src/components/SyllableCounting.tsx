/**
 * Syllable Counting Component
 * Step 166 - Syllable counting and division exercises
 */

import { motion, AnimatePresence } from 'framer-motion';
import { useState } from 'react';
import { useSettingsStore } from '../store/useSettingsStore';

// Words with syllable information
export const SYLLABLE_WORDS = [
  { word: 'cat', syllables: ['cat'], count: 1 },
  { word: 'dog', syllables: ['dog'], count: 1 },
  { word: 'happy', syllables: ['hap', 'py'], count: 2 },
  { word: 'jumping', syllables: ['jump', 'ing'], count: 2 },
  { word: 'elephant', syllables: ['el', 'e', 'phant'], count: 3 },
  { word: 'beautiful', syllables: ['beau', 'ti', 'ful'], count: 3 },
  { word: 'butterfly', syllables: ['but', 'ter', 'fly'], count: 3 },
  { word: 'basketball', syllables: ['bas', 'ket', 'ball'], count: 3 },
  { word: 'watermelon', syllables: ['wa', 'ter', 'mel', 'on'], count: 4 },
  { word: 'refrigerator', syllables: ['re', 'frig', 'er', 'a', 'tor'], count: 5 },
  { word: 'apple', syllables: ['ap', 'ple'], count: 2 },
  { word: 'banana', syllables: ['ba', 'na', 'na'], count: 3 },
  { word: 'computer', syllables: ['com', 'pu', 'ter'], count: 3 },
  { word: 'pencil', syllables: ['pen', 'cil'], count: 2 },
  { word: 'rainbow', syllables: ['rain', 'bow'], count: 2 },
  { word: 'sunshine', syllables: ['sun', 'shine'], count: 2 },
  { word: 'tomorrow', syllables: ['to', 'mor', 'row'], count: 3 },
  { word: 'yesterday', syllables: ['yes', 'ter', 'day'], count: 3 },
];

export interface SyllableCountingProps {
  wordCount?: number;
  onComplete?: (accuracy: number) => void;
}

export default function SyllableCounting({
  wordCount = 5,
  onComplete,
}: SyllableCountingProps) {
  const { settings } = useSettingsStore();
  const [words] = useState(() =>
    SYLLABLE_WORDS.sort(() => Math.random() - 0.5).slice(0, wordCount)
  );

  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedCount, setSelectedCount] = useState<number | null>(null);
  const [correct, setCorrect] = useState(0);

  const current = words[currentIndex];

  const handleAnswer = (count: number) => {
    setSelectedCount(count);

    if (count === current.count) {
      setCorrect(correct + 1);
    }

    setTimeout(() => {
      if (currentIndex < words.length - 1) {
        setCurrentIndex(currentIndex + 1);
        setSelectedCount(null);
      } else {
        const accuracy = (correct / words.length) * 100;
        onComplete?.(accuracy);
      }
    }, 1500);
  };

  return (
    <div className="bg-white rounded-2xl shadow-xl p-8">
      <h2 className="text-2xl font-bold text-gray-800 mb-6 text-center">
        Count the Syllables
      </h2>

      {/* Word display */}
      <AnimatePresence mode="wait">
        <motion.div
          key={currentIndex}
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.8 }}
          transition={{ duration: settings.reducedMotion ? 0 : 0.3 }}
          className="mb-8"
        >
          <div className="bg-gradient-to-br from-teal-500 to-cyan-600 rounded-2xl p-8 mb-4 text-center">
            <div className="text-6xl font-bold text-white">
              {current.word}
            </div>
          </div>

          {/* Show syllables if answered */}
          {selectedCount !== null && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex justify-center gap-2"
            >
              {current.syllables.map((syllable, index) => (
                <motion.div
                  key={index}
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: index * 0.1 }}
                  className="px-4 py-2 bg-cyan-500 text-white rounded-lg font-bold text-xl"
                >
                  {syllable}
                </motion.div>
              ))}
            </motion.div>
          )}
        </motion.div>
      </AnimatePresence>

      {/* Number buttons */}
      <div className="grid grid-cols-5 gap-4 mb-6">
        {[1, 2, 3, 4, 5].map((num) => (
          <motion.button
            key={num}
            onClick={() => handleAnswer(num)}
            disabled={selectedCount !== null}
            whileHover={{ scale: selectedCount === null && !settings.reducedMotion ? 1.1 : 1 }}
            whileTap={{ scale: selectedCount === null && !settings.reducedMotion ? 0.95 : 1 }}
            className={`aspect-square rounded-xl font-bold text-3xl transition-colors ${
              selectedCount === num
                ? num === current.count
                  ? 'bg-success-500 text-white'
                  : 'bg-red-500 text-white'
                : 'bg-primary-100 text-primary-900 hover:bg-primary-200'
            }`}
          >
            {num}
          </motion.button>
        ))}
      </div>

      {/* Progress */}
      <div className="flex justify-between text-sm text-gray-600">
        <span>Word {currentIndex + 1} of {words.length}</span>
        <span className="font-bold text-success-600">{correct} correct</span>
      </div>
    </div>
  );
}

// Syllable clapping game
export function SyllableClappingGame({ word, syllables }: { word: string; syllables: string[] }) {
  const [claps, setClaps] = useState(0);
  const correctClaps = syllables.length;

  const handleClap = () => {
    setClaps(claps + 1);
  };

  return (
    <div className="bg-white rounded-2xl shadow-xl p-8">
      <h2 className="text-2xl font-bold text-gray-800 mb-6 text-center">
        Clap the Syllables
      </h2>

      <div className="bg-gradient-to-br from-pink-500 to-purple-600 rounded-2xl p-8 mb-6 text-center">
        <div className="text-6xl font-bold text-white mb-4">{word}</div>
        <div className="text-white text-sm">Clap once for each syllable</div>
      </div>

      <div className="mb-6">
        <motion.button
          onClick={handleClap}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className="w-full py-12 bg-yellow-400 hover:bg-yellow-500 rounded-2xl shadow-lg transition-colors"
        >
          <div className="text-6xl">👏</div>
          <div className="text-2xl font-bold text-gray-800 mt-2">CLAP!</div>
        </motion.button>
      </div>

      <div className="text-center mb-4">
        <div className="text-4xl font-bold text-gray-900">{claps} claps</div>
      </div>

      {claps === correctClaps && (
        <motion.div
          initial={{ opacity: 0, scale: 0 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-success-50 rounded-xl p-6 text-center"
        >
          <div className="text-4xl mb-2">🎉</div>
          <div className="text-xl font-bold text-success-900">
            Perfect! {word} has {correctClaps} syllable{correctClaps > 1 ? 's' : ''}!
          </div>
        </motion.div>
      )}
    </div>
  );
}

// Syllable division practice
export function SyllableDivision() {
  const [words] = useState(() =>
    SYLLABLE_WORDS.filter(w => w.count > 1).sort(() => Math.random() - 0.5).slice(0, 5)
  );

  const [currentIndex, setCurrentIndex] = useState(0);
  const [showDivision, setShowDivision] = useState(false);

  const current = words[currentIndex];

  return (
    <div className="bg-white rounded-2xl shadow-xl p-8">
      <h2 className="text-2xl font-bold text-gray-800 mb-6 text-center">
        Syllable Division
      </h2>

      <AnimatePresence mode="wait">
        <motion.div
          key={currentIndex}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
        >
          {/* Word */}
          <div className="bg-gray-50 rounded-xl p-6 mb-6 text-center">
            <div className="text-5xl font-bold text-gray-900">{current.word}</div>
          </div>

          {/* Divided syllables */}
          {showDivision ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex justify-center gap-2 mb-6"
            >
              {current.syllables.map((syllable, index) => (
                <motion.div
                  key={index}
                  initial={{ scale: 0, rotateY: 90 }}
                  animate={{ scale: 1, rotateY: 0 }}
                  transition={{ delay: index * 0.2 }}
                  className="relative"
                >
                  <div className="px-6 py-4 bg-primary-500 text-white rounded-xl font-bold text-3xl shadow-lg">
                    {syllable}
                  </div>
                  {index < current.syllables.length - 1 && (
                    <div className="absolute -right-3 top-1/2 -translate-y-1/2 text-2xl text-gray-400">
                      •
                    </div>
                  )}
                </motion.div>
              ))}
            </motion.div>
          ) : (
            <div className="text-center mb-6">
              <button
                onClick={() => setShowDivision(true)}
                className="px-8 py-4 bg-primary-500 text-white rounded-xl font-bold text-xl hover:bg-primary-600 transition-colors"
              >
                Show Syllables
              </button>
            </div>
          )}

          {/* Next button */}
          {showDivision && (
            <div className="text-center">
              <button
                onClick={() => {
                  if (currentIndex < words.length - 1) {
                    setCurrentIndex(currentIndex + 1);
                    setShowDivision(false);
                  }
                }}
                className="px-6 py-3 bg-gray-200 text-gray-700 rounded-lg font-bold hover:bg-gray-300 transition-colors"
              >
                Next Word →
              </button>
            </div>
          )}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
