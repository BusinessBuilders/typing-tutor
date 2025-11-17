/**
 * Home Screen Component
 * Step 93 - Welcoming home screen with clear CTAs
 */

import { motion } from 'framer-motion';
import { useUserStore } from '../../store/useUserStore';
import { useAppStore } from '../../store/useAppStore';
import { useSettingsStore } from '../../store/useSettingsStore';

export default function HomeScreen() {
  const { currentUser } = useUserStore();
  const { setScreen } = useAppStore();
  const { settings } = useSettingsStore();

  const features = [
    {
      icon: '🖼️',
      title: 'Visual Learning',
      description: 'See pictures with every word',
    },
    {
      icon: '🔊',
      title: 'Audio Support',
      description: 'Hear words spoken aloud',
    },
    {
      icon: '⭐',
      title: 'Positive Rewards',
      description: 'Celebrate every success',
    },
    {
      icon: '🎨',
      title: 'Custom Themes',
      description: 'Colors that work for you',
    },
  ];

  const levels = [
    {
      id: 'letters',
      title: 'Letters',
      description: 'Learn individual letters',
      icon: '🔤',
      color: 'blue',
    },
    {
      id: 'words',
      title: 'Words',
      description: 'Type simple words',
      icon: '📝',
      color: 'green',
    },
    {
      id: 'sentences',
      title: 'Sentences',
      description: 'Practice full sentences',
      icon: '✍️',
      color: 'purple',
    },
    {
      id: 'scenes',
      title: 'Scenes',
      description: 'Type stories with pictures',
      icon: '🎬',
      color: 'pink',
    },
  ];

  return (
    <div className="max-w-6xl mx-auto">
      {/* Hero Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center py-12 mb-12"
      >
        <motion.div
          animate={{
            scale: settings.reducedMotion ? 1 : [1, 1.1, 1],
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
            repeatDelay: 3,
          }}
          className="text-8xl mb-6"
        >
          ✨
        </motion.div>

        <h1 className="text-5xl font-bold mb-4 text-gray-800">
          {currentUser ? `Welcome back, ${currentUser.name}!` : 'Welcome to Typing Tutor!'}
        </h1>

        <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
          {currentUser
            ? "Ready to practice? Let's continue your typing journey!"
            : 'A fun, patient typing tutor designed especially for you'}
        </p>

        {currentUser ? (
          <div className="flex flex-wrap justify-center gap-4">
            <motion.button
              whileHover={{ scale: settings.reducedMotion ? 1 : 1.05 }}
              whileTap={{ scale: settings.reducedMotion ? 1 : 0.95 }}
              onClick={() => setScreen('learning')}
              className="px-8 py-4 bg-success-600 text-white text-lg rounded-xl hover:bg-success-700 transition-colors shadow-lg flex items-center space-x-2"
            >
              <span className="text-2xl">🚀</span>
              <span>Start Practicing</span>
            </motion.button>

            <motion.button
              whileHover={{ scale: settings.reducedMotion ? 1 : 1.05 }}
              whileTap={{ scale: settings.reducedMotion ? 1 : 0.95 }}
              onClick={() => setScreen('progress')}
              className="px-8 py-4 bg-primary-600 text-white text-lg rounded-xl hover:bg-primary-700 transition-colors shadow-lg flex items-center space-x-2"
            >
              <span className="text-2xl">📊</span>
              <span>View Progress</span>
            </motion.button>
          </div>
        ) : (
          <motion.button
            whileHover={{ scale: settings.reducedMotion ? 1 : 1.05 }}
            whileTap={{ scale: settings.reducedMotion ? 1 : 0.95 }}
            onClick={() => setScreen('profile-select')}
            className="px-10 py-5 bg-primary-600 text-white text-xl rounded-xl hover:bg-primary-700 transition-colors shadow-xl flex items-center space-x-3 mx-auto"
          >
            <span className="text-3xl">👤</span>
            <span>Create Your Profile</span>
          </motion.button>
        )}
      </motion.div>

      {/* Features Grid */}
      <div className="mb-12">
        <h2 className="text-3xl font-bold text-center mb-8 text-gray-800">
          Why You'll Love It
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {features.map((feature, index) => (
            <motion.div
              key={feature.title}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="bg-white rounded-xl p-6 text-center shadow-md hover:shadow-lg transition-shadow"
            >
              <div className="text-5xl mb-3">{feature.icon}</div>
              <h3 className="text-lg font-semibold mb-2 text-gray-800">
                {feature.title}
              </h3>
              <p className="text-gray-600">{feature.description}</p>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Learning Levels */}
      {currentUser && (
        <div className="mb-12">
          <h2 className="text-3xl font-bold text-center mb-8 text-gray-800">
            Choose Your Level
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {levels.map((level, index) => (
              <motion.button
                key={level.id}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: index * 0.1 }}
                whileHover={{ scale: settings.reducedMotion ? 1 : 1.05 }}
                whileTap={{ scale: settings.reducedMotion ? 1 : 0.95 }}
                onClick={() => {
                  setScreen('learning');
                  // TODO: Set selected level
                }}
                className={`bg-${level.color}-100 border-2 border-${level.color}-300 rounded-xl p-6 text-center hover:shadow-lg transition-all`}
              >
                <div className="text-6xl mb-3">{level.icon}</div>
                <h3 className="text-xl font-bold mb-2 text-gray-800">
                  {level.title}
                </h3>
                <p className="text-sm text-gray-600">{level.description}</p>
              </motion.button>
            ))}
          </div>
        </div>
      )}

      {/* Quick Stats (if user exists) */}
      {currentUser && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="bg-gradient-to-r from-primary-100 to-success-100 rounded-xl p-8 text-center"
        >
          <h3 className="text-2xl font-bold mb-4 text-gray-800">
            Your Progress Today
          </h3>
          <div className="grid grid-cols-3 gap-4">
            <div className="bg-white rounded-lg p-4">
              <div className="text-3xl mb-2">⏱️</div>
              <div className="text-2xl font-bold text-primary-600">0</div>
              <div className="text-sm text-gray-600">Minutes</div>
            </div>
            <div className="bg-white rounded-lg p-4">
              <div className="text-3xl mb-2">📝</div>
              <div className="text-2xl font-bold text-success-600">0</div>
              <div className="text-sm text-gray-600">Words</div>
            </div>
            <div className="bg-white rounded-lg p-4">
              <div className="text-3xl mb-2">🎯</div>
              <div className="text-2xl font-bold text-purple-600">0%</div>
              <div className="text-sm text-gray-600">Accuracy</div>
            </div>
          </div>
        </motion.div>
      )}
    </div>
  );
}
