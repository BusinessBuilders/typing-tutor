/**
 * Letter Discrimination Component
 * Step 157 - Distinguishing similar-looking letters
 */

import { motion } from 'framer-motion';
import { useState } from 'react';
import { useSettingsStore } from '../store/useSettingsStore';

// Similar letter pairs that are often confused
const SIMILAR_PAIRS = [
  { letters: ['b', 'd'], name: 'b vs d' },
  { letters: ['p', 'q'], name: 'p vs q' },
  { letters: ['m', 'n'], name: 'm vs n' },
  { letters: ['u', 'v'], name: 'u vs v' },
  { letters: ['i', 'l'], name: 'i vs l' },
];

export default function LetterDiscrimination({ pair = ['b', 'd'] }: { pair?: string[] }) {
  const { settings } = useSettingsStore();
  const [currentIndex, setCurrentIndex] = useState(0);
  const [score, setScore] = useState(0);

  const questions = [
    { letter: pair[0], correct: 0 },
    { letter: pair[1], correct: 1 },
    { letter: pair[0], correct: 0 },
  ];

  const question = questions[currentIndex];

  const handleAnswer = (index: number) => {
    if (index === question.correct) {
      setScore(score + 1);
    }
    setCurrentIndex(currentIndex + 1);
  };

  return (
    <div className="bg-white rounded-2xl shadow-xl p-8">
      <h2 className="text-2xl font-bold text-gray-800 mb-6 text-center">
        Letter Discrimination: {pair[0].toUpperCase()} vs {pair[1].toUpperCase()}
      </h2>

      <div className="w-64 h-64 mx-auto bg-gradient-to-br from-teal-500 to-cyan-600 rounded-3xl flex items-center justify-center text-white text-9xl font-bold shadow-2xl mb-8">
        {question?.letter.toUpperCase() || ''}
      </div>

      <div className="flex justify-center gap-6">
        {pair.map((letter, index) => (
          <motion.button
            key={letter}
            onClick={() => handleAnswer(index)}
            whileHover={{ scale: settings.reducedMotion ? 1 : 1.1 }}
            className="w-32 h-32 bg-primary-500 text-white rounded-2xl font-bold text-5xl hover:bg-primary-600 transition-colors shadow-lg"
          >
            {letter.toUpperCase()}
          </motion.button>
        ))}
      </div>
    </div>
  );
}

// Mirror image practice
export function MirrorImagePractice() {
  return (
    <div className="bg-white rounded-2xl shadow-xl p-8">
      <h2 className="text-2xl font-bold text-gray-800 mb-8 text-center">
        Mirror Images
      </h2>

      <div className="space-y-6">
        {SIMILAR_PAIRS.map((pair) => (
          <div key={pair.name} className="bg-gray-50 rounded-xl p-6">
            <h3 className="text-lg font-bold text-gray-700 mb-4 text-center">
              {pair.name}
            </h3>
            <div className="flex justify-center gap-12">
              {pair.letters.map((letter) => (
                <div
                  key={letter}
                  className="w-32 h-32 bg-gradient-to-br from-purple-500 to-pink-600 rounded-2xl flex items-center justify-center text-white text-6xl font-bold shadow-lg"
                >
                  {letter.toUpperCase()}
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
