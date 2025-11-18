import React, { useState, useCallback, useEffect } from 'react';
import { motion } from 'framer-motion';

// Types
export type NarrativeGenre =
  | 'adventure'
  | 'mystery'
  | 'fantasy'
  | 'sci-fi'
  | 'slice-of-life'
  | 'educational'
  | 'social'
  | 'inspirational'
  | 'custom';

export type NarrativeLength = 'micro' | 'short' | 'medium' | 'long' | 'epic';

export type NarrativeStructure =
  | 'linear'
  | 'branching'
  | 'circular'
  | 'episodic'
  | 'parallel'
  | 'flashback';

export type PlotPoint =
  | 'exposition'
  | 'inciting-incident'
  | 'rising-action'
  | 'climax'
  | 'falling-action'
  | 'resolution';

export interface NarrativeSection {
  id: string;
  plotPoint: PlotPoint;
  title: string;
  content: string;
  characterIds: string[]; // Characters in this section
  location?: string;
  timeOfDay?: string;
  mood?: string;
  dialogueTreeId?: string; // Optional dialogue interaction
  choices?: NarrativeChoice[];
  wordCount: number;
  estimatedTypingTime: number; // seconds at average WPM
  order: number;
}

export interface NarrativeChoice {
  id: string;
  text: string;
  leadsToSectionId: string;
  description?: string;
  requiresSkillLevel?: number; // 1-10
}

export interface Narrative {
  id: string;
  title: string;
  description: string;
  genre: NarrativeGenre;
  length: NarrativeLength;
  structure: NarrativeStructure;
  sections: Map<string, NarrativeSection>;
  startSectionId: string;
  characterIds: string[]; // All characters involved
  tags: string[];
  autismFriendly: boolean;
  themes: string[]; // e.g., "friendship", "perseverance", "discovery"
  contentWarnings?: string[];
  targetAudience: 'child' | 'teen' | 'adult' | 'all';
  difficulty: number; // 1-10 (typing difficulty)
  totalWordCount: number;
  estimatedDuration: number; // Total estimated time in seconds
  created: Date;
  lastModified: Date;
  author: 'built-in' | 'custom' | 'ai-generated';
  usageCount: number;
  rating?: number; // 1-5
  isFavorite: boolean;
}

export interface NarrativeProgress {
  narrativeId: string;
  currentSectionId: string;
  visitedSections: string[];
  choicesMade: { sectionId: string; choiceId: string; timestamp: Date }[];
  startTime: Date;
  lastAccessTime: Date;
  completed: boolean;
  completionTime?: Date;
  typingStats: {
    totalWords: number;
    totalTime: number; // ms
    averageWPM: number;
    averageAccuracy: number;
    mistakes: number;
  };
}

export interface NarrativeTemplate {
  id: string;
  name: string;
  description: string;
  genre: NarrativeGenre;
  structure: NarrativeStructure;
  plotPoints: {
    plotPoint: PlotPoint;
    prompt: string; // Guidance for generating this section
    suggestedLength: number; // words
  }[];
}

export interface NarrativeSystemSettings {
  autoSaveProgress: boolean;
  showProgressIndicator: boolean;
  allowNarrativeSkipping: boolean;
  requireSectionCompletion: boolean; // Must finish typing before advancing
  showWordCount: boolean;
  showEstimatedTime: boolean;
  highlightCurrentSection: boolean;
  saveChoices: boolean;
  enableBranching: boolean;
}

interface NarrativeSystemProps {
  onNarrativeStart?: (narrative: Narrative) => void;
  onNarrativeComplete?: (narrative: Narrative, progress: NarrativeProgress) => void;
  onSectionComplete?: (section: NarrativeSection, progress: NarrativeProgress) => void;
  settings?: Partial<NarrativeSystemSettings>;
}

