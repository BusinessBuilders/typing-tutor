/**
 * Audio Transitions Component
 * Step 200 - Create audio transitions between screens and states
 */

import { useEffect, useRef } from 'react';
import { useSoundEffects } from './SoundEffects';
import { useSettingsStore } from '../store/useSettingsStore';

// Transition types
export type TransitionType =
  | 'screenChange'
  | 'levelUp'
  | 'modeSwitch'
  | 'fadeIn'
  | 'fadeOut'
  | 'success'
  | 'error'
  | 'popup'
  | 'slide';

// Transition sound configurations
const TRANSITION_SOUNDS: Record<TransitionType, {
  sequence: Array<{ frequency: number; duration: number; delay: number }>;
}> = {
  screenChange: {
    sequence: [
      { frequency: 400, duration: 80, delay: 0 },
      { frequency: 500, duration: 80, delay: 40 },
    ],
  },
  levelUp: {
    sequence: [
      { frequency: 523.25, duration: 100, delay: 0 },
      { frequency: 659.25, duration: 100, delay: 80 },
      { frequency: 783.99, duration: 150, delay: 160 },
    ],
  },
  modeSwitch: {
    sequence: [
      { frequency: 440, duration: 60, delay: 0 },
      { frequency: 550, duration: 60, delay: 50 },
    ],
  },
  fadeIn: {
    sequence: [
      { frequency: 300, duration: 100, delay: 0 },
      { frequency: 400, duration: 100, delay: 50 },
      { frequency: 500, duration: 100, delay: 100 },
    ],
  },
  fadeOut: {
    sequence: [
      { frequency: 500, duration: 100, delay: 0 },
      { frequency: 400, duration: 100, delay: 50 },
      { frequency: 300, duration: 100, delay: 100 },
    ],
  },
  success: {
    sequence: [
      { frequency: 659.25, duration: 100, delay: 0 },
      { frequency: 783.99, duration: 150, delay: 80 },
    ],
  },
  error: {
    sequence: [
      { frequency: 220, duration: 150, delay: 0 },
    ],
  },
  popup: {
    sequence: [
      { frequency: 600, duration: 50, delay: 0 },
      { frequency: 800, duration: 50, delay: 30 },
    ],
  },
  slide: {
    sequence: [
      { frequency: 400, duration: 100, delay: 0 },
    ],
  },
};

// Custom hook for audio transitions
export function useAudioTransition() {
  const { playSound } = useSoundEffects();
  const { settings } = useSettingsStore();

  const playTransition = (type: TransitionType) => {
    if (!settings.soundEnabled) return;

    const config = TRANSITION_SOUNDS[type];

    config.sequence.forEach((note) => {
      setTimeout(() => {
        playSound('transition', {
          frequency: note.frequency,
          duration: note.duration,
        });
      }, note.delay);
    });
  };

  return { playTransition };
}

// Component that plays sound on mount
export function TransitionSound({ type }: { type: TransitionType }) {
  const { playTransition } = useAudioTransition();

  useEffect(() => {
    playTransition(type);
  }, [type, playTransition]);

  return null;
}

// Wrapper component that plays sound when children change
export function TransitionWrapper({
  children,
  type = 'screenChange',
}: {
  children: React.ReactNode;
  type?: TransitionType;
}) {
  const { playTransition } = useAudioTransition();
  const prevChildrenRef = useRef<React.ReactNode>(null);

  useEffect(() => {
    if (prevChildrenRef.current !== null && prevChildrenRef.current !== children) {
      playTransition(type);
    }
    prevChildrenRef.current = children;
  }, [children, type, playTransition]);

  return <>{children}</>;
}

// Route transition component
export function RouteTransition({
  pathname,
  type = 'screenChange',
}: {
  pathname: string;
  type?: TransitionType;
}) {
  const { playTransition } = useAudioTransition();
  const prevPathnameRef = useRef<string>(pathname);

  useEffect(() => {
    if (prevPathnameRef.current !== pathname) {
      playTransition(type);
      prevPathnameRef.current = pathname;
    }
  }, [pathname, type, playTransition]);

  return null;
}

