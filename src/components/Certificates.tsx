/**
 * Certificates Component
 * Step 220 - Create achievement certificates and awards
 */

import { motion, AnimatePresence } from 'framer-motion';
import { useState, useRef } from 'react';
import { useSettingsStore } from '../store/useSettingsStore';

// Certificate interface
export interface Certificate {
  id: string;
  title: string;
  description: string;
  type: 'completion' | 'achievement' | 'mastery' | 'special';
  earnedDate: Date;
  recipientName: string;
  stats?: {
    label: string;
    value: string;
  }[];
  signature: string;
  certificateNumber: string;
}

// Certificate types configuration
const CERTIFICATE_TYPES = {
  completion: {
    label: 'Course Completion',
    color: 'from-blue-400 to-blue-600',
    icon: '📜',
    border: 'border-blue-500',
  },
  achievement: {
    label: 'Achievement',
    color: 'from-green-400 to-green-600',
    icon: '🏆',
    border: 'border-green-500',
  },
  mastery: {
    label: 'Mastery',
    color: 'from-purple-500 to-pink-600',
    icon: '⭐',
    border: 'border-purple-500',
  },
  special: {
    label: 'Special Recognition',
    color: 'from-yellow-400 to-orange-500',
    icon: '👑',
    border: 'border-yellow-500',
  },
};

// Predefined certificate templates
const CERTIFICATE_TEMPLATES: Omit<Certificate, 'id' | 'earnedDate' | 'recipientName' | 'certificateNumber'>[] = [
  {
    title: 'Touch Typing Fundamentals',
    description: 'Successfully completed the touch typing fundamentals course',
    type: 'completion',
    stats: [
      { label: 'Lessons Completed', value: '20' },
      { label: 'Average Accuracy', value: '95%' },
      { label: 'Final Speed', value: '40 WPM' },
    ],
    signature: 'Autism Typing Tutor',
  },
  {
    title: 'Speed Typing Master',
    description: 'Achieved exceptional typing speed',
    type: 'achievement',
    stats: [
      { label: 'Peak Speed', value: '80 WPM' },
      { label: 'Accuracy Maintained', value: '98%' },
    ],
    signature: 'Autism Typing Tutor',
  },
  {
    title: 'Perfect Accuracy Award',
    description: 'Demonstrated flawless typing accuracy',
    type: 'achievement',
    stats: [
      { label: 'Accuracy Rate', value: '100%' },
      { label: 'Lessons Perfect', value: '10' },
    ],
    signature: 'Autism Typing Tutor',
  },
  {
    title: 'Typing Mastery',
    description: 'Mastered all typing skills and techniques',
    type: 'mastery',
    stats: [
      { label: 'All Lessons', value: '100%' },
      { label: 'Speed Achievement', value: '60+ WPM' },
      { label: 'Accuracy', value: '99%' },
      { label: 'Practice Days', value: '100+' },
    ],
    signature: 'Autism Typing Tutor',
  },
  {
    title: 'Dedicated Learner',
    description: 'Showed exceptional dedication and persistence',
    type: 'special',
    stats: [
      { label: 'Practice Streak', value: '100 days' },
      { label: 'Total Practice Time', value: '50 hours' },
    ],
    signature: 'Autism Typing Tutor',
  },
  {
    title: '100-Day Streak Champion',
    description: 'Practiced typing for 100 consecutive days',
    type: 'special',
    stats: [
      { label: 'Streak Length', value: '100 days' },
      { label: 'Longest Streak', value: '100 days' },
    ],
    signature: 'Autism Typing Tutor',
  },
];

