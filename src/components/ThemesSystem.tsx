import React, { useState, useCallback, useEffect } from 'react';
import { motion } from 'framer-motion';

/**
 * Themes System Component
 * Step 321 - Create comprehensive theming system for the application
 *
 * Features:
 * - Visual themes (light, dark, high contrast, etc.)
 * - Content themes (space, ocean, forest, etc.)
 * - Color customization
 * - Font and typography themes
 * - Sound themes
 * - Autism-friendly themes
 * - Theme preview
 * - Custom theme creation
 * - Theme import/export
 */

// Types
export type ThemeCategory =
  | 'visual'
  | 'content'
  | 'seasonal'
  | 'educational'
  | 'fantasy'
  | 'nature'
  | 'space'
  | 'custom';

export type AccessibilityLevel = 'standard' | 'enhanced' | 'maximum';

export interface ColorScheme {
  primary: string;
  secondary: string;
  accent: string;
  background: string;
  surface: string;
  text: string;
  textSecondary: string;
  success: string;
  warning: string;
  error: string;
  info: string;
}

export interface Typography {
  fontFamily: string;
  fontSize: {
    small: string;
    medium: string;
    large: string;
    xlarge: string;
  };
  fontWeight: {
    normal: number;
    bold: number;
  };
  lineHeight: number;
  letterSpacing: string;
}

export interface SoundTheme {
  successSound: string;
  errorSound: string;
  clickSound: string;
  completionSound: string;
  ambientMusic?: string;
  volume: number;
}

export interface AnimationSettings {
  enabled: boolean;
  duration: number; // ms
  easing: string;
  reducedMotion: boolean;
}

export interface Theme {
  id: string;
  name: string;
  description: string;
  category: ThemeCategory;
  colorScheme: ColorScheme;
  typography: Typography;
  soundTheme?: SoundTheme;
  animations: AnimationSettings;
  accessibility: {
    level: AccessibilityLevel;
    highContrast: boolean;
    dyslexiaFont: boolean;
    largeText: boolean;
    reducedMotion: boolean;
    screenReaderOptimized: boolean;
  };
  customization: {
    allowColorChange: boolean;
    allowFontChange: boolean;
    allowSoundChange: boolean;
  };
  preview: {
    thumbnail?: string;
    demoImages?: string[];
  };
  metadata: {
    author: string;
    created: Date;
    lastModified: Date;
    version: string;
    tags: string[];
  };
  autismFriendly: boolean;
  sensoryProfile: {
    visualComplexity: 'low' | 'medium' | 'high';
    colorIntensity: 'low' | 'medium' | 'high';
    animationLevel: 'none' | 'subtle' | 'normal' | 'dynamic';
    soundLevel: 'quiet' | 'moderate' | 'active';
  };
  isActive: boolean;
  isFavorite: boolean;
  usageCount: number;
  rating?: number;
}

export interface ThemePreset {
  id: string;
  name: string;
  icon: string;
  description: string;
  category: ThemeCategory;
  baseTheme: Partial<Theme>;
}

export interface ThemeFilter {
  categories?: ThemeCategory[];
  autismFriendlyOnly?: boolean;
  accessibilityLevel?: AccessibilityLevel;
  tags?: string[];
  searchQuery?: string;
}

export interface ThemeSystemSettings {
  enableCustomThemes: boolean;
  enableThemeSharing: boolean;
  autoSwitchByTime: boolean;
  dayTheme?: string;
  nightTheme?: string;
  rememberLastTheme: boolean;
}

interface ThemesSystemProps {
  onThemeChange?: (theme: Theme) => void;
  onThemeCreate?: (theme: Theme) => void;
  settings?: Partial<ThemeSystemSettings>;
}

