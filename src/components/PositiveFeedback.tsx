import React, { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

/**
 * Step 293: Add Positive Feedback System
 *
 * Provides encouraging, positive reinforcement to build confidence and
 * motivation. Focuses on progress and effort rather than perfection,
 * particularly beneficial for users with anxiety or low confidence.
 *
 * Features:
 * - Success celebrations and achievements
 * - Progress milestone recognition
 * - Personalized encouragement
 * - Streak celebrations
 * - Improvement tracking
 * - Visual and audio rewards
 * - Motivational messages
 * - Effort-based praise
 */

export type FeedbackType =
  | 'success'
  | 'improvement'
  | 'milestone'
  | 'streak'
  | 'encouragement'
  | 'achievement'
  | 'effort'
  | 'persistence';

export type FeedbackStyle =
  | 'subtle'
  | 'moderate'
  | 'enthusiastic'
  | 'minimal';

export type CelebrationLevel =
  | 'minor'
  | 'moderate'
  | 'major'
  | 'epic';

export interface FeedbackMessage {
  id: string;
  type: FeedbackType;
  message: string;
  icon: string;
  timestamp: Date;
  displayed: boolean;
  celebrationLevel: CelebrationLevel;
}

export interface FeedbackSettings {
  enabled: boolean;
  style: FeedbackStyle;
  frequency: 'low' | 'medium' | 'high';
  showAnimations: boolean;
  playSound: boolean;
  soundVolume: number; // 0-100
  showConfetti: boolean;
  showBadges: boolean;
  personalizedMessages: boolean;
  trackProgress: boolean;
  celebrateSmallWins: boolean;
  focusOnEffort: boolean;
  avoidComparisons: boolean;
  includeQuotes: boolean;
}

export interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: string;
  unlockedAt?: Date;
  unlocked: boolean;
  progress: number; // 0-100
  category: 'speed' | 'accuracy' | 'consistency' | 'milestone' | 'special';
}

export interface ProgressMilestone {
  id: string;
  title: string;
  description: string;
  threshold: number;
  metric: 'wpm' | 'accuracy' | 'sessions' | 'time' | 'streak';
  reached: boolean;
  reachedAt?: Date;
  celebration: string;
}

export interface MotivationalQuote {
  text: string;
  author: string;
  category: 'perseverance' | 'growth' | 'confidence' | 'effort' | 'progress';
}

const feedbackMessages: Record<FeedbackType, string[]> = {
  success: [
    '🎉 Excellent work!',
    '✨ You nailed it!',
    '🌟 Perfect!',
    '👏 Well done!',
    '🚀 Amazing!',
    '💯 Outstanding!',
    '⭐ Fantastic!',
    '🎯 Right on target!',
  ],
  improvement: [
    '📈 You\'re getting better!',
    '💪 Great progress!',
    '🌱 Keep growing!',
    '⬆️ Moving up!',
    '🔥 On fire with improvement!',
    '✨ Getting stronger!',
    '🎊 Nice improvement!',
    '📊 Progress is showing!',
  ],
  milestone: [
    '🏆 Milestone reached!',
    '🎖️ Achievement unlocked!',
    '🥇 New record!',
    '👑 You\'re crushing it!',
    '💎 Remarkable milestone!',
    '🌟 Major achievement!',
    '🎯 Goal accomplished!',
    '🚀 Next level reached!',
  ],
  streak: [
    '🔥 Streak maintained!',
    '⚡ On a roll!',
    '💫 Consistency pays off!',
    '🌟 Keep the momentum!',
    '🎯 Staying committed!',
    '💪 Dedication showing!',
    '✨ Impressive streak!',
    '🏃 Keep going strong!',
  ],
  encouragement: [
    '💙 You\'re doing great!',
    '🌈 Keep it up!',
    '✨ Believe in yourself!',
    '🌟 You\'ve got this!',
    '💪 Stay strong!',
    '🎯 Focus on progress!',
    '🌱 Every step counts!',
    '💫 You\'re improving!',
  ],
  achievement: [
    '🏅 New achievement!',
    '🎖️ Badge earned!',
    '🏆 Trophy unlocked!',
    '⭐ Special recognition!',
    '💎 Rare accomplishment!',
    '👑 Elite status!',
    '🌟 Remarkable feat!',
    '🎊 Congratulations!',
  ],
  effort: [
    '💪 Great effort!',
    '🌟 Trying is winning!',
    '✨ Effort matters most!',
    '🎯 Persistence pays!',
    '💙 Proud of your effort!',
    '🌱 Growth through trying!',
    '🔥 Never give up!',
    '⭐ Keep pushing forward!',
  ],
  persistence: [
    '🏃 Keep going!',
    '💪 Don\'t stop now!',
    '🌟 Persistence is key!',
    '✨ You\'re unstoppable!',
    '🔥 Determined spirit!',
    '💫 Resilience shining!',
    '🎯 Stay the course!',
    '⚡ Power through!',
  ],
};

