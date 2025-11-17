/**
 * Ghost Typing Component
 * Step 145 - Animated demonstration of correct typing technique
 */

import { motion } from 'framer-motion';
import { useState, useEffect } from 'react';
import { useSettingsStore } from '../store/useSettingsStore';

export interface GhostTypingProps {
  text: string;
  speed?: number; // Characters per second
  showCursor?: boolean;
  showKeyHighlight?: boolean;
  onComplete?: () => void;
}

export default function GhostTyping({
  text,
  speed = 2,
  showCursor = true,
  showKeyHighlight = true,
  onComplete,
}: GhostTypingProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);

  useEffect(() => {
    if (!isPlaying) return;

    if (currentIndex >= text.length) {
      setIsPlaying(false);
      onComplete?.();
      return;
    }

    const timeout = setTimeout(() => {
      setCurrentIndex((prev) => prev + 1);
    }, 1000 / speed);

    return () => clearTimeout(timeout);
  }, [currentIndex, isPlaying, text.length, speed, onComplete]);

  const handleStart = () => {
    setCurrentIndex(0);
    setIsPlaying(true);
  };

  const handlePause = () => {
    setIsPlaying(false);
  };

  const handleReset = () => {
    setCurrentIndex(0);
    setIsPlaying(false);
  };

  const typedText = text.slice(0, currentIndex);
  const currentChar = text[currentIndex];
  const remainingText = text.slice(currentIndex + 1);

  return (
    <div className="bg-white rounded-2xl shadow-xl p-8">
      <h2 className="text-2xl font-bold text-gray-800 mb-6 text-center">
        Watch &amp; Learn
      </h2>

      {/* Text display */}
      <div className="bg-gray-50 rounded-xl p-8 mb-6 font-mono text-3xl min-h-[200px]">
        {/* Typed text */}
        <span className="text-gray-900">{typedText}</span>

        {/* Current character with cursor */}
        {currentChar && (
          <span className="relative">
            <motion.span
              initial={{ opacity: 0.3 }}
              animate={{ opacity: 1 }}
              className="text-primary-600 font-bold"
            >
              {currentChar}
            </motion.span>

            {/* Animated cursor */}
            {showCursor && (
              <motion.span
                animate={{ opacity: [1, 0, 1] }}
                transition={{ duration: 1, repeat: Infinity }}
                className="absolute -right-1 top-0 w-0.5 h-full bg-primary-600"
              />
            )}
          </span>
        )}

        {/* Remaining text (ghosted) */}
        <span className="text-gray-300">{remainingText}</span>
      </div>

      {/* Current key highlight */}
      {showKeyHighlight && currentChar && currentChar !== ' ' && (
        <div className="flex justify-center mb-6">
          <motion.div
            key={currentChar}
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="px-8 py-6 bg-primary-500 text-white rounded-xl font-bold text-4xl shadow-lg"
          >
            {currentChar}
          </motion.div>
        </div>
      )}

      {/* Controls */}
      <div className="flex justify-center gap-4">
        {!isPlaying ? (
          <button
            onClick={handleStart}
            className="px-6 py-3 bg-primary-500 text-white rounded-lg font-bold hover:bg-primary-600 transition-colors"
          >
            {currentIndex === 0 ? 'Start' : 'Resume'}
          </button>
        ) : (
          <button
            onClick={handlePause}
            className="px-6 py-3 bg-yellow-500 text-white rounded-lg font-bold hover:bg-yellow-600 transition-colors"
          >
            Pause
          </button>
        )}

        <button
          onClick={handleReset}
          className="px-6 py-3 bg-gray-500 text-white rounded-lg font-bold hover:bg-gray-600 transition-colors"
        >
          Reset
        </button>
      </div>

      {/* Speed control */}
      <div className="mt-6">
        <label className="text-sm font-medium text-gray-700 mb-2 block">
          Speed: {speed} chars/second
        </label>
        <input
          type="range"
          min="1"
          max="10"
          value={speed}
          onChange={(e) => speed = parseInt(e.target.value)}
          className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
          disabled={isPlaying}
        />
      </div>
    </div>
  );
}

