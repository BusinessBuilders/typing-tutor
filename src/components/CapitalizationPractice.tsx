/**
 * Capitalization Practice Component
 * Step 174 - Practice proper capitalization rules
 */

import { motion, AnimatePresence } from 'framer-motion';
import { useState, useEffect } from 'react';
import { useSettingsStore } from '../store/useSettingsStore';

// Capitalization rules and examples
export const CAPITALIZATION_RULES = {
  sentenceStart: {
    name: 'Start of Sentence',
    rule: 'Always capitalize the first word',
    examples: ['the cat sleeps', 'she is happy', 'we love pizza'],
    correct: ['The cat sleeps.', 'She is happy.', 'We love pizza.'],
  },
  properNouns: {
    name: 'Proper Nouns',
    rule: 'Capitalize names of people and places',
    examples: ['john lives in texas', 'mary went to paris', 'tom and sarah play'],
    correct: ['John lives in Texas.', 'Mary went to Paris.', 'Tom and Sarah play.'],
  },
  i: {
    name: 'The Letter I',
    rule: 'Always capitalize the letter I',
    examples: ['i like cookies', 'she and i play', 'i am happy'],
    correct: ['I like cookies.', 'She and I play.', 'I am happy.'],
  },
};

export interface CapitalizationPracticeProps {
  rule?: keyof typeof CAPITALIZATION_RULES;
  onComplete?: (accuracy: number) => void;
}

export default function CapitalizationPractice({
  rule = 'sentenceStart',
  onComplete,
}: CapitalizationPracticeProps) {
  const { settings } = useSettingsStore();
  const ruleData = CAPITALIZATION_RULES[rule];

  const [currentIndex, setCurrentIndex] = useState(0);
  const [typed, setTyped] = useState('');
  const [correct, setCorrect] = useState(0);

  const incorrectSentence = ruleData.examples[currentIndex];
  const correctSentence = ruleData.correct[currentIndex];

  const handleKeyPress = (key: string) => {
    if (key === 'Backspace') {
      setTyped(typed.slice(0, -1));
      return;
    }

    const newTyped = typed + key;

    if (newTyped === correctSentence) {
      setCorrect(correct + 1);
      setTyped('');

      if (currentIndex < ruleData.examples.length - 1) {
        setCurrentIndex(currentIndex + 1);
      } else {
        const accuracy = (correct / ruleData.examples.length) * 100;
        onComplete?.(accuracy);
      }
    } else if (correctSentence.startsWith(newTyped)) {
      setTyped(newTyped);
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
  }, [typed, correctSentence, currentIndex, correct]);

  return (
    <div className="bg-white rounded-2xl shadow-xl p-8">
      <h2 className="text-2xl font-bold text-gray-800 mb-6 text-center">
        Capitalization: {ruleData.name}
      </h2>

      {/* Rule */}
      <div className="bg-blue-50 rounded-xl p-4 mb-6 text-center">
        <div className="text-sm text-blue-900 font-bold mb-1">Rule:</div>
        <div className="text-lg text-blue-700">{ruleData.rule}</div>
      </div>

      {/* Incorrect sentence */}
      <AnimatePresence mode="wait">
        <motion.div
          key={currentIndex}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          transition={{ duration: settings.reducedMotion ? 0 : 0.3 }}
          className="bg-red-50 rounded-xl p-6 mb-6 text-center"
        >
          <div className="text-sm text-red-900 mb-2">Fix this sentence:</div>
          <div className="text-2xl font-medium text-red-700">
            {incorrectSentence}
          </div>
        </motion.div>
      </AnimatePresence>

      {/* Typing area */}
      <div className="bg-gray-50 rounded-xl p-6 mb-6">
        <div className="text-2xl font-mono min-h-[60px]">
          {typed.split('').map((char, index) => {
            const isCorrect = char === correctSentence[index];
            return (
              <span
                key={index}
                className={isCorrect ? 'text-success-600' : 'text-red-600'}
              >
                {char}
              </span>
            );
          })}
          <span className="animate-pulse">|</span>
        </div>
      </div>

      {/* Progress */}
      <div className="flex justify-between text-sm text-gray-600">
        <span>Sentence {currentIndex + 1} of {ruleData.examples.length}</span>
        <span className="font-bold text-success-600">{correct} correct</span>
      </div>
    </div>
  );
}