// Built-in themes
const builtInThemes: Omit<Theme, 'isActive' | 'usageCount' | 'isFavorite'>[] = [
  {
    id: 'calm-light',
    name: 'Calm Light',
    description: 'Soft, calming colors perfect for focus',
    category: 'visual',
    colorScheme: {
      primary: '#4A90E2',
      secondary: '#7ED7C1',
      accent: '#F5A623',
      background: '#FAFAFA',
      surface: '#FFFFFF',
      text: '#333333',
      textSecondary: '#666666',
      success: '#4CAF50',
      warning: '#FF9800',
      error: '#F44336',
      info: '#2196F3',
    },
    typography: {
      fontFamily: '"Open Dyslexic", "Comic Sans MS", Arial, sans-serif',
      fontSize: {
        small: '14px',
        medium: '16px',
        large: '20px',
        xlarge: '28px',
      },
      fontWeight: {
        normal: 400,
        bold: 700,
      },
      lineHeight: 1.6,
      letterSpacing: '0.5px',
    },
    animations: {
      enabled: true,
      duration: 300,
      easing: 'ease-in-out',
      reducedMotion: false,
    },
    accessibility: {
      level: 'enhanced',
      highContrast: false,
      dyslexiaFont: true,
      largeText: false,
      reducedMotion: false,
      screenReaderOptimized: true,
    },
    customization: {
      allowColorChange: true,
      allowFontChange: true,
      allowSoundChange: true,
    },
    preview: {},
    metadata: {
      author: 'System',
      created: new Date(),
      lastModified: new Date(),
      version: '1.0',
      tags: ['light', 'calm', 'focus'],
    },
    autismFriendly: true,
    sensoryProfile: {
      visualComplexity: 'low',
      colorIntensity: 'low',
      animationLevel: 'subtle',
      soundLevel: 'quiet',
    },
  },
  {
    id: 'deep-focus',
    name: 'Deep Focus',
    description: 'Dark theme for distraction-free typing',
    category: 'visual',
    colorScheme: {
      primary: '#BB86FC',
      secondary: '#03DAC6',
      accent: '#CF6679',
      background: '#121212',
      surface: '#1E1E1E',
      text: '#E1E1E1',
      textSecondary: '#B0B0B0',
      success: '#4CAF50',
      warning: '#FFA726',
      error: '#EF5350',
      info: '#29B6F6',
    },
    typography: {
      fontFamily: '"Atkinson Hyperlegible", Arial, sans-serif',
      fontSize: {
        small: '14px',
        medium: '18px',
        large: '24px',
        xlarge: '32px',
      },
      fontWeight: {
        normal: 400,
        bold: 700,
      },
      lineHeight: 1.7,
      letterSpacing: '0.75px',
    },
    animations: {
      enabled: true,
      duration: 200,
      easing: 'ease-out',
      reducedMotion: false,
    },
    accessibility: {
      level: 'maximum',
      highContrast: true,
      dyslexiaFont: false,
      largeText: true,
      reducedMotion: false,
      screenReaderOptimized: true,
    },
    customization: {
      allowColorChange: true,
      allowFontChange: true,
      allowSoundChange: true,
    },
    preview: {},
    metadata: {
      author: 'System',
      created: new Date(),
      lastModified: new Date(),
      version: '1.0',
      tags: ['dark', 'focus', 'contrast'],
    },
    autismFriendly: true,
    sensoryProfile: {
      visualComplexity: 'low',
      colorIntensity: 'medium',
      animationLevel: 'none',
      soundLevel: 'quiet',
    },
  },
  {
    id: 'ocean-adventure',
    name: 'Ocean Adventure',
    description: 'Dive into an underwater world',
    category: 'nature',
    colorScheme: {
      primary: '#0077BE',
      secondary: '#00A896',
      accent: '#FF6B6B',
      background: '#E8F4F8',
      surface: '#FFFFFF',
      text: '#1A535C',
      textSecondary: '#4A7C89',
      success: '#4ECDC4',
      warning: '#FFE66D',
      error: '#FF6B6B',
      info: '#4A90E2',
    },
    typography: {
      fontFamily: '"Quicksand", "Comic Sans MS", sans-serif',
      fontSize: {
        small: '14px',
        medium: '16px',
        large: '20px',
        xlarge: '28px',
      },
      fontWeight: {
        normal: 400,
        bold: 600,
      },
      lineHeight: 1.6,
      letterSpacing: '0.25px',
    },
    animations: {
      enabled: true,
      duration: 400,
      easing: 'ease-in-out',
      reducedMotion: false,
    },
    accessibility: {
      level: 'standard',
      highContrast: false,
      dyslexiaFont: false,
      largeText: false,
      reducedMotion: false,
      screenReaderOptimized: false,
    },
    customization: {
      allowColorChange: true,
      allowFontChange: true,
      allowSoundChange: true,
    },
    preview: {},
    metadata: {
      author: 'System',
      created: new Date(),
      lastModified: new Date(),
      version: '1.0',
      tags: ['ocean', 'nature', 'water', 'adventure'],
    },
    autismFriendly: true,
    sensoryProfile: {
      visualComplexity: 'medium',
      colorIntensity: 'medium',
      animationLevel: 'normal',
      soundLevel: 'moderate',
    },
  },
  {
    id: 'space-explorer',
    name: 'Space Explorer',
    description: 'Journey through the cosmos',
    category: 'space',
    colorScheme: {
      primary: '#9D4EDD',
      secondary: '#3A0CA3',
      accent: '#F72585',
      background: '#0B0C10',
      surface: '#1F2833',
      text: '#C5C6C7',
      textSecondary: '#8892B0',
      success: '#00FFA3',
      warning: '#FFB700',
      error: '#FF1744',
      info: '#00B4D8',
    },
    typography: {
      fontFamily: '"Orbitron", "Arial Black", sans-serif',
      fontSize: {
        small: '13px',
        medium: '16px',
        large: '20px',
        xlarge: '28px',
      },
      fontWeight: {
        normal: 400,
        bold: 700,
      },
      lineHeight: 1.5,
      letterSpacing: '1px',
    },
    animations: {
      enabled: true,
      duration: 500,
      easing: 'cubic-bezier(0.68, -0.55, 0.265, 1.55)',
      reducedMotion: false,
    },
    accessibility: {
      level: 'standard',
      highContrast: false,
      dyslexiaFont: false,
      largeText: false,
      reducedMotion: false,
      screenReaderOptimized: false,
    },
    customization: {
      allowColorChange: true,
      allowFontChange: true,
      allowSoundChange: true,
    },
    preview: {},
    metadata: {
      author: 'System',
      created: new Date(),
      lastModified: new Date(),
      version: '1.0',
      tags: ['space', 'sci-fi', 'cosmic', 'adventure'],
    },
    autismFriendly: false,
    sensoryProfile: {
      visualComplexity: 'high',
      colorIntensity: 'high',
      animationLevel: 'dynamic',
      soundLevel: 'active',
    },
  },
  {
    id: 'forest-calm',
    name: 'Forest Calm',
    description: 'Peaceful forest atmosphere',
    category: 'nature',
    colorScheme: {
      primary: '#2D6A4F',
      secondary: '#52B788',
      accent: '#8B4513',
      background: '#F1F8F4',
      surface: '#FFFFFF',
      text: '#1B4332',
      textSecondary: '#40916C',
      success: '#52B788',
      warning: '#E9C46A',
      error: '#E76F51',
      info: '#2A9D8F',
    },
    typography: {
      fontFamily: '"Nunito", "Verdana", sans-serif',
      fontSize: {
        small: '14px',
        medium: '16px',
        large: '20px',
        xlarge: '26px',
      },
      fontWeight: {
        normal: 400,
        bold: 700,
      },
      lineHeight: 1.65,
      letterSpacing: '0.3px',
    },
    animations: {
      enabled: true,
      duration: 350,
      easing: 'ease',
      reducedMotion: false,
    },
    accessibility: {
      level: 'enhanced',
      highContrast: false,
      dyslexiaFont: false,
      largeText: false,
      reducedMotion: false,
      screenReaderOptimized: true,
    },
    customization: {
      allowColorChange: true,
      allowFontChange: true,
      allowSoundChange: true,
    },
    preview: {},
    metadata: {
      author: 'System',
      created: new Date(),
      lastModified: new Date(),
      version: '1.0',
      tags: ['forest', 'nature', 'calm', 'peaceful'],
    },
    autismFriendly: true,
    sensoryProfile: {
      visualComplexity: 'low',
      colorIntensity: 'low',
      animationLevel: 'subtle',
      soundLevel: 'quiet',
    },
  },
];

