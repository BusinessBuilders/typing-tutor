/**
 * Gentle Error Feedback Component
 * Step 124 - Child-friendly error messages and encouragement
 */

import { motion, AnimatePresence } from 'framer-motion';
import { useEffect, useState } from 'react';
import { useSettingsStore } from '../store/useSettingsStore';

export interface ErrorFeedbackProps {
  errorType: 'wrong-key' | 'too-fast' | 'try-again' | 'almost' | 'keep-going';
  expectedKey?: string;
  receivedKey?: string;
  onDismiss?: () => void;
  autoDismiss?: boolean;
  dismissDelay?: number;
}

const encouragingMessages = {
  'wrong-key': [
    'Oops! Try again! 💭',
    "That's okay! Everyone makes mistakes! 🌟",
    "Almost! Let's try that key again! ✨",
    "Close! You're doing great! 🎯",
    "No worries! Take your time! 💙",
  ],
  'too-fast': [
    "Take your time! There's no rush! 🐢",
    "Slow and steady wins the race! 🏁",
    "Let's go at a comfy pace! 🌈",
    "Deep breath! You've got this! 🌸",
  ],
  'try-again': [
    "Let's give it another try! 💪",
    "You're so close! Try once more! ⭐",
    "Practice makes perfect! Keep going! 🎨",
    "You're doing amazing! One more time! 🎉",
  ],
  almost: [
    "You're almost there! 🎯",
    "So close! Keep it up! ✨",
    "Great job! Just a bit more! 🌟",
    "You're doing wonderful! 💖",
  ],
  'keep-going': [
    "You're doing great! Keep going! 🚀",
    'Nice work! Keep it up! 🌈',
    "You're a star! Keep practicing! ⭐",
    "Awesome job! You're learning! 🎨",
  ],
};

export default function GentleErrorFeedback({
  errorType,
  expectedKey,
  receivedKey,
  onDismiss,
  autoDismiss = true,
  dismissDelay = 3000,
}: ErrorFeedbackProps) {
  const { settings } = useSettingsStore();
  const [message, setMessage] = useState('');
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    // Select a random encouraging message
    const messages = encouragingMessages[errorType];
    const randomMessage = messages[Math.floor(Math.random() * messages.length)];
    setMessage(randomMessage);
  }, [errorType]);

  useEffect(() => {
    if (autoDismiss) {
      const timer = setTimeout(() => {
        setIsVisible(false);
        onDismiss?.();
      }, dismissDelay);

      return () => clearTimeout(timer);
    }
  }, [autoDismiss, dismissDelay, onDismiss]);

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0, y: -20, scale: 0.8 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 20, scale: 0.8 }}
          className="fixed top-20 left-1/2 -translate-x-1/2 z-50"
        >
          <div className="bg-gradient-to-r from-blue-100 to-purple-100 rounded-2xl shadow-2xl p-6 max-w-md">
            {/* Message */}
            <div className="text-center mb-4">
              <p className="text-2xl font-bold text-gray-800 mb-2">{message}</p>

              {/* Show expected vs received keys if available */}
              {expectedKey && receivedKey && errorType === 'wrong-key' && (
                <div className="flex items-center justify-center space-x-4 mt-4">
                  <div className="text-center">
                    <p className="text-sm text-gray-600 mb-1">You pressed:</p>
                    <div className="w-16 h-16 bg-red-200 rounded-xl flex items-center justify-center text-3xl font-bold text-red-800">
                      {receivedKey}
                    </div>
                  </div>

                  <span className="text-3xl">→</span>

                  <div className="text-center">
                    <p className="text-sm text-gray-600 mb-1">Try this key:</p>
                    <motion.div
                      animate={
                        settings.reducedMotion
                          ? {}
                          : {
                              scale: [1, 1.1, 1],
                            }
                      }
                      transition={{
                        duration: 0.8,
                        repeat: Infinity,
                      }}
                      className="w-16 h-16 bg-success-200 rounded-xl flex items-center justify-center text-3xl font-bold text-success-800 ring-4 ring-success-300"
                    >
                      {expectedKey}
                    </motion.div>
                  </div>
                </div>
              )}
            </div>

            {/* Dismiss button */}
            {!autoDismiss && (
              <button
                onClick={() => {
                  setIsVisible(false);
                  onDismiss?.();
                }}
                className="w-full py-3 bg-primary-500 text-white rounded-lg hover:bg-primary-600 transition-colors font-bold"
              >
                Got it! ✓
              </button>
            )}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

