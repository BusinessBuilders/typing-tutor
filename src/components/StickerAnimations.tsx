/**
 * Sticker Animations Component
 * Step 233 - Add animations for stickers and collectibles
 */

import { motion, AnimatePresence } from 'framer-motion';
import { useState, useEffect } from 'react';
import { useSettingsStore } from '../store/useSettingsStore';
import type { Sticker } from './StickerSystem';
import { RARITY_LEVELS } from './StickerSystem';

// Animation types
export type AnimationType =
  | 'pack-opening'
  | 'sticker-reveal'
  | 'confetti'
  | 'sparkle'
  | 'float'
  | 'pulse'
  | 'rainbow'
  | 'glow';

// Pack opening animation interface
export interface PackOpening {
  id: string;
  packName: string;
  packIcon: string;
  stickers: Sticker[];
  rarity: Sticker['rarity'];
  isAnimating: boolean;
  currentReveal: number;
}

// Confetti particle interface
interface ConfettiParticle {
  id: number;
  x: number;
  y: number;
  rotation: number;
  color: string;
  size: number;
  velocity: { x: number; y: number };
}

// Sparkle particle interface
interface SparkleParticle {
  id: number;
  x: number;
  y: number;
  delay: number;
  duration: number;
}

// Pack opening animation hook
export function usePackOpening() {
  const [currentPack, setCurrentPack] = useState<PackOpening | null>(null);
  const [isRevealing, setIsRevealing] = useState(false);

  const openPack = (pack: Omit<PackOpening, 'id' | 'isAnimating' | 'currentReveal'>) => {
    const newPack: PackOpening = {
      ...pack,
      id: Date.now().toString(),
      isAnimating: true,
      currentReveal: -1, // -1 means showing pack, 0+ means revealing stickers
    };
    setCurrentPack(newPack);
  };

  const revealNext = () => {
    if (!currentPack) return;

    if (currentPack.currentReveal < currentPack.stickers.length - 1) {
      setCurrentPack({
        ...currentPack,
        currentReveal: currentPack.currentReveal + 1,
      });
      setIsRevealing(true);
      setTimeout(() => setIsRevealing(false), 1500);
    }
  };

  const skipToEnd = () => {
    if (!currentPack) return;
    setCurrentPack({
      ...currentPack,
      currentReveal: currentPack.stickers.length - 1,
    });
  };

  const closePack = () => {
    setCurrentPack(null);
    setIsRevealing(false);
  };

  return {
    currentPack,
    isRevealing,
    openPack,
    revealNext,
    skipToEnd,
    closePack,
  };
}

// Confetti animation hook
export function useConfetti() {
  const [particles, setParticles] = useState<ConfettiParticle[]>([]);
  const [isActive, setIsActive] = useState(false);

  const trigger = (count: number = 50) => {
    const newParticles: ConfettiParticle[] = [];
    const colors = ['#FF6B6B', '#4ECDC4', '#45B7D1', '#FFA07A', '#98D8C8', '#F7DC6F', '#BB8FCE'];

    for (let i = 0; i < count; i++) {
      newParticles.push({
        id: i,
        x: Math.random() * 100,
        y: -10,
        rotation: Math.random() * 360,
        color: colors[Math.floor(Math.random() * colors.length)],
        size: Math.random() * 10 + 5,
        velocity: {
          x: (Math.random() - 0.5) * 2,
          y: Math.random() * 3 + 2,
        },
      });
    }

    setParticles(newParticles);
    setIsActive(true);

    setTimeout(() => {
      setIsActive(false);
      setParticles([]);
    }, 3000);
  };

  return { particles, isActive, trigger };
}

// Sparkle animation hook
export function useSparkles(count: number = 20) {
  const [sparkles, setSparkles] = useState<SparkleParticle[]>([]);

  useEffect(() => {
    const newSparkles: SparkleParticle[] = [];
    for (let i = 0; i < count; i++) {
      newSparkles.push({
        id: i,
        x: Math.random() * 100,
        y: Math.random() * 100,
        delay: Math.random() * 2,
        duration: Math.random() * 1 + 0.5,
      });
    }
    setSparkles(newSparkles);
  }, [count]);

  return sparkles;
}