const defaultSettings: ThemeSystemSettings = {
  enableCustomThemes: true,
  enableThemeSharing: true,
  autoSwitchByTime: false,
  rememberLastTheme: true,
};

export const useThemesSystem = (props: ThemesSystemProps = {}) => {
  const settings = { ...defaultSettings, ...props.settings };

  // State
  const [themes, setThemes] = useState<Theme[]>([]);
  const [customThemes, setCustomThemes] = useState<Theme[]>([]);
  const [activeTheme, setActiveTheme] = useState<Theme | null>(null);
  const [filter, setFilter] = useState<ThemeFilter>({});

  // Initialize themes
  useEffect(() => {
    const initialThemes: Theme[] = builtInThemes.map((t) => ({
      ...t,
      isActive: false,
      usageCount: 0,
      isFavorite: false,
    }));
    setThemes(initialThemes);

    // Load custom themes and active theme from localStorage
    try {
      const saved = localStorage.getItem('typing-tutor-themes');
      if (saved) {
        const data = JSON.parse(saved);
        setCustomThemes(data.customThemes || []);

        if (settings.rememberLastTheme && data.activeThemeId) {
          const theme = [...initialThemes, ...(data.customThemes || [])].find(
            (t) => t.id === data.activeThemeId
          );
          if (theme) {
            activateTheme(theme.id);
          }
        }
      }

      // Set default theme if none active
      if (!activeTheme && initialThemes.length > 0) {
        activateTheme(initialThemes[0].id);
      }
    } catch (err) {
      console.error('Failed to load themes:', err);
    }
  }, []);

  // Auto-save themes
  useEffect(() => {
    try {
      const data = {
        customThemes,
        activeThemeId: activeTheme?.id,
      };
      localStorage.setItem('typing-tutor-themes', JSON.stringify(data));
    } catch (err) {
      console.error('Failed to save themes:', err);
    }
  }, [customThemes, activeTheme]);

  // Get all themes
  const getAllThemes = useCallback((): Theme[] => {
    return [...themes, ...customThemes];
  }, [themes, customThemes]);

  // Filter themes
  const getFilteredThemes = useCallback(
    (filterOptions?: ThemeFilter): Theme[] => {
      const currentFilter = filterOptions || filter;
      let filtered = getAllThemes();

      if (currentFilter.categories && currentFilter.categories.length > 0) {
        filtered = filtered.filter((t) => currentFilter.categories!.includes(t.category));
      }

      if (currentFilter.autismFriendlyOnly) {
        filtered = filtered.filter((t) => t.autismFriendly);
      }

      if (currentFilter.accessibilityLevel) {
        filtered = filtered.filter(
          (t) => t.accessibility.level === currentFilter.accessibilityLevel
        );
      }

      if (currentFilter.tags && currentFilter.tags.length > 0) {
        filtered = filtered.filter((t) =>
          currentFilter.tags!.some((tag) => t.metadata.tags.includes(tag))
        );
      }

      if (currentFilter.searchQuery) {
        const query = currentFilter.searchQuery.toLowerCase();
        filtered = filtered.filter(
          (t) =>
            t.name.toLowerCase().includes(query) ||
            t.description.toLowerCase().includes(query) ||
            t.metadata.tags.some((tag) => tag.toLowerCase().includes(query))
        );
      }

      return filtered;
    },
    [getAllThemes, filter]
  );

  // Activate theme
  const activateTheme = useCallback(
    (themeId: string) => {
      const theme = getAllThemes().find((t) => t.id === themeId);
      if (!theme) return;

      // Deactivate current theme
      if (activeTheme) {
        const updateActive = (t: Theme) =>
          t.id === activeTheme.id ? { ...t, isActive: false } : t;
        setThemes((prev) => prev.map(updateActive));
        setCustomThemes((prev) => prev.map(updateActive));
      }

      // Activate new theme
      const activateNew = (t: Theme) =>
        t.id === themeId
          ? { ...t, isActive: true, usageCount: t.usageCount + 1 }
          : t;

      setThemes((prev) => prev.map(activateNew));
      setCustomThemes((prev) => prev.map(activateNew));
      setActiveTheme({ ...theme, isActive: true });

      // Apply theme to document
      applyThemeToDocument(theme);

      props.onThemeChange?.(theme);
    },
    [activeTheme, getAllThemes, props]
  );

  // Apply theme to document
  const applyThemeToDocument = (theme: Theme) => {
    const root = document.documentElement;
    const { colorScheme, typography } = theme;

    // Apply colors
    root.style.setProperty('--color-primary', colorScheme.primary);
    root.style.setProperty('--color-secondary', colorScheme.secondary);
    root.style.setProperty('--color-accent', colorScheme.accent);
    root.style.setProperty('--color-background', colorScheme.background);
    root.style.setProperty('--color-surface', colorScheme.surface);
    root.style.setProperty('--color-text', colorScheme.text);
    root.style.setProperty('--color-text-secondary', colorScheme.textSecondary);

    // Apply typography
    root.style.setProperty('--font-family', typography.fontFamily);
    root.style.setProperty('--font-size-base', typography.fontSize.medium);
    root.style.setProperty('--line-height', typography.lineHeight.toString());
    root.style.setProperty('--letter-spacing', typography.letterSpacing);
  };

  // Create custom theme
  const createTheme = useCallback(
    (themeData: Omit<Theme, 'id' | 'isActive' | 'usageCount' | 'isFavorite'>): string => {
      if (!settings.enableCustomThemes) {
        console.warn('Custom themes are disabled');
        return '';
      }

      const theme: Theme = {
        ...themeData,
        id: `custom-theme-${Date.now()}`,
        isActive: false,
        usageCount: 0,
        isFavorite: false,
      };

      setCustomThemes((prev) => [...prev, theme]);
      props.onThemeCreate?.(theme);

      return theme.id;
    },
    [settings.enableCustomThemes, props]
  );

  // Delete custom theme
  const deleteTheme = useCallback(
    (themeId: string) => {
      const theme = customThemes.find((t) => t.id === themeId);
      if (!theme) return false;

      setCustomThemes((prev) => prev.filter((t) => t.id !== themeId));

      // If deleted theme was active, activate default
      if (activeTheme?.id === themeId) {
        activateTheme(themes[0].id);
      }

      return true;
    },
    [customThemes, activeTheme, themes, activateTheme]
  );

  // Toggle favorite
  const toggleFavorite = useCallback((themeId: string) => {
    const toggleFav = (t: Theme) =>
      t.id === themeId ? { ...t, isFavorite: !t.isFavorite } : t;

    setThemes((prev) => prev.map(toggleFav));
    setCustomThemes((prev) => prev.map(toggleFav));
  }, []);

  // Rate theme
  const rateTheme = useCallback((themeId: string, rating: number) => {
    const updateRating = (t: Theme) =>
      t.id === themeId ? { ...t, rating: Math.max(1, Math.min(5, rating)) } : t;

    setThemes((prev) => prev.map(updateRating));
    setCustomThemes((prev) => prev.map(updateRating));
  }, []);

  // Export theme
  const exportTheme = useCallback((themeId: string): string => {
    const theme = getAllThemes().find((t) => t.id === themeId);
    if (!theme) return '';

    return JSON.stringify(theme, null, 2);
  }, [getAllThemes]);

  // Import theme
  const importTheme = useCallback(
    (jsonData: string): string | null => {
      if (!settings.enableCustomThemes) return null;

      try {
        const theme = JSON.parse(jsonData) as Theme;
        theme.id = `imported-${Date.now()}`;
        theme.isActive = false;
        theme.usageCount = 0;
        theme.isFavorite = false;
        theme.metadata.author = 'Imported';

        setCustomThemes((prev) => [...prev, theme]);
        return theme.id;
      } catch (err) {
        console.error('Failed to import theme:', err);
        return null;
      }
    },
    [settings.enableCustomThemes]
  );

  // Get statistics
  const getStatistics = useCallback(() => {
    const all = getAllThemes();
    return {
      totalThemes: all.length,
      builtInThemes: themes.length,
      customThemes: customThemes.length,
      favorites: all.filter((t) => t.isFavorite).length,
      autismFriendly: all.filter((t) => t.autismFriendly).length,
      mostUsed: all.reduce(
        (max, t) => (t.usageCount > max.usageCount ? t : max),
        all[0]
      ),
      byCategory: all.reduce((acc, t) => {
        acc[t.category] = (acc[t.category] || 0) + 1;
        return acc;
      }, {} as Record<ThemeCategory, number>),
    };
  }, [getAllThemes, themes, customThemes]);

  return {
    // State
    themes: getFilteredThemes(),
    activeTheme,
    filter,
    settings,

    // Actions
    activateTheme,
    createTheme,
    deleteTheme,
    toggleFavorite,
    rateTheme,
    setFilter,
    exportTheme,
    importTheme,
    getStatistics,
  };
};

