/**
 * Read Aloud Feature Component
 * Step 202 - Add comprehensive read aloud functionality
 */

import { motion } from 'framer-motion';
import { useState, useRef, useEffect } from 'react';
import { useTextToSpeech } from './TextToSpeech';
import { useSettingsStore } from '../store/useSettingsStore';

// Read aloud modes
export type ReadAloudMode = 'full' | 'word' | 'sentence' | 'line';

// Custom hook for read aloud
export function useReadAloud(text: string) {
  const { speak, stop, pause, resume, speaking } = useTextToSpeech();
  const [mode, setMode] = useState<ReadAloudMode>('full');
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  // Read entire text
  const readFull = () => {
    speak(text);
  };

  // Read word by word
  const readWordByWord = () => {
    const words = text.split(' ');
    let index = 0;

    const readNext = () => {
      if (index < words.length && !isPaused) {
        setCurrentIndex(index);
        speak(words[index]);
        index++;
        setTimeout(readNext, 800); // Pause between words
      } else if (index >= words.length) {
        setCurrentIndex(-1);
      }
    };

    readNext();
  };

  // Read sentence by sentence
  const readSentenceBySentence = () => {
    const sentences = text.match(/[^.!?]+[.!?]+/g) || [text];
    let index = 0;

    const readNext = () => {
      if (index < sentences.length && !isPaused) {
        speak(sentences[index].trim());
        index++;
        setTimeout(readNext, 1500); // Pause between sentences
      }
    };

    readNext();
  };

  // Read line by line
  const readLineByLine = () => {
    const lines = text.split('\n').filter((line) => line.trim());
    let index = 0;

    const readNext = () => {
      if (index < lines.length && !isPaused) {
        speak(lines[index].trim());
        index++;
        setTimeout(readNext, 1200); // Pause between lines
      }
    };

    readNext();
  };

  // Start reading based on mode
  const startReading = () => {
    stop(); // Stop any ongoing speech
    setIsPaused(false);
    setCurrentIndex(0);

    switch (mode) {
      case 'full':
        readFull();
        break;
      case 'word':
        readWordByWord();
        break;
      case 'sentence':
        readSentenceBySentence();
        break;
      case 'line':
        readLineByLine();
        break;
    }
  };

  // Pause reading
  const pauseReading = () => {
    setIsPaused(true);
    pause();
  };

  // Resume reading
  const resumeReading = () => {
    setIsPaused(false);
    resume();
  };

  // Stop reading
  const stopReading = () => {
    stop();
    setCurrentIndex(-1);
    setIsPaused(false);
  };

  useEffect(() => {
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
      stop();
    };
  }, [stop]);

  return {
    startReading,
    pauseReading,
    resumeReading,
    stopReading,
    mode,
    setMode,
    currentIndex,
    isPaused,
    isSpeaking: speaking,
  };
}

