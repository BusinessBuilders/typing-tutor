/**
 * Text Display Component
 * Step 131 - Customizable text display for typing practice
 */

import { motion } from 'framer-motion';
import { ReactNode } from 'react';
import { useSettingsStore } from '../store/useSettingsStore';

export interface TextDisplayProps {
  children: ReactNode;
  variant?: 'default' | 'large-print' | 'dyslexia-friendly' | 'high-contrast';
  align?: 'left' | 'center' | 'right' | 'justify';
  lineHeight?: 'tight' | 'normal' | 'relaxed' | 'loose';
  maxWidth?: string;
  backgroundColor?: string;
  padding?: 'none' | 'small' | 'medium' | 'large';
  rounded?: boolean;
  shadow?: boolean;
}

export default function TextDisplay({
  children,
  variant = 'default',
  align = 'left',
  lineHeight = 'relaxed',
  maxWidth = '100%',
  backgroundColor = 'bg-white',
  padding = 'large',
  rounded = true,
  shadow = true,
}: TextDisplayProps) {
  const { settings } = useSettingsStore();

  const variants = {
    default: {
      fontSize: 'text-2xl',
      fontWeight: 'font-normal',
      letterSpacing: 'tracking-normal',
    },
    'large-print': {
      fontSize: 'text-4xl',
      fontWeight: 'font-medium',
      letterSpacing: 'tracking-wide',
    },
    'dyslexia-friendly': {
      fontSize: 'text-3xl',
      fontWeight: 'font-bold',
      letterSpacing: 'tracking-wider',
    },
    'high-contrast': {
      fontSize: 'text-3xl',
      fontWeight: 'font-bold',
      letterSpacing: 'tracking-normal',
    },
  };

  const lineHeights = {
    tight: 'leading-tight',
    normal: 'leading-normal',
    relaxed: 'leading-relaxed',
    loose: 'leading-loose',
  };

  const alignments = {
    left: 'text-left',
    center: 'text-center',
    right: 'text-right',
    justify: 'text-justify',
  };

  const paddings = {
    none: '',
    small: 'p-4',
    medium: 'p-6',
    large: 'p-8',
  };

  const variantStyles = variants[variant];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: settings.reducedMotion ? 0 : 0.3 }}
      className={`
        ${backgroundColor}
        ${paddings[padding]}
        ${rounded ? 'rounded-2xl' : ''}
        ${shadow ? 'shadow-xl' : ''}
        ${variantStyles.fontSize}
        ${variantStyles.fontWeight}
        ${variantStyles.letterSpacing}
        ${lineHeights[lineHeight]}
        ${alignments[align]}
        transition-all duration-300
      `}
      style={{ maxWidth }}
    >
      {children}
    </motion.div>
  );
}

// Focused text display (highlights current line/sentence)
export function FocusedTextDisplay({
  lines,
  currentLine,
  dimOthers = true,
}: {
  lines: string[];
  currentLine: number;
  dimOthers?: boolean;
}) {
  const { settings } = useSettingsStore();

  return (
    <TextDisplay variant="large-print" padding="large">
      <div className="space-y-4">
        {lines.map((line, index) => {
          const isCurrent = index === currentLine;
          const isPast = index < currentLine;
          const isFuture = index > currentLine;

          return (
            <motion.div
              key={index}
              initial={{ opacity: 0, x: -20 }}
              animate={{
                opacity: dimOthers && !isCurrent ? 0.3 : 1,
                x: 0,
                scale: isCurrent ? 1.05 : 1,
              }}
              transition={{
                duration: settings.reducedMotion ? 0 : 0.3,
              }}
              className={`
                transition-all duration-300
                ${isCurrent ? 'bg-yellow-50 p-4 rounded-lg border-l-4 border-primary-500' : ''}
                ${isPast ? 'text-success-600' : ''}
                ${isFuture ? 'text-gray-600' : ''}
              `}
            >
              {line}
            </motion.div>
          );
        })}
      </div>
    </TextDisplay>
  );
}

// Reading ruler (helps track line being read)
export function ReadingRuler({
  children,
  rulerPosition,
  rulerHeight = 60,
  rulerColor = 'bg-yellow-200',
}: {
  children: ReactNode;
  rulerPosition: number; // Y position in pixels
  rulerHeight?: number;
  rulerColor?: string;
}) {
  return (
    <div className="relative">
      {/* Reading ruler overlay */}
      <motion.div
        animate={{ top: rulerPosition }}
        transition={{ duration: 0.2 }}
        className={`absolute left-0 right-0 ${rulerColor} opacity-30 pointer-events-none z-10`}
        style={{ height: rulerHeight }}
      />

      {/* Content */}
      <div className="relative z-0">{children}</div>
    </div>
  );
}

