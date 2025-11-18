/**
 * Repeat Function Component
 * Step 203 - Create repeat/replay functionality for audio
 */

import { motion } from 'framer-motion';
import { useState, useRef, useEffect } from 'react';
import { useTextToSpeech } from './TextToSpeech';
import { useSettingsStore } from '../store/useSettingsStore';

// Repeat history item
interface RepeatHistoryItem {
  id: string;
  text: string;
  timestamp: Date;
  count: number;
}

// Custom hook for repeat functionality
export function useRepeatFunction() {
  const { speak } = useTextToSpeech();
  const [history, setHistory] = useState<RepeatHistoryItem[]>([]);
  const lastSpokenRef = useRef<string>('');

  // Speak and add to history
  const speakAndRemember = (text: string) => {
    speak(text);
    lastSpokenRef.current = text;

    // Update or add to history
    setHistory((prev) => {
      const existing = prev.find((item) => item.text === text);
      if (existing) {
        return prev.map((item) =>
          item.text === text
            ? { ...item, count: item.count + 1, timestamp: new Date() }
            : item
        );
      } else {
        return [
          ...prev,
          {
            id: Date.now().toString(),
            text,
            timestamp: new Date(),
            count: 1,
          },
        ];
      }
    });
  };

  // Repeat last spoken text
  const repeatLast = () => {
    if (lastSpokenRef.current) {
      speakAndRemember(lastSpokenRef.current);
    }
  };

  // Repeat specific text from history
  const repeatFromHistory = (text: string) => {
    speakAndRemember(text);
  };

  // Clear history
  const clearHistory = () => {
    setHistory([]);
    lastSpokenRef.current = '';
  };

  return {
    speakAndRemember,
    repeatLast,
    repeatFromHistory,
    clearHistory,
    history,
    lastSpoken: lastSpokenRef.current,
  };
}

// Main repeat function component
export default function RepeatFunction() {
  const {
    speakAndRemember,
    repeatLast,
    repeatFromHistory,
    clearHistory,
    history,
    lastSpoken,
  } = useRepeatFunction();

  const { settings } = useSettingsStore();
  const [testText, setTestText] = useState('This is a test message.');

  return (
    <div className="bg-white rounded-2xl shadow-xl p-8">
      <h2 className="text-2xl font-bold text-gray-800 mb-6 text-center">
        Repeat Function
      </h2>

      {/* Test area */}
      <div className="mb-8 bg-gray-50 rounded-xl p-6">
        <h3 className="text-lg font-bold text-gray-900 mb-4">
          Try It Out
        </h3>

        <div className="mb-4">
          <input
            type="text"
            value={testText}
            onChange={(e) => setTestText(e.target.value)}
            className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-primary-500 focus:outline-none text-lg"
            placeholder="Enter text to speak..."
          />
        </div>

        <div className="flex gap-3">
          <button
            onClick={() => speakAndRemember(testText)}
            className="flex-1 py-3 bg-primary-500 text-white rounded-lg font-bold hover:bg-primary-600 transition-colors"
          >
            🔊 Speak
          </button>

          <button
            onClick={repeatLast}
            disabled={!lastSpoken}
            className="flex-1 py-3 bg-green-500 text-white rounded-lg font-bold hover:bg-green-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            🔁 Repeat Last
          </button>
        </div>
      </div>

      {/* Last spoken */}
      {lastSpoken && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-6 bg-blue-50 rounded-xl p-6"
        >
          <div className="flex items-start justify-between mb-2">
            <h3 className="text-lg font-bold text-blue-900">Last Spoken:</h3>
            <button
              onClick={repeatLast}
              className="px-4 py-2 bg-blue-500 text-white rounded-lg font-bold text-sm hover:bg-blue-600 transition-colors"
            >
              🔁 Repeat
            </button>
          </div>
          <div className="text-blue-800 text-lg italic">"{lastSpoken}"</div>
        </motion.div>
      )}

      {/* History */}
      {history.length > 0 && (
        <div className="bg-gray-50 rounded-xl p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-bold text-gray-900">
              Repeat History ({history.length})
            </h3>
            <button
              onClick={clearHistory}
              className="px-4 py-2 bg-red-100 text-red-700 rounded-lg font-bold text-sm hover:bg-red-200 transition-colors"
            >
              Clear All
            </button>
          </div>

          <div className="space-y-2 max-h-96 overflow-y-auto">
            {history.slice(-10).reverse().map((item, index) => (
              <motion.div
                key={item.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: settings.reducedMotion ? 0 : index * 0.05 }}
                className="flex items-center justify-between p-4 bg-white rounded-lg shadow-sm"
              >
                <div className="flex-1">
                  <div className="text-gray-900 mb-1">{item.text}</div>
                  <div className="flex items-center gap-4 text-xs text-gray-500">
                    <span>Repeated {item.count}x</span>
                    <span>{item.timestamp.toLocaleTimeString()}</span>
                  </div>
                </div>

                <button
                  onClick={() => repeatFromHistory(item.text)}
                  className="ml-4 px-4 py-2 bg-primary-100 text-primary-700 rounded-lg font-bold hover:bg-primary-200 transition-colors"
                >
                  🔁
                </button>
              </motion.div>
            ))}
          </div>
        </div>
      )}

      {history.length === 0 && !lastSpoken && (
        <div className="text-center text-gray-500 py-12">
          No speech history yet. Try speaking something above!
        </div>
      )}

      <div className="mt-8 bg-purple-50 rounded-xl p-6">
        <h3 className="text-lg font-bold text-purple-900 mb-3">
          How Repeat Works
        </h3>
        <ul className="space-y-2 text-sm text-purple-800">
          <li>• Click "Speak" to read text aloud</li>
          <li>• Click "Repeat Last" to hear it again</li>
          <li>• History tracks all spoken messages</li>
          <li>• Click 🔁 on any history item to repeat it</li>
          <li>• Counter shows how many times repeated</li>
        </ul>
      </div>
    </div>
  );
}

