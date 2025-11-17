/**
 * Physical Keyboard Support Hook
 * Step 120 - Detect and handle physical keyboard input
 */

import { useEffect, useCallback, useRef, useState } from 'react';

export interface KeyboardEvent {
  key: string;
  code: string;
  isShift: boolean;
  isCtrl: boolean;
  isAlt: boolean;
  isMeta: boolean;
  timestamp: number;
}

export interface UsePhysicalKeyboardOptions {
  onKeyDown?: (event: KeyboardEvent) => void;
  onKeyUp?: (event: KeyboardEvent) => void;
  onKeyPress?: (key: string) => void;
  enabled?: boolean;
  captureKeys?: string[]; // Specific keys to capture
  preventDefaults?: boolean; // Prevent default browser behavior
  ignoreInputs?: boolean; // Ignore events from input fields
}

export function usePhysicalKeyboard(options: UsePhysicalKeyboardOptions = {}) {
  const {
    onKeyDown,
    onKeyUp,
    onKeyPress,
    enabled = true,
    captureKeys,
    preventDefaults = false,
    ignoreInputs = true,
  } = options;

  const [pressedKeys, setPressedKeys] = useState<Set<string>>(new Set());
  const keysRef = useRef<Set<string>>(new Set());

  const isInputElement = (target: EventTarget | null): boolean => {
    if (!target) return false;
    const element = target as HTMLElement;
    const tagName = element.tagName.toLowerCase();
    return (
      tagName === 'input' ||
      tagName === 'textarea' ||
      element.isContentEditable
    );
  };

  const shouldCaptureKey = useCallback(
    (key: string): boolean => {
      if (!captureKeys || captureKeys.length === 0) return true;
      return captureKeys.includes(key) || captureKeys.includes(key.toLowerCase());
    },
    [captureKeys]
  );

  const handleKeyDown = useCallback(
    (e: globalThis.KeyboardEvent) => {
      if (!enabled) return;
      if (ignoreInputs && isInputElement(e.target)) return;
      if (!shouldCaptureKey(e.key)) return;

      if (preventDefaults) {
        e.preventDefault();
      }

      const keyEvent: KeyboardEvent = {
        key: e.key,
        code: e.code,
        isShift: e.shiftKey,
        isCtrl: e.ctrlKey,
        isAlt: e.altKey,
        isMeta: e.metaKey,
        timestamp: Date.now(),
      };

      // Track pressed keys
      keysRef.current.add(e.key);
      setPressedKeys(new Set(keysRef.current));

      onKeyDown?.(keyEvent);

      // Only fire onKeyPress for printable characters
      if (e.key.length === 1) {
        onKeyPress?.(e.key);
      }
    },
    [enabled, ignoreInputs, preventDefaults, shouldCaptureKey, onKeyDown, onKeyPress]
  );

  const handleKeyUp = useCallback(
    (e: globalThis.KeyboardEvent) => {
      if (!enabled) return;
      if (ignoreInputs && isInputElement(e.target)) return;

      const keyEvent: KeyboardEvent = {
        key: e.key,
        code: e.code,
        isShift: e.shiftKey,
        isCtrl: e.ctrlKey,
        isAlt: e.altKey,
        isMeta: e.metaKey,
        timestamp: Date.now(),
      };

      // Remove from pressed keys
      keysRef.current.delete(e.key);
      setPressedKeys(new Set(keysRef.current));

      onKeyUp?.(keyEvent);
    },
    [enabled, ignoreInputs, onKeyUp]
  );

  useEffect(() => {
    if (!enabled) return;

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);

    // Clear pressed keys on window blur
    const handleBlur = () => {
      keysRef.current.clear();
      setPressedKeys(new Set());
    };

    window.addEventListener('blur', handleBlur);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
      window.removeEventListener('blur', handleBlur);
    };
  }, [enabled, handleKeyDown, handleKeyUp]);

  const isKeyPressed = useCallback(
    (key: string): boolean => {
      return pressedKeys.has(key);
    },
    [pressedKeys]
  );

  return {
    pressedKeys,
    isKeyPressed,
  };
}

