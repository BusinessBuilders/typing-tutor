/**
 * Guided Tutorials Component
 * Step 208 - Add guided step-by-step tutorials with voice
 */

import { motion, AnimatePresence } from 'framer-motion';
import { useState, useEffect } from 'react';
import { useTextToSpeech } from './TextToSpeech';
import { useSettingsStore } from '../store/useSettingsStore';

// Tutorial step interface
interface TutorialStep {
  id: string;
  title: string;
  instruction: string;
  voiceInstruction: string;
  image?: string;
  hint?: string;
  action?: 'click' | 'type' | 'observe';
}

// Tutorial interface
interface Tutorial {
  id: string;
  title: string;
  description: string;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  steps: TutorialStep[];
}

// Sample tutorials
const TUTORIALS: Tutorial[] = [
  {
    id: 'first-letters',
    title: 'Your First Letters',
    description: 'Learn to type your first letters on the keyboard',
    difficulty: 'beginner',
    steps: [
      {
        id: 'step1',
        title: 'Welcome',
        instruction: 'Let\'s learn to type! We\'ll start with finding the home row keys.',
        voiceInstruction: 'Welcome! Let\'s learn to type together. We will start with finding the home row keys on your keyboard.',
        action: 'observe',
      },
      {
        id: 'step2',
        title: 'Home Row Position',
        instruction: 'Place your fingers on the home row: ASDF for left hand, JKL; for right hand.',
        voiceInstruction: 'Place your left fingers on A, S, D, F. Place your right fingers on J, K, L, semicolon.',
        hint: 'Feel the bumps on F and J - these help you find home!',
        action: 'observe',
      },
      {
        id: 'step3',
        title: 'Type Letter F',
        instruction: 'Press the F key with your left index finger.',
        voiceInstruction: 'Now, press the F key with your left index finger.',
        action: 'type',
      },
      {
        id: 'step4',
        title: 'Type Letter J',
        instruction: 'Press the J key with your right index finger.',
        voiceInstruction: 'Great! Now press the J key with your right index finger.',
        action: 'type',
      },
      {
        id: 'step5',
        title: 'Congratulations!',
        instruction: 'You typed your first letters! Keep practicing to get better.',
        voiceInstruction: 'Congratulations! You typed your first letters. Keep practicing to get even better!',
        action: 'observe',
      },
    ],
  },
  {
    id: 'first-word',
    title: 'Type Your First Word',
    description: 'Learn to type a complete word',
    difficulty: 'beginner',
    steps: [
      {
        id: 'step1',
        title: 'Introduction',
        instruction: 'Now that you know some letters, let\'s type a whole word!',
        voiceInstruction: 'Now that you know some letters, let\'s type a whole word together!',
        action: 'observe',
      },
      {
        id: 'step2',
        title: 'The Word "CAT"',
        instruction: 'We\'ll type the word "cat". It uses three letters: C, A, T.',
        voiceInstruction: 'We will type the word cat. It uses three letters: C, A, T.',
        action: 'observe',
      },
      {
        id: 'step3',
        title: 'Type C',
        instruction: 'Type the letter C.',
        voiceInstruction: 'First, type the letter C.',
        action: 'type',
      },
      {
        id: 'step4',
        title: 'Type A',
        instruction: 'Type the letter A.',
        voiceInstruction: 'Next, type the letter A.',
        action: 'type',
      },
      {
        id: 'step5',
        title: 'Type T',
        instruction: 'Type the letter T.',
        voiceInstruction: 'Finally, type the letter T.',
        action: 'type',
      },
      {
        id: 'step6',
        title: 'Success!',
        instruction: 'You did it! You typed your first word!',
        voiceInstruction: 'Amazing! You did it! You typed your first word!',
        action: 'observe',
      },
    ],
  },
];

// Custom hook for tutorial
export function useGuidedTutorial(tutorial: Tutorial) {
  const { speak } = useTextToSpeech();
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [isComplete, setIsComplete] = useState(false);

  const currentStep = tutorial.steps[currentStepIndex];
  const progress = ((currentStepIndex + 1) / tutorial.steps.length) * 100;

  const readCurrentStep = () => {
    if (currentStep) {
      speak(currentStep.voiceInstruction);
      if (currentStep.hint) {
        setTimeout(() => {
          speak(currentStep.hint!);
        }, 3000);
      }
    }
  };

  const nextStep = () => {
    if (currentStepIndex < tutorial.steps.length - 1) {
      setCurrentStepIndex(currentStepIndex + 1);
    } else {
      setIsComplete(true);
      speak('Tutorial complete! Great job!');
    }
  };

  const previousStep = () => {
    if (currentStepIndex > 0) {
      setCurrentStepIndex(currentStepIndex - 1);
    }
  };

  const restart = () => {
    setCurrentStepIndex(0);
    setIsComplete(false);
  };

  return {
    currentStep,
    currentStepIndex,
    totalSteps: tutorial.steps.length,
    progress,
    isComplete,
    readCurrentStep,
    nextStep,
    previousStep,
    restart,
  };
}

