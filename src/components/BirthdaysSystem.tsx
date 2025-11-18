import React, { useState } from 'react';
import { motion } from 'framer-motion';

/**
 * Birthdays System Component
 * Step 324 - Create personalized birthday celebrations
 */

type Birthday = {
  id: string;
  name: string;
  date: { month: number; day: number };
  age?: number;
  favorite: { color: string; animal: string; activity: string };
};

const BirthdaysSystem: React.FC = () => {
  const [birthdays] = useState<Birthday[]>([]);
  const [showAdd, setShowAdd] = useState(false);

  // Future: Add birthday functionality
  // const addBirthday = (birthday: Omit<Birthday, 'id'>) => {
  //   setBirthdays([...birthdays, { ...birthday, id: Date.now().toString() }]);
  //   setShowAdd(false);
  // };

  return (
    <div style={{ padding: '20px', maxWidth: '1200px', margin: '0 auto' }}>
      <h1 style={{ fontSize: '32px', marginBottom: '10px' }}>🎂 Birthday Celebrations</h1>
      <p style={{ color: '#666', marginBottom: '30px' }}>Celebrate special days with custom typing exercises</p>

      <button
        onClick={() => setShowAdd(true)}
        style={{
          padding: '12px 24px',
          backgroundColor: '#FF4081',
          color: 'white',
          border: 'none',
          borderRadius: '8px',
          cursor: 'pointer',
          marginBottom: '20px',
          fontWeight: 'bold',
        }}
      >
        + Add Birthday
      </button>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))', gap: '20px' }}>
        {birthdays.map((birthday) => (
          <motion.div
            key={birthday.id}
            whileHover={{ scale: 1.02 }}
            style={{
              padding: '20px',
              backgroundColor: birthday.favorite.color + '20',
              borderRadius: '16px',
              border: `3px solid ${birthday.favorite.color}`,
            }}
          >
            <div style={{ fontSize: '48px', textAlign: 'center', marginBottom: '10px' }}>🎉</div>
            <h3 style={{ margin: '0 0 8px 0', textAlign: 'center' }}>{birthday.name}</h3>
            <p style={{ textAlign: 'center', fontSize: '14px', color: '#666' }}>
              {new Date(2024, birthday.date.month, birthday.date.day).toLocaleDateString('en-US', {
                month: 'long',
                day: 'numeric',
              })}
            </p>
            {birthday.age && (
              <p style={{ textAlign: 'center', fontWeight: 'bold', color: birthday.favorite.color }}>
                Turning {birthday.age}!
              </p>
            )}
          </motion.div>
        ))}
      </div>

      {showAdd && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0,0,0,0.5)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000,
        }} onClick={() => setShowAdd(false)}>
          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              backgroundColor: 'white',
              padding: '30px',
              borderRadius: '16px',
              maxWidth: '400px',
              width: '90%',
            }}
          >
            <h2>Add Birthday</h2>
            <p style={{ fontSize: '14px', color: '#666' }}>Coming soon - Add birthday form</p>
            <button
              onClick={() => setShowAdd(false)}
              style={{
                padding: '10px 20px',
                backgroundColor: '#666',
                color: 'white',
                border: 'none',
                borderRadius: '8px',
                cursor: 'pointer',
                width: '100%',
              }}
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default BirthdaysSystem;
