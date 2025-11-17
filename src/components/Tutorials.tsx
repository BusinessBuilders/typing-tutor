/**
 * Tutorials Component
 * Step 150 - Interactive tutorials to guide users through learning
 */

import { motion, AnimatePresence } from 'framer-motion';
import { useState } from 'react';
import { useSettingsStore } from '../store/useSettingsStore';

export interface TutorialStep {
  id: string;
  title: string;
  description: string;
  icon?: string;
  content: React.ReactNode;
  action?: {
    label: string;
    onClick: () => void;
  };
}

export interface Tutorial {
  id: string;
  title: string;
  description: string;
  category: 'beginner' | 'intermediate' | 'advanced';
  estimatedTime: number; // minutes
  steps: TutorialStep[];
}

export interface TutorialsProps {
  tutorial: Tutorial;
  onComplete?: () => void;
  onSkip?: () => void;
}

export default function Tutorials({
  tutorial,
  onComplete,
  onSkip,
}: TutorialsProps) {
  const { settings } = useSettingsStore();
  const [currentStep, setCurrentStep] = useState(0);

  const handleNext = () => {
    if (currentStep < tutorial.steps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      onComplete?.();
    }
  };

  const handlePrevious = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const step = tutorial.steps[currentStep];
  const progress = ((currentStep + 1) / tutorial.steps.length) * 100;

  return (
    <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
      {/* Header */}
      <div className="bg-gradient-to-r from-primary-500 to-purple-600 text-white p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-2xl font-bold">{tutorial.title}</h2>
          <button
            onClick={onSkip}
            className="px-4 py-2 bg-white bg-opacity-20 hover:bg-opacity-30 rounded-lg font-medium transition-colors"
          >
            Skip Tutorial
          </button>
        </div>

        {/* Progress bar */}
        <div className="bg-white bg-opacity-20 rounded-full h-2 overflow-hidden">
          <motion.div
            animate={{ width: `${progress}%` }}
            className="h-full bg-white"
          />
        </div>

        <div className="flex justify-between text-sm mt-2 opacity-90">
          <span>
            Step {currentStep + 1} of {tutorial.steps.length}
          </span>
          <span>{tutorial.estimatedTime} min</span>
        </div>
      </div>

      {/* Content */}
      <AnimatePresence mode="wait">
        <motion.div
          key={currentStep}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
          transition={{ duration: settings.reducedMotion ? 0 : 0.3 }}
          className="p-8"
        >
          {/* Step icon */}
          {step.icon && (
            <div className="text-6xl text-center mb-6">{step.icon}</div>
          )}

          {/* Step title */}
          <h3 className="text-2xl font-bold text-gray-900 mb-3 text-center">
            {step.title}
          </h3>

          {/* Step description */}
          <p className="text-gray-600 text-center mb-6">{step.description}</p>

          {/* Step content */}
          <div className="my-8">{step.content}</div>

          {/* Step action */}
          {step.action && (
            <div className="flex justify-center mb-6">
              <button
                onClick={step.action.onClick}
                className="px-8 py-3 bg-primary-500 text-white rounded-lg font-bold hover:bg-primary-600 transition-colors"
              >
                {step.action.label}
              </button>
            </div>
          )}
        </motion.div>
      </AnimatePresence>

      {/* Navigation */}
      <div className="flex justify-between p-6 bg-gray-50 border-t border-gray-200">
        <button
          onClick={handlePrevious}
          disabled={currentStep === 0}
          className="px-6 py-3 bg-gray-200 text-gray-700 rounded-lg font-medium disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-300 transition-colors"
        >
          ← Previous
        </button>

        <button
          onClick={handleNext}
          className="px-6 py-3 bg-primary-500 text-white rounded-lg font-medium hover:bg-primary-600 transition-colors"
        >
          {currentStep < tutorial.steps.length - 1 ? 'Next →' : 'Complete!'}
        </button>
      </div>
    </div>
  );
}

