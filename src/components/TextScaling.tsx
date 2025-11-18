import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';

// Types
export type TextScale =
  | 'extra-small'
  | 'small'
  | 'medium'
  | 'large'
  | 'extra-large'
  | 'huge';

export interface TextScaleSettings {
  scale: TextScale;
  applyToUI: boolean;
  applyToContent: boolean;
  scaleLineHeight: boolean;
  scaleLetterSpacing: boolean;
  maintainLayout: boolean;
}

export interface TextScalePreset {
  scale: TextScale;
  name: string;
  description: string;
  percentage: number;
  baseFontSize: number; // in pixels
  lineHeight: number;
  letterSpacing: number; // in em
  recommended: string;
}

// Text scale presets
const textScalePresets: TextScalePreset[] = [
  {
    scale: 'extra-small',
    name: 'Extra Small',
    description: 'Compact text for maximum content density',
    percentage: 75,
    baseFontSize: 12,
    lineHeight: 1.4,
    letterSpacing: 0,
    recommended: 'Users with excellent vision',
  },
  {
    scale: 'small',
    name: 'Small',
    description: 'Slightly smaller than standard',
    percentage: 87.5,
    baseFontSize: 14,
    lineHeight: 1.5,
    letterSpacing: 0.01,
    recommended: 'General use with good vision',
  },
  {
    scale: 'medium',
    name: 'Medium (Standard)',
    description: 'Default size for comfortable reading',
    percentage: 100,
    baseFontSize: 16,
    lineHeight: 1.6,
    letterSpacing: 0.02,
    recommended: 'Standard for most users',
  },
  {
    scale: 'large',
    name: 'Large',
    description: 'Larger text for better readability',
    percentage: 125,
    baseFontSize: 20,
    lineHeight: 1.7,
    letterSpacing: 0.03,
    recommended: 'Users with mild vision impairment',
  },
  {
    scale: 'extra-large',
    name: 'Extra Large',
    description: 'Significantly larger for accessibility',
    percentage: 150,
    baseFontSize: 24,
    lineHeight: 1.8,
    letterSpacing: 0.04,
    recommended: 'Users with moderate vision impairment',
  },
  {
    scale: 'huge',
    name: 'Huge',
    description: 'Maximum size for severe vision impairment',
    percentage: 200,
    baseFontSize: 32,
    lineHeight: 2.0,
    letterSpacing: 0.05,
    recommended: 'Users with severe vision impairment',
  },
];

// Custom hook
function useTextScaling() {
  const [settings, setSettings] = useState<TextScaleSettings>({
    scale: 'medium',
    applyToUI: true,
    applyToContent: true,
    scaleLineHeight: true,
    scaleLetterSpacing: true,
    maintainLayout: true,
  });

  const [currentPreset, setCurrentPreset] = useState<TextScalePreset>(
    textScalePresets[2] // Medium
  );

  useEffect(() => {
    const preset = textScalePresets.find((p) => p.scale === settings.scale);
    if (preset) {
      setCurrentPreset(preset);
      applyScaling(preset);
    }
  }, [settings]);

  const applyScaling = (preset: TextScalePreset) => {
    const root = document.documentElement;

    if (settings.applyToUI || settings.applyToContent) {
      // Base font size
      root.style.setProperty('--text-scale-base', `${preset.baseFontSize}px`);
      root.style.setProperty('--text-scale-percentage', `${preset.percentage}%`);

      // Line height
      if (settings.scaleLineHeight) {
        root.style.setProperty('--text-scale-line-height', preset.lineHeight.toString());
      }

      // Letter spacing
      if (settings.scaleLetterSpacing) {
        root.style.setProperty('--text-scale-letter-spacing', `${preset.letterSpacing}em`);
      }

      // Font sizes for different elements
      root.style.setProperty('--text-xs', `${preset.baseFontSize * 0.75}px`);
      root.style.setProperty('--text-sm', `${preset.baseFontSize * 0.875}px`);
      root.style.setProperty('--text-base', `${preset.baseFontSize}px`);
      root.style.setProperty('--text-lg', `${preset.baseFontSize * 1.125}px`);
      root.style.setProperty('--text-xl', `${preset.baseFontSize * 1.25}px`);
      root.style.setProperty('--text-2xl', `${preset.baseFontSize * 1.5}px`);
      root.style.setProperty('--text-3xl', `${preset.baseFontSize * 1.875}px`);
      root.style.setProperty('--text-4xl', `${preset.baseFontSize * 2.25}px`);
    }
  };

  const setScale = (scale: TextScale) => {
    setSettings((prev) => ({ ...prev, scale }));
  };

  const increaseScale = () => {
    const currentIndex = textScalePresets.findIndex((p) => p.scale === settings.scale);
    if (currentIndex < textScalePresets.length - 1) {
      setScale(textScalePresets[currentIndex + 1].scale);
    }
  };

  const decreaseScale = () => {
    const currentIndex = textScalePresets.findIndex((p) => p.scale === settings.scale);
    if (currentIndex > 0) {
      setScale(textScalePresets[currentIndex - 1].scale);
    }
  };

  const updateSettings = (newSettings: Partial<TextScaleSettings>) => {
    setSettings((prev) => ({ ...prev, ...newSettings }));
  };

  const resetToDefault = () => {
    setSettings({
      scale: 'medium',
      applyToUI: true,
      applyToContent: true,
      scaleLineHeight: true,
      scaleLetterSpacing: true,
      maintainLayout: true,
    });
  };

  return {
    settings,
    currentPreset,
    presets: textScalePresets,
    setScale,
    increaseScale,
    decreaseScale,
    updateSettings,
    resetToDefault,
  };
}

