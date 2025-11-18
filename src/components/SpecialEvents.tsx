/**
 * Special Events Component
 * Step 235 - Build special events system for time-limited challenges and rewards
 */

import { motion, AnimatePresence } from 'framer-motion';
import { useState, useEffect } from 'react';
import { useSettingsStore } from '../store/useSettingsStore';

// Event types
export type EventType = 'seasonal' | 'daily' | 'weekly' | 'limited' | 'challenge' | 'community';

// Event status
export type EventStatus = 'upcoming' | 'active' | 'ending-soon' | 'ended';

// Reward types
export interface EventReward {
  type: 'sticker' | 'card' | 'coins' | 'xp' | 'badge' | 'title';
  id: string;
  name: string;
  icon: string;
  quantity: number;
  rarity?: string;
}

// Special event interface
export interface SpecialEvent {
  id: string;
  name: string;
  description: string;
  icon: string;
  type: EventType;
  status: EventStatus;
  startDate: Date;
  endDate: Date;
  requirements: {
    type: 'lessons' | 'wpm' | 'accuracy' | 'time' | 'streak' | 'special';
    description: string;
    target: number;
    current: number;
  }[];
  rewards: EventReward[];
  difficulty: 'easy' | 'medium' | 'hard' | 'extreme';
  participants: number;
  backgroundColor: string;
  bannerImage?: string;
  isRepeating: boolean; // For daily/weekly events
  repeatInterval?: 'daily' | 'weekly' | 'monthly';
}

// Event configurations
const EVENT_TYPES = {
  seasonal: { name: 'Seasonal', icon: '🎃', color: 'from-orange-400 to-red-500' },
  daily: { name: 'Daily', icon: '📅', color: 'from-blue-400 to-cyan-500' },
  weekly: { name: 'Weekly', icon: '📆', color: 'from-purple-400 to-pink-500' },
  limited: { name: 'Limited Time', icon: '⏰', color: 'from-yellow-400 to-orange-500' },
  challenge: { name: 'Challenge', icon: '🏆', color: 'from-green-400 to-teal-500' },
  community: { name: 'Community', icon: '👥', color: 'from-indigo-400 to-purple-500' },
} as const;

