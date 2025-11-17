/**
 * Rhyming Practice Component
 * Step 167 - Rhyming word recognition and practice
 */

import { motion, AnimatePresence } from 'framer-motion';
import { useState } from 'react';
import { useSettingsStore } from '../store/useSettingsStore';

// Rhyming word groups
export const RHYMING_GROUPS = [
  { pattern: '-at', words: ['cat', 'bat', 'hat', 'mat', 'rat', 'sat', 'fat', 'pat'] },
  { pattern: '-an', words: ['can', 'fan', 'man', 'pan', 'ran', 'tan', 'van', 'plan'] },
  { pattern: '-ig', words: ['big', 'dig', 'fig', 'pig', 'wig', 'jig', 'twig'] },
  { pattern: '-op', words: ['hop', 'mop', 'pop', 'top', 'stop', 'shop', 'drop', 'crop'] },
  { pattern: '-ug', words: ['bug', 'dug', 'hug', 'jug', 'mug', 'rug', 'tug', 'slug'] },
  { pattern: '-ay', words: ['day', 'hay', 'jay', 'may', 'pay', 'ray', 'say', 'way', 'play', 'stay'] },
  { pattern: '-ake', words: ['bake', 'cake', 'lake', 'make', 'take', 'wake', 'shake', 'snake'] },
  { pattern: '-all', words: ['ball', 'call', 'fall', 'hall', 'mall', 'tall', 'wall', 'small'] },
  { pattern: '-eat', words: ['beat', 'heat', 'meat', 'neat', 'seat', 'treat', 'wheat'] },
  { pattern: '-ight', words: ['bright', 'fight', 'light', 'might', 'night', 'right', 'sight', 'tight'] },
];

export interface RhymingPracticeProps {
  groupCount?: number;
  onComplete?: (accuracy: number) => void;
}

