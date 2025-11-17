/**
 * Visual Prompt Component
 * Step 101 - Shows images with words for visual learning
 */

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useSettingsStore } from '../store/useSettingsStore';

export interface VisualPromptProps {
  word: string;
  imageUrl?: string;
  caption?: string;
  showWord?: boolean;
  onImageLoad?: () => void;
  onImageError?: () => void;
  size?: 'small' | 'medium' | 'large';
  showZoom?: boolean;
}

export default function VisualPrompt({
  word,
  imageUrl,
  caption,
  showWord = true,
  onImageLoad,
  onImageError,
  size = 'medium',
  showZoom = true,
}: VisualPromptProps) {
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);
  const [isZoomed, setIsZoomed] = useState(false);
  const { settings } = useSettingsStore();

  const sizes = {
    small: { container: 'w-48 h-48', text: 'text-2xl' },
    medium: { container: 'w-64 h-64', text: 'text-3xl' },
    large: { container: 'w-96 h-96', text: 'text-4xl' },
  };

  const sizeClasses = sizes[size];

  const handleImageLoad = () => {
    setIsLoading(false);
    setHasError(false);
    onImageLoad?.();
  };

  const handleImageError = () => {
    setIsLoading(false);
    setHasError(true);
    onImageError?.();
  };

  const handleZoomToggle = () => {
    if (showZoom && !hasError) {
      setIsZoomed(!isZoomed);
    }
  };

  return (
    <div className="flex flex-col items-center space-y-4">
      {/* Image Container */}
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className={`relative ${sizeClasses.container} rounded-2xl overflow-hidden shadow-lg bg-gray-100`}
      >
        {/* Loading State */}
        <AnimatePresence>
          {isLoading && !hasError && imageUrl && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 flex items-center justify-center bg-gray-100"
            >
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                className="w-12 h-12 border-4 border-gray-300 border-t-primary-600 rounded-full"
              />
            </motion.div>
          )}
        </AnimatePresence>

        {/* Error State */}
        {hasError || !imageUrl ? (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-gradient-to-br from-blue-100 to-purple-100 p-6">
            <div className="text-6xl mb-3">🖼️</div>
            <p className="text-gray-600 text-center font-medium">{word}</p>
          </div>
        ) : (
          /* Image */
          <motion.img
            src={imageUrl}
            alt={caption || word}
            onLoad={handleImageLoad}
            onError={handleImageError}
            onClick={handleZoomToggle}
            className={`w-full h-full object-cover ${showZoom && !hasError ? 'cursor-zoom-in' : ''}`}
            whileHover={showZoom && !hasError && !settings.reducedMotion ? { scale: 1.05 } : {}}
            transition={{ duration: 0.2 }}
          />
        )}

        {/* Zoom Indicator */}
        {showZoom && !hasError && !isLoading && imageUrl && (
          <div className="absolute bottom-2 right-2 bg-black bg-opacity-50 text-white px-2 py-1 rounded text-xs">
            🔍 Click to zoom
          </div>
        )}
      </motion.div>

      {/* Word Label */}
      {showWord && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className={`${sizeClasses.text} font-bold text-gray-800 text-center`}
        >
          {word}
        </motion.div>
      )}

      {/* Caption */}
      {caption && (
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="text-gray-600 text-center max-w-md"
        >
          {caption}
        </motion.p>
      )}

      {/* Fullscreen Zoom Modal */}
      <AnimatePresence>
        {isZoomed && imageUrl && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setIsZoomed(false)}
            className="fixed inset-0 bg-black bg-opacity-90 z-50 flex items-center justify-center p-4 cursor-zoom-out"
          >
            <motion.img
              src={imageUrl}
              alt={caption || word}
              initial={{ scale: 0.8 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.8 }}
              className="max-w-full max-h-full rounded-lg shadow-2xl"
              onClick={(e) => e.stopPropagation()}
            />
            <button
              onClick={() => setIsZoomed(false)}
              className="absolute top-4 right-4 bg-white text-gray-800 rounded-full w-12 h-12 flex items-center justify-center text-2xl hover:bg-gray-100 transition-colors"
            >
              ✕
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
