/**
 * Sentence Structure Practice Component
 * Step 172 - Practice sentence structure and grammar
 */

import { motion, AnimatePresence } from 'framer-motion';
import { useState } from 'react';
import { useSettingsStore } from '../store/useSettingsStore';

// Sentence parts for building practice
export const SENTENCE_PARTS = {
  subjects: ['The cat', 'A dog', 'My friend', 'The teacher', 'A bird', 'The car', 'We', 'They', 'She', 'He'],
  verbs: ['runs', 'jumps', 'reads', 'writes', 'plays', 'sleeps', 'eats', 'walks', 'sings', 'dances'],
  objects: ['a book', 'the ball', 'some food', 'a song', 'in the park', 'at home', 'quickly', 'happily'],
};

// Sample sentence structures
export const SENTENCE_STRUCTURES = [
  {
    pattern: 'Subject + Verb',
    example: 'The cat runs.',
    template: ['subject', 'verb'],
  },
  {
    pattern: 'Subject + Verb + Object',
    example: 'The dog eats food.',
    template: ['subject', 'verb', 'object'],
  },
  {
    pattern: 'Subject + Verb + Adverb',
    example: 'She sings beautifully.',
    template: ['subject', 'verb', 'adverb'],
  },
];

export interface SentenceStructureProps {
  structure?: typeof SENTENCE_STRUCTURES[0];
  onComplete?: () => void;
}

export default function SentenceStructure({
  structure,
  onComplete,
}: SentenceStructureProps) {
  const { settings } = useSettingsStore();
  const [selectedParts, setSelectedParts] = useState<string[]>([]);

  const targetStructure = structure || SENTENCE_STRUCTURES[0];

  const handleSelectPart = (part: string) => {
    const newParts = [...selectedParts, part];
    setSelectedParts(newParts);

    if (newParts.length === targetStructure.template.length) {
      setTimeout(() => {
        onComplete?.();
      }, 1500);
    }
  };

  const handleReset = () => {
    setSelectedParts([]);
  };

  return (
    <div className="bg-white rounded-2xl shadow-xl p-8">
      <h2 className="text-2xl font-bold text-gray-800 mb-6 text-center">
        Build a Sentence: {targetStructure.pattern}
      </h2>

      {/* Example */}
      <div className="bg-blue-50 rounded-xl p-4 mb-6 text-center">
        <div className="text-sm text-blue-900 mb-1">Example:</div>
        <div className="text-xl font-medium text-blue-700">
          {targetStructure.example}
        </div>
      </div>

      {/* Built sentence */}
      <div className="bg-gray-50 rounded-xl p-6 mb-6 min-h-[80px] flex items-center justify-center">
        <div className="flex gap-2 flex-wrap justify-center">
          {selectedParts.map((part, index) => (
            <motion.div
              key={index}
              initial={{ scale: 0, rotateY: 90 }}
              animate={{ scale: 1, rotateY: 0 }}
              className="px-4 py-2 bg-primary-500 text-white rounded-lg font-medium text-lg"
            >
              {part}
            </motion.div>
          ))}
          {selectedParts.length < targetStructure.template.length && (
            <div className="px-4 py-2 bg-gray-200 text-gray-400 rounded-lg font-medium text-lg">
              ?
            </div>
          )}
        </div>
      </div>

      {/* Word selection */}
      {selectedParts.length < targetStructure.template.length && (
        <div className="mb-6">
          <h3 className="text-sm font-bold text-gray-700 mb-3 capitalize">
            Choose a {targetStructure.template[selectedParts.length]}:
          </h3>
          <div className="flex flex-wrap gap-2">
            {SENTENCE_PARTS.subjects.slice(0, 6).map((part) => (
              <motion.button
                key={part}
                onClick={() => handleSelectPart(part)}
                whileHover={{ scale: settings.reducedMotion ? 1 : 1.05 }}
                whileTap={{ scale: settings.reducedMotion ? 1 : 0.95 }}
                className="px-4 py-2 bg-gray-100 text-gray-800 rounded-lg font-medium hover:bg-primary-100 transition-colors"
              >
                {part}
              </motion.button>
            ))}
          </div>
        </div>
      )}

      {/* Controls */}
      <div className="flex justify-center">
        <button
          onClick={handleReset}
          className="px-6 py-3 bg-gray-200 text-gray-700 rounded-lg font-bold hover:bg-gray-300 transition-colors"
        >
          Reset
        </button>
      </div>

      {/* Completion */}
      {selectedParts.length === targetStructure.template.length && (
        <motion.div
          initial={{ opacity: 0, scale: 0 }}
          animate={{ opacity: 1, scale: 1 }}
          className="mt-6 bg-success-50 rounded-xl p-6 text-center"
        >
          <div className="text-4xl mb-2">🎉</div>
          <div className="text-xl font-bold text-success-900">
            Great sentence!
          </div>
        </motion.div>
      )}
    </div>
  );
}

