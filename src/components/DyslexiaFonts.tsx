/**
 * Dyslexia-Friendly Fonts Component
 * Step 140 - Specialized fonts for improved readability
 */

import { motion } from 'framer-motion';
import { useState } from 'react';
import { useSettingsStore } from '../store/useSettingsStore';

export interface DyslexiaFont {
  id: string;
  name: string;
  fontFamily: string;
  description: string;
  category: 'dyslexia' | 'readable' | 'monospace' | 'sans-serif';
  features: string[];
}

// Dyslexia-friendly and highly readable fonts
export const DYSLEXIA_FONTS: DyslexiaFont[] = [
  {
    id: 'opendyslexic',
    name: 'OpenDyslexic',
    fontFamily: 'OpenDyslexic, sans-serif',
    description: 'Designed specifically for dyslexia with weighted bottoms',
    category: 'dyslexia',
    features: ['Heavy baseline', 'Unique letter shapes', 'Anti-mirroring'],
  },
  {
    id: 'lexend',
    name: 'Lexend',
    fontFamily: 'Lexend, sans-serif',
    description: 'Variable font designed to reduce visual stress',
    category: 'dyslexia',
    features: ['Variable weights', 'Optimal spacing', 'Clear distinctions'],
  },
  {
    id: 'comic-sans',
    name: 'Comic Sans',
    fontFamily: 'Comic Sans MS, cursive',
    description: 'Friendly, casual font with distinct letter shapes',
    category: 'readable',
    features: ['Distinct letters', 'No serifs', 'Rounded shapes'],
  },
  {
    id: 'arial',
    name: 'Arial',
    fontFamily: 'Arial, sans-serif',
    description: 'Clean, simple sans-serif font',
    category: 'sans-serif',
    features: ['Simple shapes', 'High readability', 'Wide availability'],
  },
  {
    id: 'verdana',
    name: 'Verdana',
    fontFamily: 'Verdana, sans-serif',
    description: 'Designed for screen readability with wide spacing',
    category: 'sans-serif',
    features: ['Wide spacing', 'Large x-height', 'Clear at small sizes'],
  },
  {
    id: 'tahoma',
    name: 'Tahoma',
    fontFamily: 'Tahoma, sans-serif',
    description: 'Compact with tight letter spacing',
    category: 'sans-serif',
    features: ['Narrow letters', 'Minimal spacing', 'High clarity'],
  },
  {
    id: 'trebuchet',
    name: 'Trebuchet MS',
    fontFamily: 'Trebuchet MS, sans-serif',
    description: 'Humanist sans-serif with good spacing',
    category: 'sans-serif',
    features: ['Humanist design', 'Even spacing', 'Distinct characters'],
  },
  {
    id: 'consolas',
    name: 'Consolas',
    fontFamily: 'Consolas, monospace',
    description: 'Monospace font with clear character distinction',
    category: 'monospace',
    features: ['Fixed width', 'Clear b/d/p/q', 'Code-optimized'],
  },
  {
    id: 'courier-new',
    name: 'Courier New',
    fontFamily: 'Courier New, monospace',
    description: 'Classic monospace typewriter font',
    category: 'monospace',
    features: ['Fixed width', 'Classic style', 'High clarity'],
  },
  {
    id: 'atkinson-hyperlegible',
    name: 'Atkinson Hyperlegible',
    fontFamily: 'Atkinson Hyperlegible, sans-serif',
    description: 'Designed for low vision readers',
    category: 'readable',
    features: ['Maximum legibility', 'Distinct characters', 'Clear at distance'],
  },
];

export interface DyslexiaFontsProps {
  onFontChange?: (font: DyslexiaFont) => void;
}

