/**
 * Dialogue Practice Component
 * Step 178 - Practice typing conversations and dialogue
 */

import { motion, AnimatePresence } from 'framer-motion';
import { useState } from 'react';
import { useSettingsStore } from '../store/useSettingsStore';

// Dialogue examples
export const DIALOGUE_EXAMPLES = [
  {
    title: 'At the Store',
    lines: [
      { speaker: 'Customer', text: 'Hello, how much is this apple?' },
      { speaker: 'Clerk', text: 'It is one dollar.' },
      { speaker: 'Customer', text: 'I will take two apples, please.' },
      { speaker: 'Clerk', text: 'That will be two dollars.' },
    ],
  },
  {
    title: 'Making Friends',
    lines: [
      { speaker: 'Tom', text: 'Hi, my name is Tom. What is your name?' },
      { speaker: 'Sarah', text: 'Hello Tom! I am Sarah.' },
      { speaker: 'Tom', text: 'Do you want to play with me?' },
      { speaker: 'Sarah', text: 'Yes, that sounds fun!' },
    ],
  },
  {
    title: 'At School',
    lines: [
      { speaker: 'Teacher', text: 'Good morning, class!' },
      { speaker: 'Students', text: 'Good morning, teacher!' },
      { speaker: 'Teacher', text: 'Today we will learn about animals.' },
      { speaker: 'Student', text: 'I love animals!' },
    ],
  },
];

export interface DialoguePracticeProps {
  dialogue?: typeof DIALOGUE_EXAMPLES[0];
  onComplete?: () => void;
}

export default function DialoguePractice({
  dialogue,
  onComplete,
}: DialoguePracticeProps) {
  const { settings } = useSettingsStore();
  const selectedDialogue = dialogue || DIALOGUE_EXAMPLES[0];

  const [currentLineIndex, setCurrentLineIndex] = useState(0);
  const [typed, setTyped] = useState('');

  const currentLine = selectedDialogue.lines[currentLineIndex];
  const fullLine = `${currentLine.speaker}: "${currentLine.text}"`;

  // TODO: Connect to keyboard input
  // @ts-expect-error - Function will be used when keyboard input is implemented
  const handleKeyPress = (key: string) => {
    if (key === 'Backspace') {
      setTyped(typed.slice(0, -1));
      return;
    }

    const newTyped = typed + key;

    if (newTyped === fullLine) {
      setTyped('');

      if (currentLineIndex < selectedDialogue.lines.length - 1) {
        setCurrentLineIndex(currentLineIndex + 1);
      } else {
        onComplete?.();
      }
    } else if (fullLine.startsWith(newTyped)) {
      setTyped(newTyped);
    }
  };

  return (
    <div className="bg-white rounded-2xl shadow-xl p-8">
      <h2 className="text-2xl font-bold text-gray-800 mb-6 text-center">
        Dialogue: {selectedDialogue.title}
      </h2>

      {/* Previous lines (context) */}
      <div className="mb-6 space-y-3">
        {selectedDialogue.lines.slice(0, currentLineIndex).map((line, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 0.5, x: 0 }}
            className="bg-gray-100 rounded-lg p-4"
          >
            <div className="font-bold text-gray-600 text-sm mb-1">{line.speaker}:</div>
            <div className="text-gray-500 italic">"{line.text}"</div>
          </motion.div>
        ))}
      </div>

      {/* Current line to type */}
      <AnimatePresence mode="wait">
        <motion.div
          key={currentLineIndex}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          transition={{ duration: settings.reducedMotion ? 0 : 0.3 }}
          className="bg-gradient-to-br from-purple-500 to-pink-600 rounded-xl p-6 mb-6"
        >
          <div className="font-bold text-white text-lg mb-2">{currentLine.speaker}:</div>
          <div className="text-2xl font-medium text-white">
            "{currentLine.text}"
          </div>
        </motion.div>
      </AnimatePresence>

      {/* Typing area */}
      <div className="bg-gray-50 rounded-xl p-6 mb-6">
        <div className="text-xl font-mono min-h-[60px]">
          {typed.split('').map((char, index) => (
            <span
              key={index}
              className={char === fullLine[index] ? 'text-success-600' : 'text-red-600'}
            >
              {char}
            </span>
          ))}
          <span className="animate-pulse">|</span>
        </div>
      </div>

      {/* Progress */}
      <div className="text-center text-gray-600">
        Line {currentLineIndex + 1} of {selectedDialogue.lines.length}
      </div>
    </div>
  );
}

