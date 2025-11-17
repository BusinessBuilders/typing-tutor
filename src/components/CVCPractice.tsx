/**
 * CVC Practice Component
 * Step 162 - Consonant-Vowel-Consonant word practice
 */

import { motion, AnimatePresence } from 'framer-motion';
import { useState } from 'react';
import { useSettingsStore } from '../store/useSettingsStore';

// CVC word database organized by vowel
export const CVC_WORDS = {
  a: ['bat', 'cat', 'hat', 'mat', 'pat', 'rat', 'sat', 'vat', 'bag', 'gag', 'hag', 'jag', 'lag', 'nag', 'rag', 'sag', 'tag', 'wag', 'ban', 'can', 'dan', 'fan', 'man', 'pan', 'ran', 'tan', 'van', 'bad', 'dad', 'had', 'lad', 'mad', 'pad', 'sad', 'cap', 'gap', 'lap', 'map', 'nap', 'rap', 'sap', 'tap', 'zap'],
  e: ['bed', 'fed', 'led', 'red', 'wed', 'beg', 'keg', 'leg', 'peg', 'ben', 'den', 'hen', 'ken', 'men', 'pen', 'ten', 'bet', 'get', 'jet', 'let', 'met', 'net', 'pet', 'set', 'vet', 'wet', 'yet'],
  i: ['big', 'dig', 'fig', 'gig', 'jig', 'pig', 'rig', 'wig', 'bin', 'din', 'fin', 'kin', 'pin', 'sin', 'tin', 'win', 'bit', 'fit', 'hit', 'kit', 'lit', 'pit', 'sit', 'wit', 'bid', 'did', 'hid', 'kid', 'lid', 'rid'],
  o: ['bob', 'cob', 'gob', 'job', 'lob', 'mob', 'rob', 'sob', 'bog', 'cog', 'dog', 'fog', 'hog', 'jog', 'log', 'box', 'fox', 'pox', 'dot', 'got', 'hot', 'jot', 'lot', 'not', 'pot', 'rot', 'tot'],
  u: ['bud', 'cud', 'dud', 'mud', 'bug', 'dug', 'hug', 'jug', 'lug', 'mug', 'pug', 'rug', 'tug', 'bun', 'fun', 'gun', 'nun', 'pun', 'run', 'sun', 'bus', 'pus', 'but', 'cut', 'gut', 'hut', 'jut', 'nut', 'put', 'rut'],
};

export interface CVCPracticeProps {
  vowel?: 'a' | 'e' | 'i' | 'o' | 'u';
  wordCount?: number;
  onComplete?: (accuracy: number) => void;
}

export default function CVCPractice({
  vowel,
  wordCount = 5,
  onComplete,
}: CVCPracticeProps) {
  const { settings } = useSettingsStore();

  // Select words
  const words = vowel
    ? CVC_WORDS[vowel].slice(0, wordCount)
    : Object.values(CVC_WORDS).flat().sort(() => Math.random() - 0.5).slice(0, wordCount);

  const [currentIndex, setCurrentIndex] = useState(0);
  const [typed, setTyped] = useState('');
  const [correct, setCorrect] = useState(0);

  const currentWord = words[currentIndex];

  // TODO: Connect to keyboard input
  // @ts-expect-error - Function will be used when keyboard input is implemented
  const handleKeyPress = (key: string) => {
    if (key === 'Backspace') {
      setTyped(typed.slice(0, -1));
      return;
    }

    const newTyped = typed + key;

    if (newTyped === currentWord) {
      setCorrect(correct + 1);
      setTyped('');

      if (currentIndex < words.length - 1) {
        setCurrentIndex(currentIndex + 1);
      } else {
        const accuracy = (correct / words.length) * 100;
        onComplete?.(accuracy);
      }
    } else if (currentWord.startsWith(newTyped)) {
      setTyped(newTyped);
    }
  };

  return (
    <div className="bg-white rounded-2xl shadow-xl p-8">
      <h2 className="text-2xl font-bold text-gray-800 mb-6 text-center">
        CVC Word Practice {vowel && `- Letter ${vowel.toUpperCase()}`}
      </h2>

      {/* Word display */}
      <AnimatePresence mode="wait">
        <motion.div
          key={currentIndex}
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.8 }}
          transition={{ duration: settings.reducedMotion ? 0 : 0.3 }}
          className="mb-8"
        >
          {/* Highlight CVC structure */}
          <div className="flex justify-center gap-4 mb-6">
            {currentWord.split('').map((letter, index) => {
              const isVowel = 'aeiou'.includes(letter);
              return (
                <div
                  key={index}
                  className={`w-24 h-24 rounded-xl flex items-center justify-center text-4xl font-bold shadow-lg ${
                    isVowel
                      ? 'bg-red-500 text-white'
                      : 'bg-blue-500 text-white'
                  }`}
                >
                  {letter.toUpperCase()}
                </div>
              );
            })}
          </div>

          <div className="text-center text-sm text-gray-600">
            <span className="text-blue-600 font-bold">C</span>onsonant-
            <span className="text-red-600 font-bold">V</span>owel-
            <span className="text-blue-600 font-bold">C</span>onsonant
          </div>
        </motion.div>
      </AnimatePresence>

      {/* Typed text */}
      <div className="bg-gray-50 rounded-xl p-6 mb-6">
        <div className="text-4xl font-mono text-center min-h-[60px]">
          {typed.split('').map((char, index) => (
            <span
              key={index}
              className={char === currentWord[index] ? 'text-success-600' : 'text-red-600'}
            >
              {char}
            </span>
          ))}
          <span className="animate-pulse">|</span>
        </div>
      </div>

      {/* Progress */}
      <div className="flex justify-between items-center">
        <div className="text-sm text-gray-600">
          Word {currentIndex + 1} of {words.length}
        </div>
        <div className="text-sm font-bold text-success-600">
          {correct} correct
        </div>
      </div>
    </div>
  );
}

