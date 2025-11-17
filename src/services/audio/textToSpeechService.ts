/**
 * Text-to-Speech Service using Web Speech API
 * Provides text-to-speech functionality for the autism typing tutor
 */

// Check if browser supports speech synthesis
const speechSynthesis = window.speechSynthesis;
const SpeechSynthesisUtterance = window.SpeechSynthesisUtterance;

// Voice settings interface
export interface VoiceSettings {
  lang?: string;
  pitch?: number; // 0 to 2
  rate?: number; // 0.1 to 10
  volume?: number; // 0 to 1
  voice?: SpeechSynthesisVoice | null;
}

// Default settings
const defaultSettings: VoiceSettings = {
  lang: 'en-US',
  pitch: 1.0,
  rate: 1.0,
  volume: 1.0,
  voice: null,
};

let currentSettings: VoiceSettings = { ...defaultSettings };
let currentUtterance: SpeechSynthesisUtterance | null = null;
let availableVoices: SpeechSynthesisVoice[] = [];

/**
 * Initialize text-to-speech service
 */
export function initializeTTS(): void {
  if (!speechSynthesis) {
    console.warn('Speech synthesis not supported in this browser');
    return;
  }

  // Load available voices
  loadVoices();

  // Voices may load asynchronously
  if (speechSynthesis.onvoiceschanged !== undefined) {
    speechSynthesis.onvoiceschanged = loadVoices;
  }
}

/**
 * Load available voices
 */
function loadVoices(): void {
  availableVoices = speechSynthesis.getVoices();

  // If no voice is set, try to find a suitable default
  if (!currentSettings.voice && availableVoices.length > 0) {
    // Try to find an English voice
    const englishVoice = availableVoices.find(
      (voice) => voice.lang.startsWith('en')
    );
    currentSettings.voice = englishVoice || availableVoices[0];
  }
}

/**
 * Get all available voices
 */
export function getAvailableVoices(): SpeechSynthesisVoice[] {
  return availableVoices;
}

/**
 * Get voices filtered by language
 */
export function getVoicesByLanguage(lang: string): SpeechSynthesisVoice[] {
  return availableVoices.filter((voice) => voice.lang.startsWith(lang));
}

/**
 * Get voices filtered by gender (if available in name)
 */
export function getVoicesByGender(gender: 'male' | 'female' | 'neutral'): SpeechSynthesisVoice[] {
  const keywords: Record<string, string[]> = {
    male: ['male', 'man', 'david', 'james'],
    female: ['female', 'woman', 'samantha', 'karen', 'victoria'],
    neutral: [],
  };

  if (gender === 'neutral') {
    return availableVoices;
  }

  const genderKeywords = keywords[gender];
  return availableVoices.filter((voice) =>
    genderKeywords.some((keyword) => voice.name.toLowerCase().includes(keyword))
  );
}

/**
 * Set voice settings
 */
export function setVoiceSettings(settings: Partial<VoiceSettings>): void {
  currentSettings = { ...currentSettings, ...settings };
}

/**
 * Get current voice settings
 */
export function getVoiceSettings(): VoiceSettings {
  return { ...currentSettings };
}

/**
 * Speak text
 */
export function speak(
  text: string,
  settings?: Partial<VoiceSettings>,
  onEnd?: () => void
): void {
  if (!speechSynthesis || !SpeechSynthesisUtterance) {
    console.warn('Speech synthesis not supported');
    return;
  }

  // Cancel any ongoing speech
  stop();

  // Create utterance
  currentUtterance = new SpeechSynthesisUtterance(text);

  // Apply settings
  const speakSettings = { ...currentSettings, ...settings };
  currentUtterance.lang = speakSettings.lang || 'en-US';
  currentUtterance.pitch = speakSettings.pitch || 1.0;
  currentUtterance.rate = speakSettings.rate || 1.0;
  currentUtterance.volume = speakSettings.volume || 1.0;

  if (speakSettings.voice) {
    currentUtterance.voice = speakSettings.voice;
  }

  // Set up event handlers
  currentUtterance.onend = () => {
    currentUtterance = null;
    if (onEnd) onEnd();
  };

  currentUtterance.onerror = (event) => {
    console.error('Speech synthesis error:', event);
    currentUtterance = null;
  };

  // Speak
  speechSynthesis.speak(currentUtterance);
}

/**
 * Speak a single letter
 */
export function speakLetter(letter: string, onEnd?: () => void): void {
  speak(letter, { rate: 0.8 }, onEnd);
}

/**
 * Speak a word
 */
export function speakWord(word: string, onEnd?: () => void): void {
  speak(word, { rate: 0.9 }, onEnd);
}

/**
 * Speak a sentence
 */
export function speakSentence(sentence: string, onEnd?: () => void): void {
  speak(sentence, undefined, onEnd);
}

/**
 * Speak with emphasis (for encouragement)
 */
export function speakWithEmphasis(text: string, onEnd?: () => void): void {
  speak(text, { pitch: 1.2, rate: 0.9 }, onEnd);
}

/**
 * Stop speaking
 */
export function stop(): void {
  if (speechSynthesis) {
    speechSynthesis.cancel();
    currentUtterance = null;
  }
}

/**
 * Pause speaking
 */
export function pause(): void {
  if (speechSynthesis && speechSynthesis.speaking) {
    speechSynthesis.pause();
  }
}

/**
 * Resume speaking
 */
export function resume(): void {
  if (speechSynthesis && speechSynthesis.paused) {
    speechSynthesis.resume();
  }
}

/**
 * Check if currently speaking
 */
export function isSpeaking(): boolean {
  return speechSynthesis ? speechSynthesis.speaking : false;
}

/**
 * Check if speech is paused
 */
export function isPaused(): boolean {
  return speechSynthesis ? speechSynthesis.paused : false;
}

/**
 * Check if speech synthesis is supported
 */
export function isSupported(): boolean {
  return typeof speechSynthesis !== 'undefined' && typeof SpeechSynthesisUtterance !== 'undefined';
}

/**
 * Speak each word in a sentence with a pause between them
 */
export async function speakWordByWord(
  sentence: string,
  pauseDuration: number = 500,
  onWordSpoken?: (word: string, index: number) => void
): Promise<void> {
  const words = sentence.split(/\s+/);

  for (let i = 0; i < words.length; i++) {
    await new Promise<void>((resolve) => {
      speakWord(words[i], () => {
        if (onWordSpoken) {
          onWordSpoken(words[i], i);
        }
        setTimeout(resolve, pauseDuration);
      });
    });
  }
}

/**
 * Speak encouragement messages
 */
export function speakEncouragement(message: string): void {
  speakWithEmphasis(message);
}

// Export the TTS service
export default {
  initializeTTS,
  getAvailableVoices,
  getVoicesByLanguage,
  getVoicesByGender,
  setVoiceSettings,
  getVoiceSettings,
  speak,
  speakLetter,
  speakWord,
  speakSentence,
  speakWithEmphasis,
  stop,
  pause,
  resume,
  isSpeaking,
  isPaused,
  isSupported,
  speakWordByWord,
  speakEncouragement,
};
