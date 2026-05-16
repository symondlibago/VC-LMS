import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
import path from 'path';
import { VitePWA } from 'vite-plugin-pwa';
import basicSsl from '@vitejs/plugin-basic-ssl';
export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
    basicSsl(),
    VitePWA({
      registerType: 'autoUpdate',
      devOptions: {
        enabled: true
      },
      server: {
    https: true,
    host: true, // exposes to your network so phone can access it
  },
      manifest: {
        name: 'Library Monitoring System',
        short_name: 'LMS',
        start_url: '/',
        display: 'standalone',
        background_color: '#ffffff',
        theme_color: '#0f172a', // dark tailwind color
        icons: [
          {
            src: '/icon-192.png',
            sizes: '192x192',
            type: 'image/png'
          },
          {
            src: '/icon-512.png',
            sizes: '512x512',
            type: 'image/png'
          }
        ]
      }
    })
  ],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
});
