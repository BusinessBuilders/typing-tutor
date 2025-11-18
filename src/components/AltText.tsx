import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

// ============================================================================
// Types & Interfaces
// ============================================================================

export type ImageType = 'informative' | 'decorative' | 'functional' | 'complex' | 'text';

export type AltTextQuality = 'excellent' | 'good' | 'fair' | 'poor' | 'missing';

export interface ImageAltText {
  id: string;
  src: string;
  alt: string;
  longDescription?: string;
  type: ImageType;
  context: string;
  quality: AltTextQuality;
  issues: string[];
  suggestions: string[];
  wcagLevel: 'A' | 'AA' | 'AAA' | 'fail';
}

export interface AltTextGuidelines {
  type: ImageType;
  name: string;
  description: string;
  guidelines: string[];
  examples: {
    good: string[];
    bad: string[];
  };
  wcagCriteria: string;
}

export interface AltTextSettings {
  enabled: boolean;
  autoGenerate: boolean;
  validateOnChange: boolean;
  showSuggestions: boolean;
  enforceMaxLength: boolean;
  maxLength: number;
  requireAltForImages: boolean;
  allowEmptyForDecorative: boolean;
  checkForRedundancy: boolean;
  checkForFileNames: boolean;
}

export interface AltTextStats {
  totalImages: number;
  withAlt: number;
  withoutAlt: number;
  decorative: number;
  averageLength: number;
  qualityDistribution: Record<AltTextQuality, number>;
  issueCount: number;
}

// ============================================================================
// Mock Data Generators
// ============================================================================

const generateMockImages = (): ImageAltText[] => {
  const mockImages: ImageAltText[] = [
    {
      id: 'img-1',
      src: '/images/profile.jpg',
      alt: 'User profile picture showing a smiling person',
      type: 'informative',
      context: 'User profile section',
      quality: 'excellent',
      issues: [],
      suggestions: [],
      wcagLevel: 'AAA',
    },
    {
      id: 'img-2',
      src: '/images/decoration.svg',
      alt: '',
      type: 'decorative',
      context: 'Background decoration',
      quality: 'excellent',
      issues: [],
      suggestions: ['Consider using aria-hidden="true" for decorative images'],
      wcagLevel: 'AAA',
    },
    {
      id: 'img-3',
      src: '/images/button.png',
      alt: 'image123.png',
      type: 'functional',
      context: 'Navigation button',
      quality: 'poor',
      issues: [
        'Alt text appears to be filename',
        'Does not describe function',
        'Too short to be meaningful',
      ],
      suggestions: [
        'Describe the action the button performs',
        'Example: "Navigate to home page"',
      ],
      wcagLevel: 'fail',
    },
    {
      id: 'img-4',
      src: '/images/chart.png',
      alt: 'Chart showing typing speed progress over time with data points from January to December',
      longDescription:
        'Line chart displaying typing speed improvement from 30 WPM in January to 65 WPM in December, with steady progress throughout the year.',
      type: 'complex',
      context: 'Progress statistics',
      quality: 'excellent',
      issues: [],
      suggestions: ['Long description provided for complex image'],
      wcagLevel: 'AAA',
    },
    {
      id: 'img-5',
      src: '/images/logo.svg',
      alt: 'Click here',
      type: 'functional',
      context: 'Logo link',
      quality: 'poor',
      issues: ['Generic alt text', 'Does not identify organization'],
      suggestions: ['Example: "Autism Typing Tutor - Home"'],
      wcagLevel: 'fail',
    },
    {
      id: 'img-6',
      src: '/images/badge.png',
      alt: '',
      type: 'informative',
      context: 'Achievement display',
      quality: 'missing',
      issues: ['Missing alt text', 'Informative image requires description'],
      suggestions: ['Example: "Speed Master badge - Achieved 60 WPM"'],
      wcagLevel: 'fail',
    },
  ];

  return mockImages;
};