// Custom hook for certificates
export function useCertificates() {
  const [certificates, setCertificates] = useState<Certificate[]>([]);
  const [showCelebration, setShowCelebration] = useState(false);
  const [earnedCertificate, setEarnedCertificate] = useState<Certificate | null>(null);

  const generateCertificateNumber = () => {
    const timestamp = Date.now();
    const random = Math.floor(Math.random() * 10000);
    return `ATT-${timestamp}-${random}`;
  };

  const awardCertificate = (
    templateIndex: number,
    recipientName: string,
    customStats?: Certificate['stats']
  ) => {
    const template = CERTIFICATE_TEMPLATES[templateIndex];
    if (!template) return null;

    const certificate: Certificate = {
      id: Date.now().toString(),
      ...template,
      stats: customStats || template.stats,
      earnedDate: new Date(),
      recipientName,
      certificateNumber: generateCertificateNumber(),
    };

    setCertificates((prev) => [...prev, certificate]);
    setEarnedCertificate(certificate);
    setShowCelebration(true);
    setTimeout(() => setShowCelebration(false), 6000);

    return certificate;
  };

  const deleteCertificate = (id: string) => {
    setCertificates((prev) => prev.filter((c) => c.id !== id));
  };

  const getCertificatesByType = (type: Certificate['type']) => {
    return certificates.filter((c) => c.type === type);
  };

  return {
    certificates,
    awardCertificate,
    deleteCertificate,
    getCertificatesByType,
    showCelebration,
    earnedCertificate,
  };
}