// Main read aloud component
export default function ReadAloudFeature() {
  const [text, setText] = useState(
    'Welcome to the Autism Typing Tutor! This app helps you learn to type in a fun and supportive way. You can practice letters, words, and sentences at your own pace.'
  );

  const {
    startReading,
    pauseReading,
    resumeReading,
    stopReading,
    mode,
    setMode,
    isPaused,
    isSpeaking,
  } = useReadAloud(text);

  const { settings } = useSettingsStore();

  const modes: Array<{ value: ReadAloudMode; label: string; icon: string }> = [
    { value: 'full', label: 'Read All', icon: '📖' },
    { value: 'word', label: 'Word by Word', icon: '📝' },
    { value: 'sentence', label: 'Sentence', icon: '📄' },
    { value: 'line', label: 'Line by Line', icon: '📃' },
  ];

  return (
    <div className="bg-white rounded-2xl shadow-xl p-8">
      <h2 className="text-2xl font-bold text-gray-800 mb-6 text-center">
        Read Aloud
      </h2>

      {/* Text input */}
      <div className="mb-6">
        <label className="block text-sm font-bold text-gray-700 mb-2">
          Enter text to read aloud:
        </label>
        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:border-primary-500 focus:outline-none resize-none text-lg"
          rows={6}
          placeholder="Type or paste text here..."
        />
      </div>

      {/* Mode selection */}
      <div className="mb-6">
        <label className="block text-sm font-bold text-gray-700 mb-3">
          Reading Mode:
        </label>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {modes.map(({ value, label, icon }, index) => (
            <motion.button
              key={value}
              onClick={() => setMode(value)}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: settings.reducedMotion ? 0 : index * 0.05 }}
              whileHover={{ scale: settings.reducedMotion ? 1 : 1.05 }}
              className={`p-4 rounded-xl font-bold transition-all ${
                mode === value
                  ? 'bg-primary-500 text-white shadow-lg ring-4 ring-primary-200'
                  : 'bg-gray-100 text-gray-900 hover:bg-gray-200'
              }`}
            >
              <div className="text-2xl mb-1">{icon}</div>
              <div className="text-sm">{label}</div>
            </motion.button>
          ))}
        </div>
      </div>

      {/* Controls */}
      <div className="flex flex-wrap justify-center gap-4 mb-6">
        {!isSpeaking ? (
          <button
            onClick={startReading}
            className="px-8 py-4 bg-green-500 text-white rounded-xl font-bold text-lg hover:bg-green-600 transition-colors shadow-lg"
          >
            ▶️ Start Reading
          </button>
        ) : (
          <>
            {!isPaused ? (
              <button
                onClick={pauseReading}
                className="px-8 py-4 bg-yellow-500 text-white rounded-xl font-bold text-lg hover:bg-yellow-600 transition-colors shadow-lg"
              >
                ⏸️ Pause
              </button>
            ) : (
              <button
                onClick={resumeReading}
                className="px-8 py-4 bg-blue-500 text-white rounded-xl font-bold text-lg hover:bg-blue-600 transition-colors shadow-lg"
              >
                ▶️ Resume
              </button>
            )}

            <button
              onClick={stopReading}
              className="px-8 py-4 bg-red-500 text-white rounded-xl font-bold text-lg hover:bg-red-600 transition-colors shadow-lg"
            >
              ⏹️ Stop
            </button>
          </>
        )}
      </div>

      {/* Status */}
      {isSpeaking && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-6"
        >
          <div className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-full shadow-lg">
            <motion.span
              animate={{ scale: [1, 1.2, 1] }}
              transition={{ duration: 1, repeat: Infinity }}
            >
              🔊
            </motion.span>
            <span className="font-bold">
              {isPaused ? 'Paused' : `Reading ${mode}...`}
            </span>
          </div>
        </motion.div>
      )}

      {/* Tips */}
      <div className="bg-blue-50 rounded-xl p-6">
        <h3 className="text-lg font-bold text-blue-900 mb-3">
          Reading Mode Tips
        </h3>
        <ul className="space-y-2 text-sm text-blue-800">
          <li><strong>Read All:</strong> Reads the entire text at once</li>
          <li><strong>Word by Word:</strong> Pauses briefly between each word</li>
          <li><strong>Sentence:</strong> Pauses between sentences for better comprehension</li>
          <li><strong>Line by Line:</strong> Reads one line at a time</li>
        </ul>
      </div>
    </div>
  );
}

// Simple read button component
export function ReadButton({ text, icon = '🔊' }: { text: string; icon?: string }) {
  const { speak, speaking } = useTextToSpeech();

  return (
    <motion.button
      onClick={() => speak(text)}
      disabled={speaking}
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      className="px-4 py-2 bg-primary-500 text-white rounded-lg font-bold hover:bg-primary-600 disabled:opacity-50 transition-colors"
    >
      <span className="mr-2">{icon}</span>
      Read Aloud
    </motion.button>
  );
}

// Inline read button (icon only)
export function InlineReadButton({ text }: { text: string }) {
  const { speak, speaking } = useTextToSpeech();

  return (
    <button
      onClick={() => speak(text)}
      disabled={speaking}
      className="inline-flex items-center justify-center w-8 h-8 bg-blue-100 text-blue-700 rounded-full hover:bg-blue-200 disabled:opacity-50 transition-colors"
      title="Read aloud"
    >
      🔊
    </button>
  );
}

// Auto-read on mount
export function AutoRead({ text, delay = 500 }: { text: string; delay?: number }) {
  const { speak } = useTextToSpeech();

  useEffect(() => {
    const timer = setTimeout(() => {
      speak(text);
    }, delay);

    return () => clearTimeout(timer);
  }, [text, delay, speak]);

  return null;
}
