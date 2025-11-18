import React, { useState, useCallback, useEffect } from 'react';
import { motion } from 'framer-motion';

// Types
export type TemplateCategory =
  | 'adventure'
  | 'mystery'
  | 'daily-life'
  | 'fantasy'
  | 'sci-fi'
  | 'educational'
  | 'social'
  | 'sensory'
  | 'special-interest'
  | 'custom';

export type DifficultyLevel = 'easy' | 'medium' | 'hard' | 'expert';

export type PlaceholderType =
  | 'character-name'
  | 'location'
  | 'object'
  | 'action'
  | 'emotion'
  | 'sensory-detail'
  | 'time'
  | 'custom';

export interface Placeholder {
  id: string;
  type: PlaceholderType;
  label: string;
  defaultValue?: string;
  value?: string;
  suggestions?: string[];
  required: boolean;
}

export interface StoryTemplate {
  id: string;
  name: string;
  category: TemplateCategory;
  difficulty: DifficultyLevel;
  description: string;
  structure: string; // Template with placeholders like {{character-name}}
  placeholders: Placeholder[];
  wordCount: { min: number; max: number };
  tags: string[];
  autismFriendly: boolean;
  specialInterestFocus?: string; // e.g., "trains", "space", "dinosaurs"
  sensoryConsiderations?: string[];
  created: Date;
  author: 'built-in' | 'custom';
  usageCount: number;
  rating?: number;
  isFavorite: boolean;
}

export interface TemplateFilter {
  categories?: TemplateCategory[];
  difficulties?: DifficultyLevel[];
  autismFriendlyOnly?: boolean;
  specialInterests?: string[];
  tags?: string[];
  wordCountRange?: { min?: number; max?: number };
  showCustomOnly?: boolean;
}

export interface GeneratedStory {
  id: string;
  templateId: string;
  title: string;
  content: string;
  wordCount: number;
  generatedAt: Date;
  placeholderValues: Record<string, string>;
}

export interface StoryTemplatesSettings {
  showPreviews: boolean;
  previewLength: number; // Number of words in preview
  autoSaveDrafts: boolean;
  suggestSimilarTemplates: boolean;
  highlightPlaceholders: boolean;
  validatePlaceholders: boolean;
}

interface StoryTemplatesProps {
  onTemplateSelect?: (template: StoryTemplate) => void;
  onStoryGenerate?: (story: GeneratedStory) => void;
  settings?: Partial<StoryTemplatesSettings>;
}

