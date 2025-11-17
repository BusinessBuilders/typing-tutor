/**
 * Animation Utilities for Autism-Friendly UI
 * Provides gentle, predictable animations with reduced motion support
 */

import { Variants, Transition } from 'framer-motion';

// Check if user prefers reduced motion
export const prefersReducedMotion = (): boolean => {
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
};

// Default transition settings (gentle and predictable)
export const defaultTransition: Transition = {
  duration: 0.3,
  ease: 'easeInOut',
};

// Gentle transition (slower, calmer)
export const gentleTransition: Transition = {
  duration: 0.5,
  ease: [0.4, 0, 0.2, 1], // Custom cubic bezier for smooth feel
};

// Quick transition
export const quickTransition: Transition = {
  duration: 0.2,
  ease: 'easeOut',
};

/**
 * Fade in animation
 */
export const fadeIn: Variants = {
  hidden: {
    opacity: 0,
  },
  visible: {
    opacity: 1,
    transition: gentleTransition,
  },
  exit: {
    opacity: 0,
    transition: quickTransition,
  },
};

/**
 * Fade and slide up animation
 */
export const fadeSlideUp: Variants = {
  hidden: {
    opacity: 0,
    y: 20,
  },
  visible: {
    opacity: 1,
    y: 0,
    transition: gentleTransition,
  },
  exit: {
    opacity: 0,
    y: -20,
    transition: quickTransition,
  },
};

/**
 * Fade and slide down animation
 */
export const fadeSlideDown: Variants = {
  hidden: {
    opacity: 0,
    y: -20,
  },
  visible: {
    opacity: 1,
    y: 0,
    transition: gentleTransition,
  },
  exit: {
    opacity: 0,
    y: 20,
    transition: quickTransition,
  },
};

/**
 * Scale in animation (gentle pop)
 */
export const scaleIn: Variants = {
  hidden: {
    opacity: 0,
    scale: 0.95,
  },
  visible: {
    opacity: 1,
    scale: 1,
    transition: gentleTransition,
  },
  exit: {
    opacity: 0,
    scale: 0.95,
    transition: quickTransition,
  },
};

/**
 * Celebration animation (for achievements)
 */
export const celebration: Variants = {
  hidden: {
    opacity: 0,
    scale: 0.8,
    rotate: -10,
  },
  visible: {
    opacity: 1,
    scale: 1,
    rotate: 0,
    transition: {
      duration: 0.6,
      ease: 'easeOut',
    },
  },
  exit: {
    opacity: 0,
    scale: 0.8,
    transition: quickTransition,
  },
};

/**
 * Gentle bounce animation
 */
export const gentleBounce: Variants = {
  animate: {
    y: [0, -10, 0],
    transition: {
      duration: 2,
      repeat: Infinity,
      ease: 'easeInOut',
    },
  },
};

/**
 * Slow pulse animation (for hints/attention)
 */
export const slowPulse: Variants = {
  animate: {
    scale: [1, 1.05, 1],
    opacity: [1, 0.8, 1],
    transition: {
      duration: 3,
      repeat: Infinity,
      ease: 'easeInOut',
    },
  },
};

/**
 * Stagger children animation
 */
export const staggerChildren: Variants = {
  visible: {
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.1,
    },
  },
};

/**
 * Letter typing animation (for typing display)
 */
export const letterReveal: Variants = {
  hidden: {
    opacity: 0,
    y: 10,
  },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.2,
    },
  },
};

/**
 * Success indicator animation
 */
export const successPulse: Variants = {
  initial: {
    scale: 1,
  },
  animate: {
    scale: [1, 1.2, 1],
    transition: {
      duration: 0.4,
      times: [0, 0.5, 1],
    },
  },
};

/**
 * Error shake animation (very gentle for autism-friendly)
 */
export const gentleShake: Variants = {
  animate: {
    x: [0, -5, 5, -5, 5, 0],
    transition: {
      duration: 0.5,
    },
  },
};

/**
 * Page transition variants
 */
export const pageTransition: Variants = {
  initial: {
    opacity: 0,
    x: -20,
  },
  animate: {
    opacity: 1,
    x: 0,
    transition: gentleTransition,
  },
  exit: {
    opacity: 0,
    x: 20,
    transition: quickTransition,
  },
};

/**
 * Modal overlay animation
 */
export const modalOverlay: Variants = {
  hidden: {
    opacity: 0,
  },
  visible: {
    opacity: 1,
    transition: defaultTransition,
  },
  exit: {
    opacity: 0,
    transition: quickTransition,
  },
};

/**
 * Modal content animation
 */
export const modalContent: Variants = {
  hidden: {
    opacity: 0,
    scale: 0.95,
    y: 20,
  },
  visible: {
    opacity: 1,
    scale: 1,
    y: 0,
    transition: gentleTransition,
  },
  exit: {
    opacity: 0,
    scale: 0.95,
    y: 20,
    transition: quickTransition,
  },
};

/**
 * Get animation variants based on reduced motion preference
 * If reduced motion is preferred, return minimal animations
 */
export function getAnimationVariants(variants: Variants): Variants {
  if (prefersReducedMotion()) {
    // Return no animation variants
    return {
      hidden: {},
      visible: {},
      exit: {},
    };
  }
  return variants;
}

/**
 * Get transition based on reduced motion preference
 */
export function getTransition(transition: Transition): Transition {
  if (prefersReducedMotion()) {
    return {
      duration: 0.01, // Essentially instant
    };
  }
  return transition;
}

export default {
  fadeIn,
  fadeSlideUp,
  fadeSlideDown,
  scaleIn,
  celebration,
  gentleBounce,
  slowPulse,
  staggerChildren,
  letterReveal,
  successPulse,
  gentleShake,
  pageTransition,
  modalOverlay,
  modalContent,
  defaultTransition,
  gentleTransition,
  quickTransition,
  getAnimationVariants,
  getTransition,
  prefersReducedMotion,
};
