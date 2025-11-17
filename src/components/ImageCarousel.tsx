/**
 * Image Carousel Component
 * Step 104 - Swipeable image carousel with autism-friendly controls
 */

import { useState, useEffect } from 'react';
import { motion, AnimatePresence, PanInfo } from 'framer-motion';
import { useSettingsStore } from '../store/useSettingsStore';
import ImageLoader from './ImageLoader';

export interface CarouselImage {
  id: string;
  url: string;
  alt: string;
  caption?: string;
}

export interface ImageCarouselProps {
  images: CarouselImage[];
  autoPlay?: boolean;
  interval?: number;
  showDots?: boolean;
  showArrows?: boolean;
  onImageChange?: (index: number) => void;
}

export default function ImageCarousel({
  images,
  autoPlay = false,
  interval = 5000,
  showDots = true,
  showArrows = true,
  onImageChange,
}: ImageCarouselProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [direction, setDirection] = useState(0);
  const { settings } = useSettingsStore();

  // Auto-play functionality
  useEffect(() => {
    if (!autoPlay || settings.reducedMotion) return;

    const timer = setInterval(() => {
      paginate(1);
    }, interval);

    return () => clearInterval(timer);
  }, [autoPlay, interval, currentIndex, settings.reducedMotion]);

  const swipeConfidenceThreshold = 10000;
  const swipePower = (offset: number, velocity: number) => {
    return Math.abs(offset) * velocity;
  };

  const paginate = (newDirection: number) => {
    const newIndex = (currentIndex + newDirection + images.length) % images.length;
    setDirection(newDirection);
    setCurrentIndex(newIndex);
    onImageChange?.(newIndex);
  };

  const handleDragEnd = (_e: any, { offset, velocity }: PanInfo) => {
    const swipe = swipePower(offset.x, velocity.x);

    if (swipe < -swipeConfidenceThreshold) {
      paginate(1);
    } else if (swipe > swipeConfidenceThreshold) {
      paginate(-1);
    }
  };

  const variants = {
    enter: (direction: number) => ({
      x: direction > 0 ? 1000 : -1000,
      opacity: 0,
    }),
    center: {
      zIndex: 1,
      x: 0,
      opacity: 1,
    },
    exit: (direction: number) => ({
      zIndex: 0,
      x: direction < 0 ? 1000 : -1000,
      opacity: 0,
    }),
  };

  if (images.length === 0) {
    return (
      <div className="w-full h-96 bg-gray-100 rounded-lg flex items-center justify-center">
        <p className="text-gray-500">No images available</p>
      </div>
    );
  }

  return (
    <div className="relative w-full">
      {/* Main Image */}
      <div className="relative h-96 bg-gray-100 rounded-lg overflow-hidden">
        <AnimatePresence initial={false} custom={direction}>
          <motion.div
            key={currentIndex}
            custom={direction}
            variants={settings.reducedMotion ? {} : variants}
            initial={settings.reducedMotion ? 'center' : 'enter'}
            animate="center"
            exit={settings.reducedMotion ? 'center' : 'exit'}
            transition={{
              x: { type: 'spring', stiffness: 300, damping: 30 },
              opacity: { duration: 0.2 },
            }}
            drag="x"
            dragConstraints={{ left: 0, right: 0 }}
            dragElastic={1}
            onDragEnd={handleDragEnd}
            className="absolute inset-0"
          >
            <ImageLoader
              src={images[currentIndex].url}
              alt={images[currentIndex].alt}
              className="w-full h-full"
            />

            {/* Caption */}
            {images[currentIndex].caption && (
              <div className="absolute bottom-0 left-0 right-0 bg-black bg-opacity-60 text-white p-4 text-center">
                <p className="text-lg">{images[currentIndex].caption}</p>
              </div>
            )}
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Navigation Arrows */}
      {showArrows && images.length > 1 && (
        <>
          <motion.button
            whileHover={{ scale: settings.reducedMotion ? 1 : 1.1 }}
            whileTap={{ scale: settings.reducedMotion ? 1 : 0.9 }}
            onClick={() => paginate(-1)}
            className="absolute left-4 top-1/2 -translate-y-1/2 w-12 h-12 bg-white rounded-full shadow-lg flex items-center justify-center text-2xl hover:bg-gray-50 z-10"
          >
            ←
          </motion.button>

          <motion.button
            whileHover={{ scale: settings.reducedMotion ? 1 : 1.1 }}
            whileTap={{ scale: settings.reducedMotion ? 1 : 0.9 }}
            onClick={() => paginate(1)}
            className="absolute right-4 top-1/2 -translate-y-1/2 w-12 h-12 bg-white rounded-full shadow-lg flex items-center justify-center text-2xl hover:bg-gray-50 z-10"
          >
            →
          </motion.button>
        </>
      )}

      {/* Dot Indicators */}
      {showDots && images.length > 1 && (
        <div className="flex justify-center space-x-2 mt-4">
          {images.map((_, index) => (
            <motion.button
              key={index}
              whileHover={{ scale: settings.reducedMotion ? 1 : 1.2 }}
              whileTap={{ scale: settings.reducedMotion ? 1 : 0.8 }}
              onClick={() => {
                setDirection(index > currentIndex ? 1 : -1);
                setCurrentIndex(index);
                onImageChange?.(index);
              }}
              className={`w-3 h-3 rounded-full transition-all ${
                index === currentIndex
                  ? 'bg-primary-600 w-8'
                  : 'bg-gray-300 hover:bg-gray-400'
              }`}
            />
          ))}
        </div>
      )}

      {/* Counter */}
      <div className="absolute top-4 right-4 bg-black bg-opacity-50 text-white px-3 py-1 rounded-full text-sm">
        {currentIndex + 1} / {images.length}
      </div>
    </div>
  );
}

// Thumbnail carousel variant
export function ThumbnailCarousel({
  images,
  onSelect,
}: {
  images: CarouselImage[];
  onSelect?: (index: number) => void;
}) {
  const [selectedIndex, setSelectedIndex] = useState(0);
  const { settings } = useSettingsStore();

  return (
    <div className="space-y-4">
      {/* Main Image */}
      <div className="w-full h-96 bg-gray-100 rounded-lg overflow-hidden">
        <ImageLoader
          src={images[selectedIndex].url}
          alt={images[selectedIndex].alt}
          className="w-full h-full"
        />
      </div>

      {/* Thumbnails */}
      <div className="flex space-x-2 overflow-x-auto pb-2">
        {images.map((image, index) => (
          <motion.button
            key={image.id}
            whileHover={{ scale: settings.reducedMotion ? 1 : 1.05 }}
            whileTap={{ scale: settings.reducedMotion ? 1 : 0.95 }}
            onClick={() => {
              setSelectedIndex(index);
              onSelect?.(index);
            }}
            className={`flex-shrink-0 w-20 h-20 rounded-lg overflow-hidden border-2 transition-all ${
              index === selectedIndex
                ? 'border-primary-600 ring-2 ring-primary-200'
                : 'border-gray-300 hover:border-gray-400'
            }`}
          >
            <ImageLoader
              src={image.url}
              alt={image.alt}
              className="w-full h-full"
            />
          </motion.button>
        ))}
      </div>
    </div>
  );
}