// Built-in templates
const builtInTemplates: Omit<StoryTemplate, 'created' | 'usageCount' | 'isFavorite'>[] = [
  {
    id: 'template-adventure-1',
    name: 'The Journey Begins',
    category: 'adventure',
    difficulty: 'easy',
    description: 'A simple adventure story about starting a journey',
    structure: `{{character-name}} woke up early on {{time}}. Today was the day to visit {{location}}. {{character-name}} packed {{object}} and felt {{emotion}}. The journey to {{location}} would take all day, but it would be worth it. {{character-name}} took a deep breath and began to {{action}}.`,
    placeholders: [
      { id: 'p1', type: 'character-name', label: 'Character Name', defaultValue: 'Alex', required: true, suggestions: ['Alex', 'Sam', 'Jordan', 'Taylor'] },
      { id: 'p2', type: 'time', label: 'Time of Day', defaultValue: 'a sunny morning', required: true, suggestions: ['a sunny morning', 'dawn', 'early afternoon'] },
      { id: 'p3', type: 'location', label: 'Destination', defaultValue: 'the museum', required: true, suggestions: ['the museum', 'the library', 'the park', 'the aquarium'] },
      { id: 'p4', type: 'object', label: 'Item to Pack', defaultValue: 'a backpack', required: true, suggestions: ['a backpack', 'a notebook', 'a camera', 'snacks'] },
      { id: 'p5', type: 'emotion', label: 'Emotion', defaultValue: 'excited', required: true, suggestions: ['excited', 'curious', 'nervous', 'happy'] },
      { id: 'p6', type: 'action', label: 'Action', defaultValue: 'walk', required: true, suggestions: ['walk', 'set off', 'start the adventure', 'head out'] },
    ],
    wordCount: { min: 40, max: 60 },
    tags: ['beginner-friendly', 'positive', 'structured'],
    autismFriendly: true,
    sensoryConsiderations: ['predictable-structure', 'clear-sequence'],
    author: 'built-in',
  },
  {
    id: 'template-daily-life-1',
    name: 'Morning Routine',
    category: 'daily-life',
    difficulty: 'easy',
    description: 'Practice typing about daily routines',
    structure: `Every morning, {{character-name}} follows the same routine. First, {{action-1}} at exactly {{time}}. The {{sensory-detail}} helps {{character-name}} wake up. Next, it's time to {{action-2}}. {{character-name}} always uses {{object}} for this. Finally, {{character-name}} feels {{emotion}} and ready for the day.`,
    placeholders: [
      { id: 'p1', type: 'character-name', label: 'Character Name', defaultValue: 'Sam', required: true },
      { id: 'p2', type: 'action', label: 'First Action', defaultValue: 'the alarm rings', required: true, suggestions: ['the alarm rings', 'wake up naturally', 'stretch'] },
      { id: 'p3', type: 'time', label: 'Time', defaultValue: '7:00 AM', required: true },
      { id: 'p4', type: 'sensory-detail', label: 'Sensory Detail', defaultValue: 'gentle morning light', required: true, suggestions: ['gentle morning light', 'quiet room', 'soft blanket', 'familiar sounds'] },
      { id: 'p5', type: 'action', label: 'Second Action', defaultValue: 'have breakfast', required: true, suggestions: ['have breakfast', 'get dressed', 'brush teeth'] },
      { id: 'p6', type: 'object', label: 'Object Used', defaultValue: 'a favorite bowl', required: true },
      { id: 'p7', type: 'emotion', label: 'Feeling', defaultValue: 'calm', required: true, suggestions: ['calm', 'prepared', 'confident', 'comfortable'] },
    ],
    wordCount: { min: 50, max: 70 },
    tags: ['routine', 'predictable', 'calming'],
    autismFriendly: true,
    sensoryConsiderations: ['routine-focused', 'predictable-pattern'],
    author: 'built-in',
  },
  {
    id: 'template-special-interest-trains',
    name: 'Train Journey',
    category: 'special-interest',
    difficulty: 'medium',
    description: 'A story about trains for enthusiasts',
    structure: `The {{train-type}} pulled into {{location}} station at exactly {{time}}. {{character-name}} watched as the {{sensory-detail}} filled the platform. This {{train-type}} was special because {{reason}}. As {{character-name}} boarded, {{emotion}} grew. The journey to {{destination}} would take {{duration}}, plenty of time to {{action}}.`,
    placeholders: [
      { id: 'p1', type: 'custom', label: 'Train Type', defaultValue: 'express train', required: true, suggestions: ['express train', 'steam locomotive', 'bullet train', 'vintage train'] },
      { id: 'p2', type: 'location', label: 'Station Name', defaultValue: 'Central', required: true },
      { id: 'p3', type: 'time', label: 'Arrival Time', defaultValue: '3:47 PM', required: true },
      { id: 'p4', type: 'character-name', label: 'Character Name', defaultValue: 'Jordan', required: true },
      { id: 'p5', type: 'sensory-detail', label: 'Sensory Detail', defaultValue: 'sound of wheels on tracks', required: true, suggestions: ['sound of wheels on tracks', 'smell of steam', 'rhythmic clacking', 'whistle sound'] },
      { id: 'p6', type: 'custom', label: 'What Makes It Special', defaultValue: 'it was the oldest working train in the region', required: true },
      { id: 'p7', type: 'emotion', label: 'Emotion', defaultValue: 'excitement', required: true },
      { id: 'p8', type: 'location', label: 'Destination', defaultValue: 'Harbor Station', required: true },
      { id: 'p9', type: 'custom', label: 'Journey Duration', defaultValue: '45 minutes', required: true },
      { id: 'p10', type: 'action', label: 'Activity on Train', defaultValue: 'observe the countryside', required: true },
    ],
    wordCount: { min: 70, max: 100 },
    tags: ['trains', 'special-interest', 'detailed'],
    autismFriendly: true,
    specialInterestFocus: 'trains',
    sensoryConsiderations: ['sensory-details-included', 'precise-timing'],
    author: 'built-in',
  },
  {
    id: 'template-fantasy-1',
    name: 'Magic Discovery',
    category: 'fantasy',
    difficulty: 'medium',
    description: 'Discovering magical abilities',
    structure: `{{character-name}} never expected to discover {{magic-ability}} on an ordinary {{time}}. While {{action-1}} in {{location}}, something incredible happened. {{character-name}} noticed {{sensory-detail}} and suddenly {{magic-event}}. The feeling was {{emotion}}. {{character-name}} knew that learning to {{action-2}} would take practice, but this was just the beginning of an amazing adventure.`,
    placeholders: [
      { id: 'p1', type: 'character-name', label: 'Character Name', defaultValue: 'Quinn', required: true },
      { id: 'p2', type: 'custom', label: 'Magic Ability', defaultValue: 'the power to talk to animals', required: true, suggestions: ['the power to talk to animals', 'telekinesis', 'time travel', 'shape-shifting'] },
      { id: 'p3', type: 'time', label: 'Time', defaultValue: 'Tuesday afternoon', required: true },
      { id: 'p4', type: 'action', label: 'Initial Action', defaultValue: 'reading a book', required: true },
      { id: 'p5', type: 'location', label: 'Location', defaultValue: 'the garden', required: true },
      { id: 'p6', type: 'sensory-detail', label: 'Sensory Detail', defaultValue: 'a faint shimmer in the air', required: true },
      { id: 'p7', type: 'custom', label: 'Magic Event', defaultValue: 'the book pages began to glow', required: true },
      { id: 'p8', type: 'emotion', label: 'Emotion', defaultValue: 'amazing and surprising', required: true },
      { id: 'p9', type: 'action', label: 'Future Action', defaultValue: 'control this new ability', required: true },
    ],
    wordCount: { min: 80, max: 110 },
    tags: ['imaginative', 'magical', 'discovery'],
    autismFriendly: true,
    sensoryConsiderations: ['clear-cause-effect', 'structured-narrative'],
    author: 'built-in',
  },
  {
    id: 'template-educational-1',
    name: 'Learning About Science',
    category: 'educational',
    difficulty: 'medium',
    description: 'Educational content about scientific topics',
    structure: `Today {{character-name}} learned about {{topic}}. The teacher explained that {{fact-1}}. This was fascinating because {{reason}}. {{character-name}} discovered that {{fact-2}}. To better understand {{topic}}, {{character-name}} decided to {{action}}. {{emotion}} about learning new things makes education enjoyable.`,
    placeholders: [
      { id: 'p1', type: 'character-name', label: 'Character Name', defaultValue: 'Riley', required: true },
      { id: 'p2', type: 'custom', label: 'Science Topic', defaultValue: 'photosynthesis', required: true, suggestions: ['photosynthesis', 'space exploration', 'dinosaurs', 'weather patterns'] },
      { id: 'p3', type: 'custom', label: 'First Fact', defaultValue: 'plants convert sunlight into energy', required: true },
      { id: 'p4', type: 'custom', label: 'Reason It\'s Interesting', defaultValue: 'this process creates oxygen we breathe', required: true },
      { id: 'p5', type: 'custom', label: 'Second Fact', defaultValue: 'chlorophyll makes plants green', required: true },
      { id: 'p6', type: 'action', label: 'Learning Action', defaultValue: 'conduct an experiment', required: true, suggestions: ['conduct an experiment', 'read more books', 'watch educational videos', 'ask questions'] },
      { id: 'p7', type: 'emotion', label: 'Feeling About Learning', defaultValue: 'Being curious', required: true, suggestions: ['Being curious', 'Feeling excited', 'Staying interested'] },
    ],
    wordCount: { min: 60, max: 90 },
    tags: ['educational', 'factual', 'learning'],
    autismFriendly: true,
    specialInterestFocus: 'science',
    sensoryConsiderations: ['fact-based', 'logical-structure'],
    author: 'built-in',
  },
  {
    id: 'template-sensory-1',
    name: 'Sensory Garden Visit',
    category: 'sensory',
    difficulty: 'easy',
    description: 'A calm story focusing on sensory experiences',
    structure: `{{character-name}} visited the sensory garden on {{time}}. The first thing noticed was {{sensory-visual}}. Then came {{sensory-sound}}. {{character-name}} touched {{object}} and it felt {{sensory-touch}}. The air smelled like {{sensory-smell}}. This peaceful place made {{character-name}} feel {{emotion}}. It was the perfect spot to {{action}}.`,
    placeholders: [
      { id: 'p1', type: 'character-name', label: 'Character Name', defaultValue: 'Morgan', required: true },
      { id: 'p2', type: 'time', label: 'Time', defaultValue: 'a quiet afternoon', required: true },
      { id: 'p3', type: 'sensory-detail', label: 'Visual Detail', defaultValue: 'colorful flowers swaying gently', required: true },
      { id: 'p4', type: 'sensory-detail', label: 'Sound Detail', defaultValue: 'birds singing softly', required: true },
      { id: 'p5', type: 'object', label: 'Object to Touch', defaultValue: 'smooth river stones', required: true },
      { id: 'p6', type: 'sensory-detail', label: 'Touch Detail', defaultValue: 'cool and pleasant', required: true },
      { id: 'p7', type: 'sensory-detail', label: 'Smell Detail', defaultValue: 'fresh lavender', required: true },
      { id: 'p8', type: 'emotion', label: 'Emotion', defaultValue: 'calm and relaxed', required: true },
      { id: 'p9', type: 'action', label: 'Action', defaultValue: 'sit and enjoy the moment', required: true },
    ],
    wordCount: { min: 60, max: 85 },
    tags: ['calming', 'sensory-rich', 'peaceful'],
    autismFriendly: true,
    sensoryConsiderations: ['gentle-sensory-details', 'calming-content'],
    author: 'built-in',
  },
];

