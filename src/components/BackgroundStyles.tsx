/**
 * Background Styles Component
 * Step 138 - Customizable background options for visual comfort
 */

import { motion } from 'framer-motion';
import { useState } from 'react';
import { useSettingsStore } from '../store/useSettingsStore';

export interface BackgroundStyle {
  id: string;
  name: string;
  type: 'solid' | 'gradient' | 'pattern' | 'texture';
  preview: string;
  css: React.CSSProperties;
}

// Solid background options
export const SOLID_BACKGROUNDS: BackgroundStyle[] = [
  {
    id: 'white',
    name: 'White',
    type: 'solid',
    preview: '#ffffff',
    css: { backgroundColor: '#ffffff' },
  },
  {
    id: 'cream',
    name: 'Cream',
    type: 'solid',
    preview: '#fefce8',
    css: { backgroundColor: '#fefce8' },
  },
  {
    id: 'light-gray',
    name: 'Light Gray',
    type: 'solid',
    preview: '#f9fafb',
    css: { backgroundColor: '#f9fafb' },
  },
  {
    id: 'blue-tint',
    name: 'Blue Tint',
    type: 'solid',
    preview: '#eff6ff',
    css: { backgroundColor: '#eff6ff' },
  },
  {
    id: 'green-tint',
    name: 'Green Tint',
    type: 'solid',
    preview: '#f0fdf4',
    css: { backgroundColor: '#f0fdf4' },
  },
  {
    id: 'sepia',
    name: 'Sepia',
    type: 'solid',
    preview: '#f4ecd8',
    css: { backgroundColor: '#f4ecd8' },
  },
];

// Gradient backgrounds
export const GRADIENT_BACKGROUNDS: BackgroundStyle[] = [
  {
    id: 'soft-blue',
    name: 'Soft Blue',
    type: 'gradient',
    preview: 'linear-gradient(to bottom right, #dbeafe, #f0f9ff)',
    css: {
      background: 'linear-gradient(to bottom right, #dbeafe, #f0f9ff)',
    },
  },
  {
    id: 'soft-green',
    name: 'Soft Green',
    type: 'gradient',
    preview: 'linear-gradient(to bottom right, #d1fae5, #f0fdf4)',
    css: {
      background: 'linear-gradient(to bottom right, #d1fae5, #f0fdf4)',
    },
  },
  {
    id: 'soft-purple',
    name: 'Soft Purple',
    type: 'gradient',
    preview: 'linear-gradient(to bottom right, #e9d5ff, #faf5ff)',
    css: {
      background: 'linear-gradient(to bottom right, #e9d5ff, #faf5ff)',
    },
  },
  {
    id: 'warm-sunset',
    name: 'Warm Sunset',
    type: 'gradient',
    preview: 'linear-gradient(to bottom right, #fed7aa, #fff7ed)',
    css: {
      background: 'linear-gradient(to bottom right, #fed7aa, #fff7ed)',
    },
  },
  {
    id: 'cool-ocean',
    name: 'Cool Ocean',
    type: 'gradient',
    preview: 'linear-gradient(to bottom right, #bae6fd, #e0f2fe)',
    css: {
      background: 'linear-gradient(to bottom right, #bae6fd, #e0f2fe)',
    },
  },
  {
    id: 'calm-pastel',
    name: 'Calm Pastel',
    type: 'gradient',
    preview: 'linear-gradient(to bottom right, #fef3c7, #fce7f3)',
    css: {
      background: 'linear-gradient(to bottom right, #fef3c7, #fce7f3)',
    },
  },
];

// Pattern backgrounds (subtle, non-distracting)
export const PATTERN_BACKGROUNDS: BackgroundStyle[] = [
  {
    id: 'dots',
    name: 'Dots',
    type: 'pattern',
    preview: 'dots',
    css: {
      backgroundColor: '#ffffff',
      backgroundImage:
        'radial-gradient(circle, #e5e7eb 1px, transparent 1px)',
      backgroundSize: '20px 20px',
    },
  },
  {
    id: 'grid',
    name: 'Grid',
    type: 'pattern',
    preview: 'grid',
    css: {
      backgroundColor: '#ffffff',
      backgroundImage:
        'linear-gradient(#e5e7eb 1px, transparent 1px), linear-gradient(90deg, #e5e7eb 1px, transparent 1px)',
      backgroundSize: '40px 40px',
    },
  },
  {
    id: 'lines',
    name: 'Horizontal Lines',
    type: 'pattern',
    preview: 'lines',
    css: {
      backgroundColor: '#ffffff',
      backgroundImage:
        'repeating-linear-gradient(0deg, #ffffff, #ffffff 30px, #f3f4f6 30px, #f3f4f6 32px)',
    },
  },
  {
    id: 'diagonal',
    name: 'Diagonal',
    type: 'pattern',
    preview: 'diagonal',
    css: {
      backgroundColor: '#ffffff',
      backgroundImage:
        'repeating-linear-gradient(45deg, transparent, transparent 35px, #f3f4f6 35px, #f3f4f6 37px)',
    },
  },
  {
    id: 'waves',
    name: 'Waves',
    type: 'pattern',
    preview: 'waves',
    css: {
      backgroundColor: '#eff6ff',
      backgroundImage:
        'repeating-radial-gradient(circle at 0 0, transparent 0, #eff6ff 40px), repeating-linear-gradient(#dbeafe55, #dbeafe)',
    },
  },
];

