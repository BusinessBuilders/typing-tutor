/**
 * Speech Controls Component
 * Step 183 - Rate, pitch, and volume controls for TTS
 */

import { motion } from 'framer-motion';
import { useState } from 'react';
import { useTextToSpeech } from './TextToSpeech';

export interface SpeechControlsProps {
  onRateChange?: (rate: number) => void;
  onPitchChange?: (pitch: number) => void;
  onVolumeChange?: (volume: number) => void;
}

export default function SpeechControls({
  onRateChange,
  onPitchChange,
  onVolumeChange,
}: SpeechControlsProps) {
  const [rate, setRate] = useState(1);
  const [pitch, setPitch] = useState(1);
  const [volume, setVolume] = useState(1);

  const handleRateChange = (value: number) => {
    setRate(value);
    onRateChange?.(value);
  };

  const handlePitchChange = (value: number) => {
    setPitch(value);
    onPitchChange?.(value);
  };

  const handleVolumeChange = (value: number) => {
    setVolume(value);
    onVolumeChange?.(value);
  };

  return (
    <div className="bg-white rounded-2xl shadow-xl p-8">
      <h2 className="text-2xl font-bold text-gray-800 mb-6 text-center">
        Speech Controls
      </h2>

      <div className="space-y-6">
        {/* Rate control */}
        <div>
          <div className="flex justify-between items-center mb-2">
            <label className="text-sm font-bold text-gray-700">
              Speed
            </label>
            <span className="text-sm text-gray-600">{rate.toFixed(1)}x</span>
          </div>
          <input
            type="range"
            min="0.5"
            max="2"
            step="0.1"
            value={rate}
            onChange={(e) => handleRateChange(parseFloat(e.target.value))}
            className="w-full h-3 bg-gray-200 rounded-lg appearance-none cursor-pointer"
          />
          <div className="flex justify-between text-xs text-gray-500 mt-1">
            <span>Slow</span>
            <span>Normal</span>
            <span>Fast</span>
          </div>
        </div>

        {/* Pitch control */}
        <div>
          <div className="flex justify-between items-center mb-2">
            <label className="text-sm font-bold text-gray-700">
              Pitch
            </label>
            <span className="text-sm text-gray-600">{pitch.toFixed(1)}</span>
          </div>
          <input
            type="range"
            min="0.5"
            max="2"
            step="0.1"
            value={pitch}
            onChange={(e) => handlePitchChange(parseFloat(e.target.value))}
            className="w-full h-3 bg-gray-200 rounded-lg appearance-none cursor-pointer"
          />
          <div className="flex justify-between text-xs text-gray-500 mt-1">
            <span>Low</span>
            <span>Normal</span>
            <span>High</span>
          </div>
        </div>

        {/* Volume control */}
        <div>
          <div className="flex justify-between items-center mb-2">
            <label className="text-sm font-bold text-gray-700">
              Volume
            </label>
            <span className="text-sm text-gray-600">{Math.round(volume * 100)}%</span>
          </div>
          <input
            type="range"
            min="0"
            max="1"
            step="0.1"
            value={volume}
            onChange={(e) => handleVolumeChange(parseFloat(e.target.value))}
            className="w-full h-3 bg-gray-200 rounded-lg appearance-none cursor-pointer"
          />
          <div className="flex justify-between text-xs text-gray-500 mt-1">
            <span>Quiet</span>
            <span>Normal</span>
            <span>Loud</span>
          </div>
        </div>
      </div>
    </div>
  );
}

// Speech controls with live preview
export function SpeechControlsWithPreview() {
  const { speak } = useTextToSpeech();
  const [rate, setRate] = useState(1);
  const [pitch, setPitch] = useState(1);
  const [volume, setVolume] = useState(1);

  const previewText = 'This is how I sound with these settings.';

  const handleTest = () => {
    speak(previewText, { rate, pitch, volume });
  };

  return (
    <div className="bg-white rounded-2xl shadow-xl p-8">
      <h2 className="text-2xl font-bold text-gray-800 mb-6 text-center">
        Adjust Voice Settings
      </h2>

      <SpeechControls
        onRateChange={setRate}
        onPitchChange={setPitch}
        onVolumeChange={setVolume}
      />

      <div className="mt-6 flex justify-center">
        <motion.button
          onClick={handleTest}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className="px-8 py-4 bg-primary-500 text-white rounded-xl font-bold text-xl hover:bg-primary-600 transition-colors shadow-lg"
        >
          <span className="mr-2">🔊</span>
          Test Voice
        </motion.button>
      </div>
    </div>
  );
}
