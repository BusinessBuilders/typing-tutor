import React, { useState } from 'react';
import { motion } from 'framer-motion';

/**
 * Previews System Component
 * Step 329 - Add content preview functionality
 */

const PreviewsSystem: React.FC = () => {
  const [previewMode, setPreviewMode] = useState<'exercise' | 'theme' | 'illustration'>('exercise');

  return (
    <div style={{ padding: '20px', maxWidth: '1200px', margin: '0 auto' }}>
      <h1 style={{ fontSize: '32px', marginBottom: '10px' }}>👁️ Content Previews</h1>
      <p style={{ color: '#666', marginBottom: '30px' }}>Preview content before using it</p>

      <div style={{ display: 'flex', gap: '10px', marginBottom: '30px' }}>
        {(['exercise', 'theme', 'illustration'] as const).map((mode) => (
          <button
            key={mode}
            onClick={() => setPreviewMode(mode)}
            style={{
              padding: '12px 24px',
              backgroundColor: previewMode === mode ? '#4CAF50' : 'white',
              color: previewMode === mode ? 'white' : '#333',
              border: '2px solid #4CAF50',
              borderRadius: '8px',
              cursor: 'pointer',
              fontWeight: 'bold',
            }}
          >
            {mode.charAt(0).toUpperCase() + mode.slice(1)}
          </button>
        ))}
      </div>

      <motion.div
        key={previewMode}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        style={{
          padding: '40px',
          backgroundColor: 'white',
          borderRadius: '16px',
          border: '2px solid #e0e0e0',
          textAlign: 'center',
        }}
      >
        <div style={{ fontSize: '64px', marginBottom: '20px' }}>
          {previewMode === 'exercise' && '📝'}
          {previewMode === 'theme' && '🎨'}
          {previewMode === 'illustration' && '🖼️'}
        </div>
        <h2>Preview {previewMode.charAt(0).toUpperCase() + previewMode.slice(1)}</h2>
        <p style={{ color: '#666', fontSize: '16px' }}>
          This is a preview of the {previewMode}. Try it out before committing!
        </p>
      </motion.div>
    </div>
  );
};

export default PreviewsSystem;