// Hook for tracking typing metrics from physical keyboard
export function useTypingMetrics() {
  const [metrics, setMetrics] = useState({
    wpm: 0,
    accuracy: 0,
    keystrokes: 0,
    errors: 0,
    startTime: 0,
    endTime: 0,
  });

  const keystrokeTimes = useRef<number[]>([]);

  const recordKeystroke = useCallback((timestamp: number, isCorrect: boolean) => {
    keystrokeTimes.current.push(timestamp);

    setMetrics((prev) => ({
      ...prev,
      keystrokes: prev.keystrokes + 1,
      errors: isCorrect ? prev.errors : prev.errors + 1,
    }));

    // Calculate WPM from recent keystrokes (last 60 seconds)
    const now = Date.now();
    const recentKeystrokes = keystrokeTimes.current.filter(
      (time) => now - time < 60000
    );

    if (recentKeystrokes.length > 0) {
      const timeSpan = (now - recentKeystrokes[0]) / 1000 / 60; // minutes
      const words = recentKeystrokes.length / 5; // 5 keystrokes = 1 word
      const wpm = Math.round(words / timeSpan);

      setMetrics((prev) => ({
        ...prev,
        wpm,
        accuracy: prev.keystrokes > 0 ? ((prev.keystrokes - prev.errors) / prev.keystrokes) * 100 : 100,
      }));
    }
  }, []);

  const reset = useCallback(() => {
    keystrokeTimes.current = [];
    setMetrics({
      wpm: 0,
      accuracy: 0,
      keystrokes: 0,
      errors: 0,
      startTime: Date.now(),
      endTime: 0,
    });
  }, []);

  const complete = useCallback(() => {
    setMetrics((prev) => ({
      ...prev,
      endTime: Date.now(),
    }));
  }, []);

  return {
    metrics,
    recordKeystroke,
    reset,
    complete,
  };
}

// Hook for keyboard shortcuts
export function useKeyboardShortcuts(
  shortcuts: Record<string, () => void>,
  options: { enabled?: boolean } = {}
) {
  const { enabled = true } = options;

  useEffect(() => {
    if (!enabled) return;

    const handleKeyDown = (e: globalThis.KeyboardEvent) => {
      // Build shortcut string (e.g., "Ctrl+S", "Alt+Enter")
      const parts: string[] = [];
      if (e.ctrlKey) parts.push('Ctrl');
      if (e.altKey) parts.push('Alt');
      if (e.shiftKey) parts.push('Shift');
      if (e.metaKey) parts.push('Meta');
      parts.push(e.key);

      const shortcut = parts.join('+');

      if (shortcuts[shortcut]) {
        e.preventDefault();
        shortcuts[shortcut]();
      }
    };

    window.addEventListener('keydown', handleKeyDown);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [enabled, shortcuts]);
}

// Hook to detect keyboard layout
export function useKeyboardLayout() {
  const [layout, setLayout] = useState<'qwerty' | 'dvorak' | 'azerty' | 'unknown'>('qwerty');

  useEffect(() => {
    // Try to detect keyboard layout by testing key positions
    const detectLayout = (e: globalThis.KeyboardEvent) => {
      // Check key code vs key value to infer layout
      // This is a simplified detection
      if (e.code === 'KeyQ' && e.key === 'a') {
        setLayout('dvorak');
      } else if (e.code === 'KeyA' && e.key === 'q') {
        setLayout('azerty');
      } else if (e.code === 'KeyQ' && e.key === 'q') {
        setLayout('qwerty');
      }

      // Remove listener after detection
      window.removeEventListener('keydown', detectLayout);
    };

    window.addEventListener('keydown', detectLayout);

    return () => {
      window.removeEventListener('keydown', detectLayout);
    };
  }, []);

  return layout;
}

// Keyboard event recorder for replays
export function useKeyboardRecorder() {
  const [recording, setRecording] = useState(false);
  const [events, setEvents] = useState<KeyboardEvent[]>([]);
  const eventsRef = useRef<KeyboardEvent[]>([]);

  const startRecording = useCallback(() => {
    eventsRef.current = [];
    setEvents([]);
    setRecording(true);
  }, []);

  const stopRecording = useCallback(() => {
    setRecording(false);
    setEvents([...eventsRef.current]);
  }, []);

  const { pressedKeys: _pressedKeys } = usePhysicalKeyboard({
    enabled: recording,
    onKeyPress: (key) => {
      const event: KeyboardEvent = {
        key,
        code: '',
        isShift: false,
        isCtrl: false,
        isAlt: false,
        isMeta: false,
        timestamp: Date.now(),
      };
      eventsRef.current.push(event);
    },
  });

  const replay = useCallback(
    async (onKeyPress: (key: string) => void, speed = 1) => {
      for (const event of events) {
        const delay = events[0]
          ? (event.timestamp - events[0].timestamp) / speed
          : 0;

        await new Promise((resolve) => setTimeout(resolve, delay));
        onKeyPress(event.key);
      }
    },
    [events]
  );

  return {
    recording,
    events,
    startRecording,
    stopRecording,
    replay,
  };
}

// Note: KeyboardShortcutsHelp component moved to src/components/KeyboardShortcutsHelp.tsx
