/**
 * Parent Dashboard Component
 * Step 251 - Build parent dashboard for guardians to monitor progress
 */

import { motion } from 'framer-motion';
import { useState } from 'react';
import { useSettingsStore } from '../store/useSettingsStore';

// Child profile
export interface ChildProfile {
  id: string;
  name: string;
  age: number;
  gradeLevel: string;
  avatar: string;
  joinDate: Date;
}

// Practice summary
export interface PracticeSummary {
  totalTime: number; // minutes this week
  sessions: number;
  averageSessionLength: number;
  streakDays: number;
  lastPracticed: Date;
  consistency: number; // 0-100
}

// Skill progress
export interface SkillProgress {
  category: string;
  current: number;
  gradeAverage: number;
  target: number;
  trend: 'improving' | 'stable' | 'declining';
  lastWeekImprovement: number;
}

// Achievement notification
export interface Achievement {
  id: string;
  title: string;
  description: string;
  earnedDate: Date;
  icon: string;
  isNew: boolean;
}

// Areas needing attention
export interface AttentionArea {
  area: string;
  description: string;
  priority: 'high' | 'medium' | 'low';
  suggestion: string;
  icon: string;
}

// Practice schedule
export interface ScheduledPractice {
  dayOfWeek: string;
  timeSlot: string;
  duration: number; // minutes
  completed: boolean;
  type: string;
}

// Weekly activity
export interface WeeklyActivity {
  day: string;
  date: Date;
  minutesPracticed: number;
  completed: boolean;
}

// Mock child profile
const generateMockProfile = (): ChildProfile => {
  return {
    id: 'child-1',
    name: 'Alex',
    age: 10,
    gradeLevel: '4th Grade',
    avatar: '👦',
    joinDate: new Date(Date.now() - 60 * 24 * 60 * 60 * 1000),
  };
};

// Mock practice summary
const generateMockSummary = (): PracticeSummary => {
  return {
    totalTime: 185,
    sessions: 12,
    averageSessionLength: 15.4,
    streakDays: 8,
    lastPracticed: new Date(Date.now() - 5 * 60 * 60 * 1000),
    consistency: 82,
  };
};

// Mock skill progress
const generateMockSkillProgress = (): SkillProgress[] => {
  return [
    {
      category: 'Typing Speed',
      current: 45,
      gradeAverage: 38,
      target: 50,
      trend: 'improving',
      lastWeekImprovement: 12,
    },
    {
      category: 'Accuracy',
      current: 92,
      gradeAverage: 88,
      target: 95,
      trend: 'improving',
      lastWeekImprovement: 3.5,
    },
    {
      category: 'Consistency',
      current: 78,
      gradeAverage: 75,
      target: 85,
      trend: 'stable',
      lastWeekImprovement: 0.5,
    },
    {
      category: 'Focus Time',
      current: 12,
      gradeAverage: 15,
      target: 18,
      trend: 'improving',
      lastWeekImprovement: 8,
    },
  ];
};

// Mock achievements
const generateMockAchievements = (): Achievement[] => {
  return [
    {
      id: '1',
      title: '7-Day Streak',
      description: 'Practiced for 7 consecutive days',
      earnedDate: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
      icon: '🔥',
      isNew: true,
    },
    {
      id: '2',
      title: 'Speed Milestone',
      description: 'Reached 45 WPM',
      earnedDate: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
      icon: '⚡',
      isNew: true,
    },
    {
      id: '3',
      title: 'Accuracy Star',
      description: 'Achieved 90%+ accuracy',
      earnedDate: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
      icon: '⭐',
      isNew: false,
    },
  ];
};

// Mock attention areas
const generateMockAttentionAreas = (): AttentionArea[] => {
  return [
    {
      area: 'Number Row Practice',
      description: 'Accuracy drops on number keys',
      priority: 'medium',
      suggestion: 'Encourage 5-10 minutes of number practice daily',
      icon: '🔢',
    },
    {
      area: 'Session Length',
      description: 'Practice sessions are getting shorter',
      priority: 'low',
      suggestion: 'Consider breaking into 2 shorter sessions per day',
      icon: '⏱️',
    },
  ];
};

// Mock schedule
const generateMockSchedule = (): ScheduledPractice[] => {
  return [
    {
      dayOfWeek: 'Monday',
      timeSlot: '4:00 PM',
      duration: 15,
      completed: true,
      type: 'Speed Practice',
    },
    {
      dayOfWeek: 'Tuesday',
      timeSlot: '4:00 PM',
      duration: 15,
      completed: true,
      type: 'Accuracy Focus',
    },
    {
      dayOfWeek: 'Wednesday',
      timeSlot: '4:00 PM',
      duration: 15,
      completed: true,
      type: 'Lessons',
    },
    {
      dayOfWeek: 'Thursday',
      timeSlot: '4:00 PM',
      duration: 15,
      completed: false,
      type: 'Games',
    },
    {
      dayOfWeek: 'Friday',
      timeSlot: '4:00 PM',
      duration: 20,
      completed: false,
      type: 'Fun Friday',
    },
  ];
};

