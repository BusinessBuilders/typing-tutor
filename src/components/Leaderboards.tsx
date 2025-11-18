/**
 * Leaderboards Component
 * Step 219 - Add leaderboards for competitive tracking
 */

import { motion } from 'framer-motion';
import { useState } from 'react';
import { useSettingsStore } from '../store/useSettingsStore';

// Leaderboard entry interface
export interface LeaderboardEntry {
  id: string;
  rank: number;
  username: string;
  avatar: string;
  score: number;
  level: number;
  badge?: string;
  isCurrentUser?: boolean;
}

// Leaderboard category
export type LeaderboardCategory =
  | 'speed'
  | 'accuracy'
  | 'xp'
  | 'streak'
  | 'lessons'
  | 'points';

// Time period
export type TimePeriod = 'daily' | 'weekly' | 'monthly' | 'alltime';

// Mock leaderboard data
const generateMockData = (category: LeaderboardCategory, count: number = 50): LeaderboardEntry[] => {
  const usernames = [
    'TypeMaster3000', 'QuickFingers', 'SpeedDemon', 'AccuracyKing', 'LetterLegend',
    'KeyboardNinja', 'TypingWhiz', 'FastTyper99', 'PrecisionPro', 'WordWizard',
    'SwiftKeys', 'RapidTypist', 'PerfectHands', 'SpeedStar', 'LetterAce',
    'KeyboardChamp', 'TypingGuru', 'QuickType', 'AccurateTim', 'SpeedyMike',
    'FastFingers', 'LetterMaster', 'TypePro', 'KeyWizard', 'SwiftTyper',
  ];

  const avatars = ['👨', '👩', '🧑', '👦', '👧', '🧒', '👴', '👵', '🧓', '👱', '👨‍💼', '👩‍💼', '👨‍🎓', '👩‍🎓', '👨‍🏫', '👩‍🏫'];
  const badges = ['🏆', '🥇', '🥈', '🥉', '⭐', '💎', '👑', '🎖️', '🏅'];

  return Array.from({ length: count }, (_, i) => {
    const rank = i + 1;
    const baseScore = category === 'speed'
      ? 100 - i * 2
      : category === 'accuracy'
      ? 99 - i * 0.5
      : 10000 - i * 100;

    return {
      id: `user_${i}`,
      rank,
      username: i === 4 ? 'You' : usernames[i % usernames.length] + (i > usernames.length ? i : ''),
      avatar: avatars[i % avatars.length],
      score: Math.max(0, Math.round(baseScore)),
      level: Math.max(1, 50 - Math.floor(i / 2)),
      badge: rank <= 3 ? badges[rank - 1] : rank <= 10 ? badges[Math.floor(Math.random() * badges.length)] : undefined,
      isCurrentUser: i === 4,
    };
  });
};

// Custom hook for leaderboards
export function useLeaderboards() {
  const [category, setCategory] = useState<LeaderboardCategory>('xp');
  const [timePeriod, setTimePeriod] = useState<TimePeriod>('alltime');
  const [entries, setEntries] = useState<LeaderboardEntry[]>(generateMockData('xp'));

  const changeCategory = (newCategory: LeaderboardCategory) => {
    setCategory(newCategory);
    setEntries(generateMockData(newCategory));
  };

  const changeTimePeriod = (newPeriod: TimePeriod) => {
    setTimePeriod(newPeriod);
    // In a real app, this would fetch different data
    setEntries(generateMockData(category));
  };

  const getCurrentUserRank = () => {
    const userEntry = entries.find((e) => e.isCurrentUser);
    return userEntry?.rank || null;
  };

  const getTopEntries = (count: number = 10) => {
    return entries.slice(0, count);
  };

  const getUserEntry = () => {
    return entries.find((e) => e.isCurrentUser) || null;
  };

  return {
    entries,
    category,
    timePeriod,
    changeCategory,
    changeTimePeriod,
    getCurrentUserRank,
    getTopEntries,
    getUserEntry,
  };
}