export default function DyslexiaFonts({ onFontChange }: DyslexiaFontsProps) {
  const { settings } = useSettingsStore();
  const [selectedFont, setSelectedFont] = useState<DyslexiaFont>(DYSLEXIA_FONTS[0]);
  const [category, setCategory] = useState<DyslexiaFont['category'] | 'all'>('all');

  const filteredFonts =
    category === 'all'
      ? DYSLEXIA_FONTS
      : DYSLEXIA_FONTS.filter((font) => font.category === category);

  const handleFontSelect = (font: DyslexiaFont) => {
    setSelectedFont(font);
    onFontChange?.(font);
  };

  return (
    <div className="bg-white rounded-2xl shadow-xl p-6">
      <h2 className="text-2xl font-bold text-gray-800 mb-6">
        Dyslexia-Friendly Fonts
      </h2>

      {/* Category filter */}
      <div className="flex gap-2 mb-6 flex-wrap">
        {(['all', 'dyslexia', 'readable', 'sans-serif', 'monospace'] as const).map(
          (cat) => (
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
          )
        )}
      </div>

      {/* Font options */}
      <div className="space-y-3">
        {filteredFonts.map((font, index) => (
          <motion.button
            key={font.id}
            onClick={() => handleFontSelect(font)}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{
              delay: settings.reducedMotion ? 0 : index * 0.05,
            }}
            whileHover={{ scale: settings.reducedMotion ? 1 : 1.02 }}
            className={`w-full text-left p-4 rounded-xl border-2 transition-all ${
              selectedFont.id === font.id
                ? 'border-primary-500 bg-primary-50'
                : 'border-gray-200 hover:border-gray-300'
            }`}
          >
            {/* Font preview */}
            <div
              className="text-2xl font-bold text-gray-800 mb-2"
              style={{ fontFamily: font.fontFamily }}
            >
              The quick brown fox jumps over the lazy dog
            </div>

            {/* Font info */}
            <div className="flex items-start justify-between">
              <div>
                <div className="font-bold text-gray-800">{font.name}</div>
                <div className="text-sm text-gray-600 mt-1">{font.description}</div>

                {/* Features */}
                <div className="flex flex-wrap gap-1 mt-2">
                  {font.features.map((feature, idx) => (
                    <span
                      key={idx}
                      className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded"
                    >
                      {feature}
                    </span>
                  ))}
                </div>
              </div>

              {/* Selected indicator */}
              {selectedFont.id === font.id && (
                <div className="ml-4">
                  <div className="w-8 h-8 bg-primary-500 rounded-full flex items-center justify-center text-white">
                    ✓
                  </div>
                </div>
              )}
            </div>
          </motion.button>
        ))}
      </div>
    </div>
  );
}

// Font size and spacing controls specific to dyslexia
export function DyslexiaFontSettings({
  font,
  onChange,
}: {
  font: DyslexiaFont;
  onChange?: (settings: {
    fontSize: number;
    letterSpacing: number;
    wordSpacing: number;
    lineHeight: number;
  }) => void;
}) {
  const [fontSize, setFontSize] = useState(18);
  const [letterSpacing, setLetterSpacing] = useState(0.05);
  const [wordSpacing, setWordSpacing] = useState(0.16);
  const [lineHeight, setLineHeight] = useState(1.8);

  const handleChange = (
    key: 'fontSize' | 'letterSpacing' | 'wordSpacing' | 'lineHeight',
    value: number
  ) => {
    const updates = {
      fontSize,
      letterSpacing,
      wordSpacing,
      lineHeight,
      [key]: value,
    };

    if (key === 'fontSize') setFontSize(value);
    else if (key === 'letterSpacing') setLetterSpacing(value);
    else if (key === 'wordSpacing') setWordSpacing(value);
    else if (key === 'lineHeight') setLineHeight(value);

    onChange?.(updates);
  };

  return (
    <div className="bg-white rounded-xl shadow-lg p-6">
      <h3 className="text-lg font-bold text-gray-800 mb-4">Fine-Tune Settings</h3>

      <div className="space-y-6">
        {/* Font size */}
        <div>
          <label className="text-sm font-medium text-gray-700 mb-2 block">
            Font Size: {fontSize}px
          </label>
          <input
            type="range"
            min="12"
            max="36"
            value={fontSize}
            onChange={(e) => handleChange('fontSize', parseInt(e.target.value))}
            className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
          />
        </div>

        {/* Letter spacing */}
        <div>
          <label className="text-sm font-medium text-gray-700 mb-2 block">
            Letter Spacing: {letterSpacing.toFixed(2)}em
          </label>
          <input
            type="range"
            min="0"
            max="0.2"
            step="0.01"
            value={letterSpacing}
            onChange={(e) => handleChange('letterSpacing', parseFloat(e.target.value))}
            className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
          />
        </div>

        {/* Word spacing */}
        <div>
          <label className="text-sm font-medium text-gray-700 mb-2 block">
            Word Spacing: {wordSpacing.toFixed(2)}em
          </label>
          <input
            type="range"
            min="0"
            max="0.5"
            step="0.01"
            value={wordSpacing}
            onChange={(e) => handleChange('wordSpacing', parseFloat(e.target.value))}
            className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
          />
        </div>

        {/* Line height */}
        <div>
          <label className="text-sm font-medium text-gray-700 mb-2 block">
            Line Height: {lineHeight.toFixed(1)}
          </label>
          <input
            type="range"
            min="1"
            max="3"
            step="0.1"
            value={lineHeight}
            onChange={(e) => handleChange('lineHeight', parseFloat(e.target.value))}
            className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
          />
        </div>
      </div>

      {/* Preview */}
      <div className="mt-6 p-6 bg-gray-50 rounded-lg">
        <h4 className="text-sm font-bold text-gray-600 mb-3">Preview</h4>
        <div
          style={{
            fontFamily: font.fontFamily,
            fontSize: `${fontSize}px`,
            letterSpacing: `${letterSpacing}em`,
            wordSpacing: `${wordSpacing}em`,
            lineHeight: lineHeight,
          }}
          className="text-gray-800"
        >
          The quick brown fox jumps over the lazy dog. This is how your text will
          appear with the selected settings. Adjust the controls above to find what
          works best for you.
        </div>
      </div>
    </div>
  );
}

