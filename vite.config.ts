import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import nodePolyfillsPlugin from 'rollup-plugin-polyfill-node';

export default defineConfig({
  plugins: [
    react(),
    nodePolyfillsPlugin({
      include: ['process']
    })
  ],
  optimizeDeps: {
    exclude: ['lucide-react']
  },
  define: {
    'process.env': process.env
  },
  build: {
    rollupOptions: {
      plugins: [
        nodePolyfillsPlugin({
          include: ['process']
        })
      ]
    }
  },
  server: {
    proxy: {
      '/api': {
        target: 'http://localhost:3001',
        changeOrigin: true,
        secure: false,
      }
    }
  }
});