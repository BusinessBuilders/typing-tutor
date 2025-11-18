/**
 * Streak Tracking Component
 * Step 216 - Add daily practice streak tracking
 */

import { motion, AnimatePresence } from 'framer-motion';
import { useState } from 'react';
import { useSettingsStore } from '../store/useSettingsStore';

// Streak milestone interface
interface StreakMilestone {
  days: number;
  reward: string;
  icon: string;
  color: string;
}

// Streak milestones
const STREAK_MILESTONES: StreakMilestone[] = [
  { days: 3, reward: 'Bronze Badge', icon: '🥉', color: 'from-orange-700 to-orange-800' },
  { days: 7, reward: 'Silver Badge + 500 XP', icon: '🥈', color: 'from-gray-400 to-gray-500' },
  { days: 14, reward: 'Gold Badge + 1000 XP', icon: '🥇', color: 'from-yellow-400 to-yellow-600' },
  { days: 30, reward: 'Diamond Badge + Special Pet', icon: '💎', color: 'from-blue-400 to-cyan-500' },
  { days: 50, reward: 'Master Streak Badge', icon: '🏆', color: 'from-purple-500 to-pink-600' },
  { days: 100, reward: 'Legend Status + Certificate', icon: '👑', color: 'from-yellow-500 via-orange-500 to-red-500' },
];

// Custom hook for streak tracking
export function useStreakTracking() {
  const [currentStreak, setCurrentStreak] = useState(0);
  const [longestStreak, setLongestStreak] = useState(0);
  const [lastPracticeDate, setLastPracticeDate] = useState<Date | null>(null);
  const [totalDaysPracticed, setTotalDaysPracticed] = useState(0);
  const [showMilestone, setShowMilestone] = useState(false);
  const [currentMilestone, setCurrentMilestone] = useState<StreakMilestone | null>(null);

  const practiceToday = () => {
    const today = new Date().toDateString();
    const lastDate = lastPracticeDate?.toDateString();

    if (lastDate === today) {
      // Already practiced today
      return { streakIncreased: false, currentStreak };
    }

    const newStreak = currentStreak + 1;
    setCurrentStreak(newStreak);
    setLastPracticeDate(new Date());
    setTotalDaysPracticed(totalDaysPracticed + 1);

    if (newStreak > longestStreak) {
      setLongestStreak(newStreak);
    }

    // Check for milestone
    const milestone = STREAK_MILESTONES.find((m) => m.days === newStreak);
    if (milestone) {
      setCurrentMilestone(milestone);
      setShowMilestone(true);
      setTimeout(() => setShowMilestone(false), 5000);
    }

    return { streakIncreased: true, currentStreak: newStreak, milestone };
  };

  const breakStreak = () => {
    setCurrentStreak(0);
  };

  const getNextMilestone = () => {
    return STREAK_MILESTONES.find((m) => m.days > currentStreak) || null;
  };

  const getDaysUntilNextMilestone = () => {
    const next = getNextMilestone();
    return next ? next.days - currentStreak : 0;
  };

  return {
    currentStreak,
    longestStreak,
    totalDaysPracticed,
    practiceToday,
    breakStreak,
    getNextMilestone,
    getDaysUntilNextMilestone,
    showMilestone,
    currentMilestone,
  };
}