// Main component
const ThemesSystem: React.FC<ThemesSystemProps> = (props) => {
  const {
    themes,
    activeTheme,
    activateTheme,
    toggleFavorite,
    setFilter,
    getStatistics,
  } = useThemesSystem(props);

  const stats = getStatistics();

  return (
    <div style={{ padding: '20px', maxWidth: '1400px', margin: '0 auto' }}>
      {/* Header */}
      <div style={{ marginBottom: '30px' }}>
        <h1 style={{ margin: '0 0 10px 0', fontSize: '32px' }}>🎨 Themes</h1>
        <p style={{ color: '#666', margin: 0 }}>
          Customize your typing experience with beautiful themes
        </p>
      </div>

      {/* Active Theme */}
      {activeTheme && (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          style={{
            padding: '30px',
            background: `linear-gradient(135deg, ${activeTheme.colorScheme.primary}, ${activeTheme.colorScheme.secondary})`,
            borderRadius: '16px',
            color: 'white',
            marginBottom: '30px',
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start' }}>
            <div>
              <h2 style={{ margin: '0 0 10px 0' }}>✨ {activeTheme.name}</h2>
              <p style={{ margin: '0 0 15px 0', opacity: 0.9 }}>
                {activeTheme.description}
              </p>
              <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                {activeTheme.metadata.tags.map((tag) => (
                  <span
                    key={tag}
                    style={{
                      padding: '4px 12px',
                      backgroundColor: 'rgba(255,255,255,0.2)',
                      borderRadius: '12px',
                      fontSize: '12px',
                    }}
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </div>
            <div style={{ fontSize: '48px' }}>✓</div>
          </div>
        </motion.div>
      )}

      {/* Statistics */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(120px, 1fr))',
          gap: '15px',
          marginBottom: '30px',
        }}
      >
        <div
          style={{
            padding: '15px',
            backgroundColor: 'white',
            borderRadius: '12px',
            border: '2px solid #e0e0e0',
            textAlign: 'center',
          }}
        >
          <div style={{ fontSize: '28px', fontWeight: 'bold', color: '#4CAF50' }}>
            {stats.totalThemes}
          </div>
          <div style={{ fontSize: '11px', color: '#666' }}>Total Themes</div>
        </div>
        <div
          style={{
            padding: '15px',
            backgroundColor: 'white',
            borderRadius: '12px',
            border: '2px solid #e0e0e0',
            textAlign: 'center',
          }}
        >
          <div style={{ fontSize: '28px', fontWeight: 'bold', color: '#FF9800' }}>
            {stats.favorites}
          </div>
          <div style={{ fontSize: '11px', color: '#666' }}>Favorites</div>
        </div>
        <div
          style={{
            padding: '15px',
            backgroundColor: 'white',
            borderRadius: '12px',
            border: '2px solid #e0e0e0',
            textAlign: 'center',
          }}
        >
          <div style={{ fontSize: '28px', fontWeight: 'bold', color: '#2196F3' }}>
            {stats.autismFriendly}
          </div>
          <div style={{ fontSize: '11px', color: '#666' }}>Autism Friendly</div>
        </div>
      </div>

      {/* Filters */}
      <div style={{ display: 'flex', gap: '10px', marginBottom: '30px', flexWrap: 'wrap' }}>
        <button
          onClick={() => setFilter({ autismFriendlyOnly: true })}
          style={{
            padding: '10px 20px',
            backgroundColor: '#4CAF50',
            color: 'white',
            border: 'none',
            borderRadius: '8px',
            cursor: 'pointer',
          }}
        >
          Autism Friendly
        </button>
        <button
          onClick={() => setFilter({ categories: ['nature'] })}
          style={{
            padding: '10px 20px',
            backgroundColor: '#2196F3',
            color: 'white',
            border: 'none',
            borderRadius: '8px',
            cursor: 'pointer',
          }}
        >
          Nature
        </button>
        <button
          onClick={() => setFilter({ categories: ['space'] })}
          style={{
            padding: '10px 20px',
            backgroundColor: '#9C27B0',
            color: 'white',
            border: 'none',
            borderRadius: '8px',
            cursor: 'pointer',
          }}
        >
          Space
        </button>
        <button
          onClick={() => setFilter({})}
          style={{
            padding: '10px 20px',
            backgroundColor: '#666',
            color: 'white',
            border: 'none',
            borderRadius: '8px',
            cursor: 'pointer',
          }}
        >
          Clear Filters
        </button>
      </div>

      {/* Themes Grid */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
          gap: '20px',
        }}
      >
        {themes.map((theme) => (
          <motion.div
            key={theme.id}
            whileHover={{ scale: 1.02 }}
            onClick={() => activateTheme(theme.id)}
            style={{
              backgroundColor: 'white',
              borderRadius: '16px',
              overflow: 'hidden',
              border: theme.isActive ? '3px solid #4CAF50' : '2px solid #e0e0e0',
              cursor: 'pointer',
              position: 'relative',
            }}
          >
            {/* Color Preview */}
            <div
              style={{
                height: '120px',
                background: `linear-gradient(135deg, ${theme.colorScheme.primary}, ${theme.colorScheme.secondary})`,
                display: 'flex',
                alignItems: 'flex-end',
                padding: '15px',
              }}
            >
              <div style={{ display: 'flex', gap: '8px' }}>
                {[
                  theme.colorScheme.primary,
                  theme.colorScheme.secondary,
                  theme.colorScheme.accent,
                ].map((color, i) => (
                  <div
                    key={i}
                    style={{
                      width: '32px',
                      height: '32px',
                      backgroundColor: color,
                      borderRadius: '6px',
                      border: '2px solid white',
                    }}
                  />
                ))}
              </div>
            </div>

            {/* Content */}
            <div style={{ padding: '20px' }}>
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'start',
                  marginBottom: '10px',
                }}
              >
                <h3 style={{ margin: 0, fontSize: '18px' }}>{theme.name}</h3>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    toggleFavorite(theme.id);
                  }}
                  style={{
                    background: 'none',
                    border: 'none',
                    cursor: 'pointer',
                    fontSize: '20px',
                  }}
                >
                  {theme.isFavorite ? '❤️' : '🤍'}
                </button>
              </div>

              <p style={{ fontSize: '14px', color: '#666', marginBottom: '15px' }}>
                {theme.description}
              </p>

              <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', marginBottom: '10px' }}>
                {theme.autismFriendly && (
                  <span
                    style={{
                      padding: '4px 8px',
                      backgroundColor: '#E8F5E9',
                      color: '#2E7D32',
                      borderRadius: '4px',
                      fontSize: '11px',
                    }}
                  >
                    ♾️ Autism Friendly
                  </span>
                )}
                <span
                  style={{
                    padding: '4px 8px',
                    backgroundColor: '#E3F2FD',
                    borderRadius: '4px',
                    fontSize: '11px',
                  }}
                >
                  {theme.category}
                </span>
              </div>

              {theme.isActive && (
                <div
                  style={{
                    padding: '8px',
                    backgroundColor: '#E8F5E9',
                    color: '#2E7D32',
                    borderRadius: '6px',
                    textAlign: 'center',
                    fontWeight: 'bold',
                    fontSize: '12px',
                  }}
                >
                  ✓ Active Theme
                </div>
              )}
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
};

export default ThemesSystem;
