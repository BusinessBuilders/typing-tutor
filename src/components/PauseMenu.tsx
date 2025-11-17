/**
 * Pause Menu Component
 * Step 100 - Accessible pause menu for practice sessions
 */

import { motion, AnimatePresence } from 'framer-motion';
import { useAppStore } from '../store/useAppStore';
import { useSettingsStore } from '../store/useSettingsStore';

interface PauseMenuProps {
  isOpen: boolean;
  onResume: () => void;
  onRestart?: () => void;
  onSettings?: () => void;
  onQuit?: () => void;
}

export default function PauseMenu({
  isOpen,
  onResume,
  onRestart,
  onSettings,
  onQuit,
}: PauseMenuProps) {
  const { setScreen, toggleSettings } = useAppStore();
  const { settings } = useSettingsStore();

  const menuItems = [
    {
      icon: '▶️',
      label: 'Resume',
      action: onResume,
      color: 'success',
    },
    {
      icon: '🔄',
      label: 'Restart',
      action: onRestart,
      color: 'blue',
    },
    {
      icon: '⚙️',
      label: 'Settings',
      action: () => {
        onSettings?.();
        toggleSettings();
      },
      color: 'gray',
    },
    {
      icon: '🏠',
      label: 'Quit to Home',
      action: () => {
        onQuit?.();
        setScreen('home');
      },
      color: 'red',
    },
  ];

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onResume}
            className="fixed inset-0 bg-black bg-opacity-60 z-40"
          />

          {/* Menu */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            transition={{ type: 'spring', duration: 0.3 }}
            className="fixed inset-0 flex items-center justify-center z-50 p-4"
          >
            <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-md w-full">
              {/* Header */}
              <div className="text-center mb-6">
                <motion.div
                  animate={{
                    scale: settings.reducedMotion ? 1 : [1, 1.1, 1],
                  }}
                  transition={{
                    duration: 2,
                    repeat: Infinity,
                  }}
                  className="text-6xl mb-3"
                >
                  ⏸️
                </motion.div>
                <h2 className="text-3xl font-bold text-gray-800">Paused</h2>
                <p className="text-gray-600 mt-2">Take a break when you need it!</p>
              </div>

              {/* Menu Items */}
              <div className="space-y-3">
                {menuItems.map((item, index) => (
                  <motion.button
                    key={item.label}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.1 }}
                    whileHover={{ scale: settings.reducedMotion ? 1 : 1.02 }}
                    whileTap={{ scale: settings.reducedMotion ? 1 : 0.98 }}
                    onClick={item.action}
                    className={`
                      w-full py-4 px-6 rounded-xl font-medium text-lg
                      flex items-center justify-center space-x-3
                      transition-all shadow-md hover:shadow-lg
                      ${item.color === 'success'
                        ? 'bg-success-600 text-white hover:bg-success-700'
                        : item.color === 'blue'
                        ? 'bg-blue-600 text-white hover:bg-blue-700'
                        : item.color === 'gray'
                        ? 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                        : 'bg-red-100 text-red-700 hover:bg-red-200'
                      }
                    `}
                  >
                    <span className="text-2xl">{item.icon}</span>
                    <span>{item.label}</span>
                  </motion.button>
                ))}
              </div>

              {/* Helpful Tip */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.4 }}
                className="mt-6 bg-blue-50 rounded-lg p-4 border-2 border-blue-200"
              >
                <p className="text-sm text-blue-800 text-center">
                  💡 <strong>Tip:</strong> Press ESC or click outside to resume
                </p>
              </motion.div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

// Simplified pause button
export function PauseButton({ onClick }: { onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className="fixed top-4 right-4 z-30 p-4 bg-white rounded-full shadow-lg hover:shadow-xl transition-all"
      aria-label="Pause"
    >
      <span className="text-3xl">⏸️</span>
    </button>
  );
}
