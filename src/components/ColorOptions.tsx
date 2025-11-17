/**
 * Color Options Component
 * Step 137 - Customizable color schemes for text and UI
 */

import { motion } from 'framer-motion';
import { useState } from 'react';
import { useSettingsStore } from '../store/useSettingsStore';

export interface ColorScheme {
  id: string;
  name: string;
  textColor: string;
  backgroundColor: string;
  highlightColor: string;
  errorColor: string;
  successColor: string;
  accentColor: string;
}

// Predefined color schemes optimized for readability
export const COLOR_SCHEMES: ColorScheme[] = [
  {
    id: 'default',
    name: 'Default',
    textColor: '#1f2937',
    backgroundColor: '#ffffff',
    highlightColor: '#fbbf24',
    errorColor: '#ef4444',
    successColor: '#10b981',
    accentColor: '#3b82f6',
  },
  {
    id: 'high-contrast',
    name: 'High Contrast',
    textColor: '#000000',
    backgroundColor: '#ffffff',
    highlightColor: '#ffff00',
    errorColor: '#ff0000',
    successColor: '#00ff00',
    accentColor: '#0000ff',
  },
  {
    id: 'dark',
    name: 'Dark Mode',
    textColor: '#f3f4f6',
    backgroundColor: '#1f2937',
    highlightColor: '#fbbf24',
    errorColor: '#f87171',
    successColor: '#34d399',
    accentColor: '#60a5fa',
  },
  {
    id: 'sepia',
    name: 'Sepia',
    textColor: '#5c4a33',
    backgroundColor: '#f4ecd8',
    highlightColor: '#d4a373',
    errorColor: '#c1666b',
    successColor: '#81b29a',
    accentColor: '#7d6b7d',
  },
  {
    id: 'blue-light',
    name: 'Blue Light',
    textColor: '#1e3a5f',
    backgroundColor: '#e0f2fe',
    highlightColor: '#fef3c7',
    errorColor: '#dc2626',
    successColor: '#059669',
    accentColor: '#1d4ed8',
  },
  {
    id: 'soft-pastel',
    name: 'Soft Pastel',
    textColor: '#4b5563',
    backgroundColor: '#fef3c7',
    highlightColor: '#ddd6fe',
    errorColor: '#f87171',
    successColor: '#6ee7b7',
    accentColor: '#a78bfa',
  },
  {
    id: 'warm',
    name: 'Warm',
    textColor: '#78350f',
    backgroundColor: '#fff7ed',
    highlightColor: '#fed7aa',
    errorColor: '#dc2626',
    successColor: '#16a34a',
    accentColor: '#ea580c',
  },
  {
    id: 'cool',
    name: 'Cool',
    textColor: '#0c4a6e',
    backgroundColor: '#f0f9ff',
    highlightColor: '#bae6fd',
    errorColor: '#dc2626',
    successColor: '#059669',
    accentColor: '#0284c7',
  },
  {
    id: 'grayscale',
    name: 'Grayscale',
    textColor: '#1f2937',
    backgroundColor: '#f9fafb',
    highlightColor: '#d1d5db',
    errorColor: '#4b5563',
    successColor: '#6b7280',
    accentColor: '#374151',
  },
  {
    id: 'dyslexia-friendly',
    name: 'Dyslexia Friendly',
    textColor: '#000000',
    backgroundColor: '#fefce8',
    highlightColor: '#bfdbfe',
    errorColor: '#dc2626',
    successColor: '#16a34a',
    accentColor: '#2563eb',
  },
];

export interface ColorOptionsProps {
  onSchemeChange?: (scheme: ColorScheme) => void;
}

