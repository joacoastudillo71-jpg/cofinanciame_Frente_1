/// <reference types="vitest" />
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  resolve: {
    // SOLUCIÓN ENTERPRISE: "dedupe"
    // Esto obliga a Vite a usar SIEMPRE la misma copia de React
    // para todas las librerías, evitando el error "ReactCurrentDispatcher".
    dedupe: ['react', 'react-dom'],

    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: './src/tests/setupTests.ts',
    exclude: ['node_modules', 'dist'],
  },
  server: {
    host: '0.0.0.0',
    hmr: {
      overlay: false // Desactivamos el overlay visual para que no bloquee si hay warnings
    }
  },
  // Optimización de dependencias para forzar pre-bundling
  optimizeDeps: {
    include: ['react', 'react-dom', 'react-zoom-pan-pinch', '@photo-sphere-viewer/core', 'three', 'zustand']
  }
});