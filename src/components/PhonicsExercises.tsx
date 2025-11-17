/**
 * Phonics Exercises Component
 * Step 152 - Teaching letter-sound relationships
 */

import { motion, AnimatePresence } from 'framer-motion';
import { useState } from 'react';
import { useSettingsStore } from '../store/useSettingsStore';

export interface PhonicsSound {
  letter: string;
  sound: string; // Phonetic representation
  examples: string[];
  category: 'consonant' | 'vowel' | 'blend' | 'digraph';
}

// Phonics sounds database
export const PHONICS_SOUNDS: PhonicsSound[] = [
  // Vowels
  { letter: 'a', sound: 'æ (cat)', examples: ['cat', 'hat', 'mat'], category: 'vowel' },
  { letter: 'e', sound: 'ɛ (bed)', examples: ['bed', 'red', 'pet'], category: 'vowel' },
  { letter: 'i', sound: 'ɪ (sit)', examples: ['sit', 'hit', 'bit'], category: 'vowel' },
  { letter: 'o', sound: 'ɒ (hot)', examples: ['hot', 'pot', 'dot'], category: 'vowel' },
  { letter: 'u', sound: 'ʌ (cup)', examples: ['cup', 'pup', 'up'], category: 'vowel' },

  // Consonants
  { letter: 'b', sound: 'b (bat)', examples: ['bat', 'ball', 'bear'], category: 'consonant' },
  { letter: 'c', sound: 'k (cat)', examples: ['cat', 'car', 'cake'], category: 'consonant' },
  { letter: 'd', sound: 'd (dog)', examples: ['dog', 'doll', 'duck'], category: 'consonant' },
  { letter: 'f', sound: 'f (fish)', examples: ['fish', 'fox', 'fan'], category: 'consonant' },
  { letter: 'g', sound: 'g (goat)', examples: ['goat', 'game', 'girl'], category: 'consonant' },

  // Digraphs
  { letter: 'ch', sound: 'tʃ (chip)', examples: ['chip', 'chat', 'chop'], category: 'digraph' },
  { letter: 'sh', sound: 'ʃ (ship)', examples: ['ship', 'shop', 'shell'], category: 'digraph' },
  { letter: 'th', sound: 'θ (think)', examples: ['think', 'thin', 'path'], category: 'digraph' },
  { letter: 'ph', sound: 'f (phone)', examples: ['phone', 'photo', 'graph'], category: 'digraph' },

  // Blends
  { letter: 'bl', sound: 'bl (blue)', examples: ['blue', 'black', 'block'], category: 'blend' },
  { letter: 'cl', sound: 'kl (clap)', examples: ['clap', 'class', 'clean'], category: 'blend' },
  { letter: 'st', sound: 'st (stop)', examples: ['stop', 'star', 'step'], category: 'blend' },
  { letter: 'tr', sound: 'tr (tree)', examples: ['tree', 'train', 'truck'], category: 'blend' },
];

export interface PhonicsExercisesProps {
  sound: PhonicsSound;
  onComplete?: (score: number) => void;
}

export default function PhonicsExercises({
  sound,
  onComplete,
}: PhonicsExercisesProps) {
  const { settings } = useSettingsStore();
  const [currentWord, setCurrentWord] = useState(0);
  const [score, setScore] = useState(0);

  const word = sound.examples[currentWord];

  const handleCorrect = () => {
    setScore(score + 1);

    if (currentWord < sound.examples.length - 1) {
      setCurrentWord(currentWord + 1);
    } else {
      onComplete?.(score + 1);
    }
  };

  return (
    <div className="bg-white rounded-2xl shadow-xl p-8">
      <h2 className="text-3xl font-bold text-gray-800 mb-6 text-center">
        Phonics Practice
      </h2>

      {/* Sound display */}
      <div className="bg-gradient-to-r from-purple-500 to-pink-500 rounded-2xl p-8 mb-8 text-white text-center">
        <div className="text-6xl font-bold mb-4">{sound.letter}</div>
        <div className="text-2xl mb-2">says "{sound.sound}"</div>
        <div className="text-lg opacity-90">
          as in "{sound.examples[0]}"
        </div>
      </div>

      {/* Practice word */}
      <AnimatePresence mode="wait">
        <motion.div
          key={currentWord}
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.9 }}
          transition={{ duration: settings.reducedMotion ? 0 : 0.3 }}
          className="bg-blue-50 rounded-xl p-8 mb-6"
        >
          <div className="text-center">
            <div className="text-5xl font-bold text-gray-900 mb-4">
              {word}
            </div>
            <div className="text-lg text-gray-600">
              Type this word
            </div>
          </div>
        </motion.div>
      </AnimatePresence>

      {/* Progress */}
      <div className="flex justify-between text-sm text-gray-600 mb-2">
        <span>Progress</span>
        <span>{currentWord + 1} / {sound.examples.length}</span>
      </div>
      <div className="h-3 bg-gray-200 rounded-full overflow-hidden mb-6">
        <motion.div
          animate={{ width: `${((currentWord + 1) / sound.examples.length) * 100}%` }}
          className="h-full bg-primary-500"
        />
      </div>

      {/* Practice button (simulated) */}
      <div className="flex justify-center">
        <button
          onClick={handleCorrect}
          className="px-8 py-4 bg-primary-500 text-white rounded-lg font-bold text-lg hover:bg-primary-600 transition-colors"
        >
          Next Word →
        </button>
      </div>
    </div>
  );
}

