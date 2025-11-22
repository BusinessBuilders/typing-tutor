import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  base: './',
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
      '@components': path.resolve(__dirname, './src/components'),
      '@services': path.resolve(__dirname, './src/services'),
      '@utils': path.resolve(__dirname, './src/utils'),
      '@hooks': path.resolve(__dirname, './src/hooks'),
      '@store': path.resolve(__dirname, './src/store'),
      '@types': path.resolve(__dirname, './src/types'),
    },
  },
  build: {
    outDir: 'dist',
    assetsDir: 'assets',
    // Step 331 & 333: Performance optimizations and production config
    target: 'esnext',
    minify: 'terser',
    terserOptions: {
      compress: {
        drop_console: true,
        drop_debugger: true,
      },
    },
    rollupOptions: {
      output: {
        manualChunks: {
          // Step 332: Code splitting
          'react-vendor': ['react', 'react-dom', 'react-router-dom'],
          'animation-vendor': ['framer-motion'],
          'state-vendor': ['zustand'],
          'api-vendor': ['axios'],
        },
      },
    },
    chunkSizeWarningLimit: 1000,
    sourcemap: false, // Disable in production for performance
    reportCompressedSize: true,
  },
  optimizeDeps: {
    include: ['react', 'react-dom', 'react-router-dom', 'framer-motion', 'zustand', 'axios'],
  },
  server: {
    port: 3000,
    strictPort: false,
    host: true, // Allow external access
    allowedHosts: [
      'localhost',
      '.ngrok-free.app',
      '.ngrok.io',
      'hip-piglet-forcibly.ngrok-free.app',
    ],
  },
})