// Font comparison tool
export function FontComparison() {
  const [fontA, setFontA] = useState<DyslexiaFont>(DYSLEXIA_FONTS[0]);
  const [fontB, setFontB] = useState<DyslexiaFont>(DYSLEXIA_FONTS[1]);

  const sampleText =
    'The quick brown fox jumps over the lazy dog. Pack my box with five dozen liquor jugs.';

  return (
    <div className="bg-white rounded-2xl shadow-xl p-6">
      <h3 className="text-lg font-bold text-gray-800 mb-6">Compare Fonts</h3>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Font A */}
        <div>
          <label className="text-sm font-medium text-gray-700 mb-2 block">
            Font A
          </label>
          <select
            value={fontA.id}
            onChange={(e) => {
              const font = DYSLEXIA_FONTS.find((f) => f.id === e.target.value);
              if (font) setFontA(font);
            }}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg mb-4"
          >
            {DYSLEXIA_FONTS.map((font) => (
              <option key={font.id} value={font.id}>
                {font.name}
              </option>
            ))}
          </select>

          <div className="p-6 bg-gray-50 rounded-lg">
            <div
              className="text-xl text-gray-800"
              style={{ fontFamily: fontA.fontFamily }}
            >
              {sampleText}
            </div>
          </div>
        </div>

        {/* Font B */}
        <div>
          <label className="text-sm font-medium text-gray-700 mb-2 block">
            Font B
          </label>
          <select
            value={fontB.id}
            onChange={(e) => {
              const font = DYSLEXIA_FONTS.find((f) => f.id === e.target.value);
              if (font) setFontB(font);
            }}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg mb-4"
          >
            {DYSLEXIA_FONTS.map((font) => (
              <option key={font.id} value={font.id}>
                {font.name}
              </option>
            ))}
          </select>

          <div className="p-6 bg-gray-50 rounded-lg">
            <div
              className="text-xl text-gray-800"
              style={{ fontFamily: fontB.fontFamily }}
            >
              {sampleText}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// Font testing playground
export function FontTestingPlayground() {
  const [selectedFont, setSelectedFont] = useState<DyslexiaFont>(DYSLEXIA_FONTS[0]);
  const [customText, setCustomText] = useState(
    'Type your own text here to test how it looks in different fonts.'
  );
  const [fontSize, setFontSize] = useState(20);

  return (
    <div className="bg-white rounded-2xl shadow-xl p-6">
      <h3 className="text-lg font-bold text-gray-800 mb-6">Font Testing Playground</h3>

      {/* Font selector */}
      <div className="mb-4">
        <label className="text-sm font-medium text-gray-700 mb-2 block">
          Select Font
        </label>
        <select
          value={selectedFont.id}
          onChange={(e) => {
            const font = DYSLEXIA_FONTS.find((f) => f.id === e.target.value);
            if (font) setSelectedFont(font);
          }}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg"
        >
          {DYSLEXIA_FONTS.map((font) => (
            <option key={font.id} value={font.id}>
              {font.name}
            </option>
          ))}
        </select>
      </div>

      {/* Font size slider */}
      <div className="mb-4">
        <label className="text-sm font-medium text-gray-700 mb-2 block">
          Font Size: {fontSize}px
        </label>
        <input
          type="range"
          min="12"
          max="48"
          value={fontSize}
          onChange={(e) => setFontSize(parseInt(e.target.value))}
          className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
        />
      </div>

      {/* Text input */}
      <div className="mb-6">
        <label className="text-sm font-medium text-gray-700 mb-2 block">
          Custom Text
        </label>
        <textarea
          value={customText}
          onChange={(e) => setCustomText(e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg resize-none"
          rows={3}
        />
      </div>

      {/* Preview */}
      <div className="p-8 bg-gradient-to-br from-blue-50 to-purple-50 rounded-xl">
        <div
          className="text-gray-800 whitespace-pre-wrap"
          style={{
            fontFamily: selectedFont.fontFamily,
            fontSize: `${fontSize}px`,
            lineHeight: 1.8,
          }}
        >
          {customText}
        </div>
      </div>

      {/* Font info */}
      <div className="mt-4 p-4 bg-blue-50 rounded-lg">
        <div className="font-bold text-blue-900 mb-1">{selectedFont.name}</div>
        <div className="text-sm text-blue-700">{selectedFont.description}</div>
      </div>
    </div>
  );
}

// Dyslexia mode toggle with all features
export function DyslexiaMode({
  onToggle,
}: {
  onToggle?: (enabled: boolean) => void;
}) {
  const [enabled, setEnabled] = useState(false);

  const handleToggle = () => {
    const newState = !enabled;
    setEnabled(newState);
    onToggle?.(newState);
  };

  const features = [
    { icon: '🔤', label: 'OpenDyslexic Font', enabled: true },
    { icon: '📏', label: 'Increased Line Spacing', enabled: true },
    { icon: '🔠', label: 'Larger Letter Spacing', enabled: true },
    { icon: '🎨', label: 'High Contrast Colors', enabled: true },
    { icon: '✨', label: 'Syllable Highlighting', enabled: false },
    { icon: '🔊', label: 'Text-to-Speech', enabled: false },
  ];

  return (
    <div className="bg-white rounded-2xl shadow-xl p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-2xl font-bold text-gray-800">Dyslexia Mode</h3>
          <p className="text-sm text-gray-600 mt-1">
            Enable optimized settings for dyslexic readers
          </p>
        </div>

        {/* Toggle switch */}
        <button
          onClick={handleToggle}
          className={`relative w-16 h-9 rounded-full transition-colors ${
            enabled ? 'bg-primary-500' : 'bg-gray-300'
          }`}
        >
          <motion.div
            className="absolute top-1 left-1 w-7 h-7 bg-white rounded-full shadow-md"
            animate={{ x: enabled ? 28 : 0 }}
            transition={{ type: 'spring', stiffness: 500, damping: 30 }}
          />
        </button>
      </div>

      {/* Features list */}
      <div className="space-y-3">
        {features.map((feature, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.05 }}
            className={`flex items-center gap-3 p-3 rounded-lg ${
              enabled && feature.enabled
                ? 'bg-green-50 border-2 border-green-200'
                : 'bg-gray-50'
            }`}
          >
            <span className="text-2xl">{feature.icon}</span>
            <span className="flex-1 font-medium text-gray-800">
              {feature.label}
            </span>
            {enabled && feature.enabled && (
              <span className="text-green-600 text-sm font-bold">Active</span>
            )}
          </motion.div>
        ))}
      </div>

      {/* Preview */}
      {enabled && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          className="mt-6 p-6 bg-yellow-50 rounded-xl"
        >
          <div
            className="text-2xl text-gray-900"
            style={{
              fontFamily: DYSLEXIA_FONTS[0].fontFamily,
              letterSpacing: '0.1em',
              lineHeight: 2,
            }}
          >
            This is how text will appear with dyslexia mode enabled. All settings
            are optimized for easier reading.
          </div>
        </motion.div>
      )}
    </div>
  );
}
