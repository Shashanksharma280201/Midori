import { defineConfig } from 'vite';

export default defineConfig({
  build: {
    rollupOptions: {
      input: {
        main: './index.html'
      },
      output: {
        entryFileNames: '[name]-[hash].js',
        chunkFileNames: '[name]-[hash].js',
        assetFileNames: '[name].[ext]',
        manualChunks: {
          // Split Three.js into separate chunk for better caching
          'three-vendor': ['three'],
          // Split GSAP into separate chunk
          'gsap-vendor': ['gsap']
        }
      }
    },
    // Increase chunk size warning limit to 600kb
    chunkSizeWarningLimit: 600
  },
  publicDir: 'assets'
});
