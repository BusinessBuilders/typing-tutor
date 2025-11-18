/**
 * Voice Feedback Component
 * Step 207 - Build voice feedback system for typing practice
 */

import { useTextToSpeech } from './TextToSpeech';
import { useSuccessSounds } from './SuccessSounds';
import { useErrorSounds } from './ErrorSounds';

// Feedback types
export type FeedbackType =
  | 'correct'
  | 'incorrect'
  | 'encouragement'
  | 'milestone'
  | 'instruction'
  | 'hint';

// Feedback messages
const FEEDBACK_MESSAGES = {
  correct: [
    'Great job!',
    'Well done!',
    'Perfect!',
    'Excellent!',
    'You got it!',
    'Nice work!',
    'Keep it up!',
  ],
  incorrect: [
    'Not quite, try again.',
    'Almost there!',
    'Keep trying!',
    'You can do it!',
    'Give it another try.',
  ],
  encouragement: [
    'You\'re doing amazing!',
    'Keep up the great work!',
    'You\'re improving!',
    'Stay focused!',
    'You\'ve got this!',
  ],
  milestone: [
    'Congratulations! You completed the lesson!',
    'Amazing! You reached a new milestone!',
    'Wonderful progress!',
    'You\'re getting better and better!',
  ],
};

// Custom hook for voice feedback
export function useVoiceFeedback() {
  const { speak } = useTextToSpeech();
  const { playSuccessSequence } = useSuccessSounds();
  const { playErrorSound } = useErrorSounds();

  const giveFeedback = (type: FeedbackType, customMessage?: string) => {
    let message = customMessage;

    if (!message && type in FEEDBACK_MESSAGES) {
      const messages = FEEDBACK_MESSAGES[type as keyof typeof FEEDBACK_MESSAGES];
      message = messages[Math.floor(Math.random() * messages.length)];
    }

    if (message) {
      speak(message);

      // Play accompanying sound
      if (type === 'correct') {
        playSuccessSequence('wordComplete');
      } else if (type === 'incorrect') {
        playErrorSound('gentle');
      } else if (type === 'milestone') {
        playSuccessSequence('levelComplete');
      }
    }
  };

  const giveCorrectFeedback = () => giveFeedback('correct');
  const giveIncorrectFeedback = () => giveFeedback('incorrect');
  const giveEncouragement = () => giveFeedback('encouragement');
  const giveMilestoneFeedback = () => giveFeedback('milestone');

  const announceInstruction = (instruction: string) => {
    speak(instruction);
  };

  const giveHint = (hint: string) => {
    speak(`Hint: ${hint}`);
  };

  return {
    giveFeedback,
    giveCorrectFeedback,
    giveIncorrectFeedback,
    giveEncouragement,
    giveMilestoneFeedback,
    announceInstruction,
    giveHint,
  };
}

// Voice feedback demo component
export default function VoiceFeedback() {
  const {
    giveCorrectFeedback,
    giveIncorrectFeedback,
    giveEncouragement,
    giveMilestoneFeedback,
    announceInstruction,
    giveHint,
  } = useVoiceFeedback();

  const feedbackButtons = [
    {
      label: 'Correct Answer',
      action: giveCorrectFeedback,
      icon: '✅',
      color: 'from-green-400 to-green-500',
    },
    {
      label: 'Incorrect Answer',
      action: giveIncorrectFeedback,
      icon: '❌',
      color: 'from-red-400 to-red-500',
    },
    {
      label: 'Encouragement',
      action: giveEncouragement,
      icon: '💪',
      color: 'from-blue-400 to-blue-500',
    },
    {
      label: 'Milestone',
      action: giveMilestoneFeedback,
      icon: '🏆',
      color: 'from-yellow-400 to-yellow-500',
    },
    {
      label: 'Instruction',
      action: () => announceInstruction('Type the word that appears on the screen.'),
      icon: '📢',
      color: 'from-purple-400 to-purple-500',
    },
    {
      label: 'Hint',
      action: () => giveHint('The letter is on the top row of the keyboard.'),
      icon: '💡',
      color: 'from-orange-400 to-orange-500',
    },
  ];

  return (
    <div className="bg-white rounded-2xl shadow-xl p-8">
      <h2 className="text-2xl font-bold text-gray-800 mb-6 text-center">
        Voice Feedback System
      </h2>

      <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-8">
        {feedbackButtons.map(({ label, action, icon, color }) => (
          <button
            key={label}
            onClick={action}
            className={`p-6 bg-gradient-to-br ${color} text-white rounded-xl hover:opacity-90 transition-opacity shadow-lg`}
          >
            <div className="text-4xl mb-2">{icon}</div>
            <div className="font-bold">{label}</div>
          </button>
        ))}
      </div>

      <div className="bg-blue-50 rounded-xl p-6">
        <h3 className="text-lg font-bold text-blue-900 mb-3">
          Voice Feedback Features
        </h3>
        <ul className="space-y-2 text-sm text-blue-800">
          <li>• Automatic feedback for correct/incorrect answers</li>
          <li>• Randomized encouraging messages</li>
          <li>• Audio cues paired with visual feedback</li>
          <li>• Instructions and hints read aloud</li>
          <li>• Celebration sounds for milestones</li>
        </ul>
      </div>
    </div>
  );
}

// Typing practice with voice feedback
export function TypingWithVoiceFeedback() {
  const { giveCorrectFeedback, giveIncorrectFeedback, announceInstruction } =
    useVoiceFeedback();

  const targetWord = 'cat';
  const [typed, setTyped] = React.useState('');
  const [completed, setCompleted] = React.useState(false);

  React.useEffect(() => {
    announceInstruction(`Type the word: ${targetWord}`);
  }, [announceInstruction]);

  const handleKeyPress = (key: string) => {
    if (completed) return;

    const newTyped = typed + key;

    if (key === targetWord[typed.length]) {
      setTyped(newTyped);
      giveCorrectFeedback();

      if (newTyped === targetWord) {
        setCompleted(true);
        announceInstruction('Great job! Word completed!');
      }
    } else {
      giveIncorrectFeedback();
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-lg p-6">
      <h3 className="text-xl font-bold text-gray-800 mb-4 text-center">
        Type: {targetWord}
      </h3>

      <div className="bg-gray-100 rounded-lg p-6 mb-6 text-center">
        <div className="text-3xl font-mono">
          {typed}
          <span className="animate-pulse">|</span>
        </div>
      </div>

      {!completed && (
        <div className="text-sm text-gray-600 text-center">
          Try typing the word above (demo - click letters below)
        </div>
      )}

      {completed && (
        <div className="bg-green-100 text-green-800 rounded-lg p-4 text-center font-bold">
          ✅ Completed!
        </div>
      )}

      <div className="mt-4 grid grid-cols-4 gap-2">
        {['c', 'a', 't', 'x'].map((letter) => (
          <button
            key={letter}
            onClick={() => handleKeyPress(letter)}
            className="py-3 bg-gray-200 hover:bg-gray-300 rounded-lg font-bold"
          >
            {letter}
          </button>
        ))}
      </div>
    </div>
  );
}

// Import React namespace
import * as React from 'react';
