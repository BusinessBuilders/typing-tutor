/**
 * Audio Service using Howler.js
 * Handles sound effects and background music for the app
 */

import { Howl, Howler } from 'howler';
import { AUDIO_CONFIG } from '../../utils/constants';

// Sound effect types
export type SoundEffect =
  | 'success'
  | 'error'
  | 'click'
  | 'celebration'
  | 'letter-typed'
  | 'word-complete'
  | 'level-up'
  | 'achievement-unlocked';

// Cache for loaded sounds
const soundCache: Map<string, Howl> = new Map();

// Background music instance
let backgroundMusic: Howl | null = null;

/**
 * Initialize the audio service
 */
export function initializeAudio(): void {
  // Set global volume
  Howler.volume(AUDIO_CONFIG.DEFAULT_VOLUME);
}

/**
 * Load a sound file
 */
function loadSound(name: string, src: string): Howl {
  if (soundCache.has(name)) {
    return soundCache.get(name)!;
  }

  const sound = new Howl({
    src: [src],
    preload: true,
    volume: 0.7,
  });

  soundCache.set(name, sound);
  return sound;
}

/**
 * Play a sound effect
 */
export function playSound(effect: SoundEffect, volume: number = 0.7): void {
  try {
    // Map sound effects to their file paths
    const soundMap: Record<SoundEffect, string> = {
      success: '/sounds/success.mp3',
      error: '/sounds/gentle-error.mp3',
      click: '/sounds/click.mp3',
      celebration: '/sounds/celebration.mp3',
      'letter-typed': '/sounds/letter-typed.mp3',
      'word-complete': '/sounds/word-complete.mp3',
      'level-up': '/sounds/level-up.mp3',
      'achievement-unlocked': '/sounds/achievement.mp3',
    };

    const soundPath = soundMap[effect];
    if (!soundPath) {
      console.warn(`Sound effect "${effect}" not found`);
      return;
    }

    const sound = loadSound(effect, soundPath);
    sound.volume(volume);
    sound.play();
  } catch (error) {
    console.error('Error playing sound:', error);
  }
}

/**
 * Play a success sound
 */
export function playSuccessSound(): void {
  playSound('success');
}

/**
 * Play an error sound (gentle for autism-friendly app)
 */
export function playErrorSound(): void {
  playSound('error', 0.5); // Lower volume for error sounds
}

/**
 * Play a celebration sound
 */
export function playCelebrationSound(): void {
  playSound('celebration', 0.8);
}

/**
 * Play a click sound
 */
export function playClickSound(): void {
  playSound('click', 0.5);
}

/**
 * Play letter typed sound
 */
export function playLetterTypedSound(): void {
  playSound('letter-typed', 0.4);
}

/**
 * Play word complete sound
 */
export function playWordCompleteSound(): void {
  playSound('word-complete', 0.6);
}

/**
 * Play level up sound
 */
export function playLevelUpSound(): void {
  playSound('level-up', 0.8);
}

/**
 * Play achievement unlocked sound
 */
export function playAchievementSound(): void {
  playSound('achievement-unlocked', 0.8);
}

/**
 * Play background music
 */
export function playBackgroundMusic(src: string, volume: number = 0.3): void {
  try {
    // Stop existing music
    if (backgroundMusic) {
      backgroundMusic.stop();
    }

    backgroundMusic = new Howl({
      src: [src],
      loop: true,
      volume: volume,
      preload: true,
    });

    backgroundMusic.play();
  } catch (error) {
    console.error('Error playing background music:', error);
  }
}

/**
 * Stop background music
 */
export function stopBackgroundMusic(): void {
  if (backgroundMusic) {
    backgroundMusic.stop();
    backgroundMusic = null;
  }
}

/**
 * Pause background music
 */
export function pauseBackgroundMusic(): void {
  if (backgroundMusic) {
    backgroundMusic.pause();
  }
}

/**
 * Resume background music
 */
export function resumeBackgroundMusic(): void {
  if (backgroundMusic) {
    backgroundMusic.play();
  }
}

/**
 * Set global volume
 */
export function setGlobalVolume(volume: number): void {
  Howler.volume(Math.max(0, Math.min(1, volume)));
}

/**
 * Set background music volume
 */
export function setMusicVolume(volume: number): void {
  if (backgroundMusic) {
    backgroundMusic.volume(Math.max(0, Math.min(1, volume)));
  }
}

/**
 * Mute all sounds
 */
export function muteAll(): void {
  Howler.mute(true);
}

/**
 * Unmute all sounds
 */
export function unmuteAll(): void {
  Howler.mute(false);
}

/**
 * Check if audio is muted
 */
export function isMuted(): boolean {
  return Howler.volume() === 0;
}

/**
 * Clean up audio resources
 */
export function cleanupAudio(): void {
  // Stop all sounds
  Howler.stop();

  // Unload all cached sounds
  soundCache.forEach((sound) => sound.unload());
  soundCache.clear();

  // Stop background music
  if (backgroundMusic) {
    backgroundMusic.unload();
    backgroundMusic = null;
  }
}

// Export the audio service
export default {
  initializeAudio,
  playSound,
  playSuccessSound,
  playErrorSound,
  playCelebrationSound,
  playClickSound,
  playLetterTypedSound,
  playWordCompleteSound,
  playLevelUpSound,
  playAchievementSound,
  playBackgroundMusic,
  stopBackgroundMusic,
  pauseBackgroundMusic,
  resumeBackgroundMusic,
  setGlobalVolume,
  setMusicVolume,
  muteAll,
  unmuteAll,
  isMuted,
  cleanupAudio,
};