// Ghost hands showing typing animation
export function GhostHands({ activeKey }: { activeKey?: string }) {
  const { settings } = useSettingsStore();

  const leftHandKeys = ['q', 'w', 'e', 'r', 't', 'a', 's', 'd', 'f', 'g', 'z', 'x', 'c', 'v', 'b'];
  const isLeftHand = activeKey && leftHandKeys.includes(activeKey.toLowerCase());
  const isRightHand = activeKey && !isLeftHand && activeKey !== ' ';

  return (
    <div className="flex justify-center gap-24 mb-8">
      {/* Left hand */}
      <motion.div
        animate={
          isLeftHand && !settings.reducedMotion
            ? {
                y: [0, -10, 0],
                scale: [1, 1.05, 1],
              }
            : {}
        }
        transition={{ duration: 0.3 }}
        className="text-8xl"
      >
        🤚
      </motion.div>

      {/* Right hand */}
      <motion.div
        animate={
          isRightHand && !settings.reducedMotion
            ? {
                y: [0, -10, 0],
                scale: [1, 1.05, 1],
              }
            : {}
        }
        transition={{ duration: 0.3 }}
        className="text-8xl"
      >
        🖐️
      </motion.div>
    </div>
  );
}

// Ghost typing with finger highlights
export function GhostTypingWithFingers({
  text,
  autoPlay = false,
}: {
  text: string;
  autoPlay?: boolean;
}) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(autoPlay);

  const currentChar = text[currentIndex];

  useEffect(() => {
    if (!isPlaying) return;

    const timer = setInterval(() => {
      setCurrentIndex((prev) => {
        if (prev >= text.length - 1) {
          setIsPlaying(false);
          return 0;
        }
        return prev + 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [isPlaying, text.length]);

  return (
    <div className="bg-white rounded-2xl shadow-xl p-8">
      <GhostHands activeKey={currentChar} />

      <div className="text-center mb-6">
        <div className="text-6xl font-mono mb-4">
          <span className="text-gray-900">{text.slice(0, currentIndex)}</span>
          <span className="text-primary-600 font-bold bg-primary-100 px-2">
            {currentChar}
          </span>
          <span className="text-gray-300">{text.slice(currentIndex + 1)}</span>
        </div>
      </div>

      <div className="flex justify-center gap-4">
        <button
          onClick={() => setIsPlaying(!isPlaying)}
          className={`px-6 py-3 ${
            isPlaying ? 'bg-yellow-500' : 'bg-primary-500'
          } text-white rounded-lg font-bold hover:opacity-90 transition-opacity`}
        >
          {isPlaying ? 'Pause' : 'Play'}
        </button>
      </div>
    </div>
  );
}

// Progressive ghost typing reveal
export function ProgressiveGhostReveal({
  words,
  interval = 2000,
}: {
  words: string[];
  interval?: number;
}) {
  const { settings } = useSettingsStore();
  const [revealedIndex, setRevealedIndex] = useState(-1);

  useEffect(() => {
    const timer = setInterval(() => {
      setRevealedIndex((prev) => {
        if (prev >= words.length - 1) {
          clearInterval(timer);
          return prev;
        }
        return prev + 1;
      });
    }, interval);

    return () => clearInterval(timer);
  }, [words.length, interval]);

  return (
    <div className="bg-white rounded-xl shadow-lg p-6">
      <h3 className="text-lg font-bold text-gray-800 mb-4">
        Word-by-Word Demonstration
      </h3>

      <div className="flex flex-wrap gap-3 text-2xl font-mono">
        {words.map((word, index) => {
          const isRevealed = index <= revealedIndex;
          const isCurrent = index === revealedIndex;

          return (
            <motion.span
              key={index}
              initial={{ opacity: 0.2, scale: 0.95 }}
              animate={{
                opacity: isRevealed ? 1 : 0.2,
                scale: isCurrent ? 1.1 : 1,
              }}
              transition={{ duration: settings.reducedMotion ? 0 : 0.3 }}
              className={`px-3 py-2 rounded-lg ${
                isCurrent
                  ? 'bg-primary-500 text-white'
                  : isRevealed
                  ? 'bg-green-100 text-green-900'
                  : 'bg-gray-100 text-gray-400'
              }`}
            >
              {word}
            </motion.span>
          );
        })}
      </div>
    </div>
  );
}

// Ghost typing with mistakes
export function GhostTypingWithMistakes({
  text,
  mistakes = [],
}: {
  text: string;
  mistakes?: Array<{ index: number; wrongChar: string }>;
}) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [showingMistake, setShowingMistake] = useState(false);

  useEffect(() => {
    const timer = setInterval(() => {
      const mistake = mistakes.find((m) => m.index === currentIndex);

      if (mistake && !showingMistake) {
        setShowingMistake(true);
        setTimeout(() => {
          setShowingMistake(false);
          setCurrentIndex((prev) => prev + 1);
        }, 1000);
      } else if (!showingMistake) {
        setCurrentIndex((prev) => {
          if (prev >= text.length) return 0;
          return prev + 1;
        });
      }
    }, 500);

    return () => clearInterval(timer);
  }, [currentIndex, showingMistake, text.length, mistakes]);

  const mistake = mistakes.find((m) => m.index === currentIndex);

  return (
    <div className="bg-white rounded-xl shadow-lg p-6">
      <h3 className="text-lg font-bold text-gray-800 mb-4">
        Learning from Mistakes
      </h3>

      <div className="bg-gray-50 rounded-lg p-6 font-mono text-3xl">
        {text.split('').map((char, index) => {
          if (index < currentIndex) {
            return (
              <span key={index} className="text-green-600">
                {char}
              </span>
            );
          } else if (index === currentIndex) {
            if (showingMistake && mistake) {
              return (
                <span key={index} className="relative">
                  <motion.span
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="text-red-600 line-through"
                  >
                    {mistake.wrongChar}
                  </motion.span>
                  <motion.span
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="absolute left-0 top-8 text-sm bg-red-100 text-red-900 px-2 py-1 rounded"
                  >
                    Oops! Should be "{char}"
                  </motion.span>
                </span>
              );
            }
            return (
              <span key={index} className="text-primary-600 bg-primary-100 px-1">
                {char}
              </span>
            );
          } else {
            return (
              <span key={index} className="text-gray-300">
                {char}
              </span>
            );
          }
        })}
      </div>
    </div>
  );
}

// Ghost typing speed comparison
export function GhostSpeedComparison() {
  const [slow, setSlow] = useState(0);
  const [fast, setFast] = useState(0);

  const text = 'The quick brown fox jumps over the lazy dog';

  useEffect(() => {
    const slowTimer = setInterval(() => {
      setSlow((prev) => (prev >= text.length ? 0 : prev + 1));
    }, 500);

    const fastTimer = setInterval(() => {
      setFast((prev) => (prev >= text.length ? 0 : prev + 1));
    }, 150);

    return () => {
      clearInterval(slowTimer);
      clearInterval(fastTimer);
    };
  }, [text.length]);

  return (
    <div className="bg-white rounded-2xl shadow-xl p-8">
      <h2 className="text-2xl font-bold text-gray-800 mb-6 text-center">
        Speed Comparison
      </h2>

      <div className="space-y-8">
        {/* Slow typing */}
        <div>
          <div className="flex items-center gap-2 mb-3">
            <div className="text-2xl">🐢</div>
            <h3 className="text-lg font-bold text-gray-700">Slow &amp; Steady</h3>
          </div>

          <div className="bg-blue-50 rounded-lg p-6 font-mono text-xl">
            <span className="text-gray-900">{text.slice(0, slow)}</span>
            <span className="text-blue-600 bg-blue-200 px-1">{text[slow]}</span>
            <span className="text-gray-300">{text.slice(slow + 1)}</span>
          </div>
        </div>

        {/* Fast typing */}
        <div>
          <div className="flex items-center gap-2 mb-3">
            <div className="text-2xl">⚡</div>
            <h3 className="text-lg font-bold text-gray-700">Fast &amp; Accurate</h3>
          </div>

          <div className="bg-purple-50 rounded-lg p-6 font-mono text-xl">
            <span className="text-gray-900">{text.slice(0, fast)}</span>
            <span className="text-purple-600 bg-purple-200 px-1">{text[fast]}</span>
            <span className="text-gray-300">{text.slice(fast + 1)}</span>
          </div>
        </div>
      </div>

      <div className="mt-6 bg-gray-50 rounded-xl p-4 text-center">
        <p className="text-gray-800">
          <span className="font-bold">💡 Tip:</span> Start slow to build accuracy,
          then gradually increase speed
        </p>
      </div>
    </div>
  );
}

// Interactive ghost typing challenge
export function GhostTypingChallenge({
  targetText,
  onComplete,
}: {
  targetText: string;
  onComplete?: (time: number) => void;
}) {
  const [ghostIndex, setGhostIndex] = useState(0);
  const [userIndex, setUserIndex] = useState(0);
  const [startTime, setStartTime] = useState<number | null>(null);

  useEffect(() => {
    if (startTime === null) return;

    const timer = setInterval(() => {
      setGhostIndex((prev) => {
        if (prev >= targetText.length - 1) {
          clearInterval(timer);
          return prev;
        }
        return prev + 1;
      });
    }, 800);

    return () => clearInterval(timer);
  }, [startTime, targetText.length]);

  const handleStart = () => {
    setStartTime(Date.now());
    setGhostIndex(0);
    setUserIndex(0);
  };

  const userAhead = userIndex > ghostIndex;
  const isComplete = userIndex >= targetText.length;

  useEffect(() => {
    if (isComplete && startTime) {
      const time = Date.now() - startTime;
      onComplete?.(time);
    }
  }, [isComplete, startTime, onComplete]);

  return (
    <div className="bg-white rounded-2xl shadow-xl p-8">
      <h2 className="text-2xl font-bold text-gray-800 mb-6 text-center">
        Race the Ghost!
      </h2>

      {/* Progress bars */}
      <div className="space-y-4 mb-8">
        {/* Ghost progress */}
        <div>
          <div className="flex items-center gap-2 mb-2">
            <span className="text-2xl">👻</span>
            <span className="text-sm font-medium text-gray-700">Ghost</span>
          </div>
          <div className="h-6 bg-gray-200 rounded-full overflow-hidden">
            <motion.div
              animate={{ width: `${(ghostIndex / targetText.length) * 100}%` }}
              className="h-full bg-purple-500"
            />
          </div>
        </div>

        {/* User progress */}
        <div>
          <div className="flex items-center gap-2 mb-2">
            <span className="text-2xl">👤</span>
            <span className="text-sm font-medium text-gray-700">You</span>
          </div>
          <div className="h-6 bg-gray-200 rounded-full overflow-hidden">
            <motion.div
              animate={{ width: `${(userIndex / targetText.length) * 100}%` }}
              className={`h-full ${userAhead ? 'bg-green-500' : 'bg-blue-500'}`}
            />
          </div>
        </div>
      </div>

      {/* Text display */}
      <div className="bg-gray-50 rounded-lg p-6 font-mono text-2xl mb-6">
        {targetText.split('').map((char, index) => {
          const isGhost = index === ghostIndex;
          const isUser = index === userIndex;

          return (
            <span
              key={index}
              className={`relative ${
                index < userIndex
                  ? 'text-green-600'
                  : index < ghostIndex
                  ? 'text-purple-400'
                  : 'text-gray-300'
              }`}
            >
              {char}
              {isGhost && (
                <span className="absolute -top-6 left-0 text-sm">👻</span>
              )}
              {isUser && (
                <span className="absolute -bottom-6 left-0 text-sm">⬆️</span>
              )}
            </span>
          );
        })}
      </div>

      {/* Start button */}
      {!startTime && (
        <div className="flex justify-center">
          <button
            onClick={handleStart}
            className="px-8 py-4 bg-primary-500 text-white rounded-lg font-bold text-xl hover:bg-primary-600 transition-colors"
          >
            Start Challenge!
          </button>
        </div>
      )}

      {/* Result */}
      {isComplete && (
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className={`p-6 rounded-xl text-center ${
            userAhead ? 'bg-green-50' : 'bg-blue-50'
          }`}
        >
          <div className="text-4xl mb-2">{userAhead ? '🏆' : '🎉'}</div>
          <div className="text-xl font-bold text-gray-900 mb-1">
            {userAhead ? 'You Win!' : 'Good Try!'}
          </div>
          <div className="text-sm text-gray-600">
            {userAhead
              ? 'You beat the ghost!'
              : 'Keep practicing to get faster!'}
          </div>
        </motion.div>
      )}
    </div>
  );
}
