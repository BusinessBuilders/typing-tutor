/**
 * Multi-Sensory Learning Component
 * Step 159 - Engage multiple senses for better learning
 */

import { motion } from 'framer-motion';
import { useState } from 'react';

export default function MultiSensoryLearning({ letter }: { letter: string }) {
  const [activeMode, setActiveMode] = useState<'visual' | 'auditory' | 'kinesthetic'>('visual');

  return (
    <div className="bg-white rounded-2xl shadow-xl p-8">
      <h2 className="text-2xl font-bold text-gray-800 mb-6 text-center">
        Multi-Sensory Learning: {letter.toUpperCase()}
      </h2>

      {/* Mode selector */}
      <div className="flex justify-center gap-4 mb-8">
        {['visual', 'auditory', 'kinesthetic'].map((mode) => (
          <button
            key={mode}
            onClick={() => setActiveMode(mode as typeof activeMode)}
            className={`px-6 py-3 rounded-lg font-bold capitalize transition-colors ${
              activeMode === mode
                ? 'bg-primary-500 text-white'
                : 'bg-gray-200 text-gray-700'
            }`}
          >
            {mode}
          </button>
        ))}
      </div>

      {/* Visual mode */}
      {activeMode === 'visual' && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-center"
        >
          <div className="w-64 h-64 mx-auto bg-gradient-to-br from-green-500 to-emerald-600 rounded-3xl flex items-center justify-center text-white text-9xl font-bold shadow-2xl mb-4">
            {letter.toUpperCase()}
          </div>
          <p className="text-gray-700">👁️ See the letter shape</p>
        </motion.div>
      )}

      {/* Auditory mode */}
      {activeMode === 'auditory' && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-center"
        >
          <button className="w-64 h-64 mx-auto bg-gradient-to-br from-purple-500 to-pink-600 rounded-3xl flex items-center justify-center text-white shadow-2xl mb-4">
            <span className="text-6xl">🔊</span>
          </button>
          <p className="text-gray-700">👂 Hear the letter sound</p>
          <div className="mt-4 text-4xl font-bold text-purple-600">
            "{letter}" says...
          </div>
        </motion.div>
      )}

      {/* Kinesthetic mode */}
      {activeMode === 'kinesthetic' && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-center"
        >
          <div className="w-64 h-64 mx-auto bg-gradient-to-br from-orange-500 to-red-600 rounded-3xl flex items-center justify-center text-white text-9xl font-bold shadow-2xl mb-4 border-4 border-dashed border-orange-300">
            {letter.toUpperCase()}
          </div>
          <p className="text-gray-700">✋ Trace with your finger</p>
        </motion.div>
      )}
    </div>
  );
}

// Color-coded learning
export function ColorCodedLearning() {
  const vowels = ['a', 'e', 'i', 'o', 'u'];

  return (
    <div className="bg-white rounded-2xl shadow-xl p-8">
      <h2 className="text-2xl font-bold text-gray-800 mb-8 text-center">
        Color-Coded Letters
      </h2>

      <div className="grid grid-cols-5 gap-4">
        {vowels.map((letter) => (
          <div
            key={letter}
            className="w-20 h-20 bg-red-500 text-white rounded-2xl flex items-center justify-center font-bold text-4xl shadow-lg"
          >
            {letter.toUpperCase()}
          </div>
        ))}
      </div>

      <p className="mt-6 text-center text-gray-700">
        <span className="inline-block w-4 h-4 bg-red-500 rounded mr-2"></span>
        Red = Vowels
      </p>
    </div>
  );
}

// Texture-based learning
export function TextureLearning() {
  return (
    <div className="bg-white rounded-2xl shadow-xl p-8">
      <h2 className="text-2xl font-bold text-gray-800 mb-6 text-center">
        Feel the Letter
      </h2>

      <div className="w-64 h-64 mx-auto bg-gradient-to-br from-yellow-100 to-amber-200 rounded-3xl flex items-center justify-center text-9xl font-bold text-amber-800 shadow-inner mb-6 border-4 border-amber-300">
        A
      </div>

      <p className="text-center text-gray-700">
        ✋ Imagine tracing this letter with your finger
      </p>
    </div>
  );
}
