import React, { useState, useCallback, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

/**
 * ProgressionSystem Component
 *
 * Comprehensive progression tracking system for autism typing tutor.
 * Tracks user progress, unlocks content, manages levels, achievements,
 * and provides progression visualization.
 *
 * Features:
 * - Level system with XP tracking
 * - Skill progression across multiple areas
 * - Unlockable content and features
 * - Achievement system
 * - Milestone tracking
 * - Progress history and analytics
 * - Adaptive difficulty progression
 * - Learning path recommendations
 * - Visual progress indicators
 * - Celebration animations for milestones
 */

// Types for progression system
export type SkillArea =
  | 'speed'
  | 'accuracy'
  | 'consistency'
  | 'endurance'
  | 'vocabulary'
  | 'punctuation'
  | 'numbers'
  | 'special-chars';

export type UnlockType = 'lesson' | 'theme' | 'feature' | 'customization' | 'achievement';

export interface Level {
  level: number;
  xpRequired: number;
  title: string;
  description: string;
  rewards: string[];
}

export interface SkillProgress {
  area: SkillArea;
  level: number;
  xp: number;
  xpToNextLevel: number;
  totalPracticeTime: number; // seconds
  sessionsCompleted: number;
  averageScore: number;
  bestScore: number;
  lastPracticed: Date | null;
}

export interface Unlock {
  id: string;
  type: UnlockType;
  name: string;
  description: string;
  unlockedAt: Date | null;
  requirements: {
    level?: number;
    skillLevels?: Partial<Record<SkillArea, number>>;
    achievements?: string[];
    customCondition?: () => boolean;
  };
}

export interface Achievement {
  id: string;
  name: string;
  description: string;
  icon: string;
  category: 'speed' | 'accuracy' | 'consistency' | 'milestone' | 'special';
  unlocked: boolean;
  unlockedAt: Date | null;
  progress: number; // 0-100
  requirement: {
    type: string;
    target: number;
    current: number;
  };
}

export interface Milestone {
  id: string;
  name: string;
  description: string;
  icon: string;
  completedAt: Date | null;
  rewards: string[];
}

export interface LearningPath {
  id: string;
  name: string;
  description: string;
  steps: string[];
  currentStep: number;
  completed: boolean;
}

export interface ProgressionSettings {
  enabled: boolean;
  showXP: boolean;
  showLevel: boolean;
  showSkillProgress: boolean;
  showAchievements: boolean;
  celebrateUnlocks: boolean;
  adaptiveDifficulty: boolean;
  trackHistory: boolean;
}

export interface ProgressionStats {
  totalXP: number;
  overallLevel: number;
  lessonsCompleted: number;
  totalPracticeTime: number;
  averageWPM: number;
  averageAccuracy: number;
  longestStreak: number;
  currentStreak: number;
}

// XP calculation helper
function calculateXPForLevel(level: number): number {
  // Exponential XP curve: 100 * (level^1.5)
  return Math.floor(100 * Math.pow(level, 1.5));
}

// Custom hook for progression system
export function useProgressionSystem(initialSettings?: Partial<ProgressionSettings>) {
  const [settings, setSettings] = useState<ProgressionSettings>({
    enabled: true,
    showXP: true,
    showLevel: true,
    showSkillProgress: true,
    showAchievements: true,
    celebrateUnlocks: true,
    adaptiveDifficulty: true,
    trackHistory: true,
    ...initialSettings,
  });

  const [stats, setStats] = useState<ProgressionStats>({
    totalXP: 0,
    overallLevel: 1,
    lessonsCompleted: 0,
    totalPracticeTime: 0,
    averageWPM: 0,
    averageAccuracy: 0,
    longestStreak: 0,
    currentStreak: 0,
  });

  const [skillProgress, setSkillProgress] = useState<SkillProgress[]>([
    {
      area: 'speed',
      level: 1,
      xp: 0,
      xpToNextLevel: 100,
      totalPracticeTime: 0,
      sessionsCompleted: 0,
      averageScore: 0,
      bestScore: 0,
      lastPracticed: null,
    },
    {
      area: 'accuracy',
      level: 1,
      xp: 0,
      xpToNextLevel: 100,
      totalPracticeTime: 0,
      sessionsCompleted: 0,
      averageScore: 0,
      bestScore: 0,
      lastPracticed: null,
    },
    {
      area: 'consistency',
      level: 1,
      xp: 0,
      xpToNextLevel: 100,
      totalPracticeTime: 0,
      sessionsCompleted: 0,
      averageScore: 0,
      bestScore: 0,
      lastPracticed: null,
    },
  ]);

  const [achievements, setAchievements] = useState<Achievement[]>([
    {
      id: 'first-lesson',
      name: 'First Steps',
      description: 'Complete your first typing lesson',
      icon: '🌟',
      category: 'milestone',
      unlocked: false,
      unlockedAt: null,
      progress: 0,
      requirement: { type: 'lessons', target: 1, current: 0 },
    },
    {
      id: 'speed-demon',
      name: 'Speed Demon',
      description: 'Reach 60 WPM',
      icon: '⚡',
      category: 'speed',
      unlocked: false,
      unlockedAt: null,
      progress: 0,
      requirement: { type: 'wpm', target: 60, current: 0 },
    },
    {
      id: 'perfectionist',
      name: 'Perfectionist',
      description: 'Complete a lesson with 100% accuracy',
      icon: '🎯',
      category: 'accuracy',
      unlocked: false,
      unlockedAt: null,
      progress: 0,
      requirement: { type: 'accuracy', target: 100, current: 0 },
    },
    {
      id: 'dedicated',
      name: 'Dedicated',
      description: 'Practice for 7 days in a row',
      icon: '🔥',
      category: 'consistency',
      unlocked: false,
      unlockedAt: null,
      progress: 0,
      requirement: { type: 'streak', target: 7, current: 0 },
    },
    {
      id: 'century',
      name: 'Century Club',
      description: 'Complete 100 lessons',
      icon: '💯',
      category: 'milestone',
      unlocked: false,
      unlockedAt: null,
      progress: 0,
      requirement: { type: 'lessons', target: 100, current: 0 },
    },
  ]);

  const [unlocks, setUnlocks] = useState<Unlock[]>([
    {
      id: 'advanced-lessons',
      type: 'lesson',
      name: 'Advanced Lessons',
      description: 'Unlock advanced typing lessons',
      unlockedAt: null,
      requirements: { level: 5 },
    },
    {
      id: 'custom-themes',
      type: 'customization',
      name: 'Custom Themes',
      description: 'Unlock theme customization',
      unlockedAt: null,
      requirements: { level: 3 },
    },
    {
      id: 'speed-challenges',
      type: 'feature',
      name: 'Speed Challenges',
      description: 'Unlock timed speed challenges',
      unlockedAt: null,
      requirements: { skillLevels: { speed: 5 } },
    },
  ]);

  const [milestones, setMilestones] = useState<Milestone[]>([
    {
      id: 'milestone-10',
      name: '10 Lessons Complete',
      description: 'Complete your first 10 lessons',
      icon: '🎉',
      completedAt: null,
      rewards: ['New theme unlocked', '+500 XP bonus'],
    },
    {
      id: 'milestone-50',
      name: '50 Lessons Complete',
      description: 'Complete 50 lessons',
      icon: '🏆',
      completedAt: null,
      rewards: ['Special badge', '+1000 XP bonus'],
    },
  ]);

  const [learningPaths, setLearningPaths] = useState<LearningPath[]>([
    {
      id: 'beginner-path',
      name: 'Beginner Journey',
      description: 'Learn typing basics step by step',
      steps: ['Home row', 'Top row', 'Bottom row', 'Numbers', 'Punctuation'],
      currentStep: 0,
      completed: false,
    },
  ]);

  const [recentUnlock, setRecentUnlock] = useState<Unlock | Achievement | null>(null);

  const updateSettings = useCallback((newSettings: Partial<ProgressionSettings>) => {
    setSettings((prev) => ({ ...prev, ...newSettings }));
  }, []);

  const addXP = useCallback((amount: number, skillArea?: SkillArea) => {
    // Add to overall XP
    setStats((prev) => {
      const newTotalXP = prev.totalXP + amount;
      const newLevel = Math.floor(Math.sqrt(newTotalXP / 100)) + 1;

      return {
        ...prev,
        totalXP: newTotalXP,
        overallLevel: newLevel,
      };
    });

    // Add to skill-specific XP if specified
    if (skillArea) {
      setSkillProgress((prev) =>
        prev.map((skill) => {
          if (skill.area === skillArea) {
            const newXP = skill.xp + amount;
            const newLevel = Math.floor(Math.sqrt(newXP / 100)) + 1;
            const xpToNextLevel = calculateXPForLevel(newLevel + 1) - newXP;

            return {
              ...skill,
              xp: newXP,
              level: newLevel,
              xpToNextLevel,
            };
          }
          return skill;
        })
      );
    }
  }, []);

  const completeLesson = useCallback(
    (wpm: number, accuracy: number, duration: number, skillAreas: SkillArea[]) => {
      // Update stats
      setStats((prev) => ({
        ...prev,
        lessonsCompleted: prev.lessonsCompleted + 1,
        totalPracticeTime: prev.totalPracticeTime + duration,
        averageWPM:
          (prev.averageWPM * prev.lessonsCompleted + wpm) / (prev.lessonsCompleted + 1),
        averageAccuracy:
          (prev.averageAccuracy * prev.lessonsCompleted + accuracy) /
          (prev.lessonsCompleted + 1),
      }));

      // Calculate XP earned (base 50 + bonuses)
      let xpEarned = 50;
      if (accuracy >= 95) xpEarned += 20;
      if (wpm >= 60) xpEarned += 30;

      // Add XP
      addXP(xpEarned);
      skillAreas.forEach((area) => addXP(xpEarned / 2, area));

      // Check achievements
      checkAchievements({ lessonsCompleted: stats.lessonsCompleted + 1, wpm, accuracy });

      // Check unlocks
      checkUnlocks();

      // Check milestones
      checkMilestones();
    },
    [stats.lessonsCompleted, addXP]
  );

  const checkAchievements = useCallback(
    (data: { lessonsCompleted?: number; wpm?: number; accuracy?: number; streak?: number }) => {
      setAchievements((prev) =>
        prev.map((achievement) => {
          if (achievement.unlocked) return achievement;

          let newCurrent = achievement.requirement.current;
          let shouldUnlock = false;

          switch (achievement.requirement.type) {
            case 'lessons':
              newCurrent = data.lessonsCompleted || newCurrent;
              shouldUnlock = newCurrent >= achievement.requirement.target;
              break;
            case 'wpm':
              newCurrent = data.wpm || newCurrent;
              shouldUnlock = newCurrent >= achievement.requirement.target;
              break;
            case 'accuracy':
              newCurrent = data.accuracy || newCurrent;
              shouldUnlock = newCurrent >= achievement.requirement.target;
              break;
            case 'streak':
              newCurrent = data.streak || newCurrent;
              shouldUnlock = newCurrent >= achievement.requirement.target;
              break;
          }

          if (shouldUnlock) {
            const unlockedAchievement = {
              ...achievement,
              unlocked: true,
              unlockedAt: new Date(),
              progress: 100,
              requirement: { ...achievement.requirement, current: newCurrent },
            };

            setRecentUnlock(unlockedAchievement);
            setTimeout(() => setRecentUnlock(null), 5000);

            return unlockedAchievement;
          }

          const progress = Math.min(
            100,
            (newCurrent / achievement.requirement.target) * 100
          );

          return {
            ...achievement,
            progress,
            requirement: { ...achievement.requirement, current: newCurrent },
          };
        })
      );
    },
    []
  );

  const checkUnlocks = useCallback(() => {
    setUnlocks((prev) =>
      prev.map((unlock) => {
        if (unlock.unlockedAt) return unlock;

        let shouldUnlock = true;

        // Check level requirement
        if (unlock.requirements.level && stats.overallLevel < unlock.requirements.level) {
          shouldUnlock = false;
        }

        // Check skill level requirements
        if (unlock.requirements.skillLevels) {
          Object.entries(unlock.requirements.skillLevels).forEach(([area, requiredLevel]) => {
            const skill = skillProgress.find((s) => s.area === area);
            if (!skill || skill.level < requiredLevel) {
              shouldUnlock = false;
            }
          });
        }

        if (shouldUnlock) {
          const unlockedItem = { ...unlock, unlockedAt: new Date() };
          setRecentUnlock(unlockedItem);
          setTimeout(() => setRecentUnlock(null), 5000);
          return unlockedItem;
        }

        return unlock;
      })
    );
  }, [stats.overallLevel, skillProgress]);

  const checkMilestones = useCallback(() => {
    setMilestones((prev) =>
      prev.map((milestone) => {
        if (milestone.completedAt) return milestone;

        let shouldComplete = false;

        // Check milestone conditions
        if (milestone.id === 'milestone-10' && stats.lessonsCompleted >= 10) {
          shouldComplete = true;
        } else if (milestone.id === 'milestone-50' && stats.lessonsCompleted >= 50) {
          shouldComplete = true;
        }

        if (shouldComplete) {
          // Award milestone rewards (bonus XP)
          const bonusXP = milestone.rewards.includes('+500 XP bonus')
            ? 500
            : milestone.rewards.includes('+1000 XP bonus')
            ? 1000
            : 0;

          if (bonusXP > 0) {
            addXP(bonusXP);
          }

          return { ...milestone, completedAt: new Date() };
        }

        return milestone;
      })
    );
  }, [stats.lessonsCompleted, addXP]);

  const updateLearningPath = useCallback((pathId: string, stepIndex: number) => {
    setLearningPaths((prev) =>
      prev.map((path) => {
        if (path.id === pathId) {
          const completed = stepIndex >= path.steps.length - 1;
          return {
            ...path,
            currentStep: stepIndex,
            completed,
          };
        }
        return path;
      })
    );
  }, []);

  const getRecommendedDifficulty = useCallback((): string => {
    if (!settings.adaptiveDifficulty) return 'intermediate';

    const avgLevel =
      skillProgress.reduce((sum, skill) => sum + skill.level, 0) / skillProgress.length;

    if (avgLevel < 3) return 'beginner';
    if (avgLevel < 6) return 'intermediate';
    if (avgLevel < 9) return 'advanced';
    return 'expert';
  }, [settings.adaptiveDifficulty, skillProgress]);

  return {
    settings,
    updateSettings,
    stats,
    skillProgress,
    achievements,
    unlocks,
    milestones,
    learningPaths,
    recentUnlock,
    addXP,
    completeLesson,
    checkAchievements,
    checkUnlocks,
    updateLearningPath,
    getRecommendedDifficulty,
  };
}

// Main component
interface ProgressionSystemProps {
  onLevelUp?: (newLevel: number) => void;
  onAchievementUnlock?: (achievement: Achievement) => void;
  initialSettings?: Partial<ProgressionSettings>;
}

const ProgressionSystem: React.FC<ProgressionSystemProps> = ({
  onLevelUp,
  onAchievementUnlock: _onAchievementUnlock,
  initialSettings,
}) => {
  const ps = useProgressionSystem(initialSettings);

  // Trigger callbacks on level up
  const prevLevel = React.useRef(ps.stats.overallLevel);
  useEffect(() => {
    if (ps.stats.overallLevel > prevLevel.current) {
      onLevelUp?.(ps.stats.overallLevel);
      prevLevel.current = ps.stats.overallLevel;
    }
  }, [ps.stats.overallLevel, onLevelUp]);

  return (
    <div style={{ padding: '20px', maxWidth: '1000px', margin: '0 auto' }}>
      {/* Overall Stats */}
      <div
        style={{
          padding: '25px',
          backgroundColor: '#E3F2FD',
          borderRadius: '12px',
          marginBottom: '20px',
          border: '2px solid #2196F3',
        }}
      >
        <h2 style={{ marginTop: 0, marginBottom: '20px' }}>Your Progress</h2>

        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))',
            gap: '15px',
          }}
        >
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: '36px', fontWeight: 'bold', color: '#2196F3' }}>
              {ps.stats.overallLevel}
            </div>
            <div style={{ fontSize: '14px', color: '#666' }}>Level</div>
          </div>

          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: '36px', fontWeight: 'bold', color: '#4CAF50' }}>
              {ps.stats.totalXP}
            </div>
            <div style={{ fontSize: '14px', color: '#666' }}>Total XP</div>
          </div>

          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: '36px', fontWeight: 'bold', color: '#FF9800' }}>
              {ps.stats.lessonsCompleted}
            </div>
            <div style={{ fontSize: '14px', color: '#666' }}>Lessons</div>
          </div>

          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: '36px', fontWeight: 'bold', color: '#9C27B0' }}>
              {Math.round(ps.stats.averageWPM)}
            </div>
            <div style={{ fontSize: '14px', color: '#666' }}>Avg WPM</div>
          </div>

          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: '36px', fontWeight: 'bold', color: '#F44336' }}>
              {Math.round(ps.stats.averageAccuracy)}%
            </div>
            <div style={{ fontSize: '14px', color: '#666' }}>Avg Accuracy</div>
          </div>

          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: '36px', fontWeight: 'bold', color: '#00BCD4' }}>
              {ps.stats.currentStreak}🔥
            </div>
            <div style={{ fontSize: '14px', color: '#666' }}>Day Streak</div>
          </div>
        </div>
      </div>

      {/* Skill Progress */}
      {ps.settings.showSkillProgress && (
        <div
          style={{
            padding: '20px',
            backgroundColor: 'white',
            borderRadius: '12px',
            marginBottom: '20px',
            border: '2px solid #e0e0e0',
          }}
        >
          <h3 style={{ marginTop: 0 }}>Skill Progress</h3>

          {ps.skillProgress.map((skill) => (
            <div key={skill.area} style={{ marginBottom: '20px' }}>
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  marginBottom: '8px',
                }}
              >
                <span style={{ fontWeight: 'bold', textTransform: 'capitalize' }}>
                  {skill.area}
                </span>
                <span style={{ color: '#666' }}>
                  Level {skill.level} • {skill.xp} / {skill.xp + skill.xpToNextLevel} XP
                </span>
              </div>
              <div
                style={{
                  height: '10px',
                  backgroundColor: '#e0e0e0',
                  borderRadius: '5px',
                  overflow: 'hidden',
                }}
              >
                <motion.div
                  initial={{ width: 0 }}
                  animate={{
                    width: `${(skill.xp / (skill.xp + skill.xpToNextLevel)) * 100}%`,
                  }}
                  style={{
                    height: '100%',
                    backgroundColor: '#4CAF50',
                  }}
                />
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Achievements */}
      {ps.settings.showAchievements && (
        <div
          style={{
            padding: '20px',
            backgroundColor: 'white',
            borderRadius: '12px',
            marginBottom: '20px',
            border: '2px solid #e0e0e0',
          }}
        >
          <h3 style={{ marginTop: 0 }}>Achievements</h3>

          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))',
              gap: '15px',
            }}
          >
            {ps.achievements.map((achievement) => (
              <motion.div
                key={achievement.id}
                whileHover={{ scale: 1.05 }}
                style={{
                  padding: '15px',
                  backgroundColor: achievement.unlocked ? '#E8F5E9' : '#f5f5f5',
                  borderRadius: '8px',
                  border: achievement.unlocked
                    ? '2px solid #4CAF50'
                    : '2px solid #ddd',
                  opacity: achievement.unlocked ? 1 : 0.6,
                }}
              >
                <div style={{ fontSize: '32px', marginBottom: '8px' }}>
                  {achievement.icon}
                </div>
                <div style={{ fontWeight: 'bold', marginBottom: '5px' }}>
                  {achievement.name}
                </div>
                <div style={{ fontSize: '12px', color: '#666', marginBottom: '10px' }}>
                  {achievement.description}
                </div>
                {!achievement.unlocked && (
                  <div
                    style={{
                      height: '6px',
                      backgroundColor: '#e0e0e0',
                      borderRadius: '3px',
                      overflow: 'hidden',
                    }}
                  >
                    <div
                      style={{
                        height: '100%',
                        width: `${achievement.progress}%`,
                        backgroundColor: '#4CAF50',
                      }}
                    />
                  </div>
                )}
                {achievement.unlocked && (
                  <div style={{ fontSize: '12px', color: '#4CAF50' }}>✓ Unlocked!</div>
                )}
              </motion.div>
            ))}
          </div>
        </div>
      )}

      {/* Recent Unlock Notification */}
      <AnimatePresence>
        {ps.recentUnlock && ps.settings.celebrateUnlocks && (
          <motion.div
            initial={{ opacity: 0, y: -50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -50 }}
            style={{
              position: 'fixed',
              top: '20px',
              right: '20px',
              padding: '20px',
              backgroundColor: '#4CAF50',
              color: 'white',
              borderRadius: '12px',
              boxShadow: '0 4px 12px rgba(0,0,0,0.3)',
              zIndex: 1000,
              maxWidth: '300px',
            }}
          >
            <div style={{ fontSize: '32px', marginBottom: '10px' }}>
              {'icon' in ps.recentUnlock ? ps.recentUnlock.icon : '🎉'}
            </div>
            <div style={{ fontWeight: 'bold', marginBottom: '5px' }}>
              {ps.recentUnlock.name}
            </div>
            <div style={{ fontSize: '14px' }}>{ps.recentUnlock.description}</div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default ProgressionSystem;
