import React, { useState, useCallback, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

// Types
export type CollaborationMode =
  | 'co-writing' // Write stories together
  | 'typing-race' // Race against each other
  | 'relay-typing' // Take turns typing
  | 'peer-review' // Review each other's work
  | 'group-practice' // Practice together in a group
  | 'mentorship'; // One-on-one mentoring session

export type ParticipantRole = 'host' | 'participant' | 'mentor' | 'mentee' | 'observer';

export type SessionStatus = 'waiting' | 'active' | 'paused' | 'completed' | 'canceled';

export interface Participant {
  id: string;
  name: string;
  role: ParticipantRole;
  isOnline: boolean;
  avatar?: string;
  stats: {
    currentWPM: number;
    currentAccuracy: number;
    contributedWords: number;
    sessionTime: number;
  };
  preferences: {
    needsBreaks: boolean;
    typingSpeed: 'slow' | 'medium' | 'fast';
    communicationPreference: 'text' | 'minimal' | 'active';
  };
}

export interface CollaborationSession {
  id: string;
  name: string;
  mode: CollaborationMode;
  status: SessionStatus;
  hostId: string;
  participants: Participant[];
  maxParticipants: number;
  createdAt: Date;
  startedAt?: Date;
  endedAt?: Date;
  content: {
    currentText: string;
    contributions: Contribution[];
    targetWordCount?: number;
    completionPercentage: number;
  };
  settings: CollaborationSettings;
  isPublic: boolean;
  inviteCode?: string;
  tags: string[];
}

export interface Contribution {
  id: string;
  participantId: string;
  participantName: string;
  text: string;
  timestamp: Date;
  startPosition: number;
  endPosition: number;
  stats: {
    wpm: number;
    accuracy: number;
    timeSpent: number;
  };
}

export interface CollaborationSettings {
  allowSpectators: boolean;
  requireApproval: boolean;
  enableChat: boolean;
  enableVoice: boolean;
  showTypingIndicators: boolean;
  showParticipantStats: boolean;
  autoSaveInterval: number; // seconds
  breakReminders: boolean;
  accessibilityMode: boolean;
  turnDuration?: number; // For relay mode, seconds per turn
  raceCountdown?: number; // For race mode, countdown before start
}

export interface ChatMessage {
  id: string;
  participantId: string;
  participantName: string;
  message: string;
  timestamp: Date;
  type: 'text' | 'system' | 'emoji';
}

export interface CollaborationInvite {
  id: string;
  sessionId: string;
  sessionName: string;
  inviterName: string;
  inviteCode: string;
  expiresAt: Date;
  maxUses: number;
  currentUses: number;
}

export interface CollaborationSystemSettings {
  enableCollaboration: boolean;
  defaultMaxParticipants: number;
  allowPublicSessions: boolean;
  requireAuthentication: boolean;
  enableNotifications: boolean;
  autoJoinInvites: boolean;
  showOnlineStatus: boolean;
}

interface CollaborationSystemProps {
  currentUserId: string;
  currentUserName: string;
  onSessionJoin?: (session: CollaborationSession) => void;
  onSessionLeave?: (sessionId: string) => void;
  onContribution?: (contribution: Contribution) => void;
  settings?: Partial<CollaborationSystemSettings>;
}

const defaultCollaborationSettings: CollaborationSettings = {
  allowSpectators: true,
  requireApproval: false,
  enableChat: true,
  enableVoice: false,
  showTypingIndicators: true,
  showParticipantStats: true,
  autoSaveInterval: 30,
  breakReminders: true,
  accessibilityMode: true,
};

const defaultSystemSettings: CollaborationSystemSettings = {
  enableCollaboration: true,
  defaultMaxParticipants: 6,
  allowPublicSessions: true,
  requireAuthentication: false,
  enableNotifications: true,
  autoJoinInvites: false,
  showOnlineStatus: true,
};

export const useCollaborationSystem = (props: CollaborationSystemProps) => {
  const settings = { ...defaultSystemSettings, ...props.settings };

  // State
  const [sessions, setSessions] = useState<CollaborationSession[]>([]);
  const [currentSession, setCurrentSession] = useState<CollaborationSession | null>(null);
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [invites, setInvites] = useState<CollaborationInvite[]>([]);
  const [isTyping, setIsTyping] = useState<Record<string, boolean>>({});

  // Load sessions from localStorage
  useEffect(() => {
    try {
      const saved = localStorage.getItem('typing-tutor-collaboration-sessions');
      if (saved) {
        const data = JSON.parse(saved);
        setSessions(data.sessions || []);
      }
    } catch (err) {
      console.error('Failed to load collaboration sessions:', err);
    }
  }, []);

  // Auto-save sessions
  useEffect(() => {
    try {
      const data = { sessions: sessions.slice(-20) }; // Keep last 20 sessions
      localStorage.setItem('typing-tutor-collaboration-sessions', JSON.stringify(data));
    } catch (err) {
      console.error('Failed to save collaboration sessions:', err);
    }
  }, [sessions]);

  // Generate invite code
  const generateInviteCode = useCallback((): string => {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
    let code = '';
    for (let i = 0; i < 6; i++) {
      code += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return code;
  }, []);

  // Create new session
  const createSession = useCallback(
    (
      name: string,
      mode: CollaborationMode,
      options?: {
        maxParticipants?: number;
        isPublic?: boolean;
        settings?: Partial<CollaborationSettings>;
        tags?: string[];
      }
    ): CollaborationSession => {
      const sessionSettings = { ...defaultCollaborationSettings, ...options?.settings };

      const inviteCode = !options?.isPublic ? generateInviteCode() : undefined;

      const hostParticipant: Participant = {
        id: props.currentUserId,
        name: props.currentUserName,
        role: 'host',
        isOnline: true,
        stats: {
          currentWPM: 0,
          currentAccuracy: 100,
          contributedWords: 0,
          sessionTime: 0,
        },
        preferences: {
          needsBreaks: false,
          typingSpeed: 'medium',
          communicationPreference: 'text',
        },
      };

      const session: CollaborationSession = {
        id: `session-${Date.now()}`,
        name,
        mode,
        status: 'waiting',
        hostId: props.currentUserId,
        participants: [hostParticipant],
        maxParticipants: options?.maxParticipants || settings.defaultMaxParticipants,
        createdAt: new Date(),
        content: {
          currentText: '',
          contributions: [],
          completionPercentage: 0,
        },
        settings: sessionSettings,
        isPublic: options?.isPublic ?? settings.allowPublicSessions,
        inviteCode,
        tags: options?.tags || [],
      };

      setSessions((prev) => [...prev, session]);
      setCurrentSession(session);

      return session;
    },
    [
      props.currentUserId,
      props.currentUserName,
      settings.defaultMaxParticipants,
      settings.allowPublicSessions,
      generateInviteCode,
    ]
  );

  // Join session
  const joinSession = useCallback(
    (sessionId: string, inviteCode?: string): boolean => {
      const session = sessions.find((s) => s.id === sessionId);
      if (!session) {
        console.warn('Session not found');
        return false;
      }

      // Check if session requires invite code
      if (!session.isPublic && session.inviteCode !== inviteCode) {
        console.warn('Invalid invite code');
        return false;
      }

      // Check if session is full
      if (session.participants.length >= session.maxParticipants) {
        console.warn('Session is full');
        return false;
      }

      // Check if already in session
      if (session.participants.some((p) => p.id === props.currentUserId)) {
        setCurrentSession(session);
        return true;
      }

      const newParticipant: Participant = {
        id: props.currentUserId,
        name: props.currentUserName,
        role: 'participant',
        isOnline: true,
        stats: {
          currentWPM: 0,
          currentAccuracy: 100,
          contributedWords: 0,
          sessionTime: 0,
        },
        preferences: {
          needsBreaks: false,
          typingSpeed: 'medium',
          communicationPreference: 'text',
        },
      };

      const updatedSession = {
        ...session,
        participants: [...session.participants, newParticipant],
      };

      setSessions((prev) =>
        prev.map((s) => (s.id === sessionId ? updatedSession : s))
      );
      setCurrentSession(updatedSession);

      props.onSessionJoin?.(updatedSession);

      return true;
    },
    [sessions, props]
  );

  // Leave session
  const leaveSession = useCallback(
    (sessionId: string): boolean => {
      const session = sessions.find((s) => s.id === sessionId);
      if (!session) return false;

      const isHost = session.hostId === props.currentUserId;

      if (isHost) {
        // If host leaves, end session or transfer host
        const updatedSession = {
          ...session,
          status: 'completed' as SessionStatus,
          endedAt: new Date(),
        };

        setSessions((prev) =>
          prev.map((s) => (s.id === sessionId ? updatedSession : s))
        );
      } else {
        // Remove participant
        const updatedSession = {
          ...session,
          participants: session.participants.filter((p) => p.id !== props.currentUserId),
        };

        setSessions((prev) =>
          prev.map((s) => (s.id === sessionId ? updatedSession : s))
        );
      }

      if (currentSession?.id === sessionId) {
        setCurrentSession(null);
      }

      props.onSessionLeave?.(sessionId);

      return true;
    },
    [sessions, currentSession, props]
  );

  // Start session
  const startSession = useCallback(
    (sessionId: string): boolean => {
      const session = sessions.find((s) => s.id === sessionId);
      if (!session || session.hostId !== props.currentUserId) {
        return false;
      }

      const updatedSession = {
        ...session,
        status: 'active' as SessionStatus,
        startedAt: new Date(),
      };

      setSessions((prev) =>
        prev.map((s) => (s.id === sessionId ? updatedSession : s))
      );
      setCurrentSession(updatedSession);

      return true;
    },
    [sessions, props.currentUserId]
  );

  // Add contribution
  const addContribution = useCallback(
    (text: string, stats: { wpm: number; accuracy: number; timeSpent: number }): boolean => {
      if (!currentSession) return false;

      const contribution: Contribution = {
        id: `contrib-${Date.now()}`,
        participantId: props.currentUserId,
        participantName: props.currentUserName,
        text,
        timestamp: new Date(),
        startPosition: currentSession.content.currentText.length,
        endPosition: currentSession.content.currentText.length + text.length,
        stats,
      };

      const updatedSession = {
        ...currentSession,
        content: {
          ...currentSession.content,
          currentText: currentSession.content.currentText + text,
          contributions: [...currentSession.content.contributions, contribution],
          completionPercentage: currentSession.content.targetWordCount
            ? Math.min(
                100,
                ((currentSession.content.currentText.length + text.length) /
                  currentSession.content.targetWordCount) *
                  100
              )
            : 0,
        },
        participants: currentSession.participants.map((p) =>
          p.id === props.currentUserId
            ? {
                ...p,
                stats: {
                  ...p.stats,
                  currentWPM: stats.wpm,
                  currentAccuracy: stats.accuracy,
                  contributedWords: p.stats.contributedWords + text.split(/\s+/).length,
                  sessionTime: p.stats.sessionTime + stats.timeSpent,
                },
              }
            : p
        ),
      };

      setSessions((prev) =>
        prev.map((s) => (s.id === currentSession.id ? updatedSession : s))
      );
      setCurrentSession(updatedSession);

      props.onContribution?.(contribution);

      return true;
    },
    [currentSession, props]
  );

  // Send chat message
  const sendChatMessage = useCallback(
    (message: string, type: 'text' | 'emoji' = 'text'): boolean => {
      if (!currentSession || !currentSession.settings.enableChat) {
        return false;
      }

      const chatMessage: ChatMessage = {
        id: `msg-${Date.now()}`,
        participantId: props.currentUserId,
        participantName: props.currentUserName,
        message,
        timestamp: new Date(),
        type,
      };

      setChatMessages((prev) => [...prev, chatMessage]);

      return true;
    },
    [currentSession, props.currentUserId, props.currentUserName]
  );

  // Set typing indicator
  const setTypingIndicator = useCallback(
    (isCurrentlyTyping: boolean) => {
      setIsTyping((prev) => ({
        ...prev,
        [props.currentUserId]: isCurrentlyTyping,
      }));

      // Auto-clear after 3 seconds
      if (isCurrentlyTyping) {
        setTimeout(() => {
          setIsTyping((prev) => ({
            ...prev,
            [props.currentUserId]: false,
          }));
        }, 3000);
      }
    },
    [props.currentUserId]
  );

  // Create invite
  const createInvite = useCallback(
    (sessionId: string, maxUses: number = 10, expiresInHours: number = 24): CollaborationInvite | null => {
      const session = sessions.find((s) => s.id === sessionId);
      if (!session || session.hostId !== props.currentUserId) {
        return null;
      }

      const invite: CollaborationInvite = {
        id: `invite-${Date.now()}`,
        sessionId,
        sessionName: session.name,
        inviterName: props.currentUserName,
        inviteCode: generateInviteCode(),
        expiresAt: new Date(Date.now() + expiresInHours * 60 * 60 * 1000),
        maxUses,
        currentUses: 0,
      };

      setInvites((prev) => [...prev, invite]);

      return invite;
    },
    [sessions, props.currentUserId, props.currentUserName, generateInviteCode]
  );

  // Get session statistics
  const getSessionStatistics = useCallback(
    (sessionId: string) => {
      const session = sessions.find((s) => s.id === sessionId);
      if (!session) return null;

      const totalWords = session.content.currentText.split(/\s+/).length;
      const totalContributions = session.content.contributions.length;
      const avgWPM =
        session.participants.reduce((sum, p) => sum + p.stats.currentWPM, 0) /
        session.participants.length;
      const avgAccuracy =
        session.participants.reduce((sum, p) => sum + p.stats.currentAccuracy, 0) /
        session.participants.length;

      return {
        totalWords,
        totalContributions,
        participantCount: session.participants.length,
        averageWPM: avgWPM,
        averageAccuracy: avgAccuracy,
        duration: session.startedAt
          ? (session.endedAt || new Date()).getTime() - session.startedAt.getTime()
          : 0,
        topContributor: session.participants.reduce((prev, current) =>
          current.stats.contributedWords > prev.stats.contributedWords ? current : prev
        , session.participants[0]),
      };
    },
    [sessions]
  );

  return {
    // State
    sessions,
    currentSession,
    chatMessages,
    invites,
    isTyping,
    settings,

    // Actions
    createSession,
    joinSession,
    leaveSession,
    startSession,
    addContribution,
    sendChatMessage,
    setTypingIndicator,
    createInvite,
    getSessionStatistics,
  };
};

// Example component
export const CollaborationSystemComponent: React.FC<CollaborationSystemProps> = (props) => {
  const {
    sessions,
    currentSession,
    chatMessages,
    createSession,
    joinSession,
    leaveSession,
    startSession,
    sendChatMessage,
  } = useCollaborationSystem(props);

  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newSessionName, setNewSessionName] = useState('');
  const [selectedMode, setSelectedMode] = useState<CollaborationMode>('co-writing');
  const [chatInput, setChatInput] = useState('');

  const handleCreateSession = useCallback(() => {
    if (!newSessionName.trim()) return;

    createSession(newSessionName, selectedMode, {
      isPublic: true,
      tags: ['typing-practice'],
    });

    setShowCreateModal(false);
    setNewSessionName('');
  }, [newSessionName, selectedMode, createSession]);

  const handleSendMessage = useCallback(() => {
    if (!chatInput.trim()) return;

    sendChatMessage(chatInput);
    setChatInput('');
  }, [chatInput, sendChatMessage]);

  const modes: { value: CollaborationMode; label: string; icon: string }[] = [
    { value: 'co-writing', label: 'Co-Writing', icon: '✍️' },
    { value: 'typing-race', label: 'Typing Race', icon: '🏁' },
    { value: 'relay-typing', label: 'Relay Typing', icon: '🔄' },
    { value: 'peer-review', label: 'Peer Review', icon: '📝' },
    { value: 'group-practice', label: 'Group Practice', icon: '👥' },
    { value: 'mentorship', label: 'Mentorship', icon: '🎓' },
  ];

  return (
    <div className="collaboration-system">
      <div className="collaboration-header">
        <h2>Collaborative Typing</h2>
        {!currentSession && (
          <button onClick={() => setShowCreateModal(true)} className="create-session-btn">
            + Create Session
          </button>
        )}
      </div>

      {!currentSession ? (
        <div className="sessions-list">
          <h3>Available Sessions</h3>
          {sessions
            .filter((s) => s.status === 'waiting' || s.status === 'active')
            .map((session) => (
              <motion.div
                key={session.id}
                className="session-card"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
              >
                <h4>{session.name}</h4>
                <p className="mode">{session.mode}</p>
                <p className="participants">
                  {session.participants.length}/{session.maxParticipants} participants
                </p>
                <div className="session-tags">
                  {session.tags.map((tag) => (
                    <span key={tag} className="tag">
                      {tag}
                    </span>
                  ))}
                </div>
                <button onClick={() => joinSession(session.id)} className="join-btn">
                  Join Session
                </button>
              </motion.div>
            ))}
        </div>
      ) : (
        <div className="active-session">
          <div className="session-info">
            <h3>{currentSession.name}</h3>
            <p className="status">{currentSession.status}</p>
            {currentSession.hostId === props.currentUserId && currentSession.status === 'waiting' && (
              <button onClick={() => startSession(currentSession.id)} className="start-btn">
                Start Session
              </button>
            )}
            <button onClick={() => leaveSession(currentSession.id)} className="leave-btn">
              Leave
            </button>
          </div>

          <div className="participants-list">
            <h4>Participants</h4>
            {currentSession.participants.map((participant) => (
              <div key={participant.id} className="participant">
                <span className={`status ${participant.isOnline ? 'online' : 'offline'}`}>●</span>
                <span className="name">{participant.name}</span>
                <span className="role">{participant.role}</span>
                {currentSession.settings.showParticipantStats && (
                  <span className="stats">
                    {participant.stats.currentWPM} WPM | {participant.stats.currentAccuracy}% acc
                  </span>
                )}
              </div>
            ))}
          </div>

          {currentSession.settings.enableChat && (
            <div className="chat-section">
              <div className="chat-messages">
                {chatMessages.map((msg) => (
                  <div key={msg.id} className={`message ${msg.type}`}>
                    <span className="sender">{msg.participantName}:</span>
                    <span className="text">{msg.message}</span>
                  </div>
                ))}
              </div>
              <div className="chat-input">
                <input
                  type="text"
                  value={chatInput}
                  onChange={(e) => setChatInput(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
                  placeholder="Type a message..."
                />
                <button onClick={handleSendMessage}>Send</button>
              </div>
            </div>
          )}
        </div>
      )}

      <AnimatePresence>
        {showCreateModal && (
          <motion.div
            className="create-session-modal"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div
              className="modal-content"
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
            >
              <h3>Create Collaboration Session</h3>

              <input
                type="text"
                value={newSessionName}
                onChange={(e) => setNewSessionName(e.target.value)}
                placeholder="Session name..."
              />

              <div className="mode-selector">
                {modes.map((mode) => (
                  <button
                    key={mode.value}
                    onClick={() => setSelectedMode(mode.value)}
                    className={`mode-btn ${selectedMode === mode.value ? 'selected' : ''}`}
                  >
                    <span className="icon">{mode.icon}</span>
                    <span className="label">{mode.label}</span>
                  </button>
                ))}
              </div>

              <div className="modal-actions">
                <button onClick={handleCreateSession} className="create-btn">
                  Create
                </button>
                <button onClick={() => setShowCreateModal(false)} className="cancel-btn">
                  Cancel
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default CollaborationSystemComponent;
