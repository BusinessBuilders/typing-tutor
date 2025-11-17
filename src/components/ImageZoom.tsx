/**
 * Image Zoom Component
 * Step 103 - Interactive image zoom with pan and pinch
 */

import { useState, useRef } from 'react';
import { motion, PanInfo } from 'framer-motion';
import { useSettingsStore } from '../store/useSettingsStore';

export interface ImageZoomProps {
  src: string;
  alt: string;
  initialScale?: number;
  maxScale?: number;
  minScale?: number;
}

export default function ImageZoom({
  src,
  alt,
  initialScale = 1,
  maxScale = 3,
  minScale = 1,
}: ImageZoomProps) {
  const [scale, setScale] = useState(initialScale);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const { settings } = useSettingsStore();
  const constraintsRef = useRef(null);

  const handleZoomIn = () => {
    setScale((prev) => Math.min(prev + 0.5, maxScale));
  };

  const handleZoomOut = () => {
    setScale((prev) => {
      const newScale = Math.max(prev - 0.5, minScale);
      if (newScale === minScale) {
        setPosition({ x: 0, y: 0 });
      }
      return newScale;
    });
  };

  const handleReset = () => {
    setScale(minScale);
    setPosition({ x: 0, y: 0 });
  };

  const handlePan = (_event: any, info: PanInfo) => {
    if (scale > minScale) {
      setPosition({
        x: position.x + info.delta.x,
        y: position.y + info.delta.y,
      });
    }
  };

  return (
    <div className="relative w-full h-full overflow-hidden bg-gray-100 rounded-lg" ref={constraintsRef}>
      {/* Zoomable Image */}
      <motion.div
        drag={scale > minScale}
        dragConstraints={constraintsRef}
        dragElastic={0.1}
        onPan={handlePan}
        animate={{
          scale,
          x: scale === minScale ? 0 : position.x,
          y: scale === minScale ? 0 : position.y,
        }}
        transition={{ type: 'spring', stiffness: 300, damping: 30 }}
        className="w-full h-full flex items-center justify-center cursor-move"
      >
        <img
          src={src}
          alt={alt}
          className="max-w-full max-h-full object-contain select-none"
          draggable={false}
        />
      </motion.div>

      {/* Zoom Controls */}
      <div className="absolute bottom-4 right-4 flex flex-col space-y-2">
        <motion.button
          whileHover={{ scale: settings.reducedMotion ? 1 : 1.1 }}
          whileTap={{ scale: settings.reducedMotion ? 1 : 0.9 }}
          onClick={handleZoomIn}
          disabled={scale >= maxScale}
          className="w-12 h-12 bg-white rounded-full shadow-lg flex items-center justify-center text-2xl hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          ➕
        </motion.button>

        <motion.button
          whileHover={{ scale: settings.reducedMotion ? 1 : 1.1 }}
          whileTap={{ scale: settings.reducedMotion ? 1 : 0.9 }}
          onClick={handleZoomOut}
          disabled={scale <= minScale}
          className="w-12 h-12 bg-white rounded-full shadow-lg flex items-center justify-center text-2xl hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          ➖
        </motion.button>

        {scale > minScale && (
          <motion.button
            initial={{ opacity: 0, scale: 0 }}
            animate={{ opacity: 1, scale: 1 }}
            whileHover={{ scale: settings.reducedMotion ? 1 : 1.1 }}
            whileTap={{ scale: settings.reducedMotion ? 1 : 0.9 }}
            onClick={handleReset}
            className="w-12 h-12 bg-white rounded-full shadow-lg flex items-center justify-center text-xl hover:bg-gray-50"
          >
            ↺
          </motion.button>
        )}
      </div>

      {/* Scale Indicator */}
      <div className="absolute top-4 left-4 bg-black bg-opacity-50 text-white px-3 py-1 rounded-full text-sm">
        {Math.round(scale * 100)}%
      </div>

      {/* Hint */}
      {scale > minScale && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="absolute top-4 right-4 bg-black bg-opacity-50 text-white px-3 py-1 rounded-full text-xs"
        >
          Drag to pan
        </motion.div>
      )}
    </div>
  );
}

// Simple zoom on hover component
export function ImageZoomHover({
  src,
  alt,
  className = '',
}: {
  src: string;
  alt: string;
  className?: string;
}) {
  const { settings } = useSettingsStore();

  return (
    <div className={`overflow-hidden ${className}`}>
      <motion.img
        src={src}
        alt={alt}
        whileHover={{ scale: settings.reducedMotion ? 1 : 1.2 }}
        transition={{ duration: 0.3 }}
        className="w-full h-full object-cover cursor-zoom-in"
      />
    </div>
  );
}