// Sound matching game
export function SoundMatchingGame() {
  const { settings } = useSettingsStore();
  const [selectedPairs, setSelectedPairs] = useState<Set<string>>(new Set());

  const pairs = [
    { letter: 'b', word: 'ball', sound: 'b' },
    { letter: 'c', word: 'cat', sound: 'k' },
    { letter: 'd', word: 'dog', sound: 'd' },
    { letter: 'f', word: 'fish', sound: 'f' },
  ];

  const handlePairSelect = (letterId: string) => {
    setSelectedPairs(new Set([...selectedPairs, letterId]));
  };

  return (
    <div className="bg-white rounded-2xl shadow-xl p-8">
      <h2 className="text-2xl font-bold text-gray-800 mb-6 text-center">
        Match Letters to Sounds
      </h2>

      <div className="grid grid-cols-2 gap-8">
        {/* Letters */}
        <div className="space-y-4">
          <h3 className="font-bold text-gray-700 text-center">Letters</h3>
          {pairs.map((pair) => (
            <motion.button
              key={pair.letter}
              onClick={() => handlePairSelect(pair.letter)}
              whileHover={{ scale: settings.reducedMotion ? 1 : 1.05 }}
              className={`w-full py-6 rounded-xl font-bold text-3xl transition-colors ${
                selectedPairs.has(pair.letter)
                  ? 'bg-success-500 text-white'
                  : 'bg-gray-100 text-gray-800 hover:bg-gray-200'
              }`}
            >
              {pair.letter.toUpperCase()}
            </motion.button>
          ))}
        </div>

        {/* Words */}
        <div className="space-y-4">
          <h3 className="font-bold text-gray-700 text-center">Words</h3>
          {pairs.map((pair) => (
            <div
              key={pair.word}
              className="py-6 bg-blue-50 rounded-xl text-center font-medium text-2xl text-gray-800"
            >
              {pair.word}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// Beginning sound identification
export function BeginningSoundGame() {
  const { settings } = useSettingsStore();
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [score, setScore] = useState(0);

  const questions = [
    {
      word: 'ball',
      image: '⚽',
      correctSound: 'b',
      options: ['b', 'd', 'p'],
    },
    {
      word: 'cat',
      image: '🐱',
      correctSound: 'c',
      options: ['c', 'k', 's'],
    },
    {
      word: 'dog',
      image: '🐕',
      correctSound: 'd',
      options: ['d', 'b', 'g'],
    },
  ];

  const question = questions[currentQuestion];

  const handleAnswer = (answer: string) => {
    if (answer === question.correctSound) {
      setScore(score + 1);
    }

    if (currentQuestion < questions.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
    }
  };

  return (
    <div className="bg-white rounded-2xl shadow-xl p-8">
      <h2 className="text-2xl font-bold text-gray-800 mb-6 text-center">
        What Sound Does It Start With?
      </h2>

      <AnimatePresence mode="wait">
        <motion.div
          key={currentQuestion}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          transition={{ duration: settings.reducedMotion ? 0 : 0.3 }}
        >
          {/* Word and image */}
          <div className="text-center mb-8">
            <div className="text-9xl mb-4">{question.image}</div>
            <div className="text-4xl font-bold text-gray-900">{question.word}</div>
          </div>

          {/* Answer options */}
          <div className="flex justify-center gap-4">
            {question.options.map((option) => (
              <motion.button
                key={option}
                onClick={() => handleAnswer(option)}
                whileHover={{ scale: settings.reducedMotion ? 1 : 1.1 }}
                whileTap={{ scale: settings.reducedMotion ? 1 : 0.95 }}
                className="w-24 h-24 bg-primary-500 text-white rounded-2xl font-bold text-4xl hover:bg-primary-600 transition-colors shadow-lg"
              >
                {option}
              </motion.button>
            ))}
          </div>
        </motion.div>
      </AnimatePresence>

      {/* Score */}
      <div className="mt-8 text-center text-gray-700">
        Score: {score} / {questions.length}
      </div>
    </div>
  );
}

// Rhyming words exercise
export function RhymingWordsExercise() {
  const { settings } = useSettingsStore();
  const [foundPairs, setFoundPairs] = useState<Set<string>>(new Set());

  const rhymingPairs = [
    { word1: 'cat', word2: 'hat', pair: 'cat-hat' },
    { word1: 'dog', word2: 'fog', pair: 'dog-fog' },
    { word1: 'sun', word2: 'run', pair: 'sun-run' },
  ];

  const handlePairFound = (pair: string) => {
    setFoundPairs(new Set([...foundPairs, pair]));
  };

  return (
    <div className="bg-white rounded-2xl shadow-xl p-8">
      <h2 className="text-2xl font-bold text-gray-800 mb-6 text-center">
        Find the Rhyming Words
      </h2>

      <div className="space-y-4">
        {rhymingPairs.map((item) => (
          <motion.button
            key={item.pair}
            onClick={() => handlePairFound(item.pair)}
            disabled={foundPairs.has(item.pair)}
            whileHover={{ scale: settings.reducedMotion ? 1 : 1.02 }}
            className={`w-full p-6 rounded-xl transition-colors ${
              foundPairs.has(item.pair)
                ? 'bg-success-500 text-white'
                : 'bg-gray-100 text-gray-800 hover:bg-gray-200'
            }`}
          >
            <div className="flex justify-around items-center">
              <span className="text-3xl font-bold">{item.word1}</span>
              <span className="text-2xl">+</span>
              <span className="text-3xl font-bold">{item.word2}</span>
              {foundPairs.has(item.pair) && (
                <span className="text-2xl">✓</span>
              )}
            </div>
          </motion.button>
        ))}
      </div>

      {foundPairs.size === rhymingPairs.length && (
        <motion.div
          initial={{ opacity: 0, scale: 0 }}
          animate={{ opacity: 1, scale: 1 }}
          className="mt-6 text-center text-4xl"
        >
          🎉 All pairs found!
        </motion.div>
      )}
    </div>
  );
}

// Word family builder
export function WordFamilyBuilder({ family }: { family: string }) {
  const { settings } = useSettingsStore();

  // Generate words for the family (e.g., -at family: cat, hat, mat, etc.)
  const consonants = ['b', 'c', 'f', 'h', 'm', 'p', 'r', 's'];
  const words = consonants.map((c) => c + family);

  return (
    <div className="bg-white rounded-2xl shadow-xl p-8">
      <h2 className="text-2xl font-bold text-gray-800 mb-6 text-center">
        The -{family} Family
      </h2>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {words.map((word, index) => (
          <motion.div
            key={word}
            initial={{ opacity: 0, scale: 0 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{
              delay: settings.reducedMotion ? 0 : index * 0.1,
            }}
            className="bg-gradient-to-br from-blue-100 to-purple-100 rounded-xl p-6 text-center"
          >
            <div className="text-3xl font-bold text-gray-900">
              <span className="text-primary-600">{word[0]}</span>
              {word.slice(1)}
            </div>
          </motion.div>
        ))}
      </div>

      {/* Explanation */}
      <div className="mt-8 bg-blue-50 rounded-xl p-6 text-center">
        <p className="text-gray-800">
          All these words end with <span className="font-bold">-{family}</span>
        </p>
      </div>
    </div>
  );
}

// Phonics assessment
export function PhonicsAssessment() {
  const [currentTest, setCurrentTest] = useState(0);
  const [results, setResults] = useState<boolean[]>([]);

  const tests = [
    {
      question: 'What sound does "B" make?',
      options: ['bat', 'cat', 'sat'],
      correct: 0,
    },
    {
      question: 'Which word starts with "C"?',
      options: ['dog', 'cat', 'fox'],
      correct: 1,
    },
    {
      question: 'Find the word with "at" sound',
      options: ['dog', 'cat', 'run'],
      correct: 1,
    },
  ];

  const test = tests[currentTest];

  const handleAnswer = (index: number) => {
    const isCorrect = index === test.correct;
    setResults([...results, isCorrect]);

    if (currentTest < tests.length - 1) {
      setCurrentTest(currentTest + 1);
    }
  };

  const isComplete = results.length === tests.length;
  const score = results.filter((r) => r).length;

  if (isComplete) {
    return (
      <div className="bg-white rounded-2xl shadow-xl p-8 text-center">
        <div className="text-6xl mb-4">
          {score === tests.length ? '🎉' : '👍'}
        </div>
        <h2 className="text-3xl font-bold text-gray-800 mb-4">
          Assessment Complete!
        </h2>
        <div className="text-5xl font-bold text-primary-600 mb-2">
          {score} / {tests.length}
        </div>
        <div className="text-lg text-gray-600">
          {score === tests.length
            ? 'Perfect score!'
            : 'Keep practicing!'}
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl shadow-xl p-8">
      <h2 className="text-2xl font-bold text-gray-800 mb-6 text-center">
        Phonics Assessment
      </h2>

      <div className="mb-8">
        <div className="text-xl font-bold text-gray-900 mb-6 text-center">
          {test.question}
        </div>

        <div className="space-y-3">
          {test.options.map((option, index) => (
            <button
              key={index}
              onClick={() => handleAnswer(index)}
              className="w-full py-4 bg-gray-100 hover:bg-primary-100 rounded-lg font-medium text-xl text-gray-800 transition-colors"
            >
              {option}
            </button>
          ))}
        </div>
      </div>

      <div className="text-center text-gray-600">
        Question {currentTest + 1} of {tests.length}
      </div>
    </div>
  );
}
