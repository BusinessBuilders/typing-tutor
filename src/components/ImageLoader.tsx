/**
 * Image Loader Component
 * Step 102 - Progressive image loading with placeholders
 */

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';

export interface ImageLoaderProps {
  src: string;
  alt: string;
  width?: number | string;
  height?: number | string;
  className?: string;
  placeholderColor?: string;
  onLoad?: () => void;
  onError?: () => void;
  lazy?: boolean;
}

export default function ImageLoader({
  src,
  alt,
  width = '100%',
  height = '100%',
  className = '',
  placeholderColor = 'from-blue-100 to-purple-100',
  onLoad,
  onError,
  lazy = true,
}: ImageLoaderProps) {
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);
  const [imageSrc, setImageSrc] = useState<string | null>(lazy ? null : src);

  useEffect(() => {
    if (lazy && !imageSrc) {
      // Lazy load after component mounts
      const timer = setTimeout(() => {
        setImageSrc(src);
      }, 100);
      return () => clearTimeout(timer);
    }
  }, [lazy, src, imageSrc]);

  const handleLoad = () => {
    setIsLoading(false);
    setHasError(false);
    onLoad?.();
  };

  const handleError = () => {
    setIsLoading(false);
    setHasError(true);
    onError?.();
  };

  return (
    <div
      className={`relative overflow-hidden ${className}`}
      style={{ width, height }}
    >
      {/* Loading Placeholder */}
      {isLoading && (
        <div className={`absolute inset-0 bg-gradient-to-br ${placeholderColor} animate-pulse`}>
          <div className="absolute inset-0 flex items-center justify-center">
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
              className="w-8 h-8 border-3 border-gray-300 border-t-primary-600 rounded-full"
            />
          </div>
        </div>
      )}

      {/* Error State */}
      {hasError && (
        <div className="absolute inset-0 bg-gradient-to-br from-gray-100 to-gray-200 flex flex-col items-center justify-center p-4">
          <div className="text-4xl mb-2">🖼️</div>
          <p className="text-sm text-gray-600 text-center">Image unavailable</p>
        </div>
      )}

      {/* Actual Image */}
      {imageSrc && (
        <motion.img
          src={imageSrc}
          alt={alt}
          onLoad={handleLoad}
          onError={handleError}
          initial={{ opacity: 0 }}
          animate={{ opacity: isLoading ? 0 : 1 }}
          transition={{ duration: 0.3 }}
          className="absolute inset-0 w-full h-full object-cover"
        />
      )}
    </div>
  );
}

// Skeleton loader for lists
export function ImageSkeleton({
  width = '100%',
  height = 200,
  className = '',
}: {
  width?: number | string;
  height?: number | string;
  className?: string;
}) {
  return (
    <div
      className={`bg-gradient-to-br from-gray-100 to-gray-200 animate-pulse rounded-lg ${className}`}
      style={{ width, height }}
    >
      <div className="flex items-center justify-center h-full">
        <div className="text-4xl opacity-30">📷</div>
      </div>
    </div>
  );
}

// Progressive image with blur-up effect
export function ProgressiveImage({
  src,
  placeholderSrc,
  alt,
  className = '',
}: {
  src: string;
  placeholderSrc?: string;
  alt: string;
  className?: string;
}) {
  const [isLoaded, setIsLoaded] = useState(false);

  return (
    <div className={`relative overflow-hidden ${className}`}>
      {/* Low quality placeholder */}
      {placeholderSrc && !isLoaded && (
        <img
          src={placeholderSrc}
          alt={alt}
          className="absolute inset-0 w-full h-full object-cover filter blur-sm"
        />
      )}

      {/* Full quality image */}
      <motion.img
        src={src}
        alt={alt}
        onLoad={() => setIsLoaded(true)}
        initial={{ opacity: 0 }}
        animate={{ opacity: isLoaded ? 1 : 0 }}
        transition={{ duration: 0.5 }}
        className="w-full h-full object-cover"
      />
    </div>
  );
}
