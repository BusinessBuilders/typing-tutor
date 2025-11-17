/**
 * Lazy Loading Hook
 * Step 109 - Optimize image loading with lazy loading utilities
 */

import { useEffect, useRef, useState } from 'react';

export interface LazyLoadOptions {
  rootMargin?: string;
  threshold?: number;
  triggerOnce?: boolean;
}

/**
 * Hook to detect when an element enters the viewport
 */
export function useLazyLoad<T extends HTMLElement>(
  options: LazyLoadOptions = {}
): [React.RefObject<T>, boolean] {
  const { rootMargin = '50px', threshold = 0.01, triggerOnce = true } = options;
  const ref = useRef<T>(null);
  const [isVisible, setIsVisible] = useState(false);
  const [hasTriggered, setHasTriggered] = useState(false);

  useEffect(() => {
    const element = ref.current;
    if (!element) return;

    // If already triggered and triggerOnce is true, don't observe
    if (triggerOnce && hasTriggered) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        const visible = entry.isIntersecting;
        setIsVisible(visible);

        if (visible && triggerOnce) {
          setHasTriggered(true);
          observer.disconnect();
        }
      },
      { rootMargin, threshold }
    );

    observer.observe(element);

    return () => {
      observer.disconnect();
    };
  }, [rootMargin, threshold, triggerOnce, hasTriggered]);

  return [ref, isVisible];
}

/**
 * Hook to preload images before they're displayed
 */
export function useImagePreload(src: string): boolean {
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    if (!src) return;

    const img = new Image();
    img.src = src;

    const handleLoad = () => setIsLoaded(true);
    const handleError = () => setIsLoaded(false);

    img.addEventListener('load', handleLoad);
    img.addEventListener('error', handleError);

    // Check if already cached
    if (img.complete) {
      setIsLoaded(true);
    }

    return () => {
      img.removeEventListener('load', handleLoad);
      img.removeEventListener('error', handleError);
    };
  }, [src]);

  return isLoaded;
}

/**
 * Hook to batch preload multiple images
 */
export function useBatchImagePreload(sources: string[]): {
  loaded: number;
  total: number;
  isComplete: boolean;
  progress: number;
} {
  const [loadedCount, setLoadedCount] = useState(0);
  const [total] = useState(sources.length);

  useEffect(() => {
    if (!sources.length) return;

    let count = 0;
    const images: HTMLImageElement[] = [];

    sources.forEach((src) => {
      const img = new Image();
      img.src = src;

      const handleLoad = () => {
        count++;
        setLoadedCount(count);
      };

      const handleError = () => {
        count++;
        setLoadedCount(count);
      };

      img.addEventListener('load', handleLoad);
      img.addEventListener('error', handleError);
      images.push(img);

      // Check if already cached
      if (img.complete) {
        handleLoad();
      }
    });

    return () => {
      images.forEach((img) => {
        img.src = '';
      });
    };
  }, [sources]);

  return {
    loaded: loadedCount,
    total,
    isComplete: loadedCount >= total,
    progress: total > 0 ? (loadedCount / total) * 100 : 0,
  };
}

/**
 * Hook for lazy loading with retry logic
 */
export function useLazyLoadWithRetry(
  src: string,
  maxRetries = 3
): {
  isLoading: boolean;
  isLoaded: boolean;
  error: Error | null;
  retry: () => void;
} {
  const [isLoading, setIsLoading] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const [retryCount, setRetryCount] = useState(0);

  const loadImage = () => {
    if (!src) return;

    setIsLoading(true);
    setError(null);

    const img = new Image();
    img.src = src;

    const handleLoad = () => {
      setIsLoaded(true);
      setIsLoading(false);
      setError(null);
    };

    const handleError = () => {
      setIsLoading(false);
      setIsLoaded(false);

      if (retryCount < maxRetries) {
        // Exponential backoff
        const delay = Math.pow(2, retryCount) * 1000;
        setTimeout(() => {
          setRetryCount((prev) => prev + 1);
        }, delay);
      } else {
        setError(new Error(`Failed to load image after ${maxRetries} attempts`));
      }
    };

    img.addEventListener('load', handleLoad);
    img.addEventListener('error', handleError);

    if (img.complete) {
      handleLoad();
    }

    return () => {
      img.removeEventListener('load', handleLoad);
      img.removeEventListener('error', handleError);
    };
  };

  useEffect(() => {
    loadImage();
  }, [src, retryCount]);

  const retry = () => {
    setRetryCount(0);
    setError(null);
    loadImage();
  };

  return { isLoading, isLoaded, error, retry };
}

/**
 * Hook to manage lazy loading queue
 */
export function useLazyLoadQueue(
  items: string[],
  concurrency = 3
): {
  loadedItems: Set<string>;
  isComplete: boolean;
  loadNext: () => void;
} {
  const [loadedItems, setLoadedItems] = useState<Set<string>>(new Set());
  const [queue, setQueue] = useState<string[]>(items);
  const [loading, setLoading] = useState<Set<string>>(new Set());

  const loadNext = () => {
    if (queue.length === 0 || loading.size >= concurrency) return;

    const toLoad = queue.slice(0, concurrency - loading.size);
    setQueue((prev) => prev.slice(concurrency - loading.size));
    setLoading((prev) => new Set([...prev, ...toLoad]));

    toLoad.forEach((src) => {
      const img = new Image();
      img.src = src;

      const handleComplete = () => {
        setLoadedItems((prev) => new Set([...prev, src]));
        setLoading((prev) => {
          const next = new Set(prev);
          next.delete(src);
          return next;
        });
      };

      img.addEventListener('load', handleComplete);
      img.addEventListener('error', handleComplete);

      if (img.complete) {
        handleComplete();
      }
    });
  };

  useEffect(() => {
    loadNext();
  }, [queue.length, loading.size]);

  return {
    loadedItems,
    isComplete: loadedItems.size >= items.length,
    loadNext,
  };
}
