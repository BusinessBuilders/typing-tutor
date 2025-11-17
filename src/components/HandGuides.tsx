/**
 * Hand Guides Component
 * Step 143 - Visual guides for proper hand positioning on keyboard
 */

import { motion } from 'framer-motion';
import { useState } from 'react';
import { useSettingsStore } from '../store/useSettingsStore';

export interface HandGuidesProps {
  showGuides?: boolean;
  highlightHomeRow?: boolean;
  showHandOutlines?: boolean;
  colorCoded?: boolean;
}

export default function HandGuides({
  showGuides = true,
  highlightHomeRow = true,
  showHandOutlines = true,
  colorCoded = true,
}: HandGuidesProps) {
  const { settings } = useSettingsStore();

  if (!showGuides) return null;

  // Home row keys
  const leftHomeRow = ['A', 'S', 'D', 'F'];
  const rightHomeRow = ['J', 'K', 'L', ';'];

  // Finger colors
  const leftFingerColors = ['bg-pink-200', 'bg-purple-200', 'bg-blue-200', 'bg-green-200'];
  const rightFingerColors = ['bg-green-200', 'bg-blue-200', 'bg-purple-200', 'bg-pink-200'];

  return (
    <div className="bg-white rounded-2xl shadow-xl p-8">
      <h2 className="text-2xl font-bold text-gray-800 mb-6 text-center">
        Home Row Hand Position
      </h2>

      <div className="flex justify-center gap-12 mb-8">
        {/* Left hand */}
        <div className="text-center">
          <h3 className="text-lg font-bold text-gray-700 mb-4">Left Hand</h3>

          {showHandOutlines && (
            <div className="text-8xl mb-4">🤚</div>
          )}

          <div className="flex gap-2">
            {leftHomeRow.map((key, index) => (
              <motion.div
                key={key}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{
                  delay: settings.reducedMotion ? 0 : index * 0.1,
                }}
                className={`w-16 h-16 rounded-lg font-bold text-xl flex items-center justify-center ${
                  colorCoded ? leftFingerColors[index] : 'bg-gray-200'
                } ${highlightHomeRow ? 'border-4 border-primary-500' : 'border border-gray-300'}`}
              >
                {key}
              </motion.div>
            ))}
          </div>

          {/* Finger labels */}
          <div className="flex gap-2 mt-2 text-xs text-gray-600">
            {['Pinky', 'Ring', 'Middle', 'Index'].map((finger, index) => (
              <div key={index} className="w-16 text-center">
                {finger}
              </div>
            ))}
          </div>
        </div>

        {/* Right hand */}
        <div className="text-center">
          <h3 className="text-lg font-bold text-gray-700 mb-4">Right Hand</h3>

          {showHandOutlines && (
            <div className="text-8xl mb-4">🖐️</div>
          )}

          <div className="flex gap-2">
            {rightHomeRow.map((key, index) => (
              <motion.div
                key={key}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{
                  delay: settings.reducedMotion ? 0 : (index + 4) * 0.1,
                }}
                className={`w-16 h-16 rounded-lg font-bold text-xl flex items-center justify-center ${
                  colorCoded ? rightFingerColors[index] : 'bg-gray-200'
                } ${highlightHomeRow ? 'border-4 border-primary-500' : 'border border-gray-300'}`}
              >
                {key}
              </motion.div>
            ))}
          </div>

          {/* Finger labels */}
          <div className="flex gap-2 mt-2 text-xs text-gray-600">
            {['Index', 'Middle', 'Ring', 'Pinky'].map((finger, index) => (
              <div key={index} className="w-16 text-center">
                {finger}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Instructions */}
      <div className="bg-blue-50 rounded-xl p-6 text-center">
        <p className="text-gray-800">
          <span className="font-bold">👉 Place your fingers on the home row keys</span>
          <br />
          <span className="text-sm text-gray-600">
            Left: A S D F • Right: J K L ;
          </span>
        </p>
      </div>
    </div>
  );
}