// Built-in narrative templates
const narrativeTemplates: NarrativeTemplate[] = [
  {
    id: 'template-heros-journey',
    name: "Hero's Journey",
    description: 'Classic adventure structure',
    genre: 'adventure',
    structure: 'linear',
    plotPoints: [
      {
        plotPoint: 'exposition',
        prompt: 'Introduce the hero in their ordinary world',
        suggestedLength: 100,
      },
      {
        plotPoint: 'inciting-incident',
        prompt: 'The call to adventure arrives',
        suggestedLength: 150,
      },
      {
        plotPoint: 'rising-action',
        prompt: 'The hero faces challenges and grows',
        suggestedLength: 200,
      },
      {
        plotPoint: 'climax',
        prompt: 'The hero faces their greatest challenge',
        suggestedLength: 150,
      },
      {
        plotPoint: 'falling-action',
        prompt: 'The aftermath of victory',
        suggestedLength: 100,
      },
      {
        plotPoint: 'resolution',
        prompt: 'Return to ordinary world, transformed',
        suggestedLength: 100,
      },
    ],
  },
  {
    id: 'template-mystery',
    name: 'Mystery Investigation',
    description: 'Solve a mystery step by step',
    genre: 'mystery',
    structure: 'branching',
    plotPoints: [
      {
        plotPoint: 'exposition',
        prompt: 'Introduce the mystery and main characters',
        suggestedLength: 120,
      },
      {
        plotPoint: 'inciting-incident',
        prompt: 'The mystery deepens',
        suggestedLength: 100,
      },
      {
        plotPoint: 'rising-action',
        prompt: 'Gather clues and investigate',
        suggestedLength: 180,
      },
      {
        plotPoint: 'climax',
        prompt: 'Confront the truth',
        suggestedLength: 140,
      },
      {
        plotPoint: 'resolution',
        prompt: 'Mystery solved, lessons learned',
        suggestedLength: 100,
      },
    ],
  },
  {
    id: 'template-slice-of-life',
    name: 'Daily Adventure',
    description: 'Meaningful moments in everyday life',
    genre: 'slice-of-life',
    structure: 'episodic',
    plotPoints: [
      {
        plotPoint: 'exposition',
        prompt: 'A normal day begins',
        suggestedLength: 80,
      },
      {
        plotPoint: 'inciting-incident',
        prompt: 'Something unexpected happens',
        suggestedLength: 90,
      },
      {
        plotPoint: 'rising-action',
        prompt: 'Navigate the situation',
        suggestedLength: 120,
      },
      {
        plotPoint: 'resolution',
        prompt: 'Find meaning in the moment',
        suggestedLength: 80,
      },
    ],
  },
];