// Distraction-free display
export function DistractionFreeDisplay({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-purple-50 flex items-center justify-center p-8">
      <div className="max-w-4xl w-full">
        <TextDisplay
          variant="large-print"
          align="center"
          backgroundColor="bg-white"
          padding="large"
          rounded={true}
          shadow={true}
        >
          {children}
        </TextDisplay>
      </div>
    </div>
  );
}

// Progressive reveal display (shows text gradually)
export function ProgressiveRevealDisplay({
  text,
  revealedCount,
  revealSpeed = 'medium',
}: {
  text: string;
  revealedCount: number;
  revealSpeed?: 'slow' | 'medium' | 'fast';
}) {
  const { settings } = useSettingsStore();

  const speeds = {
    slow: 0.1,
    medium: 0.05,
    fast: 0.02,
  };

  return (
    <TextDisplay variant="large-print" align="center">
      <div className="flex flex-wrap justify-center gap-1">
        {text.split('').map((char, index) => {
          const isRevealed = index < revealedCount;

          return (
            <motion.span
              key={index}
              initial={{ opacity: 0, scale: 0 }}
              animate={{
                opacity: isRevealed ? 1 : 0,
                scale: isRevealed ? 1 : 0,
              }}
              transition={{
                duration: settings.reducedMotion ? 0 : 0.3,
                delay: settings.reducedMotion ? 0 : index * speeds[revealSpeed],
              }}
              className="inline-block"
            >
              {char === ' ' ? '\u00A0' : char}
            </motion.span>
          );
        })}
      </div>
    </TextDisplay>
  );
}

// Word cloud display (for word recognition)
export function WordCloudDisplay({
  words,
  highlightedWord,
}: {
  words: string[];
  highlightedWord?: string;
}) {
  const { settings } = useSettingsStore();

  return (
    <TextDisplay variant="default" align="center" padding="large">
      <div className="flex flex-wrap justify-center gap-4">
        {words.map((word, index) => {
          const isHighlighted = word === highlightedWord;

          return (
            <motion.div
              key={index}
              initial={{ opacity: 0, scale: 0 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{
                duration: settings.reducedMotion ? 0 : 0.3,
                delay: settings.reducedMotion ? 0 : index * 0.05,
              }}
              whileHover={{ scale: settings.reducedMotion ? 1 : 1.1 }}
              className={`
                px-6 py-3 rounded-xl font-bold text-2xl
                transition-all cursor-pointer
                ${
                  isHighlighted
                    ? 'bg-primary-500 text-white shadow-lg scale-110'
                    : 'bg-gray-100 text-gray-800 hover:bg-gray-200'
                }
              `}
            >
              {word}
            </motion.div>
          );
        })}
      </div>
    </TextDisplay>
  );
}

// Split-screen display (visual prompt + text)
export function SplitScreenDisplay({
  imageUrl,
  text,
  imagePosition = 'left',
}: {
  imageUrl: string;
  text: string;
  imagePosition?: 'left' | 'right' | 'top' | 'bottom';
}) {
  const isHorizontal = imagePosition === 'left' || imagePosition === 'right';

  return (
    <div
      className={`
      grid gap-6 h-full
      ${isHorizontal ? 'grid-cols-2' : 'grid-rows-2'}
    `}
    >
      {/* Image */}
      <div
        className={`
        ${imagePosition === 'right' || imagePosition === 'bottom' ? 'order-2' : 'order-1'}
      `}
      >
        <div className="h-full bg-gray-100 rounded-2xl overflow-hidden shadow-xl">
          <img
            src={imageUrl}
            alt="Visual prompt"
            className="w-full h-full object-cover"
          />
        </div>
      </div>

      {/* Text */}
      <div
        className={`
        ${imagePosition === 'right' || imagePosition === 'bottom' ? 'order-1' : 'order-2'}
        flex items-center justify-center
      `}
      >
        <TextDisplay variant="large-print" align="center" maxWidth="100%">
          <div className="text-6xl font-bold text-gray-800">{text}</div>
        </TextDisplay>
      </div>
    </div>
  );
}
