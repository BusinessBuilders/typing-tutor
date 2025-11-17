/**
 * Word Categorization Component
 * Step 169 - Categorizing words by type, theme, or attribute
 */

import { motion } from 'framer-motion';
import { useState } from 'react';
import { useSettingsStore } from '../store/useSettingsStore';

// Word categories
export const WORD_CATEGORIES = {
  animals: ['cat', 'dog', 'bird', 'fish', 'lion', 'elephant', 'tiger', 'bear', 'rabbit', 'mouse'],
  colors: ['red', 'blue', 'green', 'yellow', 'purple', 'orange', 'pink', 'brown', 'black', 'white'],
  fruits: ['apple', 'banana', 'orange', 'grape', 'strawberry', 'watermelon', 'pear', 'peach'],
  vehicles: ['car', 'bus', 'train', 'airplane', 'boat', 'bike', 'truck', 'helicopter'],
  weather: ['sunny', 'rainy', 'cloudy', 'snowy', 'windy', 'stormy', 'foggy'],
  emotions: ['happy', 'sad', 'angry', 'excited', 'scared', 'tired', 'proud', 'nervous'],
};

export interface WordCategorizationProps {
  categories: string[];
  wordsPerCategory?: number;
  onComplete?: (accuracy: number) => void;
}

export default function WordCategorization({
  categories,
  wordsPerCategory = 4,
  onComplete,
}: WordCategorizationProps) {
  const { settings } = useSettingsStore();

  // Prepare words from selected categories
  const [words] = useState(() => {
    return categories
      .flatMap(cat =>
        WORD_CATEGORIES[cat as keyof typeof WORD_CATEGORIES]
          .slice(0, wordsPerCategory)
          .map(word => ({ word, category: cat }))
      )
      .sort(() => Math.random() - 0.5);
  });

  const [sorted, setSorted] = useState<Record<string, string[]>>(
    Object.fromEntries(categories.map(cat => [cat, []]))
  );

  const [currentWordIndex, setCurrentWordIndex] = useState(0);

  const currentWord = words[currentWordIndex];
  const remainingWords = words.slice(currentWordIndex);

  const handleCategorize = (category: string) => {
    setSorted({
      ...sorted,
      [category]: [...sorted[category], currentWord.word],
    });

    if (currentWordIndex < words.length - 1) {
      setCurrentWordIndex(currentWordIndex + 1);
    } else {
      // Calculate accuracy
      const correct = words.filter(w =>
        sorted[w.category]?.includes(w.word) || (w === currentWord && w.category === category)
      ).length;
      const accuracy = (correct / words.length) * 100;
      onComplete?.(accuracy);
    }
  };

  return (
    <div className="bg-white rounded-2xl shadow-xl p-8">
      <h2 className="text-2xl font-bold text-gray-800 mb-6 text-center">
        Categorize the Words
      </h2>

      {/* Current word */}
      {remainingWords.length > 0 && (
        <motion.div
          key={currentWordIndex}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-gradient-to-br from-purple-500 to-pink-600 rounded-2xl p-8 mb-6 text-center"
        >
          <div className="text-5xl font-bold text-white mb-2">
            {currentWord.word}
          </div>
          <div className="text-white text-sm">
            Which category does this belong to?
          </div>
        </motion.div>
      )}

      {/* Category buttons */}
      <div className="grid grid-cols-2 gap-4 mb-6">
        {categories.map((category) => (
          <motion.button
            key={category}
            onClick={() => handleCategorize(category)}
            whileHover={{ scale: settings.reducedMotion ? 1 : 1.05 }}
            whileTap={{ scale: settings.reducedMotion ? 1 : 0.95 }}
            className="py-6 bg-primary-100 text-primary-900 rounded-xl font-bold text-xl hover:bg-primary-200 transition-colors"
          >
            {category.charAt(0).toUpperCase() + category.slice(1)}
          </motion.button>
        ))}
      </div>

      {/* Progress */}
      <div className="text-center text-gray-600 text-sm">
        Word {currentWordIndex + 1} of {words.length}
      </div>
    </div>
  );
}