const defaultSettings: StoryTemplatesSettings = {
  showPreviews: true,
  previewLength: 20,
  autoSaveDrafts: true,
  suggestSimilarTemplates: true,
  highlightPlaceholders: true,
  validatePlaceholders: true,
};

export const useStoryTemplates = (props: StoryTemplatesProps = {}) => {
  const settings = { ...defaultSettings, ...props.settings };

  // State
  const [templates, setTemplates] = useState<StoryTemplate[]>([]);
  const [customTemplates, setCustomTemplates] = useState<StoryTemplate[]>([]);
  const [selectedTemplate, setSelectedTemplate] = useState<StoryTemplate | null>(null);
  const [placeholderValues, setPlaceholderValues] = useState<Record<string, string>>({});
  const [filter, setFilter] = useState<TemplateFilter>({});
  const [generatedStories, setGeneratedStories] = useState<GeneratedStory[]>([]);
  const [preview, setPreview] = useState<string>('');

  // Initialize templates
  useEffect(() => {
    const initialTemplates: StoryTemplate[] = builtInTemplates.map((t) => ({
      ...t,
      created: new Date(),
      usageCount: 0,
      isFavorite: false,
    }));
    setTemplates(initialTemplates);

    // Load custom templates from localStorage
    try {
      const saved = localStorage.getItem('typing-tutor-story-templates');
      if (saved) {
        const data = JSON.parse(saved);
        setCustomTemplates(data.customTemplates || []);
        setGeneratedStories(data.generatedStories || []);
      }
    } catch (err) {
      console.error('Failed to load templates:', err);
    }
  }, []);

  // Auto-save custom templates and generated stories
  useEffect(() => {
    try {
      const data = {
        customTemplates,
        generatedStories: generatedStories.slice(-50), // Keep last 50 stories
      };
      localStorage.setItem('typing-tutor-story-templates', JSON.stringify(data));
    } catch (err) {
      console.error('Failed to save templates:', err);
    }
  }, [customTemplates, generatedStories]);

  // Get all templates (built-in + custom)
  const getAllTemplates = useCallback((): StoryTemplate[] => {
    return [...templates, ...customTemplates];
  }, [templates, customTemplates]);

  // Filter templates
  const getFilteredTemplates = useCallback(
    (filterOptions?: TemplateFilter): StoryTemplate[] => {
      const currentFilter = filterOptions || filter;
      let filtered = getAllTemplates();

      if (currentFilter.categories && currentFilter.categories.length > 0) {
        filtered = filtered.filter((t) => currentFilter.categories!.includes(t.category));
      }

      if (currentFilter.difficulties && currentFilter.difficulties.length > 0) {
        filtered = filtered.filter((t) => currentFilter.difficulties!.includes(t.difficulty));
      }

      if (currentFilter.autismFriendlyOnly) {
        filtered = filtered.filter((t) => t.autismFriendly);
      }

      if (currentFilter.specialInterests && currentFilter.specialInterests.length > 0) {
        filtered = filtered.filter((t) =>
          currentFilter.specialInterests!.some((interest) => t.specialInterestFocus === interest)
        );
      }

      if (currentFilter.tags && currentFilter.tags.length > 0) {
        filtered = filtered.filter((t) =>
          currentFilter.tags!.some((tag) => t.tags.includes(tag))
        );
      }

      if (currentFilter.wordCountRange) {
        filtered = filtered.filter((t) => {
          const { min, max } = currentFilter.wordCountRange!;
          return (
            (min === undefined || t.wordCount.max >= min) &&
            (max === undefined || t.wordCount.min <= max)
          );
        });
      }

      if (currentFilter.showCustomOnly) {
        filtered = filtered.filter((t) => t.author === 'custom');
      }

      return filtered;
    },
    [filter, getAllTemplates]
  );

  // Select template
  const selectTemplate = useCallback(
    (templateId: string) => {
      const template = getAllTemplates().find((t) => t.id === templateId);
      if (!template) return;

      setSelectedTemplate(template);

      // Initialize placeholder values with defaults
      const defaultValues: Record<string, string> = {};
      template.placeholders.forEach((p) => {
        defaultValues[p.id] = p.defaultValue || '';
      });
      setPlaceholderValues(defaultValues);

      // Increment usage count
      if (template.author === 'built-in') {
        setTemplates((prev) =>
          prev.map((t) =>
            t.id === templateId ? { ...t, usageCount: t.usageCount + 1 } : t
          )
        );
      } else {
        setCustomTemplates((prev) =>
          prev.map((t) =>
            t.id === templateId ? { ...t, usageCount: t.usageCount + 1 } : t
          )
        );
      }

      props.onTemplateSelect?.(template);
    },
    [getAllTemplates, props]
  );

  // Update placeholder value
  const updatePlaceholder = useCallback((placeholderId: string, value: string) => {
    setPlaceholderValues((prev) => ({
      ...prev,
      [placeholderId]: value,
    }));
  }, []);

  // Generate story from template
  const generateStory = useCallback((): GeneratedStory | null => {
    if (!selectedTemplate) return null;

    // Validate required placeholders
    if (settings.validatePlaceholders) {
      const missingRequired = selectedTemplate.placeholders.filter(
        (p) => p.required && !placeholderValues[p.id]
      );
      if (missingRequired.length > 0) {
        console.warn('Missing required placeholders:', missingRequired);
        return null;
      }
    }

    // Replace placeholders in structure
    let content = selectedTemplate.structure;
    selectedTemplate.placeholders.forEach((placeholder) => {
      const value = placeholderValues[placeholder.id] || placeholder.defaultValue || '';
      const regex = new RegExp(`\\{\\{${placeholder.label.toLowerCase().replace(/\s+/g, '-')}\\}\\}`, 'g');
      content = content.replace(regex, value);
    });

    // Create generated story
    const story: GeneratedStory = {
      id: `story-${Date.now()}`,
      templateId: selectedTemplate.id,
      title: selectedTemplate.name,
      content,
      wordCount: content.split(/\s+/).length,
      generatedAt: new Date(),
      placeholderValues: { ...placeholderValues },
    };

    setGeneratedStories((prev) => [...prev, story]);
    props.onStoryGenerate?.(story);

    return story;
  }, [selectedTemplate, placeholderValues, settings.validatePlaceholders, props]);

  // Generate preview
  useEffect(() => {
    if (!selectedTemplate || !settings.showPreviews) {
      setPreview('');
      return;
    }

    let previewText = selectedTemplate.structure;
    selectedTemplate.placeholders.forEach((placeholder) => {
      const value = placeholderValues[placeholder.id] || `[${placeholder.label}]`;
      const regex = new RegExp(`\\{\\{${placeholder.label.toLowerCase().replace(/\s+/g, '-')}\\}\\}`, 'g');
      previewText = previewText.replace(regex, value);
    });

    const words = previewText.split(/\s+/).slice(0, settings.previewLength);
    setPreview(words.join(' ') + (previewText.split(/\s+/).length > settings.previewLength ? '...' : ''));
  }, [selectedTemplate, placeholderValues, settings.showPreviews, settings.previewLength]);

  // Create custom template
  const createCustomTemplate = useCallback(
    (
      name: string,
      category: TemplateCategory,
      difficulty: DifficultyLevel,
      structure: string,
      placeholders: Omit<Placeholder, 'id'>[],
      options?: {
        description?: string;
        tags?: string[];
        specialInterestFocus?: string;
        sensoryConsiderations?: string[];
      }
    ): string => {
      const template: StoryTemplate = {
        id: `custom-${Date.now()}`,
        name,
        category,
        difficulty,
        description: options?.description || '',
        structure,
        placeholders: placeholders.map((p, i) => ({ ...p, id: `p${i + 1}` })),
        wordCount: {
          min: Math.floor(structure.split(/\s+/).length * 0.8),
          max: Math.floor(structure.split(/\s+/).length * 1.2),
        },
        tags: options?.tags || [],
        autismFriendly: true,
        specialInterestFocus: options?.specialInterestFocus,
        sensoryConsiderations: options?.sensoryConsiderations,
        created: new Date(),
        author: 'custom',
        usageCount: 0,
        rating: 0,
        isFavorite: false,
      };

      setCustomTemplates((prev) => [...prev, template]);
      return template.id;
    },
    []
  );

  // Delete custom template
  const deleteCustomTemplate = useCallback((templateId: string) => {
    setCustomTemplates((prev) => prev.filter((t) => t.id !== templateId));
    if (selectedTemplate?.id === templateId) {
      setSelectedTemplate(null);
      setPlaceholderValues({});
    }
  }, [selectedTemplate]);

  // Toggle favorite
  const toggleFavorite = useCallback((templateId: string) => {
    const updateFavorite = (t: StoryTemplate) =>
      t.id === templateId ? { ...t, isFavorite: !t.isFavorite } : t;

    setTemplates((prev) => prev.map(updateFavorite));
    setCustomTemplates((prev) => prev.map(updateFavorite));
  }, []);

  // Rate template
  const rateTemplate = useCallback((templateId: string, rating: number) => {
    const updateRating = (t: StoryTemplate) =>
      t.id === templateId ? { ...t, rating: Math.max(1, Math.min(5, rating)) } : t;

    setTemplates((prev) => prev.map(updateRating));
    setCustomTemplates((prev) => prev.map(updateRating));
  }, []);

  // Get similar templates
  const getSimilarTemplates = useCallback(
    (templateId: string, limit = 3): StoryTemplate[] => {
      if (!settings.suggestSimilarTemplates) return [];

      const template = getAllTemplates().find((t) => t.id === templateId);
      if (!template) return [];

      const allTemplates = getAllTemplates().filter((t) => t.id !== templateId);

      // Score by similarity
      const scored = allTemplates.map((t) => {
        let score = 0;
        if (t.category === template.category) score += 3;
        if (t.difficulty === template.difficulty) score += 2;
        if (t.specialInterestFocus === template.specialInterestFocus) score += 2;
        const commonTags = t.tags.filter((tag) => template.tags.includes(tag)).length;
        score += commonTags;
        return { template: t, score };
      });

      return scored
        .sort((a, b) => b.score - a.score)
        .slice(0, limit)
        .map((s) => s.template);
    },
    [getAllTemplates, settings.suggestSimilarTemplates]
  );

  // Export/Import
  const exportTemplates = useCallback(
    (templateIds?: string[]): string => {
      const toExport = templateIds
        ? getAllTemplates().filter((t) => templateIds.includes(t.id))
        : customTemplates;

      return JSON.stringify(toExport, null, 2);
    },
    [getAllTemplates, customTemplates]
  );

  const importTemplates = useCallback((jsonData: string): number => {
    try {
      const imported = JSON.parse(jsonData) as StoryTemplate[];
      const validTemplates = imported.filter(
        (t) => t.name && t.category && t.structure && t.placeholders
      );

      // Assign new IDs to avoid conflicts
      const newTemplates = validTemplates.map((t) => ({
        ...t,
        id: `imported-${Date.now()}-${Math.random()}`,
        author: 'custom' as const,
        created: new Date(),
        usageCount: 0,
        isFavorite: false,
      }));

      setCustomTemplates((prev) => [...prev, ...newTemplates]);
      return newTemplates.length;
    } catch (err) {
      console.error('Failed to import templates:', err);
      return 0;
    }
  }, []);

  // Statistics
  const getStatistics = useCallback(() => {
    const all = getAllTemplates();
    return {
      totalTemplates: all.length,
      builtInTemplates: templates.length,
      customTemplates: customTemplates.length,
      favoriteTemplates: all.filter((t) => t.isFavorite).length,
      totalStoriesGenerated: generatedStories.length,
      mostUsedTemplate: all.reduce((prev, current) =>
        current.usageCount > prev.usageCount ? current : prev
      , all[0]),
      averageRating: all.filter((t) => t.rating).reduce((sum, t) => sum + (t.rating || 0), 0) / all.filter((t) => t.rating).length || 0,
      templatesByCategory: all.reduce((acc, t) => {
        acc[t.category] = (acc[t.category] || 0) + 1;
        return acc;
      }, {} as Record<TemplateCategory, number>),
      templatesByDifficulty: all.reduce((acc, t) => {
        acc[t.difficulty] = (acc[t.difficulty] || 0) + 1;
        return acc;
      }, {} as Record<DifficultyLevel, number>),
    };
  }, [getAllTemplates, templates, customTemplates, generatedStories]);

  return {
    // State
    templates: getAllTemplates(),
    selectedTemplate,
    placeholderValues,
    filter,
    generatedStories,
    preview,
    settings,

    // Actions
    selectTemplate,
    updatePlaceholder,
    generateStory,
    createCustomTemplate,
    deleteCustomTemplate,
    toggleFavorite,
    rateTemplate,
    getSimilarTemplates,
    getFilteredTemplates,
    setFilter,
    exportTemplates,
    importTemplates,
    getStatistics,
  };
};

