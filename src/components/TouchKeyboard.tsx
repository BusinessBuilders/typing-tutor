/**
 * Touch Keyboard Component
 * Step 119 - Optimized keyboard for touch and mobile devices
 */

import { motion } from 'framer-motion';
import { useState, useCallback, useRef } from 'react';
import { useSettingsStore } from '../store/useSettingsStore';

export interface TouchKeyboardProps {
  layout?: 'qwerty' | 'abc' | 'simple';
  onKeyPress?: (key: string) => void;
  highlightKey?: string;
  size?: 'normal' | 'large' | 'xlarge';
  hapticFeedback?: boolean;
  swipeToDelete?: boolean;
}

export default function TouchKeyboard({
  layout = 'abc',
  onKeyPress,
  highlightKey,
  size = 'large',
  hapticFeedback = true,
  swipeToDelete = true,
}: TouchKeyboardProps) {
  const { settings: _settings } = useSettingsStore();
  const [pressedKey, setPressedKey] = useState<string | null>(null);
  const [touchStart, setTouchStart] = useState<{ x: number; y: number } | null>(null);

  // Layout configurations optimized for touch
  const touchLayouts = {
    qwerty: [
      ['q', 'w', 'e', 'r', 't', 'y', 'u', 'i', 'o', 'p'],
      ['a', 's', 'd', 'f', 'g', 'h', 'j', 'k', 'l'],
      ['z', 'x', 'c', 'v', 'b', 'n', 'm'],
    ],
    abc: [
      ['a', 'b', 'c', 'd', 'e', 'f', 'g'],
      ['h', 'i', 'j', 'k', 'l', 'm', 'n'],
      ['o', 'p', 'q', 'r', 's', 't'],
      ['u', 'v', 'w', 'x', 'y', 'z'],
    ],
    simple: [
      ['a', 'b', 'c', 'd'],
      ['e', 'f', 'g', 'h'],
      ['i', 'j', 'k', 'l'],
      ['m', 'n', 'o', 'p'],
      ['q', 'r', 's', 't'],
      ['u', 'v', 'w', 'x'],
      ['y', 'z'],
    ],
  };

  const currentLayout = touchLayouts[layout];

  // Size configurations optimized for touch targets (min 44x44px)
  const sizeConfig = {
    normal: {
      key: 'min-w-[44px] min-h-[44px] text-lg',
      spacing: 'gap-2',
      padding: 'p-3',
    },
    large: {
      key: 'min-w-[56px] min-h-[56px] text-xl',
      spacing: 'gap-3',
      padding: 'p-4',
    },
    xlarge: {
      key: 'min-w-[72px] min-h-[72px] text-2xl',
      spacing: 'gap-4',
      padding: 'p-6',
    },
  };

  const config = sizeConfig[size];

  // Handle touch with haptic feedback
  const handleTouchStart = useCallback(
    (key: string, e: React.TouchEvent) => {
      e.preventDefault();
      setPressedKey(key);

      // Haptic feedback
      if (hapticFeedback && navigator.vibrate) {
        navigator.vibrate(10);
      }

      // Record touch position for swipe detection
      const touch = e.touches[0];
      setTouchStart({ x: touch.clientX, y: touch.clientY });
    },
    [hapticFeedback]
  );

  const handleTouchEnd = useCallback(
    (key: string, e: React.TouchEvent) => {
      e.preventDefault();
      setPressedKey(null);

      // Check for swipe gesture
      if (swipeToDelete && touchStart) {
        const touch = e.changedTouches[0];
        const deltaX = touch.clientX - touchStart.x;
        const deltaY = Math.abs(touch.clientY - touchStart.y);

        // Swipe left to delete
        if (deltaX < -50 && deltaY < 30) {
          onKeyPress?.('Backspace');
          if (hapticFeedback && navigator.vibrate) {
            navigator.vibrate([10, 30, 10]);
          }
          setTouchStart(null);
          return;
        }
      }

      onKeyPress?.(key);
      setTouchStart(null);
    },
    [onKeyPress, swipeToDelete, touchStart, hapticFeedback]
  );

  const isKeyHighlighted = (key: string) => highlightKey?.toLowerCase() === key.toLowerCase();
  const isKeyPressed = (key: string) => pressedKey === key;

  return (
    <div className={`${config.padding} bg-gray-50 rounded-2xl shadow-inner`}>
      {/* Swipe hint */}
      {swipeToDelete && (
        <div className="text-center mb-4 text-sm text-gray-600">
          👆 Tap to type • 👈 Swipe left to delete
        </div>
      )}

      {/* Touch-optimized keyboard */}
      <div className={`flex flex-col ${config.spacing}`}>
        {currentLayout.map((row, rowIndex) => (
          <div key={rowIndex} className={`flex justify-center ${config.spacing}`}>
            {row.map((key) => (
              <TouchKey
                key={key}
                letter={key}
                isHighlighted={isKeyHighlighted(key)}
                isPressed={isKeyPressed(key)}
                className={config.key}
                onTouchStart={(e) => handleTouchStart(key, e)}
                onTouchEnd={(e) => handleTouchEnd(key, e)}
              />
            ))}
          </div>
        ))}

        {/* Space bar row */}
        <div className={`flex justify-center ${config.spacing}`}>
          <TouchKey
            letter="Backspace"
            display="⌫"
            isPressed={pressedKey === 'Backspace'}
            className={`${config.key} flex-1 max-w-[120px]`}
            onTouchStart={(e) => handleTouchStart('Backspace', e)}
            onTouchEnd={(e) => handleTouchEnd('Backspace', e)}
            variant="special"
          />
          <TouchKey
            letter=" "
            display="Space"
            isPressed={pressedKey === ' '}
            className={`${config.key} flex-[3]`}
            onTouchStart={(e) => handleTouchStart(' ', e)}
            onTouchEnd={(e) => handleTouchEnd(' ', e)}
            variant="space"
          />
          <TouchKey
            letter="Enter"
            display="✓"
            isPressed={pressedKey === 'Enter'}
            className={`${config.key} flex-1 max-w-[120px]`}
            onTouchStart={(e) => handleTouchStart('Enter', e)}
            onTouchEnd={(e) => handleTouchEnd('Enter', e)}
            variant="special"
          />
        </div>
      </div>
    </div>
  );
}

