/**
 * Contrast Controls Component
 * Step 139 - Adjust contrast levels for better readability
 */

import { motion } from 'framer-motion';
import { useState, useEffect } from 'react';
import { useSettingsStore } from '../store/useSettingsStore';

export interface ContrastSettings {
  level: 'low' | 'normal' | 'high' | 'maximum';
  textContrast: number; // 0-100
  backgroundContrast: number; // 0-100
  highlightContrast: number; // 0-100
}

// Contrast presets
export const CONTRAST_PRESETS: Record<ContrastSettings['level'], ContrastSettings> = {
  low: {
    level: 'low',
    textContrast: 40,
    backgroundContrast: 20,
    highlightContrast: 30,
  },
  normal: {
    level: 'normal',
    textContrast: 65,
    backgroundContrast: 50,
    highlightContrast: 55,
  },
  high: {
    level: 'high',
    textContrast: 85,
    backgroundContrast: 75,
    highlightContrast: 80,
  },
  maximum: {
    level: 'maximum',
    textContrast: 100,
    backgroundContrast: 100,
    highlightContrast: 100,
  },
};

export interface ContrastControlsProps {
  onChange?: (settings: ContrastSettings) => void;
}

export default function ContrastControls({ onChange }: ContrastControlsProps) {
  const { settings } = useSettingsStore();
  const [contrastSettings, setContrastSettings] = useState<ContrastSettings>(
    CONTRAST_PRESETS.normal
  );

  const handlePresetSelect = (preset: ContrastSettings['level']) => {
    const newSettings = CONTRAST_PRESETS[preset];
    setContrastSettings(newSettings);
    onChange?.(newSettings);
  };

  const handleCustomChange = (
    key: keyof Omit<ContrastSettings, 'level'>,
    value: number
  ) => {
    const newSettings = { ...contrastSettings, [key]: value, level: 'normal' as const };
    setContrastSettings(newSettings);
    onChange?.(newSettings);
  };

  return (
    <div className="bg-white rounded-2xl shadow-xl p-6">
      <h2 className="text-2xl font-bold text-gray-800 mb-6">Contrast Controls</h2>

      {/* Preset levels */}
      <div className="mb-6">
        <h3 className="text-sm font-bold text-gray-600 mb-3">Preset Levels</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {(['low', 'normal', 'high', 'maximum'] as const).map((preset, index) => (
            <motion.button
              key={preset}
              onClick={() => handlePresetSelect(preset)}
              initial={{ opacity: 0, scale: 0 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{
                delay: settings.reducedMotion ? 0 : index * 0.05,
              }}
              whileHover={{ scale: settings.reducedMotion ? 1 : 1.05 }}
              whileTap={{ scale: settings.reducedMotion ? 1 : 0.95 }}
              className={`p-4 rounded-xl border-2 transition-all ${
                contrastSettings.level === preset
                  ? 'border-primary-500 bg-primary-50'
                  : 'border-gray-200 hover:border-gray-300'
              }`}
            >
              <div className="font-bold text-gray-800 capitalize mb-2">{preset}</div>
              <div className="text-xs text-gray-600">
                {CONTRAST_PRESETS[preset].textContrast}% text
              </div>
            </motion.button>
          ))}
        </div>
      </div>

      {/* Custom sliders */}
      <div className="space-y-6">
        {/* Text contrast */}
        <div>
          <label className="text-sm font-medium text-gray-700 mb-2 block">
            Text Contrast: {contrastSettings.textContrast}%
          </label>
          <input
            type="range"
            min="0"
            max="100"
            value={contrastSettings.textContrast}
            onChange={(e) =>
              handleCustomChange('textContrast', parseInt(e.target.value))
            }
            className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
          />
          <div className="flex justify-between text-xs text-gray-500 mt-1">
            <span>Subtle</span>
            <span>Strong</span>
          </div>
        </div>

        {/* Background contrast */}
        <div>
          <label className="text-sm font-medium text-gray-700 mb-2 block">
            Background Contrast: {contrastSettings.backgroundContrast}%
          </label>
          <input
            type="range"
            min="0"
            max="100"
            value={contrastSettings.backgroundContrast}
            onChange={(e) =>
              handleCustomChange('backgroundContrast', parseInt(e.target.value))
            }
            className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
          />
          <div className="flex justify-between text-xs text-gray-500 mt-1">
            <span>Soft</span>
            <span>Sharp</span>
          </div>
        </div>

        {/* Highlight contrast */}
        <div>
          <label className="text-sm font-medium text-gray-700 mb-2 block">
            Highlight Contrast: {contrastSettings.highlightContrast}%
          </label>
          <input
            type="range"
            min="0"
            max="100"
            value={contrastSettings.highlightContrast}
            onChange={(e) =>
              handleCustomChange('highlightContrast', parseInt(e.target.value))
            }
            className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
          />
          <div className="flex justify-between text-xs text-gray-500 mt-1">
            <span>Gentle</span>
            <span>Bold</span>
          </div>
        </div>
      </div>

      {/* Live preview */}
      <div className="mt-6 p-6 rounded-xl border-2 border-gray-200">
        <h4 className="text-sm font-bold text-gray-600 mb-4">Preview</h4>
        <ContrastPreview settings={contrastSettings} />
      </div>
    </div>
  );
}

// Live preview component
function ContrastPreview({ settings }: { settings: ContrastSettings }) {
  const getTextColor = (contrast: number): string => {
    const lightness = 100 - contrast;
    return `hsl(0, 0%, ${lightness}%)`;
  };

  const getBackgroundColor = (contrast: number): string => {
    const lightness = 100 - contrast / 2;
    return `hsl(0, 0%, ${lightness}%)`;
  };

  const getHighlightColor = (contrast: number): string => {
    const lightness = 100 - contrast / 1.5;
    return `hsl(45, 100%, ${lightness}%)`;
  };

  return (
    <div
      className="p-6 rounded-lg"
      style={{ backgroundColor: getBackgroundColor(settings.backgroundContrast) }}
    >
      <div
        className="text-2xl font-bold mb-3"
        style={{ color: getTextColor(settings.textContrast) }}
      >
        Sample Text
      </div>

      <div
        className="text-base mb-3"
        style={{ color: getTextColor(settings.textContrast) }}
      >
        This is how your text will appear with the selected contrast settings.
      </div>

      <span
        className="inline-block px-3 py-1 rounded"
        style={{ backgroundColor: getHighlightColor(settings.highlightContrast) }}
      >
        <span style={{ color: getTextColor(settings.textContrast) }}>
          Highlighted
        </span>
      </span>
    </div>
  );
}

// WCAG contrast ratio checker
export function ContrastRatioChecker({
  foreground,
  background,
}: {
  foreground: string;
  background: string;
}) {
  const [ratio, setRatio] = useState(1);

  useEffect(() => {
    const calculateContrastRatio = (fg: string, bg: string): number => {
      // Convert hex to RGB
      const hexToRgb = (hex: string) => {
        const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
        return result
          ? {
              r: parseInt(result[1], 16),
              g: parseInt(result[2], 16),
              b: parseInt(result[3], 16),
            }
          : { r: 0, g: 0, b: 0 };
      };

      // Calculate relative luminance
      const getLuminance = (rgb: { r: number; g: number; b: number }) => {
        const [r, g, b] = [rgb.r, rgb.g, rgb.b].map((val) => {
          const v = val / 255;
          return v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4);
        });
        return 0.2126 * r + 0.7152 * g + 0.0722 * b;
      };

      const fgRgb = hexToRgb(fg);
      const bgRgb = hexToRgb(bg);

      const l1 = getLuminance(fgRgb);
      const l2 = getLuminance(bgRgb);

      const lighter = Math.max(l1, l2);
      const darker = Math.min(l1, l2);

      return (lighter + 0.05) / (darker + 0.05);
    };

    const calculatedRatio = calculateContrastRatio(foreground, background);
    setRatio(calculatedRatio);
  }, [foreground, background]);

  const passAAA = ratio >= 7;
  const passAA = ratio >= 4.5;
  const passAALarge = ratio >= 3;

  return (
    <div className="bg-white rounded-xl shadow-lg p-6">
      <h3 className="text-lg font-bold text-gray-800 mb-4">
        WCAG Contrast Checker
      </h3>

      {/* Sample */}
      <div className="mb-6 p-8 rounded-lg" style={{ backgroundColor: background }}>
        <div className="text-4xl font-bold" style={{ color: foreground }}>
          Sample Text
        </div>
        <div className="text-base mt-2" style={{ color: foreground }}>
          The quick brown fox jumps over the lazy dog
        </div>
      </div>

      {/* Ratio display */}
      <div className="mb-4 p-4 bg-gray-50 rounded-lg text-center">
        <div className="text-sm text-gray-600 mb-1">Contrast Ratio</div>
        <div className="text-4xl font-bold text-gray-800">{ratio.toFixed(2)}:1</div>
      </div>

      {/* Compliance checklist */}
      <div className="space-y-2">
        <ComplianceItem
          label="WCAG AAA"
          description="Enhanced (7:1)"
          pass={passAAA}
        />
        <ComplianceItem
          label="WCAG AA"
          description="Minimum (4.5:1)"
          pass={passAA}
        />
        <ComplianceItem
          label="WCAG AA Large"
          description="Large text (3:1)"
          pass={passAALarge}
        />
      </div>

      {/* Recommendation */}
      <div className="mt-4 p-3 bg-blue-50 rounded-lg">
        <div className="text-sm font-medium text-blue-900">
          {passAAA
            ? '✓ Excellent contrast - meets all standards'
            : passAA
            ? '✓ Good contrast - meets minimum standards'
            : '⚠️ Consider increasing contrast for better readability'}
        </div>
      </div>
    </div>
  );
}

