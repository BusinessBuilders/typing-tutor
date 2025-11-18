/**
 * Punctuation Practice Component
 * Step 173 - Practice using punctuation marks
 */

import { motion, AnimatePresence } from 'framer-motion';
import { useState } from 'react';
import { useSettingsStore } from '../store/useSettingsStore';

// Punctuation marks to practice
export const PUNCTUATION_MARKS = {
  period: { symbol: '.', name: 'Period', usage: 'End of statement' },
  question: { symbol: '?', name: 'Question Mark', usage: 'End of question' },
  exclamation: { symbol: '!', name: 'Exclamation Mark', usage: 'Show excitement' },
  comma: { symbol: ',', name: 'Comma', usage: 'Separate items' },
  apostrophe: { symbol: "'", name: 'Apostrophe', usage: 'Contractions/possession' },
  quotation: { symbol: '"', name: 'Quotation Marks', usage: 'Direct speech' },
};

// Sentences needing punctuation
export const PUNCTUATION_EXERCISES = [
  { sentence: 'The cat is sleeping', correctMark: '.', type: 'period' },
  { sentence: 'Where is my book', correctMark: '?', type: 'question' },
  { sentence: 'Watch out', correctMark: '!', type: 'exclamation' },
  { sentence: 'What time is it', correctMark: '?', type: 'question' },
  { sentence: 'That was amazing', correctMark: '!', type: 'exclamation' },
  { sentence: 'I like apples', correctMark: '.', type: 'period' },
  { sentence: 'How are you today', correctMark: '?', type: 'question' },
  { sentence: 'Stop right there', correctMark: '!', type: 'exclamation' },
];

export interface PunctuationPracticeProps {
  exerciseCount?: number;
  onComplete?: (accuracy: number) => void;
}