const motivationalQuotes: MotivationalQuote[] = [
  {
    text: 'Progress, not perfection.',
    author: 'Unknown',
    category: 'progress',
  },
  {
    text: 'Every expert was once a beginner.',
    author: 'Helen Hayes',
    category: 'growth',
  },
  {
    text: 'Believe you can and you\'re halfway there.',
    author: 'Theodore Roosevelt',
    category: 'confidence',
  },
  {
    text: 'It does not matter how slowly you go as long as you do not stop.',
    author: 'Confucius',
    category: 'perseverance',
  },
  {
    text: 'Effort is never wasted, even when it leads to disappointing results.',
    author: 'Epictetus',
    category: 'effort',
  },
  {
    text: 'The only way to do great work is to love what you do.',
    author: 'Steve Jobs',
    category: 'effort',
  },
  {
    text: 'Success is the sum of small efforts repeated day in and day out.',
    author: 'Robert Collier',
    category: 'perseverance',
  },
  {
    text: 'You are braver than you believe, stronger than you seem.',
    author: 'A.A. Milne',
    category: 'confidence',
  },
];

const achievements: Achievement[] = [
  {
    id: 'first-session',
    title: 'First Steps',
    description: 'Complete your first typing session',
    icon: '👶',
    unlocked: false,
    progress: 0,
    category: 'milestone',
  },
  {
    id: 'speed-demon',
    title: 'Speed Demon',
    description: 'Reach 60 WPM',
    icon: '⚡',
    unlocked: false,
    progress: 0,
    category: 'speed',
  },
  {
    id: 'accuracy-ace',
    title: 'Accuracy Ace',
    description: 'Achieve 95% accuracy',
    icon: '🎯',
    unlocked: false,
    progress: 0,
    category: 'accuracy',
  },
  {
    id: 'week-warrior',
    title: 'Week Warrior',
    description: 'Practice 7 days in a row',
    icon: '🔥',
    unlocked: false,
    progress: 0,
    category: 'consistency',
  },
  {
    id: 'century-club',
    title: 'Century Club',
    description: 'Complete 100 typing sessions',
    icon: '💯',
    unlocked: false,
    progress: 0,
    category: 'milestone',
  },
  {
    id: 'perfectionist',
    title: 'Perfectionist',
    description: 'Complete a session with 100% accuracy',
    icon: '✨',
    unlocked: false,
    progress: 0,
    category: 'accuracy',
  },
  {
    id: 'lightning-fast',
    title: 'Lightning Fast',
    description: 'Reach 100 WPM',
    icon: '⚡',
    unlocked: false,
    progress: 0,
    category: 'speed',
  },
  {
    id: 'consistent-learner',
    title: 'Consistent Learner',
    description: 'Practice 30 days in a row',
    icon: '📚',
    unlocked: false,
    progress: 0,
    category: 'consistency',
  },
];

