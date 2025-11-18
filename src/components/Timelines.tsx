/**
 * Timelines Component
 * Step 257 - Build timelines for progress visualization
 */

import { motion } from 'framer-motion';
import { useState } from 'react';
import { useSettingsStore } from '../store/useSettingsStore';

// Timeline event types
export type TimelineEventType = 'achievement' | 'milestone' | 'lesson' | 'test' | 'practice' | 'goal';

// Timeline event
export interface TimelineEvent {
  id: string;
  type: TimelineEventType;
  title: string;
  description: string;
  date: Date;
  icon: string;
  value?: number;
  unit?: string;
  highlighted: boolean;
  metadata?: {
    speed?: number;
    accuracy?: number;
    duration?: number;
  };
}

// Timeline filter
export type TimelineFilter = 'all' | TimelineEventType;

// Timeline period
export type TimelinePeriod = 'day' | 'week' | 'month' | 'year' | 'all';

// Generate mock timeline events
const generateMockTimeline = (): TimelineEvent[] => {
  const now = Date.now();
  const events: TimelineEvent[] = [];

  // Recent achievements
  events.push({
    id: 'evt-1',
    type: 'achievement',
    title: '7-Day Streak Achievement',
    description: 'Practiced for 7 consecutive days',
    date: new Date(now - 1 * 24 * 60 * 60 * 1000),
    icon: '🔥',
    value: 7,
    unit: 'days',
    highlighted: true,
  });

  events.push({
    id: 'evt-2',
    type: 'milestone',
    title: 'Reached 70 WPM',
    description: 'Achieved new typing speed milestone',
    date: new Date(now - 3 * 24 * 60 * 60 * 1000),
    icon: '⚡',
    value: 70,
    unit: 'WPM',
    highlighted: true,
    metadata: { speed: 70, accuracy: 94.5, duration: 300 },
  });

  events.push({
    id: 'evt-3',
    type: 'practice',
    title: 'Speed Practice Session',
    description: 'Completed focused speed training',
    date: new Date(now - 5 * 24 * 60 * 60 * 1000),
    icon: '💪',
    highlighted: false,
    metadata: { speed: 68, accuracy: 93.2, duration: 900 },
  });

  events.push({
    id: 'evt-4',
    type: 'lesson',
    title: 'Completed "Numbers Row"',
    description: 'Mastered number keys typing',
    date: new Date(now - 7 * 24 * 60 * 60 * 1000),
    icon: '📚',
    highlighted: false,
  });

  events.push({
    id: 'evt-5',
    type: 'test',
    title: 'Typing Speed Test',
    description: 'Passed intermediate level test',
    date: new Date(now - 10 * 24 * 60 * 60 * 1000),
    icon: '📝',
    value: 65,
    unit: 'WPM',
    highlighted: false,
    metadata: { speed: 65, accuracy: 92.8, duration: 180 },
  });

  events.push({
    id: 'evt-6',
    type: 'goal',
    title: 'Set New Goal',
    description: 'Goal: Reach 80 WPM',
    date: new Date(now - 14 * 24 * 60 * 60 * 1000),
    icon: '🎯',
    value: 80,
    unit: 'WPM',
    highlighted: false,
  });

  events.push({
    id: 'evt-7',
    type: 'achievement',
    title: 'First 50 WPM',
    description: 'Reached first major speed milestone',
    date: new Date(now - 21 * 24 * 60 * 60 * 1000),
    icon: '🏆',
    value: 50,
    unit: 'WPM',
    highlighted: true,
  });

  events.push({
    id: 'evt-8',
    type: 'milestone',
    title: '90% Accuracy Milestone',
    description: 'Achieved consistent accuracy',
    date: new Date(now - 28 * 24 * 60 * 60 * 1000),
    icon: '🎯',
    value: 90,
    unit: '%',
    highlighted: true,
  });

  events.push({
    id: 'evt-9',
    type: 'lesson',
    title: 'Completed "Home Row"',
    description: 'Mastered home row keys',
    date: new Date(now - 35 * 24 * 60 * 60 * 1000),
    icon: '📚',
    highlighted: false,
  });

  events.push({
    id: 'evt-10',
    type: 'achievement',
    title: 'Started Journey',
    description: 'Began typing practice journey',
    date: new Date(now - 60 * 24 * 60 * 60 * 1000),
    icon: '🌱',
    highlighted: true,
  });

  return events.sort((a, b) => b.date.getTime() - a.date.getTime());
};

