/**
 * Letter Spacing Controls Component
 * Step 133 - Adjustable letter spacing for readability
 */

import { motion } from 'framer-motion';
import { useState } from 'react';
import { useSettingsStore } from '../store/useSettingsStore';

export type LetterSpacing =
  | 'tighter'
  | 'tight'
  | 'normal'
  | 'wide'
  | 'wider'
  | 'widest';

export interface LetterSpacingConfig {
  id: LetterSpacing;
  name: string;
  className: string;
  pixels: number;
  recommended: string;
}

export const letterSpacingOptions: Record<LetterSpacing, LetterSpacingConfig> = {
  tighter: {
    id: 'tighter',
    name: 'Tighter',
    className: 'tracking-tighter',
    pixels: -0.05,
    recommended: 'Compact text',
  },
  tight: {
    id: 'tight',
    name: 'Tight',
    className: 'tracking-tight',
    pixels: -0.025,
    recommended: 'Slightly condensed',
  },
  normal: {
    id: 'normal',
    name: 'Normal',
    className: 'tracking-normal',
    pixels: 0,
    recommended: 'Standard spacing',
  },
  wide: {
    id: 'wide',
    name: 'Wide',
    className: 'tracking-wide',
    pixels: 0.025,
    recommended: 'Better readability',
  },
  wider: {
    id: 'wider',
    name: 'Wider',
    className: 'tracking-wider',
    pixels: 0.05,
    recommended: 'Dyslexia-friendly',
  },
  widest: {
    id: 'widest',
    name: 'Widest',
    className: 'tracking-widest',
    pixels: 0.1,
    recommended: 'Maximum separation',
  },
};

export interface LetterSpacingControlsProps {
  currentSpacing: LetterSpacing;
  onSpacingChange: (spacing: LetterSpacing) => void;
  showPreview?: boolean;
}

export default function LetterSpacingControls({
  currentSpacing,
  onSpacingChange,
  showPreview = true,
}: LetterSpacingControlsProps) {
  const { settings } = useSettingsStore();

  const spacingOptions: LetterSpacing[] = [
    'tighter',
    'tight',
    'normal',
    'wide',
    'wider',
    'widest',
  ];

  return (
    <div className="bg-white rounded-xl shadow-lg p-6 space-y-6">
      <h3 className="text-lg font-bold text-gray-800 flex items-center space-x-2">
        <span>↔️</span>
        <span>Letter Spacing</span>
      </h3>

      {/* Spacing options */}
      <div className="space-y-3">
        {spacingOptions.map((spacing) => {
          const config = letterSpacingOptions[spacing];
          const isSelected = currentSpacing === spacing;

          return (
            <motion.button
              key={spacing}
              onClick={() => onSpacingChange(spacing)}
              whileHover={{ scale: settings.reducedMotion ? 1 : 1.02 }}
              whileTap={{ scale: settings.reducedMotion ? 1 : 0.98 }}
              className={`
                w-full p-4 rounded-lg border-2 text-left transition-all
                ${
                  isSelected
                    ? 'border-primary-500 bg-primary-50'
                    : 'border-gray-200 hover:border-primary-300 hover:bg-gray-50'
                }
              `}
            >
              <div className="flex items-center justify-between">
                <div>
                  <div className="font-bold text-gray-800">{config.name}</div>
                  <div className="text-xs text-primary-600 mt-1">
                    💡 {config.recommended}
                  </div>
                </div>

                {/* Visual indicator */}
                <div className="flex space-x-1">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <div
                      key={i}
                      className="w-1 h-8 bg-gray-400 rounded"
                      style={{
                        marginRight: `${Math.abs(config.pixels) * 20}px`,
                      }}
                    />
                  ))}
                </div>
              </div>
            </motion.button>
          );
        })}
      </div>

      {/* Live preview */}
      {showPreview && (
        <div className="mt-6 p-6 bg-gray-50 rounded-lg">
          <div className="text-sm text-gray-600 mb-3">Preview:</div>
          <div
            className={`
              ${letterSpacingOptions[currentSpacing].className}
              text-2xl text-gray-800 font-medium
            `}
          >
            The quick brown fox jumps over the lazy dog
          </div>
        </div>
      )}

      {/* Slider control */}
      <div className="mt-6">
        <label className="text-sm font-medium text-gray-700 mb-2 block">
          Adjust with slider:
        </label>
        <input
          type="range"
          min="0"
          max="5"
          value={spacingOptions.indexOf(currentSpacing)}
          onChange={(e) => {
            const index = parseInt(e.target.value);
            onSpacingChange(spacingOptions[index]);
          }}
          className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
        />
        <div className="flex justify-between text-xs text-gray-600 mt-1">
          <span>Tight</span>
          <span>Wide</span>
        </div>
      </div>
    </div>
  );
}