// Word order practice
export function WordOrderPractice() {
  const [sentences] = useState([
    { scrambled: ['runs', 'cat', 'The'], correct: 'The cat runs.' },
    { scrambled: ['book', 'reads', 'She', 'a'], correct: 'She reads a book.' },
    { scrambled: ['in', 'play', 'park', 'We', 'the'], correct: 'We play in the park.' },
  ]);

  const [currentIndex, setCurrentIndex] = useState(0);
  const [ordered, setOrdered] = useState<string[]>([]);

  const current = sentences[currentIndex];

  const handleAddWord = (word: string) => {
    setOrdered([...ordered, word]);
  };

  const handleReset = () => {
    setOrdered([]);
  };

  const builtSentence = ordered.join(' ') + (ordered.length > 0 ? '.' : '');
  const isCorrect = builtSentence === current.correct;

  return (
    <div className="bg-white rounded-2xl shadow-xl p-8">
      <h2 className="text-2xl font-bold text-gray-800 mb-6 text-center">
        Put Words in Order
      </h2>

      {/* Built sentence */}
      <div className="bg-gray-50 rounded-xl p-6 mb-6 min-h-[80px]">
        <div className="text-2xl text-center">
          {ordered.length > 0 ? (
            <div className="flex gap-2 flex-wrap justify-center">
              {ordered.map((word, index) => (
                <motion.span
                  key={index}
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  className="px-3 py-1 bg-primary-500 text-white rounded-lg"
                >
                  {word}
                </motion.span>
              ))}
              <span className="text-gray-600">.</span>
            </div>
          ) : (
            <div className="text-gray-400">Click words to build a sentence</div>
          )}
        </div>
      </div>

      {/* Scrambled words */}
      <div className="mb-6">
        <div className="flex flex-wrap gap-2 justify-center">
          {current.scrambled
            .filter(w => !ordered.includes(w))
            .map((word, index) => (
              <motion.button
                key={index}
                onClick={() => handleAddWord(word)}
                whileHover={{ scale: 1.05 }}
                className="px-6 py-3 bg-blue-100 text-blue-900 rounded-lg font-bold hover:bg-blue-200 transition-colors"
              >
                {word}
              </motion.button>
            ))}
        </div>
      </div>

      {/* Controls */}
      <div className="flex justify-center gap-4">
        <button
          onClick={handleReset}
          className="px-6 py-3 bg-gray-200 text-gray-700 rounded-lg font-bold hover:bg-gray-300 transition-colors"
        >
          Reset
        </button>
        {ordered.length === current.scrambled.length && (
          <button
            onClick={() => {
              if (isCorrect && currentIndex < sentences.length - 1) {
                setCurrentIndex(currentIndex + 1);
                setOrdered([]);
              }
            }}
            disabled={!isCorrect}
            className="px-6 py-3 bg-primary-500 text-white rounded-lg font-bold hover:bg-primary-600 disabled:opacity-50 transition-colors"
          >
            Next →
          </button>
        )}
      </div>

      {/* Feedback */}
      {ordered.length === current.scrambled.length && (
        <motion.div
          initial={{ opacity: 0, scale: 0 }}
          animate={{ opacity: 1, scale: 1 }}
          className={`mt-6 rounded-xl p-6 text-center ${
            isCorrect
              ? 'bg-success-50'
              : 'bg-red-50'
          }`}
        >
          <div className="text-2xl mb-2">
            {isCorrect ? '✓' : '✗'}
          </div>
          <div className={`text-lg font-bold ${
            isCorrect ? 'text-success-900' : 'text-red-900'
          }`}>
            {isCorrect ? 'Perfect order!' : 'Try again!'}
          </div>
          {!isCorrect && (
            <div className="text-sm text-gray-600 mt-2">
              Correct: {current.correct}
            </div>
          )}
        </motion.div>
      )}
    </div>
  );
}