// Preset preview component
function PresetPreview({ preset, isActive }: { preset: TextScalePreset; isActive: boolean }) {
  return (
    <div
      className={`p-6 rounded-lg border-2 transition-all ${
        isActive ? 'border-blue-500 bg-blue-50' : 'border-gray-200 bg-white'
      }`}
    >
      <div className="mb-4">
        <h3 className="text-lg font-bold mb-1">{preset.name}</h3>
        <p className="text-sm text-gray-600 mb-2">{preset.description}</p>
        <div className="flex items-center gap-2 text-xs text-gray-500">
          <span className="px-2 py-1 bg-gray-100 rounded">{preset.percentage}%</span>
          <span className="px-2 py-1 bg-gray-100 rounded">{preset.baseFontSize}px</span>
        </div>
      </div>

      {/* Sample text at this size */}
      <div
        className="p-4 bg-gray-50 rounded border"
        style={{
          fontSize: `${preset.baseFontSize}px`,
          lineHeight: preset.lineHeight,
          letterSpacing: `${preset.letterSpacing}em`,
        }}
      >
        <p className="mb-2">
          The quick brown fox jumps over the lazy dog.
        </p>
        <p className="text-gray-600 text-sm">
          Recommended: {preset.recommended}
        </p>
      </div>
    </div>
  );
}

