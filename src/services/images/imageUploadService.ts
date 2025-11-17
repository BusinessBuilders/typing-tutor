/**
 * Image Upload Service
 * Handles custom image uploads for personalized typing practice
 */

import { UnsplashImage } from './unsplashService';
import { imageCache } from './imageCache';

export interface ImageUploadOptions {
  maxSize?: number; // in bytes
  allowedTypes?: string[];
  resize?: boolean;
  maxWidth?: number;
  maxHeight?: number;
}

export interface UploadedImage {
  id: string;
  file: File;
  url: string;
  dataUrl: string;
  width: number;
  height: number;
  size: number;
  type: string;
}

export interface ImageUploadResult {
  success: boolean;
  image?: UnsplashImage;
  error?: string;
}

/**
 * Default upload options
 */
const DEFAULT_OPTIONS: ImageUploadOptions = {
  maxSize: 5 * 1024 * 1024, // 5MB
  allowedTypes: ['image/jpeg', 'image/png', 'image/gif', 'image/webp'],
  resize: true,
  maxWidth: 1920,
  maxHeight: 1080,
};

/**
 * Image Upload Service Class
 */
export class ImageUploadService {
  private uploadedImages: Map<string, UploadedImage> = new Map();

  /**
   * Validate image file
   */
  validateImage(file: File, options: ImageUploadOptions = {}): { valid: boolean; error?: string } {
    const opts = { ...DEFAULT_OPTIONS, ...options };

    // Check file type
    if (opts.allowedTypes && !opts.allowedTypes.includes(file.type)) {
      return {
        valid: false,
        error: `Invalid file type. Allowed types: ${opts.allowedTypes.join(', ')}`,
      };
    }

    // Check file size
    if (opts.maxSize && file.size > opts.maxSize) {
      const maxSizeMB = (opts.maxSize / (1024 * 1024)).toFixed(2);
      return {
        valid: false,
        error: `File too large. Maximum size: ${maxSizeMB}MB`,
      };
    }

    return { valid: true };
  }

  /**
   * Load and process image file
   */
  async loadImage(file: File): Promise<UploadedImage> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();