// Dialogue bubble practice
export function DialogueBubbles() {
  const [conversation] = useState([
    { speaker: 'left', text: 'Hello! How are you?' },
    { speaker: 'right', text: 'I am doing great, thanks!' },
    { speaker: 'left', text: 'What did you do today?' },
    { speaker: 'right', text: 'I played in the park.' },
  ]);

  const [currentIndex, setCurrentIndex] = useState(0);
  const [typed, setTyped] = useState('');

  const current = conversation[currentIndex];

  // TODO: Connect to keyboard input
  // @ts-expect-error - Function will be used when keyboard input is implemented
  const handleKeyPress = (key: string) => {
    if (key === 'Backspace') {
      setTyped(typed.slice(0, -1));
      return;
    }

    const newTyped = typed + key;

    if (newTyped === current.text) {
      setTyped('');
      if (currentIndex < conversation.length - 1) {
        setCurrentIndex(currentIndex + 1);
      }
    } else if (current.text.startsWith(newTyped)) {
      setTyped(newTyped);
    }
  };

  return (
    <div className="bg-white rounded-2xl shadow-xl p-8">
      <h2 className="text-2xl font-bold text-gray-800 mb-6 text-center">
        Conversation Practice
      </h2>

      {/* Chat bubbles */}
      <div className="space-y-4 mb-6">
        {conversation.slice(0, currentIndex + 1).map((message, index) => (
          <div
            key={index}
            className={`flex ${message.speaker === 'left' ? 'justify-start' : 'justify-end'}`}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.8, x: message.speaker === 'left' ? -20 : 20 }}
              animate={{ opacity: index < currentIndex ? 1 : 0.5, scale: 1, x: 0 }}
              className={`max-w-[70%] rounded-2xl p-4 ${
                message.speaker === 'left'
                  ? 'bg-gray-200 text-gray-900 rounded-tl-none'
                  : 'bg-primary-500 text-white rounded-tr-none'
              }`}
            >
              <div className="text-lg">{message.text}</div>
            </motion.div>
          </div>
        ))}
      </div>

      {/* Typing for current message */}
      {currentIndex < conversation.length && (
        <div className="bg-blue-50 rounded-xl p-6">
          <div className="text-xl font-mono min-h-[50px]">
            {typed.split('').map((char, index) => (
              <span
                key={index}
                className={char === current.text[index] ? 'text-success-600' : 'text-red-600'}
              >
                {char}
              </span>
            ))}
            <span className="animate-pulse">|</span>
          </div>
        </div>
      )}
    </div>
  );
}

// Script reading practice
export function ScriptReading() {
  const [script] = useState({
    title: 'The Lost Puppy',
    scene: 'A park on a sunny day',
    characters: ['Child', 'Parent', 'Stranger'],
    lines: [
      { character: 'Child', line: 'Mom, look! A puppy!', emotion: 'excited' },
      { character: 'Parent', line: 'Oh my, it looks lost.', emotion: 'concerned' },
      { character: 'Stranger', line: 'Is that your puppy?', emotion: 'curious' },
      { character: 'Child', line: 'No, but we can help find its owner!', emotion: 'helpful' },
    ],
  });

  const [currentLine, setCurrentLine] = useState(0);

  return (
    <div className="bg-white rounded-2xl shadow-xl p-8">
      <h2 className="text-2xl font-bold text-gray-800 mb-6 text-center">
        {script.title}
      </h2>

      {/* Scene description */}
      <div className="bg-purple-50 rounded-xl p-4 mb-6 text-center">
        <div className="text-sm text-purple-900 italic">
          Scene: {script.scene}
        </div>
      </div>

      {/* Script lines */}
      <div className="space-y-4">
        {script.lines.map((item, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: index <= currentLine ? 1 : 0.3, x: 0 }}
            transition={{ delay: index * 0.1 }}
            className={`border-l-4 pl-4 py-3 ${
              index === currentLine
                ? 'border-primary-500 bg-primary-50'
                : 'border-gray-300 bg-gray-50'
            }`}
          >
            <div className="font-bold text-gray-900 mb-1">
              {item.character}
              <span className="text-sm text-gray-500 ml-2 italic">({item.emotion})</span>
            </div>
            <div className="text-lg text-gray-700">
              {item.line}
            </div>
          </motion.div>
        ))}
      </div>

      {/* Navigation */}
      <div className="flex justify-center gap-4 mt-6">
        <button
          onClick={() => currentLine > 0 && setCurrentLine(currentLine - 1)}
          disabled={currentLine === 0}
          className="px-6 py-3 bg-gray-200 text-gray-700 rounded-lg font-bold hover:bg-gray-300 disabled:opacity-50 transition-colors"
        >
          ← Previous
        </button>
        <button
          onClick={() => currentLine < script.lines.length - 1 && setCurrentLine(currentLine + 1)}
          disabled={currentLine === script.lines.length - 1}
          className="px-6 py-3 bg-primary-500 text-white rounded-lg font-bold hover:bg-primary-600 disabled:opacity-50 transition-colors"
        >
          Next →
        </button>
      </div>
    </div>
  );
}
