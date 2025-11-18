/**
 * Help Command Component
 * Step 204 - Build interactive help command system
 */

import { motion, AnimatePresence } from 'framer-motion';
import { useState } from 'react';
import { useTextToSpeech } from './TextToSpeech';
import { useSettingsStore } from '../store/useSettingsStore';

// Help topics
export type HelpTopic =
  | 'getting-started'
  | 'keyboard-tips'
  | 'voice-commands'
  | 'settings'
  | 'achievements'
  | 'modes'
  | 'accessibility'
  | 'troubleshooting';

// Help content structure
interface HelpContent {
  topic: HelpTopic;
  title: string;
  icon: string;
  description: string;
  tips: string[];
  relatedTopics?: HelpTopic[];
}

// Help content database
const HELP_TOPICS: Record<HelpTopic, HelpContent> = {
  'getting-started': {
    topic: 'getting-started',
    title: 'Getting Started',
    icon: '🎯',
    description: 'Learn the basics of using the Autism Typing Tutor',
    tips: [
      'Start with letter practice to learn the keyboard',
      'Use the visual hints to find the next key',
      'Take breaks when you need them',
      'Celebrate every small success!',
      'Enable voice feedback for extra support',
    ],
    relatedTopics: ['keyboard-tips', 'modes', 'settings'],
  },
  'keyboard-tips': {
    topic: 'keyboard-tips',
    title: 'Keyboard Tips',
    icon: '⌨️',
    description: 'Tips for better typing and keyboard use',
    tips: [
      'Keep your fingers on the home row (ASDF JKL;)',
      'Use the correct finger for each key',
      'Look at the screen, not the keyboard',
      'Type at your own comfortable pace',
      'Practice regularly for best results',
    ],
    relatedTopics: ['getting-started', 'modes'],
  },
  'voice-commands': {
    topic: 'voice-commands',
    title: 'Voice Commands',
    icon: '🎤',
    description: 'Control the app with your voice',
    tips: [
      'Say "start" to begin an activity',
      'Say "pause" to take a break',
      'Say "repeat" to hear something again',
      'Say "help" to get assistance',
      'Say "louder" or "quieter" to adjust volume',
    ],
    relatedTopics: ['accessibility', 'settings'],
  },
  settings: {
    topic: 'settings',
    title: 'Settings',
    icon: '⚙️',
    description: 'Customize your experience',
    tips: [
      'Adjust font size for better readability',
      'Enable dyslexic font if helpful',
      'Control sound and music volumes',
      'Toggle reduced motion for less animation',
      'Choose your preferred theme',
    ],
    relatedTopics: ['accessibility', 'getting-started'],
  },
  achievements: {
    topic: 'achievements',
    title: 'Achievements',
    icon: '🏆',
    description: 'Track your progress and unlock rewards',
    tips: [
      'Complete lessons to earn achievements',
      'Build streaks by practicing daily',
      'Unlock new levels as you improve',
      'Collect stickers and virtual pet items',
      'Check your progress dashboard regularly',
    ],
    relatedTopics: ['modes', 'getting-started'],
  },
  modes: {
    topic: 'modes',
    title: 'Practice Modes',
    icon: '📚',
    description: 'Different ways to practice typing',
    tips: [
      'Letter Mode: Practice individual letters',
      'Word Mode: Type common words',
      'Sentence Mode: Practice full sentences',
      'Story Mode: Type complete stories',
      'Progress through modes as you improve',
    ],
    relatedTopics: ['getting-started', 'achievements'],
  },
  accessibility: {
    topic: 'accessibility',
    title: 'Accessibility',
    icon: '♿',
    description: 'Features designed for everyone',
    tips: [
      'Screen reader compatible',
      'Keyboard-only navigation available',
      'High contrast themes for visibility',
      'Adjustable text sizes',
      'Reduced motion option for sensitive users',
    ],
    relatedTopics: ['settings', 'voice-commands'],
  },
  troubleshooting: {
    topic: 'troubleshooting',
    title: 'Troubleshooting',
    icon: '🔧',
    description: 'Solutions to common problems',
    tips: [
      'Refresh the page if something isn\'t working',
      'Check microphone permissions for voice features',
      'Ensure sound is enabled in settings',
      'Try a different browser if issues persist',
      'Contact support if you need more help',
    ],
    relatedTopics: ['settings', 'voice-commands'],
  },
};

