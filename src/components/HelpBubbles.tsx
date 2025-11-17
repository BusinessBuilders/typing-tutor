/**
 * Help Bubbles Component
 * Step 149 - Contextual help tooltips and information popups
 */

import { motion, AnimatePresence } from 'framer-motion';
import { useState, useRef } from 'react';
import { useSettingsStore } from '../store/useSettingsStore';

export interface HelpBubble {
  id: string;
  title?: string;
  content: string;
  icon?: string;
  position?: 'top' | 'bottom' | 'left' | 'right';
  showArrow?: boolean;
  dismissible?: boolean;
}

export interface HelpBubbleProps extends HelpBubble {
  targetRef?: React.RefObject<HTMLElement>;
  show?: boolean;
  onDismiss?: () => void;
}

export default function HelpBubbles({
  id,
  title,
  content,
  icon,
  position = 'top',
  showArrow = true,
  dismissible = true,
  show = true,
  onDismiss,
}: HelpBubbleProps) {
  const { settings } = useSettingsStore();

  const positionClasses = {
    top: 'bottom-full mb-2',
    bottom: 'top-full mt-2',
    left: 'right-full mr-2',
    right: 'left-full ml-2',
  };

  const arrowClasses = {
    top: 'top-full left-1/2 -translate-x-1/2 -mt-1',
    bottom: 'bottom-full left-1/2 -translate-x-1/2 -mb-1',
    left: 'left-full top-1/2 -translate-y-1/2 -ml-1',
    right: 'right-full top-1/2 -translate-y-1/2 -mr-1',
  };

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          key={id}
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          transition={{ duration: settings.reducedMotion ? 0 : 0.2 }}
          className={`absolute ${positionClasses[position]} z-50 max-w-xs`}
        >
          <div className="bg-gradient-to-br from-blue-500 to-purple-600 text-white rounded-xl shadow-2xl p-4 relative">
            {/* Icon and title */}
            {(icon || title) && (
              <div className="flex items-center gap-2 mb-2">
                {icon && <span className="text-2xl">{icon}</span>}
                {title && <h3 className="font-bold text-lg">{title}</h3>}
              </div>
            )}

            {/* Content */}
            <p className="text-sm leading-relaxed">{content}</p>

            {/* Dismiss button */}
            {dismissible && (
              <button
                onClick={onDismiss}
                className="absolute top-2 right-2 w-6 h-6 rounded-full bg-white bg-opacity-20 hover:bg-opacity-30 transition-colors flex items-center justify-center text-xs"
              >
                ✕
              </button>
            )}

            {/* Arrow */}
            {showArrow && (
              <div
                className={`absolute w-3 h-3 bg-blue-500 transform rotate-45 ${arrowClasses[position]}`}
              />
            )}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

// Interactive help bubble tour
export function HelpBubbleTour({
  steps,
  onComplete,
}: {
  steps: Array<HelpBubble & { targetSelector?: string }>;
  onComplete?: () => void;
}) {
  const { settings } = useSettingsStore();
  const [currentStep, setCurrentStep] = useState(0);
  const [isActive, setIsActive] = useState(true);

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      setIsActive(false);
      onComplete?.();
    }
  };

  const handleSkip = () => {
    setIsActive(false);
    onComplete?.();
  };

  if (!isActive || !steps[currentStep]) return null;

  const step = steps[currentStep];

  return (
    <div className="fixed inset-0 z-50 pointer-events-none">
      {/* Overlay */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="absolute inset-0 bg-black bg-opacity-50 pointer-events-auto"
        onClick={handleSkip}
      />

      {/* Help bubble */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-auto">
        <motion.div
          key={currentStep}
          initial={{ opacity: 0, scale: 0.9, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={{ duration: settings.reducedMotion ? 0 : 0.3 }}
          className="bg-white rounded-2xl shadow-2xl p-8 max-w-md"
        >
          {/* Step indicator */}
          <div className="text-sm text-gray-500 mb-4">
            Step {currentStep + 1} of {steps.length}
          </div>

          {/* Icon */}
          {step.icon && (
            <div className="text-6xl text-center mb-4">{step.icon}</div>
          )}

          {/* Title */}
          {step.title && (
            <h2 className="text-2xl font-bold text-gray-900 mb-3 text-center">
              {step.title}
            </h2>
          )}

          {/* Content */}
          <p className="text-gray-700 mb-6 text-center">{step.content}</p>

          {/* Navigation */}
          <div className="flex gap-3">
            <button
              onClick={handleSkip}
              className="flex-1 px-4 py-3 bg-gray-200 text-gray-700 rounded-lg font-medium hover:bg-gray-300 transition-colors"
            >
              Skip Tour
            </button>
            <button
              onClick={handleNext}
              className="flex-1 px-4 py-3 bg-primary-500 text-white rounded-lg font-medium hover:bg-primary-600 transition-colors"
            >
              {currentStep < steps.length - 1 ? 'Next' : 'Finish'}
            </button>
          </div>

          {/* Progress dots */}
          <div className="flex justify-center gap-2 mt-4">
            {steps.map((_, index) => (
              <div
                key={index}
                className={`w-2 h-2 rounded-full ${
                  index === currentStep ? 'bg-primary-500' : 'bg-gray-300'
                }`}
              />
            ))}
          </div>
        </motion.div>
      </div>
    </div>
  );
}

// Floating help button with bubble
export function FloatingHelpButton() {
  const [showBubble, setShowBubble] = useState(false);
  const buttonRef = useRef<HTMLButtonElement>(null);

  return (
    <div className="relative">
      <button
        ref={buttonRef}
        onClick={() => setShowBubble(!showBubble)}
        className="w-14 h-14 bg-primary-500 text-white rounded-full shadow-lg hover:bg-primary-600 transition-colors flex items-center justify-center text-2xl"
      >
        ?
      </button>

      {showBubble && (
        <HelpBubbles
          id="floating-help"
          title="Need Help?"
          content="Click on any element with a question mark to learn more about it!"
          icon="💡"
          position="left"
          show={showBubble}
          onDismiss={() => setShowBubble(false)}
        />
      )}
    </div>
  );
}

// Contextual help bubbles that appear on hover
export function ContextualHelp({
  children,
  helpText,
  helpTitle,
}: {
  children: React.ReactNode;
  helpText: string;
  helpTitle?: string;
}) {
  const [show, setShow] = useState(false);

  return (
    <div
      className="relative inline-block"
      onMouseEnter={() => setShow(true)}
      onMouseLeave={() => setShow(false)}
    >
      {children}

      <AnimatePresence>
        {show && (
          <HelpBubbles
            id="contextual-help"
            title={helpTitle}
            content={helpText}
            position="top"
            show={show}
            dismissible={false}
          />
        )}
      </AnimatePresence>
    </div>
  );
}

// Help bubble library
export const HELP_BUBBLES_LIBRARY = {
  homeRow: {
    id: 'help-home-row',
    title: 'Home Row',
    icon: '🏠',
    content:
      'The home row keys (ASDF JKL;) are where your fingers rest when not typing. This is your starting position!',
  },
  fingerPosition: {
    id: 'help-finger-position',
    title: 'Finger Position',
    icon: '☝️',
    content:
      'Each finger is responsible for specific keys. Use the color coding to know which finger to use!',
  },
  accuracy: {
    id: 'help-accuracy',
    title: 'Accuracy',
    icon: '🎯',
    content:
      'Accuracy shows how many keys you pressed correctly. Aim for 95% or higher!',
  },
  wpm: {
    id: 'help-wpm',
    title: 'Words Per Minute',
    icon: '⚡',
    content:
      'WPM measures your typing speed. The average typist types 40 WPM. Can you beat that?',
  },
  posture: {
    id: 'help-posture',
    title: 'Good Posture',
    icon: '🧘',
    content:
      'Sit up straight with your feet flat on the floor. Keep your wrists level and relaxed!',
  },
};
