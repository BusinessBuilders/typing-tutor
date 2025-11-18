/**
 * Heat Maps Component
 * Step 244 - Create keyboard heat maps for visualization
 */

import { motion } from 'framer-motion';
import { useState } from 'react';
import { useSettingsStore } from '../store/useSettingsStore';

// Key data interface
export interface KeyData {
  key: string;
  frequency: number; // How often this key is pressed
  errors: number; // How many times it was pressed incorrectly
  accuracy: number; // Accuracy percentage for this key
  avgSpeed: number; // Average speed when pressing this key (ms)
}

// Keyboard layout
const KEYBOARD_LAYOUT = [
  ['`', '1', '2', '3', '4', '5', '6', '7', '8', '9', '0', '-', '='],
  ['q', 'w', 'e', 'r', 't', 'y', 'u', 'i', 'o', 'p', '[', ']', '\\'],
  ['a', 's', 'd', 'f', 'g', 'h', 'j', 'k', 'l', ';', "'"],
  ['z', 'x', 'c', 'v', 'b', 'n', 'm', ',', '.', '/'],
  ['space'],
];

// Mock key data
const generateMockKeyData = (): Map<string, KeyData> => {
  const data = new Map<string, KeyData>();
  const commonKeys = 'etaoinshrdlcumwfgypbvkjxqz';

  KEYBOARD_LAYOUT.flat().forEach((key) => {
    const isCommon = commonKeys.includes(key.toLowerCase());
    const baseFrequency = isCommon ? 50 + Math.random() * 150 : 10 + Math.random() * 50;

    data.set(key, {
      key,
      frequency: Math.floor(baseFrequency),
      errors: Math.floor(Math.random() * 10),
      accuracy: 85 + Math.random() * 15,
      avgSpeed: 100 + Math.random() * 200,
    });
  });

  // Special handling for space
  data.set('space', {
    key: 'space',
    frequency: 250,
    errors: 5,
    accuracy: 98,
    avgSpeed: 120,
  });

  return data;
};

// Custom hook for heat maps
export function useHeatMaps() {
  const [keyData] = useState<Map<string, KeyData>>(generateMockKeyData());
  const [displayMode, setDisplayMode] = useState<'frequency' | 'errors' | 'accuracy' | 'speed'>('frequency');

  const getMaxValue = () => {
    const values = Array.from(keyData.values()).map((data) => {
      switch (displayMode) {
        case 'frequency':
          return data.frequency;
        case 'errors':
          return data.errors;
        case 'accuracy':
          return data.accuracy;
        case 'speed':
          return data.avgSpeed;
      }
    });
    return Math.max(...values);
  };

  const getMinValue = () => {
    const values = Array.from(keyData.values()).map((data) => {
      switch (displayMode) {
        case 'frequency':
          return data.frequency;
        case 'errors':
          return data.errors;
        case 'accuracy':
          return data.accuracy;
        case 'speed':
          return data.avgSpeed;
      }
    });
    return Math.min(...values);
  };

  const getHeatColor = (key: string): string => {
    const data = keyData.get(key);
    if (!data) return 'bg-gray-200';

    const max = getMaxValue();
    const min = getMinValue();
    let value = 0;

    switch (displayMode) {
      case 'frequency':
        value = data.frequency;
        break;
      case 'errors':
        value = data.errors;
        break;
      case 'accuracy':
        value = data.accuracy;
        break;
      case 'speed':
        value = data.avgSpeed;
        break;
    }

    const normalized = (value - min) / (max - min);

    if (displayMode === 'errors') {
      // More errors = more red
      if (normalized > 0.8) return 'bg-red-600';
      if (normalized > 0.6) return 'bg-red-500';
      if (normalized > 0.4) return 'bg-orange-500';
      if (normalized > 0.2) return 'bg-yellow-500';
      return 'bg-green-500';
    } else if (displayMode === 'accuracy') {
      // Higher accuracy = more green
      if (normalized > 0.8) return 'bg-green-600';
      if (normalized > 0.6) return 'bg-green-500';
      if (normalized > 0.4) return 'bg-yellow-500';
      if (normalized > 0.2) return 'bg-orange-500';
      return 'bg-red-500';
    } else {
      // Frequency/Speed: more = more intense
      if (normalized > 0.8) return 'bg-purple-600';
      if (normalized > 0.6) return 'bg-purple-500';
      if (normalized > 0.4) return 'bg-blue-500';
      if (normalized > 0.2) return 'bg-cyan-500';
      return 'bg-gray-400';
    }
  };

  const getTopKeys = (mode: 'most' | 'least', count: number = 5) => {
    const sorted = Array.from(keyData.values()).sort((a, b) => {
      const valA = displayMode === 'frequency' ? a.frequency :
                   displayMode === 'errors' ? a.errors :
                   displayMode === 'accuracy' ? a.accuracy :
                   a.avgSpeed;

      const valB = displayMode === 'frequency' ? b.frequency :
                   displayMode === 'errors' ? b.errors :
                   displayMode === 'accuracy' ? b.accuracy :
                   b.avgSpeed;

      return mode === 'most' ? valB - valA : valA - valB;
    });

    return sorted.slice(0, count);
  };

  return {
    keyData,
    displayMode,
    setDisplayMode,
    getHeatColor,
    getTopKeys,
    getMaxValue,
    getMinValue,
  };
}