// Custom hook for timelines
export function useTimelines() {
  const [events] = useState<TimelineEvent[]>(generateMockTimeline());
  const [filter, setFilter] = useState<TimelineFilter>('all');
  const [period, setPeriod] = useState<TimelinePeriod>('all');
  const [viewStyle, setViewStyle] = useState<'vertical' | 'horizontal'>('vertical');

  const getFilteredEvents = () => {
    let filtered = events;

    // Filter by type
    if (filter !== 'all') {
      filtered = filtered.filter((e) => e.type === filter);
    }

    // Filter by period
    const now = Date.now();
    const periods = {
      day: 24 * 60 * 60 * 1000,
      week: 7 * 24 * 60 * 60 * 1000,
      month: 30 * 24 * 60 * 60 * 1000,
      year: 365 * 24 * 60 * 60 * 1000,
      all: Infinity,
    };

    const cutoff = now - periods[period];
    filtered = filtered.filter((e) => e.date.getTime() >= cutoff);

    return filtered;
  };

  const getEventStats = () => {
    return {
      total: events.length,
      achievements: events.filter((e) => e.type === 'achievement').length,
      milestones: events.filter((e) => e.type === 'milestone').length,
      lessons: events.filter((e) => e.type === 'lesson').length,
      tests: events.filter((e) => e.type === 'test').length,
      highlighted: events.filter((e) => e.highlighted).length,
    };
  };

  return {
    events: getFilteredEvents(),
    allEvents: events,
    filter,
    setFilter,
    period,
    setPeriod,
    viewStyle,
    setViewStyle,
    stats: getEventStats(),
  };
}

// Get event type color
const getEventColor = (type: TimelineEventType): string => {
  switch (type) {
    case 'achievement':
      return 'bg-yellow-50 border-yellow-300';
    case 'milestone':
      return 'bg-purple-50 border-purple-300';
    case 'lesson':
      return 'bg-blue-50 border-blue-300';
    case 'test':
      return 'bg-green-50 border-green-300';
    case 'practice':
      return 'bg-orange-50 border-orange-300';
    case 'goal':
      return 'bg-pink-50 border-pink-300';
  }
};

// Get event badge color
const getBadgeColor = (type: TimelineEventType): string => {
  switch (type) {
    case 'achievement':
      return 'bg-yellow-500';
    case 'milestone':
      return 'bg-purple-500';
    case 'lesson':
      return 'bg-blue-500';
    case 'test':
      return 'bg-green-500';
    case 'practice':
      return 'bg-orange-500';
    case 'goal':
      return 'bg-pink-500';
  }
};

// Format relative time
const formatRelativeTime = (date: Date): string => {
  const now = Date.now();
  const diff = now - date.getTime();
  const days = Math.floor(diff / (24 * 60 * 60 * 1000));

  if (days === 0) return 'Today';
  if (days === 1) return 'Yesterday';
  if (days < 7) return `${days} days ago`;
  if (days < 30) return `${Math.floor(days / 7)} weeks ago`;
  if (days < 365) return `${Math.floor(days / 30)} months ago`;
  return `${Math.floor(days / 365)} years ago`;
};