// Mock weekly activity
const generateMockWeeklyActivity = (): WeeklyActivity[] => {
  const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  const now = Date.now();

  return days.map((day, index) => {
    const date = new Date(now - (6 - index) * 24 * 60 * 60 * 1000);
    const isWeekday = index >= 1 && index <= 5;
    const minutesPracticed = isWeekday ? 10 + Math.floor(Math.random() * 20) : Math.floor(Math.random() * 10);

    return {
      day,
      date,
      minutesPracticed,
      completed: minutesPracticed >= 10,
    };
  });
};

// Format time ago
const formatTimeAgo = (date: Date): string => {
  const now = Date.now();
  const diff = now - date.getTime();
  const hours = Math.floor(diff / (60 * 60 * 1000));
  const days = Math.floor(diff / (24 * 60 * 60 * 1000));

  if (hours < 1) return 'Less than an hour ago';
  if (hours < 24) return `${hours} hour${hours > 1 ? 's' : ''} ago`;
  return `${days} day${days > 1 ? 's' : ''} ago`;
};

// Custom hook for parent dashboard
export function useParentDashboard() {
  const [profile] = useState<ChildProfile>(generateMockProfile());
  const [summary] = useState<PracticeSummary>(generateMockSummary());
  const [skillProgress] = useState<SkillProgress[]>(generateMockSkillProgress());
  const [achievements] = useState<Achievement[]>(generateMockAchievements());
  const [attentionAreas] = useState<AttentionArea[]>(generateMockAttentionAreas());
  const [schedule] = useState<ScheduledPractice[]>(generateMockSchedule());
  const [weeklyActivity] = useState<WeeklyActivity[]>(generateMockWeeklyActivity());
  const [timeRange, setTimeRange] = useState<'week' | 'month'>('week');

  const getNewAchievementsCount = () => {
    return achievements.filter((a) => a.isNew).length;
  };

  const getScheduleCompletionRate = () => {
    const completed = schedule.filter((s) => s.completed).length;
    return Math.round((completed / schedule.length) * 100);
  };

  return {
    profile,
    summary,
    skillProgress,
    achievements,
    attentionAreas,
    schedule,
    weeklyActivity,
    timeRange,
    setTimeRange,
    newAchievementsCount: getNewAchievementsCount(),
    scheduleCompletionRate: getScheduleCompletionRate(),
  };
}