// Quick repeat button
export function RepeatButton({ text }: { text: string }) {
  const { speak } = useTextToSpeech();

  return (
    <motion.button
      onClick={() => speak(text)}
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      className="px-4 py-2 bg-green-500 text-white rounded-lg font-bold hover:bg-green-600 transition-colors"
    >
      🔁 Repeat
    </motion.button>
  );
}

// Inline repeat icon
export function InlineRepeatButton({ text }: { text: string }) {
  const { speak } = useTextToSpeech();

  return (
    <button
      onClick={() => speak(text)}
      className="inline-flex items-center justify-center w-8 h-8 bg-green-100 text-green-700 rounded-full hover:bg-green-200 transition-colors"
      title="Repeat"
    >
      🔁
    </button>
  );
}

// Repeat with count
export function RepeatCounter({ text, max = 5 }: { text: string; max?: number }) {
  const { speak } = useTextToSpeech();
  const [count, setCount] = useState(0);

  const handleRepeat = () => {
    if (count < max) {
      speak(text);
      setCount(count + 1);
    }
  };

  const reset = () => setCount(0);

  return (
    <div className="inline-flex items-center gap-2 bg-white rounded-lg shadow-md p-3">
      <button
        onClick={handleRepeat}
        disabled={count >= max}
        className="px-4 py-2 bg-green-500 text-white rounded-lg font-bold hover:bg-green-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
      >
        🔁 Repeat ({count}/{max})
      </button>

      {count > 0 && (
        <button
          onClick={reset}
          className="px-3 py-2 bg-gray-200 text-gray-700 rounded-lg font-bold hover:bg-gray-300 transition-colors"
        >
          Reset
        </button>
      )}
    </div>
  );
}

// Auto-repeat (loops)
export function AutoRepeat({
  text,
  interval = 3000,
  enabled = false,
}: {
  text: string;
  interval?: number;
  enabled?: boolean;
}) {
  const { speak } = useTextToSpeech();

  useEffect(() => {
    if (!enabled) return;

    const timer = setInterval(() => {
      speak(text);
    }, interval);

    return () => clearInterval(timer);
  }, [text, interval, enabled, speak]);

  return null;
}

// Repeat with options
export function RepeatWithOptions({ text }: { text: string }) {
  const { speak } = useTextToSpeech();
  const [rate, setRate] = useState(1);
  const [times, setTimes] = useState(1);

  const handleRepeat = () => {
    for (let i = 0; i < times; i++) {
      setTimeout(() => {
        speak(text, { rate });
      }, i * 1500);
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-lg p-6">
      <h3 className="text-lg font-bold text-gray-800 mb-4">
        Repeat with Options
      </h3>

      <div className="space-y-4 mb-4">
        <div>
          <label className="block text-sm font-bold text-gray-700 mb-2">
            Speed: {rate.toFixed(1)}x
          </label>
          <input
            type="range"
            min="0.5"
            max="2"
            step="0.1"
            value={rate}
            onChange={(e) => setRate(parseFloat(e.target.value))}
            className="w-full"
          />
        </div>

        <div>
          <label className="block text-sm font-bold text-gray-700 mb-2">
            Times: {times}
          </label>
          <input
            type="range"
            min="1"
            max="5"
            step="1"
            value={times}
            onChange={(e) => setTimes(parseInt(e.target.value))}
            className="w-full"
          />
        </div>
      </div>

      <div className="bg-gray-50 rounded-lg p-4 mb-4">
        <div className="text-gray-900 italic">"{text}"</div>
      </div>

      <button
        onClick={handleRepeat}
        className="w-full py-3 bg-green-500 text-white rounded-lg font-bold hover:bg-green-600 transition-colors"
      >
        🔁 Repeat {times} time{times > 1 ? 's' : ''} at {rate.toFixed(1)}x speed
      </button>
    </div>
  );
}