// Sorting game with drag zones
export function WordSortingGame() {
  const [categories] = useState(['animals', 'colors']);
  const [words] = useState(() => {
    const animalWords = WORD_CATEGORIES.animals.slice(0, 4);
    const colorWords = WORD_CATEGORIES.colors.slice(0, 4);
    return [...animalWords, ...colorWords]
      .map(word => ({
        word,
        category: animalWords.includes(word) ? 'animals' : 'colors',
      }))
      .sort(() => Math.random() - 0.5);
  });

  const [sorted, setSorted] = useState<Record<string, string[]>>({
    animals: [],
    colors: [],
  });

  // TODO: Connect to drag and drop
  // @ts-expect-error - Function will be used when drag-drop is implemented
  const handleSort = (word: string, category: string) => {
    setSorted({
      ...sorted,
      [category]: [...sorted[category], word],
    });
  };

  const unsortedWords = words.filter(
    w => !Object.values(sorted).flat().includes(w.word)
  );

  return (
    <div className="bg-white rounded-2xl shadow-xl p-8">
      <h2 className="text-2xl font-bold text-gray-800 mb-6 text-center">
        Sort the Words
      </h2>

      {/* Unsorted words */}
      <div className="mb-6">
        <h3 className="text-sm font-bold text-gray-700 mb-3">Words to sort:</h3>
        <div className="flex flex-wrap gap-2">
          {unsortedWords.map(({ word }) => (
            <div
              key={word}
              className="px-4 py-2 bg-gray-200 text-gray-800 rounded-lg font-bold cursor-pointer hover:bg-gray-300"
            >
              {word}
            </div>
          ))}
        </div>
      </div>

      {/* Category zones */}
      <div className="grid grid-cols-2 gap-4">
        {categories.map((category) => (
          <div
            key={category}
            className="bg-purple-50 rounded-xl p-4 min-h-[150px]"
          >
            <h3 className="text-center font-bold text-purple-900 mb-3 capitalize">
              {category}
            </h3>
            <div className="space-y-2">
              {sorted[category].map((word) => (
                <div
                  key={word}
                  className="px-3 py-2 bg-purple-500 text-white rounded-lg text-center font-bold"
                >
                  {word}
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      {unsortedWords.length === 0 && (
        <motion.div
          initial={{ opacity: 0, scale: 0 }}
          animate={{ opacity: 1, scale: 1 }}
          className="mt-6 text-center text-4xl"
        >
          🎉 All sorted!
        </motion.div>
      )}
    </div>
  );
}

// Category quiz
export function CategoryQuiz() {
  const [questions] = useState([
    { word: 'dog', options: ['animals', 'colors', 'fruits'], correct: 'animals' },
    { word: 'red', options: ['animals', 'colors', 'vehicles'], correct: 'colors' },
    { word: 'apple', options: ['fruits', 'weather', 'emotions'], correct: 'fruits' },
    { word: 'car', options: ['vehicles', 'fruits', 'colors'], correct: 'vehicles' },
  ]);

  const [currentIndex, setCurrentIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [answered, setAnswered] = useState(false);

  const current = questions[currentIndex];

  const handleAnswer = (answer: string) => {
    if (answered) return;

    setAnswered(true);
    if (answer === current.correct) {
      setScore(score + 1);
    }

    setTimeout(() => {
      if (currentIndex < questions.length - 1) {
        setCurrentIndex(currentIndex + 1);
        setAnswered(false);
      }
    }, 1500);
  };

  return (
    <div className="bg-white rounded-2xl shadow-xl p-8">
      <h2 className="text-2xl font-bold text-gray-800 mb-6 text-center">
        Category Quiz
      </h2>

      {/* Word */}
      <div className="bg-gradient-to-br from-teal-500 to-cyan-600 rounded-2xl p-8 mb-6 text-center">
        <div className="text-6xl font-bold text-white mb-2">
          {current.word}
        </div>
        <div className="text-white text-sm">
          What category is this?
        </div>
      </div>

      {/* Options */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        {current.options.map((option) => {
          const isCorrect = option === current.correct;
          const showResult = answered;

          return (
            <motion.button
              key={option}
              onClick={() => handleAnswer(option)}
              disabled={answered}
              whileHover={{ scale: answered ? 1 : 1.05 }}
              className={`py-6 rounded-xl font-bold text-lg transition-colors capitalize ${
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
        <span>Question {currentIndex + 1} / {questions.length}</span>
        <span className="font-bold">Score: {score}</span>
      </div>
    </div>
  );
}
