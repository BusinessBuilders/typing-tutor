/**
 * Celebrations Component
 * Step 194 - Create celebration animations and effects
 */

import { motion, AnimatePresence } from 'framer-motion';
import { useState, useEffect } from 'react';
import { useSuccessSounds, SuccessType } from './SuccessSounds';
import { useSettingsStore } from '../store/useSettingsStore';

// Confetti particle component
function ConfettiParticle({
  color,
  x,
  y,
  delay,
}: {
  color: string;
  x: number;
  y: number;
  delay: number;
}) {
  const { settings } = useSettingsStore();

  return (
    <motion.div
      initial={{ opacity: 1, scale: 1, x, y: 0 }}
      animate={{
        opacity: [1, 1, 0],
        y: [0, y],
        x: [x, x + (Math.random() - 0.5) * 100],
        rotate: [0, Math.random() * 360],
      }}
      transition={{
        duration: settings.reducedMotion ? 0.5 : 1.5,
        delay: settings.reducedMotion ? 0 : delay,
        ease: 'easeOut',
      }}
      className="absolute w-3 h-3 rounded-full"
      style={{ backgroundColor: color, top: 0, left: '50%' }}
    />
  );
}

// Confetti explosion
export function ConfettiExplosion({ show }: { show: boolean }) {
  const colors = ['#f59e0b', '#ef4444', '#3b82f6', '#10b981', '#8b5cf6', '#ec4899'];
  const particleCount = 30;

  return (
    <AnimatePresence>
      {show && (
        <div className="fixed inset-0 pointer-events-none z-50">
          {Array.from({ length: particleCount }).map((_, i) => (
            <ConfettiParticle
              key={i}
              color={colors[i % colors.length]}
              x={(i % 6) * 150 - 300}
              y={300 + Math.random() * 200}
              delay={i * 0.02}
            />
          ))}
        </div>
      )}
    </AnimatePresence>
  );
}

// Star burst animation
export function StarBurst({ show }: { show: boolean }) {
  const { settings } = useSettingsStore();

  return (
    <AnimatePresence>
      {show && (
        <div className="fixed inset-0 flex items-center justify-center pointer-events-none z-50">
          {Array.from({ length: 8 }).map((_, i) => (
            <motion.div
              key={i}
              initial={{ scale: 0, opacity: 1 }}
              animate={{
                scale: settings.reducedMotion ? 0 : [0, 2, 0],
                opacity: [1, 1, 0],
                rotate: i * 45,
              }}
              transition={{
                duration: settings.reducedMotion ? 0.3 : 1,
                delay: settings.reducedMotion ? 0 : i * 0.05,
              }}
              className="absolute"
            >
              <div className="text-6xl">⭐</div>
            </motion.div>
          ))}
        </div>
      )}
    </AnimatePresence>
  );
}

// Celebration modal
export function CelebrationModal({
  show,
  title,
  message,
  icon = '🎉',
  type = 'levelComplete',
  onClose,
}: {
  show: boolean;
  title: string;
  message?: string;
  icon?: string;
  type?: SuccessType;
  onClose?: () => void;
}) {
  const { playSuccessSequence } = useSuccessSounds();
  const { settings } = useSettingsStore();

  useEffect(() => {
    if (show) {
      playSuccessSequence(type);
    }
  }, [show, type, playSuccessSequence]);

  return (
    <AnimatePresence>
      {show && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black bg-opacity-50 z-40"
          />

          {/* Modal */}
          <div className="fixed inset-0 flex items-center justify-center z-50 p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.5, y: 50 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.5, y: 50 }}
              transition={{
                type: settings.reducedMotion ? 'tween' : 'spring',
                duration: settings.reducedMotion ? 0.3 : 0.6,
              }}
              className="bg-white rounded-3xl shadow-2xl p-8 max-w-md w-full text-center"
            >
              <motion.div
                animate={{
                  scale: settings.reducedMotion ? 1 : [1, 1.2, 1],
                  rotate: settings.reducedMotion ? 0 : [0, 10, -10, 0],
                }}
                transition={{
                  duration: 0.6,
                  repeat: settings.reducedMotion ? 0 : 2,
                }}
                className="text-8xl mb-6"
              >
                {icon}
              </motion.div>

              <h2 className="text-4xl font-bold text-gray-900 mb-4">
                {title}
              </h2>

              {message && (
                <p className="text-xl text-gray-700 mb-8">{message}</p>
              )}

              {onClose && (
                <button
                  onClick={onClose}
                  className="px-8 py-4 bg-primary-500 text-white rounded-xl font-bold text-xl hover:bg-primary-600 transition-colors shadow-lg"
                >
                  Continue
                </button>
              )}
            </motion.div>
          </div>

          <ConfettiExplosion show={show} />
        </>
      )}
    </AnimatePresence>
  );
}