// Example component
export const StoryTemplatesComponent: React.FC<StoryTemplatesProps> = (props) => {
  const {
    templates: _templates,
    selectedTemplate,
    placeholderValues,
    preview,
    selectTemplate,
    updatePlaceholder,
    generateStory,
    getFilteredTemplates,
    setFilter,
  } = useStoryTemplates(props);

  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

  return (
    <div className="story-templates">
      <div className="templates-header">
        <h2>Story Templates</h2>
        <div className="view-controls">
          <button onClick={() => setViewMode('grid')} aria-pressed={viewMode === 'grid'}>
            Grid
          </button>
          <button onClick={() => setViewMode('list')} aria-pressed={viewMode === 'list'}>
            List
          </button>
        </div>
      </div>

      <div className="templates-filters">
        <button onClick={() => setFilter({ autismFriendlyOnly: true })}>
          Autism-Friendly Only
        </button>
        <button onClick={() => setFilter({ categories: ['adventure'] })}>Adventures</button>
        <button onClick={() => setFilter({ difficulties: ['easy'] })}>Easy</button>
        <button onClick={() => setFilter({})}>Clear Filters</button>
      </div>

      <div className={`templates-${viewMode}`}>
        {getFilteredTemplates().map((template) => (
          <motion.div
            key={template.id}
            className={`template-card ${selectedTemplate?.id === template.id ? 'selected' : ''}`}
            onClick={() => selectTemplate(template.id)}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <h3>{template.name}</h3>
            <p className="category">{template.category}</p>
            <p className="difficulty">Difficulty: {template.difficulty}</p>
            <p className="description">{template.description}</p>
            {template.specialInterestFocus && (
              <span className="special-interest">Focus: {template.specialInterestFocus}</span>
            )}
            <div className="tags">
              {template.tags.map((tag) => (
                <span key={tag} className="tag">
                  {tag}
                </span>
              ))}
            </div>
          </motion.div>
        ))}
      </div>

      {selectedTemplate && (
        <div className="template-editor">
          <h3>Customize: {selectedTemplate.name}</h3>
          <div className="placeholders">
            {selectedTemplate.placeholders.map((placeholder) => (
              <div key={placeholder.id} className="placeholder-input">
                <label htmlFor={placeholder.id}>
                  {placeholder.label}
                  {placeholder.required && <span className="required">*</span>}
                </label>
                <input
                  id={placeholder.id}
                  type="text"
                  value={placeholderValues[placeholder.id] || ''}
                  onChange={(e) => updatePlaceholder(placeholder.id, e.target.value)}
                  placeholder={placeholder.defaultValue}
                  list={`suggestions-${placeholder.id}`}
                />
                {placeholder.suggestions && (
                  <datalist id={`suggestions-${placeholder.id}`}>
                    {placeholder.suggestions.map((suggestion) => (
                      <option key={suggestion} value={suggestion} />
                    ))}
                  </datalist>
                )}
              </div>
            ))}
          </div>

          {preview && (
            <div className="preview">
              <h4>Preview:</h4>
              <p>{preview}</p>
            </div>
          )}

          <button onClick={() => generateStory()} className="generate-button">
            Generate Story
          </button>
        </div>
      )}
    </div>
  );
};

export default StoryTemplatesComponent;