// Sample built-in narrative
function createSampleNarrative(): Narrative {
  const sections = new Map<string, NarrativeSection>();

  const section1: NarrativeSection = {
    id: 'section-1',
    plotPoint: 'exposition',
    title: 'The Library',
    content: `Morgan loved working at the library. The quiet atmosphere, the smell of books, and the systematic organization of knowledge brought comfort and joy. Every morning followed the same routine: unlock the door at 8:00 AM, turn on the soft lights, and check that all books were in their proper places. Today would be special, though Morgan didn't know it yet.`,
    characterIds: ['char-morgan-librarian'],
    location: 'City Library',
    timeOfDay: 'morning',
    mood: 'calm',
    wordCount: 67,
    estimatedTypingTime: 40,
    order: 1,
  };

  const section2: NarrativeSection = {
    id: 'section-2',
    plotPoint: 'inciting-incident',
    title: 'The Mysterious Book',
    content: `While shelving returns, Morgan discovered a book that wasn't in the catalog system. It was old, leather-bound, with no title on the spine. Opening it carefully, Morgan found beautiful handwritten pages filled with stories and illustrations. This mystery needed solving. Who left this book? Where did it come from? Morgan's love for organization and detail would help uncover the truth.`,
    characterIds: ['char-morgan-librarian'],
    location: 'City Library',
    timeOfDay: 'mid-morning',
    mood: 'curious',
    wordCount: 73,
    estimatedTypingTime: 44,
    order: 2,
  };

  const section3: NarrativeSection = {
    id: 'section-3',
    plotPoint: 'rising-action',
    title: 'Research Begins',
    content: `Morgan began investigating. First, check the security footage. Then, examine the book's binding and paper type. Finally, research similar bookbinding techniques online. Each clue led to another discovery. The book appeared to be handmade, recently, by someone with great care and skill. But why leave it anonymously? Morgan felt excited by the puzzle, though careful to maintain the library's quiet atmosphere.`,
    characterIds: ['char-morgan-librarian'],
    location: 'City Library',
    timeOfDay: 'afternoon',
    mood: 'excited',
    wordCount: 78,
    estimatedTypingTime: 47,
    order: 3,
    choices: [
      {
        id: 'choice-1',
        text: 'Ask library visitors about the book',
        leadsToSectionId: 'section-4a',
        description: 'Talk to people who might have seen something',
      },
      {
        id: 'choice-2',
        text: 'Continue researching independently',
        leadsToSectionId: 'section-4b',
        description: 'Focus on examining the book itself',
      },
    ],
  };

  const section4a: NarrativeSection = {
    id: 'section-4a',
    plotPoint: 'climax',
    title: 'A Familiar Face',
    content: `Morgan decided to ask regular library visitors. On the third person, there was success! A young artist named Dakota admitted to leaving the book. "I wanted to share stories," Dakota explained, "but I was nervous about people knowing it was me." Morgan understood that feeling. Together, they created a plan: a community story project where anyone could contribute anonymously if they wished.`,
    characterIds: ['char-morgan-librarian', 'char-dakota-artist'],
    location: 'City Library',
    timeOfDay: 'late afternoon',
    mood: 'happy',
    wordCount: 82,
    estimatedTypingTime: 49,
    order: 4,
  };

  const section4b: NarrativeSection = {
    id: 'section-4b',
    plotPoint: 'climax',
    title: 'The Signature',
    content: `Deep in the book's final pages, Morgan found a small signature hidden in an illustration: Dakota. A local artist who visited the library every week! The next time Dakota came in, Morgan approached gently. "Your book is beautiful," Morgan said quietly. Dakota smiled with relief. "I hoped someone who appreciated stories would find it." They became friends, bonded by their love of creativity and quiet spaces.`,
    characterIds: ['char-morgan-librarian', 'char-dakota-artist'],
    location: 'City Library',
    timeOfDay: 'late afternoon',
    mood: 'happy',
    wordCount: 82,
    estimatedTypingTime: 49,
    order: 4,
  };

  const section5: NarrativeSection = {
    id: 'section-5',
    plotPoint: 'resolution',
    title: 'New Beginnings',
    content: `The mysterious book found a special place in the library's local authors section. Morgan created a new system for community-contributed works, organized by theme and style. The library felt even more like home now, a place where quiet people could share their voices in comfortable ways. Morgan learned that sometimes the best mysteries lead to unexpected friendships.`,
    characterIds: ['char-morgan-librarian', 'char-dakota-artist'],
    location: 'City Library',
    timeOfDay: 'evening',
    mood: 'content',
    wordCount: 75,
    estimatedTypingTime: 45,
    order: 5,
  };

  sections.set('section-1', section1);
  sections.set('section-2', section2);
  sections.set('section-3', section3);
  sections.set('section-4a', section4a);
  sections.set('section-4b', section4b);
  sections.set('section-5', section5);

  const totalWords = Array.from(sections.values()).reduce((sum, s) => sum + s.wordCount, 0);
  const totalTime = Array.from(sections.values()).reduce((sum, s) => sum + s.estimatedTypingTime, 0);

  return {
    id: 'narrative-library-mystery',
    title: 'The Library Mystery',
    description: 'A heartwarming mystery about unexpected connections',
    genre: 'mystery',
    length: 'short',
    structure: 'branching',
    sections,
    startSectionId: 'section-1',
    characterIds: ['char-morgan-librarian', 'char-dakota-artist'],
    tags: ['mystery', 'friendship', 'library', 'autism-rep'],
    autismFriendly: true,
    themes: ['friendship', 'acceptance', 'mystery-solving', 'quiet-strength'],
    targetAudience: 'all',
    difficulty: 4,
    totalWordCount: totalWords,
    estimatedDuration: totalTime,
    created: new Date(),
    lastModified: new Date(),
    author: 'built-in',
    usageCount: 0,
    rating: 5,
    isFavorite: false,
  };
}

const defaultSettings: NarrativeSystemSettings = {
  autoSaveProgress: true,
  showProgressIndicator: true,
  allowNarrativeSkipping: false,
  requireSectionCompletion: true,
  showWordCount: true,
  showEstimatedTime: true,
  highlightCurrentSection: true,
  saveChoices: true,
  enableBranching: true,
};

