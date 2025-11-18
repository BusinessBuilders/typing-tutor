import React, { useState } from 'react';
import { motion } from 'framer-motion';

/**
 * Uploads System Component
 * Step 327 - Create content upload system
 */

const UploadsSystem: React.FC = () => {
  const [uploads, setUploads] = useState<any[]>([]);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files) {
      const newUploads = Array.from(files).map((file) => ({
        id: Date.now() + Math.random(),
        name: file.name,
        size: file.size,
        type: file.type,
        date: new Date(),
      }));
      setUploads([...uploads, ...newUploads]);
    }
  };

  return (
    <div style={{ padding: '20px', maxWidth: '1200px', margin: '0 auto' }}>
      <h1 style={{ fontSize: '32px', marginBottom: '10px' }}>📤 Upload Content</h1>
      <p style={{ color: '#666', marginBottom: '30px' }}>Share your custom exercises and illustrations</p>

      <div style={{ marginBottom: '30px' }}>
        <label
          htmlFor="file-upload"
          style={{
            padding: '16px 32px',
            backgroundColor: '#2196F3',
            color: 'white',
            borderRadius: '12px',
            cursor: 'pointer',
            display: 'inline-block',
            fontWeight: 'bold',
          }}
        >
          Choose Files
        </label>
        <input
          id="file-upload"
          type="file"
          multiple
          onChange={handleFileUpload}
          style={{ display: 'none' }}
        />
      </div>

      <div style={{ display: 'grid', gap: '12px' }}>
        {uploads.map((upload) => (
          <motion.div
            key={upload.id}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            style={{
              padding: '16px',
              backgroundColor: 'white',
              borderRadius: '12px',
              border: '2px solid #e0e0e0',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
            }}
          >
            <div>
              <div style={{ fontWeight: 'bold' }}>{upload.name}</div>
              <div style={{ fontSize: '13px', color: '#666' }}>
                {(upload.size / 1024).toFixed(2)} KB
              </div>
            </div>
            <span style={{ fontSize: '24px' }}>📄</span>
          </motion.div>
        ))}
      </div>
    </div>
  );
};

export default UploadsSystem;