const altTextGuidelines: AltTextGuidelines[] = [
  {
    type: 'informative',
    name: 'Informative Images',
    description:
      'Images that convey information or contribute to page content. Alt text should describe the content.',
    guidelines: [
      'Describe the content of the image concisely',
      'Include relevant information visible in the image',
      'Keep it brief but meaningful (typically under 125 characters)',
      'Don\'t start with "Image of" or "Picture of"',
      'Focus on what\'s important in context',
    ],
    examples: {
      good: [
        'Student typing on keyboard with focused expression',
        'Progress chart showing 50% improvement over 3 months',
        'Green checkmark indicating completed lesson',
      ],
      bad: [
        'image.jpg',
        'Picture of a person',
        'Click here to see more',
        '',
      ],
    },
    wcagCriteria: 'WCAG 2.1 Level A - 1.1.1 Non-text Content',
  },
  {
    type: 'decorative',
    name: 'Decorative Images',
    description:
      'Images used for visual decoration that don\'t convey important content. Use empty alt text.',
    guidelines: [
      'Use empty alt attribute (alt="")',
      'Add aria-hidden="true" for clarity',
      'Should not convey important information',
      'Only for visual enhancement',
      'If removed, page content should remain complete',
    ],
    examples: {
      good: ['', '(with aria-hidden="true")'],
      bad: ['Decorative image', 'Decoration', 'N/A', '(missing alt attribute)'],
    },
    wcagCriteria: 'WCAG 2.1 Level A - 1.1.1 Non-text Content',
  },
  {
    type: 'functional',
    name: 'Functional Images',
    description:
      'Images used as links or buttons. Alt text should describe the action or destination.',
    guidelines: [
      'Describe the function or destination, not the image',
      'Be clear about what happens when clicked',
      'Keep it concise and action-oriented',
      'Don\'t duplicate adjacent link text',
      'Example: "Home" not "Home icon"',
    ],
    examples: {
      good: [
        'Home',
        'Print this page',
        'Submit form',
        'Next lesson',
      ],
      bad: [
        'Button image',
        'Click here',
        'Icon',
        'button.png',
      ],
    },
    wcagCriteria: 'WCAG 2.1 Level A - 1.1.1 Non-text Content',
  },
  {
    type: 'complex',
    name: 'Complex Images',
    description:
      'Charts, diagrams, or images with detailed information. Requires short and long descriptions.',
    guidelines: [
      'Provide short alt text summarizing the image',
      'Include long description for details',
      'Use aria-describedby or longdesc for extended description',
      'Consider providing data table alternative',
      'Ensure all information is available in text',
    ],
    examples: {
      good: [
        'Bar chart comparing typing speeds across age groups (detailed description below)',
        'Organizational hierarchy diagram (text version available)',
        'Process flowchart for lesson completion (see text description)',
      ],
      bad: [
        'Chart',
        'Complicated diagram',
        'See image for details',
      ],
    },
    wcagCriteria: 'WCAG 2.1 Level A - 1.1.1 Non-text Content',
  },
  {
    type: 'text',
    name: 'Images of Text',
    description:
      'Images containing text. Alt text should include the text from the image.',
    guidelines: [
      'Include all text visible in the image',
      'Maintain text order and structure',
      'Avoid images of text when possible',
      'Use real text with CSS styling instead',
      'Only use for logos or essential design',
    ],
    examples: {
      good: [
        'Autism Typing Tutor',
        'Welcome to your personalized learning journey',
        'Level 5 Complete!',
      ],
      bad: [
        'Text image',
        'Logo',
        'Title',
      ],
    },
    wcagCriteria: 'WCAG 2.1 Level AA - 1.4.5 Images of Text',
  },
];

// ============================================================================
// Validation Functions
// ============================================================================