export const useNarrativeSystem = (props: NarrativeSystemProps = {}) => {
  const settings = { ...defaultSettings, ...props.settings };

  // State
  const [narratives, setNarratives] = useState<Narrative[]>([]);
  const [currentNarrative, setCurrentNarrative] = useState<Narrative | null>(null);
  const [currentProgress, setCurrentProgress] = useState<NarrativeProgress | null>(null);
  const [allProgress, setAllProgress] = useState<NarrativeProgress[]>([]);
  const [templates] = useState<NarrativeTemplate[]>(narrativeTemplates);

  // Initialize with built-in narrative
  useEffect(() => {
    const sampleNarrative = createSampleNarrative();
    setNarratives([sampleNarrative]);

    // Load progress from localStorage
    try {
      const saved = localStorage.getItem('typing-tutor-narrative-progress');
      if (saved) {
        const data = JSON.parse(saved);
        setAllProgress(data.progress || []);
      }
    } catch (err) {
      console.error('Failed to load narrative progress:', err);
    }
  }, []);

  // Auto-save progress
  useEffect(() => {
    if (!settings.autoSaveProgress) return;

    try {
      const data = { progress: allProgress };
      localStorage.setItem('typing-tutor-narrative-progress', JSON.stringify(data));
    } catch (err) {
      console.error('Failed to save narrative progress:', err);
    }
  }, [allProgress, settings.autoSaveProgress]);

  // Start narrative
  const startNarrative = useCallback(
    (narrativeId: string) => {
      const narrative = narratives.find((n) => n.id === narrativeId);
      if (!narrative) return false;

      const startSection = narrative.sections.get(narrative.startSectionId);
      if (!startSection) return false;

      // Check for existing progress
      const existingProgress = allProgress.find((p) => p.narrativeId === narrativeId && !p.completed);

      const progress: NarrativeProgress = existingProgress || {
        narrativeId,
        currentSectionId: narrative.startSectionId,
        visitedSections: [narrative.startSectionId],
        choicesMade: [],
        startTime: new Date(),
        lastAccessTime: new Date(),
        completed: false,
        typingStats: {
          totalWords: 0,
          totalTime: 0,
          averageWPM: 0,
          averageAccuracy: 0,
          mistakes: 0,
        },
      };

      setCurrentNarrative(narrative);
      setCurrentProgress(progress);

      if (!existingProgress) {
        setAllProgress((prev) => [...prev, progress]);
      }

      // Increment usage count
      setNarratives((prev) =>
        prev.map((n) =>
          n.id === narrativeId ? { ...n, usageCount: n.usageCount + 1 } : n
        )
      );

      props.onNarrativeStart?.(narrative);
      return true;
    },
    [narratives, allProgress, props]
  );

  // Advance to next section
  const advanceSection = useCallback(
    (nextSectionId: string, choiceId?: string, typingStats?: { words: number; time: number; accuracy: number; mistakes: number }) => {
      if (!currentNarrative || !currentProgress) return false;

      const nextSection = currentNarrative.sections.get(nextSectionId);
      if (!nextSection) {
        // End of narrative
        completeNarrative();
        return false;
      }

      // Update progress
      const updatedProgress: NarrativeProgress = {
        ...currentProgress,
        currentSectionId: nextSectionId,
        visitedSections: [...new Set([...currentProgress.visitedSections, nextSectionId])],
        choicesMade: choiceId && settings.saveChoices
          ? [
              ...currentProgress.choicesMade,
              { sectionId: currentProgress.currentSectionId, choiceId, timestamp: new Date() },
            ]
          : currentProgress.choicesMade,
        lastAccessTime: new Date(),
        typingStats: typingStats
          ? {
              totalWords: currentProgress.typingStats.totalWords + typingStats.words,
              totalTime: currentProgress.typingStats.totalTime + typingStats.time,
              averageWPM:
                ((currentProgress.typingStats.totalWords + typingStats.words) /
                  ((currentProgress.typingStats.totalTime + typingStats.time) / 1000 / 60)) ||
                0,
              averageAccuracy:
                (currentProgress.typingStats.averageAccuracy * currentProgress.visitedSections.length +
                  typingStats.accuracy) /
                (currentProgress.visitedSections.length + 1),
              mistakes: currentProgress.typingStats.mistakes + typingStats.mistakes,
            }
          : currentProgress.typingStats,
      };

      setCurrentProgress(updatedProgress);
      setAllProgress((prev) =>
        prev.map((p) => (p.narrativeId === currentNarrative.id && !p.completed ? updatedProgress : p))
      );

      props.onSectionComplete?.(nextSection, updatedProgress);
      return true;
    },
    [currentNarrative, currentProgress, settings.saveChoices, props]
  );

  // Complete narrative
  const completeNarrative = useCallback(() => {
    if (!currentNarrative || !currentProgress) return;

    const completedProgress: NarrativeProgress = {
      ...currentProgress,
      completed: true,
      completionTime: new Date(),
      lastAccessTime: new Date(),
    };

    setCurrentProgress(null);
    setAllProgress((prev) =>
      prev.map((p) => (p.narrativeId === currentNarrative.id && !p.completed ? completedProgress : p))
    );

    props.onNarrativeComplete?.(currentNarrative, completedProgress);
    setCurrentNarrative(null);
  }, [currentNarrative, currentProgress, props]);

  // Get current section
  const getCurrentSection = useCallback((): NarrativeSection | null => {
    if (!currentNarrative || !currentProgress) return null;
    return currentNarrative.sections.get(currentProgress.currentSectionId) || null;
  }, [currentNarrative, currentProgress]);

  // Create narrative from template
  const createFromTemplate = useCallback(
    (templateId: string, title: string, customSections?: Map<PlotPoint, string>): string | null => {
      const template = templates.find((t) => t.id === templateId);
      if (!template) return null;

      const sections = new Map<string, NarrativeSection>();
      let totalWords = 0;
      let totalTime = 0;

      template.plotPoints.forEach((pp, index) => {
        const sectionId = `section-${Date.now()}-${index}`;
        const content = customSections?.get(pp.plotPoint) || `[${pp.prompt}]`;
        const wordCount = content.split(/\s+/).length;
        const estimatedTime = Math.ceil(wordCount / 40 * 60); // Assuming 40 WPM

        const section: NarrativeSection = {
          id: sectionId,
          plotPoint: pp.plotPoint,
          title: pp.plotPoint.replace(/-/g, ' ').replace(/\b\w/g, (l) => l.toUpperCase()),
          content,
          characterIds: [],
          wordCount,
          estimatedTypingTime: estimatedTime,
          order: index + 1,
        };

        sections.set(sectionId, section);
        totalWords += wordCount;
        totalTime += estimatedTime;
      });

      const narrative: Narrative = {
        id: `custom-narrative-${Date.now()}`,
        title,
        description: `A ${template.genre} narrative`,
        genre: template.genre,
        length: totalWords < 300 ? 'short' : totalWords < 800 ? 'medium' : 'long',
        structure: template.structure,
        sections,
        startSectionId: Array.from(sections.values())[0].id,
        characterIds: [],
        tags: [template.genre, 'custom'],
        autismFriendly: true,
        themes: [],
        targetAudience: 'all',
        difficulty: 5,
        totalWordCount: totalWords,
        estimatedDuration: totalTime,
        created: new Date(),
        lastModified: new Date(),
        author: 'custom',
        usageCount: 0,
        isFavorite: false,
      };

      setNarratives((prev) => [...prev, narrative]);
      return narrative.id;
    },
    [templates]
  );

  // Toggle favorite
  const toggleFavorite = useCallback((narrativeId: string) => {
    setNarratives((prev) =>
      prev.map((n) =>
        n.id === narrativeId ? { ...n, isFavorite: !n.isFavorite } : n
      )
    );
  }, []);

  // Rate narrative
  const rateNarrative = useCallback((narrativeId: string, rating: number) => {
    setNarratives((prev) =>
      prev.map((n) =>
        n.id === narrativeId ? { ...n, rating: Math.max(1, Math.min(5, rating)) } : n
      )
    );
  }, []);

  // Get statistics
  const getStatistics = useCallback(() => {
    const completed = allProgress.filter((p) => p.completed);
    return {
      totalNarratives: narratives.length,
      totalStarted: allProgress.length,
      totalCompleted: completed.length,
      completionRate: allProgress.length > 0 ? (completed.length / allProgress.length) * 100 : 0,
      averageWPM: completed.reduce((sum, p) => sum + p.typingStats.averageWPM, 0) / completed.length || 0,
      averageAccuracy: completed.reduce((sum, p) => sum + p.typingStats.averageAccuracy, 0) / completed.length || 0,
      totalWordsTyped: allProgress.reduce((sum, p) => sum + p.typingStats.totalWords, 0),
      totalTimeSpent: allProgress.reduce((sum, p) => sum + p.typingStats.totalTime, 0),
      mostPopularNarrative: narratives.reduce((prev, current) =>
        current.usageCount > prev.usageCount ? current : prev
      , narratives[0]),
      favoriteNarratives: narratives.filter((n) => n.isFavorite),
    };
  }, [narratives, allProgress]);

  return {
    // State
    narratives,
    currentNarrative,
    currentProgress,
    allProgress,
    templates,
    settings,

    // Actions
    startNarrative,
    advanceSection,
    completeNarrative,
    getCurrentSection,
    createFromTemplate,
    toggleFavorite,
    rateNarrative,
    getStatistics,
  };
};

