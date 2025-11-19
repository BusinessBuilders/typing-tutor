/**
 * Word Construction Component
 * Step 168 - Building words from letters and sounds
 */

import { motion } from 'framer-motion';
import { useState, useEffect } from 'react';
import { useSettingsStore } from '../store/useSettingsStore';

export interface WordConstructionProps {
  targetWord: string;
  availableLetters?: string[];
  showHint?: boolean;
}

export default function WordConstruction({
  targetWord,
  availableLetters,
  showHint = true,
}: WordConstructionProps) {
  const { settings } = useSettingsStore();
  const [builtWord, setBuiltWord] = useState('');
  const [completed, setCompleted] = useState(false);

  // Default available letters: target word letters + some extras
  const letters = availableLetters || [
    ...targetWord.split(''),
    ...'abcdefghijk'.split('').filter(l => !targetWord.includes(l)).slice(0, 4),
  ].sort(() => Math.random() - 0.5);

  const [usedIndices, setUsedIndices] = useState<Set<number>>(new Set());

  const handleAddLetter = (letter: string, index: number) => {
    if (usedIndices.has(index)) return;

    const newWord = builtWord + letter;
    setBuiltWord(newWord);
    setUsedIndices(new Set([...usedIndices, index]));

    if (newWord === targetWord) {
      setCompleted(true);
    }
  };

  const handleReset = () => {
    setBuiltWord('');
    setUsedIndices(new Set());
    setCompleted(false);
  };

  return (
    <div className="bg-white rounded-2xl shadow-xl p-8">
      <h2 className="text-2xl font-bold text-gray-800 mb-6 text-center">
        Build the Word
      </h2>

      {/* Hint */}
      {showHint && (
        <div className="bg-blue-50 rounded-xl p-4 mb-6 text-center">
          <div className="text-sm text-blue-900">
            Build this word: <span className="font-bold text-xl">{targetWord}</span>
          </div>
        </div>
      )}

      {/* Built word display */}
      <div className="bg-gray-50 rounded-xl p-6 mb-6 min-h-[100px] flex items-center justify-center">
        <div className="flex gap-2">
          {builtWord.split('').map((letter, index) => (
            <motion.div
              key={index}
              initial={{ scale: 0, rotateY: 90 }}
              animate={{ scale: 1, rotateY: 0 }}
              className={`w-16 h-16 rounded-lg flex items-center justify-center text-3xl font-bold shadow-md ${
                letter === targetWord[index]
                  ? 'bg-success-500 text-white'
                  : 'bg-red-500 text-white'
              }`}
            >
              {letter}
            </motion.div>
          ))}
        </div>
      </div>

      {/* Available letters */}
      <div className="flex flex-wrap justify-center gap-3 mb-6">
        {letters.map((letter, index) => (
          <motion.button
            key={index}
            onClick={() => handleAddLetter(letter, index)}
            disabled={usedIndices.has(index) || completed}
            whileHover={{ scale: !usedIndices.has(index) && !completed && !settings.reducedMotion ? 1.1 : 1 }}
            whileTap={{ scale: !usedIndices.has(index) && !completed && !settings.reducedMotion ? 0.95 : 1 }}
            className={`w-14 h-14 rounded-lg font-bold text-2xl transition-opacity ${
              usedIndices.has(index)
                ? 'bg-gray-200 text-gray-400 opacity-30 cursor-not-allowed'
                : 'bg-primary-500 text-white hover:bg-primary-600'
            }`}
          >
            {letter.toUpperCase()}
          </motion.button>
        ))}
      </div>

      {/* Controls */}
      <div className="flex gap-4 justify-center">
        <button
          onClick={handleReset}
          className="px-6 py-3 bg-gray-200 text-gray-700 rounded-lg font-bold hover:bg-gray-300 transition-colors"
        >
          Reset
        </button>
      </div>

      {/* Success message */}
      {completed && (
        <motion.div
          initial={{ opacity: 0, scale: 0 }}
          animate={{ opacity: 1, scale: 1 }}
          className="mt-6 bg-success-50 rounded-xl p-6 text-center"
        >
          <div className="text-4xl mb-2">🎉</div>
          <div className="text-2xl font-bold text-success-900">
            Perfect! You built "{targetWord}"!
          </div>
        </motion.div>
      )}
    </div>
  );
}