// Main certificates component
export default function Certificates() {
  const {
    certificates,
    awardCertificate,
    deleteCertificate,
    showCelebration,
    earnedCertificate,
  } = useCertificates();

  const { settings } = useSettingsStore();
  const [selectedCertificate, setSelectedCertificate] = useState<Certificate | null>(null);
  const [recipientName, setRecipientName] = useState('');
  const [showAwardDialog, setShowAwardDialog] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState(0);

  const handleAwardCertificate = () => {
    if (!recipientName.trim()) {
      alert('Please enter a recipient name');
      return;
    }

    awardCertificate(selectedTemplate, recipientName);
    setRecipientName('');
    setShowAwardDialog(false);
  };

  return (
    <div className="bg-white rounded-2xl shadow-xl p-8">
      <h2 className="text-2xl font-bold text-gray-800 mb-6 text-center">
        📜 Certificates & Awards
      </h2>

      {/* Certificate earned celebration */}
      <AnimatePresence>
        {showCelebration && earnedCertificate && (
          <motion.div
            initial={{ opacity: 0, scale: 0.5 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.5 }}
            className="fixed inset-0 flex items-center justify-center z-50 bg-black bg-opacity-70 p-4"
          >
            <div className={`bg-gradient-to-r ${CERTIFICATE_TYPES[earnedCertificate.type].color} rounded-3xl p-12 shadow-2xl text-center max-w-2xl text-white`}>
              <motion.div
                animate={{
                  scale: [1, 1.2, 1],
                  rotate: [0, 5, -5, 0],
                }}
                transition={{ duration: 1 }}
                className="text-9xl mb-6"
              >
                {CERTIFICATE_TYPES[earnedCertificate.type].icon}
              </motion.div>
              <div className="text-5xl font-bold mb-4">
                Certificate Earned!
              </div>
              <div className="text-3xl mb-2">{earnedCertificate.title}</div>
              <div className="text-xl opacity-90 mb-6">
                {earnedCertificate.description}
              </div>
              <div className="text-lg bg-white bg-opacity-20 rounded-lg py-3 px-6 inline-block">
                Click to view and download
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Certificate detail modal */}
      <AnimatePresence>
        {selectedCertificate && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedCertificate(null)}
              className="fixed inset-0 bg-black bg-opacity-70 z-40"
            />
            <div className="fixed inset-0 flex items-center justify-center z-50 p-4">
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto"
              >
                <CertificateView
                  certificate={selectedCertificate}
                  onClose={() => setSelectedCertificate(null)}
                  onDelete={() => {
                    deleteCertificate(selectedCertificate.id);
                    setSelectedCertificate(null);
                  }}
                />
              </motion.div>
            </div>
          </>
        )}
      </AnimatePresence>

      {/* Award dialog */}
      <AnimatePresence>
        {showAwardDialog && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowAwardDialog(false)}
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
                  Award Certificate
                </h3>

                <div className="mb-4">
                  <label className="block text-sm font-bold text-gray-700 mb-2">
                    Recipient Name:
                  </label>
                  <input
                    type="text"
                    value={recipientName}
                    onChange={(e) => setRecipientName(e.target.value)}
                    placeholder="Enter name"
                    className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-primary-500 focus:outline-none"
                  />
                </div>

                <div className="mb-6">
                  <label className="block text-sm font-bold text-gray-700 mb-2">
                    Certificate Type:
                  </label>
                  <div className="space-y-2">
                    {CERTIFICATE_TEMPLATES.map((template, index) => (
                      <button
                        key={index}
                        onClick={() => setSelectedTemplate(index)}
                        className={`w-full text-left p-3 rounded-lg transition-all ${
                          selectedTemplate === index
                            ? 'bg-primary-500 text-white'
                            : 'bg-gray-100 text-gray-900 hover:bg-gray-200'
                        }`}
                      >
                        <div className="font-bold">{template.title}</div>
                        <div className={`text-sm ${
                          selectedTemplate === index ? 'text-white opacity-90' : 'text-gray-600'
                        }`}>
                          {template.description}
                        </div>
                      </button>
                    ))}
                  </div>
                </div>

                <div className="flex gap-3">
                  <button
                    onClick={handleAwardCertificate}
                    className="flex-1 py-3 bg-primary-500 text-white rounded-lg font-bold hover:bg-primary-600 transition-colors"
                  >
                    Award Certificate
                  </button>
                  <button
                    onClick={() => setShowAwardDialog(false)}
                    className="px-6 py-3 bg-gray-200 text-gray-700 rounded-lg font-bold hover:bg-gray-300 transition-colors"
                  >
                    Cancel
                  </button>
                </div>
              </motion.div>
            </div>
          </>
        )}
      </AnimatePresence>

      {/* Award new certificate */}
      <div className="mb-8 bg-gradient-to-r from-purple-50 to-pink-50 rounded-xl p-6">
        <h3 className="text-lg font-bold text-purple-900 mb-3">
          Award New Certificate
        </h3>
        <p className="text-purple-800 mb-4">
          Create and award certificates for achievements and milestones
        </p>
        <button
          onClick={() => setShowAwardDialog(true)}
          className="w-full py-4 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-xl font-bold text-lg hover:from-purple-600 hover:to-pink-600 transition-all shadow-lg"
        >
          📜 Create Certificate
        </button>
      </div>

      {/* Certificates collection */}
      {certificates.length > 0 ? (
        <div>
          <h3 className="text-lg font-bold text-gray-900 mb-4">
            Your Certificates ({certificates.length})
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {certificates.map((certificate, index) => (
              <CertificateCard
                key={certificate.id}
                certificate={certificate}
                index={index}
                onClick={() => setSelectedCertificate(certificate)}
                settings={settings}
              />
            ))}
          </div>
        </div>
      ) : (
        <div className="text-center text-gray-500 py-12">
          <div className="text-6xl mb-4">📜</div>
          <div className="text-xl font-bold mb-2">No certificates yet</div>
          <div>Complete achievements to earn certificates!</div>
        </div>
      )}

      <div className="mt-8 bg-blue-50 rounded-xl p-6">
        <h3 className="text-lg font-bold text-blue-900 mb-3">
          About Certificates
        </h3>
        <ul className="space-y-2 text-sm text-blue-800">
          <li>• Earn certificates for completing milestones</li>
          <li>• Download and print your certificates</li>
          <li>• Share your achievements with family and friends</li>
          <li>• Collect all certificate types</li>
          <li>• Each certificate has a unique number</li>
        </ul>
      </div>
    </div>
  );
}

// Certificate card component
function CertificateCard({
  certificate,
  index,
  onClick,
  settings,
}: {
  certificate: Certificate;
  index: number;
  onClick: () => void;
  settings: any;
}) {
  const typeConfig = CERTIFICATE_TYPES[certificate.type];

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ delay: settings.reducedMotion ? 0 : index * 0.05 }}
      whileHover={{ scale: settings.reducedMotion ? 1 : 1.03, y: -5 }}
      onClick={onClick}
      className={`bg-gradient-to-br ${typeConfig.color} rounded-xl p-6 cursor-pointer shadow-lg text-white`}
    >
      <div className="text-center mb-4">
        <div className="text-5xl mb-3">{typeConfig.icon}</div>
        <div className="text-sm opacity-90 mb-1">{typeConfig.label}</div>
        <div className="text-xl font-bold mb-2">{certificate.title}</div>
        <div className="text-sm opacity-90">{certificate.recipientName}</div>
      </div>

      <div className="bg-white bg-opacity-20 rounded-lg p-3 text-sm">
        <div className="opacity-90 mb-1">Earned on:</div>
        <div className="font-bold">
          {certificate.earnedDate.toLocaleDateString()}
        </div>
      </div>
    </motion.div>
  );
}

