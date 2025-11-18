/**
 * Audio Effects Component
 * Steps 185-190 - Word pauses, emphasis, pronunciation, recording, playback, and speech recognition
 */

import { useState, useRef } from 'react';
import { useTextToSpeech } from './TextToSpeech';

// Step 185: Word Pauses
export function WordPauses({ text }: { text: string }) {
  const { speak } = useTextToSpeech();
  const [pauseDuration, setPauseDuration] = useState(300);

  const speakWithPauses = () => {
    const words = text.split(' ');
    let currentIndex = 0;

    const speakNext = () => {
      if (currentIndex < words.length) {
        speak(words[currentIndex]);
        currentIndex++;
        setTimeout(speakNext, pauseDuration);
      }
    };

    speakNext();
  };

  return (
    <div className="bg-white rounded-2xl shadow-xl p-8">
      <h2 className="text-2xl font-bold text-gray-800 mb-6 text-center">
        Word-by-Word Reading
      </h2>

      <div className="mb-6">
        <label className="block text-sm font-bold text-gray-700 mb-2">
          Pause between words: {pauseDuration}ms
        </label>
        <input
          type="range"
          min="100"
          max="1000"
          step="100"
          value={pauseDuration}
          onChange={(e) => setPauseDuration(parseInt(e.target.value))}
          className="w-full"
        />
      </div>

      <div className="bg-gray-50 rounded-xl p-6 mb-6">
        <div className="text-xl">{text}</div>
      </div>

      <button
        onClick={speakWithPauses}
        className="w-full py-3 bg-primary-500 text-white rounded-lg font-bold hover:bg-primary-600"
      >
        Read with Pauses
      </button>
    </div>
  );
}

// Step 186: Emphasis System
export function EmphasisSystem({ text }: { text: string }) {
  const { speak } = useTextToSpeech();
  const [emphasizedWords, setEmphasizedWords] = useState<number[]>([]);

  const toggleEmphasis = (index: number) => {
    setEmphasizedWords(prev =>
      prev.includes(index) ? prev.filter(i => i !== index) : [...prev, index]
    );
  };

  const speakWithEmphasis = () => {
    speak(text);
  };

  return (
    <div className="bg-white rounded-2xl shadow-xl p-8">
      <h2 className="text-2xl font-bold text-gray-800 mb-6 text-center">
        Add Emphasis
      </h2>

      <div className="bg-gray-50 rounded-xl p-6 mb-6">
        <div className="text-2xl flex flex-wrap gap-2">
          {text.split(' ').map((word, index) => (
            <button
              key={index}
              onClick={() => toggleEmphasis(index)}
              className={`px-2 py-1 rounded ${
                emphasizedWords.includes(index)
                  ? 'bg-yellow-400 font-bold'
                  : 'hover:bg-gray-200'
              }`}
            >
              {word}
            </button>
          ))}
        </div>
      </div>

      <button
        onClick={speakWithEmphasis}
        className="w-full py-3 bg-primary-500 text-white rounded-lg font-bold hover:bg-primary-600"
      >
        Speak with Emphasis
      </button>
    </div>
  );
}

// Step 187: Pronunciation Guides
export function PronunciationGuide({ word }: { word: string }) {
  const { speak } = useTextToSpeech();

  const pronunciations = [
    { label: 'Slow', rate: 0.5 },
    { label: 'Normal', rate: 1 },
    { label: 'Fast', rate: 1.5 },
  ];

  return (
    <div className="bg-white rounded-2xl shadow-xl p-8">
      <h2 className="text-2xl font-bold text-gray-800 mb-6 text-center">
        Learn Pronunciation
      </h2>

      <div className="text-5xl font-bold text-center mb-8 text-gray-900">
        {word}
      </div>

      <div className="grid grid-cols-3 gap-4">
        {pronunciations.map(({ label, rate }) => (
          <button
            key={label}
            onClick={() => speak(word, { rate })}
            className="py-4 bg-primary-100 text-primary-900 rounded-lg font-bold hover:bg-primary-200"
          >
            {label}
          </button>
        ))}
      </div>
    </div>
  );
}