const progressMilestones: ProgressMilestone[] = [
  {
    id: 'first-wpm-20',
    title: '20 WPM Milestone',
    description: 'You\'ve reached 20 words per minute!',
    threshold: 20,
    metric: 'wpm',
    reached: false,
    celebration: '🎉 Great start on your typing journey!',
  },
  {
    id: 'first-wpm-40',
    title: '40 WPM Milestone',
    description: 'You\'ve reached 40 words per minute!',
    threshold: 40,
    metric: 'wpm',
    reached: false,
    celebration: '🚀 You\'re making excellent progress!',
  },
  {
    id: 'first-accuracy-80',
    title: '80% Accuracy',
    description: 'You\'ve reached 80% accuracy!',
    threshold: 80,
    metric: 'accuracy',
    reached: false,
    celebration: '🎯 Your accuracy is improving!',
  },
  {
    id: 'first-accuracy-90',
    title: '90% Accuracy',
    description: 'You\'ve reached 90% accuracy!',
    threshold: 90,
    metric: 'accuracy',
    reached: false,
    celebration: '✨ Outstanding accuracy!',
  },
  {
    id: 'ten-sessions',
    title: '10 Sessions Complete',
    description: 'You\'ve completed 10 practice sessions!',
    threshold: 10,
    metric: 'sessions',
    reached: false,
    celebration: '💪 Building a great habit!',
  },
];

const defaultSettings: FeedbackSettings = {
  enabled: true,
  style: 'moderate',
  frequency: 'medium',
  showAnimations: true,
  playSound: true,
  soundVolume: 60,
  showConfetti: true,
  showBadges: true,
  personalizedMessages: true,
  trackProgress: true,
  celebrateSmallWins: true,
  focusOnEffort: true,
  avoidComparisons: false,
  includeQuotes: true,
};