// Inline gentle error hint (less intrusive)
export function InlineErrorHint({
  message,
  icon = '💡',
}: {
  message: string;
  icon?: string;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 20 }}
      className="inline-flex items-center space-x-2 bg-blue-50 text-blue-800 px-4 py-2 rounded-full text-sm font-medium"
    >
      <span className="text-lg">{icon}</span>
      <span>{message}</span>
    </motion.div>
  );
}

// Error streak breaker (encouragement after multiple errors)
export function ErrorStreakBreaker({ errorCount }: { errorCount: number }) {
  const { settings } = useSettingsStore();

  if (errorCount < 3) return null;

  const messages = [
    "Let's take a quick break! 🌈",
    "You're working hard! Time for a breather! 💙",
    "Great effort! Want to try something easier? 🌟",
    "You're doing your best! That's what matters! ⭐",
  ];

  const message = messages[Math.min(errorCount - 3, messages.length - 1)];

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.5 }}
      animate={{ opacity: 1, scale: 1 }}
      className="fixed inset-0 bg-black bg-opacity-20 flex items-center justify-center z-50 p-4"
    >
      <motion.div
        animate={
          settings.reducedMotion
            ? {}
            : {
                rotate: [-2, 2, -2, 2, 0],
              }
        }
        transition={{ duration: 0.5 }}
        className="bg-white rounded-3xl shadow-2xl p-8 max-w-lg text-center"
      >
        <div className="text-6xl mb-4">🤗</div>
        <h2 className="text-3xl font-bold text-gray-800 mb-4">{message}</h2>
        <p className="text-lg text-gray-600 mb-6">
          Remember, everyone learns at their own pace. You're doing great!
        </p>

        <div className="flex space-x-4">
          <button className="flex-1 py-4 bg-primary-500 text-white rounded-xl hover:bg-primary-600 transition-colors font-bold text-lg">
            Keep Trying! 💪
          </button>
          <button className="flex-1 py-4 bg-gray-200 text-gray-700 rounded-xl hover:bg-gray-300 transition-colors font-bold text-lg">
            Take a Break 🌸
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
}

// Progress celebration (positive reinforcement)
export function ProgressCelebration({
  milestone,
  message,
}: {
  milestone: string;
  message: string;
}) {
  const { settings } = useSettingsStore();

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0 }}
      className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-50"
    >
      <motion.div
        animate={
          settings.reducedMotion
            ? {}
            : {
                rotate: [0, -5, 5, -5, 5, 0],
                scale: [1, 1.05, 1],
              }
        }
        transition={{ duration: 0.6 }}
        className="bg-gradient-to-br from-yellow-200 via-pink-200 to-purple-200 rounded-3xl shadow-2xl p-12 text-center"
      >
        <motion.div
          animate={
            settings.reducedMotion
              ? {}
              : {
                  scale: [1, 1.2, 1],
                }
          }
          transition={{
            duration: 0.5,
            repeat: 3,
          }}
          className="text-8xl mb-6"
        >
          🎉
        </motion.div>

        <h2 className="text-4xl font-bold text-gray-800 mb-4">{milestone}</h2>
        <p className="text-2xl text-gray-700">{message}</p>
      </motion.div>
    </motion.div>
  );
}

// Gentle reminder for accuracy
export function AccuracyReminder({ accuracy }: { accuracy: number }) {
  if (accuracy >= 80) return null; // Only show if accuracy is low

  const getEncouragement = () => {
    if (accuracy >= 60) {
      return {
        icon: '🎯',
        message: "You're getting better! Focus on accuracy!",
        color: 'from-yellow-100 to-orange-100',
      };
    }
    return {
      icon: '💙',
      message: "It's okay to go slow! Accuracy first, speed later!",
      color: 'from-blue-100 to-cyan-100',
    };
  };

  const encouragement = getEncouragement();

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className={`bg-gradient-to-r ${encouragement.color} rounded-xl p-4 shadow-lg mb-4`}
    >
      <div className="flex items-center space-x-3">
        <span className="text-3xl">{encouragement.icon}</span>
        <p className="text-lg font-medium text-gray-800">{encouragement.message}</p>
      </div>
    </motion.div>
  );
}
