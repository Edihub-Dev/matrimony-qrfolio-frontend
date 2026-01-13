import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],

  optimizeDeps: {
    exclude: ['lucide-react'],
  },

  server: {
    host: '0.0.0.0',   // 👈 allows access from LAN devices
    port: 5175,        // 👈 default port (change if needed)
    proxy: {
      '/api': 'http://localhost:5001',
    },
  },
});