      reader.onload = (e) => {
        const dataUrl = e.target?.result as string;
        const img = new Image();

        img.onload = () => {
          const uploadedImage: UploadedImage = {
            id: `custom-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
            file,
            url: URL.createObjectURL(file),
            dataUrl,
            width: img.width,
            height: img.height,
            size: file.size,
            type: file.type,
          };

          resolve(uploadedImage);
        };

        img.onerror = () => {
          reject(new Error('Failed to load image'));
        };

        img.src = dataUrl;
      };

      reader.onerror = () => {
        reject(new Error('Failed to read file'));
      };

      reader.readAsDataURL(file);
    });
  }

  /**
   * Resize image if needed
   */
  async resizeImage(
    uploadedImage: UploadedImage,
    maxWidth: number,
    maxHeight: number
  ): Promise<string> {
    return new Promise((resolve, reject) => {
      const img = new Image();

      img.onload = () => {
        let { width, height } = uploadedImage;

        // Calculate new dimensions
        if (width > maxWidth || height > maxHeight) {
          const ratio = Math.min(maxWidth / width, maxHeight / height);
          width = Math.floor(width * ratio);
          height = Math.floor(height * ratio);
        }

        // Create canvas and resize
        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;

        const ctx = canvas.getContext('2d');
        if (!ctx) {
          reject(new Error('Failed to get canvas context'));
          return;
        }

        ctx.drawImage(img, 0, 0, width, height);

        // Convert to data URL
        const resizedDataUrl = canvas.toDataURL(uploadedImage.type, 0.9);
        resolve(resizedDataUrl);
      };

      img.onerror = () => {
        reject(new Error('Failed to resize image'));
      };

      img.src = uploadedImage.dataUrl;
    });
  }

  /**
   * Upload and process image
   */
  async uploadImage(
    file: File,
    topic: string,
    options: ImageUploadOptions = {}
  ): Promise<ImageUploadResult> {
    try {
      // Validate
      const validation = this.validateImage(file, options);
      if (!validation.valid) {
        return {
          success: false,
          error: validation.error,
        };
      }

      // Load image
      const uploadedImage = await this.loadImage(file);

      // Resize if needed
      const opts = { ...DEFAULT_OPTIONS, ...options };
      let finalDataUrl = uploadedImage.dataUrl;

      if (opts.resize && opts.maxWidth && opts.maxHeight) {
        if (uploadedImage.width > opts.maxWidth || uploadedImage.height > opts.maxHeight) {
          finalDataUrl = await this.resizeImage(uploadedImage, opts.maxWidth, opts.maxHeight);
        }
      }

      // Store uploaded image
      this.uploadedImages.set(uploadedImage.id, uploadedImage);

      // Convert to UnsplashImage format for consistency
      const customImage: UnsplashImage = {
        id: uploadedImage.id,
        url: finalDataUrl,
        thumbnailUrl: finalDataUrl,
        alt: topic,
        photographer: 'Custom Upload',
        photographerUrl: '#',
        width: uploadedImage.width,
        height: uploadedImage.height,
      };

      // Cache the image
      await imageCache.cacheImage(customImage);

      return {
        success: true,
        image: customImage,
      };
    } catch (error) {
      console.error('Upload error:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error occurred',
      };
    }
  }

  /**
   * Upload multiple images
   */
  async uploadMultiple(
    files: File[],
    topics: string[],
    options: ImageUploadOptions = {}
  ): Promise<ImageUploadResult[]> {
    const results: ImageUploadResult[] = [];

    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      const topic = topics[i] || `image-${i}`;
      const result = await this.uploadImage(file, topic, options);
      results.push(result);
    }

    return results;
  }

  /**
   * Get uploaded image by ID
   */
  getUploadedImage(id: string): UploadedImage | undefined {
    return this.uploadedImages.get(id);
  }

  /**
   * Get all uploaded images
   */
  getAllUploadedImages(): UploadedImage[] {
    return Array.from(this.uploadedImages.values());
  }

  /**
   * Delete uploaded image
   */
  deleteUploadedImage(id: string): boolean {
    const image = this.uploadedImages.get(id);
    if (image) {
      // Revoke object URL to free memory
      URL.revokeObjectURL(image.url);
      this.uploadedImages.delete(id);
      return true;
    }
    return false;
  }

  /**
   * Clear all uploaded images
   */
  clearAll(): void {
    // Revoke all object URLs
    for (const image of this.uploadedImages.values()) {
      URL.revokeObjectURL(image.url);
    }
    this.uploadedImages.clear();
  }

  /**
   * Save uploaded images to local storage
   */
  async saveToLocalStorage(): Promise<void> {
    try {
      const images = Array.from(this.uploadedImages.values());
      const serializable = images.map((img) => ({
        id: img.id,
        dataUrl: img.dataUrl,
        width: img.width,
        height: img.height,
        size: img.size,
        type: img.type,
      }));

      localStorage.setItem('customImages', JSON.stringify(serializable));
    } catch (error) {
      console.error('Failed to save to local storage:', error);
    }
  }

  /**
   * Load uploaded images from local storage
   */
  async loadFromLocalStorage(): Promise<void> {
    try {
      const data = localStorage.getItem('customImages');
      if (!data) return;

      const images = JSON.parse(data);
      // Note: We can't fully restore File objects, but we can restore the data URLs
      for (const img of images) {
        // Create a minimal UploadedImage object
        // We'll need to recreate the File and URL when needed
        this.uploadedImages.set(img.id, {
          id: img.id,
          file: new File([], 'restored-image'), // Placeholder
          url: img.dataUrl, // Use dataUrl as URL for now
          dataUrl: img.dataUrl,
          width: img.width,
          height: img.height,
          size: img.size,
          type: img.type,
        });
      }
    } catch (error) {
      console.error('Failed to load from local storage:', error);
    }
  }
}

// Export singleton instance
export const imageUploadService = new ImageUploadService();

/**
 * Convenience function to upload image
 */
export async function uploadImage(
  file: File,
  topic: string,
  options?: ImageUploadOptions
): Promise<ImageUploadResult> {
  return imageUploadService.uploadImage(file, topic, options);
}

/**
 * Convenience function to upload multiple images
 */
export async function uploadMultipleImages(
  files: File[],
  topics: string[],
  options?: ImageUploadOptions
): Promise<ImageUploadResult[]> {
  return imageUploadService.uploadMultiple(files, topics, options);
}

export default imageUploadService;