// Quick celebration toast
export function CelebrationToast({
  show,
  message,
  icon = '🎊',
}: {
  show: boolean;
  message: string;
  icon?: string;
}) {
  return (
    <AnimatePresence>
      {show && (
        <motion.div
          initial={{ opacity: 0, y: -50 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -50 }}
          className="fixed top-4 left-1/2 transform -translate-x-1/2 z-50"
        >
          <div className="bg-gradient-to-r from-purple-500 to-pink-500 text-white px-6 py-3 rounded-full shadow-2xl flex items-center gap-3">
            <span className="text-2xl">{icon}</span>
            <span className="font-bold text-lg">{message}</span>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

// Achievement unlock celebration
export function AchievementUnlock({
  show,
  title,
  description,
  icon = '🏆',
  onClose,
}: {
  show: boolean;
  title: string;
  description: string;
  icon?: string;
  onClose?: () => void;
}) {
  const { playSuccessSequence } = useSuccessSounds();
  const { settings } = useSettingsStore();

  useEffect(() => {
    if (show) {
      playSuccessSequence('levelComplete');
    }
  }, [show, playSuccessSequence]);

  return (
    <AnimatePresence>
      {show && (
        <div className="fixed inset-0 flex items-center justify-center z-50 p-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-black bg-opacity-60"
          />

          <motion.div
            initial={{ opacity: 0, scale: 0, rotateY: -180 }}
            animate={{ opacity: 1, scale: 1, rotateY: 0 }}
            exit={{ opacity: 0, scale: 0, rotateY: 180 }}
            transition={{
              duration: settings.reducedMotion ? 0.3 : 0.8,
              type: settings.reducedMotion ? 'tween' : 'spring',
            }}
            className="relative bg-gradient-to-br from-yellow-400 via-yellow-500 to-yellow-600 rounded-3xl shadow-2xl p-8 max-w-lg w-full"
          >
            {/* Shine effect */}
            {!settings.reducedMotion && (
              <motion.div
                animate={{
                  x: ['-100%', '200%'],
                }}
                transition={{
                  duration: 2,
                  repeat: Infinity,
                  repeatDelay: 3,
                }}
                className="absolute inset-0 bg-gradient-to-r from-transparent via-white to-transparent opacity-30"
                style={{ transform: 'skewX(-20deg)' }}
              />
            )}

            <div className="relative text-center">
              <div className="text-sm font-bold text-yellow-900 uppercase tracking-wide mb-2">
                Achievement Unlocked
              </div>

              <motion.div
                animate={{
                  scale: settings.reducedMotion ? 1 : [1, 1.1, 1],
                }}
                transition={{
                  duration: 0.5,
                  repeat: settings.reducedMotion ? 0 : Infinity,
                  repeatDelay: 2,
                }}
                className="text-8xl mb-4"
              >
                {icon}
              </motion.div>

              <h2 className="text-3xl font-bold text-white mb-3 drop-shadow-lg">
                {title}
              </h2>

              <p className="text-lg text-yellow-100 mb-6">{description}</p>

              {onClose && (
                <button
                  onClick={onClose}
                  className="px-6 py-3 bg-white text-yellow-600 rounded-xl font-bold hover:bg-yellow-50 transition-colors shadow-lg"
                >
                  Awesome!
                </button>
              )}
            </div>
          </motion.div>

          <StarBurst show={show} />
        </div>
      )}
    </AnimatePresence>
  );
}

// Demo component
export default function Celebrations() {
  const [showModal, setShowModal] = useState(false);
  const [showToast, setShowToast] = useState(false);
  const [showAchievement, setShowAchievement] = useState(false);
  const [showConfetti, setShowConfetti] = useState(false);

  return (
    <div className="bg-white rounded-2xl shadow-xl p-8">
      <h2 className="text-2xl font-bold text-gray-800 mb-6 text-center">
        Celebrations
      </h2>

      <div className="grid grid-cols-2 gap-4">
        <button
          onClick={() => setShowModal(true)}
          className="px-6 py-4 bg-gradient-to-br from-purple-500 to-pink-500 text-white rounded-xl font-bold hover:from-purple-600 hover:to-pink-600 transition-all shadow-lg"
        >
          🎉 Show Modal
        </button>

        <button
          onClick={() => {
            setShowToast(true);
            setTimeout(() => setShowToast(false), 3000);
          }}
          className="px-6 py-4 bg-gradient-to-br from-blue-500 to-cyan-500 text-white rounded-xl font-bold hover:from-blue-600 hover:to-cyan-600 transition-all shadow-lg"
        >
          🎊 Show Toast
        </button>

        <button
          onClick={() => setShowAchievement(true)}
          className="px-6 py-4 bg-gradient-to-br from-yellow-500 to-orange-500 text-white rounded-xl font-bold hover:from-yellow-600 hover:to-orange-600 transition-all shadow-lg"
        >
          🏆 Achievement
        </button>

        <button
          onClick={() => {
            setShowConfetti(true);
            setTimeout(() => setShowConfetti(false), 2000);
          }}
          className="px-6 py-4 bg-gradient-to-br from-green-500 to-emerald-500 text-white rounded-xl font-bold hover:from-green-600 hover:to-emerald-600 transition-all shadow-lg"
        >
          ✨ Confetti
        </button>
      </div>

      <div className="mt-8 bg-purple-50 rounded-xl p-6">
        <h3 className="text-lg font-bold text-purple-900 mb-3">
          Celebration Types
        </h3>
        <ul className="space-y-2 text-sm text-purple-800">
          <li><strong>Modal:</strong> Full-screen celebration for major achievements</li>
          <li><strong>Toast:</strong> Quick notification for small wins</li>
          <li><strong>Achievement:</strong> Special unlock animation with badge</li>
          <li><strong>Confetti:</strong> Particle effects for extra excitement</li>
        </ul>
      </div>

      <CelebrationModal
        show={showModal}
        title="Level Complete!"
        message="You're doing amazing! Ready for the next challenge?"
        icon="🎯"
        type="levelComplete"
        onClose={() => setShowModal(false)}
      />

      <CelebrationToast show={showToast} message="Great job!" icon="🌟" />

      <AchievementUnlock
        show={showAchievement}
        title="Speed Demon"
        description="You typed 50 words per minute!"
        icon="⚡"
        onClose={() => setShowAchievement(false)}
      />

      <ConfettiExplosion show={showConfetti} />
    </div>
  );
}

// Milestone celebration
export function MilestoneCelebration({
  milestone,
  value,
  unit,
}: {
  milestone: string;
  value: number;
  unit: string;
}) {
  const [show, setShow] = useState(true);

  return (
    <AnimatePresence>
      {show && (
        <CelebrationModal
          show={show}
          title={milestone}
          message={`You've reached ${value} ${unit}!`}
          icon="🎊"
          type="streakMilestone"
          onClose={() => setShow(false)}
        />
      )}
    </AnimatePresence>
  );
}
