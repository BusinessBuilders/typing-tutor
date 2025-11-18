/**
 * Pause/Resume Component
 * Step 205 - Add pause and resume functionality
 */

import { motion, AnimatePresence } from 'framer-motion';
import { useState, useEffect } from 'react';
import { useSettingsStore } from '../store/useSettingsStore';

// Custom hook for pause/resume
export function usePauseResume() {
  const [isPaused, setIsPaused] = useState(false);
  const [pauseStartTime, setPauseStartTime] = useState<number | null>(null);
  const [totalPausedTime, setTotalPausedTime] = useState(0);

  const pause = () => {
    if (!isPaused) {
      setIsPaused(true);
      setPauseStartTime(Date.now());
    }
  };

  const resume = () => {
    if (isPaused && pauseStartTime) {
      const pauseDuration = Date.now() - pauseStartTime;
      setTotalPausedTime((prev) => prev + pauseDuration);
      setPauseStartTime(null);
      setIsPaused(false);
    }
  };

  const toggle = () => {
    if (isPaused) {
      resume();
    } else {
      pause();
    }
  };

  const reset = () => {
    setIsPaused(false);
    setPauseStartTime(null);
    setTotalPausedTime(0);
  };

  return {
    isPaused,
    pause,
    resume,
    toggle,
    reset,
    totalPausedTime,
  };
}

// Main pause/resume component
export default function PauseResume() {
  const { isPaused, toggle, reset, totalPausedTime } = usePauseResume();
  const { settings } = useSettingsStore();
  const [seconds, setSeconds] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      if (!isPaused) {
        setSeconds((s) => s + 1);
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [isPaused]);

  const formatTime = (totalSeconds: number) => {
    const mins = Math.floor(totalSeconds / 60);
    const secs = totalSeconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="bg-white rounded-2xl shadow-xl p-8">
      <h2 className="text-2xl font-bold text-gray-800 mb-6 text-center">
        Pause & Resume
      </h2>

      {/* Timer display */}
      <div className="text-center mb-8">
        <div className="text-6xl font-bold text-gray-900 mb-4">
          {formatTime(seconds)}
        </div>
        <div className="text-sm text-gray-600">
          Paused time: {formatTime(Math.floor(totalPausedTime / 1000))}
        </div>
      </div>

      {/* Pause overlay */}
      <AnimatePresence>
        {isPaused && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="mb-8 bg-yellow-50 border-4 border-yellow-400 rounded-2xl p-8 text-center"
          >
            <motion.div
              animate={{ scale: [1, 1.1, 1] }}
              transition={{ duration: 1, repeat: Infinity }}
              className="text-6xl mb-4"
            >
              ⏸️
            </motion.div>
            <h3 className="text-2xl font-bold text-yellow-900 mb-2">
              Paused
            </h3>
            <p className="text-yellow-800">
              Take your time. Resume when you're ready!
            </p>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Controls */}
      <div className="flex justify-center gap-4 mb-8">
        <motion.button
          onClick={toggle}
          whileHover={{ scale: settings.reducedMotion ? 1 : 1.05 }}
          whileTap={{ scale: 0.95 }}
          className={`px-8 py-4 rounded-xl font-bold text-xl shadow-lg transition-colors ${
            isPaused
              ? 'bg-green-500 hover:bg-green-600 text-white'
              : 'bg-yellow-500 hover:bg-yellow-600 text-white'
          }`}
        >
          {isPaused ? '▶️ Resume' : '⏸️ Pause'}
        </motion.button>

        <button
          onClick={reset}
          className="px-6 py-4 bg-gray-200 text-gray-700 rounded-xl font-bold hover:bg-gray-300 transition-colors"
        >
          🔄 Reset
        </button>
      </div>

      <div className="bg-blue-50 rounded-xl p-6">
        <h3 className="text-lg font-bold text-blue-900 mb-3">
          Pause Anytime
        </h3>
        <ul className="space-y-2 text-sm text-blue-800">
          <li>• Take breaks whenever you need</li>
          <li>• Paused time doesn't count toward your stats</li>
          <li>• Say "pause" or "resume" with voice commands</li>
          <li>• Press Space key to pause (when available)</li>
        </ul>
      </div>
    </div>
  );
}

// Simple pause button
export function PauseButton({ isPaused, onToggle }: { isPaused: boolean; onToggle: () => void }) {
  return (
    <motion.button
      onClick={onToggle}
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      className={`px-6 py-3 rounded-lg font-bold transition-colors shadow-md ${
        isPaused
          ? 'bg-green-500 hover:bg-green-600 text-white'
          : 'bg-yellow-500 hover:bg-yellow-600 text-white'
      }`}
    >
      {isPaused ? '▶️ Resume' : '⏸️ Pause'}
    </motion.button>
  );
}

// Pause overlay component
export function PauseOverlay({ show, onResume }: { show: boolean; onResume: () => void }) {
  const { settings } = useSettingsStore();

  return (
    <AnimatePresence>
      {show && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black bg-opacity-60 z-40 backdrop-blur-sm"
          />

          <div className="fixed inset-0 flex items-center justify-center z-50">
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              className="bg-white rounded-3xl shadow-2xl p-12 text-center max-w-md"
            >
              <motion.div
                animate={{
                  scale: settings.reducedMotion ? 1 : [1, 1.1, 1],
                }}
                transition={{ duration: 1, repeat: Infinity }}
                className="text-9xl mb-6"
              >
                ⏸️
              </motion.div>

              <h2 className="text-4xl font-bold text-gray-900 mb-4">
                Paused
              </h2>

              <p className="text-xl text-gray-600 mb-8">
                Take a break. We'll be here when you're ready!
              </p>

              <button
                onClick={onResume}
                className="px-10 py-5 bg-green-500 text-white rounded-2xl font-bold text-2xl hover:bg-green-600 transition-colors shadow-lg"
              >
                ▶️ Resume
              </button>
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  );
}

// Pause reminder (shows after inactivity)
export function PauseReminder({ inactiveTime, onPause }: { inactiveTime: number; onPause: () => void }) {
  const [show, setShow] = useState(false);

  useEffect(() => {
    if (inactiveTime > 30000) { // 30 seconds of inactivity
      setShow(true);
    } else {
      setShow(false);
    }
  }, [inactiveTime]);

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          initial={{ opacity: 0, y: -50 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -50 }}
          className="fixed top-4 right-4 bg-yellow-500 text-white rounded-xl shadow-2xl p-6 max-w-sm z-50"
        >
          <h3 className="text-lg font-bold mb-2">Need a break?</h3>
          <p className="text-sm mb-4">
            You've been inactive for a while. Would you like to pause?
          </p>

          <div className="flex gap-2">
            <button
              onClick={onPause}
              className="flex-1 py-2 bg-white text-yellow-700 rounded-lg font-bold hover:bg-gray-100 transition-colors"
            >
              Yes, Pause
            </button>
            <button
              onClick={() => setShow(false)}
              className="flex-1 py-2 bg-yellow-600 text-white rounded-lg font-bold hover:bg-yellow-700 transition-colors"
            >
              Keep Going
            </button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