// Main component
export default function TextScaling() {
  const {
    settings,
    currentPreset,
    presets,
    setScale,
    increaseScale,
    decreaseScale,
    updateSettings,
    resetToDefault,
  } = useTextScaling();

  const [activeTab, setActiveTab] = useState<'presets' | 'settings' | 'preview'>('presets');

  const canIncrease = settings.scale !== 'huge';
  const canDecrease = settings.scale !== 'extra-small';

  return (
    <div className="max-w-6xl mx-auto p-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Text Scaling</h1>
        <p className="text-gray-600">
          Adjust text size for comfortable reading
        </p>
      </div>

      {/* Current scale indicator */}
      <div className="bg-white p-6 rounded-lg border mb-6">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold mb-1">
              Current Scale: {currentPreset.name}
            </h3>
            <p className="text-sm text-gray-600">
              {currentPreset.baseFontSize}px base size ({currentPreset.percentage}%)
            </p>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={decreaseScale}
              disabled={!canDecrease}
              className="px-4 py-2 bg-gray-100 hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed text-gray-700 rounded-lg font-medium transition-colors"
              title="Decrease text size"
            >
              A−
            </button>
            <button
              onClick={resetToDefault}
              className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg text-sm font-medium transition-colors"
            >
              Reset
            </button>
            <button
              onClick={increaseScale}
              disabled={!canIncrease}
              className="px-4 py-2 bg-gray-100 hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed text-gray-700 rounded-lg font-medium transition-colors text-lg"
              title="Increase text size"
            >
              A+
            </button>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-white p-6 rounded-lg border">
          <div className="text-3xl font-bold text-blue-600 mb-1">
            {currentPreset.baseFontSize}px
          </div>
          <div className="text-sm text-gray-600">Base Font Size</div>
        </div>

        <div className="bg-white p-6 rounded-lg border">
          <div className="text-3xl font-bold text-green-600 mb-1">
            {currentPreset.percentage}%
          </div>
          <div className="text-sm text-gray-600">Scale Percentage</div>
        </div>

        <div className="bg-white p-6 rounded-lg border">
          <div className="text-3xl font-bold text-purple-600 mb-1">
            {currentPreset.lineHeight}
          </div>
          <div className="text-sm text-gray-600">Line Height</div>
        </div>

        <div className="bg-white p-6 rounded-lg border">
          <div className="text-3xl font-bold text-orange-600 mb-1">
            {presets.length}
          </div>
          <div className="text-sm text-gray-600">Available Scales</div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 mb-6 border-b">
        {(['presets', 'settings', 'preview'] as const).map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-6 py-3 font-medium transition-colors border-b-2 -mb-px ${
              activeTab === tab
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            {tab.charAt(0).toUpperCase() + tab.slice(1)}
          </button>
        ))}
      </div>

      {/* Presets Tab */}
      {activeTab === 'presets' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {presets.map((preset) => (
            <motion.div
              key={preset.scale}
              whileHover={{ scale: 1.02 }}
              className="cursor-pointer"
              onClick={() => setScale(preset.scale)}
            >
              <PresetPreview
                preset={preset}
                isActive={settings.scale === preset.scale}
              />
            </motion.div>
          ))}
        </div>
      )}

      {/* Settings Tab */}
      {activeTab === 'settings' && (
        <div className="bg-white p-6 rounded-lg border space-y-6">
          <div>
            <h3 className="text-lg font-semibold mb-4">Text Scaling Settings</h3>

            <div className="space-y-4">
              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={settings.applyToUI}
                  onChange={(e) => updateSettings({ applyToUI: e.target.checked })}
                  className="w-5 h-5"
                />
                <div>
                  <div className="font-medium">Apply to User Interface</div>
                  <div className="text-sm text-gray-600">
                    Scale all UI elements (buttons, menus, etc.)
                  </div>
                </div>
              </label>

              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={settings.applyToContent}
                  onChange={(e) => updateSettings({ applyToContent: e.target.checked })}
                  className="w-5 h-5"
                />
                <div>
                  <div className="font-medium">Apply to Content</div>
                  <div className="text-sm text-gray-600">
                    Scale content text (lessons, instructions, etc.)
                  </div>
                </div>
              </label>

              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={settings.scaleLineHeight}
                  onChange={(e) => updateSettings({ scaleLineHeight: e.target.checked })}
                  className="w-5 h-5"
                />
                <div>
                  <div className="font-medium">Scale Line Height</div>
                  <div className="text-sm text-gray-600">
                    Adjust line spacing with font size
                  </div>
                </div>
              </label>

              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={settings.scaleLetterSpacing}
                  onChange={(e) => updateSettings({ scaleLetterSpacing: e.target.checked })}
                  className="w-5 h-5"
                />
                <div>
                  <div className="font-medium">Scale Letter Spacing</div>
                  <div className="text-sm text-gray-600">
                    Adjust spacing between letters
                  </div>
                </div>
              </label>

              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={settings.maintainLayout}
                  onChange={(e) => updateSettings({ maintainLayout: e.target.checked })}
                  className="w-5 h-5"
                />
                <div>
                  <div className="font-medium">Maintain Layout</div>
                  <div className="text-sm text-gray-600">
                    Try to preserve page layout when scaling
                  </div>
                </div>
              </label>
            </div>
          </div>

          <div className="border-t pt-6">
            <h3 className="text-lg font-semibold mb-4">Keyboard Shortcuts</h3>
            <div className="space-y-2 text-sm">
              <div className="flex items-center justify-between p-3 bg-gray-50 rounded">
                <span>Increase text size</span>
                <kbd className="px-2 py-1 bg-white border rounded font-mono text-xs">
                  Ctrl/Cmd + +
                </kbd>
              </div>
              <div className="flex items-center justify-between p-3 bg-gray-50 rounded">
                <span>Decrease text size</span>
                <kbd className="px-2 py-1 bg-white border rounded font-mono text-xs">
                  Ctrl/Cmd + -
                </kbd>
              </div>
              <div className="flex items-center justify-between p-3 bg-gray-50 rounded">
                <span>Reset to default</span>
                <kbd className="px-2 py-1 bg-white border rounded font-mono text-xs">
                  Ctrl/Cmd + 0
                </kbd>
              </div>
            </div>
          </div>

          <div className="border-t pt-6">
            <h3 className="text-lg font-semibold mb-4">Accessibility Guidelines</h3>
            <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
              <div className="text-sm space-y-2 text-blue-900">
                <p className="font-medium">WCAG 2.1 Requirements:</p>
                <ul className="list-disc list-inside space-y-1 ml-2">
                  <li>Text must be resizable up to 200% without loss of content</li>
                  <li>Users should be able to increase text size without assistive technology</li>
                  <li>Layout should remain functional at different text sizes</li>
                  <li>No horizontal scrolling should be needed at 200% zoom</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Preview Tab */}
      {activeTab === 'preview' && (
        <div className="space-y-6">
          <div className="bg-white p-8 rounded-lg border">
            <h2
              className="mb-6 font-bold"
              style={{
                fontSize: `${currentPreset.baseFontSize * 2.25}px`,
                lineHeight: settings.scaleLineHeight ? currentPreset.lineHeight : 1.2,
                letterSpacing: settings.scaleLetterSpacing ? `${currentPreset.letterSpacing}em` : 'normal',
              }}
            >
              Preview: {currentPreset.name}
            </h2>

            <div className="space-y-6">
              {/* Heading samples */}
              <div>
                <h3
                  className="mb-3 font-semibold"
                  style={{
                    fontSize: `${currentPreset.baseFontSize * 1.5}px`,
                    lineHeight: settings.scaleLineHeight ? currentPreset.lineHeight : 1.4,
                    letterSpacing: settings.scaleLetterSpacing ? `${currentPreset.letterSpacing}em` : 'normal',
                  }}
                >
                  Heading Example
                </h3>
                <p
                  className="mb-4"
                  style={{
                    fontSize: `${currentPreset.baseFontSize}px`,
                    lineHeight: settings.scaleLineHeight ? currentPreset.lineHeight : 1.6,
                    letterSpacing: settings.scaleLetterSpacing ? `${currentPreset.letterSpacing}em` : 'normal',
                  }}
                >
                  This is a paragraph of body text at the {currentPreset.name.toLowerCase()} size.
                  The quick brown fox jumps over the lazy dog. This sentence demonstrates how
                  text appears at the current scale setting with all letters of the alphabet.
                </p>
                <p
                  className="text-gray-600"
                  style={{
                    fontSize: `${currentPreset.baseFontSize * 0.875}px`,
                    lineHeight: settings.scaleLineHeight ? currentPreset.lineHeight : 1.5,
                    letterSpacing: settings.scaleLetterSpacing ? `${currentPreset.letterSpacing}em` : 'normal',
                  }}
                >
                  This is smaller text, often used for secondary information or captions.
                  It should still be readable at the current scale.
                </p>
              </div>

              {/* List example */}
              <div>
                <h4
                  className="mb-2 font-semibold"
                  style={{
                    fontSize: `${currentPreset.baseFontSize * 1.125}px`,
                    lineHeight: settings.scaleLineHeight ? currentPreset.lineHeight : 1.5,
                  }}
                >
                  List Example
                </h4>
                <ul
                  className="list-disc list-inside space-y-1"
                  style={{
                    fontSize: `${currentPreset.baseFontSize}px`,
                    lineHeight: settings.scaleLineHeight ? currentPreset.lineHeight : 1.6,
                    letterSpacing: settings.scaleLetterSpacing ? `${currentPreset.letterSpacing}em` : 'normal',
                  }}
                >
                  <li>First item in the list</li>
                  <li>Second item in the list</li>
                  <li>Third item in the list</li>
                </ul>
              </div>

              {/* Button example */}
              <div>
                <h4
                  className="mb-2 font-semibold"
                  style={{
                    fontSize: `${currentPreset.baseFontSize * 1.125}px`,
                    lineHeight: settings.scaleLineHeight ? currentPreset.lineHeight : 1.5,
                  }}
                >
                  Button Example
                </h4>
                <button
                  className="px-6 py-3 bg-blue-500 text-white rounded-lg font-medium hover:bg-blue-600 transition-colors"
                  style={{
                    fontSize: `${currentPreset.baseFontSize}px`,
                  }}
                >
                  Click Me
                </button>
              </div>

              {/* Code example */}
              <div>
                <h4
                  className="mb-2 font-semibold"
                  style={{
                    fontSize: `${currentPreset.baseFontSize * 1.125}px`,
                    lineHeight: settings.scaleLineHeight ? currentPreset.lineHeight : 1.5,
                  }}
                >
                  Monospace Text Example
                </h4>
                <code
                  className="block p-4 bg-gray-900 text-green-400 rounded font-mono"
                  style={{
                    fontSize: `${currentPreset.baseFontSize * 0.875}px`,
                    lineHeight: settings.scaleLineHeight ? currentPreset.lineHeight : 1.8,
                  }}
                >
                  const message = "Hello, World!";
                  console.log(message);
                </code>
              </div>
            </div>
          </div>

          {/* Readability tip */}
          <div className="bg-green-50 p-6 rounded-lg border border-green-200">
            <div className="flex items-start gap-3">
              <div className="text-2xl">💡</div>
              <div>
                <h4 className="font-semibold text-green-900 mb-1">
                  Readability Tip
                </h4>
                <p className="text-sm text-green-800">
                  The optimal line length for reading is 50-75 characters. If lines become
                  too short or too long at your current scale, consider adjusting the
                  "Maintain Layout" setting.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
