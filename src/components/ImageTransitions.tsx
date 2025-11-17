/**
 * Image Transitions Component
 * Step 108 - Smooth transitions between images and content
 */

import { motion, AnimatePresence, Variants } from 'framer-motion';
import { ReactNode } from 'react';
import { useSettingsStore } from '../store/useSettingsStore';

export interface TransitionProps {
  children: ReactNode;
  type?: 'fade' | 'slide' | 'zoom' | 'flip' | 'blur';
  direction?: 'left' | 'right' | 'up' | 'down';
  duration?: number;
  delay?: number;
}

export default function ImageTransition({
  children,
  type = 'fade',
  direction = 'right',
  duration = 0.3,
  delay = 0,
}: TransitionProps) {
  const { settings } = useSettingsStore();

  // Disable animations if reduced motion is enabled
  if (settings.reducedMotion) {
    return <>{children}</>;
  }

  const transitions: Record<string, Variants> = {
    fade: {
      initial: { opacity: 0 },
      animate: { opacity: 1 },
      exit: { opacity: 0 },
    },
    slide: {
      initial: {
        opacity: 0,
        x: direction === 'left' ? -100 : direction === 'right' ? 100 : 0,
        y: direction === 'up' ? -100 : direction === 'down' ? 100 : 0,
      },
      animate: { opacity: 1, x: 0, y: 0 },
      exit: {
        opacity: 0,
        x: direction === 'left' ? 100 : direction === 'right' ? -100 : 0,
        y: direction === 'up' ? 100 : direction === 'down' ? -100 : 0,
      },
    },
    zoom: {
      initial: { opacity: 0, scale: 0.8 },
      animate: { opacity: 1, scale: 1 },
      exit: { opacity: 0, scale: 0.8 },
    },
    flip: {
      initial: { opacity: 0, rotateY: 90 },
      animate: { opacity: 1, rotateY: 0 },
      exit: { opacity: 0, rotateY: -90 },
    },
    blur: {
      initial: { opacity: 0, filter: 'blur(10px)' },
      animate: { opacity: 1, filter: 'blur(0px)' },
      exit: { opacity: 0, filter: 'blur(10px)' },
    },
  };

  const variants = transitions[type];

  return (
    <motion.div
      variants={variants}
      initial="initial"
      animate="animate"
      exit="exit"
      transition={{ duration, delay }}
    >
      {children}
    </motion.div>
  );
}

// Crossfade between two images
export function ImageCrossfade({
  currentImage,
  nextImage: _nextImage,
  alt,
  className = '',
}: {
  currentImage: string;
  nextImage: string;
  alt: string;
  className?: string;
}) {
  const { settings } = useSettingsStore();

  return (
    <div className={`relative ${className}`}>
      <AnimatePresence mode="wait">
        <motion.img
          key={currentImage}
          src={currentImage}
          alt={alt}
          initial={{ opacity: settings.reducedMotion ? 1 : 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: settings.reducedMotion ? 1 : 0 }}
          transition={{ duration: 0.5 }}
          className="w-full h-full object-cover"
        />
      </AnimatePresence>
    </div>
  );
}

// Staggered list transitions
export function StaggeredList({
  children,
  staggerDelay = 0.1,
}: {
  children: ReactNode[];
  staggerDelay?: number;
}) {
  const { settings } = useSettingsStore();

  if (settings.reducedMotion) {
    return <>{children}</>;
  }

  return (
    <>
      {children.map((child, index) => (
        <motion.div
          key={index}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: index * staggerDelay }}
        >
          {child}
        </motion.div>
      ))}
    </>
  );
}

// Page transitions
export function PageTransition({
  children,
  type = 'slide',
  direction = 'right',
}: TransitionProps) {
  return (
    <AnimatePresence mode="wait">
      <ImageTransition type={type} direction={direction} duration={0.4}>
        {children}
      </ImageTransition>
    </AnimatePresence>
  );
}

// Card flip transition
export function CardFlip({
  front,
  back,
  isFlipped,
}: {
  front: ReactNode;
  back: ReactNode;
  isFlipped: boolean;
}) {
  const { settings } = useSettingsStore();

  return (
    <div className="relative w-full h-full" style={{ perspective: '1000px' }}>
      <AnimatePresence mode="wait">
        {!isFlipped ? (
          <motion.div
            key="front"
            initial={{ rotateY: settings.reducedMotion ? 0 : -90 }}
            animate={{ rotateY: 0 }}
            exit={{ rotateY: settings.reducedMotion ? 0 : 90 }}
            transition={{ duration: 0.6 }}
            className="absolute inset-0 backface-hidden"
            style={{ backfaceVisibility: 'hidden' }}
          >
            {front}
          </motion.div>
        ) : (
          <motion.div
            key="back"
            initial={{ rotateY: settings.reducedMotion ? 0 : 90 }}
            animate={{ rotateY: 0 }}
            exit={{ rotateY: settings.reducedMotion ? 0 : -90 }}
            transition={{ duration: 0.6 }}
            className="absolute inset-0 backface-hidden"
            style={{ backfaceVisibility: 'hidden' }}
          >
            {back}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// Morph transition between shapes
export function MorphTransition({
  from,
  to,
  isTransformed,
}: {
  from: ReactNode;
  to: ReactNode;
  isTransformed: boolean;
}) {
  const { settings } = useSettingsStore();

  return (
    <AnimatePresence mode="wait">
      {!isTransformed ? (
        <motion.div
          key="from"
          initial={{ scale: settings.reducedMotion ? 1 : 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: settings.reducedMotion ? 1 : 1.2, opacity: 0 }}
          transition={{ duration: 0.4 }}
        >
          {from}
        </motion.div>
      ) : (
        <motion.div
          key="to"
          initial={{ scale: settings.reducedMotion ? 1 : 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: settings.reducedMotion ? 1 : 1.2, opacity: 0 }}
          transition={{ duration: 0.4 }}
        >
          {to}
        </motion.div>
      )}
    </AnimatePresence>
  );
}

// Reveal transition (curtain effect)
export function RevealTransition({
  children,
  direction = 'right',
}: {
  children: ReactNode;
  direction?: 'left' | 'right' | 'up' | 'down';
}) {
  const { settings } = useSettingsStore();

  const clipPath = {
    left: { initial: 'inset(0 100% 0 0)', animate: 'inset(0 0% 0 0)' },
    right: { initial: 'inset(0 0 0 100%)', animate: 'inset(0 0% 0 0%)' },
    up: { initial: 'inset(100% 0 0 0)', animate: 'inset(0% 0 0 0)' },
    down: { initial: 'inset(0 0 100% 0)', animate: 'inset(0 0 0% 0)' },
  };

  if (settings.reducedMotion) {
    return <div>{children}</div>;
  }

  return (
    <motion.div
      initial={{ clipPath: clipPath[direction].initial }}
      animate={{ clipPath: clipPath[direction].animate }}
      transition={{ duration: 0.6, ease: 'easeInOut' }}
    >
      {children}
    </motion.div>
  );
}
