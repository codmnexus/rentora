import { defineConfig } from 'vite';
import { visualizer } from 'rollup-plugin-visualizer';
import purgeCSS from '@fullhuman/postcss-purgecss';
import { imagetools } from 'vite-imagetools';
import { VitePWA } from 'vite-plugin-pwa';

export default defineConfig({
  plugins: [
    visualizer({
      filename: './stats.html',
      open: true,
      gzipSize: true,
      brotliSize: true,
    }),
    imagetools(),
    VitePWA({
      registerType: 'autoUpdate',
      manifest: {
        name: 'Rentora',
        short_name: 'Rentora',
        start_url: '/',
        display: 'standalone',
        background_color: '#000000',
        theme_color: '#6366f1',
        icons: [
          { src: 'pwa-192x192.png', sizes: '192x192', type: 'image/png' },
          { src: 'pwa-512x512.png', sizes: '512x512', type: 'image/png' },
        ],
      },
    }),
  ],
  css: {
    postcss: {
      plugins: [
        ...(process.env.NODE_ENV === 'production' ? [purgeCSS({
          content: ['./src/**/*.js', './src/**/*.html', './public/**/*.html'],
          defaultExtractor: (content) => content.match(/[A-Za-z0-9-_:/]+/g) || [],
        })] : []),
      ],
    },
  },
  build: {
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.includes('node_modules')) {
            return 'vendor';
          }
        },
      },
    },
  },
});

