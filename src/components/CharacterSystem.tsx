import React, { useState, useCallback, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

// Types
export type CharacterRole =
  | 'protagonist'
  | 'friend'
  | 'mentor'
  | 'companion'
  | 'guide'
  | 'helper'
  | 'rival'
  | 'neutral';

export type CharacterArchetype =
  | 'adventurer'
  | 'learner'
  | 'helper'
  | 'creator'
  | 'explorer'
  | 'protector'
  | 'thinker'
  | 'friend'
  | 'custom';

export type PersonalityTrait =
  | 'kind'
  | 'curious'
  | 'brave'
  | 'thoughtful'
  | 'patient'
  | 'creative'
  | 'logical'
  | 'empathetic'
  | 'determined'
  | 'calm'
  | 'enthusiastic'
  | 'careful';

export interface CharacterAppearance {
  species?: string; // e.g., "human", "robot", "animal", "alien"
  age?: string;
  height?: string;
  hairColor?: string;
  eyeColor?: string;
  clothing?: string;
  accessories?: string[];
  distinctiveFeatures?: string[];
}

export interface CharacterBackground {
  origin?: string;
  occupation?: string;
  skills?: string[];
  interests?: string[];
  specialAbilities?: string[];
  backstory?: string;
  motivations?: string[];
  goals?: string[];
}

export interface CharacterRelationship {
  characterId: string;
  relationshipType: string; // e.g., "friend", "sibling", "mentor", "rival"
  description?: string;
  strength: number; // 1-10
}

export interface Character {
  id: string;
  name: string;
  role: CharacterRole;
  archetype: CharacterArchetype;
  personality: PersonalityTrait[];
  appearance: CharacterAppearance;
  background: CharacterBackground;
  relationships: CharacterRelationship[];
  catchphrase?: string;
  favoriteThings?: string[];
  dislikes?: string[];
  autismRepresentation?: {
    isAutistic: boolean;
    traits?: string[]; // e.g., "loves routines", "special interest in trains"
    strengths?: string[];
    accommodations?: string[];
  };
  created: Date;
  lastModified: Date;
  author: 'built-in' | 'custom';
  usageCount: number;
  isFavorite: boolean;
  tags: string[];
}

export interface CharacterFilter {
  roles?: CharacterRole[];
  archetypes?: CharacterArchetype[];
  personalities?: PersonalityTrait[];
  tags?: string[];
  autismRepresentationOnly?: boolean;
  showCustomOnly?: boolean;
  searchQuery?: string;
}

export interface CharacterTemplate {
  id: string;
  name: string;
  description: string;
  archetype: CharacterArchetype;
  suggestedPersonality: PersonalityTrait[];
  suggestedSkills: string[];
  suggestedInterests: string[];
}

export interface CharacterSystemSettings {
  allowDuplicateNames: boolean;
  requireMinimumFields: boolean;
  autoGenerateCatchphrase: boolean;
  suggestRelationships: boolean;
  enableAutismRepresentation: boolean;
  maxCharactersPerUser: number;
}

interface CharacterSystemProps {
  onCharacterSelect?: (character: Character) => void;
  onCharacterCreate?: (character: Character) => void;
  settings?: Partial<CharacterSystemSettings>;
}

// Built-in characters
const builtInCharacters: Omit<Character, 'created' | 'lastModified' | 'usageCount' | 'isFavorite'>[] = [
  {
    id: 'char-alex-explorer',
    name: 'Alex the Explorer',
    role: 'protagonist',
    archetype: 'explorer',
    personality: ['curious', 'brave', 'enthusiastic'],
    appearance: {
      species: 'human',
      age: 'young adult',
      height: 'average',
      hairColor: 'brown',
      eyeColor: 'green',
      clothing: 'comfortable adventure gear',
      accessories: ['backpack', 'compass'],
      distinctiveFeatures: ['friendly smile', 'always wears a lucky hat'],
    },
    background: {
      occupation: 'explorer',
      skills: ['navigation', 'problem-solving', 'map reading'],
      interests: ['geography', 'cultures', 'nature'],
      specialAbilities: ['can find north without a compass'],
      motivations: ['discover new places', 'help others'],
      goals: ['visit every continent', 'make new friends'],
    },
    relationships: [],
    catchphrase: "Let's see what's around the next corner!",
    favoriteThings: ['maps', 'stories', 'new experiences'],
    dislikes: ['staying in one place too long', 'closed doors'],
    tags: ['adventurous', 'positive', 'beginner-friendly'],
    author: 'built-in',
  },
  {
    id: 'char-sam-scientist',
    name: 'Sam the Scientist',
    role: 'mentor',
    archetype: 'thinker',
    personality: ['thoughtful', 'patient', 'logical'],
    appearance: {
      species: 'human',
      age: 'adult',
      height: 'tall',
      hairColor: 'gray',
      eyeColor: 'blue',
      clothing: 'lab coat over casual clothes',
      accessories: ['safety goggles', 'notebook'],
      distinctiveFeatures: ['always has a pencil behind ear'],
    },
    background: {
      occupation: 'scientist',
      skills: ['research', 'experimentation', 'teaching'],
      interests: ['chemistry', 'physics', 'astronomy'],
      specialAbilities: ['can explain complex topics simply'],
      motivations: ['share knowledge', 'make discoveries'],
      goals: ['inspire young scientists', 'solve important problems'],
    },
    relationships: [],
    catchphrase: "Science is all about asking 'why?' and 'how?'",
    favoriteThings: ['experiments', 'learning', 'teaching moments'],
    dislikes: ['pseudoscience', 'giving up too quickly'],
    autismRepresentation: {
      isAutistic: true,
      traits: ['special interest in science', 'prefers structured routines', 'direct communication style'],
      strengths: ['exceptional attention to detail', 'pattern recognition', 'deep focus'],
      accommodations: ['needs quiet space for work', 'values predictable schedules'],
    },
    tags: ['educational', 'autism-rep', 'mentor'],
    author: 'built-in',
  },
  {
    id: 'char-riley-robot',
    name: 'Riley the Robot',
    role: 'companion',
    archetype: 'helper',
    personality: ['kind', 'logical', 'patient'],
    appearance: {
      species: 'robot',
      height: 'small',
      clothing: 'shiny metal exterior',
      accessories: ['antenna', 'helpful compartments'],
      distinctiveFeatures: ['expressive LED eyes', 'beeps when happy'],
    },
    background: {
      occupation: 'assistant robot',
      skills: ['organization', 'data analysis', 'emotional support'],
      interests: ['helping others', 'learning human behavior', 'efficiency'],
      specialAbilities: ['perfect memory', 'can calculate quickly', 'never gets tired'],
      motivations: ['be helpful', 'understand emotions better'],
      goals: ['make friends', 'learn about the world'],
    },
    relationships: [],
    catchphrase: "Beep boop! How can I help today?",
    favoriteThings: ['solving problems', 'organization', 'making lists'],
    dislikes: ['chaos', 'being idle', 'unsolved puzzles'],
    tags: ['friendly', 'sci-fi', 'supportive'],
    author: 'built-in',
  },
  {
    id: 'char-dakota-artist',
    name: 'Dakota the Artist',
    role: 'friend',
    archetype: 'creator',
    personality: ['creative', 'empathetic', 'enthusiastic'],
    appearance: {
      species: 'human',
      age: 'young adult',
      height: 'medium',
      hairColor: 'rainbow-streaked',
      eyeColor: 'brown',
      clothing: 'colorful, paint-splattered clothes',
      accessories: ['sketchbook', 'pencils', 'color swatches'],
      distinctiveFeatures: ['always has paint on hands'],
    },
    background: {
      occupation: 'artist',
      skills: ['painting', 'drawing', 'seeing beauty in everything'],
      interests: ['art', 'colors', 'self-expression'],
      specialAbilities: ['can draw anything from memory'],
      motivations: ['express feelings through art', 'inspire others'],
      goals: ['create a mural', 'teach art to kids'],
    },
    relationships: [],
    catchphrase: "Every blank canvas is a new adventure!",
    favoriteThings: ['vibrant colors', 'creative challenges', 'art supplies'],
    dislikes: ['gray days', 'criticism without kindness', 'artistic blocks'],
    tags: ['creative', 'positive', 'expressive'],
    author: 'built-in',
  },
  {
    id: 'char-morgan-librarian',
    name: 'Morgan the Librarian',
    role: 'guide',
    archetype: 'thinker',
    personality: ['thoughtful', 'calm', 'patient'],
    appearance: {
      species: 'human',
      age: 'middle-aged',
      height: 'average',
      hairColor: 'black',
      eyeColor: 'hazel',
      clothing: 'comfortable, practical outfits',
      accessories: ['reading glasses', 'book bag', 'bookmark collection'],
      distinctiveFeatures: ['always knows the perfect book to recommend'],
    },
    background: {
      occupation: 'librarian',
      skills: ['organization', 'research', 'storytelling'],
      interests: ['books', 'quiet spaces', 'helping people find information'],
      specialAbilities: ['photographic memory for book locations'],
      motivations: ['share love of reading', 'create peaceful spaces'],
      goals: ['help everyone find their favorite book', 'preserve stories'],
    },
    relationships: [],
    catchphrase: "There's a book for every question and a story for every heart.",
    favoriteThings: ['libraries', 'organization systems', 'quiet moments'],
    dislikes: ['loud noises', 'damaged books', 'overdue fines (feels bad)'],
    autismRepresentation: {
      isAutistic: true,
      traits: ['sensory sensitivity to noise', 'loves categorizing', 'special interest in literature'],
      strengths: ['exceptional memory', 'pattern recognition in stories', 'systematic thinking'],
      accommodations: ['prefers quiet environments', 'needs advance notice for changes'],
    },
    tags: ['calm', 'educational', 'autism-rep'],
    author: 'built-in',
  },
  {
    id: 'char-phoenix-dragon',
    name: 'Phoenix the Dragon',
    role: 'companion',
    archetype: 'protector',
    personality: ['brave', 'kind', 'determined'],
    appearance: {
      species: 'dragon',
      age: 'young dragon (100 years)',
      height: 'large',
      clothing: 'iridescent scales',
      accessories: ['magical amulet'],
      distinctiveFeatures: ['wings that shimmer in sunlight', 'warm, golden eyes'],
    },
    background: {
      occupation: 'guardian',
      skills: ['flying', 'fire breathing (gentle warmth)', 'protection magic'],
      interests: ['collecting shiny things', 'telling ancient stories', 'helping friends'],
      specialAbilities: ['can sense when friends need help', 'breathes warm (not hot) fire for comfort'],
      motivations: ['protect the innocent', 'honor dragon traditions'],
      goals: ['become a wise guardian', 'make the world safer'],
    },
    relationships: [],
    catchphrase: "Even the smallest flame can light the darkest cave.",
    favoriteThings: ['sunbathing', 'treasured objects', 'loyal friends'],
    dislikes: ['bullies', 'injustice', 'cold weather'],
    tags: ['fantasy', 'protective', 'friendly'],
    author: 'built-in',
  },
];

// Character templates for quick creation
const characterTemplates: CharacterTemplate[] = [
  {
    id: 'template-adventurer',
    name: 'The Adventurer',
    description: 'Bold and curious explorer',
    archetype: 'adventurer',
    suggestedPersonality: ['brave', 'curious', 'enthusiastic'],
    suggestedSkills: ['navigation', 'problem-solving', 'athletics'],
    suggestedInterests: ['exploration', 'challenges', 'discovery'],
  },
  {
    id: 'template-scholar',
    name: 'The Scholar',
    description: 'Knowledgeable and thoughtful learner',
    archetype: 'learner',
    suggestedPersonality: ['thoughtful', 'patient', 'curious'],
    suggestedSkills: ['research', 'analysis', 'teaching'],
    suggestedInterests: ['books', 'science', 'history'],
  },
  {
    id: 'template-friend',
    name: 'The Supportive Friend',
    description: 'Kind and empathetic companion',
    archetype: 'friend',
    suggestedPersonality: ['kind', 'empathetic', 'patient'],
    suggestedSkills: ['listening', 'emotional support', 'encouragement'],
    suggestedInterests: ['helping others', 'friendship', 'understanding'],
  },
  {
    id: 'template-inventor',
    name: 'The Inventor',
    description: 'Creative problem-solver and maker',
    archetype: 'creator',
    suggestedPersonality: ['creative', 'logical', 'determined'],
    suggestedSkills: ['engineering', 'innovation', 'tinkering'],
    suggestedInterests: ['machines', 'gadgets', 'building things'],
  },
];

const defaultSettings: CharacterSystemSettings = {
  allowDuplicateNames: true,
  requireMinimumFields: false,
  autoGenerateCatchphrase: false,
  suggestRelationships: true,
  enableAutismRepresentation: true,
  maxCharactersPerUser: 50,
};

export const useCharacterSystem = (props: CharacterSystemProps = {}) => {
  const settings = { ...defaultSettings, ...props.settings };

  // State
  const [characters, setCharacters] = useState<Character[]>([]);
  const [customCharacters, setCustomCharacters] = useState<Character[]>([]);
  const [selectedCharacter, setSelectedCharacter] = useState<Character | null>(null);
  const [filter, setFilter] = useState<CharacterFilter>({});
  const [editingCharacter, setEditingCharacter] = useState<Partial<Character> | null>(null);

  // Initialize built-in characters
  useEffect(() => {
    const initialCharacters: Character[] = builtInCharacters.map((c) => ({
      ...c,
      created: new Date(),
      lastModified: new Date(),
      usageCount: 0,
      isFavorite: false,
    }));
    setCharacters(initialCharacters);

    // Load custom characters from localStorage
    try {
      const saved = localStorage.getItem('typing-tutor-characters');
      if (saved) {
        const data = JSON.parse(saved);
        setCustomCharacters(data.customCharacters || []);
      }
    } catch (err) {
      console.error('Failed to load characters:', err);
    }
  }, []);

  // Auto-save custom characters
  useEffect(() => {
    try {
      const data = { customCharacters };
      localStorage.setItem('typing-tutor-characters', JSON.stringify(data));
    } catch (err) {
      console.error('Failed to save characters:', err);
    }
  }, [customCharacters]);

  // Get all characters (built-in + custom)
  const getAllCharacters = useCallback((): Character[] => {
    return [...characters, ...customCharacters];
  }, [characters, customCharacters]);

  // Filter characters
  const getFilteredCharacters = useCallback(
    (filterOptions?: CharacterFilter): Character[] => {
      const currentFilter = filterOptions || filter;
      let filtered = getAllCharacters();

      if (currentFilter.roles && currentFilter.roles.length > 0) {
        filtered = filtered.filter((c) => currentFilter.roles!.includes(c.role));
      }

      if (currentFilter.archetypes && currentFilter.archetypes.length > 0) {
        filtered = filtered.filter((c) => currentFilter.archetypes!.includes(c.archetype));
      }

      if (currentFilter.personalities && currentFilter.personalities.length > 0) {
        filtered = filtered.filter((c) =>
          currentFilter.personalities!.some((p) => c.personality.includes(p))
        );
      }

      if (currentFilter.tags && currentFilter.tags.length > 0) {
        filtered = filtered.filter((c) =>
          currentFilter.tags!.some((tag) => c.tags.includes(tag))
        );
      }

      if (currentFilter.autismRepresentationOnly) {
        filtered = filtered.filter((c) => c.autismRepresentation?.isAutistic);
      }

      if (currentFilter.showCustomOnly) {
        filtered = filtered.filter((c) => c.author === 'custom');
      }

      if (currentFilter.searchQuery) {
        const query = currentFilter.searchQuery.toLowerCase();
        filtered = filtered.filter(
          (c) =>
            c.name.toLowerCase().includes(query) ||
            c.background.occupation?.toLowerCase().includes(query) ||
            c.tags.some((t) => t.toLowerCase().includes(query))
        );
      }

      return filtered;
    },
    [filter, getAllCharacters]
  );

  // Select character
  const selectCharacter = useCallback(
    (characterId: string) => {
      const character = getAllCharacters().find((c) => c.id === characterId);
      if (!character) return;

      setSelectedCharacter(character);

      // Increment usage count
      const updateUsage = (c: Character) =>
        c.id === characterId ? { ...c, usageCount: c.usageCount + 1 } : c;

      if (character.author === 'built-in') {
        setCharacters((prev) => prev.map(updateUsage));
      } else {
        setCustomCharacters((prev) => prev.map(updateUsage));
      }

      props.onCharacterSelect?.(character);
    },
    [getAllCharacters, props]
  );

  // Create character
  const createCharacter = useCallback(
    (characterData: Omit<Character, 'id' | 'created' | 'lastModified' | 'usageCount' | 'isFavorite' | 'author'>): string | null => {
      // Check name uniqueness if required
      if (!settings.allowDuplicateNames) {
        const exists = getAllCharacters().some((c) => c.name === characterData.name);
        if (exists) {
          console.warn('Character with this name already exists');
          return null;
        }
      }

      // Check user limit
      if (customCharacters.length >= settings.maxCharactersPerUser) {
        console.warn('Maximum character limit reached');
        return null;
      }

      // Validate minimum fields
      if (settings.requireMinimumFields) {
        if (!characterData.name || !characterData.role || !characterData.archetype) {
          console.warn('Missing required fields');
          return null;
        }
      }

      const now = new Date();
      const character: Character = {
        ...characterData,
        id: `custom-char-${Date.now()}`,
        created: now,
        lastModified: now,
        usageCount: 0,
        isFavorite: false,
        author: 'custom',
      };

      setCustomCharacters((prev) => [...prev, character]);
      props.onCharacterCreate?.(character);

      return character.id;
    },
    [customCharacters, settings, getAllCharacters, props]
  );

  // Update character
  const updateCharacter = useCallback((characterId: string, updates: Partial<Character>) => {
    const updateFn = (c: Character) =>
      c.id === characterId ? { ...c, ...updates, lastModified: new Date() } : c;

    setCharacters((prev) => prev.map(updateFn));
    setCustomCharacters((prev) => prev.map(updateFn));

    if (selectedCharacter?.id === characterId) {
      setSelectedCharacter((prev) => (prev ? { ...prev, ...updates } : null));
    }
  }, [selectedCharacter]);

  // Delete character (custom only)
  const deleteCharacter = useCallback(
    (characterId: string) => {
      const character = getAllCharacters().find((c) => c.id === characterId);
      if (!character || character.author === 'built-in') {
        console.warn('Cannot delete built-in characters');
        return false;
      }

      setCustomCharacters((prev) => prev.filter((c) => c.id !== characterId));
      if (selectedCharacter?.id === characterId) {
        setSelectedCharacter(null);
      }
      return true;
    },
    [getAllCharacters, selectedCharacter]
  );

  // Create from template
  const createFromTemplate = useCallback(
    (templateId: string, name: string, customizations?: Partial<Character>): string | null => {
      const template = characterTemplates.find((t) => t.id === templateId);
      if (!template) return null;

      const characterData: Omit<Character, 'id' | 'created' | 'lastModified' | 'usageCount' | 'isFavorite' | 'author'> = {
        name,
        role: 'protagonist',
        archetype: template.archetype,
        personality: template.suggestedPersonality,
        appearance: {},
        background: {
          skills: template.suggestedSkills,
          interests: template.suggestedInterests,
        },
        relationships: [],
        tags: [],
        ...customizations,
      };

      return createCharacter(characterData);
    },
    [createCharacter]
  );

  // Toggle favorite
  const toggleFavorite = useCallback((characterId: string) => {
    const updateFavorite = (c: Character) =>
      c.id === characterId ? { ...c, isFavorite: !c.isFavorite } : c;

    setCharacters((prev) => prev.map(updateFavorite));
    setCustomCharacters((prev) => prev.map(updateFavorite));
  }, []);

  // Add relationship
  const addRelationship = useCallback(
    (characterId: string, relationship: CharacterRelationship) => {
      updateCharacter(characterId, {
        relationships: [
          ...(getAllCharacters().find((c) => c.id === characterId)?.relationships || []),
          relationship,
        ],
      });
    },
    [getAllCharacters, updateCharacter]
  );

  // Suggest relationships (characters that might know each other)
  const getSuggestedRelationships = useCallback(
    (characterId: string): { character: Character; reason: string }[] => {
      if (!settings.suggestRelationships) return [];

      const character = getAllCharacters().find((c) => c.id === characterId);
      if (!character) return [];

      const suggestions: { character: Character; reason: string }[] = [];
      const otherCharacters = getAllCharacters().filter((c) => c.id !== characterId);

      otherCharacters.forEach((other) => {
        // Same archetype
        if (other.archetype === character.archetype) {
          suggestions.push({
            character: other,
            reason: `Both are ${character.archetype}s`,
          });
        }

        // Shared interests
        const sharedInterests = (character.background.interests || []).filter((i) =>
          (other.background.interests || []).includes(i)
        );
        if (sharedInterests.length > 0) {
          suggestions.push({
            character: other,
            reason: `Share interest in ${sharedInterests[0]}`,
          });
        }

        // Complementary roles (mentor/learner, protector/protagonist, etc.)
        if (
          (character.role === 'protagonist' && other.role === 'mentor') ||
          (character.role === 'mentor' && other.role === 'protagonist')
        ) {
          suggestions.push({
            character: other,
            reason: 'Complementary roles',
          });
        }
      });

      // Remove duplicates and limit
      return suggestions.slice(0, 5);
    },
    [getAllCharacters, settings.suggestRelationships]
  );

  // Export/Import
  const exportCharacters = useCallback(
    (characterIds?: string[]): string => {
      const toExport = characterIds
        ? getAllCharacters().filter((c) => characterIds.includes(c.id))
        : customCharacters;

      return JSON.stringify(toExport, null, 2);
    },
    [getAllCharacters, customCharacters]
  );

  const importCharacters = useCallback(
    (jsonData: string): number => {
      try {
        const imported = JSON.parse(jsonData) as Character[];
        const validCharacters = imported.filter((c) => c.name && c.role && c.archetype);

        // Check if this would exceed limit
        if (customCharacters.length + validCharacters.length > settings.maxCharactersPerUser) {
          console.warn('Import would exceed character limit');
          return 0;
        }

        // Assign new IDs to avoid conflicts
        const newCharacters = validCharacters.map((c) => ({
          ...c,
          id: `imported-char-${Date.now()}-${Math.random()}`,
          author: 'custom' as const,
          created: new Date(),
          lastModified: new Date(),
          usageCount: 0,
          isFavorite: false,
        }));

        setCustomCharacters((prev) => [...prev, ...newCharacters]);
        return newCharacters.length;
      } catch (err) {
        console.error('Failed to import characters:', err);
        return 0;
      }
    },
    [customCharacters, settings.maxCharactersPerUser]
  );

  // Statistics
  const getStatistics = useCallback(() => {
    const all = getAllCharacters();
    return {
      totalCharacters: all.length,
      builtInCharacters: characters.length,
      customCharacters: customCharacters.length,
      favoriteCharacters: all.filter((c) => c.isFavorite).length,
      autismRepCharacters: all.filter((c) => c.autismRepresentation?.isAutistic).length,
      mostUsedCharacter: all.reduce((prev, current) =>
        current.usageCount > prev.usageCount ? current : prev
      , all[0]),
      charactersByRole: all.reduce((acc, c) => {
        acc[c.role] = (acc[c.role] || 0) + 1;
        return acc;
      }, {} as Record<CharacterRole, number>),
      charactersByArchetype: all.reduce((acc, c) => {
        acc[c.archetype] = (acc[c.archetype] || 0) + 1;
        return acc;
      }, {} as Record<CharacterArchetype, number>),
    };
  }, [getAllCharacters, characters, customCharacters]);

  return {
    // State
    characters: getAllCharacters(),
    selectedCharacter,
    filter,
    templates: characterTemplates,
    editingCharacter,
    settings,

    // Actions
    selectCharacter,
    createCharacter,
    updateCharacter,
    deleteCharacter,
    createFromTemplate,
    toggleFavorite,
    addRelationship,
    getSuggestedRelationships,
    getFilteredCharacters,
    setFilter,
    setEditingCharacter,
    exportCharacters,
    importCharacters,
    getStatistics,
  };
};

// Example component
export const CharacterSystemComponent: React.FC<CharacterSystemProps> = (props) => {
  const {
    characters: _characters,
    selectedCharacter,
    selectCharacter,
    getFilteredCharacters,
    setFilter,
    toggleFavorite,
  } = useCharacterSystem(props);

  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [showDetails, setShowDetails] = useState(false);

  return (
    <div className="character-system">
      <div className="character-header">
        <h2>Character Library</h2>
        <div className="view-controls">
          <button onClick={() => setViewMode('grid')} aria-pressed={viewMode === 'grid'}>
            Grid
          </button>
          <button onClick={() => setViewMode('list')} aria-pressed={viewMode === 'list'}>
            List
          </button>
        </div>
      </div>

      <div className="character-filters">
        <button onClick={() => setFilter({ autismRepresentationOnly: true })}>
          Autism Representation
        </button>
        <button onClick={() => setFilter({ roles: ['protagonist'] })}>Protagonists</button>
        <button onClick={() => setFilter({ archetypes: ['friend'] })}>Friends</button>
        <button onClick={() => setFilter({})}>Clear Filters</button>
      </div>

      <div className={`characters-${viewMode}`}>
        {getFilteredCharacters().map((character) => (
          <motion.div
            key={character.id}
            className={`character-card ${selectedCharacter?.id === character.id ? 'selected' : ''}`}
            onClick={() => {
              selectCharacter(character.id);
              setShowDetails(true);
            }}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <div className="character-card-header">
              <h3>{character.name}</h3>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  toggleFavorite(character.id);
                }}
                className={`favorite-btn ${character.isFavorite ? 'active' : ''}`}
                aria-label="Toggle favorite"
              >
                {character.isFavorite ? '★' : '☆'}
              </button>
            </div>
            <p className="role">{character.role}</p>
            <p className="archetype">{character.archetype}</p>
            <div className="personality-traits">
              {character.personality.slice(0, 3).map((trait) => (
                <span key={trait} className="trait">
                  {trait}
                </span>
              ))}
            </div>
            {character.autismRepresentation?.isAutistic && (
              <span className="autism-badge">Autism Rep</span>
            )}
            <div className="tags">
              {character.tags.slice(0, 2).map((tag) => (
                <span key={tag} className="tag">
                  {tag}
                </span>
              ))}
            </div>
          </motion.div>
        ))}
      </div>

      <AnimatePresence>
        {showDetails && selectedCharacter && (
          <motion.div
            className="character-details-modal"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setShowDetails(false)}
          >
            <motion.div
              className="character-details"
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
            >
              <button className="close-btn" onClick={() => setShowDetails(false)}>
                ×
              </button>

              <h2>{selectedCharacter.name}</h2>
              <p className="subtitle">
                {selectedCharacter.role} • {selectedCharacter.archetype}
              </p>

              {selectedCharacter.catchphrase && (
                <blockquote className="catchphrase">"{selectedCharacter.catchphrase}"</blockquote>
              )}

              <div className="detail-section">
                <h3>Personality</h3>
                <div className="traits-list">
                  {selectedCharacter.personality.map((trait) => (
                    <span key={trait} className="trait-badge">
                      {trait}
                    </span>
                  ))}
                </div>
              </div>

              {selectedCharacter.background.skills && selectedCharacter.background.skills.length > 0 && (
                <div className="detail-section">
                  <h3>Skills</h3>
                  <ul>
                    {selectedCharacter.background.skills.map((skill) => (
                      <li key={skill}>{skill}</li>
                    ))}
                  </ul>
                </div>
              )}

              {selectedCharacter.background.interests && selectedCharacter.background.interests.length > 0 && (
                <div className="detail-section">
                  <h3>Interests</h3>
                  <ul>
                    {selectedCharacter.background.interests.map((interest) => (
                      <li key={interest}>{interest}</li>
                    ))}
                  </ul>
                </div>
              )}

              {selectedCharacter.autismRepresentation?.isAutistic && (
                <div className="detail-section autism-section">
                  <h3>Autism Representation</h3>
                  {selectedCharacter.autismRepresentation.traits && (
                    <div>
                      <h4>Traits</h4>
                      <ul>
                        {selectedCharacter.autismRepresentation.traits.map((trait) => (
                          <li key={trait}>{trait}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                  {selectedCharacter.autismRepresentation.strengths && (
                    <div>
                      <h4>Strengths</h4>
                      <ul>
                        {selectedCharacter.autismRepresentation.strengths.map((strength) => (
                          <li key={strength}>{strength}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default CharacterSystemComponent;