// Letter spacing comparison view
export function LetterSpacingComparison() {
  const spacings: LetterSpacing[] = ['tight', 'normal', 'wide', 'wider', 'widest'];

  return (
    <div className="bg-white rounded-xl shadow-lg p-6 space-y-6">
      <h3 className="text-lg font-bold text-gray-800">Letter Spacing Comparison</h3>

      <div className="space-y-6">
        {spacings.map((spacing) => {
          const config = letterSpacingOptions[spacing];

          return (
            <div key={spacing} className="border-b border-gray-200 pb-4 last:border-b-0">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-gray-600">
                  {config.name}
                </span>
                <span className="text-xs text-gray-500">{config.recommended}</span>
              </div>
              <div className={`${config.className} text-xl text-gray-800`}>
                The quick brown fox jumps over the lazy dog
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// Word spacing component (related to letter spacing)
export interface WordSpacingControlsProps {
  currentSpacing: number; // in pixels
  onSpacingChange: (spacing: number) => void;
}

export function WordSpacingControls({
  currentSpacing,
  onSpacingChange,
}: WordSpacingControlsProps) {
  const { settings } = useSettingsStore();
  const [tempSpacing, setTempSpacing] = useState(currentSpacing);

  const spacingPresets = [
    { name: 'Tight', value: 4 },
    { name: 'Normal', value: 8 },
    { name: 'Comfortable', value: 12 },
    { name: 'Spacious', value: 16 },
    { name: 'Wide', value: 24 },
  ];

  return (
    <div className="bg-white rounded-xl shadow-lg p-6 space-y-6">
      <h3 className="text-lg font-bold text-gray-800 flex items-center space-x-2">
        <span>⬌</span>
        <span>Word Spacing</span>
      </h3>

      {/* Preset buttons */}
      <div className="grid grid-cols-5 gap-2">
        {spacingPresets.map((preset) => {
          const isSelected = currentSpacing === preset.value;

          return (
            <motion.button
              key={preset.name}
              onClick={() => {
                setTempSpacing(preset.value);
                onSpacingChange(preset.value);
              }}
              whileHover={{ scale: settings.reducedMotion ? 1 : 1.05 }}
              whileTap={{ scale: settings.reducedMotion ? 1 : 0.95 }}
              className={`
                py-3 rounded-lg font-medium text-sm transition-all
                ${
                  isSelected
                    ? 'bg-primary-500 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }
              `}
            >
              {preset.name}
            </motion.button>
          );
        })}
      </div>

      {/* Custom slider */}
      <div>
        <label className="text-sm font-medium text-gray-700 mb-2 block">
          Custom spacing: {tempSpacing}px
        </label>
        <input
          type="range"
          min="2"
          max="32"
          step="2"
          value={tempSpacing}
          onChange={(e) => {
            const value = parseInt(e.target.value);
            setTempSpacing(value);
            onSpacingChange(value);
          }}
          className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
        />
      </div>

      {/* Preview */}
      <div className="p-6 bg-gray-50 rounded-lg">
        <div className="text-sm text-gray-600 mb-3">Preview:</div>
        <div className="text-xl text-gray-800 font-medium flex flex-wrap">
          {['The', 'quick', 'brown', 'fox', 'jumps'].map((word, index) => (
            <span
              key={index}
              style={{ marginRight: `${tempSpacing}px` }}
              className="inline-block"
            >
              {word}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}

// Combined spacing controls
export function CombinedSpacingControls() {
  const [letterSpacing, setLetterSpacing] = useState<LetterSpacing>('normal');
  const [wordSpacing, setWordSpacing] = useState(8);

  return (
    <div className="space-y-6">
      <LetterSpacingControls
        currentSpacing={letterSpacing}
        onSpacingChange={setLetterSpacing}
        showPreview={false}
      />

      <WordSpacingControls
        currentSpacing={wordSpacing}
        onSpacingChange={setWordSpacing}
      />

      {/* Combined preview */}
      <div className="bg-white rounded-xl shadow-lg p-6">
        <h3 className="text-lg font-bold text-gray-800 mb-4">Combined Preview</h3>
        <div className="p-6 bg-gray-50 rounded-lg">
          <div
            className={`
              ${letterSpacingOptions[letterSpacing].className}
              text-2xl text-gray-800 font-medium
            `}
          >
            {['The', 'quick', 'brown', 'fox', 'jumps', 'over', 'the', 'lazy', 'dog'].map(
              (word, index) => (
                <span
                  key={index}
                  style={{ marginRight: `${wordSpacing}px` }}
                  className="inline-block"
                >
                  {word}
                </span>
              )
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
