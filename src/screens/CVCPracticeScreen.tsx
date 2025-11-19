/**
 * CVC Practice Screen
 * Wrapper for CVC Practice component with keyboard input
 */

import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { CVC_WORDS } from '../components/CVCPractice';
import { useSettingsStore } from '../store/useSettingsStore';
import { speak } from '../services/audio/textToSpeechService';
import { usePetStore } from '../store/usePetStore';
import { PetDisplay } from '../components/PetSystem';

export default function CVCPracticeScreen() {
  const navigate = useNavigate();
  const { settings } = useSettingsStore();
  const { pet, addXP } = usePetStore();

  // Select 10 random words from all CVC words
  const [words] = useState(() => {
    const allWords = Object.values(CVC_WORDS).flat();
    return allWords.sort(() => Math.random() - 0.5).slice(0, 10);
  });

  const [currentIndex, setCurrentIndex] = useState(0);
  const [typed, setTyped] = useState('');
  const [correct, setCorrect] = useState(0);
  const [isCorrect, setIsCorrect] = useState<boolean | null>(null);

  const currentWord = words[currentIndex];

  // Handle keyboard input
  const handleKeyPress = useCallback(
    (e: KeyboardEvent) => {
      if (e.key === 'Backspace') {
        setTyped((prev) => prev.slice(0, -1));
        return;
      }

      if (e.key.length === 1 && /[a-z]/i.test(e.key)) {
        const newTyped = typed + e.key.toLowerCase();

        if (newTyped === currentWord) {
          setIsCorrect(true);
          setCorrect((prev) => prev + 1);

          // Reward pet
          if (addXP) {
            addXP(10);
          }

          // Move to next after delay
          setTimeout(() => {
            if (currentIndex < words.length - 1) {
              setCurrentIndex((prev) => prev + 1);
              setTyped('');
              setIsCorrect(null);
            } else {
              // Completed all words
              alert(`Great job! You completed ${correct + 1}/${words.length} words!`);
              navigate('/');
            }
          }, 1000);
        } else if (currentWord.startsWith(newTyped)) {
          setTyped(newTyped);
          setIsCorrect(null);
        } else {
          setIsCorrect(false);
        }
      }
    },
    [typed, currentWord, currentIndex, words.length, correct, addXP, navigate]
  );

  useEffect(() => {
    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [handleKeyPress]);

  // Auto-read current word
  useEffect(() => {
    if (currentWord) {
      speak(currentWord);
    }
  }, [currentWord]);

  return (
    <div className="cvc-practice-screen min-h-screen bg-gradient-to-br from-teal-50 to-cyan-50 p-6">
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
          className="mb-4 text-teal-600 hover:text-teal-700 flex items-center gap-2 text-lg"
        >
          ← Back to Home
        </button>

        <div className="p-6 rounded-2xl bg-gradient-to-r from-teal-400 to-cyan-600 text-white shadow-lg">
          <div className="flex items-center gap-4">
            <span className="text-5xl">🎯</span>
            <div>
              <h1 className="text-4xl font-bold mb-2">CVC Words Practice</h1>
              <p className="text-xl opacity-90">Consonant-Vowel-Consonant patterns</p>
            </div>
          </div>
        </div>
      </div>

      {/* Progress */}
      <div className="max-w-4xl mx-auto mb-8">
        <div className="bg-white rounded-xl p-4 shadow-md">
          <div className="flex justify-between items-center mb-2">
            <span className="text-gray-700 font-medium">Progress</span>
            <span className="text-teal-600 font-bold">{currentIndex + 1} / {words.length}</span>
          </div>
          <div className="h-3 bg-gray-200 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-teal-400 to-cyan-500 transition-all duration-500"
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
            {/* Word Display - Highlight CVC structure */}
            <div className="flex justify-center gap-4 mb-8">
              {currentWord.split('').map((letter, index) => {
                const isVowel = 'aeiou'.includes(letter);
                const isTyped = index < typed.length;
                const isCurrentLetter = index === typed.length;

                return (
                  <div
                    key={index}
                    className={`w-24 h-24 rounded-xl flex items-center justify-center text-4xl font-bold shadow-lg transition-all ${
                      isVowel
                        ? 'bg-red-500 text-white'
                        : 'bg-blue-500 text-white'
                    } ${isTyped ? 'ring-4 ring-green-400' : ''} ${
                      isCurrentLetter ? 'ring-4 ring-yellow-400 animate-pulse' : ''
                    }`}
                  >
                    {letter.toUpperCase()}
                  </div>
                );
              })}
            </div>

            {/* Typed Input Display */}
            <div className="text-center mb-6">
              <div className="text-6xl font-bold text-gray-800 min-h-[80px] flex items-center justify-center">
                {typed || '_'}
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
                  ✨ Perfect! ✨
                </motion.div>
              )}
              {isCorrect === false && (
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  className="text-2xl text-orange-600"
                >
                  Try again! 💪
                </motion.div>
              )}
            </div>

            {/* Helper text */}
            <div className="text-center mt-6 p-4 bg-teal-50 rounded-xl">
              <p className="text-sm text-gray-600">
                <span className="inline-block w-4 h-4 bg-blue-500 rounded mr-2"></span>
                Blue = Consonant
                <span className="inline-block w-4 h-4 bg-red-500 rounded ml-4 mr-2"></span>
                Red = Vowel
              </p>
            </div>
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}
