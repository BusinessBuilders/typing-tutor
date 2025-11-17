/**
 * Recognition Games Component
 * Step 154 - Interactive letter recognition games
 */

import { motion } from 'framer-motion';
import { useState } from 'react';
import { useSettingsStore } from '../store/useSettingsStore';

// Letter hunt game
export default function LetterHuntGame({ targetLetter }: { targetLetter: string }) {
  const { settings } = useSettingsStore();
  const [found, setFound] = useState(0);

  const alphabet = 'abcdefghijklmnopqrstuvwxyz'.split('');
  const letters = [...Array(20)].map(() =>
    Math.random() > 0.7 ? targetLetter : alphabet[Math.floor(Math.random() * alphabet.length)]
  );

  const targetCount = letters.filter(l => l === targetLetter).length;

  const handleClick = (letter: string, _index: number) => {
    if (letter === targetLetter) {
      setFound(found + 1);
    }
  };

  return (
    <div className="bg-white rounded-2xl shadow-xl p-8">
      <h2 className="text-2xl font-bold text-gray-800 mb-6 text-center">
        Find All the {targetLetter.toUpperCase()}'s!
      </h2>

      <div className="mb-6 text-center">
        <div className="text-lg text-gray-700">
          Found: {found} / {targetCount}
        </div>
      </div>

      <div className="grid grid-cols-5 gap-3">
        {letters.map((letter, index) => (
          <motion.button
            key={index}
            onClick={() => handleClick(letter, index)}
            whileHover={{ scale: settings.reducedMotion ? 1 : 1.1 }}
            className="aspect-square bg-gray-100 hover:bg-primary-100 rounded-xl font-bold text-3xl text-gray-800 transition-colors"
          >
            {letter.toUpperCase()}
          </motion.button>
        ))}
      </div>
    </div>
  );
}

// Flash card recognition
export function FlashCardRecognition() {
  const [currentCard, setCurrentCard] = useState(0);
  const cards = ['a', 'b', 'c', 'd', 'e'];

  return (
    <div className="bg-white rounded-2xl shadow-xl p-8">
      <motion.div
        key={currentCard}
        initial={{ rotateY: 90 }}
        animate={{ rotateY: 0 }}
        className="w-64 h-64 mx-auto bg-gradient-to-br from-pink-500 to-purple-600 rounded-3xl flex items-center justify-center text-white text-9xl font-bold shadow-2xl"
      >
        {cards[currentCard].toUpperCase()}
      </motion.div>

      <div className="mt-8 flex justify-center">
        <button
          onClick={() => setCurrentCard((currentCard + 1) % cards.length)}
          className="px-8 py-4 bg-primary-500 text-white rounded-lg font-bold"
        >
          Next Card
        </button>
      </div>
    </div>
  );
}