// Main streak tracking component
export default function StreakTracking() {
  const {
    currentStreak,
    longestStreak,
    totalDaysPracticed,
    practiceToday,
    breakStreak,
    getNextMilestone,
    getDaysUntilNextMilestone,
    showMilestone,
    currentMilestone,
  } = useStreakTracking();

  const { settings } = useSettingsStore();
  const nextMilestone = getNextMilestone();

  return (
    <div className="bg-white rounded-2xl shadow-xl p-8">
      <h2 className="text-2xl font-bold text-gray-800 mb-6 text-center">
        Practice Streak
      </h2>

      {/* Current streak display */}
      <div className="mb-8 bg-gradient-to-r from-orange-400 to-red-500 rounded-2xl p-8 text-center text-white">
        <div className="text-8xl mb-4">🔥</div>
        <div className="text-sm font-bold uppercase tracking-wide opacity-90 mb-2">
          Current Streak
        </div>
        <motion.div
          animate={{ scale: currentStreak > 0 ? [1, 1.1, 1] : 1 }}
          transition={{ duration: 0.5 }}
          className="text-7xl font-bold mb-2"
        >
          {currentStreak}
        </motion.div>
        <div className="text-2xl">
          {currentStreak === 0 ? 'Start your streak today!' :
           currentStreak === 1 ? 'day' : 'days'}
        </div>
      </div>

      {/* Milestone notification */}
      <AnimatePresence>
        {showMilestone && currentMilestone && (
          <motion.div
            initial={{ opacity: 0, scale: 0.5 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.5 }}
            className="fixed inset-0 flex items-center justify-center z-50 pointer-events-none"
          >
            <div className={`bg-gradient-to-r ${currentMilestone.color} text-white rounded-3xl p-12 shadow-2xl text-center max-w-md`}>
              <motion.div
                animate={{
                  rotate: [0, 360],
                  scale: [1, 1.3, 1],
                }}
                transition={{ duration: 0.8 }}
                className="text-9xl mb-6"
              >
                {currentMilestone.icon}
              </motion.div>
              <div className="text-4xl font-bold mb-4">
                {currentMilestone.days}-Day Streak!
              </div>
              <div className="text-2xl mb-4">Reward Unlocked:</div>
              <div className="text-xl">{currentMilestone.reward}</div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-4 mb-8">
        <div className="bg-blue-50 rounded-xl p-6 text-center">
          <div className="text-4xl font-bold text-blue-700 mb-2">
            {longestStreak}
          </div>
          <div className="text-sm text-gray-600">Longest Streak</div>
        </div>
        <div className="bg-green-50 rounded-xl p-6 text-center">
          <div className="text-4xl font-bold text-green-700 mb-2">
            {totalDaysPracticed}
          </div>
          <div className="text-sm text-gray-600">Total Days</div>
        </div>
      </div>

      {/* Next milestone */}
      {nextMilestone && (
        <div className="mb-8 bg-purple-50 rounded-xl p-6">
          <h3 className="text-lg font-bold text-purple-900 mb-4">
            Next Milestone
          </h3>
          <div className="flex items-center gap-4 mb-4">
            <div className="text-5xl">{nextMilestone.icon}</div>
            <div className="flex-1">
              <div className="font-bold text-gray-900 mb-1">
                {nextMilestone.days} Days
              </div>
              <div className="text-gray-700 mb-2">{nextMilestone.reward}</div>
              <div className="h-3 bg-gray-200 rounded-full overflow-hidden">
                <motion.div
                  animate={{
                    width: `${(currentStreak / nextMilestone.days) * 100}%`,
                  }}
                  className={`h-full bg-gradient-to-r ${nextMilestone.color}`}
                />
              </div>
            </div>
          </div>
          <div className="text-center text-sm font-bold text-purple-700">
            {getDaysUntilNextMilestone()} more {getDaysUntilNextMilestone() === 1 ? 'day' : 'days'} to go!
          </div>
        </div>
      )}

      {/* All milestones */}
      <div className="mb-8">
        <h3 className="text-lg font-bold text-gray-900 mb-4">
          Streak Milestones
        </h3>
        <div className="space-y-3">
          {STREAK_MILESTONES.map((milestone, index) => (
            <motion.div
              key={milestone.days}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: settings.reducedMotion ? 0 : index * 0.05 }}
              className={`p-4 rounded-lg transition-all ${
                currentStreak >= milestone.days
                  ? `bg-gradient-to-r ${milestone.color} text-white shadow-lg`
                  : 'bg-gray-100 text-gray-700'
              }`}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="text-3xl">{milestone.icon}</div>
                  <div>
                    <div className="font-bold">{milestone.days} Days</div>
                    <div className={`text-sm ${
                      currentStreak >= milestone.days ? 'opacity-90' : 'opacity-70'
                    }`}>
                      {milestone.reward}
                    </div>
                  </div>
                </div>
                {currentStreak >= milestone.days && (
                  <div className="text-3xl">✓</div>
                )}
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Controls */}
      <div className="flex gap-3 mb-8">
        <button
          onClick={practiceToday}
          className="flex-1 py-4 bg-green-500 text-white rounded-xl font-bold text-lg hover:bg-green-600 transition-colors shadow-lg"
        >
          📅 Practice Today
        </button>
        <button
          onClick={breakStreak}
          className="px-6 py-4 bg-red-100 text-red-700 rounded-xl font-bold hover:bg-red-200 transition-colors"
        >
          Reset
        </button>
      </div>

      <div className="bg-orange-50 rounded-xl p-6">
        <h3 className="text-lg font-bold text-orange-900 mb-3">
          Build Your Streak!
        </h3>
        <ul className="space-y-2 text-sm text-orange-800">
          <li>• Practice every day to build your streak</li>
          <li>• Reach milestones to unlock special rewards</li>
          <li>• Missing a day breaks your current streak</li>
          <li>• Your longest streak is always saved</li>
          <li>• Even 5 minutes counts as daily practice!</li>
        </ul>
      </div>
    </div>
  );
}

// Compact streak display
export function StreakDisplay({ days }: { days: number }) {
  return (
    <div className="inline-flex items-center gap-2 bg-gradient-to-r from-orange-400 to-red-500 text-white px-4 py-2 rounded-full font-bold shadow-md">
      <span className="text-xl">🔥</span>
      <span>{days} day{days !== 1 ? 's' : ''}</span>
    </div>
  );
}

// Streak calendar
export function StreakCalendar({ practiceDays }: { practiceDays: Date[] }) {
  const today = new Date();
  const currentMonth = today.getMonth();
  const currentYear = today.getFullYear();

  const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
  const firstDayOfMonth = new Date(currentYear, currentMonth, 1).getDay();

  const isPracticeDay = (day: number) => {
    return practiceDays.some((date) => {
      return (
        date.getDate() === day &&
        date.getMonth() === currentMonth &&
        date.getFullYear() === currentYear
      );
    });
  };

  return (
    <div className="bg-white rounded-xl shadow-lg p-6">
      <h3 className="text-lg font-bold text-gray-900 mb-4 text-center">
        {today.toLocaleString('default', { month: 'long', year: 'numeric' })}
      </h3>

      <div className="grid grid-cols-7 gap-2">
        {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map((day) => (
          <div key={day} className="text-center text-xs font-bold text-gray-500 p-2">
            {day}
          </div>
        ))}

        {Array.from({ length: firstDayOfMonth }).map((_, i) => (
          <div key={`empty-${i}`} />
        ))}

        {Array.from({ length: daysInMonth }).map((_, i) => {
          const day = i + 1;
          const practiced = isPracticeDay(day);
          const isToday = day === today.getDate();

          return (
            <div
              key={day}
              className={`aspect-square flex items-center justify-center rounded-lg text-sm font-bold ${
                practiced
                  ? 'bg-green-500 text-white'
                  : isToday
                  ? 'bg-blue-100 text-blue-700 ring-2 ring-blue-500'
                  : 'bg-gray-100 text-gray-600'
              }`}
            >
              {day}
            </div>
          );
        })}
      </div>
    </div>
  );
}