// Sample events
const SAMPLE_EVENTS: SpecialEvent[] = [
  {
    id: 'winter_wonderland',
    name: 'Winter Wonderland',
    description: 'Complete winter-themed typing challenges to earn exclusive snowflake stickers!',
    icon: '❄️',
    type: 'seasonal',
    status: 'active',
    startDate: new Date('2024-12-01'),
    endDate: new Date('2024-12-31'),
    requirements: [
      { type: 'lessons', description: 'Complete 20 winter lessons', target: 20, current: 8 },
      { type: 'accuracy', description: 'Achieve 95% accuracy', target: 95, current: 92 },
      { type: 'time', description: 'Practice for 60 minutes', target: 60, current: 35 },
    ],
    rewards: [
      { type: 'sticker', id: 'snowflake', name: 'Snowflake', icon: '❄️', quantity: 1, rarity: 'rare' },
      { type: 'sticker', id: 'snowman', name: 'Snowman', icon: '⛄', quantity: 1, rarity: 'epic' },
      { type: 'coins', id: 'coins', name: 'Coins', icon: '🪙', quantity: 1000 },
      { type: 'title', id: 'winter_champion', name: 'Winter Champion', icon: '🏔️', quantity: 1 },
    ],
    difficulty: 'medium',
    participants: 1247,
    backgroundColor: 'from-blue-400 to-cyan-300',
    isRepeating: false,
  },
  {
    id: 'daily_dash',
    name: 'Daily Dash',
    description: 'Complete today\'s typing challenge for instant rewards!',
    icon: '⚡',
    type: 'daily',
    status: 'active',
    startDate: new Date(),
    endDate: new Date(Date.now() + 24 * 60 * 60 * 1000),
    requirements: [
      { type: 'lessons', description: 'Complete 3 lessons', target: 3, current: 2 },
      { type: 'wpm', description: 'Type at 50 WPM', target: 50, current: 48 },
    ],
    rewards: [
      { type: 'coins', id: 'coins', name: 'Coins', icon: '🪙', quantity: 100 },
      { type: 'xp', id: 'xp', name: 'Experience', icon: '⭐', quantity: 50 },
    ],
    difficulty: 'easy',
    participants: 5892,
    backgroundColor: 'from-yellow-400 to-orange-400',
    isRepeating: true,
    repeatInterval: 'daily',
  },
  {
    id: 'speed_demon_week',
    name: 'Speed Demon Week',
    description: 'Push your typing speed to the limit this week!',
    icon: '🔥',
    type: 'weekly',
    status: 'active',
    startDate: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
    endDate: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000),
    requirements: [
      { type: 'wpm', description: 'Reach 80 WPM', target: 80, current: 65 },
      { type: 'streak', description: 'Maintain 5-day streak', target: 5, current: 3 },
    ],
    rewards: [
      { type: 'card', id: 'speed_master', name: 'Speed Master Card', icon: '⚡', quantity: 1, rarity: 'legendary' },
      { type: 'sticker', id: 'lightning', name: 'Lightning Bolt', icon: '⚡', quantity: 1, rarity: 'epic' },
      { type: 'badge', id: 'speed_demon', name: 'Speed Demon Badge', icon: '🏃', quantity: 1 },
    ],
    difficulty: 'hard',
    participants: 3421,
    backgroundColor: 'from-red-400 to-pink-500',
    isRepeating: true,
    repeatInterval: 'weekly',
  },
  {
    id: 'halloween_spooktacular',
    name: 'Halloween Spooktacular',
    description: 'Haunt the keyboard with spooky typing challenges!',
    icon: '👻',
    type: 'seasonal',
    status: 'upcoming',
    startDate: new Date('2025-10-20'),
    endDate: new Date('2025-11-01'),
    requirements: [
      { type: 'special', description: 'Complete spooky story mode', target: 1, current: 0 },
      { type: 'accuracy', description: 'Perfect accuracy on 5 lessons', target: 5, current: 0 },
    ],
    rewards: [
      { type: 'sticker', id: 'ghost', name: 'Friendly Ghost', icon: '👻', quantity: 1, rarity: 'legendary' },
      { type: 'sticker', id: 'pumpkin', name: 'Jack-o-Lantern', icon: '🎃', quantity: 1, rarity: 'epic' },
      { type: 'card', id: 'halloween_master', name: 'Halloween Master', icon: '🦇', quantity: 1, rarity: 'mythic' },
    ],
    difficulty: 'extreme',
    participants: 0,
    backgroundColor: 'from-purple-600 to-orange-500',
    isRepeating: false,
  },
  {
    id: 'community_goal',
    name: 'Community Million',
    description: 'Help the community type 1 million words together!',
    icon: '🌍',
    type: 'community',
    status: 'active',
    startDate: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
    endDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000),
    requirements: [
      { type: 'special', description: 'Community words typed', target: 1000000, current: 675432 },
    ],
    rewards: [
      { type: 'sticker', id: 'global_unity', name: 'Global Unity', icon: '🌍', quantity: 1, rarity: 'legendary' },
      { type: 'title', id: 'community_hero', name: 'Community Hero', icon: '🦸', quantity: 1 },
      { type: 'coins', id: 'coins', name: 'Coins', icon: '🪙', quantity: 5000 },
    ],
    difficulty: 'medium',
    participants: 12847,
    backgroundColor: 'from-green-400 to-blue-500',
    isRepeating: false,
  },
];