export const usePositiveFeedback = () => {
  const [settings, setSettings] = useState<FeedbackSettings>(defaultSettings);
  const [messages, setMessages] = useState<FeedbackMessage[]>([]);
  const [userAchievements, setUserAchievements] = useState<Achievement[]>(achievements);
  const [milestones, setMilestones] = useState<ProgressMilestone[]>(progressMilestones);
  const [activeMessage, setActiveMessage] = useState<FeedbackMessage | null>(null);

  const getRandomMessage = useCallback((type: FeedbackType): string => {
    const typeMessages = feedbackMessages[type];
    return typeMessages[Math.floor(Math.random() * typeMessages.length)];
  }, []);

  const getRandomQuote = useCallback((): MotivationalQuote => {
    return motivationalQuotes[
      Math.floor(Math.random() * motivationalQuotes.length)
    ];
  }, []);

  const determineCelebrationLevel = useCallback(
    (type: FeedbackType): CelebrationLevel => {
      switch (type) {
        case 'milestone':
        case 'achievement':
          return 'major';
        case 'improvement':
        case 'streak':
          return 'moderate';
        case 'success':
          return 'minor';
        default:
          return 'minor';
      }
    },
    []
  );

  const showFeedback = useCallback(
    (type: FeedbackType, customMessage?: string) => {
      if (!settings.enabled) return;

      const message: FeedbackMessage = {
        id: `feedback-${Date.now()}`,
        type,
        message: customMessage || getRandomMessage(type),
        icon: getRandomMessage(type).split(' ')[0],
        timestamp: new Date(),
        displayed: false,
        celebrationLevel: determineCelebrationLevel(type),
      };

      setMessages((prev) => [...prev, message]);
      setActiveMessage(message);

      // Play sound if enabled
      if (settings.playSound) {
        playFeedbackSound(message.celebrationLevel);
      }

      // Auto-dismiss after delay
      const dismissDelay = message.celebrationLevel === 'major' ? 5000 : 3000;
      setTimeout(() => {
        setActiveMessage(null);
      }, dismissDelay);
    },
    [settings, getRandomMessage, determineCelebrationLevel]
  );

  const unlockAchievement = useCallback(
    (achievementId: string) => {
      setUserAchievements((prev) =>
        prev.map((achievement) =>
          achievement.id === achievementId
            ? { ...achievement, unlocked: true, unlockedAt: new Date() }
            : achievement
        )
      );

      showFeedback('achievement', `🏆 Achievement Unlocked: ${achievementId}!`);
    },
    [showFeedback]
  );

  const updateAchievementProgress = useCallback(
    (achievementId: string, progress: number) => {
      setUserAchievements((prev) =>
        prev.map((achievement) => {
          if (achievement.id === achievementId) {
            const wasUnlocked = achievement.unlocked;
            const shouldUnlock = progress >= 100 && !wasUnlocked;

            if (shouldUnlock) {
              unlockAchievement(achievementId);
            }

            return { ...achievement, progress };
          }
          return achievement;
        })
      );
    },
    [unlockAchievement]
  );

  const checkMilestone = useCallback(
    (metric: string, value: number) => {
      milestones.forEach((milestone) => {
        if (
          milestone.metric === metric &&
          !milestone.reached &&
          value >= milestone.threshold
        ) {
          setMilestones((prev) =>
            prev.map((m) =>
              m.id === milestone.id
                ? { ...m, reached: true, reachedAt: new Date() }
                : m
            )
          );

          showFeedback('milestone', milestone.celebration);
        }
      });
    },
    [milestones, showFeedback]
  );

  const celebrateSuccess = useCallback(() => {
    showFeedback('success');
  }, [showFeedback]);

  const encourageUser = useCallback(() => {
    showFeedback('encouragement');
  }, [showFeedback]);

  const celebrateImprovement = useCallback((improvement: string) => {
    showFeedback('improvement', `📈 ${improvement}`);
  }, [showFeedback]);

  const celebrateStreak = useCallback((days: number) => {
    showFeedback('streak', `🔥 ${days} day streak! Keep going!`);
  }, [showFeedback]);

  const recognizeEffort = useCallback(() => {
    showFeedback('effort');
  }, [showFeedback]);

  const acknowledgePersistence = useCallback(() => {
    showFeedback('persistence');
  }, [showFeedback]);

  const playFeedbackSound = (level: CelebrationLevel) => {
    // In a real implementation, this would play actual sounds
    console.log(
      `Playing ${level} celebration sound at ${settings.soundVolume}% volume`
    );
  };

  const updateSettings = useCallback((updates: Partial<FeedbackSettings>) => {
    setSettings((prev) => ({ ...prev, ...updates }));
  }, []);

  const clearMessages = useCallback(() => {
    setMessages([]);
  }, []);

  const dismissActiveMessage = useCallback(() => {
    setActiveMessage(null);
  }, []);

  return {
    settings,
    updateSettings,
    messages,
    activeMessage,
    showFeedback,
    celebrateSuccess,
    encourageUser,
    celebrateImprovement,
    celebrateStreak,
    recognizeEffort,
    acknowledgePersistence,
    unlockAchievement,
    updateAchievementProgress,
    checkMilestone,
    achievements: userAchievements,
    milestones,
    getRandomQuote,
    clearMessages,
    dismissActiveMessage,
  };
};

interface PositiveFeedbackControlsProps {
  positiveFeedback: ReturnType<typeof usePositiveFeedback>;
}

export const PositiveFeedbackControls: React.FC<
  PositiveFeedbackControlsProps