// Main timelines component
export default function Timelines() {
  const {
    events,
    filter,
    setFilter,
    period,
    setPeriod,
    viewStyle,
    setViewStyle,
    stats,
  } = useTimelines();

  const { settings } = useSettingsStore();

  return (
    <div className="bg-white rounded-2xl shadow-xl p-8">
      <h2 className="text-2xl font-bold text-gray-800 mb-6 text-center">
        📅 Progress Timeline
      </h2>

      {/* Stats overview */}
      <div className="mb-8 grid grid-cols-2 md:grid-cols-6 gap-3">
        <div className="bg-gradient-to-br from-blue-400 to-blue-600 rounded-lg p-3 text-white text-center">
          <div className="text-2xl font-bold">{stats.total}</div>
          <div className="text-xs opacity-90">Total Events</div>
        </div>
        <div className="bg-gradient-to-br from-yellow-400 to-yellow-600 rounded-lg p-3 text-white text-center">
          <div className="text-2xl font-bold">{stats.achievements}</div>
          <div className="text-xs opacity-90">Achievements</div>
        </div>
        <div className="bg-gradient-to-br from-purple-400 to-purple-600 rounded-lg p-3 text-white text-center">
          <div className="text-2xl font-bold">{stats.milestones}</div>
          <div className="text-xs opacity-90">Milestones</div>
        </div>
        <div className="bg-gradient-to-br from-green-400 to-green-600 rounded-lg p-3 text-white text-center">
          <div className="text-2xl font-bold">{stats.lessons}</div>
          <div className="text-xs opacity-90">Lessons</div>
        </div>
        <div className="bg-gradient-to-br from-orange-400 to-orange-600 rounded-lg p-3 text-white text-center">
          <div className="text-2xl font-bold">{stats.tests}</div>
          <div className="text-xs opacity-90">Tests</div>
        </div>
        <div className="bg-gradient-to-br from-pink-400 to-pink-600 rounded-lg p-3 text-white text-center">
          <div className="text-2xl font-bold">{stats.highlighted}</div>
          <div className="text-xs opacity-90">Highlighted</div>
        </div>
      </div>

      {/* Filters */}
      <div className="mb-6 space-y-4">
        {/* Period filter */}
        <div>
          <div className="text-sm font-bold text-gray-700 mb-2">Time Period:</div>
          <div className="flex gap-2 flex-wrap">
            {[
              { period: 'day' as const, label: 'Today' },
              { period: 'week' as const, label: 'This Week' },
              { period: 'month' as const, label: 'This Month' },
              { period: 'year' as const, label: 'This Year' },
              { period: 'all' as const, label: 'All Time' },
            ].map(({ period: p, label }) => (
              <button
                key={p}
                onClick={() => setPeriod(p)}
                className={`px-4 py-2 rounded-lg font-bold transition-colors ${
                  period === p
                    ? 'bg-purple-500 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {label}
              </button>
            ))}
          </div>
        </div>

        {/* Type filter */}
        <div>
          <div className="text-sm font-bold text-gray-700 mb-2">Event Type:</div>
          <div className="flex gap-2 flex-wrap">
            {[
              { filter: 'all' as const, label: 'All Events', icon: '📊' },
              { filter: 'achievement' as const, label: 'Achievements', icon: '🏆' },
              { filter: 'milestone' as const, label: 'Milestones', icon: '⭐' },
              { filter: 'lesson' as const, label: 'Lessons', icon: '📚' },
              { filter: 'test' as const, label: 'Tests', icon: '📝' },
              { filter: 'practice' as const, label: 'Practice', icon: '💪' },
              { filter: 'goal' as const, label: 'Goals', icon: '🎯' },
            ].map(({ filter: f, label, icon }) => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={`px-4 py-2 rounded-lg font-bold transition-colors ${
                  filter === f
                    ? 'bg-blue-500 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {icon} {label}
              </button>
            ))}
          </div>
        </div>

        {/* View style toggle */}
        <div className="flex justify-end">
          <div className="flex gap-2">
            <button
              onClick={() => setViewStyle('vertical')}
              className={`px-4 py-2 rounded-lg font-bold transition-colors ${
                viewStyle === 'vertical'
                  ? 'bg-green-500 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              ⬇️ Vertical
            </button>
            <button
              onClick={() => setViewStyle('horizontal')}
              className={`px-4 py-2 rounded-lg font-bold transition-colors ${
                viewStyle === 'horizontal'
                  ? 'bg-green-500 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              ➡️ Horizontal
            </button>
          </div>
        </div>
      </div>

      {/* Timeline */}
      {viewStyle === 'vertical' ? (
        <div className="relative">
          {/* Timeline line */}
          <div className="absolute left-8 top-0 bottom-0 w-0.5 bg-gradient-to-b from-purple-400 via-blue-400 to-green-400" />

          {/* Events */}
          <div className="space-y-8">
            {events.map((event, index) => (
              <motion.div
                key={event.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: settings.reducedMotion ? 0 : index * 0.05 }}
                className="relative pl-20"
              >
                {/* Date badge */}
                <div className={`absolute left-0 w-16 h-16 rounded-full ${getBadgeColor(event.type)} border-4 border-white shadow-lg flex items-center justify-center text-2xl`}>
                  {event.icon}
                </div>

                {/* Event card */}
                <div className={`rounded-xl p-6 border-2 ${getEventColor(event.type)} ${
                  event.highlighted ? 'ring-4 ring-yellow-200' : ''
                }`}>
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <div className="font-bold text-gray-900 text-lg">{event.title}</div>
                        {event.highlighted && (
                          <span className="px-2 py-0.5 bg-yellow-400 text-yellow-900 rounded-full text-xs font-bold">
                            ⭐ Featured
                          </span>
                        )}
                      </div>
                      <div className="text-sm text-gray-600">{event.description}</div>
                    </div>
                    {event.value && (
                      <div className="text-right">
                        <div className="text-3xl font-bold text-purple-600">{event.value}</div>
                        <div className="text-sm text-gray-600">{event.unit}</div>
                      </div>
                    )}
                  </div>

                  {event.metadata && (
                    <div className="grid grid-cols-3 gap-2 mb-3">
                      {event.metadata.speed && (
                        <div className="bg-white/50 rounded-lg p-2 text-center">
                          <div className="text-xs text-gray-600">Speed</div>
                          <div className="text-sm font-bold">{event.metadata.speed} WPM</div>
                        </div>
                      )}
                      {event.metadata.accuracy && (
                        <div className="bg-white/50 rounded-lg p-2 text-center">
                          <div className="text-xs text-gray-600">Accuracy</div>
                          <div className="text-sm font-bold">{event.metadata.accuracy}%</div>
                        </div>
                      )}
                      {event.metadata.duration && (
                        <div className="bg-white/50 rounded-lg p-2 text-center">
                          <div className="text-xs text-gray-600">Duration</div>
                          <div className="text-sm font-bold">{Math.floor(event.metadata.duration / 60)}m</div>
                        </div>
                      )}
                    </div>
                  )}

                  <div className="flex items-center justify-between text-xs text-gray-500">
                    <div className="flex items-center gap-2">
                      <span className={`px-2 py-1 rounded capitalize font-bold ${getBadgeColor(event.type)} text-white`}>
                        {event.type}
                      </span>
                      <span>{formatRelativeTime(event.date)}</span>
                    </div>
                    <div>{event.date.toLocaleDateString()}</div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      ) : (
        // Horizontal timeline
        <div className="overflow-x-auto pb-4">
          <div className="relative min-w-max">
            {/* Timeline line */}
            <div className="absolute top-8 left-0 right-0 h-0.5 bg-gradient-to-r from-purple-400 via-blue-400 to-green-400" />

            {/* Events */}
            <div className="flex gap-6 pt-4">
              {events.map((event, index) => (
                <motion.div
                  key={event.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: settings.reducedMotion ? 0 : index * 0.05 }}
                  className="relative"
                  style={{ width: '280px' }}
                >
                  {/* Date badge */}
                  <div className={`mx-auto w-16 h-16 rounded-full ${getBadgeColor(event.type)} border-4 border-white shadow-lg flex items-center justify-center text-2xl mb-4`}>
                    {event.icon}
                  </div>

                  {/* Event card */}
                  <div className={`rounded-xl p-4 border-2 ${getEventColor(event.type)} ${
                    event.highlighted ? 'ring-4 ring-yellow-200' : ''
                  }`}>
                    <div className="mb-2">
                      <div className="font-bold text-gray-900 text-sm mb-1">{event.title}</div>
                      {event.value && (
                        <div className="text-2xl font-bold text-purple-600">
                          {event.value} <span className="text-sm text-gray-600">{event.unit}</span>
                        </div>
                      )}
                    </div>

                    <div className="text-xs text-gray-600 mb-2">{event.description}</div>

                    <div className="text-xs text-gray-500">
                      {formatRelativeTime(event.date)}
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      )}

      {events.length === 0 && (
        <div className="text-center py-12 text-gray-500">
          No events found for the selected filters.
        </div>
      )}
    </div>
  );
}
