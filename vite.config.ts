import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    port: 3000,
    open: true,
  },
  build: {
    chunkSizeWarningLimit: 2000,
    rollupOptions: {
      output: {
        manualChunks: {
          plotly: ['plotly.js-dist-min'],
          cytoscape: ['cytoscape'],
          react: ['react', 'react-dom'],
        },
      },
    },
  },
});
