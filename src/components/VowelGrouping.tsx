/**
 * Vowel Grouping Component
 * Step 156 - Teaching vowels vs consonants
 */

import { motion } from 'framer-motion';
import { useState } from 'react';
import { useSettingsStore } from '../store/useSettingsStore';

const VOWELS = ['a', 'e', 'i', 'o', 'u'];
const CONSONANTS = ['b', 'c', 'd', 'f', 'g', 'h', 'j', 'k', 'l', 'm', 'n', 'p', 'q', 'r', 's', 't', 'v', 'w', 'x', 'y', 'z'];

export default function VowelGrouping() {
  const { settings } = useSettingsStore();

  return (
    <div className="bg-white rounded-2xl shadow-xl p-8">
      <h2 className="text-2xl font-bold text-gray-800 mb-8 text-center">
        Vowels vs Consonants
      </h2>

      <div className="grid grid-cols-2 gap-8">
        {/* Vowels */}
        <div>
          <h3 className="text-xl font-bold text-red-600 mb-4 text-center">
            Vowels
          </h3>
          <div className="flex justify-center gap-2">
            {VOWELS.map((letter, index) => (
              <motion.div
                key={letter}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: settings.reducedMotion ? 0 : index * 0.1 }}
                className="w-16 h-16 bg-red-500 text-white rounded-xl flex items-center justify-center font-bold text-3xl shadow-lg"
              >
                {letter.toUpperCase()}
              </motion.div>
            ))}
          </div>
        </div>

        {/* Consonants */}
        <div>
          <h3 className="text-xl font-bold text-blue-600 mb-4 text-center">
            Consonants
          </h3>
          <div className="grid grid-cols-5 gap-2">
            {CONSONANTS.slice(0, 10).map((letter, index) => (
              <motion.div
                key={letter}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: settings.reducedMotion ? 0 : index * 0.05 }}
                className="w-12 h-12 bg-blue-500 text-white rounded-lg flex items-center justify-center font-bold text-xl shadow-lg"
              >
                {letter.toUpperCase()}
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

// Vowel sorting game
export function VowelSortingGame() {
  const [sorted, setSorted] = useState<{ vowels: string[]; consonants: string[] }>({
    vowels: [],
    consonants: [],
  });

  const letters = ['a', 'b', 'e', 'c', 'i', 'd'];

  // TODO: Connect to drag and drop functionality
  // @ts-expect-error - Function will be used when drag-drop is implemented
  const _handleSort = (letter: string, type: 'vowel' | 'consonant') => {
    if (type === 'vowel' && VOWELS.includes(letter)) {
      setSorted({ ...sorted, vowels: [...sorted.vowels, letter] });
    } else if (type === 'consonant' && CONSONANTS.includes(letter)) {
      setSorted({ ...sorted, consonants: [...sorted.consonants, letter] });
    }
  };

  return (
    <div className="bg-white rounded-2xl shadow-xl p-8">
      <h2 className="text-2xl font-bold text-gray-800 mb-6 text-center">
        Sort Vowels and Consonants
      </h2>

      <div className="flex justify-center gap-4 mb-8">
        {letters.map((letter) => (
          <div
            key={letter}
            className="w-16 h-16 bg-gray-200 rounded-xl flex items-center justify-center font-bold text-3xl"
          >
            {letter.toUpperCase()}
          </div>
        ))}
      </div>

      <div className="grid grid-cols-2 gap-8">
        <div className="bg-red-50 rounded-xl p-6">
          <h3 className="font-bold text-red-800 mb-4 text-center">Vowels</h3>
          <div className="min-h-[100px]">
            {sorted.vowels.map((letter, index) => (
              <span key={index} className="text-2xl mr-2">{letter.toUpperCase()}</span>
            ))}
          </div>
        </div>

        <div className="bg-blue-50 rounded-xl p-6">
          <h3 className="font-bold text-blue-800 mb-4 text-center">Consonants</h3>
          <div className="min-h-[100px]">
            {sorted.consonants.map((letter, index) => (
              <span key={index} className="text-2xl mr-2">{letter.toUpperCase()}</span>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