// Sentence pattern matching
export function SentencePatternMatching() {
  const [patterns] = useState([
    { name: 'Subject + Verb', examples: ['The dog runs.', 'She jumps.', 'They play.'] },
    { name: 'Subject + Verb + Object', examples: ['I eat food.', 'He reads books.', 'We love games.'] },
  ]);

  const [sentences] = useState([
    { text: 'The cat sleeps.', pattern: 'Subject + Verb' },
    { text: 'She writes a letter.', pattern: 'Subject + Verb + Object' },
    { text: 'They dance.', pattern: 'Subject + Verb' },
  ]);

  const [currentIndex, setCurrentIndex] = useState(0);
  const [selected, setSelected] = useState<string | null>(null);

  const current = sentences[currentIndex];

  const handleSelect = (pattern: string) => {
    setSelected(pattern);

    if (pattern === current.pattern) {
      setTimeout(() => {
        if (currentIndex < sentences.length - 1) {
          setCurrentIndex(currentIndex + 1);
          setSelected(null);
        }
      }, 1500);
    }
  };

  return (
    <div className="bg-white rounded-2xl shadow-xl p-8">
      <h2 className="text-2xl font-bold text-gray-800 mb-6 text-center">
        Match the Sentence Pattern
      </h2>

      {/* Sentence */}
      <AnimatePresence mode="wait">
        <motion.div
          key={currentIndex}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          className="bg-gradient-to-br from-purple-500 to-pink-600 rounded-xl p-8 mb-6 text-center"
        >
          <div className="text-3xl font-bold text-white">
            {current.text}
          </div>
        </motion.div>
      </AnimatePresence>

      {/* Pattern options */}
      <div className="space-y-4">
        {patterns.map((pattern) => {
          const isCorrect = pattern.name === current.pattern;
          const showResult = selected !== null;

          return (
            <motion.button
              key={pattern.name}
              onClick={() => handleSelect(pattern.name)}
              disabled={selected !== null}
              whileHover={{ scale: selected === null ? 1.02 : 1 }}
              className={`w-full text-left p-6 rounded-xl transition-colors ${
                showResult
                  ? isCorrect
                    ? 'bg-success-500 text-white'
                    : selected === pattern.name
                    ? 'bg-red-500 text-white'
                    : 'bg-gray-100 text-gray-600'
                  : 'bg-primary-100 text-primary-900 hover:bg-primary-200'
              }`}
            >
              <div className="font-bold text-xl mb-2">{pattern.name}</div>
              <div className={`text-sm ${
                showResult && isCorrect
                  ? 'text-white opacity-90'
                  : showResult
                  ? 'text-gray-500'
                  : 'text-gray-600'
              }`}>
                Example: {pattern.examples[0]}
              </div>
            </motion.button>
          );
        })}
      </div>
    </div>
  );
}