export default function PunctuationPractice({
  exerciseCount = 5,
  onComplete,
}: PunctuationPracticeProps) {
  const { settings } = useSettingsStore();
  const [exercises] = useState(() =>
    PUNCTUATION_EXERCISES.sort(() => Math.random() - 0.5).slice(0, exerciseCount)
  );

  const [currentIndex, setCurrentIndex] = useState(0);
  const [selected, setSelected] = useState<string | null>(null);
  const [correct, setCorrect] = useState(0);

  const current = exercises[currentIndex];

  const handleSelect = (mark: string) => {
    setSelected(mark);

    if (mark === current.correctMark) {
      setCorrect(correct + 1);
    }

    setTimeout(() => {
      if (currentIndex < exercises.length - 1) {
        setCurrentIndex(currentIndex + 1);
        setSelected(null);
      } else {
        const accuracy = (correct / exercises.length) * 100;
        onComplete?.(accuracy);
      }
    }, 1500);
  };

  return (
    <div className="bg-white rounded-2xl shadow-xl p-8">
      <h2 className="text-2xl font-bold text-gray-800 mb-6 text-center">
        Add the Correct Punctuation
      </h2>

      {/* Sentence */}
      <AnimatePresence mode="wait">
        <motion.div
          key={currentIndex}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          transition={{ duration: settings.reducedMotion ? 0 : 0.3 }}
          className="bg-gradient-to-br from-teal-500 to-cyan-600 rounded-xl p-8 mb-6 text-center"
        >
          <div className="text-3xl font-medium text-white">
            {current.sentence}
            {selected && (
              <motion.span
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                className={selected === current.correctMark ? 'text-yellow-300' : 'text-red-300'}
              >
                {selected}
              </motion.span>
            )}
            {!selected && <span className="text-gray-300">_</span>}
          </div>
        </motion.div>
      </AnimatePresence>

      {/* Punctuation options */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        {['.', '?', '!'].map((mark) => {
          const isCorrect = mark === current.correctMark;
          const showResult = selected !== null;

          return (
            <motion.button
              key={mark}
              onClick={() => handleSelect(mark)}
              disabled={selected !== null}
              whileHover={{ scale: selected === null && !settings.reducedMotion ? 1.1 : 1 }}
              whileTap={{ scale: selected === null && !settings.reducedMotion ? 0.95 : 1 }}
              className={`aspect-square rounded-xl font-bold text-6xl transition-colors ${
                showResult
                  ? isCorrect
                    ? 'bg-success-500 text-white'
                    : selected === mark
                    ? 'bg-red-500 text-white'
                    : 'bg-gray-200 text-gray-400'
                  : 'bg-primary-100 text-primary-900 hover:bg-primary-200'
              }`}
            >
              {mark}
            </motion.button>
          );
        })}
      </div>

      {/* Progress */}
      <div className="flex justify-between text-sm text-gray-600">
        <span>Sentence {currentIndex + 1} of {exercises.length}</span>
        <span className="font-bold text-success-600">{correct} correct</span>
      </div>
    </div>
  );
}

// Comma placement practice
export function CommaPlacementPractice() {
  const [sentences] = useState([
    { text: ['I like apples', 'oranges', 'and bananas.'], commaAfter: [0, 1] },
    { text: ['She bought milk', 'bread', 'and cheese.'], commaAfter: [0, 1] },
    { text: ['We can play outside', 'but it is raining.'], commaAfter: [0] },
  ]);

  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedIndices, setSelectedIndices] = useState<number[]>([]);

  const current = sentences[currentIndex];

  const handleToggle = (index: number) => {
    if (selectedIndices.includes(index)) {
      setSelectedIndices(selectedIndices.filter(i => i !== index));
    } else {
      setSelectedIndices([...selectedIndices, index]);
    }
  };

  const isCorrect = JSON.stringify([...selectedIndices].sort()) === JSON.stringify(current.commaAfter);

  return (
    <div className="bg-white rounded-2xl shadow-xl p-8">
      <h2 className="text-2xl font-bold text-gray-800 mb-6 text-center">
        Place the Commas
      </h2>

      <div className="bg-blue-50 rounded-xl p-4 mb-6 text-center">
        <div className="text-sm text-blue-900">
          Click after words where commas should go
        </div>
      </div>

      {/* Sentence with clickable positions */}
      <div className="bg-gray-50 rounded-xl p-6 mb-6">
        <div className="text-2xl flex flex-wrap justify-center gap-x-2">
          {current.text.map((part, index) => (
            <span key={index} className="inline-flex items-center">
              <span className="text-gray-900">{part}</span>
              {index < current.text.length - 1 && (
                <button
                  onClick={() => handleToggle(index)}
                  className={`ml-1 w-8 h-8 rounded-full font-bold transition-colors ${
                    selectedIndices.includes(index)
                      ? 'bg-primary-500 text-white'
                      : 'bg-gray-200 text-gray-400 hover:bg-gray-300'
                  }`}
                >
                  {selectedIndices.includes(index) ? ',' : '+'}
                </button>
              )}
            </span>
          ))}
        </div>
      </div>

      {/* Check button */}
      <div className="flex justify-center mb-6">
        <button
          onClick={() => {
            if (isCorrect && currentIndex < sentences.length - 1) {
              setCurrentIndex(currentIndex + 1);
              setSelectedIndices([]);
            }
          }}
          className={`px-8 py-3 rounded-lg font-bold transition-colors ${
            isCorrect
              ? 'bg-success-500 text-white hover:bg-success-600'
              : 'bg-gray-200 text-gray-500'
          }`}
        >
          {isCorrect ? 'Next →' : 'Check'}
        </button>
      </div>

      {/* Feedback */}
      {selectedIndices.length > 0 && (
        <motion.div
          initial={{ opacity: 0, scale: 0 }}
          animate={{ opacity: 1, scale: 1 }}
          className={`text-center text-2xl ${
            isCorrect ? 'text-success-600' : 'text-gray-600'
          }`}
        >
          {isCorrect ? '✓ Perfect!' : 'Keep trying...'}
        </motion.div>
      )}
    </div>
  );
}