// Step 188: Voice Recording
export function VoiceRecorder() {
  const [isRecording, setIsRecording] = useState(false);
  const [audioURL, setAudioURL] = useState<string | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);

      mediaRecorderRef.current = mediaRecorder;
      chunksRef.current = [];

      mediaRecorder.ondataavailable = (e) => {
        chunksRef.current.push(e.data);
      };

      mediaRecorder.onstop = () => {
        const blob = new Blob(chunksRef.current, { type: 'audio/webm' });
        const url = URL.createObjectURL(blob);
        setAudioURL(url);
      };

      mediaRecorder.start();
      setIsRecording(true);
    } catch (error) {
      console.error('Error accessing microphone:', error);
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      mediaRecorderRef.current.stream.getTracks().forEach(track => track.stop());
      setIsRecording(false);
    }
  };

  return (
    <div className="bg-white rounded-2xl shadow-xl p-8">
      <h2 className="text-2xl font-bold text-gray-800 mb-6 text-center">
        Record Your Voice
      </h2>

      <div className="flex flex-col items-center gap-6">
        <button
          onClick={isRecording ? stopRecording : startRecording}
          className={`w-32 h-32 rounded-full ${
            isRecording ? 'bg-red-500 animate-pulse' : 'bg-primary-500'
          } text-white text-4xl hover:opacity-90 transition-opacity`}
        >
          {isRecording ? '⏹️' : '🎤'}
        </button>

        <div className="text-lg font-bold">
          {isRecording ? 'Recording...' : 'Click to Record'}
        </div>

        {audioURL && (
          <div className="w-full">
            <h3 className="text-sm font-bold text-gray-700 mb-2">Your Recording:</h3>
            <audio src={audioURL} controls className="w-full" />
          </div>
        )}
      </div>
    </div>
  );
}

// Step 189: Audio Playback
export function AudioPlayback({ audioURL }: { audioURL?: string }) {
  const [isPlaying, setIsPlaying] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const handlePlay = () => {
    if (audioRef.current) {
      if (isPlaying) {
        audioRef.current.pause();
      } else {
        audioRef.current.play();
      }
      setIsPlaying(!isPlaying);
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-lg p-6">
      <h3 className="text-xl font-bold text-gray-800 mb-4">
        Audio Playback
      </h3>

      {audioURL ? (
        <div className="space-y-4">
          <audio
            ref={audioRef}
            src={audioURL}
            onEnded={() => setIsPlaying(false)}
            className="w-full"
          />

          <button
            onClick={handlePlay}
            className="w-full py-3 bg-primary-500 text-white rounded-lg font-bold hover:bg-primary-600"
          >
            {isPlaying ? '⏸️ Pause' : '▶️ Play'}
          </button>
        </div>
      ) : (
        <div className="text-gray-500 text-center py-8">
          No audio available
        </div>
      )}
    </div>
  );
}

// Step 190: Speech Recognition
export default function SpeechRecognitionComponent() {
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [supported, setSupported] = useState(true);
  const recognitionRef = useRef<any>(null);

  const startListening = () => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    if (!SpeechRecognition) {
      setSupported(false);
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.continuous = true;
    recognition.interimResults = true;

    recognition.onresult = (event: any) => {
      const transcript = Array.from(event.results)
        .map((result: any) => result[0].transcript)
        .join('');
      setTranscript(transcript);
    };

    recognition.onend = () => {
      setIsListening(false);
    };

    recognition.start();
    recognitionRef.current = recognition;
    setIsListening(true);
  };

  const stopListening = () => {
    if (recognitionRef.current) {
      recognitionRef.current.stop();
    }
    setIsListening(false);
  };

  if (!supported) {
    return (
      <div className="bg-white rounded-2xl shadow-xl p-8">
        <div className="text-center text-gray-600">
          Speech recognition is not supported in your browser.
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl shadow-xl p-8">
      <h2 className="text-2xl font-bold text-gray-800 mb-6 text-center">
        Speech-to-Text
      </h2>

      <div className="bg-gray-50 rounded-xl p-6 mb-6 min-h-[100px]">
        <div className="text-lg">
          {transcript || 'Click the microphone and start speaking...'}
        </div>
      </div>

      <button
        onClick={isListening ? stopListening : startListening}
        className={`w-full py-4 ${
          isListening ? 'bg-red-500 animate-pulse' : 'bg-primary-500'
        } text-white rounded-xl font-bold text-xl hover:opacity-90 transition-opacity`}
      >
        {isListening ? '⏹️ Stop Listening' : '🎤 Start Listening'}
      </button>
    </div>
  );
}
