/**
 * Paragraph Practice Component
 * Step 179 - Practice typing longer paragraphs
 */

import { motion, AnimatePresence } from 'framer-motion';
import { useState } from 'react';
import { useSettingsStore } from '../store/useSettingsStore';

// Sample paragraphs by difficulty
export const PRACTICE_PARAGRAPHS = {
  easy: [
    'The sun is bright. The sky is blue. I like to play outside. It is a beautiful day.',
    'My cat is soft. She has black fur. She likes to sleep. I love my cat very much.',
    'We go to school. We learn new things. Reading is fun. Math is interesting too.',
  ],
  medium: [
    'Yesterday, I went to the park with my family. We played on the swings and slides. Then we had a picnic lunch. It was a wonderful afternoon together.',
    'The library is my favorite place. There are so many books to read. I can learn about animals, space, and history. Reading helps me discover new worlds.',
    'In the morning, I eat breakfast with my family. We talk about our plans for the day. Then I brush my teeth and get ready for school. I always try to be on time.',
  ],
  hard: [
    'The magnificent elephant slowly walked through the dense jungle. Its large ears flapped gently in the warm breeze. The other animals watched respectfully as the gentle giant passed by, knowing it was the oldest and wisest creature in the forest.',
    'Technology has changed how we communicate with each other. People can now talk to friends across the world instantly. Video calls let us see loved ones even when they are far away. However, it is still important to have face-to-face conversations.',
  ],
};

export interface ParagraphPracticeProps {
  difficulty?: 'easy' | 'medium' | 'hard';
  onComplete?: (wpm: number, accuracy: number) => void;
}

