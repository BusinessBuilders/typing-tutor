/**
 * Voice Commands Component
 * Step 201 - Build voice command recognition system
 */

import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useSettingsStore } from '../store/useSettingsStore';

// Voice command types
export type VoiceCommand =
  | 'start'
  | 'stop'
  | 'pause'
  | 'resume'
  | 'repeat'
  | 'help'
  | 'next'
  | 'back'
  | 'louder'
  | 'quieter'
  | 'faster'
  | 'slower';

// Command configuration
interface CommandConfig {
  command: VoiceCommand;
  phrases: string[];
  description: string;
  action: () => void;
}

// Custom hook for voice commands
export function useVoiceCommands() {
  const [isListening, setIsListening] = useState(false);
  const [lastCommand, setLastCommand] = useState<string | null>(null);
  const [supported, setSupported] = useState(true);
  const recognitionRef = useRef<any>(null);
  const commandsRef = useRef<CommandConfig[]>([]);

  // Register a voice command
  const registerCommand = (config: CommandConfig) => {
    commandsRef.current.push(config);
  };

  // Unregister all commands
  const clearCommands = () => {
    commandsRef.current = [];
  };

  // Start listening for commands
  const startListening = () => {
    const SpeechRecognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    if (!SpeechRecognition) {
      setSupported(false);
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.continuous = true;
    recognition.interimResults = false;
    recognition.lang = 'en-US';

    recognition.onresult = (event: any) => {
      const last = event.results.length - 1;
      const transcript = event.results[last][0].transcript.toLowerCase().trim();

      setLastCommand(transcript);

      // Match command
      commandsRef.current.forEach((config) => {
        config.phrases.forEach((phrase) => {
          if (transcript.includes(phrase.toLowerCase())) {
            config.action();
          }
        });
      });
    };

    recognition.onend = () => {
      if (isListening) {
        recognition.start(); // Restart if still listening
      }
    };

    recognition.onerror = (event: any) => {
      console.error('Speech recognition error:', event.error);
      if (event.error === 'not-allowed') {
        setSupported(false);
      }
    };

    recognition.start();
    recognitionRef.current = recognition;
    setIsListening(true);
  };

  // Stop listening
  const stopListening = () => {
    if (recognitionRef.current) {
      recognitionRef.current.stop();
    }
    setIsListening(false);
  };

  useEffect(() => {
    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
    };
  }, []);

  return {
    isListening,
    startListening,
    stopListening,
    registerCommand,
    clearCommands,
    lastCommand,
    supported,
  };
}

