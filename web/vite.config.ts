import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    proxy: {
      '/api': { target: 'http://localhost:8686', changeOrigin: true },
      '/dashboard': { target: 'http://localhost:8686', changeOrigin: true, bypass(req) { if (req.headers.accept?.includes('text/html')) return '/index.html'; } },
      '/uploads': { target: 'http://localhost:8686', changeOrigin: true },
      '/health': { target: 'http://localhost:8686', changeOrigin: true },
      '/ws': { target: 'ws://localhost:8686', ws: true },
    },
  },
  build: { outDir: 'dist' },
});
