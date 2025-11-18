/**
 * Performance Optimization Utilities
 * Step 331 - Optimize performance
 */

import { useEffect, useRef, useCallback } from 'react';

/**
 * Debounce function to limit the rate of function calls
 */
export function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout | null = null;

  return function executedFunction(...args: Parameters<T>) {
    const later = () => {
      timeout = null;
      func(...args);
    };

    if (timeout) {
      clearTimeout(timeout);
    }
    timeout = setTimeout(later, wait);
  };
}

/**
 * Throttle function to ensure function is called at most once per time period
 */
export function throttle<T extends (...args: any[]) => any>(
  func: T,
  limit: number
): (...args: Parameters<T>) => void {
  let inThrottle: boolean;

  return function executedFunction(...args: Parameters<T>) {
    if (!inThrottle) {
      func(...args);
      inThrottle = true;
      setTimeout(() => (inThrottle = false), limit);
    }
  };
}

/**
 * Hook for intersection observer (lazy loading)
 */
export function useIntersectionObserver(
  callback: () => void,
  options?: IntersectionObserverInit
) {
  const targetRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) {
        callback();
      }
    }, options);

    const currentTarget = targetRef.current;
    if (currentTarget) {
      observer.observe(currentTarget);
    }

    return () => {
      if (currentTarget) {
        observer.unobserve(currentTarget);
      }
    };
  }, [callback, options]);

  return targetRef;
}

/**
 * Hook for measuring component render performance
 */
export function usePerformanceMonitor(componentName: string) {
  const renderCount = useRef(0);
  const startTime = useRef(performance.now());

  useEffect(() => {
    renderCount.current += 1;
    const endTime = performance.now();
    const renderTime = endTime - startTime.current;

    if (process.env.NODE_ENV === 'development') {
      console.log(
        `[Performance] ${componentName} - Render #${renderCount.current} - ${renderTime.toFixed(2)}ms`
      );
    }

    startTime.current = performance.now();
  });
}

/**
 * Memoize expensive calculations
 */
export function memoize<T extends (...args: any[]) => any>(fn: T): T {
  const cache = new Map<string, ReturnType<T>>();

  return ((...args: Parameters<T>) => {
    const key = JSON.stringify(args);
    if (cache.has(key)) {
      return cache.get(key);
    }

    const result = fn(...args);
    cache.set(key, result);
    return result;
  }) as T;
}

/**
 * Image optimization - lazy load images
 */
export function lazyLoadImage(src: string): Promise<string> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(src);
    img.onerror = reject;
    img.src = src;
  });
}

/**
 * Hook for window resize with debounce
 */
export function useWindowResize(callback: (width: number, height: number) => void, delay = 250) {
  useEffect(() => {
    const handleResize = debounce(() => {
      callback(window.innerWidth, window.innerHeight);
    }, delay);

    window.addEventListener('resize', handleResize);
    handleResize();

    return () => window.removeEventListener('resize', handleResize);
  }, [callback, delay]);
}

/**
 * Virtual scrolling for large lists
 */
export function useVirtualScroll<T>(
  items: T[],
  itemHeight: number,
  containerHeight: number
) {
  const scrollTop = useRef(0);

  const getVisibleRange = useCallback(() => {
    const start = Math.floor(scrollTop.current / itemHeight);
    const end = Math.ceil((scrollTop.current + containerHeight) / itemHeight);
    return {
      start: Math.max(0, start - 5), // Buffer
      end: Math.min(items.length, end + 5), // Buffer
    };
  }, [itemHeight, containerHeight, items.length]);

  const handleScroll = useCallback((event: React.UIEvent<HTMLDivElement>) => {
    scrollTop.current = event.currentTarget.scrollTop;
  }, []);

  const { start, end } = getVisibleRange();
  const visibleItems = items.slice(start, end);
  const offsetY = start * itemHeight;

  return {
    visibleItems,
    offsetY,
    totalHeight: items.length * itemHeight,
    handleScroll,
  };
}

/**
 * Performance metrics
 */
export interface PerformanceMetrics {
  fps: number;
  memory?: number;
  loadTime: number;
}

export function getPerformanceMetrics(): PerformanceMetrics {
  const metrics: PerformanceMetrics = {
    fps: 0,
    loadTime: 0,
  };

  // FPS calculation
  let lastTime = performance.now();
  let frames = 0;

  const calculateFPS = () => {
    frames++;
    const currentTime = performance.now();
    if (currentTime >= lastTime + 1000) {
      metrics.fps = Math.round((frames * 1000) / (currentTime - lastTime));
      frames = 0;
      lastTime = currentTime;
    }
    requestAnimationFrame(calculateFPS);
  };
  requestAnimationFrame(calculateFPS);

  // Load time
  if (performance.timing) {
    metrics.loadTime = performance.timing.loadEventEnd - performance.timing.navigationStart;
  }

  // Memory (if available)
  if ('memory' in performance) {
    metrics.memory = (performance as any).memory.usedJSHeapSize / 1048576; // MB
  }

  return metrics;
}

/**
 * Bundle size analyzer
 */
export function logBundleSize() {
  if (process.env.NODE_ENV === 'production') {
    const scripts = Array.from(document.querySelectorAll('script[src]'));
    let totalSize = 0;

    scripts.forEach((script) => {
      fetch((script as HTMLScriptElement).src, { method: 'HEAD' })
        .then((response) => {
          const size = parseInt(response.headers.get('content-length') || '0');
          totalSize += size;
          console.log(
            `Bundle: ${(script as HTMLScriptElement).src} - ${(size / 1024).toFixed(2)} KB`
          );
        })
        .catch(() => {});
    });

    setTimeout(() => {
      console.log(`Total bundle size: ${(totalSize / 1024).toFixed(2)} KB`);
    }, 1000);
  }
}

/**
 * Preload critical resources
 */
export function preloadResources(urls: string[]) {
  urls.forEach((url) => {
    const link = document.createElement('link');
    link.rel = 'preload';
    link.as = 'image';
    link.href = url;
    document.head.appendChild(link);
  });
}

/**
 * Service Worker registration for caching
 */
export function registerServiceWorker() {
  if ('serviceWorker' in navigator && process.env.NODE_ENV === 'production') {
    window.addEventListener('load', () => {
      navigator.serviceWorker
        .register('/service-worker.js')
        .then((registration) => {
          console.log('SW registered: ', registration);
        })
        .catch((error) => {
          console.log('SW registration failed: ', error);
        });
    });
  }
}

/**
 * Optimize images - convert to WebP if supported
 */
export function supportsWebP(): Promise<boolean> {
  return new Promise((resolve) => {
    const webP = new Image();
    webP.onload = webP.onerror = () => {
      resolve(webP.height === 2);
    };
    webP.src = 'data:image/webp;base64,UklGRjoAAABXRUJQVlA4IC4AAACyAgCdASoCAAIALmk0mk0iIiIiIgBoSygABc6WWgAA/veff/0PP8bA//LwYAAA';
  });
}

export default {
  debounce,
  throttle,
  useIntersectionObserver,
  usePerformanceMonitor,
  memoize,
  lazyLoadImage,
  useWindowResize,
  useVirtualScroll,
  getPerformanceMetrics,
  logBundleSize,
  preloadResources,
  registerServiceWorker,
  supportsWebP,
};
