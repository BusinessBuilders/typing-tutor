/**
 * Success Sounds Component
 * Step 192 - Build success sounds for achievements and completions
 */

import { motion } from 'framer-motion';
import { useSoundEffects } from './SoundEffects';
import { useSettingsStore } from '../store/useSettingsStore';

// Success sound types
export type SuccessType =
  | 'wordComplete'
  | 'sentenceComplete'
  | 'levelComplete'
  | 'perfectAccuracy'
  | 'speedGoal'
  | 'streakMilestone'
  | 'firstTime'
  | 'personalBest';

// Multi-tone success sequences
const SUCCESS_SEQUENCES = {
  wordComplete: [
    { frequency: 523.25, duration: 80 }, // C5
    { frequency: 659.25, duration: 80 }, // E5
  ],
  sentenceComplete: [
    { frequency: 523.25, duration: 80 }, // C5
    { frequency: 659.25, duration: 80 }, // E5
    { frequency: 783.99, duration: 120 }, // G5
  ],
  levelComplete: [
    { frequency: 523.25, duration: 100 }, // C5
    { frequency: 659.25, duration: 100 }, // E5
    { frequency: 783.99, duration: 100 }, // G5
    { frequency: 1046.5, duration: 200 }, // C6
  ],
  perfectAccuracy: [
    { frequency: 659.25, duration: 100 }, // E5
    { frequency: 783.99, duration: 100 }, // G5
    { frequency: 1046.5, duration: 100 }, // C6
    { frequency: 1318.5, duration: 200 }, // E6
  ],
  speedGoal: [
    { frequency: 440, duration: 60 }, // A4
    { frequency: 554.37, duration: 60 }, // C#5
    { frequency: 659.25, duration: 60 }, // E5
    { frequency: 880, duration: 150 }, // A5
  ],
  streakMilestone: [
    { frequency: 523.25, duration: 80 },
    { frequency: 659.25, duration: 80 },
    { frequency: 783.99, duration: 80 },
    { frequency: 1046.5, duration: 80 },
    { frequency: 1318.5, duration: 150 },
  ],
  firstTime: [
    { frequency: 392, duration: 100 }, // G4
    { frequency: 494, duration: 100 }, // B4
    { frequency: 587.33, duration: 100 }, // D5
    { frequency: 783.99, duration: 200 }, // G5
  ],
  personalBest: [
    { frequency: 523.25, duration: 100 },
    { frequency: 698.46, duration: 100 },
    { frequency: 880, duration: 100 },
    { frequency: 1174.7, duration: 200 },
  ],
};

// Custom hook for success sounds
export function useSuccessSounds() {
  const { playSound } = useSoundEffects();
  const { settings } = useSettingsStore();

  const playSuccessSequence = async (type: SuccessType) => {
    if (!settings.soundEnabled) return;

    const sequence = SUCCESS_SEQUENCES[type];
    let delay = 0;

    sequence.forEach((note) => {
      setTimeout(() => {
        playSound('success', {
          frequency: note.frequency,
          duration: note.duration,
        });
      }, delay);
      delay += note.duration + 20; // Small gap between notes
    });
  };

  return { playSuccessSequence };
}

