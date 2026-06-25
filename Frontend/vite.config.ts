import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import { defineConfig } from 'vite';

export default defineConfig(() => {
  return {
    plugins: [react(), tailwindcss()],
    resolve: {
      alias: {
        '@': path.resolve(__dirname, './src'),
      },
    },
    server: {
      port: 3000,
      host: '0.0.0.0',
      hmr: process.env.DISABLE_HMR !== 'true',
      watch: process.env.DISABLE_HMR === 'true' ? null : {},
      // Proxy /api and /health to the Express backend on port 4000.
      // This means the browser never makes a cross-origin request — no CORS needed.
      proxy: {
        '/api': {
          target: 'http://localhost:4000',
          changeOrigin: true,
        },
        '/health': {
          target: 'http://localhost:4000',
          changeOrigin: true,
        },
      },
    },
  };
});