// Example component
export const NarrativeSystemComponent: React.FC<NarrativeSystemProps> = (props) => {
  const {
    narratives,
    currentNarrative,
    currentProgress,
    startNarrative,
    getCurrentSection,
    toggleFavorite,
    settings,
  } = useNarrativeSystem(props);

  const currentSection = getCurrentSection();

  return (
    <div className="narrative-system">
      {!currentNarrative ? (
        <div className="narrative-library">
          <h2>Choose a Narrative</h2>
          <div className="narratives-grid">
            {narratives.map((narrative) => (
              <motion.div
                key={narrative.id}
                className="narrative-card"
                onClick={() => startNarrative(narrative.id)}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <div className="narrative-header">
                  <h3>{narrative.title}</h3>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      toggleFavorite(narrative.id);
                    }}
                    className={`favorite-btn ${narrative.isFavorite ? 'active' : ''}`}
                    aria-label="Toggle favorite"
                  >
                    {narrative.isFavorite ? '★' : '☆'}
                  </button>
                </div>
                <p className="description">{narrative.description}</p>
                <div className="meta-info">
                  <span className="genre">{narrative.genre}</span>
                  <span className="length">{narrative.length}</span>
                  {settings.showWordCount && (
                    <span className="word-count">{narrative.totalWordCount} words</span>
                  )}
                  {settings.showEstimatedTime && (
                    <span className="duration">~{Math.ceil(narrative.estimatedDuration / 60)} min</span>
                  )}
                </div>
                {narrative.autismFriendly && (
                  <span className="badge autism-friendly">Autism-Friendly</span>
                )}
                <div className="tags">
                  {narrative.tags.slice(0, 3).map((tag) => (
                    <span key={tag} className="tag">
                      {tag}
                    </span>
                  ))}
                </div>
                {narrative.rating && (
                  <div className="rating">
                    {'★'.repeat(narrative.rating)}{'☆'.repeat(5 - narrative.rating)}
                  </div>
                )}
              </motion.div>
            ))}
          </div>
        </div>
      ) : (
        <div className="narrative-reader">
          <div className="narrative-header">
            <h2>{currentNarrative.title}</h2>
            {settings.showProgressIndicator && currentProgress && (
              <div className="progress-indicator">
                <span>
                  Section {currentProgress.visitedSections.length} of{' '}
                  {currentNarrative.sections.size}
                </span>
                <div className="progress-bar">
                  <div
                    className="progress-fill"
                    style={{
                      width: `${
                        (currentProgress.visitedSections.length /
                          currentNarrative.sections.size) *
                        100
                      }%`,
                    }}
                  />
                </div>
              </div>
            )}
          </div>

          {currentSection && (
            <motion.div
              key={currentSection.id}
              className="narrative-section"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
            >
              <h3>{currentSection.title}</h3>
              {currentSection.location && (
                <p className="location">📍 {currentSection.location}</p>
              )}
              {currentSection.timeOfDay && (
                <p className="time">🕐 {currentSection.timeOfDay}</p>
              )}
              <div className="content">{currentSection.content}</div>
              {settings.showWordCount && (
                <p className="word-count">{currentSection.wordCount} words</p>
              )}
            </motion.div>
          )}
        </div>
      )}
    </div>
  );
};

export default NarrativeSystemComponent;
