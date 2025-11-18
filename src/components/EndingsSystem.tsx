import React, { useState, useCallback, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

// Types
export type EndingType =
  | 'happy'
  | 'bittersweet'
  | 'triumphant'
  | 'reflective'
  | 'open-ended'
  | 'surprising'
  | 'peaceful'
  | 'continuing';

export type EndingTrigger =
  | 'choice-based'
  | 'performance-based'
  | 'completion-based'
  | 'time-based'
  | 'achievement-based'
  | 'combination';

export interface EndingCondition {
  id: string;
  type: 'choice' | 'accuracy' | 'wpm' | 'completion-percentage' | 'time-spent' | 'mistakes' | 'achievement';
  description: string;
  parameters: Record<string, any>;
  weight: number; // How much this condition influences ending selection
}

export interface Ending {
  id: string;
  title: string;
  type: EndingType;
  trigger: EndingTrigger;
  content: string;
  epilogue?: string; // Optional additional text after main ending
  conditions: EndingCondition[];
  requiredChoices?: string[]; // Specific choices that lead to this ending
  minAccuracy?: number;
  minWPM?: number;
  minCompletionPercentage?: number;
  requiredAchievements?: string[];
  unlockMessage?: string; // Message shown when ending is unlocked
  characterReactions?: { characterId: string; reaction: string }[];
  rewards?: {
    achievementId?: string;
    unlockedContent?: string[];
    bonusPoints?: number;
  };
  rarity: 'common' | 'uncommon' | 'rare' | 'secret';
  discovered: boolean;
  discoveryCount: number;
  firstDiscoveredAt?: Date;
  tags: string[];
  nextSteps?: string[]; // Suggestions for what to do next
}

export interface EndingResult {
  ending: Ending;
  narrativeId: string;
  discoveredAt: Date;
  performance: {
    accuracy: number;
    wpm: number;
    completionPercentage: number;
    timeSpent: number;
    mistakes: number;
  };
  choicesMade: string[];
  conditionsMet: { conditionId: string; met: boolean; value?: any }[];
  isFirstDiscovery: boolean;
}

export interface EndingsCollection {
  narrativeId: string;
  endings: Ending[];
  discoveredEndingIds: string[];
  totalDiscoveries: number;
  completionPercentage: number; // Percentage of endings discovered
  rarestEnding?: Ending;
}

export interface EndingsSystemSettings {
  showEndingType: boolean;
  showEpilogue: boolean;
  showCharacterReactions: boolean;
  displayDiscoveryStats: boolean;
  highlightNewEndings: boolean;
  enableSecretEndings: boolean;
  showNextSteps: boolean;
  celebrateFirstDiscovery: boolean;
}

interface EndingsSystemProps {
  onEndingDiscovered?: (result: EndingResult) => void;
  onAllEndingsDiscovered?: (narrativeId: string) => void;
  settings?: Partial<EndingsSystemSettings>;
}

// Sample endings for a narrative
const sampleNarrativeEndings: Ending[] = [
  {
    id: 'ending-friendship',
    title: 'New Friendships',
    type: 'happy',
    trigger: 'choice-based',
    content: `The mystery was solved, and more importantly, a beautiful friendship was formed. Morgan and Dakota became regular companions, sharing quiet moments in the library and creative projects together. The mysterious book that brought them together remained a treasured reminder that the best discoveries often lead to unexpected connections.`,
    epilogue: `In the following months, their friendship inspired others in the library to share their own creative works. The community grew stronger, one story at a time.`,
    conditions: [
      {
        id: 'cond-friendly-choices',
        type: 'choice',
        description: 'Made friendly choices throughout',
        parameters: { choiceIds: ['choice-talk-kindly', 'choice-share-interest'] },
        weight: 10,
      },
    ],
    requiredChoices: ['choice-1'], // From dialogue/narrative system
    characterReactions: [
      {
        characterId: 'char-morgan-librarian',
        reaction: 'Morgan smiled warmly, grateful for the new friendship.',
      },
      {
        characterId: 'char-dakota-artist',
        reaction: 'Dakota felt accepted and understood for the first time in a long while.',
      },
    ],
    rewards: {
      achievementId: 'achievement-true-friend',
      bonusPoints: 100,
      unlockedContent: ['advanced-friendship-stories'],
    },
    rarity: 'common',
    discovered: false,
    discoveryCount: 0,
    tags: ['friendship', 'positive', 'heartwarming'],
    nextSteps: [
      'Try the "Continuing Friendships" storyline',
      'Explore more character-driven narratives',
      'Create your own friendship story',
    ],
  },
  {
    id: 'ending-mystery-master',
    title: 'Master Detective',
    type: 'triumphant',
    trigger: 'performance-based',
    content: `Not only did you solve the mystery with exceptional skill, but your attention to detail and logical thinking impressed everyone. The library appointed you as the official "Mystery Consultant" for future puzzles. Your systematic approach and excellent typing skills proved that patience and precision lead to success.`,
    epilogue: `Word spread about your detective skills. Soon, people from neighboring libraries sought your help with their own mysteries.`,
    conditions: [
      {
        id: 'cond-high-accuracy',
        type: 'accuracy',
        description: 'Maintained 95% accuracy or higher',
        parameters: { minAccuracy: 95 },
        weight: 8,
      },
      {
        id: 'cond-good-speed',
        type: 'wpm',
        description: 'Typed at 50 WPM or faster',
        parameters: { minWPM: 50 },
        weight: 7,
      },
    ],
    minAccuracy: 95,
    minWPM: 50,
    minCompletionPercentage: 100,
    rewards: {
      achievementId: 'achievement-master-detective',
      bonusPoints: 250,
      unlockedContent: ['advanced-mystery-pack', 'detective-tools'],
    },
    rarity: 'rare',
    discovered: false,
    discoveryCount: 0,
    tags: ['achievement', 'skill-based', 'challenging'],
    nextSteps: [
      'Attempt harder mystery narratives',
      'Try speed-typing challenges',
      'Help others improve their typing accuracy',
    ],
  },
  {
    id: 'ending-quiet-resolution',
    title: 'Peaceful Understanding',
    type: 'peaceful',
    trigger: 'completion-based',
    content: `The mystery resolved itself naturally, in its own time. You learned that not every puzzle needs to be rushed, and sometimes the journey matters more than the destination. The quiet moments spent in the library, carefully considering each clue, brought a sense of calm and accomplishment.`,
    epilogue: `You continued visiting the library, appreciating its peaceful atmosphere and the way it welcomed both mysteries and their solvers.`,
    conditions: [
      {
        id: 'cond-took-time',
        type: 'time-spent',
        description: 'Took time to appreciate the journey',
        parameters: { minTime: 300 }, // 5 minutes
        weight: 6,
      },
      {
        id: 'cond-few-mistakes',
        type: 'mistakes',
        description: 'Made fewer than 20 mistakes',
        parameters: { maxMistakes: 20 },
        weight: 5,
      },
    ],
    rewards: {
      achievementId: 'achievement-mindful-typist',
      bonusPoints: 150,
    },
    rarity: 'uncommon',
    discovered: false,
    discoveryCount: 0,
    tags: ['peaceful', 'mindful', 'calm'],
    nextSteps: [
      'Try meditation-focused typing exercises',
      'Explore slower-paced narratives',
      'Practice mindful typing techniques',
    ],
  },
  {
    id: 'ending-creative-collaboration',
    title: 'Creative Partnership',
    type: 'happy',
    trigger: 'combination',
    content: `The mystery brought together two creative minds. Morgan and Dakota decided to collaborate on a project: curating a special collection of community stories in the library. Their different strengths—Morgan's organization and Dakota's artistic vision—complemented each other perfectly. Together, they created something more beautiful than either could have alone.`,
    epilogue: `The community story collection became the library's most popular section, inspiring countless others to share their voices and find their own creative partnerships.`,
    conditions: [
      {
        id: 'cond-balanced-approach',
        type: 'completion-percentage',
        description: 'Completed all optional content',
        parameters: { minPercentage: 100 },
        weight: 9,
      },
      {
        id: 'cond-collaborative-choices',
        type: 'choice',
        description: 'Made collaborative choices',
        parameters: { choiceIds: ['choice-work-together', 'choice-combine-ideas'] },
        weight: 8,
      },
    ],
    requiredChoices: ['choice-4a', 'choice-community-project'],
    minCompletionPercentage: 100,
    rewards: {
      achievementId: 'achievement-creative-collaboration',
      bonusPoints: 200,
      unlockedContent: ['collaboration-stories', 'duo-typing-exercises'],
    },
    rarity: 'uncommon',
    discovered: false,
    discoveryCount: 0,
    tags: ['collaboration', 'creativity', 'inspiring'],
    nextSteps: [
      'Create a story with a friend',
      'Try collaborative typing challenges',
      'Explore creative writing prompts',
    ],
  },
  {
    id: 'ending-secret-perfectionist',
    title: 'The Perfect Solution',
    type: 'surprising',
    trigger: 'achievement-based',
    content: `Your absolutely perfect performance—100% accuracy, excellent speed, complete exploration, and thoughtful choices—unlocked a secret. The mysterious book revealed hidden pages containing an ancient technique for mindful, perfect typing. You discovered that true mastery comes from the harmony of speed, accuracy, and intention.`,
    epilogue: `This secret technique became your signature approach. You went on to teach others, emphasizing that perfection isn't about being flawless, but about being fully present with each keystroke.`,
    conditions: [
      {
        id: 'cond-perfect-accuracy',
        type: 'accuracy',
        description: '100% accuracy',
        parameters: { minAccuracy: 100 },
        weight: 15,
      },
      {
        id: 'cond-excellent-speed',
        type: 'wpm',
        description: '60+ WPM',
        parameters: { minWPM: 60 },
        weight: 10,
      },
      {
        id: 'cond-perfect-completion',
        type: 'completion-percentage',
        description: '100% completion with all secrets found',
        parameters: { minPercentage: 100 },
        weight: 10,
      },
    ],
    minAccuracy: 100,
    minWPM: 60,
    minCompletionPercentage: 100,
    requiredAchievements: ['achievement-no-mistakes', 'achievement-speed-demon'],
    unlockMessage: '🌟 SECRET ENDING UNLOCKED! 🌟',
    rewards: {
      achievementId: 'achievement-perfectionist',
      bonusPoints: 500,
      unlockedContent: ['secret-typing-techniques', 'master-level-content', 'all-future-narratives'],
    },
    rarity: 'secret',
    discovered: false,
    discoveryCount: 0,
    tags: ['secret', 'perfect', 'mastery', 'achievement'],
    nextSteps: [
      'Share your technique with the community',
      'Attempt the ultimate typing challenges',
      'Become a typing mentor',
    ],
  },
  {
    id: 'ending-continuing-journey',
    title: 'The Journey Continues',
    type: 'open-ended',
    trigger: 'completion-based',
    content: `The mystery of the book was just the beginning. As you completed this chapter, you realized that every ending is also a new beginning. The library holds countless more stories, mysteries, and friendships waiting to be discovered. Your journey as a typist and storyteller has only just begun.`,
    epilogue: `You left the library that day with a smile, knowing you'd return tomorrow, ready for the next adventure.`,
    conditions: [
      {
        id: 'cond-completed-story',
        type: 'completion-percentage',
        description: 'Completed the main story',
        parameters: { minPercentage: 80 },
        weight: 5,
      },
    ],
    minCompletionPercentage: 80,
    rewards: {
      bonusPoints: 100,
      unlockedContent: ['next-chapter-preview'],
    },
    rarity: 'common',
    discovered: false,
    discoveryCount: 0,
    tags: ['open-ended', 'hopeful', 'continuing'],
    nextSteps: [
      'Explore new narrative paths',
      'Revisit this story for different endings',
      'Create your own continuing story',
    ],
  },
];

const defaultSettings: EndingsSystemSettings = {
  showEndingType: true,
  showEpilogue: true,
  showCharacterReactions: true,
  displayDiscoveryStats: true,
  highlightNewEndings: true,
  enableSecretEndings: true,
  showNextSteps: true,
  celebrateFirstDiscovery: true,
};

export const useEndingsSystem = (props: EndingsSystemProps = {}) => {
  const settings = { ...defaultSettings, ...props.settings };

  // State
  const [collections, setCollections] = useState<Map<string, EndingsCollection>>(new Map());
  const [currentEnding, setCurrentEnding] = useState<EndingResult | null>(null);
  const [endingHistory, setEndingHistory] = useState<EndingResult[]>([]);

  // Initialize sample endings
  useEffect(() => {
    const sampleCollection: EndingsCollection = {
      narrativeId: 'narrative-library-mystery',
      endings: sampleNarrativeEndings,
      discoveredEndingIds: [],
      totalDiscoveries: 0,
      completionPercentage: 0,
    };

    setCollections(new Map([['narrative-library-mystery', sampleCollection]]));

    // Load history from localStorage
    try {
      const saved = localStorage.getItem('typing-tutor-endings-history');
      if (saved) {
        const data = JSON.parse(saved);
        setEndingHistory(data.history || []);

        // Update discovered status
        const history = data.history || [];
        const updatedCollections = new Map<string, EndingsCollection>();

        sampleCollection.endings.forEach((ending) => {
          const discoveries = history.filter((h: EndingResult) => h.ending.id === ending.id);
          if (discoveries.length > 0) {
            ending.discovered = true;
            ending.discoveryCount = discoveries.length;
            ending.firstDiscoveredAt = new Date(discoveries[0].discoveredAt);
            sampleCollection.discoveredEndingIds.push(ending.id);
          }
        });

        sampleCollection.totalDiscoveries = sampleCollection.discoveredEndingIds.length;
        sampleCollection.completionPercentage =
          (sampleCollection.discoveredEndingIds.length / sampleCollection.endings.length) * 100;

        updatedCollections.set('narrative-library-mystery', sampleCollection);
        setCollections(updatedCollections);
      }
    } catch (err) {
      console.error('Failed to load ending history:', err);
    }
  }, []);

  // Auto-save history
  useEffect(() => {
    try {
      const data = { history: endingHistory.slice(-100) }; // Keep last 100 endings
      localStorage.setItem('typing-tutor-endings-history', JSON.stringify(data));
    } catch (err) {
      console.error('Failed to save ending history:', err);
    }
  }, [endingHistory]);

  // Evaluate ending conditions
  const evaluateEndingConditions = useCallback(
    (
      ending: Ending,
      performance: {
        accuracy: number;
        wpm: number;
        completionPercentage: number;
        timeSpent: number;
        mistakes: number;
      },
      choicesMade: string[],
      achievementsUnlocked: string[]
    ): { score: number; conditionsMet: { conditionId: string; met: boolean; value?: any }[] } => {
      let score = 0;
      const conditionsMet: { conditionId: string; met: boolean; value?: any }[] = [];

      // Check each condition
      ending.conditions.forEach((condition) => {
        let met = false;
        let value: any;

        switch (condition.type) {
          case 'choice':
            const requiredChoices = condition.parameters.choiceIds || [];
            met = requiredChoices.some((choice: string) => choicesMade.includes(choice));
            value = choicesMade.filter((c) => requiredChoices.includes(c)).length;
            break;
          case 'accuracy':
            met = performance.accuracy >= condition.parameters.minAccuracy;
            value = performance.accuracy;
            break;
          case 'wpm':
            met = performance.wpm >= condition.parameters.minWPM;
            value = performance.wpm;
            break;
          case 'completion-percentage':
            met = performance.completionPercentage >= condition.parameters.minPercentage;
            value = performance.completionPercentage;
            break;
          case 'time-spent':
            met = performance.timeSpent >= condition.parameters.minTime;
            value = performance.timeSpent;
            break;
          case 'mistakes':
            met = performance.mistakes <= condition.parameters.maxMistakes;
            value = performance.mistakes;
            break;
          case 'achievement':
            met = achievementsUnlocked.includes(condition.parameters.achievementId);
            value = achievementsUnlocked.includes(condition.parameters.achievementId);
            break;
        }

        if (met) {
          score += condition.weight;
        }

        conditionsMet.push({
          conditionId: condition.id,
          met,
          value,
        });
      });

      // Additional checks
      if (ending.minAccuracy && performance.accuracy < ending.minAccuracy) score -= 10;
      if (ending.minWPM && performance.wpm < ending.minWPM) score -= 10;
      if (ending.minCompletionPercentage && performance.completionPercentage < ending.minCompletionPercentage) score -= 10;

      // Required choices
      if (ending.requiredChoices) {
        const hasAll = ending.requiredChoices.every((c) => choicesMade.includes(c));
        if (!hasAll) score -= 20;
      }

      // Required achievements
      if (ending.requiredAchievements) {
        const hasAll = ending.requiredAchievements.every((a) => achievementsUnlocked.includes(a));
        if (!hasAll) score -= 20;
      }

      return { score, conditionsMet };
    },
    []
  );

  // Determine which ending to show
  const determineEnding = useCallback(
    (
      narrativeId: string,
      performance: {
        accuracy: number;
        wpm: number;
        completionPercentage: number;
        timeSpent: number;
        mistakes: number;
      },
      choicesMade: string[],
      achievementsUnlocked: string[] = []
    ): EndingResult | null => {
      const collection = collections.get(narrativeId);
      if (!collection) return null;

      let availableEndings = collection.endings;

      // Filter out secret endings if not enabled
      if (!settings.enableSecretEndings) {
        availableEndings = availableEndings.filter((e) => e.rarity !== 'secret');
      }

      // Evaluate all endings
      const evaluatedEndings = availableEndings.map((ending) => {
        const evaluation = evaluateEndingConditions(
          ending,
          performance,
          choicesMade,
          achievementsUnlocked
        );
        return { ending, ...evaluation };
      });

      // Sort by score (highest first)
      const sorted = evaluatedEndings.sort((a, b) => b.score - a.score);

      // Select best ending
      const selectedEnding = sorted[0];
      if (!selectedEnding || selectedEnding.score < 0) {
        // Fall back to default ending
        const defaultEnding = availableEndings.find((e) => e.rarity === 'common');
        if (defaultEnding) {
          return createEndingResult(
            defaultEnding,
            narrativeId,
            performance,
            choicesMade,
            []
          );
        }
        return null;
      }

      const result = createEndingResult(
        selectedEnding.ending,
        narrativeId,
        performance,
        choicesMade,
        selectedEnding.conditionsMet
      );

      return result;
    },
    [collections, settings.enableSecretEndings, evaluateEndingConditions]
  );

  // Create ending result
  const createEndingResult = useCallback(
    (
      ending: Ending,
      narrativeId: string,
      performance: any,
      choicesMade: string[],
      conditionsMet: any[]
    ): EndingResult => {
      const isFirstDiscovery = !ending.discovered;

      const result: EndingResult = {
        ending,
        narrativeId,
        discoveredAt: new Date(),
        performance,
        choicesMade,
        conditionsMet,
        isFirstDiscovery,
      };

      // Update ending discovery status
      if (isFirstDiscovery) {
        ending.discovered = true;
        ending.firstDiscoveredAt = new Date();
      }
      ending.discoveryCount++;

      // Update collection
      const collection = collections.get(narrativeId);
      if (collection) {
        if (!collection.discoveredEndingIds.includes(ending.id)) {
          collection.discoveredEndingIds.push(ending.id);
          collection.totalDiscoveries++;
          collection.completionPercentage =
            (collection.discoveredEndingIds.length / collection.endings.length) * 100;

          // Check if all endings discovered
          if (collection.completionPercentage === 100) {
            props.onAllEndingsDiscovered?.(narrativeId);
          }
        }

        setCollections(new Map(collections));
      }

      // Add to history
      setEndingHistory((prev) => [...prev, result]);
      setCurrentEnding(result);

      props.onEndingDiscovered?.(result);

      return result;
    },
    [collections, props]
  );

  // Get collection statistics
  const getCollectionStats = useCallback(
    (narrativeId: string) => {
      const collection = collections.get(narrativeId);
      if (!collection) return null;

      const rarityCount = collection.endings.reduce(
        (acc, ending) => {
          acc[ending.rarity] = (acc[ending.rarity] || 0) + 1;
          return acc;
        },
        {} as Record<string, number>
      );

      const discoveredByRarity = collection.endings
        .filter((e) => e.discovered)
        .reduce(
          (acc, ending) => {
            acc[ending.rarity] = (acc[ending.rarity] || 0) + 1;
            return acc;
          },
          {} as Record<string, number>
        );

      return {
        totalEndings: collection.endings.length,
        discoveredCount: collection.discoveredEndingIds.length,
        completionPercentage: collection.completionPercentage,
        rarityCount,
        discoveredByRarity,
        rarestDiscovered: collection.endings
          .filter((e) => e.discovered)
          .sort((a, b) => {
            const rarityOrder = { common: 1, uncommon: 2, rare: 3, secret: 4 };
            return rarityOrder[b.rarity] - rarityOrder[a.rarity];
          })[0],
        mostDiscoveredEnding: collection.endings.reduce((prev, current) =>
          current.discoveryCount > prev.discoveryCount ? current : prev
        ),
      };
    },
    [collections]
  );

  return {
    // State
    collections,
    currentEnding,
    endingHistory,
    settings,

    // Actions
    determineEnding,
    getCollectionStats,
  };
};

// Example component
export const EndingsSystemComponent: React.FC<EndingsSystemProps> = (props) => {
  const {
    currentEnding,
    settings,
  } = useEndingsSystem(props);

  return (
    <div className="endings-system">
      <AnimatePresence>
        {currentEnding && (
          <motion.div
            className="ending-display"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
          >
            {settings.celebrateFirstDiscovery && currentEnding.isFirstDiscovery && (
              <motion.div
                className="first-discovery-banner"
                initial={{ y: -50, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.3 }}
              >
                🎉 NEW ENDING DISCOVERED! 🎉
              </motion.div>
            )}

            {currentEnding.ending.unlockMessage && (
              <div className="unlock-message">{currentEnding.ending.unlockMessage}</div>
            )}

            <h2>{currentEnding.ending.title}</h2>

            {settings.showEndingType && (
              <p className={`ending-type ${currentEnding.ending.type}`}>
                {currentEnding.ending.type.replace(/-/g, ' ')}
              </p>
            )}

            <div className="ending-content">
              <p>{currentEnding.ending.content}</p>
            </div>

            {settings.showEpilogue && currentEnding.ending.epilogue && (
              <div className="epilogue">
                <h4>Epilogue</h4>
                <p>{currentEnding.ending.epilogue}</p>
              </div>
            )}

            {settings.showCharacterReactions &&
              currentEnding.ending.characterReactions &&
              currentEnding.ending.characterReactions.length > 0 && (
                <div className="character-reactions">
                  <h4>Character Reactions</h4>
                  {currentEnding.ending.characterReactions.map((reaction) => (
                    <p key={reaction.characterId} className="reaction">
                      {reaction.reaction}
                    </p>
                  ))}
                </div>
              )}

            {currentEnding.ending.rewards && (
              <div className="rewards">
                <h4>Rewards</h4>
                {currentEnding.ending.rewards.achievementId && (
                  <p>🏆 Achievement Unlocked: {currentEnding.ending.rewards.achievementId}</p>
                )}
                {currentEnding.ending.rewards.bonusPoints && (
                  <p>⭐ Bonus Points: +{currentEnding.ending.rewards.bonusPoints}</p>
                )}
                {currentEnding.ending.rewards.unlockedContent && (
                  <div>
                    <p>🔓 Unlocked Content:</p>
                    <ul>
                      {currentEnding.ending.rewards.unlockedContent.map((content) => (
                        <li key={content}>{content}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            )}

            {settings.showNextSteps && currentEnding.ending.nextSteps && (
              <div className="next-steps">
                <h4>What's Next?</h4>
                <ul>
                  {currentEnding.ending.nextSteps.map((step, index) => (
                    <li key={index}>{step}</li>
                  ))}
                </ul>
              </div>
            )}

            {settings.displayDiscoveryStats && (
              <div className="discovery-stats">
                <p>
                  Discovery #{currentEnding.ending.discoveryCount}
                  {currentEnding.isFirstDiscovery && ' (First time!)'}
                </p>
                <p className="rarity">{currentEnding.ending.rarity.toUpperCase()} ENDING</p>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default EndingsSystemComponent;
