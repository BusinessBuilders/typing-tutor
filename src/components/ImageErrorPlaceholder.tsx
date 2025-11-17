/**
 * Image Error Placeholder Component
 * Step 105 - Friendly error states for missing images
 */

import { motion } from 'framer-motion';

export interface ImageErrorPlaceholderProps {
  word?: string;
  category?: string;
  size?: 'small' | 'medium' | 'large';
  onRetry?: () => void;
}

export default function ImageErrorPlaceholder({
  word,
  category,
  size = 'medium',
  onRetry,
}: ImageErrorPlaceholderProps) {
  const sizes = {
    small: { container: 'w-32 h-32', icon: 'text-3xl', text: 'text-sm' },
    medium: { container: 'w-48 h-48', icon: 'text-5xl', text: 'text-base' },
    large: { container: 'w-64 h-64', icon: 'text-6xl', text: 'text-lg' },
  };

  const sizeClasses = sizes[size];

  // Category-specific fallback icons
  const categoryIcons: Record<string, string> = {
    animal: '🐾',
    nature: '🌿',
    food: '🍎',
    vehicle: '🚗',
    toy: '🧸',
    tool: '🔧',
    person: '👤',
    place: '🏠',
    object: '📦',
    default: '🖼️',
  };

  const icon = category ? categoryIcons[category] || categoryIcons.default : categoryIcons.default;

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      className={`${sizeClasses.container} bg-gradient-to-br from-blue-100 to-purple-100 rounded-xl shadow-md flex flex-col items-center justify-center p-4`}
    >
      {/* Icon */}
      <motion.div
        animate={{ rotate: [0, -10, 10, -10, 0] }}
        transition={{ duration: 0.5, delay: 0.2 }}
        className={sizeClasses.icon}
      >
        {icon}
      </motion.div>

      {/* Word */}
      {word && (
        <p className={`${sizeClasses.text} font-bold text-gray-700 mt-2 text-center`}>
          {word}
        </p>
      )}

      {/* Retry Button */}
      {onRetry && (
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={onRetry}
          className="mt-3 px-3 py-1 bg-primary-600 text-white text-xs rounded-lg hover:bg-primary-700 transition-colors"
        >
          Try again
        </motion.button>
      )}
    </motion.div>
  );
}

// Inline error message
export function InlineImageError({ message = 'Image not available' }: { message?: string }) {
  return (
    <div className="bg-red-50 border-2 border-red-200 rounded-lg p-4 flex items-center space-x-3">
      <span className="text-3xl">⚠️</span>
      <div>
        <p className="text-red-700 font-medium">{message}</p>
        <p className="text-red-600 text-sm">We'll use a placeholder instead</p>
      </div>
    </div>
  );
}

// Grid of category placeholders
export function CategoryPlaceholderGrid() {
  const categories = [
    { name: 'Animals', icon: '🐾', color: 'from-green-100 to-emerald-100' },
    { name: 'Nature', icon: '🌿', color: 'from-blue-100 to-cyan-100' },
    { name: 'Food', icon: '🍎', color: 'from-red-100 to-orange-100' },
    { name: 'Vehicles', icon: '🚗', color: 'from-gray-100 to-slate-100' },
    { name: 'Toys', icon: '🧸', color: 'from-pink-100 to-rose-100' },
    { name: 'Tools', icon: '🔧', color: 'from-yellow-100 to-amber-100' },
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
      {categories.map((category, index) => (
        <motion.div
          key={category.name}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: index * 0.1 }}
          className={`bg-gradient-to-br ${category.color} rounded-xl p-6 text-center shadow-md`}
        >
          <div className="text-5xl mb-2">{category.icon}</div>
          <p className="font-medium text-gray-700">{category.name}</p>
        </motion.div>
      ))}
    </div>
  );
}

// Animated loading skeleton
export function ImageLoadingSkeleton({ count = 1 }: { count?: number }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {Array.from({ length: count }).map((_, index) => (
        <div
          key={index}
          className="h-48 bg-gradient-to-r from-gray-200 via-gray-300 to-gray-200 rounded-lg animate-pulse"
          style={{
            backgroundSize: '200% 100%',
            animation: `shimmer 1.5s infinite ${index * 0.2}s`,
          }}
        />
      ))}
      <style>{`
        @keyframes shimmer {
          0% { background-position: -200% 0; }
          100% { background-position: 200% 0; }
        }
      `}</style>
    </div>
  );
}