// Main leaderboards component
export default function Leaderboards() {
  const {
    entries,
    category,
    timePeriod,
    changeCategory,
    changeTimePeriod,
    getTopEntries,
    getUserEntry,
  } = useLeaderboards();

  const { settings } = useSettingsStore();
  const [showFullList, setShowFullList] = useState(false);

  const categories: Array<{
    value: LeaderboardCategory;
    label: string;
    icon: string;
    unit: string;
  }> = [
    { value: 'xp', label: 'Total XP', icon: '⚡', unit: 'XP' },
    { value: 'speed', label: 'Speed', icon: '🚀', unit: 'WPM' },
    { value: 'accuracy', label: 'Accuracy', icon: '🎯', unit: '%' },
    { value: 'streak', label: 'Streak', icon: '🔥', unit: 'days' },
    { value: 'lessons', label: 'Lessons', icon: '📚', unit: 'completed' },
    { value: 'points', label: 'Points', icon: '💎', unit: 'pts' },
  ];

  const periods: Array<{ value: TimePeriod; label: string }> = [
    { value: 'daily', label: 'Today' },
    { value: 'weekly', label: 'This Week' },
    { value: 'monthly', label: 'This Month' },
    { value: 'alltime', label: 'All Time' },
  ];

  const currentCategory = categories.find((c) => c.value === category)!;
  const userEntry = getUserEntry();
  const topEntries = getTopEntries(showFullList ? 50 : 10);

  return (
    <div className="bg-white rounded-2xl shadow-xl p-8">
      <h2 className="text-2xl font-bold text-gray-800 mb-6 text-center">
        🏆 Leaderboards
      </h2>

      {/* Category selection */}
      <div className="mb-6">
        <label className="block text-sm font-bold text-gray-700 mb-3">
          Category:
        </label>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-2">
          {categories.map(({ value, label, icon }, index) => (
            <motion.button
              key={value}
              onClick={() => changeCategory(value)}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: settings.reducedMotion ? 0 : index * 0.05 }}
              whileHover={{ scale: settings.reducedMotion ? 1 : 1.05 }}
              className={`p-3 rounded-lg font-bold transition-all ${
                category === value
                  ? 'bg-primary-500 text-white shadow-lg ring-4 ring-primary-200'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              <div className="text-2xl mb-1">{icon}</div>
              <div className="text-xs">{label}</div>
            </motion.button>
          ))}
        </div>
      </div>

      {/* Time period selection */}
      <div className="mb-6">
        <label className="block text-sm font-bold text-gray-700 mb-3">
          Time Period:
        </label>
        <div className="flex gap-2">
          {periods.map(({ value, label }) => (
            <button
              key={value}
              onClick={() => changeTimePeriod(value)}
              className={`flex-1 py-2 px-3 rounded-lg font-medium transition-all ${
                timePeriod === value
                  ? 'bg-primary-500 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      {/* User's rank */}
      {userEntry && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-6 bg-gradient-to-r from-primary-500 to-purple-500 text-white rounded-xl p-4"
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="text-3xl">{userEntry.avatar}</div>
              <div>
                <div className="text-sm opacity-90">Your Rank</div>
                <div className="text-2xl font-bold">#{userEntry.rank}</div>
              </div>
            </div>
            <div className="text-right">
              <div className="text-sm opacity-90">{currentCategory.label}</div>
              <div className="text-2xl font-bold">
                {userEntry.score} {currentCategory.unit}
              </div>
            </div>
          </div>
        </motion.div>
      )}

      {/* Top 3 podium */}
      <div className="mb-8">
        <h3 className="text-lg font-bold text-gray-900 mb-4 text-center">
          Top 3 Champions
        </h3>
        <div className="flex items-end justify-center gap-4">
          {/* 2nd place */}
          {entries[1] && (
            <PodiumCard
              entry={entries[1]}
              height="120px"
              color="from-gray-400 to-gray-500"
              medal="🥈"
              settings={settings}
              unit={currentCategory.unit}
            />
          )}

          {/* 1st place */}
          {entries[0] && (
            <PodiumCard
              entry={entries[0]}
              height="160px"
              color="from-yellow-400 to-yellow-600"
              medal="🥇"
              settings={settings}
              unit={currentCategory.unit}
            />
          )}

          {/* 3rd place */}
          {entries[2] && (
            <PodiumCard
              entry={entries[2]}
              height="100px"
              color="from-orange-700 to-orange-900"
              medal="🥉"
              settings={settings}
              unit={currentCategory.unit}
            />
          )}
        </div>
      </div>

      {/* Full leaderboard */}
      <div className="bg-gray-50 rounded-xl p-6">
        <h3 className="text-lg font-bold text-gray-900 mb-4">
          Full Rankings
        </h3>

        <div className="space-y-2 max-h-96 overflow-y-auto">
          {topEntries.map((entry, index) => (
            <LeaderboardRow
              key={entry.id}
              entry={entry}
              index={index}
              settings={settings}
              unit={currentCategory.unit}
            />
          ))}
        </div>

        {!showFullList && entries.length > 10 && (
          <button
            onClick={() => setShowFullList(true)}
            className="w-full mt-4 py-3 bg-primary-500 text-white rounded-lg font-bold hover:bg-primary-600 transition-colors"
          >
            Show More ({entries.length - 10} more)
          </button>
        )}

        {showFullList && (
          <button
            onClick={() => setShowFullList(false)}
            className="w-full mt-4 py-3 bg-gray-200 text-gray-700 rounded-lg font-bold hover:bg-gray-300 transition-colors"
          >
            Show Less
          </button>
        )}
      </div>

      <div className="mt-8 bg-blue-50 rounded-xl p-6">
        <h3 className="text-lg font-bold text-blue-900 mb-3">
          Compete & Improve!
        </h3>
        <ul className="space-y-2 text-sm text-blue-800">
          <li>• Rankings update in real-time as you practice</li>
          <li>• Compete with friends and other learners</li>
          <li>• Track your progress across different categories</li>
          <li>• Climb the ranks by practicing regularly</li>
          <li>• Earn special badges for top rankings</li>
        </ul>
      </div>
    </div>
  );
}

// Podium card for top 3
function PodiumCard({
  entry,
  height,
  color,
  medal,
  settings,
  unit,
}: {
  entry: LeaderboardEntry;
  height: string;
  color: string;
  medal: string;
  settings: any;
  unit: string;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 50 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: settings.reducedMotion ? 0 : entry.rank * 0.1 }}
      className="flex-1 max-w-[140px]"
    >
      <div className="text-center mb-3">
        <motion.div
          animate={{ rotate: [0, -5, 5, -5, 5, 0] }}
          transition={{ duration: 2, repeat: Infinity, repeatDelay: 3 }}
          className="text-5xl mb-2"
        >
          {entry.avatar}
        </motion.div>
        <div className="font-bold text-gray-900 truncate">{entry.username}</div>
        <div className="text-sm text-gray-600">Level {entry.level}</div>
        <div className="text-lg font-bold text-primary-600">
          {entry.score} {unit}
        </div>
      </div>

      <div
        className={`bg-gradient-to-br ${color} rounded-t-xl flex items-center justify-center shadow-lg`}
        style={{ height }}
      >
        <div className="text-6xl">{medal}</div>
      </div>
    </motion.div>
  );
}