// Texture backgrounds (very subtle)
export const TEXTURE_BACKGROUNDS: BackgroundStyle[] = [
  {
    id: 'paper',
    name: 'Paper',
    type: 'texture',
    preview: 'paper',
    css: {
      backgroundColor: '#ffffff',
      backgroundImage: 'url("data:image/svg+xml,%3Csvg width=\'100\' height=\'100\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cfilter id=\'noise\'%3E%3CfeTurbulence type=\'fractalNoise\' baseFrequency=\'0.9\' numOctaves=\'4\' /%3E%3C/filter%3E%3Crect width=\'100\' height=\'100\' filter=\'url(%23noise)\' opacity=\'0.05\'/%3E%3C/svg%3E")',
    },
  },
  {
    id: 'linen',
    name: 'Linen',
    type: 'texture',
    preview: 'linen',
    css: {
      backgroundColor: '#fefce8',
      backgroundImage: 'url("data:image/svg+xml,%3Csvg width=\'100\' height=\'100\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cfilter id=\'noise\'%3E%3CfeTurbulence type=\'fractalNoise\' baseFrequency=\'1.2\' numOctaves=\'3\' /%3E%3C/filter%3E%3Crect width=\'100\' height=\'100\' filter=\'url(%23noise)\' opacity=\'0.08\'/%3E%3C/svg%3E")',
    },
  },
];

export interface BackgroundStylesProps {
  onStyleChange?: (style: BackgroundStyle) => void;
}

