/**
 * Letter Mastery Tracking Component
 * Step 160 - Track and display letter learning progress
 */

import { motion } from 'framer-motion';
import { useSettingsStore } from '../store/useSettingsStore';

export interface LetterProgress {
  letter: string;
  level: 'not-started' | 'learning' | 'practicing' | 'mastered';
  accuracy: number;
  attempts: number;
  lastPracticed?: Date;
}

export default function LetterMastery({
  progress,
}: {
  progress: LetterProgress[];
}) {
  const { settings } = useSettingsStore();

  const getLevelColor = (level: LetterProgress['level']) => {
    switch (level) {
      case 'not-started': return 'bg-gray-300 text-gray-700';
      case 'learning': return 'bg-yellow-400 text-yellow-900';
      case 'practicing': return 'bg-blue-500 text-white';
      case 'mastered': return 'bg-success-500 text-white';
    }
  };

  const masteredCount = progress.filter(p => p.level === 'mastered').length;
  const totalLetters = 26;

  return (
    <div className="bg-white rounded-2xl shadow-xl p-8">
      <h2 className="text-2xl font-bold text-gray-800 mb-6 text-center">
        Letter Mastery Progress
      </h2>

      {/* Overall progress */}
      <div className="mb-8">
        <div className="flex justify-between text-sm text-gray-600 mb-2">
          <span>Overall Progress</span>
          <span>{masteredCount} / {totalLetters} mastered</span>
        </div>
        <div className="h-6 bg-gray-200 rounded-full overflow-hidden">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${(masteredCount / totalLetters) * 100}%` }}
            className="h-full bg-gradient-to-r from-primary-500 to-success-500"
          />
        </div>
      </div>

      {/* Letter grid */}
      <div className="grid grid-cols-6 md:grid-cols-9 gap-3">
        {progress.map((item, index) => (
          <motion.div
            key={item.letter}
            initial={{ opacity: 0, scale: 0 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{
              delay: settings.reducedMotion ? 0 : index * 0.02,
            }}
            className={`aspect-square rounded-xl flex items-center justify-center font-bold text-2xl ${getLevelColor(item.level)} shadow-md`}
            title={`${item.letter.toUpperCase()}: ${item.level} (${item.accuracy}% accuracy)`}
          >
            {item.letter.toUpperCase()}
            {item.level === 'mastered' && (
              <div className="absolute top-0 right-0 text-xs">✓</div>
            )}
          </motion.div>
        ))}
      </div>

      {/* Legend */}
      <div className="mt-8 grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { level: 'not-started', label: 'Not Started', color: 'bg-gray-300' },
          { level: 'learning', label: 'Learning', color: 'bg-yellow-400' },
          { level: 'practicing', label: 'Practicing', color: 'bg-blue-500' },
          { level: 'mastered', label: 'Mastered', color: 'bg-success-500' },
        ].map((item) => (
          <div key={item.level} className="flex items-center gap-2">
            <div className={`w-4 h-4 rounded ${item.color}`} />
            <span className="text-sm text-gray-700">{item.label}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

// Detailed progress report
export function DetailedProgressReport({
  progress,
}: {
  progress: LetterProgress[];
}) {
  const sortedByAccuracy = [...progress].sort((a, b) => a.accuracy - b.accuracy);

  return (
    <div className="bg-white rounded-2xl shadow-xl p-8">
      <h2 className="text-2xl font-bold text-gray-800 mb-6 text-center">
        Detailed Progress Report
      </h2>

      <div className="space-y-3">
        {sortedByAccuracy.slice(0, 10).map((item) => (
          <div
            key={item.letter}
            className="flex items-center gap-4 p-4 bg-gray-50 rounded-xl"
          >
            <div className="w-12 h-12 bg-primary-500 text-white rounded-lg flex items-center justify-center font-bold text-2xl">
              {item.letter.toUpperCase()}
            </div>

            <div className="flex-1">
              <div className="font-bold text-gray-900 capitalize">
                {item.level.replace('-', ' ')}
              </div>
              <div className="text-sm text-gray-600">
                {item.attempts} attempts • {item.accuracy}% accuracy
              </div>
            </div>

            <div className="w-32">
              <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                <div
                  className="h-full bg-primary-500"
                  style={{ width: `${item.accuracy}%` }}
                />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// Achievement badges
export function AchievementBadges({
  progress,
}: {
  progress: LetterProgress[];
}) {
  const { settings } = useSettingsStore();

  const achievements = [
    {
      id: 'first-letter',
      name: 'First Letter',
      icon: '🌟',
      unlocked: progress.some(p => p.level === 'mastered'),
    },
    {
      id: 'vowel-master',
      name: 'Vowel Master',
      icon: '🎯',
      unlocked: ['a', 'e', 'i', 'o', 'u'].every(v =>
        progress.find(p => p.letter === v && p.level === 'mastered')
      ),
    },
    {
      id: 'alphabet-complete',
      name: 'Alphabet Complete',
      icon: '🏆',
      unlocked: progress.filter(p => p.level === 'mastered').length === 26,
    },
  ];

  return (
    <div className="bg-white rounded-2xl shadow-xl p-8">
      <h2 className="text-2xl font-bold text-gray-800 mb-6 text-center">
        Achievements
      </h2>

      <div className="grid grid-cols-3 gap-6">
        {achievements.map((achievement, index) => (
          <motion.div
            key={achievement.id}
            initial={{ opacity: 0, scale: 0 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{
              delay: settings.reducedMotion ? 0 : index * 0.1,
            }}
            className={`text-center p-6 rounded-2xl ${
              achievement.unlocked
                ? 'bg-gradient-to-br from-yellow-400 to-orange-500'
                : 'bg-gray-200'
            }`}
          >
            <div className={`text-6xl mb-3 ${achievement.unlocked ? '' : 'grayscale opacity-50'}`}>
              {achievement.icon}
            </div>
            <div className={`font-bold ${achievement.unlocked ? 'text-white' : 'text-gray-500'}`}>
              {achievement.name}
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
