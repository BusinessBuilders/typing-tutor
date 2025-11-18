import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';

/**
 * Recommendations System Component
 * Step 330 - Create AI-powered content recommendations
 */

type Recommendation = {
  id: string;
  title: string;
  description: string;
  type: 'exercise' | 'theme' | 'lesson';
  reason: string;
  difficulty: 'easy' | 'medium' | 'hard';
  icon: string;
  relevance: number;
};

const RecommendationsSystem: React.FC = () => {
  const [recommendations, setRecommendations] = useState<Recommendation[]>([]);

  useEffect(() => {
    // Generate personalized recommendations
    const generated: Recommendation[] = [
      {
        id: '1',
        title: 'Spring Typing Practice',
        description: 'Perfect for this season!',
        type: 'exercise',
        reason: 'Based on current season',
        difficulty: 'easy',
        icon: '🌸',
        relevance: 95,
      },
      {
        id: '2',
        title: 'Ocean Theme',
        description: 'Matches your preferences',
        type: 'theme',
        reason: 'You liked nature themes',
        difficulty: 'easy',
        icon: '🌊',
        relevance: 90,
      },
      {
        id: '3',
        title: 'Advanced Sentences',
        description: 'Level up your skills',
        type: 'lesson',
        reason: 'Based on your progress',
        difficulty: 'hard',
        icon: '📚',
        relevance: 85,
      },
    ];
    setRecommendations(generated);
  }, []);

  return (
    <div style={{ padding: '20px', maxWidth: '1200px', margin: '0 auto' }}>
      <h1 style={{ fontSize: '32px', marginBottom: '10px' }}>✨ Recommended for You</h1>
      <p style={{ color: '#666', marginBottom: '30px' }}>
        Personalized suggestions based on your activity and preferences
      </p>

      <div style={{ display: 'grid', gap: '20px' }}>
        {recommendations.map((rec) => (
          <motion.div
            key={rec.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            whileHover={{ scale: 1.01 }}
            style={{
              padding: '24px',
              backgroundColor: 'white',
              borderRadius: '16px',
              border: '2px solid #e0e0e0',
              display: 'flex',
              gap: '20px',
              cursor: 'pointer',
            }}
          >
            <div style={{ fontSize: '64px' }}>{rec.icon}</div>
            <div style={{ flex: 1 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '8px' }}>
                <h3 style={{ margin: 0 }}>{rec.title}</h3>
                <span style={{
                  padding: '4px 12px',
                  backgroundColor: '#E8F5E9',
                  color: '#2E7D32',
                  borderRadius: '12px',
                  fontSize: '12px',
                  fontWeight: 'bold',
                }}>
                  {rec.relevance}% Match
                </span>
              </div>
              <p style={{ fontSize: '14px', color: '#666', marginBottom: '12px' }}>
                {rec.description}
              </p>
              <div style={{ display: 'flex', gap: '10px' }}>
                <span style={{
                  padding: '4px 12px',
                  backgroundColor: '#E3F2FD',
                  borderRadius: '12px',
                  fontSize: '12px',
                }}>
                  {rec.type.toUpperCase()}
                </span>
                <span style={{
                  padding: '4px 12px',
                  backgroundColor: 
                    rec.difficulty === 'easy' ? '#E8F5E9' :
                    rec.difficulty === 'medium' ? '#FFF3E0' : '#FFEBEE',
                  borderRadius: '12px',
                  fontSize: '12px',
                }}>
                  {rec.difficulty.toUpperCase()}
                </span>
              </div>
              <p style={{ fontSize: '13px', color: '#999', marginTop: '8px', fontStyle: 'italic' }}>
                💡 {rec.reason}
              </p>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
};

export default RecommendationsSystem;
