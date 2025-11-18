/**
 * Story Mode Component
 * Step 180 - Practice typing complete stories
 */

import { motion, AnimatePresence } from 'framer-motion';
import { useState } from 'react';
import { useSettingsStore } from '../store/useSettingsStore';

// Story structure
export interface Story {
  title: string;
  author?: string;
  pages: Array<{
    text: string;
    image?: string;
  }>;
  difficulty: 'easy' | 'medium' | 'hard';
}

// Sample stories
export const STORIES: Story[] = [
  {
    title: 'The Little Red Hen',
    difficulty: 'easy',
    pages: [
      { text: 'Once upon a time, there was a little red hen. She lived on a farm with her friends.' },
      { text: 'One day, she found some wheat seeds. "Who will help me plant these?" she asked.' },
      { text: 'The cat said no. The dog said no. The duck said no. So the hen planted them herself.' },
      { text: 'The wheat grew tall and golden. The little red hen was very happy with her hard work.' },
    ],
  },
  {
    title: 'The Friendly Robot',
    difficulty: 'medium',
    pages: [
      { text: 'In a busy city lived a small robot named Chip. Chip loved to help people every day.' },
      { text: 'One morning, Chip saw an elderly woman struggling with her groceries. He quickly rolled over to help.' },
      { text: '"Thank you, little robot," she said with a warm smile. Chip\'s lights blinked happily.' },
      { text: 'From that day on, Chip became known as the friendliest robot in the whole neighborhood.' },
    ],
  },
  {
    title: 'The Magical Library',
    difficulty: 'hard',
    pages: [
      { text: 'Deep in the heart of the city stood an ancient library that held a mysterious secret. Every book contained a doorway to another world.' },
      { text: 'Young Emma discovered this one rainy afternoon when she accidentally touched a glowing blue book. Suddenly, she was transported to a land of talking animals.' },
      { text: 'The wise owl librarian explained that she had been chosen as the new Guardian of Stories. Her mission was to protect the magical books from those who would misuse them.' },
      { text: 'Emma accepted her role with courage and determination. She spent her afternoons learning about each world, making friends, and ensuring the stories remained safe for future readers.' },
    ],
  },
];

export interface StoryModeProps {
  story?: Story;
  onComplete?: (wpm: number, accuracy: number) => void;
}