// Capital letter identification
export function CapitalLetterIdentification() {
  const [sentences] = useState([
    { text: 'The Cat Sleeps.', capitals: [0, 4], correctCount: 2 },
    { text: 'John And Mary Play.', capitals: [0, 5, 9, 14], correctCount: 4 },
    { text: 'I Love New York.', capitals: [0, 2, 7, 11], correctCount: 4 },
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

  const isCorrect = selectedIndices.length === current.correctCount &&
    selectedIndices.every(i => current.capitals.includes(i));

  return (
    <div className="bg-white rounded-2xl shadow-xl p-8">
      <h2 className="text-2xl font-bold text-gray-800 mb-6 text-center">
        Find the Capital Letters
      </h2>

      <div className="bg-purple-50 rounded-xl p-4 mb-6 text-center">
        <div className="text-sm text-purple-900">
          Click on all the capital letters
        </div>
      </div>

      {/* Sentence with clickable letters */}
      <div className="bg-gray-50 rounded-xl p-8 mb-6">
        <div className="text-3xl font-mono flex flex-wrap justify-center gap-1">
          {current.text.split('').map((char, index) => (
            <motion.button
              key={index}
              onClick={() => char !== ' ' && char !== '.' && handleToggle(index)}
              disabled={char === ' ' || char === '.'}
              whileHover={{ scale: char !== ' ' && char !== '.' ? 1.1 : 1 }}
              className={`w-10 h-12 flex items-center justify-center rounded ${
                char === ' ' || char === '.'
                  ? 'cursor-default'
                  : selectedIndices.includes(index)
                  ? current.capitals.includes(index)
                    ? 'bg-success-500 text-white'
                    : 'bg-red-500 text-white'
                  : 'bg-gray-200 text-gray-800 hover:bg-primary-100'
              }`}
            >
              {char}
            </motion.button>
          ))}
        </div>
      </div>

      {/* Feedback */}
      <div className="flex justify-center gap-4">
        <button
          onClick={() => setSelectedIndices([])}
          className="px-6 py-3 bg-gray-200 text-gray-700 rounded-lg font-bold hover:bg-gray-300 transition-colors"
        >
          Reset
        </button>
        <button
          onClick={() => {
            if (isCorrect && currentIndex < sentences.length - 1) {
              setCurrentIndex(currentIndex + 1);
              setSelectedIndices([]);
            }
          }}
          disabled={!isCorrect}
          className="px-6 py-3 bg-primary-500 text-white rounded-lg font-bold hover:bg-primary-600 disabled:opacity-50 transition-colors"
        >
          Next →
        </button>
      </div>

      {selectedIndices.length > 0 && (
        <motion.div
          initial={{ opacity: 0, scale: 0 }}
          animate={{ opacity: 1, scale: 1 }}
          className={`mt-6 text-center text-2xl ${
            isCorrect ? 'text-success-600' : 'text-gray-600'
          }`}
        >
          {isCorrect ? '✓ Perfect!' : `${selectedIndices.length}/${current.correctCount} found`}
        </motion.div>
      )}
    </div>
  );
}

// Proper noun capitalization
export function ProperNounCapitalization() {
  const [words] = useState([
    { word: 'john', shouldCapitalize: true, reason: 'Name of a person' },
    { word: 'cat', shouldCapitalize: false, reason: 'Common noun' },
    { word: 'texas', shouldCapitalize: true, reason: 'Name of a place' },
    { word: 'apple', shouldCapitalize: false, reason: 'Common noun' },
    { word: 'london', shouldCapitalize: true, reason: 'Name of a city' },
    { word: 'dog', shouldCapitalize: false, reason: 'Common noun' },
  ]);

  const [currentIndex, setCurrentIndex] = useState(0);
  const [selected, setSelected] = useState<boolean | null>(null);
  const [score, setScore] = useState(0);

  const current = words[currentIndex];

  const handleAnswer = (answer: boolean) => {
    setSelected(answer);

    if (answer === current.shouldCapitalize) {
      setScore(score + 1);
    }

    setTimeout(() => {
      if (currentIndex < words.length - 1) {
        setCurrentIndex(currentIndex + 1);
        setSelected(null);
      }
    }, 1500);
  };

  return (
    <div className="bg-white rounded-2xl shadow-xl p-8">
      <h2 className="text-2xl font-bold text-gray-800 mb-6 text-center">
        Should This Be Capitalized?
      </h2>

      {/* Word */}
      <AnimatePresence mode="wait">
        <motion.div
          key={currentIndex}
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.8 }}
          className="bg-gradient-to-br from-indigo-500 to-purple-600 rounded-2xl p-12 mb-6 text-center"
        >
          <div className="text-6xl font-bold text-white">
            {current.word}
          </div>
        </motion.div>
      </AnimatePresence>

      {/* Answer buttons */}
      <div className="grid grid-cols-2 gap-4 mb-6">
        <motion.button
          onClick={() => handleAnswer(true)}
          disabled={selected !== null}
          whileHover={{ scale: selected === null ? 1.05 : 1 }}
          className={`py-8 rounded-xl font-bold text-2xl transition-colors ${
            selected === true
              ? current.shouldCapitalize
                ? 'bg-success-500 text-white'
                : 'bg-red-500 text-white'
              : 'bg-green-100 text-green-900 hover:bg-green-200'
          }`}
        >
          YES<br/>
          <span className="text-lg">Capitalize</span>
        </motion.button>

        <motion.button
          onClick={() => handleAnswer(false)}
          disabled={selected !== null}
          whileHover={{ scale: selected === null ? 1.05 : 1 }}
          className={`py-8 rounded-xl font-bold text-2xl transition-colors ${
            selected === false
              ? !current.shouldCapitalize
                ? 'bg-success-500 text-white'
                : 'bg-red-500 text-white'
              : 'bg-red-100 text-red-900 hover:bg-red-200'
          }`}
        >
          NO<br/>
          <span className="text-lg">Keep lowercase</span>
        </motion.button>
      </div>

      {/* Explanation */}
      {selected !== null && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className={`rounded-xl p-4 text-center ${
            selected === current.shouldCapitalize
              ? 'bg-success-50 text-success-900'
              : 'bg-red-50 text-red-900'
          }`}
        >
          <div className="font-bold mb-1">
            {selected === current.shouldCapitalize ? '✓ Correct!' : '✗ Incorrect'}
          </div>
          <div className="text-sm">{current.reason}</div>
        </motion.div>
      )}

      {/* Progress */}
      <div className="mt-6 text-center text-gray-600">
        Question {currentIndex + 1} / {words.length} • Score: {score}
      </div>
    </div>
  );
}