export default function ParagraphPractice({
  difficulty = 'medium',
  onComplete,
}: ParagraphPracticeProps) {
  const { settings } = useSettingsStore();
  const [paragraphs] = useState(() => PRACTICE_PARAGRAPHS[difficulty]);

  const [currentIndex, setCurrentIndex] = useState(0);
  const [typed, setTyped] = useState('');
  const [startTime] = useState(Date.now());
  const [mistakes, setMistakes] = useState(0);

  const currentParagraph = paragraphs[currentIndex];

  // TODO: Connect to keyboard input
  // @ts-expect-error - Function will be used when keyboard input is implemented
  const handleKeyPress = (key: string) => {
    if (key === 'Backspace') {
      setTyped(typed.slice(0, -1));
      return;
    }

    const newTyped = typed + key;

    // Check character accuracy
    if (key === currentParagraph[typed.length]) {
      setTyped(newTyped);

      // Paragraph completed
      if (newTyped === currentParagraph) {
        if (currentIndex < paragraphs.length - 1) {
          setCurrentIndex(currentIndex + 1);
          setTyped('');
        } else {
          // Calculate final stats
          const timeElapsed = (Date.now() - startTime) / 60000; // minutes
          const totalChars = paragraphs.join('').length;
          const wpm = Math.round(totalChars / 5 / timeElapsed);
          const accuracy = ((totalChars - mistakes) / totalChars) * 100;
          onComplete?.(wpm, accuracy);
        }
      }
    } else {
      setMistakes(mistakes + 1);
    }
  };

  const progress = (typed.length / currentParagraph.length) * 100;

  return (
    <div className="bg-white rounded-2xl shadow-xl p-8">
      <h2 className="text-2xl font-bold text-gray-800 mb-6 text-center">
        Paragraph Practice - {difficulty.charAt(0).toUpperCase() + difficulty.slice(1)}
      </h2>

      {/* Progress bar */}
      <div className="mb-6">
        <div className="flex justify-between text-sm text-gray-600 mb-2">
          <span>Progress</span>
          <span>{Math.round(progress)}%</span>
        </div>
        <div className="h-3 bg-gray-200 rounded-full overflow-hidden">
          <motion.div
            animate={{ width: `${progress}%` }}
            className="h-full bg-primary-500"
          />
        </div>
      </div>

      {/* Paragraph to type */}
      <AnimatePresence mode="wait">
        <motion.div
          key={currentIndex}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          transition={{ duration: settings.reducedMotion ? 0 : 0.3 }}
          className="bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl p-8 mb-6"
        >
          <div className="text-lg leading-relaxed text-white">
            {currentParagraph}
          </div>
        </motion.div>
      </AnimatePresence>

      {/* Typed text */}
      <div className="bg-gray-50 rounded-xl p-6 mb-6">
        <div className="text-lg leading-relaxed font-mono min-h-[100px]">
          {typed.split('').map((char, index) => {
            const isCorrect = char === currentParagraph[index];
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

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4">
        <div className="bg-gray-50 rounded-lg p-4 text-center">
          <div className="text-2xl font-bold text-gray-900">{currentIndex + 1}</div>
          <div className="text-sm text-gray-600">Paragraph</div>
        </div>

        <div className="bg-gray-50 rounded-lg p-4 text-center">
          <div className="text-2xl font-bold text-success-600">{typed.length}</div>
          <div className="text-sm text-gray-600">Characters</div>
        </div>

        <div className="bg-gray-50 rounded-lg p-4 text-center">
          <div className="text-2xl font-bold text-red-600">{mistakes}</div>
          <div className="text-sm text-gray-600">Mistakes</div>
        </div>
      </div>
    </div>
  );
}

// Paragraph with highlighting
export function ParagraphWithHighlighting() {
  const [paragraph] = useState(
    'The quick brown fox jumps over the lazy dog. This sentence contains every letter of the alphabet. It is often used for typing practice.'
  );

  const [typed, setTyped] = useState('');

  // TODO: Connect to keyboard input
  // @ts-expect-error - Function will be used when keyboard input is implemented
  const handleKeyPress = (key: string) => {
    if (key === 'Backspace') {
      setTyped(typed.slice(0, -1));
      return;
    }

    const newTyped = typed + key;
    if (paragraph.startsWith(newTyped)) {
      setTyped(newTyped);
    }
  };

  return (
    <div className="bg-white rounded-2xl shadow-xl p-8">
      <h2 className="text-2xl font-bold text-gray-800 mb-6 text-center">
        Type the Paragraph
      </h2>

      {/* Paragraph with current word highlighted */}
      <div className="bg-gray-50 rounded-xl p-8 mb-6">
        <div className="text-2xl leading-relaxed">
          {paragraph.split(' ').map((word, wordIndex) => {
            const wordStart = paragraph.split(' ').slice(0, wordIndex).join(' ').length + (wordIndex > 0 ? 1 : 0);
            const wordEnd = wordStart + word.length;
            const isTyped = typed.length > wordStart;
            const isCurrent = typed.length >= wordStart && typed.length < wordEnd;

            return (
              <span
                key={wordIndex}
                className={`${
                  isTyped
                    ? 'text-success-600'
                    : isCurrent
                    ? 'bg-yellow-200 text-gray-900'
                    : 'text-gray-400'
                }`}
              >
                {word}{' '}
              </span>
            );
          })}
        </div>
      </div>

      {/* Typing area */}
      <div className="bg-blue-50 rounded-xl p-6">
        <div className="text-xl font-mono min-h-[80px]">
          {typed}
          <span className="animate-pulse">|</span>
        </div>
      </div>
    </div>
  );
}

// Multi-paragraph practice
export function MultiParagraphPractice() {
  const [paragraphs] = useState([
    'First paragraph is here. It has a few sentences. This helps you practice.',
    'Second paragraph follows. It continues the practice. Keep typing carefully.',
    'Third and final paragraph. You are almost done. Great job typing!',
  ]);

  const [currentParagraph, setCurrentParagraph] = useState(0);
  const [typed, setTyped] = useState('');

  const current = paragraphs[currentParagraph];

  // TODO: Connect to keyboard input
  // @ts-expect-error - Function will be used when keyboard input is implemented
  const handleKeyPress = (key: string) => {
    if (key === 'Backspace') {
      setTyped(typed.slice(0, -1));
      return;
    }

    const newTyped = typed + key;

    if (newTyped === current) {
      if (currentParagraph < paragraphs.length - 1) {
        setCurrentParagraph(currentParagraph + 1);
        setTyped('');
      }
    } else if (current.startsWith(newTyped)) {
      setTyped(newTyped);
    }
  };

  return (
    <div className="bg-white rounded-2xl shadow-xl p-8">
      <h2 className="text-2xl font-bold text-gray-800 mb-6 text-center">
        Multi-Paragraph Practice
      </h2>

      {/* All paragraphs with current highlighted */}
      <div className="space-y-4 mb-6">
        {paragraphs.map((para, index) => (
          <div
            key={index}
            className={`rounded-xl p-6 transition-colors ${
              index < currentParagraph
                ? 'bg-success-50 opacity-60'
                : index === currentParagraph
                ? 'bg-primary-50 border-2 border-primary-500'
                : 'bg-gray-50 opacity-40'
            }`}
          >
            <div className="text-sm font-bold text-gray-600 mb-2">
              Paragraph {index + 1}
            </div>
            <div className={`text-lg ${
              index < currentParagraph
                ? 'line-through text-gray-500'
                : index === currentParagraph
                ? 'text-gray-900'
                : 'text-gray-400'
            }`}>
              {para}
            </div>
          </div>
        ))}
      </div>

      {/* Typing area */}
      <div className="bg-blue-50 rounded-xl p-6">
        <div className="text-xl font-mono min-h-[80px]">
          {typed.split('').map((char, index) => (
            <span
              key={index}
              className={char === current[index] ? 'text-success-600' : 'text-red-600'}
            >
              {char}
            </span>
          ))}
          <span className="animate-pulse">|</span>
        </div>
      </div>

      {/* Progress */}
      <div className="mt-4 text-center text-gray-600">
        Paragraph {currentParagraph + 1} of {paragraphs.length}
      </div>
    </div>
  );
}