// CVC vowel selector
export function CVCVowelSelector({
  onSelectVowel,
}: {
  onSelectVowel?: (vowel: 'a' | 'e' | 'i' | 'o' | 'u') => void;
}) {
  const { settings } = useSettingsStore();
  const vowels: Array<'a' | 'e' | 'i' | 'o' | 'u'> = ['a', 'e', 'i', 'o', 'u'];

  return (
    <div className="bg-white rounded-2xl shadow-xl p-8">
      <h2 className="text-2xl font-bold text-gray-800 mb-6 text-center">
        Choose a Vowel to Practice
      </h2>

      <div className="grid grid-cols-5 gap-4">
        {vowels.map((vowel, index) => (
          <motion.button
            key={vowel}
            onClick={() => onSelectVowel?.(vowel)}
            initial={{ opacity: 0, scale: 0 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{
              delay: settings.reducedMotion ? 0 : index * 0.1,
            }}
            whileHover={{ scale: settings.reducedMotion ? 1 : 1.1 }}
            whileTap={{ scale: settings.reducedMotion ? 1 : 0.95 }}
            className="aspect-square bg-red-500 text-white rounded-2xl flex flex-col items-center justify-center font-bold hover:bg-red-600 transition-colors shadow-lg"
          >
            <div className="text-5xl mb-2">{vowel.toUpperCase()}</div>
            <div className="text-xs">{CVC_WORDS[vowel].length} words</div>
          </motion.button>
        ))}
      </div>

      {/* Mixed practice option */}
      <motion.button
        onClick={() => onSelectVowel?.(undefined as any)}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: settings.reducedMotion ? 0 : 0.5 }}
        className="w-full mt-6 py-4 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-xl font-bold text-xl hover:from-blue-600 hover:to-purple-700 transition-colors shadow-lg"
      >
        Practice All Vowels (Mixed)
      </motion.button>
    </div>
  );
}

