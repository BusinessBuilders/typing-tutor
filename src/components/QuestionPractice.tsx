/**
 * Question Practice Component
 * Step 175 - Practice forming and typing questions
 */

import { motion, AnimatePresence } from 'framer-motion';
import { useState, useEffect } from 'react';
import { useSettingsStore } from '../store/useSettingsStore';

// Question words and examples
export const QUESTION_WORDS = ['Who', 'What', 'When', 'Where', 'Why', 'How'];

export const QUESTION_EXAMPLES = [
  { question: 'What is your name?', type: 'What', answer: 'Asks about a thing or information' },
  { question: 'Where do you live?', type: 'Where', answer: 'Asks about a place' },
  { question: 'When is your birthday?', type: 'When', answer: 'Asks about time' },
  { question: 'Who is your friend?', type: 'Who', answer: 'Asks about a person' },
  { question: 'Why is the sky blue?', type: 'Why', answer: 'Asks about a reason' },
  { question: 'How are you today?', type: 'How', answer: 'Asks about a way or method' },
];

// Statement to question conversions
export const STATEMENT_TO_QUESTION = [
  { statement: 'You like pizza', question: 'Do you like pizza?' },
  { statement: 'She is happy', question: 'Is she happy?' },
  { statement: 'They can swim', question: 'Can they swim?' },
  { statement: 'He wants ice cream', question: 'Does he want ice cream?' },
];

export interface QuestionPracticeProps {
  questionCount?: number;
  onComplete?: (accuracy: number) => void;
}

export default function QuestionPractice({
  questionCount = 5,
  onComplete,
}: QuestionPracticeProps) {
  const { settings } = useSettingsStore();
  const [questions] = useState(() =>
    QUESTION_EXAMPLES.slice(0, questionCount)
  );

  const [currentIndex, setCurrentIndex] = useState(0);
  const [typed, setTyped] = useState('');
  const [correct, setCorrect] = useState(0);

  const current = questions[currentIndex];

  const handleKeyPress = (key: string) => {
    if (key === 'Backspace') {
      setTyped(typed.slice(0, -1));
      return;
    }

    const newTyped = typed + key;

    if (newTyped === current.question) {
      setCorrect(correct + 1);
      setTyped('');

      if (currentIndex < questions.length - 1) {
        setCurrentIndex(currentIndex + 1);
      } else {
        const accuracy = (correct / questions.length) * 100;
        onComplete?.(accuracy);
      }
    } else if (current.question.startsWith(newTyped)) {
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
  }, [typed, current, currentIndex, correct]);

  return (
    <div className="bg-white rounded-2xl shadow-xl p-8">
      <h2 className="text-2xl font-bold text-gray-800 mb-6 text-center">
        Type the Question
      </h2>

      {/* Question to type */}
      <AnimatePresence mode="wait">
        <motion.div
          key={currentIndex}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          transition={{ duration: settings.reducedMotion ? 0 : 0.3 }}
          className="bg-gradient-to-br from-purple-500 to-pink-600 rounded-xl p-8 mb-6 text-center"
        >
          <div className="text-3xl font-bold text-white mb-2">
            {current.question}
          </div>
          <div className="text-sm text-white opacity-90">
            {current.answer}
          </div>
        </motion.div>
      </AnimatePresence>

      {/* Typing area */}
      <div className="bg-gray-50 rounded-xl p-6 mb-6">
        <div className="text-2xl font-mono min-h-[60px]">
          {typed.split('').map((char, index) => (
            <span
              key={index}
              className={char === current.question[index] ? 'text-success-600' : 'text-red-600'}
            >
              {char}
            </span>
          ))}
          <span className="animate-pulse">|</span>
        </div>
      </div>

      {/* Progress */}
      <div className="flex justify-between text-sm text-gray-600">
        <span>Question {currentIndex + 1} of {questions.length}</span>
        <span className="font-bold text-success-600">{correct} correct</span>
      </div>
    </div>
  );
}

// Question word identification
export function QuestionWordIdentification() {
  const [questions] = useState(QUESTION_EXAMPLES);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selected, setSelected] = useState<string | null>(null);
  const [score, setScore] = useState(0);

  const current = questions[currentIndex];

  const handleSelect = (word: string) => {
    setSelected(word);

    if (word === current.type) {
      setScore(score + 1);
    }

    setTimeout(() => {
      if (currentIndex < questions.length - 1) {
        setCurrentIndex(currentIndex + 1);
        setSelected(null);
      }
    }, 1500);
  };

  return (
    <div className="bg-white rounded-2xl shadow-xl p-8">
      <h2 className="text-2xl font-bold text-gray-800 mb-6 text-center">
        Which Question Word?
      </h2>

      {/* Question */}
      <div className="bg-blue-50 rounded-xl p-6 mb-6 text-center">
        <div className="text-2xl font-medium text-blue-900">
          {current.question}
        </div>
      </div>

      {/* Question word options */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        {QUESTION_WORDS.map((word) => {
          const isCorrect = word === current.type;
          const showResult = selected !== null;

          return (
            <motion.button
              key={word}
              onClick={() => handleSelect(word)}
              disabled={selected !== null}
              whileHover={{ scale: selected === null ? 1.05 : 1 }}
              className={`py-6 rounded-xl font-bold text-xl transition-colors ${
                showResult
                  ? isCorrect
                    ? 'bg-success-500 text-white'
                    : selected === word
                    ? 'bg-red-500 text-white'
                    : 'bg-gray-200 text-gray-400'
                  : 'bg-primary-100 text-primary-900 hover:bg-primary-200'
              }`}
            >
              {word}
            </motion.button>
          );
        })}
      </div>

      {/* Progress */}
      <div className="text-center text-gray-600">
        Question {currentIndex + 1} / {questions.length} • Score: {score}
      </div>
    </div>
  );
}

