/**
 * Compound Words Practice Screen
 * Wrapper for Compound Words component with keyboard input
 */

import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { COMPOUND_WORDS } from '../components/CompoundWords';
import { useSettingsStore } from '../store/useSettingsStore';
import { speak } from '../services/audio/textToSpeechService';
import { usePetStore } from '../store/usePetStore';
import { PetDisplay } from '../components/PetSystem';

export default function CompoundWordsScreen() {
  const navigate = useNavigate();
  const { settings } = useSettingsStore();
  const { pet, addXP } = usePetStore();

  // Select 10 random compound words
  const [words] = useState(() =>
    COMPOUND_WORDS.sort(() => Math.random() - 0.5).slice(0, 10)
  );

  const [currentIndex, setCurrentIndex] = useState(0);
  const [typed, setTyped] = useState('');
  const [correct, setCorrect] = useState(0);
  const [isCorrect, setIsCorrect] = useState<boolean | null>(null);

  const current = words[currentIndex];

  // Handle keyboard input
  const handleKeyPress = useCallback(
    (e: KeyboardEvent) => {
      if (e.key === 'Backspace') {
        setTyped((prev) => prev.slice(0, -1));
        return;
      }

      if (e.key.length === 1 && /[a-z]/i.test(e.key)) {
        const newTyped = typed + e.key.toLowerCase();

        if (newTyped === current.word) {
          setIsCorrect(true);
          setCorrect((prev) => prev + 1);

          // Reward pet
          if (addXP) {
            addXP(15); // More XP for compound words
          }

          // Move to next after delay
          setTimeout(() => {
            if (currentIndex < words.length - 1) {
              setCurrentIndex((prev) => prev + 1);
              setTyped('');
              setIsCorrect(null);
            } else {
              // Completed all words
              alert(`Excellent! You completed ${correct + 1}/${words.length} compound words!`);
              navigate('/');
            }
          }, 1500);
        } else if (current.word.startsWith(newTyped)) {
          setTyped(newTyped);
          setIsCorrect(null);
        } else {
          setIsCorrect(false);
        }
      }
    },
    [typed, current.word, currentIndex, words.length, correct, addXP, navigate]
  );

  useEffect(() => {
    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [handleKeyPress]);

  // Auto-read current word
  useEffect(() => {
    if (current.word) {
      speak(current.word);
    }
  }, [current.word]);

  return (
    <div className="compound-words-screen min-h-screen bg-gradient-to-br from-indigo-50 to-purple-50 p-6">
      {/* Pet Companion Display */}
      {pet && (
        <motion.div
          className="fixed top-4 right-4 z-50"
          animate={{ y: [0, -10, 0] }}
          transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
        >
          <PetDisplay pet={pet} />
        </motion.div>
      )}

      {/* Header */}
      <div className="max-w-4xl mx-auto mb-8">
        <button
          onClick={() => navigate('/')}
          className="mb-4 text-indigo-600 hover:text-indigo-700 flex items-center gap-2 text-lg"
        >
          ← Back to Home
        </button>

        <div className="p-6 rounded-2xl bg-gradient-to-r from-indigo-400 to-purple-600 text-white shadow-lg">
          <div className="flex items-center gap-4">
            <span className="text-5xl">🔗</span>
            <div>
              <h1 className="text-4xl font-bold mb-2">Compound Words Practice</h1>
              <p className="text-xl opacity-90">Two words make one!</p>
            </div>
          </div>
        </div>
      </div>

      {/* Progress */}
      <div className="max-w-4xl mx-auto mb-8">
        <div className="bg-white rounded-xl p-4 shadow-md">
          <div className="flex justify-between items-center mb-2">
            <span className="text-gray-700 font-medium">Progress</span>
            <span className="text-indigo-600 font-bold">{currentIndex + 1} / {words.length}</span>
          </div>
          <div className="h-3 bg-gray-200 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-indigo-400 to-purple-500 transition-all duration-500"
              style={{ width: `${((currentIndex + 1) / words.length) * 100}%` }}
            />
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-4xl mx-auto">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentIndex}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            className="bg-white rounded-2xl shadow-xl p-8 mb-6"
          >
            {/* Word Parts Display */}
            <div className="mb-8 text-center">
              <div className="flex justify-center items-center gap-4 mb-6">
                <div className="px-8 py-6 bg-gradient-to-r from-blue-400 to-blue-600 text-white rounded-2xl shadow-lg">
                  <span className="text-3xl font-bold">{current.parts[0]}</span>
                </div>
                <span className="text-4xl text-gray-400">+</span>
                <div className="px-8 py-6 bg-gradient-to-r from-green-400 to-green-600 text-white rounded-2xl shadow-lg">
                  <span className="text-3xl font-bold">{current.parts[1]}</span>
                </div>
                <span className="text-4xl text-gray-400">=</span>
                <div className="px-8 py-6 bg-gradient-to-r from-purple-400 to-pink-600 text-white rounded-2xl shadow-lg">
                  <span className="text-3xl font-bold">{current.word}</span>
                </div>
              </div>
            </div>

            {/* Typed Input Display */}
            <div className="text-center mb-6">
              <div className="text-6xl font-bold min-h-[80px] flex items-center justify-center">
                {current.word.split('').map((letter, index) => {
                  const isTyped = index < typed.length;
                  const isCurrentLetter = index === typed.length;
                  const isInFirstPart = index < current.parts[0].length;

                  return (
                    <span
                      key={index}
                      className={`transition-all ${
                        isTyped
                          ? 'text-green-600'
                          : isCurrentLetter
                          ? 'text-yellow-500'
                          : isInFirstPart
                          ? 'text-blue-400'
                          : 'text-green-400'
                      }`}
                    >
                      {isTyped ? typed[index] : letter}
                    </span>
                  );
                })}
              </div>
            </div>

            {/* Feedback */}
            <div className="text-center h-16 flex items-center justify-center">
              {isCorrect === true && (
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  className="text-4xl text-green-600 font-bold"
                >
                  🎉 Excellent! 🎉
                </motion.div>
              )}
              {isCorrect === false && (
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  className="text-2xl text-orange-600"
                >
                  Keep trying! 💪
                </motion.div>
              )}
            </div>

            {/* Helper text */}
            <div className="text-center mt-6 p-4 bg-indigo-50 rounded-xl">
              <p className="text-sm text-gray-600">
                Type the whole compound word: <strong>{current.word}</strong>
              </p>
              <p className="text-xs text-gray-500 mt-2">
                ({current.parts[0]} + {current.parts[1]} = {current.word})
              </p>
            </div>
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}