// Certificate view component
function CertificateView({
  certificate,
  onClose,
  onDelete,
}: {
  certificate: Certificate;
  onClose: () => void;
  onDelete: () => void;
}) {
  const certificateRef = useRef<HTMLDivElement>(null);
  const typeConfig = CERTIFICATE_TYPES[certificate.type];

  const handleDownload = () => {
    // In a real app, this would generate a PDF or image
    alert('Download feature would be implemented here');
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div>
      {/* Certificate content */}
      <div
        ref={certificateRef}
        className={`p-12 bg-gradient-to-br ${typeConfig.color} text-white`}
      >
        <div className={`border-8 ${typeConfig.border} border-double rounded-2xl p-12 bg-white bg-opacity-10`}>
          {/* Header */}
          <div className="text-center mb-8">
            <div className="text-7xl mb-4">{typeConfig.icon}</div>
            <div className="text-5xl font-bold mb-2">Certificate of {typeConfig.label}</div>
            <div className="text-xl opacity-90">Autism Typing Tutor</div>
          </div>

          {/* Main content */}
          <div className="text-center mb-8">
            <div className="text-2xl mb-4">This is to certify that</div>
            <div className="text-6xl font-bold mb-6 py-4 border-b-4 border-white border-opacity-30">
              {certificate.recipientName}
            </div>
            <div className="text-3xl mb-4">{certificate.title}</div>
            <div className="text-xl opacity-90 mb-8">{certificate.description}</div>

            {/* Stats */}
            {certificate.stats && certificate.stats.length > 0 && (
              <div className="bg-white bg-opacity-10 rounded-xl p-6 mb-8">
                <div className="grid grid-cols-2 gap-4">
                  {certificate.stats.map((stat, i) => (
                    <div key={i} className="text-center">
                      <div className="text-sm opacity-90 mb-1">{stat.label}</div>
                      <div className="text-2xl font-bold">{stat.value}</div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="flex justify-between items-end">
            <div className="text-center">
              <div className="text-lg opacity-90 mb-2">Date Awarded</div>
              <div className="text-xl font-bold border-t-2 border-white border-opacity-30 pt-2">
                {certificate.earnedDate.toLocaleDateString()}
              </div>
            </div>

            <div className="text-center">
              <div className="text-lg opacity-90 mb-2">Signature</div>
              <div className="text-2xl font-bold border-t-2 border-white border-opacity-30 pt-2"
                style={{ fontFamily: 'cursive' }}
              >
                {certificate.signature}
              </div>
            </div>

            <div className="text-center">
              <div className="text-lg opacity-90 mb-2">Certificate No.</div>
              <div className="text-sm font-bold border-t-2 border-white border-opacity-30 pt-2">
                {certificate.certificateNumber}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Actions */}
      <div className="p-6 bg-gray-50 flex gap-3">
        <button
          onClick={handleDownload}
          className="flex-1 py-3 bg-green-500 text-white rounded-lg font-bold hover:bg-green-600 transition-colors"
        >
          📥 Download
        </button>
        <button
          onClick={handlePrint}
          className="flex-1 py-3 bg-blue-500 text-white rounded-lg font-bold hover:bg-blue-600 transition-colors"
        >
          🖨️ Print
        </button>
        <button
          onClick={onClose}
          className="flex-1 py-3 bg-gray-200 text-gray-700 rounded-lg font-bold hover:bg-gray-300 transition-colors"
        >
          Close
        </button>
        <button
          onClick={() => {
            if (confirm('Delete this certificate?')) {
              onDelete();
            }
          }}
          className="px-6 py-3 bg-red-100 text-red-700 rounded-lg font-bold hover:bg-red-200 transition-colors"
        >
          🗑️
        </button>
      </div>
    </div>
  );
}
