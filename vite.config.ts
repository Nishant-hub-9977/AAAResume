import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { nodePolyfills } from 'rollup-plugin-polyfill-node';

export default defineConfig({
  plugins: [
    react(),
    nodePolyfills({
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
        nodePolyfills({
          include: ['process']
        })
      ]
    }
  }
});