// CVC word builder game
export function CVCWordBuilder() {
  const { settings } = useSettingsStore();
  const [consonant1, setConsonant1] = useState('');
  const [vowel, setVowel] = useState('');
  const [consonant2, setConsonant2] = useState('');

  const consonants = ['b', 'c', 'd', 'f', 'g', 'h', 'j', 'k', 'l', 'm', 'n', 'p', 'r', 's', 't', 'v', 'w', 'z'];
  const vowels = ['a', 'e', 'i', 'o', 'u'];

  const builtWord = consonant1 + vowel + consonant2;
  const isValidWord = builtWord.length === 3;

  return (
    <div className="bg-white rounded-2xl shadow-xl p-8">
      <h2 className="text-2xl font-bold text-gray-800 mb-6 text-center">
        Build a CVC Word
      </h2>

      {/* Word slots */}
      <div className="flex justify-center gap-4 mb-8">
        <div className={`w-24 h-24 rounded-xl flex items-center justify-center text-4xl font-bold shadow-lg ${
          consonant1 ? 'bg-blue-500 text-white' : 'bg-gray-200 text-gray-400'
        }`}>
          {consonant1 ? consonant1.toUpperCase() : 'C'}
        </div>
        <div className={`w-24 h-24 rounded-xl flex items-center justify-center text-4xl font-bold shadow-lg ${
          vowel ? 'bg-red-500 text-white' : 'bg-gray-200 text-gray-400'
        }`}>
          {vowel ? vowel.toUpperCase() : 'V'}
        </div>
        <div className={`w-24 h-24 rounded-xl flex items-center justify-center text-4xl font-bold shadow-lg ${
          consonant2 ? 'bg-blue-500 text-white' : 'bg-gray-200 text-gray-400'
        }`}>
          {consonant2 ? consonant2.toUpperCase() : 'C'}
        </div>
      </div>

      {/* Letter selection */}
      <div className="space-y-4">
        {/* Consonant 1 */}
        <div>
          <h3 className="text-sm font-bold text-gray-700 mb-2">First Consonant</h3>
          <div className="flex flex-wrap gap-2">
            {consonants.map((c) => (
              <motion.button
                key={c}
                onClick={() => setConsonant1(c)}
                whileHover={{ scale: settings.reducedMotion ? 1 : 1.1 }}
                className={`w-10 h-10 rounded-lg font-bold ${
                  consonant1 === c
                    ? 'bg-blue-500 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {c}
              </motion.button>
            ))}
          </div>
        </div>

        {/* Vowel */}
        <div>
          <h3 className="text-sm font-bold text-gray-700 mb-2">Vowel</h3>
          <div className="flex gap-2">
            {vowels.map((v) => (
              <motion.button
                key={v}
                onClick={() => setVowel(v)}
                whileHover={{ scale: settings.reducedMotion ? 1 : 1.1 }}
                className={`w-10 h-10 rounded-lg font-bold ${
                  vowel === v
                    ? 'bg-red-500 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {v}
              </motion.button>
            ))}
          </div>
        </div>

        {/* Consonant 2 */}
        <div>
          <h3 className="text-sm font-bold text-gray-700 mb-2">Last Consonant</h3>
          <div className="flex flex-wrap gap-2">
            {consonants.map((c) => (
              <motion.button
                key={c}
                onClick={() => setConsonant2(c)}
                whileHover={{ scale: settings.reducedMotion ? 1 : 1.1 }}
                className={`w-10 h-10 rounded-lg font-bold ${
                  consonant2 === c
                    ? 'bg-blue-500 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {c}
              </motion.button>
            ))}
          </div>
        </div>
      </div>

      {/* Result */}
      {isValidWord && (
        <motion.div
          initial={{ opacity: 0, scale: 0 }}
          animate={{ opacity: 1, scale: 1 }}
          className="mt-6 bg-success-50 rounded-xl p-6 text-center"
        >
          <div className="text-xl font-bold text-success-900 mb-2">
            You built the word:
          </div>
          <div className="text-5xl font-bold text-success-700">
            {builtWord}
          </div>
        </motion.div>
      )}
    </div>
  );
}

// CVC matching game
export function CVCMatchingGame() {
  const [selectedWords] = useState(() => {
    const allWords = Object.values(CVC_WORDS).flat();
    return allWords.sort(() => Math.random() - 0.5).slice(0, 6);
  });

  const [matched, setMatched] = useState<Set<string>>(new Set());

  const handleMatch = (word: string) => {
    setMatched(new Set([...matched, word]));
  };

  return (
    <div className="bg-white rounded-2xl shadow-xl p-8">
      <h2 className="text-2xl font-bold text-gray-800 mb-6 text-center">
        Match CVC Words
      </h2>

      <div className="grid grid-cols-3 gap-4">
        {selectedWords.map((word) => {
          const isMatched = matched.has(word);
          return (
            <motion.button
              key={word}
              onClick={() => handleMatch(word)}
              disabled={isMatched}
              whileHover={{ scale: isMatched ? 1 : 1.05 }}
              className={`p-6 rounded-xl font-bold text-2xl transition-colors ${
                isMatched
                  ? 'bg-success-500 text-white'
                  : 'bg-gray-100 text-gray-800 hover:bg-primary-100'
              }`}
            >
              {word}
            </motion.button>
          );
        })}
      </div>

      {matched.size === selectedWords.length && (
        <motion.div
          initial={{ opacity: 0, scale: 0 }}
          animate={{ opacity: 1, scale: 1 }}
          className="mt-6 text-center text-4xl"
        >
          🎉 All matched!
        </motion.div>
      )}
    </div>
  );
}