// Leaderboard row
function LeaderboardRow({
  entry,
  index,
  settings,
  unit,
}: {
  entry: LeaderboardEntry;
  index: number;
  settings: any;
  unit: string;
}) {
  const getRankColor = (rank: number) => {
    if (rank === 1) return 'text-yellow-600';
    if (rank === 2) return 'text-gray-500';
    if (rank === 3) return 'text-orange-700';
    return 'text-gray-700';
  };

  const getRankBg = (rank: number) => {
    if (rank === 1) return 'bg-yellow-100';
    if (rank === 2) return 'bg-gray-100';
    if (rank === 3) return 'bg-orange-100';
    return 'bg-white';
  };

  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: settings.reducedMotion ? 0 : index * 0.03 }}
      className={`flex items-center gap-4 p-4 rounded-lg transition-all ${
        entry.isCurrentUser
          ? 'bg-primary-100 ring-2 ring-primary-500'
          : getRankBg(entry.rank)
      }`}
    >
      {/* Rank */}
      <div className={`text-2xl font-bold w-12 text-center ${getRankColor(entry.rank)}`}>
        {entry.rank <= 3 && (
          <span className="text-3xl">
            {entry.rank === 1 ? '🥇' : entry.rank === 2 ? '🥈' : '🥉'}
          </span>
        )}
        {entry.rank > 3 && `#${entry.rank}`}
      </div>

      {/* Avatar */}
      <div className="text-3xl">{entry.avatar}</div>

      {/* User info */}
      <div className="flex-1">
        <div className="flex items-center gap-2">
          <div className={`font-bold ${
            entry.isCurrentUser ? 'text-primary-700' : 'text-gray-900'
          }`}>
            {entry.username}
          </div>
          {entry.badge && <span className="text-xl">{entry.badge}</span>}
          {entry.isCurrentUser && (
            <span className="text-xs px-2 py-1 bg-primary-500 text-white rounded-full font-bold">
              You
            </span>
          )}
        </div>
        <div className="text-sm text-gray-600">Level {entry.level}</div>
      </div>

      {/* Score */}
      <div className="text-right">
        <div className={`text-2xl font-bold ${
          entry.isCurrentUser ? 'text-primary-700' : 'text-gray-900'
        }`}>
          {entry.score}
        </div>
        <div className="text-sm text-gray-600">{unit}</div>
      </div>
    </motion.div>
  );
}

// Mini leaderboard widget
export function MiniLeaderboard({ category = 'xp', limit = 5 }: {
  category?: LeaderboardCategory;
  limit?: number;
}) {
  const entries = generateMockData(category, limit);

  return (
    <div className="bg-white rounded-xl shadow-lg p-4">
      <h3 className="text-lg font-bold text-gray-900 mb-3 flex items-center gap-2">
        🏆 Top {limit}
      </h3>
      <div className="space-y-2">
        {entries.map((entry) => (
          <div
            key={entry.id}
            className="flex items-center gap-2 text-sm"
          >
            <div className="font-bold text-gray-600 w-6">#{entry.rank}</div>
            <div className="text-xl">{entry.avatar}</div>
            <div className="flex-1 font-medium text-gray-900 truncate">
              {entry.username}
            </div>
            <div className="font-bold text-primary-600">{entry.score}</div>
          </div>
        ))}
      </div>
    </div>
  );
}