export default function StoryMode({
  story,
  onComplete,
}: StoryModeProps) {
  const { settings } = useSettingsStore();
  const selectedStory = story || STORIES[0];

  const [currentPage, setCurrentPage] = useState(0);
  const [typed, setTyped] = useState('');
  const [startTime] = useState(Date.now());
  const [mistakes, setMistakes] = useState(0);

  const page = selectedStory.pages[currentPage];

  // TODO: Connect to keyboard input
  // @ts-expect-error - Function will be used when keyboard input is implemented
  const handleKeyPress = (key: string) => {
    if (key === 'Backspace') {
      setTyped(typed.slice(0, -1));
      return;
    }

    const newTyped = typed + key;

    // Check character accuracy
    if (key === page.text[typed.length]) {
      setTyped(newTyped);

      // Page completed
      if (newTyped === page.text) {
        if (currentPage < selectedStory.pages.length - 1) {
          setCurrentPage(currentPage + 1);
          setTyped('');
        } else {
          // Story completed - calculate stats
          const timeElapsed = (Date.now() - startTime) / 60000;
          const totalChars = selectedStory.pages.reduce((sum, p) => sum + p.text.length, 0);
          const wpm = Math.round(totalChars / 5 / timeElapsed);
          const accuracy = ((totalChars - mistakes) / totalChars) * 100;
          onComplete?.(wpm, accuracy);
        }
      }
    } else {
      setMistakes(mistakes + 1);
    }
  };

  const progress = ((currentPage + 1) / selectedStory.pages.length) * 100;

  return (
    <div className="bg-white rounded-2xl shadow-xl p-8">
      {/* Story header */}
      <div className="text-center mb-6">
        <h2 className="text-3xl font-bold text-gray-800 mb-2">
          {selectedStory.title}
        </h2>
        {selectedStory.author && (
          <div className="text-sm text-gray-600">by {selectedStory.author}</div>
        )}
        <div className="mt-2">
          <span className={`inline-block px-3 py-1 rounded-full text-xs font-bold ${
            selectedStory.difficulty === 'easy'
              ? 'bg-green-100 text-green-700'
              : selectedStory.difficulty === 'medium'
              ? 'bg-yellow-100 text-yellow-700'
              : 'bg-red-100 text-red-700'
          }`}>
            {selectedStory.difficulty}
          </span>
        </div>
      </div>

      {/* Progress */}
      <div className="mb-6">
        <div className="flex justify-between text-sm text-gray-600 mb-2">
          <span>Page {currentPage + 1} of {selectedStory.pages.length}</span>
          <span>{Math.round(progress)}%</span>
        </div>
        <div className="h-3 bg-gray-200 rounded-full overflow-hidden">
          <motion.div
            animate={{ width: `${progress}%` }}
            className="h-full bg-gradient-to-r from-purple-500 to-pink-500"
          />
        </div>
      </div>

      {/* Story page */}
      <AnimatePresence mode="wait">
        <motion.div
          key={currentPage}
          initial={{ opacity: 0, x: 50 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -50 }}
          transition={{ duration: settings.reducedMotion ? 0 : 0.4 }}
          className="mb-6"
        >
          {/* Book-like display */}
          <div className="bg-gradient-to-br from-amber-50 to-yellow-50 rounded-xl p-8 border-4 border-amber-200 shadow-xl">
            <div className="text-xl leading-relaxed text-gray-900 font-serif">
              {page.text}
            </div>
          </div>
        </motion.div>
      </AnimatePresence>

      {/* Typing area */}
      <div className="bg-gray-50 rounded-xl p-6 mb-6">
        <div className="text-lg leading-relaxed font-mono min-h-[100px]">
          {typed.split('').map((char, index) => {
            const isCorrect = char === page.text[index];
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
          <div className="text-2xl font-bold text-gray-900">{currentPage + 1}</div>
          <div className="text-sm text-gray-600">Page</div>
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

// Story selector
export function StorySelector({
  onSelectStory,
}: {
  onSelectStory?: (story: Story) => void;
}) {
  const { settings } = useSettingsStore();

  return (
    <div className="bg-white rounded-2xl shadow-xl p-8">
      <h2 className="text-2xl font-bold text-gray-800 mb-6 text-center">
        Choose a Story
      </h2>

      <div className="space-y-4">
        {STORIES.map((story, index) => (
          <motion.button
            key={story.title}
            onClick={() => onSelectStory?.(story)}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{
              delay: settings.reducedMotion ? 0 : index * 0.1,
            }}
            whileHover={{ scale: settings.reducedMotion ? 1 : 1.02 }}
            className="w-full bg-gradient-to-r from-purple-50 to-pink-50 hover:from-purple-100 hover:to-pink-100 rounded-xl p-6 text-left transition-all border-2 border-transparent hover:border-purple-500"
          >
            <div className="flex justify-between items-start mb-2">
              <h3 className="text-xl font-bold text-gray-900">
                {story.title}
              </h3>
              <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                story.difficulty === 'easy'
                  ? 'bg-green-100 text-green-700'
                  : story.difficulty === 'medium'
                  ? 'bg-yellow-100 text-yellow-700'
                  : 'bg-red-100 text-red-700'
              }`}>
                {story.difficulty}
              </span>
            </div>
            <div className="text-sm text-gray-600">
              {story.pages.length} pages
            </div>
            <div className="text-sm text-gray-500 mt-2 line-clamp-2">
              {story.pages[0].text}
            </div>
          </motion.button>
        ))}
      </div>
    </div>
  );
}

// Story completion celebration
export function StoryCompletion({
  story,
  wpm,
  accuracy,
}: {
  story: Story;
  wpm: number;
  accuracy: number;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      className="bg-white rounded-2xl shadow-xl p-8"
    >
      <div className="text-center">
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1, rotate: 360 }}
          transition={{ delay: 0.2, duration: 0.6 }}
          className="text-8xl mb-6"
        >
          🎉
        </motion.div>

        <h2 className="text-3xl font-bold text-gray-800 mb-4">
          Story Complete!
        </h2>

        <div className="text-xl text-gray-700 mb-6">
          You finished "{story.title}"
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 gap-6 mb-8">
          <div className="bg-primary-50 rounded-xl p-6">
            <div className="text-4xl font-bold text-primary-700 mb-2">
              {wpm}
            </div>
            <div className="text-sm text-gray-600">Words Per Minute</div>
          </div>

          <div className="bg-success-50 rounded-xl p-6">
            <div className="text-4xl font-bold text-success-700 mb-2">
              {Math.round(accuracy)}%
            </div>
            <div className="text-sm text-gray-600">Accuracy</div>
          </div>
        </div>

        {/* Achievements */}
        <div className="bg-yellow-50 rounded-xl p-6">
          <div className="text-lg font-bold text-yellow-900 mb-3">
            Achievements Unlocked
          </div>
          <div className="space-y-2">
            <div className="flex items-center justify-center gap-2 text-yellow-700">
              <span>📖</span>
              <span>Story Reader</span>
            </div>
            {wpm > 30 && (
              <div className="flex items-center justify-center gap-2 text-yellow-700">
                <span>⚡</span>
                <span>Speed Reader</span>
              </div>
            )}
            {accuracy > 95 && (
              <div className="flex items-center justify-center gap-2 text-yellow-700">
                <span>🎯</span>
                <span>Perfect Accuracy</span>
              </div>
            )}
          </div>
        </div>
      </div>
    </motion.div>
  );
}
