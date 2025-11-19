/**
 * Sight Words Component
 * Step 163 - High-frequency sight word practice
 */

import { motion, AnimatePresence } from 'framer-motion';
import { useState, useEffect } from 'react';
import { useSettingsStore } from '../store/useSettingsStore';

// Dolch sight words by grade level
export const SIGHT_WORDS = {
  preK: ['a', 'and', 'away', 'big', 'blue', 'can', 'come', 'down', 'find', 'for', 'funny', 'go', 'help', 'here', 'I', 'in', 'is', 'it', 'jump', 'little', 'look', 'make', 'me', 'my', 'not', 'one', 'play', 'red', 'run', 'said', 'see', 'the', 'three', 'to', 'two', 'up', 'we', 'where', 'yellow', 'you'],
  kindergarten: ['all', 'am', 'are', 'at', 'ate', 'be', 'black', 'brown', 'but', 'came', 'did', 'do', 'eat', 'four', 'get', 'good', 'have', 'he', 'into', 'like', 'must', 'new', 'no', 'now', 'on', 'our', 'out', 'please', 'pretty', 'ran', 'ride', 'saw', 'say', 'she', 'so', 'soon', 'that', 'there', 'they', 'this', 'too', 'under', 'want', 'was', 'well', 'went', 'what', 'white', 'who', 'will', 'with', 'yes'],
  grade1: ['after', 'again', 'an', 'any', 'as', 'ask', 'by', 'could', 'every', 'fly', 'from', 'give', 'going', 'had', 'has', 'her', 'him', 'his', 'how', 'just', 'know', 'let', 'live', 'may', 'of', 'old', 'once', 'open', 'over', 'put', 'round', 'some', 'stop', 'take', 'thank', 'them', 'then', 'think', 'walk', 'were', 'when'],
  grade2: ['always', 'around', 'because', 'been', 'before', 'best', 'both', 'buy', 'call', 'cold', 'does', 'don\'t', 'fast', 'first', 'five', 'found', 'gave', 'goes', 'green', 'its', 'made', 'many', 'off', 'or', 'pull', 'read', 'right', 'sing', 'sit', 'sleep', 'tell', 'their', 'these', 'those', 'upon', 'us', 'use', 'very', 'wash', 'which', 'why', 'wish', 'work', 'would', 'write', 'your'],
  grade3: ['about', 'better', 'bring', 'carry', 'clean', 'cut', 'done', 'draw', 'drink', 'eight', 'fall', 'far', 'full', 'got', 'grow', 'hold', 'hot', 'hurt', 'if', 'keep', 'kind', 'laugh', 'light', 'long', 'much', 'myself', 'never', 'only', 'own', 'pick', 'seven', 'shall', 'show', 'six', 'small', 'start', 'ten', 'today', 'together', 'try', 'warm'],
};

export interface SightWordsProps {
  level?: keyof typeof SIGHT_WORDS;
  wordCount?: number;
  onComplete?: (accuracy: number) => void;
}

export default function SightWords({
  level = 'preK',
  wordCount = 10,
  onComplete,
}: SightWordsProps) {
  const { settings } = useSettingsStore();
  const words = SIGHT_WORDS[level].slice(0, wordCount);

  const [currentIndex, setCurrentIndex] = useState(0);
  const [typed, setTyped] = useState('');
  const [correct, setCorrect] = useState(0);
  const [attempts, setAttempts] = useState(0);

  const currentWord = words[currentIndex];

  const handleKeyPress = (key: string) => {
    if (key === 'Backspace') {
      setTyped(typed.slice(0, -1));
      return;
    }

    const newTyped = typed + key.toLowerCase();

    if (newTyped === currentWord.toLowerCase()) {
      setCorrect(correct + 1);
      setAttempts(attempts + 1);
      setTyped('');

      if (currentIndex < words.length - 1) {
        setCurrentIndex(currentIndex + 1);
      } else {
        const accuracy = (correct / attempts) * 100;
        onComplete?.(accuracy);
      }
    } else if (currentWord.toLowerCase().startsWith(newTyped)) {
      setTyped(newTyped);
    } else {
      setAttempts(attempts + 1);
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
  }, [typed, currentWord, currentIndex, correct, attempts]);

  return (
    <div className="bg-white rounded-2xl shadow-xl p-8">
      <h2 className="text-2xl font-bold text-gray-800 mb-6 text-center">
        Sight Words Practice - {level.toUpperCase()}
      </h2>

      {/* Progress */}
      <div className="mb-6">
        <div className="flex justify-between text-sm text-gray-600 mb-2">
          <span>Progress</span>
          <span>{currentIndex + 1} / {words.length}</span>
        </div>
        <div className="h-3 bg-gray-200 rounded-full overflow-hidden">
          <motion.div
            animate={{ width: `${((currentIndex + 1) / words.length) * 100}%` }}
            className="h-full bg-primary-500"
          />
        </div>
      </div>

      {/* Word flashcard */}
      <AnimatePresence mode="wait">
        <motion.div
          key={currentIndex}
          initial={{ opacity: 0, rotateY: -90 }}
          animate={{ opacity: 1, rotateY: 0 }}
          exit={{ opacity: 0, rotateY: 90 }}
          transition={{ duration: settings.reducedMotion ? 0 : 0.4 }}
          className="bg-gradient-to-br from-yellow-400 to-orange-500 rounded-2xl shadow-2xl p-12 mb-6"
        >
          <div className="text-6xl font-bold text-white text-center">
            {currentWord}
          </div>
        </motion.div>
      </AnimatePresence>

      {/* Typing area */}
      <div className="bg-gray-50 rounded-xl p-6 mb-6">
        <div className="text-4xl font-mono text-center min-h-[60px]">
          {typed.split('').map((char, index) => (
            <span
              key={index}
              className={char === currentWord[index]?.toLowerCase() ? 'text-success-600' : 'text-red-600'}
            >
              {char}
            </span>
          ))}
          <span className="animate-pulse">|</span>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-4">
        <div className="bg-success-50 rounded-lg p-4 text-center">
          <div className="text-3xl font-bold text-success-700">{correct}</div>
          <div className="text-sm text-gray-600">Correct</div>
        </div>
        <div className="bg-primary-50 rounded-lg p-4 text-center">
          <div className="text-3xl font-bold text-primary-700">
            {attempts > 0 ? Math.round((correct / attempts) * 100) : 0}%
          </div>
          <div className="text-sm text-gray-600">Accuracy</div>
        </div>
      </div>
    </div>
  );
}

