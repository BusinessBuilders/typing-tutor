/**
 * Parent Recording Component
 * Step 209 - Allow parents to record custom voice messages
 */

import { motion, AnimatePresence } from 'framer-motion';
import { useState, useRef } from 'react';
import { useSettingsStore } from '../store/useSettingsStore';

// Recording interface
interface Recording {
  id: string;
  label: string;
  type: 'encouragement' | 'instruction' | 'praise' | 'reminder';
  audioURL: string;
  duration: number;
  createdAt: Date;
}

// Custom hook for parent recordings
export function useParentRecordings() {
  const [recordings, setRecordings] = useState<Recording[]>([]);
  const [isRecording, setIsRecording] = useState(false);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const startTimeRef = useRef<number>(0);

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);

      mediaRecorderRef.current = mediaRecorder;
      chunksRef.current = [];
      startTimeRef.current = Date.now();

      mediaRecorder.ondataavailable = (e) => {
        chunksRef.current.push(e.data);
      };

      mediaRecorder.onstop = () => {
        const blob = new Blob(chunksRef.current, { type: 'audio/webm' });
        const url = URL.createObjectURL(blob);
        const duration = Math.round((Date.now() - startTimeRef.current) / 1000);

        return { url, duration, blob };
      };

      mediaRecorder.start();
      setIsRecording(true);
    } catch (error) {
      console.error('Error accessing microphone:', error);
      alert('Could not access microphone. Please check permissions.');
    }
  };

  const stopRecording = (label: string, type: Recording['type']) => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      mediaRecorderRef.current.stream.getTracks().forEach((track) => track.stop());

      // Wait for stop event to complete
      setTimeout(() => {
        const blob = new Blob(chunksRef.current, { type: 'audio/webm' });
        const url = URL.createObjectURL(blob);
        const duration = Math.round((Date.now() - startTimeRef.current) / 1000);

        const recording: Recording = {
          id: Date.now().toString(),
          label,
          type,
          audioURL: url,
          duration,
          createdAt: new Date(),
        };

        setRecordings((prev) => [...prev, recording]);
        setIsRecording(false);
      }, 100);
    }
  };

  const deleteRecording = (id: string) => {
    setRecordings((prev) => prev.filter((r) => r.id !== id));
  };

  const playRecording = (audioURL: string) => {
    const audio = new Audio(audioURL);
    audio.play();
  };

  return {
    recordings,
    isRecording,
    startRecording,
    stopRecording,
    deleteRecording,
    playRecording,
  };
}

