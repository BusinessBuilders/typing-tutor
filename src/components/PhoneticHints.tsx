/**
 * Phonetic Hints Component
 * Step 136 - Display phonetic pronunciation hints for words
 */

import { motion } from 'framer-motion';
import { useState } from 'react';
import { useSettingsStore } from '../store/useSettingsStore';
import { getSyllables } from '../utils/syllableBreaker';
import {
  wordToPhonetic,
  getPhoneticRepresentation,
  getPronunciationDifficulty,
  generatePhoneticBreakdown,
  formatPhoneticWithStress,
  getSimilarSoundingWords,
  getRhymingWords,
} from '../utils/phoneticHelper';

export interface PhoneticHintsProps {
  word: string;
  showHint?: boolean;
  position?: 'above' | 'below' | 'inline';
  style?: 'simple' | 'detailed' | 'minimal';
}

export default function PhoneticHints({
  word,
  showHint = true,
  position = 'above',
  style = 'simple',
}: PhoneticHintsProps) {
  const { settings } = useSettingsStore();
  const phonetic = wordToPhonetic(word);
  const syllables = getSyllables(word);
  const representation = getPhoneticRepresentation(word, syllables);

  if (!showHint) return <span className="text-2xl font-medium">{word}</span>;

  const isInline = position === 'inline';

  return (
    <div className={`${isInline ? 'inline-flex items-baseline gap-2' : 'flex flex-col gap-2'}`}>
      {/* Phonetic hint */}
      {position === 'above' && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: settings.reducedMotion ? 0 : 0.3 }}
          className="text-sm text-primary-600 font-mono"
        >
          /{phonetic}/
        </motion.div>
      )}

      {/* Main word */}
      <div className="text-2xl font-medium text-gray-800">{word}</div>

      {/* Phonetic hint below */}
      {position === 'below' && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: settings.reducedMotion ? 0 : 0.3 }}
          className="text-sm text-primary-600 font-mono"
        >
          /{phonetic}/
        </motion.div>
      )}

      {/* Inline phonetic hint */}
      {position === 'inline' && (
        <span className="text-xs text-primary-600 font-mono">/{phonetic}/</span>
      )}

      {/* Detailed view */}
      {style === 'detailed' && (
        <div className="text-xs text-gray-600 mt-1">
          {formatPhoneticWithStress(representation)}
        </div>
      )}
    </div>
  );
}