// Pack opening animation component
export function PackOpeningAnimation({
  pack,
  onRevealNext,
  onSkip,
  onClose,
}: {
  pack: PackOpening;
  onRevealNext: () => void;
  onSkip: () => void;
  onClose: () => void;
}) {
  const { settings } = useSettingsStore();
  const rarityInfo = RARITY_LEVELS.find((r) => r.level === pack.rarity);

  // Show pack
  if (pack.currentReveal === -1) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black bg-opacity-80 flex items-center justify-center z-50"
      >
        <motion.div
          initial={{ scale: 0, rotate: -180 }}
          animate={{ scale: 1, rotate: 0 }}
          transition={{ type: 'spring', duration: 1 }}
          className="text-center"
        >
          <motion.div
            animate={{
              scale: [1, 1.1, 1],
              rotate: [0, 5, -5, 0],
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
            }}
            className="text-9xl mb-6"
          >
            {pack.packIcon}
          </motion.div>

          <div className={`bg-gradient-to-r ${rarityInfo?.color} rounded-2xl p-8 text-white mb-6`}>
            <div className="text-4xl font-bold mb-2">{pack.packName}</div>
            <div className="text-2xl opacity-90">{rarityInfo?.name} Pack</div>
            <div className="text-xl mt-4">{pack.stickers.length} Stickers Inside!</div>
          </div>

          <button
            onClick={onRevealNext}
            className="px-12 py-4 bg-gradient-to-r from-yellow-400 to-orange-500 text-white text-2xl font-bold rounded-2xl hover:scale-110 transition-transform shadow-2xl"
          >
            Open Pack! 🎁
          </button>
        </motion.div>
      </motion.div>
    );
  }

  // Show current sticker
  const currentSticker = pack.stickers[pack.currentReveal];
  const stickerRarity = RARITY_LEVELS.find((r) => r.level === currentSticker.rarity);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black bg-opacity-90 flex items-center justify-center z-50 p-4"
    >
      <div className="text-center">
        {/* Sticker reveal */}
        <motion.div
          key={pack.currentReveal}
          initial={{ scale: 0, rotate: -360, opacity: 0 }}
          animate={{ scale: 1, rotate: 0, opacity: 1 }}
          transition={{ type: 'spring', duration: 0.8 }}
          className={`bg-gradient-to-br ${stickerRarity?.color} rounded-3xl p-12 mb-6 shadow-2xl`}
        >
          <motion.div
            animate={
              settings.reducedMotion
                ? {}
                : {
                    scale: [1, 1.2, 1],
                    rotate: [0, 5, -5, 0],
                  }
            }
            transition={{
              duration: 2,
              repeat: Infinity,
            }}
            className="text-9xl mb-6"
          >
            {currentSticker.emoji}
          </motion.div>

          <div className="text-4xl font-bold text-white mb-2">
            {currentSticker.name}
          </div>
          <div className="text-2xl text-white opacity-90 mb-4">
            {stickerRarity?.name} {stickerRarity?.sparkle}
          </div>
          <div className="text-lg text-white opacity-80">
            {currentSticker.description}
          </div>
        </motion.div>

        {/* Progress */}
        <div className="text-white text-xl mb-6">
          {pack.currentReveal + 1} / {pack.stickers.length}
        </div>

        {/* Controls */}
        <div className="flex gap-4 justify-center">
          {pack.currentReveal < pack.stickers.length - 1 ? (
            <>
              <button
                onClick={onRevealNext}
                className="px-8 py-4 bg-gradient-to-r from-green-400 to-blue-500 text-white text-xl font-bold rounded-xl hover:scale-110 transition-transform shadow-xl"
              >
                Next Sticker →
              </button>
              <button
                onClick={onSkip}
                className="px-8 py-4 bg-gray-600 text-white text-xl font-bold rounded-xl hover:bg-gray-700 transition-colors"
              >
                Skip All
              </button>
            </>
          ) : (
            <button
              onClick={onClose}
              className="px-12 py-4 bg-gradient-to-r from-purple-400 to-pink-500 text-white text-2xl font-bold rounded-xl hover:scale-110 transition-transform shadow-xl"
            >
              Awesome! ✨
            </button>
          )}
        </div>
      </div>
    </motion.div>
  );
}

// Confetti animation component
export function ConfettiAnimation({ particles }: { particles: ConfettiParticle[] }) {
  return (
    <div className="fixed inset-0 pointer-events-none z-50 overflow-hidden">
      {particles.map((particle) => (
        <motion.div
          key={particle.id}
          initial={{
            x: `${particle.x}vw`,
            y: `${particle.y}vh`,
            rotate: particle.rotation,
            opacity: 1,
          }}
          animate={{
            y: '110vh',
            rotate: particle.rotation + 720,
            opacity: 0,
          }}
          transition={{
            duration: 3,
            ease: 'easeIn',
          }}
          style={{
            position: 'absolute',
            width: particle.size,
            height: particle.size,
            backgroundColor: particle.color,
            borderRadius: '2px',
          }}
        />
      ))}
    </div>
  );
}

