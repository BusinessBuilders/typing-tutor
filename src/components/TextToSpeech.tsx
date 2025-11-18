/**
 * Text-to-Speech Component
 * Step 181 - Implement TTS for all text
 */

import { motion } from 'framer-motion';
import { useState, useEffect, useCallback } from 'react';
import { useSettingsStore } from '../store/useSettingsStore';

// TTS hook for browser speech synthesis
export function useTextToSpeech() {
  const [speaking, setSpeaking] = useState(false);
  const [supported, setSupported] = useState(false);

  useEffect(() => {
    setSupported('speechSynthesis' in window);
  }, []);

  const speak = useCallback((text: string, options?: {
    rate?: number;
    pitch?: number;
    volume?: number;
    voice?: SpeechSynthesisVoice;
  }) => {
    if (!supported) return;

    // Cancel any ongoing speech
    window.speechSynthesis.cancel();

    const utterance = new SpeechSynthesisUtterance(text);

    if (options?.rate) utterance.rate = options.rate;
    if (options?.pitch) utterance.pitch = options.pitch;
    if (options?.volume) utterance.volume = options.volume;
    if (options?.voice) utterance.voice = options.voice;

    utterance.onstart = () => setSpeaking(true);
    utterance.onend = () => setSpeaking(false);
    utterance.onerror = () => setSpeaking(false);

    window.speechSynthesis.speak(utterance);
  }, [supported]);

  const stop = useCallback(() => {
    if (supported) {
      window.speechSynthesis.cancel();
      setSpeaking(false);
    }
  }, [supported]);

  const pause = useCallback(() => {
    if (supported) {
      window.speechSynthesis.pause();
    }
  }, [supported]);

  const resume = useCallback(() => {
    if (supported) {
      window.speechSynthesis.resume();
    }
  }, [supported]);

  return {
    speak,
    stop,
    pause,
    resume,
    speaking,
    supported,
  };
}

// Text-to-Speech Button Component
export interface TTSButtonProps {
  text: string;
  className?: string;
  autoPlay?: boolean;
  rate?: number;
  pitch?: number;
}

export default function TTSButton({
  text,
  className = '',
  autoPlay = false,
  rate = 1,
  pitch = 1,
}: TTSButtonProps) {
  const { settings } = useSettingsStore();
  const { speak, stop, speaking, supported } = useTextToSpeech();

  useEffect(() => {
    if (autoPlay && text) {
      speak(text, { rate, pitch });
    }
  }, [autoPlay, text, speak, rate, pitch]);

  const handleClick = () => {
    if (speaking) {
      stop();
    } else {
      speak(text, { rate, pitch });
    }
  };

  if (!supported) {
    return null;
  }

  return (
    <motion.button
      onClick={handleClick}
      whileHover={{ scale: settings.reducedMotion ? 1 : 1.05 }}
      whileTap={{ scale: settings.reducedMotion ? 1 : 0.95 }}
      className={`flex items-center gap-2 px-4 py-2 rounded-lg font-bold transition-colors ${
        speaking
          ? 'bg-red-500 text-white hover:bg-red-600'
          : 'bg-primary-500 text-white hover:bg-primary-600'
      } ${className}`}
    >
      <span className="text-xl">{speaking ? '🔇' : '🔊'}</span>
      <span>{speaking ? 'Stop' : 'Listen'}</span>
    </motion.button>
  );
}

// Read text aloud component
export function ReadAloud({
  text,
  title,
  rate = 1,
}: {
  text: string;
  title?: string;
  rate?: number;
}) {
  const { settings } = useSettingsStore();
  const { speak, stop, pause, resume, speaking, supported } = useTextToSpeech();

  if (!supported) {
    return (
      <div className="bg-yellow-50 rounded-xl p-6 text-center">
        <div className="text-yellow-900">
          Text-to-speech is not supported in your browser.
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl shadow-xl p-8">
      {title && (
        <h2 className="text-2xl font-bold text-gray-800 mb-6 text-center">
          {title}
        </h2>
      )}

      {/* Text to read */}
      <div className="bg-blue-50 rounded-xl p-6 mb-6">
        <div className="text-lg leading-relaxed text-gray-900">
          {text}
        </div>
      </div>

      {/* Controls */}
      <div className="flex justify-center gap-4">
        <motion.button
          onClick={() => speak(text, { rate })}
          disabled={speaking}
          whileHover={{ scale: !speaking && !settings.reducedMotion ? 1.05 : 1 }}
          className="px-6 py-3 bg-primary-500 text-white rounded-lg font-bold hover:bg-primary-600 disabled:opacity-50 transition-colors"
        >
          <span className="text-xl mr-2">▶️</span>
          Play
        </motion.button>

        <motion.button
          onClick={pause}
          disabled={!speaking}
          whileHover={{ scale: speaking && !settings.reducedMotion ? 1.05 : 1 }}
          className="px-6 py-3 bg-yellow-500 text-white rounded-lg font-bold hover:bg-yellow-600 disabled:opacity-50 transition-colors"
        >
          <span className="text-xl mr-2">⏸️</span>
          Pause
        </motion.button>

        <motion.button
          onClick={resume}
          disabled={!speaking}
          whileHover={{ scale: speaking && !settings.reducedMotion ? 1.05 : 1 }}
          className="px-6 py-3 bg-green-500 text-white rounded-lg font-bold hover:bg-green-600 disabled:opacity-50 transition-colors"
        >
          <span className="text-xl mr-2">▶️</span>
          Resume
        </motion.button>

        <motion.button
          onClick={stop}
          disabled={!speaking}
          whileHover={{ scale: speaking && !settings.reducedMotion ? 1.05 : 1 }}
          className="px-6 py-3 bg-red-500 text-white rounded-lg font-bold hover:bg-red-600 disabled:opacity-50 transition-colors"
        >
          <span className="text-xl mr-2">⏹️</span>
          Stop
        </motion.button>
      </div>

      {/* Status */}
      {speaking && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mt-6 text-center"
        >
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-primary-100 text-primary-900 rounded-lg">
            <span className="animate-pulse">🔊</span>
            <span className="font-medium">Reading aloud...</span>
          </div>
        </motion.div>
      )}
    </div>
  );
}

