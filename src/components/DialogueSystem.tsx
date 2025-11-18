import React, { useState, useCallback, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

// Types
export type DialogueSpeaker = 'character' | 'user' | 'narrator' | 'system';

export type DialogueEmotionalTone =
  | 'happy'
  | 'sad'
  | 'excited'
  | 'calm'
  | 'worried'
  | 'curious'
  | 'confident'
  | 'surprised'
  | 'neutral';

export type DialogueType =
  | 'conversation'
  | 'question'
  | 'instruction'
  | 'narration'
  | 'choice'
  | 'response';

export interface DialogueLine {
  id: string;
  speaker: DialogueSpeaker;
  characterId?: string; // If speaker is 'character'
  characterName?: string;
  text: string;
  emotionalTone: DialogueEmotionalTone;
  type: DialogueType;
  timestamp: Date;
  choices?: DialogueChoice[];
  metadata?: {
    difficulty?: number; // 1-10 for typing difficulty
    wordCount?: number;
    typingTime?: number; // Actual time taken to type (in ms)
    accuracy?: number; // If user typed this
  };
}

export interface DialogueChoice {
  id: string;
  text: string;
  leadsTo?: string; // ID of next dialogue line or dialogue tree
  consequence?: string; // Description of what happens
  emotionalTone: DialogueEmotionalTone;
  enabled: boolean;
  tags?: string[];
}

export interface DialogueTree {
  id: string;
  name: string;
  description: string;
  startLineId: string;
  lines: Map<string, DialogueLine>;
  currentLineId: string | null;
  characterIds: string[]; // Characters involved
  tags: string[];
  autismFriendly: boolean;
  sensoryConsiderations?: string[];
  estimatedDuration: number; // In seconds
  completed: boolean;
  createdAt: Date;
}

export interface DialogueHistory {
  dialogueTreeId: string;
  lines: DialogueLine[];
  choices: { lineId: string; choiceId: string; timestamp: Date }[];
  startTime: Date;
  endTime?: Date;
  completed: boolean;
  averageTypingSpeed?: number;
  averageAccuracy?: number;
}

export interface DialogueSystemSettings {
  showSpeakerNames: boolean;
  showEmotionalIndicators: boolean;
  autoAdvanceDelay: number; // 0 = no auto-advance
  allowSkipping: boolean;
  requireTypingForChoices: boolean; // User must type the choice, not click
  showTypingProgress: boolean;
  playTextAnimations: boolean;
  textSpeed: 'slow' | 'medium' | 'fast' | 'instant';
  pauseAfterUserInput: boolean;
  pauseDuration: number; // ms
  highlightNewText: boolean;
  voiceMode: 'text-only' | 'text-and-audio' | 'audio-only';
}

interface DialogueSystemProps {
  onDialogueComplete?: (history: DialogueHistory) => void;
  onChoiceSelect?: (choice: DialogueChoice, line: DialogueLine) => void;
  onLineComplete?: (line: DialogueLine) => void;
  settings?: Partial<DialogueSystemSettings>;
}

// Sample dialogue trees
const sampleDialogueTrees: Omit<DialogueTree, 'lines' | 'currentLineId' | 'completed' | 'createdAt'>[] = [
  {
    id: 'tree-greeting-1',
    name: 'Morning Greeting',
    description: 'A simple morning conversation practice',
    startLineId: 'line-1',
    characterIds: ['char-alex-explorer'],
    tags: ['beginner', 'greeting', 'positive'],
    autismFriendly: true,
    sensoryConsiderations: ['predictable-flow', 'clear-turn-taking'],
    estimatedDuration: 45,
  },
  {
    id: 'tree-learning-1',
    name: 'Science Lesson',
    description: 'Interactive science learning dialogue',
    startLineId: 'line-1',
    characterIds: ['char-sam-scientist'],
    tags: ['educational', 'science', 'interactive'],
    autismFriendly: true,
    sensoryConsiderations: ['fact-based', 'structured'],
    estimatedDuration: 120,
  },
];

// Sample dialogue lines for the greeting tree
const greetingDialogueLines: DialogueLine[] = [
  {
    id: 'line-1',
    speaker: 'character',
    characterId: 'char-alex-explorer',
    characterName: 'Alex',
    text: 'Good morning! Beautiful day for an adventure, isn\'t it?',
    emotionalTone: 'happy',
    type: 'conversation',
    timestamp: new Date(),
    metadata: { difficulty: 3, wordCount: 9 },
  },
  {
    id: 'line-2',
    speaker: 'user',
    text: '',
    emotionalTone: 'neutral',
    type: 'response',
    timestamp: new Date(),
    choices: [
      {
        id: 'choice-1',
        text: 'Yes, it really is!',
        leadsTo: 'line-3',
        emotionalTone: 'happy',
        enabled: true,
      },
      {
        id: 'choice-2',
        text: 'I suppose so.',
        leadsTo: 'line-4',
        emotionalTone: 'neutral',
        enabled: true,
      },
    ],
    metadata: { difficulty: 2 },
  },
  {
    id: 'line-3',
    speaker: 'character',
    characterId: 'char-alex-explorer',
    characterName: 'Alex',
    text: 'I\'m so glad you think so! Want to practice some typing together?',
    emotionalTone: 'excited',
    type: 'question',
    timestamp: new Date(),
    metadata: { difficulty: 4, wordCount: 11 },
  },
  {
    id: 'line-4',
    speaker: 'character',
    characterId: 'char-alex-explorer',
    characterName: 'Alex',
    text: 'Well, any day is a good day for learning. Ready to practice?',
    emotionalTone: 'calm',
    type: 'question',
    timestamp: new Date(),
    metadata: { difficulty: 4, wordCount: 12 },
  },
];

const defaultSettings: DialogueSystemSettings = {
  showSpeakerNames: true,
  showEmotionalIndicators: true,
  autoAdvanceDelay: 0,
  allowSkipping: false,
  requireTypingForChoices: true,
  showTypingProgress: true,
  playTextAnimations: true,
  textSpeed: 'medium',
  pauseAfterUserInput: true,
  pauseDuration: 500,
  highlightNewText: true,
  voiceMode: 'text-only',
};

export const useDialogueSystem = (props: DialogueSystemProps = {}) => {
  const settings = { ...defaultSettings, ...props.settings };

  // State
  const [dialogueTrees, setDialogueTrees] = useState<DialogueTree[]>([]);
  const [currentTree, setCurrentTree] = useState<DialogueTree | null>(null);
  const [currentLine, setCurrentLine] = useState<DialogueLine | null>(null);
  const [history, setHistory] = useState<DialogueHistory[]>([]);
  const [currentHistory, setCurrentHistory] = useState<DialogueHistory | null>(null);
  const [displayedText, setDisplayedText] = useState<string>('');
  const [isTypingAnimation, setIsTypingAnimation] = useState(false);
  const [userInput, setUserInput] = useState<string>('');
  const [waitingForInput, setWaitingForInput] = useState(false);

  const animationTimeoutRef = useRef<NodeJS.Timeout>();

  // Initialize dialogue trees
  useEffect(() => {
    const trees: DialogueTree[] = sampleDialogueTrees.map((treeData) => {
      const linesMap = new Map<string, DialogueLine>();

      // For greeting tree, add the sample lines
      if (treeData.id === 'tree-greeting-1') {
        greetingDialogueLines.forEach((line) => {
          linesMap.set(line.id, line);
        });
      }

      return {
        ...treeData,
        lines: linesMap,
        currentLineId: null,
        completed: false,
        createdAt: new Date(),
      };
    });

    setDialogueTrees(trees);

    // Load history from localStorage
    try {
      const saved = localStorage.getItem('typing-tutor-dialogue-history');
      if (saved) {
        const data = JSON.parse(saved);
        setHistory(data.history || []);
      }
    } catch (err) {
      console.error('Failed to load dialogue history:', err);
    }
  }, []);

  // Auto-save history
  useEffect(() => {
    try {
      const data = { history: history.slice(-20) }; // Keep last 20 sessions
      localStorage.setItem('typing-tutor-dialogue-history', JSON.stringify(data));
    } catch (err) {
      console.error('Failed to save dialogue history:', err);
    }
  }, [history]);

  // Text animation effect
  useEffect(() => {
    if (!currentLine || !settings.playTextAnimations || settings.textSpeed === 'instant') {
      setDisplayedText(currentLine?.text || '');
      setIsTypingAnimation(false);
      return;
    }

    setIsTypingAnimation(true);
    setDisplayedText('');

    const speeds = {
      slow: 50,
      medium: 30,
      fast: 15,
      instant: 0,
    };

    const delay = speeds[settings.textSpeed];
    let charIndex = 0;

    const animate = () => {
      if (charIndex <= currentLine.text.length) {
        setDisplayedText(currentLine.text.slice(0, charIndex));
        charIndex++;
        animationTimeoutRef.current = setTimeout(animate, delay);
      } else {
        setIsTypingAnimation(false);
      }
    };

    animate();

    return () => {
      if (animationTimeoutRef.current) {
        clearTimeout(animationTimeoutRef.current);
      }
    };
  }, [currentLine, settings.playTextAnimations, settings.textSpeed]);

  // Start dialogue tree
  const startDialogue = useCallback(
    (treeId: string) => {
      const tree = dialogueTrees.find((t) => t.id === treeId);
      if (!tree) return false;

      const startLine = tree.lines.get(tree.startLineId);
      if (!startLine) return false;

      setCurrentTree(tree);
      setCurrentLine(startLine);
      setUserInput('');

      // Initialize history
      const newHistory: DialogueHistory = {
        dialogueTreeId: treeId,
        lines: [startLine],
        choices: [],
        startTime: new Date(),
        completed: false,
      };
      setCurrentHistory(newHistory);

      // Update tree
      const updatedTree = { ...tree, currentLineId: startLine.id };
      setDialogueTrees((prev) =>
        prev.map((t) => (t.id === treeId ? updatedTree : t))
      );
      setCurrentTree(updatedTree);

      return true;
    },
    [dialogueTrees]
  );

  // Advance to next line
  const advanceLine = useCallback(
    (nextLineId: string, choiceId?: string) => {
      if (!currentTree || !currentHistory) return false;

      const nextLine = currentTree.lines.get(nextLineId);
      if (!nextLine) {
        // End of dialogue
        completeDialogue();
        return false;
      }

      // Update history
      const updatedHistory: DialogueHistory = {
        ...currentHistory,
        lines: [...currentHistory.lines, nextLine],
        choices: choiceId
          ? [
              ...currentHistory.choices,
              { lineId: currentLine?.id || '', choiceId, timestamp: new Date() },
            ]
          : currentHistory.choices,
      };
      setCurrentHistory(updatedHistory);

      // Update current line
      setCurrentLine(nextLine);
      setUserInput('');

      // Check if waiting for user input
      if (nextLine.speaker === 'user') {
        setWaitingForInput(true);
      } else {
        setWaitingForInput(false);
      }

      // Update tree
      const updatedTree = { ...currentTree, currentLineId: nextLineId };
      setCurrentTree(updatedTree);

      // Call callback
      props.onLineComplete?.(nextLine);

      return true;
    },
    [currentTree, currentHistory, currentLine, props]
  );

  // Complete dialogue
  const completeDialogue = useCallback(() => {
    if (!currentHistory || !currentTree) return;

    const completedHistory: DialogueHistory = {
      ...currentHistory,
      endTime: new Date(),
      completed: true,
    };

    // Calculate statistics
    const typedLines = completedHistory.lines.filter(
      (l) => l.speaker === 'user' && l.metadata?.typingTime
    );
    if (typedLines.length > 0) {
      const totalTime = typedLines.reduce((sum, l) => sum + (l.metadata!.typingTime! || 0), 0);
      const totalWords = typedLines.reduce((sum, l) => sum + (l.metadata!.wordCount || 0), 0);
      completedHistory.averageTypingSpeed = (totalWords / (totalTime / 1000 / 60)) || 0;

      const totalAccuracy = typedLines.reduce((sum, l) => sum + (l.metadata!.accuracy || 0), 0);
      completedHistory.averageAccuracy = totalAccuracy / typedLines.length;
    }

    setHistory((prev) => [...prev, completedHistory]);
    setCurrentHistory(null);
    setCurrentTree(null);
    setCurrentLine(null);
    setWaitingForInput(false);

    // Mark tree as completed
    setDialogueTrees((prev) =>
      prev.map((t) =>
        t.id === currentTree.id ? { ...t, completed: true, currentLineId: null } : t
      )
    );

    props.onDialogueComplete?.(completedHistory);
  }, [currentHistory, currentTree, props]);

  // Handle user typing
  const handleUserType = useCallback(
    (text: string) => {
      setUserInput(text);
    },
    []
  );

  // Submit user input
  const submitUserInput = useCallback(
    (choiceId?: string) => {
      if (!currentLine || !currentHistory) return false;

      const startTime = currentHistory.lines[currentHistory.lines.length - 1]?.timestamp;
      const typingTime = startTime ? Date.now() - startTime.getTime() : 0;

      // Create user line with metadata
      const userLine: DialogueLine = {
        ...currentLine,
        text: userInput,
        timestamp: new Date(),
        metadata: {
          ...currentLine.metadata,
          wordCount: userInput.split(/\s+/).length,
          typingTime,
        },
      };

      // Update current line in history
      const updatedHistory = {
        ...currentHistory,
        lines: [...currentHistory.lines.slice(0, -1), userLine],
      };
      setCurrentHistory(updatedHistory);

      // Find next line
      if (choiceId && currentLine.choices) {
        const choice = currentLine.choices.find((c) => c.id === choiceId);
        if (choice && choice.leadsTo) {
          props.onChoiceSelect?.(choice, userLine);
          advanceLine(choice.leadsTo, choiceId);
          return true;
        }
      }

      // No more lines
      completeDialogue();
      return true;
    },
    [currentLine, currentHistory, userInput, advanceLine, completeDialogue, props]
  );

  // Select choice
  const selectChoice = useCallback(
    (choiceId: string) => {
      if (!currentLine?.choices) return false;

      const choice = currentLine.choices.find((c) => c.id === choiceId);
      if (!choice || !choice.enabled) return false;

      if (settings.requireTypingForChoices) {
        // User must type the choice text
        setUserInput(choice.text);
        setWaitingForInput(true);
        return true;
      } else {
        // Direct selection
        return submitUserInput(choiceId);
      }
    },
    [currentLine, settings.requireTypingForChoices, submitUserInput]
  );

  // Skip current line (if allowed)
  const skipLine = useCallback(() => {
    if (!settings.allowSkipping || !currentLine) return false;

    setIsTypingAnimation(false);
    setDisplayedText(currentLine.text);

    if (animationTimeoutRef.current) {
      clearTimeout(animationTimeoutRef.current);
    }

    return true;
  }, [settings.allowSkipping, currentLine]);

  // Create custom dialogue tree
  const createDialogueTree = useCallback(
    (
      name: string,
      description: string,
      lines: DialogueLine[],
      options?: {
        characterIds?: string[];
        tags?: string[];
        autismFriendly?: boolean;
        sensoryConsiderations?: string[];
      }
    ): string | null => {
      if (lines.length === 0) return null;

      const linesMap = new Map<string, DialogueLine>();
      lines.forEach((line) => linesMap.set(line.id, line));

      const tree: DialogueTree = {
        id: `custom-tree-${Date.now()}`,
        name,
        description,
        startLineId: lines[0].id,
        lines: linesMap,
        currentLineId: null,
        characterIds: options?.characterIds || [],
        tags: options?.tags || [],
        autismFriendly: options?.autismFriendly ?? true,
        sensoryConsiderations: options?.sensoryConsiderations,
        estimatedDuration: lines.reduce((sum, l) => sum + (l.metadata?.wordCount || 5) * 0.5, 0),
        completed: false,
        createdAt: new Date(),
      };

      setDialogueTrees((prev) => [...prev, tree]);
      return tree.id;
    },
    []
  );

  // Get dialogue statistics
  const getStatistics = useCallback(() => {
    return {
      totalDialogues: history.length,
      completedDialogues: history.filter((h) => h.completed).length,
      totalLines: history.reduce((sum, h) => sum + h.lines.length, 0),
      totalChoices: history.reduce((sum, h) => sum + h.choices.length, 0),
      averageTypingSpeed: history.reduce((sum, h) => sum + (h.averageTypingSpeed || 0), 0) / history.length || 0,
      averageAccuracy: history.reduce((sum, h) => sum + (h.averageAccuracy || 0), 0) / history.length || 0,
      favoriteTree: dialogueTrees.reduce((prev, current) => {
        const prevCount = history.filter((h) => h.dialogueTreeId === prev.id).length;
        const currentCount = history.filter((h) => h.dialogueTreeId === current.id).length;
        return currentCount > prevCount ? current : prev;
      }, dialogueTrees[0]),
    };
  }, [history, dialogueTrees]);

  return {
    // State
    dialogueTrees,
    currentTree,
    currentLine,
    displayedText,
    isTypingAnimation,
    userInput,
    waitingForInput,
    history,
    currentHistory,
    settings,

    // Actions
    startDialogue,
    advanceLine,
    completeDialogue,
    handleUserType,
    submitUserInput,
    selectChoice,
    skipLine,
    createDialogueTree,
    getStatistics,
  };
};

// Example component
export const DialogueSystemComponent: React.FC<DialogueSystemProps> = (props) => {
  const {
    dialogueTrees,
    currentTree,
    currentLine,
    displayedText,
    isTypingAnimation,
    userInput,
    waitingForInput,
    startDialogue,
    selectChoice,
    handleUserType,
    submitUserInput,
    skipLine,
    settings,
  } = useDialogueSystem(props);

  return (
    <div className="dialogue-system">
      {!currentTree ? (
        <div className="dialogue-selection">
          <h2>Choose a Dialogue</h2>
          <div className="dialogue-trees-list">
            {dialogueTrees.map((tree) => (
              <motion.div
                key={tree.id}
                className="dialogue-tree-card"
                onClick={() => startDialogue(tree.id)}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <h3>{tree.name}</h3>
                <p>{tree.description}</p>
                <div className="tree-meta">
                  <span className="duration">~{tree.estimatedDuration}s</span>
                  {tree.autismFriendly && <span className="badge">Autism-Friendly</span>}
                  {tree.completed && <span className="badge completed">Completed</span>}
                </div>
                <div className="tags">
                  {tree.tags.map((tag) => (
                    <span key={tag} className="tag">
                      {tag}
                    </span>
                  ))}
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      ) : (
        <div className="dialogue-display">
          <div className="dialogue-header">
            <h3>{currentTree.name}</h3>
            {settings.allowSkipping && isTypingAnimation && (
              <button onClick={skipLine} className="skip-btn">
                Skip
              </button>
            )}
          </div>

          <AnimatePresence mode="wait">
            {currentLine && (
              <motion.div
                key={currentLine.id}
                className={`dialogue-line ${currentLine.speaker}`}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.3 }}
              >
                {settings.showSpeakerNames && currentLine.characterName && (
                  <div className="speaker-name">
                    {currentLine.characterName}
                    {settings.showEmotionalIndicators && (
                      <span className={`emotion-indicator ${currentLine.emotionalTone}`}>
                        {currentLine.emotionalTone}
                      </span>
                    )}
                  </div>
                )}

                <div className="dialogue-text">
                  {displayedText}
                  {isTypingAnimation && <span className="cursor">|</span>}
                </div>

                {!isTypingAnimation && currentLine.choices && currentLine.choices.length > 0 && (
                  <div className="dialogue-choices">
                    {currentLine.choices.map((choice) => (
                      <motion.button
                        key={choice.id}
                        className={`choice-btn ${choice.emotionalTone}`}
                        onClick={() => selectChoice(choice.id)}
                        disabled={!choice.enabled}
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                      >
                        {choice.text}
                        {choice.consequence && (
                          <span className="consequence">{choice.consequence}</span>
                        )}
                      </motion.button>
                    ))}
                  </div>
                )}

                {waitingForInput && (
                  <div className="user-input-area">
                    <input
                      type="text"
                      value={userInput}
                      onChange={(e) => handleUserType(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          const choiceId = currentLine.choices?.[0]?.id;
                          submitUserInput(choiceId);
                        }
                      }}
                      placeholder="Type your response..."
                      autoFocus
                    />
                    {settings.showTypingProgress && (
                      <div className="typing-progress">
                        {userInput.length} characters
                      </div>
                    )}
                  </div>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      )}
    </div>
  );
};

export default DialogueSystemComponent;