// Main guided tutorial component
export default function GuidedTutorials() {
  const [selectedTutorial, setSelectedTutorial] = useState<Tutorial | null>(null);
  const { settings } = useSettingsStore();

  if (selectedTutorial) {
    return <TutorialRunner tutorial={selectedTutorial} onExit={() => setSelectedTutorial(null)} />;
  }

  return (
    <div className="bg-white rounded-2xl shadow-xl p-8">
      <h2 className="text-2xl font-bold text-gray-800 mb-6 text-center">
        Guided Tutorials
      </h2>

      <div className="space-y-4">
        {TUTORIALS.map((tutorial, index) => (
          <motion.button
            key={tutorial.id}
            onClick={() => setSelectedTutorial(tutorial)}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: settings.reducedMotion ? 0 : index * 0.1 }}
            whileHover={{ scale: settings.reducedMotion ? 1 : 1.02 }}
            className="w-full bg-gradient-to-r from-purple-50 to-pink-50 hover:from-purple-100 hover:to-pink-100 rounded-xl p-6 text-left transition-all shadow-md"
          >
            <div className="flex items-start justify-between mb-2">
              <h3 className="text-xl font-bold text-gray-900">{tutorial.title}</h3>
              <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                tutorial.difficulty === 'beginner'
                  ? 'bg-green-100 text-green-700'
                  : tutorial.difficulty === 'intermediate'
                  ? 'bg-yellow-100 text-yellow-700'
                  : 'bg-red-100 text-red-700'
              }`}>
                {tutorial.difficulty}
              </span>
            </div>
            <p className="text-gray-600 mb-2">{tutorial.description}</p>
            <div className="text-sm text-gray-500">{tutorial.steps.length} steps</div>
          </motion.button>
        ))}
      </div>

      <div className="mt-8 bg-blue-50 rounded-xl p-6">
        <h3 className="text-lg font-bold text-blue-900 mb-3">
          Tutorial Features
        </h3>
        <ul className="space-y-2 text-sm text-blue-800">
          <li>• Step-by-step voice guidance</li>
          <li>• Visual instructions with images</li>
          <li>• Helpful hints along the way</li>
          <li>• Progress tracking</li>
          <li>• Repeat any step as needed</li>
        </ul>
      </div>
    </div>
  );
}

// Tutorial runner component
function TutorialRunner({ tutorial, onExit }: { tutorial: Tutorial; onExit: () => void }) {
  const {
    currentStep,
    currentStepIndex,
    totalSteps,
    progress,
    isComplete,
    readCurrentStep,
    nextStep,
    previousStep,
    restart,
  } = useGuidedTutorial(tutorial);

  const { settings } = useSettingsStore();

  useEffect(() => {
    readCurrentStep();
  }, [currentStepIndex]);

  if (isComplete) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-white rounded-2xl shadow-xl p-8 text-center"
      >
        <div className="text-8xl mb-6">🎉</div>
        <h2 className="text-4xl font-bold text-gray-900 mb-4">
          Tutorial Complete!
        </h2>
        <p className="text-xl text-gray-600 mb-8">
          Great job completing "{tutorial.title}"!
        </p>

        <div className="flex justify-center gap-4">
          <button
            onClick={restart}
            className="px-6 py-3 bg-primary-500 text-white rounded-xl font-bold hover:bg-primary-600 transition-colors"
          >
            Restart Tutorial
          </button>
          <button
            onClick={onExit}
            className="px-6 py-3 bg-gray-200 text-gray-700 rounded-xl font-bold hover:bg-gray-300 transition-colors"
          >
            Choose Another
          </button>
        </div>
      </motion.div>
    );
  }

  return (
    <div className="bg-white rounded-2xl shadow-xl p-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-gray-800">{tutorial.title}</h2>
        <button
          onClick={onExit}
          className="text-gray-400 hover:text-gray-600 text-2xl"
        >
          ✕
        </button>
      </div>

      {/* Progress bar */}
      <div className="mb-8">
        <div className="flex justify-between text-sm text-gray-600 mb-2">
          <span>Step {currentStepIndex + 1} of {totalSteps}</span>
          <span>{Math.round(progress)}%</span>
        </div>
        <div className="h-3 bg-gray-200 rounded-full overflow-hidden">
          <motion.div
            animate={{ width: `${progress}%` }}
            className="h-full bg-gradient-to-r from-purple-500 to-pink-500"
          />
        </div>
      </div>

      {/* Current step */}
      <AnimatePresence mode="wait">
        <motion.div
          key={currentStepIndex}
          initial={{ opacity: 0, x: 50 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -50 }}
          transition={{ duration: settings.reducedMotion ? 0.1 : 0.3 }}
          className="mb-8"
        >
          <h3 className="text-2xl font-bold text-gray-900 mb-4">
            {currentStep.title}
          </h3>

          <div className="bg-gradient-to-br from-blue-50 to-purple-50 rounded-xl p-8 mb-6">
            <p className="text-xl text-gray-800 leading-relaxed">
              {currentStep.instruction}
            </p>
          </div>

          {currentStep.hint && (
            <div className="bg-yellow-50 border-l-4 border-yellow-400 rounded-lg p-4 mb-6">
              <div className="flex items-center gap-2 mb-1">
                <span className="text-xl">💡</span>
                <span className="font-bold text-yellow-900">Hint:</span>
              </div>
              <p className="text-yellow-800">{currentStep.hint}</p>
            </div>
          )}

          <button
            onClick={readCurrentStep}
            className="px-6 py-3 bg-blue-100 text-blue-700 rounded-lg font-bold hover:bg-blue-200 transition-colors"
          >
            🔊 Repeat Instructions
          </button>
        </motion.div>
      </AnimatePresence>

      {/* Navigation */}
      <div className="flex justify-between">
        <button
          onClick={previousStep}
          disabled={currentStepIndex === 0}
          className="px-6 py-3 bg-gray-200 text-gray-700 rounded-xl font-bold hover:bg-gray-300 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          ← Previous
        </button>

        <button
          onClick={nextStep}
          className="px-8 py-3 bg-primary-500 text-white rounded-xl font-bold hover:bg-primary-600 transition-colors shadow-lg"
        >
          {currentStepIndex === totalSteps - 1 ? 'Finish' : 'Next →'}
        </button>
      </div>
    </div>
  );
}