// Sparkle animation component
export function SparkleAnimation({ sparkles }: { sparkles: SparkleParticle[] }) {
  return (
    <div className="absolute inset-0 pointer-events-none">
      {sparkles.map((sparkle) => (
        <motion.div
          key={sparkle.id}
          initial={{ opacity: 0, scale: 0 }}
          animate={{
            opacity: [0, 1, 0],
            scale: [0, 1, 0],
          }}
          transition={{
            duration: sparkle.duration,
            delay: sparkle.delay,
            repeat: Infinity,
            repeatDelay: 1,
          }}
          style={{
            position: 'absolute',
            left: `${sparkle.x}%`,
            top: `${sparkle.y}%`,
          }}
          className="text-yellow-300 text-2xl"
        >
          ✨
        </motion.div>
      ))}
    </div>
  );
}

// Floating animation wrapper
export function FloatingAnimation({ children }: { children: React.ReactNode }) {
  const { settings } = useSettingsStore();

  return (
    <motion.div
      animate={
        settings.reducedMotion
          ? {}
          : {
              y: [0, -10, 0],
              rotate: [0, 2, 0, -2, 0],
            }
      }
      transition={{
        duration: 3,
        repeat: Infinity,
        ease: 'easeInOut',
      }}
    >
      {children}
    </motion.div>
  );
}

// Pulse animation wrapper
export function PulseAnimation({ children }: { children: React.ReactNode }) {
  const { settings } = useSettingsStore();

  return (
    <motion.div
      animate={
        settings.reducedMotion
          ? {}
          : {
              scale: [1, 1.05, 1],
              opacity: [0.8, 1, 0.8],
            }
      }
      transition={{
        duration: 2,
        repeat: Infinity,
        ease: 'easeInOut',
      }}
    >
      {children}
    </motion.div>
  );
}

// Rainbow glow animation wrapper
export function RainbowGlowAnimation({ children }: { children: React.ReactNode }) {
  return (
    <motion.div
      animate={{
        filter: [
          'hue-rotate(0deg)',
          'hue-rotate(360deg)',
        ],
      }}
      transition={{
        duration: 3,
        repeat: Infinity,
        ease: 'linear',
      }}
      className="shadow-2xl"
    >
      {children}
    </motion.div>
  );
}

// Glow animation wrapper
export function GlowAnimation({
  children,
  color = 'yellow',
}: {
  children: React.ReactNode;
  color?: string;
}) {
  const { settings } = useSettingsStore();

  const glowColors = {
    yellow: 'shadow-yellow-400',
    blue: 'shadow-blue-400',
    purple: 'shadow-purple-400',
    pink: 'shadow-pink-400',
    green: 'shadow-green-400',
    red: 'shadow-red-400',
  };

  return (
    <motion.div
      animate={
        settings.reducedMotion
          ? {}
          : {
              boxShadow: [
                '0 0 20px rgba(255, 255, 0, 0.5)',
                '0 0 40px rgba(255, 255, 0, 0.8)',
                '0 0 20px rgba(255, 255, 0, 0.5)',
              ],
            }
      }
      transition={{
        duration: 2,
        repeat: Infinity,
        ease: 'easeInOut',
      }}
      className={glowColors[color as keyof typeof glowColors] || glowColors.yellow}
    >
      {children}
    </motion.div>
  );
}

// Sticker flip animation
export function StickerFlipAnimation({
  sticker,
  onFlip,
}: {
  sticker: Sticker;
  onFlip: () => void;
}) {
  const [isFlipped, setIsFlipped] = useState(false);
  const rarityInfo = RARITY_LEVELS.find((r) => r.level === sticker.rarity);

  const handleFlip = () => {
    setIsFlipped(!isFlipped);
    onFlip();
  };

  return (
    <div
      className="relative w-48 h-64 cursor-pointer perspective-1000"
      onClick={handleFlip}
    >
      <motion.div
        animate={{ rotateY: isFlipped ? 180 : 0 }}
        transition={{ duration: 0.6 }}
        className="relative w-full h-full preserve-3d"
      >
        {/* Front */}
        <div
          className={`absolute inset-0 backface-hidden bg-gradient-to-br ${rarityInfo?.color} rounded-2xl flex items-center justify-center`}
        >
          <div className="text-8xl">{sticker.emoji}</div>
        </div>

        {/* Back */}
        <div
          className="absolute inset-0 backface-hidden bg-gradient-to-br from-gray-700 to-gray-900 rounded-2xl flex items-center justify-center text-white p-6"
          style={{ transform: 'rotateY(180deg)' }}
        >
          <div className="text-center">
            <div className="text-2xl font-bold mb-2">{sticker.name}</div>
            <div className="text-sm opacity-90 mb-4">{sticker.description}</div>
            <div className="text-lg">{rarityInfo?.sparkle} {rarityInfo?.name}</div>
          </div>
        </div>
      </motion.div>
    </div>
  );
}

