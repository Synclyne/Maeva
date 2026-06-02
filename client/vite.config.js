import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  server: {
    port: 3000,
    proxy: {
      '/api': 'http://localhost:5000',
      '/uploads': 'http://localhost:5000',
    },
  },
  build: {
    // Pages are lazy-loaded; each chunk should stay well under this
    chunkSizeWarningLimit: 1000,
    rollupOptions: {
      output: {
        // Split vendors into separate cacheable chunks
        manualChunks: {
          // React core — almost never changes, cache forever
          'vendor-react': ['react', 'react-dom'],
          // Router — changes rarely
          'vendor-router': ['react-router-dom'],
          // Axios — changes rarely
          'vendor-axios': ['axios'],
        },
      },
    },
  },
});
