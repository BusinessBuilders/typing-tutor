import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useNavigate, useParams } from 'react-router-dom';

/**
 * LearningScreen Component - Step 95
 *
 * Main learning interface where typing practice happens.
 * Adapts to different modes: letters, words, sentences, stories.
 *
 * Features:
 * - Mode-based learning (letters/words/sentences/stories)
 * - Visual prompts and images
 * - Real-time typing feedback
 * - Progress tracking
 * - Gentle error correction
 * - Celebration animations
 * - Pet companion encouragement
 */

export type LearningMode = 'letters' | 'words' | 'sentences' | 'stories';

interface LearningContent {
  mode: LearningMode;
  currentItem: string;
  image?: string;
  description?: string;
  difficulty: number;
}

const LearningScreen: React.FC = () => {
  const navigate = useNavigate();
  const { level } = useParams<{ level?: string }>();
  const [mode, setMode] = useState<LearningMode>((level as LearningMode) || 'letters');
  const [currentInput, setCurrentInput] = useState('');
  const [currentContent, setCurrentContent] = useState<LearningContent>({
    mode: 'letters',
    currentItem: 'A',
    description: 'Type the letter A',
    difficulty: 1,
  });
  const [isCorrect, setIsCorrect] = useState<boolean | null>(null);
  const [score, setScore] = useState(0);
  const [streak, setStreak] = useState(0);

  // Sample content for each mode
  const getContentForMode = (learningMode: LearningMode): LearningContent => {
    const content: Record<LearningMode, LearningContent> = {
      letters: {
        mode: 'letters',
        currentItem: 'A',
        description: 'Type the letter A',
        difficulty: 1,
      },
      words: {
        mode: 'words',
        currentItem: 'cat',
        description: 'Type the word: cat',
        difficulty: 2,
      },
      sentences: {
        mode: 'sentences',
        currentItem: 'The cat sat on the mat.',
        description: 'Type this sentence',
        difficulty: 3,
      },
      stories: {
        mode: 'stories',
        currentItem: 'Once upon a time, there was a friendly dragon who loved to read books.',
        description: 'Continue the story',
        difficulty: 4,
      },
    };
    return content[learningMode];
  };

  useEffect(() => {
    setCurrentContent(getContentForMode(mode));
  }, [mode]);

  useEffect(() => {
    if (level) {
      setMode(level as LearningMode);
    }
  }, [level]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setCurrentInput(value);

    // Check if input matches target
    if (value === currentContent.currentItem) {
      setIsCorrect(true);
      setScore((prev) => prev + 10);
      setStreak((prev) => prev + 1);

      // Move to next after a delay
      setTimeout(() => {
        setCurrentInput('');
        setIsCorrect(null);
        // In real implementation, fetch next content
      }, 1500);
    } else if (currentContent.currentItem.startsWith(value)) {
      // Partially correct
      setIsCorrect(null);
    } else {
      // Incorrect
      setIsCorrect(false);
      setStreak(0);
    }
  };

  const modeInfo = {
    letters: {
      title: 'Letter Practice',
      icon: '🔤',
      color: 'from-green-400 to-emerald-500',
      description: 'Learn one letter at a time',
    },
    words: {
      title: 'Word Building',
      icon: '📝',
      color: 'from-blue-400 to-cyan-500',
      description: 'Practice typing simple words',
    },
    sentences: {
      title: 'Sentence Practice',
      icon: '✍️',
      color: 'from-purple-400 to-pink-500',
      description: 'Type complete sentences',
    },
    stories: {
      title: 'Story Mode',
      icon: '📖',
      color: 'from-orange-400 to-red-500',
      description: 'Interactive story typing',
    },
  };

  return (
    <div className="learning-screen min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 p-6">
      {/* Header */}
      <div className="max-w-4xl mx-auto mb-8">
        <button
          onClick={() => navigate('/')}
          className="mb-4 text-purple-600 hover:text-purple-700 flex items-center gap-2 text-lg"
        >
          ← Back to Home
        </button>

        <div className={`p-6 rounded-2xl bg-gradient-to-r ${modeInfo[mode].color} text-white shadow-lg`}>
          <div className="flex items-center gap-4">
            <span className="text-5xl">{modeInfo[mode].icon}</span>
            <div>
              <h1 className="text-4xl font-bold mb-2">{modeInfo[mode].title}</h1>
              <p className="text-xl opacity-90">{modeInfo[mode].description}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Stats Bar */}
      <div className="max-w-4xl mx-auto mb-8">
        <div className="grid grid-cols-3 gap-4">
          <div className="bg-white p-4 rounded-xl shadow-md text-center">
            <div className="text-3xl font-bold text-purple-600">{score}</div>
            <div className="text-sm text-gray-600">Score</div>
          </div>
          <div className="bg-white p-4 rounded-xl shadow-md text-center">
            <div className="text-3xl font-bold text-orange-600">{streak}</div>
            <div className="text-sm text-gray-600">Streak</div>
          </div>
          <div className="bg-white p-4 rounded-xl shadow-md text-center">
            <div className="text-3xl font-bold text-green-600">
              {mode === 'letters' ? 'A' : mode === 'words' ? '1' : mode === 'sentences' ? 'Easy' : 'Ch. 1'}
            </div>
            <div className="text-sm text-gray-600">Level</div>
          </div>
        </div>
      </div>

      {/* Main Learning Area */}
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-2xl shadow-xl p-8 mb-6">
          {/* Visual Prompt Area */}
          <div className="visual-prompt-area mb-8">
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="flex justify-center items-center h-64 bg-gradient-to-br from-purple-100 to-pink-100 rounded-xl"
            >
              <div className="text-center">
                <div className="text-8xl mb-4">
                  {mode === 'letters' ? '🎯' : mode === 'words' ? '🐱' : mode === 'sentences' ? '🏠' : '🏰'}
                </div>
                <p className="text-2xl text-gray-700">{currentContent.description}</p>
              </div>
            </motion.div>
          </div>

          {/* Target Text Display */}
          <div className="target-text mb-6">
            <div className="bg-gray-50 p-8 rounded-xl text-center">
              <motion.div
                key={currentContent.currentItem}
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-5xl font-bold text-gray-800 tracking-wider"
              >
                {currentContent.currentItem}
              </motion.div>
            </div>
          </div>

          {/* Typing Input */}
          <div className="typing-input-area mb-6">
            <input
              type="text"
              value={currentInput}
              onChange={handleInputChange}
              placeholder="Start typing here..."
              autoFocus
              className={`w-full p-6 text-3xl text-center rounded-xl border-4 transition-all ${
                isCorrect === true
                  ? 'border-green-500 bg-green-50'
                  : isCorrect === false
                  ? 'border-red-500 bg-red-50'
                  : 'border-purple-300 focus:border-purple-500'
              } focus:outline-none`}
            />
          </div>

          {/* Feedback */}
          <div className="feedback-area h-20 flex items-center justify-center">
            {isCorrect === true && (
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                className="text-4xl text-green-600 flex items-center gap-3"
              >
                <span>✨</span>
                <span className="font-bold">Perfect!</span>
                <span>🎉</span>
              </motion.div>
            )}
            {isCorrect === false && (
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                className="text-2xl text-orange-600 flex items-center gap-3"
              >
                <span>💪</span>
                <span className="font-bold">Try again - you've got this!</span>
              </motion.div>
            )}
          </div>
        </div>

        {/* Pet Companion */}
        <motion.div
          animate={{ y: [0, -10, 0] }}
          transition={{ duration: 2, repeat: Infinity }}
          className="bg-white rounded-2xl shadow-md p-6 text-center"
        >
          <div className="text-6xl mb-3">🐱</div>
          <p className="text-lg text-gray-700 font-medium">
            {streak > 5 ? "You're on fire! Keep it up! 🔥" : streak > 0 ? 'Great job! 🌟' : 'You can do it! 💪'}
          </p>
        </motion.div>
      </div>

      {/* Mode Switcher (Footer) */}
      <div className="max-w-4xl mx-auto mt-8">
        <div className="bg-white rounded-2xl shadow-md p-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-4 text-center">
            Switch Practice Mode
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {(Object.keys(modeInfo) as LearningMode[]).map((m) => (
              <button
                key={m}
                onClick={() => {
                  setMode(m);
                  setCurrentInput('');
                  setIsCorrect(null);
                }}
                className={`p-4 rounded-xl border-2 transition-all ${
                  mode === m
                    ? 'border-purple-500 bg-purple-50'
                    : 'border-gray-300 hover:border-purple-300'
                }`}
              >
                <div className="text-3xl mb-2">{modeInfo[m].icon}</div>
                <div className="font-medium text-sm">{modeInfo[m].title}</div>
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default LearningScreen;
