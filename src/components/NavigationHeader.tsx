/**
 * Navigation Header Component
 * Step 92 - Autism-friendly navigation with clear visual hierarchy
 */

import { motion } from 'framer-motion';
import { useUserStore } from '../store/useUserStore';
import { useAppStore } from '../store/useAppStore';
import { useSettingsStore } from '../store/useSettingsStore';

interface NavigationHeaderProps {
  onNavigate?: (screen: string) => void;
}

export default function NavigationHeader({ onNavigate }: NavigationHeaderProps) {
  const { currentUser } = useUserStore();
  const { currentScreen, setScreen } = useAppStore();
  const { settings } = useSettingsStore();

  const navigationItems = [
    { id: 'home', label: 'Home', icon: '🏠', color: 'primary' },
    { id: 'learning', label: 'Practice', icon: '✍️', color: 'success' },
    { id: 'progress', label: 'Progress', icon: '📊', color: 'purple' },
    { id: 'settings', label: 'Settings', icon: '⚙️', color: 'gray' },
  ];

  const handleNavClick = (screenId: string) => {
    setScreen(screenId as any);
    onNavigate?.(screenId);
  };

  return (
    <motion.header
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      className="bg-white shadow-sm border-b-2 border-gray-200 sticky top-0 z-50"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          {/* Logo and App Title */}
          <div className="flex items-center space-x-3">
            <div className="text-4xl">🎯</div>
            <div>
              <h1 className="text-2xl font-bold text-primary-600">
                Typing Tutor
              </h1>
              <p className="text-xs text-gray-500">Learn at your own pace</p>
            </div>
          </div>

          {/* Navigation Buttons */}
          <nav className="flex items-center space-x-2">
            {navigationItems.map((item) => {
              const isActive = currentScreen === item.id;

              return (
                <motion.button
                  key={item.id}
                  onClick={() => handleNavClick(item.id)}
                  whileHover={{ scale: settings.reducedMotion ? 1 : 1.05 }}
                  whileTap={{ scale: settings.reducedMotion ? 1 : 0.95 }}
                  className={`
                    relative px-4 py-2 rounded-lg font-medium text-sm
                    transition-all duration-200 flex items-center space-x-2
                    ${isActive
                      ? `bg-${item.color}-100 text-${item.color}-700 ring-2 ring-${item.color}-500`
                      : 'bg-gray-50 text-gray-600 hover:bg-gray-100'
                    }
                  `}
                >
                  <span className="text-xl">{item.icon}</span>
                  <span className="hidden sm:inline">{item.label}</span>

                  {/* Active indicator */}
                  {isActive && (
                    <motion.div
                      layoutId="activeTab"
                      className={`absolute inset-0 bg-${item.color}-100 rounded-lg -z-10`}
                      transition={{ type: 'spring', bounce: 0.2, duration: 0.6 }}
                    />
                  )}
                </motion.button>
              );
            })}
          </nav>

          {/* User Info */}
          {currentUser && (
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className="flex items-center space-x-3 bg-primary-50 px-4 py-2 rounded-lg"
            >
              <div className="text-3xl">
                {currentUser.avatar || '👤'}
              </div>
              <div className="hidden md:block">
                <p className="text-sm font-medium text-gray-700">
                  {currentUser.name}
                </p>
                <p className="text-xs text-gray-500">
                  {currentUser.age ? `${currentUser.age} years old` : 'Learner'}
                </p>
              </div>
            </motion.div>
          )}
        </div>
      </div>

      {/* Accessibility banner for reduced motion users */}
      {settings.reducedMotion && (
        <div className="bg-blue-50 border-t border-blue-100 py-1 px-4">
          <p className="text-xs text-blue-600 text-center">
            ✓ Reduced motion enabled
          </p>
        </div>
      )}
    </motion.header>
  );
}