const validateAltText = (
  alt: string,
  type: ImageType,
  src: string,
  settings: AltTextSettings
): { quality: AltTextQuality; issues: string[]; suggestions: string[]; wcagLevel: 'A' | 'AA' | 'AAA' | 'fail' } => {
  const issues: string[] = [];
  const suggestions: string[] = [];
  let quality: AltTextQuality = 'excellent';
  let wcagLevel: 'A' | 'AA' | 'AAA' | 'fail' = 'AAA';

  // Check for missing alt text
  if (alt === undefined || alt === null) {
    issues.push('Missing alt attribute');
    quality = 'missing';
    wcagLevel = 'fail';
    suggestions.push('Add alt attribute to image');
    return { quality, issues, suggestions, wcagLevel };
  }

  // Decorative images
  if (type === 'decorative') {
    if (alt === '') {
      quality = 'excellent';
      wcagLevel = 'AAA';
      suggestions.push('Consider adding aria-hidden="true" for decorative images');
    } else {
      issues.push('Decorative images should have empty alt text');
      quality = 'fair';
      wcagLevel = 'AA';
      suggestions.push('Use alt="" for decorative images');
    }
    return { quality, issues, suggestions, wcagLevel };
  }

  // Non-decorative images should not have empty alt
  if (alt === '') {
    issues.push('Missing alt text for non-decorative image');
    quality = 'missing';
    wcagLevel = 'fail';
    suggestions.push('Provide descriptive alt text');
    return { quality, issues, suggestions, wcagLevel };
  }

  // Check for filename in alt text
  if (settings.checkForFileNames) {
    const filename = src.split('/').pop()?.toLowerCase() || '';
    const altLower = alt.toLowerCase();
    if (
      altLower.includes('.jpg') ||
      altLower.includes('.png') ||
      altLower.includes('.gif') ||
      altLower.includes('.svg') ||
      altLower === filename.replace(/\.[^.]+$/, '')
    ) {
      issues.push('Alt text appears to be filename');
      quality = 'poor';
      wcagLevel = 'fail';
      suggestions.push('Replace filename with descriptive text');
    }
  }

  // Check for redundant phrases
  if (settings.checkForRedundancy) {
    const redundantPhrases = [
      'image of',
      'picture of',
      'photo of',
      'graphic of',
      'icon of',
      'click here',
      'click for',
    ];
    const altLower = alt.toLowerCase();
    redundantPhrases.forEach((phrase) => {
      if (altLower.includes(phrase)) {
        issues.push(`Contains redundant phrase: "${phrase}"`);
        if (quality === 'excellent') quality = 'good';
        if (wcagLevel === 'AAA') wcagLevel = 'AA';
        suggestions.push(`Remove "${phrase}" and start with description`);
      }
    });
  }

  // Check length
  if (alt.length < 5) {
    issues.push('Alt text too short to be meaningful');
    quality = 'poor';
    wcagLevel = 'fail';
    suggestions.push('Provide more descriptive alt text (at least 5 characters)');
  }

  if (settings.enforceMaxLength && alt.length > settings.maxLength) {
    issues.push(`Alt text exceeds maximum length (${settings.maxLength} characters)`);
    if (quality === 'excellent') quality = 'good';
    suggestions.push('Consider using long description for detailed content');
  }

  // Check for generic text
  const genericTexts = ['image', 'picture', 'photo', 'graphic', 'icon', 'click here', 'untitled'];
  const altLower = alt.toLowerCase().trim();
  if (genericTexts.includes(altLower)) {
    issues.push('Generic alt text does not describe content');
    quality = 'poor';
    wcagLevel = 'fail';
    suggestions.push('Describe what the image shows or its function');
  }

  // Adjust quality based on issues
  if (issues.length === 0) {
    quality = 'excellent';
    wcagLevel = 'AAA';
  } else if (issues.length === 1 && quality !== 'poor') {
    quality = 'good';
    wcagLevel = 'AA';
  } else if (issues.length === 2 && quality !== 'poor') {
    quality = 'fair';
    wcagLevel = 'A';
  }

  return { quality, issues, suggestions, wcagLevel };
};

// ============================================================================
// Custom Hook
// ============================================================================

export const useAltText = (initialSettings?: Partial<AltTextSettings>) => {
  const [settings, setSettings] = useState<AltTextSettings>({
    enabled: true,
    autoGenerate: false,
    validateOnChange: true,
    showSuggestions: true,
    enforceMaxLength: true,
    maxLength: 125,
    requireAltForImages: true,
    allowEmptyForDecorative: true,
    checkForRedundancy: true,
    checkForFileNames: true,
    ...initialSettings,
  });

  const [images, setImages] = useState<ImageAltText[]>(generateMockImages());
  const [stats, setStats] = useState<AltTextStats>({
    totalImages: 0,
    withAlt: 0,
    withoutAlt: 0,
    decorative: 0,
    averageLength: 0,
    qualityDistribution: {
      excellent: 0,
      good: 0,
      fair: 0,
      poor: 0,
      missing: 0,
    },
    issueCount: 0,
  });

  // Update image alt text
  const updateImageAlt = useCallback(
    (id: string, alt: string, longDescription?: string) => {
      setImages((prev) =>
        prev.map((img) => {
          if (img.id !== id) return img;

          const validation = validateAltText(alt, img.type, img.src, settings);

          return {
            ...img,
            alt,
            longDescription,
            quality: validation.quality,
            issues: validation.issues,
            suggestions: validation.suggestions,
            wcagLevel: validation.wcagLevel,
          };
        })
      );
    },
    [settings]
  );

  // Add new image
  const addImage = useCallback(
    (src: string, alt: string, type: ImageType, context: string) => {
      const validation = validateAltText(alt, type, src, settings);

      const newImage: ImageAltText = {
        id: `img-${Date.now()}-${Math.random()}`,
        src,
        alt,
        type,
        context,
        quality: validation.quality,
        issues: validation.issues,
        suggestions: validation.suggestions,
        wcagLevel: validation.wcagLevel,
      };

      setImages((prev) => [...prev, newImage]);
    },
    [settings]
  );

  // Remove image
  const removeImage = useCallback((id: string) => {
    setImages((prev) => prev.filter((img) => img.id !== id));
  }, []);

  // Update settings
  const updateSettings = useCallback((updates: Partial<AltTextSettings>) => {
    setSettings((prev) => ({ ...prev, ...updates }));
  }, []);

  // Revalidate all images
  const revalidateAll = useCallback(() => {
    setImages((prev) =>
      prev.map((img) => {
        const validation = validateAltText(img.alt, img.type, img.src, settings);
        return {
          ...img,
          quality: validation.quality,
          issues: validation.issues,
          suggestions: validation.suggestions,
          wcagLevel: validation.wcagLevel,
        };
      })
    );
  }, [settings]);

  // Calculate stats
  useEffect(() => {
    const totalImages = images.length;
    const withAlt = images.filter((img) => img.alt && img.alt.length > 0).length;
    const withoutAlt = totalImages - withAlt;
    const decorative = images.filter((img) => img.type === 'decorative').length;

    const totalLength = images.reduce((sum, img) => sum + (img.alt?.length || 0), 0);
    const averageLength = totalImages > 0 ? Math.round(totalLength / totalImages) : 0;

    const qualityDistribution: Record<AltTextQuality, number> = {
      excellent: images.filter((img) => img.quality === 'excellent').length,
      good: images.filter((img) => img.quality === 'good').length,
      fair: images.filter((img) => img.quality === 'fair').length,
      poor: images.filter((img) => img.quality === 'poor').length,
      missing: images.filter((img) => img.quality === 'missing').length,
    };

    const issueCount = images.reduce((sum, img) => sum + img.issues.length, 0);

    setStats({
      totalImages,
      withAlt,
      withoutAlt,
      decorative,
      averageLength,
      qualityDistribution,
      issueCount,
    });
  }, [images]);

  return {
    settings,
    images,
    stats,
    guidelines: altTextGuidelines,
    updateImageAlt,
    addImage,
    removeImage,
    updateSettings,
    revalidateAll,
  };
};