export default function RhymingPractice({
  groupCount = 5,
  onComplete,
}: RhymingPracticeProps) {
  const { settings } = useSettingsStore();
  const [groups] = useState(() =>
    RHYMING_GROUPS.sort(() => Math.random() - 0.5).slice(0, groupCount)
  );

  const [currentIndex, setCurrentIndex] = useState(0);
  const [correct, setCorrect] = useState(0);
  const [selectedWord, setSelectedWord] = useState<string | null>(null);

  const currentGroup = groups[currentIndex];
  const targetWord = currentGroup.words[0];
  const rhymingWord = currentGroup.words[Math.floor(Math.random() * (currentGroup.words.length - 1)) + 1];
  const nonRhymingWords = RHYMING_GROUPS
    .filter(g => g.pattern !== currentGroup.pattern)
    .flatMap(g => g.words)
    .sort(() => Math.random() - 0.5)
    .slice(0, 2);

  const options = [rhymingWord, ...nonRhymingWords].sort(() => Math.random() - 0.5);

  const handleAnswer = (word: string) => {
    setSelectedWord(word);

    if (word === rhymingWord) {
      setCorrect(correct + 1);
    }

    setTimeout(() => {
      if (currentIndex < groups.length - 1) {
        setCurrentIndex(currentIndex + 1);
        setSelectedWord(null);
      } else {
        const accuracy = (correct / groups.length) * 100;
        onComplete?.(accuracy);
      }
    }, 1500);
  };

  return (
    <div className="bg-white rounded-2xl shadow-xl p-8">
      <h2 className="text-2xl font-bold text-gray-800 mb-6 text-center">
        Find the Rhyming Word
      </h2>

      {/* Target word */}
      <AnimatePresence mode="wait">
        <motion.div
          key={currentIndex}
          initial={{ opacity: 0, rotateY: -90 }}
          animate={{ opacity: 1, rotateY: 0 }}
          exit={{ opacity: 0, rotateY: 90 }}
          transition={{ duration: settings.reducedMotion ? 0 : 0.4 }}
          className="bg-gradient-to-br from-rose-500 to-pink-600 rounded-2xl p-8 mb-6 text-center"
        >
          <div className="text-6xl font-bold text-white mb-2">{targetWord}</div>
          <div className="text-white text-sm">Which word rhymes with this?</div>
        </motion.div>
      </AnimatePresence>

      {/* Options */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        {options.map((word) => {
          const isCorrect = word === rhymingWord;
          const showResult = selectedWord !== null;

          return (
            <motion.button
              key={word}
              onClick={() => handleAnswer(word)}
              disabled={selectedWord !== null}
              whileHover={{ scale: selectedWord === null && !settings.reducedMotion ? 1.05 : 1 }}
              className={`py-6 rounded-xl font-bold text-2xl transition-colors ${
                showResult
                  ? isCorrect
                    ? 'bg-success-500 text-white'
                    : selectedWord === word
                    ? 'bg-red-500 text-white'
                    : 'bg-gray-200 text-gray-600'
                  : 'bg-primary-100 text-primary-900 hover:bg-primary-200'
              }`}
            >
              {word}
            </motion.button>
          );
        })}
      </div>

      {/* Progress */}
      <div className="flex justify-between text-sm text-gray-600">
        <span>Question {currentIndex + 1} of {groups.length}</span>
        <span className="font-bold text-success-600">{correct} correct</span>
      </div>
    </div>
  );
}

// Rhyme matching game
export function RhymeMatchingGame() {
  const [group] = useState(() =>
    RHYMING_GROUPS[Math.floor(Math.random() * RHYMING_GROUPS.length)]
  );

  const [pairs] = useState(() => {
    const words = group.words.slice(0, 6);
    return [...words, ...words].sort(() => Math.random() - 0.5);
  });

  const [flipped, setFlipped] = useState<number[]>([]);
  const [matched, setMatched] = useState<Set<string>>(new Set());

  const handleFlip = (index: number) => {
    if (flipped.length === 2 || flipped.includes(index) || matched.has(pairs[index])) {
      return;
    }

    const newFlipped = [...flipped, index];
    setFlipped(newFlipped);

    if (newFlipped.length === 2) {
      const [first, second] = newFlipped;
      if (pairs[first] === pairs[second]) {
        setMatched(new Set([...matched, pairs[first]]));
        setFlipped([]);
      } else {
        setTimeout(() => setFlipped([]), 1000);
      }
    }
  };

  return (
    <div className="bg-white rounded-2xl shadow-xl p-8">
      <h2 className="text-2xl font-bold text-gray-800 mb-6 text-center">
        Rhyming Memory Match
      </h2>

      <div className="bg-pink-100 rounded-xl p-4 mb-6 text-center">
        <div className="text-sm font-bold text-pink-900">
          All words rhyme with: {group.pattern}
        </div>
      </div>

      <div className="grid grid-cols-4 gap-3">
        {pairs.map((word, index) => {
          const isFlipped = flipped.includes(index) || matched.has(word);

          return (
            <motion.button
              key={index}
              onClick={() => handleFlip(index)}
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
                        : 'bg-pink-500 text-white'
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

      {matched.size === group.words.slice(0, 6).length && (
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

// Rhyme completion
export function RhymeCompletion() {
  const [poems] = useState([
    {
      lines: [
        'The cat sat on a ___',
        'And played with a toy ___',
      ],
      answers: ['mat', 'rat'],
      rhyme: '-at',
    },
    {
      lines: [
        'I see a big ___',
        'It can dig and ___',
      ],
      answers: ['pig', 'jig'],
      rhyme: '-ig',
    },
  ]);

  const [currentPoem] = useState(0);
  const [completed, setCompleted] = useState<string[]>([]);

  const poem = poems[currentPoem];

  return (
    <div className="bg-white rounded-2xl shadow-xl p-8">
      <h2 className="text-2xl font-bold text-gray-800 mb-6 text-center">
        Complete the Rhyme
      </h2>

      <div className="bg-gradient-to-br from-purple-100 to-pink-100 rounded-2xl p-8 mb-6">
        {poem.lines.map((line, index) => (
          <div key={index} className="text-2xl font-medium text-gray-800 mb-4">
            {line.replace('___', completed[index] || '___')}
          </div>
        ))}
      </div>

      <div className="mb-4">
        <h3 className="text-sm font-bold text-gray-700 mb-2">
          Choose words that rhyme with {poem.rhyme}:
        </h3>
        <div className="flex flex-wrap gap-2">
          {poem.answers.map((answer) => (
            <button
              key={answer}
              onClick={() => {
                if (!completed.includes(answer)) {
                  setCompleted([...completed, answer]);
                }
              }}
              disabled={completed.includes(answer)}
              className="px-6 py-3 bg-pink-500 text-white rounded-lg font-bold hover:bg-pink-600 disabled:opacity-50 transition-colors"
            >
              {answer}
            </button>
          ))}
        </div>
      </div>

      {completed.length === poem.answers.length && (
        <motion.div
          initial={{ opacity: 0, scale: 0 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center text-4xl"
        >
          🎉 Perfect rhyme!
        </motion.div>
      )}
    </div>
  );
}
