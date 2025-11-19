import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { usePetStore, useCreatePet } from '../store/usePetStore';
import { PetDisplay } from '../components/PetSystem';

/**
 * HomeScreen Component - Step 93
 *
 * Main landing screen for the Autism Typing Tutor.
 * Provides welcoming, calming interface with clear navigation options.
 *
 * Features:
 * - Welcoming hero section with calming animations
 * - Clear, large navigation buttons
 * - Daily encouragement messages
 * - Quick start options
 * - Visual pet companion preview
 * - Accessibility-first design
 */

export interface HomeScreenProps {
  userName?: string;
  petName?: string;
  showWelcomeAnimation?: boolean;
}

const encouragementMessages = [
  "Every word you type makes you stronger! 💪",
  "You're doing amazing! Keep going! ⭐",
  "Practice makes progress! 🌟",
  "Your typing skills are improving! 🎯",
  "You're a typing superstar! 🌈",
  "Great to see you today! 😊",
  "Let's learn something new together! 📚",
  "Ready for an adventure? 🚀",
];

const quickStartOptions = [
  {
    id: 'lessons',
    title: 'AI Lessons',
    icon: '✨',
    description: 'Learn with AI-powered lessons',
    difficulty: 'All Levels',
    color: 'from-yellow-400 to-orange-500',
    route: '/lessons',
  },
  {
    id: 'letters',
    title: 'Letter Practice',
    icon: '🔤',
    description: 'Practice individual letters',
    difficulty: 'Easy',
    color: 'from-green-400 to-emerald-500',
    route: '/learning/letters',
  },
  {
    id: 'words',
    title: 'Word Building',
    icon: '📝',
    description: 'Type simple words',
    difficulty: 'Easy',
    color: 'from-blue-400 to-cyan-500',
    route: '/learning/words',
  },
  {
    id: 'cvc',
    title: 'CVC Words',
    icon: '🎯',
    description: 'Practice consonant-vowel-consonant words',
    difficulty: 'Easy',
    color: 'from-teal-400 to-cyan-600',
    route: '/cvc-practice',
  },
  {
    id: 'compounds',
    title: 'Compound Words',
    icon: '🔗',
    description: 'Learn compound word patterns',
    difficulty: 'Medium',
    color: 'from-indigo-400 to-purple-600',
    route: '/compound-words',
  },
  {
    id: 'sentences',
    title: 'Sentences',
    icon: '✍️',
    description: 'Practice full sentences',
    difficulty: 'Medium',
    color: 'from-purple-400 to-pink-500',
    route: '/learning/sentences',
  },
  {
    id: 'stories',
    title: 'Story Mode',
    icon: '📖',
    description: 'Interactive story typing',
    difficulty: 'Medium',
    color: 'from-orange-400 to-red-500',
    route: '/learning/stories',
  },
];