function ComplianceItem({
  label,
  description,
  pass,
}: {
  label: string;
  description: string;
  pass: boolean;
}) {
  return (
    <div
      className={`flex items-center justify-between p-3 rounded-lg ${
        pass ? 'bg-green-50' : 'bg-red-50'
      }`}
    >
      <div>
        <div className={`font-medium ${pass ? 'text-green-900' : 'text-red-900'}`}>
          {label}
        </div>
        <div className={`text-xs ${pass ? 'text-green-700' : 'text-red-700'}`}>
          {description}
        </div>
      </div>
      <div
        className={`text-xl ${pass ? 'text-green-600' : 'text-red-600'}`}
      >
        {pass ? '✓' : '✗'}
      </div>
    </div>
  );
}

// Adaptive contrast based on ambient light
export function AdaptiveContrast() {
  const [brightness, setBrightness] = useState(50); // Simulated ambient light
  const [autoContrast, setAutoContrast] = useState(true);

  const getAdaptiveContrast = (ambient: number): number => {
    // Lower ambient light = higher contrast needed
    return 100 - ambient;
  };

  const contrast = autoContrast ? getAdaptiveContrast(brightness) : 65;

  return (
    <div className="bg-white rounded-xl shadow-lg p-6">
      <h3 className="text-lg font-bold text-gray-800 mb-4">Adaptive Contrast</h3>

      {/* Auto contrast toggle */}
      <div className="flex items-center justify-between mb-6">
        <span className="text-sm font-medium text-gray-700">
          Auto-adjust contrast
        </span>
        <button
          onClick={() => setAutoContrast(!autoContrast)}
          className={`relative w-14 h-8 rounded-full transition-colors ${
            autoContrast ? 'bg-primary-500' : 'bg-gray-300'
          }`}
        >
          <motion.div
            className="absolute top-1 left-1 w-6 h-6 bg-white rounded-full"
            animate={{ x: autoContrast ? 24 : 0 }}
          />
        </button>
      </div>

      {/* Ambient light simulator */}
      <div className="mb-6">
        <label className="text-sm font-medium text-gray-700 mb-2 block">
          Ambient Light: {brightness}%
        </label>
        <input
          type="range"
          min="0"
          max="100"
          value={brightness}
          onChange={(e) => setBrightness(parseInt(e.target.value))}
          className="w-full h-2 bg-gradient-to-r from-gray-800 to-yellow-200 rounded-lg appearance-none cursor-pointer"
        />
        <div className="flex justify-between text-xs text-gray-500 mt-1">
          <span>🌙 Dark</span>
          <span>☀️ Bright</span>
        </div>
      </div>

      {/* Current contrast display */}
      <div className="p-4 bg-gray-50 rounded-lg text-center mb-4">
        <div className="text-sm text-gray-600 mb-1">Current Contrast</div>
        <div className="text-3xl font-bold text-gray-800">{contrast}%</div>
      </div>

      {/* Preview */}
      <div
        className="p-6 rounded-lg"
        style={{
          backgroundColor: `hsl(0, 0%, ${100 - contrast / 2}%)`,
        }}
      >
        <div
          className="text-2xl font-bold"
          style={{ color: `hsl(0, 0%, ${100 - contrast}%)` }}
        >
          Adaptive Text
        </div>
        <div
          className="text-sm mt-2"
          style={{ color: `hsl(0, 0%, ${100 - contrast}%)` }}
        >
          Contrast automatically adjusts based on lighting conditions
        </div>
      </div>
    </div>
  );
}