// Custom hook for special events
export function useSpecialEvents() {
  const [events, setEvents] = useState<SpecialEvent[]>(SAMPLE_EVENTS);
  const [selectedEvent, setSelectedEvent] = useState<SpecialEvent | null>(null);
  const [filter, setFilter] = useState<EventType | 'all'>('all');
  const [currentTime, setCurrentTime] = useState(new Date());

  // Update current time every minute
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTime(new Date());
    }, 60000);
    return () => clearInterval(interval);
  }, []);

  const updateEventStatus = (event: SpecialEvent): SpecialEvent => {
    const now = currentTime.getTime();
    const start = event.startDate.getTime();
    const end = event.endDate.getTime();
    const hoursRemaining = (end - now) / (1000 * 60 * 60);

    let status: EventStatus;
    if (now < start) status = 'upcoming';
    else if (now > end) status = 'ended';
    else if (hoursRemaining < 24) status = 'ending-soon';
    else status = 'active';

    return { ...event, status };
  };

  const getFilteredEvents = () => {
    let filtered = events.map(updateEventStatus);

    if (filter !== 'all') {
      filtered = filtered.filter((e) => e.type === filter);
    }

    return filtered.sort((a, b) => {
      // Sort by status priority: active > ending-soon > upcoming > ended
      const statusPriority = { active: 0, 'ending-soon': 1, upcoming: 2, ended: 3 };
      const aPriority = statusPriority[a.status];
      const bPriority = statusPriority[b.status];
      if (aPriority !== bPriority) return aPriority - bPriority;

      // Then by end date
      return a.endDate.getTime() - b.endDate.getTime();
    });
  };

  const getTimeRemaining = (event: SpecialEvent) => {
    const now = currentTime.getTime();
    const target = event.status === 'upcoming' ? event.startDate.getTime() : event.endDate.getTime();
    const diff = target - now;

    if (diff <= 0) return 'Ended';

    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));

    if (days > 0) return `${days}d ${hours}h`;
    if (hours > 0) return `${hours}h ${minutes}m`;
    return `${minutes}m`;
  };

  const getProgress = (event: SpecialEvent) => {
    const completed = event.requirements.filter((r) => r.current >= r.target).length;
    const total = event.requirements.length;
    return {
      completed,
      total,
      percentage: Math.round((completed / total) * 100),
    };
  };

  const joinEvent = (eventId: string) => {
    setEvents((prev) =>
      prev.map((e) =>
        e.id === eventId ? { ...e, participants: e.participants + 1 } : e
      )
    );
  };

  return {
    events: getFilteredEvents(),
    selectedEvent,
    setSelectedEvent,
    filter,
    setFilter,
    getTimeRemaining,
    getProgress,
    joinEvent,
    currentTime,
  };
}

// Main special events component
export default function SpecialEvents() {
  const {
    events,
    selectedEvent,
    setSelectedEvent,
    filter,
    setFilter,
    getTimeRemaining,
    getProgress,
    joinEvent,
  } = useSpecialEvents();

  const { settings } = useSettingsStore();

  const activeEvents = events.filter((e) => e.status === 'active' || e.status === 'ending-soon');
  const upcomingEvents = events.filter((e) => e.status === 'upcoming');
  const endedEvents = events.filter((e) => e.status === 'ended');

  return (
    <div className="bg-white rounded-2xl shadow-xl p-8">
      <h2 className="text-2xl font-bold text-gray-800 mb-6 text-center">
        🎉 Special Events
      </h2>

      {/* Filter */}
      <div className="mb-8">
        <div className="flex overflow-x-auto gap-2 pb-2">
          <button
            onClick={() => setFilter('all')}
            className={`flex-shrink-0 px-6 py-2 rounded-lg font-bold transition-colors ${
              filter === 'all'
                ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            All Events
          </button>
          {Object.entries(EVENT_TYPES).map(([key, value]) => (
            <button
              key={key}
              onClick={() => setFilter(key as EventType)}
              className={`flex-shrink-0 px-6 py-2 rounded-lg font-bold transition-colors ${
                filter === key
                  ? `bg-gradient-to-r ${value.color} text-white`
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {value.icon} {value.name}
            </button>
          ))}
        </div>
      </div>

      {/* Active events */}
      {activeEvents.length > 0 && (
        <div className="mb-8">
          <h3 className="text-2xl font-bold text-gray-900 mb-4">🔥 Active Now</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {activeEvents.map((event, index) => (
              <EventCard
                key={event.id}
                event={event}
                index={index}
                onClick={() => setSelectedEvent(event)}
                getTimeRemaining={getTimeRemaining}
                getProgress={getProgress}
                reducedMotion={settings.reducedMotion}
              />
            ))}
          </div>
        </div>
      )}

      {/* Upcoming events */}
      {upcomingEvents.length > 0 && (
        <div className="mb-8">
          <h3 className="text-2xl font-bold text-gray-900 mb-4">📅 Coming Soon</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {upcomingEvents.map((event, index) => (
              <EventCard
                key={event.id}
                event={event}
                index={index}
                onClick={() => setSelectedEvent(event)}
                getTimeRemaining={getTimeRemaining}
                getProgress={getProgress}
                reducedMotion={settings.reducedMotion}
              />
            ))}
          </div>
        </div>
      )}

      {/* Ended events */}
      {endedEvents.length > 0 && (
        <div className="mb-8">
          <h3 className="text-2xl font-bold text-gray-900 mb-4">📜 Past Events</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 opacity-60">
            {endedEvents.map((event, index) => (
              <EventCard
                key={event.id}
                event={event}
                index={index}
                onClick={() => setSelectedEvent(event)}
                getTimeRemaining={getTimeRemaining}
                getProgress={getProgress}
                reducedMotion={settings.reducedMotion}
              />
            ))}
          </div>
        </div>
      )}

      {events.length === 0 && (
        <div className="text-center py-12 text-gray-500">
          <div className="text-6xl mb-4">📭</div>
          <div className="text-xl font-bold">No events found</div>
          <div>Check back later for new events!</div>
        </div>
      )}

      {/* Event detail modal */}
      <AnimatePresence>
        {selectedEvent && (
          <EventDetailModal
            event={selectedEvent}
            onClose={() => setSelectedEvent(null)}
            onJoin={() => {
              joinEvent(selectedEvent.id);
              setSelectedEvent(null);
            }}
            getTimeRemaining={getTimeRemaining}
            getProgress={getProgress}
          />
        )}
      </AnimatePresence>
    </div>
  );
}

