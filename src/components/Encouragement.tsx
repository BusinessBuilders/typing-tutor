import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

// Types
export type EncouragementType =
  | 'effort'
  | 'progress'
  | 'achievement'
  | 'persistence'
  | 'improvement'
  | 'milestone';

export type EncouragementTone = 'calm' | 'excited' | 'gentle' | 'proud';

export interface EncouragementMessage {
  id: string;
  type: EncouragementType;
  tone: EncouragementTone;
  message: string;
  subMessage?: string;
  icon: string;
  color: string;
  timestamp: Date;
  context?: {
    metric?: string;
    value?: number;
    comparison?: string;
  };
}

export interface EncouragementTrigger {
  id: string;
  name: string;
  condition: string;
  message: EncouragementMessage;
  frequency: 'always' | 'once-per-session' | 'daily' | 'rare';
  lastTriggered?: Date;
}

export interface EncouragementStats {
  totalShown: number;
  byType: Record<EncouragementType, number>;
  byTone: Record<EncouragementTone, number>;
  favoriteMessages: EncouragementMessage[];
  lastShown?: Date;
}

export interface EncouragementSettings {
  enabled: boolean;
  frequency: 'high' | 'medium' | 'low';
  preferredTone: EncouragementTone | 'auto';
  enableSound: boolean;
  enableAnimation: boolean;
  autoHide: boolean;
  hideDelay: number; // milliseconds
}

// Mock data generators
function generateEncouragementMessages(): EncouragementMessage[] {
  const messages: EncouragementMessage[] = [];

  // Effort messages
  messages.push({
    id: 'enc-1',
    type: 'effort',
    tone: 'proud',
    message: 'Great effort!',
    subMessage: 'You\'re working really hard and it shows',
    icon: '💪',
    color: 'blue',
    timestamp: new Date(),
  });

  messages.push({
    id: 'enc-2',
    type: 'effort',
    tone: 'calm',
    message: 'Nice focus',
    subMessage: 'You stayed concentrated throughout this session',
    icon: '🎯',
    color: 'indigo',
    timestamp: new Date(),
  });

  // Progress messages
  messages.push({
    id: 'enc-3',
    type: 'progress',
    tone: 'excited',
    message: 'You\'re improving!',
    subMessage: 'Your speed is up 5 WPM from yesterday',
    icon: '📈',
    color: 'green',
    timestamp: new Date(),
    context: {
      metric: 'speed',
      value: 5,
      comparison: 'yesterday',
    },
  });

  messages.push({
    id: 'enc-4',
    type: 'progress',
    tone: 'gentle',
    message: 'Steady progress',
    subMessage: 'Small steps lead to big achievements',
    icon: '🌱',
    color: 'emerald',
    timestamp: new Date(),
  });

  // Achievement messages
  messages.push({
    id: 'enc-5',
    type: 'achievement',
    tone: 'excited',
    message: 'Awesome job!',
    subMessage: 'You completed 10 lessons this week',
    icon: '🌟',
    color: 'yellow',
    timestamp: new Date(),
  });

  messages.push({
    id: 'enc-6',
    type: 'achievement',
    tone: 'proud',
    message: 'Well done!',
    subMessage: 'You reached 95% accuracy',
    icon: '🎉',
    color: 'purple',
    timestamp: new Date(),
  });

  // Persistence messages
  messages.push({
    id: 'enc-7',
    type: 'persistence',
    tone: 'gentle',
    message: 'Keep going!',
    subMessage: 'Every practice session makes you better',
    icon: '🚀',
    color: 'cyan',
    timestamp: new Date(),
  });

  messages.push({
    id: 'enc-8',
    type: 'persistence',
    tone: 'calm',
    message: 'You\'re doing great',
    subMessage: 'You\'ve practiced 5 days in a row',
    icon: '🔥',
    color: 'orange',
    timestamp: new Date(),
  });

  // Improvement messages
  messages.push({
    id: 'enc-9',
    type: 'improvement',
    tone: 'proud',
    message: 'Much better!',
    subMessage: 'Your accuracy improved by 10%',
    icon: '⭐',
    color: 'pink',
    timestamp: new Date(),
    context: {
      metric: 'accuracy',
      value: 10,
      comparison: 'last week',
    },
  });

  messages.push({
    id: 'enc-10',
    type: 'improvement',
    tone: 'excited',
    message: 'Fantastic improvement!',
    subMessage: 'You\'re typing faster and more accurately',
    icon: '🎨',
    color: 'rose',
    timestamp: new Date(),
  });

  // Milestone messages
  messages.push({
    id: 'enc-11',
    type: 'milestone',
    tone: 'excited',
    message: 'Major milestone!',
    subMessage: 'You\'ve completed 50 lessons',
    icon: '🏆',
    color: 'amber',
    timestamp: new Date(),
  });

  messages.push({
    id: 'enc-12',
    type: 'milestone',
    tone: 'proud',
    message: 'Amazing achievement!',
    subMessage: 'You reached 50 WPM',
    icon: '👑',
    color: 'violet',
    timestamp: new Date(),
  });

  return messages;
}