// Custom hook for help system
export function useHelpCommand() {
  const { speak } = useTextToSpeech();
  const [currentTopic, setCurrentTopic] = useState<HelpTopic | null>(null);

  const showHelp = (topic: HelpTopic) => {
    setCurrentTopic(topic);
    const content = HELP_TOPICS[topic];
    const helpText = `${content.title}. ${content.description}. ${content.tips.join('. ')}`;
    speak(helpText);
  };

  const speakTip = (tip: string) => {
    speak(tip);
  };

  const closeHelp = () => {
    setCurrentTopic(null);
  };

  return {
    showHelp,
    speakTip,
    closeHelp,
    currentTopic,
  };
}

// Main help command component
export default function HelpCommand() {
  const { showHelp, speakTip, closeHelp, currentTopic } = useHelpCommand();
  const { settings } = useSettingsStore();

  const topics = Object.values(HELP_TOPICS);

  return (
    <div className="bg-white rounded-2xl shadow-xl p-8">
      <h2 className="text-2xl font-bold text-gray-800 mb-6 text-center">
        Help & Support
      </h2>

      {/* Topic grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        {topics.map((topic, index) => (
          <motion.button
            key={topic.topic}
            onClick={() => showHelp(topic.topic)}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: settings.reducedMotion ? 0 : index * 0.05 }}
            whileHover={{ scale: settings.reducedMotion ? 1 : 1.05 }}
            className="p-6 bg-gradient-to-br from-primary-100 to-primary-200 hover:from-primary-200 hover:to-primary-300 rounded-xl text-center transition-all shadow-md"
          >
            <div className="text-4xl mb-2">{topic.icon}</div>
            <div className="text-sm font-bold text-gray-900">{topic.title}</div>
          </motion.button>
        ))}
      </div>

      {/* Help modal */}
      <AnimatePresence>
        {currentTopic && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={closeHelp}
              className="fixed inset-0 bg-black bg-opacity-50 z-40"
            />

            <div className="fixed inset-0 flex items-center justify-center z-50 p-4">
              <motion.div
                initial={{ opacity: 0, scale: 0.8, y: 50 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.8, y: 50 }}
                className="bg-white rounded-2xl shadow-2xl p-8 max-w-2xl w-full max-h-[90vh] overflow-y-auto"
              >
                {(() => {
                  const content = HELP_TOPICS[currentTopic];
                  return (
                    <>
                      <div className="flex items-start justify-between mb-6">
                        <div className="flex items-center gap-4">
                          <div className="text-6xl">{content.icon}</div>
                          <div>
                            <h3 className="text-3xl font-bold text-gray-900">
                              {content.title}
                            </h3>
                            <p className="text-gray-600 mt-1">
                              {content.description}
                            </p>
                          </div>
                        </div>

                        <button
                          onClick={closeHelp}
                          className="text-gray-400 hover:text-gray-600 text-3xl"
                        >
                          ×
                        </button>
                      </div>

                      <div className="mb-6">
                        <h4 className="text-xl font-bold text-gray-900 mb-4">
                          Tips:
                        </h4>
                        <div className="space-y-3">
                          {content.tips.map((tip, index) => (
                            <motion.div
                              key={index}
                              initial={{ opacity: 0, x: -20 }}
                              animate={{ opacity: 1, x: 0 }}
                              transition={{ delay: index * 0.1 }}
                              className="flex items-start gap-3 p-4 bg-blue-50 rounded-lg"
                            >
                              <div className="flex-shrink-0 w-8 h-8 bg-blue-500 text-white rounded-full flex items-center justify-center font-bold">
                                {index + 1}
                              </div>
                              <div className="flex-1 flex items-center justify-between">
                                <div className="text-gray-900">{tip}</div>
                                <button
                                  onClick={() => speakTip(tip)}
                                  className="ml-2 px-3 py-1 bg-blue-500 text-white rounded-lg text-sm font-bold hover:bg-blue-600 transition-colors"
                                >
                                  🔊
                                </button>
                              </div>
                            </motion.div>
                          ))}
                        </div>
                      </div>

                      {content.relatedTopics && content.relatedTopics.length > 0 && (
                        <div>
                          <h4 className="text-lg font-bold text-gray-900 mb-3">
                            Related Topics:
                          </h4>
                          <div className="flex flex-wrap gap-2">
                            {content.relatedTopics.map((relatedTopic) => {
                              const related = HELP_TOPICS[relatedTopic];
                              return (
                                <button
                                  key={relatedTopic}
                                  onClick={() => showHelp(relatedTopic)}
                                  className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-900 rounded-lg font-medium transition-colors"
                                >
                                  {related.icon} {related.title}
                                </button>
                              );
                            })}
                          </div>
                        </div>
                      )}

                      <div className="mt-8 text-center">
                        <button
                          onClick={closeHelp}
                          className="px-8 py-3 bg-primary-500 text-white rounded-xl font-bold hover:bg-primary-600 transition-colors"
                        >
                          Got it!
                        </button>
                      </div>
                    </>
                  );
                })()}
              </motion.div>
            </div>
          </>
        )}
      </AnimatePresence>

      {/* Quick tips */}
      <div className="bg-green-50 rounded-xl p-6">
        <h3 className="text-lg font-bold text-green-900 mb-3">
          Quick Tips
        </h3>
        <ul className="space-y-2 text-sm text-green-800">
          <li>• Click any topic above to learn more</li>
          <li>• Use 🔊 buttons to hear tips read aloud</li>
          <li>• Say "help" to open this screen with voice</li>
          <li>• Check related topics for more information</li>
        </ul>
      </div>
    </div>
  );
}