// Main animation demo component
export default function StickerAnimations() {
  const { currentPack, openPack, revealNext, skipToEnd, closePack } = usePackOpening();
  const { particles, trigger: triggerConfetti } = useConfetti();
  const sparkles = useSparkles(15);

  const demoStickers: Sticker[] = [
    {
      id: '1',
      name: 'Speed Star',
      emoji: '⚡',
      category: 'achievement',
      rarity: 'rare',
      description: 'Achieved lightning speed',
      unlockCondition: 'Type at 80 WPM',
      unlocked: true,
      quantity: 1,
    },
    {
      id: '2',
      name: 'Perfect Combo',
      emoji: '💯',
      category: 'achievement',
      rarity: 'epic',
      description: 'Flawless execution',
      unlockCondition: 'Get 100% accuracy',
      unlocked: true,
      quantity: 1,
    },
    {
      id: '3',
      name: 'Golden Trophy',
      emoji: '🏆',
      category: 'milestone',
      rarity: 'legendary',
      description: 'Ultimate achievement',
      unlockCondition: 'Reach level 100',
      unlocked: true,
      quantity: 1,
    },
  ];

  const handleOpenPack = () => {
    openPack({
      packName: 'Achievement Pack',
      packIcon: '🎁',
      stickers: demoStickers,
      rarity: 'epic',
    });
  };

  return (
    <div className="bg-white rounded-2xl shadow-xl p-8">
      <h2 className="text-2xl font-bold text-gray-800 mb-6 text-center">
        ✨ Sticker Animations
      </h2>

      {/* Animation demos */}
      <div className="space-y-8">
        {/* Pack opening */}
        <div className="bg-purple-50 rounded-xl p-6">
          <h3 className="text-xl font-bold text-purple-900 mb-4">
            Pack Opening Animation
          </h3>
          <button
            onClick={handleOpenPack}
            className="px-8 py-4 bg-gradient-to-r from-purple-500 to-pink-500 text-white text-xl font-bold rounded-xl hover:scale-105 transition-transform shadow-lg"
          >
            Open Demo Pack 🎁
          </button>
        </div>

        {/* Confetti */}
        <div className="bg-blue-50 rounded-xl p-6">
          <h3 className="text-xl font-bold text-blue-900 mb-4">Confetti Effect</h3>
          <button
            onClick={() => triggerConfetti(100)}
            className="px-8 py-4 bg-gradient-to-r from-blue-500 to-cyan-500 text-white text-xl font-bold rounded-xl hover:scale-105 transition-transform shadow-lg"
          >
            Trigger Confetti 🎉
          </button>
        </div>

        {/* Animation wrappers */}
        <div className="bg-green-50 rounded-xl p-6">
          <h3 className="text-xl font-bold text-green-900 mb-4">
            Animation Wrappers
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            <div className="text-center">
              <FloatingAnimation>
                <div className="text-6xl">🌟</div>
              </FloatingAnimation>
              <div className="text-sm mt-2">Floating</div>
            </div>

            <div className="text-center">
              <PulseAnimation>
                <div className="text-6xl">💖</div>
              </PulseAnimation>
              <div className="text-sm mt-2">Pulse</div>
            </div>

            <div className="text-center">
              <RainbowGlowAnimation>
                <div className="text-6xl">🌈</div>
              </RainbowGlowAnimation>
              <div className="text-sm mt-2">Rainbow</div>
            </div>

            <div className="text-center relative">
              <SparkleAnimation sparkles={sparkles} />
              <div className="text-6xl">✨</div>
              <div className="text-sm mt-2">Sparkle</div>
            </div>
          </div>
        </div>

        {/* Sticker flip */}
        <div className="bg-yellow-50 rounded-xl p-6">
          <h3 className="text-xl font-bold text-yellow-900 mb-4">
            Sticker Flip Animation
          </h3>
          <div className="flex justify-center">
            <StickerFlipAnimation
              sticker={demoStickers[0]}
              onFlip={() => console.log('Flipped!')}
            />
          </div>
          <p className="text-center text-sm text-gray-600 mt-4">
            Click the sticker to flip it!
          </p>
        </div>
      </div>

      {/* Pack opening modal */}
      <AnimatePresence>
        {currentPack && (
          <PackOpeningAnimation
            pack={currentPack}
            onRevealNext={revealNext}
            onSkip={skipToEnd}
            onClose={closePack}
          />
        )}
      </AnimatePresence>

      {/* Confetti particles */}
      <ConfettiAnimation particles={particles} />

      <div className="mt-8 bg-gray-50 rounded-xl p-6">
        <h3 className="text-lg font-bold text-gray-900 mb-3">
          Animation Features
        </h3>
        <ul className="space-y-2 text-sm text-gray-800">
          <li>• Pack opening with sticker reveals</li>
          <li>• Confetti celebration effects</li>
          <li>• Sparkle particle animations</li>
          <li>• Floating and pulse wrappers</li>
          <li>• Rainbow glow effects</li>
          <li>• Flip card animations</li>
          <li>• All animations respect reduced motion settings</li>
        </ul>
      </div>
    </div>
  );
}
