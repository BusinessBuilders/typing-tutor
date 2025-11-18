import React, { useState, useCallback, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

/**
 * Illustrations System Component
 * Step 320 - Build illustrations system for stories and scenes
 *
 * Features:
 * - AI-generated illustrations
 * - Custom illustrations upload
 * - Illustration library management
 * - Style presets (cartoon, realistic, minimalist)
 * - Color palette management
 * - Scene-specific illustrations
 * - Character illustrations
 * - Background illustrations
 * - Layered illustration composition
 */

// Types
export type IllustrationStyle =
  | 'cartoon'
  | 'realistic'
  | 'minimalist'
  | 'watercolor'
  | 'line-art'
  | 'pixel-art'
  | 'hand-drawn'
  | 'digital'
  | 'sketch';

export type IllustrationType =
  | 'character'
  | 'scene'
  | 'background'
  | 'object'
  | 'action'
  | 'emotion'
  | 'location'
  | 'abstract';

export type IllustrationSource =
  | 'ai-generated'
  | 'user-uploaded'
  | 'built-in'
  | 'community'
  | 'stock';

export interface ColorPalette {
  id: string;
  name: string;
  primary: string;
  secondary: string;
  accent: string;
  background: string;
  colors: string[];
  description?: string;
  mood?: string;
}

export interface IllustrationLayer {
  id: string;
  name: string;
  imageUrl: string;
  zIndex: number;
  opacity: number;
  blendMode: 'normal' | 'multiply' | 'screen' | 'overlay';
  visible: boolean;
  position: { x: number; y: number };
  scale: number;
}

export interface Illustration {
  id: string;
  title: string;
  description?: string;
  type: IllustrationType;
  style: IllustrationStyle;
  source: IllustrationSource;
  imageUrl: string;
  thumbnailUrl?: string;
  layers?: IllustrationLayer[];
  palette?: ColorPalette;
  tags: string[];
  metadata: {
    width: number;
    height: number;
    format: string;
    size: number; // bytes
    characterIds?: string[];
    sceneId?: string;
    aiPrompt?: string; // If AI-generated
  };
  autismFriendly: boolean;
  sensoryConsiderations?: string[];
  created: Date;
  lastModified: Date;
  author: string;
  usageCount: number;
  rating?: number;
  isFavorite: boolean;
  isPublic: boolean;
  downloadCount: number;
}

export interface IllustrationRequest {
  type: IllustrationType;
  style: IllustrationStyle;
  prompt: string;
  characterIds?: string[];
  sceneDescription?: string;
  palette?: ColorPalette;
  options?: {
    width?: number;
    height?: number;
    quality?: 'draft' | 'standard' | 'high';
    autismFriendly?: boolean;
  };
}

export interface IllustrationFilter {
  types?: IllustrationType[];
  styles?: IllustrationStyle[];
  sources?: IllustrationSource[];
  tags?: string[];
  autismFriendlyOnly?: boolean;
  searchQuery?: string;
  paletteId?: string;
}

export interface IllustrationSystemSettings {
  defaultStyle: IllustrationStyle;
  defaultQuality: 'draft' | 'standard' | 'high';
  enableAIGeneration: boolean;
  enableLayering: boolean;
  autoOptimize: boolean;
  cacheIllustrations: boolean;
  maxUploadSize: number; // MB
  allowedFormats: string[];
  showMetadata: boolean;
  enableRating: boolean;
}

interface IllustrationSystemProps {
  onIllustrationSelect?: (illustration: Illustration) => void;
  onIllustrationGenerate?: (illustration: Illustration) => void;
  settings?: Partial<IllustrationSystemSettings>;
}

// Built-in color palettes
const builtInPalettes: ColorPalette[] = [
  {
    id: 'calm-ocean',
    name: 'Calm Ocean',
    primary: '#4A90E2',
    secondary: '#7ED7C1',
    accent: '#F5A623',
    background: '#E8F5F7',
    colors: ['#4A90E2', '#7ED7C1', '#50E3C2', '#B8E986', '#F5A623'],
    description: 'Peaceful blue and teal tones',
    mood: 'calm',
  },
  {
    id: 'warm-sunset',
    name: 'Warm Sunset',
    primary: '#FF6B6B',
    secondary: '#FFB74D',
    accent: '#FFA726',
    background: '#FFF3E0',
    colors: ['#FF6B6B', '#FFB74D', '#FFA726', '#FF8A65', '#FFAB91'],
    description: 'Warm oranges and reds',
    mood: 'energetic',
  },
  {
    id: 'forest-green',
    name: 'Forest Green',
    primary: '#4CAF50',
    secondary: '#8BC34A',
    accent: '#CDDC39',
    background: '#F1F8E9',
    colors: ['#4CAF50', '#8BC34A', '#CDDC39', '#AED581', '#C5E1A5'],
    description: 'Natural green tones',
    mood: 'peaceful',
  },
  {
    id: 'lavender-dreams',
    name: 'Lavender Dreams',
    primary: '#9C27B0',
    secondary: '#BA68C8',
    accent: '#E1BEE7',
    background: '#F3E5F5',
    colors: ['#9C27B0', '#BA68C8', '#CE93D8', '#E1BEE7', '#F3E5F5'],
    description: 'Soft purple tones',
    mood: 'dreamy',
  },
  {
    id: 'minimal-mono',
    name: 'Minimal Mono',
    primary: '#212121',
    secondary: '#757575',
    accent: '#BDBDBD',
    background: '#FAFAFA',
    colors: ['#212121', '#424242', '#757575', '#BDBDBD', '#E0E0E0'],
    description: 'Clean monochrome',
    mood: 'focused',
  },
];

const defaultSettings: IllustrationSystemSettings = {
  defaultStyle: 'cartoon',
  defaultQuality: 'standard',
  enableAIGeneration: true,
  enableLayering: false,
  autoOptimize: true,
  cacheIllustrations: true,
  maxUploadSize: 5,
  allowedFormats: ['jpg', 'jpeg', 'png', 'webp', 'svg'],
  showMetadata: true,
  enableRating: true,
};

export const useIllustrationsSystem = (props: IllustrationSystemProps = {}) => {
  const settings = { ...defaultSettings, ...props.settings };

  // State
  const [illustrations, setIllustrations] = useState<Illustration[]>([]);
  const [selectedIllustration, setSelectedIllustration] = useState<Illustration | null>(null);
  const [filter, setFilter] = useState<IllustrationFilter>({});
  const [palettes, setPalettes] = useState<ColorPalette[]>(builtInPalettes);
  const [isGenerating, setIsGenerating] = useState(false);
  const [generationProgress, setGenerationProgress] = useState(0);

  // Load illustrations from localStorage
  useEffect(() => {
    try {
      const stored = localStorage.getItem('typing-tutor-illustrations');
      if (stored) {
        const data = JSON.parse(stored);
        setIllustrations(data.illustrations || []);
      }
    } catch (err) {
      console.error('Failed to load illustrations:', err);
    }
  }, []);

  // Save illustrations to localStorage
  useEffect(() => {
    try {
      const data = { illustrations };
      localStorage.setItem('typing-tutor-illustrations', JSON.stringify(data));
    } catch (err) {
      console.error('Failed to save illustrations:', err);
    }
  }, [illustrations]);

  // Filter illustrations
  const getFilteredIllustrations = useCallback(
    (filterOptions?: IllustrationFilter): Illustration[] => {
      const currentFilter = filterOptions || filter;
      let filtered = [...illustrations];

      if (currentFilter.types && currentFilter.types.length > 0) {
        filtered = filtered.filter((i) => currentFilter.types!.includes(i.type));
      }

      if (currentFilter.styles && currentFilter.styles.length > 0) {
        filtered = filtered.filter((i) => currentFilter.styles!.includes(i.style));
      }

      if (currentFilter.sources && currentFilter.sources.length > 0) {
        filtered = filtered.filter((i) => currentFilter.sources!.includes(i.source));
      }

      if (currentFilter.tags && currentFilter.tags.length > 0) {
        filtered = filtered.filter((i) =>
          currentFilter.tags!.some((tag) => i.tags.includes(tag))
        );
      }

      if (currentFilter.autismFriendlyOnly) {
        filtered = filtered.filter((i) => i.autismFriendly);
      }

      if (currentFilter.searchQuery) {
        const query = currentFilter.searchQuery.toLowerCase();
        filtered = filtered.filter(
          (i) =>
            i.title.toLowerCase().includes(query) ||
            i.description?.toLowerCase().includes(query) ||
            i.tags.some((tag) => tag.toLowerCase().includes(query))
        );
      }

      if (currentFilter.paletteId) {
        filtered = filtered.filter((i) => i.palette?.id === currentFilter.paletteId);
      }

      return filtered;
    },
    [illustrations, filter]
  );

  // Select illustration
  const selectIllustration = useCallback(
    (illustrationId: string) => {
      const illustration = illustrations.find((i) => i.id === illustrationId);
      if (!illustration) return;

      setSelectedIllustration(illustration);

      // Increment usage count
      setIllustrations((prev) =>
        prev.map((i) =>
          i.id === illustrationId ? { ...i, usageCount: i.usageCount + 1 } : i
        )
      );

      props.onIllustrationSelect?.(illustration);
    },
    [illustrations, props, setSelectedIllustration]
  );

  // Generate AI illustration
  const generateIllustration = useCallback(
    async (request: IllustrationRequest): Promise<Illustration | null> => {
      if (!settings.enableAIGeneration) {
        console.warn('AI generation is disabled');
        return null;
      }

      setIsGenerating(true);
      setGenerationProgress(0);

      try {
        // Simulate AI generation progress
        for (let i = 0; i <= 100; i += 10) {
          setGenerationProgress(i);
          await new Promise((resolve) => setTimeout(resolve, 200));
        }

        // Create illustration (in real implementation, this would call AI service)
        const illustration: Illustration = {
          id: `ai-illustration-${Date.now()}`,
          title: `AI Generated ${request.type}`,
          description: request.prompt,
          type: request.type,
          style: request.style,
          source: 'ai-generated',
          imageUrl: `https://via.placeholder.com/${request.options?.width || 800}x${request.options?.height || 600}/4A90E2/FFFFFF?text=${encodeURIComponent(request.type)}`,
          thumbnailUrl: `https://via.placeholder.com/200x150/4A90E2/FFFFFF?text=${encodeURIComponent(request.type)}`,
          palette: request.palette,
          tags: [request.type, request.style, 'ai-generated'],
          metadata: {
            width: request.options?.width || 800,
            height: request.options?.height || 600,
            format: 'png',
            size: 150000,
            aiPrompt: request.prompt,
            characterIds: request.characterIds,
          },
          autismFriendly: request.options?.autismFriendly ?? true,
          sensoryConsiderations: ['gentle-colors', 'clear-imagery'],
          created: new Date(),
          lastModified: new Date(),
          author: 'AI',
          usageCount: 0,
          isFavorite: false,
          isPublic: true,
          downloadCount: 0,
        };

        setIllustrations((prev) => [illustration, ...prev]);
        props.onIllustrationGenerate?.(illustration);

        return illustration;
      } catch (error) {
        console.error('Failed to generate illustration:', error);
        return null;
      } finally {
        setIsGenerating(false);
        setGenerationProgress(0);
      }
    },
    [settings.enableAIGeneration, props]
  );

  // Upload illustration
  const uploadIllustration = useCallback(
    async (
      file: File,
      metadata: {
        title: string;
        description?: string;
        type: IllustrationType;
        style: IllustrationStyle;
        tags?: string[];
        autismFriendly?: boolean;
      }
    ): Promise<Illustration | null> => {
      // Validate file size
      if (file.size > settings.maxUploadSize * 1024 * 1024) {
        console.error(`File size exceeds ${settings.maxUploadSize}MB limit`);
        return null;
      }

      // Validate file format
      const extension = file.name.split('.').pop()?.toLowerCase();
      if (!extension || !settings.allowedFormats.includes(extension)) {
        console.error(`Format ${extension} not allowed`);
        return null;
      }

      try {
        // Create object URL for the file
        const imageUrl = URL.createObjectURL(file);

        // Get image dimensions
        const img = new Image();
        img.src = imageUrl;
        await new Promise((resolve) => (img.onload = resolve));

        const illustration: Illustration = {
          id: `uploaded-${Date.now()}`,
          title: metadata.title,
          description: metadata.description,
          type: metadata.type,
          style: metadata.style,
          source: 'user-uploaded',
          imageUrl,
          thumbnailUrl: imageUrl,
          tags: metadata.tags || [],
          metadata: {
            width: img.width,
            height: img.height,
            format: extension,
            size: file.size,
          },
          autismFriendly: metadata.autismFriendly ?? true,
          created: new Date(),
          lastModified: new Date(),
          author: 'User',
          usageCount: 0,
          isFavorite: false,
          isPublic: false,
          downloadCount: 0,
        };

        setIllustrations((prev) => [illustration, ...prev]);
        return illustration;
      } catch (error) {
        console.error('Failed to upload illustration:', error);
        return null;
      }
    },
    [settings.maxUploadSize, settings.allowedFormats]
  );

  // Delete illustration
  const deleteIllustration = useCallback((illustrationId: string) => {
    setIllustrations((prev) => prev.filter((i) => i.id !== illustrationId));
    // Remove from selected if it was selected
    setSelectedIllustration((prev: Illustration | null) => (prev?.id === illustrationId ? null : prev));
  }, [setSelectedIllustration]);

  // Toggle favorite
  const toggleFavorite = useCallback((illustrationId: string) => {
    setIllustrations((prev) =>
      prev.map((i) =>
        i.id === illustrationId ? { ...i, isFavorite: !i.isFavorite } : i
      )
    );
  }, []);

  // Rate illustration
  const rateIllustration = useCallback((illustrationId: string, rating: number) => {
    setIllustrations((prev) =>
      prev.map((i) =>
        i.id === illustrationId ? { ...i, rating: Math.max(1, Math.min(5, rating)) } : i
      )
    );
  }, []);

  // Create custom palette
  const createPalette = useCallback((palette: Omit<ColorPalette, 'id'>): string => {
    const newPalette: ColorPalette = {
      ...palette,
      id: `palette-${Date.now()}`,
    };
    setPalettes((prev) => [...prev, newPalette]);
    return newPalette.id;
  }, []);

  // Get statistics
  const getStatistics = useCallback(() => {
    return {
      totalIllustrations: illustrations.length,
      byType: illustrations.reduce((acc, i) => {
        acc[i.type] = (acc[i.type] || 0) + 1;
        return acc;
      }, {} as Record<IllustrationType, number>),
      byStyle: illustrations.reduce((acc, i) => {
        acc[i.style] = (acc[i.style] || 0) + 1;
        return acc;
      }, {} as Record<IllustrationStyle, number>),
      bySource: illustrations.reduce((acc, i) => {
        acc[i.source] = (acc[i.source] || 0) + 1;
        return acc;
      }, {} as Record<IllustrationSource, number>),
      favorites: illustrations.filter((i) => i.isFavorite).length,
      autismFriendly: illustrations.filter((i) => i.autismFriendly).length,
      averageRating:
        illustrations.filter((i) => i.rating).reduce((sum, i) => sum + (i.rating || 0), 0) /
          illustrations.filter((i) => i.rating).length || 0,
      mostUsed: illustrations.reduce(
        (max, i) => (i.usageCount > max.usageCount ? i : max),
        illustrations[0]
      ),
    };
  }, [illustrations]);

  return {
    // State
    illustrations: getFilteredIllustrations(),
    selectedIllustration,
    filter,
    palettes,
    isGenerating,
    generationProgress,
    settings,

    // Actions
    selectIllustration,
    generateIllustration,
    uploadIllustration,
    deleteIllustration,
    toggleFavorite,
    rateIllustration,
    setFilter,
    createPalette,
    getStatistics,
  };
};

// Main component
const IllustrationsSystem: React.FC<IllustrationSystemProps> = (props) => {
  const {
    illustrations,
    palettes,
    isGenerating,
    generationProgress,
    selectIllustration,
    generateIllustration,
    uploadIllustration,
    toggleFavorite,
    setFilter,
    getStatistics,
  } = useIllustrationsSystem(props);

  const [showGenerator, setShowGenerator] = useState(false);
  const [showUpload, setShowUpload] = useState(false);
  const [generationRequest, setGenerationRequest] = useState<Partial<IllustrationRequest>>({
    type: 'scene',
    style: 'cartoon',
    prompt: '',
  });

  const stats = getStatistics();

  const handleGenerate = async () => {
    if (!generationRequest.prompt) return;

    await generateIllustration(generationRequest as IllustrationRequest);
    setShowGenerator(false);
    setGenerationRequest({ type: 'scene', style: 'cartoon', prompt: '' });
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    await uploadIllustration(file, {
      title: file.name.split('.')[0],
      type: 'scene',
      style: 'digital',
      tags: ['uploaded'],
    });
    setShowUpload(false);
  };

  return (
    <div style={{ padding: '20px', maxWidth: '1400px', margin: '0 auto' }}>
      {/* Header */}
      <div style={{ marginBottom: '30px' }}>
        <h1 style={{ margin: '0 0 10px 0', fontSize: '32px' }}>🎨 Illustrations Library</h1>
        <p style={{ color: '#666', margin: 0 }}>
          Manage and create beautiful illustrations for your stories
        </p>
      </div>

      {/* Statistics */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))',
          gap: '15px',
          marginBottom: '30px',
        }}
      >
        <div
          style={{
            padding: '20px',
            backgroundColor: 'white',
            borderRadius: '12px',
            border: '2px solid #e0e0e0',
            textAlign: 'center',
          }}
        >
          <div style={{ fontSize: '32px', fontWeight: 'bold', color: '#4CAF50' }}>
            {stats.totalIllustrations}
          </div>
          <div style={{ fontSize: '12px', color: '#666' }}>Total</div>
        </div>
        <div
          style={{
            padding: '20px',
            backgroundColor: 'white',
            borderRadius: '12px',
            border: '2px solid #e0e0e0',
            textAlign: 'center',
          }}
        >
          <div style={{ fontSize: '32px', fontWeight: 'bold', color: '#FF9800' }}>
            {stats.favorites}
          </div>
          <div style={{ fontSize: '12px', color: '#666' }}>Favorites</div>
        </div>
        <div
          style={{
            padding: '20px',
            backgroundColor: 'white',
            borderRadius: '12px',
            border: '2px solid #e0e0e0',
            textAlign: 'center',
          }}
        >
          <div style={{ fontSize: '32px', fontWeight: 'bold', color: '#2196F3' }}>
            {stats.averageRating.toFixed(1)}⭐
          </div>
          <div style={{ fontSize: '12px', color: '#666' }}>Avg Rating</div>
        </div>
      </div>

      {/* Actions */}
      <div style={{ display: 'flex', gap: '10px', marginBottom: '20px', flexWrap: 'wrap' }}>
        <button
          onClick={() => setShowGenerator(true)}
          style={{
            padding: '12px 24px',
            backgroundColor: '#4CAF50',
            color: 'white',
            border: 'none',
            borderRadius: '8px',
            cursor: 'pointer',
            fontSize: '14px',
            fontWeight: 'bold',
          }}
        >
          ✨ Generate with AI
        </button>
        <button
          onClick={() => setShowUpload(true)}
          style={{
            padding: '12px 24px',
            backgroundColor: '#2196F3',
            color: 'white',
            border: 'none',
            borderRadius: '8px',
            cursor: 'pointer',
            fontSize: '14px',
            fontWeight: 'bold',
          }}
        >
          📤 Upload
        </button>
        <input
          type="text"
          placeholder="Search illustrations..."
          onChange={(e) => setFilter({ searchQuery: e.target.value })}
          style={{
            padding: '12px',
            border: '2px solid #ddd',
            borderRadius: '8px',
            flex: 1,
            minWidth: '200px',
          }}
        />
      </div>

      {/* Color Palettes */}
      <div style={{ marginBottom: '30px' }}>
        <h3 style={{ marginBottom: '15px' }}>Color Palettes</h3>
        <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
          {palettes.map((palette) => (
            <motion.div
              key={palette.id}
              whileHover={{ scale: 1.05 }}
              style={{
                padding: '15px',
                backgroundColor: 'white',
                borderRadius: '12px',
                border: '2px solid #e0e0e0',
                cursor: 'pointer',
                minWidth: '150px',
              }}
              onClick={() => setFilter({ paletteId: palette.id })}
            >
              <div style={{ fontWeight: 'bold', marginBottom: '8px' }}>{palette.name}</div>
              <div style={{ display: 'flex', gap: '4px' }}>
                {palette.colors.slice(0, 5).map((color, i) => (
                  <div
                    key={i}
                    style={{
                      width: '24px',
                      height: '24px',
                      backgroundColor: color,
                      borderRadius: '4px',
                      border: '1px solid #ddd',
                    }}
                  />
                ))}
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Illustrations Grid */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))',
          gap: '20px',
        }}
      >
        {illustrations.map((illustration) => (
          <motion.div
            key={illustration.id}
            whileHover={{ scale: 1.02 }}
            onClick={() => selectIllustration(illustration.id)}
            style={{
              backgroundColor: 'white',
              borderRadius: '12px',
              overflow: 'hidden',
              border: '2px solid #e0e0e0',
              cursor: 'pointer',
            }}
          >
            <div
              style={{
                width: '100%',
                height: '200px',
                backgroundColor: '#f5f5f5',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                overflow: 'hidden',
              }}
            >
              <img
                src={illustration.thumbnailUrl || illustration.imageUrl}
                alt={illustration.title}
                style={{
                  width: '100%',
                  height: '100%',
                  objectFit: 'cover',
                }}
              />
            </div>
            <div style={{ padding: '15px' }}>
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'start',
                  marginBottom: '8px',
                }}
              >
                <h4 style={{ margin: 0, fontSize: '16px' }}>{illustration.title}</h4>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    toggleFavorite(illustration.id);
                  }}
                  style={{
                    background: 'none',
                    border: 'none',
                    cursor: 'pointer',
                    fontSize: '20px',
                  }}
                >
                  {illustration.isFavorite ? '❤️' : '🤍'}
                </button>
              </div>
              <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                <span
                  style={{
                    padding: '4px 8px',
                    backgroundColor: '#E3F2FD',
                    borderRadius: '4px',
                    fontSize: '11px',
                  }}
                >
                  {illustration.type}
                </span>
                <span
                  style={{
                    padding: '4px 8px',
                    backgroundColor: '#F3E5F5',
                    borderRadius: '4px',
                    fontSize: '11px',
                  }}
                >
                  {illustration.style}
                </span>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Generation Modal */}
      <AnimatePresence>
        {showGenerator && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            style={{
              position: 'fixed',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              backgroundColor: 'rgba(0,0,0,0.5)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              zIndex: 1000,
            }}
            onClick={() => setShowGenerator(false)}
          >
            <motion.div
              initial={{ scale: 0.9 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.9 }}
              onClick={(e) => e.stopPropagation()}
              style={{
                backgroundColor: 'white',
                borderRadius: '16px',
                padding: '30px',
                maxWidth: '500px',
                width: '90%',
              }}
            >
              <h2 style={{ marginTop: 0 }}>✨ Generate Illustration</h2>

              <div style={{ marginBottom: '15px' }}>
                <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>
                  Type
                </label>
                <select
                  value={generationRequest.type}
                  onChange={(e) =>
                    setGenerationRequest({
                      ...generationRequest,
                      type: e.target.value as IllustrationType,
                    })
                  }
                  style={{
                    width: '100%',
                    padding: '10px',
                    border: '2px solid #ddd',
                    borderRadius: '8px',
                  }}
                >
                  <option value="scene">Scene</option>
                  <option value="character">Character</option>
                  <option value="background">Background</option>
                  <option value="object">Object</option>
                  <option value="action">Action</option>
                </select>
              </div>

              <div style={{ marginBottom: '15px' }}>
                <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>
                  Style
                </label>
                <select
                  value={generationRequest.style}
                  onChange={(e) =>
                    setGenerationRequest({
                      ...generationRequest,
                      style: e.target.value as IllustrationStyle,
                    })
                  }
                  style={{
                    width: '100%',
                    padding: '10px',
                    border: '2px solid #ddd',
                    borderRadius: '8px',
                  }}
                >
                  <option value="cartoon">Cartoon</option>
                  <option value="realistic">Realistic</option>
                  <option value="minimalist">Minimalist</option>
                  <option value="watercolor">Watercolor</option>
                  <option value="line-art">Line Art</option>
                </select>
              </div>

              <div style={{ marginBottom: '20px' }}>
                <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>
                  Description
                </label>
                <textarea
                  value={generationRequest.prompt}
                  onChange={(e) =>
                    setGenerationRequest({ ...generationRequest, prompt: e.target.value })
                  }
                  placeholder="Describe what you want to see..."
                  rows={4}
                  style={{
                    width: '100%',
                    padding: '10px',
                    border: '2px solid #ddd',
                    borderRadius: '8px',
                    resize: 'vertical',
                  }}
                />
              </div>

              {isGenerating && (
                <div style={{ marginBottom: '15px' }}>
                  <div style={{ marginBottom: '5px' }}>Generating... {generationProgress}%</div>
                  <div
                    style={{
                      height: '8px',
                      backgroundColor: '#e0e0e0',
                      borderRadius: '4px',
                      overflow: 'hidden',
                    }}
                  >
                    <div
                      style={{
                        height: '100%',
                        backgroundColor: '#4CAF50',
                        width: `${generationProgress}%`,
                        transition: 'width 0.3s',
                      }}
                    />
                  </div>
                </div>
              )}

              <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
                <button
                  onClick={() => setShowGenerator(false)}
                  style={{
                    padding: '10px 20px',
                    border: '2px solid #ddd',
                    borderRadius: '8px',
                    backgroundColor: 'white',
                    cursor: 'pointer',
                  }}
                >
                  Cancel
                </button>
                <button
                  onClick={handleGenerate}
                  disabled={!generationRequest.prompt || isGenerating}
                  style={{
                    padding: '10px 20px',
                    border: 'none',
                    borderRadius: '8px',
                    backgroundColor: '#4CAF50',
                    color: 'white',
                    cursor: generationRequest.prompt && !isGenerating ? 'pointer' : 'not-allowed',
                    opacity: generationRequest.prompt && !isGenerating ? 1 : 0.5,
                  }}
                >
                  Generate
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Upload Modal */}
      <AnimatePresence>
        {showUpload && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            style={{
              position: 'fixed',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              backgroundColor: 'rgba(0,0,0,0.5)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              zIndex: 1000,
            }}
            onClick={() => setShowUpload(false)}
          >
            <motion.div
              initial={{ scale: 0.9 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.9 }}
              onClick={(e) => e.stopPropagation()}
              style={{
                backgroundColor: 'white',
                borderRadius: '16px',
                padding: '30px',
                maxWidth: '500px',
                width: '90%',
                textAlign: 'center',
              }}
            >
              <h2 style={{ marginTop: 0 }}>📤 Upload Illustration</h2>
              <input
                type="file"
                accept="image/*"
                onChange={handleFileUpload}
                style={{ marginBottom: '20px' }}
              />
              <div style={{ fontSize: '14px', color: '#666' }}>
                Supported formats: JPG, PNG, WebP, SVG
                <br />
                Max size: 5MB
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default IllustrationsSystem;
