/**
 * Image Services Index
 * Central export point for all image-related services
 */

// Unsplash service
export {
  UnsplashService,
  unsplashService,
  searchImages,
  getRandomImage,
} from './unsplashService';

export type { UnsplashImage, ImageSearchOptions } from './unsplashService';

// Image cache
export {
  ImageCache,
  imageCache,
  getFallbackImage,
  categorizeTopicForFallback,
  FALLBACK_IMAGES,
} from './imageCache';

export type { CachedImage } from './imageCache';

// Image manager
export {
  ImageManager,
  imageManager,
  getImageForWord,
  getImageForSentence,
  preloadImages,
} from './imageManager';

export type { ImageManagerOptions } from './imageManager';

// Image upload service
export {
  ImageUploadService,
  imageUploadService,
  uploadImage,
  uploadMultipleImages,
} from './imageUploadService';

export type {
  ImageUploadOptions,
  UploadedImage,
  ImageUploadResult,
} from './imageUploadService';

// Image description service
export {
  ImageDescriptionService,
  imageDescriptionService,
  generateImageDescription,
  generateAltText,
  generateSensoryDescription,
} from './imageDescriptionService';

export type { ImageDescription, DescriptionOptions } from './imageDescriptionService';