// Default voice commands component
export default function VoiceCommands() {
  const {
    isListening,
    startListening,
    stopListening,
    registerCommand,
    clearCommands,
    lastCommand,
    supported,
  } = useVoiceCommands();

  const { settings } = useSettingsStore();
  const [status, setStatus] = useState('Ready');

  useEffect(() => {
    // Register default commands
    clearCommands();

    registerCommand({
      command: 'start',
      phrases: ['start', 'begin', 'go'],
      description: 'Start the activity',
      action: () => setStatus('Started!'),
    });

    registerCommand({
      command: 'stop',
      phrases: ['stop', 'end', 'finish'],
      description: 'Stop the activity',
      action: () => setStatus('Stopped'),
    });

    registerCommand({
      command: 'pause',
      phrases: ['pause', 'wait'],
      description: 'Pause the activity',
      action: () => setStatus('Paused'),
    });

    registerCommand({
      command: 'resume',
      phrases: ['resume', 'continue'],
      description: 'Resume the activity',
      action: () => setStatus('Resumed'),
    });

    registerCommand({
      command: 'help',
      phrases: ['help', 'assist', 'commands'],
      description: 'Show available commands',
      action: () => setStatus('Showing help'),
    });

    registerCommand({
      command: 'repeat',
      phrases: ['repeat', 'again', 'say that again'],
      description: 'Repeat last instruction',
      action: () => setStatus('Repeating...'),
    });

    registerCommand({
      command: 'louder',
      phrases: ['louder', 'volume up', 'increase volume'],
      description: 'Increase volume',
      action: () => setStatus('Volume increased'),
    });

    registerCommand({
      command: 'quieter',
      phrases: ['quieter', 'volume down', 'decrease volume'],
      description: 'Decrease volume',
      action: () => setStatus('Volume decreased'),
    });
  }, [registerCommand, clearCommands]);

  if (!supported) {
    return (
      <div className="bg-white rounded-2xl shadow-xl p-8">
        <div className="text-center text-gray-600">
          Voice commands are not supported in your browser.
          Try using Chrome or Edge.
        </div>
      </div>
    );
  }

  const commands = [
    { phrase: 'Start / Begin / Go', action: 'Start activity' },
    { phrase: 'Stop / End / Finish', action: 'Stop activity' },
    { phrase: 'Pause / Wait', action: 'Pause activity' },
    { phrase: 'Resume / Continue', action: 'Resume activity' },
    { phrase: 'Help / Assist / Commands', action: 'Show help' },
    { phrase: 'Repeat / Again', action: 'Repeat instruction' },
    { phrase: 'Louder / Volume up', action: 'Increase volume' },
    { phrase: 'Quieter / Volume down', action: 'Decrease volume' },
  ];

  return (
    <div className="bg-white rounded-2xl shadow-xl p-8">
      <h2 className="text-2xl font-bold text-gray-800 mb-6 text-center">
        Voice Commands
      </h2>

      {/* Listening indicator */}
      <div className="mb-8 text-center">
        <button
          onClick={isListening ? stopListening : startListening}
          className={`px-8 py-4 rounded-xl font-bold text-xl transition-all shadow-lg ${
            isListening
              ? 'bg-red-500 hover:bg-red-600 text-white animate-pulse'
              : 'bg-primary-500 hover:bg-primary-600 text-white'
          }`}
        >
          {isListening ? '🎤 Listening...' : '🎤 Start Voice Commands'}
        </button>

        <div className="mt-4">
          <div className="text-sm font-bold text-gray-700 mb-1">Status:</div>
          <div className="text-lg text-primary-600 font-bold">{status}</div>
        </div>

        <AnimatePresence>
          {lastCommand && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="mt-4 inline-block bg-blue-100 text-blue-900 px-6 py-2 rounded-full"
            >
              Heard: "{lastCommand}"
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Command list */}
      <div className="bg-gray-50 rounded-xl p-6">
        <h3 className="text-lg font-bold text-gray-900 mb-4">
          Available Commands
        </h3>
        <div className="space-y-3">
          {commands.map(({ phrase, action }, index) => (
            <motion.div
              key={phrase}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: settings.reducedMotion ? 0 : index * 0.05 }}
              className="flex items-center justify-between p-3 bg-white rounded-lg"
            >
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-primary-100 text-primary-700 rounded-full flex items-center justify-center font-bold text-sm">
                  {index + 1}
                </div>
                <div>
                  <div className="font-bold text-gray-900">{phrase}</div>
                  <div className="text-sm text-gray-600">{action}</div>
                </div>
              </div>
              <div className="text-2xl">🗣️</div>
            </motion.div>
          ))}
        </div>
      </div>

      <div className="mt-6 bg-blue-50 rounded-xl p-6">
        <h3 className="text-lg font-bold text-blue-900 mb-3">
          Voice Command Tips
        </h3>
        <ul className="space-y-2 text-sm text-blue-800">
          <li>• Speak clearly and at a normal pace</li>
          <li>• Allow microphone access when prompted</li>
          <li>• Use any of the listed phrases for each command</li>
          <li>• Commands work even while typing</li>
          <li>• Works best in a quiet environment</li>
        </ul>
      </div>
    </div>
  );
}

// Compact voice command button
export function VoiceCommandButton({ onCommand: _onCommand }: { onCommand?: (cmd: VoiceCommand) => void }) {
  const { isListening, startListening, stopListening } = useVoiceCommands();

  return (
    <motion.button
      onClick={isListening ? stopListening : startListening}
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      className={`px-6 py-3 rounded-lg font-bold transition-colors ${
        isListening
          ? 'bg-red-500 text-white'
          : 'bg-primary-500 text-white hover:bg-primary-600'
      }`}
    >
      {isListening ? '🎤 Stop' : '🎤 Voice'}
    </motion.button>
  );
}

// Floating voice button
export function FloatingVoiceButton() {
  const { isListening, startListening, stopListening } = useVoiceCommands();

  return (
    <motion.button
      onClick={isListening ? stopListening : startListening}
      whileHover={{ scale: 1.1 }}
      whileTap={{ scale: 0.9 }}
      className={`fixed bottom-20 right-4 w-16 h-16 rounded-full shadow-2xl flex items-center justify-center text-3xl transition-colors z-50 ${
        isListening
          ? 'bg-red-500 text-white animate-pulse'
          : 'bg-primary-500 text-white'
      }`}
    >
      🎤
    </motion.button>
  );
}
