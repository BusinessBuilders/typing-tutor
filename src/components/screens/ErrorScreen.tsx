/**
 * Error Screen Component
 * Step 98 - Friendly error messages for children
 */

import { motion } from 'framer-motion';
import { useAppStore } from '../../store/useAppStore';

interface ErrorScreenProps {
  error?: {
    title?: string;
    message?: string;
    code?: string;
  };
  onRetry?: () => void;
  onGoHome?: () => void;
}

export default function ErrorScreen({
  error = {
    title: 'Oops! Something went wrong',
    message: "Don't worry, we can fix this together!",
  },
  onRetry,
  onGoHome,
}: ErrorScreenProps) {
  const { setScreen } = useAppStore();

  const errorTypes = {
    network: {
      icon: '📡',
      title: 'Connection Problem',
      message: "Let's check your internet connection",
      color: 'blue',
    },
    database: {
      icon: '💾',
      title: 'Data Problem',
      message: 'We had trouble saving your work',
      color: 'purple',
    },
    ai: {
      icon: '🤖',
      title: 'AI Helper Unavailable',
      message: 'The AI is taking a break. Try again in a moment',
      color: 'green',
    },
    general: {
      icon: '⚠️',
      title: error.title || 'Oops!',
      message: error.message || 'Something unexpected happened',
      color: 'red',
    },
  };

  const errorType = error.code && errorTypes[error.code as keyof typeof errorTypes]
    ? errorTypes[error.code as keyof typeof errorTypes]
    : errorTypes.general;

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-purple-50 px-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8 text-center"
      >
        {/* Error Icon */}
        <motion.div
          initial={{ y: -20 }}
          animate={{ y: 0 }}
          transition={{ delay: 0.1 }}
          className="text-8xl mb-4"
        >
          {errorType.icon}
        </motion.div>

        {/* Error Title */}
        <motion.h1
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
          className={`text-3xl font-bold mb-3 text-${errorType.color}-600`}
        >
          {errorType.title}
        </motion.h1>

        {/* Error Message */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="text-gray-600 mb-6 text-lg"
        >
          {errorType.message}
        </motion.p>

        {/* Friendly Tips */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="bg-blue-50 rounded-lg p-4 mb-6 text-left"
        >
          <h3 className="font-bold text-gray-800 mb-2 flex items-center space-x-2">
            <span>💡</span>
            <span>What can you do?</span>
          </h3>
          <ul className="text-sm text-gray-600 space-y-1 list-disc list-inside">
            <li>Try clicking the retry button below</li>
            <li>Ask a grown-up for help</li>
            <li>Go back to the home screen</li>
          </ul>
        </motion.div>

        {/* Action Buttons */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="flex flex-col space-y-3"
        >
          {onRetry && (
            <button
              onClick={onRetry}
              className="px-6 py-3 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors font-medium flex items-center justify-center space-x-2"
            >
              <span>🔄</span>
              <span>Try Again</span>
            </button>
          )}

          <button
            onClick={() => {
              onGoHome?.();
              setScreen('home');
            }}
            className="px-6 py-3 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors font-medium flex items-center justify-center space-x-2"
          >
            <span>🏠</span>
            <span>Go Home</span>
          </button>
        </motion.div>

        {/* Error Code (for debugging) */}
        {error.code && (
          <p className="mt-6 text-xs text-gray-400">
            Error Code: {error.code}
          </p>
        )}
      </motion.div>
    </div>
  );
}

// 404 Not Found variant
export function NotFoundScreen() {
  const { setScreen } = useAppStore();

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-50 to-pink-50 px-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8 text-center"
      >
        <div className="text-8xl mb-4">🔍</div>
        <h1 className="text-4xl font-bold mb-3 text-purple-600">404</h1>
        <p className="text-xl text-gray-600 mb-6">
          Hmm... we can't find what you're looking for
        </p>
        <button
          onClick={() => setScreen('home')}
          className="px-8 py-3 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors font-medium"
        >
          Take Me Home
        </button>
      </motion.div>
    </div>
  );
}
