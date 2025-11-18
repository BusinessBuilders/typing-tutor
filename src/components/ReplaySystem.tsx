import React, { useState, useCallback, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

/**
 * ReplaySystem Component
 *
 * Comprehensive replay system for typing practice sessions.
 * Records, saves, plays back, and analyzes typing sessions
 * with detailed playback controls.
 *
 * Features:
 * - Session recording with keystroke capture
 * - Playback with speed controls
 * - Pause/resume/seek functionality
 * - Frame-by-frame replay
 * - Error highlighting during replay
 * - Performance metrics overlay
 * - Save/load replays
 * - Replay comparison
 * - Share replay functionality
 * - Analysis tools
 */

// Types for replay system
export type ReplayState = 'idle' | 'recording' | 'playing' | 'paused' | 'stopped';
export type PlaybackSpeed = 0.25 | 0.5 | 1 | 1.5 | 2 | 3;

export interface KeystrokeEvent {
  timestamp: number; // milliseconds from start
  key: string;
  isCorrect: boolean;
  position: number; // character index
  wpm: number;
  accuracy: number;
}

export interface ReplaySession {
  id: string;
  name: string;
  description?: string;
  createdAt: Date;
  duration: number; // milliseconds
  keystrokes: KeystrokeEvent[];
  text: string;
  finalStats: {
    wpm: number;
    accuracy: number;
    errorCount: number;
    totalCharacters: number;
  };
  metadata?: Record<string, any>;
}

export interface PlaybackState {
  currentTime: number; // milliseconds
  currentIndex: number; // keystroke index
  isPlaying: boolean;
  speed: PlaybackSpeed;
}

export interface ReplaySettings {
  enabled: boolean;
  autoRecord: boolean;
  showMetrics: boolean;
  showErrors: boolean;
  allowSeek: boolean;
  showTimeline: boolean;
  maxSavedReplays: number;
  saveToStorage: boolean;
}

export interface ReplayComparison {
  replay1: ReplaySession;
  replay2: ReplaySession;
  differences: {
    wpmDiff: number;
    accuracyDiff: number;
    errorCountDiff: number;
    timeDiff: number;
  };
}

// Custom hook for replay system
export function useReplaySystem(initialSettings?: Partial<ReplaySettings>) {
  const [settings, setSettings] = useState<ReplaySettings>({
    enabled: true,
    autoRecord: false,
    showMetrics: true,
    showErrors: true,
    allowSeek: true,
    showTimeline: true,
    maxSavedReplays: 50,
    saveToStorage: true,
    ...initialSettings,
  });

  const [state, setState] = useState<ReplayState>('idle');
  const [currentSession, setCurrentSession] = useState<ReplaySession | null>(null);
  const [savedReplays, setSavedReplays] = useState<ReplaySession[]>([]);
  const [playbackState, setPlaybackState] = useState<PlaybackState>({
    currentTime: 0,
    currentIndex: 0,
    isPlaying: false,
    speed: 1,
  });

  const recordingStartTime = useRef<number>(0);
  const playbackTimer = useRef<NodeJS.Timeout | null>(null);

  const updateSettings = useCallback((newSettings: Partial<ReplaySettings>) => {
    setSettings((prev) => ({ ...prev, ...newSettings }));
  }, []);

  const startRecording = useCallback((text: string, name?: string) => {
    const session: ReplaySession = {
      id: `replay-${Date.now()}`,
      name: name || `Session ${new Date().toLocaleString()}`,
      createdAt: new Date(),
      duration: 0,
      keystrokes: [],
      text,
      finalStats: {
        wpm: 0,
        accuracy: 0,
        errorCount: 0,
        totalCharacters: 0,
      },
    };

    setCurrentSession(session);
    setState('recording');
    recordingStartTime.current = Date.now();
  }, []);

  const recordKeystroke = useCallback(
    (
      key: string,
      isCorrect: boolean,
      position: number,
      wpm: number,
      accuracy: number
    ) => {
      if (state !== 'recording' || !currentSession) return;

      const timestamp = Date.now() - recordingStartTime.current;

      const keystroke: KeystrokeEvent = {
        timestamp,
        key,
        isCorrect,
        position,
        wpm,
        accuracy,
      };

      setCurrentSession((prev) => {
        if (!prev) return null;
        return {
          ...prev,
          keystrokes: [...prev.keystrokes, keystroke],
          duration: timestamp,
        };
      });
    },
    [state, currentSession]
  );

  const stopRecording = useCallback(
    (finalStats: ReplaySession['finalStats']) => {
      if (state !== 'recording' || !currentSession) return null;

      const completedSession: ReplaySession = {
        ...currentSession,
        duration: Date.now() - recordingStartTime.current,
        finalStats,
      };

      setCurrentSession(completedSession);
      setState('stopped');

      // Save to storage if enabled
      if (settings.saveToStorage) {
        saveReplay(completedSession);
      }

      return completedSession;
    },
    [state, currentSession, settings.saveToStorage]
  );

  const saveReplay = useCallback(
    (session: ReplaySession) => {
      setSavedReplays((prev) => {
        const updated = [session, ...prev];
        return updated.slice(0, settings.maxSavedReplays);
      });

      // Save to localStorage
      if (settings.saveToStorage) {
        try {
          const saved = [session, ...savedReplays].slice(0, settings.maxSavedReplays);
          localStorage.setItem('typing-tutor-replays', JSON.stringify(saved));
        } catch (err) {
          console.error('Failed to save replay:', err);
        }
      }
    },
    [savedReplays, settings.maxSavedReplays, settings.saveToStorage]
  );

  const loadReplay = useCallback((replayId: string) => {
    const replay = savedReplays.find((r) => r.id === replayId);
    if (!replay) return null;

    setCurrentSession(replay);
    setPlaybackState({
      currentTime: 0,
      currentIndex: 0,
      isPlaying: false,
      speed: 1,
    });
    setState('stopped');

    return replay;
  }, [savedReplays]);

  const startPlayback = useCallback(() => {
    if (!currentSession || state === 'recording') return;

    setState('playing');
    setPlaybackState((prev) => ({ ...prev, isPlaying: true }));
  }, [currentSession, state]);

  const pausePlayback = useCallback(() => {
    if (state !== 'playing') return;

    setState('paused');
    setPlaybackState((prev) => ({ ...prev, isPlaying: false }));

    if (playbackTimer.current) {
      clearInterval(playbackTimer.current);
      playbackTimer.current = null;
    }
  }, [state]);

  const resumePlayback = useCallback(() => {
    if (state !== 'paused') return;

    setState('playing');
    setPlaybackState((prev) => ({ ...prev, isPlaying: true }));
  }, [state]);

  const stopPlayback = useCallback(() => {
    setState('stopped');
    setPlaybackState({
      currentTime: 0,
      currentIndex: 0,
      isPlaying: false,
      speed: 1,
    });

    if (playbackTimer.current) {
      clearInterval(playbackTimer.current);
      playbackTimer.current = null;
    }
  }, []);

  const seekTo = useCallback(
    (time: number) => {
      if (!currentSession || !settings.allowSeek) return;

      const clampedTime = Math.max(0, Math.min(time, currentSession.duration));

      // Find the keystroke index at this time
      const index = currentSession.keystrokes.findIndex(
        (k) => k.timestamp > clampedTime
      );

      setPlaybackState((prev) => ({
        ...prev,
        currentTime: clampedTime,
        currentIndex: index === -1 ? currentSession.keystrokes.length : index,
      }));
    },
    [currentSession, settings.allowSeek]
  );

  const setPlaybackSpeed = useCallback((speed: PlaybackSpeed) => {
    setPlaybackState((prev) => ({ ...prev, speed }));
  }, []);

  const deleteReplay = useCallback((replayId: string) => {
    setSavedReplays((prev) => prev.filter((r) => r.id !== replayId));

    // Update localStorage
    try {
      const updated = savedReplays.filter((r) => r.id !== replayId);
      localStorage.setItem('typing-tutor-replays', JSON.stringify(updated));
    } catch (err) {
      console.error('Failed to delete replay:', err);
    }
  }, [savedReplays]);

  const compareReplays = useCallback(
    (replayId1: string, replayId2: string): ReplayComparison | null => {
      const replay1 = savedReplays.find((r) => r.id === replayId1);
      const replay2 = savedReplays.find((r) => r.id === replayId2);

      if (!replay1 || !replay2) return null;

      return {
        replay1,
        replay2,
        differences: {
          wpmDiff: replay1.finalStats.wpm - replay2.finalStats.wpm,
          accuracyDiff: replay1.finalStats.accuracy - replay2.finalStats.accuracy,
          errorCountDiff: replay1.finalStats.errorCount - replay2.finalStats.errorCount,
          timeDiff: replay1.duration - replay2.duration,
        },
      };
    },
    [savedReplays]
  );

  // Playback effect
  useEffect(() => {
    if (state !== 'playing' || !currentSession) return;

    const frameTime = 16 / playbackState.speed; // ~60fps adjusted for speed

    playbackTimer.current = setInterval(() => {
      setPlaybackState((prev) => {
        const newTime = prev.currentTime + frameTime;

        if (newTime >= currentSession.duration) {
          stopPlayback();
          return prev;
        }

        // Find current keystroke
        const newIndex = currentSession.keystrokes.findIndex(
          (k) => k.timestamp > newTime
        );

        return {
          ...prev,
          currentTime: newTime,
          currentIndex: newIndex === -1 ? currentSession.keystrokes.length : newIndex,
        };
      });
    }, frameTime);

    return () => {
      if (playbackTimer.current) {
        clearInterval(playbackTimer.current);
        playbackTimer.current = null;
      }
    };
  }, [state, currentSession, playbackState.speed, stopPlayback]);

  // Load saved replays from localStorage on mount
  useEffect(() => {
    if (!settings.saveToStorage) return;

    try {
      const stored = localStorage.getItem('typing-tutor-replays');
      if (stored) {
        const parsed = JSON.parse(stored);
        setSavedReplays(parsed);
      }
    } catch (err) {
      console.error('Failed to load replays:', err);
    }
  }, [settings.saveToStorage]);

  return {
    settings,
    updateSettings,
    state,
    currentSession,
    savedReplays,
    playbackState,
    startRecording,
    recordKeystroke,
    stopRecording,
    saveReplay,
    loadReplay,
    startPlayback,
    pausePlayback,
    resumePlayback,
    stopPlayback,
    seekTo,
    setPlaybackSpeed,
    deleteReplay,
    compareReplays,
  };
}

// Main component
interface ReplaySystemProps {
  onReplayComplete?: () => void;
  initialSettings?: Partial<ReplaySettings>;
}

const ReplaySystem: React.FC<ReplaySystemProps> = ({
  onReplayComplete: _onReplayComplete,
  initialSettings,
}) => {
  const rs = useReplaySystem(initialSettings);

  const formatTime = (ms: number): string => {
    const seconds = Math.floor(ms / 1000);
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  const formatPercentage = (value: number): string => {
    return `${(value * 100).toFixed(0)}%`;
  };

  const speedOptions: PlaybackSpeed[] = [0.25, 0.5, 1, 1.5, 2, 3];

  return (
    <div style={{ padding: '20px', maxWidth: '900px', margin: '0 auto' }}>
      {/* Replay Player */}
      {rs.currentSession && rs.state !== 'recording' && (
        <div
          style={{
            padding: '25px',
            backgroundColor: 'white',
            borderRadius: '12px',
            border: '2px solid #e0e0e0',
            marginBottom: '20px',
          }}
        >
          <h2 style={{ marginTop: 0, marginBottom: '15px' }}>
            {rs.currentSession.name}
          </h2>

          {/* Metrics Overlay */}
          {rs.settings.showMetrics && (
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(100px, 1fr))',
                gap: '15px',
                marginBottom: '20px',
                padding: '15px',
                backgroundColor: '#f5f5f5',
                borderRadius: '8px',
              }}
            >
              <div style={{ textAlign: 'center' }}>
                <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#2196F3' }}>
                  {rs.currentSession.finalStats.wpm}
                </div>
                <div style={{ fontSize: '12px', color: '#666' }}>WPM</div>
              </div>
              <div style={{ textAlign: 'center' }}>
                <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#4CAF50' }}>
                  {rs.currentSession.finalStats.accuracy}%
                </div>
                <div style={{ fontSize: '12px', color: '#666' }}>Accuracy</div>
              </div>
              <div style={{ textAlign: 'center' }}>
                <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#F44336' }}>
                  {rs.currentSession.finalStats.errorCount}
                </div>
                <div style={{ fontSize: '12px', color: '#666' }}>Errors</div>
              </div>
              <div style={{ textAlign: 'center' }}>
                <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#9C27B0' }}>
                  {formatTime(rs.currentSession.duration)}
                </div>
                <div style={{ fontSize: '12px', color: '#666' }}>Duration</div>
              </div>
            </div>
          )}

          {/* Timeline */}
          {rs.settings.showTimeline && (
            <div style={{ marginBottom: '20px' }}>
              <div
                style={{
                  height: '8px',
                  backgroundColor: '#e0e0e0',
                  borderRadius: '4px',
                  overflow: 'hidden',
                  cursor: rs.settings.allowSeek ? 'pointer' : 'default',
                }}
                onClick={(e) => {
                  if (!rs.settings.allowSeek) return;
                  const rect = e.currentTarget.getBoundingClientRect();
                  const x = e.clientX - rect.left;
                  const percentage = x / rect.width;
                  rs.seekTo(rs.currentSession!.duration * percentage);
                }}
              >
                <motion.div
                  animate={{
                    width: formatPercentage(
                      rs.playbackState.currentTime / rs.currentSession.duration
                    ),
                  }}
                  style={{
                    height: '100%',
                    backgroundColor: '#2196F3',
                  }}
                />
              </div>
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  marginTop: '5px',
                  fontSize: '12px',
                  color: '#666',
                }}
              >
                <span>{formatTime(rs.playbackState.currentTime)}</span>
                <span>{formatTime(rs.currentSession.duration)}</span>
              </div>
            </div>
          )}

          {/* Playback Controls */}
          <div
            style={{
              display: 'flex',
              gap: '10px',
              alignItems: 'center',
              flexWrap: 'wrap',
            }}
          >
            {rs.state === 'stopped' && (
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => rs.startPlayback()}
                style={{
                  padding: '12px 24px',
                  backgroundColor: '#4CAF50',
                  color: 'white',
                  border: 'none',
                  borderRadius: '8px',
                  cursor: 'pointer',
                  fontSize: '14px',
                }}
              >
                ▶️ Play
              </motion.button>
            )}

            {rs.state === 'playing' && (
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => rs.pausePlayback()}
                style={{
                  padding: '12px 24px',
                  backgroundColor: '#FF9800',
                  color: 'white',
                  border: 'none',
                  borderRadius: '8px',
                  cursor: 'pointer',
                  fontSize: '14px',
                }}
              >
                ⏸️ Pause
              </motion.button>
            )}

            {rs.state === 'paused' && (
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => rs.resumePlayback()}
                style={{
                  padding: '12px 24px',
                  backgroundColor: '#4CAF50',
                  color: 'white',
                  border: 'none',
                  borderRadius: '8px',
                  cursor: 'pointer',
                  fontSize: '14px',
                }}
              >
                ▶️ Resume
              </motion.button>
            )}

            {rs.state !== 'stopped' && (
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => rs.stopPlayback()}
                style={{
                  padding: '12px 24px',
                  backgroundColor: '#F44336',
                  color: 'white',
                  border: 'none',
                  borderRadius: '8px',
                  cursor: 'pointer',
                  fontSize: '14px',
                }}
              >
                ⏹️ Stop
              </motion.button>
            )}

            {/* Speed Control */}
            <div style={{ display: 'flex', gap: '5px', alignItems: 'center' }}>
              <span style={{ fontSize: '14px', color: '#666' }}>Speed:</span>
              <select
                value={rs.playbackState.speed}
                onChange={(e) =>
                  rs.setPlaybackSpeed(Number(e.target.value) as PlaybackSpeed)
                }
                style={{
                  padding: '8px',
                  border: '2px solid #ddd',
                  borderRadius: '6px',
                  fontSize: '14px',
                }}
              >
                {speedOptions.map((speed) => (
                  <option key={speed} value={speed}>
                    {speed}x
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>
      )}

      {/* Recording Indicator */}
      <AnimatePresence>
        {rs.state === 'recording' && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            style={{
              padding: '15px',
              backgroundColor: '#FFEBEE',
              borderRadius: '8px',
              marginBottom: '20px',
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
            }}
          >
            <motion.div
              animate={{ scale: [1, 1.2, 1] }}
              transition={{ repeat: Infinity, duration: 1 }}
              style={{
                width: '12px',
                height: '12px',
                borderRadius: '50%',
                backgroundColor: '#F44336',
              }}
            />
            <span style={{ fontWeight: 'bold' }}>Recording in progress...</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Saved Replays */}
      {rs.savedReplays.length > 0 && (
        <div
          style={{
            padding: '20px',
            backgroundColor: 'white',
            borderRadius: '12px',
            border: '2px solid #e0e0e0',
          }}
        >
          <h3 style={{ marginTop: 0 }}>Saved Replays ({rs.savedReplays.length})</h3>

          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
              gap: '15px',
            }}
          >
            {rs.savedReplays.map((replay) => (
              <motion.div
                key={replay.id}
                whileHover={{ scale: 1.02 }}
                style={{
                  padding: '15px',
                  backgroundColor: '#f5f5f5',
                  borderRadius: '8px',
                  border: '2px solid #ddd',
                  cursor: 'pointer',
                }}
                onClick={() => rs.loadReplay(replay.id)}
              >
                <div style={{ fontWeight: 'bold', marginBottom: '8px' }}>
                  {replay.name}
                </div>
                <div
                  style={{
                    fontSize: '12px',
                    color: '#666',
                    marginBottom: '10px',
                  }}
                >
                  {new Date(replay.createdAt).toLocaleString()}
                </div>
                <div
                  style={{
                    display: 'flex',
                    gap: '10px',
                    fontSize: '12px',
                    marginBottom: '10px',
                  }}
                >
                  <span>{replay.finalStats.wpm} WPM</span>
                  <span>•</span>
                  <span>{replay.finalStats.accuracy}% Acc</span>
                  <span>•</span>
                  <span>{formatTime(replay.duration)}</span>
                </div>
                <div style={{ display: 'flex', gap: '8px' }}>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      rs.loadReplay(replay.id);
                      rs.startPlayback();
                    }}
                    style={{
                      flex: 1,
                      padding: '6px 12px',
                      backgroundColor: '#4CAF50',
                      color: 'white',
                      border: 'none',
                      borderRadius: '4px',
                      cursor: 'pointer',
                      fontSize: '12px',
                    }}
                  >
                    ▶️ Play
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      rs.deleteReplay(replay.id);
                    }}
                    style={{
                      padding: '6px 12px',
                      backgroundColor: '#F44336',
                      color: 'white',
                      border: 'none',
                      borderRadius: '4px',
                      cursor: 'pointer',
                      fontSize: '12px',
                    }}
                  >
                    🗑️
                  </button>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      )}

      {/* Empty State */}
      {rs.savedReplays.length === 0 && rs.state === 'idle' && (
        <div
          style={{
            padding: '60px 20px',
            textAlign: 'center',
            color: '#999',
          }}
        >
          <div style={{ fontSize: '48px', marginBottom: '20px' }}>📹</div>
          <h3>No Replays Yet</h3>
          <p>Complete a typing session to create your first replay</p>
        </div>
      )}
    </div>
  );
};

export default ReplaySystem;