// Tutorial selection menu
export function TutorialMenu({
  tutorials,
  onSelect,
}: {
  tutorials: Tutorial[];
  onSelect?: (tutorial: Tutorial) => void;
}) {
  const { settings } = useSettingsStore();

  const categories = {
    beginner: { label: 'Beginner', color: 'from-green-500 to-green-600', icon: '🌱' },
    intermediate: { label: 'Intermediate', color: 'from-blue-500 to-blue-600', icon: '💪' },
    advanced: { label: 'Advanced', color: 'from-purple-500 to-purple-600', icon: '⭐' },
  };

  const groupedTutorials = {
    beginner: tutorials.filter((t) => t.category === 'beginner'),
    intermediate: tutorials.filter((t) => t.category === 'intermediate'),
    advanced: tutorials.filter((t) => t.category === 'advanced'),
  };

  return (
    <div className="bg-white rounded-2xl shadow-xl p-8">
      <h2 className="text-3xl font-bold text-gray-900 mb-8 text-center">
        Choose a Tutorial
      </h2>

      <div className="space-y-8">
        {Object.entries(groupedTutorials).map(([category, tutorialList]) => {
          const cat = categories[category as keyof typeof categories];

          return (
            <div key={category}>
              <div className="flex items-center gap-3 mb-4">
                <span className="text-3xl">{cat.icon}</span>
                <h3 className="text-xl font-bold text-gray-800">{cat.label}</h3>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {tutorialList.map((tutorial, index) => (
                  <motion.button
                    key={tutorial.id}
                    onClick={() => onSelect?.(tutorial)}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{
                      delay: settings.reducedMotion ? 0 : index * 0.05,
                    }}
                    whileHover={{ scale: settings.reducedMotion ? 1 : 1.02 }}
                    className={`text-left p-6 rounded-xl bg-gradient-to-br ${cat.color} text-white shadow-lg hover:shadow-xl transition-shadow`}
                  >
                    <h4 className="text-lg font-bold mb-2">{tutorial.title}</h4>
                    <p className="text-sm opacity-90 mb-4">
                      {tutorial.description}
                    </p>
                    <div className="flex items-center justify-between text-sm opacity-75">
                      <span>{tutorial.steps.length} steps</span>
                      <span>~{tutorial.estimatedTime} min</span>
                    </div>
                  </motion.button>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// Quick start tutorial
export const QUICK_START_TUTORIAL: Tutorial = {
  id: 'quick-start',
  title: 'Quick Start Guide',
  description: 'Learn the basics of typing in just 5 minutes',
  category: 'beginner',
  estimatedTime: 5,
  steps: [
    {
      id: 'welcome',
      title: 'Welcome! 👋',
      description: 'Let\'s learn to type the fun way!',
      icon: '🎉',
      content: (
        <div className="bg-blue-50 rounded-xl p-6 text-center">
          <p className="text-gray-800 text-lg">
            This tutorial will teach you the basics of touch typing.
            You'll learn where to place your fingers and how to type without
            looking at the keyboard!
          </p>
        </div>
      ),
    },
    {
      id: 'home-row',
      title: 'The Home Row',
      description: 'Your fingers start here',
      icon: '🏠',
      content: (
        <div className="bg-gradient-to-br from-blue-50 to-purple-50 rounded-xl p-8">
          <div className="flex justify-center gap-4 mb-6">
            <div className="text-center">
              <div className="text-sm font-bold text-gray-700 mb-2">Left Hand</div>
              <div className="flex gap-2">
                {['A', 'S', 'D', 'F'].map((key) => (
                  <div
                    key={key}
                    className="w-12 h-12 bg-green-500 text-white rounded-lg font-bold flex items-center justify-center"
                  >
                    {key}
                  </div>
                ))}
              </div>
            </div>

            <div className="text-center">
              <div className="text-sm font-bold text-gray-700 mb-2">Right Hand</div>
              <div className="flex gap-2">
                {['J', 'K', 'L', ';'].map((key) => (
                  <div
                    key={key}
                    className="w-12 h-12 bg-blue-500 text-white rounded-lg font-bold flex items-center justify-center"
                  >
                    {key}
                  </div>
                ))}
              </div>
            </div>
          </div>

          <p className="text-center text-gray-700">
            Place your fingers on these keys. This is called the "home row"!
          </p>
        </div>
      ),
    },
    {
      id: 'bumps',
      title: 'Feel the Bumps',
      description: 'F and J have special bumps',
      icon: '👆',
      content: (
        <div className="bg-yellow-50 rounded-xl p-6">
          <p className="text-gray-800 text-center mb-4">
            Feel the small bumps on the F and J keys? These help you find the
            home row without looking!
          </p>
          <div className="flex justify-center gap-12 text-6xl">
            <div className="text-center">
              <div>F</div>
              <div className="text-2xl">⬆️</div>
            </div>
            <div className="text-center">
              <div>J</div>
              <div className="text-2xl">⬆️</div>
            </div>
          </div>
        </div>
      ),
    },
    {
      id: 'ready',
      title: 'You\'re Ready!',
      description: 'Time to start practicing',
      icon: '🎯',
      content: (
        <div className="bg-success-50 rounded-xl p-6 text-center">
          <p className="text-gray-800 text-lg mb-4">
            Great! Now you know the basics. Let's start with some simple
            exercises to practice what you've learned!
          </p>
          <div className="text-5xl mb-4">🚀</div>
          <p className="text-gray-600">
            Remember: Start slow and focus on accuracy. Speed will come with
            practice!
          </p>
        </div>
      ),
    },
  ],
};

// Pre-defined tutorials library
export const TUTORIALS_LIBRARY: Tutorial[] = [
  QUICK_START_TUTORIAL,
  {
    id: 'finger-position',
    title: 'Finger Positioning',
    description: 'Learn which finger types which key',
    category: 'beginner',
    estimatedTime: 10,
    steps: [
      {
        id: 'intro',
        title: 'Finger Mapping',
        description: 'Each finger has specific keys',
        icon: '🖐️',
        content: (
          <div className="text-center">
            <p className="text-gray-700">
              In this tutorial, you'll learn which finger is responsible for
              each key on the keyboard.
            </p>
          </div>
        ),
      },
    ],
  },
  {
    id: 'speed-building',
    title: 'Building Speed',
    description: 'Increase your typing speed safely',
    category: 'intermediate',
    estimatedTime: 15,
    steps: [
      {
        id: 'intro',
        title: 'Speed vs Accuracy',
        description: 'Learn to type faster without sacrificing accuracy',
        icon: '⚡',
        content: (
          <div className="text-center">
            <p className="text-gray-700">
              This tutorial will help you gradually increase your typing speed
              while maintaining high accuracy.
            </p>
          </div>
        ),
      },
    ],
  },
];
