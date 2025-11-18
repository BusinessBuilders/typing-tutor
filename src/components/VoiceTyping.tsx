/**
 * Voice Typing Component
 * Step 206 - Create voice-to-text typing functionality
 */

import { motion, AnimatePresence } from 'framer-motion';
import { useState, useRef } from 'react';
import { useSettingsStore } from '../store/useSettingsStore';

// Custom hook for voice typing
export function useVoiceTyping() {
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [interimTranscript, setInterimTranscript] = useState('');
  const [supported, setSupported] = useState(true);
  const recognitionRef = useRef<any>(null);

  const start = () => {
    const SpeechRecognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    if (!SpeechRecognition) {
      setSupported(false);
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = 'en-US';

    recognition.onresult = (event: any) => {
      let interim = '';
      let final = transcript;

      for (let i = event.resultIndex; i < event.results.length; i++) {
        const transcriptPiece = event.results[i][0].transcript;
        if (event.results[i].isFinal) {
          final += transcriptPiece + ' ';
        } else {
          interim += transcriptPiece;
        }
      }

      setTranscript(final);
      setInterimTranscript(interim);
    };

    recognition.onerror = (event: any) => {
      console.error('Speech recognition error:', event.error);
      if (event.error === 'not-allowed') {
        setSupported(false);
      }
      stop();
    };

    recognition.onend = () => {
      setIsListening(false);
    };

    recognition.start();
    recognitionRef.current = recognition;
    setIsListening(true);
  };

  const stop = () => {
    if (recognitionRef.current) {
      recognitionRef.current.stop();
    }
    setIsListening(false);
    setInterimTranscript('');
  };

  const clear = () => {
    setTranscript('');
    setInterimTranscript('');
  };

  const deleteLastWord = () => {
    const words = transcript.trim().split(' ');
    words.pop();
    setTranscript(words.join(' ') + (words.length > 0 ? ' ' : ''));
  };

  return {
    isListening,
    transcript,
    interimTranscript,
    supported,
    start,
    stop,
    clear,
    deleteLastWord,
  };
}

// Main voice typing component
export default function VoiceTyping() {
  const {
    isListening,
    transcript,
    interimTranscript,
    supported,
    start,
    stop,
    clear,
    deleteLastWord,
  } = useVoiceTyping();

  const { settings } = useSettingsStore();

  if (!supported) {
    return (
      <div className="bg-white rounded-2xl shadow-xl p-8">
        <div className="text-center text-gray-600">
          Voice typing is not supported in your browser.
          <br />
          Try using Chrome or Edge.
        </div>
      </div>
    );
  }

  const wordCount = transcript.trim() ? transcript.trim().split(/\s+/).length : 0;
  const charCount = transcript.length;

  return (
    <div className="bg-white rounded-2xl shadow-xl p-8">
      <h2 className="text-2xl font-bold text-gray-800 mb-6 text-center">
        Voice Typing
      </h2>

      {/* Main text area */}
      <div className="mb-6 bg-gray-50 rounded-xl p-6 min-h-[300px]">
        <div className="text-xl leading-relaxed">
          {transcript}
          {interimTranscript && (
            <span className="text-gray-400 italic">{interimTranscript}</span>
          )}
          {!transcript && !interimTranscript && (
            <div className="text-gray-400 text-center py-12">
              Click "Start Listening" and speak to begin typing
            </div>
          )}
          {isListening && !interimTranscript && (
            <motion.span
              animate={{ opacity: [0.3, 1, 0.3] }}
              transition={{ duration: 1.5, repeat: Infinity }}
              className="inline-block w-1 h-6 bg-primary-500 ml-1"
            />
          )}
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-4 mb-6">
        <div className="bg-blue-50 rounded-lg p-4 text-center">
          <div className="text-3xl font-bold text-blue-700">{wordCount}</div>
          <div className="text-sm text-gray-600">Words</div>
        </div>
        <div className="bg-purple-50 rounded-lg p-4 text-center">
          <div className="text-3xl font-bold text-purple-700">{charCount}</div>
          <div className="text-sm text-gray-600">Characters</div>
        </div>
      </div>

      {/* Controls */}
      <div className="flex flex-wrap justify-center gap-3 mb-6">
        <motion.button
          onClick={isListening ? stop : start}
          whileHover={{ scale: settings.reducedMotion ? 1 : 1.05 }}
          whileTap={{ scale: 0.95 }}
          className={`px-8 py-4 rounded-xl font-bold text-xl shadow-lg transition-colors ${
            isListening
              ? 'bg-red-500 hover:bg-red-600 text-white animate-pulse'
              : 'bg-primary-500 hover:bg-primary-600 text-white'
          }`}
        >
          {isListening ? '⏹️ Stop' : '🎤 Start Listening'}
        </motion.button>

        <button
          onClick={deleteLastWord}
          disabled={!transcript}
          className="px-6 py-4 bg-yellow-500 text-white rounded-xl font-bold hover:bg-yellow-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          ⌫ Delete Last Word
        </button>

        <button
          onClick={clear}
          disabled={!transcript}
          className="px-6 py-4 bg-red-100 text-red-700 rounded-xl font-bold hover:bg-red-200 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          🗑️ Clear All
        </button>
      </div>

      {/* Listening indicator */}
      <AnimatePresence>
        {isListening && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="text-center mb-6"
          >
            <div className="inline-flex items-center gap-3 px-6 py-3 bg-green-500 text-white rounded-full shadow-lg">
              <motion.div
                animate={{ scale: [1, 1.3, 1] }}
                transition={{ duration: 1, repeat: Infinity }}
                className="w-3 h-3 bg-white rounded-full"
              />
              <span className="font-bold">Listening... Speak now</span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="bg-blue-50 rounded-xl p-6">
        <h3 className="text-lg font-bold text-blue-900 mb-3">
          Voice Typing Tips
        </h3>
        <ul className="space-y-2 text-sm text-blue-800">
          <li>• Speak clearly at a natural pace</li>
          <li>• Say punctuation: "period", "comma", "question mark"</li>
          <li>• Say "new line" to start a new line</li>
          <li>• Works best in a quiet environment</li>
          <li>• Allow microphone access when prompted</li>
        </ul>
      </div>
    </div>
  );
}

// Compact voice typing widget
export function VoiceTypingWidget({ onTranscript }: { onTranscript?: (text: string) => void }) {
  const { isListening, transcript, start, stop } = useVoiceTyping();

  return (
    <div className="bg-white rounded-xl shadow-lg p-4">
      <div className="flex items-center gap-3">
        <button
          onClick={isListening ? stop : start}
          className={`px-4 py-2 rounded-lg font-bold transition-colors ${
            isListening
              ? 'bg-red-500 text-white'
              : 'bg-primary-500 text-white hover:bg-primary-600'
          }`}
        >
          {isListening ? '⏹️' : '🎤'}
        </button>

        <div className="flex-1 text-sm text-gray-700">
          {transcript || 'Click mic to start'}
        </div>

        {transcript && onTranscript && (
          <button
            onClick={() => onTranscript(transcript)}
            className="px-3 py-1 bg-green-500 text-white rounded font-bold text-sm hover:bg-green-600 transition-colors"
          >
            Use
          </button>
        )}
      </div>
    </div>
  );
}