> = ({ positiveFeedback }) => {
  const {
    settings,
    updateSettings,
    activeMessage,
    achievements,
    milestones,
    celebrateSuccess,
    encourageUser,
    celebrateImprovement,
    celebrateStreak,
    getRandomQuote,
    dismissActiveMessage,
  } = positiveFeedback;

  const [currentQuote] = useState<MotivationalQuote>(getRandomQuote());

  const unlockedAchievements = achievements.filter((a) => a.unlocked);
  const reachedMilestones = milestones.filter((m) => m.reached);

  return (
    <div
      style={{
        padding: '20px',
        fontFamily: 'system-ui, -apple-system, sans-serif',
        maxWidth: '900px',
      }}
    >
      <h2 style={{ marginBottom: '20px' }}>Positive Feedback System</h2>

      {/* Active Message Display */}
      <AnimatePresence>
        {activeMessage && (
          <motion.div
            initial={{ opacity: 0, y: -20, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.9 }}
            style={{
              marginBottom: '24px',
              padding: '24px',
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              color: 'white',
              borderRadius: '12px',
              textAlign: 'center',
              position: 'relative',
            }}
          >
            <button
              onClick={dismissActiveMessage}
              style={{
                position: 'absolute',
                top: '8px',
                right: '8px',
                background: 'rgba(255,255,255,0.2)',
                border: 'none',
                color: 'white',
                borderRadius: '50%',
                width: '24px',
                height: '24px',
                cursor: 'pointer',
              }}
            >
              ×
            </button>
            <div style={{ fontSize: '48px', marginBottom: '12px' }}>
              {activeMessage.icon}
            </div>
            <div style={{ fontSize: '24px', fontWeight: 'bold' }}>
              {activeMessage.message}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Motivational Quote */}
      {settings.includeQuotes && (
        <div
          style={{
            marginBottom: '24px',
            padding: '20px',
            background: '#e8f5e9',
            border: '2px solid #4caf50',
            borderRadius: '8px',
            fontStyle: 'italic',
          }}
        >
          <div style={{ fontSize: '18px', marginBottom: '8px' }}>
            "{currentQuote.text}"
          </div>
          <div style={{ fontSize: '14px', color: '#666', textAlign: 'right' }}>
            — {currentQuote.author}
          </div>
        </div>
      )}

      {/* Quick Feedback Triggers (for demo) */}
      <div style={{ marginBottom: '24px' }}>
        <h3 style={{ marginBottom: '12px' }}>Try Different Feedback Types</h3>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
          <button
            onClick={celebrateSuccess}
            style={{
              padding: '8px 16px',
              background: '#4caf50',
              color: 'white',
              border: 'none',
              borderRadius: '6px',
              cursor: 'pointer',
            }}
          >
            🎉 Success
          </button>
          <button
            onClick={encourageUser}
            style={{
              padding: '8px 16px',
              background: '#2196f3',
              color: 'white',
              border: 'none',
              borderRadius: '6px',
              cursor: 'pointer',
            }}
          >
            💙 Encouragement
          </button>
          <button
            onClick={() => celebrateImprovement('WPM increased by 5!')}
            style={{
              padding: '8px 16px',
              background: '#ff9800',
              color: 'white',
              border: 'none',
              borderRadius: '6px',
              cursor: 'pointer',
            }}
          >
            📈 Improvement
          </button>
          <button
            onClick={() => celebrateStreak(7)}
            style={{
              padding: '8px 16px',
              background: '#f44336',
              color: 'white',
              border: 'none',
              borderRadius: '6px',
              cursor: 'pointer',
            }}
          >
            🔥 Streak
          </button>
        </div>
      </div>

      {/* Achievements */}
      <div style={{ marginBottom: '24px' }}>
        <h3 style={{ marginBottom: '12px' }}>
          Achievements ({unlockedAchievements.length}/{achievements.length})
        </h3>
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))',
            gap: '12px',
          }}
        >
          {achievements.slice(0, 8).map((achievement) => (
            <div
              key={achievement.id}
              style={{
                padding: '16px',
                background: achievement.unlocked ? '#e3f2fd' : '#f5f5f5',
                border: achievement.unlocked
                  ? '2px solid #2196f3'
                  : '2px solid #ddd',
                borderRadius: '8px',
                opacity: achievement.unlocked ? 1 : 0.6,
              }}
            >
              <div style={{ fontSize: '32px', marginBottom: '8px' }}>
                {achievement.icon}
              </div>
              <div style={{ fontWeight: 'bold', marginBottom: '4px' }}>
                {achievement.title}
              </div>
              <div style={{ fontSize: '12px', color: '#666' }}>
                {achievement.description}
              </div>
              {!achievement.unlocked && achievement.progress > 0 && (
                <div style={{ marginTop: '8px' }}>
                  <div
                    style={{
                      height: '4px',
                      background: '#e0e0e0',
                      borderRadius: '2px',
                      overflow: 'hidden',
                    }}
                  >
                    <div
                      style={{
                        height: '100%',
                        width: `${achievement.progress}%`,
                        background: '#2196f3',
                      }}
                    />
                  </div>
                  <div
                    style={{
                      fontSize: '11px',
                      color: '#888',
                      marginTop: '4px',
                    }}
                  >
                    {achievement.progress}% complete
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Milestones */}
      <div style={{ marginBottom: '24px' }}>
        <h3 style={{ marginBottom: '12px' }}>
          Milestones ({reachedMilestones.length}/{milestones.length})
        </h3>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          {milestones.map((milestone) => (
            <div
              key={milestone.id}
              style={{
                padding: '12px 16px',
                background: milestone.reached ? '#e8f5e9' : 'white',
                border: milestone.reached
                  ? '2px solid #4caf50'
                  : '2px solid #ddd',
                borderRadius: '6px',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
              }}
            >
              <div>
                <div style={{ fontWeight: 'bold' }}>{milestone.title}</div>
                <div style={{ fontSize: '13px', color: '#666' }}>
                  {milestone.description}
                </div>
              </div>
              <div
                style={{
                  padding: '4px 12px',
                  background: milestone.reached ? '#4caf50' : '#9e9e9e',
                  color: 'white',
                  borderRadius: '12px',
                  fontSize: '12px',
                }}
              >
                {milestone.reached ? '✓ Reached' : 'Locked'}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Settings */}
      <div
        style={{
          padding: '16px',
          background: 'white',
          border: '2px solid #ddd',
          borderRadius: '8px',
        }}
      >
        <h3 style={{ marginBottom: '12px' }}>Feedback Settings</h3>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          <label style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <input
              type="checkbox"
              checked={settings.enabled}
              onChange={(e) => updateSettings({ enabled: e.target.checked })}
            />
            Enable positive feedback
          </label>

          <div>
            <label
              style={{ display: 'block', marginBottom: '4px', fontWeight: '500' }}
            >
              Feedback Style
            </label>
            <select
              value={settings.style}
              onChange={(e) =>
                updateSettings({ style: e.target.value as FeedbackStyle })
              }
              disabled={!settings.enabled}
              style={{
                padding: '8px',
                border: '1px solid #ddd',
                borderRadius: '4px',
                width: '100%',
              }}
            >
              <option value="minimal">Minimal - Very subtle</option>
              <option value="subtle">Subtle - Gentle encouragement</option>
              <option value="moderate">Moderate - Balanced feedback</option>
              <option value="enthusiastic">Enthusiastic - Lots of celebration</option>
            </select>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
            <label style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <input
                type="checkbox"
                checked={settings.showAnimations}
                onChange={(e) =>
                  updateSettings({ showAnimations: e.target.checked })
                }
                disabled={!settings.enabled}
              />
              Animations
            </label>
            <label style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <input
                type="checkbox"
                checked={settings.playSound}
                onChange={(e) => updateSettings({ playSound: e.target.checked })}
                disabled={!settings.enabled}
              />
              Sound effects
            </label>
            <label style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <input
                type="checkbox"
                checked={settings.celebrateSmallWins}
                onChange={(e) =>
                  updateSettings({ celebrateSmallWins: e.target.checked })
                }
                disabled={!settings.enabled}
              />
              Celebrate small wins
            </label>
            <label style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <input
                type="checkbox"
                checked={settings.focusOnEffort}
                onChange={(e) =>
                  updateSettings({ focusOnEffort: e.target.checked })
                }
                disabled={!settings.enabled}
              />
              Focus on effort
            </label>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PositiveFeedbackControls;
