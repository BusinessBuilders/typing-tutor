import React, { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

/**
 * AISceneGeneration Component
 *
 * AI-powered scene generation system for autism typing tutor.
 * Creates personalized, engaging, and educational typing practice scenes
 * based on user interests, skill level, and preferences.
 *
 * Features:
 * - AI-generated typing practice scenarios
 * - Personalization based on user interests
 * - Difficulty adaptation
 * - Theme and topic selection
 * - Scene context and narrative
 * - Character and setting generation
 * - Vocabulary control
 * - Sensory-friendly scene descriptions
 * - Scene templates and customization
 * - Scene history and favorites
 */

// Types for AI scene generation
export type SceneTheme =
  | 'nature'
  | 'space'
  | 'animals'
  | 'fantasy'
  | 'science'
  | 'history'
  | 'everyday'
  | 'adventure'
  | 'mystery'
  | 'custom';

export type SceneDifficulty = 'beginner' | 'intermediate' | 'advanced' | 'expert';
export type SceneLength = 'short' | 'medium' | 'long';
export type SceneTone = 'calm' | 'exciting' | 'educational' | 'humorous' | 'neutral';

export interface SceneCharacter {
  name: string;
  description: string;
  traits: string[];
  role: 'protagonist' | 'guide' | 'companion' | 'observer';
}

export interface SceneSetting {
  name: string;
  description: string;
  atmosphere: string;
  sensoryDetails: {
    visual: string;
    auditory: string;
    tactile?: string;
  };
  timeOfDay?: 'morning' | 'afternoon' | 'evening' | 'night';
}

export interface SceneContext {
  situation: string;
  goal: string;
  challenge?: string;
  reward?: string;
}

export interface GeneratedScene {
  id: string;
  title: string;
  theme: SceneTheme;
  difficulty: SceneDifficulty;
  length: SceneLength;
  tone: SceneTone;
  characters: SceneCharacter[];
  setting: SceneSetting;
  context: SceneContext;
  typingContent: string;
  vocabulary: string[];
  wordCount: number;
  estimatedTime: number; // seconds
  generatedAt: Date;
  favorite: boolean;
  tags: string[];
}

export interface SceneGenerationRequest {
  theme: SceneTheme;
  difficulty: SceneDifficulty;
  length: SceneLength;
  tone: SceneTone;
  interests?: string[];
  avoidTopics?: string[];
  vocabularyLevel?: number; // 1-10
  includeCharacters?: boolean;
  includeNarrative?: boolean;
  customPrompt?: string;
}

export interface GenerationSettings {
  enabled: boolean;
  autoGenerate: boolean;
  saveHistory: boolean;
  maxHistorySize: number;
  defaultTheme: SceneTheme;
  defaultDifficulty: SceneDifficulty;
  defaultLength: SceneLength;
  defaultTone: SceneTone;
  personalizationEnabled: boolean;
  vocabularyControl: boolean;
  sensoryFriendly: boolean;
}

export interface UserPreferences {
  favoriteThemes: SceneTheme[];
  interests: string[];
  avoidTopics: string[];
  preferredLength: SceneLength;
  preferredTone: SceneTone;
  vocabularyLevel: number;
}

// Custom hook for AI scene generation
export function useAISceneGeneration(initialSettings?: Partial<GenerationSettings>) {
  const [settings, setSettings] = useState<GenerationSettings>({
    enabled: true,
    autoGenerate: false,
    saveHistory: true,
    maxHistorySize: 50,
    defaultTheme: 'nature',
    defaultDifficulty: 'intermediate',
    defaultLength: 'medium',
    defaultTone: 'calm',
    personalizationEnabled: true,
    vocabularyControl: true,
    sensoryFriendly: true,
    ...initialSettings,
  });

  const [scenes, setScenes] = useState<GeneratedScene[]>([]);
  const [currentScene, setCurrentScene] = useState<GeneratedScene | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [preferences, setPreferences] = useState<UserPreferences>({
    favoriteThemes: ['nature', 'animals'],
    interests: ['wildlife', 'space', 'technology'],
    avoidTopics: [],
    preferredLength: 'medium',
    preferredTone: 'calm',
    vocabularyLevel: 5,
  });

  const updateSettings = useCallback((newSettings: Partial<GenerationSettings>) => {
    setSettings((prev) => ({ ...prev, ...newSettings }));
  }, []);

  const updatePreferences = useCallback((newPreferences: Partial<UserPreferences>) => {
    setPreferences((prev) => ({ ...prev, ...newPreferences }));
  }, []);

  const generateScene = useCallback(
    async (request: SceneGenerationRequest): Promise<GeneratedScene> => {
      setIsGenerating(true);

      // Simulate AI generation delay
      await new Promise((resolve) => setTimeout(resolve, 1500));

      // Generate scene based on request
      const scene = createSceneFromRequest(request, settings);

      setScenes((prev) => {
        const newScenes = [scene, ...prev];
        return settings.saveHistory
          ? newScenes.slice(0, settings.maxHistorySize)
          : newScenes;
      });

      setCurrentScene(scene);
      setIsGenerating(false);

      return scene;
    },
    [settings]
  );

  const generateQuickScene = useCallback(async () => {
    const request: SceneGenerationRequest = {
      theme: settings.defaultTheme,
      difficulty: settings.defaultDifficulty,
      length: settings.defaultLength,
      tone: settings.defaultTone,
      interests: settings.personalizationEnabled ? preferences.interests : undefined,
      avoidTopics: settings.personalizationEnabled ? preferences.avoidTopics : undefined,
      vocabularyLevel: settings.vocabularyControl ? preferences.vocabularyLevel : undefined,
      includeCharacters: true,
      includeNarrative: true,
    };

    return generateScene(request);
  }, [settings, preferences, generateScene]);

  const regenerateScene = useCallback(
    async (sceneId: string) => {
      const originalScene = scenes.find((s) => s.id === sceneId);
      if (!originalScene) return null;

      const request: SceneGenerationRequest = {
        theme: originalScene.theme,
        difficulty: originalScene.difficulty,
        length: originalScene.length,
        tone: originalScene.tone,
        includeCharacters: originalScene.characters.length > 0,
        includeNarrative: true,
      };

      return generateScene(request);
    },
    [scenes, generateScene]
  );

  const toggleFavorite = useCallback((sceneId: string) => {
    setScenes((prev) =>
      prev.map((scene) =>
        scene.id === sceneId ? { ...scene, favorite: !scene.favorite } : scene
      )
    );
  }, []);

  const deleteScene = useCallback((sceneId: string) => {
    setScenes((prev) => prev.filter((scene) => scene.id !== sceneId));
    if (currentScene?.id === sceneId) {
      setCurrentScene(null);
    }
  }, [currentScene]);

  const getFavoriteScenes = useCallback(() => {
    return scenes.filter((scene) => scene.favorite);
  }, [scenes]);

  const getScenesByTheme = useCallback(
    (theme: SceneTheme) => {
      return scenes.filter((scene) => scene.theme === theme);
    },
    [scenes]
  );

  return {
    settings,
    updateSettings,
    preferences,
    updatePreferences,
    scenes,
    currentScene,
    setCurrentScene,
    isGenerating,
    generateScene,
    generateQuickScene,
    regenerateScene,
    toggleFavorite,
    deleteScene,
    getFavoriteScenes,
    getScenesByTheme,
  };
}

// Helper function to create scene from request
function createSceneFromRequest(
  request: SceneGenerationRequest,
  settings: GenerationSettings
): GeneratedScene {
  const templates = getSceneTemplates(request.theme);
  const template = templates[Math.floor(Math.random() * templates.length)];

  // Generate characters if requested
  const characters: SceneCharacter[] = request.includeCharacters
    ? generateCharacters(request.theme, 1 + Math.floor(Math.random() * 2))
    : [];

  // Generate setting
  const setting = generateSetting(request.theme, request.tone, settings.sensoryFriendly);

  // Generate context
  const context = generateContext(request.theme, request.difficulty);

  // Generate typing content
  const typingContent = generateTypingContent(
    request.difficulty,
    request.length,
    characters,
    setting,
    context
  );

  // Extract vocabulary
  const vocabulary = extractVocabulary(typingContent);

  // Calculate word count and estimated time
  const wordCount = typingContent.split(/\s+/).length;
  const estimatedTime = Math.ceil((wordCount / 40) * 60); // Assuming 40 WPM

  return {
    id: `scene-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    title: template.title,
    theme: request.theme,
    difficulty: request.difficulty,
    length: request.length,
    tone: request.tone,
    characters,
    setting,
    context,
    typingContent,
    vocabulary,
    wordCount,
    estimatedTime,
    generatedAt: new Date(),
    favorite: false,
    tags: generateTags(request.theme, request.difficulty, request.tone),
  };
}

// Scene templates
function getSceneTemplates(theme: SceneTheme) {
  const templates: Record<SceneTheme, Array<{ title: string; concept: string }>> = {
    nature: [
      { title: 'Forest Exploration', concept: 'exploring a peaceful forest' },
      { title: 'Ocean Discovery', concept: 'discovering ocean wonders' },
      { title: 'Mountain Journey', concept: 'hiking up a mountain trail' },
      { title: 'Garden Paradise', concept: 'tending a beautiful garden' },
    ],
    space: [
      { title: 'Starship Adventure', concept: 'traveling through space' },
      { title: 'Alien Encounter', concept: 'meeting friendly aliens' },
      { title: 'Planet Discovery', concept: 'exploring a new planet' },
      { title: 'Space Station Life', concept: 'living on a space station' },
    ],
    animals: [
      { title: 'Wildlife Safari', concept: 'observing animals in nature' },
      { title: 'Pet Care', concept: 'caring for beloved pets' },
      { title: 'Animal Rescue', concept: 'helping animals in need' },
      { title: 'Zoo Adventure', concept: 'visiting an amazing zoo' },
    ],
    fantasy: [
      { title: 'Magic Academy', concept: 'learning magic at school' },
      { title: 'Dragon Quest', concept: 'meeting a friendly dragon' },
      { title: 'Enchanted Forest', concept: 'exploring magical woods' },
      { title: 'Castle Adventure', concept: 'discovering a grand castle' },
    ],
    science: [
      { title: 'Lab Experiment', concept: 'conducting cool experiments' },
      { title: 'Robot Building', concept: 'creating helpful robots' },
      { title: 'Invention Workshop', concept: 'inventing new things' },
      { title: 'Science Fair', concept: 'presenting science projects' },
    ],
    history: [
      { title: 'Ancient Civilization', concept: 'learning about ancient times' },
      { title: 'Time Travel', concept: 'visiting historical periods' },
      { title: 'Museum Tour', concept: 'exploring history exhibits' },
      { title: 'Historical Figure', concept: 'meeting famous people from history' },
    ],
    everyday: [
      { title: 'Morning Routine', concept: 'starting a great day' },
      { title: 'School Day', concept: 'learning and making friends' },
      { title: 'Cooking Adventure', concept: 'making delicious food' },
      { title: 'Community Helper', concept: 'helping in the community' },
    ],
    adventure: [
      { title: 'Treasure Hunt', concept: 'searching for hidden treasure' },
      { title: 'Mystery Solving', concept: 'solving exciting mysteries' },
      { title: 'Exploration Quest', concept: 'exploring unknown lands' },
      { title: 'Challenge Course', concept: 'completing fun challenges' },
    ],
    mystery: [
      { title: 'Detective Case', concept: 'solving a puzzling case' },
      { title: 'Secret Discovery', concept: 'uncovering hidden secrets' },
      { title: 'Clue Hunt', concept: 'following mysterious clues' },
      { title: 'Puzzle Solving', concept: 'solving brain teasers' },
    ],
    custom: [
      { title: 'Custom Adventure', concept: 'creating your own story' },
    ],
  };

  return templates[theme] || templates.everyday;
}

// Generate characters
function generateCharacters(theme: SceneTheme, count: number): SceneCharacter[] {
  const characterPools: Record<SceneTheme, string[]> = {
    nature: ['Forest Ranger Alex', 'Naturalist Sam', 'Wildlife Guide Maya'],
    space: ['Astronaut Zara', 'Space Captain Nova', 'Alien Friend Zyx'],
    animals: ['Veterinarian Dr. Lee', 'Zookeeper Jordan', 'Animal Trainer Casey'],
    fantasy: ['Wizard Merlin', 'Elf Luna', 'Knight Arthur'],
    science: ['Scientist Dr. Nova', 'Engineer Tech', 'Inventor Spark'],
    history: ['Historian Prof. Time', 'Archaeologist Dr. Dig', 'Museum Guide Pat'],
    everyday: ['Friend Taylor', 'Teacher Ms. Kim', 'Neighbor Alex'],
    adventure: ['Explorer Quinn', 'Guide River', 'Adventurer Sky'],
    mystery: ['Detective Holmes', 'Investigator Clue', 'Sleuth Mystery'],
    custom: ['Companion'],
  };

  const names = characterPools[theme] || characterPools.everyday;
  const characters: SceneCharacter[] = [];

  for (let i = 0; i < Math.min(count, names.length); i++) {
    const name = names[i];
    characters.push({
      name,
      description: `A helpful and friendly ${name.split(' ')[0].toLowerCase()}`,
      traits: ['kind', 'knowledgeable', 'encouraging'],
      role: i === 0 ? 'guide' : 'companion',
    });
  }

  return characters;
}

// Generate setting
function generateSetting(
  theme: SceneTheme,
  tone: SceneTone,
  sensoryFriendly: boolean
): SceneSetting {
  const settings: Record<SceneTheme, SceneSetting> = {
    nature: {
      name: 'Peaceful Forest',
      description: 'A calm forest with tall trees and gentle sunlight',
      atmosphere: tone === 'calm' ? 'serene and quiet' : 'lively and vibrant',
      sensoryDetails: {
        visual: 'Soft green leaves and dappled sunlight',
        auditory: sensoryFriendly ? 'Gentle bird songs' : 'Birds chirping and leaves rustling',
      },
      timeOfDay: 'morning',
    },
    space: {
      name: 'Starship Bridge',
      description: 'A modern spaceship control room with stars outside',
      atmosphere: tone === 'calm' ? 'peaceful and organized' : 'exciting and busy',
      sensoryDetails: {
        visual: 'Twinkling stars and glowing control panels',
        auditory: sensoryFriendly ? 'Soft humming of engines' : 'Beeps and computer sounds',
      },
      timeOfDay: undefined,
    },
    animals: {
      name: 'Wildlife Sanctuary',
      description: 'A safe haven for animals with natural habitats',
      atmosphere: tone === 'calm' ? 'tranquil and safe' : 'active and playful',
      sensoryDetails: {
        visual: 'Animals in natural settings',
        auditory: sensoryFriendly ? 'Gentle animal sounds' : 'Various animal calls',
      },
      timeOfDay: 'afternoon',
    },
    fantasy: {
      name: 'Enchanted Clearing',
      description: 'A magical forest clearing with soft light',
      atmosphere: tone === 'calm' ? 'mystical and peaceful' : 'magical and exciting',
      sensoryDetails: {
        visual: 'Soft magical sparkles and colorful flowers',
        auditory: sensoryFriendly ? 'Gentle magical chimes' : 'Magical sounds and wind',
      },
      timeOfDay: 'evening',
    },
    science: {
      name: 'Research Laboratory',
      description: 'A clean, organized lab with interesting equipment',
      atmosphere: tone === 'calm' ? 'quiet and focused' : 'busy and innovative',
      sensoryDetails: {
        visual: 'Organized equipment and colorful liquids',
        auditory: sensoryFriendly ? 'Quiet bubbling' : 'Lab equipment sounds',
      },
      timeOfDay: 'afternoon',
    },
    history: {
      name: 'Museum Hall',
      description: 'A well-lit museum with fascinating exhibits',
      atmosphere: tone === 'calm' ? 'quiet and educational' : 'interesting and engaging',
      sensoryDetails: {
        visual: 'Historical artifacts and informative displays',
        auditory: sensoryFriendly ? 'Quiet footsteps' : 'Soft echoes and voices',
      },
      timeOfDay: 'afternoon',
    },
    everyday: {
      name: 'Cozy Home',
      description: 'A comfortable, familiar home environment',
      atmosphere: tone === 'calm' ? 'relaxed and safe' : 'warm and active',
      sensoryDetails: {
        visual: 'Comfortable furniture and warm lighting',
        auditory: sensoryFriendly ? 'Gentle household sounds' : 'Normal home sounds',
      },
      timeOfDay: 'morning',
    },
    adventure: {
      name: 'Adventure Path',
      description: 'An exciting trail with interesting discoveries',
      atmosphere: tone === 'calm' ? 'peaceful exploration' : 'thrilling discovery',
      sensoryDetails: {
        visual: 'Interesting paths and hidden treasures',
        auditory: sensoryFriendly ? 'Nature sounds' : 'Adventure sounds',
      },
      timeOfDay: 'afternoon',
    },
    mystery: {
      name: 'Mystery Room',
      description: 'A intriguing room with clues to discover',
      atmosphere: tone === 'calm' ? 'quietly puzzling' : 'excitingly mysterious',
      sensoryDetails: {
        visual: 'Clues and interesting details',
        auditory: sensoryFriendly ? 'Quiet thinking space' : 'Mysterious ambient sounds',
      },
      timeOfDay: 'evening',
    },
    custom: {
      name: 'Your Special Place',
      description: 'A place created just for you',
      atmosphere: 'customized to your preferences',
      sensoryDetails: {
        visual: 'Whatever you imagine',
        auditory: 'Sounds you choose',
      },
    },
  };

  return settings[theme] || settings.everyday;
}

// Generate context
function generateContext(theme: SceneTheme, difficulty: SceneDifficulty): SceneContext {
  const contexts: Record<SceneTheme, SceneContext> = {
    nature: {
      situation: 'You are exploring a beautiful natural environment',
      goal: 'Learn about the plants and animals around you',
      challenge: difficulty === 'beginner' ? 'Name what you see' : 'Describe the ecosystem',
      reward: 'Discover amazing facts about nature',
    },
    space: {
      situation: 'You are aboard a spaceship on an important mission',
      goal: 'Navigate through space and make discoveries',
      challenge: difficulty === 'beginner' ? 'Record observations' : 'Analyze space phenomena',
      reward: 'Unlock new regions of space',
    },
    animals: {
      situation: 'You are working with wonderful animals',
      goal: 'Help care for and learn about different animals',
      challenge: difficulty === 'beginner' ? 'Observe animal behavior' : 'Understand animal needs',
      reward: 'Build bonds with animals',
    },
    fantasy: {
      situation: 'You have entered a magical realm',
      goal: 'Learn about magic and help magical creatures',
      challenge: difficulty === 'beginner' ? 'Practice simple spells' : 'Master complex magic',
      reward: 'Gain magical abilities',
    },
    science: {
      situation: 'You are in a laboratory conducting experiments',
      goal: 'Make scientific discoveries through experiments',
      challenge: difficulty === 'beginner' ? 'Follow experiment steps' : 'Design experiments',
      reward: 'Make breakthrough discoveries',
    },
    history: {
      situation: 'You are exploring different time periods',
      goal: 'Learn about historical events and people',
      challenge: difficulty === 'beginner' ? 'Learn historical facts' : 'Understand historical context',
      reward: 'Unlock historical knowledge',
    },
    everyday: {
      situation: 'You are going about your daily activities',
      goal: 'Complete everyday tasks successfully',
      challenge: difficulty === 'beginner' ? 'Follow daily routines' : 'Optimize your day',
      reward: 'Have a great day',
    },
    adventure: {
      situation: 'You are on an exciting adventure',
      goal: 'Complete your quest and find treasures',
      challenge: difficulty === 'beginner' ? 'Follow the path' : 'Solve complex challenges',
      reward: 'Discover amazing treasures',
    },
    mystery: {
      situation: 'You are solving an intriguing mystery',
      goal: 'Gather clues and solve the puzzle',
      challenge: difficulty === 'beginner' ? 'Find obvious clues' : 'Connect subtle hints',
      reward: 'Solve the mystery',
    },
    custom: {
      situation: 'Your custom scenario',
      goal: 'Achieve your custom goal',
      reward: 'Custom reward',
    },
  };

  return contexts[theme] || contexts.everyday;
}

// Generate typing content
function generateTypingContent(
  difficulty: SceneDifficulty,
  length: SceneLength,
  characters: SceneCharacter[],
  setting: SceneSetting,
  context: SceneContext
): string {
  const lengthMultiplier = length === 'short' ? 1 : length === 'medium' ? 2 : 3;

  const intro = `Welcome to ${setting.name}. ${setting.description}. ${
    characters.length > 0 ? `You meet ${characters[0].name}, ${characters[0].description}.` : ''
  }`;

  const body = `${context.situation} ${context.goal} ${
    context.challenge ? `Your challenge is to ${context.challenge}.` : ''
  } The atmosphere is ${setting.atmosphere}. ${setting.sensoryDetails.visual}. ${
    setting.sensoryDetails.auditory
  }.`;

  const conclusion = `${
    context.reward ? `If you succeed, you will ${context.reward}.` : ''
  } Take your time and enjoy this typing practice.`;

  let content = `${intro} ${body} `.repeat(lengthMultiplier) + conclusion;

  // Adjust for difficulty
  if (difficulty === 'beginner') {
    content = content.replace(/[,;:]/g, '.').replace(/\.\./g, '.');
  }

  return content;
}

// Extract vocabulary
function extractVocabulary(content: string): string[] {
  const words = content
    .toLowerCase()
    .replace(/[^\w\s]/g, '')
    .split(/\s+/)
    .filter((word) => word.length > 4);

  const uniqueWords = Array.from(new Set(words));
  return uniqueWords.slice(0, 20);
}

// Generate tags
function generateTags(theme: SceneTheme, difficulty: SceneDifficulty, tone: SceneTone): string[] {
  return [theme, difficulty, tone, 'ai-generated'];
}

// Main component
interface AISceneGenerationProps {
  onSceneGenerated?: (scene: GeneratedScene) => void;
  initialSettings?: Partial<GenerationSettings>;
}

const AISceneGeneration: React.FC<AISceneGenerationProps> = ({
  onSceneGenerated,
  initialSettings,
}) => {
  const aisg = useAISceneGeneration(initialSettings);

  const [showGenerator, setShowGenerator] = useState(false);
  const [selectedTheme, setSelectedTheme] = useState<SceneTheme>('nature');
  const [selectedDifficulty, setSelectedDifficulty] = useState<SceneDifficulty>('intermediate');
  const [selectedLength, setSelectedLength] = useState<SceneLength>('medium');
  const [selectedTone, setSelectedTone] = useState<SceneTone>('calm');

  const handleGenerate = useCallback(async () => {
    const request: SceneGenerationRequest = {
      theme: selectedTheme,
      difficulty: selectedDifficulty,
      length: selectedLength,
      tone: selectedTone,
      interests: aisg.preferences.interests,
      avoidTopics: aisg.preferences.avoidTopics,
      vocabularyLevel: aisg.preferences.vocabularyLevel,
      includeCharacters: true,
      includeNarrative: true,
    };

    const scene = await aisg.generateScene(request);
    onSceneGenerated?.(scene);
  }, [aisg, selectedTheme, selectedDifficulty, selectedLength, selectedTone, onSceneGenerated]);

  const handleQuickGenerate = useCallback(async () => {
    const scene = await aisg.generateQuickScene();
    onSceneGenerated?.(scene);
  }, [aisg, onSceneGenerated]);

  const themes: Array<{ theme: SceneTheme; label: string; icon: string; color: string }> = [
    { theme: 'nature', label: 'Nature', icon: '🌲', color: '#4CAF50' },
    { theme: 'space', label: 'Space', icon: '🚀', color: '#2196F3' },
    { theme: 'animals', label: 'Animals', icon: '🐾', color: '#FF9800' },
    { theme: 'fantasy', label: 'Fantasy', icon: '✨', color: '#9C27B0' },
    { theme: 'science', label: 'Science', icon: '🔬', color: '#00BCD4' },
    { theme: 'history', label: 'History', icon: '🏛️', color: '#795548' },
    { theme: 'everyday', label: 'Everyday', icon: '🏠', color: '#607D8B' },
    { theme: 'adventure', label: 'Adventure', icon: '⛰️', color: '#FF5722' },
    { theme: 'mystery', label: 'Mystery', icon: '🔍', color: '#673AB7' },
  ];

  return (
    <div style={{ padding: '20px', maxWidth: '1000px', margin: '0 auto' }}>
      {/* Quick Generate Button */}
      <div style={{ display: 'flex', gap: '10px', marginBottom: '20px' }}>
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={handleQuickGenerate}
          disabled={aisg.isGenerating}
          style={{
            flex: 1,
            padding: '15px 30px',
            fontSize: '18px',
            backgroundColor: aisg.isGenerating ? '#ccc' : '#4CAF50',
            color: 'white',
            border: 'none',
            borderRadius: '8px',
            cursor: aisg.isGenerating ? 'wait' : 'pointer',
          }}
        >
          {aisg.isGenerating ? '⏳ Generating...' : '✨ Quick Generate Scene'}
        </motion.button>

        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => setShowGenerator(!showGenerator)}
          style={{
            padding: '15px 30px',
            fontSize: '18px',
            backgroundColor: '#2196F3',
            color: 'white',
            border: 'none',
            borderRadius: '8px',
            cursor: 'pointer',
          }}
        >
          🎨 Custom Generate
        </motion.button>
      </div>

      {/* Custom Generator */}
      <AnimatePresence>
        {showGenerator && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            style={{
              marginBottom: '20px',
              padding: '25px',
              backgroundColor: '#f5f5f5',
              borderRadius: '12px',
            }}
          >
            <h3 style={{ marginTop: 0 }}>Customize Your Scene</h3>

            {/* Theme Selection */}
            <div style={{ marginBottom: '20px' }}>
              <h4>Theme:</h4>
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fill, minmax(100px, 1fr))',
                  gap: '10px',
                }}
              >
                {themes.map((t) => (
                  <motion.button
                    key={t.theme}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => setSelectedTheme(t.theme)}
                    style={{
                      padding: '15px 10px',
                      backgroundColor:
                        selectedTheme === t.theme ? t.color : 'white',
                      color: selectedTheme === t.theme ? 'white' : '#333',
                      border: `2px solid ${t.color}`,
                      borderRadius: '8px',
                      cursor: 'pointer',
                      fontSize: '12px',
                    }}
                  >
                    <div style={{ fontSize: '24px', marginBottom: '5px' }}>
                      {t.icon}
                    </div>
                    {t.label}
                  </motion.button>
                ))}
              </div>
            </div>

            {/* Difficulty */}
            <div style={{ marginBottom: '20px' }}>
              <h4>Difficulty:</h4>
              <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                {(['beginner', 'intermediate', 'advanced', 'expert'] as SceneDifficulty[]).map(
                  (diff) => (
                    <button
                      key={diff}
                      onClick={() => setSelectedDifficulty(diff)}
                      style={{
                        padding: '10px 20px',
                        backgroundColor:
                          selectedDifficulty === diff ? '#FF9800' : 'white',
                        color: selectedDifficulty === diff ? 'white' : '#333',
                        border: '2px solid #FF9800',
                        borderRadius: '6px',
                        cursor: 'pointer',
                      }}
                    >
                      {diff}
                    </button>
                  )
                )}
              </div>
            </div>

            {/* Length */}
            <div style={{ marginBottom: '20px' }}>
              <h4>Length:</h4>
              <div style={{ display: 'flex', gap: '10px' }}>
                {(['short', 'medium', 'long'] as SceneLength[]).map((len) => (
                  <button
                    key={len}
                    onClick={() => setSelectedLength(len)}
                    style={{
                      padding: '10px 20px',
                      backgroundColor:
                        selectedLength === len ? '#9C27B0' : 'white',
                      color: selectedLength === len ? 'white' : '#333',
                      border: '2px solid #9C27B0',
                      borderRadius: '6px',
                      cursor: 'pointer',
                    }}
                  >
                    {len}
                  </button>
                ))}
              </div>
            </div>

            {/* Tone */}
            <div style={{ marginBottom: '20px' }}>
              <h4>Tone:</h4>
              <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                {(['calm', 'exciting', 'educational', 'humorous', 'neutral'] as SceneTone[]).map(
                  (t) => (
                    <button
                      key={t}
                      onClick={() => setSelectedTone(t)}
                      style={{
                        padding: '10px 20px',
                        backgroundColor:
                          selectedTone === t ? '#00BCD4' : 'white',
                        color: selectedTone === t ? 'white' : '#333',
                        border: '2px solid #00BCD4',
                        borderRadius: '6px',
                        cursor: 'pointer',
                      }}
                    >
                      {t}
                    </button>
                  )
                )}
              </div>
            </div>

            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={handleGenerate}
              disabled={aisg.isGenerating}
              style={{
                padding: '15px 40px',
                fontSize: '16px',
                backgroundColor: aisg.isGenerating ? '#ccc' : '#4CAF50',
                color: 'white',
                border: 'none',
                borderRadius: '8px',
                cursor: aisg.isGenerating ? 'wait' : 'pointer',
                width: '100%',
              }}
            >
              {aisg.isGenerating ? '⏳ Generating...' : '✨ Generate Scene'}
            </motion.button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Current Scene Display */}
      <AnimatePresence>
        {aisg.currentScene && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            style={{
              marginBottom: '20px',
              padding: '30px',
              backgroundColor: '#E8F5E9',
              borderRadius: '12px',
              border: '2px solid #4CAF50',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start' }}>
              <h2 style={{ marginTop: 0 }}>{aisg.currentScene.title}</h2>
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={() => aisg.toggleFavorite(aisg.currentScene!.id)}
                style={{
                  padding: '10px',
                  backgroundColor: 'transparent',
                  border: 'none',
                  fontSize: '24px',
                  cursor: 'pointer',
                }}
              >
                {aisg.currentScene.favorite ? '⭐' : '☆'}
              </motion.button>
            </div>

            <div
              style={{
                display: 'flex',
                gap: '10px',
                marginBottom: '20px',
                flexWrap: 'wrap',
              }}
            >
              {aisg.currentScene.tags.map((tag) => (
                <span
                  key={tag}
                  style={{
                    padding: '5px 10px',
                    backgroundColor: '#4CAF50',
                    color: 'white',
                    borderRadius: '12px',
                    fontSize: '12px',
                  }}
                >
                  {tag}
                </span>
              ))}
            </div>

            {/* Setting */}
            <div
              style={{
                backgroundColor: 'white',
                padding: '15px',
                borderRadius: '8px',
                marginBottom: '15px',
              }}
            >
              <h4 style={{ marginTop: 0 }}>Setting: {aisg.currentScene.setting.name}</h4>
              <p>{aisg.currentScene.setting.description}</p>
              <p style={{ fontSize: '14px', color: '#666' }}>
                {aisg.currentScene.setting.sensoryDetails.visual}
              </p>
            </div>

            {/* Characters */}
            {aisg.currentScene.characters.length > 0 && (
              <div
                style={{
                  backgroundColor: 'white',
                  padding: '15px',
                  borderRadius: '8px',
                  marginBottom: '15px',
                }}
              >
                <h4 style={{ marginTop: 0 }}>Characters:</h4>
                {aisg.currentScene.characters.map((char) => (
                  <div key={char.name} style={{ marginBottom: '10px' }}>
                    <strong>{char.name}</strong> - {char.description}
                  </div>
                ))}
              </div>
            )}

            {/* Typing Content */}
            <div
              style={{
                backgroundColor: 'white',
                padding: '20px',
                borderRadius: '8px',
                marginBottom: '15px',
              }}
            >
              <h4 style={{ marginTop: 0 }}>Typing Practice:</h4>
              <p style={{ fontSize: '16px', lineHeight: '1.8' }}>
                {aisg.currentScene.typingContent}
              </p>
            </div>

            {/* Stats */}
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))',
                gap: '10px',
              }}
            >
              <div style={{ textAlign: 'center' }}>
                <strong>Word Count</strong>
                <div>{aisg.currentScene.wordCount}</div>
              </div>
              <div style={{ textAlign: 'center' }}>
                <strong>Estimated Time</strong>
                <div>{Math.ceil(aisg.currentScene.estimatedTime / 60)} min</div>
              </div>
              <div style={{ textAlign: 'center' }}>
                <strong>Vocabulary Words</strong>
                <div>{aisg.currentScene.vocabulary.length}</div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Scene History */}
      {aisg.scenes.length > 0 && (
        <div
          style={{
            padding: '20px',
            backgroundColor: '#f5f5f5',
            borderRadius: '8px',
          }}
        >
          <h3 style={{ marginTop: 0 }}>
            Recent Scenes ({aisg.scenes.length})
          </h3>
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))',
              gap: '10px',
            }}
          >
            {aisg.scenes.slice(0, 6).map((scene) => (
              <motion.div
                key={scene.id}
                whileHover={{ scale: 1.02 }}
                onClick={() => aisg.setCurrentScene(scene)}
                style={{
                  padding: '15px',
                  backgroundColor: 'white',
                  borderRadius: '8px',
                  cursor: 'pointer',
                  border:
                    aisg.currentScene?.id === scene.id
                      ? '2px solid #4CAF50'
                      : '2px solid transparent',
                }}
              >
                <div
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    marginBottom: '10px',
                  }}
                >
                  <strong>{scene.title}</strong>
                  {scene.favorite && <span>⭐</span>}
                </div>
                <div style={{ fontSize: '12px', color: '#666' }}>
                  {scene.theme} • {scene.difficulty}
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default AISceneGeneration;