// Title case practice
export function TitleCasePractice() {
  const [titles] = useState([
    { incorrect: 'the cat in the hat', correct: 'The Cat in the Hat' },
    { incorrect: 'harry potter and the chamber of secrets', correct: 'Harry Potter and the Chamber of Secrets' },
    { incorrect: 'where the wild things are', correct: 'Where the Wild Things Are' },
  ]);

  const [currentIndex, setCurrentIndex] = useState(0);
  const [typed, setTyped] = useState('');

  const current = titles[currentIndex];

  const handleKeyPress = (key: string) => {
    if (key === 'Backspace') {
      setTyped(typed.slice(0, -1));
      return;
    }

    const newTyped = typed + key;

    if (newTyped === current.correct) {
      setTimeout(() => {
        if (currentIndex < titles.length - 1) {
          setCurrentIndex(currentIndex + 1);
          setTyped('');
        }
      }, 1000);
    } else if (current.correct.startsWith(newTyped)) {
      setTyped(newTyped);
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
  }, [typed, current, currentIndex]);

  return (
    <div className="bg-white rounded-2xl shadow-xl p-8">
      <h2 className="text-2xl font-bold text-gray-800 mb-6 text-center">
        Write in Title Case
      </h2>

      <div className="bg-yellow-50 rounded-xl p-4 mb-6 text-center">
        <div className="text-sm text-yellow-900 mb-1">Rule:</div>
        <div className="text-md text-yellow-700">
          Capitalize the first letter of each important word in a title
        </div>
      </div>

      {/* Incorrect title */}
      <div className="bg-gray-50 rounded-xl p-6 mb-6 text-center">
        <div className="text-sm text-gray-600 mb-2">Fix this title:</div>
        <div className="text-2xl font-medium text-gray-800">
          {current.incorrect}
        </div>
      </div>

      {/* Typing area */}
      <div className="bg-blue-50 rounded-xl p-6 mb-6">
        <div className="text-2xl font-mono min-h-[60px]">
          {typed.split('').map((char, index) => (
            <span
              key={index}
              className={char === current.correct[index] ? 'text-success-600' : 'text-red-600'}
            >
              {char}
            </span>
          ))}
          <span className="animate-pulse">|</span>
        </div>
      </div>

      {/* Progress */}
      <div className="text-center text-gray-600">
        Title {currentIndex + 1} of {titles.length}
      </div>
    </div>
  );
}