// Interactive phonetic card with audio pronunciation tips
export function PhoneticCard({ word }: { word: string }) {
  const { settings } = useSettingsStore();
  const [showDetails, setShowDetails] = useState(false);

  const syllables = getSyllables(word);
  const representation = getPhoneticRepresentation(word, syllables);
  const difficulty = getPronunciationDifficulty(word);
  const breakdown = generatePhoneticBreakdown(word, syllables);

  const difficultyColors = {
    easy: 'bg-green-100 text-green-800',
    medium: 'bg-yellow-100 text-yellow-800',
    hard: 'bg-orange-100 text-orange-800',
    'very-hard': 'bg-red-100 text-red-800',
  };

  return (
    <div className="bg-white rounded-2xl shadow-xl p-6">
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div>
          <h3 className="text-3xl font-bold text-gray-800">{word}</h3>
          <div className="text-lg text-primary-600 font-mono mt-1">
            /{formatPhoneticWithStress(representation)}/
          </div>
        </div>

        <div className={`px-3 py-1 rounded-full text-sm font-medium ${difficultyColors[difficulty.level]}`}>
          {difficulty.level}
        </div>
      </div>

      {/* Syllable breakdown */}
      <div className="mb-4">
        <h4 className="text-sm font-bold text-gray-600 mb-2">Syllables:</h4>
        <div className="flex flex-wrap gap-2">
          {representation.phoneticSyllables.map((syllable, index) => {
            const isStressed = representation.stress?.includes(index);
            return (
              <motion.div
                key={index}
                initial={{ opacity: 0, scale: 0 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{
                  delay: settings.reducedMotion ? 0 : index * 0.1,
                }}
                className={`px-4 py-2 rounded-lg ${
                  isStressed
                    ? 'bg-primary-500 text-white font-bold'
                    : 'bg-gray-100 text-gray-700'
                }`}
              >
                {syllable}
                {isStressed && <span className="ml-1">*</span>}
              </motion.div>
            );
          })}
        </div>
        {representation.stress && representation.stress.length > 0 && (
          <div className="text-xs text-gray-500 mt-2">* = stressed syllable</div>
        )}
      </div>

      {/* Pronunciation tips */}
      {difficulty.tips.length > 0 && (
        <div className="mb-4">
          <h4 className="text-sm font-bold text-gray-600 mb-2">Tips:</h4>
          <ul className="space-y-1">
            {difficulty.tips.map((tip, index) => (
              <li key={index} className="text-sm text-gray-700 flex items-start">
                <span className="text-primary-500 mr-2">•</span>
                {tip}
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Toggle detailed breakdown */}
      <button
        onClick={() => setShowDetails(!showDetails)}
        className="text-sm text-primary-600 font-medium hover:text-primary-700 transition-colors"
      >
        {showDetails ? 'Hide' : 'Show'} detailed breakdown
      </button>

      {/* Detailed breakdown */}
      {showDetails && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          exit={{ opacity: 0, height: 0 }}
          className="mt-4 space-y-3"
        >
          {breakdown.breakdown.map((part, index) => (
            <div key={index} className="bg-gray-50 rounded-lg p-3">
              <div className="flex items-center justify-between mb-2">
                <span className="text-lg font-bold text-gray-800">{part.syllable}</span>
                <span className="text-sm text-primary-600 font-mono">/{part.phonetic}/</span>
              </div>

              {part.tips && (
                <div className="text-xs text-gray-600 italic">{part.tips}</div>
              )}

              <div className="flex gap-1 mt-2">
                {part.sounds.map((sound, soundIndex) => (
                  <div
                    key={soundIndex}
                    className="px-2 py-1 bg-white rounded text-xs font-mono text-gray-700"
                  >
                    {sound}
                  </div>
                ))}
              </div>
            </div>
          ))}
        </motion.div>
      )}
    </div>
  );
}

// Text with inline phonetic hints
export function PhoneticTextDisplay({
  text,
  showPhonetics = true,
}: {
  text: string;
  showPhonetics?: boolean;
}) {
  const words = text.split(/\s+/);

  return (
    <div className="bg-white rounded-2xl shadow-xl p-8">
      <div className="text-2xl leading-relaxed flex flex-wrap gap-x-3 gap-y-4">
        {words.map((word, index) => (
          <PhoneticHints
            key={index}
            word={word}
            showHint={showPhonetics}
            position="above"
            style="simple"
          />
        ))}
      </div>
    </div>
  );
}

// Phonetic comparison tool
export function PhoneticComparison({ word }: { word: string }) {
  const similar = getSimilarSoundingWords(word);
  const rhymes = getRhymingWords(word);

  return (
    <div className="bg-white rounded-xl shadow-lg p-6">
      <h3 className="text-lg font-bold text-gray-800 mb-4">Pronunciation Guide</h3>

      {/* Main word */}
      <div className="mb-6 p-4 bg-primary-50 rounded-lg">
        <PhoneticCard word={word} />
      </div>

      {/* Similar sounding words */}
      {similar.length > 0 && (
        <div className="mb-4">
          <h4 className="text-sm font-bold text-gray-600 mb-2">Sounds like:</h4>
          <div className="flex flex-wrap gap-2">
            {similar.map((simWord, index) => (
              <div
                key={index}
                className="px-3 py-1 bg-blue-100 text-blue-800 rounded-lg text-sm"
              >
                {simWord}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Rhyming words */}
      {rhymes.length > 0 && (
        <div>
          <h4 className="text-sm font-bold text-gray-600 mb-2">Rhymes with:</h4>
          <div className="flex flex-wrap gap-2">
            {rhymes.map((rhyme, index) => (
              <div
                key={index}
                className="px-3 py-1 bg-purple-100 text-purple-800 rounded-lg text-sm"
              >
                {rhyme}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

// Phonetic learning game
export function PhoneticMatchGame({ words }: { words: string[] }) {
  const { settings } = useSettingsStore();
  const [selectedWord, setSelectedWord] = useState<string | null>(null);
  const [selectedPhonetic, setSelectedPhonetic] = useState<string | null>(null);
  const [matched, setMatched] = useState<Set<string>>(new Set());

  const phonetics = words.map((word) => ({
    word,
    phonetic: wordToPhonetic(word),
  }));

  const handleWordClick = (word: string) => {
    if (matched.has(word)) return;
    setSelectedWord(word);

    if (selectedPhonetic) {
      const phonetic = wordToPhonetic(word);
      if (phonetic === selectedPhonetic) {
        setMatched(new Set([...matched, word]));
        setSelectedWord(null);
        setSelectedPhonetic(null);
      }
    }
  };

  const handlePhoneticClick = (phonetic: string) => {
    setSelectedPhonetic(phonetic);

    if (selectedWord) {
      const wordPhonetic = wordToPhonetic(selectedWord);
      if (wordPhonetic === phonetic) {
        setMatched(new Set([...matched, selectedWord]));
        setSelectedWord(null);
        setSelectedPhonetic(null);
      }
    }
  };

  return (
    <div className="bg-white rounded-2xl shadow-xl p-8">
      <h2 className="text-2xl font-bold text-gray-800 mb-6 text-center">
        Match Words to Phonetics
      </h2>

      <div className="grid grid-cols-2 gap-8">
        {/* Words column */}
        <div className="space-y-3">
          <h3 className="text-sm font-bold text-gray-600 mb-3">Words</h3>
          {words.map((word, index) => {
            const isMatched = matched.has(word);
            const isSelected = selectedWord === word;

            return (
              <motion.button
                key={index}
                onClick={() => handleWordClick(word)}
                disabled={isMatched}
                whileHover={{ scale: settings.reducedMotion ? 1 : 1.05 }}
                whileTap={{ scale: settings.reducedMotion ? 1 : 0.95 }}
                className={`w-full p-4 rounded-lg font-bold text-lg transition-colors ${
                  isMatched
                    ? 'bg-success-100 text-success-700'
                    : isSelected
                    ? 'bg-primary-500 text-white'
                    : 'bg-gray-100 text-gray-800 hover:bg-gray-200'
                }`}
              >
                {isMatched ? `✓ ${word}` : word}
              </motion.button>
            );
          })}
        </div>

        {/* Phonetics column */}
        <div className="space-y-3">
          <h3 className="text-sm font-bold text-gray-600 mb-3">Phonetics</h3>
          {phonetics.map((item, index) => {
            const isMatched = matched.has(item.word);
            const isSelected = selectedPhonetic === item.phonetic;

            return (
              <motion.button
                key={index}
                onClick={() => handlePhoneticClick(item.phonetic)}
                disabled={isMatched}
                whileHover={{ scale: settings.reducedMotion ? 1 : 1.05 }}
                whileTap={{ scale: settings.reducedMotion ? 1 : 0.95 }}
                className={`w-full p-4 rounded-lg font-mono text-lg transition-colors ${
                  isMatched
                    ? 'bg-success-100 text-success-700'
                    : isSelected
                    ? 'bg-primary-500 text-white'
                    : 'bg-gray-100 text-gray-800 hover:bg-gray-200'
                }`}
              >
                {isMatched ? `✓ ` : ''}/{item.phonetic}/
              </motion.button>
            );
          })}
        </div>
      </div>

      {/* Progress */}
      <div className="mt-6 text-center">
        <div className="text-sm text-gray-600">
          Matched: {matched.size} / {words.length}
        </div>
        {matched.size === words.length && (
          <motion.div
            initial={{ opacity: 0, scale: 0 }}
            animate={{ opacity: 1, scale: 1 }}
            className="mt-4 text-2xl font-bold text-success-600"
          >
            🎉 All Matched!
          </motion.div>
        )}
      </div>
    </div>
  );
}

// Phonetic pronunciation practice
export function PhoneticPractice({ word }: { word: string }) {
  const syllables = getSyllables(word);
  const breakdown = generatePhoneticBreakdown(word, syllables);
  const [currentSyllable, setCurrentSyllable] = useState(0);

  const handleNext = () => {
    if (currentSyllable < breakdown.breakdown.length - 1) {
      setCurrentSyllable(currentSyllable + 1);
    }
  };

  const handlePrevious = () => {
    if (currentSyllable > 0) {
      setCurrentSyllable(currentSyllable - 1);
    }
  };

  const current = breakdown.breakdown[currentSyllable];

  return (
    <div className="bg-white rounded-2xl shadow-xl p-8">
      <h2 className="text-xl font-bold text-gray-800 mb-6 text-center">
        Pronunciation Practice
      </h2>

      {/* Progress indicator */}
      <div className="flex justify-center gap-2 mb-6">
        {breakdown.breakdown.map((_, index) => (
          <div
            key={index}
            className={`w-3 h-3 rounded-full ${
              index === currentSyllable ? 'bg-primary-500' : 'bg-gray-300'
            }`}
          />
        ))}
      </div>

      {/* Current syllable */}
      <div className="text-center mb-8">
        <div className="text-6xl font-bold text-gray-800 mb-4">{current.syllable}</div>
        <div className="text-3xl text-primary-600 font-mono mb-4">/{current.phonetic}/</div>
        {current.tips && (
          <div className="text-lg text-gray-600 italic">{current.tips}</div>
        )}
      </div>

      {/* Sound breakdown */}
      <div className="flex justify-center gap-2 mb-8">
        {current.sounds.map((sound, index) => (
          <div
            key={index}
            className="w-12 h-12 bg-primary-100 text-primary-700 rounded-lg flex items-center justify-center font-mono font-bold text-xl"
          >
            {sound}
          </div>
        ))}
      </div>

      {/* Navigation */}
      <div className="flex justify-between">
        <button
          onClick={handlePrevious}
          disabled={currentSyllable === 0}
          className="px-6 py-3 bg-gray-200 text-gray-700 rounded-lg font-medium disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-300 transition-colors"
        >
          Previous
        </button>

        <div className="text-sm text-gray-600 flex items-center">
          {currentSyllable + 1} of {breakdown.breakdown.length}
        </div>

        <button
          onClick={handleNext}
          disabled={currentSyllable === breakdown.breakdown.length - 1}
          className="px-6 py-3 bg-primary-500 text-white rounded-lg font-medium disabled:opacity-50 disabled:cursor-not-allowed hover:bg-primary-600 transition-colors"
        >
          Next
        </button>
      </div>

      {/* Complete word at bottom */}
      <div className="mt-8 pt-6 border-t border-gray-200 text-center">
        <div className="text-sm text-gray-600 mb-2">Complete word:</div>
        <div className="text-3xl font-bold text-gray-800">{word}</div>
        <div className="text-lg text-primary-600 font-mono mt-1">
          /{breakdown.breakdown.map((p) => p.phonetic).join('-')}/
        </div>
      </div>
    </div>
  );
}
