/**
 * Content Preloader Component
 * Step 110 - Preload content before displaying to ensure smooth experience
 */

import { motion, AnimatePresence } from 'framer-motion';
import { useState, useEffect, ReactNode } from 'react';
import { useBatchImagePreload } from '../hooks/useLazyLoad';

export interface PreloaderProps {
  images?: string[];
  minDuration?: number; // Minimum time to show preloader (ms)
  children: ReactNode;
  onComplete?: () => void;
}

export default function ContentPreloader({
  images = [],
  minDuration = 1000,
  children,
  onComplete,
}: PreloaderProps) {
  const [isReady, setIsReady] = useState(false);
  const [minTimeElapsed, setMinTimeElapsed] = useState(false);
  const { progress, isComplete } = useBatchImagePreload(images);

  useEffect(() => {
    const timer = setTimeout(() => {
      setMinTimeElapsed(true);
    }, minDuration);

    return () => clearTimeout(timer);
  }, [minDuration]);

  useEffect(() => {
    if (isComplete && minTimeElapsed) {
      setIsReady(true);
      onComplete?.();
    }
  }, [isComplete, minTimeElapsed, onComplete]);

  return (
    <AnimatePresence mode="wait">
      {!isReady ? (
        <PreloaderScreen key="preloader" progress={progress} />
      ) : (
        <motion.div
          key="content"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.3 }}
        >
          {children}
        </motion.div>
      )}
    </AnimatePresence>
  );
}

// Preloader screen with progress
function PreloaderScreen({ progress }: { progress: number }) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-gradient-to-br from-blue-50 to-purple-50 flex items-center justify-center z-50"
    >
      <div className="text-center">
        {/* Loading Icon */}
        <motion.div
          animate={{
            rotate: 360,
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
            ease: 'linear',
          }}
          className="text-7xl mb-6"
        >
          🎨
        </motion.div>

        {/* Loading Text */}
        <h2 className="text-2xl font-bold text-gray-800 mb-4">
          Getting Ready...
        </h2>

        {/* Progress Bar */}
        <div className="w-64 h-4 bg-gray-200 rounded-full overflow-hidden">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${progress}%` }}
            transition={{ duration: 0.3 }}
            className="h-full bg-gradient-to-r from-primary-500 to-primary-600 rounded-full"
          />
        </div>

        {/* Progress Percentage */}
        <p className="text-lg text-gray-600 mt-3">
          {Math.round(progress)}%
        </p>
      </div>
    </motion.div>
  );
}

// Simple spinner preloader
export function SpinnerPreloader({ size = 'medium' }: { size?: 'small' | 'medium' | 'large' }) {
  const sizes = {
    small: 'w-8 h-8',
    medium: 'w-16 h-16',
    large: 'w-24 h-24',
  };

  return (
    <div className="flex items-center justify-center">
      <motion.div
        animate={{ rotate: 360 }}
        transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
        className={`${sizes[size]} border-4 border-primary-200 border-t-primary-600 rounded-full`}
      />
    </div>
  );
}

// Dots preloader
export function DotsPreloader() {
  return (
    <div className="flex space-x-2">
      {[0, 1, 2].map((index) => (
        <motion.div
          key={index}
          animate={{
            scale: [1, 1.5, 1],
            opacity: [0.5, 1, 0.5],
          }}
          transition={{
            duration: 1,
            repeat: Infinity,
            delay: index * 0.2,
          }}
          className="w-4 h-4 bg-primary-600 rounded-full"
        />
      ))}
    </div>
  );
}

// Skeleton preloader for content
export function SkeletonPreloader({ count = 3 }: { count?: number }) {
  return (
    <div className="space-y-4">
      {Array.from({ length: count }).map((_, index) => (
        <div key={index} className="animate-pulse">
          <div className="h-48 bg-gray-200 rounded-lg mb-4" />
          <div className="h-4 bg-gray-200 rounded w-3/4 mb-2" />
          <div className="h-4 bg-gray-200 rounded w-1/2" />
        </div>
      ))}
    </div>
  );
}

// Card skeleton preloader
export function CardSkeleton() {
  return (
    <div className="animate-pulse bg-white rounded-xl shadow-lg p-6">
      <div className="flex items-center space-x-4 mb-4">
        <div className="w-16 h-16 bg-gray-200 rounded-full" />
        <div className="flex-1 space-y-2">
          <div className="h-4 bg-gray-200 rounded w-3/4" />
          <div className="h-3 bg-gray-200 rounded w-1/2" />
        </div>
      </div>
      <div className="space-y-3">
        <div className="h-3 bg-gray-200 rounded" />
        <div className="h-3 bg-gray-200 rounded" />
        <div className="h-3 bg-gray-200 rounded w-5/6" />
      </div>
    </div>
  );
}

// Image card preloader
export function ImageCardSkeleton() {
  return (
    <div className="animate-pulse bg-white rounded-xl shadow-lg overflow-hidden">
      <div className="h-48 bg-gray-200" />
      <div className="p-4 space-y-3">
        <div className="h-4 bg-gray-200 rounded w-3/4" />
        <div className="h-3 bg-gray-200 rounded w-full" />
        <div className="h-3 bg-gray-200 rounded w-5/6" />
      </div>
    </div>
  );
}

// Progressive content reveal
export function ProgressiveReveal({
  items,
  delay = 100,
  children,
}: {
  items: number;
  delay?: number;
  children: ReactNode[];
}) {
  const [visibleCount, setVisibleCount] = useState(0);

  useEffect(() => {
    if (visibleCount < items) {
      const timer = setTimeout(() => {
        setVisibleCount((prev) => prev + 1);
      }, delay);

      return () => clearTimeout(timer);
    }
  }, [visibleCount, items, delay]);

  return (
    <>
      {children.map((child, index) => (
        <AnimatePresence key={index}>
          {index < visibleCount && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
            >
              {child}
            </motion.div>
          )}
        </AnimatePresence>
      ))}
    </>
  );
}

// Shimmer effect preloader
export function ShimmerPreloader({ width = '100%', height = '200px' }: { width?: string; height?: string }) {
  return (
    <div
      style={{ width, height }}
      className="relative overflow-hidden bg-gray-200 rounded-lg"
    >
      <motion.div
        animate={{
          x: ['-100%', '100%'],
        }}
        transition={{
          duration: 1.5,
          repeat: Infinity,
          ease: 'linear',
        }}
        className="absolute inset-0 bg-gradient-to-r from-transparent via-white to-transparent opacity-50"
      />
    </div>
  );
}