// Statement to question conversion
export function StatementToQuestionPractice() {
  const [exercises] = useState(STATEMENT_TO_QUESTION);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [typed, setTyped] = useState('');

  const current = exercises[currentIndex];

  const handleKeyPress = (key: string) => {
    if (key === 'Backspace') {
      setTyped(typed.slice(0, -1));
      return;
    }

    const newTyped = typed + key;

    if (newTyped === current.question) {
      setTimeout(() => {
        if (currentIndex < exercises.length - 1) {
          setCurrentIndex(currentIndex + 1);
          setTyped('');
        }
      }, 1000);
    } else if (current.question.startsWith(newTyped)) {
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
        Turn Into a Question
      </h2>

      {/* Statement */}
      <div className="bg-gray-50 rounded-xl p-6 mb-4 text-center">
        <div className="text-sm text-gray-600 mb-2">Statement:</div>
        <div className="text-2xl font-medium text-gray-900">
          {current.statement}.
        </div>
      </div>

      {/* Hint */}
      <div className="bg-blue-50 rounded-xl p-4 mb-6 text-center">
        <div className="text-sm text-blue-900">
          Turn this into a question (add ? at the end)
        </div>
      </div>

      {/* Typing area */}
      <div className="bg-yellow-50 rounded-xl p-6 mb-6">
        <div className="text-2xl font-mono min-h-[60px]">
          {typed.split('').map((char, index) => (
            <span
              key={index}
              className={char === current.question[index] ? 'text-success-600' : 'text-red-600'}
            >
              {char}
            </span>
          ))}
          <span className="animate-pulse">|</span>
        </div>
      </div>

      {/* Progress */}
      <div className="text-center text-gray-600">
        Exercise {currentIndex + 1} of {exercises.length}
      </div>
    </div>
  );
}

// Build a question
export function BuildAQuestion() {
  const [parts] = useState({
    questionWords: ['What', 'Where', 'When', 'Who', 'Why', 'How'],
    helpers: ['is', 'are', 'do', 'does', 'can', 'will'],
    subjects: ['you', 'they', 'she', 'he', 'we'],
    verbs: ['like', 'want', 'play', 'eat', 'see'],
  });

  const [selectedParts, setSelectedParts] = useState<string[]>([]);

  const handleAddPart = (part: string) => {
    setSelectedParts([...selectedParts, part]);
  };

  const handleReset = () => {
    setSelectedParts([]);
  };

  const builtQuestion = selectedParts.join(' ') + (selectedParts.length > 0 ? '?' : '');

  return (
    <div className="bg-white rounded-2xl shadow-xl p-8">
      <h2 className="text-2xl font-bold text-gray-800 mb-6 text-center">
        Build Your Own Question
      </h2>

      {/* Built question */}
      <div className="bg-gradient-to-br from-green-500 to-teal-600 rounded-xl p-8 mb-6 min-h-[100px] flex items-center justify-center">
        <div className="text-3xl font-bold text-white">
          {builtQuestion || 'Click words below to build a question'}
        </div>
      </div>

      {/* Word categories */}
      <div className="space-y-4 mb-6">
        <div>
          <h3 className="text-sm font-bold text-gray-700 mb-2">Question Words:</h3>
          <div className="flex flex-wrap gap-2">
            {parts.questionWords.map((word) => (
              <button
                key={word}
                onClick={() => handleAddPart(word)}
                className="px-4 py-2 bg-purple-100 text-purple-900 rounded-lg font-medium hover:bg-purple-200 transition-colors"
              >
                {word}
              </button>
            ))}
          </div>
        </div>

        <div>
          <h3 className="text-sm font-bold text-gray-700 mb-2">Helper Words:</h3>
          <div className="flex flex-wrap gap-2">
            {parts.helpers.map((word) => (
              <button
                key={word}
                onClick={() => handleAddPart(word)}
                className="px-4 py-2 bg-blue-100 text-blue-900 rounded-lg font-medium hover:bg-blue-200 transition-colors"
              >
                {word}
              </button>
            ))}
          </div>
        </div>

        <div>
          <h3 className="text-sm font-bold text-gray-700 mb-2">Who/What:</h3>
          <div className="flex flex-wrap gap-2">
            {parts.subjects.map((word) => (
              <button
                key={word}
                onClick={() => handleAddPart(word)}
                className="px-4 py-2 bg-green-100 text-green-900 rounded-lg font-medium hover:bg-green-200 transition-colors"
              >
                {word}
              </button>
            ))}
          </div>
        </div>

        <div>
          <h3 className="text-sm font-bold text-gray-700 mb-2">Action Words:</h3>
          <div className="flex flex-wrap gap-2">
            {parts.verbs.map((word) => (
              <button
                key={word}
                onClick={() => handleAddPart(word)}
                className="px-4 py-2 bg-yellow-100 text-yellow-900 rounded-lg font-medium hover:bg-yellow-200 transition-colors"
              >
                {word}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Controls */}
      <div className="flex justify-center">
        <button
          onClick={handleReset}
          className="px-8 py-3 bg-gray-200 text-gray-700 rounded-lg font-bold hover:bg-gray-300 transition-colors"
        >
          Reset
        </button>
      </div>
    </div>
  );
}