// Sight word level selector
export function SightWordLevelSelector({
  onSelectLevel,
}: {
  onSelectLevel?: (level: keyof typeof SIGHT_WORDS) => void;
}) {
  const { settings } = useSettingsStore();

  const levels: Array<{ key: keyof typeof SIGHT_WORDS; name: string; color: string }> = [
    { key: 'preK', name: 'Pre-K', color: 'from-pink-400 to-purple-500' },
    { key: 'kindergarten', name: 'Kindergarten', color: 'from-blue-400 to-cyan-500' },
    { key: 'grade1', name: 'Grade 1', color: 'from-green-400 to-teal-500' },
    { key: 'grade2', name: 'Grade 2', color: 'from-yellow-400 to-orange-500' },
    { key: 'grade3', name: 'Grade 3', color: 'from-red-400 to-pink-500' },
  ];

  return (
    <div className="bg-white rounded-2xl shadow-xl p-8">
      <h2 className="text-2xl font-bold text-gray-800 mb-6 text-center">
        Choose Your Level
      </h2>

      <div className="space-y-4">
        {levels.map((level, index) => (
          <motion.button
            key={level.key}
            onClick={() => onSelectLevel?.(level.key)}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{
              delay: settings.reducedMotion ? 0 : index * 0.1,
            }}
            whileHover={{ scale: settings.reducedMotion ? 1 : 1.02 }}
            className={`w-full bg-gradient-to-r ${level.color} text-white rounded-xl p-6 shadow-lg hover:shadow-xl transition-shadow`}
          >
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-2xl font-bold mb-1">{level.name}</h3>
                <p className="text-sm opacity-90">
                  {SIGHT_WORDS[level.key].length} words
                </p>
              </div>
              <div className="text-3xl">→</div>
            </div>
          </motion.button>
        ))}
      </div>
    </div>
  );
}

// Sight word flashcards
export function SightWordFlashcards({
  words,
}: {
  words: string[];
  autoAdvance?: boolean;
}) {
  const { settings } = useSettingsStore();
  const [currentIndex, setCurrentIndex] = useState(0);
  const [showWord, setShowWord] = useState(true);

  const nextCard = () => {
    if (currentIndex < words.length - 1) {
      setCurrentIndex(currentIndex + 1);
      setShowWord(true);
    }
  };

  const previousCard = () => {
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1);
      setShowWord(true);
    }
  };

  return (
    <div className="bg-white rounded-2xl shadow-xl p-8">
      <h2 className="text-2xl font-bold text-gray-800 mb-6 text-center">
        Flashcards
      </h2>

      {/* Flashcard */}
      <div className="mb-6">
        <AnimatePresence mode="wait">
          <motion.div
            key={`${currentIndex}-${showWord}`}
            initial={{ rotateY: 90 }}
            animate={{ rotateY: 0 }}
            exit={{ rotateY: -90 }}
            transition={{ duration: settings.reducedMotion ? 0 : 0.3 }}
            onClick={() => setShowWord(!showWord)}
            className="w-full h-64 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-2xl shadow-2xl flex items-center justify-center cursor-pointer"
          >
            <div className="text-7xl font-bold text-white">
              {showWord ? words[currentIndex] : '?'}
            </div>
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Progress indicator */}
      <div className="flex justify-center gap-1 mb-6">
        {words.map((_, index) => (
          <div
            key={index}
            className={`h-2 rounded-full transition-all ${
              index === currentIndex
                ? 'w-8 bg-primary-600'
                : 'w-2 bg-gray-300'
            }`}
          />
        ))}
      </div>

      {/* Controls */}
      <div className="flex justify-between items-center">
        <button
          onClick={previousCard}
          disabled={currentIndex === 0}
          className="px-6 py-3 bg-gray-200 text-gray-700 rounded-lg font-bold hover:bg-gray-300 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          ← Previous
        </button>

        <div className="text-gray-600 font-medium">
          {currentIndex + 1} / {words.length}
        </div>

        <button
          onClick={nextCard}
          disabled={currentIndex === words.length - 1}
          className="px-6 py-3 bg-primary-500 text-white rounded-lg font-bold hover:bg-primary-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          Next →
        </button>
      </div>
    </div>
  );
}

