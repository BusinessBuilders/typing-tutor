/**
 * Word Families Component
 * Step 164 - Word family practice (-at, -an, -ip, etc.)
 */

import { motion, AnimatePresence } from 'framer-motion';
import { useState, useEffect } from 'react';
import { useSettingsStore } from '../store/useSettingsStore';

// Common word families
export const WORD_FAMILIES = {
  at: ['bat', 'cat', 'fat', 'hat', 'mat', 'pat', 'rat', 'sat', 'vat', 'chat', 'flat', 'that'],
  an: ['ban', 'can', 'dan', 'fan', 'man', 'pan', 'ran', 'tan', 'van', 'plan', 'scan', 'than'],
  ip: ['dip', 'hip', 'lip', 'nip', 'rip', 'sip', 'tip', 'zip', 'chip', 'clip', 'drip', 'flip', 'grip', 'ship', 'skip', 'slip', 'strip', 'trip', 'whip'],
  it: ['bit', 'fit', 'hit', 'kit', 'lit', 'pit', 'sit', 'wit', 'grit', 'quit', 'skit', 'slit', 'spit', 'split'],
  op: ['cop', 'hop', 'mop', 'pop', 'top', 'chop', 'crop', 'drop', 'flop', 'plop', 'shop', 'stop'],
  ot: ['cot', 'dot', 'got', 'hot', 'jot', 'lot', 'not', 'pot', 'rot', 'tot', 'blot', 'knot', 'plot', 'shot', 'slot', 'spot', 'trot'],
  ug: ['bug', 'dug', 'hug', 'jug', 'lug', 'mug', 'pug', 'rug', 'tug', 'chug', 'drug', 'plug', 'slug', 'snug'],
  un: ['bun', 'fun', 'gun', 'nun', 'pun', 'run', 'sun', 'spun', 'stun'],
  en: ['den', 'hen', 'men', 'pen', 'ten', 'then', 'when'],
  in: ['bin', 'din', 'fin', 'kin', 'pin', 'sin', 'tin', 'win', 'chin', 'grin', 'shin', 'skin', 'spin', 'thin', 'twin'],
};

export interface WordFamiliesProps {
  family: keyof typeof WORD_FAMILIES;
  onComplete?: (accuracy: number) => void;
}

export default function WordFamilies({
  family,
  onComplete,
}: WordFamiliesProps) {
  const { settings } = useSettingsStore();
  const words = WORD_FAMILIES[family];

  const [currentIndex, setCurrentIndex] = useState(0);
  const [typed, setTyped] = useState('');
  const [correct, setCorrect] = useState(0);

  const currentWord = words[currentIndex];

  const handleKeyPress = (key: string) => {
    if (key === 'Backspace') {
      setTyped(typed.slice(0, -1));
      return;
    }

    const newTyped = typed + key.toLowerCase();

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

  // Connect keyboard input
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Backspace') {
        event.preventDefault();
        handleKeyPress('Backspace');
      } else if (event.key.length === 1) {
        handleKeyPress(event.key);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [typed, currentWord, currentIndex, correct]);

  return (
    <div className="bg-white rounded-2xl shadow-xl p-8">
      <h2 className="text-2xl font-bold text-gray-800 mb-6 text-center">
        Word Family: -{family}
      </h2>

      {/* Family pattern display */}
      <div className="bg-gradient-to-r from-purple-100 to-pink-100 rounded-xl p-6 mb-6">
        <div className="flex justify-center items-center gap-4">
          <div className="text-5xl font-bold text-purple-900">_</div>
          <div className="text-5xl font-bold text-pink-600">-{family}</div>
        </div>
        <div className="text-center text-sm text-purple-700 mt-2">
          All words end with -{family}
        </div>
      </div>

      {/* Current word */}
      <AnimatePresence mode="wait">
        <motion.div
          key={currentIndex}
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.8 }}
          transition={{ duration: settings.reducedMotion ? 0 : 0.3 }}
          className="mb-6"
        >
          <div className="flex justify-center gap-2">
            {currentWord.split('').map((letter, index) => {
              const isPartOfFamily = index >= currentWord.length - family.length;
              return (
                <div
                  key={index}
                  className={`w-16 h-16 rounded-lg flex items-center justify-center text-3xl font-bold shadow-md ${
                    isPartOfFamily
                      ? 'bg-pink-500 text-white'
                      : 'bg-purple-500 text-white'
                  }`}
                >
                  {letter}
                </div>
              );
            })}
          </div>
        </motion.div>
      </AnimatePresence>

      {/* Typing area */}
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
      <div className="flex justify-between text-sm text-gray-600">
        <span>Word {currentIndex + 1} of {words.length}</span>
        <span className="font-bold text-success-600">{correct} correct</span>
      </div>
    </div>
  );
}

