import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  build: {
    outDir: 'dist',
    sourcemap: true,
    rollupOptions: {
      output: {
        manualChunks: {
          'react-vendor': ['react', 'react-dom'],
          'router': ['react-router-dom'],
          'charts': ['echarts', 'echarts-for-react'],
          'ui': ['framer-motion', 'react-icons']
        }
      }
    }
  },
  server: {
    port: 5173,
    host: true
  }
});