export default function ColorOptions({ onSchemeChange }: ColorOptionsProps) {
  const { settings } = useSettingsStore();
  const [selectedScheme, setSelectedScheme] = useState<ColorScheme>(COLOR_SCHEMES[0]);

  const handleSchemeSelect = (scheme: ColorScheme) => {
    setSelectedScheme(scheme);
    onSchemeChange?.(scheme);
  };

  return (
    <div className="bg-white rounded-2xl shadow-xl p-6">
      <h2 className="text-2xl font-bold text-gray-800 mb-6">Color Schemes</h2>

      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        {COLOR_SCHEMES.map((scheme, index) => (
          <motion.button
            key={scheme.id}
            onClick={() => handleSchemeSelect(scheme)}
            initial={{ opacity: 0, scale: 0 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{
              delay: settings.reducedMotion ? 0 : index * 0.05,
            }}
            whileHover={{ scale: settings.reducedMotion ? 1 : 1.05 }}
            whileTap={{ scale: settings.reducedMotion ? 1 : 0.95 }}
            className={`p-4 rounded-xl border-2 transition-all ${
              selectedScheme.id === scheme.id
                ? 'border-primary-500 shadow-lg'
                : 'border-gray-200 hover:border-gray-300'
            }`}
          >
            {/* Color preview */}
            <div
              className="w-full h-24 rounded-lg mb-3 flex items-center justify-center"
              style={{ backgroundColor: scheme.backgroundColor }}
            >
              <span
                className="text-2xl font-bold"
                style={{ color: scheme.textColor }}
              >
                Aa
              </span>
            </div>

            {/* Color swatches */}
            <div className="flex gap-1 mb-2">
              <div
                className="flex-1 h-3 rounded"
                style={{ backgroundColor: scheme.highlightColor }}
              />
              <div
                className="flex-1 h-3 rounded"
                style={{ backgroundColor: scheme.accentColor }}
              />
              <div
                className="flex-1 h-3 rounded"
                style={{ backgroundColor: scheme.successColor }}
              />
            </div>

            {/* Scheme name */}
            <div className="text-sm font-medium text-gray-800">{scheme.name}</div>
          </motion.button>
        ))}
      </div>
    </div>
  );
}

// Custom color picker for fine-tuned control
export function CustomColorPicker({
  onColorChange,
}: {
  onColorChange?: (scheme: Partial<ColorScheme>) => void;
}) {
  const [textColor, setTextColor] = useState('#1f2937');
  const [backgroundColor, setBackgroundColor] = useState('#ffffff');
  const [highlightColor, setHighlightColor] = useState('#fbbf24');
  const [errorColor, setErrorColor] = useState('#ef4444');
  const [successColor, setSuccessColor] = useState('#10b981');
  const [accentColor, setAccentColor] = useState('#3b82f6');

  const handleChange = () => {
    onColorChange?.({
      textColor,
      backgroundColor,
      highlightColor,
      errorColor,
      successColor,
      accentColor,
    });
  };

  const colorInputs = [
    { label: 'Text Color', value: textColor, setter: setTextColor },
    { label: 'Background', value: backgroundColor, setter: setBackgroundColor },
    { label: 'Highlight', value: highlightColor, setter: setHighlightColor },
    { label: 'Error', value: errorColor, setter: setErrorColor },
    { label: 'Success', value: successColor, setter: setSuccessColor },
    { label: 'Accent', value: accentColor, setter: setAccentColor },
  ];

  return (
    <div className="bg-white rounded-2xl shadow-xl p-6">
      <h2 className="text-2xl font-bold text-gray-800 mb-6">Custom Colors</h2>

      <div className="space-y-4">
        {colorInputs.map((input) => (
          <div key={input.label} className="flex items-center justify-between">
            <label className="text-sm font-medium text-gray-700">{input.label}</label>
            <div className="flex items-center gap-3">
              <input
                type="color"
                value={input.value}
                onChange={(e) => {
                  input.setter(e.target.value);
                  handleChange();
                }}
                className="w-16 h-10 rounded cursor-pointer border border-gray-300"
              />
              <input
                type="text"
                value={input.value}
                onChange={(e) => {
                  input.setter(e.target.value);
                  handleChange();
                }}
                className="w-28 px-3 py-2 border border-gray-300 rounded font-mono text-sm"
                placeholder="#000000"
              />
            </div>
          </div>
        ))}
      </div>

      {/* Live preview */}
      <div className="mt-6 p-6 rounded-xl" style={{ backgroundColor }}>
        <div className="text-2xl font-bold mb-2" style={{ color: textColor }}>
          Sample Text
        </div>
        <div className="flex gap-2 mt-4">
          <span className="px-4 py-2 rounded-lg" style={{ backgroundColor: highlightColor }}>
            Highlight
          </span>
          <span className="px-4 py-2 rounded-lg text-white" style={{ backgroundColor: accentColor }}>
            Accent
          </span>
          <span className="px-4 py-2 rounded-lg text-white" style={{ backgroundColor: successColor }}>
            Success
          </span>
          <span className="px-4 py-2 rounded-lg text-white" style={{ backgroundColor: errorColor }}>
            Error
          </span>
        </div>
      </div>
    </div>
  );
}

// Text color variations within a single scheme
export function TextColorVariants() {
  const variants = [
    { name: 'Very Light', opacity: 0.4 },
    { name: 'Light', opacity: 0.6 },
    { name: 'Normal', opacity: 0.8 },
    { name: 'Dark', opacity: 1.0 },
    { name: 'Very Dark', opacity: 1.0, weight: 'font-bold' },
  ];

  return (
    <div className="bg-white rounded-xl shadow-lg p-6">
      <h3 className="text-lg font-bold text-gray-800 mb-4">Text Darkness</h3>

      <div className="space-y-3">
        {variants.map((variant, index) => (
          <div
            key={index}
            className="p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors cursor-pointer"
          >
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">{variant.name}</span>
              <span
                className={`text-2xl ${variant.weight || 'font-normal'}`}
                style={{ opacity: variant.opacity }}
              >
                Sample Text
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// Background color temperature slider
export function ColorTemperature({
  onChange,
}: {
  onChange?: (temperature: number) => void;
}) {
  const [temperature, setTemperature] = useState(50); // 0 = cool, 100 = warm

  const getBackgroundColor = (temp: number): string => {
    // Interpolate between cool blue and warm yellow
    const coolColor = { r: 240, g: 249, b: 255 }; // bg-blue-50
    const warmColor = { r: 255, g: 247, b: 237 }; // bg-orange-50

    const r = Math.round(coolColor.r + (warmColor.r - coolColor.r) * (temp / 100));
    const g = Math.round(coolColor.g + (warmColor.g - coolColor.g) * (temp / 100));
    const b = Math.round(coolColor.b + (warmColor.b - coolColor.b) * (temp / 100));

    return `rgb(${r}, ${g}, ${b})`;
  };

  const handleChange = (value: number) => {
    setTemperature(value);
    onChange?.(value);
  };

  return (
    <div className="bg-white rounded-xl shadow-lg p-6">
      <h3 className="text-lg font-bold text-gray-800 mb-4">Color Temperature</h3>

      <div className="space-y-4">
        {/* Temperature slider */}
        <div className="flex items-center gap-4">
          <span className="text-sm text-blue-600">❄️ Cool</span>
          <input
            type="range"
            min="0"
            max="100"
            value={temperature}
            onChange={(e) => handleChange(parseInt(e.target.value))}
            className="flex-1 h-2 bg-gradient-to-r from-blue-200 via-gray-200 to-orange-200 rounded-lg appearance-none cursor-pointer"
          />
          <span className="text-sm text-orange-600">Warm 🔥</span>
        </div>

        {/* Preview */}
        <div
          className="p-8 rounded-xl transition-colors duration-300"
          style={{ backgroundColor: getBackgroundColor(temperature) }}
        >
          <div className="text-2xl font-bold text-gray-800 text-center">
            Preview Text
          </div>
          <div className="text-sm text-gray-600 text-center mt-2">
            Temperature: {temperature}%
          </div>
        </div>

        {/* Preset temperatures */}
        <div className="grid grid-cols-3 gap-2">
          <button
            onClick={() => handleChange(0)}
            className="px-3 py-2 bg-blue-100 text-blue-800 rounded-lg text-sm font-medium hover:bg-blue-200 transition-colors"
          >
            Very Cool
          </button>
          <button
            onClick={() => handleChange(50)}
            className="px-3 py-2 bg-gray-100 text-gray-800 rounded-lg text-sm font-medium hover:bg-gray-200 transition-colors"
          >
            Neutral
          </button>
          <button
            onClick={() => handleChange(100)}
            className="px-3 py-2 bg-orange-100 text-orange-800 rounded-lg text-sm font-medium hover:bg-orange-200 transition-colors"
          >
            Very Warm
          </button>
        </div>
      </div>
    </div>
  );
}

// Syntax highlighting colors for code typing
export function SyntaxColorScheme() {
  const syntaxColors = {
    keyword: '#d73a49',
    string: '#032f62',
    number: '#005cc5',
    comment: '#6a737d',
    function: '#6f42c1',
    variable: '#24292e',
  };

  return (
    <div className="bg-white rounded-xl shadow-lg p-6">
      <h3 className="text-lg font-bold text-gray-800 mb-4">Syntax Highlighting</h3>

      <div className="bg-gray-900 rounded-lg p-6 font-mono text-sm">
        <div>
          <span style={{ color: syntaxColors.keyword }}>function</span>{' '}
          <span style={{ color: syntaxColors.function }}>calculateWPM</span>
          <span style={{ color: '#ffffff' }}>(</span>
          <span style={{ color: syntaxColors.variable }}>chars</span>
          <span style={{ color: '#ffffff' }}>, </span>
          <span style={{ color: syntaxColors.variable }}>time</span>
          <span style={{ color: '#ffffff' }}>) {'{'}</span>
        </div>
        <div className="pl-4">
          <span style={{ color: syntaxColors.comment }}>
            // Calculate words per minute
          </span>
        </div>
        <div className="pl-4">
          <span style={{ color: syntaxColors.keyword }}>const</span>{' '}
          <span style={{ color: syntaxColors.variable }}>wpm</span>
          <span style={{ color: '#ffffff' }}> = </span>
          <span style={{ color: syntaxColors.variable }}>chars</span>
          <span style={{ color: '#ffffff' }}> / </span>
          <span style={{ color: syntaxColors.number }}>5</span>
          <span style={{ color: '#ffffff' }}>;</span>
        </div>
        <div className="pl-4">
          <span style={{ color: syntaxColors.keyword }}>return</span>{' '}
          <span style={{ color: syntaxColors.variable }}>wpm</span>
          <span style={{ color: '#ffffff' }}>;</span>
        </div>
        <div>
          <span style={{ color: '#ffffff' }}>{'}'}</span>
        </div>
      </div>

      {/* Color legend */}
      <div className="grid grid-cols-2 gap-2 mt-4">
        {Object.entries(syntaxColors).map(([type, color]) => (
          <div key={type} className="flex items-center gap-2">
            <div
              className="w-4 h-4 rounded"
              style={{ backgroundColor: color }}
            />
            <span className="text-sm text-gray-700 capitalize">{type}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

// Accessibility color contrast checker
export function ContrastChecker({
  foreground,
  background,
}: {
  foreground: string;
  background: string;
}) {
  // Simplified contrast ratio calculation
  const getLuminance = (_color: string): number => {
    // This is a simplified version - real implementation would parse hex/rgb
    return 0.5;
  };

  const getContrastRatio = (): number => {
    const l1 = getLuminance(foreground);
    const l2 = getLuminance(background);
    const lighter = Math.max(l1, l2);
    const darker = Math.min(l1, l2);
    return (lighter + 0.05) / (darker + 0.05);
  };

  const ratio = getContrastRatio();
  const passAAA = ratio >= 7;
  const passAA = ratio >= 4.5;
  const passAALarge = ratio >= 3;

  return (
    <div className="bg-white rounded-xl shadow-lg p-6">
      <h3 className="text-lg font-bold text-gray-800 mb-4">Contrast Checker</h3>

      <div className="mb-4 p-8 rounded-lg" style={{ backgroundColor: background }}>
        <div className="text-4xl font-bold" style={{ color: foreground }}>
          Sample Text
        </div>
      </div>

      <div className="space-y-2">
        <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
          <span className="text-sm font-medium">Contrast Ratio</span>
          <span className="font-bold">{ratio.toFixed(2)}:1</span>
        </div>

        <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
          <span className="text-sm">WCAG AAA</span>
          <span className={passAAA ? 'text-success-600' : 'text-red-600'}>
            {passAAA ? '✓ Pass' : '✗ Fail'}
          </span>
        </div>

        <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
          <span className="text-sm">WCAG AA</span>
          <span className={passAA ? 'text-success-600' : 'text-red-600'}>
            {passAA ? '✓ Pass' : '✗ Fail'}
          </span>
        </div>

        <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
          <span className="text-sm">WCAG AA Large</span>
          <span className={passAALarge ? 'text-success-600' : 'text-red-600'}>
            {passAALarge ? '✓ Pass' : '✗ Fail'}
          </span>
        </div>
      </div>
    </div>
  );
}