// Demo component
export default function AudioTransitions() {
  const { playTransition } = useAudioTransition();
  const { settings } = useSettingsStore();

  const transitions: Array<{
    type: TransitionType;
    label: string;
    description: string;
    icon: string;
    color: string;
  }> = [
    {
      type: 'screenChange',
      label: 'Screen Change',
      description: 'Two-note transition',
      icon: '🔄',
      color: 'from-blue-100 to-blue-200 hover:from-blue-200 hover:to-blue-300',
    },
    {
      type: 'levelUp',
      label: 'Level Up',
      description: 'Triumphant ascent',
      icon: '⬆️',
      color: 'from-green-100 to-green-200 hover:from-green-200 hover:to-green-300',
    },
    {
      type: 'modeSwitch',
      label: 'Mode Switch',
      description: 'Quick toggle sound',
      icon: '🔀',
      color: 'from-purple-100 to-purple-200 hover:from-purple-200 hover:to-purple-300',
    },
    {
      type: 'fadeIn',
      label: 'Fade In',
      description: 'Ascending tones',
      icon: '⬇️',
      color: 'from-orange-100 to-orange-200 hover:from-orange-200 hover:to-orange-300',
    },
    {
      type: 'fadeOut',
      label: 'Fade Out',
      description: 'Descending tones',
      icon: '⬆️',
      color: 'from-red-100 to-red-200 hover:from-red-200 hover:to-red-300',
    },
    {
      type: 'success',
      label: 'Success',
      description: 'Positive confirmation',
      icon: '✅',
      color: 'from-emerald-100 to-emerald-200 hover:from-emerald-200 hover:to-emerald-300',
    },
    {
      type: 'error',
      label: 'Error',
      description: 'Gentle alert',
      icon: '⚠️',
      color: 'from-yellow-100 to-yellow-200 hover:from-yellow-200 hover:to-yellow-300',
    },
    {
      type: 'popup',
      label: 'Popup',
      description: 'Quick attention sound',
      icon: '📢',
      color: 'from-pink-100 to-pink-200 hover:from-pink-200 hover:to-pink-300',
    },
    {
      type: 'slide',
      label: 'Slide',
      description: 'Smooth transition',
      icon: '➡️',
      color: 'from-indigo-100 to-indigo-200 hover:from-indigo-200 hover:to-indigo-300',
    },
  ];

  return (
    <div className="bg-white rounded-2xl shadow-xl p-8">
      <h2 className="text-2xl font-bold text-gray-800 mb-6 text-center">
        Audio Transitions
      </h2>

      <div className="grid grid-cols-3 gap-4 mb-8">
        {transitions.map(({ type, label, description, icon, color }, index) => (
          <button
            key={type}
            onClick={() => playTransition(type)}
            className={`p-6 bg-gradient-to-br ${color} rounded-xl text-left transition-all shadow-md`}
            style={{
              animationDelay: settings.reducedMotion ? '0s' : `${index * 0.05}s`,
            }}
          >
            <div className="text-4xl mb-2">{icon}</div>
            <div className="text-sm font-bold text-gray-900 mb-1">{label}</div>
            <div className="text-xs text-gray-700">{description}</div>
          </button>
        ))}
      </div>

      <div className="bg-blue-50 rounded-xl p-6">
        <h3 className="text-lg font-bold text-blue-900 mb-3">
          When to Use Transitions
        </h3>
        <ul className="space-y-2 text-sm text-blue-800">
          <li><strong>Screen Change:</strong> Navigating between main screens</li>
          <li><strong>Level Up:</strong> Advancing to next difficulty level</li>
          <li><strong>Mode Switch:</strong> Changing between practice modes</li>
          <li><strong>Fade In/Out:</strong> Elements appearing/disappearing</li>
          <li><strong>Success:</strong> Completing a task or challenge</li>
          <li><strong>Error:</strong> Gentle feedback for mistakes</li>
          <li><strong>Popup:</strong> Modal dialogs or notifications</li>
          <li><strong>Slide:</strong> Carousel or swipe transitions</li>
        </ul>
      </div>

      <div className="mt-6 bg-purple-50 rounded-xl p-6">
        <h3 className="text-lg font-bold text-purple-900 mb-3">
          Implementation Tips
        </h3>
        <ul className="space-y-2 text-sm text-purple-800">
          <li>• Use <code className="bg-purple-200 px-2 py-1 rounded">{'<TransitionSound />'}</code> for one-time transitions</li>
          <li>• Use <code className="bg-purple-200 px-2 py-1 rounded">{'<TransitionWrapper>'}</code> for automatic transitions</li>
          <li>• Use <code className="bg-purple-200 px-2 py-1 rounded">useAudioTransition()</code> hook for manual control</li>
          <li>• All transitions respect sound settings and volume</li>
        </ul>
      </div>
    </div>
  );
}

// Fade transition with sound
export function FadeTransition({
  show,
  children,
}: {
  show: boolean;
  children: React.ReactNode;
}) {
  const { playTransition } = useAudioTransition();
  const prevShowRef = useRef(show);

  useEffect(() => {
    if (show !== prevShowRef.current) {
      playTransition(show ? 'fadeIn' : 'fadeOut');
      prevShowRef.current = show;
    }
  }, [show, playTransition]);

  return show ? <>{children}</> : null;
}

// Modal with transition sound
export function ModalWithSound({
  isOpen,
  onClose,
  children,
}: {
  isOpen: boolean;
  onClose: () => void;
  children: React.ReactNode;
}) {
  const { playTransition } = useAudioTransition();

  useEffect(() => {
    if (isOpen) {
      playTransition('popup');
    }
  }, [isOpen, playTransition]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div
        onClick={onClose}
        className="absolute inset-0 bg-black bg-opacity-50"
      />
      <div className="relative bg-white rounded-2xl shadow-2xl p-8 max-w-md w-full">
        {children}
      </div>
    </div>
  );
}

// Success transition component
export function SuccessTransition({ trigger }: { trigger: boolean }) {
  const { playTransition } = useAudioTransition();
  const prevTriggerRef = useRef(trigger);

  useEffect(() => {
    if (trigger && !prevTriggerRef.current) {
      playTransition('success');
    }
    prevTriggerRef.current = trigger;
  }, [trigger, playTransition]);

  return null;
}

// Error transition component
export function ErrorTransition({ trigger }: { trigger: boolean }) {
  const { playTransition } = useAudioTransition();
  const prevTriggerRef = useRef(trigger);

  useEffect(() => {
    if (trigger && !prevTriggerRef.current) {
      playTransition('error');
    }
    prevTriggerRef.current = trigger;
  }, [trigger, playTransition]);

  return null;
}

// Page load transition
export function PageLoadTransition() {
  const { playTransition } = useAudioTransition();

  useEffect(() => {
    // Play fade in sound when component mounts
    const timer = setTimeout(() => {
      playTransition('fadeIn');
    }, 100);

    return () => clearTimeout(timer);
  }, [playTransition]);

  return null;
}

// Carousel transition
export function CarouselTransition({ index }: { index: number }) {
  const { playTransition } = useAudioTransition();
  const prevIndexRef = useRef(index);

  useEffect(() => {
    if (index !== prevIndexRef.current) {
      playTransition('slide');
      prevIndexRef.current = index;
    }
  }, [index, playTransition]);

  return null;
}