// Letter pronunciation component
export function LetterPronunciation({ letter }: { letter: string }) {
  const { speak, speaking } = useTextToSpeech();

  return (
    <motion.button
      onClick={() => speak(letter)}
      disabled={speaking}
      whileHover={{ scale: !speaking ? 1.1 : 1 }}
      whileTap={{ scale: !speaking ? 0.95 : 1 }}
      className="w-20 h-20 bg-gradient-to-br from-blue-500 to-indigo-600 text-white rounded-xl font-bold text-4xl hover:from-blue-600 hover:to-indigo-700 transition-all shadow-lg disabled:opacity-50"
    >
      {letter.toUpperCase()}
    </motion.button>
  );
}

// Word pronunciation component
export function WordPronunciation({
  word,
  showPhonetic = false,
}: {
  word: string;
  showPhonetic?: boolean;
}) {
  const { speak, speaking } = useTextToSpeech();

  return (
    <div className="bg-white rounded-xl shadow-lg p-6 text-center">
      <div className="text-4xl font-bold text-gray-900 mb-4">{word}</div>

      {showPhonetic && (
        <div className="text-sm text-gray-600 mb-4 italic">
          {/* Phonetic pronunciation would go here */}
          /{word}/
        </div>
      )}

      <motion.button
        onClick={() => speak(word)}
        disabled={speaking}
        whileHover={{ scale: !speaking ? 1.05 : 1 }}
        className="px-6 py-3 bg-primary-500 text-white rounded-lg font-bold hover:bg-primary-600 disabled:opacity-50 transition-colors"
      >
        <span className="text-xl mr-2">🔊</span>
        Hear it
      </motion.button>
    </div>
  );
}

// Sentence reader with auto-play
export function SentenceReader({
  sentence,
  autoPlay = false,
}: {
  sentence: string;
  autoPlay?: boolean;
}) {
  const { speak, stop, speaking } = useTextToSpeech();

  useEffect(() => {
    if (autoPlay) {
      speak(sentence);
    }

    return () => {
      stop();
    };
  }, [sentence, autoPlay, speak, stop]);

  return (
    <div className="bg-gradient-to-br from-purple-500 to-pink-600 rounded-xl p-6 text-center">
      <div className="text-2xl font-medium text-white mb-4">
        {sentence}
      </div>

      <div className="flex justify-center gap-4">
        <button
          onClick={() => speak(sentence)}
          disabled={speaking}
          className="px-4 py-2 bg-white text-purple-700 rounded-lg font-bold hover:bg-gray-100 disabled:opacity-50 transition-colors"
        >
          🔊 Listen
        </button>

        {speaking && (
          <button
            onClick={stop}
            className="px-4 py-2 bg-red-500 text-white rounded-lg font-bold hover:bg-red-600 transition-colors"
          >
            ⏹️ Stop
          </button>
        )}
      </div>
    </div>
  );
}

// Interactive TTS demo
export function TTSDemo() {
  const [text, setText] = useState('Hello! I can read any text you type here.');
  const { speak, stop, speaking, supported } = useTextToSpeech();

  if (!supported) {
    return (
      <div className="bg-white rounded-2xl shadow-xl p-8">
        <div className="text-center text-red-600">
          Text-to-speech is not supported in your browser.
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl shadow-xl p-8">
      <h2 className="text-2xl font-bold text-gray-800 mb-6 text-center">
        Text-to-Speech Demo
      </h2>

      {/* Text input */}
      <div className="mb-6">
        <label className="block text-sm font-bold text-gray-700 mb-2">
          Enter text to read aloud:
        </label>
        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          rows={4}
          className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-primary-500 focus:outline-none text-lg"
          placeholder="Type something..."
        />
      </div>

      {/* Controls */}
      <div className="flex justify-center gap-4">
        <button
          onClick={() => speak(text)}
          disabled={!text || speaking}
          className="px-8 py-4 bg-primary-500 text-white rounded-xl font-bold text-xl hover:bg-primary-600 disabled:opacity-50 transition-colors shadow-lg"
        >
          <span className="mr-2">🔊</span>
          Read Aloud
        </button>

        {speaking && (
          <button
            onClick={stop}
            className="px-8 py-4 bg-red-500 text-white rounded-xl font-bold text-xl hover:bg-red-600 transition-colors shadow-lg"
          >
            <span className="mr-2">⏹️</span>
            Stop
          </button>
        )}
      </div>

      {/* Speaking indicator */}
      {speaking && (
        <motion.div
          initial={{ opacity: 0, scale: 0 }}
          animate={{ opacity: 1, scale: 1 }}
          className="mt-6 text-center"
        >
          <div className="inline-flex items-center gap-3 px-6 py-3 bg-primary-100 text-primary-900 rounded-full">
            <span className="text-2xl animate-pulse">🎤</span>
            <span className="font-bold">Speaking...</span>
          </div>
        </motion.div>
      )}
    </div>
  );
}