// Quotation marks practice
export function QuotationMarksPractice() {
  const [dialogues] = useState([
    { speaker: 'She said', quote: 'Hello everyone' },
    { speaker: 'He asked', quote: 'What time is it' },
    { speaker: 'They shouted', quote: 'We won the game' },
  ]);

  const [currentIndex, setCurrentIndex] = useState(0);
  const [typed, setTyped] = useState('');

  const current = dialogues[currentIndex];
  const correctSentence = `${current.speaker}, "${current.quote}."`;

  // TODO: Connect to keyboard input
  // @ts-expect-error - Function will be used when keyboard input is implemented
  const handleKeyPress = (key: string) => {
    if (key === 'Backspace') {
      setTyped(typed.slice(0, -1));
      return;
    }

    const newTyped = typed + key;

    if (newTyped === correctSentence) {
      setTimeout(() => {
        if (currentIndex < dialogues.length - 1) {
          setCurrentIndex(currentIndex + 1);
          setTyped('');
        }
      }, 1000);
    } else if (correctSentence.startsWith(newTyped)) {
      setTyped(newTyped);
    }
  };

  return (
    <div className="bg-white rounded-2xl shadow-xl p-8">
      <h2 className="text-2xl font-bold text-gray-800 mb-6 text-center">
        Add Quotation Marks
      </h2>

      {/* Example */}
      <div className="bg-purple-50 rounded-xl p-4 mb-6 text-center">
        <div className="text-lg font-medium text-purple-900">
          {current.speaker}, <span className="text-purple-600 font-bold">"</span>
          {current.quote}
          <span className="text-purple-600 font-bold">."</span>
        </div>
      </div>

      {/* Typing area */}
      <div className="bg-gray-50 rounded-xl p-6 mb-6">
        <div className="text-xl font-mono min-h-[60px]">
          {typed.split('').map((char, index) => (
            <span
              key={index}
              className={char === correctSentence[index] ? 'text-success-600' : 'text-red-600'}
            >
              {char}
            </span>
          ))}
          <span className="animate-pulse">|</span>
        </div>
      </div>

      {/* Hint */}
      <div className="text-center text-sm text-gray-600">
        Type the sentence with quotation marks around the spoken words
      </div>
    </div>
  );
}

// Punctuation identification
export function PunctuationIdentification() {
  const [sentences] = useState([
    { text: 'What a beautiful day!', marks: ['!'], type: 'exclamation' },
    { text: 'Do you like pizza?', marks: ['?'], type: 'question' },
    { text: 'I went to the store, bought milk, and came home.', marks: [',', ','], type: 'comma' },
  ]);

  const [currentIndex] = useState(0);
  const [identified, setIdentified] = useState<string[]>([]);

  const current = sentences[currentIndex];

  return (
    <div className="bg-white rounded-2xl shadow-xl p-8">
      <h2 className="text-2xl font-bold text-gray-800 mb-6 text-center">
        Find the Punctuation
      </h2>

      {/* Sentence */}
      <div className="bg-gradient-to-br from-orange-400 to-pink-500 rounded-xl p-8 mb-6 text-center">
        <div className="text-2xl font-medium text-white">
          {current.text}
        </div>
      </div>

      {/* Question */}
      <div className="bg-gray-50 rounded-xl p-6 mb-6 text-center">
        <div className="text-lg text-gray-800 mb-4">
          What punctuation marks do you see?
        </div>
        <div className="flex justify-center gap-4">
          {['.', '?', '!', ','].map((mark) => (
            <motion.button
              key={mark}
              onClick={() => {
                if (!identified.includes(mark)) {
                  setIdentified([...identified, mark]);
                }
              }}
              whileHover={{ scale: 1.1 }}
              disabled={identified.includes(mark)}
              className={`w-16 h-16 rounded-xl font-bold text-3xl ${
                identified.includes(mark)
                  ? current.marks.includes(mark)
                    ? 'bg-success-500 text-white'
                    : 'bg-red-500 text-white'
                  : 'bg-primary-100 text-primary-900 hover:bg-primary-200'
              }`}
            >
              {mark}
            </motion.button>
          ))}
        </div>
      </div>

      {/* Reset button */}
      <div className="flex justify-center">
        <button
          onClick={() => setIdentified([])}
          className="px-6 py-3 bg-gray-200 text-gray-700 rounded-lg font-bold hover:bg-gray-300 transition-colors"
        >
          Reset
        </button>
      </div>
    </div>
  );
}