function generateEncouragementTriggers(): EncouragementTrigger[] {
  const messages = generateEncouragementMessages();

  return [
    {
      id: 'trigger-1',
      name: 'Session Complete',
      condition: 'User completes a practice session',
      message: messages[0],
      frequency: 'always',
    },
    {
      id: 'trigger-2',
      name: 'Speed Improvement',
      condition: 'Speed improves by 5+ WPM',
      message: messages[2],
      frequency: 'once-per-session',
    },
    {
      id: 'trigger-3',
      name: 'High Accuracy',
      condition: 'Accuracy >= 95%',
      message: messages[5],
      frequency: 'once-per-session',
    },
    {
      id: 'trigger-4',
      name: 'Streak Milestone',
      condition: 'Practice streak reaches 5 days',
      message: messages[7],
      frequency: 'daily',
    },
    {
      id: 'trigger-5',
      name: 'Lesson Milestone',
      condition: 'Complete 50 lessons',
      message: messages[10],
      frequency: 'rare',
    },
  ];
}

function generateEncouragementStats(): EncouragementStats {
  const messages = generateEncouragementMessages();

  return {
    totalShown: 127,
    byType: {
      effort: 35,
      progress: 28,
      achievement: 24,
      persistence: 18,
      improvement: 15,
      milestone: 7,
    },
    byTone: {
      calm: 32,
      excited: 38,
      gentle: 29,
      proud: 28,
    },
    favoriteMessages: messages.slice(0, 5),
    lastShown: new Date(Date.now() - 1000 * 60 * 15), // 15 minutes ago
  };
}

// Custom hook
function useEncouragement() {
  const [currentMessage, setCurrentMessage] = useState<EncouragementMessage | null>(null);
  const [messageHistory, setMessageHistory] = useState<EncouragementMessage[]>(
    generateEncouragementMessages()
  );
  const [triggers] = useState<EncouragementTrigger[]>(
    generateEncouragementTriggers()
  );
  const [stats] = useState<EncouragementStats>(
    generateEncouragementStats()
  );
  const [settings, setSettings] = useState<EncouragementSettings>({
    enabled: true,
    frequency: 'medium',
    preferredTone: 'auto',
    enableSound: true,
    enableAnimation: true,
    autoHide: true,
    hideDelay: 5000,
  });
  const [filterType, setFilterType] = useState<EncouragementType | 'all'>('all');
  const [filterTone, setFilterTone] = useState<EncouragementTone | 'all'>('all');

  const filteredHistory = messageHistory.filter((msg) => {
    if (filterType !== 'all' && msg.type !== filterType) return false;
    if (filterTone !== 'all' && msg.tone !== filterTone) return false;
    return true;
  });

  const showMessage = (message: EncouragementMessage) => {
    setCurrentMessage(message);
    setMessageHistory((prev) => [message, ...prev]);

    if (settings.autoHide) {
      setTimeout(() => {
        setCurrentMessage(null);
      }, settings.hideDelay);
    }
  };

  const dismissMessage = () => {
    setCurrentMessage(null);
  };

  const updateSettings = (newSettings: Partial<EncouragementSettings>) => {
    setSettings((prev) => ({ ...prev, ...newSettings }));
  };

  return {
    currentMessage,
    messageHistory: filteredHistory,
    triggers,
    stats,
    settings,
    filterType,
    setFilterType,
    filterTone,
    setFilterTone,
    showMessage,
    dismissMessage,
    updateSettings,
  };
}