// Main heat maps component
export default function HeatMaps() {
  const {
    keyData,
    displayMode,
    setDisplayMode,
    getHeatColor,
    getTopKeys,
  } = useHeatMaps();

  const { settings } = useSettingsStore();
  const [hoveredKey, setHoveredKey] = useState<string | null>(null);

  const mostUsed = getTopKeys('most', 5);
  const leastUsed = getTopKeys('least', 5);

  return (
    <div className="bg-white rounded-2xl shadow-xl p-8">
      <h2 className="text-2xl font-bold text-gray-800 mb-6 text-center">
        🗺️ Keyboard Heat Map
      </h2>

      {/* Display mode selector */}
      <div className="mb-8 flex justify-center gap-2 flex-wrap">
        {[
          { mode: 'frequency', label: 'Usage Frequency', icon: '📊' },
          { mode: 'errors', label: 'Error Rate', icon: '❌' },
          { mode: 'accuracy', label: 'Accuracy', icon: '🎯' },
          { mode: 'speed', label: 'Speed', icon: '⚡' },
        ].map(({ mode, label, icon }) => (
          <button
            key={mode}
            onClick={() => setDisplayMode(mode as typeof displayMode)}
            className={`px-6 py-3 rounded-lg font-bold transition-colors ${
              displayMode === mode
                ? 'bg-purple-500 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            {icon} {label}
          </button>
        ))}
      </div>

      {/* Keyboard visualization */}
      <div className="mb-8 bg-gray-50 rounded-xl p-8">
        <div className="max-w-4xl mx-auto">
          {KEYBOARD_LAYOUT.map((row, rowIndex) => (
            <div
              key={rowIndex}
              className="flex justify-center gap-2 mb-2"
              style={{ marginLeft: rowIndex === 1 ? '2rem' : rowIndex === 2 ? '2.5rem' : rowIndex === 3 ? '3.5rem' : 0 }}
            >
              {row.map((key, keyIndex) => {
                const heatColor = getHeatColor(key);

                return (
                  <motion.div
                    key={key}
                    initial={{ scale: 0, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ delay: settings.reducedMotion ? 0 : (rowIndex * 0.1 + keyIndex * 0.02) }}
                    onMouseEnter={() => setHoveredKey(key)}
                    onMouseLeave={() => setHoveredKey(null)}
                    className={`
                      ${key === 'space' ? 'w-96' : 'w-12'} h-12
                      ${heatColor}
                      rounded-lg flex items-center justify-center
                      text-white font-bold text-sm
                      cursor-pointer transition-all
                      ${hoveredKey === key ? 'scale-110 z-10 ring-4 ring-white shadow-2xl' : ''}
                    `}
                  >
                    {key === 'space' ? 'SPACE' : key.toUpperCase()}
                  </motion.div>
                );
              })}
            </div>
          ))}
        </div>

        {/* Hovered key details */}
        {hoveredKey && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-6 bg-gray-900 text-white rounded-xl p-6 max-w-md mx-auto"
          >
            <div className="text-center">
              <div className="text-5xl font-bold mb-4">
                {hoveredKey === 'space' ? 'SPACE' : hoveredKey.toUpperCase()}
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <div className="text-sm opacity-80">Frequency</div>
                  <div className="text-2xl font-bold">
                    {keyData.get(hoveredKey)?.frequency}
                  </div>
                </div>
                <div>
                  <div className="text-sm opacity-80">Errors</div>
                  <div className="text-2xl font-bold">
                    {keyData.get(hoveredKey)?.errors}
                  </div>
                </div>
                <div>
                  <div className="text-sm opacity-80">Accuracy</div>
                  <div className="text-2xl font-bold">
                    {keyData.get(hoveredKey)?.accuracy.toFixed(1)}%
                  </div>
                </div>
                <div>
                  <div className="text-sm opacity-80">Avg Speed</div>
                  <div className="text-2xl font-bold">
                    {keyData.get(hoveredKey)?.avgSpeed}ms
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </div>

      {/* Key statistics */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Most used/problematic keys */}
        <div className="bg-gray-50 rounded-xl p-6">
          <h3 className="text-lg font-bold text-gray-900 mb-4">
            {displayMode === 'frequency' && 'Most Used Keys'}
            {displayMode === 'errors' && 'Most Problematic Keys'}
            {displayMode === 'accuracy' && 'Most Accurate Keys'}
            {displayMode === 'speed' && 'Fastest Keys'}
          </h3>
          <div className="space-y-3">
            {mostUsed.map((data, index) => (
              <motion.div
                key={data.key}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: settings.reducedMotion ? 0 : index * 0.05 }}
                className="flex items-center justify-between p-3 bg-white rounded-lg"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                    <span className="text-xl font-bold text-purple-600">
                      {data.key === 'space' ? '␣' : data.key.toUpperCase()}
                    </span>
                  </div>
                  <div className="text-sm text-gray-600">
                    {data.key === 'space' ? 'Space bar' : `'${data.key}' key`}
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-xl font-bold text-purple-600">
                    {displayMode === 'frequency' && data.frequency}
                    {displayMode === 'errors' && data.errors}
                    {displayMode === 'accuracy' && `${data.accuracy.toFixed(1)}%`}
                    {displayMode === 'speed' && `${data.avgSpeed}ms`}
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Least used/problematic keys */}
        <div className="bg-gray-50 rounded-xl p-6">
          <h3 className="text-lg font-bold text-gray-900 mb-4">
            {displayMode === 'frequency' && 'Least Used Keys'}
            {displayMode === 'errors' && 'Least Problematic Keys'}
            {displayMode === 'accuracy' && 'Least Accurate Keys'}
            {displayMode === 'speed' && 'Slowest Keys'}
          </h3>
          <div className="space-y-3">
            {leastUsed.map((data, index) => (
              <motion.div
                key={data.key}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: settings.reducedMotion ? 0 : index * 0.05 }}
                className="flex items-center justify-between p-3 bg-white rounded-lg"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                    <span className="text-xl font-bold text-blue-600">
                      {data.key === 'space' ? '␣' : data.key.toUpperCase()}
                    </span>
                  </div>
                  <div className="text-sm text-gray-600">
                    {data.key === 'space' ? 'Space bar' : `'${data.key}' key`}
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-xl font-bold text-blue-600">
                    {displayMode === 'frequency' && data.frequency}
                    {displayMode === 'errors' && data.errors}
                    {displayMode === 'accuracy' && `${data.accuracy.toFixed(1)}%`}
                    {displayMode === 'speed' && `${data.avgSpeed}ms`}
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>

      {/* Legend */}
      <div className="mt-8 bg-gray-50 rounded-xl p-6">
        <h3 className="text-lg font-bold text-gray-900 mb-4">Heat Map Legend</h3>
        <div className="flex items-center gap-2">
          <span className="text-sm text-gray-600">Low</span>
          <div className="flex-1 h-8 rounded-lg overflow-hidden flex">
            {displayMode === 'errors' ? (
              <>
                <div className="flex-1 bg-green-500" />
                <div className="flex-1 bg-yellow-500" />
                <div className="flex-1 bg-orange-500" />
                <div className="flex-1 bg-red-500" />
                <div className="flex-1 bg-red-600" />
              </>
            ) : displayMode === 'accuracy' ? (
              <>
                <div className="flex-1 bg-red-500" />
                <div className="flex-1 bg-orange-500" />
                <div className="flex-1 bg-yellow-500" />
                <div className="flex-1 bg-green-500" />
                <div className="flex-1 bg-green-600" />
              </>
            ) : (
              <>
                <div className="flex-1 bg-gray-400" />
                <div className="flex-1 bg-cyan-500" />
                <div className="flex-1 bg-blue-500" />
                <div className="flex-1 bg-purple-500" />
                <div className="flex-1 bg-purple-600" />
              </>
            )}
          </div>
          <span className="text-sm text-gray-600">High</span>
        </div>
        <div className="mt-3 text-sm text-gray-600 text-center">
          {displayMode === 'frequency' && 'Darker colors indicate more frequent key presses'}
          {displayMode === 'errors' && 'Red colors indicate more errors on that key'}
          {displayMode === 'accuracy' && 'Green colors indicate higher accuracy on that key'}
          {displayMode === 'speed' && 'Darker colors indicate faster typing speed'}
        </div>
      </div>
    </div>
  );
}
