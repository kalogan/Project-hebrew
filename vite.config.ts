/// <reference types="vitest/config" />
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { VitePWA } from 'vite-plugin-pwa';

// https://vitejs.dev/config/
export default defineConfig({
  base: './',
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['favicon.svg'],
      manifest: {
        name: 'Siddur 100 — Hebrew Prayer Vocabulary',
        short_name: 'Siddur 100',
        description: 'Learn the 100 most frequent Hebrew prayer-book words.',
        theme_color: '#1e3a5f',
        background_color: '#0f172a',
        display: 'standalone',
        lang: 'en',
        dir: 'ltr',
        icons: [
          { src: 'icon-192.png', sizes: '192x192', type: 'image/png' },
          { src: 'icon-512.png', sizes: '512x512', type: 'image/png' },
        ],
      },
    }),
  ],
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: ['./src/test/setup.ts'],
    // Fail fast rather than wedge the gate on an open handle.
    testTimeout: 10_000,
    hookTimeout: 10_000,
    teardownTimeout: 5_000,
    css: false,
  },
});
