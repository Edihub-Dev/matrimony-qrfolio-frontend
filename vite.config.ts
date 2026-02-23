import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { fileURLToPath, URL } from 'node:url';

export default defineConfig({
  plugins: [react()],

  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
    },
  },

  build: {
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (!id.includes('node_modules')) return;

          if (
            id.includes('/node_modules/react/') ||
            id.includes('/node_modules/react-dom/')
          ) {
            return 'react-vendor';
          }

          if (id.includes('/node_modules/framer-motion/')) {
            return 'motion-vendor';
          }

          if (id.includes('/node_modules/lucide-react/')) {
            return 'icons-vendor';
          }

          if (id.includes('/node_modules/firebase/')) {
            return 'firebase-vendor';
          }

          if (
            id.includes('/node_modules/jspdf/') ||
            id.includes('/node_modules/html2canvas/')
          ) {
            return 'pdf-vendor';
          }

          if (id.includes('/node_modules/socket.io-client/')) {
            return 'socket-vendor';
          }

          return 'vendor';
        },
      },
    },
  },

  optimizeDeps: {
    exclude: ['lucide-react'],
  },

  server: {
    host: '0.0.0.0',   // 👈 allows access from LAN devices
    port: 5175,        // 👈 default port (change if needed)
    proxy: {
      '/api': 'http://localhost:5002',
    },
  },
});
