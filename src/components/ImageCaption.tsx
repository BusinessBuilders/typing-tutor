/**
 * Image Caption Component
 * Step 106 - Accessible captions with text-to-speech support
 */

import { motion } from 'framer-motion';
import { useState } from 'react';
import { useSettingsStore } from '../store/useSettingsStore';

export interface ImageCaptionProps {
  text: string;
  subtext?: string;
  position?: 'top' | 'bottom' | 'overlay';
  showSpeaker?: boolean;
  onSpeak?: () => void;
  size?: 'small' | 'medium' | 'large';
}

export default function ImageCaption({
  text,
  subtext,
  position = 'bottom',
  showSpeaker = true,
  onSpeak,
  size = 'medium',
}: ImageCaptionProps) {
  const [isSpeaking, setIsSpeaking] = useState(false);
  const { settings } = useSettingsStore();

  const sizes = {
    small: { text: 'text-sm', subtext: 'text-xs' },
    medium: { text: 'text-base', subtext: 'text-sm' },
    large: { text: 'text-lg', subtext: 'text-base' },
  };

  const sizeClasses = sizes[size];

  const handleSpeak = () => {
    if (onSpeak) {
      setIsSpeaking(true);
      onSpeak();
      setTimeout(() => setIsSpeaking(false), 1000);
    }
  };

  const positionClasses = {
    top: 'rounded-t-lg',
    bottom: 'rounded-b-lg',
    overlay: 'rounded-lg',
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: position === 'bottom' ? 10 : -10 }}
      animate={{ opacity: 1, y: 0 }}
      className={`
        ${position === 'overlay' ? 'absolute inset-x-0 bottom-0' : ''}
        bg-gradient-to-r from-primary-600 to-primary-700 text-white p-4
        ${positionClasses[position]}
        shadow-lg
      `}
    >
      <div className="flex items-center justify-between">
        <div className="flex-1">
          <p className={`${sizeClasses.text} font-medium`}>{text}</p>
          {subtext && (
            <p className={`${sizeClasses.subtext} opacity-90 mt-1`}>{subtext}</p>
          )}
        </div>

        {showSpeaker && onSpeak && (
          <motion.button
            whileHover={{ scale: settings.reducedMotion ? 1 : 1.1 }}
            whileTap={{ scale: settings.reducedMotion ? 1 : 0.9 }}
            onClick={handleSpeak}
            className={`ml-4 w-10 h-10 bg-white bg-opacity-20 rounded-full flex items-center justify-center hover:bg-opacity-30 transition-colors ${
              isSpeaking ? 'animate-pulse' : ''
            }`}
          >
            <span className="text-xl">{isSpeaking ? '🔊' : '🔉'}</span>
          </motion.button>
        )}
      </div>
    </motion.div>
  );
}

// Simple caption (no background)
export function SimpleCaption({ text, className = '' }: { text: string; className?: string }) {
  return (
    <motion.p
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className={`text-gray-700 text-center ${className}`}
    >
      {text}
    </motion.p>
  );
}

// Speech bubble caption
export function SpeechBubbleCaption({ text }: { text: string }) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      className="relative bg-white rounded-2xl p-4 shadow-lg max-w-xs"
    >
      <p className="text-gray-800">{text}</p>
      {/* Tail */}
      <div className="absolute -bottom-2 left-8 w-4 h-4 bg-white transform rotate-45" />
    </motion.div>
  );
}

// Animated typing caption
export function TypingCaption({ text }: { text: string }) {
  const [displayText, setDisplayText] = useState('');
  const [isComplete, setIsComplete] = useState(false);

  useState(() => {
    let currentIndex = 0;
    const interval = setInterval(() => {
      if (currentIndex < text.length) {
        setDisplayText(text.slice(0, currentIndex + 1));
        currentIndex++;
      } else {
        setIsComplete(true);
        clearInterval(interval);
      }
    }, 50);

    return () => clearInterval(interval);
  });

  return (
    <div className="bg-gray-100 rounded-lg p-4 font-mono">
      <p className="text-gray-800">
        {displayText}
        {!isComplete && <span className="animate-pulse">|</span>}
      </p>
    </div>
  );
}

// Caption with icon
export function IconCaption({
  icon,
  text,
  color = 'blue',
}: {
  icon: string;
  text: string;
  color?: 'blue' | 'green' | 'purple' | 'orange';
}) {
  const colors = {
    blue: 'from-blue-500 to-blue-600',
    green: 'from-green-500 to-green-600',
    purple: 'from-purple-500 to-purple-600',
    orange: 'from-orange-500 to-orange-600',
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className={`bg-gradient-to-r ${colors[color]} text-white rounded-lg p-4 flex items-center space-x-3 shadow-md`}
    >
      <span className="text-3xl">{icon}</span>
      <p className="text-lg font-medium">{text}</p>
    </motion.div>
  );
}