export default function BackgroundStyles({ onStyleChange }: BackgroundStylesProps) {
  const { settings } = useSettingsStore();
  const [selectedStyle, setSelectedStyle] = useState<BackgroundStyle>(SOLID_BACKGROUNDS[0]);
  const [category, setCategory] = useState<'solid' | 'gradient' | 'pattern' | 'texture'>('solid');

  const backgrounds = {
    solid: SOLID_BACKGROUNDS,
    gradient: GRADIENT_BACKGROUNDS,
    pattern: PATTERN_BACKGROUNDS,
    texture: TEXTURE_BACKGROUNDS,
  };

  const handleStyleSelect = (style: BackgroundStyle) => {
    setSelectedStyle(style);
    onStyleChange?.(style);
  };

  return (
    <div className="bg-white rounded-2xl shadow-xl p-6">
      <h2 className="text-2xl font-bold text-gray-800 mb-6">Background Styles</h2>

      {/* Category tabs */}
      <div className="flex gap-2 mb-6 flex-wrap">
        {(['solid', 'gradient', 'pattern', 'texture'] as const).map((cat) => (
          <button
            key={cat}
            onClick={() => setCategory(cat)}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              category === cat
                ? 'bg-primary-500 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            {cat.charAt(0).toUpperCase() + cat.slice(1)}
          </button>
        ))}
      </div>

      {/* Background options */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        {backgrounds[category].map((style, index) => (
          <motion.button
            key={style.id}
            onClick={() => handleStyleSelect(style)}
            initial={{ opacity: 0, scale: 0 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{
              delay: settings.reducedMotion ? 0 : index * 0.05,
            }}
            whileHover={{ scale: settings.reducedMotion ? 1 : 1.05 }}
            whileTap={{ scale: settings.reducedMotion ? 1 : 0.95 }}
            className={`relative overflow-hidden rounded-xl border-2 transition-all ${
              selectedStyle.id === style.id
                ? 'border-primary-500 shadow-lg'
                : 'border-gray-200 hover:border-gray-300'
            }`}
          >
            {/* Preview */}
            <div className="h-32 flex items-center justify-center" style={style.css}>
              <span className="text-2xl font-bold text-gray-700">Aa</span>
            </div>

            {/* Name */}
            <div className="bg-white p-2 text-sm font-medium text-gray-800">
              {style.name}
            </div>

            {/* Selected indicator */}
            {selectedStyle.id === style.id && (
              <div className="absolute top-2 right-2 w-6 h-6 bg-primary-500 rounded-full flex items-center justify-center text-white text-xs">
                ✓
              </div>
            )}
          </motion.button>
        ))}
      </div>
    </div>
  );
}

// Background opacity control
export function BackgroundOpacity({
  backgroundStyle,
  onOpacityChange,
}: {
  backgroundStyle: BackgroundStyle;
  onOpacityChange?: (opacity: number) => void;
}) {
  const [opacity, setOpacity] = useState(100);

  const handleChange = (value: number) => {
    setOpacity(value);
    onOpacityChange?.(value / 100);
  };

  return (
    <div className="bg-white rounded-xl shadow-lg p-6">
      <h3 className="text-lg font-bold text-gray-800 mb-4">Background Opacity</h3>

      <div className="space-y-4">
        {/* Opacity slider */}
        <div className="flex items-center gap-4">
          <span className="text-sm text-gray-600 w-20">Transparent</span>
          <input
            type="range"
            min="0"
            max="100"
            value={opacity}
            onChange={(e) => handleChange(parseInt(e.target.value))}
            className="flex-1 h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
          />
          <span className="text-sm text-gray-600 w-20 text-right">Opaque</span>
        </div>

        {/* Opacity value */}
        <div className="text-center text-2xl font-bold text-gray-800">{opacity}%</div>

        {/* Preview */}
        <div className="relative h-40 rounded-xl overflow-hidden">
          {/* Background layer */}
          <div
            className="absolute inset-0"
            style={{
              ...backgroundStyle.css,
              opacity: opacity / 100,
            }}
          />

          {/* Content layer */}
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="text-4xl font-bold text-gray-800">Sample Text</div>
          </div>
        </div>

        {/* Preset opacities */}
        <div className="grid grid-cols-4 gap-2">
          {[25, 50, 75, 100].map((preset) => (
            <button
              key={preset}
              onClick={() => handleChange(preset)}
              className="px-3 py-2 bg-gray-100 text-gray-800 rounded-lg text-sm font-medium hover:bg-gray-200 transition-colors"
            >
              {preset}%
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

// Animated background (very subtle)
export function AnimatedBackground() {
  const { settings } = useSettingsStore();

  return (
    <div className="relative bg-white rounded-2xl shadow-xl overflow-hidden h-96">
      {/* Animated gradient background */}
      {!settings.reducedMotion && (
        <motion.div
          className="absolute inset-0"
          animate={{
            background: [
              'linear-gradient(45deg, #dbeafe, #f0f9ff)',
              'linear-gradient(45deg, #f0f9ff, #dbeafe)',
              'linear-gradient(45deg, #dbeafe, #f0f9ff)',
            ],
          }}
          transition={{
            duration: 10,
            repeat: Infinity,
            ease: 'linear',
          }}
        />
      )}

      {/* Content */}
      <div className="relative z-10 p-8 flex items-center justify-center h-full">
        <div>
          <h3 className="text-3xl font-bold text-gray-800 mb-4">
            Animated Background
          </h3>
          <p className="text-lg text-gray-600">
            Subtle color transitions for a calming effect
          </p>
        </div>
      </div>
    </div>
  );
}

// Distraction-free background
export function DistractionFreeBackground({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center p-8">
      <div className="w-full max-w-4xl bg-white rounded-2xl shadow-2xl p-12">
        {children}
      </div>
    </div>
  );
}

// Custom image background (with overlay for readability)
export function ImageBackground({
  imageUrl,
  overlayOpacity = 0.8,
  children,
}: {
  imageUrl: string;
  overlayOpacity?: number;
  children: React.ReactNode;
}) {
  return (
    <div className="relative min-h-screen overflow-hidden">
      {/* Background image */}
      <div
        className="absolute inset-0 bg-cover bg-center"
        style={{ backgroundImage: `url(${imageUrl})` }}
      />

      {/* Overlay for readability */}
      <div
        className="absolute inset-0 bg-white"
        style={{ opacity: overlayOpacity }}
      />

      {/* Content */}
      <div className="relative z-10 p-8">{children}</div>
    </div>
  );
}

// Blur background (for focus mode)
export function BlurBackground({ children }: { children: React.ReactNode }) {
  return (
    <div className="relative min-h-screen bg-white">
      {/* Blurred edges */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-0 left-0 right-0 h-40 bg-gradient-to-b from-gray-100 to-transparent blur-xl" />
        <div className="absolute bottom-0 left-0 right-0 h-40 bg-gradient-to-t from-gray-100 to-transparent blur-xl" />
        <div className="absolute top-0 bottom-0 left-0 w-40 bg-gradient-to-r from-gray-100 to-transparent blur-xl" />
        <div className="absolute top-0 bottom-0 right-0 w-40 bg-gradient-to-l from-gray-100 to-transparent blur-xl" />
      </div>

      {/* Focused content area */}
      <div className="relative z-10 flex items-center justify-center min-h-screen p-8">
        <div className="w-full max-w-4xl">{children}</div>
      </div>
    </div>
  );
}

// Background preview panel
export function BackgroundPreviewPanel({
  styles,
}: {
  styles: BackgroundStyle[];
}) {
  return (
    <div className="bg-white rounded-xl shadow-lg p-6">
      <h3 className="text-lg font-bold text-gray-800 mb-4">Quick Preview</h3>

      <div className="space-y-3">
        {styles.map((style) => (
          <div key={style.id} className="flex items-center gap-3">
            {/* Mini preview */}
            <div
              className="w-16 h-12 rounded border border-gray-300"
              style={style.css}
            />

            {/* Info */}
            <div className="flex-1">
              <div className="font-medium text-gray-800">{style.name}</div>
              <div className="text-xs text-gray-500 capitalize">{style.type}</div>
            </div>

            {/* Apply button */}
            <button className="px-3 py-1 bg-primary-100 text-primary-700 rounded text-sm font-medium hover:bg-primary-200 transition-colors">
              Apply
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
