import React, { useState } from 'react';
import { motion } from 'framer-motion';

/**
 * Marketplace Component
 * Step 328 - Build content marketplace
 */

type MarketplaceItem = {
  id: string;
  title: string;
  description: string;
  type: 'exercise' | 'theme' | 'illustration' | 'template';
  price: number;
  rating: number;
  downloads: number;
  author: string;
  icon: string;
};

const marketplaceItems: MarketplaceItem[] = [
  {
    id: '1',
    title: 'Space Adventure Pack',
    description: '20 space-themed typing exercises',
    type: 'exercise',
    price: 0,
    rating: 4.8,
    downloads: 1523,
    author: 'Community',
    icon: '🚀',
  },
  {
    id: '2',
    title: 'Ocean Theme',
    description: 'Beautiful underwater theme',
    type: 'theme',
    price: 0,
    rating: 4.9,
    downloads: 2341,
    author: 'System',
    icon: '🌊',
  },
];

const Marketplace: React.FC = () => {
  const [filter, setFilter] = useState<string>('all');

  return (
    <div style={{ padding: '20px', maxWidth: '1200px', margin: '0 auto' }}>
      <h1 style={{ fontSize: '32px', marginBottom: '10px' }}>🛒 Marketplace</h1>
      <p style={{ color: '#666', marginBottom: '30px' }}>
        Discover and download community-created content
      </p>

      <div style={{ display: 'flex', gap: '10px', marginBottom: '20px' }}>
        {['all', 'exercise', 'theme', 'illustration'].map((type) => (
          <button
            key={type}
            onClick={() => setFilter(type)}
            style={{
              padding: '10px 20px',
              backgroundColor: filter === type ? '#2196F3' : 'white',
              color: filter === type ? 'white' : '#333',
              border: '2px solid #2196F3',
              borderRadius: '8px',
              cursor: 'pointer',
            }}
          >
            {type.charAt(0).toUpperCase() + type.slice(1)}
          </button>
        ))}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '20px' }}>
        {marketplaceItems
          .filter((item) => filter === 'all' || item.type === filter)
          .map((item) => (
            <motion.div
              key={item.id}
              whileHover={{ scale: 1.02 }}
              style={{
                padding: '20px',
                backgroundColor: 'white',
                borderRadius: '16px',
                border: '2px solid #e0e0e0',
              }}
            >
              <div style={{ fontSize: '48px', textAlign: 'center', marginBottom: '12px' }}>
                {item.icon}
              </div>
              <h3 style={{ margin: '0 0 8px 0' }}>{item.title}</h3>
              <p style={{ fontSize: '14px', color: '#666', marginBottom: '12px' }}>
                {item.description}
              </p>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontWeight: 'bold', color: '#4CAF50' }}>FREE</span>
                <span style={{ fontSize: '13px', color: '#666' }}>
                  ⭐ {item.rating} • {item.downloads} downloads
                </span>
              </div>
            </motion.div>
          ))}
      </div>
    </div>
  );
};

export default Marketplace;