const HomeScreen: React.FC<HomeScreenProps> = ({
  userName = 'Friend',
  petName = 'Buddy',
  showWelcomeAnimation = true,
}) => {
  const navigate = useNavigate();
  const [currentMessage, setCurrentMessage] = useState(0);
  const [showContent, setShowContent] = useState(!showWelcomeAnimation);
  const { pet } = usePetStore();
  const createPet = useCreatePet();
  const [showPetCreate, setShowPetCreate] = useState(false);

  // Create default pet if none exists
  useEffect(() => {
    if (!pet && !showPetCreate) {
      setShowPetCreate(true);
      // Auto-create a default pet for demo
      setTimeout(() => {
        createPet('cat', petName || 'Buddy', 'from-orange-400 to-orange-600');
        setShowPetCreate(false);
      }, 100);
    }
  }, [pet, petName, createPet, showPetCreate]);

  // Rotate encouragement messages
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentMessage((prev) => (prev + 1) % encouragementMessages.length);
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  // Show content after welcome animation
  useEffect(() => {
    if (showWelcomeAnimation) {
      const timer = setTimeout(() => setShowContent(true), 1000);
      return () => clearTimeout(timer);
    }
  }, [showWelcomeAnimation]);

  const handleQuickStart = (route: string) => {
    navigate(route);
  };

  return (
    <div className="home-screen min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 p-6">
      {/* Pet Companion Display */}
      {pet && (
        <motion.div
          className="fixed top-4 right-4 z-50"
          animate={{ y: [0, -10, 0] }}
          transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
        >
          <PetDisplay pet={pet} />
        </motion.div>
      )}

      {/* Hero Section */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        className="hero-section max-w-6xl mx-auto text-center mb-12 pt-8"
      >
        <motion.h1
          className="text-6xl font-bold mb-4 bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent"
          initial={{ scale: 0.9 }}
          animate={{ scale: 1 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          Welcome, {userName}! 👋
        </motion.h1>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="encouragement-message text-2xl text-gray-700 mb-8 h-16 flex items-center justify-center"
        >
          <motion.p
            key={currentMessage}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.5 }}
          >
            {encouragementMessages[currentMessage]}
          </motion.p>
        </motion.div>

        {/* Pet Preview */}
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: 'spring', delay: 0.7, stiffness: 200 }}
          className="pet-preview mb-8"
        >
          <div className="inline-block p-6 bg-white rounded-full shadow-lg">
            <span className="text-6xl">🐱</span>
          </div>
          <p className="text-lg text-gray-600 mt-3">
            {petName} is excited to practice with you!
          </p>
        </motion.div>
      </motion.div>

      {showContent && (
        <div className="content-section max-w-6xl mx-auto">
          {/* Quick Start Options */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.9 }}
            className="quick-start-section mb-12"
          >
            <h2 className="text-3xl font-bold text-gray-800 mb-6 text-center">
              What would you like to practice today?
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {quickStartOptions.map((option, index) => (
                <motion.button
                  key={option.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 1 + index * 0.1 }}
                  whileHover={{ scale: 1.05, y: -5 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => handleQuickStart(option.route)}
                  className={`quick-start-card p-6 rounded-2xl shadow-lg hover:shadow-xl transition-all
                    bg-gradient-to-br ${option.color} text-white cursor-pointer`}
                >
                  <div className="text-5xl mb-3">{option.icon}</div>
                  <h3 className="text-xl font-bold mb-2">{option.title}</h3>
                  <p className="text-sm opacity-90 mb-3">{option.description}</p>
                  <span className="inline-block px-3 py-1 bg-white bg-opacity-25 rounded-full text-xs font-semibold">
                    {option.difficulty}
                  </span>
                </motion.button>
              ))}
            </div>
          </motion.div>

          {/* Main Navigation Cards */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.4 }}
            className="main-navigation grid grid-cols-1 md:grid-cols-3 gap-6 mb-12"
          >
            <motion.button
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => navigate('/progress')}
              className="nav-card p-8 bg-white rounded-2xl shadow-md hover:shadow-xl transition-all text-center"
            >
              <div className="text-5xl mb-4">📊</div>
              <h3 className="text-2xl font-bold text-gray-800 mb-2">
                My Progress
              </h3>
              <p className="text-gray-600">See how much you've improved!</p>
            </motion.button>

            <motion.button
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => navigate('/settings')}
              className="nav-card p-8 bg-white rounded-2xl shadow-md hover:shadow-xl transition-all text-center"
            >
              <div className="text-5xl mb-4">⚙️</div>
              <h3 className="text-2xl font-bold text-gray-800 mb-2">Settings</h3>
              <p className="text-gray-600">Customize your experience</p>
            </motion.button>

            <motion.button
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => navigate('/parent-dashboard')}
              className="nav-card p-8 bg-white rounded-2xl shadow-md hover:shadow-xl transition-all text-center"
            >
              <div className="text-5xl mb-4">👨‍👩‍👧</div>
              <h3 className="text-2xl font-bold text-gray-800 mb-2">
                For Parents
              </h3>
              <p className="text-gray-600">Track progress & manage settings</p>
            </motion.button>
          </motion.div>

          {/* Daily Tip */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.6 }}
            className="daily-tip bg-gradient-to-r from-yellow-100 to-orange-100 p-6 rounded-2xl shadow-md text-center max-w-2xl mx-auto"
          >
            <div className="text-3xl mb-2">💡</div>
            <h3 className="text-xl font-bold text-gray-800 mb-2">Daily Tip</h3>
            <p className="text-gray-700">
              Take breaks when you need them! It's okay to practice for just a few
              minutes at a time. Small steps lead to big progress!
            </p>
          </motion.div>
        </div>
      )}
    </div>
  );
};

export default HomeScreen;
