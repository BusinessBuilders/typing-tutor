/**
 * Fullscreen Viewer Component
 * Step 107 - Immersive fullscreen image viewing
 */

import { motion, AnimatePresence } from 'framer-motion';
import { useState, useEffect } from 'react';
import { useSettingsStore } from '../store/useSettingsStore';
import ImageZoom from './ImageZoom';

export interface FullscreenViewerProps {
  isOpen: boolean;
  images: Array<{
    url: string;
    alt: string;
    caption?: string;
  }>;
  initialIndex?: number;
  onClose: () => void;
  showZoom?: boolean;
  showNavigation?: boolean;
}

export default function FullscreenViewer({
  isOpen,
  images,
  initialIndex = 0,
  onClose,
  showZoom = true,
  showNavigation = true,
}: FullscreenViewerProps) {
  const [currentIndex, setCurrentIndex] = useState(initialIndex);
  const { settings } = useSettingsStore();

  useEffect(() => {
    setCurrentIndex(initialIndex);
  }, [initialIndex]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isOpen) return;

      switch (e.key) {
        case 'Escape':
          onClose();
          break;
        case 'ArrowLeft':
          handlePrevious();
          break;
        case 'ArrowRight':
          handleNext();
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, currentIndex]);

  const handleNext = () => {
    if (images.length > 1) {
      setCurrentIndex((prev) => (prev + 1) % images.length);
    }
  };

  const handlePrevious = () => {
    if (images.length > 1) {
      setCurrentIndex((prev) => (prev - 1 + images.length) % images.length);
    }
  };

  if (!images[currentIndex]) {
    return null;
  }

  const currentImage = images[currentIndex];

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black z-50 flex flex-col"
        >
          {/* Header */}
          <div className="bg-black bg-opacity-75 p-4 flex items-center justify-between">
            <div className="text-white">
              <h3 className="text-lg font-medium">{currentImage.alt}</h3>
              {currentImage.caption && (
                <p className="text-sm opacity-75">{currentImage.caption}</p>
              )}
            </div>

            <div className="flex items-center space-x-2">
              {/* Counter */}
              {images.length > 1 && (
                <div className="text-white bg-white bg-opacity-20 px-3 py-1 rounded">
                  {currentIndex + 1} / {images.length}
                </div>
              )}

              {/* Close Button */}
              <motion.button
                whileHover={{ scale: settings.reducedMotion ? 1 : 1.1 }}
                whileTap={{ scale: settings.reducedMotion ? 1 : 0.9 }}
                onClick={onClose}
                className="w-10 h-10 bg-white bg-opacity-20 hover:bg-opacity-30 rounded-full flex items-center justify-center text-white transition-colors"
              >
                ✕
              </motion.button>
            </div>
          </div>

          {/* Main Content */}
          <div className="flex-1 relative">
            {showZoom ? (
              <ImageZoom
                src={currentImage.url}
                alt={currentImage.alt}
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center p-8">
                <motion.img
                  key={currentIndex}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  src={currentImage.url}
                  alt={currentImage.alt}
                  className="max-w-full max-h-full object-contain"
                />
              </div>
            )}

            {/* Navigation Arrows */}
            {showNavigation && images.length > 1 && (
              <>
                <motion.button
                  whileHover={{ scale: settings.reducedMotion ? 1 : 1.1, x: -5 }}
                  whileTap={{ scale: settings.reducedMotion ? 1 : 0.9 }}
                  onClick={handlePrevious}
                  className="absolute left-4 top-1/2 -translate-y-1/2 w-14 h-14 bg-white bg-opacity-20 hover:bg-opacity-30 rounded-full flex items-center justify-center text-white text-3xl transition-all"
                >
                  ←
                </motion.button>

                <motion.button
                  whileHover={{ scale: settings.reducedMotion ? 1 : 1.1, x: 5 }}
                  whileTap={{ scale: settings.reducedMotion ? 1 : 0.9 }}
                  onClick={handleNext}
                  className="absolute right-4 top-1/2 -translate-y-1/2 w-14 h-14 bg-white bg-opacity-20 hover:bg-opacity-30 rounded-full flex items-center justify-center text-white text-3xl transition-all"
                >
                  →
                </motion.button>
              </>
            )}
          </div>

          {/* Thumbnail Strip */}
          {images.length > 1 && (
            <div className="bg-black bg-opacity-75 p-4">
              <div className="flex space-x-2 overflow-x-auto">
                {images.map((image, index) => (
                  <motion.button
                    key={index}
                    whileHover={{ scale: settings.reducedMotion ? 1 : 1.05 }}
                    onClick={() => setCurrentIndex(index)}
                    className={`flex-shrink-0 w-20 h-20 rounded-lg overflow-hidden border-2 transition-all ${
                      index === currentIndex
                        ? 'border-white ring-2 ring-white'
                        : 'border-transparent opacity-60 hover:opacity-100'
                    }`}
                  >
                    <img
                      src={image.url}
                      alt={image.alt}
                      className="w-full h-full object-cover"
                    />
                  </motion.button>
                ))}
              </div>
            </div>
          )}

          {/* Help Text */}
          <div className="absolute bottom-20 left-1/2 -translate-x-1/2 bg-black bg-opacity-75 text-white px-4 py-2 rounded-full text-sm opacity-75">
            Press ESC to close • Use arrow keys to navigate
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

// Simple lightbox
export function SimpleLightbox({
  isOpen,
  imageUrl,
  alt,
  onClose,
}: {
  isOpen: boolean;
  imageUrl: string;
  alt: string;
  onClose: () => void;
}) {
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };

    if (isOpen) {
      window.addEventListener('keydown', handleEscape);
    }

    return () => window.removeEventListener('keydown', handleEscape);
  }, [isOpen, onClose]);

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="fixed inset-0 bg-black bg-opacity-90 z-50 flex items-center justify-center p-4 cursor-pointer"
        >
          <motion.img
            initial={{ scale: 0.8 }}
            animate={{ scale: 1 }}
            exit={{ scale: 0.8 }}
            src={imageUrl}
            alt={alt}
            className="max-w-full max-h-full rounded-lg shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          />
        </motion.div>
      )}
    </AnimatePresence>
  );
}