// Quick contrast adjustment buttons
export function QuickContrastButtons({
  onChange,
}: {
  onChange?: (contrast: number) => void;
}) {
  const presets = [
    { label: 'A-', value: 40, icon: '☁️' },
    { label: 'A', value: 65, icon: '⚡' },
    { label: 'A+', value: 85, icon: '🔥' },
    { label: 'Max', value: 100, icon: '💯' },
  ];

  return (
    <div className="bg-white rounded-xl shadow-lg p-6">
      <h3 className="text-lg font-bold text-gray-800 mb-4">Quick Adjust</h3>

      <div className="grid grid-cols-4 gap-3">
        {presets.map((preset) => (
          <button
            key={preset.label}
            onClick={() => onChange?.(preset.value)}
            className="flex flex-col items-center gap-2 p-4 bg-gray-100 hover:bg-primary-100 rounded-lg transition-colors group"
          >
            <span className="text-2xl">{preset.icon}</span>
            <span className="text-xs font-bold text-gray-700 group-hover:text-primary-700">
              {preset.label}
            </span>
            <span className="text-xs text-gray-500">{preset.value}%</span>
          </button>
        ))}
      </div>
    </div>
  );
}

// Contrast comparison tool
export function ContrastComparison() {
  const [contrastA, setContrastA] = useState(40);
  const [contrastB, setContrastB] = useState(85);

  return (
    <div className="bg-white rounded-2xl shadow-xl p-6">
      <h3 className="text-lg font-bold text-gray-800 mb-6">Compare Contrast Levels</h3>

      <div className="grid grid-cols-2 gap-6">
        {/* Side A */}
        <div>
          <label className="text-sm font-medium text-gray-700 mb-2 block">
            Contrast A: {contrastA}%
          </label>
          <input
            type="range"
            min="0"
            max="100"
            value={contrastA}
            onChange={(e) => setContrastA(parseInt(e.target.value))}
            className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer mb-4"
          />

          <div
            className="p-6 rounded-lg"
            style={{ backgroundColor: `hsl(0, 0%, ${100 - contrastA / 2}%)` }}
          >
            <div
              className="text-xl font-bold mb-2"
              style={{ color: `hsl(0, 0%, ${100 - contrastA}%)` }}
            >
              Sample Text
            </div>
            <div
              className="text-sm"
              style={{ color: `hsl(0, 0%, ${100 - contrastA}%)` }}
            >
              This is a preview of contrast level A
            </div>
          </div>
        </div>

        {/* Side B */}
        <div>
          <label className="text-sm font-medium text-gray-700 mb-2 block">
            Contrast B: {contrastB}%
          </label>
          <input
            type="range"
            min="0"
            max="100"
            value={contrastB}
            onChange={(e) => setContrastB(parseInt(e.target.value))}
            className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer mb-4"
          />

          <div
            className="p-6 rounded-lg"
            style={{ backgroundColor: `hsl(0, 0%, ${100 - contrastB / 2}%)` }}
          >
            <div
              className="text-xl font-bold mb-2"
              style={{ color: `hsl(0, 0%, ${100 - contrastB}%)` }}
            >
              Sample Text
            </div>
            <div
              className="text-sm"
              style={{ color: `hsl(0, 0%, ${100 - contrastB}%)` }}
            >
              This is a preview of contrast level B
            </div>
          </div>
        </div>
      </div>

      {/* Difference indicator */}
      <div className="mt-6 p-4 bg-gray-50 rounded-lg text-center">
        <div className="text-sm text-gray-600 mb-1">Contrast Difference</div>
        <div className="text-2xl font-bold text-gray-800">
          {Math.abs(contrastB - contrastA)}%
        </div>
      </div>
    </div>
  );
}
