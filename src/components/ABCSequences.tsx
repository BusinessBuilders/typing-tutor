/**
 * ABC Sequences Component
 * Step 155 - Learning alphabet sequences and order
 */

import { motion } from 'framer-motion';
import { useState } from 'react';
import { useSettingsStore } from '../store/useSettingsStore';

export default function ABCSequences() {
  const { settings } = useSettingsStore();
  const alphabet = 'abcdefghijklmnopqrstuvwxyz'.split('');

  return (
    <div className="bg-white rounded-2xl shadow-xl p-8">
      <h2 className="text-2xl font-bold text-gray-800 mb-6 text-center">
        ABC Sequence
      </h2>

      <div className="grid grid-cols-7 gap-3">
        {alphabet.map((letter, index) => (
          <motion.div
            key={letter}
            initial={{ opacity: 0, scale: 0 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: settings.reducedMotion ? 0 : index * 0.05 }}
            className="aspect-square bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center text-white font-bold text-2xl shadow-lg"
          >
            {letter.toUpperCase()}
          </motion.div>
        ))}
      </div>
    </div>
  );
}

// Fill in missing letters
export function MissingLetterSequence() {
  const [answer, setAnswer] = useState('');
  const sequence = ['a', 'b', '?', 'd', 'e'];

  return (
    <div className="bg-white rounded-2xl shadow-xl p-8">
      <h2 className="text-2xl font-bold text-gray-800 mb-6 text-center">
        What Letter is Missing?
      </h2>

      <div className="flex justify-center gap-4 mb-8">
        {sequence.map((letter, index) => (
          <div
            key={index}
            className={`w-20 h-20 rounded-xl flex items-center justify-center font-bold text-4xl ${
              letter === '?'
                ? 'bg-yellow-100 text-yellow-800'
                : 'bg-gray-100 text-gray-800'
            }`}
          >
            {letter === '?' ? '?' : letter.toUpperCase()}
          </div>
        ))}
      </div>

      <div className="flex justify-center gap-2">
        {['a', 'b', 'c', 'd'].map((letter) => (
          <button
            key={letter}
            onClick={() => setAnswer(letter)}
            className={`w-16 h-16 rounded-xl font-bold text-2xl transition-colors ${
              answer === letter
                ? 'bg-success-500 text-white'
                : 'bg-primary-500 text-white hover:bg-primary-600'
            }`}
          >
            {letter.toUpperCase()}
          </button>
        ))}
      </div>
    </div>
  );
}
