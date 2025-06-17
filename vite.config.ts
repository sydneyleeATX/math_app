import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { VitePWA } from 'vite-plugin-pwa';

export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      manifest: {
        // You can omit this if you want to use your existing public/manifest.json,
        // or you can copy its contents here for easier management.
      }
    })
  ],
});