// Main parent recording component
export default function ParentRecording() {
  const {
    recordings,
    isRecording,
    startRecording,
    stopRecording,
    deleteRecording,
    playRecording,
  } = useParentRecordings();

  const { settings } = useSettingsStore();
  const [recordingLabel, setRecordingLabel] = useState('');
  const [recordingType, setRecordingType] = useState<Recording['type']>('encouragement');
  const [showRecordDialog, setShowRecordDialog] = useState(false);

  const handleStopRecording = () => {
    if (!recordingLabel.trim()) {
      alert('Please enter a label for this recording');
      return;
    }
    stopRecording(recordingLabel, recordingType);
    setShowRecordDialog(false);
    setRecordingLabel('');
  };

  const types: Array<{ value: Recording['type']; label: string; icon: string }> = [
    { value: 'encouragement', label: 'Encouragement', icon: '💪' },
    { value: 'instruction', label: 'Instruction', icon: '📝' },
    { value: 'praise', label: 'Praise', icon: '🌟' },
    { value: 'reminder', label: 'Reminder', icon: '⏰' },
  ];

  return (
    <div className="bg-white rounded-2xl shadow-xl p-8">
      <h2 className="text-2xl font-bold text-gray-800 mb-6 text-center">
        Parent Voice Messages
      </h2>

      <div className="mb-8 bg-purple-50 rounded-xl p-6">
        <h3 className="text-lg font-bold text-purple-900 mb-3">
          For Parents & Caregivers
        </h3>
        <p className="text-purple-800 mb-4">
          Record personalized voice messages in your own voice to encourage and guide your child during practice.
        </p>

        <button
          onClick={() => setShowRecordDialog(true)}
          className="w-full py-4 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-xl font-bold text-lg hover:from-purple-600 hover:to-pink-600 transition-all shadow-lg"
        >
          🎤 Record New Message
        </button>
      </div>

      {/* Recording dialog */}
      <AnimatePresence>
        {showRecordDialog && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => !isRecording && setShowRecordDialog(false)}
              className="fixed inset-0 bg-black bg-opacity-50 z-40"
            />

            <div className="fixed inset-0 flex items-center justify-center z-50 p-4">
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                className="bg-white rounded-2xl shadow-2xl p-8 max-w-md w-full"
              >
                <h3 className="text-2xl font-bold text-gray-900 mb-6">
                  Record Message
                </h3>

                {!isRecording && (
                  <>
                    <div className="mb-4">
                      <label className="block text-sm font-bold text-gray-700 mb-2">
                        Message Label:
                      </label>
                      <input
                        type="text"
                        value={recordingLabel}
                        onChange={(e) => setRecordingLabel(e.target.value)}
                        placeholder="e.g., Good job!, Keep trying!, etc."
                        className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-primary-500 focus:outline-none"
                      />
                    </div>

                    <div className="mb-6">
                      <label className="block text-sm font-bold text-gray-700 mb-2">
                        Message Type:
                      </label>
                      <div className="grid grid-cols-2 gap-2">
                        {types.map(({ value, label, icon }) => (
                          <button
                            key={value}
                            onClick={() => setRecordingType(value)}
                            className={`p-3 rounded-lg font-medium transition-all ${
                              recordingType === value
                                ? 'bg-primary-500 text-white'
                                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                            }`}
                          >
                            {icon} {label}
                          </button>
                        ))}
                      </div>
                    </div>

                    <button
                      onClick={startRecording}
                      className="w-full py-4 bg-red-500 text-white rounded-xl font-bold text-xl hover:bg-red-600 transition-colors mb-3"
                    >
                      🎤 Start Recording
                    </button>

                    <button
                      onClick={() => setShowRecordDialog(false)}
                      className="w-full py-3 bg-gray-200 text-gray-700 rounded-lg font-bold hover:bg-gray-300 transition-colors"
                    >
                      Cancel
                    </button>
                  </>
                )}

                {isRecording && (
                  <div className="text-center">
                    <motion.div
                      animate={{ scale: [1, 1.2, 1] }}
                      transition={{ duration: 1, repeat: Infinity }}
                      className="text-8xl mb-6"
                    >
                      🎤
                    </motion.div>

                    <h4 className="text-2xl font-bold text-red-600 mb-2">
                      Recording...
                    </h4>
                    <p className="text-gray-600 mb-8">
                      Speak your message clearly
                    </p>

                    <button
                      onClick={handleStopRecording}
                      className="w-full py-4 bg-green-500 text-white rounded-xl font-bold text-xl hover:bg-green-600 transition-colors"
                    >
                      ⏹️ Stop & Save
                    </button>
                  </div>
                )}
              </motion.div>
            </div>
          </>
        )}
      </AnimatePresence>

      {/* Recordings list */}
      {recordings.length > 0 ? (
        <div>
          <h3 className="text-lg font-bold text-gray-900 mb-4">
            Your Messages ({recordings.length})
          </h3>

          <div className="space-y-3">
            {recordings.map((recording, index) => (
              <motion.div
                key={recording.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: settings.reducedMotion ? 0 : index * 0.05 }}
                className="bg-gray-50 rounded-lg p-4"
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <span className="text-2xl">
                      {types.find((t) => t.value === recording.type)?.icon}
                    </span>
                    <div>
                      <div className="font-bold text-gray-900">{recording.label}</div>
                      <div className="text-sm text-gray-600">
                        {recording.type} • {recording.duration}s
                      </div>
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <button
                      onClick={() => playRecording(recording.audioURL)}
                      className="px-4 py-2 bg-green-500 text-white rounded-lg font-bold hover:bg-green-600 transition-colors"
                    >
                      ▶️
                    </button>
                    <button
                      onClick={() => {
                        if (confirm('Delete this recording?')) {
                          deleteRecording(recording.id);
                        }
                      }}
                      className="px-4 py-2 bg-red-100 text-red-700 rounded-lg font-bold hover:bg-red-200 transition-colors"
                    >
                      🗑️
                    </button>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      ) : (
        <div className="text-center text-gray-500 py-12">
          No recordings yet. Create your first personalized message!
        </div>
      )}

      <div className="mt-8 bg-blue-50 rounded-xl p-6">
        <h3 className="text-lg font-bold text-blue-900 mb-3">
          Recording Tips
        </h3>
        <ul className="space-y-2 text-sm text-blue-800">
          <li>• Speak clearly and warmly</li>
          <li>• Keep messages short (5-10 seconds)</li>
          <li>• Use positive, encouraging language</li>
          <li>• Record in a quiet environment</li>
          <li>• Test playback before saving</li>
        </ul>
      </div>
    </div>
  );
}