// Word family selector
export function WordFamilySelector({
  onSelectFamily,
}: {
  onSelectFamily?: (family: keyof typeof WORD_FAMILIES) => void;
}) {
  const { settings } = useSettingsStore();
  const families = Object.keys(WORD_FAMILIES) as Array<keyof typeof WORD_FAMILIES>;

  return (
    <div className="bg-white rounded-2xl shadow-xl p-8">
      <h2 className="text-2xl font-bold text-gray-800 mb-6 text-center">
        Choose a Word Family
      </h2>

      <div className="grid grid-cols-3 md:grid-cols-5 gap-4">
        {families.map((family, index) => (
          <motion.button
            key={family}
            onClick={() => onSelectFamily?.(family)}
            initial={{ opacity: 0, scale: 0 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{
              delay: settings.reducedMotion ? 0 : index * 0.05,
            }}
            whileHover={{ scale: settings.reducedMotion ? 1 : 1.1 }}
            whileTap={{ scale: settings.reducedMotion ? 1 : 0.95 }}
            className="aspect-square bg-gradient-to-br from-purple-500 to-pink-600 text-white rounded-xl flex flex-col items-center justify-center shadow-lg hover:shadow-xl transition-shadow"
          >
            <div className="text-3xl font-bold mb-1">-{family}</div>
            <div className="text-xs opacity-90">
              {WORD_FAMILIES[family].length} words
            </div>
          </motion.button>
        ))}
      </div>
    </div>
  );
}

// Word family builder
export function WordFamilyBuilder({ family }: { family: keyof typeof WORD_FAMILIES }) {
  const [builtWords, setBuiltWords] = useState<string[]>([]);
  const [currentStart, setCurrentStart] = useState('');

  const possibleStarts = ['b', 'c', 'd', 'f', 'g', 'h', 'j', 'k', 'l', 'm', 'n', 'p', 'r', 's', 't', 'v', 'w', 'z', 'ch', 'sh', 'th', 'wh', 'bl', 'cl', 'fl', 'gl', 'pl', 'sl', 'br', 'cr', 'dr', 'fr', 'gr', 'pr', 'tr', 'sc', 'sk', 'sm', 'sn', 'sp', 'st', 'sw'];

  const handleBuild = (start: string) => {
    const word = start + family;
    if (WORD_FAMILIES[family].includes(word) && !builtWords.includes(word)) {
      setBuiltWords([...builtWords, word]);
      setCurrentStart('');
    } else {
      setCurrentStart(start);
      setTimeout(() => setCurrentStart(''), 1000);
    }
  };

  return (
    <div className="bg-white rounded-2xl shadow-xl p-8">
      <h2 className="text-2xl font-bold text-gray-800 mb-6 text-center">
        Build -{family} Words
      </h2>

      {/* Word ending */}
      <div className="bg-pink-100 rounded-xl p-6 mb-6 text-center">
        <div className="text-5xl font-bold text-pink-700">-{family}</div>
      </div>

      {/* Letter buttons */}
      <div className="mb-6">
        <h3 className="text-sm font-bold text-gray-700 mb-3">
          Add letters to make a word:
        </h3>
        <div className="flex flex-wrap gap-2">
          {possibleStarts.map((start) => (
            <motion.button
              key={start}
              onClick={() => handleBuild(start)}
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.95 }}
              className={`px-4 py-2 rounded-lg font-bold ${
                currentStart === start
                  ? 'bg-red-500 text-white'
                  : builtWords.includes(start + family)
                  ? 'bg-success-500 text-white'
                  : 'bg-primary-100 text-primary-900 hover:bg-primary-200'
              }`}
            >
              {start}
            </motion.button>
          ))}
        </div>
      </div>

      {/* Built words */}
      <div>
        <h3 className="text-sm font-bold text-gray-700 mb-3">
          Words you've built: ({builtWords.length}/{WORD_FAMILIES[family].length})
        </h3>
        <div className="flex flex-wrap gap-2">
          {builtWords.map((word) => (
            <motion.div
              key={word}
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              className="px-4 py-2 bg-success-500 text-white rounded-lg font-bold"
            >
              {word}
            </motion.div>
          ))}
        </div>
      </div>

      {builtWords.length === WORD_FAMILIES[family].length && (
        <motion.div
          initial={{ opacity: 0, scale: 0 }}
          animate={{ opacity: 1, scale: 1 }}
          className="mt-6 text-center text-4xl"
        >
          🎉 All words found!
        </motion.div>
      )}
    </div>
  );
}