// Individual touch key component
interface TouchKeyProps {
  letter: string;
  display?: string;
  isHighlighted?: boolean;
  isPressed?: boolean;
  className?: string;
  onTouchStart?: (e: React.TouchEvent) => void;
  onTouchEnd?: (e: React.TouchEvent) => void;
  variant?: 'normal' | 'special' | 'space';
}

function TouchKey({
  letter,
  display,
  isHighlighted = false,
  isPressed = false,
  className = '',
  onTouchStart,
  onTouchEnd,
  variant = 'normal',
}: TouchKeyProps) {
  const { settings } = useSettingsStore();

  const getVariantStyles = () => {
    if (isPressed) {
      return 'bg-primary-600 text-white scale-95 shadow-inner';
    }

    if (isHighlighted) {
      return 'bg-yellow-300 text-gray-900 ring-4 ring-yellow-400 animate-pulse scale-105';
    }

    switch (variant) {
      case 'special':
        return 'bg-gray-300 text-gray-800 active:bg-gray-400';
      case 'space':
        return 'bg-blue-100 text-gray-700 active:bg-blue-200';
      default:
        return 'bg-white text-gray-800 active:bg-gray-100';
    }
  };

  return (
    <motion.button
      onTouchStart={onTouchStart}
      onTouchEnd={onTouchEnd}
      animate={
        isHighlighted && !settings.reducedMotion
          ? {
              scale: [1, 1.05, 1],
            }
          : {}
      }
      transition={{ duration: 0.5, repeat: isHighlighted ? Infinity : 0 }}
      className={`
        ${className}
        ${getVariantStyles()}
        rounded-xl font-bold shadow-lg
        flex items-center justify-center
        transition-all duration-100
        touch-manipulation select-none
        ${isPressed ? '' : 'hover:shadow-xl'}
      `}
      style={{
        // Prevent text selection and touch delay
        WebkitTapHighlightColor: 'transparent',
        userSelect: 'none',
      }}
    >
      {display || letter.toUpperCase()}
    </motion.button>
  );
}

// Swipe keyboard (alternative input method)
export function SwipeKeyboard({ onWord }: { onWord?: (word: string) => void }) {
  const [path, setPath] = useState<string>('');
  const [isDragging, setIsDragging] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const handleTouchStart = () => {
    setIsDragging(true);
    setPath('');
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!isDragging || !containerRef.current) return;

    const touch = e.touches[0];
    const rect = containerRef.current.getBoundingClientRect();
    const x = touch.clientX - rect.left;
    const y = touch.clientY - rect.top;

    // Detect which key is under the touch point
    // Simplified detection - in production, use more sophisticated logic
    const key = detectKeyAtPosition(x, y, rect);
    if (key && !path.includes(key)) {
      setPath((prev) => prev + key);
    }
  };

  const handleTouchEnd = () => {
    setIsDragging(false);
    if (path.length > 0) {
      onWord?.(path);
    }
    setPath('');
  };

  const detectKeyAtPosition = (_x: number, _y: number, _rect: DOMRect): string => {
    // Simplified key detection
    // In production, calculate actual key positions
    return 'a';
  };

  return (
    <div
      ref={containerRef}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
      className="relative bg-gray-100 rounded-2xl p-4 min-h-[300px] touch-manipulation"
    >
      <div className="text-center text-gray-600 mb-4">
        Swipe across letters to form words
      </div>

      {/* Display current path */}
      {path && (
        <div className="absolute top-4 left-1/2 -translate-x-1/2 bg-white px-6 py-3 rounded-full shadow-lg font-bold text-2xl">
          {path.toUpperCase()}
        </div>
      )}

      {/* Keyboard grid for swiping */}
      <div className="grid grid-cols-7 gap-2">
        {Array.from('abcdefghijklmnopqrstuvwxyz').map((letter) => (
          <div
            key={letter}
            className={`
              aspect-square flex items-center justify-center
              rounded-lg font-bold text-xl
              ${
                path.includes(letter)
                  ? 'bg-primary-500 text-white'
                  : 'bg-white text-gray-800'
              }
              shadow transition-colors
            `}
          >
            {letter.toUpperCase()}
          </div>
        ))}
      </div>
    </div>
  );
}

// Floating keyboard (follows input focus)
export function FloatingKeyboard({
  isVisible,
  onKeyPress,
}: {
  isVisible: boolean;
  onKeyPress?: (key: string) => void;
}) {
  if (!isVisible) return null;

  return (
    <motion.div
      initial={{ y: 100, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      exit={{ y: 100, opacity: 0 }}
      className="fixed bottom-0 left-0 right-0 z-50 bg-white shadow-2xl"
    >
      <TouchKeyboard onKeyPress={onKeyPress} size="normal" layout="abc" />
    </motion.div>
  );
}
