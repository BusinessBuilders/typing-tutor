/**
 * Loading Animation Component
 * Step 97 - Calming loading animations for autism-friendly UX
 */

import { motion } from 'framer-motion';

interface LoadingAnimationProps {
  message?: string;
  size?: 'small' | 'medium' | 'large';
  type?: 'spinner' | 'dots' | 'pulse' | 'typing';
}

export default function LoadingAnimation({
  message = 'Loading...',
  size = 'medium',
  type = 'spinner',
}: LoadingAnimationProps) {
  const sizes = {
    small: { container: 'h-32', icon: 'text-4xl', spinner: 'h-8 w-8' },
    medium: { container: 'h-48', icon: 'text-6xl', spinner: 'h-16 w-16' },
    large: { container: 'h-64', icon: 'text-8xl', spinner: 'h-24 w-24' },
  };

  const sizeClasses = sizes[size];

  if (type === 'spinner') {
    return (
      <div className={`flex flex-col items-center justify-center ${sizeClasses.container}`}>
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
          className={`rounded-full border-4 border-gray-200 border-t-primary-600 ${sizeClasses.spinner}`}
        />
        {message && (
          <p className="mt-4 text-lg text-gray-600">{message}</p>
        )}
      </div>
    );
  }

  if (type === 'dots') {
    return (
      <div className={`flex flex-col items-center justify-center ${sizeClasses.container}`}>
        <div className="flex space-x-2">
          {[0, 1, 2].map((i) => (
            <motion.div
              key={i}
              animate={{
                y: [0, -20, 0],
                scale: [1, 1.2, 1],
              }}
              transition={{
                duration: 0.6,
                repeat: Infinity,
                delay: i * 0.2,
              }}
              className="w-4 h-4 bg-primary-600 rounded-full"
            />
          ))}
        </div>
        {message && (
          <p className="mt-4 text-lg text-gray-600">{message}</p>
        )}
      </div>
    );
  }

  if (type === 'pulse') {
    return (
      <div className={`flex flex-col items-center justify-center ${sizeClasses.container}`}>
        <motion.div
          animate={{
            scale: [1, 1.2, 1],
            opacity: [1, 0.7, 1],
          }}
          transition={{
            duration: 1.5,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
          className={sizeClasses.icon}
        >
          ✨
        </motion.div>
        {message && (
          <p className="mt-4 text-lg text-gray-600">{message}</p>
        )}
      </div>
    );
  }

  if (type === 'typing') {
    return (
      <div className={`flex flex-col items-center justify-center ${sizeClasses.container}`}>
        <div className="text-4xl mb-4">⌨️</div>
        <div className="flex space-x-1">
          {[0, 1, 2, 3].map((i) => (
            <motion.div
              key={i}
              animate={{
                opacity: [0.3, 1, 0.3],
              }}
              transition={{
                duration: 1.2,
                repeat: Infinity,
                delay: i * 0.3,
              }}
              className="w-2 h-8 bg-primary-600 rounded"
            />
          ))}
        </div>
        {message && (
          <p className="mt-4 text-lg text-gray-600">{message}</p>
        )}
      </div>
    );
  }

  return null;
}

// Full screen loading overlay
export function LoadingOverlay({ message = 'Loading...' }: { message?: string }) {
  return (
    <div className="fixed inset-0 bg-white bg-opacity-90 flex items-center justify-center z-50">
      <div className="text-center">
        <LoadingAnimation message={message} size="large" type="pulse" />
      </div>
    </div>
  );
}

// Inline loading spinner
export function InlineLoader({ message }: { message?: string }) {
  return (
    <div className="flex items-center space-x-3 py-4">
      <div className="animate-spin rounded-full h-6 w-6 border-2 border-gray-300 border-t-primary-600" />
      {message && <span className="text-gray-600">{message}</span>}
    </div>
  );
}