// Event card component
function EventCard({
  event,
  index,
  onClick,
  getTimeRemaining,
  getProgress,
  reducedMotion,
}: {
  event: SpecialEvent;
  index: number;
  onClick: () => void;
  getTimeRemaining: (event: SpecialEvent) => string;
  getProgress: (event: SpecialEvent) => { completed: number; total: number; percentage: number };
  reducedMotion: boolean;
}) {
  const typeInfo = EVENT_TYPES[event.type];
  const progress = getProgress(event);
  const timeRemaining = getTimeRemaining(event);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: reducedMotion ? 0 : index * 0.1 }}
      onClick={onClick}
      className={`
        relative overflow-hidden rounded-2xl cursor-pointer transition-all hover:scale-105
        bg-gradient-to-br ${event.backgroundColor} text-white shadow-xl
      `}
    >
      {/* Status badge */}
      <div className="absolute top-4 right-4 z-10">
        {event.status === 'ending-soon' && (
          <div className="bg-red-500 px-3 py-1 rounded-full text-sm font-bold animate-pulse">
            ⏰ Ending Soon!
          </div>
        )}
        {event.status === 'upcoming' && (
          <div className="bg-blue-500 px-3 py-1 rounded-full text-sm font-bold">
            Coming Soon
          </div>
        )}
        {event.status === 'ended' && (
          <div className="bg-gray-600 px-3 py-1 rounded-full text-sm font-bold">
            Ended
          </div>
        )}
      </div>

      <div className="p-6">
        {/* Header */}
        <div className="flex items-start gap-4 mb-4">
          <div className="text-6xl">{event.icon}</div>
          <div className="flex-1">
            <div className="text-2xl font-bold mb-1">{event.name}</div>
            <div className="text-sm opacity-90">
              {typeInfo.icon} {typeInfo.name}
            </div>
          </div>
        </div>

        <p className="text-sm opacity-90 mb-4">{event.description}</p>

        {/* Progress */}
        {event.status !== 'upcoming' && event.status !== 'ended' && (
          <div className="mb-4">
            <div className="flex items-center justify-between text-sm mb-2">
              <span>Progress</span>
              <span>
                {progress.completed}/{progress.total} ({progress.percentage}%)
              </span>
            </div>
            <div className="h-3 bg-white bg-opacity-30 rounded-full overflow-hidden">
              <motion.div
                animate={{ width: `${progress.percentage}%` }}
                className="h-full bg-white"
              />
            </div>
          </div>
        )}

        {/* Time and participants */}
        <div className="flex items-center justify-between text-sm">
          <div className="bg-white bg-opacity-20 rounded-lg px-3 py-1">
            ⏰ {timeRemaining}
          </div>
          <div className="bg-white bg-opacity-20 rounded-lg px-3 py-1">
            👥 {event.participants.toLocaleString()}
          </div>
        </div>

        {/* Rewards preview */}
        <div className="mt-4 flex gap-2 flex-wrap">
          {event.rewards.slice(0, 4).map((reward) => (
            <div
              key={reward.id}
              className="bg-white bg-opacity-20 rounded-lg px-2 py-1 text-xs"
            >
              {reward.icon} {reward.name}
            </div>
          ))}
          {event.rewards.length > 4 && (
            <div className="bg-white bg-opacity-20 rounded-lg px-2 py-1 text-xs">
              +{event.rewards.length - 4} more
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
}

// Event detail modal
function EventDetailModal({
  event,
  onClose,
  onJoin,
  getTimeRemaining,
  getProgress,
}: {
  event: SpecialEvent;
  onClose: () => void;
  onJoin: () => void;
  getTimeRemaining: (event: SpecialEvent) => string;
  getProgress: (event: SpecialEvent) => { completed: number; total: number; percentage: number };
}) {
  const progress = getProgress(event);
  const typeInfo = EVENT_TYPES[event.type];

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50 p-4 overflow-y-auto"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.8, opacity: 0 }}
        className={`bg-gradient-to-br ${event.backgroundColor} rounded-3xl p-8 max-w-2xl w-full text-white shadow-2xl my-8`}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="text-center mb-6">
          <div className="text-8xl mb-4">{event.icon}</div>
          <div className="text-4xl font-bold mb-2">{event.name}</div>
          <div className="text-xl opacity-90 mb-4">{event.description}</div>
          <div className="flex items-center justify-center gap-4 text-sm">
            <div className="bg-white bg-opacity-20 rounded-full px-4 py-2">
              {typeInfo.icon} {typeInfo.name}
            </div>
            <div className="bg-white bg-opacity-20 rounded-full px-4 py-2">
              ⏰ {getTimeRemaining(event)}
            </div>
            <div className="bg-white bg-opacity-20 rounded-full px-4 py-2">
              👥 {event.participants.toLocaleString()}
            </div>
          </div>
        </div>

        {/* Requirements */}
        <div className="bg-white bg-opacity-20 rounded-2xl p-6 mb-6">
          <h3 className="text-2xl font-bold mb-4">Requirements</h3>
          <div className="space-y-4">
            {event.requirements.map((req, i) => (
              <div key={i}>
                <div className="flex items-center justify-between mb-2">
                  <span className="font-bold">{req.description}</span>
                  <span>
                    {req.current}/{req.target}
                  </span>
                </div>
                <div className="h-3 bg-white bg-opacity-30 rounded-full overflow-hidden">
                  <motion.div
                    animate={{ width: `${Math.min((req.current / req.target) * 100, 100)}%` }}
                    className="h-full bg-white"
                  />
                </div>
              </div>
            ))}
          </div>

          <div className="mt-4 text-center">
            <div className="text-lg">
              Overall Progress: {progress.completed}/{progress.total} ({progress.percentage}%)
            </div>
          </div>
        </div>

        {/* Rewards */}
        <div className="bg-white bg-opacity-20 rounded-2xl p-6 mb-6">
          <h3 className="text-2xl font-bold mb-4">Rewards</h3>
          <div className="grid grid-cols-2 gap-4">
            {event.rewards.map((reward) => (
              <div
                key={reward.id}
                className="bg-white bg-opacity-20 rounded-xl p-4 text-center"
              >
                <div className="text-4xl mb-2">{reward.icon}</div>
                <div className="font-bold">{reward.name}</div>
                {reward.quantity > 1 && (
                  <div className="text-sm opacity-90">×{reward.quantity}</div>
                )}
                {reward.rarity && (
                  <div className="text-xs opacity-75 capitalize">{reward.rarity}</div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Event details */}
        <div className="grid grid-cols-2 gap-4 mb-6">
          <div className="bg-white bg-opacity-20 rounded-xl p-4">
            <div className="text-sm opacity-90 mb-1">Starts</div>
            <div className="font-bold">{event.startDate.toLocaleDateString()}</div>
          </div>
          <div className="bg-white bg-opacity-20 rounded-xl p-4">
            <div className="text-sm opacity-90 mb-1">Ends</div>
            <div className="font-bold">{event.endDate.toLocaleDateString()}</div>
          </div>
          <div className="bg-white bg-opacity-20 rounded-xl p-4">
            <div className="text-sm opacity-90 mb-1">Difficulty</div>
            <div className="font-bold capitalize">{event.difficulty}</div>
          </div>
          <div className="bg-white bg-opacity-20 rounded-xl p-4">
            <div className="text-sm opacity-90 mb-1">Participants</div>
            <div className="font-bold">{event.participants.toLocaleString()}</div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-4">
          {event.status !== 'ended' && (
            <button
              onClick={onJoin}
              className="flex-1 py-4 bg-white text-gray-900 rounded-xl font-bold text-xl hover:bg-gray-100 transition-colors"
            >
              {event.status === 'upcoming' ? 'Set Reminder' : 'Join Event'}
            </button>
          )}
          <button
            onClick={onClose}
            className={`${event.status === 'ended' ? 'flex-1' : 'flex-shrink-0'} px-8 py-4 bg-gray-700 text-white rounded-xl font-bold text-xl hover:bg-gray-600 transition-colors`}
          >
            Close
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
}