// ============================================================================
// Component
// ============================================================================

export const AltText: React.FC = () => {
  const {
    settings,
    images,
    stats,
    guidelines,
    updateImageAlt,
    removeImage,
    updateSettings,
    revalidateAll,
  } = useAltText();

  const [activeTab, setActiveTab] = useState<'overview' | 'images' | 'guidelines' | 'test'>(
    'overview'
  );
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editAlt, setEditAlt] = useState('');
  const [editLongDesc, setEditLongDesc] = useState('');

  // Start editing
  const startEditing = (img: ImageAltText) => {
    setEditingId(img.id);
    setEditAlt(img.alt);
    setEditLongDesc(img.longDescription || '');
  };

  // Save edit
  const saveEdit = (id: string) => {
    updateImageAlt(id, editAlt, editLongDesc);
    setEditingId(null);
  };

  // Cancel edit
  const cancelEdit = () => {
    setEditingId(null);
    setEditAlt('');
    setEditLongDesc('');
  };

  // Get quality color
  const getQualityColor = (quality: AltTextQuality): string => {
    switch (quality) {
      case 'excellent':
        return '#10b981';
      case 'good':
        return '#3b82f6';
      case 'fair':
        return '#f59e0b';
      case 'poor':
        return '#ef4444';
      case 'missing':
        return '#dc2626';
      default:
        return '#9ca3af';
    }
  };

  return (
    <div style={{ padding: '2rem', maxWidth: '1400px', margin: '0 auto' }}>
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        style={{ marginBottom: '2rem' }}
      >
        <h1 style={{ margin: 0, marginBottom: '0.5rem', fontSize: '2rem' }}>
          Alternative Text (Alt Text)
        </h1>
        <p style={{ margin: 0, color: '#666', fontSize: '1rem' }}>
          Manage and validate alternative text for images to ensure screen reader accessibility
        </p>
      </motion.div>

      {/* Settings */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        style={{
          background: 'white',
          padding: '1.5rem',
          borderRadius: '12px',
          marginBottom: '2rem',
          boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
        }}
      >
        <h2 style={{ margin: 0, marginBottom: '1rem', fontSize: '1.25rem' }}>Settings</h2>

        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
            gap: '1rem',
          }}
        >
          <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <input
              type="checkbox"
              checked={settings.enabled}
              onChange={(e) => updateSettings({ enabled: e.target.checked })}
            />
            <span>Enable Alt Text Validation</span>
          </label>

          <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <input
              type="checkbox"
              checked={settings.validateOnChange}
              onChange={(e) => updateSettings({ validateOnChange: e.target.checked })}
              disabled={!settings.enabled}
            />
            <span>Validate on Change</span>
          </label>

          <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <input
              type="checkbox"
              checked={settings.showSuggestions}
              onChange={(e) => updateSettings({ showSuggestions: e.target.checked })}
              disabled={!settings.enabled}
            />
            <span>Show Suggestions</span>
          </label>

          <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <input
              type="checkbox"
              checked={settings.checkForRedundancy}
              onChange={(e) => updateSettings({ checkForRedundancy: e.target.checked })}
              disabled={!settings.enabled}
            />
            <span>Check for Redundant Phrases</span>
          </label>

          <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <input
              type="checkbox"
              checked={settings.checkForFileNames}
              onChange={(e) => updateSettings({ checkForFileNames: e.target.checked })}
              disabled={!settings.enabled}
            />
            <span>Check for Filenames</span>
          </label>

          <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <input
              type="checkbox"
              checked={settings.enforceMaxLength}
              onChange={(e) => updateSettings({ enforceMaxLength: e.target.checked })}
              disabled={!settings.enabled}
            />
            <span>Enforce Maximum Length</span>
          </label>
        </div>

        <div style={{ marginTop: '1rem', display: 'flex', gap: '1rem', alignItems: 'center' }}>
          <label style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', flex: 1 }}>
            <span>Maximum Alt Text Length</span>
            <input
              type="number"
              value={settings.maxLength}
              onChange={(e) => updateSettings({ maxLength: parseInt(e.target.value) })}
              disabled={!settings.enabled || !settings.enforceMaxLength}
              min={50}
              max={500}
              style={{
                padding: '0.5rem',
                borderRadius: '6px',
                border: '1px solid #ddd',
                fontSize: '1rem',
              }}
            />
          </label>

          <button
            onClick={revalidateAll}
            disabled={!settings.enabled}
            style={{
              padding: '0.5rem 1rem',
              background: settings.enabled ? '#3b82f6' : '#e5e7eb',
              color: settings.enabled ? 'white' : '#9ca3af',
              border: 'none',
              borderRadius: '6px',
              cursor: settings.enabled ? 'pointer' : 'not-allowed',
              marginTop: '1.5rem',
            }}
          >
            Revalidate All
          </button>
        </div>
      </motion.div>

      {/* Stats */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
          gap: '1rem',
          marginBottom: '2rem',
        }}
      >
        <div
          style={{
            background: 'white',
            padding: '1.5rem',
            borderRadius: '12px',
            boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
          }}
        >
          <div style={{ fontSize: '0.875rem', color: '#666', marginBottom: '0.5rem' }}>
            Total Images
          </div>
          <div style={{ fontSize: '2rem', fontWeight: 'bold', color: '#3b82f6' }}>
            {stats.totalImages}
          </div>
        </div>

        <div
          style={{
            background: 'white',
            padding: '1.5rem',
            borderRadius: '12px',
            boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
          }}
        >
          <div style={{ fontSize: '0.875rem', color: '#666', marginBottom: '0.5rem' }}>
            With Alt Text
          </div>
          <div style={{ fontSize: '2rem', fontWeight: 'bold', color: '#10b981' }}>
            {stats.withAlt}
          </div>
        </div>

        <div
          style={{
            background: 'white',
            padding: '1.5rem',
            borderRadius: '12px',
            boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
          }}
        >
          <div style={{ fontSize: '0.875rem', color: '#666', marginBottom: '0.5rem' }}>
            Missing Alt
          </div>
          <div style={{ fontSize: '2rem', fontWeight: 'bold', color: '#ef4444' }}>
            {stats.withoutAlt}
          </div>
        </div>

        <div
          style={{
            background: 'white',
            padding: '1.5rem',
            borderRadius: '12px',
            boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
          }}
        >
          <div style={{ fontSize: '0.875rem', color: '#666', marginBottom: '0.5rem' }}>
            Avg Length
          </div>
          <div style={{ fontSize: '2rem', fontWeight: 'bold', color: '#8b5cf6' }}>
            {stats.averageLength}
          </div>
        </div>

        <div
          style={{
            background: 'white',
            padding: '1.5rem',
            borderRadius: '12px',
            boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
          }}
        >
          <div style={{ fontSize: '0.875rem', color: '#666', marginBottom: '0.5rem' }}>
            Total Issues
          </div>
          <div style={{ fontSize: '2rem', fontWeight: 'bold', color: '#f59e0b' }}>
            {stats.issueCount}
          </div>
        </div>
      </motion.div>

      {/* Tabs */}
      <div
        style={{
          display: 'flex',
          gap: '0.5rem',
          marginBottom: '1rem',
          borderBottom: '2px solid #e5e7eb',
        }}
      >
        {[
          { id: 'overview', label: 'Overview' },
          { id: 'images', label: `Images (${images.length})` },
          { id: 'guidelines', label: 'Guidelines' },
          { id: 'test', label: 'Test' },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as typeof activeTab)}
            style={{
              padding: '0.75rem 1.5rem',
              background: activeTab === tab.id ? '#3b82f6' : 'transparent',
              color: activeTab === tab.id ? 'white' : '#666',
              border: 'none',
              borderRadius: '8px 8px 0 0',
              cursor: 'pointer',
              fontSize: '1rem',
              fontWeight: activeTab === tab.id ? 'bold' : 'normal',
              transition: 'all 0.2s',
            }}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      <AnimatePresence mode="wait">
        <motion.div
          key={activeTab}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          transition={{ duration: 0.2 }}
        >
          {activeTab === 'overview' && (
            <div
              style={{
                background: 'white',
                padding: '2rem',
                borderRadius: '12px',
                boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
              }}
            >
              <h2 style={{ margin: 0, marginBottom: '1rem' }}>Overview</h2>
              <p style={{ margin: 0, marginBottom: '1rem', lineHeight: 1.6 }}>
                Alternative text (alt text) is essential for screen reader accessibility. It
                provides text descriptions of images for users who cannot see them, ensuring equal
                access to visual content.
              </p>

              <h3 style={{ margin: '2rem 0 1rem 0' }}>Why Alt Text Matters</h3>
              <ul style={{ lineHeight: 1.8 }}>
                <li>Makes images accessible to screen reader users</li>
                <li>Improves SEO and search engine discoverability</li>
                <li>Provides context when images fail to load</li>
                <li>Required for WCAG 2.1 Level A compliance</li>
                <li>Enhances user experience for all visitors</li>
              </ul>

              <h3 style={{ margin: '2rem 0 1rem 0' }}>Quality Distribution</h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                {Object.entries(stats.qualityDistribution).map(([quality, count]) => (
                  <div
                    key={quality}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '1rem',
                    }}
                  >
                    <div
                      style={{
                        width: '100px',
                        textTransform: 'capitalize',
                        fontWeight: 'bold',
                      }}
                    >
                      {quality}
                    </div>
                    <div
                      style={{
                        flex: 1,
                        height: '24px',
                        background: '#f3f4f6',
                        borderRadius: '4px',
                        overflow: 'hidden',
                      }}
                    >
                      <div
                        style={{
                          width: `${stats.totalImages > 0 ? (count / stats.totalImages) * 100 : 0}%`,
                          height: '100%',
                          background: getQualityColor(quality as AltTextQuality),
                          transition: 'width 0.3s',
                        }}
                      />
                    </div>
                    <div style={{ width: '60px', textAlign: 'right' }}>
                      {count} ({stats.totalImages > 0 ? Math.round((count / stats.totalImages) * 100) : 0}%)
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'images' && (
            <div
              style={{
                background: 'white',
                padding: '2rem',
                borderRadius: '12px',
                boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
              }}
            >
              <h2 style={{ margin: 0, marginBottom: '1rem' }}>Images ({images.length})</h2>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                {images.map((img) => (
                  <div
                    key={img.id}
                    style={{
                      padding: '1.5rem',
                      background: '#f9fafb',
                      borderRadius: '8px',
                      border: `2px solid ${getQualityColor(img.quality)}`,
                    }}
                  >
                    {editingId === img.id ? (
                      // Edit mode
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                        <div>
                          <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold' }}>
                            Alt Text
                          </label>
                          <input
                            type="text"
                            value={editAlt}
                            onChange={(e) => setEditAlt(e.target.value)}
                            style={{
                              width: '100%',
                              padding: '0.5rem',
                              borderRadius: '6px',
                              border: '1px solid #ddd',
                              fontSize: '1rem',
                            }}
                          />
                          <div style={{ fontSize: '0.875rem', color: '#666', marginTop: '0.25rem' }}>
                            {editAlt.length} characters
                          </div>
                        </div>

                        {img.type === 'complex' && (
                          <div>
                            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold' }}>
                              Long Description (Optional)
                            </label>
                            <textarea
                              value={editLongDesc}
                              onChange={(e) => setEditLongDesc(e.target.value)}
                              rows={3}
                              style={{
                                width: '100%',
                                padding: '0.5rem',
                                borderRadius: '6px',
                                border: '1px solid #ddd',
                                fontSize: '1rem',
                                fontFamily: 'inherit',
                              }}
                            />
                          </div>
                        )}

                        <div style={{ display: 'flex', gap: '0.5rem' }}>
                          <button
                            onClick={() => saveEdit(img.id)}
                            style={{
                              padding: '0.5rem 1rem',
                              background: '#10b981',
                              color: 'white',
                              border: 'none',
                              borderRadius: '6px',
                              cursor: 'pointer',
                            }}
                          >
                            Save
                          </button>
                          <button
                            onClick={cancelEdit}
                            style={{
                              padding: '0.5rem 1rem',
                              background: '#6b7280',
                              color: 'white',
                              border: 'none',
                              borderRadius: '6px',
                              cursor: 'pointer',
                            }}
                          >
                            Cancel
                          </button>
                        </div>
                      </div>
                    ) : (
                      // View mode
                      <>
                        <div
                          style={{
                            display: 'flex',
                            justifyContent: 'space-between',
                            marginBottom: '1rem',
                            alignItems: 'start',
                          }}
                        >
                          <div style={{ flex: 1 }}>
                            <h3 style={{ margin: 0, marginBottom: '0.5rem', fontSize: '1.125rem' }}>
                              {img.src}
                            </h3>
                            <div style={{ fontSize: '0.875rem', color: '#666' }}>
                              Type: <strong>{img.type}</strong> | Context: {img.context}
                            </div>
                          </div>
                          <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                            <span
                              style={{
                                fontSize: '0.875rem',
                                padding: '0.25rem 0.75rem',
                                background: getQualityColor(img.quality),
                                color: 'white',
                                borderRadius: '4px',
                                textTransform: 'capitalize',
                              }}
                            >
                              {img.quality}
                            </span>
                            <span
                              style={{
                                fontSize: '0.875rem',
                                padding: '0.25rem 0.75rem',
                                background: img.wcagLevel === 'fail' ? '#dc2626' : '#10b981',
                                color: 'white',
                                borderRadius: '4px',
                              }}
                            >
                              WCAG {img.wcagLevel}
                            </span>
                          </div>
                        </div>

                        <div
                          style={{
                            padding: '1rem',
                            background: 'white',
                            borderRadius: '6px',
                            marginBottom: '1rem',
                          }}
                        >
                          <div style={{ fontSize: '0.875rem', color: '#666', marginBottom: '0.25rem' }}>
                            Alt Text:
                          </div>
                          <div style={{ fontSize: '1rem' }}>
                            {img.alt || <em style={{ color: '#dc2626' }}>(empty)</em>}
                          </div>
                          {img.alt && (
                            <div style={{ fontSize: '0.75rem', color: '#666', marginTop: '0.25rem' }}>
                              {img.alt.length} characters
                            </div>
                          )}
                        </div>

                        {img.longDescription && (
                          <div
                            style={{
                              padding: '1rem',
                              background: 'white',
                              borderRadius: '6px',
                              marginBottom: '1rem',
                            }}
                          >
                            <div style={{ fontSize: '0.875rem', color: '#666', marginBottom: '0.25rem' }}>
                              Long Description:
                            </div>
                            <div style={{ fontSize: '0.875rem' }}>{img.longDescription}</div>
                          </div>
                        )}

                        {img.issues.length > 0 && (
                          <div style={{ marginBottom: '1rem' }}>
                            <div
                              style={{
                                fontSize: '0.875rem',
                                fontWeight: 'bold',
                                color: '#dc2626',
                                marginBottom: '0.5rem',
                              }}
                            >
                              Issues:
                            </div>
                            <ul style={{ margin: 0, paddingLeft: '1.5rem' }}>
                              {img.issues.map((issue, i) => (
                                <li key={i} style={{ fontSize: '0.875rem', color: '#dc2626' }}>
                                  {issue}
                                </li>
                              ))}
                            </ul>
                          </div>
                        )}

                        {settings.showSuggestions && img.suggestions.length > 0 && (
                          <div style={{ marginBottom: '1rem' }}>
                            <div
                              style={{
                                fontSize: '0.875rem',
                                fontWeight: 'bold',
                                color: '#3b82f6',
                                marginBottom: '0.5rem',
                              }}
                            >
                              Suggestions:
                            </div>
                            <ul style={{ margin: 0, paddingLeft: '1.5rem' }}>
                              {img.suggestions.map((suggestion, i) => (
                                <li key={i} style={{ fontSize: '0.875rem', color: '#3b82f6' }}>
                                  {suggestion}
                                </li>
                              ))}
                            </ul>
                          </div>
                        )}

                        <div style={{ display: 'flex', gap: '0.5rem' }}>
                          <button
                            onClick={() => startEditing(img)}
                            style={{
                              padding: '0.5rem 1rem',
                              background: '#3b82f6',
                              color: 'white',
                              border: 'none',
                              borderRadius: '6px',
                              cursor: 'pointer',
                              fontSize: '0.875rem',
                            }}
                          >
                            Edit
                          </button>
                          <button
                            onClick={() => removeImage(img.id)}
                            style={{
                              padding: '0.5rem 1rem',
                              background: '#ef4444',
                              color: 'white',
                              border: 'none',
                              borderRadius: '6px',
                              cursor: 'pointer',
                              fontSize: '0.875rem',
                            }}
                          >
                            Remove
                          </button>
                        </div>
                      </>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'guidelines' && (
            <div
              style={{
                background: 'white',
                padding: '2rem',
                borderRadius: '12px',
                boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
              }}
            >
              <h2 style={{ margin: 0, marginBottom: '1rem' }}>Alt Text Guidelines</h2>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
                {guidelines.map((guideline) => (
                  <div
                    key={guideline.type}
                    style={{
                      padding: '1.5rem',
                      background: '#f9fafb',
                      borderRadius: '8px',
                      border: '1px solid #e5e7eb',
                    }}
                  >
                    <h3 style={{ margin: 0, marginBottom: '0.5rem', fontSize: '1.25rem' }}>
                      {guideline.name}
                    </h3>
                    <p style={{ margin: 0, marginBottom: '1rem', color: '#666' }}>
                      {guideline.description}
                    </p>

                    <div style={{ marginBottom: '1rem' }}>
                      <h4 style={{ margin: 0, marginBottom: '0.5rem', fontSize: '1rem' }}>
                        Guidelines:
                      </h4>
                      <ul style={{ margin: 0, paddingLeft: '1.5rem', lineHeight: 1.8 }}>
                        {guideline.guidelines.map((rule, i) => (
                          <li key={i} style={{ fontSize: '0.875rem' }}>
                            {rule}
                          </li>
                        ))}
                      </ul>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                      <div>
                        <h4
                          style={{
                            margin: 0,
                            marginBottom: '0.5rem',
                            fontSize: '0.875rem',
                            color: '#10b981',
                          }}
                        >
                          ✓ Good Examples:
                        </h4>
                        <ul style={{ margin: 0, paddingLeft: '1.5rem' }}>
                          {guideline.examples.good.map((example, i) => (
                            <li key={i} style={{ fontSize: '0.875rem', color: '#059669' }}>
                              {example}
                            </li>
                          ))}
                        </ul>
                      </div>

                      <div>
                        <h4
                          style={{
                            margin: 0,
                            marginBottom: '0.5rem',
                            fontSize: '0.875rem',
                            color: '#ef4444',
                          }}
                        >
                          ✗ Bad Examples:
                        </h4>
                        <ul style={{ margin: 0, paddingLeft: '1.5rem' }}>
                          {guideline.examples.bad.map((example, i) => (
                            <li key={i} style={{ fontSize: '0.875rem', color: '#dc2626' }}>
                              {example || '(empty)'}
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>

                    <div
                      style={{
                        marginTop: '1rem',
                        padding: '0.75rem',
                        background: '#eff6ff',
                        borderRadius: '6px',
                        fontSize: '0.875rem',
                      }}
                    >
                      <strong>WCAG:</strong> {guideline.wcagCriteria}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'test' && (
            <div
              style={{
                background: 'white',
                padding: '2rem',
                borderRadius: '12px',
                boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
              }}
            >
              <h2 style={{ margin: 0, marginBottom: '1rem' }}>Test Alt Text</h2>

              <p style={{ margin: 0, marginBottom: '1rem', color: '#666' }}>
                Use the Images tab to edit and test alt text validation. The system will
                automatically check for common issues and provide suggestions for improvement.
              </p>

              <div
                style={{
                  padding: '1.5rem',
                  background: '#f9fafb',
                  borderRadius: '8px',
                  border: '1px solid #e5e7eb',
                }}
              >
                <h3 style={{ margin: 0, marginBottom: '1rem' }}>Quick Test</h3>
                <p style={{ margin: 0, marginBottom: '1rem', fontSize: '0.875rem', color: '#666' }}>
                  Common issues to test:
                </p>
                <ul style={{ margin: 0, paddingLeft: '1.5rem', lineHeight: 1.8 }}>
                  <li>Missing alt text (empty string)</li>
                  <li>Filename as alt text (e.g., "image123.png")</li>
                  <li>Redundant phrases (e.g., "Image of...")</li>
                  <li>Generic text (e.g., "Click here")</li>
                  <li>Alt text too short (&lt; 5 characters)</li>
                  <li>Alt text too long (&gt; {settings.maxLength} characters)</li>
                </ul>
              </div>
            </div>
          )}
        </motion.div>
      </AnimatePresence>
    </div>
  );
};

export default AltText;