// Main component
export default function Encouragement() {
  const {
    currentMessage,
    messageHistory,
    triggers,
    stats,
    settings,
    filterType,
    setFilterType,
    filterTone,
    setFilterTone,
    showMessage,
    dismissMessage,
    updateSettings,
  } = useEncouragement();

  const [activeTab, setActiveTab] = useState<'live' | 'history' | 'triggers' | 'settings'>('live');

  const getColorClasses = (color: string) => {
    const colorMap: Record<string, string> = {
      blue: 'bg-blue-50 text-blue-900 border-blue-200',
      indigo: 'bg-indigo-50 text-indigo-900 border-indigo-200',
      green: 'bg-green-50 text-green-900 border-green-200',
      emerald: 'bg-emerald-50 text-emerald-900 border-emerald-200',
      yellow: 'bg-yellow-50 text-yellow-900 border-yellow-200',
      purple: 'bg-purple-50 text-purple-900 border-purple-200',
      cyan: 'bg-cyan-50 text-cyan-900 border-cyan-200',
      orange: 'bg-orange-50 text-orange-900 border-orange-200',
      pink: 'bg-pink-50 text-pink-900 border-pink-200',
      rose: 'bg-rose-50 text-rose-900 border-rose-200',
      amber: 'bg-amber-50 text-amber-900 border-amber-200',
      violet: 'bg-violet-50 text-violet-900 border-violet-200',
    };
    return colorMap[color] || 'bg-gray-50 text-gray-900 border-gray-200';
  };

  return (
    <div className="max-w-6xl mx-auto p-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Encouragement</h1>
        <p className="text-gray-600">
          Positive messages and motivation to support your learning journey
        </p>
      </div>

      {/* Live encouragement message */}
      <AnimatePresence>
        {currentMessage && settings.enabled && (
          <motion.div
            initial={{ opacity: 0, y: -20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.95 }}
            className={`mb-8 p-6 rounded-xl border-2 ${getColorClasses(currentMessage.color)}`}
          >
            <div className="flex items-start justify-between">
              <div className="flex items-start gap-4 flex-1">
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 0.2, type: 'spring' }}
                  className="text-4xl"
                >
                  {currentMessage.icon}
                </motion.div>
                <div className="flex-1">
                  <h3 className="text-2xl font-bold mb-1">{currentMessage.message}</h3>
                  {currentMessage.subMessage && (
                    <p className="text-lg opacity-80">{currentMessage.subMessage}</p>
                  )}
                  {currentMessage.context && (
                    <div className="mt-2 text-sm opacity-60">
                      {currentMessage.context.metric && currentMessage.context.value && (
                        <span>
                          {currentMessage.context.metric}: +{currentMessage.context.value}
                          {currentMessage.context.comparison && ` vs ${currentMessage.context.comparison}`}
                        </span>
                      )}
                    </div>
                  )}
                </div>
              </div>
              <button
                onClick={dismissMessage}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                ✕
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Tabs */}
      <div className="flex gap-2 mb-6 border-b">
        {(['live', 'history', 'triggers', 'settings'] as const).map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-6 py-3 font-medium transition-colors border-b-2 -mb-px ${
              activeTab === tab
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            {tab.charAt(0).toUpperCase() + tab.slice(1)}
          </button>
        ))}
      </div>

      {/* Live Tab */}
      {activeTab === 'live' && (
        <div className="space-y-6">
          {/* Stats Overview */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-white p-6 rounded-lg border">
              <div className="text-3xl font-bold text-blue-600 mb-1">
                {stats.totalShown}
              </div>
              <div className="text-sm text-gray-600">Total Messages Shown</div>
            </div>

            <div className="bg-white p-6 rounded-lg border">
              <div className="text-3xl font-bold text-green-600 mb-1">
                {Object.entries(stats.byType).reduce((max, [type, count]) =>
                  count > (stats.byType[max as EncouragementType] || 0) ? type : max
                , 'effort')}
              </div>
              <div className="text-sm text-gray-600">Most Common Type</div>
            </div>

            <div className="bg-white p-6 rounded-lg border">
              <div className="text-3xl font-bold text-purple-600 mb-1">
                {stats.favoriteMessages.length}
              </div>
              <div className="text-sm text-gray-600">Favorite Messages</div>
            </div>
          </div>

          {/* Test buttons */}
          <div className="bg-white p-6 rounded-lg border">
            <h3 className="text-lg font-semibold mb-4">Try Encouragement Messages</h3>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              {generateEncouragementMessages().slice(0, 6).map((msg) => (
                <button
                  key={msg.id}
                  onClick={() => showMessage(msg)}
                  className="p-3 border rounded-lg hover:bg-gray-50 transition-colors text-left"
                >
                  <div className="text-2xl mb-1">{msg.icon}</div>
                  <div className="font-medium text-sm">{msg.message}</div>
                  <div className="text-xs text-gray-500 mt-1">
                    {msg.type} • {msg.tone}
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* History Tab */}
      {activeTab === 'history' && (
        <div className="space-y-4">
          {/* Filters */}
          <div className="bg-white p-4 rounded-lg border flex gap-4 flex-wrap">
            <div>
              <label className="text-sm text-gray-600 mb-1 block">Type</label>
              <select
                value={filterType}
                onChange={(e) => setFilterType(e.target.value as EncouragementType | 'all')}
                className="border rounded px-3 py-2"
              >
                <option value="all">All Types</option>
                <option value="effort">Effort</option>
                <option value="progress">Progress</option>
                <option value="achievement">Achievement</option>
                <option value="persistence">Persistence</option>
                <option value="improvement">Improvement</option>
                <option value="milestone">Milestone</option>
              </select>
            </div>

            <div>
              <label className="text-sm text-gray-600 mb-1 block">Tone</label>
              <select
                value={filterTone}
                onChange={(e) => setFilterTone(e.target.value as EncouragementTone | 'all')}
                className="border rounded px-3 py-2"
              >
                <option value="all">All Tones</option>
                <option value="calm">Calm</option>
                <option value="excited">Excited</option>
                <option value="gentle">Gentle</option>
                <option value="proud">Proud</option>
              </select>
            </div>
          </div>

          {/* Message history */}
          <div className="space-y-3">
            {messageHistory.map((msg) => (
              <motion.div
                key={msg.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                className={`p-4 rounded-lg border ${getColorClasses(msg.color)}`}
              >
                <div className="flex items-start gap-3">
                  <div className="text-2xl">{msg.icon}</div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <h4 className="font-semibold">{msg.message}</h4>
                      <span className="text-xs px-2 py-1 bg-white/50 rounded">
                        {msg.type}
                      </span>
                    </div>
                    {msg.subMessage && (
                      <p className="text-sm opacity-80">{msg.subMessage}</p>
                    )}
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      )}

      {/* Triggers Tab */}
      {activeTab === 'triggers' && (
        <div className="space-y-3">
          {triggers.map((trigger) => (
            <div key={trigger.id} className="bg-white p-6 rounded-lg border">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h3 className="text-lg font-semibold mb-1">{trigger.name}</h3>
                  <p className="text-sm text-gray-600">{trigger.condition}</p>
                </div>
                <span className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-sm">
                  {trigger.frequency}
                </span>
              </div>

              <div className={`p-4 rounded-lg ${getColorClasses(trigger.message.color)}`}>
                <div className="flex items-center gap-3">
                  <span className="text-2xl">{trigger.message.icon}</span>
                  <div>
                    <div className="font-semibold">{trigger.message.message}</div>
                    {trigger.message.subMessage && (
                      <div className="text-sm opacity-80">{trigger.message.subMessage}</div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Settings Tab */}
      {activeTab === 'settings' && (
        <div className="bg-white p-6 rounded-lg border space-y-6">
          <div>
            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={settings.enabled}
                onChange={(e) => updateSettings({ enabled: e.target.checked })}
                className="w-5 h-5"
              />
              <div>
                <div className="font-medium">Enable Encouragement</div>
                <div className="text-sm text-gray-600">
                  Show encouraging messages during practice
                </div>
              </div>
            </label>
          </div>

          <div>
            <label className="block mb-2 font-medium">Message Frequency</label>
            <select
              value={settings.frequency}
              onChange={(e) => updateSettings({ frequency: e.target.value as 'high' | 'medium' | 'low' })}
              className="border rounded px-3 py-2 w-full max-w-xs"
            >
              <option value="high">High - Show often</option>
              <option value="medium">Medium - Balanced</option>
              <option value="low">Low - Only special moments</option>
            </select>
          </div>

          <div>
            <label className="block mb-2 font-medium">Preferred Tone</label>
            <select
              value={settings.preferredTone}
              onChange={(e) => updateSettings({ preferredTone: e.target.value as EncouragementTone | 'auto' })}
              className="border rounded px-3 py-2 w-full max-w-xs"
            >
              <option value="auto">Auto - Mix of all tones</option>
              <option value="calm">Calm - Gentle and soothing</option>
              <option value="excited">Excited - Energetic and fun</option>
              <option value="gentle">Gentle - Soft and encouraging</option>
              <option value="proud">Proud - Celebratory and affirming</option>
            </select>
          </div>

          <div>
            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={settings.enableSound}
                onChange={(e) => updateSettings({ enableSound: e.target.checked })}
                className="w-5 h-5"
              />
              <div>
                <div className="font-medium">Play Sound</div>
                <div className="text-sm text-gray-600">
                  Play a gentle sound with messages
                </div>
              </div>
            </label>
          </div>

          <div>
            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={settings.enableAnimation}
                onChange={(e) => updateSettings({ enableAnimation: e.target.checked })}
                className="w-5 h-5"
              />
              <div>
                <div className="font-medium">Enable Animations</div>
                <div className="text-sm text-gray-600">
                  Animate message appearance
                </div>
              </div>
            </label>
          </div>

          <div>
            <label className="flex items-center gap-3 cursor-pointer mb-3">
              <input
                type="checkbox"
                checked={settings.autoHide}
                onChange={(e) => updateSettings({ autoHide: e.target.checked })}
                className="w-5 h-5"
              />
              <div>
                <div className="font-medium">Auto-hide Messages</div>
                <div className="text-sm text-gray-600">
                  Automatically dismiss messages after a delay
                </div>
              </div>
            </label>

            {settings.autoHide && (
              <div className="ml-8">
                <label className="block mb-2 text-sm">Hide after (seconds)</label>
                <input
                  type="range"
                  min="2"
                  max="10"
                  step="1"
                  value={settings.hideDelay / 1000}
                  onChange={(e) => updateSettings({ hideDelay: parseInt(e.target.value) * 1000 })}
                  className="w-full max-w-xs"
                />
                <div className="text-sm text-gray-600 mt-1">
                  {settings.hideDelay / 1000} seconds
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
