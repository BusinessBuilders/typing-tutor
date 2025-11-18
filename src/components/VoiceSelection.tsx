/**
 * Voice Selection Component
 * Step 182 - Voice selection for TTS
 */

import { motion } from 'framer-motion';
import { useState, useEffect } from 'react';
import { useSettingsStore } from '../store/useSettingsStore';
import { useTextToSpeech } from './TextToSpeech';

// Hook to get available voices
export function useVoices() {
  const [voices, setVoices] = useState<SpeechSynthesisVoice[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadVoices = () => {
      const availableVoices = window.speechSynthesis.getVoices();
      setVoices(availableVoices);
      setLoading(false);
    };

    // Load voices initially
    loadVoices();

    // Some browsers load voices asynchronously
    if (window.speechSynthesis.onvoiceschanged !== undefined) {
      window.speechSynthesis.onvoiceschanged = loadVoices;
    }

    return () => {
      window.speechSynthesis.onvoiceschanged = null;
    };
  }, []);

  return { voices, loading };
}

// Voice selector component
export default function VoiceSelection({
  onSelectVoice,
  selectedVoice,
}: {
  onSelectVoice?: (voice: SpeechSynthesisVoice | null) => void;
  selectedVoice?: SpeechSynthesisVoice | null;
}) {
  const { settings } = useSettingsStore();
  const { voices, loading } = useVoices();
  const [selected, setSelected] = useState<SpeechSynthesisVoice | null>(
    selectedVoice || null
  );

  // Group voices by language
  const groupedVoices = voices.reduce((acc, voice) => {
    const lang = voice.lang.split('-')[0];
    if (!acc[lang]) acc[lang] = [];
    acc[lang].push(voice);
    return acc;
  }, {} as Record<string, SpeechSynthesisVoice[]>);

  const handleSelect = (voice: SpeechSynthesisVoice) => {
    setSelected(voice);
    onSelectVoice?.(voice);
  };

  if (loading) {
    return (
      <div className="bg-white rounded-2xl shadow-xl p-8">
        <div className="text-center text-gray-600">
          Loading voices...
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl shadow-xl p-8">
      <h2 className="text-2xl font-bold text-gray-800 mb-6 text-center">
        Choose a Voice
      </h2>

      {Object.keys(groupedVoices).length === 0 ? (
        <div className="text-center text-gray-600">
          No voices available
        </div>
      ) : (
        <div className="space-y-6">
          {Object.entries(groupedVoices).map(([lang, langVoices]) => (
            <div key={lang}>
              <h3 className="text-lg font-bold text-gray-700 mb-3 capitalize">
                {lang === 'en' ? 'English' : lang}
              </h3>
              <div className="space-y-2">
                {langVoices.map((voice, index) => (
                  <motion.button
                    key={voice.name + index}
                    onClick={() => handleSelect(voice)}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{
                      delay: settings.reducedMotion ? 0 : index * 0.05,
                    }}
                    whileHover={{ scale: settings.reducedMotion ? 1 : 1.02 }}
                    className={`w-full text-left p-4 rounded-lg transition-colors ${
                      selected?.name === voice.name
                        ? 'bg-primary-500 text-white'
                        : 'bg-gray-100 text-gray-900 hover:bg-gray-200'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="font-bold">{voice.name}</div>
                        <div className={`text-sm ${
                          selected?.name === voice.name
                            ? 'text-white opacity-90'
                            : 'text-gray-600'
                        }`}>
                          {voice.lang}
                          {voice.localService && ' • Local'}
                        </div>
                      </div>
                      {selected?.name === voice.name && (
                        <span className="text-2xl">✓</span>
                      )}
                    </div>
                  </motion.button>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// Voice preview component
export function VoicePreview({ voice }: { voice: SpeechSynthesisVoice }) {
  const { speak, speaking } = useTextToSpeech();
  const previewText = 'Hello! This is how I sound. I can help you learn to type.';

  return (
    <div className="bg-blue-50 rounded-xl p-6">
      <div className="flex items-center justify-between">
        <div>
          <div className="font-bold text-blue-900">{voice.name}</div>
          <div className="text-sm text-blue-700">{voice.lang}</div>
        </div>
        <motion.button
          onClick={() => speak(previewText, { voice })}
          disabled={speaking}
          whileHover={{ scale: !speaking ? 1.05 : 1 }}
          className="px-4 py-2 bg-primary-500 text-white rounded-lg font-bold hover:bg-primary-600 disabled:opacity-50 transition-colors"
        >
          <span className="mr-2">🔊</span>
          Preview
        </motion.button>
      </div>
    </div>
  );
}

// Voice selector with preview
export function VoiceSelectorWithPreview({
  onSelectVoice,
}: {
  onSelectVoice?: (voice: SpeechSynthesisVoice) => void;
}) {
  const { settings } = useSettingsStore();
  const { voices, loading } = useVoices();
  const { speak, speaking } = useTextToSpeech();
  const [selectedVoice, setSelectedVoice] = useState<SpeechSynthesisVoice | null>(null);

  const previewText = 'Hello! I can read this text for you.';

  const handleSelect = (voice: SpeechSynthesisVoice) => {
    setSelectedVoice(voice);
    onSelectVoice?.(voice);
  };

  const handlePreview = (voice: SpeechSynthesisVoice) => {
    speak(previewText, { voice });
  };

  if (loading) {
    return (
      <div className="bg-white rounded-2xl shadow-xl p-8">
        <div className="text-center text-gray-600">Loading voices...</div>
      </div>
    );
  }

  // Filter for English voices only for simplicity
  const englishVoices = voices.filter(v => v.lang.startsWith('en'));

  return (
    <div className="bg-white rounded-2xl shadow-xl p-8">
      <h2 className="text-2xl font-bold text-gray-800 mb-6 text-center">
        Choose Your Voice
      </h2>

      {selectedVoice && (
        <div className="bg-primary-50 rounded-xl p-4 mb-6 text-center">
          <div className="text-sm text-primary-900 mb-1">Selected Voice:</div>
          <div className="text-lg font-bold text-primary-700">
            {selectedVoice.name}
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-h-96 overflow-y-auto">
        {englishVoices.map((voice, index) => (
          <motion.div
            key={voice.name + index}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{
              delay: settings.reducedMotion ? 0 : index * 0.05,
            }}
            className={`p-4 rounded-lg border-2 transition-colors ${
              selectedVoice?.name === voice.name
                ? 'border-primary-500 bg-primary-50'
                : 'border-gray-200 bg-white hover:bg-gray-50'
            }`}
          >
            <div className="flex items-start justify-between mb-3">
              <div className="flex-1">
                <div className="font-bold text-gray-900 mb-1">
                  {voice.name.split(' ').slice(0, 2).join(' ')}
                </div>
                <div className="text-xs text-gray-600">
                  {voice.lang}
                  {voice.localService && ' • Local'}
                </div>
              </div>
              <button
                onClick={() => handleSelect(voice)}
                className={`ml-2 w-8 h-8 rounded-full flex items-center justify-center ${
                  selectedVoice?.name === voice.name
                    ? 'bg-primary-500 text-white'
                    : 'border-2 border-gray-300'
                }`}
              >
                {selectedVoice?.name === voice.name && '✓'}
              </button>
            </div>

            <button
              onClick={() => handlePreview(voice)}
              disabled={speaking}
              className="w-full py-2 bg-gray-200 text-gray-800 rounded-lg text-sm font-medium hover:bg-gray-300 disabled:opacity-50 transition-colors"
            >
              <span className="mr-1">🔊</span>
              Preview
            </button>
          </motion.div>
        ))}
      </div>
    </div>
  );
}

// Simple voice picker
export function SimpleVoicePicker({
  onVoiceChange,
}: {
  onVoiceChange?: (voice: SpeechSynthesisVoice | null) => void;
}) {
  const { voices } = useVoices();
  const [selectedIndex, setSelectedIndex] = useState(0);

  const englishVoices = voices.filter(v => v.lang.startsWith('en'));

  const handleChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    const index = parseInt(event.target.value);
    setSelectedIndex(index);
    onVoiceChange?.(englishVoices[index] || null);
  };

  return (
    <div className="bg-white rounded-xl shadow-lg p-6">
      <label className="block text-sm font-bold text-gray-700 mb-2">
        Select Voice:
      </label>
      <select
        value={selectedIndex}
        onChange={handleChange}
        className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-primary-500 focus:outline-none text-lg"
      >
        {englishVoices.map((voice, index) => (
          <option key={voice.name + index} value={index}>
            {voice.name}
          </option>
        ))}
      </select>
    </div>
  );
}

// Gender-based voice selector
export function GenderVoiceSelector({
  onSelectVoice,
}: {
  onSelectVoice?: (voice: SpeechSynthesisVoice) => void;
}) {
  const { voices } = useVoices();
  const { speak } = useTextToSpeech();

  // Simple heuristic to categorize voices
  const categorizeVoices = () => {
    const categories = {
      male: [] as SpeechSynthesisVoice[],
      female: [] as SpeechSynthesisVoice[],
      other: [] as SpeechSynthesisVoice[],
    };

    voices.filter(v => v.lang.startsWith('en')).forEach(voice => {
      const nameLower = voice.name.toLowerCase();
      if (nameLower.includes('female') || nameLower.includes('woman')) {
        categories.female.push(voice);
      } else if (nameLower.includes('male') || nameLower.includes('man')) {
        categories.male.push(voice);
      } else {
        categories.other.push(voice);
      }
    });

    return categories;
  };

  const categories = categorizeVoices();

  return (
    <div className="bg-white rounded-2xl shadow-xl p-8">
      <h2 className="text-2xl font-bold text-gray-800 mb-6 text-center">
        Choose Voice Type
      </h2>

      <div className="space-y-6">
        {categories.female.length > 0 && (
          <div>
            <h3 className="text-lg font-bold text-pink-700 mb-3">Female Voices</h3>
            <div className="grid grid-cols-2 gap-3">
              {categories.female.slice(0, 4).map((voice) => (
                <button
                  key={voice.name}
                  onClick={() => {
                    onSelectVoice?.(voice);
                    speak('Hello, I am a female voice.', { voice });
                  }}
                  className="p-4 bg-pink-100 text-pink-900 rounded-lg font-medium hover:bg-pink-200 transition-colors text-left"
                >
                  <div className="text-sm font-bold mb-1">
                    {voice.name.split(' ').slice(0, 2).join(' ')}
                  </div>
                  <div className="text-xs opacity-75">Click to preview</div>
                </button>
              ))}
            </div>
          </div>
        )}

        {categories.male.length > 0 && (
          <div>
            <h3 className="text-lg font-bold text-blue-700 mb-3">Male Voices</h3>
            <div className="grid grid-cols-2 gap-3">
              {categories.male.slice(0, 4).map((voice) => (
                <button
                  key={voice.name}
                  onClick={() => {
                    onSelectVoice?.(voice);
                    speak('Hello, I am a male voice.', { voice });
                  }}
                  className="p-4 bg-blue-100 text-blue-900 rounded-lg font-medium hover:bg-blue-200 transition-colors text-left"
                >
                  <div className="text-sm font-bold mb-1">
                    {voice.name.split(' ').slice(0, 2).join(' ')}
                  </div>
                  <div className="text-xs opacity-75">Click to preview</div>
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
