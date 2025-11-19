import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useBadgeSystem } from '../components/BadgeSystem';

/**
 * ProgressScreen Component - Step 97
 *
 * Displays comprehensive progress tracking and statistics.
 * Shows typing improvements, achievements, and learning journey.
 *
 * Features:
 * - Overall statistics dashboard
 * - Typing speed (WPM) progress graphs
 * - Accuracy tracking over time
 * - Achievements and badges earned
 * - Session history
 * - Skill level progression
 * - Motivational insights
 */

interface ProgressStats {
  totalWords: number;
  totalTime: number; // minutes
  averageWPM: number;
  bestWPM: number;
  averageAccuracy: number;
  bestAccuracy: number;
  lessonsCompleted: number;
  currentStreak: number;
  longestStreak: number;
  badgesEarned: number;
}

const ProgressScreen: React.FC = () => {
  const navigate = useNavigate();
  const { badges, getUnlockedBadges } = useBadgeSystem();

  // Mock data - in real app, this would come from database
  const [stats] = useState<ProgressStats>({
    totalWords: 1247,
    totalTime: 145, // minutes
    averageWPM: 28,
    bestWPM: 42,
    averageAccuracy: 94.5,
    bestAccuracy: 98.2,
    lessonsCompleted: 23,
    currentStreak: 7,
    longestStreak: 12,
    badgesEarned: getUnlockedBadges().length,
  });

  // Use real badges from BadgeSystem
  const achievements = badges;

  const recentSessions = [
    { date: '2024-11-18', wpm: 32, accuracy: 96, duration: 15, lessonType: 'Words' },
    { date: '2024-11-17', wpm: 28, accuracy: 94, duration: 20, lessonType: 'Sentences' },
    { date: '2024-11-16', wpm: 30, accuracy: 95, duration: 18, lessonType: 'Words' },
    { date: '2024-11-15', wpm: 26, accuracy: 92, duration: 12, lessonType: 'Letters' },
    { date: '2024-11-14', wpm: 29, accuracy: 94, duration: 16, lessonType: 'Sentences' },
  ];

  const skillLevels = [
    { skill: 'Letter Recognition', level: 'Advanced', progress: 95, color: 'bg-green-500' },
    { skill: 'Word Building', level: 'Intermediate', progress: 75, color: 'bg-blue-500' },
    { skill: 'Sentence Typing', level: 'Beginner', progress: 45, color: 'bg-yellow-500' },
    { skill: 'Story Mode', level: 'Beginner', progress: 30, color: 'bg-orange-500' },
  ];

  return (
    <div className="progress-screen min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-6">
      {/* Header */}
      <div className="max-w-6xl mx-auto mb-8">
        <button
          onClick={() => navigate('/')}
          className="mb-4 text-purple-600 hover:text-purple-700 flex items-center gap-2 text-lg"
        >
          ← Back to Home
        </button>
        <h1 className="text-5xl font-bold text-gray-800 mb-2">My Progress 📊</h1>
        <p className="text-xl text-gray-600">
          Look how far you've come! Keep up the amazing work! 🌟
        </p>
      </div>

      {/* Main Stats Cards */}
      <div className="max-w-6xl mx-auto mb-8">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-gradient-to-br from-purple-400 to-purple-600 text-white p-6 rounded-2xl shadow-lg"
          >
            <div className="text-5xl font-bold mb-2">{stats.averageWPM}</div>
            <div className="text-sm opacity-90">Average WPM</div>
            <div className="text-xs mt-2 opacity-75">Best: {stats.bestWPM}</div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-gradient-to-br from-green-400 to-green-600 text-white p-6 rounded-2xl shadow-lg"
          >
            <div className="text-5xl font-bold mb-2">{stats.averageAccuracy}%</div>
            <div className="text-sm opacity-90">Accuracy</div>
            <div className="text-xs mt-2 opacity-75">Best: {stats.bestAccuracy}%</div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="bg-gradient-to-br from-orange-400 to-orange-600 text-white p-6 rounded-2xl shadow-lg"
          >
            <div className="text-5xl font-bold mb-2">{stats.currentStreak}</div>
            <div className="text-sm opacity-90">Day Streak 🔥</div>
            <div className="text-xs mt-2 opacity-75">Longest: {stats.longestStreak} days</div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="bg-gradient-to-br from-blue-400 to-blue-600 text-white p-6 rounded-2xl shadow-lg"
          >
            <div className="text-5xl font-bold mb-2">{stats.lessonsCompleted}</div>
            <div className="text-sm opacity-90">Lessons Done</div>
            <div className="text-xs mt-2 opacity-75">{stats.totalWords} words typed</div>
          </motion.div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto grid md:grid-cols-2 gap-8">
        {/* Left Column */}
        <div className="space-y-8">
          {/* Skill Levels */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.5 }}
            className="bg-white rounded-2xl shadow-md p-6"
          >
            <h2 className="text-2xl font-bold text-gray-800 mb-6">Skill Levels</h2>
            <div className="space-y-4">
              {skillLevels.map((skill, index) => (
                <div key={index}>
                  <div className="flex justify-between items-center mb-2">
                    <span className="font-medium text-gray-700">{skill.skill}</span>
                    <span className="text-sm text-gray-500">{skill.level}</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-3">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${skill.progress}%` }}
                      transition={{ duration: 1, delay: 0.5 + index * 0.1 }}
                      className={`${skill.color} h-3 rounded-full`}
                    />
                  </div>
                  <div className="text-xs text-gray-500 mt-1 text-right">{skill.progress}%</div>
                </div>
              ))}
            </div>
          </motion.div>

          {/* Recent Sessions */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.6 }}
            className="bg-white rounded-2xl shadow-md p-6"
          >
            <h2 className="text-2xl font-bold text-gray-800 mb-6">Recent Sessions</h2>
            <div className="space-y-3">
              {recentSessions.map((session, index) => (
                <div
                  key={index}
                  className="flex justify-between items-center p-4 bg-gray-50 rounded-xl"
                >
                  <div>
                    <div className="font-medium text-gray-800">{session.lessonType}</div>
                    <div className="text-sm text-gray-500">{session.date}</div>
                  </div>
                  <div className="text-right">
                    <div className="font-bold text-purple-600">{session.wpm} WPM</div>
                    <div className="text-sm text-gray-600">{session.accuracy}% • {session.duration}min</div>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        </div>

        {/* Right Column - Achievements */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.7 }}
          className="bg-white rounded-2xl shadow-md p-6"
        >
          <h2 className="text-2xl font-bold text-gray-800 mb-6">
            Achievements ({stats.badgesEarned}/{achievements.length})
          </h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
            {achievements.map((achievement, index) => (
              <motion.div
                key={achievement.id}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.8 + index * 0.05 }}
                className={`p-4 rounded-xl text-center transition-all ${
                  achievement.unlocked
                    ? 'bg-gradient-to-br from-yellow-100 to-orange-100 border-2 border-yellow-400'
                    : 'bg-gray-100 opacity-50'
                }`}
                title={achievement.description}
              >
                <div className={`text-4xl mb-2 ${achievement.unlocked ? '' : 'grayscale opacity-50'}`}>{achievement.icon}</div>
                <div className="text-xs font-semibold text-gray-700 leading-tight">
                  {achievement.name}
                </div>
              </motion.div>
            ))}
          </div>

          {/* Motivational Message */}
          <div className="mt-8 p-6 bg-gradient-to-r from-purple-100 to-pink-100 rounded-xl">
            <div className="text-3xl mb-3 text-center">🎉</div>
            <h3 className="font-bold text-gray-800 text-center mb-2">You're Doing Amazing!</h3>
            <p className="text-sm text-gray-700 text-center">
              You've improved your typing speed by <strong>12 WPM</strong> this month!
              Keep practicing and you'll be a typing pro in no time! 🚀
            </p>
          </div>
        </motion.div>
      </div>

      {/* Action Buttons */}
      <div className="max-w-6xl mx-auto mt-8 flex gap-4 justify-center">
        <button
          onClick={() => navigate('/learning')}
          className="px-8 py-4 bg-purple-500 hover:bg-purple-600 text-white font-bold rounded-xl shadow-md hover:shadow-lg transition-all"
        >
          Continue Learning →
        </button>
        <button
          onClick={() => {
            // Export progress logic
            alert('Progress exported! (Feature coming soon)');
          }}
          className="px-8 py-4 bg-white hover:bg-gray-50 text-gray-800 font-bold rounded-xl shadow-md hover:shadow-lg transition-all border-2 border-gray-300"
        >
          📥 Export Progress
        </button>
      </div>
    </div>
  );
};

export default ProgressScreen;
