/**
 * Word Highlighting Component
 * Step 184 - Highlight words as they are spoken
 */

import { motion } from 'framer-motion';
import { useState, useEffect } from 'react';

export interface WordHighlightingProps {
  text: string;
  highlightedIndex?: number;
  onWordClick?: (index: number) => void;
}

export default function WordHighlighting({
  text,
  highlightedIndex = -1,
  onWordClick,
}: WordHighlightingProps) {
  const words = text.split(' ');

  return (
    <div className="bg-white rounded-2xl shadow-xl p-8">
      <h2 className="text-2xl font-bold text-gray-800 mb-6 text-center">
        Read Along
      </h2>

      <div className="bg-gray-50 rounded-xl p-8">
        <div className="text-3xl leading-relaxed flex flex-wrap gap-2">
          {words.map((word, index) => (
            <motion.span
              key={index}
              onClick={() => onWordClick?.(index)}
              animate={{
                backgroundColor: index === highlightedIndex ? '#3B82F6' : 'transparent',
                color: index === highlightedIndex ? '#FFFFFF' : '#1F2937',
                scale: index === highlightedIndex ? 1.1 : 1,
              }}
              transition={{ duration: 0.2 }}
              className="px-2 py-1 rounded cursor-pointer hover:bg-gray-200"
            >
              {word}
            </motion.span>
          ))}
        </div>
      </div>
    </div>
  );
}

// Auto-highlighting text reader
export function AutoHighlightReader({ text }: { text: string }) {
  const [currentWord, setCurrentWord] = useState(-1);
  const [isPlaying, setIsPlaying] = useState(false);
  const words = text.split(' ');

  useEffect(() => {
    if (!isPlaying) return;

    const interval = setInterval(() => {
      setCurrentWord((prev) => {
        if (prev >= words.length - 1) {
          setIsPlaying(false);
          return -1;
        }
        return prev + 1;
      });
    }, 500); // Highlight each word for 500ms

    return () => clearInterval(interval);
  }, [isPlaying, words.length]);

  return (
    <div className="bg-white rounded-2xl shadow-xl p-8">
      <WordHighlighting text={text} highlightedIndex={currentWord} />

      <div className="mt-6 flex justify-center gap-4">
        <button
          onClick={() => setIsPlaying(!isPlaying)}
          className="px-6 py-3 bg-primary-500 text-white rounded-lg font-bold hover:bg-primary-600 transition-colors"
        >
          {isPlaying ? 'Pause' : 'Start'} Reading
        </button>
        <button
          onClick={() => {
            setIsPlaying(false);
            setCurrentWord(-1);
          }}
          className="px-6 py-3 bg-gray-200 text-gray-700 rounded-lg font-bold hover:bg-gray-300 transition-colors"
        >
          Reset
        </button>
      </div>
    </div>
  );
}