// Success sound demo component
export default function SuccessSounds() {
  const { playSuccessSequence } = useSuccessSounds();
  const { settings } = useSettingsStore();

  const successTypes: Array<{ type: SuccessType; label: string; icon: string }> = [
    { type: 'wordComplete', label: 'Word Complete', icon: '✓' },
    { type: 'sentenceComplete', label: 'Sentence Complete', icon: '✓✓' },
    { type: 'levelComplete', label: 'Level Complete', icon: '🎯' },
    { type: 'perfectAccuracy', label: 'Perfect!', icon: '⭐' },
    { type: 'speedGoal', label: 'Speed Goal', icon: '⚡' },
    { type: 'streakMilestone', label: 'Streak!', icon: '🔥' },
    { type: 'firstTime', label: 'First Time', icon: '🎊' },
    { type: 'personalBest', label: 'Personal Best', icon: '🏆' },
  ];

  return (
    <div className="bg-white rounded-2xl shadow-xl p-8">
      <h2 className="text-2xl font-bold text-gray-800 mb-6 text-center">
        Success Sounds
      </h2>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {successTypes.map(({ type, label, icon }, index) => (
          <motion.button
            key={type}
            onClick={() => playSuccessSequence(type)}
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: settings.reducedMotion ? 0 : index * 0.05 }}
            whileHover={{ scale: settings.reducedMotion ? 1 : 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="flex flex-col items-center justify-center p-6 bg-gradient-to-br from-green-100 to-green-200 hover:from-green-200 hover:to-green-300 rounded-xl shadow-md transition-colors"
          >
            <div className="text-4xl mb-2">{icon}</div>
            <div className="text-sm font-bold text-green-900 text-center">
              {label}
            </div>
          </motion.button>
        ))}
      </div>

      <div className="mt-8 bg-green-50 rounded-xl p-6">
        <h3 className="text-lg font-bold text-green-900 mb-3">
          Success Sound Descriptions
        </h3>
        <ul className="space-y-2 text-sm text-green-800">
          <li><strong>Word Complete:</strong> Two-note ascending melody</li>
          <li><strong>Sentence Complete:</strong> Three-note major chord</li>
          <li><strong>Level Complete:</strong> Four-note triumphant fanfare</li>
          <li><strong>Perfect Accuracy:</strong> High ascending melody</li>
          <li><strong>Speed Goal:</strong> Quick ascending arpeggio</li>
          <li><strong>Streak Milestone:</strong> Five-note celebration</li>
          <li><strong>First Time:</strong> Warm welcoming melody</li>
          <li><strong>Personal Best:</strong> Bright victory fanfare</li>
        </ul>
      </div>
    </div>
  );
}

// Success celebration with sound
export function SuccessCelebration({
  type,
  message,
}: {
  type: SuccessType;
  message: string;
}) {
  const { playSuccessSequence } = useSuccessSounds();
  const { settings } = useSettingsStore();

  const icons = {
    wordComplete: '✓',
    sentenceComplete: '✓✓',
    levelComplete: '🎯',
    perfectAccuracy: '⭐',
    speedGoal: '⚡',
    streakMilestone: '🔥',
    firstTime: '🎊',
    personalBest: '🏆',
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.8, y: 20 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.8, y: -20 }}
      onAnimationStart={() => playSuccessSequence(type)}
      className="bg-gradient-to-br from-green-400 to-green-600 text-white rounded-2xl shadow-2xl p-8 text-center"
    >
      <motion.div
        initial={{ scale: 0 }}
        animate={{ scale: 1, rotate: settings.reducedMotion ? 0 : 360 }}
        transition={{ delay: 0.2, duration: settings.reducedMotion ? 0.3 : 0.6 }}
        className="text-8xl mb-4"
      >
        {icons[type]}
      </motion.div>

      <h2 className="text-3xl font-bold mb-2">{message}</h2>
    </motion.div>
  );
}

// Inline success feedback
export function InlineSuccessFeedback({
  show,
  type = 'wordComplete',
}: {
  show: boolean;
  type?: SuccessType;
}) {
  const { playSuccessSequence } = useSuccessSounds();

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0 }}
      animate={{
        opacity: show ? 1 : 0,
        scale: show ? 1 : 0,
      }}
      onAnimationStart={() => {
        if (show) playSuccessSequence(type);
      }}
      className="inline-flex items-center gap-2 px-4 py-2 bg-green-500 text-white rounded-full font-bold shadow-lg"
    >
      <span className="text-xl">✓</span>
      <span>Correct!</span>
    </motion.div>
  );
}

// Success popup notification
export function SuccessNotification({
  title,
  description,
  type = 'wordComplete',
  onClose,
}: {
  title: string;
  description?: string;
  type?: SuccessType;
  onClose?: () => void;
}) {
  const { playSuccessSequence } = useSuccessSounds();

  return (
    <motion.div
      initial={{ opacity: 0, x: 300 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 300 }}
      onAnimationStart={() => playSuccessSequence(type)}
      className="fixed top-4 right-4 bg-white rounded-xl shadow-2xl p-6 max-w-sm border-l-4 border-green-500"
    >
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-3">
          <div className="text-4xl">🎉</div>
          <div>
            <h3 className="text-lg font-bold text-gray-900">{title}</h3>
            {description && (
              <p className="text-sm text-gray-600 mt-1">{description}</p>
            )}
          </div>
        </div>
        {onClose && (
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 text-xl"
          >
            ×
          </button>
        )}
      </div>
    </motion.div>
  );
}