// Quick help button
export function QuickHelpButton() {
  const [showHelp, setShowHelp] = useState(false);

  return (
    <>
      <motion.button
        onClick={() => setShowHelp(true)}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        className="px-6 py-3 bg-blue-500 text-white rounded-lg font-bold hover:bg-blue-600 transition-colors shadow-lg"
      >
        ❓ Help
      </motion.button>

      <AnimatePresence>
        {showHelp && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowHelp(false)}
              className="absolute inset-0 bg-black bg-opacity-50"
            />

            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              className="relative bg-white rounded-2xl shadow-2xl p-8 max-w-md"
            >
              <button
                onClick={() => setShowHelp(false)}
                className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 text-2xl"
              >
                ×
              </button>

              <HelpCommand />
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
}

// Floating help button
export function FloatingHelpButton() {
  const [showHelp, setShowHelp] = useState(false);

  return (
    <>
      <motion.button
        onClick={() => setShowHelp(true)}
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        className="fixed bottom-4 left-4 w-14 h-14 bg-blue-500 text-white rounded-full shadow-2xl flex items-center justify-center text-2xl z-50 hover:bg-blue-600 transition-colors"
      >
        ❓
      </motion.button>

      {showHelp && (
        <div className="fixed inset-0 z-50 p-4 overflow-y-auto">
          <div
            onClick={() => setShowHelp(false)}
            className="absolute inset-0 bg-black bg-opacity-50"
          />

          <div className="relative max-w-4xl mx-auto">
            <HelpCommand />
            <button
              onClick={() => setShowHelp(false)}
              className="mt-4 w-full py-3 bg-gray-800 text-white rounded-xl font-bold hover:bg-gray-700 transition-colors"
            >
              Close Help
            </button>
          </div>
        </div>
      )}
    </>
  );
}