// Animated hand placement guide
export function AnimatedHandPlacement() {
  const { settings } = useSettingsStore();
  const [step, setStep] = useState(0);

  const steps = [
    {
      title: 'Step 1: Position Your Hands',
      description: 'Hover your hands above the keyboard',
      handPosition: 'above',
    },
    {
      title: 'Step 2: Find the Home Row',
      description: 'Look for the bumps on F and J keys',
      handPosition: 'finding',
    },
    {
      title: 'Step 3: Place Your Fingers',
      description: 'Rest your fingers gently on the home row',
      handPosition: 'placed',
    },
  ];

  const currentStep = steps[step];

  const handleNext = () => {
    if (step < steps.length - 1) {
      setStep(step + 1);
    } else {
      setStep(0);
    }
  };

  return (
    <div className="bg-white rounded-2xl shadow-xl p-8">
      <h2 className="text-2xl font-bold text-gray-800 mb-6 text-center">
        Hand Placement Tutorial
      </h2>

      {/* Current step */}
      <div className="mb-8">
        <h3 className="text-xl font-bold text-primary-600 mb-2">
          {currentStep.title}
        </h3>
        <p className="text-gray-700">{currentStep.description}</p>
      </div>

      {/* Animated visualization */}
      <div className="relative h-64 bg-gradient-to-b from-blue-50 to-purple-50 rounded-xl mb-8 overflow-hidden">
        {/* Keyboard outline */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 w-3/4 h-20 bg-gray-300 rounded-lg" />

        {/* Hands */}
        <motion.div
          animate={{
            y: currentStep.handPosition === 'above' ? -20 : currentStep.handPosition === 'finding' ? 20 : 40,
            opacity: 1,
          }}
          transition={{
            duration: settings.reducedMotion ? 0 : 0.8,
            ease: 'easeInOut',
          }}
          className="absolute bottom-20 left-1/2 -translate-x-1/2 flex gap-12 text-6xl"
        >
          <span>🤚</span>
          <span>🖐️</span>
        </motion.div>

        {/* Home row indicator */}
        {currentStep.handPosition === 'finding' && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="absolute bottom-16 left-1/2 -translate-x-1/2 text-primary-600 font-bold text-sm"
          >
            ⬇ F and J keys ⬇
          </motion.div>
        )}
      </div>

      {/* Progress indicators */}
      <div className="flex justify-center gap-2 mb-6">
        {steps.map((_, index) => (
          <div
            key={index}
            className={`w-3 h-3 rounded-full ${
              index === step ? 'bg-primary-500' : 'bg-gray-300'
            }`}
          />
        ))}
      </div>

      {/* Navigation */}
      <div className="flex justify-center">
        <button
          onClick={handleNext}
          className="px-6 py-3 bg-primary-500 text-white rounded-lg font-bold hover:bg-primary-600 transition-colors"
        >
          {step < steps.length - 1 ? 'Next Step' : 'Start Over'}
        </button>
      </div>
    </div>
  );
}