// Word family sorting game
export function WordFamilySorting() {
  const [families] = useState<Array<keyof typeof WORD_FAMILIES>>(['at', 'ip', 'ot']);
  const [words] = useState(() => {
    return families.flatMap(f => WORD_FAMILIES[f].slice(0, 4)).sort(() => Math.random() - 0.5);
  });

  const [sorted, setSorted] = useState<Record<string, string[]>>({
    at: [],
    ip: [],
    ot: [],
  });

  // TODO: Connect to drag and drop
  // @ts-expect-error - Function will be used when drag-drop is implemented
  const handleSort = (word: string, family: string) => {
    if (word.endsWith(family)) {
      setSorted({
        ...sorted,
        [family]: [...sorted[family], word],
      });
    }
  };

  return (
    <div className="bg-white rounded-2xl shadow-xl p-8">
      <h2 className="text-2xl font-bold text-gray-800 mb-6 text-center">
        Sort Words by Family
      </h2>

      {/* Words to sort */}
      <div className="mb-6">
        <h3 className="text-sm font-bold text-gray-700 mb-3">Words to sort:</h3>
        <div className="flex flex-wrap gap-2">
          {words.filter(w => !Object.values(sorted).flat().includes(w)).map((word) => (
            <div
              key={word}
              className="px-4 py-2 bg-gray-200 text-gray-800 rounded-lg font-bold cursor-pointer hover:bg-gray-300"
            >
              {word}
            </div>
          ))}
        </div>
      </div>

      {/* Family buckets */}
      <div className="grid grid-cols-3 gap-4">
        {families.map((family) => (
          <div key={family} className="bg-purple-50 rounded-xl p-4">
            <h3 className="text-center font-bold text-purple-900 mb-3">
              -{family}
            </h3>
            <div className="space-y-2 min-h-[100px]">
              {sorted[family].map((word) => (
                <div
                  key={word}
                  className="px-3 py-2 bg-purple-500 text-white rounded-lg text-center font-bold"
                >
                  {word}
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// Word family rhyme game
export function WordFamilyRhymeGame({ family }: { family: keyof typeof WORD_FAMILIES }) {
  const words = WORD_FAMILIES[family];
  const [currentIndex, setCurrentIndex] = useState(0);
  const [score, setScore] = useState(0);

  const currentWord = words[currentIndex];
  const rhymingWords = words.filter(w => w !== currentWord).slice(0, 3);
  const nonRhymingWords = Object.values(WORD_FAMILIES)
    .flat()
    .filter(w => !w.endsWith(family))
    .sort(() => Math.random() - 0.5)
    .slice(0, 1);

  const options = [...rhymingWords, ...nonRhymingWords].sort(() => Math.random() - 0.5);

  const handleAnswer = (word: string) => {
    if (word.endsWith(family)) {
      setScore(score + 1);
    }

    if (currentIndex < words.length - 1) {
      setCurrentIndex(currentIndex + 1);
    }
  };

  return (
    <div className="bg-white rounded-2xl shadow-xl p-8">
      <h2 className="text-2xl font-bold text-gray-800 mb-6 text-center">
        Which Words Rhyme?
      </h2>

      {/* Target word */}
      <div className="bg-gradient-to-br from-yellow-400 to-orange-500 rounded-2xl p-8 mb-6 text-center">
        <div className="text-6xl font-bold text-white mb-2">{currentWord}</div>
        <div className="text-white text-sm">Find words that rhyme with this</div>
      </div>

      {/* Options */}
      <div className="grid grid-cols-2 gap-4 mb-6">
        {options.map((word) => (
          <motion.button
            key={word}
            onClick={() => handleAnswer(word)}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="py-6 bg-primary-100 text-primary-900 rounded-xl font-bold text-2xl hover:bg-primary-200 transition-colors"
          >
            {word}
          </motion.button>
        ))}
      </div>

      {/* Score */}
      <div className="text-center text-gray-600">
        Score: <span className="font-bold text-success-600">{score}</span>
      </div>
    </div>
  );
}