// Sight word memory game
export function SightWordMemoryGame({ words }: { words: string[] }) {
  const [cards] = useState(() => {
    const pairs = words.slice(0, 6);
    const doubled = [...pairs, ...pairs];
    return doubled.sort(() => Math.random() - 0.5);
  });

  const [flipped, setFlipped] = useState<number[]>([]);
  const [matched, setMatched] = useState<Set<string>>(new Set());

  const handleCardClick = (index: number) => {
    if (flipped.length === 2 || flipped.includes(index) || matched.has(cards[index])) {
      return;
    }

    const newFlipped = [...flipped, index];
    setFlipped(newFlipped);

    if (newFlipped.length === 2) {
      const [first, second] = newFlipped;
      if (cards[first] === cards[second]) {
        setMatched(new Set([...matched, cards[first]]));
        setFlipped([]);
      } else {
        setTimeout(() => setFlipped([]), 1000);
      }
    }
  };

  return (
    <div className="bg-white rounded-2xl shadow-xl p-8">
      <h2 className="text-2xl font-bold text-gray-800 mb-6 text-center">
        Memory Match
      </h2>

      <div className="grid grid-cols-4 gap-4">
        {cards.map((word, index) => {
          const isFlipped = flipped.includes(index) || matched.has(word);

          return (
            <motion.button
              key={index}
              onClick={() => handleCardClick(index)}
              whileHover={{ scale: isFlipped ? 1 : 1.05 }}
              className="aspect-square"
            >
              <AnimatePresence mode="wait">
                <motion.div
                  key={isFlipped ? 'front' : 'back'}
                  initial={{ rotateY: 90 }}
                  animate={{ rotateY: 0 }}
                  exit={{ rotateY: -90 }}
                  transition={{ duration: 0.3 }}
                  className={`w-full h-full rounded-xl flex items-center justify-center font-bold text-xl ${
                    isFlipped
                      ? matched.has(word)
                        ? 'bg-success-500 text-white'
                        : 'bg-primary-500 text-white'
                      : 'bg-gray-200 text-gray-400'
                  }`}
                >
                  {isFlipped ? word : '?'}
                </motion.div>
              </AnimatePresence>
            </motion.button>
          );
        })}
      </div>

      {matched.size === words.slice(0, 6).length && (
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

// Quick sight word quiz
export function SightWordQuiz({ words }: { words: string[] }) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [answered, setAnswered] = useState(false);

  const currentWord = words[currentIndex];
  const options = [
    currentWord,
    ...words.filter(w => w !== currentWord).sort(() => Math.random() - 0.5).slice(0, 3),
  ].sort(() => Math.random() - 0.5);

  const handleAnswer = (selected: string) => {
    if (answered) return;

    setAnswered(true);
    if (selected === currentWord) {
      setScore(score + 1);
    }

    setTimeout(() => {
      if (currentIndex < words.length - 1) {
        setCurrentIndex(currentIndex + 1);
        setAnswered(false);
      }
    }, 1500);
  };

  return (
    <div className="bg-white rounded-2xl shadow-xl p-8">
      <h2 className="text-2xl font-bold text-gray-800 mb-6 text-center">
        Sight Word Quiz
      </h2>

      {/* Spoken word (would play audio) */}
      <div className="bg-purple-100 rounded-xl p-8 mb-6 text-center">
        <div className="text-5xl mb-4">🔊</div>
        <div className="text-2xl font-bold text-purple-900">
          {currentWord}
        </div>
        <div className="text-sm text-purple-700 mt-2">
          Listen and select the correct word
        </div>
      </div>

      {/* Options */}
      <div className="grid grid-cols-2 gap-4 mb-6">
        {options.map((option) => {
          const isCorrect = option === currentWord;
          const showResult = answered;

          return (
            <motion.button
              key={option}
              onClick={() => handleAnswer(option)}
              disabled={answered}
              whileHover={{ scale: answered ? 1 : 1.05 }}
              className={`py-6 rounded-xl font-bold text-2xl transition-colors ${
                showResult
                  ? isCorrect
                    ? 'bg-success-500 text-white'
                    : 'bg-gray-200 text-gray-600'
                  : 'bg-primary-100 text-primary-900 hover:bg-primary-200'
              }`}
            >
              {option}
            </motion.button>
          );
        })}
      </div>

      {/* Progress */}
      <div className="flex justify-between text-gray-600">
        <span>Question {currentIndex + 1} / {words.length}</span>
        <span className="font-bold">Score: {score}</span>
      </div>
    </div>
  );
}