// Letter scramble game
export function LetterScramble({ word }: { word: string }) {
  const { settings } = useSettingsStore();
  const [scrambled] = useState(() =>
    word.split('').sort(() => Math.random() - 0.5).join('')
  );
  const [guess, setGuess] = useState('');
  const [revealed, setRevealed] = useState(false);

  const handleKeyPress = (key: string) => {
    if (key === 'Backspace') {
      setGuess(guess.slice(0, -1));
      return;
    }

    const newGuess = guess + key.toLowerCase();

    if (newGuess === word.toLowerCase()) {
      setRevealed(true);
    } else if (word.toLowerCase().startsWith(newGuess)) {
      setGuess(newGuess);
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
  }, [guess, word, revealed]);

  return (
    <div className="bg-white rounded-2xl shadow-xl p-8">
      <h2 className="text-2xl font-bold text-gray-800 mb-6 text-center">
        Unscramble the Word
      </h2>

      {/* Scrambled letters */}
      <div className="flex justify-center gap-2 mb-8">
        {scrambled.split('').map((letter, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, rotateY: 180 }}
            animate={{ opacity: 1, rotateY: 0 }}
            transition={{
              delay: settings.reducedMotion ? 0 : index * 0.1,
            }}
            className="w-16 h-16 bg-yellow-400 text-gray-900 rounded-lg flex items-center justify-center text-3xl font-bold shadow-md"
          >
            {letter.toUpperCase()}
          </motion.div>
        ))}
      </div>

      {/* Answer area */}
      <div className="bg-gray-50 rounded-xl p-6 mb-6">
        <div className="text-4xl font-mono text-center min-h-[60px]">
          {guess.split('').map((char, index) => (
            <span
              key={index}
              className={char === word[index] ? 'text-success-600' : 'text-red-600'}
            >
              {char}
            </span>
          ))}
          {!revealed && <span className="animate-pulse">|</span>}
        </div>
      </div>

      {revealed && (
        <motion.div
          initial={{ opacity: 0, scale: 0 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center text-4xl"
        >
          🎉 Correct!
        </motion.div>
      )}
    </div>
  );
}

// Missing letter game
export function MissingLetterGame({ word }: { word: string }) {
  const [missingIndex] = useState(() =>
    Math.floor(Math.random() * word.length)
  );
  const [selectedLetter, setSelectedLetter] = useState<string | null>(null);

  const alphabet = 'abcdefghijklmnopqrstuvwxyz'.split('');
  const correctLetter = word[missingIndex];

  const handleSelect = (letter: string) => {
    setSelectedLetter(letter);
  };

  return (
    <div className="bg-white rounded-2xl shadow-xl p-8">
      <h2 className="text-2xl font-bold text-gray-800 mb-6 text-center">
        Find the Missing Letter
      </h2>

      {/* Word with missing letter */}
      <div className="flex justify-center gap-2 mb-8">
        {word.split('').map((letter, index) => (
          <div
            key={index}
            className={`w-16 h-16 rounded-lg flex items-center justify-center text-3xl font-bold shadow-md ${
              index === missingIndex
                ? selectedLetter
                  ? selectedLetter === correctLetter
                    ? 'bg-success-500 text-white'
                    : 'bg-red-500 text-white'
                  : 'bg-gray-300 text-gray-500'
                : 'bg-blue-500 text-white'
            }`}
          >
            {index === missingIndex ? selectedLetter || '?' : letter.toUpperCase()}
          </div>
        ))}
      </div>

      {/* Letter options */}
      <div className="flex flex-wrap justify-center gap-2">
        {alphabet.slice(0, 10).map((letter) => (
          <motion.button
            key={letter}
            onClick={() => handleSelect(letter)}
            disabled={selectedLetter !== null}
            whileHover={{ scale: selectedLetter === null ? 1.1 : 1 }}
            className={`w-12 h-12 rounded-lg font-bold text-xl ${
              selectedLetter === letter
                ? letter === correctLetter
                  ? 'bg-success-500 text-white'
                  : 'bg-red-500 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-primary-100'
            }`}
          >
            {letter}
          </motion.button>
        ))}
      </div>

      {selectedLetter === correctLetter && (
        <motion.div
          initial={{ opacity: 0, scale: 0 }}
          animate={{ opacity: 1, scale: 1 }}
          className="mt-6 text-center text-4xl"
        >
          🎉 Perfect!
        </motion.div>
      )}
    </div>
  );
}