// Main parent dashboard component
export default function ParentDashboard() {
  const {
    profile,
    summary,
    skillProgress,
    achievements,
    attentionAreas,
    schedule,
    weeklyActivity,
    timeRange,
    setTimeRange,
    newAchievementsCount,
    scheduleCompletionRate,
  } = useParentDashboard();

  const { settings } = useSettingsStore();

  return (
    <div className="bg-white rounded-2xl shadow-xl p-8">
      <h2 className="text-2xl font-bold text-gray-800 mb-6 text-center">
        👨‍👩‍👧‍👦 Parent Dashboard
      </h2>

      {/* Child profile header */}
      <div className="mb-8 bg-gradient-to-br from-purple-400 to-purple-600 rounded-xl p-6 text-white">
        <div className="flex items-center gap-4 mb-4">
          <div className="text-6xl">{profile.avatar}</div>
          <div>
            <div className="text-3xl font-bold">{profile.name}</div>
            <div className="text-lg opacity-90">{profile.gradeLevel} • Age {profile.age}</div>
            <div className="text-sm opacity-80">
              Member since {profile.joinDate.toLocaleDateString()}
            </div>
          </div>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4">
          <div className="bg-white/20 rounded-lg p-3">
            <div className="text-sm opacity-90">This Week</div>
            <div className="text-2xl font-bold">{summary.totalTime} min</div>
          </div>
          <div className="bg-white/20 rounded-lg p-3">
            <div className="text-sm opacity-90">Sessions</div>
            <div className="text-2xl font-bold">{summary.sessions}</div>
          </div>
          <div className="bg-white/20 rounded-lg p-3">
            <div className="text-sm opacity-90">Current Streak</div>
            <div className="text-2xl font-bold">{summary.streakDays} days</div>
          </div>
          <div className="bg-white/20 rounded-lg p-3">
            <div className="text-sm opacity-90">Last Practice</div>
            <div className="text-sm font-bold">{formatTimeAgo(summary.lastPracticed)}</div>
          </div>
        </div>
      </div>

      {/* Time range selector */}
      <div className="mb-6 flex gap-2">
        <button
          onClick={() => setTimeRange('week')}
          className={`px-6 py-2 rounded-lg font-bold transition-colors ${
            timeRange === 'week'
              ? 'bg-purple-500 text-white'
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          }`}
        >
          This Week
        </button>
        <button
          onClick={() => setTimeRange('month')}
          className={`px-6 py-2 rounded-lg font-bold transition-colors ${
            timeRange === 'month'
              ? 'bg-purple-500 text-white'
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          }`}
        >
          This Month
        </button>
      </div>

      {/* New achievements notification */}
      {newAchievementsCount > 0 && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-6 bg-yellow-50 border-2 border-yellow-200 rounded-xl p-4"
        >
          <div className="flex items-center gap-3">
            <div className="text-3xl">🎉</div>
            <div>
              <div className="font-bold text-yellow-900">
                {newAchievementsCount} New Achievement{newAchievementsCount > 1 ? 's' : ''}!
              </div>
              <div className="text-sm text-yellow-800">
                {profile.name} earned new badges this week
              </div>
            </div>
          </div>
        </motion.div>
      )}

      {/* Skill progress comparison */}
      <div className="mb-8 bg-gray-50 rounded-xl p-6">
        <h3 className="text-lg font-bold text-gray-900 mb-4">
          Skill Progress vs. {profile.gradeLevel} Average
        </h3>
        <div className="space-y-4">
          {skillProgress.map((skill, index) => (
            <motion.div
              key={skill.category}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: settings.reducedMotion ? 0 : index * 0.1 }}
              className="bg-white rounded-lg p-4"
            >
              <div className="flex items-center justify-between mb-2">
                <div>
                  <div className="font-bold text-gray-900">{skill.category}</div>
                  <div className="text-sm text-gray-600">
                    Target: {skill.target} • Grade Avg: {skill.gradeAverage}
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-2xl font-bold text-purple-600">{skill.current}</div>
                  <div className={`text-sm font-bold flex items-center gap-1 ${
                    skill.trend === 'improving' ? 'text-green-600' :
                    skill.trend === 'declining' ? 'text-red-600' :
                    'text-gray-600'
                  }`}>
                    {skill.trend === 'improving' && '↗'}
                    {skill.trend === 'declining' && '↘'}
                    {skill.trend === 'stable' && '→'}
                    {skill.lastWeekImprovement > 0 ? '+' : ''}{skill.lastWeekImprovement.toFixed(1)}%
                  </div>
                </div>
              </div>
              <div className="relative h-3 bg-gray-200 rounded-full overflow-hidden">
                {/* Grade average marker */}
                <div
                  className="absolute top-0 bottom-0 w-1 bg-blue-400 z-10"
                  style={{ left: `${(skill.gradeAverage / skill.target) * 100}%` }}
                />
                {/* Current progress */}
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${(skill.current / skill.target) * 100}%` }}
                  transition={{ duration: settings.reducedMotion ? 0 : 1, delay: index * 0.1 }}
                  className={`h-full ${
                    skill.current >= skill.target ? 'bg-gradient-to-r from-green-400 to-green-600' :
                    skill.current >= skill.gradeAverage ? 'bg-gradient-to-r from-purple-400 to-purple-600' :
                    'bg-gradient-to-r from-orange-400 to-orange-600'
                  }`}
                />
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Weekly activity chart */}
      <div className="mb-8 bg-gray-50 rounded-xl p-6">
        <h3 className="text-lg font-bold text-gray-900 mb-4">Weekly Practice Activity</h3>
        <div className="flex items-end justify-between gap-2 h-32 mb-4">
          {weeklyActivity.map((day, index) => {
            const targetMinutes = 15;
            const heightPercentage = Math.min((day.minutesPracticed / targetMinutes) * 100, 100);

            return (
              <motion.div
                key={day.day}
                initial={{ scaleY: 0 }}
                animate={{ scaleY: 1 }}
                transition={{ delay: settings.reducedMotion ? 0 : index * 0.1 }}
                className="flex-1 flex flex-col items-center gap-2"
                style={{ transformOrigin: 'bottom' }}
              >
                <div className="flex-1 w-full flex items-end">
                  <div
                    className={`w-full rounded-t-lg relative group cursor-pointer ${
                      day.completed ? 'bg-gradient-to-t from-green-500 to-green-300' :
                      day.minutesPracticed > 0 ? 'bg-gradient-to-t from-yellow-500 to-yellow-300' :
                      'bg-gradient-to-t from-gray-300 to-gray-200'
                    }`}
                    style={{ height: `${heightPercentage}%` }}
                  >
                    <div className="absolute bottom-full mb-2 left-1/2 transform -translate-x-1/2 bg-gray-900 text-white px-2 py-1 rounded text-xs whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
                      {day.minutesPracticed} minutes
                      <br />
                      {day.date.toLocaleDateString()}
                    </div>
                  </div>
                </div>
                <div className="text-xs font-bold text-gray-700">{day.day}</div>
                {day.completed && <div className="text-green-600 text-xs">✓</div>}
              </motion.div>
            );
          })}
        </div>
        <div className="text-sm text-gray-600 text-center">
          Daily goal: 15 minutes • {weeklyActivity.filter((d) => d.completed).length} of 7 days completed
        </div>
      </div>

      {/* Practice schedule */}
      <div className="mb-8 bg-gray-50 rounded-xl p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-bold text-gray-900">Practice Schedule</h3>
          <div className="text-sm font-bold text-purple-600">
            {scheduleCompletionRate}% Complete
          </div>
        </div>
        <div className="space-y-2">
          {schedule.map((item, index) => (
            <motion.div
              key={item.dayOfWeek}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: settings.reducedMotion ? 0 : index * 0.05 }}
              className={`flex items-center justify-between p-3 rounded-lg ${
                item.completed ? 'bg-green-50' : 'bg-white'
              }`}
            >
              <div className="flex items-center gap-3">
                <div className={`text-2xl ${item.completed ? 'opacity-50' : ''}`}>
                  {item.completed ? '✅' : '⏰'}
                </div>
                <div>
                  <div className="font-bold text-gray-900">{item.dayOfWeek}</div>
                  <div className="text-sm text-gray-600">
                    {item.timeSlot} • {item.duration} min • {item.type}
                  </div>
                </div>
              </div>
              <div className={`px-3 py-1 rounded-full text-xs font-bold ${
                item.completed ? 'bg-green-200 text-green-800' : 'bg-gray-200 text-gray-700'
              }`}>
                {item.completed ? 'Completed' : 'Scheduled'}
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Recent achievements */}
      <div className="mb-8 bg-gray-50 rounded-xl p-6">
        <h3 className="text-lg font-bold text-gray-900 mb-4">Recent Achievements</h3>
        <div className="space-y-3">
          {achievements.map((achievement, index) => (
            <motion.div
              key={achievement.id}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: settings.reducedMotion ? 0 : index * 0.1 }}
              className={`flex items-center justify-between p-4 rounded-lg ${
                achievement.isNew ? 'bg-yellow-50 border-2 border-yellow-200' : 'bg-white'
              }`}
            >
              <div className="flex items-center gap-4">
                <div className="text-4xl">{achievement.icon}</div>
                <div>
                  <div className="font-bold text-gray-900 flex items-center gap-2">
                    {achievement.title}
                    {achievement.isNew && (
                      <span className="px-2 py-0.5 bg-yellow-400 text-yellow-900 rounded-full text-xs font-bold">
                        NEW
                      </span>
                    )}
                  </div>
                  <div className="text-sm text-gray-600">{achievement.description}</div>
                  <div className="text-xs text-gray-500 mt-1">
                    {achievement.earnedDate.toLocaleDateString()}
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Areas needing attention */}
      {attentionAreas.length > 0 && (
        <div className="bg-blue-50 rounded-xl p-6">
          <h3 className="text-lg font-bold text-gray-900 mb-4">
            💡 Suggestions for Improvement
          </h3>
          <div className="space-y-3">
            {attentionAreas.map((area, index) => (
              <motion.div
                key={area.area}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: settings.reducedMotion ? 0 : index * 0.1 }}
                className="bg-white rounded-lg p-4"
              >
                <div className="flex items-start gap-3">
                  <div className="text-2xl">{area.icon}</div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <div className="font-bold text-gray-900">{area.area}</div>
                      <div className={`px-2 py-0.5 rounded text-xs font-bold ${
                        area.priority === 'high' ? 'bg-red-100 text-red-700' :
                        area.priority === 'medium' ? 'bg-yellow-100 text-yellow-700' :
                        'bg-blue-100 text-blue-700'
                      }`}>
                        {area.priority.toUpperCase()}
                      </div>
                    </div>
                    <div className="text-sm text-gray-600 mb-2">{area.description}</div>
                    <div className="text-sm bg-blue-50 border-l-4 border-blue-500 p-2 rounded">
                      <span className="font-bold">Suggestion:</span> {area.suggestion}
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
