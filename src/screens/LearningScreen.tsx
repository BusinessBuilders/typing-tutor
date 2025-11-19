import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useNavigate, useParams } from 'react-router-dom';
import { UnsplashService } from '../services/images/unsplashService';
import { usePetStore } from '../store/usePetStore';
import { PetDisplay } from '../components/PetSystem';
import { speak, initializeTTS, isSupported as isTTSSupported } from '../services/audio/textToSpeechService';
import VirtualKeyboard from '../components/VirtualKeyboard';
import { useSettingsStore } from '../store/useSettingsStore';

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
  const { pet, addXP } = usePetStore();
  const { settings } = useSettingsStore();
  const [currentInput, setCurrentInput] = useState('');
  const [showKeyboard, setShowKeyboard] = useState(false);
  const [currentContent, setCurrentContent] = useState<LearningContent>({
    mode: 'letters',
    currentItem: 'A',
    description: 'Type the letter A',
    difficulty: 1,
  });
  const [isCorrect, setIsCorrect] = useState<boolean | null>(null);
  const [score, setScore] = useState(0);
  const [streak, setStreak] = useState(0);
  const [taskIndex, setTaskIndex] = useState(0);
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [loadingImage, setLoadingImage] = useState(false);

  const unsplashService = new UnsplashService();
  const [ttsEnabled] = useState(isTTSSupported());

  // Initialize TTS on mount
  useEffect(() => {
    if (ttsEnabled) {
      initializeTTS();
    }
  }, [ttsEnabled]);

  // Extract meaningful word for image search (skip common words)
  const extractMeaningfulWord = (text: string): string => {
    const skipWords = ['i', 'the', 'a', 'an', 'is', 'am', 'are', 'was', 'were', 'can', 'my', 'your', 'his', 'her', 'its', 'our', 'their', 'to', 'in', 'on', 'at', 'for'];
    const words = text.toLowerCase().split(' ');

    // Find first meaningful word (not in skip list)
    const meaningfulWord = words.find(word => !skipWords.includes(word.trim()));
    return meaningfulWord || words[0] || 'nature';
  };

  // Simple content pools (no punctuation for easier practice)
  const contentPools = {
    letters: ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h', 'i', 'j', 'k', 'l', 'm', 'n', 'o', 'p', 'q', 'r', 's', 't', 'u', 'v', 'w', 'x', 'y', 'z'],
    words: ['cat', 'dog', 'sun', 'moon', 'star', 'tree', 'fish', 'bird', 'car', 'book', 'ball', 'cake', 'apple', 'house', 'flower'],
    sentences: [
      'the cat is sleeping',
      'I love my dog',
      'the sun is bright',
      'birds fly in the sky',
      'I can type well',
      'reading is fun',
    ],
    stories: [
      'the dragon likes to play',
      'a knight rides a horse',
      'the kitten plays with yarn',
      'the unicorn has a rainbow mane',
    ],
  };

  // Get content for current mode and index
  const getContentForMode = (learningMode: LearningMode, index: number): LearningContent => {
    const items = contentPools[learningMode];
    const item = items[index % items.length];

    return {
      mode: learningMode,
      currentItem: item,
      description: learningMode === 'letters' ? `Type the letter ${item}` : `Type: ${item}`,
      difficulty: { letters: 1, words: 2, sentences: 3, stories: 4 }[learningMode],
    };
  };

  // Fetch image for current content
  const fetchImage = async (searchTerm: string) => {
    setLoadingImage(true);
    try {
      const images = await unsplashService.searchImages({
        query: searchTerm,
        count: 1,
        orientation: 'landscape',
        contentFilter: 'high',
      });

      if (images && images.length > 0) {
        setImageUrl(images[0].url);
      } else {
        setImageUrl(null);
      }
    } catch (error) {
      console.error('Failed to fetch image:', error);
      setImageUrl(null);
    } finally {
      setLoadingImage(false);
    }
  };

  useEffect(() => {
    const content = getContentForMode(mode, taskIndex);
    setCurrentContent(content);

    // Fetch image for words, sentences, and stories (not letters)
    if (mode !== 'letters') {
      // Extract meaningful subject from content for image search
      const searchTerm = extractMeaningfulWord(content.currentItem);
      fetchImage(searchTerm);
    } else {
      setImageUrl(null); // No images for letter mode
    }
  }, [mode, taskIndex]);

  useEffect(() => {
    if (level) {
      setMode(level as LearningMode);
      setTaskIndex(0); // Reset to first task when changing modes
    }
  }, [level]);

  const loadNextTask = () => {
    setTaskIndex((prev) => prev + 1);
    setCurrentInput('');
    setIsCorrect(null);
  };

  // Helper function to normalize text (case-insensitive, ignore punctuation)
  const normalizeText = (text: string): string => {
    return text.toLowerCase().replace(/[.,!?;:'"]/g, '').trim();
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setCurrentInput(value);

    // Normalize both input and target for comparison
    const normalizedInput = normalizeText(value);
    const normalizedTarget = normalizeText(currentContent.currentItem);

    // Check if input matches target (case-insensitive, no punctuation)
    if (normalizedInput === normalizedTarget) {
      setIsCorrect(true);
      setScore((prev) => prev + 10);
      setStreak((prev) => prev + 1);

      // Reward pet with XP
      if (addXP) {
        addXP(10); // Give 10 XP for each completed task
      }

      // Move to next after a delay
      setTimeout(() => {
        loadNextTask();
      }, 1500);
    } else if (normalizedTarget.startsWith(normalizedInput) && normalizedInput.length > 0) {
      // Partially correct - typing in progress
      setIsCorrect(null);
    } else if (normalizedInput.length > 0) {
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
      {/* Pet Companion Display */}
      {pet && (
        <motion.div
          className="fixed top-4 right-4 z-50"
          animate={{ y: [0, -10, 0] }}
          transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
        >
          <PetDisplay pet={pet} />
        </motion.div>
      )}

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
              key={taskIndex}
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="relative h-80 bg-gradient-to-br from-purple-100 to-pink-100 rounded-xl overflow-hidden"
            >
              {imageUrl && mode !== 'letters' ? (
                <>
                  <img
                    src={imageUrl}
                    alt={currentContent.currentItem}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-4">
                    <p className="text-2xl text-white font-bold text-center">
                      {currentContent.description}
                    </p>
                  </div>
                </>
              ) : (
                <div className="flex justify-center items-center h-full">
                  {loadingImage ? (
                    <div className="text-center">
                      <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-purple-600 mx-auto mb-4"></div>
                      <p className="text-xl text-gray-600">Loading image...</p>
                    </div>
                  ) : (
                    <div className="text-center">
                      <div className="text-9xl mb-4">
                        {currentContent.currentItem.toUpperCase()}
                      </div>
                      <p className="text-2xl text-gray-700">{currentContent.description}</p>
                    </div>
                  )}
                </div>
              )}
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
            {/* Read Aloud Button */}
            {ttsEnabled && (
              <div className="mt-4 text-center">
                <button
                  onClick={() => speak(currentContent.currentItem)}
                  className="px-6 py-3 bg-blue-500 text-white rounded-full font-bold hover:bg-blue-600 transition-colors shadow-lg flex items-center gap-2 mx-auto"
                >
                  🔊 Read Aloud
                </button>
              </div>
            )}
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
            <div className="mt-3 text-center">
              <button
                onClick={() => setShowKeyboard(!showKeyboard)}
                className="text-sm text-purple-600 hover:text-purple-700 underline"
              >
                {showKeyboard ? '🔼 Hide Keyboard' : '⌨️ Show Keyboard'}
              </button>
            </div>
          </div>

          {/* Virtual Keyboard */}
          {showKeyboard && (
            <div className="mb-6">
              <VirtualKeyboard
                layout="qwerty"
                onKeyPress={(key) => {
                  if (key === 'Backspace') {
                    handleInputChange({ target: { value: currentInput.slice(0, -1) } } as any);
                  } else if (key === ' ') {
                    handleInputChange({ target: { value: currentInput + ' ' } } as any);
                  } else if (key.length === 1) {
                    handleInputChange({ target: { value: currentInput + key.toLowerCase() } } as any);
                  }
                }}
                size={settings.fontSize === 'large' ? 'large' : 'medium'}
              />
            </div>
          )}

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