// Hand posture checker
export function HandPostureGuide() {
  const goodPosture = [
    { icon: '✅', text: 'Wrists straight and level' },
    { icon: '✅', text: 'Fingers curved naturally' },
    { icon: '✅', text: 'Hands hovering above keys' },
    { icon: '✅', text: 'Thumbs near space bar' },
  ];

  const badPosture = [
    { icon: '❌', text: 'Wrists bent upward' },
    { icon: '❌', text: 'Fingers too flat' },
    { icon: '❌', text: 'Palms resting on desk' },
    { icon: '❌', text: 'Looking at keyboard' },
  ];

  return (
    <div className="bg-white rounded-2xl shadow-xl p-8">
      <h2 className="text-2xl font-bold text-gray-800 mb-6 text-center">
        Proper Hand Posture
      </h2>

      <div className="grid grid-cols-2 gap-6">
        {/* Good posture */}
        <div className="bg-green-50 rounded-xl p-6">
          <h3 className="text-lg font-bold text-green-900 mb-4 flex items-center gap-2">
            <span className="text-2xl">👍</span>
            Do This
          </h3>

          <div className="space-y-3">
            {goodPosture.map((item, index) => (
              <div key={index} className="flex items-start gap-2">
                <span className="text-xl flex-shrink-0">{item.icon}</span>
                <span className="text-green-900">{item.text}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Bad posture */}
        <div className="bg-red-50 rounded-xl p-6">
          <h3 className="text-lg font-bold text-red-900 mb-4 flex items-center gap-2">
            <span className="text-2xl">👎</span>
            Avoid This
          </h3>

          <div className="space-y-3">
            {badPosture.map((item, index) => (
              <div key={index} className="flex items-start gap-2">
                <span className="text-xl flex-shrink-0">{item.icon}</span>
                <span className="text-red-900">{item.text}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Visual guide */}
      <div className="mt-6 text-center text-8xl">
        <div className="mb-2 text-sm text-gray-600">Correct Hand Position</div>
        🤚 ⌨️ 🖐️
      </div>
    </div>
  );
}

// Interactive hand positioning game
export function HandPositionGame() {
  const { settings } = useSettingsStore();
  const [correctPositions, setCorrectPositions] = useState<Set<string>>(new Set());
  const [attempts, setAttempts] = useState(0);

  const homeRowKeys = [
    { key: 'A', finger: 'Left Pinky', hand: 'left' },
    { key: 'S', finger: 'Left Ring', hand: 'left' },
    { key: 'D', finger: 'Left Middle', hand: 'left' },
    { key: 'F', finger: 'Left Index', hand: 'left' },
    { key: 'J', finger: 'Right Index', hand: 'right' },
    { key: 'K', finger: 'Right Middle', hand: 'right' },
    { key: 'L', finger: 'Right Ring', hand: 'right' },
    { key: ';', finger: 'Right Pinky', hand: 'right' },
  ];

  const handleKeyClick = (key: string) => {
    if (!correctPositions.has(key)) {
      setCorrectPositions(new Set([...correctPositions, key]));
      setAttempts(attempts + 1);
    }
  };

  const allCorrect = correctPositions.size === homeRowKeys.length;

  return (
    <div className="bg-white rounded-2xl shadow-xl p-8">
      <h2 className="text-2xl font-bold text-gray-800 mb-6 text-center">
        Place Your Fingers!
      </h2>

      <div className="mb-6 text-center">
        <div className="text-sm text-gray-600">
          Click on each home row key in order
        </div>
        <div className="text-lg font-bold text-primary-600 mt-2">
          {correctPositions.size} / {homeRowKeys.length}
        </div>
      </div>

      {/* Keyboard */}
      <div className="flex justify-center gap-16 mb-6">
        {/* Left hand keys */}
        <div className="flex gap-2">
          {homeRowKeys.slice(0, 4).map((item) => {
            const isPlaced = correctPositions.has(item.key);

            return (
              <button
                key={item.key}
                onClick={() => handleKeyClick(item.key)}
                disabled={isPlaced}
                className={`w-16 h-16 rounded-lg font-bold text-xl transition-all ${
                  isPlaced
                    ? 'bg-success-500 text-white'
                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                }`}
              >
                {isPlaced ? '✓' : item.key}
              </button>
            );
          })}
        </div>

        {/* Right hand keys */}
        <div className="flex gap-2">
          {homeRowKeys.slice(4).map((item) => {
            const isPlaced = correctPositions.has(item.key);

            return (
              <button
                key={item.key}
                onClick={() => handleKeyClick(item.key)}
                disabled={isPlaced}
                className={`w-16 h-16 rounded-lg font-bold text-xl transition-all ${
                  isPlaced
                    ? 'bg-success-500 text-white'
                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                }`}
              >
                {isPlaced ? '✓' : item.key}
              </button>
            );
          })}
        </div>
      </div>

      {/* Finger guide */}
      {!allCorrect && (
        <div className="bg-blue-50 rounded-xl p-4 text-center">
          <div className="text-sm text-blue-900">
            Next: Place your{' '}
            <span className="font-bold">
              {homeRowKeys.find((k) => !correctPositions.has(k.key))?.finger}
            </span>{' '}
            on{' '}
            <span className="font-bold text-primary-600 text-xl">
              {homeRowKeys.find((k) => !correctPositions.has(k.key))?.key}
            </span>
          </div>
        </div>
      )}

      {/* Success message */}
      {allCorrect && (
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: settings.reducedMotion ? 0 : 0.5 }}
          className="bg-success-50 rounded-xl p-6 text-center"
        >
          <div className="text-4xl mb-2">🎉</div>
          <div className="text-xl font-bold text-success-900 mb-2">
            Perfect!
          </div>
          <div className="text-sm text-success-700">
            You've correctly positioned all fingers on the home row!
          </div>
        </motion.div>
      )}
    </div>
  );
}

// Hand diagram with labeled fingers
export function HandDiagram({ hand }: { hand: 'left' | 'right' }) {
  const fingerNames = {
    left: ['Pinky', 'Ring', 'Middle', 'Index', 'Thumb'],
    right: ['Thumb', 'Index', 'Middle', 'Ring', 'Pinky'],
  };

  const fingerColors = {
    left: [
      'text-pink-600',
      'text-purple-600',
      'text-blue-600',
      'text-green-600',
      'text-yellow-600',
    ],
    right: [
      'text-yellow-600',
      'text-green-600',
      'text-blue-600',
      'text-purple-600',
      'text-pink-600',
    ],
  };

  return (
    <div className="bg-white rounded-xl shadow-lg p-6">
      <h3 className="text-lg font-bold text-gray-800 mb-4 text-center capitalize">
        {hand} Hand
      </h3>

      {/* Hand illustration */}
      <div className="text-center text-9xl mb-4">
        {hand === 'left' ? '🤚' : '🖐️'}
      </div>

      {/* Finger labels */}
      <div className="space-y-2">
        {fingerNames[hand].map((name, index) => (
          <div
            key={index}
            className={`flex items-center gap-3 p-2 rounded-lg bg-gray-50`}
          >
            <div className={`w-2 h-2 rounded-full ${fingerColors[hand][index].replace('text', 'bg')}`} />
            <span className={`font-medium ${fingerColors[hand][index]}`}>
              {name}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

// Wrist position guide
export function WristPositionGuide() {
  return (
    <div className="bg-white rounded-xl shadow-lg p-6">
      <h3 className="text-lg font-bold text-gray-800 mb-4">Wrist Position</h3>

      <div className="space-y-4">
        {/* Correct */}
        <div className="bg-green-50 rounded-lg p-4">
          <div className="flex items-start gap-3">
            <span className="text-3xl">✅</span>
            <div>
              <div className="font-bold text-green-900 mb-1">Correct</div>
              <div className="text-sm text-green-800">
                Wrists straight and level with forearms. Hands float above the
                keyboard.
              </div>
            </div>
          </div>
        </div>

        {/* Incorrect - Bent up */}
        <div className="bg-red-50 rounded-lg p-4">
          <div className="flex items-start gap-3">
            <span className="text-3xl">❌</span>
            <div>
              <div className="font-bold text-red-900 mb-1">Too High</div>
              <div className="text-sm text-red-800">
                Wrists bent upward. This can cause strain over time.
              </div>
            </div>
          </div>
        </div>

        {/* Incorrect - Resting */}
        <div className="bg-red-50 rounded-lg p-4">
          <div className="flex items-start gap-3">
            <span className="text-3xl">❌</span>
            <div>
              <div className="font-bold text-red-900 mb-1">Resting on Desk</div>
              <div className="text-sm text-red-800">
                Palms or wrists resting on the desk. Keep hands elevated.
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Tip */}
      <div className="mt-4 p-3 bg-blue-50 rounded-lg">
        <div className="text-sm text-blue-900">
          <span className="font-bold">💡 Tip:</span> Imagine your hands are hovering
          over water - keep them light and elevated!
        </div>
      </div>
    </div>
  );
}
