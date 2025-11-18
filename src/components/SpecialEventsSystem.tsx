import React, { useState } from 'react';
import { motion } from 'framer-motion';

/**
 * Special Events System Component
 * Step 326 - Add special events and celebrations
 */

type SpecialEvent = {
  id: string;
  title: string;
  description: string;
  date: Date;
  type: 'community' | 'achievement' | 'challenge' | 'update';
  icon: string;
  active: boolean;
};

const SpecialEventsSystem: React.FC = () => {
  const [events] = useState<SpecialEvent[]>([
    {
      id: '1',
      title: 'Typing Challenge Week',
      description: 'Complete daily challenges to earn special rewards',
      date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      type: 'challenge',
      icon: '🏆',
      active: true,
    },
    {
      id: '2',
      title: 'New Features Released',
      description: 'Check out our latest updates and improvements',
      date: new Date(),
      type: 'update',
      icon: '🎉',
      active: true,
    },
  ]);

  return (
    <div style={{ padding: '20px', maxWidth: '1200px', margin: '0 auto' }}>
      <h1 style={{ fontSize: '32px', marginBottom: '10px' }}>⭐ Special Events</h1>
      <p style={{ color: '#666', marginBottom: '30px' }}>Join community events and challenges</p>

      <div style={{ display: 'grid', gap: '20px' }}>
        {events.map((event) => (
          <motion.div
            key={event.id}
            whileHover={{ scale: 1.01 }}
            style={{
              padding: '24px',
              backgroundColor: 'white',
              borderRadius: '16px',
              border: '2px solid #e0e0e0',
              display: 'flex',
              gap: '20px',
            }}
          >
            <div style={{ fontSize: '64px' }}>{event.icon}</div>
            <div style={{ flex: 1 }}>
              <h3 style={{ margin: '0 0 8px 0' }}>{event.title}</h3>
              <p style={{ fontSize: '14px', color: '#666', marginBottom: '12px' }}>
                {event.description}
              </p>
              <div style={{ display: 'flex', gap: '10px' }}>
                <span style={{
                  padding: '4px 12px',
                  backgroundColor: '#E3F2FD',
                  borderRadius: '12px',
                  fontSize: '12px',
                  fontWeight: 'bold',
                }}>
                  {event.type.toUpperCase()}
                </span>
                <span style={{
                  padding: '4px 12px',
                  backgroundColor: event.active ? '#E8F5E9' : '#FFEBEE',
                  color: event.active ? '#2E7D32' : '#C62828',
                  borderRadius: '12px',
                  fontSize: '12px',
                  fontWeight: 'bold',
                }}>
                  {event.active ? 'ACTIVE' : 'ENDED'}
                </span>
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
};

export default SpecialEventsSystem;
