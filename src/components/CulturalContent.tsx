import React, { useState } from 'react';
import { motion } from 'framer-motion';

/**
 * Cultural Content Component
 * Step 325 - Build culturally diverse content and celebrations
 */

type Culture = {
  id: string;
  name: string;
  region: string;
  traditions: string[];
  vocabulary: string[];
  celebrations: string[];
  colors: string[];
  icon: string;
};

const cultures: Culture[] = [
  {
    id: 'chinese',
    name: 'Chinese Culture',
    region: 'East Asia',
    traditions: ['Lunar New Year', 'Dragon Dance', 'Tea Ceremony'],
    vocabulary: ['harmony', 'prosperity', 'dragon', 'lantern', 'tea', 'tradition'],
    celebrations: ['Spring Festival', 'Mid-Autumn Festival', 'Dragon Boat Festival'],
    colors: ['#FF0000', '#FFD700'],
    icon: '🏮',
  },
  {
    id: 'indian',
    name: 'Indian Culture',
    region: 'South Asia',
    traditions: ['Diwali', 'Holi', 'Rangoli'],
    vocabulary: ['festival', 'colors', 'lights', 'celebration', 'unity', 'joy'],
    celebrations: ['Diwali', 'Holi', 'Dussehra'],
    colors: ['#FF6B00', '#FFEB3B'],
    icon: '🪔',
  },
  {
    id: 'mexican',
    name: 'Mexican Culture',
    region: 'Latin America',
    traditions: ['Día de los Muertos', 'Cinco de Mayo', 'Piñata'],
    vocabulary: ['familia', 'fiesta', 'tradition', 'celebration', 'culture', 'heritage'],
    celebrations: ['Day of the Dead', 'Independence Day', 'Cinco de Mayo'],
    colors: ['#FF1744', '#4CAF50'],
    icon: '🌮',
  },
  {
    id: 'african',
    name: 'African Cultures',
    region: 'Africa',
    traditions: ['Storytelling', 'Music', 'Dance', 'Art'],
    vocabulary: ['ubuntu', 'community', 'wisdom', 'heritage', 'ancestors', 'tradition'],
    celebrations: ['Kwanzaa', 'Umoja', 'Heritage Day'],
    colors: ['#FF9800', '#4CAF50'],
    icon: '🌍',
  },
];

const CulturalContent: React.FC = () => {
  const [selectedCulture, setSelectedCulture] = useState<Culture | null>(null);

  return (
    <div style={{ padding: '20px', maxWidth: '1200px', margin: '0 auto' }}>
      <h1 style={{ fontSize: '32px', marginBottom: '10px' }}>🌏 Cultural Diversity</h1>
      <p style={{ color: '#666', marginBottom: '30px' }}>
        Explore and learn about cultures from around the world
      </p>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '20px' }}>
        {cultures.map((culture) => (
          <motion.div
            key={culture.id}
            whileHover={{ scale: 1.02 }}
            onClick={() => setSelectedCulture(culture)}
            style={{
              padding: '24px',
              backgroundColor: 'white',
              borderRadius: '16px',
              border: '2px solid #e0e0e0',
              cursor: 'pointer',
            }}
          >
            <div style={{ fontSize: '48px', textAlign: 'center', marginBottom: '12px' }}>
              {culture.icon}
            </div>
            <h3 style={{ margin: '0 0 8px 0', textAlign: 'center' }}>{culture.name}</h3>
            <p style={{ fontSize: '13px', color: '#666', textAlign: 'center', marginBottom: '12px' }}>
              {culture.region}
            </p>
            <div style={{ display: 'flex', gap: '8px', justifyContent: 'center' }}>
              {culture.colors.map((color, i) => (
                <div
                  key={i}
                  style={{
                    width: '30px',
                    height: '30px',
                    backgroundColor: color,
                    borderRadius: '50%',
                    border: '2px solid white',
                    boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
                  }}
                />
              ))}
            </div>
          </motion.div>
        ))}
      </div>

      {selectedCulture && (
        <div
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(0,0,0,0.7)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000,
            padding: '20px',
          }}
          onClick={() => setSelectedCulture(null)}
        >
          <motion.div
            initial={{ scale: 0.9 }}
            animate={{ scale: 1 }}
            onClick={(e) => e.stopPropagation()}
            style={{
              backgroundColor: 'white',
              borderRadius: '20px',
              padding: '40px',
              maxWidth: '600px',
              width: '100%',
              maxHeight: '80vh',
              overflow: 'auto',
            }}
          >
            <div style={{ textAlign: 'center', marginBottom: '20px' }}>
              <div style={{ fontSize: '64px', marginBottom: '10px' }}>{selectedCulture.icon}</div>
              <h2 style={{ margin: 0 }}>{selectedCulture.name}</h2>
              <p style={{ color: '#666' }}>{selectedCulture.region}</p>
            </div>

            <div style={{ marginBottom: '20px' }}>
              <h3 style={{ marginBottom: '10px' }}>Traditions</h3>
              <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                {selectedCulture.traditions.map((tradition, i) => (
                  <span
                    key={i}
                    style={{
                      padding: '6px 12px',
                      backgroundColor: '#E3F2FD',
                      borderRadius: '12px',
                      fontSize: '14px',
                    }}
                  >
                    {tradition}
                  </span>
                ))}
              </div>
            </div>

            <div style={{ marginBottom: '20px' }}>
              <h3 style={{ marginBottom: '10px' }}>Key Words</h3>
              <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                {selectedCulture.vocabulary.map((word, i) => (
                  <span
                    key={i}
                    style={{
                      padding: '6px 12px',
                      backgroundColor: '#F3E5F5',
                      borderRadius: '12px',
                      fontSize: '14px',
                    }}
                  >
                    {word}
                  </span>
                ))}
              </div>
            </div>

            <button
              onClick={() => setSelectedCulture(null)}
              style={{
                width: '100%',
                padding: '12px',
                backgroundColor: selectedCulture.colors[0],
                color: 'white',
                border: 'none',
                borderRadius: '8px',
                fontWeight: 'bold',
                cursor: 'pointer',
              }}
            >
              Close
            </button>
          </motion.div>
        </div>
      )}
    </div>
  );
};

export default CulturalContent;
